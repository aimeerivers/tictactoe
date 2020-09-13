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


/*----- app's state (variables) -----*/
let board;
let turn;
let win;
let winningCombo = null;

/*----- cached element references -----*/
const squares = Array.from(document.querySelectorAll('#board div'));
const messages = document.querySelector('h2');

/*----- event listeners -----*/
document.getElementById('board').addEventListener('click', handleTurn);
document.getElementById('reset-button').addEventListener('click', init);

/*----- functions -----*/

function init() {
  board = [
    '', '', '',
    '', '', '',
    '', '', ''
  ];
  turn = turns[Math.floor(Math.random() * turns.length)];

  win = null;

  var winningSquares = document.getElementsByClassName('win');
  while (winningSquares.length > 0) {
    winningSquares[0].classList.remove('win');
  }

  render();
};

function render() {
  board.forEach(function(mark, index){
    squares[index].textContent = mark;
  });
  if ( win === 'T' ) {
    messages.textContent = `That's a tie!`
  } else if (win) { 
    messages.textContent = `${win} wins the game!`
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
  if (win === null && board[idx] === '') {
    board[idx] = turn;
    win = getWinner();
    turn = turn === 'X' ? 'O' : 'X';
    render();
  }
};

function getWinner() {
  let winner = null;
  winningCombos.forEach(function(combo, index) {
    if (board[combo[0]] && board[combo[0]] === board[combo[1]] &&
      board[combo[0]] === board[combo[2]]) {
        winner = board[combo[0]];
        winningCombo = combo;
      }
  });
  return winner ? winner : board.includes('') ? null : 'T';
};

function displayWin() {
  winningCombo.forEach(function(number, index) {
    document.getElementsByClassName('square')[number].classList.add('win');
  });
}

init();
