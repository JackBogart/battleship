import { SHIP_TYPES } from './constants';
import { createComputerPlayer, createPlayer } from './model/player';
import { createShip } from './model/ship';
import { formFieldType, playerType, shipType, tileInfoType } from './types';
import { getRandomInt } from './utils/random';
import { getXYOffsets, view } from './view';

let player1, player2;
let isGameInProgress = false;
let isPlayer1Turn = true;

const getPlayer = function getPlayer(isPlayer1) {
  return isPlayer1 ? player1 : player2;
};

/**
 * Handles the logic of a player attacking during their turn. This includes
 * updating the models and updating the view. Additionally if a ship is sunk
 * or the game is over, it'll report that on the view and update internal
 * logic to prevent further moves.
 *
 * @param {Object} attackedPlayer - The player being attacked
 * @param {number} row - The row being attacked
 * @param {number} col - The column being attacked
 */
const playerTurn = function playerTurn(attackedPlayer, row, col) {
  const attackingPlayer = getPlayer(isPlayer1Turn);
  attackedPlayer.receiveAttack(row, col);

  const attackedTile = attackedPlayer.getTileInfo(row, col);
  view.receiveAttack(row, col, attackedTile, isPlayer1Turn);

  if (
    attackedTile === tileInfoType.HIT &&
    attackedPlayer.getShip(row, col).isSunk()
  ) {
    const ship = attackedPlayer.getShip(row, col);
    const positionData = attackedPlayer.getInitialPosition(ship.getType());

    view.renderSunkenShip(
      !isPlayer1Turn,
      positionData.row,
      positionData.col,
      positionData.isVertical,
      ship.getLength(),
    );
  }

  if (attackedPlayer.isFleetSunk()) {
    view.renderGameOver(isPlayer1Turn, attackingPlayer);
    isGameInProgress = false;
  }

  isPlayer1Turn = !isPlayer1Turn;
};

const placeShipRandomly = function placeShipRandomly(player, ship) {
  let row = getRandomInt(10);
  let col = getRandomInt(10);
  let isVertical = getRandomInt(2) === 0;

  while (!player.isValidPlacement(ship, row, col, isVertical)) {
    row = getRandomInt(10);
    col = getRandomInt(10);
    isVertical = getRandomInt(2) === 0;
  }

  player.setShip(ship, row, col, isVertical);
  view.placeShip(row, col, isVertical, ship.getType(), ship.getLength());
};

const randomizeBoard = (player) => {
  for (const shipInfo of Object.values(shipType)) {
    placeShipRandomly(player, createShip(shipInfo.type));
  }
};

/**
 * Handler function for a board being attacked. It will take the coordinates
 * of the tile being attacked, along with a boolean that represents if it's
 * player 1 being attacked.
 *
 * @param {number} row - The row being attacked
 * @param {number} col - The column being attacked
 * @param {boolean} isPlayer1Attacked - true if player 1 is being attacked
 */
const receiveAttackHandler = function receiveAttackHandler(event) {
  const isPlayer1Attacked = event.currentTarget.classList.contains('player-1');
  const row = event.target.dataset.row;
  const col = event.target.dataset.col;

  const isPlayer2Computer = player2.getType() === playerType.COMPUTER;
  if (
    (isPlayer1Attacked && isPlayer2Computer) ||
    isPlayer1Attacked === isPlayer1Turn ||
    !isGameInProgress
  ) {
    return;
  }
  const attackedPlayer = getPlayer(isPlayer1Attacked);

  if (attackedPlayer.getTileInfo(row, col) !== tileInfoType.UNKNOWN) {
    return;
  }

  playerTurn(attackedPlayer, row, col);

  // If attacked player's entire fleet is sunk, end game
  if (!isGameInProgress) {
    return;
  }

  if (isPlayer2Computer) {
    const [computerRow, computerCol] = player2.getComputerAttack(
      player1.getInfoBoard(),
    );
    playerTurn(player1, computerRow, computerCol);

    const attackedShip = player1.getShip(computerRow, computerCol);
    player2.updateLastAttack(
      computerRow,
      computerCol,
      attackedShip && attackedShip.isSunk(),
      player1.getInfoBoard(),
    );
  } else {
    const attackingPlayer = getPlayer(!isPlayer1Turn);
    view.renderReadyView(
      !isPlayer1Turn,
      attackingPlayer,
      attackedPlayer.getName(),
    );
    isGameInProgress = false;
  }
};

