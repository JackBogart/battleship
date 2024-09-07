export const States = Object.freeze({
  UNKNOWN: Symbol('unknown'),
  MISS: Symbol('miss'),
  HIT: Symbol('hit'),
});

export function createTile() {
  let ship = null;
  let state = States.UNKNOWN;

  function getShip() {
    return ship;
  }

  function setShip(obj) {
    ship = obj;
  }

  function hit() {
    if (state !== States.UNKNOWN) {
      throw new Error('Tile has already been hit');
    }
    if (ship !== null) {
      ship.hit();
      state = States.HIT;
    } else {
      state = States.MISS;
    }
  }

  function getState() {
    return state;
  }

  return { getShip, setShip, hit, getState };
}
