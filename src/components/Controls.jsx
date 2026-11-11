/**
 * Componente Controls: Panel de mando Cyber-Gamer con modo oscuro.
 * - En escritorio (md:): Panel completo con telemetría detallada, badge de movimiento y estadísticas BFS.
 * - En móvil (< 768px / max-md): Consola inferior compacta en 3 filas limpias (Progreso + Recalcular + Cerrar,
 *   Controles de Reproducción y Slider de Velocidad).
 */
export default function Controls({
  currentStepIndex,
  totalSteps,
  isRouteDirty = false,
  isSolving,
  isPlaying,
  playbackSpeed,
  isCompleted,
  solveTime,
  totalStatesExplored,
  currentMove,
  solvePuzzle,
  nextStep,
  prevStep,
  goToStep,
  reset,
  resetToInitial,
  togglePlay,
  setPlaybackSpeed,
  onClose,
}) {
  const progressPercent =
    totalSteps > 0 ? (currentStepIndex / totalSteps) * 100 : 0;

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900/95 backdrop-blur-md border border-cyan-500/25 rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.85),0_0_15px_rgba(6,182,212,0.12)] md:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_15px_rgba(6,182,212,0.1)] flex flex-col gap-2.5 md:gap-5 select-none">
      {/* ================= CABECERA (Compacta en Móvil / Completa en Desktop) ================= */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 md:pb-4 gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-xl font-bold font-mono tracking-wider md:tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] truncate">
              KLOTSKI AI SOLVER
            </h2>
            {/* En móvil mostramos el paso directamente en la primera fila */}
            <span className="md:hidden text-[11px] font-mono font-bold text-zinc-200 bg-zinc-800/90 px-2 py-0.5 rounded-md border border-zinc-700 shrink-0">
              {totalSteps > 0
                ? `Paso ${currentStepIndex}/${totalSteps}`
                : `Mov: ${currentStepIndex}`}
            </span>
          </div>
          <p className="hidden md:block text-xs text-zinc-400 font-mono tracking-wider mt-0.5">
            MOTOR BFS DETERMINISTA V2.0
          </p>
        </div>

        {/* Acciones Derecha: Botón Recalcular compacto (móvil), Estado (desktop) y Botón Cerrar ✕ */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Botón Recalcular compacto exclusivo para móvil */}
          <button
            onClick={() => solvePuzzle()}
            disabled={isSolving}
            title="Recalcular ruta óptima desde aquí"
            className="md:hidden px-2.5 py-1.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-mono font-semibold text-[11px] rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 text-cyan-200 ${isSolving ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>{isSolving ? '...' : 'IA'}</span>
          </button>

          {/* Indicador de Estado (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSolving
                  ? 'bg-amber-400 animate-ping'
                  : isCompleted
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : totalSteps > 0
                  ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                  : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
              }`}
            />
            <span className="text-xs font-mono font-medium text-zinc-300 uppercase">
              {isSolving
                ? 'CALCULANDO'
                : isCompleted
                ? 'RESUELTO'
                : totalSteps > 0
                ? 'SOLVER ACTIVO'
                : 'JUEGO MANUAL'}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              title="Cerrar menú de asistencia (Esc)"
              aria-label="Cerrar menú de reproducción"
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-800/90 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/60 text-zinc-400 hover:text-red-300 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
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
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Botón Destacado Desktop: Resolver con IA desde la posición actual */}
      <button
        onClick={() => solvePuzzle()}
        disabled={isSolving}
        className="hidden md:flex group relative w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:via-indigo-500 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-mono font-semibold text-sm rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none overflow-hidden"
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <svg
          className={`w-5 h-5 text-cyan-200 ${isSolving ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSolving ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          )}
        </svg>
        <span>
          {isSolving
            ? 'Calculando Ruta Óptima...'
            : totalSteps > 0
            ? 'Recalcular Solver IA desde aquí'
            : 'Resolver con IA'}
        </span>
      </button>

      {/* Telemetría y Barra de Progreso */}
      <div className="space-y-1.5 md:space-y-2">
        <div className="hidden md:flex justify-between items-center text-xs font-mono">
          <span className="text-zinc-400">
            PROGRESO:{' '}
            <strong className="text-cyan-300 font-bold">
              {totalSteps > 0
                ? `Paso ${currentStepIndex} de ${totalSteps}`
                : `Movimientos realizados: ${currentStepIndex}`}
            </strong>
          </span>
          <span className="text-cyan-400 font-semibold">
            {totalSteps > 0 ? `${progressPercent.toFixed(0)}%` : 'Interactivo'}
          </span>
        </div>

        {/* Barra de progreso fluida (Desktop) */}
        <div className="hidden md:block w-full h-2.5 bg-zinc-800/90 rounded-full overflow-hidden border border-zinc-700/60 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
            style={{ width: `${totalSteps > 0 ? progressPercent : 100}%` }}
          />
        </div>

        {/* Slider scrub interactivo de línea de tiempo */}
        {totalSteps > 0 && (
          <input
            type="range"
            min={0}
            max={totalSteps}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg cursor-pointer block"
          />
        )}
      </div>

      {/* Badge de Movimiento Actual (Solo Desktop para mantener compacto el móvil) */}
      <div className="hidden md:flex min-h-[58px] p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 items-center justify-between gap-3 text-xs font-mono">
        {currentMove ? (
          <div className="flex items-center gap-2.5 w-full">
            <span
              className={`w-3 h-3 rounded-md shadow-sm shrink-0 ${
                currentMove.pieceType === 'R'
                  ? 'bg-red-500 border border-red-400'
                  : currentMove.pieceType === 'V' || currentMove.pieceType === 'H'
                  ? 'bg-purple-300 border border-purple-200'
                  : 'bg-amber-400 border border-amber-300'
              }`}
            />
            <div className="flex-1 truncate">
              <span className="text-zinc-400">Mover </span>
              <strong className="text-zinc-100">
                {currentMove.pieceType === 'R'
                  ? 'Bloque Rojo'
                  : currentMove.pieceType === 'V'
                  ? 'Barra Vertical'
                  : currentMove.pieceType === 'H'
                  ? 'Barra Horizontal'
                  : 'Ficha Amarilla'}{' '}
                ({currentMove.pieceId})
              </strong>
              <span className="text-zinc-400"> hacia </span>
              <span className="text-cyan-400 font-bold">
                {currentMove.direction} {getDirectionArrow(currentMove.direction)}
              </span>
            </div>
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[11px] shrink-0 border border-zinc-700">
              {currentMove.steps} {currentMove.steps > 1 ? 'casillas' : 'casilla'}
            </span>
          </div>
        ) : (
          <span className="text-zinc-400 text-xs">
            👉 <strong>Modo táctil activo:</strong> Arrastra cualquier pieza hacia un espacio vacío para jugar libremente.
          </span>
        )}
      </div>

      {/* ================= FILA 2: BOTONERA DE REPRODUCCIÓN ================= */}
      <div className="flex items-center justify-between gap-2">
        {/* Reiniciar al estado inicial del puzzle */}
        <button
          onClick={resetToInitial || reset}
          title="Reiniciar rompecabezas a la posición inicial"
          className="p-2.5 md:p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-all cursor-pointer border border-zinc-700 shadow-sm"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Paso Anterior */}
        <button
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          title="Paso anterior"
          className="p-2.5 md:p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-200 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed border border-zinc-700 shadow-sm"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Reproducir / Pausar (Botón Central Destacado) */}
        <button
          onClick={togglePlay}
          disabled={isSolving || isCompleted || (!isRouteDirty && totalSteps === 0)}
          title={isPlaying ? 'Pausar' : 'Reproducir automáticamente solución'}
          className={`flex-1 py-2.5 md:py-3 px-4 md:px-5 font-mono font-bold text-xs md:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none'
          }`}
        >
          {isPlaying ? (
            <>
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              <span>PAUSAR</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>REPRODUCIR</span>
            </>
          )}
        </button>

        {/* Paso Siguiente */}
        <button
          onClick={nextStep}
          disabled={
            isSolving ||
            isCompleted ||
            (!isRouteDirty && (currentStepIndex === totalSteps || totalSteps === 0))
          }
          title="Paso siguiente"
          className="p-2.5 md:p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-200 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed border border-zinc-700 shadow-sm"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ================= FILA 3: CONTROL DE VELOCIDAD DESLIZANTE ================= */}
      <div className="pt-1.5 md:pt-2 border-t border-zinc-800/80 flex md:block items-center gap-3 md:space-y-2">
        <div className="flex justify-between items-center text-[11px] md:text-xs font-mono text-zinc-400 shrink-0">
          <span className="hidden md:inline">VELOCIDAD DE AUTOPLAY:</span>
          <span className="md:hidden text-zinc-400">VEL:</span>
          <span className="text-cyan-400 font-bold ml-1">{playbackSpeed}ms</span>
        </div>
        <div className="flex-1 flex items-center gap-2 md:gap-3">
          <span className="text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase">Rápido</span>
          <input
            type="range"
            min={150}
            max={1000}
            step={25}
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="flex-1 accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
          />
          <span className="text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase">Lento</span>
        </div>
      </div>

      {/* Estadísticas de Rendimiento (Solo Desktop) */}
      {solveTime !== null && totalSteps > 0 && (
        <div className="hidden md:flex text-[11px] font-mono text-zinc-500 justify-between items-center pt-1 border-t border-zinc-800/60">
          <span>Ruta óptima: {totalSteps} movimientos</span>
          <span>BFS: {solveTime} ms ({totalStatesExplored.toLocaleString()} nodos)</span>
        </div>
      )}
    </div>
  );
}

function getDirectionArrow(dir) {
  switch (dir) {
    case 'ARRIBA':
      return '↑';
    case 'ABAJO':
      return '↓';
    case 'IZQUIERDA':
      return '←';
    case 'DERECHA':
      return '→';
    default:
      return '';
  }
}
