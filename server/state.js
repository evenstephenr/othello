class StateManager {
  constructor() {
    this.initializeState();
  }

  initializeState() {
    const board = [];
    for (let i = 0; i <= 7; i++) {
      board[i] = new Array(8);
    }
    this.state = {
      ...this.state,
      board,
      turn: undefined,
      playerList: [],
      ready: false,
    };
  }

  initializeBoard() {
    this.flipCell(3, 3, this.state.white);
    this.flipCell(4, 4, this.state.white);
    this.flipCell(3, 4, this.state.black);
    this.flipCell(4, 3, this.state.black);
  }

  assertAdjacent(row, col) {
    // cannot override an existing cell
    if (!!this.state.board[row][col]) return false;
    // only need one of these to be true
    if (!!this.state.board[row - 1] && !!this.state.board[row - 1][col]) return true;
    if (!!this.state.board[row - 1] && !!this.state.board[row - 1][col - 1]) return true;
    if (!!this.state.board[row - 1] && !!this.state.board[row - 1][col + 1]) return true;
    if (!!this.state.board[row + 1] && !!this.state.board[row + 1][col]) return true;
    if (!!this.state.board[row + 1] && !!this.state.board[row + 1][col - 1]) return true;
    if (!!this.state.board[row + 1] && !!this.state.board[row + 1][col + 1]) return true;
    if (!!this.state.board[row][col + 1]) return true;
    if (!!this.state.board[row][col - 1]) return true;

    return false;
  }

  assertCapture(row, col, playerId) {
    /** enforces a consistent pattern to iterate through the grid */
    function parseGrid({ startIndex, endIndex, cellLocation, board}) {
      let arr = [];
      for (let i = startIndex; i <= endIndex; i++) {
        const { row: r, col: c } = cellLocation(i);
        if (!board[r] || !board[r][c]) {
          arr = [];
          break;
        }
        if (board[r][c] === playerId) {
          break;
        }
        arr.push({ row: r, col: c });  
      }
      return arr;
    }

    // we know how many spaces there are in the grid (8 x 8)
    const flipE = parseGrid({
      startIndex: 1,
      endIndex: 8 - col,
      board: this.state.board,
      cellLocation: (i) => ({ row, col: col + i }),
    });
    const flipSE = parseGrid({
      startIndex: 1,
      endIndex: 8 - row,
      board: this.state.board,
      cellLocation: (i) => ({ row: row + i, col: col + i }),
    });
    const flipS = parseGrid({
      startIndex: 1,
      endIndex: 8 - row,
      board: this.state.board,
      cellLocation: (i) => ({ row: row + i, col }),
    });
    const flipSW = parseGrid({
      startIndex: 1,
      endIndex: 8 - row,
      board: this.state.board,
      cellLocation: (i) => ({ row: row + i, col: col - i }),
    });
    const flipW = parseGrid({
      startIndex: 1,
      endIndex: col + 1,
      board: this.state.board,
      cellLocation: (i) => ({ row, col: col - i }),
    });
    const flipNW = parseGrid({
      startIndex: 1,
      endIndex: row + 1,
      board: this.state.board,
      cellLocation: (i) => ({ row: row - i, col: col - i }),
    });
    const flipN = parseGrid({
      startIndex: 1,
      endIndex: row + 1,
      board: this.state.board,
      cellLocation: (i) => ({ row: row - i, col }),
    });
    const flipNE = parseGrid({
      startIndex: 1,
      endIndex: row + 1,
      board: this.state.board,
      cellLocation: (i) => ({ row: row - i, col: col + i }),
    });

    // should only run if we have pieces to flip
    if (
      flipE.length > 0 ||
      flipSE.length > 0 ||
      flipS.length > 0 ||
      flipSW.length > 0 ||
      flipW.length > 0 ||
      flipNW.length > 0 ||
      flipN.length > 0 ||
      flipNE.length > 0
    ) {
      flipE.forEach(({ row, col }) => this.flipCell(row, col, playerId));
      flipSE.forEach(({ row, col }) => this.flipCell(row, col, playerId));
      flipS.forEach(({ row, col }) => this.flipCell(row, col, playerId));
      flipSW.forEach(({ row, col }) => this.flipCell(row, col, playerId));
      flipW.forEach(({ row, col }) => this.flipCell(row, col, playerId));
      flipNW.forEach(({ row, col }) => this.flipCell(row, col, playerId));
      flipN.forEach(({ row, col }) => this.flipCell(row, col, playerId));
      flipNE.forEach(({ row, col }) => this.flipCell(row, col, playerId));
      this.flipCell(row, col, playerId);
      this.changeTurn();
      return true;  
    }

    return false;
  }

  changeTurn() {
    if (this.state.turn === this.state.white) {
      this.state.turn = this.state.black;
    } else if (this.state.turn === this.state.black) {
      this.state.turn = this.state.white;
    }
  }

  flipCell(row, col, playerId) {
    this.state.board[row][col] = playerId;
  }

  flip(row, col, playerId) {
    // every cell must be adjacent to an existing cell
    if (!this.assertAdjacent(row, col)) return false;
    // every move must capture other pieces
    if (!this.assertCapture(row, col, playerId)) return false;
    return true;
  }

  registerPlayer(playerId, color) {
    if (color && typeof this.state[color] !== 'undefined') {
      // swap players
      if (color === 'white') {
        this.state.black = this.state.white;
        this.state.turn = this.state.black;
        this.state.white = playerId;
      }
      if (color === 'black') {
        this.state.white = this.state.black;
        this.state.black = playerId;
        this.state.turn = playerId;
      }
    } else {
      if (!this.state.black) {
        // black goes first
        this.state.black = playerId;
        this.state.turn = playerId;
      } else if (!this.state.white) {
        this.state.white = playerId;
      }
    }

    if (this.state.black && this.state.white) this.initializeBoard();

    return this;
  }

  readyUp(playerId) {
    this.state.playerList.push(playerId);
    if (this.state.playerList.length === 2) this.state.ready = true;
  }

  getState() {
    return this.state;
  }
  
  setState(state) {
    this.state = {
      ...this.state,
      ...state,
    };
  }
}

module.exports = {
  StateManager
};