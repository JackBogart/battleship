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

  const getShip = (row, col) => board[row][col];

  const isValidPlacement = (ship, row, col, isVertical) => {
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

    return true;
  };

  const setShip = (ship, row, col, isVertical) => {
    const shipLength = ship.getLength();

    for (let i = 0; i < shipLength; i++) {
      const currentRow = isVertical ? row + i : row;
      const currentCol = isVertical ? col : col + i;

      board[currentRow][currentCol] = ship;
    }
    ships.push(ship);
  };

  const getInfoBoard = () => infoBoard.map((row) => [...row]);
  const getTileInfo = (row, col) => infoBoard[row][col];

  const receiveAttack = (row, col) => {
    if (board[row][col] === null) {
      infoBoard[row][col] = TileInfo.MISSED;
    } else {
      board[row][col].hit();
      infoBoard[row][col] = TileInfo.HIT;
    }
  };

  const isFleetSunk = () => ships.every((ship) => ship.isSunk());

  return {
    getShip,
    setShip,
    getInfoBoard,
    getTileInfo,
    receiveAttack,
    isFleetSunk,
    isValidPlacement,
  };
}
