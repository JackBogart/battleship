import { NUM_OF_COLUMNS, NUM_OF_ROWS } from '../constants';
import { createGameboard } from './gameboard';
import { PlayerType, TileInfoType } from '../types';
import { getRandomInt, shuffleArray } from '../utils/random';

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

  const getInitialPosition = (shipType) =>
    gameboard.getInitialPosition(shipType);

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
      infoBoard[lastAttack.row][lastAttack.col] === TileInfoType.HIT
    ) {
      const directions = shuffleArray([
        [0, 1],
        [1, 0],
        [-1, 0],
        [0, -1],
      ]);

      for (const [dRow, dCol] of directions) {
        const row = lastAttack.row + dRow;
        const col = lastAttack.col + dCol;

        if (
          row >= 0 &&
          row < NUM_OF_ROWS &&
          col >= 0 &&
          col < NUM_OF_COLUMNS &&
          infoBoard[row][col] === TileInfoType.UNKNOWN
        ) {
          return [row, col];
        }
      }
    }
    let row = getRandomInt(10);
    let col = getRandomInt(10);

    while (infoBoard[row][col] !== TileInfoType.UNKNOWN) {
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
