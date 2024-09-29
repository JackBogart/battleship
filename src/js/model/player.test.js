import { createGameboard } from './gameboard';
import { PlayerType, createPlayer } from './player';
import { createShip } from './ship';

jest.mock('./gameboard', () => ({
  createGameboard: jest.fn(),
}));

const gameboardInstance = {
  setShip: jest.fn(),
  receiveAttack: jest.fn(),
};

createGameboard.mockImplementation(() => gameboardInstance);

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
    const playerType = player.getPlayerType();

    expect(playerType).toBe(PlayerType.HUMAN);
  });

  it("should return a computer players's type", () => {
    player = createPlayer('Computer', PlayerType.COMPUTER);

    const playerType = player.getPlayerType();

    expect(playerType).toBe(PlayerType.COMPUTER);
  });

  it('should place a ship at the specified location', () => {
    const ship = createShip(3);

    player.setShip(ship, 1, 2);

    expect(gameboardInstance.setShip).toHaveBeenCalledWith(ship, 1, 2);
  });

  it('should attack a ship at the specified location', () => {
    player.receiveAttack(1, 2);

    expect(gameboardInstance.receiveAttack).toHaveBeenCalledWith(1, 2);
  });
});
