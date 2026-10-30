import { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, Play, Pause, RotateCcw, SkipForward, Database, Lock, Unlock } from 'lucide-react';
import { Panel, Button, Input, Badge } from './ui';
import { ModuleHeader } from './SchedulingModule';
import { RealWorldScenario } from './RealWorldScenario';
import { PCConfig, PCStep } from '@/engine/producerConsumer';
import { simulateProducerConsumer } from '@/engine/producerConsumer';

export default function ProducerConsumerModule() {
  const [config, setConfig] = useState<PCConfig>({ bufferSize: 5, producerRate: 1, consumerRate: 1, itemCount: 10 });
  const [steps, setSteps] = useState<PCStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const regenerate = (cfg: PCConfig) => {
    setSteps(simulateProducerConsumer(cfg));
    setCurrentStep(0);
    setPlaying(false);
  };

  // Mount-only: the first run uses the initial config.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { regenerate(config); }, []);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= steps.length - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 900);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, steps.length]);

  const step = steps[currentStep];
  const updateCfg = (field: keyof PCConfig, value: number) => {
    const cfg = { ...config, [field]: value };
    setConfig(cfg);
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        icon={<ArrowLeftRight className="w-5 h-5" />}
        title="Producer–Consumer — Traffic Data Pipeline"
        description="At Intersection 12, loop detectors, speed cameras, pedestrian counters, and ANPR cameras produce events. A bounded edge buffer holds those events while congestion analysis and signal-control workers consume them using empty, full, and mutex semaphores."
      />

      <RealWorldScenario scenario="producerConsumer" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <Panel title="Configuration" icon={<Database className="w-4 h-4" />} className="lg:col-span-1">
          <div className="space-y-3">
            <Field label="Edge buffer capacity (events)">
              <Input type="number" min={2} value={config.bufferSize} onChange={(v) => updateCfg('bufferSize', +v || 2)} className="w-full" />
            </Field>
            <Field label="Traffic events to generate">
              <Input type="number" min={1} value={config.itemCount} onChange={(v) => updateCfg('itemCount', +v || 1)} className="w-full" />
            </Field>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => regenerate(config)} className="flex-1"><Play className="w-4 h-4 mr-1" />Simulate</Button>
              <Button variant="ghost" onClick={() => regenerate({ bufferSize: 5, producerRate: 1, consumerRate: 1, itemCount: 10 })}><RotateCcw className="w-4 h-4" /></Button>
            </div>
            <div className="rounded-lg border border-[#243044] bg-[#0a0e1a] p-3 text-xs text-slate-400 leading-relaxed"><span className="text-slate-200 font-medium">Live sources:</span> loop detector, speed camera, pedestrian counter, ANPR camera, vehicle classifier.</div>
          </div>
        </Panel>

        <Panel title="Bounded Buffer Visualization" className="lg:col-span-3"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPlaying(!playing)} disabled={currentStep >= steps.length - 1}>
                {playing ? <><Pause className="w-3.5 h-3.5 mr-1" />Pause</> : <><Play className="w-3.5 h-3.5 mr-1" />Play</>}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCurrentStep((s) => Math.min(s + 1, steps.length - 1))} disabled={currentStep >= steps.length - 1}>
                <SkipForward className="w-3.5 h-3.5" />
              </Button>
            </div>
          }
        >
          {step && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Badge color="slate">Step {currentStep} / {steps.length - 1}</Badge>
                <div className="flex items-center gap-2">
                  {step.actor === 'producer' && <Badge color="emerald">Producer Active</Badge>}
                  {step.actor === 'consumer' && <Badge color="sky">Consumer Active</Badge>}
                  {step.blocked !== 'none' && <Badge color="rose">{step.blocked === 'producer' ? 'Producer Blocked' : 'Consumer Blocked'}</Badge>}
                </div>
              </div>

              {/* Buffer */}
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-medium">Edge gateway buffer · circular queue of traffic events</div>
                <div className="flex gap-2 items-center">
                  {step.buffer.map((item, i) => {
                    const isIn = i === step.in;
                    const isOut = i === step.out;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center font-mono font-bold text-lg transition-all duration-300 ${
                          item !== null
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-[#0a0e1a] border-[#243044] text-slate-600'
                        }`}>
                          {item !== null ? item : '·'}
                        </div>
                        <div className="flex gap-0.5 text-[9px] font-mono">
                          {isIn && <span className="text-amber-400">IN</span>}
                          {isOut && <span className="text-sky-400">OUT</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Semaphores */}
              <div className="grid grid-cols-3 gap-3">
                <SemaphoreCard name="empty" value={step.empty} icon={<Unlock className="w-4 h-4" />} color="amber" desc="Free slots" />
                <SemaphoreCard name="full" value={step.full} icon={<Database className="w-4 h-4" />} color="emerald" desc="Filled slots" />
                <SemaphoreCard name="mutex" value={step.mutex} icon={<Lock className="w-4 h-4" />} color="sky" desc="Buffer lock" />
              </div>

              {/* Action log */}
              <div className="bg-[#0a0e1a] border border-[#243044] rounded-lg p-4">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5 font-medium">Action Log</div>
                <p className="text-sm font-mono text-slate-300 leading-relaxed">{step.log}</p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Simulation Progress</span>
                  <span>{Math.round((currentStep / (steps.length - 1)) * 100)}%</span>
                </div>
                <input type="range" min={0} max={steps.length - 1} value={currentStep} onChange={(e) => { setPlaying(false); setCurrentStep(+e.target.value); }} className="w-full accent-emerald-500" />
              </div>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="How Synchronization Works" icon={<Lock className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <Badge color="amber">Semaphore: empty</Badge>
            <p className="text-slate-400">Counts empty buffer slots. Producer waits on <span className="font-mono text-amber-400">empty</span> before inserting. Initialized to buffer size.</p>
          </div>
          <div className="space-y-1">
            <Badge color="emerald">Semaphore: full</Badge>
            <p className="text-slate-400">Counts filled slots. Consumer waits on <span className="font-mono text-emerald-400">full</span> before removing. Initialized to 0.</p>
          </div>
          <div className="space-y-1">
            <Badge color="sky">Semaphore: mutex</Badge>
            <p className="text-slate-400">Binary mutex ensures mutual exclusion — only one worker accesses the buffer at a time. Initialized to 1.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SemaphoreCard({ name, value, icon, color, desc }: { name: string; value: number; icon: React.ReactNode; color: 'amber' | 'emerald' | 'sky'; desc: string }) {
  const colors = {
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    sky: 'border-sky-500/30 bg-sky-500/5 text-sky-400',
  };
  return (
    <div className={`border rounded-lg p-3.5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono font-semibold">{name}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{desc}</div>
    </div>
  );
}
