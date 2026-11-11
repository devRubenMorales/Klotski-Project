import { LEVELS } from './levels.js';

/**
 * Calcula la medalla de eficiencia de un nivel completado sin IA
 * comparando `bestMoves` del jugador contra `optimalMoves` del Solver BFS:
 * - Oro ('gold'): bestMoves <= optimalMoves (Perfección)
 * - Plata ('silver'): bestMoves < optimalMoves * 1.25
 * - Bronce ('bronze'): Nivel resuelto sin IA (bestMoves >= optimalMoves * 1.25)
 *
 * @param {number|null|undefined} bestMoves
 * @param {number} optimalMoves
 * @returns {'gold' | 'silver' | 'bronze' | null}
 */
export function getEfficiencyMedal(bestMoves, optimalMoves) {
  if (typeof bestMoves !== 'number' || bestMoves <= 0) return null;
  if (bestMoves <= optimalMoves) return 'gold';
  if (bestMoves < optimalMoves * 1.25) return 'silver';
  return 'bronze';
}

/**
 * Metadatos visuales para cada tipo de medalla
 */
export const MEDAL_META = {
  gold: {
    id: 'gold',
    label: 'Medalla de Oro (Perfección)',
    shortLabel: 'ORO',
    icon: '🥇',
    borderClass:
      'border-amber-400/80 shadow-[0_0_16px_rgba(251,191,36,0.28)] bg-gradient-to-br from-amber-950/35 via-zinc-900/95 to-zinc-950',
    badgeClass:
      'bg-amber-400/20 text-amber-300 border border-amber-400/60',
  },
  silver: {
    id: 'silver',
    label: 'Medalla de Plata (< 1.25x óptimo)',
    shortLabel: 'PLATA',
    icon: '🥈',
    borderClass:
      'border-slate-300/70 shadow-[0_0_14px_rgba(203,213,225,0.2)] bg-gradient-to-br from-slate-900/50 via-zinc-900/95 to-zinc-950',
    badgeClass:
      'bg-slate-300/20 text-slate-200 border border-slate-300/50',
  },
  bronze: {
    id: 'bronze',
    label: 'Medalla de Bronce (Nivel Superado)',
    shortLabel: 'BRONCE',
    icon: '🥉',
    borderClass:
      'border-orange-500/60 shadow-[0_0_12px_rgba(249,115,22,0.18)] bg-gradient-to-br from-orange-950/30 via-zinc-900/95 to-zinc-950',
    badgeClass:
      'bg-orange-500/20 text-orange-300 border border-orange-500/50',
  },
};

/**
 * Catálogo de los 15 logros individuales por nivel
 */
export const LEVEL_ACHIEVEMENTS = LEVELS.map((lvl) => ({
  id: `ach-${lvl.id}`,
  levelId: lvl.id,
  levelName: lvl.name,
  title: `Dominador del ${lvl.name}`,
  completedTitle: `${lvl.name} Superado`,
  description: `Resuelve el ${lvl.name} sin asistencia de IA`,
  optimalMoves: lvl.optimalMoves ?? lvl.minSteps,
  difficultyTier: lvl.difficultyTier,
  level: lvl,
}));

/**
 * 4 Logros Globales Extra
 */
export const GLOBAL_ACHIEVEMENTS = [
  {
    id: 'first_step',
    title: 'Primer Paso',
    description: 'Resolver cualquier nivel por primera vez sin IA.',
    icon: '🌱',
  },
  {
    id: 'personal_best',
    title: 'Superación Personal',
    description:
      'Volver a jugar un nivel ya completado y batir tu propio récord haciendo menos pasos.',
    icon: '⚡',
  },
  {
    id: 'machine_precision',
    title: 'Precisión de Máquina',
    description:
      'Igualar los pasos óptimos de la IA en cualquier nivel sin usar ayuda.',
    icon: '🤖',
  },
  {
    id: 'grand_master',
    title: 'Gran Maestro Klotski',
    description: 'Completar los 15 niveles del juego sin IA.',
    icon: '👑',
  },
];

/**
 * Evalúa el estado completo de logros, medallas y estadísticas globales
 * a partir del objeto `progress` almacenado en localStorage.
 *
 * @param {Record<string, any>} progress
 * @param {Array<Object>} [levels=LEVELS]
 */
export function evaluateAchievements(progress = {}, levels = LEVELS) {
  let completedCount = 0;
  let goldCount = 0;
  let silverCount = 0;
  let bronzeCount = 0;
  let hasPersonalBestImprovement = Boolean(progress?._meta?.personalBestUnlocked);

  const levelItems = levels.map((lvl) => {
    const entry = progress?.[lvl.id] || null;
    const isCompleted = Boolean(entry?.completed);
    const bestMoves = isCompleted ? entry.bestMoves : null;
    const lastMoves = isCompleted ? entry.lastMoves : null;
    const optimalMoves = lvl.optimalMoves ?? lvl.minSteps;
    const medal = isCompleted
      ? getEfficiencyMedal(bestMoves, optimalMoves)
      : null;

    if (isCompleted) {
      completedCount++;
      if (medal === 'gold') goldCount++;
      else if (medal === 'silver') silverCount++;
      else if (medal === 'bronze') bronzeCount++;

      if (entry?.improvedRecord) {
        hasPersonalBestImprovement = true;
      }
    }

    const diffFromOptimal =
      isCompleted && typeof bestMoves === 'number'
        ? Math.max(0, bestMoves - optimalMoves)
        : null;

    return {
      id: `ach-${lvl.id}`,
      levelId: lvl.id,
      levelName: lvl.name,
      title: `Dominador del ${lvl.name}`,
      completedTitle: `${lvl.name} Superado`,
      description: `Resuelve el ${lvl.name} sin asistencia de IA`,
      optimalMoves,
      difficultyTier: lvl.difficultyTier,
      level: lvl,
      isCompleted,
      bestMoves,
      lastMoves,
      attemptsCount: entry?.attemptsCount || 0,
      improvedRecord: Boolean(entry?.improvedRecord),
      medal,
      medalMeta: medal ? MEDAL_META[medal] : null,
      diffFromOptimal,
    };
  });

  const globalStatus = {
    first_step: completedCount >= 1,
    personal_best: hasPersonalBestImprovement,
    machine_precision: goldCount >= 1,
    grand_master: completedCount >= levels.length,
  };

  const globalItems = GLOBAL_ACHIEVEMENTS.map((g) => ({
    ...g,
    unlocked: Boolean(globalStatus[g.id]),
  }));

  const totalLevels = levels.length;
  const completionPercent =
    totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;

  return {
    levelItems,
    globalItems,
    completedCount,
    totalLevels,
    completionPercent,
    goldCount,
    silverCount,
    bronzeCount,
  };
}

