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
    isRouteDirty,
    isSolving,
    isPlaying,
    playbackSpeed,
    isCompleted,
    solveTime,
    totalStatesExplored,
    manualMovesCount,
    usedAI,
    progress,
    currentLevelProgress,
    isNewRecord,
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

  // Cerrar todas las gavetas (usado al tocar fuera o seleccionar nivel en móvil)
  const handleCloseAllDrawers = useCallback(() => {
    setIsLeftDrawerOpen(false);
    setIsLeftExtOpen(false);
    setIsRightDrawerOpen(false);
    setIsRightExtOpen(false);
  }, []);

  // Abrir el menú de IA: cierra las gavetas derechas (y en móvil todas las gavetas superpuestas)
  const handleOpenSolverMenu = useCallback(() => {
    setIsRightDrawerOpen(false);
    setIsRightExtOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsLeftDrawerOpen(false);
      setIsLeftExtOpen(false);
    }
    setIsSolverMenuOpen(true);

    // Si el jugador realizó movimientos manuales previos, recalcula desde la posición actual
    if (isRouteDirty || currentStepIndex > 0 || totalSteps === 0) {
      solvePuzzle();
    }
  }, [isRouteDirty, currentStepIndex, totalSteps, solvePuzzle]);

  // Cerrar el menú de IA y devolver el tablero a su escala y centro normal
  const handleCloseSolverMenu = useCallback(() => {
    pause();
    setIsSolverMenuOpen(false);
  }, [pause]);

  // Abrir/cerrar gaveta izquierda (NO cierra el menú de reproducción IA)
  const handleToggleLeft = () => {
    setIsLeftDrawerOpen((prev) => {
      const next = !prev;
      if (next) {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setIsRightDrawerOpen(false);
          setIsRightExtOpen(false);
        }
      } else {
        setIsLeftExtOpen(false);
      }
      return next;
    });
  };

  // Abrir/cerrar gaveta derecha (cierra el menú de IA si está abierto)
  const handleToggleRight = () => {
    setIsRightDrawerOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsSolverMenuOpen(false);
        pause();
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setIsLeftDrawerOpen(false);
          setIsLeftExtOpen(false);
        }
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

  // Atajos de teclado: Escape para cerrar el menú/gavetas, Flechas para navegar, Espacio para reproducir/pausar, R para reiniciar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Escape') {
        if (isSolverMenuOpen) {
          e.preventDefault();
          handleCloseSolverMenu();
        } else if (isLeftDrawerOpen || isRightDrawerOpen) {
          e.preventDefault();
          handleCloseAllDrawers();
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
  }, [
    isSolverMenuOpen,
    isLeftDrawerOpen,
    isRightDrawerOpen,
    handleCloseSolverMenu,
    handleCloseAllDrawers,
    nextStep,
    prevStep,
    togglePlay,
    reset,
  ]);

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-screen max-w-full overflow-hidden select-none flex items-center justify-center bg-zinc-950 px-4 py-2 relative">
      {/* Resplandores ambientales de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Banner flotante de Victoria (absoluto para no desplazar el tablero) */}
      {isCompleted && (
        <div className="absolute top-2.5 z-50 px-3 max-w-full">
          {!usedAI ? (
            <div className="animate-bounce px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500/95 via-teal-500/95 to-cyan-500/95 text-zinc-950 font-mono font-bold text-xs sm:text-sm rounded-full shadow-[0_0_25px_rgba(16,185,129,0.7)] border-2 border-white/70 flex items-center gap-2 flex-wrap justify-center">
              <span className="text-base sm:text-lg">🏆</span>
              <span>
                ¡Nivel Completado en {manualMovesCount} pasos!
              </span>
              {isNewRecord && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-950 text-emerald-300 text-[10px] sm:text-xs font-extrabold tracking-wider border border-emerald-300/60 shadow-sm">
                  ¡NUEVO RÉCORD!
                </span>
              )}
              <span className="text-base sm:text-lg">✨</span>
            </div>
          ) : (
            <div className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-zinc-900/95 text-amber-300 font-mono font-semibold text-[11px] sm:text-xs rounded-2xl sm:rounded-full shadow-[0_0_25px_rgba(245,158,11,0.35)] border border-amber-500/60 flex items-center gap-2.5 flex-wrap justify-center text-center">
              <span className="text-sm sm:text-base">🤖</span>
              <span>
                Resuelto con IA en {currentStepIndex} pasos — Reinicia el nivel y resuélvelo sin ayuda para guardar tu progreso
              </span>
              <button
                type="button"
                onClick={reset}
                className="px-2.5 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] sm:text-xs cursor-pointer transition-colors shadow-sm"
              >
                Reiniciar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contenedor Principal: En Desktop alinea Tablero + Solver horizontalmente; en Móvil centra el Tablero y fija el Solver abajo */}
      <div
        className={`z-10 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSolverMenuOpen ? 'md:gap-6 lg:gap-12' : 'gap-0'
          }`}
      >
        {/* Consola Física con Gavetas Telescópicas Dobles */}
        <section
          aria-label="Tablero Klotski con gavetas telescópicas"
          className={`relative flex flex-col items-center shrink-0 transition-transform duration-300 ease-out ${isSolverMenuOpen
              ? 'max-md:scale-[0.78] max-md:origin-top max-md:-mt-2 max-md:-translate-y-16 md:scale-100 md:translate-y-0'
              : 'max-md:scale-[0.9] sm:scale-100 translate-y-0'
            }`}
        >
          {/* Botón Superior para Abrir Asistencia IA (desaparece suavemente al abrir el menú) */}
          <div
            className={`absolute -top-13 md:-top-14 left-1/2 -translate-x-1/2 z-30 w-[288px] transition-all duration-300 ease-out ${isSolverMenuOpen
                ? 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
                : 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
              }`}
            style={{ top: '-52px' }}
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
            progress={progress}
            onSelectLevel={(lvl: any) => {
              loadLevel(lvl);
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                handleCloseAllDrawers();
              }
            }}
            isLeftOpen={isLeftDrawerOpen}
            isLeftExtOpen={isLeftExtOpen}
            isRightOpen={isRightDrawerOpen}
            isRightExtOpen={isRightExtOpen}
            onToggleLeftExt={handleToggleLeftExt}
            onToggleRightExt={handleToggleRightExt}
            onCloseAll={handleCloseAllDrawers}
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
            manualMovesCount={manualMovesCount}
            usedAI={usedAI}
            currentStepIndex={currentStepIndex}
            levelProgress={currentLevelProgress}
            onReset={reset}
            isLeftDrawerOpen={isLeftDrawerOpen}
            isRightDrawerOpen={isRightDrawerOpen}
            onToggleLeft={handleToggleLeft}
            onToggleRight={handleToggleRight}
          />
        </section>

        {/* Panel de Mandos Cyber-Gamer:
            - En Desktop (md:): sale desplazado hacia la derecha y centra el conjunto.
            - En Móvil (< 768px): Bottom Bar compacta fija en la parte inferior de la pantalla. */}
        <section
          aria-label="Controles del Solver"
          className={`shrink-0 max-md:fixed max-md:bottom-0 max-md:inset-x-0 max-md:z-40 max-md:px-2.5 max-md:pb-2.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSolverMenuOpen
              ? 'max-md:translate-y-0 max-md:opacity-100 max-md:pointer-events-auto max-md:visible md:w-[400px] lg:w-[448px] md:max-w-md md:opacity-100 md:pointer-events-auto md:visible'
              : 'max-md:translate-y-full max-md:opacity-0 max-md:pointer-events-none max-md:invisible md:w-0 md:max-w-0 md:opacity-0 md:pointer-events-none md:invisible md:overflow-hidden'
            }`}
        >
          <div
            className={`w-full md:w-[400px] lg:w-[448px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSolverMenuOpen
                ? 'md:translate-x-0 md:scale-100 opacity-100'
                : 'md:-translate-x-16 md:scale-95 opacity-0'
              }`}
          >
            <Controls
              currentStepIndex={currentStepIndex}
              totalSteps={totalSteps}
              isSolving={isSolving}
              isPlaying={isPlaying}
              isRouteDirty={isRouteDirty}
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

            {/* Guía de atajos de teclado (Solo Desktop) */}
            <div className="hidden md:flex mt-3 flex-col items-center gap-1 text-[11px] font-mono text-zinc-500">
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
