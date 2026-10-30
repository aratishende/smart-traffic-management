export interface PCConfig {
  bufferSize: number;
  producerRate: number;
  consumerRate: number;
  itemCount: number;
}

export interface PCStep {
  buffer: (number | null)[];
  in: number;
  out: number;
  empty: number;
  full: number;
  mutex: number;
  action: string;
  actor: 'producer' | 'consumer' | 'none';
  log: string;
  blocked: 'producer' | 'consumer' | 'none';
}

export function simulateProducerConsumer(config: PCConfig): PCStep[] {
  const { bufferSize, itemCount } = config;
  const buffer: (number | null)[] = new Array(bufferSize).fill(null);
  let inIdx = 0;
  let outIdx = 0;
  let empty = bufferSize;
  let full = 0;
  let mutex = 1;
  let produced = 0;
  let consumed = 0;
  const steps: PCStep[] = [];

  steps.push({
    buffer: [...buffer], in: inIdx, out: outIdx, empty, full, mutex,
    action: 'init', actor: 'none',
    log: `Bounded buffer initialized (size=${bufferSize}). Semaphores: empty=${empty}, full=${full}, mutex=${mutex}.`,
    blocked: 'none',
  });

  let turn: 'producer' | 'consumer' = 'producer';
  let safety = 0;
  while ((produced < itemCount || consumed < itemCount) && safety < 1000) {
    safety++;

    if (turn === 'producer' && produced < itemCount) {
      if (empty > 0 && mutex === 1) {
        empty--;
        mutex = 0;
        const item = produced + 1;
        buffer[inIdx] = item;
        const source = ['Sensor-A', 'Camera-1', 'Sensor-B', 'Camera-2', 'Sensor-C'][produced % 5];
        steps.push({
          buffer: [...buffer], in: inIdx, out: outIdx, empty, full, mutex,
          action: 'produce', actor: 'producer',
          log: `Producer waits(empty=${empty+1})→decrement, waits(mutex)→lock. Inserts item #${item} from ${source} at index ${inIdx}.`,
          blocked: 'none',
        });
        inIdx = (inIdx + 1) % bufferSize;
        mutex = 1;
        full++;
        produced++;
        steps.push({
          buffer: [...buffer], in: inIdx, out: outIdx, empty, full, mutex,
          action: 'release', actor: 'producer',
          log: `Producer signals(mutex)→unlock, signals(full=${full}). Item #${item} ready for consumption.`,
          blocked: 'none',
        });
      } else {
        steps.push({
          buffer: [...buffer], in: inIdx, out: outIdx, empty, full, mutex,
          action: 'block', actor: 'producer',
          log: `Producer BLOCKED — buffer full (empty=${empty}). Waiting for consumer to free space.`,
          blocked: 'producer',
        });
      }
      turn = 'consumer';
    } else if (turn === 'consumer' && consumed < itemCount) {
      if (full > 0 && mutex === 1) {
        full--;
        mutex = 0;
        const item = buffer[outIdx];
        buffer[outIdx] = null;
        steps.push({
          buffer: [...buffer], in: inIdx, out: outIdx, empty, full, mutex,
          action: 'consume', actor: 'consumer',
          log: `Consumer waits(full=${full+1})→decrement, waits(mutex)→lock. Removes item #${item} from index ${outIdx}.`,
          blocked: 'none',
        });
        outIdx = (outIdx + 1) % bufferSize;
        mutex = 1;
        empty++;
        consumed++;
        steps.push({
          buffer: [...buffer], in: inIdx, out: outIdx, empty, full, mutex,
          action: 'release', actor: 'consumer',
          log: `Consumer signals(mutex)→unlock, signals(empty=${empty}). Item #${item} processed by analyzer.`,
          blocked: 'none',
        });
      } else {
        steps.push({
          buffer: [...buffer], in: inIdx, out: outIdx, empty, full, mutex,
          action: 'block', actor: 'consumer',
          log: `Consumer BLOCKED — buffer empty (full=${full}). Waiting for producer to supply data.`,
          blocked: 'consumer',
        });
      }
      turn = 'producer';
    } else {
      break;
    }
  }
  return steps;
}
