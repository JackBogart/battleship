import { TileInfo } from './model/gameboard';

function createButton(className, text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', className);
  button.textContent = text;

  return button;
}

export function createView() {
  const player1Board = document.querySelector('.player-1');
  const player2Board = document.querySelector('.player-2');
  const status = document.querySelector('.current-status');
  const gameboards = document.querySelectorAll('.gameboard');
  const buttons = document.querySelector('.buttons');

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

  const renderAllPlayerShips = (isPlayer1, player) => {
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

  const renderShip = (
    isPlayer1,
    row,
    col,
    isVertical,
    shipLength,
    isComputerAttacking,
  ) => {
    const board = isPlayer1 ? player1Board : player2Board;

    for (let i = 0; i < shipLength; i++) {
      const currentRow = isVertical ? row + i : row;
      const currentCol = isVertical ? col : col + i;

      const tile = board.querySelector(
        `[data-row="${currentRow}"][data-col="${currentCol}"]`,
      );
      tile.style.backgroundColor = isComputerAttacking ? 'red' : 'grey';
    }
  };

  const receiveAttack = (row, col, tileInfo, isPlayer1Turn) => {
    const attackedBoard = isPlayer1Turn ? player2Board : player1Board;
    const tile = attackedBoard.querySelector(
      `[data-row="${row}"][data-col="${col}"]`,
    );
    tile.classList.add(tileInfo === TileInfo.HIT ? 'hit-cell' : 'miss-cell');
  };

  const resetBoards = () => {
    status.textContent = ``;
    const playerBoards = [player1Board, player2Board];

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        playerBoards.forEach((board) => {
          const tile = board.querySelector(
            `[data-row="${row}"][data-col="${col}"]`,
          );
          tile.style.backgroundColor = '';
          tile.classList = 'grid-cell';
        });
      }
    }
  };

  const reportGameOver = (name) => {
    status.textContent = `${name} wins!`;

    const playAgainBtn = createButton('play-again', 'Play Again');
    buttons.appendChild(playAgainBtn);
  };

  const addPreGameControls = () => {
    const startGameBtn = createButton('start-game', 'Start Game');
    const randomizeBtn = createButton('randomize', 'Reroll Ships');
    buttons.replaceChildren(startGameBtn, randomizeBtn);
  };

  const removePreGameControls = () => {
    buttons.replaceChildren();
  };

  // Binders below
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

  const bindButtons = (handlers) => {
    buttons.addEventListener('click', (event) => {
      if (event.target.classList.contains('randomize')) {
        handlers.randomize();
      } else if (event.target.classList.contains('start-game')) {
        handlers.start();
      } else if (event.target.classList.contains('play-again')) {
        handlers.playAgain();
      }
    });
  };

  return {
    receiveAttack,
    init,
    renderAllPlayerShips,
    bindReceiveAttack,
    bindButtons,
    reportGameOver,
    renderShip,
    removePreGameControls,
    addPreGameControls,
    resetBoards,
  };
}
