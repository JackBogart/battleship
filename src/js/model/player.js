import { createGameboard } from './gameboard';

export const PlayerType = Object.freeze({
  HUMAN: Symbol('human'),
  COMPUTER: Symbol('computer'),
});

export function createPlayer(name, playerType) {
  const gameboard = createGameboard();

  const getName = () => name;

  const setName = (newName) => {
    name = newName;
  };

  const getPlayerType = () => playerType;

  const getShip = (row, col) => gameboard.getShip(row, col);

  const setShip = (ship, row, col, isVertical = false) => {
    gameboard.setShip(ship, row, col, isVertical);
  };
  const getInfoBoard = () => gameboard.getInfoBoard();

  const getTileInfo = (row, col) => gameboard.getTileInfo(row, col);

  const receiveAttack = (row, col) => {
    gameboard.receiveAttack(row, col);
  };

  const isFleetSunk = () => gameboard.isFleetSunk();

  const isValidPlacement = (ship, row, col, isVertical) =>
    gameboard.isValidPlacement(ship, row, col, isVertical);

  const getShipType = (row, col) => {
    const ship = getShip(row, col);
    return ship === null ? '' : ship.getType();
  };

  const removeAllShips = () => {
    gameboard.removeAllShips();
  };

  const getInitialPosition = (row, col) =>
    gameboard.getInitialPosition(row, col);

  return {
    getName,
    getPlayerType,
    setName,
    getShip,
    setShip,
    getInfoBoard,
    getTileInfo,
    receiveAttack,
    isFleetSunk,
    isValidPlacement,
    getShipType,
    removeAllShips,
    getInitialPosition,
  };
}
