import { TileInfo } from './model/gameboard';
import { PlayerType, createPlayer } from './model/player';
import { createShip } from './model/ship';
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

function tempInitBoards(player1, player2) {
  placeShipRandomly(player1, createShip(4));
  placeShipRandomly(player1, createShip(3));
  placeShipRandomly(player1, createShip(5));
  placeShipRandomly(player1, createShip(3));
  placeShipRandomly(player1, createShip(2));

  placeShipRandomly(player2, createShip(4));
  placeShipRandomly(player2, createShip(3));
  placeShipRandomly(player2, createShip(5));
  placeShipRandomly(player2, createShip(3));
  placeShipRandomly(player2, createShip(2));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function createController() {
  const view = createView();
  const player1 = createPlayer('Jack', PlayerType.HUMAN);
  const player2 = createPlayer('Computer', PlayerType.COMPUTER);
  let isGameOver = false;

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
    if (!isPlayer1 && !isGameOver) {
      //Extract below to separate function for readability?
      if (player2.getTileInfo(row, col) === TileInfo.UNKNOWN) {
        player2.receiveAttack(row, col);
        view.receiveAttack(row, col, player2.getTileInfo(row, col), false);

        if (player2.isFleetSunk()) {
          view.reportGameOver(player1.getName());
          isGameOver = true;
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
            isGameOver = true;
          }
        }
      }
      // TODO: Create a non-modal popup if attacking revealed tile
    }
  };

  const run = () => {
    view.init();
    view.bindReceiveAttack(handleReceiveAttack);
    tempInitBoards(player1, player2);
    view.renderPlayerShips(true, player1);
  };

  return { run };
}
