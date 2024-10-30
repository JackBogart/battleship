const shipSize = Object.freeze({
  'carrier': 5,
  'battleship': 4,
  'destroyer': 3,
  'submarine': 3,
  'patrol boat': 2,
});

export function createShip(shipType) {
  const length = shipSize[shipType];
  if (!length) {
    throw new Error('Invalid ship type');
  }

  let hits = 0;

  const getLength = () => length;
  const getType = () => shipType;
  const isSunk = () => hits === length;
  const hit = () => {
    if (!isSunk()) {
      hits += 1;
    }
  };

  return { getLength, isSunk, hit, getType };
}
