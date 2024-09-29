import { createShip } from './ship';

describe('Ship', () => {
  it('should return a length of 3', () => {
    const ship = createShip(3);

    const length = ship.getLength();

    expect(length).toBe(3);
  });

  it('should throw an error for negative length', () => {
    expect(() => createShip(-1)).toThrow('Invalid length');
  });

  it('should throw an error for length larger than 5', () => {
    expect(() => createShip(6)).toThrow('Invalid length');
  });

  it('should not be sunk if hit fewer times than its length', () => {
    const ship = createShip(3);

    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(false);
  });

  it('should be sunk if hit equal to its length', () => {
    const ship = createShip(3);

    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(true);
  });
});
