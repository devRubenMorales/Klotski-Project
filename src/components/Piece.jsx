import { useState, useRef, useCallback } from 'react';
import { getPieceDragBounds } from '../solver/klotskiSolver.js';

/**
 * Componente Piece: representa una ficha física con soporte para arrastre táctil/mouse
 * (Pointer Events), bloqueo de eje y restricción de colisiones en tiempo real.
 *
 * @param {Object} props
 * @param {Object} props.piece - Datos de la pieza { id, type, r, c, h, w }
 * @param {Array<Array<string|null>>} props.grid - Matriz 2D 5x4 actual del tablero
 * @param {number} [props.cellSize=72] - Tamaño en px de cada casilla
 * @param {boolean} [props.isMoving=false] - Resaltado durante la reproducción automática
 * @param {Function} [props.onMove] - Callback al soltar y hacer snap a una nueva celda
 * @param {Function} [props.onDragStart] - Callback al iniciar el contacto
 */
export default function Piece({
  piece,
  grid,
  cellSize = 72,
  isMoving = false,
  onMove,
  onDragStart,
}) {
  const { id, type, r, c, h, w } = piece;

  const [isDragging, setIsDragging] = useState(false);
  const [isSnappingBack, setIsSnappingBack] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const startPointerRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ up: 0, down: 0, left: 0, right: 0 });
  const lockedAxisRef = useRef(null); // 'x' | 'y' | null
  const pointerIdRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const baseLeft = c * cellSize;
  const baseTop = r * cellSize;
  const width = w * cellSize;
  const height = h * cellSize;

  /**
   * Inicio del arrastre (PointerDown)
   */
  const handlePointerDown = useCallback(
    (e) => {
      // Solo botón principal del mouse o cualquier toque
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      e.preventDefault();
      e.stopPropagation();

      pointerIdRef.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        // Ignorar si el navegador no permite capturar en casos específicos
      }

      if (onDragStart) {
        onDragStart();
      }

      startPointerRef.current = { x: e.clientX, y: e.clientY };
      lockedAxisRef.current = null;
      setIsSnappingBack(false);

      // Calcular límites de movimiento permitidos según los espacios vacíos actuales
      const bounds = grid
        ? getPieceDragBounds(piece, grid)
        : { up: 0, down: 0, left: 0, right: 0 };
      boundsRef.current = bounds;

      dragOffsetRef.current = { x: 0, y: 0 };
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(true);
    },
    [grid, piece, onDragStart]
  );

  /**
   * Arrastre activo (PointerMove) con bloqueo de eje (Axis Lock) a 60/120 fps
   */
  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || e.pointerId !== pointerIdRef.current) return;

      const rawDx = e.clientX - startPointerRef.current.x;
      const rawDy = e.clientY - startPointerRef.current.y;
      const bounds = boundsRef.current;

      // Bloqueo de eje con umbral inicial de 5px
      if (lockedAxisRef.current === null) {
        const distance = Math.hypot(rawDx, rawDy);
        if (distance >= 5) {
          const absX = Math.abs(rawDx);
          const absY = Math.abs(rawDy);

          if (absX >= absY) {
            if (bounds.left > 0 || bounds.right > 0) {
              lockedAxisRef.current = 'x';
            } else if (bounds.up > 0 || bounds.down > 0) {
              lockedAxisRef.current = 'y';
            }
          } else {
            if (bounds.up > 0 || bounds.down > 0) {
              lockedAxisRef.current = 'y';
            } else if (bounds.left > 0 || bounds.right > 0) {
              lockedAxisRef.current = 'x';
            }
          }
        }
      }

      let newOffset = { x: 0, y: 0 };

      // Restricción precisa según el eje bloqueado
      if (lockedAxisRef.current === 'x') {
        const minX = -bounds.left * cellSize;
        const maxX = bounds.right * cellSize;
        const clampedX = Math.max(minX, Math.min(maxX, rawDx));
        newOffset = { x: clampedX, y: 0 };
      } else if (lockedAxisRef.current === 'y') {
        const minY = -bounds.up * cellSize;
        const maxY = bounds.down * cellSize;
        const clampedY = Math.max(minY, Math.min(maxY, rawDy));
        newOffset = { x: 0, y: clampedY };
      }

      dragOffsetRef.current = newOffset;
      setDragOffset(newOffset);
    },
    [isDragging, cellSize]
  );

  /**
   * Finalización del arrastre (PointerUp / PointerCancel) y Snap to Grid
   */
  const handlePointerUp = useCallback(
    (e) => {
      if (!isDragging || e.pointerId !== pointerIdRef.current) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignorar
      }

      const bounds = boundsRef.current;
      const axis = lockedAxisRef.current;
      // Leer el offset síncrono más reciente desde la ref para evitar stale closure
      const { x: offsetX, y: offsetY } = dragOffsetRef.current;

      let deltaCol = 0;
      let deltaRow = 0;

      // Snap to Grid: umbral del 35% del tamaño de celda
      if (axis === 'x') {
        if (offsetX > 0 && bounds.right > 0) {
          if (bounds.right >= 2 && offsetX >= 1.35 * cellSize) {
            deltaCol = 2;
          } else if (offsetX >= 0.35 * cellSize) {
            deltaCol = 1;
          }
        } else if (offsetX < 0 && bounds.left > 0) {
          if (bounds.left >= 2 && offsetX <= -1.35 * cellSize) {
            deltaCol = -2;
          } else if (offsetX <= -0.35 * cellSize) {
            deltaCol = -1;
          }
        }
      } else if (axis === 'y') {
        if (offsetY > 0 && bounds.down > 0) {
          if (bounds.down >= 2 && offsetY >= 1.35 * cellSize) {
            deltaRow = 2;
          } else if (offsetY >= 0.35 * cellSize) {
            deltaRow = 1;
          }
        } else if (offsetY < 0 && bounds.up > 0) {
          if (bounds.up >= 2 && offsetY <= -1.35 * cellSize) {
            deltaRow = -2;
          } else if (offsetY <= -0.35 * cellSize) {
            deltaRow = -1;
          }
        }
      }

      if (deltaCol !== 0 || deltaRow !== 0) {
        // Movimiento válido: ejecutar snap inmediato y notificar
        const targetR = r + deltaRow;
        const targetC = c + deltaCol;
        setIsDragging(false);
        dragOffsetRef.current = { x: 0, y: 0 };
        setDragOffset({ x: 0, y: 0 });
        if (onMove) {
          onMove(id, targetR, targetC);
        }
      } else {
        // No superó el umbral: animar de vuelta suavemente al origen
        setIsSnappingBack(true);
        dragOffsetRef.current = { x: 0, y: 0 };
        setDragOffset({ x: 0, y: 0 });
        setTimeout(() => {
          setIsDragging(false);
          setIsSnappingBack(false);
        }, 200);
      }

      lockedAxisRef.current = null;
      pointerIdRef.current = null;
    },
    [isDragging, cellSize, r, c, id, onMove]
  );

  const currentX = baseLeft + dragOffset.x;
  const currentY = baseTop + dragOffset.y;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute touch-none select-none ${
        isDragging && !isSnappingBack
          ? 'z-40 cursor-grabbing'
          : 'z-10 cursor-grab hover:z-20'
      } ${
        isDragging && !isSnappingBack
          ? 'transition-none'
          : isSnappingBack
          ? 'transition-transform duration-200 ease-out'
          : 'transition-transform duration-300 ease-out'
      }`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate3d(${currentX}px, ${currentY}px, 0)`,
      }}
    >
      <div
        className={`w-full h-full p-1 transition-all duration-200 ${
          isDragging && !isSnappingBack
            ? 'scale-[1.03] filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.65)]'
            : isMoving
            ? 'scale-[1.02] filter drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]'
            : 'hover:scale-[1.01]'
        }`}
      >
        <div
          className={`w-full h-full rounded-2xl relative flex items-center justify-center transition-all duration-300 ${
            isMoving || (isDragging && !isSnappingBack)
              ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-zinc-900'
              : ''
          } ${getPieceContainerStyle(type)}`}
        >
          {renderPieceInterior(type)}
        </div>
      </div>
    </div>
  );
}

