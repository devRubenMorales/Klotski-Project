import { ROWS, COLS, INITIAL_PIECES, GOAL_POSITION, DIRECTIONS } from './constants.js';

/**
 * Genera una matriz 2D de 5x4 representando el tablero.
 * Cada celda contiene el pieceId de la pieza que la ocupa o null si está vacía.
 *
 * @param {Record<string, { id: string, r: number, c: number, h: number, w: number }>} pieces
 * @returns {(string|null)[][]}
 */
export function createGrid(pieces) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  for (const p of Object.values(pieces)) {
    for (let dr = 0; dr < p.h; dr++) {
      for (let dc = 0; dc < p.w; dc++) {
        grid[p.r + dr][p.c + dc] = p.id;
      }
    }
  }
  return grid;
}

/**
 * Calcula en tiempo real las restricciones de desplazamiento ortogonal
 * para una pieza dada según la ocupación actual del tablero (5x4).
 *
 * @param {Object} piece - { id, r, c, h, w }
 * @param {(string|null)[][]} grid - Matriz actual del tablero
 * @returns {{ up: number, down: number, left: number, right: number }} Pasos máximos (0, 1 o 2)
 */
export function getPieceDragBounds(piece, grid) {
  const { id, r, c, h, w } = piece;
  let up = 0;
  let down = 0;
  let left = 0;
  let right = 0;

  // ARRIBA
  for (let step = 1; step <= 2; step++) {
    const nr = r - step;
    if (nr < 0) break;
    let free = true;
    for (let dc = 0; dc < w; dc++) {
      const cell = grid[nr][c + dc];
      if (cell !== null && cell !== id) {
        free = false;
        break;
      }
    }
    if (free) up = step;
    else break;
  }

  // ABAJO
  for (let step = 1; step <= 2; step++) {
    const nr = r + h - 1 + step;
    if (nr >= ROWS) break;
    let free = true;
    for (let dc = 0; dc < w; dc++) {
      const cell = grid[nr][c + dc];
      if (cell !== null && cell !== id) {
        free = false;
        break;
      }
    }
    if (free) down = step;
    else break;
  }

  // IZQUIERDA
  for (let step = 1; step <= 2; step++) {
    const nc = c - step;
    if (nc < 0) break;
    let free = true;
    for (let dr = 0; dr < h; dr++) {
      const cell = grid[r + dr][nc];
      if (cell !== null && cell !== id) {
        free = false;
        break;
      }
    }
    if (free) left = step;
    else break;
  }

  // DERECHA
  for (let step = 1; step <= 2; step++) {
    const nc = c + w - 1 + step;
    if (nc >= COLS) break;
    let free = true;
    for (let dr = 0; dr < h; dr++) {
      const cell = grid[r + dr][nc];
      if (cell !== null && cell !== id) {
        free = false;
        break;
      }
    }
    if (free) right = step;
    else break;
  }

  return { up, down, left, right };
}

/**
 * Obtiene la clave de serialización canónica para un estado del tablero.
 * Dado que las fichas del mismo tipo son indistinguibles, agrupa y ordena
 * sus coordenadas para evitar estados simétricos o duplicados.
 *
 * Formato: R:[r,c]|V:sorted([[r,c]...])|H:sorted([[r,c]...])|Y:sorted([[r,c]...])
 *
 * @param {Record<string, { id: string, type: string, r: number, c: number }>} pieces
 * @returns {string}
 */
export function getCanonicalKey(pieces) {
  const R = pieces.R;
  const V = [];
  const H = [];
  const Y = [];

  for (const p of Object.values(pieces)) {
    if (p.type === 'V') V.push(p);
    else if (p.type === 'H') H.push(p);
    else if (p.type === 'Y') Y.push(p);
  }

  const sortFn = (a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c);
  V.sort(sortFn);
  H.sort(sortFn);
  Y.sort(sortFn);

  const formatCoord = (p) => `${p.r},${p.c}`;

  return `R:${R.r},${R.c}|V:${V.map(formatCoord).join(';')}|H:${H.map(formatCoord).join(';')}|Y:${Y.map(formatCoord).join(';')}`;
}

const vBuf = new Int8Array(10);
const hBuf = new Int8Array(10);
const yBuf = new Int8Array(20);

/**
 * Versión optimizada y general de serialización canónica para el bucle BFS
 * compatible con cualquier cantidad de piezas V (2x1), H (1x2) e Y (1x1).
 */
