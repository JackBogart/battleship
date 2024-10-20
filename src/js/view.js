import { TileInfo } from './model/gameboard';
export function createView() {
  const player1Board = document.querySelector('.player-1');
  const player2Board = document.querySelector('.player-2');
  const gameboards = document.querySelectorAll('.gameboard');

  const init = () => {
    gameboards.forEach((grid) => {
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const gridCell = document.createElement('div');
          gridCell.dataset.row = row;
          gridCell.dataset.col = col;
          gridCell.classList.add('grid-cell');

          grid.appendChild(gridCell);
        }
      }
    });
  };

  const renderPlayerShips = (isPlayer1, player) => {
    const board = isPlayer1 ? player1Board : player2Board;

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const tile = board.querySelector(
          `[data-row="${row}"][data-col="${col}"]`,
        );

        if (player.getShip(row, col) !== null) {
          tile.style.backgroundColor = 'grey';
        } else {
          tile.style.backgroundColor = '';
        }
      }
    }
  };

  const receiveAttack = (row, col, tileInfo, isComputer) => {
    // Get the board being attacked by the current player, not their own board
    const attackedBoard = isComputer ? player1Board : player2Board;
    const tile = attackedBoard.querySelector(
      `[data-row="${row}"][data-col="${col}"]`,
    );
    tile.classList.add(tileInfo === TileInfo.HIT ? 'hit-cell' : 'miss-cell');
  };

  const reportGameOver = (name) => [
    // TODO: Replace this alert with custom non-modal/modal
    alert(`${name} wins! Refresh for a new game.`),
  ];

  const bindReceiveAttack = (handler) => {
    gameboards.forEach((gameboard) => {
      gameboard.addEventListener('click', (event) => {
        if (!event.target.classList.contains('grid-cell')) {
          return;
        }

        const isPlayer1Board = event.currentTarget === player1Board;
        const row = event.target.dataset.row;
        const col = event.target.dataset.col;

        handler(row, col, isPlayer1Board);
      });
    });
  };

  const bindRandomizeShips = (handler) => {
    const randomizeBtn = document.querySelector('.randomize');
    randomizeBtn.addEventListener('click', () => {
      handler();
    });
  };

  return {
    receiveAttack,
    init,
    renderPlayerShips,
    bindReceiveAttack,
    bindRandomizeShips,
    reportGameOver,
  };
}
