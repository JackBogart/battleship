import { createGameboard } from './gameboard';
import { PlayerType, createPlayer } from './player';
import { createShip } from './ship';

jest.mock('./gameboard', () => ({
  createGameboard: jest.fn(),
}));

const gameboardInstance = {
  getShip: jest.fn(),
  setShip: jest.fn(),
  receiveAttack: jest.fn(),
  removeAllShips: jest.fn(),
  getInitialPosition: jest.fn(),
};

jest.mock('./ship', () => ({
  createShip: jest.fn(),
}));

createGameboard.mockImplementation(() => gameboardInstance);
createShip.mockImplementation((shipType) => ({
  isSunk: jest.fn(),
  hit: jest.fn(),
  getLength: jest.fn(),
  getType: jest.fn().mockReturnValue(shipType),
}));

describe('player', () => {
  let player;

  beforeEach(() => {
    player = createPlayer('Billy', PlayerType.HUMAN);
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
    const playerType = player.getType();

    expect(playerType).toBe(PlayerType.HUMAN);
  });

  it("should return a computer players's type", () => {
    player = createPlayer('Computer', PlayerType.COMPUTER);

    const playerType = player.getType();

    expect(playerType).toBe(PlayerType.COMPUTER);
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
