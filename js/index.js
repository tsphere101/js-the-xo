"use strict";
{
    class Board {
        constructor(table) {
            this.writeCell = (r, c, value = "") => {
                let tab = document.getElementById("tictactoe");
                let cell = tab.rows[r].cells[c];
                let div = this.createXoDiv(value);
                // Erase
                while (cell.lastElementChild) {
                    cell.removeChild(cell.lastElementChild);
                }
                // Write new
                cell.appendChild(div);
            };
            this.clearCell = (obj) => {
                let tab = document.getElementById("tictactoe");
                if (obj === undefined) {
                    // Clear all cell
                    for (let i = 0; i < tab.rows.length; i++) {
                        for (let j = 0; j < tab.rows[i].cells.length; j++) {
                            this.writeCell(i, j);
                        }
                    }
                    return;
                }
                if (obj.c === undefined && obj.r === undefined) {
                    return this.clearCell();
                }
                if (obj.c === undefined) {
                    if (obj.r !== undefined) {
                        // Remove entire row
                        let row = tab.rows[obj.r];
                        for (let i = 0; i < row.cells.length; i++) {
                            this.writeCell(obj.r, i);
                        }
                    }
                }
                if (obj.r === undefined) {
                    if (obj.c !== undefined) {
                        for (let i = 0; i < tab.rows.length; i++) {
                            for (let j = 0; j < tab.rows[i].cells.length; j++) {
                                if (j === obj.c) {
                                    this.writeCell(i, j);
                                }
                            }
                        }
                    }
                }
                if (obj.r !== undefined && obj.c !== undefined)
                    return this.writeCell(obj.r, obj.c);
                console.trace("ERROR WHILE CLEARING CELL");
            };
            this.createXoDiv = (symbol = "") => {
                let elem = document.createElement("div");
                elem.classList.add("symbol");
                if (symbol == "") {
                    return elem;
                }
                elem.innerHTML = symbol;
                return elem;
            };
            this.table = table;
        }
    }
    class Position {
        constructor(row, col) {
            this.equals = (o) => {
                return o.row == this.row && o.col == this.col;
            };
            this.row = row;
            this.col = col;
        }
    }
    Position.parsePosition = (n, tableSize = 3) => {
        let row = Math.floor(n / tableSize);
        let col = n - row * tableSize;
        return new Position(row, col);
    };
    class PlayerMove {
        constructor(player, pos) {
            this.player = player;
            this.position = pos;
        }
    }
    class Player {
        constructor(symbol, board, game) {
            this.write = (r, c) => {
                this.board.writeCell(r, c, this.symbol);
            };
            this.makeMove = (r, c) => {
                if (this.game.isEnd)
                    return false;
                let newPosition = new Position(r, c);
                let newMove = new PlayerMove(this, newPosition);
                if (this.game.isMoveValid(newPosition)) {
                    this.write(r, c);
                    this.game.moves += 1;
                    this.moves.push(newPosition);
                    this.game.nextPlayer();
                    this.game.checkEndGame();
                    return true;
                }
                return false;
            };
            this.countAllignedRow = (row) => {
                let count = 0;
                for (let i = 0; i < this.moves.length; i++) {
                    let move = this.moves[i];
                    if (move.row == row) {
                        count++;
                    }
                }
                return count;
            };
            this.countAllignedCol = (col) => {
                let count = 0;
                for (let i = 0; i < this.moves.length; i++) {
                    let move = this.moves[i];
                    if (move.col == col) {
                        count++;
                    }
                }
                return count;
            };
            this.countLeftDiagonal = () => {
                let count = 0;
                for (let i = 0; i < this.moves.length; i++) {
                    let pos = this.moves[i];
                    // Count the amount of moves in left Diagonal
                    if (pos.col == pos.row) {
                        count++;
                    }
                }
                return count;
            };
            this.countRightDiagonal = () => {
                let count = 0;
                for (let i = 0; i < this.moves.length; i++) {
                    let pos = this.moves[i];
                    // Count the amount of moves in right Diagonal
                    if (pos.col + pos.row == this.game.tableSize - 1) {
                        count++;
                    }
                }
                return count;
            };
            this.checkWin = () => {
                let boardSize = this.game.tableSize;
                // Check if at least amount of move is able to win
                if (this.moves.length < this.game.tableSize) {
                    return false;
                }
                // Allign pattern
                for (let i = 0; i < boardSize; i++) {
                    if (this.countAllignedRow(i) >= boardSize ||
                        this.countAllignedCol(i) >= boardSize) {
                        return true;
                    }
                }
                if (this.countLeftDiagonal() == this.game.tableSize) {
                    return true;
                }
                if (this.countRightDiagonal() == this.game.tableSize) {
                    return true;
                }
                return false;
            };
            this.restart = () => {
                this.moves = [];
            };
            this.symbol = symbol.toLowerCase();
            this.board = board;
            this.game = game;
            this.moves = [];
            this.score = 0;
        }
    }
    class TicTacToe {
        constructor(board, tableSize = 3) {
            this.initGame = () => {
                this.updateCursor();
                this.updateScoreBoard();
            };
            this.updateCursor = () => {
                // Update the mouse cursor
                if (this.currentPlayer == this.playerX) {
                    let body = document.getElementsByTagName("tbody")[0];
                    body.style.cursor = "url(img/x.png),auto";
                }
                else {
                    let body = document.getElementsByTagName("tbody")[0];
                    body.style.cursor = "url(img/o.png),auto";
                }
            };
            this.updateScoreBoard = () => {
                // Update the current player div
                let curPlayerDiv = this.currentPlayerDiv;
                curPlayerDiv.innerHTML = this.currentPlayer.symbol;
                // Update the score
                let scoreDiv = document.getElementById("score");
                scoreDiv.innerHTML = `${this.playerX.score.toString()} - ${this.playerO.score.toString()}`;
            };
            this.isMoveValid = (position) => {
                // Loop through all players
                for (let i = 0; i < this.players.length; i++) {
                    let player = this.players[i];
                    // Check with all moves of the player
                    for (let pos of player.moves) {
                        if (position.equals(pos)) {
                            return false;
                        }
                    }
                }
                return true;
            };
            this.nextPlayer = () => {
                let nextIndex = this.players.indexOf(this.currentPlayer) + 1;
                if (nextIndex >= this.players.length)
                    nextIndex = 0;
                this.currentPlayer = this.players[nextIndex];
                this.updateScoreBoard();
                this.updateCursor();
                return this.currentPlayer;
            };
            this.checkEndGame = () => {
                for (let player of this.players) {
                    if (player.checkWin()) {
                        this.isEnd = true;
                        player.score += 1;
                        this.endGameEvent(player);
                        return true;
                    }
                }
                // All cells are filled :: Draw
                if (this.moves >= this.tableSize * this.tableSize) {
                    this.isEnd = true;
                    this.endGameEvent(null);
                    return true;
                }
                return false;
            };
            this.restart = () => {
                this.moves = 0;
                this.players.forEach((x) => x.restart());
                this.board.clearCell();
                this.isEnd = false;
            };
            this.endGameEvent = (event) => {
                this.updateScoreBoard();
                let endgameMessageDiv = document.getElementById("endgame");
                let restartButtonDiv = document.getElementById("restart-btn-div");
                let restartButton = document.createElement("button");
                restartButton.innerHTML = "Restart";
                restartButton.classList.add("restart-btn");
                restartButton.addEventListener("click", function (e) {
                    e.preventDefault();
                    game.restart();
                    // Remove button and message
                    while (endgameMessageDiv.lastElementChild) {
                        endgameMessageDiv.removeChild(endgameMessageDiv.lastElementChild);
                    }
                    while (restartButtonDiv.lastElementChild) {
                        restartButtonDiv.removeChild(restartButtonDiv.lastElementChild);
                    }
                });
                restartButtonDiv.appendChild(restartButton);
                if (event === null) {
                    let message = document.createElement("h1");
                    message.innerHTML = "Game over: no move";
                    endgameMessageDiv.appendChild(message);
                }
                if (event instanceof Player) {
                    let player = event;
                    let message = document.createElement("h1");
                    message.innerHTML = `${player.symbol} is the winner!`;
                    endgameMessageDiv.appendChild(message);
                }
            };
            this.currentPlayerDiv = document.getElementById("current-player");
            this.board = board;
            this.tableSize = tableSize;
            this.playerX = new Player("✖", board, this);
            this.playerO = new Player("☻", board, this);
            this.moves = 0;
            this.players = [this.playerX, this.playerO];
            this.currentPlayer = this.playerX;
            this.isEnd = false;
            this.initGame();
        }
    }
    // Game instance
    let table = document.getElementById("tictactoe");
    let board = new Board(table);
    const game = new TicTacToe(board);
    // Controller
    let cells = document.getElementsByTagName("td");
    for (let i in cells) {
        let cell = cells[i];
        cell.addEventListener("click", function () {
            let pos = Position.parsePosition(Number.parseInt(i));
            game.currentPlayer.makeMove(pos.row, pos.col);
        });
    }
}
