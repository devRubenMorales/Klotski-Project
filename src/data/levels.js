/**
 * Catálogo oficial de los 15 niveles físicos originales del juego Klotski 3D
 * replicados con exactitud de las tarjetas reales (WhatsApp Image 2026-11-09 at 18.29.52.jpeg).
 *
 * Ordenamiento doble:
 * 1. Primero por `difficultyTier` (Tier 1 = 1 punto, Tier 2 = 2 puntos, Tier 3 = 3 puntos,
 *    Tier 4 = 4 puntos, Tier 5 = 'bar' barra blanca).
 * 2. En caso de empate dentro del mismo Tier, de menor a mayor según `optimalMoves` (pasos BFS).
 *
 * Distribución por gavetas:
 * - Izquierda (Retos 1 al 8): Niveles Iniciales / Intermedios
 * - Derecha (Retos 9 al 15): Niveles Avanzados / Maestros
 */

const DIMS = {
  R: [2, 2],
  V: [2, 1],
  H: [1, 2],
  Y: [1, 1],
};

function buildPieces(layout) {
  const pieces = {};
  for (const [id, type, r, c] of layout) {
    const [h, w] = DIMS[type];
    pieces[id] = { id, type, r, c, h, w };
  }
  return pieces;
}

/**
 * Calcula el peso numérico de dificultad (1 a 5) según el tipo/cantidad del indicador físico.
 * - 1 punto blanco = Tier 1
 * - 2 puntos blancos = Tier 2
 * - 3 puntos blancos = Tier 3
 * - 4 puntos blancos = Tier 4
 * - 'bar' (Barra blanca) = Tier 5
 */
export function getDifficultyTier(difficulty) {
  if (!difficulty) return 1;
  if (difficulty.type === 'bar') return 5;
  return Math.min(Math.max(Number(difficulty.count) || 1, 1), 4);
}