const randomizeShipsHandler = function randomizeShipsHandler() {
  const player = getPlayer(isPlayer1Turn);
  player.removeAllShips();
  randomizeBoard(player);

  if (view.isFieldMarkedInvalid(formFieldType.SHIPS)) {
    view.removeFormErrors(formFieldType.SHIPS);
  }
};

const startGameHandler = function startGameHandler() {
  view.renderPlayer1PlanningForm();
  player1 = createPlayer('Player', playerType.HUMAN);
  player2 = undefined;
  isPlayer1Turn = true;
};

const dragstartHandler = function dragstartHandler(event) {
  const shipContainer = event.target;
  const { offsetX, offsetY } = getXYOffsets(shipContainer);
  const dragImage = view.getShipDragImage(shipContainer.dataset.type);

  event.dataTransfer.setData('text/plain', shipContainer.dataset.type);
  event.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
  event.dataTransfer.dropEffect = 'move';

  // This sucks. This is a workaround due to a long existing bug in chrome.
  // If you manipulate DOM nodes during the 'dragstart' event, chrome
  // immediately fires the 'dragend' event. It's ridiculous that this
  // issue exists at least as far back as 2013. The drag and drop API spec
  // is awful in general. https://stackoverflow.com/questions/11927309
  setTimeout(() => {
    view.renderShipDragStart(shipContainer, dragImage);
  }, 0);
};

const dragendHandler = function dragendHandler() {
  view.renderShipDragEnd();
};

const shipsDragoverHandler = function shipsDragoverHandler(event) {
  const shipType = view.getActiveDragImageType();
  if (!shipType) {
    return;
  }

  event.preventDefault();
};

const gapDragoverHandler = function boardGapDragoverHandler() {
  const shipType = view.getActiveDragImageType();
  if (!shipType) {
    return;
  }

  view.hideShipInsertionMarker();
};

const gridCellDragoverHandler = function gridCellDragoverHandler(event) {
  const shipType = view.getActiveDragImageType();
  if (!shipType) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  const player = getPlayer(isPlayer1Turn);
  const newRow = Number(event.target.dataset.row);
  const newCol = Number(event.target.dataset.col);
  const positionData = player.getInitialPosition(shipType);
  let ship, isVertical;

  if (!positionData) {
    ship = createShip(shipType);
    isVertical = false;
  } else {
    ship = player.getShip(positionData.row, positionData.col);
    isVertical = positionData.isVertical;
  }
  const isValid = player.isValidPlacement(ship, newRow, newCol, isVertical);

  view.moveShipInsertionMarker(
    newRow,
    newCol,
    isValid,
    ship.getLength(),
    isVertical,
  );
};

const dragleaveHandler = function dragleaveHandler() {
  if (!view.getActiveDragImageType()) {
    return;
  }

  view.hideShipInsertionMarker();
};

const boardDropHandler = function boardDropHandler(event) {
  const shipType = event.dataTransfer.getData('text/plain');
  if (!SHIP_TYPES.includes(shipType)) {
    return;
  }

  event.preventDefault();

  const player = getPlayer(isPlayer1Turn);
  const positionData = player.getInitialPosition(shipType);
  const newRow = Number(event.target.dataset.row);
  const newCol = Number(event.target.dataset.col);
  let ship, isVertical;

  // If new ship, else move existing ship
  if (!positionData) {
    ship = createShip(shipType);
    isVertical = false;
  } else {
    ship = player.getShip(positionData.row, positionData.col);
    isVertical = positionData.isVertical;
  }

  if (player.isValidPlacement(ship, newRow, newCol, isVertical)) {
    if (positionData) {
      player.removeShip(positionData.row, positionData.col);
    }
    player.setShip(ship, newRow, newCol, isVertical);
    view.placeShip(
      newRow,
      newCol,
      isVertical,
      ship.getType(),
      ship.getLength(),
    );

    if (
      player.getAllShips().length === 5 &&
      view.isFieldMarkedInvalid(formFieldType.SHIPS)
    ) {
      view.removeFormErrors(formFieldType.SHIPS);
    }
  }
};

