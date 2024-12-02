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
  let prioritizedTiles = [];

  const isTileInBounds = function isTileInBounds(row, col) {
    return row >= 0 && row < NUM_OF_ROWS && col >= 0 && col < NUM_OF_COLUMNS;
  };

  const getPrioritizedTile = function getPrioritizedTile(infoBoard) {
    while (prioritizedTiles.length > 0) {
      const [row, col] = prioritizedTiles.pop();
      if (infoBoard[row][col] === tileInfoType.UNKNOWN) {
        return [row, col];
      }
    }

    return null;
  };

  const getRandomTile = function getRandomTile(infoBoard) {
    let row = getRandomInt(10);
    let col = getRandomInt(10);

    while (infoBoard[row][col] !== tileInfoType.UNKNOWN) {
      row = getRandomInt(10);
      col = getRandomInt(10);
    }

    return [row, col];
  };

  const getComputerAttack = function getComputerAttack(infoBoard) {
    const prioritizedTile = getPrioritizedTile(infoBoard);

    if (prioritizedTile) {
      return prioritizedTile;
    }

    return getRandomTile(infoBoard);
  };

  const getTilesOrderedByPriority = function getTilesOrderedByPriority(
    row,
    col,
    infoBoard,
  ) {
    const directions = shuffleArray([
      [0, 1],
      [1, 0],
      [-1, 0],
      [0, -1],
    ]);

    const tilesOrderedByPriority = [];

    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (
        isTileInBounds(row, col) &&
        infoBoard[row][col] === tileInfoType.UNKNOWN
      ) {
        const oppositeRow = row - dRow;
        const oppositeCol = col - dCol;

        /* If the tile on the other side of the attacked tile is also a hit we
        should keep attacking in this direction, therefore prioritize. */
        if (
          isTileInBounds(oppositeRow, oppositeCol) &&
          infoBoard[oppositeRow][oppositeCol] === tileInfoType.HIT
        ) {
          tilesOrderedByPriority.push([newRow, newCol]);
        } else {
          tilesOrderedByPriority.unshift([newRow, newCol]);
        }
      }
    }
    return tilesOrderedByPriority;
  };

  const updateLastAttack = function updateLastAttack(
    row,
    col,
    sunk,
    infoBoard,
  ) {
    if (sunk) {
      prioritizedTiles = [];
    } else if (infoBoard[row][col] === tileInfoType.HIT) {
      const tiles = getTilesOrderedByPriority(row, col, infoBoard);
      prioritizedTiles.push(...tiles);
    } else {
      // We shuffle on miss as we don't want to keep attacking in same area
      prioritizedTiles = shuffleArray(prioritizedTiles);
    }
  };

  return { ...player, getComputerAttack, updateLastAttack };
}
