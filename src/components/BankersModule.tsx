import { useState, useMemo } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Play, RotateCcw, CheckCircle2, XCircle, Send, Calculator } from 'lucide-react';
import { Panel, Button, Input } from './ui';
import { vehicleId } from '@/engine/vehicles';
import { RealWorldScenario } from './RealWorldScenario';
import { ModuleHeader } from './SchedulingModule';
import { bankersAlgorithm, evaluateRequest } from '@/engine/bankers';

const RESOURCES = ['A · CPU', 'B · Memory', 'C · Comm'];

const DEFAULT_ALLOCATION = [
  [0, 1, 0],
  [2, 0, 0],
  [3, 0, 2],
  [2, 1, 1],
  [0, 0, 2],
];
const DEFAULT_MAX = [
  [7, 5, 3],
  [3, 2, 2],
  [9, 0, 2],
  [2, 2, 2],
  [4, 3, 3],
];
const DEFAULT_AVAILABLE = [3, 3, 2];
const DEFAULT_REQUEST = [1, 0, 2];

export default function BankersModule() {
  const [allocation, setAllocation] = useState<number[][]>(DEFAULT_ALLOCATION);
  const [maximum, setMaximum] = useState<number[][]>(DEFAULT_MAX);
  const [available, setAvailable] = useState<number[]>(DEFAULT_AVAILABLE);
  const [trigger, setTrigger] = useState(0);
  const [requestProcess, setRequestProcess] = useState(1);
  const [request, setRequest] = useState<number[]>(DEFAULT_REQUEST);
  const [requestResult, setRequestResult] = useState<ReturnType<typeof evaluateRequest> | null>(null);

  const result = useMemo(() => bankersAlgorithm(allocation, maximum, available), [allocation, maximum, available, trigger]);

  const m = available.length;

  const updateCell = (matrix: number[][], setMatrix: (m: number[][]) => void, i: number, j: number, val: number) => {
    const copy = matrix.map((r) => [...r]);
    copy[i][j] = val;
    setMatrix(copy);
  };

  const addRow = () => {
    setAllocation([...allocation, new Array(m).fill(0)]);
    setMaximum([...maximum, new Array(m).fill(0)]);
  };

  const removeRow = (idx: number) => {
    setAllocation(allocation.filter((_, i) => i !== idx));
    setMaximum(maximum.filter((_, i) => i !== idx));
    setRequestResult(null);
  };

  const runRequest = () => {
    setRequestResult(evaluateRequest(allocation, maximum, available, requestProcess, request));
  };

  const reset = () => {
    setAllocation(DEFAULT_ALLOCATION);
    setMaximum(DEFAULT_MAX);
    setAvailable(DEFAULT_AVAILABLE);
    setRequestProcess(1);
    setRequest(DEFAULT_REQUEST);
    setRequestResult(null);
    setTrigger((value) => value + 1);
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        icon={<Shield className="w-5 h-5" />}
        title="Deadlock Avoidance — Banker's Algorithm"
        description="These five vehicles at Intersection 12 ask the edge gateway for three shared resources. A is CPU cores for signal decisions, B is memory for camera frames, and C is communication channels for sensor and control messages. Banker’s Algorithm prevents a circular wait before resources are granted."
      />

      <RealWorldScenario scenario="bankers" />

      {/* Status banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${result.isSafe ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
        {result.isSafe ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <ShieldAlert className="w-6 h-6 text-rose-400" />}
        <div>
          <p className={`font-semibold ${result.isSafe ? 'text-emerald-300' : 'text-rose-300'}`}>
            {result.isSafe ? 'SAFE STATE — No Deadlock Risk' : 'UNSAFE STATE — Deadlock Possible'}
          </p>
          {result.isSafe && result.safeSequence && (
            <p className="text-sm text-slate-400 mt-0.5">Safe sequence: <span className="font-mono text-emerald-400">⟨{result.safeSequence.join(', ')}⟩</span></p>
          )}
        </div>
      </div>

      {/* Input matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <MatrixPanel
          title="Allocation Matrix" subtitle="Currently held resources"
          matrix={allocation} resources={RESOURCES.slice(0, m)}
          onUpdate={(i, j, v) => updateCell(allocation, setAllocation, i, j, v)}
          onRemove={removeRow} onAdd={addRow}
        />
        <MatrixPanel
          title="Maximum Matrix" subtitle="Max resources needed"
          matrix={maximum} resources={RESOURCES.slice(0, m)}
          onUpdate={(i, j, v) => updateCell(maximum, setMaximum, i, j, v)}
        />
        <Panel title="Available Vector" subtitle="Free resources in the edge gateway"><div className="mb-3 rounded-lg border border-[#243044] bg-[#0a0e1a] p-3 text-xs text-slate-400 leading-relaxed"><span className="text-slate-200 font-medium">A</span> CPU cores · <span className="text-slate-200 font-medium">B</span> camera-frame memory · <span className="text-slate-200 font-medium">C</span> sensor communication channels</div>
          <div className="space-y-3">
            {available.map((val, j) => (
              <div key={j}>
                <label className="text-xs text-slate-400 block mb-1">{RESOURCES[j]}</label>
                <Input type="number" min={0} value={val} onChange={(v) => { const copy = [...available]; copy[j] = +v || 0; setAvailable(copy); }} className="w-full" />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setTrigger(trigger + 1)} className="flex-1"><Play className="w-4 h-4 mr-1" />Compute Safety</Button>
              <Button variant="ghost" onClick={reset}><RotateCcw className="w-4 h-4" /></Button>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Resource Request Check" subtitle="Test the exact Banker's Algorithm request condition: Request ≤ Need and Request ≤ Available" icon={<Send className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-4 items-end">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Requesting Vehicle</label>
            <select value={requestProcess} onChange={(event) => setRequestProcess(Number(event.target.value))} className="w-full bg-[#0a0e1a] border border-[#243044] rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none">
              {allocation.map((_, index) => <option key={index} value={index}>{vehicleId(index + 1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Request vector ⟨A, B, C⟩</label>
            <div className="grid grid-cols-3 gap-2">
              {request.map((value, index) => <Input key={index} type="number" min={0} value={value} onChange={(next) => { const copy = [...request]; copy[index] = Number(next) || 0; setRequest(copy); }} className="w-full text-center font-mono" />)}
            </div>
          </div>
          <Button onClick={runRequest}><Calculator className="w-4 h-4 mr-1.5" />Check Request</Button>
        </div>
        {requestResult && <div className={`mt-4 rounded-lg border p-4 ${requestResult.valid ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
          <div className="flex items-center gap-2 mb-2">{requestResult.valid ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}<span className={requestResult.valid ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>{requestResult.valid ? 'Request Granted' : 'Request Denied / Must Wait'}</span></div>
          <p className="text-sm text-slate-300">{requestResult.reason}</p>
          {requestResult.valid && requestResult.resultAfter?.safeSequence && <p className="text-sm text-slate-400 mt-2">Resulting safe sequence: <span className="font-mono text-emerald-400">⟨{requestResult.resultAfter.safeSequence.join(', ')}⟩</span> · Available after grant: <span className="font-mono text-sky-400">({requestResult.availableAfter.join(', ')})</span></p>}
        </div>}
      </Panel>

      {/* Need matrix */}
      <Panel title="Need Matrix (Max − Allocation)" subtitle="Remaining resource needs per vehicle">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-[#243044]">
                <th className="py-2 px-3 text-left">Vehicle</th>
                {RESOURCES.slice(0, m).map((r) => <th key={r} className="py-2 px-3 text-center">{r.split(' · ')[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {result.need.map((row, i) => (
                <tr key={i} className="border-b border-[#243044]/50">
                  <td className="py-2.5 px-3"><span className="font-mono font-semibold text-violet-400">{vehicleId(i + 1)}</span></td>
                  {row.map((val, j) => <td key={j} className="py-2.5 px-3 text-center font-mono text-slate-300">{val}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Execution steps */}
      <Panel title="Safe-Sequence Execution Steps" icon={<ShieldCheck className="w-4 h-4" />}>
        <div className="space-y-3">
          {result.steps.map((step, i) => (
            <div key={i} className={`rounded-lg border p-3.5 animate-slide-in ${
              step.processIndex === null && i === result.steps.length - 1 && !result.isSafe
                ? 'border-rose-500/30 bg-rose-500/5'
                : step.processIndex !== null
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-[#243044] bg-[#0a0e1a]'
            }`}>
              <div className="flex items-start gap-3">
                {step.processIndex !== null ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : i === result.steps.length - 1 && !result.isSafe ? (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-slate-300 leading-relaxed">{step.description}</p>
                  <div className="flex gap-4 mt-2 text-xs font-mono">
                    <span className="text-slate-500">Work: <span className="text-sky-400">[{step.work.join(', ')}]</span></span>
                    <span className="text-slate-500">Available: <span className="text-emerald-400">[{step.available.join(', ')}]</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function MatrixPanel({ title, subtitle, matrix, resources, onUpdate, onRemove, onAdd }: {
  title: string; subtitle?: string; matrix: number[][]; resources: string[];
  onUpdate: (i: number, j: number, v: number) => void;
  onRemove?: (i: number) => void; onAdd?: () => void;
}) {
  return (
    <Panel title={title} subtitle={subtitle}
      actions={onAdd ? <Button size="sm" variant="ghost" onClick={onAdd}>+ Row</Button> : undefined}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-xs uppercase border-b border-[#243044]">
              <th className="py-2 px-2 text-left">Vehicle</th>
              {resources.map((r) => <th key={r} className="py-2 px-2 text-center text-[10px]">{r.split(' · ')[0]}</th>)}
              {onRemove && <th className="py-2 px-2"></th>}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i} className="border-b border-[#243044]/50">
                <td className="py-2 px-2"><span className="font-mono font-semibold text-emerald-400">{vehicleId(i + 1)}</span></td>
                {row.map((val, j) => (
                  <td key={j} className="py-2 px-2 text-center">
                    <Input type="number" min={0} value={val} onChange={(v) => onUpdate(i, j, +v || 0)} className="w-16 text-center" />
                  </td>
                ))}
                {onRemove && (
                  <td className="py-2 px-2 text-right">
                    <button onClick={() => onRemove(i)} className="text-slate-500 hover:text-rose-400 text-xs">✕</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
