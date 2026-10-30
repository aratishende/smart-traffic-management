import { useState, useMemo } from 'react';
import { Cpu, Plus, Trash2, Play, RotateCcw, Clock, Timer, Activity, Zap } from 'lucide-react';
import { Panel, Button, Input, StatCard } from './ui';
import { RealWorldScenario } from './RealWorldScenario';
import { Process, ScheduleResult } from '@/types';
import { fcfs, sjf, prioritySched, roundRobin, SchedulingAlgo } from '@/engine/scheduling';
import { vehicleId } from '@/engine/vehicles';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const DEFAULT_PROCS: Process[] = [
  { id: vehicleId(1), arrivalTime: 0, burstTime: 6, priority: 2, remainingTime: 6 },
  { id: vehicleId(2), arrivalTime: 1, burstTime: 4, priority: 1, remainingTime: 4 },
  { id: vehicleId(3), arrivalTime: 2, burstTime: 8, priority: 3, remainingTime: 8 },
  { id: vehicleId(4), arrivalTime: 3, burstTime: 3, priority: 2, remainingTime: 3 },
];

const ALGO_LABELS: Record<SchedulingAlgo, string> = {
  fcfs: 'FCFS', sjf: 'SJF (Non-preemptive)', priority: 'Priority', rr: 'Round Robin',
};