function getCanonicalKeyFast(pieces, vKeys, hKeys, yKeys, movedId, newR, newC) {
  const R_r = movedId === 'R' ? newR : pieces.R.r;
  const R_c = movedId === 'R' ? newC : pieces.R.c;

  const vLen = vKeys.length;
  for (let i = 0; i < vLen; i++) {
    const id = vKeys[i];
    const r = id === movedId ? newR : pieces[id].r;
    const c = id === movedId ? newC : pieces[id].c;
    const val = (r << 2) | c;
    // Insertion sort
    let j = i - 1;
    while (j >= 0 && vBuf[j] > val) {
      vBuf[j + 1] = vBuf[j];
      j--;
    }
    vBuf[j + 1] = val;
  }

  const hLen = hKeys.length;
  for (let i = 0; i < hLen; i++) {
    const id = hKeys[i];
    const r = id === movedId ? newR : pieces[id].r;
    const c = id === movedId ? newC : pieces[id].c;
    const val = (r << 2) | c;
    let j = i - 1;
    while (j >= 0 && hBuf[j] > val) {
      hBuf[j + 1] = hBuf[j];
      j--;
    }
    hBuf[j + 1] = val;
  }

  const yLen = yKeys.length;
  for (let i = 0; i < yLen; i++) {
    const id = yKeys[i];
    const r = id === movedId ? newR : pieces[id].r;
    const c = id === movedId ? newC : pieces[id].c;
    const val = (r << 2) | c;
    let j = i - 1;
    while (j >= 0 && yBuf[j] > val) {
      yBuf[j + 1] = yBuf[j];
      j--;
    }
    yBuf[j + 1] = val;
  }

  let key = `R:${R_r},${R_c}|V:`;
  for (let i = 0; i < vLen; i++) {
    const v = vBuf[i];
    key += (i > 0 ? ';' : '') + (v >> 2) + ',' + (v & 3);
  }
  key += '|H:';
  for (let i = 0; i < hLen; i++) {
    const h = hBuf[i];
    key += (i > 0 ? ';' : '') + (h >> 2) + ',' + (h & 3);
  }
  key += '|Y:';
  for (let i = 0; i < yLen; i++) {
    const y = yBuf[i];
    key += (i > 0 ? ';' : '') + (y >> 2) + ',' + (y & 3);
  }

  return key;
}

const DIR_ENTRIES = [
  DIRECTIONS.UP,
  DIRECTIONS.DOWN,
  DIRECTIONS.LEFT,
  DIRECTIONS.RIGHT,
];

/**
 * Obtiene todos los movimientos válidos desde un estado dado.
 *
 * @param {Record<string, any>} pieces
 * @param {(string|null)[][]} [grid]
 * @returns {Array<{ pieceId: string, pieceType: string, direction: string, steps: number, from: [number, number], to: [number, number], nextPieces: Record<string, any> }>}
 */
