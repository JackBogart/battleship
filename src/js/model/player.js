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
  const setShip = (ship, row, col) => {
    gameboard.setShip(ship, row, col);
  };
  const getInfoBoard = () => gameboard.getInfoBoard();
  const getTileInfo = (row, col) => gameboard.getTileInfo(row, col);
  const receiveAttack = (row, col) => gameboard.receiveAttack(row, col);
  const isFleetSunk = () => gameboard.isFleetSunk();

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
  };
}
