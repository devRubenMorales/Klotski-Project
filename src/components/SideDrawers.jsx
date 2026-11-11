import ChallengeCard from './ChallengeCard.jsx';

/**
 * Componente SideDrawers: Sistema de gavetas laterales dobles telescópicas (L1, L2, R1, R2)
 * que se deslizan independientemente para albergar los 15 niveles de desafíos.
 *
 * @param {Object} props
 * @param {Array<Object>} props.levels - Catálogo completo de 15 niveles
 * @param {Object} props.currentLevel - Nivel seleccionado actualmente
 * @param {Function} props.onSelectLevel - Callback al seleccionar una tarjeta
 * @param {boolean} props.isLeftOpen - Apertura de gaveta izquierda primaria
 * @param {boolean} props.isLeftExtOpen - Apertura de sub-gaveta telescópica izquierda
 * @param {boolean} props.isRightOpen - Apertura de gaveta derecha primaria
 * @param {boolean} props.isRightExtOpen - Apertura de sub-gaveta telescópica derecha
 * @param {Function} props.onToggleLeftExt - Alternar sub-gaveta izquierda
 * @param {Function} props.onToggleRightExt - Alternar sub-gaveta derecha
 */
export default function SideDrawers({
  levels,
  currentLevel,
  onSelectLevel,
  isLeftOpen,
  isLeftExtOpen,
  isRightOpen,
  isRightExtOpen,
  onToggleLeftExt,
  onToggleRightExt,
}) {
  // Distribución fija de los 15 niveles en los 4 compartimentos telescópicos
  const drawerL1 = levels.slice(0, 4);   // Niveles 1 al 4
  const drawerL2 = levels.slice(4, 8);   // Niveles 5 al 8 (Telescópica)
  const drawerR1 = levels.slice(8, 12);  // Niveles 9 al 12
  const drawerR2 = levels.slice(12, 15); // Niveles 13 al 15 (Telescópica)

  return (
    <>
      {/* ================= GAVETA IZQUIERDA 2 (TELESCÓPICA EXTERIOR) ================= */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-[124px] bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-2 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isLeftOpen && isLeftExtOpen
            ? '-translate-x-[260px] opacity-100 pointer-events-auto z-10'
            : isLeftOpen
            ? '-translate-x-[130px] opacity-0 pointer-events-none z-0'
            : 'translate-x-0 opacity-0 pointer-events-none z-0'
        }`}
      >
        <div className="w-full h-full flex flex-col justify-evenly items-center overflow-hidden py-1">
          {drawerL2.map((lvl) => (
            <ChallengeCard
              key={lvl.id}
              level={lvl}
              isActive={currentLevel?.id === lvl.id}
              onClick={() => onSelectLevel(lvl)}
            />
          ))}
        </div>
      </div>

      {/* ================= GAVETA IZQUIERDA 1 (PRIMARIA) ================= */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-[124px] bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-2 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isLeftOpen
            ? '-translate-x-[130px] opacity-100 pointer-events-auto z-20'
            : 'translate-x-0 opacity-0 pointer-events-none z-0'
        }`}
      >
        {/* Pestaña / Flecha Telescópica exterior izquierda */}
        {isLeftOpen && onToggleLeftExt && (
          <button
            onClick={onToggleLeftExt}
            title={isLeftExtOpen ? 'Retraer sub-gaveta 2' : 'Extender sub-gaveta telescópica 2'}
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-16 rounded-l-md bg-zinc-800 hover:bg-zinc-700 border-l border-y border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer shadow-xl transition-colors z-30 group"
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
              {isLeftExtOpen ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        )}

        <div className="w-full h-full flex flex-col justify-evenly items-center overflow-hidden py-1">
          {drawerL1.map((lvl) => (
            <ChallengeCard
              key={lvl.id}
              level={lvl}
              isActive={currentLevel?.id === lvl.id}
              onClick={() => onSelectLevel(lvl)}
            />
          ))}
        </div>
      </div>

      {/* ================= GAVETA DERECHA 1 (PRIMARIA) ================= */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-[124px] bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-2 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isRightOpen
            ? 'translate-x-[130px] opacity-100 pointer-events-auto z-20'
            : 'translate-x-0 opacity-0 pointer-events-none z-0'
        }`}
      >
        {/* Pestaña / Flecha Telescópica exterior derecha */}
        {isRightOpen && onToggleRightExt && (
          <button
            onClick={onToggleRightExt}
            title={isRightExtOpen ? 'Retraer sub-gaveta 2' : 'Extender sub-gaveta telescópica 2'}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-16 rounded-r-md bg-zinc-800 hover:bg-zinc-700 border-r border-y border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-100 flex items-center justify-center cursor-pointer shadow-xl transition-colors z-30 group"
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
              {isRightExtOpen ? (
                <path d="M15 18l-6-6 6-6" />
              ) : (
                <path d="M9 18l6-6-6-6" />
              )}
            </svg>
          </button>
        )}

        <div className="w-full h-full flex flex-col justify-evenly items-center overflow-hidden py-1">
          {drawerR1.map((lvl) => (
            <ChallengeCard
              key={lvl.id}
              level={lvl}
              isActive={currentLevel?.id === lvl.id}
              onClick={() => onSelectLevel(lvl)}
            />
          ))}
        </div>
      </div>

      {/* ================= GAVETA DERECHA 2 (TELESCÓPICA EXTERIOR) ================= */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-[124px] bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-2 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isRightOpen && isRightExtOpen
            ? 'translate-x-[260px] opacity-100 pointer-events-auto z-10'
            : isRightOpen
            ? 'translate-x-[130px] opacity-0 pointer-events-none z-0'
            : 'translate-x-0 opacity-0 pointer-events-none z-0'
        }`}
      >
        <div className="w-full h-full flex flex-col justify-evenly items-center overflow-hidden py-1">
          {drawerR2.map((lvl) => (
            <ChallengeCard
              key={lvl.id}
              level={lvl}
              isActive={currentLevel?.id === lvl.id}
              onClick={() => onSelectLevel(lvl)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
