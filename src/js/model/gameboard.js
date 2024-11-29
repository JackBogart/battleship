import { NUM_OF_COLUMNS, NUM_OF_ROWS } from '../constants';
import { tileInfoType } from '../types';

export function createGameboard() {
  let shipData = {};

  let board = new Array(NUM_OF_ROWS)
    .fill(null)
    .map(() => new Array(NUM_OF_COLUMNS).fill(null));

  const infoBoard = new Array(NUM_OF_ROWS)
    .fill(null)
    .map(() => new Array(NUM_OF_COLUMNS).fill(tileInfoType.UNKNOWN));

  const getShip = function getShip(row, col) {
    return board[row][col];
  };

  const isValidPlacement = function isValidPlacement(
    ship,
    row,
    col,
    isVertical,
  ) {
    const shipLength = ship.getLength();
    if (isVertical) {
      if (row + shipLength > NUM_OF_ROWS) {
        return false;
      }
    } else if (col + shipLength > NUM_OF_COLUMNS) {
      return false;
    }

    // Check for overlap with existing ships
    for (let i = 0; i < shipLength; i++) {
      const currentRow = isVertical ? row + i : row;
      const currentCol = isVertical ? col : col + i;

      // Only null tiles allowed unless the ship is being moved onto itself
      if (![ship, null].includes(board[currentRow][currentCol])) {
        return false;
      }
    }

    return true;
  };

  const setShip = function setShip(ship, row, col, isVertical) {
    const shipLength = ship.getLength();

    for (let i = 0; i < shipLength; i++) {
      const currentRow = isVertical ? row + i : row;
      const currentCol = isVertical ? col : col + i;

      board[currentRow][currentCol] = ship;
    }

    shipData[ship.getType()] = {
      ship,
      row,
      col,
      isVertical,
    };
  };

  const getInfoBoard = function getInfoBoard() {
    return infoBoard.map((row) => [...row]);
  };

  const getTileInfo = function getTileInfo(row, col) {
    return infoBoard[row][col];
  };

  const receiveAttack = function receiveAttack(row, col) {
    if (!board[row][col]) {
      infoBoard[row][col] = tileInfoType.MISSED;
    } else {
      board[row][col].hit();
      infoBoard[row][col] = tileInfoType.HIT;
    }
  };

  const isFleetSunk = function isFleetSunk() {
    return Object.values(shipData).every((entry) => entry.ship.isSunk());
  };

  const getInitialPosition = function getInitialPosition(shipType) {
    if (!shipData[shipType]) {
      return undefined;
    }

    const ship = shipData[shipType];
    return {
      row: ship.row,
      col: ship.col,
      isVertical: ship.isVertical,
    };
  };

  const removeShip = function removeShip(targetedRow, targetedCol) {
    if (board[targetedRow][targetedCol] === null) {
      throw new Error('Cannot remove ship, no ship exists at location');
    }

    const shipType = board[targetedRow][targetedCol].getType();
    const { ship, row, col, isVertical } = shipData[shipType];
    const shipLength = ship.getLength();

    for (let i = 0; i < shipLength; i++) {
      const currentRow = isVertical ? row + i : row;
      const currentCol = isVertical ? col : col + i;

      board[currentRow][currentCol] = null;
    }

    delete shipData[shipType];
  };

  const removeAllShips = function removeAllShips() {
    board = new Array(NUM_OF_ROWS)
      .fill(null)
      .map(() => new Array(NUM_OF_COLUMNS).fill(null));
    shipData = {};
  };

  const getAllShips = function getAllShips() {
    return Object.values(shipData).reduce((ships, data) => {
      ships.push(data.ship);
      return ships;
    }, []);
  };

  return {
    getAllShips,
    getShip,
    setShip,
    getInfoBoard,
    getTileInfo,
    receiveAttack,
    isFleetSunk,
    isValidPlacement,
    getInitialPosition,
    removeShip,
    removeAllShips,
  };
}
