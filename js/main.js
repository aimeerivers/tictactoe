/*----- constants -----*/
const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], 
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
const turns = ['X', 'O'];

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

const pollSpeed = 30;
const resetSpeed = 150;


/*----- app's state (variables) -----*/
let board;
let turn;
let winner;
let state;
let players = [];
let winningCombo = null;

/*----- cached element references -----*/
const squares = Array.from(document.querySelectorAll('#board div'));
const messages = document.querySelector('h2');

/*----- event listeners -----*/
document.getElementById('board').addEventListener('click', handleTurn);
document.getElementById('reset-button').addEventListener('click', reset);

/*----- functions -----*/

class Player {
  constructor(turn) {
    this.turn = turn;
  };

  startPolling() {
    var self = this;
    self.poll = setInterval(function() {
      if (state === 'win') {
        self.stopPolling();
        if (winner === self.turn) {
          self.handleWinning();
        } else {
          self.handleLosing();
        }
      } else if (state === 'tie') {
        self.stopPolling();
        self.handleTie();
      } else if (state === 'playing' && turn === self.turn) {
        self.takeTurn();
      };
    }, pollSpeed);
  };

  stopPolling() {
    clearInterval(this.poll);
  }

  takeTurn() {
    takeTurn(this.calculateBestMove());
  };

  calculateBestMove() {
    var possibleMoves = [];
    board.forEach(function(value, idx) {
      if (value == '') possibleMoves.push(idx);
    });
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];;
  }

  handleWinning() {
    console.log("I won! I am " + this.turn);
  }

  handleLosing() {
    console.log("I Lost :( I am " + this.turn);
  }

  handleTie() {
    console.log("It was a tie.");
  }
};

function init() {
  if(mode == "alex" || mode == "training") {
    var alex = new Player('X');
    players.push(alex);
  }
  if(mode == "oak" || mode == "training") {
    var oak = new Player('O');
    players.push(oak);
  }
  reset();
}

function reset() {
  players.forEach(function(player) { player.stopPolling(); });
  board = [
    '', '', '',
    '', '', '',
    '', '', ''
  ];
  turn = turns[Math.floor(Math.random() * turns.length)];

  winner = null;
  state = 'playing';
  players.forEach(function(player) { player.startPolling(); });

  hideWin();
  render();
};

function render() {
  board.forEach(function(mark, index){
    squares[index].textContent = mark;
  });
  if (state === 'tie') {
    messages.textContent = `That's a tie!`
  } else if (state === 'win') { 
    messages.textContent = `${winner} wins the game!`
    displayWin();
  } else {
    messages.textContent = `It's ${turn}'s turn!`
  }
};

function handleTurn(event) {
  let idx = squares.findIndex(function(square) {
    return square === event.target;
  });
  takeTurn(idx);
};

function takeTurn(idx) {
  if (winner === null && board[idx] === '') {
    board[idx] = turn;
    winner = getWinner();
    if (winner === 'T') {
      state = 'tie';
    } else if (winner === 'X' || winner === 'O') {
      state = 'win';
    } else {
      turn = turn === 'X' ? 'O' : 'X';
    }
    render();

    if(mode === 'training' && state !== 'playing') {
      setTimeout(reset, resetSpeed);
    }
  }
};

function getWinner() {
  let tempWinner = null;
  winningCombos.forEach(function(combo, index) {
    if (board[combo[0]] && board[combo[0]] === board[combo[1]] &&
      board[combo[0]] === board[combo[2]]) {
        tempWinner = board[combo[0]];
        winningCombo = combo;
      }
  });
  return tempWinner ? tempWinner : board.includes('') ? null : 'T';
};

function hideWin() {
  var winningSquares = document.getElementsByClassName('win');
  while (winningSquares.length > 0) {
    winningSquares[0].classList.remove('win');
  }
}

function displayWin() {
  winningCombo.forEach(function(number, index) {
    document.getElementsByClassName('square')[number].classList.add('win');
  });
}

init();
