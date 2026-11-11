import { useState, useEffect, useRef, useCallback } from 'react';
import { GOAL_POSITION } from '../solver/constants.js';
import {
  solveKlotski,
  createGrid,
  canMovePieceTo,
  isValidBoardState,
} from '../solver/klotskiSolver.js';
import { DEFAULT_LEVEL } from '../data/levels.js';
import { loadProgress, recordLevelVictory } from '../utils/storage.js';

/**
 * Custom Hook para gestionar el estado, la interacción manual,
 * la selección de niveles, el conteo de movimientos equivalentes a BFS,
 * la regla estricta anti-IA, el guardado de progreso en localStorage
 * y la reproducción del rompecabezas Klotski.
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
  const [isRouteDirty, setIsRouteDirty] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(defaultSpeed);
  const [solveTime, setSolveTime] = useState(null);
  const [totalStatesExplored, setTotalStatesExplored] = useState(0);

  // Estados de partida manual, regla anti-IA y progreso persistente
  const [manualMovesCount, setManualMovesCount] = useState(0);
  const [usedAI, setUsedAI] = useState(false);
  const [lastMovedPieceId, setLastMovedPieceId] = useState(null);
  const [progress, setProgress] = useState(() => loadProgress());
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Referencias síncronas para evitar condiciones de carrera en eventos rápidos
  const timerRef = useRef(null);
  const isRouteDirtyRef = useRef(false);
  const manualMovesCountRef = useRef(0);
  const usedAIRef = useRef(false);
  const lastMovedPieceIdRef = useRef(null);
  const victoryRecordedRef = useRef(false);
  const initialLevelSolutionRef = useRef(null);

  // Estado activo de las piezas con guardia anti-superposición
  const rawPieces = history[currentStepIndex] || currentLevel.pieces;
  const currentPieces = isValidBoardState(rawPieces)
    ? rawPieces
    : currentLevel.pieces;

  // Ref persistente para acceder siempre al estado actual sin regenerar callbacks
  const currentPiecesRef = useRef(currentPieces);
  useEffect(() => {
    if (isValidBoardState(currentPieces)) {
      currentPiecesRef.current = currentPieces;
    }
  }, [currentPieces]);

  // Matriz 2D 5x4 calculada del estado actual para colisiones
  const currentGrid = createGrid(currentPieces);

  // Determinar si el estado actual cumple con la meta (Bloque Rojo en fila 3, col 1)
  const isCompleted =
    currentPieces.R?.r === GOAL_POSITION.r &&
    currentPieces.R?.c === GOAL_POSITION.c;

  // Guardado de progreso en localStorage al alcanzar la victoria (solo si usedAI === false)
  useEffect(() => {
    if (isCompleted) {
      if (!victoryRecordedRef.current) {
        victoryRecordedRef.current = true;
        if (!usedAIRef.current && currentLevel?.id) {
          const { progress: updatedProgress, isNewRecord: newRec } =
            recordLevelVictory(currentLevel.id, manualMovesCountRef.current);
          setProgress(updatedProgress);
          setIsNewRecord(newRec);
        } else {
          setIsNewRecord(false);
        }
      }
    } else {
      victoryRecordedRef.current = false;
    }
  }, [isCompleted, currentLevel?.id]);

  /**
   * Marca el intento actual como asistido por IA.
   */
  const markAIUsed = useCallback(() => {
    usedAIRef.current = true;
    setUsedAI(true);
    lastMovedPieceIdRef.current = null;
    setLastMovedPieceId(null);
  }, []);

  /**
   * Ejecuta el solver BFS para encontrar la solución óptima.
   * Si no se especifica un estado inicial, resuelve desde la posición actual del tablero.
   */
  const solvePuzzle = useCallback((targetPieces = null) => {
    setIsSolving(true);
    setIsPlaying(false);

    const piecesToSolve = targetPieces || currentPiecesRef.current;
    if (!isValidBoardState(piecesToSolve)) {
      setIsSolving(false);
      return Promise.resolve({ isSolvable: false, moves: [], history: [] });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const result = solveKlotski(piecesToSolve);

        if (
          result.isSolvable &&
          result.history.every((state) => isValidBoardState(state))
        ) {
          isRouteDirtyRef.current = false;
          setIsRouteDirty(false);
          setHistory(result.history);
          setMoves(result.moves);
          setSolveTime(result.timeMs);
          setTotalStatesExplored(result.totalStatesExplored);
          setCurrentStepIndex(0);
          currentPiecesRef.current = result.history[0];

          if (targetPieces) {
            initialLevelSolutionRef.current = result;
          }
        }

        setIsSolving(false);
        resolve(result);
      }, 16);
    });
  }, []);

  /**
   * Carga un nivel del catálogo y restablece el intento limpio desde 0
   * (manualMovesCount = 0, usedAI = false, lastMovedPieceId = null).
   */
  const loadLevel = useCallback((level) => {
    if (!level || !isValidBoardState(level.pieces)) return;

    setIsPlaying(false);
    isRouteDirtyRef.current = false;
    setIsRouteDirty(false);

    manualMovesCountRef.current = 0;
    setManualMovesCount(0);
    usedAIRef.current = false;
    setUsedAI(false);
    lastMovedPieceIdRef.current = null;
    setLastMovedPieceId(null);
    victoryRecordedRef.current = false;
    setIsNewRecord(false);

    setCurrentLevel(level);
    setHistory([level.pieces]);
    setCurrentStepIndex(0);
    setMoves([]);
    currentPiecesRef.current = level.pieces;
    setIsSolving(true);

    setTimeout(() => {
      const result = solveKlotski(level.pieces);
      if (
        result.isSolvable &&
        result.history.every((state) => isValidBoardState(state))
      ) {
        initialLevelSolutionRef.current = result;
        setHistory(result.history);
        setMoves(result.moves);
        setSolveTime(result.timeMs);
        setTotalStatesExplored(result.totalStatesExplored);
        setCurrentStepIndex(0);
        currentPiecesRef.current = result.history[0];
      }
      setIsSolving(false);
    }, 16);
  }, []);

  /**
   * Mueve una pieza manualmente arrastrada por el usuario:
   * 1. Verifica el bounding-box completo (h x w) y el trayecto con canMovePieceTo.
   * 2. Verifica la guardia anti-superposición (isValidBoardState: 0 colisiones, 2 huecos).
   * 3. Contabiliza movimientos equivalentes al BFS: si mueve una pieza distinta a
   *    lastMovedPieceId suma +1; si mueve la misma pieza consecutivamente lo agrupa.
   * 4. Marca la ruta previa del solver como obsoleta (isRouteDirty = true).
   */
  const movePieceManually = useCallback(
    (pieceId, newR, newC) => {
      setIsPlaying(false);

      const activeState =
        currentPiecesRef.current ||
        history[currentStepIndex] ||
        currentLevel.pieces;
      const piece = activeState[pieceId];
      if (!piece) return;

      // Si no cambió de posición, ignorar
      if (piece.r === newR && piece.c === newC) {
        return;
      }

      // Validación estricta de colisiones (h x w) y guardia anti-superposición
      if (!canMovePieceTo(activeState, pieceId, newR, newC)) {
        return;
      }

      const nextState = {
        ...activeState,
        [pieceId]: { ...piece, r: newR, c: newC },
      };

      if (!isValidBoardState(nextState)) {
        return;
      }

      // Contabilización justa de movimientos manuales (agrupa deslizamientos continuos de la misma pieza)
      if (pieceId !== lastMovedPieceIdRef.current) {
        const nextCount = manualMovesCountRef.current + 1;
        manualMovesCountRef.current = nextCount;
        setManualMovesCount(nextCount);
        lastMovedPieceIdRef.current = pieceId;
        setLastMovedPieceId(pieceId);
      }

      const dr = newR - piece.r;
      const dc = newC - piece.c;
      const steps = Math.max(Math.abs(dr), Math.abs(dc));
      let direction = '';
      if (dr < 0) direction = 'ARRIBA';
      else if (dr > 0) direction = 'ABAJO';
      else if (dc < 0) direction = 'IZQUIERDA';
      else if (dc > 0) direction = 'DERECHA';

      const manualMove = {
        pieceId,
        pieceType: piece.type,
        direction,
        steps,
        from: [piece.r, piece.c],
        to: [newR, newC],
        boardState: nextState,
      };

      // Marcar ruta del solver como obsoleta y descartar pasos futuros viejos
      isRouteDirtyRef.current = true;
      setIsRouteDirty(true);
      currentPiecesRef.current = nextState;

      const baseHistory = history.slice(0, currentStepIndex + 1);
      const newHistory = [...baseHistory, nextState];
      const newMoves = [...moves.slice(0, currentStepIndex), manualMove];

      setHistory(newHistory);
      setMoves(newMoves);
      setCurrentStepIndex(newHistory.length - 1);
    },
    [history, currentStepIndex, currentLevel.pieces, moves]
  );

  /**
   * Navegación al siguiente paso del Solver (marca inmediatamente usedAI = true).
   * Si el tablero fue modificado manualmente (isRouteDirty), recalcula primero
   * la solución óptima con BFS desde la posición actual y avanza el primer paso.
   */
  const nextStep = useCallback(() => {
    setIsPlaying(false);
    markAIUsed();

    if (isRouteDirtyRef.current) {
      const startPieces = currentPiecesRef.current;
      if (!isValidBoardState(startPieces)) return;

      const result = solveKlotski(startPieces);
      if (
        result.isSolvable &&
        result.history.every((state) => isValidBoardState(state))
      ) {
        isRouteDirtyRef.current = false;
        setIsRouteDirty(false);
        setHistory(result.history);
        setMoves(result.moves);
        setSolveTime(result.timeMs);
        setTotalStatesExplored(result.totalStatesExplored);

        const nextIdx = result.history.length > 1 ? 1 : 0;
        setCurrentStepIndex(nextIdx);
        currentPiecesRef.current = result.history[nextIdx];
      }
      return;
    }

    setCurrentStepIndex((prev) => {
      if (prev < history.length - 1) {
        const candidate = history[prev + 1];
        if (!isValidBoardState(candidate)) return prev;
        currentPiecesRef.current = candidate;
        return prev + 1;
      }
      return prev;
    });
  }, [history, markAIUsed]);

  /**
   * Navegación al paso anterior del Solver (marca usedAI = true)
   */
  const prevStep = useCallback(() => {
    setIsPlaying(false);
    markAIUsed();

    setCurrentStepIndex((prev) => {
      if (prev > 0) {
        const candidate = history[prev - 1];
        if (!isValidBoardState(candidate)) return prev;
        currentPiecesRef.current = candidate;
        return prev - 1;
      }
      return 0;
    });
  }, [history, markAIUsed]);

  /**
   * Ir a un paso específico mediante el slider del Solver (marca usedAI = true)
   */
  const goToStep = useCallback(
    (index) => {
      markAIUsed();

      const target = Math.max(0, Math.min(index, history.length - 1));
      const candidate = history[target];
      if (!isValidBoardState(candidate)) return;

      currentPiecesRef.current = candidate;
      setCurrentStepIndex(target);
      if (target === history.length - 1) {
        setIsPlaying(false);
      }
    },
    [history, markAIUsed]
  );

  /**
   * Reinicio Limpio (reset):
   * 1. El tablero vuelve exactamente a la posición inicial del nivel (paso 0).
   * 2. manualMovesCount vuelve a 0 y lastMovedPieceId a null.
   * 3. usedAI se restablece a false, habilitando un nuevo intento válido para guardar récord.
   */
  const reset = useCallback(() => {
    setIsPlaying(false);
    isRouteDirtyRef.current = false;
    setIsRouteDirty(false);

    manualMovesCountRef.current = 0;
    setManualMovesCount(0);
    usedAIRef.current = false;
    setUsedAI(false);
    lastMovedPieceIdRef.current = null;
    setLastMovedPieceId(null);
    victoryRecordedRef.current = false;
    setIsNewRecord(false);

    const cached = initialLevelSolutionRef.current;
    if (
      cached &&
      cached.isSolvable &&
      cached.history?.length > 0 &&
      isValidBoardState(cached.history[0])
    ) {
      setHistory(cached.history);
      setMoves(cached.moves);
      setSolveTime(cached.timeMs);
      setTotalStatesExplored(cached.totalStatesExplored);
      setCurrentStepIndex(0);
      currentPiecesRef.current = cached.history[0];
    } else {
      loadLevel(currentLevel);
    }
  }, [currentLevel, loadLevel]);

  /**
   * Alias de reinicio limpio al estado inicial original del nivel activo
   */
  const resetToInitial = useCallback(() => {
    reset();
  }, [reset]);

  /**
   * Iniciar reproducción automática (marca inmediatamente usedAI = true).
   * Si el usuario movió piezas manualmente (isRouteDirty), recalcula primero
   * la ruta óptima desde el estado actual antes de iniciar el autoplay.
   */
  const play = useCallback(() => {
    markAIUsed();

    if (isRouteDirtyRef.current || moves.length === 0) {
      const startPieces = currentPiecesRef.current;
      if (!isValidBoardState(startPieces)) return;

      const result = solveKlotski(startPieces);
      if (
        result.isSolvable &&
        result.moves.length > 0 &&
        result.history.every((state) => isValidBoardState(state))
      ) {
        isRouteDirtyRef.current = false;
        setIsRouteDirty(false);
        setHistory(result.history);
        setMoves(result.moves);
        setSolveTime(result.timeMs);
        setTotalStatesExplored(result.totalStatesExplored);
        setCurrentStepIndex(0);
        currentPiecesRef.current = result.history[0];
        setIsPlaying(true);
      }
      return;
    }

    setCurrentStepIndex((curr) => {
      if (curr >= history.length - 1) {
        if (history[0] && isValidBoardState(history[0])) {
          currentPiecesRef.current = history[0];
        }
        return 0;
      }
      return curr;
    });

    setIsPlaying(true);
  }, [moves.length, history, markAIUsed]);

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

  // Manejo del temporizador de reproducción automática con guardia anti-superposición
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
        const candidate = history[prev + 1];
        if (!isValidBoardState(candidate)) {
          setIsPlaying(false);
          return prev;
        }
        currentPiecesRef.current = candidate;
        return prev + 1;
      });
    }, playbackSpeed);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, history]);

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

  const currentLevelProgress = currentLevel?.id
    ? progress[currentLevel.id] || null
    : null;

  return {
    // Estados
    currentLevel,
    currentStepIndex,
    history,
    moves,
    isRouteDirty,
    isSolving,
    isPlaying,
    playbackSpeed,
    isCompleted,
    solveTime,
    totalStatesExplored,

    // Estados de partida manual, anti-IA y progreso
    manualMovesCount,
    usedAI,
    lastMovedPieceId,
    progress,
    currentLevelProgress,
    isNewRecord,

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
