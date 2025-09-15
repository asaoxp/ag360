import { useRef, useEffect } from 'react';
import mqtt from 'mqtt';

export default function useMqttPublish() {
  const clientRef = useRef(null);

  useEffect(() => {
    const MQTT_URL = process.env.REACT_APP_MQTT_WS_URL || null;
    const MQTT_USER = process.env.REACT_APP_MQTT_USER || undefined;
    const MQTT_PASS = process.env.REACT_APP_MQTT_PASS || undefined;

    if (!MQTT_URL) {
      console.warn('MQTT URL not configured');
      return;
    }

    const clientId = `ag360-ui-publish-${Math.random().toString(16).substr(2, 8)}`;
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
      clientRef.current = client;

      client.on('connect', () => {
        console.log('MQTT publish client connected');
      });

      client.on('error', (err) => {
        console.error('MQTT publish client error:', err);
      });

      client.on('close', () => {
        console.log('MQTT publish client disconnected');
      });
    } catch (e) {
      console.error('Failed to connect MQTT publish client:', e);
    }

    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.end(true);
        } catch (e) {}
        clientRef.current = null;
      }
    };
  }, []);

  const publish = (topic, message) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish(topic, message, { qos: 0 }, (err) => {
        if (err) {
          console.error('MQTT publish error:', err);
        } else {
          console.log(`Published to ${topic}: ${message}`);
        }
      });
    } else {
      console.warn('MQTT client not connected, cannot publish');
    }
  };

  return publish;
}