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
  isLeftDrawerOpen = false,
  isRightDrawerOpen = false,
  onToggleLeft,
  onToggleRight,
}) {
  const isRedInGoal =
    pieces?.R?.r === GOAL_POSITION.r && pieces?.R?.c === GOAL_POSITION.c;

  return (
    <div className="relative flex flex-col items-center">
      {/* Marco Exterior de la Bandeja (Carcasa Plástica 3D Negra) */}
      <div className="bg-zinc-900 border-4 border-zinc-800/90 rounded-3xl p-3.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)] relative select-none">
        {/* Pestaña / Solapa de apertura borde izquierdo */}
        {onToggleLeft && (
          <button
            onClick={onToggleLeft}
            title={isLeftDrawerOpen ? 'Cerrar gaveta izquierda' : 'Abrir gaveta izquierda'}
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-4 h-16 rounded-l-lg bg-zinc-800 hover:bg-zinc-700 border-l border-y border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer shadow-xl transition-all duration-200 z-30 group"
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
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-4 h-16 rounded-r-lg bg-zinc-800 hover:bg-zinc-700 border-r border-y border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer shadow-xl transition-all duration-200 z-30 group"
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
        <div className="w-[288px] mb-2.5 flex items-center justify-between px-2 py-1 bg-zinc-950/80 rounded-xl border border-zinc-800/90 shadow-inner">
          {/* Ranura del Cartucho Activo con vista previa completa y dificultad */}
          <div
            onClick={onToggleLeft}
            title="Cartucho de desafío activo (Haz clic para alternar gaveta de niveles)"
            className="p-0.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 group"
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

          {/* Logo / Escudo Blanco Vectorizado Estilizado */}
          <div className="flex flex-col items-center justify-center pr-2">
            <svg
              viewBox="0 0 100 120"
              className="w-12 h-14 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 50 10 L 72 20 L 86 16 L 86 52 C 86 80 50 110 50 110 C 50 110 14 80 14 52 L 14 16 L 28 20 Z"
                fill="#18181b"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <path d="M 33 40 L 44 40 L 41 74 L 30 74 Z" fill="#ffffff" />
              <path d="M 67 40 L 56 40 L 59 74 L 70 74 Z" fill="#ffffff" />
            </svg>
            <span className="text-[8px] font-mono tracking-widest text-zinc-400 uppercase mt-0.5 font-bold">
              Klotski Core
            </span>
          </div>
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
        </div>

        {/* Indicador de compuerta inferior */}
        <div className="w-[144px] h-1.5 bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent mx-auto mt-2 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
      </div>
    </div>
  );
}
