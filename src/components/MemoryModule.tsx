import { useMemo, useState } from 'react';
import { MemoryStick, Plus, Trash2, RotateCcw, Boxes, HardDrive, AlertTriangle } from 'lucide-react';
import { Panel, Button, Input, Badge, StatCard } from './ui';
import { RealWorldScenario } from './RealWorldScenario';
import { vehicleId } from '@/engine/vehicles';
import { ModuleHeader } from './SchedulingModule';
import { MemoryBlock, AllocResult } from '@/types';
import { allocate, deallocate, FitStrategy, strategyLabel, totalMemory, freeMemory, usedMemory, coalesce } from '@/engine/memory';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

const INITIAL_BLOCKS: MemoryBlock[] = [
  { id: 'b1', start: 0, size: 100, free: true },
  { id: 'b2', start: 100, size: 50, free: true },
  { id: 'b3', start: 150, size: 500, free: true },
  { id: 'b4', start: 650, size: 300, free: true },
  { id: 'b5', start: 950, size: 600, free: true },
];

const STRATEGY_COLORS: Record<FitStrategy, { text: string; border: string; fill: string; soft: string }> = {
  firstFit: { text: 'text-emerald-400', border: 'border-emerald-500/40', fill: '#10b981', soft: 'bg-emerald-500/10' },
  bestFit: { text: 'text-sky-400', border: 'border-sky-500/40', fill: '#38bdf8', soft: 'bg-sky-500/10' },
  worstFit: { text: 'text-amber-400', border: 'border-amber-500/40', fill: '#f59e0b', soft: 'bg-amber-500/10' },
};

interface StrategyComparison {
  strategy: FitStrategy;
  blocks: MemoryBlock[];
  result: AllocResult;
  selectedBlock: number;
}

