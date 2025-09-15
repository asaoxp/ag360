// backend/src/mqttBridge.js
// Robust MQTT bridge that forwards messages to wsBroadcast and saves telemetry to MongoDB
const mqtt = require('mqtt');
const { saveTelemetry } = require('./services/telemetryService'); // relative to this file
// Note: adjust path if your services dir differs, e.g. '../services/telemetryService'

function safeParse(str) {
  try { return JSON.parse(str); } catch (e) { return null; }
}

function start(options = {}) {
  const {
    mqttUrl = process.env.MQTT_URL || 'mqtt://127.0.0.1:1883',
    mqttUser = process.env.MQTT_USER || '',
    mqttPass = process.env.MQTT_PASS || '',
    topics = ['esp32/telemetry'],
    clientId = process.env.MQTT_CLIENT_ID || `ag360-backend-${Math.floor(Math.random()*10000)}`,
    clean = (process.env.MQTT_CLEAN || 'false') === 'true',
    wsBroadcast // function(msgString) => void
  } = options;

  if (typeof wsBroadcast !== 'function') {
    throw new Error('mqttBridge.start requires wsBroadcast callback');
  }

  const connectOpts = {
    clientId,
    username: mqttUser || undefined,
    password: mqttPass || undefined,
    keepalive: 30,
    reconnectPeriod: 5000,
    connectTimeout: 20_000,
    clean,
    protocolVersion: 4
  };

  let client = null;
  let stopped = false;
  let subscribed = false;

  function log(...args) { console.log('[mqttBridge]', ...args); }
  function errLog(...args) { console.error('[mqttBridge]', ...args); }

  function handleMessage(topic, payload) {
    let data;
    try { data = safeParse(payload.toString()); }
    catch (e) { data = null; }

    const envelope = { topic, data: data || payload.toString(), ts: Date.now() };
    // broadcast to ws clients (string)
    try {
      const out = JSON.stringify(envelope);
      wsBroadcast(out);
    } catch (e) {
      errLog('wsBroadcast error', e && e.message);
    }

    // If message looks like telemetry JSON, attempt to save to DB (non-blocking)
    if (data && (data.deviceId || data.temperature !== undefined || data.humidity !== undefined)) {
      try {
        saveTelemetry(data); // fire-and-forget
      } catch (e) {
        errLog('saveTelemetry threw', e && e.message);
      }
    }
  }

  function ensureSubscribed() {
    if (!client) {
      errLog('ensureSubscribed: client is null');
      return;
    }
    if (!client.connected) {
      log('Client not connected yet, will subscribe on connect');
      return;
    }
    if (subscribed) return;
    topics.forEach((t) => {
      try {
        client.subscribe(t, { qos: 0 }, (err, granted) => {
          if (err) {
            errLog('subscribe error for', t, err && err.message);
            return;
          }
          log('subscribed', t, '->', (granted || []).map(g => `${g.topic}@${g.qos}`).join(','));
          subscribed = true;
        });
      } catch (e) {
        errLog('subscribe threw for', t, e && e.message);
      }
    });
  }

  function createClient() {
    if (stopped) return;
    if (client) return;

    log('connecting to', mqttUrl, 'as', clientId);
    client = mqtt.connect(mqttUrl, connectOpts);

    client.on('connect', () => {
      try {
        log('connected');
        subscribed = false;
        ensureSubscribed();
        // optional status publish
        try { client.publish('ag360/status', 'online', { retain: true, qos: 0 }); } catch(e) {}
      } catch (e) {
        errLog('connect handler error', e && e.message);
      }
    });

    client.on('message', (topic, payload) => {
      try {
        handleMessage(topic, payload);
      } catch (e) {
        errLog('message handler error', e && e.message);
      }
    });

    client.on('reconnect', () => { log('reconnecting...'); });
    client.on('close', () => {
      log('closed');
      subscribed = false;
    });
    client.on('offline', () => { log('offline'); });
    client.on('error', (err) => {
      errLog('error', err && err.message);
      try { client.end(true); } catch (e) {}
      client = null;
      // schedule simple reconnect after backoff
      setTimeout(() => {
        if (!stopped) createClient();
      }, 3000);
    });
  }

  createClient();

  function stop() {
    stopped = true;
    if (!client) return;
    try {
      try { client.publish('ag360/status', 'offline', { retain: true, qos: 0 }, () => client.end(true)); } catch (e) { client.end(true); }
    } catch (e) {
      errLog('error stopping client', e && e.message);
    } finally {
      client = null;
    }
  }

  return {
    stop,
    get client() { return client; }
  };
}

module.exports = { start };
