export const playerType = Object.freeze({
  HUMAN: Symbol('human'),
  COMPUTER: Symbol('computer'),
});

const shipInfo = (type, length) => ({ type, length });

export const shipType = Object.freeze({
  CARRIER: shipInfo('carrier', 5),
  BATTLESHIP: shipInfo('battleship', 4),
  DESTROYER: shipInfo('destroyer', 3),
  SUBMARINE: shipInfo('submarine', 3),
  PATROL_BOAT: shipInfo('patrol-boat', 2),
});

export const tileInfoType = Object.freeze({
  UNKNOWN: Symbol('unknown'),
  MISSED: Symbol('missed'),
  HIT: Symbol('hit'),
});

export const formFieldType = Object.freeze({
  SHIPS: 'planning-ships',
  NAME: 'name',
  OPPONENT: 'opponent',
});
