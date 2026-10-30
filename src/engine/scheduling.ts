import { Process, ScheduleResult, ScheduledSlice, ProcessMetric } from '@/types';

export function fcfs(input: Process[]): ScheduleResult {
  const procs = [...input].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const slices: ScheduledSlice[] = [];
  let time = 0;
  for (const p of procs) {
    if (time < p.arrivalTime) time = p.arrivalTime;
    slices.push({ processId: p.id, start: time, end: time + p.burstTime });
    time += p.burstTime;
  }
  return buildResult(input, slices);
}

export function sjf(input: Process[]): ScheduleResult {
  const remaining = input.map((p) => ({ ...p }));
  const slices: ScheduledSlice[] = [];
  const done = new Set<string>();
  let time = 0;
  while (done.size < input.length) {
    const ready = remaining.filter((p) => p.arrivalTime <= time && !done.has(p.id));
    if (ready.length === 0) { time++; continue; }
    ready.sort((a, b) => a.burstTime - b.burstTime);
    const next = ready[0];
    slices.push({ processId: next.id, start: time, end: time + next.burstTime });
    time += next.burstTime;
    done.add(next.id);
  }
  return buildResult(input, slices);
}

export function prioritySched(input: Process[]): ScheduleResult {
  const remaining = input.map((p) => ({ ...p }));
  const slices: ScheduledSlice[] = [];
  const done = new Set<string>();
  let time = 0;
  while (done.size < input.length) {
    const ready = remaining.filter((p) => p.arrivalTime <= time && !done.has(p.id));
    if (ready.length === 0) { time++; continue; }
    ready.sort((a, b) => a.priority - b.priority);
    const next = ready[0];
    slices.push({ processId: next.id, start: time, end: time + next.burstTime });
    time += next.burstTime;
    done.add(next.id);
  }
  return buildResult(input, slices);
}

export function roundRobin(input: Process[], quantum: number): ScheduleResult {
  const remaining = input.map((p) => ({ ...p, rem: p.burstTime }));
  const slices: ScheduledSlice[] = [];
  const queue: typeof remaining = [];
  const inQueue = new Set<string>();
  let time = 0;
  const sorted = [...remaining].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let idx = 0;

  // seed
  if (sorted.length > 0) {
    queue.push(sorted[0]); inQueue.add(sorted[0].id);
    idx = 1;
    time = sorted[0].arrivalTime;
  }

  while (queue.length > 0) {
    const cur = queue.shift()!;
    inQueue.delete(cur.id);
    const run = Math.min(quantum, cur.rem);
    slices.push({ processId: cur.id, start: time, end: time + run });
    time += run;
    cur.rem -= run;

    // add newly arrived while running
    while (idx < sorted.length && sorted[idx].arrivalTime <= time) {
      if (!inQueue.has(sorted[idx].id)) {
        queue.push(sorted[idx]); inQueue.add(sorted[idx].id);
      }
      idx++;
    }
    if (cur.rem > 0) { queue.push(cur); inQueue.add(cur.id); }
  }
  return buildResult(input, slices);
}

function buildResult(input: Process[], slices: ScheduledSlice[]): ScheduleResult {
  const completion = new Map<string, number>();
  const firstRun = new Map<string, number>();
  for (const s of slices) {
    completion.set(s.processId, s.end);
    if (!firstRun.has(s.processId)) firstRun.set(s.processId, s.start);
  }
  const metrics: ProcessMetric[] = input.map((p) => {
    const ct = completion.get(p.id) ?? 0;
    const fr = firstRun.get(p.id) ?? 0;
    return {
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime: ct,
      turnaroundTime: ct - p.arrivalTime,
      waitingTime: ct - p.arrivalTime - p.burstTime,
      responseTime: fr - p.arrivalTime,
    };
  });
  const totalTime = slices.length > 0 ? slices[slices.length - 1].end : 0;
  const busy = slices.reduce((sum, s) => sum + (s.end - s.start), 0);
  const avgWaiting = metrics.reduce((s, m) => s + m.waitingTime, 0) / metrics.length;
  const avgTurnaround = metrics.reduce((s, m) => s + m.turnaroundTime, 0) / metrics.length;
  return {
    slices,
    timeline: buildTimeline(slices),
    metrics,
    avgWaiting,
    avgTurnaround,
    cpuUtilization: totalTime > 0 ? (busy / totalTime) * 100 : 0,
    totalTime,
  };
}

function buildTimeline(slices: ScheduledSlice[]): number[] {
  const marks = [0];
  for (const s of slices) { marks.push(s.end); }
  return [...new Set(marks)].sort((a, b) => a - b);
}

export type SchedulingAlgo = 'fcfs' | 'sjf' | 'priority' | 'rr';
