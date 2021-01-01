"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var Button = function Button(_ref) {
  var children = _ref.children,
      _ref$style = _ref.style,
      style = _ref$style === undefined ? {} : _ref$style,
      rest = _objectWithoutProperties(_ref, ["children", "style"]);

  return React.createElement(
    "button",
    Object.assign({}, rest, {
      style: Object.assign({}, rest.style, {
        height: "40px",
        borderRadius: "2px",
        WebkitBorderRadius: "2px",
        backgroundColor: "#f3f3f3",
        border: "unset",
        verticalAlign: "top",
        padding: "8px 12px"
      })
    }),
    children
  );
};

var Cell = function Cell(_ref2) {
  var _onClick = _ref2.onClick,
      color = _ref2.color;
  return React.createElement(
    "button",
    {
      onClick: function onClick() {
        return _onClick();
      },
      style: {
        width: "45px",
        height: "45px",
        margin: "unset",
        boxShadow: "border-box",
        borderRadius: "0",
        WebkitBorderRadius: "0",
        WebkitAppearance: "none",
        backgroundColor: "#58B19F",
        border: '0.5px solid #182C61',
        verticalAlign: "bottom",
        cursor: 'pointer',
        padding: "unset",
        textAlign: "center"
      }
    },
    React.createElement("div", {
      style: {
        width: "40px",
        height: "40px",
        borderRadius: "40px",
        backgroundColor: color,
        margin: "auto"
      }
    })
  );
};

var Board = function Board(_ref3) {
  var board = _ref3.board,
      onCellClick = _ref3.onCellClick,
      white = _ref3.white,
      black = _ref3.black;
  return React.createElement(
    "div",
    {
      className: "game-board",
      style: {
        minWidth: "360px",
        minHeight: "360px"
      }
    },
    board.map(function (row, i) {
      return React.createElement(
        "div",
        null,
        row.map(function (cell, j) {
          if (!cell) {
            return React.createElement(Cell, { onClick: function onClick() {
                return onCellClick(i, j);
              }, color: '#58B19F' });
          }

          if (cell === white) {
            return React.createElement(Cell, { onClick: function onClick() {
                return onCellClick(i, j);
              }, color: '#f3f3f3' });
          }

          if (cell === black) {
            return React.createElement(Cell, { onClick: function onClick() {
                return onCellClick(i, j);
              }, color: '#2C3A47' });
          }

          return null;
        })
      );
    })
  );
};

var RoomCreator = function RoomCreator(_ref4) {
  var playerId = _ref4.playerId,
      connection = _ref4.connection;

  var _React$useState = React.useState(function () {
    var randomHexString = Math.random().toString(16).toUpperCase();
    return randomHexString.substring(randomHexString.length - 4, randomHexString.length);
  }),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      roomId = _React$useState2[0],
      setRoomId = _React$useState2[1];

  return React.createElement(
    "div",
    { className: "lobby-container" },
    React.createElement(
      "div",
      null,
      React.createElement(
        "p",
        null,
        "Welcome to"
      ),
      React.createElement(
        "h1",
        null,
        "Othello"
      )
    ),
    React.createElement(
      "div",
      null,
      React.createElement(
        "form",
        {
          onSubmit: function onSubmit(e) {
            e.preventDefault();
            connection.current.send(JSON.stringify({
              type: "ROOM_JOIN",
              roomId: roomId,
              playerId: playerId
            }));
          }
        },
        React.createElement("input", {
          type: "text",
          value: roomId,
          onChange: function onChange(_ref5) {
            var target = _ref5.target;
            return setRoomId(target.value);
          }
        }),
        React.createElement(
          Button,
          {
            type: "submit"
          },
          "Join or Create a room"
        )
      )
    )
  );
};

