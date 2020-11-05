"use strict";

const Button = ({
  children,
  style = {},
  ...rest,
}) => (
  <button
    {...rest}
    style={{
      ...rest.style,
      height: "40px",
      borderRadius: "2px",
      WebkitBorderRadius: "2px",
      backgroundColor: "#f3f3f3",
      border: "unset",
      verticalAlign: "top",
      padding: "8px 12px"
    }}
  >
    {children}
  </button>
)

const Cell = ({
  onClick,
  color,
}) => (
  <button 
    onClick={() => onClick()}
    style={{
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
    }}
  >
    <div 
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "40px",
        backgroundColor: color,
        margin: "auto"
      }}
    />
  </button>
);

const Board = ({ board, onCellClick, white, black }) => (
  <div
    className="game-board"
    style={{
      minWidth: "360px",
      minHeight: "360px",
    }}
  >
    {board.map((row, i) => (
      <div>
        {row.map((cell, j) => {
          if (!cell) {
            return (
              <Cell onClick={() => onCellClick(i, j)} color={'#58B19F'} />
            );
          }

          if (cell === white) {
            return (
              <Cell onClick={() => onCellClick(i, j)} color={'#f3f3f3'} />
            );
          }

          if (cell === black) {
            return (
              <Cell onClick={() => onCellClick(i, j)} color={'#2C3A47'} />
            );
          }

          return null;
        })}
      </div>
    ))}
  </div>
);

const App = () => {
  const [playerId] = React.useState(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12));
  const [data, setData] = React.useState({ board: [] });
  const connection = React.useRef(null);

  React.useEffect(() => {
    // TODO: this should read from a .env if this is going to be public
    const socket = new WebSocket('ws://192.168.2.164:3001');
    connection.current = socket;
    // Connection opened
    socket.addEventListener('open', function () {
      socket.send(JSON.stringify({
        type: "INIT",
        playerId,
      }));

      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        setData(data);
      });
    });
  }, []);

  const { board, white, black, turn, ready } = data;

  if (!white || !black || !ready) {
    return (
      <div className="lobby-container">
        <div>
          <p>Welcome to</p>
          <h1>Othello</h1>
        </div>
        <div>
          <p>Rules</p>
          <ul>
            <li>You need two players to start the game</li>
            <li>You can manually skip your turn if you get stuck</li>
            <li>You can reset the server at any time</li>
          </ul>
        </div>
        <div className="lobby-players">
          <p>Your player ID is <strong>{playerId}</strong></p>
          <i>Choose your color...</i>
          <div className="player-description">
            <Cell
              onClick={() => connection.current.send(JSON.stringify({
                type: 'INIT', 
                playerId, 
                color: 'white'
              }))}
              color={'#f3f3f3'} />
            {!!white && (<span>{white}</span>)}
          </div>
          <div className="player-description">
            <Cell
              onClick={() => connection.current.send(JSON.stringify({
                type: 'INIT', 
                playerId, 
                color: 'black'
              }))}
              color={'#2C3A47'} />
            {!!black && (<span>{black}</span>)}
          </div>
          {!!playerId && white === playerId && (<p>{`you will go second`}</p>)}
          {!!playerId && black === playerId && (<p>{`you will go first`}</p>)}
        </div>
        <div className="button-row">
          <Button
            onClick={() => connection.current.send(JSON.stringify({
              type: 'READY',
              playerId,
            }))}
            disabled={!white || !black}
          >
              Ready
          </Button>
          <Button
            onClick={() => connection.current.send(JSON.stringify({
              type: "RESET"
            }))}
          >
            Reset the server
          </Button>
        </div>
      </div>
    );
  }

  const { whiteCount, blackCount } = board.reduce((agg, row) => {
    let temp = { ...agg };
    for (let i = 0; i < row.length; i++) {
      if (row[i] === white) temp.whiteCount++; 
      if (row[i] === black) temp.blackCount++; 
    }
    return temp;
  }, { whiteCount: 0, blackCount: 0 });

  const gameOver = whiteCount + blackCount >= 64;
  let gameOverCondition;

  if (gameOver) {
    if (whiteCount === blackCount) {
      gameOverCondition = "It's a tie!";
    } else if ((whiteCount > blackCount && playerId === white)
      || (blackCount > whiteCount && playerId === black)
    ) {
      gameOverCondition = "Congratulations! You won! :)";
    } else {
      gameOverCondition = "Better luck next time :(";
    }
  }

  return (
    <div className="board-container">
      <div className="board-score-container">
        Score: White - {whiteCount} | Black - {blackCount}
        {!!playerId && white === playerId && (<p>{`you're player White, playerId ${playerId}`}</p>)}
        {!!playerId && black === playerId && (<p>{`you're player Black, playerId ${playerId}`}</p>)}
        <br />
      </div>
      <Board
        board={board}
        white={white}
        black={black}
        onCellClick={(row, col) => {
          !!playerId && turn === playerId && connection.current.send(JSON.stringify({
          type: "SELECT",
          row,
          col,
          playerId,
        }))}}
      />
      <div className="message-container">
        {!!playerId && !gameOver && turn === playerId 
          ? (<p>It's your turn</p>)
          : (<p>Wait for your turn!</p>)
        }
        {gameOverCondition && (<p>{gameOverCondition}</p>)}
      </div>
      <div className="button-row">
        <Button 
          onClick={() => connection.current.send(JSON.stringify({
            type: "PASS"
          }))}
        >
          Pass
        </Button>
        <Button 
          onClick={() => connection.current.send(JSON.stringify({
            type: "RESET"
          }))}
        >
          Reset the server
        </Button>
      </div>
    </div>
  );
}

const domContainer = document.querySelector("#root");
ReactDOM.render(<App />, domContainer);
