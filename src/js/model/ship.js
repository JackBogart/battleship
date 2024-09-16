export default function createShip(length) {
  if (length <= 0 || length > 5) {
    throw new Error('Invalid length');
  }

  let hits = 0;

  const getLength = () => length;
  const isSunk = () => hits === length;
  const hit = () => {
    if (!isSunk()) {
      hits += 1;
    }
  };

  return { getLength, isSunk, hit };
}
