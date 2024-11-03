import { TileInfoType } from './types';

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
          gridCell.style.gridRow = `${row + 1} / ${row + 2}`;
          gridCell.style.gridColumn = `${col + 1} / ${col + 2}`;

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

  // TODO: This will need to be updated when two player is supported
  const renderAllSunkenShips = (isPlayer1, player) => {
    const board = isPlayer1 ? player1Board : player2Board;

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const tile = board.querySelector(
          `[data-row="${row}"][data-col="${col}"]`,
        );

        if (
          player.getTileInfo(row, col) === TileInfoType.HIT &&
          player.getShip(row, col).isSunk()
        ) {
          tile.style.backgroundColor = 'red';
        }
      }
    }
  };

  const renderSunkenShip = (isPlayer1, row, col, isVertical, shipLength) => {
    const board = isPlayer1 ? player1Board : player2Board;

    for (let i = 0; i < shipLength; i++) {
      const currentRow = isVertical ? row + i : row;
      const currentCol = isVertical ? col : col + i;

      const tile = board.querySelector(
        `[data-row="${currentRow}"][data-col="${currentCol}"]`,
      );
      tile.style.backgroundColor = 'red';
    }
  };

  const receiveAttack = (row, col, tileInfo, isPlayer1Turn) => {
    const attackedBoard = isPlayer1Turn ? player2Board : player1Board;
    const tile = attackedBoard.querySelector(
      `[data-row="${row}"][data-col="${col}"]`,
    );
    tile.classList.add(
      tileInfo === TileInfoType.HIT ? 'hit-cell' : 'miss-cell',
    );
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

  // TODO: Need to refactor, ship shouldn't be created onto the board
  const createShip = (row, col, isVertical, ship, isPlayer1) => {
    const board = isPlayer1 ? player1Board : player2Board;
    const shipContainer = document.createElement('div');
    shipContainer.id = `${ship.getType()}`;
    shipContainer.classList.add('ship-container');
    shipContainer.draggable = true;

    if (isVertical) {
      shipContainer.style.gridRow = `${row + 1} / ${row + ship.getLength() + 1}`;
      shipContainer.style.gridColumn = `${col + 1} / ${col + 2}`;
      shipContainer.classList.add('vertical');
    } else {
      shipContainer.style.gridRow = `${row + 1} / ${row + 2}`;
      shipContainer.style.gridColumn = `${col + 1} / ${col + ship.getLength() + 1}`;
    }

    for (let i = 0; i < ship.getLength(); i++) {
      shipContainer.appendChild(document.createElement('div'));
    }

    board.appendChild(shipContainer);
  };

  const placeShip = (row, col, isVertical, ship, isPlayer1) => {
    const board = isPlayer1 ? player1Board : player2Board;
    const shipElement = document.querySelector(`#${ship.getType()}`);

    // When the ship isn't placed on the board yet, (first placement)
    if (board.querySelector(`#${ship.getType()}`) === null) {
      board.appendChild(shipElement);
    }

    if (isVertical) {
      shipElement.classList.add('vertical');
      shipElement.style.gridRow = `${row + 1} / ${row + ship.getLength() + 1}`;
      shipElement.style.gridColumn = `${col + 1} / ${col + 2}`;
    } else {
      shipElement.classList.remove('vertical');
      shipElement.style.gridRow = `${row + 1} / ${row + 2}`;
      shipElement.style.gridColumn = `${col + 1} / ${col + ship.getLength() + 1}`;
    }
  };

  const removeDraggableShips = () => {
    document.querySelectorAll('.ship-container').forEach((ele) => {
      ele.remove();
    });
  };

  // Binders below
  const bindClick = (handlers) => {
    gameboards.forEach((gameboard) => {
      gameboard.addEventListener('click', (event) => {
        if (event.target.classList.contains('grid-cell')) {
          const isPlayer1Board = event.currentTarget === player1Board;
          const row = event.target.dataset.row;
          const col = event.target.dataset.col;

          handlers.receiveAttack(row, col, isPlayer1Board);
        } else if (event.target.classList.contains('ship-container')) {
          handlers.rotate(event.target.id);
        }
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

  const bindDragAndDrop = (handlers) => {
    player1Board.addEventListener('dragstart', handlers.dragStart);

    player1Board.addEventListener('dragend', handlers.dragEnd);

    player1Board.addEventListener('dragover', handlers.dragOver);

    player1Board.addEventListener('drop', handlers.drop);
  };

  return {
    addPreGameControls,
    bindButtons,
    bindClick,
    bindDragAndDrop,
    createShip,
    init,
    placeShip,
    receiveAttack,
    removeDraggableShips,
    removePreGameControls,
    renderAllPlayerShips,
    renderAllSunkenShips,
    renderSunkenShip,
    reportGameOver,
    resetBoards,
  };
}

export function getXYOffsets(ship) {
  // Divide main axis by x2 number of nodes to get center of the first node
  if (ship.classList.contains('vertical')) {
    return {
      offsetX: Number(ship.offsetWidth) / 2,
      offsetY: Number(ship.offsetHeight) / (Number(ship.childElementCount) * 2),
    };
  }

  return {
    offsetX: Number(ship.offsetWidth) / (Number(ship.childElementCount) * 2),
    offsetY: Number(ship.offsetHeight) / 2,
  };
}
