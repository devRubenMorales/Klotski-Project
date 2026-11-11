import { useState, useEffect, useRef, useCallback } from 'react';
import { GOAL_POSITION } from '../solver/constants.js';
import { solveKlotski, createGrid } from '../solver/klotskiSolver.js';
import { DEFAULT_LEVEL } from '../data/levels.js';

/**
 * Custom Hook para gestionar el estado, la interacción manual,
 * la selección de niveles, la resolución BFS y la reproducción del rompecabezas Klotski.
 *
 * @param {Object} [options]
 * @param {Object} [options.initialLevel=DEFAULT_LEVEL]
 * @param {number} [options.defaultSpeed=400]
 * @param {boolean} [options.autoSolve=true]
 */
export function useKlotski({
  initialLevel = DEFAULT_LEVEL,
  defaultSpeed = 400,
  autoSolve = true,
} = {}) {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [history, setHistory] = useState([initialLevel.pieces]);
  const [moves, setMoves] = useState([]);
  const [isSolving, setIsSolving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(defaultSpeed);
  const [solveTime, setSolveTime] = useState(null);
  const [totalStatesExplored, setTotalStatesExplored] = useState(0);

  // Referencia para el timer de reproducción automática
  const timerRef = useRef(null);

  // Estado activo de las piezas
  const currentPieces = history[currentStepIndex] || currentLevel.pieces;

  // Ref persistente para acceder siempre al estado actual sin regenerar callbacks
  const currentPiecesRef = useRef(currentPieces);
  useEffect(() => {
    currentPiecesRef.current = currentPieces;
  }, [currentPieces]);

  // Matriz 2D 5x4 calculada del estado actual para colisiones
  const currentGrid = createGrid(currentPieces);

  // Determinar si el estado actual cumple con la meta
  const isCompleted =
    currentPieces.R?.r === GOAL_POSITION.r &&
    currentPieces.R?.c === GOAL_POSITION.c;

  /**
   * Ejecuta el solver BFS para encontrar la solución óptima.
   * Si no se especifica un estado inicial, resuelve desde la posición actual del tablero.
   * Mantiene referencia estable [] para evitar re-renderizados y bugs de reseteo.
   */
  const solvePuzzle = useCallback((targetPieces = null) => {
    setIsSolving(true);
    setIsPlaying(false);

    const piecesToSolve = targetPieces || currentPiecesRef.current;

    return new Promise((resolve) => {
      setTimeout(() => {
        const result = solveKlotski(piecesToSolve);

        if (result.isSolvable) {
          setHistory(result.history);
          setMoves(result.moves);
          setSolveTime(result.timeMs);
          setTotalStatesExplored(result.totalStatesExplored);
          setCurrentStepIndex(0);
        }

        setIsSolving(false);
        resolve(result);
      }, 16);
    });
  }, []);

  /**
   * Carga un nuevo nivel del catálogo, actualizando el cartucho,
   * el tablero y recalculando automáticamente la solución óptima.
   */
  const loadLevel = useCallback((level) => {
    setIsPlaying(false);
    setCurrentLevel(level);
    setHistory([level.pieces]);
    setCurrentStepIndex(0);
    setMoves([]);
    setIsSolving(true);

    setTimeout(() => {
      const result = solveKlotski(level.pieces);
      if (result.isSolvable) {
        setHistory(result.history);
        setMoves(result.moves);
        setSolveTime(result.timeMs);
        setTotalStatesExplored(result.totalStatesExplored);
        setCurrentStepIndex(0);
      }
      setIsSolving(false);
    }, 16);
  }, []);

  /**
   * Mueve una pieza manualmente arrastrada por el usuario,
   * actualizando el historial y pausando cualquier autoplay.
   * Se ejecuta sin efectos secundarios erróneos para garantizar
   * persistencia inmediata de la posición.
   */
  const movePieceManually = useCallback(
    (pieceId, newR, newC) => {
      setIsPlaying(false);

      const activeState = history[currentStepIndex] || currentLevel.pieces;
      const piece = activeState[pieceId];
      if (!piece) return;

      // Si no cambió de posición, ignorar
      if (piece.r === newR && piece.c === newC) {
        return;
      }

      const dr = newR - piece.r;
      const dc = newC - piece.c;
      const steps = Math.max(Math.abs(dr), Math.abs(dc));
      let direction = '';
      if (dr < 0) direction = 'ARRIBA';
      else if (dr > 0) direction = 'ABAJO';
      else if (dc < 0) direction = 'IZQUIERDA';
      else if (dc > 0) direction = 'DERECHA';

      const nextState = {
        ...activeState,
        [pieceId]: { ...piece, r: newR, c: newC },
      };

      const manualMove = {
        pieceId,
        pieceType: piece.type,
        direction,
        steps,
        from: [piece.r, piece.c],
        to: [newR, newC],
        boardState: nextState,
      };

      const newHistory = [
        ...history.slice(0, currentStepIndex + 1),
        nextState,
      ];
      const newMoves = [
        ...moves.slice(0, currentStepIndex),
        manualMove,
      ];

      setHistory(newHistory);
      setMoves(newMoves);
      setCurrentStepIndex(newHistory.length - 1);
    },
    [history, currentStepIndex, currentLevel.pieces, moves]
  );

  /**
   * Navegación al siguiente paso
   */
  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < history.length - 1) {
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  }, [history.length]);

  /**
   * Navegación al paso anterior
   */
  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  /**
   * Ir a un paso específico
   */
  const goToStep = useCallback(
    (index) => {
      const target = Math.max(0, Math.min(index, history.length - 1));
      setCurrentStepIndex(target);
      if (target === history.length - 1) {
        setIsPlaying(false);
      }
    },
    [history.length]
  );

  /**
   * Reiniciar al paso 0 de la solución actual
   */
  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  /**
   * Reiniciar el tablero al estado inicial original del nivel activo
   */
  const resetToInitial = useCallback(() => {
    setIsPlaying(false);
    loadLevel(currentLevel);
  }, [loadLevel, currentLevel]);

  /**
   * Iniciar reproducción automática
   */
  const play = useCallback(() => {
    if (moves.length === 0) return;

    setCurrentStepIndex((curr) => {
      if (curr >= history.length - 1) {
        return 0;
      }
      return curr;
    });

    setIsPlaying(true);
  }, [moves.length, history.length]);

  /**
   * Pausar reproducción automática
   */
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  /**
   * Alternar reproducción / pausa
   */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Manejo del temporizador de reproducción automática
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= history.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, history.length]);

  // Ejecución inicial automática única al montar (o si cambia autoSolve)
  const initialSolvedRef = useRef(false);
  useEffect(() => {
    if (autoSolve && !initialSolvedRef.current) {
      initialSolvedRef.current = true;
      solvePuzzle(currentLevel.pieces);
    }
  }, [autoSolve, currentLevel.pieces, solvePuzzle]);

  const currentMove =
    currentStepIndex > 0 && moves[currentStepIndex - 1]
      ? moves[currentStepIndex - 1]
      : null;

  return {
    // Estados
    currentLevel,
    currentStepIndex,
    history,
    moves,
    isSolving,
    isPlaying,
    playbackSpeed,
    isCompleted,
    solveTime,
    totalStatesExplored,

    // Helpers derivados
    currentPieces,
    currentGrid,
    currentMove,
    totalSteps: moves.length,

    // Métodos
    loadLevel,
    solvePuzzle,
    movePieceManually,
    nextStep,
    prevStep,
    goToStep,
    reset,
    resetToInitial,
    play,
    pause,
    togglePlay,
    setPlaybackSpeed,
  };
}
