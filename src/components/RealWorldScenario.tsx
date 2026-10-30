import { Users, AlertTriangle, Lightbulb, MapPin } from 'lucide-react';
import { SCENARIO_FIGURES } from '@/engine/scenarios';

export type ScenarioKey = 'scheduling' | 'producerConsumer' | 'bankers' | 'memory';

interface Scenario {
  headline: string;
  story: string;
  people: string;
  failure: string;
  lesson: string;
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  scheduling: {
    headline: 'An ambulance needs the green light at Intersection 12',
    story: 'At 8:40 AM, a camera analytics batch and a pedestrian button press are already waiting for the controller CPU. An ambulance siren is detected 300 m away. Priority scheduling lets the emergency routing task jump the queue, so the signal turns green before the ambulance arrives.',
    people: 'Paramedics, the patient in the back, drivers who must clear the lane, and pedestrians who still get a safe crossing.',
    failure: 'With plain first-come, first-served scheduling, the ambulance would wait behind a long camera batch, adding seconds that matter.',
    lesson: 'The algorithm you choose decides who waits. Short, urgent tasks should not be stuck behind long, low-value ones.',
  },
  producerConsumer: {
    headline: 'Loop detectors feed the congestion model without losing a single car',
    story: 'Loop detectors under Central Avenue count cars every few milliseconds. Producers drop each count into a shared edge buffer. Congestion analysis consumes them and sets green times. The empty and full counters stop the sensors from overwriting unread counts, and the mutex ensures two workers never update the same slot at once.',
    people: 'Commuters who would sit through unnecessary red lights, bus passengers on schedule, and delivery drivers planning routes.',
    failure: 'If the buffer overflows, counts vanish and the model thinks the road is empty. If two workers collide, a slot can show a corrupted number, and the signal may give the wrong green time.',
    lesson: 'Shared data must be produced and consumed in order. Otherwise the system makes confident decisions from wrong information.',
  },
  bankers: {
    headline: 'Two services almost lock each other out of the same channel',
    story: 'The signal controller holds the CPU and waits for the communication channel to send new timings. Emergency routing already holds that channel and waits for the CPU to recalculate a green corridor. Each one waits for the other forever, and every light at the junction freezes. Banker\u2019s Algorithm checks every request before granting it and refuses any grant that could lead to this stalemate.',
    people: 'Everyone using the junction, especially emergency crews who depend on a clear corridor, and pedestrians who need signals to change.',
    failure: 'A deadlock leaves the junction stuck on one phase. Cars keep arriving, the queue grows across the block, and emergency vehicles cannot move through.',
    lesson: 'Shared resources must be granted only when every service can still finish. Refusing a risky request now prevents a total stop later.',
  },
  memory: {
    headline: 'A 4K plate-reading camera drops frames because memory is scattered',
    story: 'The ANPR camera at the north entrance needs a single 512 KB block to store each batch of frames for license-plate reading. The edge gateway has enough total free memory, but it is split into small pieces left by earlier, released buffers. Best Fit searches for the snuggest hole that still fits, so large holes stay available for future frames.',
    people: 'Drivers whose plates must be read for toll, parking, or stolen-vehicle alerts, and the operators who rely on those alerts.',
    failure: 'When no single hole is large enough, the camera drops frames and misses plates, even though the gateway technically has the memory.',
    lesson: 'Total free memory is not enough. The shape of free memory decides whether real data can be stored in time.',
  },
};

export function RealWorldScenario({ scenario }: { scenario: ScenarioKey }) {
  const s = SCENARIOS[scenario];
  return (
    <div className="bg-[#111827] border border-[#243044] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Real-World Scenario</span>
      </div>
      <h3 className="text-lg font-bold text-slate-100 leading-snug">{s.headline}</h3>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{s.story}</p>

      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-5 mb-2">By the numbers</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIO_FIGURES[scenario].map((f) => (
          <div key={f.label} className="rounded-lg border border-[#243044] bg-[#0a0e1a] p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{f.label}</p>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1.5">{f.value}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4">
          <div className="flex items-center gap-2 mb-1.5 text-sky-400 text-xs font-semibold uppercase tracking-wide"><Users className="w-3.5 h-3.5" />Who it affects</div>
          <p className="text-xs text-slate-300 leading-relaxed">{s.people}</p>
        </div>
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 mb-1.5 text-rose-400 text-xs font-semibold uppercase tracking-wide"><AlertTriangle className="w-3.5 h-3.5" />If it goes wrong</div>
          <p className="text-xs text-slate-300 leading-relaxed">{s.failure}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 mb-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wide"><Lightbulb className="w-3.5 h-3.5" />Key takeaway</div>
          <p className="text-xs text-slate-300 leading-relaxed">{s.lesson}</p>
        </div>
      </div>
    </div>
  );
}
