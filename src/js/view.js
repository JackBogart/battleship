import { NUM_OF_COLUMNS, NUM_OF_ROWS } from './constants';
import { formFieldType, shipType, tileInfoType } from './types';

const planningModal = document.querySelector('.planning-modal');
const planningForm = document.querySelector('.planning-modal > form');
const player1Board = document.querySelector('.player-1.gameboard');
const player2Board = document.querySelector('.player-2.gameboard');
const buttons = document.querySelector('.content .buttons');
const planningShips = document.querySelector(`#${formFieldType.SHIPS}`);
const planningBoard = document.querySelector(`.planning-modal .gameboard`);
const computerRadioBtn = document.querySelector('#computer');
const playerRadioBtn = document.querySelector('#player');
const shipCellColor = getComputedStyle(
  document.documentElement,
).getPropertyValue('--ship-cell-color');

const createButton = function createButton(text, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;

  if (className) {
    button.classList.add(className);
  }

  return button;
};

const forEachGridCell = function forEachGridCell(callback) {
  for (let row = 0; row < NUM_OF_ROWS; row++) {
    for (let col = 0; col < NUM_OF_COLUMNS; col++) {
      callback(row, col);
    }
  }
};

const createGridCell = function createGridCellElement(row, col) {
  const cell = document.createElement('div');
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.classList.add('grid-cell');
  cell.style.gridRow = `${row + 1} / ${row + 2}`;
  cell.style.gridColumn = `${col + 1} / ${col + 2}`;
  return cell;
};

document.querySelectorAll('.gameboard').forEach((grid) => {
  forEachGridCell((row, col) => {
    const gridCell = createGridCell(row, col);
    grid.appendChild(gridCell);
  });
});

const getBoard = function getPlayersBoard(isPlayer1) {
  return isPlayer1 ? player1Board : player2Board;
};

const renderPlayerShips = function renderPlayerShips(isPlayer1, player) {
  const board = getBoard(isPlayer1);

  forEachGridCell((row, col) => {
    const tile = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);

    if (!player.getShip(row, col)) {
      tile.style.backgroundColor = '';
    } else if (!player.getShip(row, col).isSunk()) {
      tile.style.backgroundColor = shipCellColor;
    }
  });
};

const hidePlayerShips = function hidePlayerShips(isPlayer1, player) {
  const board = getBoard(isPlayer1);

  forEachGridCell((row, col) => {
    const tile = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);

    if (player.getShip(row, col) && !player.getShip(row, col).isSunk()) {
      tile.style.backgroundColor = '';
    }
  });
};

