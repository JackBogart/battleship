import { NUM_OF_COLUMNS, NUM_OF_ROWS } from '../constants';
import { createGameboard } from './gameboard';
import { playerType, tileInfoType } from '../types';
import { getRandomInt, shuffleArray } from '../utils/random';

export function createPlayer(name, playerType) {
  const gameboard = createGameboard();

  const getName = function getName() {
    return name;
  };

  const setName = function setName(newName) {
    name = newName;
  };

  const getType = function getType() {
    return playerType;
  };

  const getShip = function getShip(row, col) {
    return gameboard.getShip(row, col);
  };

  const setShip = function setShip(ship, row, col, isVertical = false) {
    gameboard.setShip(ship, row, col, isVertical);
  };
  const getInfoBoard = function getInfoBoard() {
    return gameboard.getInfoBoard();
  };

  const getTileInfo = function getTileInfo(row, col) {
    return gameboard.getTileInfo(row, col);
  };

  const receiveAttack = function receiveAttack(row, col) {
    gameboard.receiveAttack(row, col);
  };

  const isFleetSunk = function isFleetSunk() {
    return gameboard.isFleetSunk();
  };

  const isValidPlacement = function isValidPlacement(
    ship,
    row,
    col,
    isVertical,
  ) {
    return gameboard.isValidPlacement(ship, row, col, isVertical);
  };

  const getShipType = function getShipType(row, col) {
    const ship = getShip(row, col);
    return ship === null ? '' : ship.getType();
  };

  const removeAllShips = function removeAllShips() {
    gameboard.removeAllShips();
  };

  const getInitialPosition = function getInitialPosition(shipType) {
    return gameboard.getInitialPosition(shipType);
  };

  const removeShip = function removeShip(row, col) {
    gameboard.removeShip(row, col);
  };

  const getAllShips = function getAllShips() {
    return gameboard.getAllShips();
  };

  return {
    getAllShips,
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
    removeShip,
  };
}

export function createComputerPlayer() {
  const player = createPlayer('Computer', playerType.COMPUTER);
  let lastAttack;

  const getComputerAttack = function getComputerAttack(infoBoard) {
    if (
      lastAttack !== undefined &&
      infoBoard[lastAttack.row][lastAttack.col] === tileInfoType.HIT
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
          infoBoard[row][col] === tileInfoType.UNKNOWN
        ) {
          return [row, col];
        }
      }
    }
    let row = getRandomInt(10);
    let col = getRandomInt(10);

    while (infoBoard[row][col] !== tileInfoType.UNKNOWN) {
      row = getRandomInt(10);
      col = getRandomInt(10);
    }

    return [row, col];
  };

  const updateLastAttack = function updateLastAttack(row, col) {
    lastAttack = { row, col };
  };

  return { ...player, getComputerAttack, updateLastAttack };
}
