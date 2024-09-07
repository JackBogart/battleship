import { createTile, States } from './tile';

let tile;

beforeEach(() => {
  tile = createTile();
});

test('tile state is unknown initially', () => {
  expect(tile.getState()).toBe(States.UNKNOWN);
});

test('getShip returns null if no ship exists', () => {
  expect(tile.getShip()).toBeNull();
});

test('getShip returns a ship if a ship exists', () => {
  const mockShip = {};

  tile.setShip(mockShip);

  expect(tile.getShip()).toBe(mockShip);
});

test('hit calls hit() on ship if a ship exists and updates the state', () => {
  const mockShip = { hit: jest.fn() };

  tile.setShip(mockShip);
  tile.hit();

  expect(mockShip.hit).toHaveBeenCalledTimes(1);
  expect(tile.getState()).toBe(States.HIT);
});

test('hit updates the state to miss if no ship exists', () => {
  tile.hit();

  expect(tile.getState()).toBe(States.MISS);
});

test('hit throws an error if that tile has already been hit', () => {
  tile.hit();

  expect(() => tile.hit()).toThrow('Tile has already been hit');
});
