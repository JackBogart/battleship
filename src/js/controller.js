import { SHIP_TYPES } from './constants';
import { createComputerPlayer, createPlayer } from './model/player';
import { createShip } from './model/ship';
import { FormFieldType, PlayerType, ShipType, TileInfoType } from './types';
import { getRandomInt } from './utils/random';
import { createView, getXYOffsets } from './view';

export function createController() {
  const view = createView();
  let player1, player2;
  let isGameInProgress = false;
  let isPlayer1Turn = true;

  const getPlayer = (isPlayer1) => (isPlayer1 ? player1 : player2);

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
  const playerTurn = (attackedPlayer, row, col) => {
    const attackingPlayer = getPlayer(isPlayer1Turn);
    attackedPlayer.receiveAttack(row, col);

    const attackedTile = attackedPlayer.getTileInfo(row, col);
    view.receiveAttack(row, col, attackedTile, isPlayer1Turn);

    if (
      attackedTile === TileInfoType.HIT &&
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

  const placeShipRandomly = (player, ship) => {
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
    for (const shipInfo of Object.values(ShipType)) {
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
  const receiveAttackHandler = (row, col, isPlayer1Attacked) => {
    const isPlayer2Computer = player2.getType() === PlayerType.COMPUTER;
    if (
      (isPlayer1Attacked && isPlayer2Computer) ||
      isPlayer1Attacked === isPlayer1Turn ||
      !isGameInProgress
    ) {
      return;
    }
    const attackedPlayer = getPlayer(isPlayer1Attacked);

    if (attackedPlayer.getTileInfo(row, col) !== TileInfoType.UNKNOWN) {
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
      player2.updateLastAttack(computerRow, computerCol);
      playerTurn(player1, computerRow, computerCol);
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

  const handleRandomizeShips = () => {
    const player = getPlayer(isPlayer1Turn);
    player.removeAllShips();
    randomizeBoard(player);

    if (view.isFieldMarkedInvalid(FormFieldType.SHIPS)) {
      view.removeFormErrors(FormFieldType.SHIPS);
    }
  };

  const handleStartGame = () => {
    view.renderPlayer1PlanningForm();
    player1 = createPlayer('Player', PlayerType.HUMAN);
    player2 = undefined;
    isPlayer1Turn = true;
  };

  const dragstartHandler = (event) => {
    if (event.target.classList.contains('ship-container')) {
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
    }
  };

  const dragendHandler = (event) => {
    if (event.target.classList.contains('ship-container')) {
      view.renderShipDragEnd();
    }
  };

  const dragoverHandler = (event) => {
    const shipType = view.getActiveDragImageType();
    if (!shipType) {
      return;
    }

    event.preventDefault();

    if (event.target.classList.contains('grid-cell')) {
      event.dataTransfer.dropEffect = 'move';

      const player = getPlayer(isPlayer1Turn);
      const newRow = Number(event.target.dataset.row);
      const newCol = Number(event.target.dataset.col);
      const positionData = player.getInitialPosition(shipType);
      let ship, isVertical;

      if (positionData === undefined) {
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
    } else {
      view.hideShipInsertionMarker();
    }
  };

  const dragleaveHandler = () => {
    if (!view.getActiveDragImageType()) {
      return;
    }

    view.hideShipInsertionMarker();
  };

  const dropHandler = (event) => {
    const shipType = event.dataTransfer.getData('text/plain');
    if (!SHIP_TYPES.includes(shipType)) {
      return;
    }

    event.preventDefault();
    const player = getPlayer(isPlayer1Turn);
    const positionData = player.getInitialPosition(shipType);

    if (event.target.classList.contains('grid-cell')) {
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
          view.isFieldMarkedInvalid(FormFieldType.SHIPS)
        ) {
          view.removeFormErrors(FormFieldType.SHIPS);
        }
      }
    } else if (event.target.id === FormFieldType.SHIPS && positionData) {
      const ship = createShip(shipType);
      player.removeShip(positionData.row, positionData.col);
      view.returnShip(ship.getType(), ship.getLength());
    }
  };

  const rotateShipHandler = (shipType) => {
    const player = getPlayer(isPlayer1Turn);
    const { row, col, isVertical } = player.getInitialPosition(shipType);
    const ship = player.getShip(row, col);

    if (player.isValidPlacement(ship, row, col, !isVertical)) {
      player.removeShip(row, col);
      player.setShip(ship, row, col, !isVertical);
      view.placeShip(row, col, !isVertical, ship.getType(), ship.getLength());
    }
  };

  const submitHandler = (event, name, opponent) => {
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
          player2 = createPlayer('Player', PlayerType.HUMAN);
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

  const nameInputHandler = () => {
    if (view.isFieldMarkedInvalid(FormFieldType.NAME)) {
      view.removeFormErrors(FormFieldType.NAME);
    }
  };

  const opponentInputHandler = () => {
    if (view.isFieldMarkedInvalid(FormFieldType.OPPONENT)) {
      view.removeFormErrors(FormFieldType.OPPONENT);
    }
  };

  const readyHandler = () => {
    const player = getPlayer(isPlayer1Turn);
    view.renderActivePlayer(isPlayer1Turn, player);
    isGameInProgress = true;
  };

  const run = () => {
    view.initializeBoards();
    view.bindGameboard({
      receiveAttack: receiveAttackHandler,
      rotate: rotateShipHandler,
    });
    view.bindButtons({
      start: handleStartGame,
      ready: readyHandler,
    });
    view.bindDragAndDrop({
      dragStart: dragstartHandler,
      dragEnd: dragendHandler,
      dragOver: dragoverHandler,
      drop: dropHandler,
      leave: dragleaveHandler,
    });
    view.bindModalButtons({
      randomize: handleRandomizeShips,
      submit: submitHandler,
    });
    view.bindName(nameInputHandler);
    view.bindOpponent(opponentInputHandler);
  };

  return { run };
}
