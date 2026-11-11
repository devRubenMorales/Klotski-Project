/**
 * Componente ChallengeCard: Representa una plaqueta miniatura de desafío física.
 * Renderiza las piezas como bloques sólidos unificados (sin divisiones internas en 2x2 o 2x1)
 * y el indicador de dificultad blanco exacto (puntos, medios puntos, barras dobles o barra completa).
 *
 * @param {Object} props
 * @param {Object} props.level - Datos del nivel { id, name, difficulty, minSteps, pieces }
 * @param {boolean} [props.isActive=false] - Si este nivel es el activo actualmente
 * @param {Function} [props.onClick] - Callback al seleccionar la tarjeta
 * @param {boolean} [props.horizontal=false] - Modo horizontal para el cartucho de la consola
 */
export default function ChallengeCard({
  level,
  isActive = false,
  onClick,
  horizontal = false,
}) {
  if (!level) return null;
  const { name, difficulty, minSteps, pieces } = level;

  if (horizontal) {
    // Modo Cartucho Horizontal para la ranura superior izquierda de la consola
    return (
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        title={`${name} (${minSteps} pasos)`}
        className={`group relative select-none rounded-xl bg-zinc-950 border px-1.5 py-1 transition-all duration-200 cursor-pointer flex items-center gap-2 ${
          isActive
            ? 'border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/50'
            : 'border-zinc-800 hover:border-cyan-400/70 hover:scale-[1.02]'
        }`}
      >
        {/* Mini-tablero con piezas unificadas sólidas (dimensiones fijas explícitas) */}
        <div
          className="rounded bg-zinc-900 border border-zinc-800 relative overflow-hidden shadow-inner shrink-0"
          style={{ width: '46px', height: '58px' }}
        >
          {pieces &&
            Object.values(pieces).map((piece) => (
              <div
                key={piece.id}
                className="absolute p-[0.75px]"
                style={{
                  left: `${piece.c * 25}%`,
                  top: `${piece.r * 20}%`,
                  width: `${piece.w * 25}%`,
                  height: `${piece.h * 20}%`,
                }}
              >
                <div
                  className={`w-full h-full rounded-[2px] shadow-sm flex items-center justify-center ${getPieceStyle(
                    piece.type
                  )}`}
                >
                  {piece.type === 'R' && (
                    <div className="w-[45%] h-[45%] rounded-[1px] border border-red-800/60 bg-red-700/50" />
                  )}
                  {piece.type === 'V' && (
                    <div className="w-0.5 h-[55%] rounded-full bg-purple-400/50" />
                  )}
                  {piece.type === 'H' && (
                    <div className="h-0.5 w-[55%] rounded-full bg-purple-400/50" />
                  )}
                  {piece.type === 'Y' && (
                    <div className="w-1 h-1 rounded-full bg-amber-600/70" />
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Indicador de dificultad vertical a la derecha del mini-tablero */}
        <div className="flex flex-col items-center justify-center w-3 h-12 border-l border-zinc-800 pl-1 shrink-0 gap-1">
          {renderDifficulty(difficulty, true)}
        </div>
      </div>
    );
  }

  // Modo Tarjeta Vertical Estándar para las Gavetas Laterales
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={`${name} (${minSteps} pasos)`}
      className={`group relative select-none rounded-xl bg-zinc-950 border p-1.5 transition-all duration-200 cursor-pointer w-full flex flex-col items-center gap-1 ${
        isActive
          ? 'border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/50'
          : 'border-zinc-800 hover:border-cyan-400/70 hover:shadow-[0_0_8px_rgba(6,182,212,0.3)] hover:scale-[1.02]'
      }`}
    >
      {/* Contenedor del Mini-Tablero 5x4 con piezas unificadas */}
      <div
        className="rounded bg-zinc-900 border border-zinc-800 relative overflow-hidden shadow-inner shrink-0"
        style={{ width: '42px', height: '52px' }}
      >
        {pieces &&
          Object.values(pieces).map((piece) => (
            <div
              key={piece.id}
              className="absolute p-[0.75px]"
              style={{
                left: `${piece.c * 25}%`,
                top: `${piece.r * 20}%`,
                width: `${piece.w * 25}%`,
                height: `${piece.h * 20}%`,
              }}
            >
              <div
                className={`w-full h-full rounded-[2px] shadow-sm flex items-center justify-center ${getPieceStyle(
                  piece.type
                )}`}
              >
                {piece.type === 'R' && (
                  <div className="w-[45%] h-[45%] rounded-[1px] border border-red-800/60 bg-red-700/50" />
                )}
                {piece.type === 'V' && (
                  <div className="w-0.5 h-[55%] rounded-full bg-purple-400/50" />
                )}
                {piece.type === 'H' && (
                  <div className="h-0.5 w-[55%] rounded-full bg-purple-400/50" />
                )}
                {piece.type === 'Y' && (
                  <div className="w-1 h-1 rounded-full bg-amber-600/70" />
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Indicador de Dificultad (Puntos blancos, medios puntos o barras) */}
      <div className="flex items-center justify-center gap-1 w-full min-h-[8px]">
        {renderDifficulty(difficulty, false)}
      </div>

      {/* Etiqueta del Desafío */}
      <div className="w-full text-center leading-tight">
        <div className="text-[9px] font-mono font-semibold text-zinc-300 truncate">
          {name}
        </div>
        <div className="text-[8px] font-mono text-cyan-400 font-medium">
          {minSteps} pasos
        </div>
      </div>
    </div>
  );
}

/**
 * Renderiza el patrón de dificultad exacto de la tarjeta física
 */
function renderDifficulty(difficulty, isVertical) {
  const pattern =
    difficulty?.pattern ||
    (difficulty?.type === 'bar'
      ? ['full-bar']
      : Array.from({ length: difficulty?.count || 1 }, () => 'dot'));

  return pattern.map((seg, i) => {
    if (isVertical) {
      switch (seg) {
        case 'full-bar':
          return (
            <span
              key={i}
              className="w-1.5 h-10 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            />
          );
        case 'med-bar':
          return (
            <span
              key={i}
              className="w-1.5 h-6 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.9)]"
            />
          );
        case 'short-bar':
          return (
            <span
              key={i}
              className="w-1.5 h-3.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.9)]"
            />
          );
        case 'half-dot':
          return (
            <span
              key={i}
              className="w-1.5 h-1 rounded-t-full bg-white shadow-[0_0_3px_rgba(255,255,255,0.85)]"
            />
          );
        case 'dot':
        default:
          return (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.85)]"
            />
          );
      }
    } else {
      switch (seg) {
        case 'full-bar':
          return (
            <span
              key={i}
              className="w-7 h-1 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)]"
            />
          );
        case 'med-bar':
          return (
            <span
              key={i}
              className="w-4 h-1 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)]"
            />
          );
        case 'short-bar':
          return (
            <span
              key={i}
              className="w-2.5 h-1 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.9)]"
            />
          );
        case 'half-dot':
          return (
            <span
              key={i}
              className="w-1 h-1.5 rounded-l-full bg-white shadow-[0_0_3px_rgba(255,255,255,0.85)]"
            />
          );
        case 'dot':
        default:
          return (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_3px_rgba(255,255,255,0.85)]"
            />
          );
      }
    }
  });
}

/**
 * Estilos visuales con relieve y gradiente para piezas sólidas unificadas
 */
function getPieceStyle(type) {
  switch (type) {
    case 'R':
      return 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 border border-red-400/80 shadow-inner';
    case 'V':
    case 'H':
      return 'bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 border border-purple-200 shadow-inner';
    case 'Y':
    default:
      return 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border border-amber-300 shadow-inner';
  }
}
