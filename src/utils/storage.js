export const PROGRESS_STORAGE_KEY = 'klotski_progress_v1';

/**
 * Carga el mapa de progreso guardado desde localStorage.
 * Estructura por levelId:
 * {
 *   completed: true,
 *   bestMoves: number,
 *   lastMoves: number,
 *   attemptsCount: number,
 *   improvedRecord: boolean,
 *   updatedAt: number
 * }
 *
 * @returns {Record<string, any>}
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
 * @returns {Object | null}
 */
export function getLevelProgress(levelId) {
  if (!levelId) return null;
  const all = loadProgress();
  return all[levelId] || null;
}

/**
 * Registra una victoria legítima (sin asistencia de IA) en localStorage.
 * Distingue entre:
 * 1. Primera vez completado ('first_completion')
 * 2. Nivel ya completado antes, superando el récord personal con menos pasos ('improved_record')
 * 3. Nivel ya completado antes, con igual o más pasos ('completed_again')
 *
 * @param {string} levelId
 * @param {number} movesCount
 * @returns {{
 *   progress: Record<string, any>,
 *   levelProgress: Object,
 *   status: 'first_completion' | 'improved_record' | 'completed_again',
 *   isFirstCompletion: boolean,
 *   isNewRecord: boolean,
 *   improvedPersonalRecord: boolean,
 *   prevBestMoves: number | null,
 *   diff: number
 * }}
 */
export function recordLevelVictory(levelId, movesCount) {
  const all = loadProgress();
  const prev = all[levelId];
  const validMoves = Math.max(1, Number(movesCount) || 1);

  const wasCompletedBefore = Boolean(
    prev?.completed && typeof prev?.bestMoves === 'number'
  );
  const prevBestMoves = wasCompletedBefore ? prev.bestMoves : null;

  let status = 'first_completion';
  let isFirstCompletion = false;
  let isNewRecord = false;
  let improvedPersonalRecord = false;
  let diff = 0;
  let bestMoves = validMoves;

  if (!wasCompletedBefore) {
    // Caso 1: Primera vez completado
    status = 'first_completion';
    isFirstCompletion = true;
    isNewRecord = true;
    improvedPersonalRecord = false;
    bestMoves = validMoves;
  } else if (validMoves < prevBestMoves) {
    // Caso 2: Nivel ya completado antes, pero con MENOS pasos (Mejora de récord)
    status = 'improved_record';
    isFirstCompletion = false;
    isNewRecord = true;
    improvedPersonalRecord = true;
    diff = prevBestMoves - validMoves;
    bestMoves = validMoves;
  } else {
    // Caso 3: Nivel ya completado antes, con igual o más pasos (mantiene bestMoves histórico)
    status = 'completed_again';
    isFirstCompletion = false;
    isNewRecord = false;
    improvedPersonalRecord = false;
    diff = 0;
    bestMoves = prevBestMoves;
  }

  const attemptsCount = wasCompletedBefore
    ? (Number(prev.attemptsCount) || 1) + 1
    : 1;

  const entry = {
    completed: true,
    bestMoves,
    lastMoves: validMoves,
    attemptsCount,
    improvedRecord: Boolean(prev?.improvedRecord || improvedPersonalRecord),
    updatedAt: Date.now(),
  };

  const prevMeta = all._meta && typeof all._meta === 'object' ? all._meta : {};
  const updated = {
    ...all,
    [levelId]: entry,
    _meta: {
      ...prevMeta,
      personalBestUnlocked: Boolean(
        prevMeta.personalBestUnlocked || improvedPersonalRecord
      ),
      updatedAt: Date.now(),
    },
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // Ignorar errores de cuota o modo privado restringido
    }
  }

  return {
    progress: updated,
    levelProgress: entry,
    status,
    isFirstCompletion,
    isNewRecord,
    improvedPersonalRecord,
    prevBestMoves,
    diff,
  };
}
