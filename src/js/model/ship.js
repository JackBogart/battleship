export default function createShip(length) {
  if (!(2 <= length && length <= 5)) {
    throw new Error('Invalid ship length');
  }

  let hits = 0;

  function isSunk() {
    return hits === length;
  }

  function hit() {
    if (isSunk()) {
      throw new Error('Cannot hit sunken ship');
    }
    hits += 1;
  }

  return {
    getLength: () => length,
    isSunk,
    hit,
  };
}
