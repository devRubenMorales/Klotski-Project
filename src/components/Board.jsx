import Piece from './Piece.jsx';
import ChallengeCard from './ChallengeCard.jsx';
import { GOAL_POSITION } from '../solver/constants.js';

const CELL_SIZE = 72; // Tamaño estándar para 288px x 360px

/**
 * Componente Board: Simula la consola física 3D con su marco,
 * ranura de cartucho de desafío activo en la esquina superior izquierda,
 * escudo vectorizado, área de juego ranurada, zona meta grabada y
 * pestañas laterales para apertura independiente de gavetas.
 *
 * @param {Object} props
 * @param {Record<string, any>} props.pieces - Estado actual de las piezas
 * @param {Array<Array<string|null>>} [props.grid] - Matriz 2D 5x4 para detección de colisiones
 * @param {Object|null} [props.currentMove] - Movimiento actual en curso
 * @param {boolean} [props.isCompleted=false] - Indica si el puzzle ha sido resuelto
 * @param {Function} [props.onMovePiece] - Callback al mover manualmente una pieza
 * @param {Function} [props.onDragStart] - Callback al iniciar el arrastre manual
 * @param {Object} [props.currentLevel] - Nivel activo insertado en la ranura
 * @param {number} [props.manualMovesCount=0] - Contador de movimientos manuales continuos
 * @param {boolean} [props.usedAI=false] - Si el intento actual fue asistido por IA
 * @param {number} [props.currentStepIndex=0] - Paso actual en la ruta del Solver
 * @param {Object|null} [props.levelProgress=null] - Progreso guardado del nivel activo
 * @param {Function} [props.onReset] - Reiniciar el nivel a un intento limpio desde 0
 * @param {number} [props.completedLevelsCount=0] - Cantidad de niveles resueltos sin IA
 * @param {number} [props.totalLevelsCount=15] - Cantidad total de niveles
 * @param {Function} [props.onOpenAchievements] - Abrir el modal de Sala de Trofeos
 * @param {Function} [props.onNextPendingLevel] - Saltar directamente al siguiente reto pendiente
 * @param {boolean} [props.isLeftDrawerOpen=false] - Estado gaveta izquierda
 * @param {boolean} [props.isRightDrawerOpen=false] - Estado gaveta derecha
 * @param {Function} [props.onToggleLeft] - Alternar gaveta izquierda
 * @param {Function} [props.onToggleRight] - Alternar gaveta derecha
 */
