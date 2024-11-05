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
    if (player.getName() === 'Player') {
      // For placement system, temporary will need to do this in a better way
      view.createShip(row, col, isVertical, ship, true);
    }
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
    view.removeDraggableShips();
    randomizeBoard(player1);
  };

  const handleStartGame = () => {
    isGameInProgress = true;
    view.removePreGameControls();
    view.removeDraggableShips();
    view.renderAllPlayerShips(true, player1);
  };

  const handlePlayAgain = () => {
    view.resetBoards();
    player1 = createPlayer('Player', PlayerType.HUMAN);
    player2 = createComputerPlayer();
    isGameInProgress = false;
    isPlayer1Turn = true;
    randomizeBoard(player1);
    randomizeBoard(player2);
    view.addPreGameControls();
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
    }
  };

  const dragoverHandler = (event) => {
    if (event.target.classList.contains('grid-cell')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const player = isPlayer1Turn ? player1 : player2;
      const newRow = Number(event.target.dataset.row);
      const newCol = Number(event.target.dataset.col);
      const shipType = view.getActiveDragImageType();
      const { row, col, isVertical } = player.getInitialPosition(shipType);
      const ship = player.getShip(row, col);
      const isValid = player.isValidPlacement(ship, newRow, newCol, isVertical);

      view.moveShipInsertionMarker(
        newRow,
        newCol,
        isValid,
        ship.getLength(),
        isVertical,
      );
    } else if (event.target.classList.contains('gameboard')) {
      view.hideShipInsertionMarker();
    }
  };

  const dropHandler = (event) => {
    if (event.dataTransfer.getData('text/plain') !== '') {
      event.preventDefault();
      const player = isPlayer1Turn ? player1 : player2;
      const newRow = Number(event.target.dataset.row);
      const newCol = Number(event.target.dataset.col);
      const shipType = event.dataTransfer.getData('text/plain');
      const { row, col, isVertical } = player.getInitialPosition(shipType);
      const ship = player.getShip(row, col);

      if (player.isValidPlacement(ship, newRow, newCol, isVertical)) {
        player.removeShip(row, col);
        player.setShip(ship, newRow, newCol, isVertical);
        view.placeShip(newRow, newCol, isVertical, ship, isPlayer1Turn);
      }
    }
  };

  const rotateShipHandler = (shipType) => {
    const player = isPlayer1Turn ? player1 : player2;
    const { row, col, isVertical } = player.getInitialPosition(shipType);
    const ship = player.getShip(row, col);

    if (player.isValidPlacement(ship, row, col, !isVertical)) {
      player.removeShip(row, col);
      player.setShip(ship, row, col, !isVertical);
      view.placeShip(row, col, !isVertical, ship, isPlayer1Turn);
    }
  };

  const run = () => {
    view.init();
    view.bindClick({
      receiveAttack: receiveAttackHandler,
      rotate: rotateShipHandler,
    });
    view.bindButtons({
      randomize: handleRandomizeShips,
      start: handleStartGame,
      playAgain: handlePlayAgain,
    });
    view.bindDragAndDrop({
      dragStart: dragstartHandler,
      dragEnd: dragendHandler,
      dragOver: dragoverHandler,
      drop: dropHandler,
    });
    randomizeBoard(player1);
    randomizeBoard(player2);
  };

  return { run };
}
