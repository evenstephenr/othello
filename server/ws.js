const ws = require('ws');
const { StateManager } = require("./state");

module.exports = (function() {
  const wsServer = new ws.Server({ noServer: true });
  const lobby = new Map();

  wsServer.on('connection', (socket) => {
    socket.on('message', (message) => {
      const update = JSON.parse(message);
      console.log(update);

      const { type } = update;

      if (type === 'INIT') {
        const { playerId } = update;
        socket._othello = { playerId };
        console.log({
          type: 'INIT',
          playerId,
          clients: wsServer.clients.size,
          lobby,
        });
        return;
      }

      const { roomId, playerId } = update;

      if (!roomId) throw new Error('missing roomId');

      if (type === 'ROOM_JOIN') {
        if (!lobby.get(roomId)) lobby.set(roomId, new StateManager());

        socket._othello.roomId = roomId;
        lobby.get(roomId).setState({ roomId });
        lobby.get(roomId).registerPlayer(playerId);
      }

      const game = lobby.get(roomId);

      if (type === 'COLOR_CHANGE') {
        const { color } = update;
        game.registerPlayer(playerId, color);
      }

      if (type === 'SELECT') {
        const { row, col } = update;
        game.flip(row, col, playerId);
      }

      if (type === 'READY') {
        game.readyUp(playerId);
      }

      if (type === 'PASS') {
        game.changeTurn();
      }

      if (type === 'RESET') {
        game.initializeState();
      }

      wsServer.clients.forEach((client) => {
        if (client._othello.roomId === roomId) {
          client.send(JSON.stringify(lobby.get(roomId).getState()));
        }
      });
    });
  });

  wsServer.on('close', function close() {
    clearInterval(interval);
  });

  return {
    wsServer,
  };
})();
