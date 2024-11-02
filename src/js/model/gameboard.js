import { NUM_OF_COLUMNS, NUM_OF_ROWS } from '../constants';
import { TileInfoType } from '../types';

export function createGameboard() {
  let shipData = {};

  let board = new Array(NUM_OF_ROWS)
    .fill(null)
    .map(() => new Array(NUM_OF_COLUMNS).fill(null));

  const infoBoard = new Array(NUM_OF_ROWS)
    .fill(null)
    .map(() => new Array(NUM_OF_COLUMNS).fill(TileInfoType.UNKNOWN));

  const getShip = (row, col) => board[row][col];

  const isValidPlacement = (ship, row, col, isVertical) => {
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

      if (board[currentRow][currentCol] !== null) {
        return false;
      }
    }

    return true;
  };

  const setShip = (ship, row, col, isVertical) => {
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

  const getInfoBoard = () => infoBoard.map((row) => [...row]);
  const getTileInfo = (row, col) => infoBoard[row][col];

  const receiveAttack = (row, col) => {
    if (board[row][col] === null) {
      infoBoard[row][col] = TileInfoType.MISSED;
    } else {
      board[row][col].hit();
      infoBoard[row][col] = TileInfoType.HIT;
    }
  };

  const isFleetSunk = () =>
    Object.values(shipData).every((entry) => entry.ship.isSunk());

  const getInitialPosition = (shipType) => {
    if (shipData[shipType] === undefined) {
      return undefined;
    }

    const ship = shipData[shipType];
    return {
      row: ship.row,
      col: ship.col,
      isVertical: ship.isVertical,
    };
  };

  const removeShip = (targetedRow, targetedCol) => {
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

  const removeAllShips = () => {
    board = new Array(NUM_OF_ROWS)
      .fill(null)
      .map(() => new Array(NUM_OF_COLUMNS).fill(null));
    shipData = {};
  };

  return {
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
