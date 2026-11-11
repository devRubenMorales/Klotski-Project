export const ROWS = 5;
export const COLS = 4;

export const PIECE_TYPES = {
  R: { type: 'R', h: 2, w: 2, name: 'Bloque Rojo' },
  V: { type: 'V', h: 2, w: 1, name: 'Barra Vertical' },
  H: { type: 'H', h: 1, w: 2, name: 'Barra Horizontal' },
  Y: { type: 'Y', h: 1, w: 1, name: 'Ficha Amarilla' },
};

export const INITIAL_PIECES = {
  R:  { id: 'R',  type: 'R', r: 0, c: 0, h: 2, w: 2 },
  Y1: { id: 'Y1', type: 'Y', r: 0, c: 2, h: 1, w: 1 },
  V1: { id: 'V1', type: 'V', r: 0, c: 3, h: 2, w: 1 },
  V2: { id: 'V2', type: 'V', r: 2, c: 1, h: 2, w: 1 },
  H1: { id: 'H1', type: 'H', r: 2, c: 2, h: 1, w: 2 },
  Y2: { id: 'Y2', type: 'Y', r: 3, c: 0, h: 1, w: 1 },
  H2: { id: 'H2', type: 'H', r: 3, c: 2, h: 1, w: 2 },
  Y3: { id: 'Y3', type: 'Y', r: 4, c: 0, h: 1, w: 1 },
  Y4: { id: 'Y4', type: 'Y', r: 4, c: 1, h: 1, w: 1 },
  H3: { id: 'H3', type: 'H', r: 4, c: 2, h: 1, w: 2 },
};

export const GOAL_POSITION = {
  pieceId: 'R',
  r: 3,
  c: 1,
};

export const DIRECTIONS = {
  UP:    { dr: -1, dc:  0, name: 'ARRIBA' },
  DOWN:  { dr:  1, dc:  0, name: 'ABAJO' },
  LEFT:  { dr:  0, dc: -1, name: 'IZQUIERDA' },
  RIGHT: { dr:  0, dc:  1, name: 'DERECHA' },
};

