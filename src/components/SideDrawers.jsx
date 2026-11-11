import ChallengeCard from './ChallengeCard.jsx';

/**
 * Componente SideDrawers: Sistema de gavetas laterales dobles telescópicas (L1, L2, R1, R2).
 * - En escritorio (md:): se deslizan hacia afuera a izquierda y derecha del tablero.
 * - En móvil (< 768px / max-md): quedan 100% ocultas (invisible) al estar cerradas y,
 *   al abrirse, se deslizan hacia adentro sobre el lateral correspondiente del tablero
 *   con desenfoque de fondo y cierre automático al seleccionar nivel o tocar fuera.
 *
 * @param {Object} props
 * @param {Array<Object>} props.levels - Catálogo completo de 15 niveles
 * @param {Object} props.currentLevel - Nivel seleccionado actualmente
 * @param {Record<string, any>} [props.progress] - Progreso guardado por levelId
 * @param {Function} props.onSelectLevel - Callback al seleccionar una tarjeta
 * @param {boolean} props.isLeftOpen - Apertura de gaveta izquierda primaria
 * @param {boolean} props.isLeftExtOpen - Apertura de sub-gaveta telescópica izquierda
 * @param {boolean} props.isRightOpen - Apertura de gaveta derecha primaria
 * @param {boolean} props.isRightExtOpen - Apertura de sub-gaveta telescópica derecha
 * @param {Function} props.onToggleLeftExt - Alternar sub-gaveta izquierda
 * @param {Function} props.onToggleRightExt - Alternar sub-gaveta derecha
 * @param {Function} [props.onCloseAll] - Cerrar gavetas al tocar fuera (móvil)
 */