const RAW_LEVELS = [
  // ================= TIER 1 (1 Punto Blanco) =================
  {
    difficulty: {
      type: 'dots',
      count: 1,
      pattern: ['dot'],
      label: 'Iniciación',
    },
    optimalMoves: 22,
    pieces: buildPieces([
      ['Y1', 'Y', 0, 0],
      ['Y2', 'Y', 0, 1],
      ['Y3', 'Y', 0, 3],
      ['R', 'R', 1, 0],
      ['Y4', 'Y', 1, 3],
      ['Y5', 'Y', 2, 2],
      ['Y6', 'Y', 2, 3],
      ['Y7', 'Y', 3, 0],
      ['V1', 'V', 3, 1],
      ['V2', 'V', 3, 2],
      ['Y9', 'Y', 3, 3],
      ['Y8', 'Y', 4, 0],
      ['Y10', 'Y', 4, 3],
    ]),
  },

  // ================= TIER 2 (2 Puntos Blancos) =================
  {
    difficulty: {
      type: 'dots',
      count: 2,
      pattern: ['dot', 'dot'],
      label: 'Básico',
    },
    optimalMoves: 15,
    pieces: buildPieces([
      ['Y1', 'Y', 0, 0],
      ['H1', 'H', 0, 1],
      ['V1', 'V', 1, 0],
      ['Y2', 'Y', 1, 1],
      ['V2', 'V', 1, 2],
      ['Y4', 'Y', 1, 3],
      ['Y3', 'Y', 2, 1],
      ['H2', 'H', 3, 0],
      ['R', 'R', 3, 2],
      ['Y5', 'Y', 4, 0],
      ['Y6', 'Y', 4, 1],
    ]),
  },
  {
    difficulty: {
      type: 'dots',
      count: 2,
      pattern: ['dot', 'half-dot'],
      label: 'Iniciación+',
    },
    optimalMoves: 26,
    pieces: buildPieces([
      ['R', 'R', 0, 0],
      ['Y1', 'Y', 0, 2],
      ['V1', 'V', 0, 3],
      ['Y2', 'Y', 1, 2],
      ['Y3', 'Y', 2, 0],
      ['Y4', 'Y', 2, 1],
      ['V2', 'V', 2, 2],
      ['V3', 'V', 2, 3],
      ['Y5', 'Y', 3, 0],
      ['Y6', 'Y', 3, 1],
      ['Y7', 'Y', 4, 0],
      ['Y8', 'Y', 4, 1],
    ]),
  },

  // ================= TIER 3 (3 Puntos Blancos) =================
  {
    difficulty: {
      type: 'dots',
      count: 3,
      pattern: ['short-bar', 'dot', 'dot'],
      label: 'Táctico',
    },
    optimalMoves: 27,
    pieces: buildPieces([
      ['Y1', 'Y', 0, 2],
      ['Y2', 'Y', 0, 3],
      ['R', 'R', 1, 0],
      ['Y3', 'Y', 1, 2],
      ['V1', 'V', 1, 3],
      ['Y4', 'Y', 2, 2],
      ['H1', 'H', 3, 0],
      ['H2', 'H', 3, 2],
      ['Y5', 'Y', 4, 0],
      ['Y6', 'Y', 4, 1],
      ['H3', 'H', 4, 2],
    ]),
  },
  {
    difficulty: {
      type: 'dots',
      count: 3,
      pattern: ['dot', 'dot', 'dot'],
      label: 'Intermedio',
    },
    optimalMoves: 43,
    pieces: buildPieces([
      ['H1', 'H', 0, 0],
      ['H2', 'H', 0, 2],
      ['R', 'R', 1, 0],
      ['Y1', 'Y', 1, 2],
      ['Y2', 'Y', 1, 3],
      ['Y3', 'Y', 2, 2],
      ['Y4', 'Y', 2, 3],
      ['V1', 'V', 3, 1],
      ['H3', 'H', 3, 2],
      ['H4', 'H', 4, 2],
    ]),
  },
  {
    difficulty: {
      type: 'dots',
      count: 3,
      pattern: ['dot', 'dot', 'half-dot'],
      label: 'Intermedio+',
    },
    optimalMoves: 80,
    pieces: buildPieces([
      ['R', 'R', 0, 0],
      ['Y1', 'Y', 0, 2],
      ['V1', 'V', 0, 3],
      ['V2', 'V', 1, 2],
      ['H1', 'H', 2, 0],
      ['Y2', 'Y', 2, 3],
      ['Y3', 'Y', 3, 1],
      ['H2', 'H', 3, 2],
      ['H3', 'H', 4, 0],
      ['Y4', 'Y', 4, 2],
    ]),
  },

  // ================= TIER 4 (4 Puntos Blancos) =================
  {
    difficulty: {
      type: 'dots',
      count: 4,
      pattern: ['dot', 'dot', 'dot', 'half-dot'],
      label: 'Avanzado',
    },
    optimalMoves: 71,
    pieces: buildPieces([
      ['V1', 'V', 0, 0],
      ['H1', 'H', 0, 1],
      ['Y1', 'Y', 1, 1],
      ['R', 'R', 1, 2],
      ['Y2', 'Y', 2, 0],
      ['Y3', 'Y', 2, 1],
      ['V2', 'V', 3, 0],
      ['V3', 'V', 3, 1],
      ['H2', 'H', 3, 2],
      ['Y4', 'Y', 4, 2],
    ]),
  },
  {
    difficulty: {
      type: 'dots',
      count: 4,
      pattern: ['short-bar', 'short-bar'],
      label: 'Avanzado+',
    },
    optimalMoves: 90,
    pieces: buildPieces([
      ['V1', 'V', 0, 0],
      ['R', 'R', 0, 1],
      ['V2', 'V', 0, 3],
      ['V3', 'V', 2, 0],
      ['H1', 'H', 2, 1],
      ['V4', 'V', 2, 3],
      ['Y1', 'Y', 3, 1],
      ['Y2', 'Y', 3, 2],
      ['Y3', 'Y', 4, 0],
      ['Y4', 'Y', 4, 3],
    ]),
  },
  {
    difficulty: {
      type: 'dots',
      count: 4,
      pattern: ['dot', 'dot', 'dot', 'dot'],
      label: 'Experto',
    },
    optimalMoves: 109,
    pieces: buildPieces([
      ['R', 'R', 0, 0],
      ['Y1', 'Y', 0, 2],
      ['Y2', 'Y', 0, 3],
      ['H1', 'H', 1, 2],
      ['H2', 'H', 2, 0],
      ['Y3', 'Y', 2, 2],
      ['Y4', 'Y', 3, 0],
      ['V1', 'V', 3, 1],
      ['H3', 'H', 3, 2],
      ['H4', 'H', 4, 2],
    ]),
  },

  // ================= TIER 5 (Barra Blanca 'bar') =================
  {
    difficulty: {
      type: 'bar',
      count: 5,
      pattern: ['med-bar', 'dot'],
      label: 'Maestro',
    },
    optimalMoves: 143,
    pieces: buildPieces([
      ['V1', 'V', 0, 0],
      ['R', 'R', 0, 2],
      ['Y1', 'Y', 1, 1],
      ['H1', 'H', 2, 0],
      ['V2', 'V', 2, 2],
      ['Y2', 'Y', 2, 3],
      ['H2', 'H', 3, 0],
      ['Y3', 'Y', 3, 3],
      ['H3', 'H', 4, 1],
      ['Y4', 'Y', 4, 3],
    ]),
  },
  {
    difficulty: {
      type: 'bar',
      count: 5,
      pattern: ['full-bar'],
      label: 'Maestro',
    },
    optimalMoves: 144,
    pieces: buildPieces([
      ['R', 'R', 0, 0],
      ['Y1', 'Y', 0, 2],
      ['V1', 'V', 0, 3],
      ['V2', 'V', 2, 1],
      ['H1', 'H', 2, 2],
      ['Y2', 'Y', 3, 0],
      ['H2', 'H', 3, 2],
      ['Y3', 'Y', 4, 0],
      ['Y4', 'Y', 4, 1],
      ['H3', 'H', 4, 2],
    ]),
  },
  {
    difficulty: {
      type: 'bar',
      count: 5,
      pattern: ['med-bar'],
      label: 'Maestro',
    },
    optimalMoves: 144,
    pieces: buildPieces([
      ['Y1', 'Y', 0, 0],
      ['Y2', 'Y', 0, 2],
      ['Y3', 'Y', 0, 3],
      ['V1', 'V', 1, 0],
      ['R', 'R', 1, 2],
      ['V2', 'V', 2, 1],
      ['V3', 'V', 3, 0],
      ['H1', 'H', 3, 2],
      ['H2', 'H', 4, 1],
      ['Y4', 'Y', 4, 3],
    ]),
  },
  {
    difficulty: {
      type: 'bar',
      count: 5,
      pattern: ['med-bar', 'half-dot'],
      label: 'Maestro',
    },
    optimalMoves: 147,
    pieces: buildPieces([
      ['Y1', 'Y', 0, 1],
      ['Y2', 'Y', 0, 2],
      ['V1', 'V', 0, 3],
      ['R', 'R', 1, 0],
      ['Y3', 'Y', 1, 2],
      ['V2', 'V', 2, 2],
      ['V3', 'V', 2, 3],
      ['H1', 'H', 3, 0],
      ['Y4', 'Y', 4, 1],
      ['H2', 'H', 4, 2],
    ]),
  },
  {
    difficulty: {
      type: 'bar',
      count: 5,
      pattern: ['full-bar'],
      label: 'Maestro',
    },
    optimalMoves: 149,
    pieces: buildPieces([
      ['V1', 'V', 0, 0],
      ['Y1', 'Y', 0, 1],
      ['Y2', 'Y', 0, 2],
      ['Y3', 'Y', 0, 3],
      ['V2', 'V', 1, 1],
      ['R', 'R', 1, 2],
      ['V3', 'V', 2, 0],
      ['H1', 'H', 3, 1],
      ['Y4', 'Y', 3, 3],
      ['H2', 'H', 4, 1],
    ]),
  },
  {
    difficulty: {
      type: 'bar',
      count: 5,
      pattern: ['full-bar'],
      label: 'Maestro',
    },
    optimalMoves: 150,
    pieces: buildPieces([
      ['Y1', 'Y', 0, 0],
      ['Y2', 'Y', 0, 1],
      ['Y3', 'Y', 0, 2],
      ['V1', 'V', 0, 3],
      ['R', 'R', 1, 0],
      ['V2', 'V', 1, 2],
      ['V3', 'V', 2, 3],
      ['H1', 'H', 3, 1],
      ['Y4', 'Y', 4, 1],
      ['H2', 'H', 4, 2],
    ]),
  },
];

// Ordenamiento doble: 1° por difficultyTier (1 a 5), 2° por optimalMoves ascendente
export const LEVELS = [...RAW_LEVELS]
  .map((lvl) => ({
    ...lvl,
    difficultyTier: getDifficultyTier(lvl.difficulty),
    minSteps: lvl.optimalMoves,
  }))
  .sort(
    (a, b) =>
      a.difficultyTier - b.difficultyTier || a.optimalMoves - b.optimalMoves
  )
  .map((lvl, idx) => ({
    ...lvl,
    id: `level-${idx + 1}`,
    name: `Reto ${idx + 1}`,
  }));

export const DEFAULT_LEVEL = LEVELS[0];
