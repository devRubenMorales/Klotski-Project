export const PROGRESS_STORAGE_KEY = 'klotski_progress_v1';

/**
 * Carga el mapa de progreso guardado desde localStorage.
 * Estructura por levelId:
 * { completed: true, bestMoves: number, lastMoves: number, updatedAt: number }
 *
 * @returns {Record<string, { completed: boolean, bestMoves: number, lastMoves: number, updatedAt: number }>}
 */
export function loadProgress() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Obtiene el progreso guardado de un nivel específico.
 *
 * @param {string} levelId
 * @returns {{ completed: boolean, bestMoves: number, lastMoves: number, updatedAt: number } | null}
 */
export function getLevelProgress(levelId) {
  if (!levelId) return null;
  const all = loadProgress();
  return all[levelId] || null;
}

/**
 * Registra una victoria legítima (sin asistencia de IA) en localStorage.
 * Actualiza `bestMoves` únicamente si no existía récord previo o si `movesCount < bestMoves`.
 *
 * @param {string} levelId
 * @param {number} movesCount
 * @returns {{
 *   progress: Record<string, any>,
 *   levelProgress: { completed: boolean, bestMoves: number, lastMoves: number, updatedAt: number },
 *   isNewRecord: boolean
 * }}
 */
export function recordLevelVictory(levelId, movesCount) {
  const all = loadProgress();
  const prev = all[levelId];
  const validMoves = Math.max(1, Number(movesCount) || 1);

  const isNewRecord =
    !prev ||
    typeof prev.bestMoves !== 'number' ||
    validMoves < prev.bestMoves;

  const bestMoves = isNewRecord ? validMoves : prev.bestMoves;

  const entry = {
    completed: true,
    bestMoves,
    lastMoves: validMoves,
    updatedAt: Date.now(),
  };

  const updated = {
    ...all,
    [levelId]: entry,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignorar errores de cuota o modo privado restringido
    }
  }

  return {
    progress: updated,
    levelProgress: entry,
    isNewRecord,
  };
}

