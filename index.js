require('dotenv').config();
const express = require("express");
const { wsServer } = require("./server/ws");

const app = express();

app.use(express.static(__dirname + "/static"));

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
