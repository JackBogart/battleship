export default function createShip(length) {
  if (!(2 <= length && length <= 5)) {
    throw new Error('Invalid ship length');
  }

  return {
    getLength: () => length,
  };
}
