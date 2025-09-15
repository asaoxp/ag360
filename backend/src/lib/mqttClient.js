// backend/src/lib/mqttClient.js
// Simple MQTT client wrapper used by controllerService (and other backend modules).
// Exports:
//  - client: the mqtt client instance (may be null until connected)
//  - publish(topic, message, opts)
//  - subscribe(topic, opts, cb)  -> if cb provided it will register handler for that topic
//  - on(event, cb)
//  - connect() -> returns a Promise that resolves when connected
//  - end(force)

const mqtt = require('mqtt');

const MQTT_URL = process.env.MQTT_URL || 'mqtt://127.0.0.1:1883';
const MQTT_USER = process.env.MQTT_USER || null;
const MQTT_PASS = process.env.MQTT_PASS || null;
const MQTT_CLIENT_ID = process.env.MQTT_CLIENT_ID || `agv360_${Math.random().toString(16).slice(2, 8)}`;

let client = null;
let readyPromise = null;

function connect() {
  if (client && client.connected) return Promise.resolve(client);

  if (readyPromise) return readyPromise;
  readyPromise = new Promise((resolve, reject) => {
    const opts = { clientId: MQTT_CLIENT_ID, reconnectPeriod: 5000 };
    if (MQTT_USER) opts.username = MQTT_USER;
    if (MQTT_PASS) opts.password = MQTT_PASS;

    client = mqtt.connect(MQTT_URL, opts);

    client.on('connect', () => {
      console.log('[lib/mqttClient] connected to', MQTT_URL);
      resolve(client);
    });

    client.on('error', (err) => {
      console.error('[lib/mqttClient] mqtt error', err && err.message);
      // do not reject permanently — mqtt client will auto-retry; but reject first-time connect
      // if still pending
      if (readyPromise) {
        // don't reject here; allow reconnect attempts
      }
    });

    // forward warnings
    client.on('reconnect', () => console.log('[lib/mqttClient] reconnecting...'));
    client.on('close', () => console.log('[lib/mqttClient] connection closed'));
  });

  return readyPromise;
}

function publish(topic, message, opts = {}, cb = null) {
  if (!client) {
    console.warn('[lib/mqttClient] publish called before client connected. Connecting now.');
    return connect().then(() => {
      return new Promise((res, rej) => {
        client.publish(topic, typeof message === 'string' ? message : JSON.stringify(message), opts, (err) => {
          if (cb) cb(err);
          if (err) return rej(err);
          res();
        });
      });
    });
  }
  return new Promise((resolve, reject) => {
    client.publish(topic, typeof message === 'string' ? message : JSON.stringify(message), opts, (err) => {
      if (cb) cb && cb(err);
      if (err) return reject(err);
      resolve();
    });
  });
}

/**
 * subscribe(topic [, opts], [handler])
 * If handler provided, it attaches a one-topic handler that will be invoked when any message arrives.
 * If handler omitted, caller should listen for client.on('message', ...)
 */
function subscribe(topic, opts = {}, handler = null) {
  if (!client) {
    return connect().then(() => subscribe(topic, opts, handler));
  }
  return new Promise((resolve, reject) => {
    client.subscribe(topic, opts, (err, granted) => {
      if (err) return reject(err);
      if (handler) {
        // attach generic message handler that forwards only messages for this topic
        client.on('message', (t, msg) => {
          if (t === topic) {
            try {
              handler(t, msg);
            } catch (e) {
              console.warn('[lib/mqttClient] handler error', e && e.message);
            }
          }
        });
      }
      resolve(granted);
    });
  });
}

function on(event, cb) {
  if (!client) {
    // ensure client is created and then attach
    connect().then(() => client.on(event, cb)).catch(err => {
      console.warn('[lib/mqttClient] error attaching event handler', err && err.message);
    });
    return;
  }
  client.on(event, cb);
}

function end(force = false) {
  if (!client) return Promise.resolve();
  return new Promise((resolve) => {
    try {
      client.end(force, () => {
        client = null;
        readyPromise = null;
        resolve();
      });
    } catch (e) {
      client = null;
      readyPromise = null;
      resolve();
    }
  });
}

module.exports = {
  client,
  connect,
  publish,
  subscribe,
  on,
  end,
  getClient: () => client
};
