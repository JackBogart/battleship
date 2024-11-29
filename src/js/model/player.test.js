import { createGameboard } from './gameboard';
import { createComputerPlayer, createPlayer } from './player';
import { createShip } from './ship';
import { playerType, tileInfoType } from '../types';
import { getRandomInt, shuffleArray } from '../utils/random';

jest.mock('./gameboard', () => {
  const originalModule = jest.requireActual('./gameboard');

  return {
    __esModule: true,
    ...originalModule,
    createGameboard: jest.fn(),
  };
});
jest.mock('../utils/random');
jest.mock('./ship');

const gameboardInstance = {
  getShip: jest.fn(),
  setShip: jest.fn(),
  receiveAttack: jest.fn(),
  removeAllShips: jest.fn(),
  getInitialPosition: jest.fn(),
  getTileInfo: jest.fn(),
};

createGameboard.mockImplementation(() => gameboardInstance);
createShip.mockImplementation((shipType) => ({
  isSunk: jest.fn(),
  hit: jest.fn(),
  getLength: jest.fn(),
  getType: jest.fn().mockReturnValue(shipType),
}));

let player;

describe('player', () => {
  beforeEach(() => {
    player = createPlayer('Billy', playerType.HUMAN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a player's name", () => {
    const playerName = player.getName();

    expect(playerName).toBe('Billy');
  });

  it("should set a player's name", () => {
    player.setName('Joey');
    const playerName = player.getName();

    expect(playerName).toBe('Joey');
  });

  it("should return a human players's type", () => {
    const type = player.getType();

    expect(type).toBe(playerType.HUMAN);
  });

  it('should place a ship at the specified location', () => {
    const ship = createShip('destroyer');

    player.setShip(ship, 1, 2);

    expect(gameboardInstance.setShip).toHaveBeenCalledWith(ship, 1, 2, false);
  });

  it('should attack a ship at the specified location', () => {
    player.receiveAttack(1, 2);

    expect(gameboardInstance.receiveAttack).toHaveBeenCalledWith(1, 2);
  });

  it('should return an empty string when ship is null', () => {
    gameboardInstance.getShip.mockReturnValueOnce(null);

    const shipType = player.getShipType(1, 2);

    expect(shipType).toBe('');
  });

  it("should return an string representation of the ship's type", () => {
    gameboardInstance.getShip.mockReturnValueOnce(createShip('carrier'));

    const shipType = player.getShipType(1, 2);

    expect(shipType).toBe('carrier');
  });

  it('should remove all ships from the board', () => {
    player.removeAllShips();

    expect(gameboardInstance.removeAllShips).toHaveBeenCalledWith();
  });
});

describe('computer player', () => {
  beforeEach(() => {
    player = createComputerPlayer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a computer players's type", () => {
    const type = player.getType();

    expect(type).toBe(playerType.COMPUTER);
  });

  it('should return a valid attack location', () => {
    const infoBoard = new Array(10)
      .fill(null)
      .map(() => new Array(10).fill(tileInfoType.UNKNOWN));
    getRandomInt.mockReturnValueOnce(3).mockReturnValueOnce(5);

    const [row, col] = player.getComputerAttack(infoBoard);

    expect(row).toBe(3);
    expect(col).toBe(5);
  });

  it('should retry when a random location is already attacked', () => {
    const infoBoard = new Array(10)
      .fill(null)
      .map(() => new Array(10).fill(tileInfoType.UNKNOWN));
    infoBoard[3][5] = tileInfoType.HIT;
    getRandomInt
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(7);

    const [row, col] = player.getComputerAttack(infoBoard);

    expect(getRandomInt).toHaveBeenCalledTimes(4);
    expect(row).toBe(2);
    expect(col).toBe(7);
  });

  it('should attack an adjacent tile when the last attack was a hit', () => {
    const infoBoard = new Array(10)
      .fill(null)
      .map(() => new Array(10).fill(tileInfoType.UNKNOWN));
    infoBoard[3][5] = tileInfoType.HIT;
    player.updateLastAttack(3, 5);
    shuffleArray.mockReturnValueOnce([
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]);

    const [row, col] = player.getComputerAttack(infoBoard);

    expect(row).toBe(4);
    expect(col).toBe(5);
  });
});