export function getValidMoves(pieces, grid = null) {
  const g = grid || createGrid(pieces);
  const moves = [];

  for (const p of Object.values(pieces)) {
    for (const dir of DIR_ENTRIES) {
      // Paso 1
      const nr1 = p.r + dir.dr;
      const nc1 = p.c + dir.dc;

      if (nr1 >= 0 && nr1 + p.h <= ROWS && nc1 >= 0 && nc1 + p.w <= COLS) {
        let valid1 = true;
        for (let dr = 0; dr < p.h; dr++) {
          for (let dc = 0; dc < p.w; dc++) {
            const cell = g[nr1 + dr][nc1 + dc];
            if (cell !== null && cell !== p.id) {
              valid1 = false;
              break;
            }
          }
          if (!valid1) break;
        }

        if (valid1) {
          const nextPieces1 = { ...pieces, [p.id]: { ...p, r: nr1, c: nc1 } };
          moves.push({
            pieceId: p.id,
            pieceType: p.type,
            direction: dir.name,
            steps: 1,
            from: [p.r, p.c],
            to: [nr1, nc1],
            nextPieces: nextPieces1,
          });

          // Paso 2 (desplazamiento continuo en la misma dirección)
          const nr2 = p.r + 2 * dir.dr;
          const nc2 = p.c + 2 * dir.dc;
          if (nr2 >= 0 && nr2 + p.h <= ROWS && nc2 >= 0 && nc2 + p.w <= COLS) {
            let valid2 = true;
            for (let dr = 0; dr < p.h; dr++) {
              for (let dc = 0; dc < p.w; dc++) {
                const cell = g[nr2 + dr][nc2 + dc];
                if (cell !== null && cell !== p.id) {
                  valid2 = false;
                  break;
                }
              }
              if (!valid2) break;
            }

            if (valid2) {
              const nextPieces2 = { ...pieces, [p.id]: { ...p, r: nr2, c: nc2 } };
              moves.push({
                pieceId: p.id,
                pieceType: p.type,
                direction: dir.name,
                steps: 2,
                from: [p.r, p.c],
                to: [nr2, nc2],
                nextPieces: nextPieces2,
              });
            }
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Resuelve el rompecabezas Klotski mediante BFS determinista y optimizado.
 *
 * @param {Record<string, any>} [initialPieces=INITIAL_PIECES]
 * @returns {{
 *   moves: Array<{ pieceId: string, pieceType: string, direction: string, steps: number, from: [number, number], to: [number, number], boardState: Record<string, any> }>,
 *   history: Array<Record<string, any>>,
 *   totalStatesExplored: number,
 *   timeMs: number,
 *   isSolvable: boolean
 * }}
 */
export function solveKlotski(initialPieces = INITIAL_PIECES) {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  // Comprobar si ya está resuelto
  if (
    initialPieces.R.r === GOAL_POSITION.r &&
    initialPieces.R.c === GOAL_POSITION.c
  ) {
    return {
      moves: [],
      history: [initialPieces],
      totalStatesExplored: 1,
      timeMs: 0,
      isSolvable: true,
    };
  }

  const pieceKeys = Object.keys(initialPieces);
  const vKeys = pieceKeys.filter((k) => initialPieces[k].type === 'V');
  const hKeys = pieceKeys.filter((k) => initialPieces[k].type === 'H');
  const yKeys = pieceKeys.filter((k) => initialPieces[k].type === 'Y');
  const flatGrid = new Int8Array(ROWS * COLS);

  const startKey = getCanonicalKey(initialPieces);
  const visited = new Set([startKey]);

  // Cola para BFS
  const queue = [{ pieces: initialPieces, parent: null, move: null }];
  let head = 0;
  let goalNode = null;

  while (head < queue.length) {
    const node = queue[head];
    const { pieces } = node;

    // Condición de victoria
    if (
      pieces.R.r === GOAL_POSITION.r &&
      pieces.R.c === GOAL_POSITION.c
    ) {
      goalNode = node;
      break;
    }

    // Llenar flatGrid para detección rápida de colisiones
    flatGrid.fill(-1);
    for (let i = 0; i < pieceKeys.length; i++) {
      const p = pieces[pieceKeys[i]];
      for (let dr = 0; dr < p.h; dr++) {
        for (let dc = 0; dc < p.w; dc++) {
          flatGrid[(p.r + dr) * COLS + (p.c + dc)] = i;
        }
      }
    }

    // Explorar cada pieza en las 4 direcciones
    for (let i = 0; i < pieceKeys.length; i++) {
      const p = pieces[pieceKeys[i]];

      for (let d = 0; d < 4; d++) {
        const dir = DIR_ENTRIES[d];

        // Paso 1
        const nr1 = p.r + dir.dr;
        const nc1 = p.c + dir.dc;

        if (nr1 >= 0 && nr1 + p.h <= ROWS && nc1 >= 0 && nc1 + p.w <= COLS) {
          let valid1 = true;
          for (let dr = 0; dr < p.h; dr++) {
            for (let dc = 0; dc < p.w; dc++) {
              const cell = flatGrid[(nr1 + dr) * COLS + (nc1 + dc)];
              if (cell !== -1 && cell !== i) {
                valid1 = false;
                break;
              }
            }
            if (!valid1) break;
          }

          if (valid1) {
            const key1 = getCanonicalKeyFast(pieces, vKeys, hKeys, yKeys, p.id, nr1, nc1);

            if (!visited.has(key1)) {
              visited.add(key1);
              const nextPieces1 = { ...pieces, [p.id]: { ...p, r: nr1, c: nc1 } };
              queue.push({
                pieces: nextPieces1,
                parent: node,
                move: {
                  pieceId: p.id,
                  pieceType: p.type,
                  direction: dir.name,
                  steps: 1,
                  from: [p.r, p.c],
                  to: [nr1, nc1],
                },
              });
            }

            // Paso 2 (desplazamiento continuo en la misma dirección)
            const nr2 = p.r + 2 * dir.dr;
            const nc2 = p.c + 2 * dir.dc;

            if (nr2 >= 0 && nr2 + p.h <= ROWS && nc2 >= 0 && nc2 + p.w <= COLS) {
              let valid2 = true;
              for (let dr = 0; dr < p.h; dr++) {
                for (let dc = 0; dc < p.w; dc++) {
                  const cell = flatGrid[(nr2 + dr) * COLS + (nc2 + dc)];
                  if (cell !== -1 && cell !== i) {
                    valid2 = false;
                    break;
                  }
                }
                if (!valid2) break;
              }

              if (valid2) {
                const key2 = getCanonicalKeyFast(pieces, vKeys, hKeys, yKeys, p.id, nr2, nc2);

                if (!visited.has(key2)) {
                  visited.add(key2);
                  const nextPieces2 = { ...pieces, [p.id]: { ...p, r: nr2, c: nc2 } };
                  queue.push({
                    pieces: nextPieces2,
                    parent: node,
                    move: {
                      pieceId: p.id,
                      pieceType: p.type,
                      direction: dir.name,
                      steps: 2,
                      from: [p.r, p.c],
                      to: [nr2, nc2],
                    },
                  });
                }
              }
            }
          }
        }
      }
    }

    head++;
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const timeMs = Number((endTime - startTime).toFixed(2));

  if (!goalNode) {
    return {
      moves: [],
      history: [initialPieces],
      totalStatesExplored: visited.size,
      timeMs,
      isSolvable: false,
    };
  }

  // Reconstrucción del camino
  const moves = [];
  const history = [];
  let curr = goalNode;

  while (curr) {
    history.push(curr.pieces);
    if (curr.move) {
      moves.push({
        ...curr.move,
        boardState: curr.pieces,
      });
    }
    curr = curr.parent;
  }

  history.reverse();
  moves.reverse();

  return {
    moves,
    history,
    totalStatesExplored: visited.size,
    timeMs,
    isSolvable: true,
  };
}

