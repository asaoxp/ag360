// backend/src/wsServer.js
const WebSocket = require('ws');

function startWs(httpServer, options = {}) {
  const path = options.path || '/ws';
  const wss = new WebSocket.Server({ server: httpServer, path });

  wss.on('connection', (ws, req) => {
    console.log('[ws] client connected', req.socket.remoteAddress);
    ws.send(JSON.stringify({ topic: 'hello', data: 'welcome', ts: Date.now() }));
    ws.on('close', () => console.log('[ws] client disconnected'));
  });

  function broadcast(payload) {
    const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) c.send(str);
    });
  }

  return { wss, broadcast };
}

module.exports = startWs;