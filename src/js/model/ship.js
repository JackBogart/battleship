export const shipSize = Object.freeze({
  'carrier': 5,
  'battleship': 4,
  'destroyer': 3,
  'submarine': 3,
  'patrol-boat': 2,
});

export function createShip(shipType) {
  const length = shipSize[shipType];
  if (!length) {
    throw new Error('Invalid ship type');
  }

  let hits = 0;

  const getLength = function getLength() {
    return length;
  };

  const getType = function getType() {
    return shipType;
  };

  const isSunk = function isSunk() {
    return hits === length;
  };

  const hit = function hit() {
    if (!isSunk()) {
      hits += 1;
    }
  };

  return { getLength, isSunk, hit, getType };
}
