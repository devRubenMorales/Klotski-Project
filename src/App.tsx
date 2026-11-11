import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board.jsx';
import Controls from './components/Controls.jsx';
import SideDrawers from './components/SideDrawers.jsx';
import { useKlotski } from './hooks/useKlotski.js';
import { LEVELS } from './data/levels.js';

export default function App() {
  const {
    currentLevel,
    currentStepIndex,
    totalSteps,
    isSolving,
    isPlaying,
    playbackSpeed,
    isCompleted,
    solveTime,
    totalStatesExplored,
    currentMove,
    currentPieces,
    currentGrid,
    loadLevel,
    solvePuzzle,
    movePieceManually,
    nextStep,
    prevStep,
    goToStep,
    reset,
    resetToInitial,
    pause,
    togglePlay,
    setPlaybackSpeed,
  } = useKlotski();

  // Estado del menú de reproducción IA (oculto al iniciar)
  const [isSolverMenuOpen, setIsSolverMenuOpen] = useState(false);

  // Estados independientes para apertura de gavetas (primarias y telescópicas)
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isLeftExtOpen, setIsLeftExtOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isRightExtOpen, setIsRightExtOpen] = useState(false);

  const activeLevel = currentLevel as any;

  // Abrir el menú de IA: cierra únicamente las gavetas derechas si estuvieran abiertas
  const handleOpenSolverMenu = useCallback(() => {
    setIsRightDrawerOpen(false);
    setIsRightExtOpen(false);
    setIsSolverMenuOpen(true);

    // Si el jugador realizó movimientos manuales previos, recalcula desde la posición actual
    if (currentStepIndex > 0 || totalSteps === 0) {
      solvePuzzle();
    }
  }, [currentStepIndex, totalSteps, solvePuzzle]);

  // Cerrar el menú de IA y devolver el tablero al centro
  const handleCloseSolverMenu = useCallback(() => {
    pause();
    setIsSolverMenuOpen(false);
  }, [pause]);

  // Abrir/cerrar gaveta izquierda (NO cierra el menú de reproducción IA)
  const handleToggleLeft = () => {
    setIsLeftDrawerOpen((prev) => {
      if (prev) {
        setIsLeftExtOpen(false);
      }
      return !prev;
    });
  };

  // Abrir/cerrar gaveta derecha (cierra el menú de IA si está abierto)
  const handleToggleRight = () => {
    setIsRightDrawerOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsSolverMenuOpen(false);
        pause();
      } else {
        setIsRightExtOpen(false);
      }
      return next;
    });
  };

  const handleToggleLeftExt = () => {
    setIsLeftExtOpen((prev) => !prev);
  };

  const handleToggleRightExt = () => {
    setIsRightExtOpen((prev) => !prev);
  };

  // Atajos de teclado: Escape para cerrar el menú, Flechas para navegar, Espacio para reproducir/pausar, R para reiniciar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Escape') {
        if (isSolverMenuOpen) {
          e.preventDefault();
          handleCloseSolverMenu();
        }
        return;
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.code === 'Space') {
        if (isSolverMenuOpen) {
          e.preventDefault();
          togglePlay();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSolverMenuOpen, handleCloseSolverMenu, nextStep, prevStep, togglePlay, reset]);

  return (
    <main className="h-screen max-h-screen w-screen max-w-full overflow-hidden select-none flex items-center justify-center bg-zinc-950 p-2 sm:p-4 relative">
      {/* Resplandores ambientales de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Banner flotante de Victoria (absoluto para no desplazar el tablero) */}
      {isCompleted && (
        <div className="absolute top-3 z-50 animate-bounce pointer-events-none">
          <div className="px-5 py-2 bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-cyan-500/90 text-zinc-950 font-mono font-bold text-xs sm:text-sm rounded-full shadow-[0_0_25px_rgba(16,185,129,0.7)] border-2 border-white/70 flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <span>
              {totalSteps > 0
                ? `¡${activeLevel?.name || 'Reto'} Resuelto en ${totalSteps} pasos!`
                : '¡Victoria! Has llevado el Bloque Rojo a la salida.'}
            </span>
            <span className="text-lg">✨</span>
          </div>
        </div>
      )}

      {/* Contenedor Principal: Tablero siempre centrado verticalmente */}
      <div
        className={`z-10 w-full max-w-6xl flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSolverMenuOpen ? 'gap-6 lg:gap-12' : 'gap-0'
          }`}
      >
        {/* Consola Física con Gavetas Telescópicas Dobles */}
        <section
          aria-label="Tablero Klotski con gavetas telescópicas"
          className="relative flex flex-col items-center shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          {/* Botón Superior para Abrir Asistencia IA (desaparece suavemente al abrir el menú) */}
          <div
            className={`absolute -top-14 left-1/2 -translate-x-1/2 z-30 w-[288px] transition-all duration-300 ease-out ${isSolverMenuOpen
                ? 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                : 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              }`}
          >
            <button
              onClick={handleOpenSolverMenu}
              className="group relative w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:via-indigo-500 hover:to-purple-500 text-white font-mono font-semibold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.45)] hover:shadow-[0_0_25px_rgba(6,182,212,0.65)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer overflow-hidden border border-cyan-400/30"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <svg
                className="w-4 h-4 text-cyan-200 shrink-0"
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
              <span>Resolver con IA</span>
            </button>
          </div>

          {/* Gavetas Corredizas Telescópicas (L1, L2, R1, R2) */}
          <SideDrawers
            levels={LEVELS}
            currentLevel={currentLevel}
            onSelectLevel={(lvl: any) => {
              loadLevel(lvl);
            }}
            isLeftOpen={isLeftDrawerOpen}
            isLeftExtOpen={isLeftExtOpen}
            isRightOpen={isRightDrawerOpen}
            isRightExtOpen={isRightExtOpen}
            onToggleLeftExt={handleToggleLeftExt}
            onToggleRightExt={handleToggleRightExt}
          />

          {/* Tablero Principal con Cartucho Activo y Pestañas Laterales */}
          <Board
            pieces={currentPieces}
            grid={currentGrid}
            currentMove={currentMove}
            isCompleted={isCompleted}
            onMovePiece={movePieceManually}
            onDragStart={pause}
            currentLevel={currentLevel}
            isLeftDrawerOpen={isLeftDrawerOpen}
            isRightDrawerOpen={isRightDrawerOpen}
            onToggleLeft={handleToggleLeft}
            onToggleRight={handleToggleRight}
          />
        </section>

        {/* Panel de Mandos Cyber-Gamer: sale desplazado hacia la derecha y centra el conjunto */}
        <section
          aria-label="Controles del Solver"
          className={`shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSolverMenuOpen
              ? 'w-[340px] sm:w-[448px] max-w-md opacity-100 pointer-events-auto'
              : 'w-0 max-w-0 opacity-0 pointer-events-none overflow-hidden'
            }`}
        >
          <div
            className={`w-[340px] sm:w-[448px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSolverMenuOpen
                ? 'translate-x-0 scale-100 opacity-100'
                : '-translate-x-16 scale-95 opacity-0'
              }`}
          >
            <Controls
              currentStepIndex={currentStepIndex}
              totalSteps={totalSteps}
              isSolving={isSolving}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              isCompleted={isCompleted}
              solveTime={solveTime}
              totalStatesExplored={totalStatesExplored}
              currentMove={currentMove}
              solvePuzzle={solvePuzzle}
              nextStep={nextStep}
              prevStep={prevStep}
              goToStep={goToStep}
              reset={reset}
              resetToInitial={resetToInitial}
              togglePlay={togglePlay}
              setPlaybackSpeed={setPlaybackSpeed}
              onClose={handleCloseSolverMenu}
            />

            {/* Guía de atajos de teclado y ayuda */}
            <div className="mt-3 flex flex-col items-center gap-1 text-[11px] font-mono text-zinc-500">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Espacio</kbd> Play/Pausa</span>
                <span><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">←</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">→</kbd> Pasos</span>
                <span><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">R</kbd> Reiniciar</span>
                <span><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Esc</kbd> Cerrar</span>
              </div>
              <span className="text-zinc-600 text-[10px]">
                Usa las pestañas laterales en los costados del tablero para abrir las gavetas
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
