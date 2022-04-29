require('dotenv').config();
const express = require("express");
const { wsServer } = require("./server/ws");

function verifyProcessEnv() {
  const m = [];
  if (!process.env.APP_PORT) {
    m.push('ENV ERR: NEED TO SET APP_PORT');
  }
  if (!process.env.SERVER_ADDRESS) {
    m.push('ENV ERR: NEED TO SET SERVER_ADDRESS');
  }
  if (!process.env.APP_ENV) {
    m.push('ENV ERR: NEED TO SET APP_ENV');
  }
  if (!process.env.WS_PORT) {
    m.push('ENV ERR: NEED TO SET WS_PORT');
  }

  if (!m.length) { return; }
  console.log('ENV ERR!! (check .env?)');
  console.log(m.join('\n'));
}

const app = express();

app.use(express.static(__dirname + "/static"));

verifyProcessEnv();

app.listen(process.env.APP_PORT, () => {
  console.log(`Server running at http://${process.env.SERVER_ADDRESS}:${process.env.APP_PORT}`);
  console.log(`(App mode is set to ${process.env.APP_ENV})`);
});

const server = app.listen(process.env.WS_PORT);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