const shipsDropHandler = function shipsDropHandler(event) {
  const shipType = event.dataTransfer.getData('text/plain');
  if (!SHIP_TYPES.includes(shipType)) {
    return;
  }

  event.preventDefault();

  const player = getPlayer(isPlayer1Turn);
  const positionData = player.getInitialPosition(shipType);

  // Only need to 'return' ship if it's been placed previously
  if (positionData) {
    const ship = createShip(shipType);
    player.removeShip(positionData.row, positionData.col);
    view.returnShip(ship.getType(), ship.getLength());
  }
};

const rotateShipHandler = function rotateShipHandler(event) {
  const shipType = event.target.dataset.type;
  const player = getPlayer(isPlayer1Turn);
  const { row, col, isVertical } = player.getInitialPosition(shipType);
  const ship = player.getShip(row, col);

  if (player.isValidPlacement(ship, row, col, !isVertical)) {
    player.removeShip(row, col);
    player.setShip(ship, row, col, !isVertical);
    view.placeShip(row, col, !isVertical, ship.getType(), ship.getLength());
  }
};

const submitHandler = function submitHandler(event) {
  const { name, opponent } = view.getFormData();
  const player = getPlayer(isPlayer1Turn);

  if (view.isFormValid() && player.getAllShips().length === 5) {
    player.setName(name);

    if (opponent === 'computer') {
      isGameInProgress = true;
      player2 = createComputerPlayer();
      randomizeBoard(player2);
      view.renderComputerGame(player1, player1.getName(), player2.getName());
    } else {
      isPlayer1Turn = !isPlayer1Turn;

      // When player 1 submits, player2 is undefined
      if (!player2) {
        player2 = createPlayer('Player', playerType.HUMAN);
        view.renderPlayer2PlanningForm();
        event.preventDefault();
      } else {
        view.renderPlayerGame(player1.getName(), player2.getName());
      }
    }
  } else {
    view.showFormErrors(player.getAllShips().length !== 5);
    event.preventDefault();
  }
};

const nameInputHandler = function nameInputHandler() {
  if (view.isFieldMarkedInvalid(formFieldType.NAME)) {
    view.removeFormErrors(formFieldType.NAME);
  }
};

const opponentInputHandler = function opponentInputHandler() {
  if (view.isFieldMarkedInvalid(formFieldType.OPPONENT)) {
    view.removeFormErrors(formFieldType.OPPONENT);
  }
};

const readyHandler = function readyHandler() {
  const player = getPlayer(isPlayer1Turn);
  view.renderActivePlayer(isPlayer1Turn, player);
  isGameInProgress = true;
};

const darkModeHandler = function darkModeToggleHandler() {
  const newTheme = view.isDarkModeToggled() ? 'dark' : 'light';
  view.setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
};

const run = function run() {
  // Gameboard interactions
  view.bindGameboards({
    receiveAttack: receiveAttackHandler,
    rotate: rotateShipHandler,
  });

  // Button interactions
  view.bindButtons({
    start: startGameHandler,
    ready: readyHandler,
  });

  // Drag-and-drop interactions
  view.bindDragAndDrop({
    dragstartHandler,
    dragendHandler,
    gapDragoverHandler,
    gridCellDragoverHandler,
    boardDropHandler,
    shipsDropHandler,
    dragleaveHandler,
    shipsDragoverHandler,
  });

  // Modal interactions
  view.bindModalButtons({
    randomize: randomizeShipsHandler,
    submit: submitHandler,
  });

  // Form inputs
  view.bindNameField(nameInputHandler);
  view.bindOpponentField(opponentInputHandler);

  // Dark mode toggle
  view.bindDarkModeToggle(darkModeHandler);

  const theme = localStorage.getItem('theme');
  if (!theme) {
    localStorage.setItem('theme', 'light');
  } else if (theme === 'dark') {
    view.toggleDarkMode();
  }
};

export const controller = { run };
