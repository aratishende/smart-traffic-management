import { BankersRequestResult, BankersResult, BankersStep } from '@/types';
import { vehicleId } from './vehicles';

export function computeNeed(allocation: number[][], maximum: number[][]): number[][] {
  return allocation.map((alloc, i) => alloc.map((a, j) => maximum[i][j] - a));
}

export function bankersAlgorithm(
  allocation: number[][],
  maximum: number[][],
  available: number[]
): BankersResult {
  const n = allocation.length;
  const m = available.length;
  const need = computeNeed(allocation, maximum);
  const work = [...available];
  const finish = new Array(n).fill(false);
  const steps: BankersStep[] = [];
  const safeSequence: string[] = [];

  steps.push({
    work: [...work],
    available: [...work],
    processIndex: null,
    finish: [...finish],
    description: `Initial state. Available = [${work.join(', ')}].`,
  });

  let progress = true;
  while (progress && safeSequence.length < n) {
    progress = false;
    for (let i = 0; i < n; i++) {
      if (finish[i]) continue;
      const canFinish = need[i].every((nd, j) => nd <= work[j]);
      if (canFinish) {
        const beforeWork = [...work];
        for (let j = 0; j < m; j++) work[j] += allocation[i][j];
        finish[i] = true;
        safeSequence.push(vehicleId(i + 1));
        steps.push({
          work: [...work],
          available: [...work],
          processIndex: i,
          finish: [...finish],
          description: `${vehicleId(i + 1)} can proceed (Need[${i}]=[${need[i].join(', ')}] ≤ Work=[${beforeWork.join(', ')}]). Allocating, then releasing. Work becomes [${work.join(', ')}].`,
        });
        progress = true;
        break;
      }
    }
  }

  const isSafe = finish.every((f) => f);
  if (!isSafe) {
    steps.push({
      work: [...work],
      available: [...work],
      processIndex: null,
      finish: [...finish],
      description: `No vehicle can proceed. System is in an UNSAFE state — deadlock possible.`,
    });
  }
  return { need, work, safeSequence: isSafe ? safeSequence : null, steps, isSafe };
}

export function evaluateRequest(
  allocation: number[][],
  maximum: number[][],
  available: number[],
  processIndex: number,
  request: number[]
): BankersRequestResult {
  const need = computeNeed(allocation, maximum);
  const requestedNeed = need[processIndex] ?? [];
  const exceedsNeed = request.some((value, index) => value > (requestedNeed[index] ?? 0));
  if (exceedsNeed) {
    return {
      valid: false,
      reason: 'Request exceeds the vehicle remaining Need vector.',
      availableAfter: available,
      allocationAfter: allocation,
      maximumAfter: maximum,
      resultAfter: null,
    };
  }
  const exceedsAvailable = request.some((value, index) => value > (available[index] ?? 0));
  if (exceedsAvailable) {
    return {
      valid: false,
      reason: 'Request exceeds the currently Available vector.',
      availableAfter: available,
      allocationAfter: allocation,
      maximumAfter: maximum,
      resultAfter: null,
    };
  }

  const allocationAfter = allocation.map((row) => [...row]);
  const availableAfter = available.map((value, index) => value - (request[index] ?? 0));
  allocationAfter[processIndex] = allocationAfter[processIndex].map((value, index) => value + (request[index] ?? 0));
  const resultAfter = bankersAlgorithm(allocationAfter, maximum, availableAfter);
  if (!resultAfter.isSafe) {
    return {
      valid: false,
      reason: 'Tentative allocation would make the system unsafe, so the request must wait.',
      availableAfter,
      allocationAfter,
      maximumAfter: maximum,
      resultAfter,
    };
  }
  return {
    valid: true,
    reason: 'Request can be granted immediately because the resulting state remains safe.',
    availableAfter,
    allocationAfter,
    maximumAfter: maximum,
    resultAfter,
  };
}
