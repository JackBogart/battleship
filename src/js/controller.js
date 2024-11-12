import { createComputerPlayer, createPlayer } from './model/player';
import { createShip } from './model/ship';
import { PlayerType, ShipType, TileInfoType } from './types';
import { getRandomInt } from './utils/random';
import { createView, getXYOffsets } from './view';

export function createController() {
  const view = createView();
  let player1 = createPlayer('Player', PlayerType.HUMAN);
  let player2 = createComputerPlayer();
  let isGameInProgress = false;
  let isPlayer1Turn = true;

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
    const attackingPlayer = isPlayer1Turn ? player1 : player2;
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
      view.reportGameOver(attackingPlayer.getName());
      view.renderAllPlayerShips(isPlayer1Turn, attackingPlayer);
      view.renderAllSunkenShips(isPlayer1Turn, attackingPlayer);
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
    view.placeShip(row, col, isVertical, ship);
  };

  const randomizeBoard = (player) => {
    placeShipRandomly(player, createShip(ShipType.CARRIER));
    placeShipRandomly(player, createShip(ShipType.BATTLESHIP));
    placeShipRandomly(player, createShip(ShipType.DESTROYER));
    placeShipRandomly(player, createShip(ShipType.SUBMARINE));
    placeShipRandomly(player, createShip(ShipType.PATROL_BOAT));
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
    const attackedPlayer = isPlayer1Attacked ? player1 : player2;

    if (attackedPlayer.getTileInfo(row, col) === TileInfoType.UNKNOWN) {
      playerTurn(attackedPlayer, row, col);

      if (isGameInProgress && isPlayer2Computer) {
        const [computerRow, computerCol] = player2.getComputerAttack(
          player1.getInfoBoard(),
        );
        player2.updateLastAttack(computerRow, computerCol);
        playerTurn(player1, computerRow, computerCol);
      }
    }
  };

  const handleRandomizeShips = () => {
    player1.removeAllShips();
    randomizeBoard(player1);
  };

  const handleStartGame = () => {
    view.createShip(createShip(ShipType.CARRIER));
    view.createShip(createShip(ShipType.BATTLESHIP));
    view.createShip(createShip(ShipType.DESTROYER));
    view.createShip(createShip(ShipType.SUBMARINE));
    view.createShip(createShip(ShipType.PATROL_BOAT));
    view.resetPlayerBoards();
    view.showPlanningModal();
    player1 = createPlayer('Player', PlayerType.HUMAN);
    player2 = createComputerPlayer();
    isGameInProgress = false;
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
        view.disableDraggableShipEvents();
        view.createShipInsertionMarker(shipContainer);
        view.activateDragImage(dragImage);
      }, 0);
    }
  };

  const dragendHandler = (event) => {
    if (event.target.classList.contains('ship-container')) {
      view.enableDraggableShipEvents();
      view.removeShipInsertionMarker();
      view.deactivateDragImage();
    }
  };

  const dragoverHandler = (event) => {
    event.preventDefault();

    if (event.target.classList.contains('grid-cell')) {
      event.dataTransfer.dropEffect = 'move';

      const player = isPlayer1Turn ? player1 : player2;
      const newRow = Number(event.target.dataset.row);
      const newCol = Number(event.target.dataset.col);
      const shipType = view.getActiveDragImageType();
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
    view.hideShipInsertionMarker();
  };

  const dropHandler = (event) => {
    if (event.dataTransfer.getData('text/plain') === '') {
      return;
    }

    event.preventDefault();
    const shipType = event.dataTransfer.getData('text/plain');
    const player = isPlayer1Turn ? player1 : player2;
    const positionData = player.getInitialPosition(shipType);

    if (event.target.classList.contains('grid-cell')) {
      const newRow = Number(event.target.dataset.row);
      const newCol = Number(event.target.dataset.col);
      let ship, isVertical;

      // If new ship, else move existing ship
      if (positionData === undefined) {
        ship = createShip(shipType);
        isVertical = false;
      } else {
        ship = player.getShip(positionData.row, positionData.col);
        isVertical = positionData.isVertical;
      }

      if (player.isValidPlacement(ship, newRow, newCol, isVertical)) {
        if (positionData !== undefined) {
          player.removeShip(positionData.row, positionData.col);
        }
        player.setShip(ship, newRow, newCol, isVertical);
        view.placeShip(newRow, newCol, isVertical, ship);
      }
    } else if (
      event.target.classList.contains('ships') &&
      positionData !== undefined
    ) {
      const ship = createShip(shipType);
      player.removeShip(positionData.row, positionData.col);
      view.returnShip(ship);
    }
  };

  const rotateShipHandler = (shipType) => {
    const player = isPlayer1Turn ? player1 : player2;
    const { row, col, isVertical } = player.getInitialPosition(shipType);
    const ship = player.getShip(row, col);

    if (player.isValidPlacement(ship, row, col, !isVertical)) {
      player.removeShip(row, col);
      player.setShip(ship, row, col, !isVertical);
      view.placeShip(row, col, !isVertical, ship);
    }
  };

  const submitHandler = (event) => {
    const { name, opponent } = view.getPlanningFormData();
    event.target.closest('dialog').close();
    player1.setName(name);
    if (opponent === 'computer') {
      randomizeBoard(player2);
      isGameInProgress = true;
      view.removePreGameControls();
      view.removeDraggableShips();
      view.hidePlanningModal();
      view.renderAllPlayerShips(true, player1);
    }
  };

  const run = () => {
    view.init();
    view.bindGameboard({
      receiveAttack: receiveAttackHandler,
      rotate: rotateShipHandler,
    });
    view.bindButtons({
      start: handleStartGame,
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
  };

  return { run };
}
