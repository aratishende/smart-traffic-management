import { Cpu, ArrowLeftRight, Shield, MemoryStick, ArrowRight, TrafficCone, Camera, Radio, Signal, MapPin, Database, Gauge } from 'lucide-react';
import CommunityExamples from './CommunityExamples';
import { View } from '@/types';

const MODULES: { key: View; title: string; desc: string; icon: React.ReactNode; color: string; concepts: string[]; example: string }[] = [
  {
    key: 'scheduling', title: 'CPU Scheduling', desc: 'Schedule real intersection tasks such as signal-phase changes, pedestrian crossings, emergency preemption, and camera analytics. Compare waiting time, turnaround time, and CPU utilization.',
    icon: <Cpu className="w-6 h-6" />, color: 'emerald',
    concepts: ['FCFS', 'SJF', 'Priority', 'Round Robin', 'Gantt Chart', 'Waiting/Turnaround Time'],
    example: 'An ambulance gets the green light ahead of a camera batch.',
  },
  {
    key: 'producerConsumer', title: 'Producer–Consumer', desc: 'Move loop-detector, speed-camera, pedestrian-counter, and ANPR events through a bounded edge buffer without losing or duplicating traffic data.',
    icon: <ArrowLeftRight className="w-6 h-6" />, color: 'sky',
    concepts: ['Bounded Buffer', 'Semaphores', 'Mutex', 'Producer', 'Consumer', 'Circular Queue'],
    example: 'Loop-detector car counts reach the congestion model with none lost.',
  },
  {
    key: 'bankers', title: "Banker's Algorithm", desc: 'Prevent deadlock when signal control, camera analytics, emergency routing, and monitoring compete for CPU, memory, and communication channels.',
    icon: <Shield className="w-6 h-6" />, color: 'amber',
    concepts: ['Allocation', 'Maximum', 'Need Matrix', 'Available', 'Safe Sequence', 'Deadlock Avoidance'],
    example: 'Signal control and emergency routing never freeze the junction.',
  },
  {
    key: 'memory', title: 'Memory Management', desc: 'Place live traffic feeds and analytics buffers into an edge gateway’s RAM using First Fit, Best Fit, and Worst Fit, then inspect fragmentation.',
    icon: <MemoryStick className="w-6 h-6" />, color: 'violet',
    concepts: ['First Fit', 'Best Fit', 'Worst Fit', 'Fragmentation', 'Memory Map', 'Coalescing'],
    example: 'A plate-reading camera gets a contiguous frame buffer when it needs one.',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', hover: 'hover:border-emerald-500/50' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', hover: 'hover:border-sky-500/50' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hover: 'hover:border-amber-500/50' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', hover: 'hover:border-violet-500/50' },
};

export default function Overview({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[#243044] bg-gradient-to-br from-[#111827] to-[#0a0e1a] p-8 md:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <TrafficCone className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Problem 3 — Operating Systems Visualizer</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 leading-tight">
            Smart Traffic Management System
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl leading-relaxed">
            An intelligent traffic-control system collects data from road sensors, surveillance cameras, and traffic signals.
            This visualizer demonstrates how four core Operating Systems concepts work together to process traffic data efficiently,
            synchronize sensor data flow, manage memory, and ensure safe resource allocation.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0e1a] border border-[#243044] text-xs text-slate-300"><Radio className="w-3.5 h-3.5 text-emerald-400" />Road Sensors</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0e1a] border border-[#243044] text-xs text-slate-300"><Camera className="w-3.5 h-3.5 text-sky-400" />Surveillance Cameras</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0e1a] border border-[#243044] text-xs text-slate-300"><Signal className="w-3.5 h-3.5 text-amber-400" />Traffic Signals</span>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#243044] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4"><MapPin className="w-4 h-4 text-emerald-400" /><h2 className="text-lg font-bold text-slate-100">Control Room Scenario</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScenarioCard icon={<Radio className="w-4 h-4" />} title="Intersection 12 · Central Avenue" detail="Morning peak: 08:30–09:00" color="emerald" />
          <ScenarioCard icon={<Database className="w-4 h-4" />} title="Edge gateway TG-04" detail="Processes 1,200 events per second" color="sky" />
          <ScenarioCard icon={<Gauge className="w-4 h-4" />} title="Operational goal" detail="Keep signal response under 100 ms" color="amber" />
        </div>
      </div>

      {/* How they connect */}
      <div className="bg-[#111827] border border-[#243044] rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">How the Four Concepts Work Together</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FlowStep num="1" title="Data Arrives" desc="Sensors & cameras produce traffic data into a bounded buffer (Producer–Consumer)." color="sky" />
          <FlowStep num="2" title="Memory Allocated" desc="Incoming data is stored in memory using First/Best/Worst Fit allocation." color="violet" />
          <FlowStep num="3" title="CPU Schedules" desc="Signal-control tasks compete for CPU via FCFS/SJF/Priority/Round Robin." color="emerald" />
          <FlowStep num="4" title="Resources Safe" desc="Banker's Algorithm ensures shared resources are granted without deadlock." color="amber" />
        </div>
      </div>

      {/* Module cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Algorithm Visualizers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODULES.map((mod) => {
            const c = colorMap[mod.color];
            return (
              <button
                key={mod.key}
                onClick={() => onNavigate(mod.key)}
                className={`text-left bg-[#111827] border border-[#243044] rounded-xl p-6 transition-all duration-200 ${c.hover} hover:bg-[#1a2332] group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${c.bg} ${c.border} border rounded-xl p-3 ${c.text} shrink-0`}>{mod.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-100">{mod.title}</h3>
                      <ArrowRight className={`w-4 h-4 ${c.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                    </div>
                    <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{mod.desc}</p>
                    <div className="mt-3 rounded-lg border border-[#243044] bg-[#0a0e1a] px-3 py-2 text-xs text-slate-300 leading-relaxed"><span className={`font-semibold ${c.text}`}>Real life:</span> {mod.example}</div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {mod.concepts.map((concept) => (
                        <span key={concept} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0a0e1a] border border-[#243044] text-slate-400">{concept}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <CommunityExamples />
    </div>
  );
}

function ScenarioCard({ icon, title, detail, color }: { icon: React.ReactNode; title: string; detail: string; color: string }) {
  const c = colorMap[color];
  return <div className={`flex items-start gap-3 rounded-lg border ${c.border} ${c.bg} p-3`}><span className={c.text}>{icon}</span><div><p className="text-sm font-medium text-slate-200">{title}</p><p className="text-xs text-slate-400 mt-0.5">{detail}</p></div></div>;
}

function FlowStep({ num, title, desc, color }: { num: string; title: string; desc: string; color: string }) {
  const c = colorMap[color];
  return (
    <div className="relative">
      <div className={`w-8 h-8 ${c.bg} ${c.border} border rounded-lg ${c.text} flex items-center justify-center font-mono font-bold text-sm mb-2`}>{num}</div>
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}
