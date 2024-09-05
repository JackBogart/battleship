import createShip from './ship';

describe('creating ships', () => {
  it('throws an error for ships smaller than 2', () => {
    expect(() => createShip(1)).toThrow('Invalid ship length');
  });

  it('throws an error for ships larger than 5', () => {
    expect(() => createShip(6)).toThrow('Invalid ship length');
  });

  it('returns a ship object of length 3', () => {
    const ship = createShip(3);

    expect(ship.getLength()).toEqual(3);
  });

  it('returns a ship object of length 5', () => {
    const ship = createShip(5);

    expect(ship.getLength()).toEqual(5);
  });
});
