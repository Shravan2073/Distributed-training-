import { useState, useEffect, useRef, useCallback } from 'react';
import type { ClusterNode, TrainingState, LogEntry } from '../types';
import {
  createInitialNodes,
  createInitialTrainingState,
  simulateTick,
  resetSimulation,
} from '../data/mockData';

const MAX_LOGS = 500;

export interface UseWebSocketReturn {
  nodes: ClusterNode[];
  training: TrainingState;
  logs: LogEntry[];
  isConnected: boolean;
  isRunning: boolean;
  startTraining: () => void;
  stopTraining: () => void;
  resetCluster: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [nodes, setNodes] = useState<ClusterNode[]>(createInitialNodes);
  const [training, setTraining] = useState<TrainingState>(createInitialTrainingState);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nodesRef = useRef(nodes);
  const trainingRef = useRef(training);
  const isRunningRef = useRef(isRunning);

  // Keep refs in sync
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { trainingRef.current = training; }, [training]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  // Simulate connection on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Main simulation loop
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isRunningRef.current) return;

      const tick = simulateTick(
        nodesRef.current,
        trainingRef.current,
        true
      );

      setNodes(tick.nodes);
      setTraining(tick.training);

      if (tick.newLogs.length > 0) {
        setLogs((prev) => [...prev, ...tick.newLogs].slice(-MAX_LOGS));
      }

      // Training completed
      if (!tick.training.isRunning) {
        setIsRunning(false);
      }
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTraining = useCallback(() => {
    resetSimulation();
    setTraining((prev) => ({ ...prev, isRunning: true, currentEpoch: 0, epochHistory: [], elapsedTime: 0 }));
    setIsRunning(true);
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'training' as const,
        currentEpoch: 0,
        currentBatch: 0,
        retryCount: 0,
      }))
    );
    setLogs((prev) => [
      ...prev,
      {
        id: `log-start-${Date.now()}`,
        timestamp: Date.now(),
        rank: 0,
        level: 'info',
        message: '═══════════════════════════════════════════════════════',
      },
      {
        id: `log-start2-${Date.now()}`,
        timestamp: Date.now(),
        rank: 0,
        level: 'info',
        message: '  Distributed Training — 4 node(s)',
      },
      {
        id: `log-start3-${Date.now()}`,
        timestamp: Date.now(),
        rank: 0,
        level: 'info',
        message: '  Epochs: 10 | Batch/node: 64 | LR: 0.001',
      },
      {
        id: `log-start4-${Date.now()}`,
        timestamp: Date.now(),
        rank: 0,
        level: 'info',
        message: `  Effective batch size: 256`,
      },
      {
        id: `log-start5-${Date.now()}`,
        timestamp: Date.now(),
        rank: 0,
        level: 'info',
        message: '═══════════════════════════════════════════════════════',
      },
    ]);
  }, []);

  const stopTraining = useCallback(() => {
    setIsRunning(false);
    setTraining((prev) => ({ ...prev, isRunning: false }));
    setNodes((prev) => prev.map((n) => ({ ...n, status: 'idle' as const })));
    setLogs((prev) => [
      ...prev,
      {
        id: `log-stop-${Date.now()}`,
        timestamp: Date.now(),
        rank: 0,
        level: 'warning',
        message: '[Rank 0] Training interrupted by user',
      },
    ]);
  }, []);

  const resetCluster = useCallback(() => {
    resetSimulation();
    setIsRunning(false);
    setNodes(createInitialNodes());
    setTraining(createInitialTrainingState());
    setLogs([]);
  }, []);

  return {
    nodes,
    training,
    logs,
    isConnected,
    isRunning,
    startTraining,
    stopTraining,
    resetCluster,
  };
}
