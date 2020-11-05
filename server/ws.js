const ws = require('ws');
const state = require('./state');
const { StateManager } = require("./state");

module.exports = (function() {
  const State = new StateManager();
  const wsServer = new ws.Server({ noServer: true });
  function noop() {}
  function heartbeat() {
    this.isAlive = true;
  }

  wsServer.on('connection', (socket) => {
    socket.isAlive = true;
    socket.on('pong', heartbeat);
    socket.on('message', (message) => {
      const update = JSON.parse(message);
      console.log(update);

      const { type } = update;
      if (type === 'INIT') {
        // TODO: this breaks when multiple clients connect
        State.registerPlayer(update.playerId, update.color);
      } else if (type === 'SELECT') {
        // TODO: refactor this to work with disconnects + reconnects
        const { row, col, playerId } = update;
        State.flip(row, col, playerId);
      } else if (type === 'READY') {
        State.readyUp(update.playerId);
      } else if (type === 'PASS') {
        State.changeTurn();
      } else if (type === 'RESET') {
        State.initializeState();
      }

      wsServer.clients.forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(JSON.stringify(State.getState()));
        }
      });
    });
  });

  const interval = setInterval(function ping() {
    wsServer.clients.forEach(function each(client) {
      if (client.isAlive === false) return client.terminate();

      client.isAlive = false;
      client.ping(noop);
    });
  }, 30000);

  wsServer.on('close', function close() {
    clearInterval(interval);
  });

  return {
    wsServer,
  };
})();
