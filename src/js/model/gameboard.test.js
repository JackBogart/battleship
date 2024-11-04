import { createGameboard } from './gameboard';
import { createShip } from './ship';
import { TileInfoType } from '../types';

jest.mock('./ship', () => ({
  createShip: jest.fn(),
}));

createShip.mockImplementation((shipType) => ({
  isSunk: jest.fn(),
  hit: jest.fn(),
  getLength: jest.fn(),
  getType: jest.fn().mockReturnValue(shipType),
}));

let gameboard;

beforeEach(() => {
  gameboard = createGameboard();
});

describe('getShip', () => {
  it('should return null if there is no ship at the location', () => {
    const ship = gameboard.getShip(1, 1);

    expect(ship).toBeNull();
  });

  it('should return a ship if there is a ship at the location', () => {
    const ship = createShip('raft');
    ship.getLength.mockReturnValue(1);

    gameboard.setShip(ship, 1, 1, false);

    expect(gameboard.getShip(1, 1)).toBe(ship);
  });
});

describe('setShip', () => {
  it('should place a ship at the specified location', () => {
    const ship = createShip('raft');
    ship.getLength.mockReturnValue(1);

    gameboard.setShip(ship, 1, 1, false);

    expect(gameboard.getShip(1, 1)).toBe(ship);
  });

  it('should place a ship horizontally at specified location', () => {
    const ship = createShip('destroyer');
    ship.getLength.mockReturnValue(3);

    gameboard.setShip(ship, 1, 1, false);

    expect(gameboard.getShip(1, 1)).toBe(ship);
    expect(gameboard.getShip(1, 2)).toBe(ship);
    expect(gameboard.getShip(1, 3)).toBe(ship);
    expect(gameboard.getShip(1, 4)).not.toBe(ship);
  });

  it('should place a ship vertically at specified location', () => {
    const ship = createShip('destroyer');
    ship.getLength.mockReturnValue(3);

    gameboard.setShip(ship, 1, 1, true);

    expect(gameboard.getShip(1, 1)).toBe(ship);
    expect(gameboard.getShip(2, 1)).toBe(ship);
    expect(gameboard.getShip(3, 1)).toBe(ship);
    expect(gameboard.getShip(4, 1)).not.toBe(ship);
  });
});

describe('isValidPlacement', () => {
  it('should return false when the ship is partially out of bounds', () => {
    const ship = createShip('destroyer');
    ship.getLength.mockReturnValue(3);

    const isValidPlacement = gameboard.isValidPlacement(ship, 9, 9);

    expect(isValidPlacement).toBe(false);
  });

  it('should return false when ships placement overlaps another ship', () => {
    const ship1 = createShip('destroyer');
    const ship2 = createShip('destroyer');
    ship1.getLength.mockReturnValue(3);
    ship2.getLength.mockReturnValue(3);
    gameboard.setShip(ship1, 2, 1, false);

    const isValidPlacement = gameboard.isValidPlacement(ship2, 1, 2, true);

    expect(isValidPlacement).toBe(false);
  });

  it('should return true when ships placement overlaps itself', () => {
    const ship1 = createShip('destroyer');
    ship1.getLength.mockReturnValue(3);
    gameboard.setShip(ship1, 2, 3, false);

    const isValidPlacement = gameboard.isValidPlacement(ship1, 2, 2, false);

    expect(isValidPlacement).toBe(true);
  });
});

describe('infoBoard', () => {
  it('should return a 10x10 board with unknown tiles', () => {
    const infoBoard = gameboard.getInfoBoard();

    expect(
      infoBoard.every((row) =>
        row.every((tile) => tile === TileInfoType.UNKNOWN),
      ),
    ).toBe(true);
  });

  it("should return a tile that isn't hit", () => {
    const tileInfo = gameboard.getTileInfo(1, 1);

    expect(tileInfo).toBe(TileInfoType.UNKNOWN);
  });

  it('should mark an attacked empty tile as missed', () => {
    gameboard.receiveAttack(1, 1);
    const tileInfo = gameboard.getTileInfo(1, 1);

    expect(tileInfo).toBe(TileInfoType.MISSED);
  });

  it('should mark an attacked occupied tile as hit', () => {
    const ship = createShip('destroyer');
    ship.getLength.mockReturnValue(3);
    gameboard.setShip(ship, 1, 1, false);

    gameboard.receiveAttack(1, 1);
    const tileInfo = gameboard.getTileInfo(1, 1);

    expect(tileInfo).toBe(TileInfoType.HIT);
  });
});

