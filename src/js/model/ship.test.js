import { createShip } from './ship';
import { shipType } from '../types';

describe('Ship', () => {
  it('should return a length of 3', () => {
    const ship = createShip(shipType.DESTROYER.type);

    const length = ship.getLength();

    expect(length).toBe(3);
  });

  it('should throw an error for an unknown ship type', () => {
    expect(() => createShip(shipType.FAKE)).toThrow('Invalid ship type');
  });

  it('should not be sunk if hit fewer times than its length', () => {
    const ship = createShip(shipType.DESTROYER.type);

    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(false);
  });

  it('should be sunk if hit equal to its length', () => {
    const ship = createShip(shipType.DESTROYER.type);

    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(true);
  });

  it("should return the ship's type", () => {
    const ship = createShip(shipType.CARRIER.type);

    expect(ship.getType()).toBe('carrier');
  });
});