var App = function App() {
  var _React$useState3 = React.useState(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12)),
      _React$useState4 = _slicedToArray(_React$useState3, 1),
      playerId = _React$useState4[0];

  var _React$useState5 = React.useState({ board: [] }),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      data = _React$useState6[0],
      setData = _React$useState6[1];

  var connection = React.useRef(null);

  React.useEffect(function () {
    // TODO: dotenv
    var socket = new WebSocket("ws://" + "192.168.2.164" + ":" + "3002");
    connection.current = socket;
    // Connection opened
    socket.addEventListener('open', function () {
      socket.send(JSON.stringify({
        type: "INIT",
        playerId: playerId
      }));

      socket.addEventListener('message', function (event) {
        var data = JSON.parse(event.data);
        setData(data);
      });
    });
  }, []);

  var roomId = data.roomId,
      board = data.board,
      white = data.white,
      black = data.black,
      turn = data.turn,
      ready = data.ready;


  if (!roomId) {
    return React.createElement(RoomCreator, {
      playerId: playerId,
      connection: connection
    });
  }

  if (!white || !black || !ready) {
    return React.createElement(
      "div",
      { className: "lobby-container" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "p",
          null,
          "Welcome to"
        ),
        React.createElement(
          "h1",
          null,
          "Othello"
        )
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "p",
          null,
          "Rules"
        ),
        React.createElement(
          "ul",
          null,
          React.createElement(
            "li",
            null,
            "You need two players to start the game"
          ),
          React.createElement(
            "li",
            null,
            "You can manually skip your turn if you get stuck"
          ),
          React.createElement(
            "li",
            null,
            "You can reset the server at any time"
          )
        )
      ),
      React.createElement(
        "div",
        { className: "lobby-players" },
        React.createElement(
          "p",
          null,
          "Your player ID is ",
          React.createElement(
            "strong",
            null,
            playerId
          )
        ),
        React.createElement(
          "p",
          null,
          "Room ID ",
          React.createElement(
            "strong",
            null,
            roomId
          )
        ),
        React.createElement(
          "i",
          null,
          "Choose your color..."
        ),
        React.createElement(
          "div",
          { className: "player-description" },
          React.createElement(Cell, {
            onClick: function onClick() {
              return connection.current.send(JSON.stringify({
                type: 'COLOR_CHANGE',
                roomId: roomId,
                playerId: playerId,
                color: 'black'
              }));
            },
            color: '#2C3A47' }),
          !!black && React.createElement(
            "span",
            null,
            black
          )
        ),
        React.createElement(
          "div",
          { className: "player-description" },
          React.createElement(Cell, {
            onClick: function onClick() {
              return connection.current.send(JSON.stringify({
                type: 'COLOR_CHANGE',
                roomId: roomId,
                playerId: playerId,
                color: 'white'
              }));
            },
            color: '#f3f3f3' }),
          !!white && React.createElement(
            "span",
            null,
            white
          )
        ),
        !!playerId && white === playerId && React.createElement(
          "p",
          null,
          "you will go second"
        ),
        !!playerId && black === playerId && React.createElement(
          "p",
          null,
          "you will go first"
        )
      ),
      React.createElement(
        "div",
        { className: "button-row" },
        React.createElement(
          Button,
          {
            onClick: function onClick() {
              return connection.current.send(JSON.stringify({
                type: 'READY',
                roomId: roomId,
                playerId: playerId
              }));
            },
            disabled: !white || !black
          },
          "Ready"
        ),
        React.createElement(
          Button,
          {
            onClick: function onClick() {
              return connection.current.send(JSON.stringify({
                type: "RESET",
                roomId: roomId
              }));
            }
          },
          "Reset the game"
        )
      )
    );
  }

  var _board$reduce = board.reduce(function (agg, row) {
    var temp = Object.assign({}, agg);
    for (var i = 0; i < row.length; i++) {
      if (row[i] === white) temp.whiteCount++;
      if (row[i] === black) temp.blackCount++;
    }
    return temp;
  }, { whiteCount: 0, blackCount: 0 }),
      whiteCount = _board$reduce.whiteCount,
      blackCount = _board$reduce.blackCount;

  var gameOver = whiteCount + blackCount >= 64;
  var gameOverCondition = void 0;

  if (gameOver) {
    if (whiteCount === blackCount) {
      gameOverCondition = "It's a tie!";
    } else if (whiteCount > blackCount && playerId === white || blackCount > whiteCount && playerId === black) {
      gameOverCondition = "Congratulations! You won! :)";
    } else {
      gameOverCondition = "Better luck next time :(";
    }
  }

  return React.createElement(
    "div",
    { className: "board-container" },
    React.createElement(
      "div",
      { className: "board-score-container" },
      "Score: White - ",
      whiteCount,
      " | Black - ",
      blackCount,
      !!playerId && white === playerId && React.createElement(
        "p",
        null,
        "you're player White, playerId " + playerId
      ),
      !!playerId && black === playerId && React.createElement(
        "p",
        null,
        "you're player Black, playerId " + playerId
      ),
      React.createElement("br", null)
    ),
    React.createElement(Board, {
      board: board,
      white: white,
      black: black,
      onCellClick: function onCellClick(row, col) {
        !!playerId && turn === playerId && connection.current.send(JSON.stringify({
          type: "SELECT",
          row: row,
          col: col,
          playerId: playerId,
          roomId: roomId
        }));
      }
    }),
    React.createElement(
      "div",
      { className: "message-container" },
      !!playerId && !gameOver && turn === playerId ? React.createElement(
        "p",
        null,
        "It's your turn"
      ) : React.createElement(
        "p",
        null,
        "Wait for your turn!"
      ),
      gameOverCondition && React.createElement(
        "p",
        null,
        gameOverCondition
      )
    ),
    React.createElement(
      "div",
      { className: "button-row" },
      React.createElement(
        Button,
        {
          onClick: function onClick() {
            return connection.current.send(JSON.stringify({
              type: "PASS",
              roomId: roomId
            }));
          }
        },
        "Pass"
      ),
      React.createElement(
        Button,
        {
          onClick: function onClick() {
            return connection.current.send(JSON.stringify({
              type: "RESET",
              roomId: roomId
            }));
          }
        },
        "Reset the server"
      )
    )
  );
};

var domContainer = document.querySelector("#root");
ReactDOM.render(React.createElement(App, null), domContainer);