export default function Board({
  pieces,
  grid,
  currentMove = null,
  isCompleted = false,
  onMovePiece,
  onDragStart,
  currentLevel = null,
  manualMovesCount = 0,
  usedAI = false,
  currentStepIndex = 0,
  levelProgress = null,
  onReset,
  completedLevelsCount = 0,
  totalLevelsCount = 15,
  onOpenAchievements,
  onNextPendingLevel,
  isLeftDrawerOpen = false,
  isRightDrawerOpen = false,
  onToggleLeft,
  onToggleRight,
}) {
  const isRedInGoal =
    pieces?.R?.r === GOAL_POSITION.r && pieces?.R?.c === GOAL_POSITION.c;
  const displayedSteps = usedAI ? currentStepIndex : manualMovesCount;
  const hasSavedRecord =
    levelProgress?.completed && typeof levelProgress?.bestMoves === 'number';

  return (
    <div className="relative flex flex-col items-center">
      {/* Marco Exterior de la Bandeja (Carcasa Plástica 3D Negra) */}
      <div className="bg-zinc-900 border-4 border-zinc-800/90 rounded-3xl p-3.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)] relative select-none">
        {/* Pestaña / Solapa de apertura borde izquierdo */}
        {onToggleLeft && (
          <button
            onClick={onToggleLeft}
            title={isLeftDrawerOpen ? 'Cerrar gaveta izquierda' : 'Abrir gaveta izquierda'}
            className="absolute -left-4 md:-left-3.5 top-1/2 -translate-y-1/2 w-5 md:w-4 h-16 rounded-l-lg bg-zinc-800 hover:bg-zinc-700 border-l border-y border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer shadow-xl transition-all duration-200 z-50 group"
          >
            <svg
              className="w-2.5 h-2.5 group-hover:scale-125 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isLeftDrawerOpen ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        )}

        {/* Pestaña / Solapa de apertura borde derecho */}
        {onToggleRight && (
          <button
            onClick={onToggleRight}
            title={isRightDrawerOpen ? 'Cerrar gaveta derecha' : 'Abrir gaveta derecha'}
            className="absolute -right-4 md:-right-3.5 top-1/2 -translate-y-1/2 w-5 md:w-4 h-16 rounded-r-lg bg-zinc-800 hover:bg-zinc-700 border-r border-y border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer shadow-xl transition-all duration-200 z-50 group"
          >
            <svg
              className="w-2.5 h-2.5 group-hover:scale-125 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isRightDrawerOpen ? (
                <path d="M15 18l-6-6 6-6" />
              ) : (
                <path d="M9 18l6-6-6-6" />
              )}
            </svg>
          </button>
        )}

        {/* Tornillos decorativos */}
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600 shadow-inner" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600 shadow-inner" />
        <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600 shadow-inner" />
        <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600 shadow-inner" />

        {/* Encabezado Decorativo Superior */}
        <div className="w-[288px] mb-2.5 flex items-center justify-between gap-1.5 px-1.5 py-1 bg-zinc-950/80 rounded-xl border border-zinc-800/90 shadow-inner">
          {/* Ranura del Cartucho Activo con vista previa completa y dificultad */}
          <div
            onClick={onToggleLeft}
            title="Cartucho de desafío activo (Haz clic para alternar gaveta de niveles)"
            className="p-0.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 group shrink-0"
          >
            {currentLevel ? (
              <ChallengeCard
                level={currentLevel}
                isActive={true}
                horizontal={true}
              />
            ) : (
              <div className="w-18 h-14 flex items-center justify-center text-[9px] font-mono text-zinc-600">
                Sin cartucho
              </div>
            )}
          </div>

          {/* Display Digital Hardware de Movimientos, Validez Anti-IA, Récord y Reinicio Rápido */}
          <div
            title={
              usedAI
                ? 'Intento asistido por IA — Reinicia el nivel para registrar récord'
                : 'Modo manual activo — Tu victoria registrará récord oficial'
            }
            className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800/90 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)] flex items-center justify-between gap-1.5"
          >
            <div className="flex flex-col min-w-0 leading-tight">
              {/* Indicador LED de validez (MANUAL vs IA ACTIVA) */}
              <div className="flex items-center gap-1 mb-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    usedAI
                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse'
                      : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                  }`}
                />
                <span
                  className={`text-[8px] font-mono font-bold tracking-wider uppercase truncate ${
                    usedAI ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {usedAI ? 'IA ACTIVA' : 'MANUAL'}
                </span>
              </div>

              {/* Contador de Pasos en Tiempo Real */}
              <div className="text-[11px] font-mono font-bold tracking-tight text-zinc-100 whitespace-nowrap">
                PASOS:{' '}
                <span className={usedAI ? 'text-amber-300' : 'text-cyan-300'}>
                  {displayedSteps}
                </span>
              </div>

              {/* Récord Guardado o aviso sutil de reinicio */}
              {hasSavedRecord ? (
                <div className="text-[8.5px] font-mono font-semibold text-emerald-400/95 whitespace-nowrap">
                  RÉCORD: {levelProgress.bestMoves}
                </div>
              ) : usedAI ? (
                <div className="text-[7.5px] font-mono text-amber-400/80 truncate">
                  Reinicia p/ récord
                </div>
              ) : (
                <div className="text-[8px] font-mono text-zinc-500 whitespace-nowrap">
                  RÉCORD: --
                </div>
              )}
            </div>

            {/* Botón Rápido de Reiniciar en el Tablero */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                title="Reiniciar nivel (empezar intento limpio desde 0)"
                className="w-6 h-6 rounded-md bg-zinc-800/90 hover:bg-zinc-700 active:scale-95 border border-zinc-700 hover:border-cyan-400/60 text-zinc-300 hover:text-cyan-300 flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Botón de Escudo / Trofeos (Abre la Sala de Trofeos y muestra total completado) */}
          <button
            type="button"
            onClick={onOpenAchievements}
            title={`Abrir Sala de Trofeos y Récords (${completedLevelsCount}/${totalLevelsCount} completados)`}
            className="group relative shrink-0 flex flex-col items-center justify-center px-1 py-0.5 rounded-xl hover:bg-zinc-900/90 border border-transparent hover:border-amber-400/50 transition-all cursor-pointer active:scale-95"
          >
            <svg
              viewBox="0 0 100 112"
              className="w-9 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Contorno del casco / escudo poligonal */}
              <path
                d="M 50 8 L 65 20 L 85 27 L 85 73 L 75 79 L 72 89 L 50 104 L 28 89 L 25 79 L 15 73 L 15 27 L 35 20 Z"
                fill="#111113"
                stroke="#ffffff"
                strokeWidth="8.5"
                strokeLinejoin="miter"
                strokeMiterlimit="6"
              />
              {/* Ojo izquierdo (paralelogramo inclinado hacia el centro) */}
              <path d="M 27 39 L 44 50 L 44 73 L 27 62 Z" fill="#ffffff" />
              {/* Ojo derecho (paralelogramo inclinado hacia el centro) */}
              <path d="M 73 39 L 56 50 L 56 73 L 73 62 Z" fill="#ffffff" />
            </svg>
            <div className="mt-0.5 px-1.5 py-[1px] rounded-full bg-zinc-900/95 border border-amber-400/40 group-hover:border-amber-400 text-[8px] font-mono font-bold text-amber-300 flex items-center gap-0.5 leading-none shadow-sm">
              <span>🏆</span>
              <span>
                {completedLevelsCount}/{totalLevelsCount}
              </span>
            </div>
          </button>
        </div>

        {/* Área de Juego (5 Filas × 4 Columnas = 288px × 360px) */}
        <div
          className="w-[288px] h-[360px] bg-zinc-950 rounded-2xl relative overflow-hidden border-2 border-zinc-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)`,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        >
          {/* Grabado Geométrico Blanco en la Zona Meta */}
          <div
            className={`absolute transition-opacity duration-500 flex items-center justify-center select-none pointer-events-none ${
              isRedInGoal ? 'opacity-20' : 'opacity-90 animate-pulse'
            }`}
            style={{
              width: `${2 * CELL_SIZE}px`,
              height: `${2 * CELL_SIZE}px`,
              top: `${3 * CELL_SIZE}px`,
              left: `${1 * CELL_SIZE}px`,
            }}
          >
            <div className="w-[130px] h-[130px] rounded-2xl border-4 border-white/90 p-2 flex items-center justify-center relative bg-zinc-950/70 shadow-[0_0_15px_rgba(255,255,255,0.15)]">
              {/* Guiones dobles superiores */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className="w-1.5 h-4 bg-white rounded-full" />
                <div className="w-1.5 h-4 bg-white rounded-full" />
              </div>

              {/* Guiones dobles inferiores */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className="w-1.5 h-4 bg-white rounded-full" />
                <div className="w-1.5 h-4 bg-white rounded-full" />
              </div>

              {/* Guiones dobles izquierdos */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                <div className="h-1.5 w-4 bg-white rounded-full" />
                <div className="h-1.5 w-4 bg-white rounded-full" />
              </div>

              {/* Guiones dobles derechos */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                <div className="h-1.5 w-4 bg-white rounded-full" />
                <div className="h-1.5 w-4 bg-white rounded-full" />
              </div>

              {/* Cuadrado central con círculo */}
              <div className="w-12 h-12 rounded-xl border-3 border-white flex items-center justify-center bg-zinc-950/90 shadow-sm">
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>

          {/* Renderizado de las 10 piezas con soporte de arrastre */}
          {pieces &&
            Object.values(pieces).map((piece) => (
              <Piece
                key={piece.id}
                piece={piece}
                grid={grid}
                cellSize={CELL_SIZE}
                isMoving={currentMove?.pieceId === piece.id}
                onMove={onMovePiece}
                onDragStart={onDragStart}
              />
            ))}

          {/* Botón Rápido "Siguiente Reto Pendiente ➔" en el Tablero al ganar sin IA */}
          {isCompleted && !usedAI && onNextPendingLevel && (
            <div className="absolute bottom-3 inset-x-3 z-30 flex justify-center pointer-events-auto">
              <button
                type="button"
                onClick={onNextPendingLevel}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 active:scale-[0.98] text-zinc-950 font-mono font-extrabold text-xs tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.85)] border-2 border-white/80 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Siguiente Reto Pendiente ➔</span>
              </button>
            </div>
          )}
        </div>

        {/* Indicador de compuerta inferior */}
        <div className="w-[144px] h-1.5 bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent mx-auto mt-2 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
      </div>
    </div>
  );
}