export default function SchedulingModule() {
  const [processes, setProcesses] = useState<Process[]>(DEFAULT_PROCS);
  const [algo, setAlgo] = useState<SchedulingAlgo>('fcfs');
  const [quantum, setQuantum] = useState(2);
  const [computed, setComputed] = useState<ScheduleResult | null>(null);

  const result = useMemo(() => {
    if (computed) return computed;
    return runAlgo(processes, algo, quantum);
  }, [computed, processes, algo, quantum]);

  const addProcess = () => {
    const n = processes.length + 1;
    setProcesses([...processes, { id: vehicleId(n), arrivalTime: 0, burstTime: 5, priority: 1, remainingTime: 5 }]);
  };

  const removeProcess = (id: string) => setProcesses(processes.filter((p) => p.id !== id));

  const updateProc = (id: string, field: keyof Process, value: number) => {
    setProcesses(processes.map((p) => (p.id === id ? { ...p, [field]: value, remainingTime: field === 'burstTime' ? value : p.remainingTime } : p)));
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        icon={<Cpu className="w-5 h-5" />}
        title="CPU Scheduling — Traffic Signal Controller"
        description="At Intersection 12, the edge controller must schedule signal changes, emergency preemption, pedestrian safety, and camera analytics on one CPU. Configure the tasks, choose an algorithm, and measure the delay experienced by each operation."
      />

      <RealWorldScenario scenario="scheduling" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Vehicles at Intersection 12" icon={<Activity className="w-4 h-4" />} className="lg:col-span-2"
          actions={<Button size="sm" variant="ghost" onClick={addProcess}><Plus className="w-3.5 h-3.5 mr-1" />Add</Button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-[#243044]">
                  <th className="py-2 px-3 text-left">Vehicle</th>
                  <th className="py-2 px-3 text-center">Arrival Time</th>
                  <th className="py-2 px-3 text-center">Burst Time</th>
                  <th className="py-2 px-3 text-center">Priority</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {processes.map((p) => (
                  <tr key={p.id} className="border-b border-[#243044]/50">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-semibold text-emerald-400">{p.id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Input type="number" min={0} value={p.arrivalTime} onChange={(v) => updateProc(p.id, 'arrivalTime', +v)} className="w-20 text-center" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Input type="number" min={1} value={p.burstTime} onChange={(v) => updateProc(p.id, 'burstTime', +v)} className="w-20 text-center" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Input type="number" min={1} value={p.priority} onChange={(v) => updateProc(p.id, 'priority', +v)} className="w-20 text-center" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button onClick={() => removeProcess(p.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">Lower priority number = higher priority. Arrival time is when the event reaches the edge controller; burst time is the CPU time needed to finish the operation.</p>
        </Panel>

        <Panel title="Algorithm" icon={<Zap className="w-4 h-4" />}>
          <div className="space-y-2">
            {(Object.keys(ALGO_LABELS) as SchedulingAlgo[]).map((a) => (
              <button
                key={a}
                onClick={() => { setAlgo(a); setComputed(null); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all border ${algo === a ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-[#0a0e1a] border-[#243044] text-slate-400 hover:border-slate-600'}`}
              >
                {ALGO_LABELS[a]}
              </button>
            ))}
          </div>
          {algo === 'rr' && (
            <div className="mt-4">
              <label className="text-xs text-slate-400 block mb-1.5">Time Quantum</label>
              <Input type="number" min={1} value={quantum} onChange={(v) => { setQuantum(+v || 1); setComputed(null); }} className="w-full" />
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setComputed(runAlgo(processes, algo, quantum))} className="flex-1"><Play className="w-4 h-4 mr-1.5" />Run</Button>
            <Button variant="ghost" onClick={() => { setProcesses(DEFAULT_PROCS); setComputed(null); }}><RotateCcw className="w-4 h-4" /></Button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Avg Waiting" value={result.avgWaiting.toFixed(2)} unit="ms" icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Avg Turnaround" value={result.avgTurnaround.toFixed(2)} unit="ms" icon={<Timer className="w-4 h-4" />} accent="text-sky-400" />
        <StatCard label="CPU Utilization" value={result.cpuUtilization.toFixed(1)} unit="%" icon={<Activity className="w-4 h-4" />} accent="text-amber-400" />
        <StatCard label="Total Time" value={result.totalTime} unit="ms" icon={<Zap className="w-4 h-4" />} accent="text-violet-400" />
      </div>

      <Panel title="Gantt Chart" icon={<Activity className="w-4 h-4" />}>
        <GanttChart result={result} />
      </Panel>

      <Panel title="Vehicle Metrics" icon={<Timer className="w-4 h-4" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-[#243044]">
                {['Vehicle', 'Arrival', 'Burst', 'Priority', 'Completion', 'Turnaround', 'Waiting', 'Response'].map((h) => (
                  <th key={h} className="py-2 px-3 text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.metrics.map((m) => (
                <tr key={m.id} className="border-b border-[#243044]/50 hover:bg-[#0a0e1a]/50">
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-emerald-400">{m.id}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{m.arrivalTime}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{m.burstTime}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{m.priority}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300">{m.completionTime}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-sky-400">{m.turnaroundTime}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-amber-400">{m.waitingTime}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-violet-400">{m.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function runAlgo(processes: Process[], algo: SchedulingAlgo, quantum: number): ScheduleResult {
  if (processes.length === 0) return { slices: [], timeline: [0], metrics: [], avgWaiting: 0, avgTurnaround: 0, cpuUtilization: 0, totalTime: 0 };
  switch (algo) {
    case 'fcfs': return fcfs(processes);
    case 'sjf': return sjf(processes);
    case 'priority': return prioritySched(processes);
    case 'rr': return roundRobin(processes, quantum);
    default: return fcfs(processes);
  }
}

function GanttChart({ result }: { result: ScheduleResult }) {
  if (result.slices.length === 0) return <p className="text-sm text-slate-500">No vehicles to schedule.</p>;
  const maxEnd = result.totalTime || 1;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {result.slices.map((s, i) => {
          const colorIdx = parseInt(s.processId.replace(/\D/g, '')) - 1;
          const color = COLORS[colorIdx % COLORS.length];
          const width = ((s.end - s.start) / maxEnd) * 100;
          return (
            <div key={i} className="flex flex-col items-center animate-fade-in" style={{ minWidth: `${Math.max(width, 5)}%` }}>
              <div className="w-full rounded-md flex items-center justify-center py-3 text-xs font-mono font-semibold text-slate-950" style={{ backgroundColor: color }}>
                {s.processId}
              </div>
              <div className="flex justify-between w-full mt-1 text-[10px] font-mono text-slate-500">
                <span>{s.start}</span>
                <span>{s.end}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        {result.metrics.map((m, i) => (
          <div key={m.id} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-xs font-mono text-slate-400">{m.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModuleHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 shrink-0">{icon}</div>
      <div>
        <h2 className="text-xl font-bold text-slate-100">{title}</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">{description}</p>
      </div>
    </div>
  );
}
