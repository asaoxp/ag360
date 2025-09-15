// frontend/src/hooks/useWebsocketTelemetry.js
import { useEffect, useRef, useState } from 'react';
import mqtt from 'mqtt';

/**
 * Hybrid telemetry hook with stable online/offline logic.
 * Tries direct MQTT-over-WS first (REACT_APP_MQTT_WS_URL),
 * falls back to backend WS (/ws).
 *
 * Returns: { telemetry, wsConnected, lastMsgTs, source }
 *  - wsConnected: true when recent message arrived OR transport is connected (with grace)
 *  - source: 'mqtt-ws' | 'backend-ws' | null
 */

export default function useWebsocketTelemetry() {
  // public state
  const [telemetry, setTelemetry] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastMsgTs, setLastMsgTs] = useState(null);
  const [source, setSource] = useState(null);

  // refs for clients / timers / internal flags
  const mqttClientRef = useRef(null);
  const backendWsRef = useRef(null);

  const lastMsgTsRef = useRef(null);
  const mqttConnectedRef = useRef(false);
  const backendConnectedRef = useRef(false);

  const mqttCloseTimerRef = useRef(null);
  const backendCloseTimerRef = useRef(null);
  const messageStaleTimerRef = useRef(null);
  const mqttRetryTimerRef = useRef(null);
  const backendRetryTimerRef = useRef(null);

  // configuration
  const MESSAGE_TTL_MS = 12_000; // consider recent message within 12s
  const CLOSE_GRACE_MS = 4_000;  // wait 4s after a close before marking transport disconnected
  const MQTT_RETRY_MS = 4_000;
  const BACKEND_RETRY_MS = 3_000;

  // compute and update public wsConnected state based on rules:
  // online if recent message OR any transport currently considered connected
  function computeOnlineAndUpdate() {
    const now = Date.now();
    const hasRecentMsg = lastMsgTsRef.current && (now - lastMsgTsRef.current <= MESSAGE_TTL_MS);
    const transportConnected = !!(mqttConnectedRef.current || backendConnectedRef.current);
    const online = hasRecentMsg || transportConnected;
    setWsConnected(online);
  }

  // called when any valid message is received
  function onTelemetryMessage(data) {
    const now = Date.now();
    lastMsgTsRef.current = now;
    setLastMsgTs(now);
    setTelemetry(data);

    // prefer the source of latest message
    // (caller should set source appropriately before invoking this)
    // refresh online state and reset stale timer
    computeOnlineAndUpdate();

    if (messageStaleTimerRef.current) {
      clearTimeout(messageStaleTimerRef.current);
      messageStaleTimerRef.current = null;
    }
    messageStaleTimerRef.current = setTimeout(() => {
      // stale timer expired — recompute (may mark offline if no transport)
      messageStaleTimerRef.current = null;
      computeOnlineAndUpdate();
    }, MESSAGE_TTL_MS + 100); // small margin
  }

  useEffect(() => {
    let active = true;

    const MQTT_URL = process.env.REACT_APP_MQTT_WS_URL || null; // e.g. ws://10.1.1.113:8080
    const MQTT_USER = process.env.REACT_APP_MQTT_USER || undefined;
    const MQTT_PASS = process.env.REACT_APP_MQTT_PASS || undefined;
    const BACKEND_HOST = process.env.REACT_APP_API_HOST || window.location.host;
    const BACKEND_WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${BACKEND_HOST}/ws`;

    function clearAllTimers() {
      if (mqttCloseTimerRef.current) { clearTimeout(mqttCloseTimerRef.current); mqttCloseTimerRef.current = null; }
      if (backendCloseTimerRef.current) { clearTimeout(backendCloseTimerRef.current); backendCloseTimerRef.current = null; }
      if (messageStaleTimerRef.current) { clearTimeout(messageStaleTimerRef.current); messageStaleTimerRef.current = null; }
      if (mqttRetryTimerRef.current) { clearTimeout(mqttRetryTimerRef.current); mqttRetryTimerRef.current = null; }
      if (backendRetryTimerRef.current) { clearTimeout(backendRetryTimerRef.current); backendRetryTimerRef.current = null; }
    }

    // ---------- Backend WS (fallback) ----------
    function connectBackendWs() {
      if (!active) return;
      // if already open or opening, skip
      try {
        const existing = backendWsRef.current;
        if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
          return;
        }
      } catch (e) {}

      try {
        const ws = new WebSocket(BACKEND_WS_URL);
        backendWsRef.current = ws;

        ws.onopen = () => {
          if (!active) return;
          backendConnectedRef.current = true;
          // cancel any close timer
          if (backendCloseTimerRef.current) { clearTimeout(backendCloseTimerRef.current); backendCloseTimerRef.current = null; }
          setSource((prev) => prev || 'backend-ws'); // prefer other source if already set by mqtt
          computeOnlineAndUpdate();
        };

        ws.onmessage = (evt) => {
          if (!active) return;
          let msg = null;
          try { msg = JSON.parse(evt.data); } catch (e) { msg = null; }
          if (!msg) return;
          if (msg.topic === 'esp32/telemetry' && msg.data) {
            setSource('backend-ws');
            onTelemetryMessage(msg.data);
          } else if (msg.temperature !== undefined) {
            setSource('backend-ws');
            onTelemetryMessage(msg);
          }
        };

        ws.onclose = (ev) => {
          if (!active) return;
          // schedule marking backend disconnected after small grace
          if (backendCloseTimerRef.current) clearTimeout(backendCloseTimerRef.current);
          backendCloseTimerRef.current = setTimeout(() => {
            backendConnectedRef.current = false;
            backendCloseTimerRef.current = null;
            computeOnlineAndUpdate();
          }, CLOSE_GRACE_MS);

          // schedule reconnect attempt
          if (backendRetryTimerRef.current) clearTimeout(backendRetryTimerRef.current);
          backendRetryTimerRef.current = setTimeout(() => {
            backendRetryTimerRef.current = null;
            if (active) connectBackendWs();
          }, BACKEND_RETRY_MS);
        };

        ws.onerror = (err) => {
          if (!active) return;
          // don't flip state directly here; let close timer handle marking disconnected after grace
          console.warn('[useWebsocketTelemetry] backend ws error', err && err.message);
        };
      } catch (e) {
        // schedule retry
        if (backendRetryTimerRef.current) clearTimeout(backendRetryTimerRef.current);
        backendRetryTimerRef.current = setTimeout(() => {
          backendRetryTimerRef.current = null;
          if (active) connectBackendWs();
        }, BACKEND_RETRY_MS);
      }
    }

    // ---------- Direct MQTT-over-WS (preferred) ----------
    function connectMqttWs() {
      if (!active) return;
      if (!MQTT_URL) {
        // no broker configured -> fallback to backend
        connectBackendWs();
        return;
      }

      // if already connected/connecting skip
      if (mqttClientRef.current && mqttClientRef.current.connected) return;

      const clientId = `ag360-ui-${Math.random().toString(16).substr(2, 8)}`;
      const opts = {
        clientId,
        username: MQTT_USER,
        password: MQTT_PASS,
        reconnectPeriod: 4000,
        keepalive: 30,
        clean: true,
      };

      try {
        const client = mqtt.connect(MQTT_URL, opts);
        mqttClientRef.current = client;

        client.on('connect', () => {
          if (!active) return;
          // mark transport connected
          mqttConnectedRef.current = true;
          if (mqttCloseTimerRef.current) { clearTimeout(mqttCloseTimerRef.current); mqttCloseTimerRef.current = null; }
          // subscribe and compute online
          try {
            client.subscribe('esp32/telemetry', { qos: 0 }, (err) => {
              if (err) console.warn('[useWebsocketTelemetry] mqtt subscribe err', err);
            });
          } catch (e) {}
          computeOnlineAndUpdate();
          // prefer mqtt source once it connects
          setSource('mqtt-ws');
        });

        client.on('message', (topic, payload) => {
          if (!active) return;
          let data = null;
          try { data = JSON.parse(payload.toString()); } catch (e) { data = null; }
          if (!data) return;
          setSource('mqtt-ws');
          onTelemetryMessage(data);
        });

        client.on('close', () => {
          if (!active) return;
          // schedule marking mqtt transport disconnected after CLOSE_GRACE_MS
          if (mqttCloseTimerRef.current) clearTimeout(mqttCloseTimerRef.current);
          mqttCloseTimerRef.current = setTimeout(() => {
            mqttConnectedRef.current = false;
            mqttCloseTimerRef.current = null;
            computeOnlineAndUpdate();
          }, CLOSE_GRACE_MS);

          // schedule backend fallback / reconnect attempt
          if (mqttRetryTimerRef.current) clearTimeout(mqttRetryTimerRef.current);
          mqttRetryTimerRef.current = setTimeout(() => {
            mqttRetryTimerRef.current = null;
            // only attempt backend fallback if mqtt still not connected
            if (!(mqttClientRef.current && mqttClientRef.current.connected)) {
              connectBackendWs();
            }
          }, 1500);
        });

        client.on('error', (err) => {
          if (!active) return;
          // don't set offline immediately; let close handler & grace window handle state
          console.warn('[useWebsocketTelemetry] mqtt error', err && err.message);
        });

        // do not set wsConnected false on 'reconnect' events; let message/stale logic govern online state
      } catch (e) {
        console.error('[useWebsocketTelemetry] mqtt connect exception', e);
        // fallback to backend after small delay
        if (mqttRetryTimerRef.current) clearTimeout(mqttRetryTimerRef.current);
        mqttRetryTimerRef.current = setTimeout(() => {
          mqttRetryTimerRef.current = null;
          if (active) connectBackendWs();
        }, MQTT_RETRY_MS);
      }
    }

    // Start preferred path (mqtt-ws), fallback will be triggered automatically by handlers
    connectMqttWs();

    // Cleanup on unmount
    return () => {
      active = false;
      clearAllTimers();
      try {
        if (mqttClientRef.current) {
          try { mqttClientRef.current.end(true); } catch (e) {}
          mqttClientRef.current = null;
        }
      } catch (e) {}
      try {
        if (backendWsRef.current) {
          try {
            backendWsRef.current.onopen = backendWsRef.current.onmessage = backendWsRef.current.onclose = backendWsRef.current.onerror = null;
            backendWsRef.current.close();
          } catch (e) {}
          backendWsRef.current = null;
        }
      } catch (e) {}
    };
  }, []); // run once

  return { telemetry, wsConnected, lastMsgTs, source };
}
