export type View = 'overview' | 'scheduling' | 'producerConsumer' | 'bankers' | 'memory';

export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime: number;
}

export interface ScheduledSlice {
  processId: string;
  start: number;
  end: number;
}

export interface ScheduleResult {
  slices: ScheduledSlice[];
  timeline: number[];
  metrics: ProcessMetric[];
  avgWaiting: number;
  avgTurnaround: number;
  cpuUtilization: number;
  totalTime: number;
}

export interface ProcessMetric {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
}

export interface BufferItem {
  id: number;
  label: string;
  source: string;
  size: number;
}

export interface ResourceClaim {
  allocation: number[];
  maximum: number[];
}

export interface BankersResult {
  need: number[][];
  work: number[];
  safeSequence: string[] | null;
  steps: BankersStep[];
  isSafe: boolean;
}

export interface BankersRequestResult {
  valid: boolean;
  reason: string;
  availableAfter: number[];
  allocationAfter: number[][];
  maximumAfter: number[][];
  resultAfter: BankersResult | null;
}

export interface BankersStep {
  work: number[];
  available: number[];
  processIndex: number | null;
  finish: boolean[];
  description: string;
}

export interface MemoryBlock {
  id: string;
  start: number;
  size: number;
  free: boolean;
  processId?: string;
}

export interface AllocResult {
  blocks: MemoryBlock[];
  allocated: boolean;
  message: string;
  externalFragmentation: number;
  internalFragmentation: number;
}

export type ExampleAlgorithm = 'scheduling' | 'producerConsumer' | 'bankers' | 'memory';

export interface RealWorldExample {
  id: string;
  algorithm: ExampleAlgorithm;
  author_name: string;
  situation: string;
  created_at: string;
}