describe('isFleetSunk', () => {
  it('should return true when all ships are sunk', () => {
    const ship1 = createShip('raft');
    const ship2 = createShip('raft');
    gameboard.setShip(ship1, 1, 1, false);
    gameboard.setShip(ship2, 2, 1, false);
    ship1.isSunk.mockReturnValue(false);
    ship2.isSunk.mockReturnValue(true);

    const isFleetSunk = gameboard.isFleetSunk();

    expect(isFleetSunk).toBe(true);
  });

  it('should return false when not all ships are sunk', () => {
    const ship1 = createShip('raft');
    const ship2 = createShip('raft');
    gameboard.setShip(ship1, 1, 1, false);
    gameboard.setShip(ship2, 2, 1, false);
    ship1.isSunk.mockReturnValue(true);
    ship2.isSunk.mockReturnValue(false);

    const isFleetSunk = gameboard.isFleetSunk();

    expect(isFleetSunk).toBe(false);
  });
});

describe('getInitialPosition', () => {
  it('should return the initial position data of the ship', () => {
    const ship1 = createShip('electric boogaloo');
    const ship2 = createShip('electric boogaloo 2');
    ship1.getLength.mockReturnValue(1);
    ship2.getLength.mockReturnValue(1);
    gameboard.setShip(ship1, 2, 1, true);
    gameboard.setShip(ship2, 5, 7, false);

    const positionData1 = gameboard.getInitialPosition('electric boogaloo');
    const positionData2 = gameboard.getInitialPosition('electric boogaloo 2');

    const expected1 = {
      row: 2,
      col: 1,
      isVertical: true,
    };
    const expected2 = {
      row: 5,
      col: 7,
      isVertical: false,
    };
    expect(positionData1).toEqual(expected1);
    expect(positionData2).toEqual(expected2);
  });

  it("should return undefined when the ship type hasn't been placed", () => {
    const positionData = gameboard.getInitialPosition('electric boogaloo');

    expect(positionData).toBeUndefined();
  });
});

describe('removeShip', () => {
  it('should remove the specified ship from the gameboard', () => {
    const ship1 = createShip('electric boogaloo');
    const ship2 = createShip('electric boogaloo 2');
    ship1.getLength.mockReturnValue(2);
    ship2.getLength.mockReturnValue(3);
    gameboard.setShip(ship1, 2, 1, true);
    gameboard.setShip(ship2, 5, 7, false);

    gameboard.removeShip(2, 1);

    expect(gameboard.getShip(2, 1)).toBeNull();
    expect(gameboard.getShip(3, 1)).toBeNull();
    expect(gameboard.getInitialPosition('electric boogaloo')).toBeUndefined();
    expect(gameboard.getShip(5, 7)).not.toBeNull();
    expect(
      gameboard.getInitialPosition('electric boogaloo 2'),
    ).not.toBeUndefined();
  });

  it('should throw and error when ship being removed is null', () => {
    expect(() => gameboard.removeShip(2, 1)).toThrow(
      'Cannot remove ship, no ship exists at location',
    );
  });
});

describe('removeAllShips', () => {
  it('should remove all ships from the gameboard', () => {
    const ship1 = createShip('electric boogaloo');
    const ship2 = createShip('electric boogaloo 2');
    ship1.getLength.mockReturnValue(2);
    ship2.getLength.mockReturnValue(3);
    gameboard.setShip(ship1, 2, 1, true);
    gameboard.setShip(ship2, 5, 7, false);

    gameboard.removeAllShips();

    expect(gameboard.getShip(2, 1)).toBeNull();
    expect(gameboard.getShip(3, 1)).toBeNull();
    expect(gameboard.getInitialPosition('electric boogaloo')).toBeUndefined();
    expect(gameboard.getShip(5, 7)).toBeNull();
    expect(gameboard.getShip(5, 8)).toBeNull();
    expect(gameboard.getShip(5, 9)).toBeNull();
    expect(gameboard.getInitialPosition('electric boogaloo 2')).toBeUndefined();
  });
});
