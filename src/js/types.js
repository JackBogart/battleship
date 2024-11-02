export const PlayerType = Object.freeze({
  HUMAN: Symbol('human'),
  COMPUTER: Symbol('computer'),
});

export const ShipType = Object.freeze({
  CARRIER: 'carrier',
  BATTLESHIP: 'battleship',
  DESTROYER: 'destroyer',
  SUBMARINE: 'submarine',
  PATROL_BOAT: 'patrol-boat',
});

export const TileInfoType = Object.freeze({
  UNKNOWN: Symbol('unknown'),
  MISSED: Symbol('missed'),
  HIT: Symbol('hit'),
});