export default function SideDrawers({
  levels,
  currentLevel,
  progress = {},
  onSelectLevel,
  isLeftOpen,
  isLeftExtOpen,
  isRightOpen,
  isRightExtOpen,
  onToggleLeftExt,
  onToggleRightExt,
  onCloseAll,
}) {
  // Distribución fija de los 15 niveles ordenados por dificultad en los 4 compartimentos telescópicos:
  // Izquierda (Retos 1 al 8): Niveles Iniciales / Intermedios
  // Derecha (Retos 9 al 15): Niveles Avanzados / Maestros
  const drawerL1 = levels.slice(0, 4);   // Retos 1 al 4 (Iniciales)
  const drawerL2 = levels.slice(4, 8);   // Retos 5 al 8 (Intermedios - Sub-gaveta)
  const drawerR1 = levels.slice(8, 12);  // Retos 9 al 12 (Avanzados)
  const drawerR2 = levels.slice(12, 15); // Retos 13 al 15 (Maestros - Sub-gaveta)

  return (
    <>
      {/* Backdrop táctil en móvil para cerrar las gavetas al tocar fuera */}
      {(isLeftOpen || isRightOpen) && onCloseAll && (
        <div
          onClick={onCloseAll}
          aria-hidden="true"
          className="md:hidden fixed inset-0 z-30 bg-black/45 backdrop-blur-[1.5px] transition-opacity duration-300"
        />
      )}

      {/* ================= GAVETA IZQUIERDA 2 (TELESCÓPICA) ================= */}
      <div
        className={`absolute top-0 bottom-0 left-0 md:left-0 max-md:left-1.5 w-[124px] bg-zinc-900 max-md:bg-zinc-950/95 max-md:backdrop-blur-md border-2 border-zinc-800 max-md:border-zinc-700/90 rounded-2xl p-2 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none flex flex-col ${
          isLeftOpen && isLeftExtOpen
            ? 'md:-translate-x-[260px] max-md:translate-x-[128px] opacity-100 pointer-events-auto visible z-30 md:z-10'
            : isLeftOpen
            ? 'md:-translate-x-[130px] max-md:translate-x-0 opacity-0 pointer-events-none invisible z-0'
            : 'translate-x-0 opacity-0 pointer-events-none invisible z-0'
        }`}
      >
        <div className="w-full pb-1 mb-0.5 border-b border-zinc-800/80 text-center shrink-0">
          <span className="block text-[7.5px] leading-[1.15] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            NIVELES INICIALES / INTERMEDIOS
          </span>
        </div>
        <div className="w-full flex-1 flex flex-col justify-evenly items-center overflow-hidden">
          {drawerL2.map((lvl) => (
            <ChallengeCard
              key={lvl.id}
              level={lvl}
              isActive={currentLevel?.id === lvl.id}
              progressData={progress?.[lvl.id] || null}
              onClick={() => onSelectLevel(lvl)}
            />
          ))}
        </div>
      </div>

      {/* ================= GAVETA IZQUIERDA 1 (PRIMARIA) ================= */}
      <div
        className={`absolute top-0 bottom-0 left-0 md:left-0 max-md:left-1.5 w-[124px] bg-zinc-900 max-md:bg-zinc-950/95 max-md:backdrop-blur-md border-2 border-zinc-800 max-md:border-zinc-700/90 rounded-2xl p-2 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none flex flex-col ${
          isLeftOpen
            ? 'md:-translate-x-[130px] max-md:translate-x-0 opacity-100 pointer-events-auto visible z-40 md:z-20'
            : 'translate-x-0 opacity-0 pointer-events-none invisible z-0'
        }`}
      >
        {/* Pestaña Telescópica: En escritorio sale por la izquierda; en móvil sale por la derecha hacia adentro */}
        {isLeftOpen && onToggleLeftExt && (
          <button
            onClick={onToggleLeftExt}
            title={isLeftExtOpen ? 'Retraer sub-gaveta 2' : 'Extender sub-gaveta telescópica 2'}
            className="absolute md:-left-3.5 max-md:-right-4 top-1/2 -translate-y-1/2 w-4 md:w-3.5 h-16 md:rounded-l-md max-md:rounded-r-md bg-zinc-800 hover:bg-zinc-700 md:border-l max-md:border-r border-y border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer shadow-xl transition-colors z-50 group"
          >
            {/* Ícono Desktop (abre hacia la izquierda) */}
            <svg
              className="hidden md:block w-2.5 h-2.5 group-hover:scale-125 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isLeftExtOpen ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
            {/* Ícono Móvil (abre hacia adentro a la derecha) */}
            <svg
              className="md:hidden w-2.5 h-2.5 group-hover:scale-125 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isLeftExtOpen ? (
                <path d="M15 18l-6-6 6-6" />
              ) : (
                <path d="M9 18l6-6-6-6" />
              )}
            </svg>
          </button>
        )}

        <div className="w-full pb-1 mb-0.5 border-b border-zinc-800/80 text-center shrink-0">
          <span className="block text-[7.5px] leading-[1.15] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            NIVELES INICIALES / INTERMEDIOS
          </span>
        </div>
        <div className="w-full flex-1 flex flex-col justify-evenly items-center overflow-hidden">
          {drawerL1.map((lvl) => (
            <ChallengeCard
              key={lvl.id}
              level={lvl}
              isActive={currentLevel?.id === lvl.id}
              progressData={progress?.[lvl.id] || null}
              onClick={() => onSelectLevel(lvl)}
            />
          ))}
        </div>
      </div>

      {/* ================= GAVETA DERECHA 1 (PRIMARIA) ================= */}
      <div
        className={`absolute top-0 bottom-0 right-0 md:right-0 max-md:right-1.5 w-[124px] bg-zinc-900 max-md:bg-zinc-950/95 max-md:backdrop-blur-md border-2 border-zinc-800 max-md:border-zinc-700/90 rounded-2xl p-2 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none flex flex-col ${
          isRightOpen
            ? 'md:translate-x-[130px] max-md:translate-x-0 opacity-100 pointer-events-auto visible z-40 md:z-20'
            : 'translate-x-0 opacity-0 pointer-events-none invisible z-0'
        }`}
      >
        {/* Pestaña Telescópica: En escritorio sale por la derecha; en móvil sale por la izquierda hacia adentro */}
        {isRightOpen && onToggleRightExt && (
          <button
            onClick={onToggleRightExt}
            title={isRightExtOpen ? 'Retraer sub-gaveta 2' : 'Extender sub-gaveta telescópica 2'}
            className="absolute md:-right-3.5 max-md:-left-4 top-1/2 -translate-y-1/2 w-4 md:w-3.5 h-16 md:rounded-r-md max-md:rounded-l-md bg-zinc-800 hover:bg-zinc-700 md:border-r max-md:border-l border-y border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer shadow-xl transition-colors z-50 group"
          >
            {/* Ícono Desktop (abre hacia la derecha) */}
            <svg
              className="hidden md:block w-2.5 h-2.5 group-hover:scale-125 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isRightExtOpen ? (
                <path d="M15 18l-6-6 6-6" />
              ) : (
                <path d="M9 18l6-6-6-6" />
              )}
            </svg>
            {/* Ícono Móvil (abre hacia adentro a la izquierda) */}
            <svg
              className="md:hidden w-2.5 h-2.5 group-hover:scale-125 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isRightExtOpen ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        )}

        <div className="w-full pb-1 mb-0.5 border-b border-zinc-800/80 text-center shrink-0">
          <span className="block text-[7.5px] leading-[1.15] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            NIVELES AVANZADOS / MAESTROS
          </span>
        </div>
        <div className="w-full flex-1 flex flex-col justify-evenly items-center overflow-hidden">
          {drawerR1.map((lvl) => (
            <ChallengeCard
              key={lvl.id}
              level={lvl}
              isActive={currentLevel?.id === lvl.id}
              progressData={progress?.[lvl.id] || null}
              onClick={() => onSelectLevel(lvl)}
            />
          ))}
        </div>
      </div>

      {/* ================= GAVETA DERECHA 2 (TELESCÓPICA) ================= */}
      <div
        className={`absolute top-0 bottom-0 right-0 md:right-0 max-md:right-1.5 w-[124px] bg-zinc-900 max-md:bg-zinc-950/95 max-md:backdrop-blur-md border-2 border-zinc-800 max-md:border-zinc-700/90 rounded-2xl p-2 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none flex flex-col ${
          isRightOpen && isRightExtOpen
            ? 'md:translate-x-[260px] max-md:-translate-x-[128px] opacity-100 pointer-events-auto visible z-30 md:z-10'
            : isRightOpen
            ? 'md:translate-x-[130px] max-md:translate-x-0 opacity-0 pointer-events-none invisible z-0'
            : 'translate-x-0 opacity-0 pointer-events-none invisible z-0'
        }`}
      >
        <div className="w-full pb-1 mb-0.5 border-b border-zinc-800/80 text-center shrink-0">
          <span className="block text-[7.5px] leading-[1.15] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            NIVELES AVANZADOS / MAESTROS
          </span>
        </div>
        <div className="w-full flex-1 flex flex-col justify-evenly items-center overflow-hidden">
          {drawerR2.map((lvl) => (
            <ChallengeCard
              key={lvl.id}
              level={lvl}
              isActive={currentLevel?.id === lvl.id}
              progressData={progress?.[lvl.id] || null}
              onClick={() => onSelectLevel(lvl)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
