import { ShipType, createShip } from './ship';

describe('Ship', () => {
  it('should return a length of 3', () => {
    const ship = createShip(ShipType.DESTROYER);

    const length = ship.getLength();

    expect(length).toBe(3);
  });

  it('should throw an error for an unknown ship type', () => {
    expect(() => createShip(ShipType.FAKE)).toThrow('Invalid ship type');
  });

  it('should not be sunk if hit fewer times than its length', () => {
    const ship = createShip(ShipType.DESTROYER);

    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(false);
  });

  it('should be sunk if hit equal to its length', () => {
    const ship = createShip(ShipType.DESTROYER);

    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(true);
  });

  it("should return the ship's type", () => {
    const ship = createShip(ShipType.CARRIER);

    expect(ship.getType()).toBe('carrier');
  });
});