const renderSunkenShip = function renderSunkenShip(
  isPlayer1,
  row,
  col,
  isVertical,
  shipLength,
) {
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

const receiveAttack = function renderReceiveAttack(
  row,
  col,
  tileInfo,
  isPlayer1Turn,
) {
  const attackedBoard = isPlayer1Turn ? player2Board : player1Board;
  const tile = attackedBoard.querySelector(
    `[data-row="${row}"][data-col="${col}"]`,
  );
  tile.classList.add(tileInfo === tileInfoType.HIT ? 'hit-cell' : 'miss-cell');
};

const setStatusMessage = function setStatusMessage(msg) {
  document.querySelector('.status').textContent = msg;
};

const resetPlayerBoards = function resetAllPlayerBoards() {
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

const setGameplayButtons = function setGameplayButtons(...gameButtons) {
  buttons.replaceChildren(...gameButtons);
};

const setShipSize = function setShipContainerSize(
  shipElement,
  row,
  col,
  isVertical,
  length,
) {
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

const createShipDragImage = function createShipDragImage(
  shipElement,
  isVertical,
  length,
) {
  const dragImage = shipElement.cloneNode(true);
  dragImage.classList.add('drag-image');

  setShipSize(dragImage, 0, 0, isVertical, length);

  planningBoard.appendChild(dragImage);
};

const getShipDragImage = function getShipDragImage(shipType) {
  return document.querySelector(`.drag-image[data-type="${shipType}"]`);
};

const createShip = function createShipContainer(type, length) {
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

const placeShip = function placeShipContainer(
  row,
  col,
  isVertical,
  type,
  length,
) {
  const shipSelector = `.planning-ship[data-type="${type}"]`;
  const shipElement = document.querySelector(shipSelector);

  // When the ship isn't placed on the board yet, (first placement)
  if (!planningBoard.querySelector(shipSelector)) {
    planningBoard.appendChild(shipElement);
  }

  setShipSize(shipElement, row, col, isVertical, length);
  setShipSize(getShipDragImage(type), 0, 0, isVertical, length);
};

const removeDraggableShips = function removeDraggableShips() {
  document.querySelectorAll('.ship-container').forEach((ele) => {
    ele.remove();
  });
};

const createShipInsertionMarker = function createShipInsertionMarker(
  shipElement,
) {
  const marker = shipElement.cloneNode(true);
  marker.id = 'insertion-marker';
  marker.style.display = 'none';
  marker.draggable = false;
  marker.classList.remove('planning-ship');

  planningBoard.appendChild(marker);
};

const setInsertionMarkerSize = function setShipInsertionMarkerSize(
  marker,
  isVertical,
  rowEnd,
  colEnd,
  length,
) {
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

const moveShipInsertionMarker = function moveShipInsertionMarker(
  row,
  col,
  isValid,
  length,
  isVertical,
) {
  const marker = document.querySelector('#insertion-marker');
  marker.style.display = '';

  const computedStyle = window.getComputedStyle(marker);
  const currentRowStart = Number(computedStyle.gridRowStart);
  const currentColStart = Number(computedStyle.gridColumnStart);

  const rowSpan = isVertical ? length : 1;
  const colSpan = !isVertical ? length : 1;

  const rowEnd = row + rowSpan + 1;
  const colEnd = col + colSpan + 1;

  setInsertionMarkerSize(marker, isVertical, rowEnd, colEnd, length);

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

const getActiveDragImage = function getActiveDragImage() {
  return document.querySelector('.drag-image.active');
};

const getActiveDragImageType = function getActiveDragImageType() {
  const dragImage = getActiveDragImage();
  return dragImage ? dragImage.dataset.type : null;
};

const hideShipInsertionMarker = function hideShipInsertionMarker() {
  const marker = document.querySelector('#insertion-marker');
  marker.style.display = 'none';
};

const returnShip = function returnShipToSelectionArea(type, length) {
  const shipSelector = `.planning-ship[data-type="${type}"]`;
  const shipElement = document.querySelector(shipSelector);

  // When the ship isn't placed on the board yet, (first placement)
  if (planningShips.querySelector(!shipSelector)) {
    planningShips.appendChild(shipElement);
  }

  shipElement.classList.remove('vertical');
  shipElement.style.gridArea = '';
  setShipSize(getActiveDragImage(), 0, 0, false, length);
};

const showGameplayBoards = function showGameplayBoards(
  player1Name,
  player2Name,
) {
  player1Board.style.display = 'grid';
  player2Board.style.display = 'grid';
  document.querySelector('.gameplay-wrapper').classList.add('active');
  document.querySelector('.player-1.player-name').textContent = player1Name;
  document.querySelector('.player-2.player-name').textContent = player2Name;
};

const setStatusPlayersTurn = function setStatusPlayersTurn(name) {
  setStatusMessage(`${name}'s Turn`);
};

const resetFormFields = function resetFormFields() {
  planningForm.name.value = '';
  computerRadioBtn.checked = true;
  computerRadioBtn.disabled = false;
  playerRadioBtn.disabled = false;
};

const disableOpponentField = function disableOpponentField() {
  playerRadioBtn.checked = true;
  computerRadioBtn.disabled = true;
  playerRadioBtn.disabled = true;
};

const removeFormErrors = function removeFormErrors(formFieldType) {
  document.querySelector(`#${formFieldType}`).classList.remove('invalid');
  document.querySelector(`#${formFieldType} + .error`).textContent = '';
};

const isFormValid = function isFormValid() {
  return planningForm.name.validity.valid && planningForm.opponent.value !== '';
};

const isFieldMarkedInvalid = function isFieldMarkedInvalid(formFieldType) {
  return (
    document.querySelector(`#${formFieldType} + .error`).textContent !== ''
  );
};

const showFormErrors = function showFormErrors(isShipsInvalid) {
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

const getFormData = function getFormData() {
  return {
    name: planningForm.name.value,
    opponent: planningForm.opponent.value,
  };
};

const renderGameOver = function renderGameOver(isPlayer1, attackingPlayer) {
  setStatusMessage(`${attackingPlayer.getName()} wins!`);
  setGameplayButtons(createButton('Play Again', 'play-again'));

  renderPlayerShips(isPlayer1, attackingPlayer);
};

const resetPlanningFormData = function resetPlanningFormData() {
  resetFormFields();
  removeDraggableShips();
};

const resetPlanningModal = function resetPlanningModal() {
  resetPlanningFormData();

  for (const shipInfo of Object.values(shipType)) {
    createShip(shipInfo.type, shipInfo.length);
  }
};

const renderPlayer1PlanningForm = function renderPlayer1PlanningForm() {
  resetPlanningModal();
  planningModal.showModal();
};

const renderPlayer2PlanningForm = function renderPlayer2PlanningForm() {
  resetPlanningModal();
  disableOpponentField();
};

const renderGameplayBoards = function renderGameplayBoards(
  player1Name,
  player2Name,
) {
  setStatusMessage('');
  resetPlayerBoards();
  resetPlanningFormData();
  showGameplayBoards(player1Name, player2Name);
};

const renderComputerGame = function renderComputerGame(
  player1,
  player1Name,
  player2Name,
) {
  renderGameplayBoards(player1Name, player2Name);
  renderPlayerShips(true, player1);
  setGameplayButtons();
};

const renderPlayerGame = function renderPlayerGame(player1Name, player2Name) {
  renderGameplayBoards(player1Name, player2Name);
  setGameplayButtons(createButton('Ready', 'ready'));
  setStatusPlayersTurn(player1Name);
};

const renderReadyView = function renderReadyView(
  isPlayer1,
  attackingPlayer,
  attackedPlayerName,
) {
  document.querySelector('.ready').disabled = false;
  setStatusPlayersTurn(attackedPlayerName);
  hidePlayerShips(isPlayer1, attackingPlayer);
};

const renderActivePlayer = function renderActivePlayer(isPlayer1Turn, player) {
  document.querySelector('.ready').disabled = true;
  setStatusMessage(`Waiting for ${player.getName()} to attack...`);
  renderPlayerShips(isPlayer1Turn, player);
};

const renderShipDragStart = function renderShipDragStart(
  shipContainer,
  dragImage,
) {
  createShipInsertionMarker(shipContainer);

  document.querySelectorAll('.ship-container').forEach((ship) => {
    ship.style.pointerEvents = 'none';
  });
  dragImage.classList.add('active');
};

const renderShipDragEnd = function renderShipDragEnd() {
  document.querySelectorAll('.ship-container').forEach((ship) => {
    ship.style.pointerEvents = 'auto';
  });
  document.querySelector('#insertion-marker').remove();
  getActiveDragImage().classList.remove('active');
};

// Binders below
const bindGameboards = function bindGameboardsHandlers(handlers) {
  [player1Board, player2Board].forEach((gameboard) => {
    gameboard.addEventListener('click', (event) => {
      if (event.target.classList.contains('grid-cell')) {
        handlers.receiveAttack(event);
      }
    });
  });

  planningBoard.addEventListener('click', (event) => {
    if (event.target.classList.contains('ship-container')) {
      handlers.rotate(event);
    }
  });
};

const bindButtons = function bindGameplayButtonHandlers(handlers) {
  buttons.addEventListener('click', (event) => {
    if (
      event.target.classList.contains('start-game') ||
      event.target.classList.contains('play-again')
    ) {
      handlers.start();
    } else if (event.target.classList.contains('ready')) {
      handlers.ready();
    }
  });
};

const bindDragAndDrop = function bindDragAndDropHandlers(handlers) {
  // Ships
  planningShips.addEventListener('dragover', handlers.shipsDragoverHandler);

  // Planning Board
  planningBoard.addEventListener('dragleave', handlers.dragleaveHandler);
  planningBoard.addEventListener('dragover', (event) => {
    if (event.target.classList.contains('gameboard')) {
      handlers.gapDragoverHandler();
    } else if (event.target.classList.contains('grid-cell')) {
      handlers.gridCellDragoverHandler(event);
    }
  });

  // Planning Modal
  planningModal.addEventListener('dragstart', (event) => {
    if (
      event.target.tagName === 'DIV' &&
      event.target.classList.contains('ship-container')
    ) {
      handlers.dragstartHandler(event);
    }
  });
  planningModal.addEventListener('dragend', (event) => {
    if (
      event.target.tagName === 'DIV' &&
      event.target.classList.contains('ship-container')
    ) {
      handlers.dragendHandler();
    }
  });
  planningModal.addEventListener('drop', (event) => {
    if (event.target.classList.contains('grid-cell')) {
      handlers.boardDropHandler(event);
    } else if (event.target.id === `${formFieldType.SHIPS}`) {
      handlers.shipsDropHandler(event);
    }
  });
};

const bindModalButtons = function bindModalButtonHandlers(handlers) {
  planningModal.addEventListener('submit', (event) => {
    handlers.submit(event);
  });

  planningModal.addEventListener('click', (event) => {
    if (event.target.classList.contains('randomize')) {
      handlers.randomize();
    }
  });
};

const bindNameField = function bindNameFieldHandler(handler) {
  document
    .querySelector(`#${formFieldType.NAME}`)
    .addEventListener('input', handler);
};

const bindOpponentField = function bindOpponentFieldHandler(handler) {
  document
    .querySelector(`#${formFieldType.OPPONENT}`)
    .addEventListener('change', handler);
};

export const view = {
  bindButtons,
  bindDragAndDrop,
  bindGameboards,
  bindNameField,
  bindOpponentField,
  removeFormErrors,
  isFieldMarkedInvalid,
  bindModalButtons,
  getActiveDragImageType,
  getShipDragImage,
  hideShipInsertionMarker,
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
  getFormData,
};

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
