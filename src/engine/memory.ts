import { MemoryBlock, AllocResult } from '@/types';

export type FitStrategy = 'firstFit' | 'bestFit' | 'worstFit';

export function allocate(
  blocks: MemoryBlock[],
  processId: string,
  size: number,
  strategy: FitStrategy
): { blocks: MemoryBlock[]; result: AllocResult } {
  const working = blocks.map((b) => ({ ...b }));
  const freeBlocks = working.filter((b) => b.free && b.size >= size);

  let targetIndex = -1;
  if (strategy === 'firstFit') {
    targetIndex = working.findIndex((b) => b.free && b.size >= size);
  } else if (strategy === 'bestFit') {
    let minSize = Infinity;
    freeBlocks.forEach((b) => {
      const idx = working.indexOf(b);
      if (b.size < minSize) { minSize = b.size; targetIndex = idx; }
    });
  } else {
    let maxSize = -1;
    freeBlocks.forEach((b) => {
      const idx = working.indexOf(b);
      if (b.size > maxSize) { maxSize = b.size; targetIndex = idx; }
    });
  }

  if (targetIndex === -1) {
    const externalFrag = working.filter((b) => b.free).reduce((s, b) => s + b.size, 0);
    return {
      blocks: working,
      result: {
        blocks: working,
        allocated: false,
        message: `Cannot allocate ${size}KB — no suitable free block. External fragmentation: ${externalFrag}KB available but no block large enough.`,
        externalFragmentation: externalFrag,
        internalFragmentation: 0,
      },
    };
  }

  const target = working[targetIndex];
  const remainder = target.size - size;
  const internalFrag = 0;

  if (remainder === 0) {
    target.free = false;
    target.processId = processId;
  } else {
    target.free = false;
    target.processId = processId;
    target.size = size;
    working.splice(targetIndex + 1, 0, {
      id: `free-${Date.now()}`,
      start: target.start + size,
      size: remainder,
      free: true,
    });
  }
  reindexStarts(working);
  const externalFrag = working.filter((b) => b.free).reduce((s, b) => s + b.size, 0);
  return {
    blocks: working,
    result: {
      blocks: working,
      allocated: true,
      message: `Allocated ${size}KB to ${processId} using ${strategyLabel(strategy)}.`,
      externalFragmentation: externalFrag,
      internalFragmentation: internalFrag,
    },
  };
}

export function deallocate(blocks: MemoryBlock[], processId: string): MemoryBlock[] {
  const working = blocks.map((b) => ({ ...b }));
  for (const b of working) {
    if (b.processId === processId && !b.free) {
      b.free = true;
      b.processId = undefined;
    }
  }
  return coalesce(working);
}

export function coalesce(blocks: MemoryBlock[]): MemoryBlock[] {
  const working = [...blocks];
  for (let i = 0; i < working.length - 1; i++) {
    if (working[i].free && working[i + 1].free) {
      working[i].size += working[i + 1].size;
      working.splice(i + 1, 1);
      i--;
    }
  }
  reindexStarts(working);
  return working;
}

function reindexStarts(blocks: MemoryBlock[]) {
  let start = 0;
  for (const b of blocks) { b.start = start; start += b.size; }
}

export function strategyLabel(s: FitStrategy): string {
  return { firstFit: 'First Fit', bestFit: 'Best Fit', worstFit: 'Worst Fit' }[s];
}

export function totalMemory(blocks: MemoryBlock[]): number {
  return blocks.reduce((s, b) => s + b.size, 0);
}

export function freeMemory(blocks: MemoryBlock[]): number {
  return blocks.filter((b) => b.free).reduce((s, b) => s + b.size, 0);
}

export function usedMemory(blocks: MemoryBlock[]): number {
  return blocks.filter((b) => !b.free).reduce((s, b) => s + b.size, 0);
}
