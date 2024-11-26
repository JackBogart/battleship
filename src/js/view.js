import { NUM_OF_COLUMNS, NUM_OF_ROWS } from './constants';
import { FormFieldType, ShipType, TileInfoType } from './types';

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
  const buttons = document.querySelector('.content .buttons');
  const planningShips = document.querySelector(`#${FormFieldType.SHIPS}`);
  const planningBoard = document.querySelector(`.planning-modal .gameboard`);
  const computerRadioBtn = document.querySelector('#computer');
  const playerRadioBtn = document.querySelector('#player');
  const shipCellColor = getComputedStyle(
    document.documentElement,
  ).getPropertyValue('--ship-cell-color');

  const forEachGridCell = (callback) => {
    for (let row = 0; row < NUM_OF_ROWS; row++) {
      for (let col = 0; col < NUM_OF_COLUMNS; col++) {
        callback(row, col);
      }
    }
  };

  const createGridCell = (row, col) => {
    const cell = document.createElement('div');
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.classList.add('grid-cell');
    cell.style.gridRow = `${row + 1} / ${row + 2}`;
    cell.style.gridColumn = `${col + 1} / ${col + 2}`;
    return cell;
  };

  const initializeBoards = () => {
    document.querySelectorAll('.gameboard').forEach((grid) => {
      forEachGridCell((row, col) => {
        const gridCell = createGridCell(row, col);
        grid.appendChild(gridCell);
      });
    });
  };

  const getBoard = (isPlayer1) => (isPlayer1 ? player1Board : player2Board);

  const renderPlayerShips = (isPlayer1, player) => {
    const board = getBoard(isPlayer1);

    forEachGridCell((row, col) => {
      const tile = board.querySelector(
        `[data-row="${row}"][data-col="${col}"]`,
      );

      if (!player.getShip(row, col)) {
        tile.style.backgroundColor = '';
      } else if (!player.getShip(row, col).isSunk()) {
        tile.style.backgroundColor = shipCellColor;
      }
    });
  };

  const hidePlayerShips = (isPlayer1, player) => {
    const board = getBoard(isPlayer1);

    forEachGridCell((row, col) => {
      const tile = board.querySelector(
        `[data-row="${row}"][data-col="${col}"]`,
      );

      if (player.getShip(row, col) && !player.getShip(row, col).isSunk()) {
        tile.style.backgroundColor = '';
      }
    });
  };

  const renderSunkenShip = (isPlayer1, row, col, isVertical, shipLength) => {
    const board = getBoard(isPlayer1);

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

  const updateStatusMessage = (msg) => {
    document.querySelector('.status').textContent = msg;
  };

  const resetPlayerBoards = () => {
    const playerBoards = [player1Board, player2Board];

    forEachGridCell((row, col) => {
      playerBoards.forEach((board) => {
        const tile = board.querySelector(
          `[data-row="${row}"][data-col="${col}"]`,
        );
        tile.style.backgroundColor = '';
        tile.classList = 'grid-cell';
      });
    });
  };

  const updateGameplayButtons = (...gameButtons) => {
    buttons.replaceChildren(...gameButtons);
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

  const createShip = (type, length) => {
    const shipContainer = document.createElement('div');
    shipContainer.dataset.type = `${type}`;
    shipContainer.classList.add('ship-container');

    for (let i = 0; i < length; i++) {
      shipContainer.appendChild(document.createElement('div'));
    }
    createShipDragImage(shipContainer, false, length);

    shipContainer.draggable = true;
    shipContainer.classList.add('planning-ship');
    planningShips.appendChild(shipContainer);
  };

  const placeShip = (row, col, isVertical, type, length) => {
    const shipSelector = `.planning-ship[data-type="${type}"]`;
    const shipElement = document.querySelector(shipSelector);

    // When the ship isn't placed on the board yet, (first placement)
    if (!planningBoard.querySelector(shipSelector)) {
      planningBoard.appendChild(shipElement);
    }

    styleShipSize(shipElement, row, col, isVertical, length);
    styleShipSize(getShipDragImage(type), 0, 0, isVertical, length);
  };

  const removeDraggableShips = () => {
    document.querySelectorAll('.ship-container').forEach((ele) => {
      ele.remove();
    });
  };

  const createShipInsertionMarker = (shipElement) => {
    const marker = shipElement.cloneNode(true);
    marker.id = 'insertion-marker';
    marker.style.display = 'none';
    marker.draggable = false;
    marker.classList.remove('planning-ship');

    planningBoard.appendChild(marker);
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

  const getActiveDragImage = () => document.querySelector('.drag-image.active');

  const getActiveDragImageType = () => {
    const dragImage = getActiveDragImage();
    return dragImage ? dragImage.dataset.type : null;
  };

  const hideShipInsertionMarker = () => {
    const marker = document.querySelector('#insertion-marker');
    marker.style.display = 'none';
  };

  const returnShip = (type, length) => {
    const shipSelector = `.planning-ship[data-type="${type}"]`;
    const shipElement = document.querySelector(shipSelector);

    // When the ship isn't placed on the board yet, (first placement)
    if (planningShips.querySelector(shipSelector) === null) {
      planningShips.appendChild(shipElement);
    }

    shipElement.classList.remove('vertical');
    shipElement.style.gridArea = '';
    styleShipSize(getActiveDragImage(), 0, 0, false, length);
  };

  const showGameplayBoards = (player1Name, player2Name) => {
    player1Board.style.display = 'grid';
    player2Board.style.display = 'grid';
    document.querySelector('.gameplay-wrapper').classList.add('active');
    document.querySelector('.player-1 .player-name').textContent = player1Name;
    document.querySelector('.player-2 .player-name').textContent = player2Name;
  };

  const setStatusPlayersTurn = (name) => {
    updateStatusMessage(`${name}'s Turn`);
  };

  const resetFormFields = () => {
    planningForm.name.value = '';
    computerRadioBtn.checked = true;
    computerRadioBtn.disabled = false;
    playerRadioBtn.disabled = false;
  };

  const disableOpponentField = () => {
    playerRadioBtn.checked = true;
    computerRadioBtn.disabled = true;
    playerRadioBtn.disabled = true;
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

  const renderGameOver = (isPlayer1, attackingPlayer) => {
    updateStatusMessage(`${attackingPlayer.getName()} wins!`);
    updateGameplayButtons(createButton('Play Again', 'play-again'));

    renderPlayerShips(isPlayer1, attackingPlayer);
  };

  const resetPlanningFormData = () => {
    resetFormFields();
    removeDraggableShips();
  };

  const resetPlanningModal = () => {
    resetPlanningFormData();

    for (const shipInfo of Object.values(ShipType)) {
      createShip(shipInfo.type, shipInfo.length);
    }
  };

  const renderPlayer1PlanningForm = () => {
    resetPlanningModal();
    planningModal.showModal();
  };

  const renderPlayer2PlanningForm = () => {
    resetPlanningModal();
    disableOpponentField();
  };

  const renderGameplayBoards = (player1Name, player2Name) => {
    updateStatusMessage('');
    resetPlayerBoards();
    resetPlanningFormData();
    showGameplayBoards(player1Name, player2Name);
  };

  const renderComputerGame = (player1, player1Name, player2Name) => {
    renderGameplayBoards(player1Name, player2Name);
    renderPlayerShips(true, player1);
    updateGameplayButtons();
  };

  const renderPlayerGame = (player1Name, player2Name) => {
    renderGameplayBoards(player1Name, player2Name);
    updateGameplayButtons(createButton('Ready', 'ready'));
    setStatusPlayersTurn(player1Name);
  };

  const renderReadyView = (isPlayer1, attackingPlayer, attackedPlayerName) => {
    document.querySelector('.ready').disabled = false;
    setStatusPlayersTurn(attackedPlayerName);
    hidePlayerShips(isPlayer1, attackingPlayer);
  };

  const renderActivePlayer = (isPlayer1Turn, player) => {
    document.querySelector('.ready').disabled = true;
    updateStatusMessage(`Waiting for ${player.getName()} to attack...`);
    renderPlayerShips(isPlayer1Turn, player);
  };

  const renderShipDragStart = (shipContainer, dragImage) => {
    createShipInsertionMarker(shipContainer);

    document.querySelectorAll('.ship-container').forEach((ship) => {
      ship.style.pointerEvents = 'none';
    });
    dragImage.classList.add('active');
  };

  const renderShipDragEnd = () => {
    document.querySelectorAll('.ship-container').forEach((ship) => {
      ship.style.pointerEvents = 'auto';
    });
    document.querySelector('#insertion-marker').remove();
    getActiveDragImage().classList.remove('active');
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
        }
      });
    });

    planningBoard.addEventListener('click', (event) => {
      if (event.target.classList.contains('ship-container')) {
        handlers.rotate(event.target.dataset.type);
      }
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
      handlers.submit(
        event,
        planningForm.name.value,
        planningForm.opponent.value,
      );
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
    bindButtons,
    bindDragAndDrop,
    bindGameboard,
    bindName,
    bindOpponent,
    removeFormErrors,
    isFieldMarkedInvalid,
    bindModalButtons,
    getActiveDragImageType,
    getShipDragImage,
    hideShipInsertionMarker,
    initializeBoards,
    moveShipInsertionMarker,
    placeShip,
    showFormErrors,
    isFormValid,
    receiveAttack,
    renderSunkenShip,
    returnShip,
    renderGameOver,
    renderPlayer1PlanningForm,
    renderPlayer2PlanningForm,
    renderComputerGame,
    renderPlayerGame,
    renderReadyView,
    renderActivePlayer,
    renderShipDragStart,
    renderShipDragEnd,
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
