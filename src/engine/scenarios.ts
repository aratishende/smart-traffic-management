import { MemoryBlock, Process, ScheduleResult } from '@/types';
import { fcfs, prioritySched } from './scheduling';
import { simulateProducerConsumer } from './producerConsumer';
import { bankersAlgorithm, evaluateRequest } from './bankers';
import { allocate, freeMemory, FitStrategy } from './memory';
import { vehicleId } from './vehicles';

export interface Figure {
  label: string;
  value: string;
  detail: string;
}

const STRATEGIES: FitStrategy[] = ['firstFit', 'bestFit', 'worstFit'];

function schedulingFigures(): Figure[] {
  const tasks: Process[] = [
    { id: 'Bus 1', arrivalTime: 0, burstTime: 8, priority: 3, remainingTime: 8 },
    { id: 'Car 1', arrivalTime: 1, burstTime: 4, priority: 2, remainingTime: 4 },
    { id: 'Ambulance 1', arrivalTime: 2, burstTime: 3, priority: 1, remainingTime: 3 },
    { id: 'Bike 1', arrivalTime: 3, burstTime: 2, priority: 2, remainingTime: 2 },
  ];
  const fifo = fcfs(tasks);
  const prio = prioritySched(tasks);
  const ambulance = (r: ScheduleResult) => r.metrics.find((m) => m.id === 'Ambulance 1')!;
  const servedAhead = (r: ScheduleResult) =>
    r.metrics.filter((m) => m.id !== 'Ambulance 1' && m.completionTime < ambulance(r).completionTime).length;

  return [
    {
      label: 'Ambulance waiting time',
      value: `${ambulance(fifo).waitingTime} \u2192 ${ambulance(prio).waitingTime} ms`,
      detail: 'First-come first-served vs. priority',
    },
    {
      label: 'Vehicles served before the ambulance',
      value: `${servedAhead(fifo)} \u2192 ${servedAhead(prio)}`,
      detail: 'Tasks that finish ahead of the emergency task',
    },
    {
      label: 'Average waiting time',
      value: `${fifo.avgWaiting.toFixed(1)} \u2192 ${prio.avgWaiting.toFixed(1)} ms`,
      detail: 'Across all four tasks',
    },
  ];
}

function producerConsumerFigures(): Figure[] {
  const config = { bufferSize: 5, producerRate: 1, consumerRate: 1, itemCount: 12 };
  const steps = simulateProducerConsumer(config);
  const delivered = steps.filter((s) => s.action === 'consume').length;
  const peak = Math.max(...steps.map((s) => s.full));
  const sensorWaits = steps.filter((s) => s.blocked === 'producer').length;

  return [
    {
      label: 'Readings delivered',
      value: `${delivered} of ${config.itemCount}`,
      detail: delivered === config.itemCount ? 'No reading was lost or duplicated' : 'Some readings did not reach the analyzer',
    },
    {
      label: 'Peak buffer use',
      value: `${peak} of ${config.bufferSize} slots`,
      detail: 'Slots in use at the busiest moment',
    },
    {
      label: 'Sensor pauses',
      value: `${sensorWaits}`,
      detail: sensorWaits === 0 ? 'The analyzer kept pace, so no sensor had to wait' : 'Times a sensor waited for a free slot',
    },
  ];
}

function bankersFigures(): Figure[] {
  const allocation = [[1, 0, 1], [2, 1, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]];
  const maximum = [[2, 1, 2], [3, 2, 1], [1, 2, 1], [2, 1, 1], [1, 1, 2]];
  const available = [1, 1, 1];
  const state = bankersAlgorithm(allocation, maximum, available);
  const request = evaluateRequest(allocation, maximum, available, 4, [1, 0, 0]);
  const held = allocation.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
  const free = available.reduce((a, b) => a + b, 0);

  return [
    {
      label: 'Junction state',
      value: state.isSafe ? 'Safe' : 'Unsafe',
      detail: state.safeSequence ? `Safe order: ${state.safeSequence.join(' \u2192 ')}` : 'Deadlock is possible',
    },
    {
      label: `${vehicleId(5)} asks for one channel`,
      value: request.valid ? 'Granted' : 'Must wait',
      detail: request.valid ? 'The junction stays in a safe state' : request.reason,
    },
    {
      label: 'Shared units in use',
      value: `${held} of ${held + free}`,
      detail: `${free} units free right now`,
    },
  ];
}

function memoryFigures(): Figure[] {
  const holes = [180, 90, 420, 130, 260];
  const used = [200, 150, 300, 120];
  const blocks: MemoryBlock[] = [];
  holes.forEach((size, i) => {
    blocks.push({ id: `hole-${i}`, start: 0, size, free: true });
    if (i < used.length) blocks.push({ id: `used-${i}`, start: 0, size: used[i], free: false, processId: vehicleId(i + 2) });
  });

  const freeHoles = (bs: MemoryBlock[]) => bs.filter((b) => b.free).map((b) => b.size);
  const largest = (bs: MemoryBlock[]) => Math.max(...freeHoles(bs));
  const frameFits = STRATEGIES.filter((s) => allocate(blocks, 'Frame batch', 512, s).result.allocated).length;
  const bestLeft = largest(allocate(blocks, 'Plate crop', 256, 'bestFit').blocks);
  const firstLeft = largest(allocate(blocks, 'Plate crop', 256, 'firstFit').blocks);

  return [
    {
      label: 'Free memory on the gateway',
      value: `${freeMemory(blocks).toLocaleString('en-US')} KB`,
      detail: `Split into ${freeHoles(blocks).length} separate holes`,
    },
    {
      label: 'Frame batch needs 512 KB',
      value: `${frameFits} of ${STRATEGIES.length} strategies fit`,
      detail: `The largest single hole is only ${largest(blocks)} KB`,
    },
    {
      label: 'Largest hole after a 256 KB crop',
      value: `${bestLeft} vs ${firstLeft} KB`,
      detail: 'Best Fit (left) vs. First Fit (right)',
    },
  ];
}

export const SCENARIO_FIGURES = {
  scheduling: schedulingFigures(),
  producerConsumer: producerConsumerFigures(),
  bankers: bankersFigures(),
  memory: memoryFigures(),
};
