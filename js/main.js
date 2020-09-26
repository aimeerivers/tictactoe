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
const pollSpeed = 20;
const resetSpeed = 100;

const startWeighting = 3;
const rewardWeighting = 3;
const punishWeighting = 1;

/*----- app's state (variables) -----*/
let params = new URLSearchParams(window.location.search);
let mode = params.get("mode");

let alex, oak;
let activePlayers = [];

let board;
let turn;
let winner;
let state;
let winningCombo = null;

let results = {
  'win': 0,
  'tie': 0,
  'X': 0,
  'O': 0
}

/*----- cached element references -----*/
const squares = Array.from(document.querySelectorAll('#board div'));
const messages = document.querySelector('h2');
const resultsHuman = document.getElementById('results-human');
const resultsAlex = document.getElementById('results-alex');
const resultsOak = document.getElementById('results-oak');
const resultsTie = document.getElementById('results-tie');

/*----- event listeners -----*/
document.getElementById('board').addEventListener('click', handleTurn);
document.getElementById('reset-button').addEventListener('click', reset);

document.getElementById('play-alex').addEventListener('click', function(e) {
  e.preventDefault();
  playAlex();
});

document.getElementById('play-oak').addEventListener('click', function(e) {
  e.preventDefault();
  playOak();
});

document.getElementById('training-mode').addEventListener('click', function(e) {
  e.preventDefault();
  trainingMode();
});

/*----- Player functions -----*/

class Player {
  constructor(turn) {
    this.turn = turn;
    this.knownStates = {};
  };

  reset() {
    this.stopPolling();
  }

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
    var currentState = board.map(function(square) { return square == '' ? '-' : square; });
    var knownState = this.findOrCreateState(currentState);

    var possibleMoves = [];
    for(var k in knownState) {
      for (let i = 0; i < knownState[k]; i++) {
        possibleMoves.push(k);
      }
    }

    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];;
  }

  findOrCreateState(boardState) {
    var state = this.knownStates[boardState.join("")];
    if(state === undefined) { state = this.createState(boardState); }
    return state;
  }

  createState(boardState) {
    var moveOptions = {};
    boardState.forEach(function(square, index) {
      if(square === "-") { moveOptions[index] = startWeighting; }
    });
    this.knownStates[boardState.join("")] = moveOptions;
    return moveOptions;
  }

  handleWinning() {
    console.log("I won! I am " + this.turn);
    results[this.turn] += 1;
  }

  handleLosing() {
    console.log("I Lost :( I am " + this.turn);
  }

  handleTie() {
    console.log("It was a tie.");
  }
};

/*----- Page functions -----*/

function init() {
  alex = new Player('X');
  oak = new Player('O');

  if(mode == "alex") {
    playAlex();
  } else if(mode == "oak") {
    playOak();
  } else if(mode == "training") {
    trainingMode();
  } else {
    reset();
  }
}

function playAlex() {
  resetPlayers();
  activePlayers = [alex];
  reset();
}

function playOak() {
  resetPlayers();
  activePlayers = [oak];
  reset();
}

function trainingMode() {
  resetPlayers();
  activePlayers = [alex, oak];
  reset();
}

function resetPlayers() {
  activePlayers.forEach(function(player) { player.reset(); });
}

function reset() {
  resetPlayers();
  board = [
    '', '', '',
    '', '', '',
    '', '', ''
  ];
  turn = turns[Math.floor(Math.random() * turns.length)];

  winner = null;
  state = 'playing';
  activePlayers.forEach(function(player) { player.startPolling(); });

  hideWin();
  render();
};

function render() {
  // Update board
  board.forEach(function(mark, index){
    squares[index].textContent = mark;
  });

  // Status message
  if (state === 'tie') {
    messages.textContent = `That's a tie!`
  } else if (state === 'win') { 
    messages.textContent = `${winner} wins the game!`
    displayWin();
  } else {
    messages.textContent = `It's ${turn}'s turn!`
  }
};

function updateResultsTable() {
  resultsTie.textContent = results['tie'];
  resultsAlex.textContent = results['X'];
  resultsOak.textContent = results['O'];
  resultsHuman.textContent = results['win'] - results['X'] - results['O'];
}

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
      results['tie'] += 1;
      setTimeout(updateResultsTable, pollSpeed * 2);
    } else if (winner === 'X' || winner === 'O') {
      state = 'win';
      results['win'] += 1;
      setTimeout(updateResultsTable, pollSpeed * 2);
    } else {
      turn = turn === 'X' ? 'O' : 'X';
    }
    render();

    if(activePlayers.length === 2 && state !== 'playing') {
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
