import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Plus, AlertCircle } from 'lucide-react';
import { Panel, Button, Badge } from './ui';
import ShareExampleModal from './ShareExampleModal';
import { ALGORITHM_LABELS, listExamples } from '@/lib/examples';
import { ExampleAlgorithm, RealWorldExample } from '@/types';

type Filter = 'all' | ExampleAlgorithm;

const FILTERS: Filter[] = ['all', 'scheduling', 'producerConsumer', 'bankers', 'memory'];

const FILTER_LABELS: Record<Filter, string> = { all: 'All', ...ALGORITHM_LABELS };

const BADGE_COLORS: Record<ExampleAlgorithm, 'emerald' | 'sky' | 'amber' | 'violet'> = {
  scheduling: 'emerald',
  producerConsumer: 'sky',
  bankers: 'amber',
  memory: 'violet',
};

export default function CommunityExamples() {
  const [examples, setExamples] = useState<RealWorldExample[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [filter, setFilter] = useState<Filter>('all');
  const [sharing, setSharing] = useState(false);
  const [justShared, setJustShared] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setExamples(await listExamples());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = filter === 'all' ? examples : examples.filter((e) => e.algorithm === filter);

  const handleShared = () => {
    setSharing(false);
    setJustShared(true);
    load();
  };

  return (
    <>
      <Panel
        title="Real-Life Examples from Visitors"
        subtitle="Stories from everyday life that match each idea"
        icon={<MessageSquare className="w-4 h-4" />}
        actions={<Button size="sm" onClick={() => { setJustShared(false); setSharing(true); }}><Plus className="w-3.5 h-3.5 mr-1" />Share your example</Button>}
      >
        <div className="flex flex-wrap gap-2 mb-5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter === f ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-[#0a0e1a] border-[#243044] text-slate-400 hover:text-slate-200'}`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {justShared && (
          <p className="text-sm text-emerald-400 mb-4">Thank you. Your example is now on the board.</p>
        )}

        {status === 'loading' && <p className="text-sm text-slate-500">Loading examples...</p>}

        {status === 'error' && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
            <p className="flex items-center gap-2 text-sm text-rose-400"><AlertCircle className="w-4 h-4" />The examples could not be loaded.</p>
            <Button size="sm" variant="ghost" onClick={load}>Try again</Button>
          </div>
        )}

        {status === 'ready' && visible.length === 0 && (
          <p className="text-sm text-slate-500">No examples yet for this topic. Be the first to share one.</p>
        )}

        {status === 'ready' && visible.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map((ex) => (
              <li key={ex.id} className="rounded-lg border border-[#243044] bg-[#0a0e1a] p-4 transition-colors hover:border-[#2f3d56]">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <Badge color={BADGE_COLORS[ex.algorithm]}>{ALGORITHM_LABELS[ex.algorithm]}</Badge>
                  <span className="text-[11px] text-slate-500">{formatDate(ex.created_at)}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{ex.situation}</p>
                <p className="text-xs text-slate-500 mt-3">Shared by <span className="text-slate-300 font-medium">{ex.author_name}</span></p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {sharing && (
        <ShareExampleModal
          initialAlgorithm={filter === 'all' ? 'scheduling' : filter}
          onClose={() => setSharing(false)}
          onShared={handleShared}
        />
      )}
    </>
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
