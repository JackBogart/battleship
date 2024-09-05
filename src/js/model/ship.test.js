import createShip from './ship';

describe('creating ships', () => {
  test('createShip throws an error for ships smaller than 2', () => {
    expect(() => createShip(1)).toThrow('Invalid ship length');
  });

  test('createShip throws an error for ships larger than 5', () => {
    expect(() => createShip(6)).toThrow('Invalid ship length');
  });

  test('createShip returns a ship object of length 2', () => {
    const ship = createShip(2);

    expect(ship.getLength()).toEqual(2);
  });

  test('createShip returns a ship object of length 5', () => {
    const ship = createShip(5);

    expect(ship.getLength()).toEqual(5);
  });
});

describe('invoking ship methods', () => {
  let ship;

  beforeEach(() => {
    ship = createShip(2);
  });

  test('isSunk returns false when the ship is not sunk', () => {
    expect(ship.isSunk()).toBe(false);
  });

  test('hit does not throw an error on active ship', () => {
    expect(() => ship.hit()).not.toThrow();
  });

  describe('invoking ship methods on sunken ship', () => {
    beforeEach(() => {
      ship.hit();
      ship.hit();
    });

    test('isSunk returns true when the ship is sunk', () => {
      expect(ship.isSunk()).toBe(true);
    });

    test('hit throws an error on sunken ship', () => {
      expect(() => ship.hit()).toThrow('Cannot hit sunken ship');
    });
  });
});
