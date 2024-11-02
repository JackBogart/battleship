import { createComputerPlayer, createPlayer } from './model/player';
import { createShip } from './model/ship';
import { PlayerType, ShipType, TileInfoType } from './types';
import { getRandomInt } from './utils/random';
import { createView } from './view';

function placeShipRandomly(player, ship) {
  let row = getRandomInt(10);
  let col = getRandomInt(10);
  let isVertical = getRandomInt(2) === 0;

  while (!player.isValidPlacement(ship, row, col, isVertical)) {
    row = getRandomInt(10);
    col = getRandomInt(10);
    isVertical = getRandomInt(2) === 0;
  }

  player.setShip(ship, row, col, isVertical);
}

// TODO: Change this to randomize a given player's board
function tempInitBoards(player1, player2) {
  placeShipRandomly(player1, createShip(ShipType.CARRIER));
  placeShipRandomly(player1, createShip(ShipType.BATTLESHIP));
  placeShipRandomly(player1, createShip(ShipType.DESTROYER));
  placeShipRandomly(player1, createShip(ShipType.SUBMARINE));
  placeShipRandomly(player1, createShip(ShipType.PATROL_BOAT));

  placeShipRandomly(player2, createShip(ShipType.CARRIER));
  placeShipRandomly(player2, createShip(ShipType.BATTLESHIP));
  placeShipRandomly(player2, createShip(ShipType.DESTROYER));
  placeShipRandomly(player2, createShip(ShipType.SUBMARINE));
  placeShipRandomly(player2, createShip(ShipType.PATROL_BOAT));
}

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

  /**
   * Handler function for a board being attacked. It will take the coordinates
   * of the tile being attacked, along with a boolean that represents if it's
   * player 1 being attacked.
   *
   * @param {number} row - The row being attacked
   * @param {number} col - The column being attacked
   * @param {boolean} isPlayer1Attacked - true if player 1 is being attacked
   */
  const handleReceiveAttack = (row, col, isPlayer1Attacked) => {
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
    player2.removeAllShips();
    tempInitBoards(player1, player2);
    view.renderAllPlayerShips(true, player1);
  };

  const handleStartGame = () => {
    isGameInProgress = true;
    view.removePreGameControls();
  };

  const handlePlayAgain = () => {
    view.resetBoards();
    player1 = createPlayer('Player', PlayerType.HUMAN);
    player2 = createComputerPlayer();
    isGameInProgress = false;
    isPlayer1Turn = true;
    tempInitBoards(player1, player2);
    view.renderAllPlayerShips(true, player1);
    view.addPreGameControls();
  };

  const run = () => {
    view.init();
    view.bindReceiveAttack(handleReceiveAttack);
    view.bindButtons({
      randomize: handleRandomizeShips,
      start: handleStartGame,
      playAgain: handlePlayAgain,
    });
    tempInitBoards(player1, player2);
    view.renderAllPlayerShips(true, player1);
  };

  return { run };
}
