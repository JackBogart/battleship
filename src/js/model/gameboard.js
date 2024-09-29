export const TileInfo = Object.freeze({
  UNKNOWN: Symbol('unknown'),
  MISSED: Symbol('missed'),
  HIT: Symbol('hit'),
});

export function createGameboard() {
  const rows = 10;
  const cols = 10;
  const ships = [];

  const board = new Array(rows)
    .fill(null)
    .map(() => new Array(cols).fill(null));

  const infoBoard = new Array(rows)
    .fill(null)
    .map(() => new Array(cols).fill(TileInfo.UNKNOWN));

  const getShip = (row, col) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      throw new Error('Cannot get ship out of bounds');
    }

    return board[row][col];
  };

  const setShip = (ship, row, col, isVertical = false) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      throw new Error('Cannot place ship out of bounds');
    }

    const shipLength = ship.getLength();
    if (isVertical) {
      if (row + shipLength > rows) {
        return false;
      }
    } else if (col + shipLength > cols) {
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

    // Place the ship on the board
    for (let i = 0; i < shipLength; i++) {
      const currentRow = isVertical ? row + i : row;
      const currentCol = isVertical ? col : col + i;

      board[currentRow][currentCol] = ship;
    }
    ships.push(ship);

    return true;
  };

  const getInfoBoard = () => infoBoard.map((row) => [...row]);
  const getTileInfo = (row, col) => infoBoard[row][col];

  const receiveAttack = (row, col) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      throw new Error('Cannot attack ship out of bounds');
    }

    if (infoBoard[row][col] !== TileInfo.UNKNOWN) {
      return false;
    }

    if (board[row][col] === null) {
      infoBoard[row][col] = TileInfo.MISSED;
    } else {
      board[row][col].hit();
      infoBoard[row][col] = TileInfo.HIT;
    }

    return true;
  };

  const isFleetSunk = () => ships.every((ship) => ship.isSunk());

  return {
    getShip,
    setShip,
    getInfoBoard,
    getTileInfo,
    receiveAttack,
    isFleetSunk,
  };
}
