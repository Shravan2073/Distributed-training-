// ─── Node & Cluster Types ──────────────────────────────────────────────

export type NodeStatus = 'connected' | 'training' | 'retrying' | 'failed' | 'idle';

export interface GpuInfo {
  name: string;
  memoryTotal: number;  // GB
  memoryUsed: number;   // GB
  utilization: number;  // 0-100%
  temperature: number;  // °C
}

export interface ClusterNode {
  rank: number;
  ip: string;
  hostname: string;
  status: NodeStatus;
  isMaster: boolean;
  gpu: GpuInfo | null;
  backend: 'nccl' | 'gloo';
  currentEpoch: number;
  totalEpochs: number;
  currentBatch: number;
  totalBatches: number;
  throughput: number;     // samples/sec
  lastHeartbeat: number;  // timestamp
  retryCount: number;
}

// ─── Training Metrics ─────────────────────────────────────────────────

export interface EpochMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  timestamp: number;
}

export interface PerNodeMetrics {
  rank: number;
  loss: number;
  accuracy: number;
  throughput: number;
  batchesCompleted: number;
}

export interface TrainingState {
  isRunning: boolean;
  currentEpoch: number;
  totalEpochs: number;
  globalLoss: number;
  globalAccuracy: number;
  elapsedTime: number;     // seconds
  epochHistory: EpochMetrics[];
  perNodeMetrics: PerNodeMetrics[];
}

// ─── Logs ─────────────────────────────────────────────────────────────

export type LogLevel = 'info' | 'warning' | 'error' | 'debug' | 'success';

export interface LogEntry {
  id: string;
  timestamp: number;
  rank: number;
  level: LogLevel;
  message: string;
}

// ─── Control Panel ───────────────────────────────────────────────────

export interface TrainingConfig {
  role: 'master' | 'worker';
  rank: number;
  worldSize: number;
  masterAddr: string;
  masterPort: string;
  backend: 'nccl' | 'gloo';
  epochs: number;
  batchSize: number;
  learningRate: number;
  initMethod: 'env://' | 'tcp://' | 'file://';
}

// ─── WebSocket ───────────────────────────────────────────────────────

export interface ClusterState {
  nodes: ClusterNode[];
  training: TrainingState;
  logs: LogEntry[];
  connectedAt: number;
}
