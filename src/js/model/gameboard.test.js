import { createGameboard, TileInfo } from './gameboard';
import createShip from './ship';

jest.mock('./ship', () =>
  jest.fn((length) => ({
    getLength: jest.fn().mockReturnValue(length),
    isSunk: jest.fn(),
    hit: jest.fn(),
  })),
);

let gameboard;

beforeEach(() => {
  gameboard = createGameboard();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('getShip', () => {
  it('should return null if there is no ship at the location', () => {
    const ship = gameboard.getShip(1, 1);

    expect(ship).toBeNull();
  });

  it('should return a ship if there is a ship at the location', () => {
    const ship = createShip(1);

    gameboard.setShip(ship, 1, 1);

    expect(gameboard.getShip(1, 1)).toBe(ship);
  });

  it('should throw an error if the location is invalid', () => {
    expect(() => gameboard.getShip(15, 1)).toThrow(
      'Cannot get ship out of bounds',
    );
    expect(() => gameboard.getShip(1, 10)).toThrow(
      'Cannot get ship out of bounds',
    );
    expect(() => gameboard.getShip(-12, 1)).toThrow(
      'Cannot get ship out of bounds',
    );
    expect(() => gameboard.getShip(1, -1)).toThrow(
      'Cannot get ship out of bounds',
    );
  });
});

describe('setShip', () => {
  it('should place a ship at the specified location', () => {
    const ship = createShip(1);

    const isValidPlacement = gameboard.setShip(ship, 1, 1);

    expect(isValidPlacement).toBe(true);
    expect(gameboard.getShip(1, 1)).toBe(ship);
  });

  it('should throw an error if the location is invalid', () => {
    const ship = createShip(1);

    expect(() => gameboard.setShip(ship, 15, 1)).toThrow(
      'Cannot place ship out of bounds',
    );
    expect(() => gameboard.setShip(ship, 1, 10)).toThrow(
      'Cannot place ship out of bounds',
    );
    expect(() => gameboard.setShip(ship, -12, 1)).toThrow(
      'Cannot place ship out of bounds',
    );
    expect(() => gameboard.setShip(ship, 1, -1)).toThrow(
      'Cannot place ship out of bounds',
    );
  });

  it('should place a ship horizontally at specified location', () => {
    const ship = createShip(3);

    gameboard.setShip(ship, 1, 1);

    expect(gameboard.getShip(1, 1)).toBe(ship);
    expect(gameboard.getShip(1, 2)).toBe(ship);
    expect(gameboard.getShip(1, 3)).toBe(ship);
    expect(gameboard.getShip(1, 4)).not.toBe(ship);
  });

  it('should place a ship vertically at specified location', () => {
    const ship = createShip(3);

    gameboard.setShip(ship, 1, 1, true);

    expect(gameboard.getShip(1, 1)).toBe(ship);
    expect(gameboard.getShip(2, 1)).toBe(ship);
    expect(gameboard.getShip(3, 1)).toBe(ship);
    expect(gameboard.getShip(4, 1)).not.toBe(ship);
  });

  it('should return false when the ship is partially out of bounds', () => {
    const ship = createShip(3);

    const isValidPlacement = gameboard.setShip(ship, 9, 9);

    expect(isValidPlacement).toBe(false);
  });

  it('should return false when ships placement overlaps another ship', () => {
    const ship1 = createShip(3);
    const ship2 = createShip(3);
    gameboard.setShip(ship1, 2, 1, false);

    const isValidPlacement = gameboard.setShip(ship2, 1, 2, true);

    expect(isValidPlacement).toBe(false);
  });

  it('should return a 10x10 board with unknown tiles', () => {
    const infoBoard = gameboard.getInfoBoard();

    expect(
      infoBoard.every((row) => row.every((tile) => tile === TileInfo.UNKNOWN)),
    );
  });

  it("should return a tile that isn't hit", () => {
    const tileInfo = gameboard.getTileInfo(1, 1);

    expect(tileInfo).toBe(TileInfo.UNKNOWN);
  });

  it('should mark an attacked empty tile as missed', () => {
    const attacked = gameboard.receiveAttack(1, 1);
    const tileInfo = gameboard.getTileInfo(1, 1);

    expect(attacked).toBe(true);
    expect(tileInfo).toBe(TileInfo.MISSED);
  });

  it('should mark an attacked occupied tile as hit', () => {
    const ship = createShip(3);
    gameboard.setShip(ship, 1, 1, false);

    const attacked = gameboard.receiveAttack(1, 1);
    const tileInfo = gameboard.getTileInfo(1, 1);

    expect(attacked).toBe(true);
    expect(tileInfo).toBe(TileInfo.HIT);
  });

  it('should return false when attacking a marked tile', () => {
    const ship = createShip(3);
    gameboard.setShip(ship, 1, 1, false);
    gameboard.receiveAttack(1, 1);
    gameboard.receiveAttack(1, 2);

    const attack1 = gameboard.receiveAttack(1, 1);
    const attack2 = gameboard.receiveAttack(1, 2);

    expect(attack1).toBe(false);
    expect(attack2).toBe(false);
  });

  it('should return false when not all ships are sunk', () => {
    const ship1 = createShip(1);
    const ship2 = createShip(1);
    gameboard.setShip(ship1, 1, 1, false);
    gameboard.setShip(ship2, 2, 1, false);
    ship1.isSunk.mockReturnValue(true);
    ship2.isSunk.mockReturnValue(false);

    const isFleetSunk = gameboard.isFleetSunk();

    expect(isFleetSunk).toBe(false);
  });

  it('should return true when all ships are sunk', () => {
    const ship = createShip(1);
    ship.isSunk.mockReturnValue(true);
    gameboard.setShip(ship, 1, 1, false);

    const isFleetSunk = gameboard.isFleetSunk();

    expect(isFleetSunk).toBe(true);
  });

  it('should throw an error if the attacked location is invalid', () => {
    expect(() => gameboard.receiveAttack(-1, 1)).toThrow(
      'Cannot attack ship out of bounds',
    );
  });
});
