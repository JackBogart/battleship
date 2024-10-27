import { NUM_OF_COLUMNS, NUM_OF_ROWS } from '../constants';
import { TileInfo, createGameboard } from './gameboard';
import { getRandomInt } from '../utils';

export const PlayerType = Object.freeze({
  HUMAN: Symbol('human'),
  COMPUTER: Symbol('computer'),
});

export function createPlayer(name, playerType) {
  const gameboard = createGameboard();

  const getName = () => name;

  const setName = (newName) => {
    name = newName;
  };

  const getType = () => playerType;

  const getShip = (row, col) => gameboard.getShip(row, col);

  const setShip = (ship, row, col, isVertical = false) => {
    gameboard.setShip(ship, row, col, isVertical);
  };
  const getInfoBoard = () => gameboard.getInfoBoard();

  const getTileInfo = (row, col) => gameboard.getTileInfo(row, col);

  const receiveAttack = (row, col) => {
    gameboard.receiveAttack(row, col);
  };

  const isFleetSunk = () => gameboard.isFleetSunk();

  const isValidPlacement = (ship, row, col, isVertical) =>
    gameboard.isValidPlacement(ship, row, col, isVertical);

  const getShipType = (row, col) => {
    const ship = getShip(row, col);
    return ship === null ? '' : ship.getType();
  };

  const removeAllShips = () => {
    gameboard.removeAllShips();
  };

  const getInitialPosition = (row, col) =>
    gameboard.getInitialPosition(row, col);

  return {
    getName,
    getType,
    setName,
    getShip,
    setShip,
    getInfoBoard,
    getTileInfo,
    receiveAttack,
    isFleetSunk,
    isValidPlacement,
    getShipType,
    removeAllShips,
    getInitialPosition,
  };
}

export function createComputerPlayer() {
  const player = createPlayer('Computer', PlayerType.COMPUTER);
  let lastAttack;

  const getComputerAttack = (infoBoard) => {
    if (
      lastAttack !== undefined &&
      infoBoard[lastAttack.row][lastAttack.col] === TileInfo.HIT
    ) {
      const directions = [
        [0, 1],
        [1, 0],
        [-1, 0],
        [0, -1],
      ];

      let [dRow, dCol] = directions[getRandomInt(4)];
      let row = lastAttack.row + dRow;
      let col = lastAttack.col + dCol;

      while (
        row < 0 ||
        row >= NUM_OF_ROWS ||
        col < 0 ||
        col >= NUM_OF_COLUMNS ||
        infoBoard[row][col] === TileInfo.HIT
      ) {
        [dRow, dCol] = directions[getRandomInt(4)];
        row = lastAttack.row + dRow;
        col = lastAttack.col + dCol;
      }

      if (infoBoard[row][col] !== TileInfo.HIT) {
        return [row, col];
      }
    }
    let row = getRandomInt(10);
    let col = getRandomInt(10);

    while (infoBoard[row][col] !== TileInfo.UNKNOWN) {
      row = getRandomInt(10);
      col = getRandomInt(10);
    }

    return [row, col];
  };

  const updateLastAttack = (row, col) => {
    lastAttack = { row, col };
  };

  return { ...player, getComputerAttack, updateLastAttack };
}