function StrategyCard({ comparison, requestSize }: { comparison: StrategyComparison; requestSize: number }) {
  const colors = STRATEGY_COLORS[comparison.strategy];
  const total = totalMemory(comparison.blocks);
  const selected = comparison.blocks[comparison.selectedBlock];
  const remainder = selected ? comparison.blocks[comparison.selectedBlock + 1] : undefined;

  return (
    <div className={`rounded-xl border ${colors.border} bg-[#0a0e1a] p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-semibold ${colors.text}`}>{strategyLabel(comparison.strategy)}</h3>
        <Badge color={comparison.result.allocated ? 'emerald' : 'rose'}>{comparison.result.allocated ? 'Fits' : 'No fit'}</Badge>
      </div>
      <div className="text-xs text-slate-500 mb-2">{vehicleId(1)} <span className="font-mono text-slate-300">({requestSize} KB)</span></div>
      <div className="flex items-stretch gap-0.5 h-16 rounded-md overflow-hidden bg-slate-800 border border-slate-700">
        {comparison.blocks.map((block, index) => {
          const width = `${Math.max((block.size / total) * 100, 7)}%`;
          const isSelected = index === comparison.selectedBlock;
          return (
            <div key={`${comparison.strategy}-${index}-${block.id}`} className={`relative flex items-center justify-center min-w-0 transition-all ${isSelected ? colors.soft : 'bg-slate-700/40'}`} style={{ width }}>
              <div className={`absolute inset-y-0 left-0 w-1 ${isSelected ? '' : 'bg-slate-500/20'}`} style={isSelected ? { backgroundColor: colors.fill } : undefined} />
              <div className="text-center px-1 overflow-hidden">
                <div className={`text-[10px] font-semibold truncate ${isSelected ? colors.text : 'text-slate-400'}`}>{isSelected ? vehicleId(1) : block.free ? 'Free' : block.processId}</div>
                <div className="text-[9px] font-mono text-slate-500">{block.size}K</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1"><span>Start</span><span>{total} KB</span></div>
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between"><span className="text-slate-500">Selected block</span><span className="font-mono text-slate-300">{selected ? `${selected.size} KB` : 'None'}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Fragment after {vehicleId(1)}</span><span className={`font-mono ${colors.text}`}>{remainder?.free ? `${remainder.size} KB` : '0 KB'}</span></div>
        <div className="border-t border-[#243044] pt-2 text-slate-400 leading-relaxed">
          {comparison.strategy === 'firstFit' && 'Allocates the first suitable block. Fast, but can leave early holes unused.'}
          {comparison.strategy === 'bestFit' && 'Scans all blocks and allocates the smallest suitable block. Reduces immediate waste.'}
          {comparison.strategy === 'worstFit' && 'Scans all blocks and allocates the largest suitable block. Leaves a large remainder.'}
        </div>
      </div>
    </div>
  );
}

export default function MemoryModule() {
  const [blocks, setBlocks] = useState<MemoryBlock[]>(INITIAL_BLOCKS);
  const [strategy, setStrategy] = useState<FitStrategy>('firstFit');
  const [procName, setProcName] = useState(vehicleId(1));
  const [size, setSize] = useState(212);
  const [lastResult, setLastResult] = useState<AllocResult | null>(null);
  const [allocLog, setAllocLog] = useState<string[]>([]);

  const total = totalMemory(blocks);
  const free = freeMemory(blocks);
  const used = usedMemory(blocks);
  const procCount = blocks.filter((b) => !b.free).length;
  const comparison = useMemo<StrategyComparison[]>(() => {
    return (['firstFit', 'bestFit', 'worstFit'] as FitStrategy[]).map((fitStrategy) => {
      const simulation = allocate(INITIAL_BLOCKS, vehicleId(1), size, fitStrategy);
      const selectedBlock = simulation.blocks.findIndex((block) => block.processId === vehicleId(1));
      return { strategy: fitStrategy, blocks: simulation.blocks, result: simulation.result, selectedBlock };
    });
  }, [size]);

  const doAllocate = () => {
    const pid = procName.trim() || `P${procCount + 1}`;
    const { blocks: newBlocks, result } = allocate(blocks, pid, size, strategy);
    setBlocks(newBlocks);
    setLastResult(result);
    setAllocLog((log) => [`${pid} requested ${size}KB — ${result.allocated ? 'SUCCESS' : 'FAILED'}`, ...log].slice(0, 8));
    setProcName('');
  };

  const doDeallocate = (pid: string) => {
    const newBlocks = coalesce(deallocate(blocks, pid));
    setBlocks(newBlocks);
    setLastResult(null);
    setAllocLog((log) => [`${pid} deallocated — blocks coalesced`, ...log].slice(0, 8));
  };

  const addBlock = () => {
    setBlocks([...blocks, { id: `b${Date.now()}`, start: 0, size: 100, free: true }]);
    setBlocks((b) => coalesce(b));
  };

  const reset = () => { setBlocks(INITIAL_BLOCKS); setLastResult(null); setAllocLog([]); };

  return (
    <div className="space-y-5">
      <ModuleHeader
        icon={<MemoryStick className="w-5 h-5" />}
        title="Memory Management — Traffic Data Storage"
        description="The TG-04 edge gateway reserves contiguous RAM for live camera frames, loop-detector batches, and vehicle-classification results. Compare placement strategies and see how fragmentation can delay a real-time traffic response."
      />

      <RealWorldScenario scenario="memory" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Memory" value={total} unit="KB" icon={<HardDrive className="w-4 h-4" />} />
        <StatCard label="Used" value={used} unit="KB" icon={<Boxes className="w-4 h-4" />} accent="text-amber-400" />
        <StatCard label="Free" value={free} unit="KB" icon={<MemoryStick className="w-4 h-4" />} accent="text-sky-400" />
        <StatCard label="Vehicles" value={procCount} icon={<AlertTriangle className="w-4 h-4" />} accent="text-violet-400" />
      </div>

      <Panel title="Contiguous Memory Allocation Strategies: Meeting a Vehicle" subtitle="Same memory holes, same request, three placement decisions" icon={<MemoryStick className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {comparison.map((item) => <StrategyCard key={item.strategy} comparison={item} requestSize={size} />)}
        </div>
        <div className="mt-4 rounded-lg border border-[#243044] bg-[#0a0e1a] px-4 py-3 text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-200 font-medium">Camera-01 analytics buffer · {vehicleId(1)} ({size} KB)</span> scans the same free blocks in each column. First Fit stops at the first suitable hole, Best Fit searches for the smallest suitable hole, and Worst Fit searches for the largest suitable hole.
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Allocation Request" icon={<Plus className="w-4 h-4" />}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Vehicle or data source</label>
              <Input value={procName} onChange={setProcName} placeholder="e.g. Camera-03 analytics" className="w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Size (KB)</label>
              <Input type="number" min={1} value={size} onChange={(v) => setSize(+v || 1)} className="w-full" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Strategy for live memory map</label>
              <div className="space-y-1.5">
                {(['firstFit', 'bestFit', 'worstFit'] as FitStrategy[]).map((s) => (
                  <button key={s} onClick={() => setStrategy(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${strategy === s ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-[#0a0e1a] border-[#243044] text-slate-400 hover:border-slate-600'}`}>
                    {strategyLabel(s)}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={doAllocate} className="w-full"><Plus className="w-4 h-4 mr-1.5" />Allocate</Button>
            <Button variant="ghost" onClick={addBlock} className="w-full">Add Free Block (100KB)</Button>
            <Button variant="ghost" onClick={reset} className="w-full"><RotateCcw className="w-4 h-4 mr-1.5" />Reset Memory</Button>
          </div>
        </Panel>

        <Panel title="Live Memory Map" subtitle="Use the controls to allocate and release traffic data" icon={<MemoryStick className="w-4 h-4" />} className="lg:col-span-2">
          <div className="space-y-2">
            {blocks.map((b) => {
              const widthPct = (b.size / total) * 100;
              const colorIdx = b.processId ? parseInt(b.processId.replace(/\D/g, '')) - 1 : 0;
              return (
                <div key={b.id} className="group">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-mono text-slate-500 w-16 shrink-0">{b.start}KB</div>
                    <div
                      className={`relative rounded-lg flex items-center justify-center transition-all duration-300 overflow-hidden ${b.free ? 'bg-slate-700/40 border border-slate-600/40' : 'border'}`}
                      style={{ width: `${Math.max(widthPct, 8)}%`, minWidth: '80px', height: '52px', borderColor: b.free ? undefined : COLORS[colorIdx % COLORS.length] + '60', backgroundColor: b.free ? undefined : COLORS[colorIdx % COLORS.length] + '20' }}
                    >
                      <div className="text-center">
                        <div className={`text-xs font-mono font-semibold ${b.free ? 'text-slate-400' : 'text-slate-100'}`}>
                          {b.free ? 'FREE' : b.processId}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{b.size}KB</div>
                      </div>
                      {!b.free && b.processId && (
                        <button onClick={() => doDeallocate(b.processId!)} className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="text-xs font-mono text-slate-500 pt-1">{total}KB</div>
          </div>

          {lastResult && (
            <div className={`mt-4 rounded-lg border p-3 text-sm ${lastResult.allocated ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-rose-500/30 bg-rose-500/5 text-rose-300'}`}>
              {lastResult.message}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Fragmentation Analysis" icon={<AlertTriangle className="w-4 h-4" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">External Fragmentation</span>
              <Badge color="amber">{free} KB free across {blocks.filter((b) => b.free).length} blocks</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Largest Free Block</span>
              <Badge color="sky">{Math.max(0, ...blocks.filter((b) => b.free).map((b) => b.size))} KB</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Allocated Blocks</span>
              <Badge color="emerald">{procCount} vehicle(s)</Badge>
            </div>
            <div className="bg-[#0a0e1a] border border-[#243044] rounded-lg p-3 text-xs text-slate-400 leading-relaxed mt-2">
              <p><span className="text-amber-400 font-medium">External fragmentation</span> occurs when free memory is split into small, non-contiguous blocks — a request may fail even if total free memory is sufficient. <span className="text-emerald-400">Best Fit</span> minimizes wasted space per allocation but can create many small fragments. <span className="text-sky-400">First Fit</span> is faster but may fragment large blocks. <span className="text-violet-400">Worst Fit</span> leaves large blocks intact but reduces them quickly.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Allocation Log" icon={<HardDrive className="w-4 h-4" />}>
          {allocLog.length === 0 ? (
            <p className="text-sm text-slate-500">No allocations yet. Request memory to see the log.</p>
          ) : (
            <div className="space-y-2">
              {allocLog.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-mono animate-slide-in">
                  <span className="text-slate-600 text-xs">{String(allocLog.length - i).padStart(2, '0')}</span>
                  <span className={entry.includes('FAILED') ? 'text-rose-400' : entry.includes('deallocated') ? 'text-amber-400' : 'text-emerald-400'}>{entry}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
