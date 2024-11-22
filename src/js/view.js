import { NUM_OF_COLUMNS, NUM_OF_ROWS } from './constants';
import { FormFieldType, TileInfoType } from './types';

function createButton(text, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;

  if (className) {
    button.classList.add(className);
  }

  return button;
}

export function createView() {
  const planningModal = document.querySelector('.planning-modal');
  const planningForm = document.querySelector('.planning-modal > form');
  const player1Board = document.querySelector('.player-1 .gameboard');
  const player2Board = document.querySelector('.player-2 .gameboard');
  const status = document.querySelector('.current-status');
  const buttons = document.querySelector('.content .buttons');
  const planningShips = document.querySelector(`#${FormFieldType.SHIPS}`);
  const planningBoard = document.querySelector(`.planning-modal .gameboard`);
  const computerRadioBtn = document.querySelector('#computer');
  const playerRadioBtn = document.querySelector('#player');

  const init = () => {
    document.querySelectorAll('.gameboard').forEach((grid) => {
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

        if (player.getShip(row, col)) {
          tile.style.backgroundColor = getComputedStyle(
            document.documentElement,
          ).getPropertyValue('--ship-cell-color');
        } else {
          tile.style.backgroundColor = '';
        }
      }
    }
  };

  const hideAllPlayerShips = (isPlayer1, player) => {
    const board = isPlayer1 ? player1Board : player2Board;

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const tile = board.querySelector(
          `[data-row="${row}"][data-col="${col}"]`,
        );

        if (player.getShip(row, col) && !player.getShip(row, col).isSunk()) {
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

  const resetPlayerBoards = () => {
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
    player1Board.style.display = 'none';
    player2Board.style.display = 'none';
    document.querySelector('.gameplay-wrapper').classList.remove('active');
  };

  const showPlanningModal = () => {
    planningModal.showModal();
  };

  const removePreGameControls = () => {
    buttons.replaceChildren();
  };

  const reportGameOver = (name) => {
    status.textContent = `${name} wins!`;

    const playAgainBtn = createButton('Play Again', 'play-again');
    removePreGameControls();
    buttons.appendChild(playAgainBtn);
  };

  const styleShipSize = (shipElement, row, col, isVertical, length) => {
    if (isVertical) {
      shipElement.classList.add('vertical');
      shipElement.style.gridRow = `${row + 1} / span ${length}`;
      shipElement.style.gridColumn = `${col + 1} / span 1`;
    } else {
      shipElement.classList.remove('vertical');
      shipElement.style.gridRow = `${row + 1} / span 1`;
      shipElement.style.gridColumn = `${col + 1} / span ${length}`;
    }
  };

  const createShipDragImage = (shipElement, isVertical, length) => {
    const dragImage = shipElement.cloneNode(true);
    dragImage.classList.add('drag-image');

    styleShipSize(dragImage, 0, 0, isVertical, length);

    planningBoard.appendChild(dragImage);
  };

  const getShipDragImage = (shipType) =>
    document.querySelector(`.drag-image[data-type="${shipType}"]`);

  const removeShipDragImage = (shipType) => {
    const dragImage = getShipDragImage(shipType);
    dragImage.remove();
  };

  const createShip = (ship) => {
    const shipContainer = document.createElement('div');
    shipContainer.dataset.type = `${ship.getType()}`;
    shipContainer.classList.add('ship-container');
    shipContainer.draggable = true;

    for (let i = 0; i < ship.getLength(); i++) {
      shipContainer.appendChild(document.createElement('div'));
    }

    planningShips.appendChild(shipContainer);
    createShipDragImage(shipContainer, false, ship.getLength());
  };

  const placeShip = (row, col, isVertical, ship) => {
    const shipSelector = `.ship-container[data-type="${ship.getType()}"]:not(.drag-image):not(#insertion-marker)`;
    const shipElement = document.querySelector(shipSelector);

    // When the ship isn't placed on the board yet, (first placement)
    if (!planningBoard.querySelector(shipSelector)) {
      planningBoard.appendChild(shipElement);
    }

    styleShipSize(shipElement, row, col, isVertical, ship.getLength());
    removeShipDragImage(ship.getType());
    createShipDragImage(shipElement, isVertical, ship.getLength());
  };

  const removeDraggableShips = () => {
    document.querySelectorAll('.ship-container').forEach((ele) => {
      ele.remove();
    });
  };

  const createShipInsertionMarker = (shipElement) => {
    const marker = shipElement.cloneNode(true);
    marker.style.opacity = '1';
    marker.id = 'insertion-marker';
    marker.style.display = 'none';

    planningBoard.appendChild(marker);
  };

  const removeShipInsertionMarker = () => {
    document.querySelector('#insertion-marker').remove();
  };

  const resizeMarker = (marker, isVertical, rowEnd, colEnd, length) => {
    const markerEnd = isVertical ? rowEnd : colEnd;
    const maxCells = isVertical ? NUM_OF_ROWS + 1 : NUM_OF_COLUMNS + 1;

    // If the marker's end exceeds the grid, resize the marker
    const markerLength =
      markerEnd > maxCells ? length - (markerEnd - maxCells) : length;

    const markerCells = [];
    for (let i = 0; i < markerLength; i++) {
      markerCells.push(document.createElement('div'));
    }
    marker.replaceChildren(...markerCells);
  };

  const moveShipInsertionMarker = (row, col, isValid, length, isVertical) => {
    const marker = document.querySelector('#insertion-marker');
    marker.style.display = '';

    const computedStyle = window.getComputedStyle(marker);
    const currentRowStart = Number(computedStyle.gridRowStart);
    const currentColStart = Number(computedStyle.gridColumnStart);

    const rowSpan = isVertical ? length : 1;
    const colSpan = !isVertical ? length : 1;

    const rowEnd = row + rowSpan + 1;
    const colEnd = col + colSpan + 1;

    resizeMarker(marker, isVertical, rowEnd, colEnd, length);

    if (row !== currentRowStart - 1) {
      marker.style.gridRow = `${row + 1} / ${Math.min(rowEnd, NUM_OF_ROWS + 1)}`;
    }

    if (col !== currentColStart - 1) {
      marker.style.gridColumn = `${col + 1} / ${Math.min(colEnd, NUM_OF_COLUMNS + 1)}`;
    }

    if (!isValid) {
      marker.classList.add('invalid');
    } else {
      marker.classList.remove('invalid');
    }
  };

  const disableDraggableShipEvents = () => {
    document.querySelectorAll('.ship-container').forEach((ship) => {
      ship.style.pointerEvents = 'none';
    });
  };

  const enableDraggableShipEvents = () => {
    document.querySelectorAll('.ship-container').forEach((ship) => {
      ship.style.pointerEvents = 'auto';
    });
  };

  const activateDragImage = (element) => {
    element.classList.add('active');
  };
  const deactivateDragImage = () => {
    const dragImage = document.querySelector('.drag-image.active');
    if (dragImage !== null) {
      dragImage.classList.remove('active');
    }
  };

  const getActiveDragImageType = () =>
    document.querySelector('.drag-image.active').dataset.type;

  const hideShipInsertionMarker = () => {
    const marker = document.querySelector('#insertion-marker');
    marker.style.display = 'none';
  };

  const returnShip = (ship) => {
    const shipSelector = `.ship-container[data-type="${ship.getType()}"]:not(.drag-image):not(#insertion-marker)`;
    const shipElement = document.querySelector(shipSelector);

    // When the ship isn't placed on the board yet, (first placement)
    if (planningShips.querySelector(shipSelector) === null) {
      planningShips.appendChild(shipElement);
    }

    shipElement.classList.remove('vertical');
    shipElement.style.gridArea = '';

    removeShipDragImage(ship.getType());
    createShipDragImage(shipElement, false, ship.getLength());
  };

  const showGameplayBoards = (player1Name, player2Name) => {
    player1Board.style.display = 'grid';
    player2Board.style.display = 'grid';
    document.querySelector('.gameplay-wrapper').classList.add('active');
    document.querySelector('.player-1 .player-name').textContent = player1Name;
    document.querySelector('.player-2 .player-name').textContent = player2Name;
  };

  const showReadyButton = () => {
    const readyBtn = createButton('Ready', 'ready');
    readyBtn.disabled = true;
    readyBtn.display = 'block';
    buttons.appendChild(readyBtn);
  };

  const enableReadyButton = (name) => {
    document.querySelector('.ready').disabled = false;
    status.textContent = `${name}'s Turn`;
  };

  const disableReadyButton = (name) => {
    document.querySelector('.ready').disabled = true;
    status.textContent = `Waiting for ${name} to attack...`;
  };

  const resetFormFields = () => {
    planningForm.name.value = '';
    computerRadioBtn.checked = true;
    computerRadioBtn.disabled = false;
    playerRadioBtn.disabled = false;
  };

  const disableOpponentField = () => {
    computerRadioBtn.disabled = true;
    playerRadioBtn.disabled = true;
    playerRadioBtn.checked = true;
  };

  const removeFormErrors = (formFieldType) => {
    document.querySelector(`#${formFieldType}`).classList.remove('invalid');
    document.querySelector(`#${formFieldType} + .error`).textContent = '';
  };

  const isFormValid = () =>
    planningForm.name.validity.valid && planningForm.opponent.value !== '';

  const isFieldMarkedInvalid = (formFieldType) =>
    document.querySelector(`#${formFieldType} + .error`).textContent !== '';

  const showFormErrors = (isShipsInvalid) => {
    if (planningForm.name.validity.valueMissing) {
      planningForm.name.classList.add('invalid');
      document.querySelector('#name + .error').textContent =
        'Please fill in required field.';
    }

    if (planningForm.opponent.value === '') {
      document.querySelector('fieldset + .error').textContent =
        'Please fill in required field.';
    }

    if (isShipsInvalid) {
      planningShips.classList.add('invalid');
      document.querySelector('#planning-ships + .error').textContent =
        'Please place all ships onto the board.';
    }
  };

  // Binders below
  const bindGameboard = (handlers) => {
    [player1Board, player2Board].forEach((gameboard) => {
      gameboard.addEventListener('click', (event) => {
        if (event.target.classList.contains('grid-cell')) {
          const isPlayer1Board = event.currentTarget === player1Board;
          const row = event.target.dataset.row;
          const col = event.target.dataset.col;

          handlers.receiveAttack(row, col, isPlayer1Board);
        } else if (event.target.classList.contains('ship-container')) {
          handlers.rotate(event.target.dataset.type);
        }
      });
    });
  };

  const bindButtons = (handlers) => {
    buttons.addEventListener('click', (event) => {
      if (event.target.classList.contains('start-game')) {
        handlers.start();
      } else if (event.target.classList.contains('play-again')) {
        handlers.start();
      } else if (event.target.classList.contains('ready')) {
        handlers.ready();
      }
    });
  };

  const bindDragAndDrop = (handlers) => {
    // Ships
    planningShips.addEventListener('dragstart', handlers.dragStart);
    planningShips.addEventListener('dragend', handlers.dragEnd);
    planningShips.addEventListener('dragover', handlers.dragOver);
    planningShips.addEventListener('drop', handlers.drop);

    // Planning Board
    planningBoard.addEventListener('dragstart', handlers.dragStart);
    planningBoard.addEventListener('dragend', handlers.dragEnd);
    planningBoard.addEventListener('dragover', handlers.dragOver);
    planningBoard.addEventListener('drop', handlers.drop);
    planningBoard.addEventListener('dragleave', handlers.leave);
  };

  const bindModalButtons = (handlers) => {
    planningModal.addEventListener('submit', (event) => {
      handlers.submit(event, {
        name: planningForm.name.value,
        opponent: planningForm.opponent.value,
      });
    });
    planningModal.addEventListener('click', (event) => {
      if (event.target.classList.contains('randomize')) {
        handlers.randomize();
      }
    });
  };

  const bindName = (handler) => {
    document
      .querySelector(`#${FormFieldType.NAME}`)
      .addEventListener('input', handler);
  };

  const bindOpponent = (handler) => {
    document
      .querySelector(`#${FormFieldType.OPPONENT}`)
      .addEventListener('change', handler);
  };

  return {
    activateDragImage,
    bindButtons,
    bindDragAndDrop,
    bindGameboard,
    disableOpponentField,
    bindName,
    bindOpponent,
    removeFormErrors,
    isFieldMarkedInvalid,
    bindModalButtons,
    createShipDragImage,
    createShipInsertionMarker,
    createShip,
    deactivateDragImage,
    hideAllPlayerShips,
    disableDraggableShipEvents,
    enableDraggableShipEvents,
    getActiveDragImageType,
    getShipDragImage,
    showGameplayBoards,
    hideShipInsertionMarker,
    init,
    moveShipInsertionMarker,
    placeShip,
    showFormErrors,
    isFormValid,
    receiveAttack,
    removeDraggableShips,
    removeShipDragImage,
    removeShipInsertionMarker,
    removePreGameControls,
    renderAllPlayerShips,
    renderAllSunkenShips,
    renderSunkenShip,
    resetFormFields,
    reportGameOver,
    showReadyButton,
    resetPlayerBoards,
    returnShip,
    showPlanningModal,
    enableReadyButton,
    disableReadyButton,
  };
}

export function getXYOffsets(ship) {
  const isVertical = ship.classList.contains('vertical');

  // Divide main axis by 2 x number of nodes to get center of the first cell
  const xDenominator = isVertical ? 2 : Number(ship.childElementCount) * 2;
  const yDenominator = !isVertical ? 2 : Number(ship.childElementCount) * 2;

  return {
    offsetX: Number(ship.offsetWidth) / xDenominator,
    offsetY: Number(ship.offsetHeight) / yDenominator,
  };
}
