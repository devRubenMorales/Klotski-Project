import { evaluateAchievements } from '../data/achievements.js';
import { LEVELS } from '../data/levels.js';

/**
 * Componente AchievementsModal: Sala de Trofeos y Récords.
 * Muestra el progreso global, medallas de eficiencia (Bronce, Plata, Oro),
 * los 4 logros globales y la grilla de los 15 niveles con botón directo "Mejorar marca ↻".
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {Record<string, any>} [props.progress] - Progreso guardado en localStorage
 * @param {Function} props.onClose - Cerrar el modal
 * @param {Function} props.onSelectLevelToImprove - Cargar nivel en paso 0 sin IA y cerrar modal
 */
export default function AchievementsModal({
  isOpen,
  progress = {},
  onClose,
  onSelectLevelToImprove,
}) {
  if (!isOpen) return null;

  const {
    levelItems,
    globalItems,
    completedCount,
    totalLevels,
    completionPercent,
    goldCount,
    silverCount,
    bronzeCount,
  } = evaluateAchievements(progress, LEVELS);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sala de Trofeos y Récords"
      onClick={onClose}
      className="fixed inset-0 z-50 backdrop-blur-md bg-zinc-950/90 flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn"
    >
      {/* Contenedor Principal del Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-zinc-900/95 border-2 border-zinc-800 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.12)] overflow-hidden flex flex-col max-h-[90dvh]"
      >
        {/* ================= CABECERA DEL MODAL ================= */}
        <div className="px-4 sm:px-6 py-4 bg-zinc-950/90 border-b border-zinc-800/90 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-cyan-500/20 border border-amber-400/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(251,191,36,0.25)] shrink-0">
                🏆
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-mono font-extrabold tracking-wider text-white uppercase flex items-center gap-2">
                  <span>SALA DE TROFEOS Y RÉCORDS</span>
                </h2>
                <p className="text-[11px] sm:text-xs font-mono text-zinc-400">
                  Completa los retos sin asistencia de IA para registrar tus marcas y medallas
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              title="Cerrar Sala de Trofeos (Esc)"
              className="w-8 h-8 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Barra de Progreso General y Contador de Medallas */}
          <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-3">
            {/* Progreso % */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-300 font-semibold">
                  PROGRESO GENERAL:{' '}
                  <span className="text-cyan-400 font-bold">
                    {completedCount}/{totalLevels} Niveles
                  </span>
                </span>
                <span className="text-emerald-400 font-bold">
                  {completionPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {/* Contador de Medallas (Bronce, Plata, Oro) */}
            <div className="flex items-center justify-center gap-2 shrink-0">
              <div
                title="Medalla de Oro: Resuelto exactamente en los pasos óptimos del BFS"
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center gap-1.5"
              >
                <span className="text-base">🥇</span>
                <div className="leading-tight font-mono">
                  <div className="text-[9px] text-amber-300/80 font-semibold">
                    ORO
                  </div>
                  <div className="text-xs font-extrabold text-amber-300">
                    {goldCount}
                  </div>
                </div>
              </div>

              <div
                title="Medalla de Plata: Resuelto en menos de 1.25x los pasos óptimos"
                className="px-2.5 py-1.5 rounded-xl bg-slate-300/10 border border-slate-300/40 flex items-center gap-1.5"
              >
                <span className="text-base">🥈</span>
                <div className="leading-tight font-mono">
                  <div className="text-[9px] text-slate-300/80 font-semibold">
                    PLATA
                  </div>
                  <div className="text-xs font-extrabold text-slate-200">
                    {silverCount}
                  </div>
                </div>
              </div>

              <div
                title="Medalla de Bronce: Nivel resuelto sin asistencia de IA"
                className="px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/40 flex items-center gap-1.5"
              >
                <span className="text-base">🥉</span>
                <div className="leading-tight font-mono">
                  <div className="text-[9px] text-orange-300/80 font-semibold">
                    BRONCE
                  </div>
                  <div className="text-xs font-extrabold text-orange-300">
                    {bronzeCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENIDO SCROLLEABLE INTERNO ================= */}
        <div className="overflow-y-auto max-h-[75vh] p-4 sm:p-6 space-y-5 [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent]">
          {/* Sección 1: 4 Logros Globales Extra */}
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400 mb-2.5 flex items-center gap-2">
              <span>✨ Hitos Globales</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-cyan-400">
                {globalItems.filter((g) => g.unlocked).length}/
                {globalItems.length}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {globalItems.map((g) => (
                <div
                  key={g.id}
                  className={`rounded-2xl p-3 border transition-all flex items-start gap-2.5 ${
                    g.unlocked
                      ? 'bg-gradient-to-br from-cyan-950/40 via-zinc-900 to-zinc-950 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-zinc-950/60 border-zinc-800/80 opacity-45 grayscale'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                      g.unlocked
                        ? 'bg-cyan-500/15 border-cyan-400/50'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    {g.unlocked ? g.icon : '🔒'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono font-bold text-white truncate flex items-center gap-1">
                      <span>{g.title}</span>
                      {g.unlocked && (
                        <span className="text-emerald-400 text-[10px]">✓</span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400 leading-snug mt-0.5">
                      {g.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección 2: Grilla de Logros y Medallas por Nivel (Retos 1 al 15) */}
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400 mb-2.5 flex items-center justify-between">
              <span>🎯 Dominio por Nivel (Retos 1 al 15)</span>
              <span className="text-[10px] font-normal text-zinc-500">
                🥇 Exacto al BFS · 🥈 &lt;1.25x · 🥉 Completado sin IA
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {levelItems.map((item) => {
                if (!item.isCompleted) {
                  // Nivel NO resuelto aún
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl p-3.5 border border-zinc-800 bg-zinc-950/70 opacity-45 grayscale flex flex-col justify-between gap-2.5 transition-opacity hover:opacity-75"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-base shrink-0">
                            🔒
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-mono font-bold text-zinc-200 truncate">
                              {item.title}
                            </div>
                            <div className="text-[10px] font-mono text-zinc-400">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">
                          Meta óptima IA:{' '}
                          <strong className="text-zinc-200">
                            {item.optimalMoves} pasos
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectLevelToImprove?.(item.level)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold cursor-pointer transition-colors"
                        >
                          Jugar reto →
                        </button>
                      </div>
                    </div>
                  );
                }

                // Nivel RESUELTO sin IA
                const medalMeta = item.medalMeta;
                const isPerfect = item.diffFromOptimal === 0;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-3.5 border-2 flex flex-col justify-between gap-2.5 transition-transform hover:scale-[1.01] ${
                      medalMeta?.borderClass ||
                      'border-emerald-500/60 bg-zinc-900'
                    }`}
                  >
                    {/* Encabezado de la tarjeta resuelta */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-zinc-950/80 border border-white/15 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          {medalMeta?.icon || '🏆'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-mono font-bold text-white truncate">
                            {item.completedTitle}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-300 truncate">
                            {item.title}
                          </div>
                        </div>
                      </div>

                      {medalMeta && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase shrink-0 ${medalMeta.badgeClass}`}
                        >
                          {medalMeta.shortLabel}
                        </span>
                      )}
                    </div>

                    {/* Comparativa Tu Récord vs Óptimo IA */}
                    <div className="rounded-xl bg-zinc-950/75 border border-zinc-800/90 px-3 py-2 font-mono text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Tu Récord:</span>
                        <span className="font-bold text-emerald-400">
                          {item.bestMoves} pasos
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Óptimo IA:</span>
                        <span className="font-bold text-cyan-400">
                          {item.optimalMoves} pasos
                        </span>
                      </div>
                      <div className="pt-1 border-t border-zinc-800/80 text-[10px] text-right">
                        {isPerfect ? (
                          <span className="text-amber-300 font-bold">
                            ★ ¡Perfección óptima alcanzada!
                          </span>
                        ) : (
                          <span className="text-zinc-400">
                            Te faltan{' '}
                            <strong className="text-amber-300">
                              {item.diffFromOptimal} pasos
                            </strong>{' '}
                            para el óptimo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pie de tarjeta con botón "Mejorar marca ↻" */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9.5px] font-mono text-zinc-400">
                        {item.improvedRecord
                          ? '⚡ Marca superada'
                          : '✓ Completado sin IA'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectLevelToImprove?.(item.level)}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-600/90 to-indigo-600/90 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-[10px] cursor-pointer transition-all shadow-sm border border-cyan-400/30"
                      >
                        Mejorar marca ↻
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