/**
 * Estilos base y relieve exterior por tipo de pieza (imitando plástico 3D)
 */
function getPieceContainerStyle(type) {
  switch (type) {
    case 'R': // Bloque Rojo principal 2x2
      return 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-[0_6px_14px_rgba(185,28,28,0.5),inset_0_2px_3px_rgba(255,255,255,0.4)] border-2 border-red-400/80';

    case 'V': // Barras verticales lilas 2x1
    case 'H': // Barras horizontales lilas 1x2
      return 'bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 shadow-[0_4px_10px_rgba(168,85,247,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)] border-2 border-purple-200';

    case 'Y': // Fichas amarillas 1x1
    default:
      return 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 shadow-[0_4px_10px_rgba(245,158,11,0.4),inset_0_2px_3px_rgba(255,255,255,0.6)] border-2 border-amber-300';
  }
}

/**
 * Renderiza los grabados y bajo relieves interiores exactos del juguete físico
 */
function renderPieceInterior(type) {
  switch (type) {
    case 'R': // Bloque Rojo: Grabado concéntrico con bordes biselados
      return (
        <div className="w-[82%] h-[82%] rounded-xl border-2 border-red-800/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] bg-red-600/40 flex items-center justify-center relative pointer-events-none">
          <div className="absolute inset-x-2 h-0.5 bg-red-800/40 top-1/2 -translate-y-1/2" />
          <div className="absolute inset-y-2 w-0.5 bg-red-800/40 left-1/2 -translate-x-1/2" />
          <div className="w-[50%] h-[50%] rounded-lg border-2 border-red-800/60 bg-red-600/60 shadow-[inset_0_2px_3px_rgba(0,0,0,0.4)] flex items-center justify-center z-10">
            <div className="w-3.5 h-3.5 rounded bg-red-500/80 border border-red-800/60 shadow-sm" />
          </div>
        </div>
      );

    case 'V': // Barra Vertical Lila: Ranura rectangular a lo largo
      return (
        <div className="w-[48%] h-[80%] rounded-full bg-purple-400/40 border border-purple-500/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-[58%] rounded-full bg-purple-200/70 border border-purple-400/40 shadow-inner" />
        </div>
      );

    case 'H': // Barra Horizontal Lila: Ranura rectangular horizontal
      return (
        <div className="w-[80%] h-[48%] rounded-full bg-purple-400/40 border border-purple-500/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] flex items-center justify-center pointer-events-none">
          <div className="h-1.5 w-[58%] rounded-full bg-purple-200/70 border border-purple-400/40 shadow-inner" />
        </div>
      );

    case 'Y': // Ficha Amarilla: Ojo de buey
    default:
      return (
        <div className="w-[68%] h-[68%] rounded-full border-2 border-amber-600/50 shadow-[inset_0_2px_3px_rgba(0,0,0,0.25)] bg-amber-400/30 flex items-center justify-center pointer-events-none">
          <div className="w-[45%] h-[45%] rounded-full border border-amber-600/60 bg-amber-300/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-600/70" />
          </div>
        </div>
      );
  }
}
