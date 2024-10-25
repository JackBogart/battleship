import { TileInfo } from './model/gameboard';
import { PlayerType, createPlayer } from './model/player';
import { ShipType, createShip } from './model/ship';
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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function createController() {
  const view = createView();
  let player1 = createPlayer('Player', PlayerType.HUMAN);
  let player2 = createPlayer('Computer', PlayerType.COMPUTER);
  let isGameInProgress = false;

  const getComputerAttack = () => {
    let row = getRandomInt(10);
    let col = getRandomInt(10);

    while (player1.getTileInfo(row, col) !== TileInfo.UNKNOWN) {
      row = getRandomInt(10);
      col = getRandomInt(10);
    }

    return [row, col];
  };

  const handleReceiveAttack = (row, col, isPlayer1) => {
    if (isPlayer1 || !isGameInProgress) {
      return;
    }

    //Extract below to separate function for readability?
    if (player2.getTileInfo(row, col) === TileInfo.UNKNOWN) {
      player2.receiveAttack(row, col);
      view.receiveAttack(row, col, player2.getTileInfo(row, col), false);

      if (
        player2.getTileInfo(row, col) === TileInfo.HIT &&
        player2.getShip(row, col).isSunk()
      ) {
        const positionData = player2.getInitialPosition(row, col);
        view.renderShip(
          false,
          positionData.row,
          positionData.col,
          positionData.isVertical,
          player2.getShip(row, col).getLength(),
        );
      }

      if (player2.isFleetSunk()) {
        view.reportGameOver(player1.getName());
        isGameInProgress = false;
      } else {
        const [computerRow, computerCol] = getComputerAttack();
        player1.receiveAttack(computerRow, computerCol);
        view.receiveAttack(
          computerRow,
          computerCol,
          player1.getTileInfo(computerRow, computerCol),
          true,
        );

        if (player1.isFleetSunk()) {
          view.reportGameOver(player2.getName());
          view.renderAllPlayerShips(false, player2);
          isGameInProgress = false;
        }
      }
    }
    // TODO: Create a non-modal popup if attacking revealed tile
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
    player2 = createPlayer('Computer', PlayerType.COMPUTER);
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
