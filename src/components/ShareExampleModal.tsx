import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui';
import { ALGORITHM_LABELS, NAME_MAX, SITUATION_MAX, SITUATION_MIN, submitExample } from '@/lib/examples';
import { ExampleAlgorithm } from '@/types';

interface Props {
  initialAlgorithm: ExampleAlgorithm;
  onClose: () => void;
  onShared: () => void;
}

export default function ShareExampleModal({ initialAlgorithm, onClose, onShared }: Props) {
  const [algorithm, setAlgorithm] = useState<ExampleAlgorithm>(initialAlgorithm);
  const [name, setName] = useState('');
  const [situation, setSituation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const trimmedSituation = situation.trim();
  const nameValid = trimmedName.length > 0 && trimmedName.length <= NAME_MAX;
  const situationValid = trimmedSituation.length >= SITUATION_MIN && trimmedSituation.length <= SITUATION_MAX;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  const handleSubmit = async () => {
    if (!nameValid || !situationValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitExample({ algorithm, author_name: trimmedName, situation: trimmedSituation });
      onShared();
    } catch {
      setError('We could not share your example. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" onClick={() => !submitting && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-example-title"
        className="w-full max-w-lg bg-[#111827] border border-[#243044] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#243044]">
          <h2 id="share-example-title" className="text-base font-semibold text-slate-100">Share a real-life example</h2>
          <button onClick={onClose} disabled={submitting} aria-label="Close" className="text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-slate-400 leading-relaxed">
            Describe a moment in your own life where this kind of problem showed up. Your story appears on the board for other visitors to read.
          </p>

          <div>
            <label htmlFor="example-algorithm" className="text-xs text-slate-400 block mb-1.5">Which idea does it match?</label>
            <select
              id="example-algorithm"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as ExampleAlgorithm)}
              disabled={submitting}
              className="w-full bg-[#0a0e1a] border border-[#243044] rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none"
            >
              {(Object.keys(ALGORITHM_LABELS) as ExampleAlgorithm[]).map((key) => (
                <option key={key} value={key}>{ALGORITHM_LABELS[key]}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="example-name" className="text-xs text-slate-400 block mb-1.5">Your first name or nickname</label>
            <input
              id="example-name"
              value={name}
              maxLength={NAME_MAX}
              disabled={submitting}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya"
              className="w-full bg-[#0a0e1a] border border-[#243044] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="example-situation" className="text-xs text-slate-400">Your situation</label>
              <span className={`text-[11px] font-mono ${situation.length > SITUATION_MAX ? 'text-rose-400' : 'text-slate-500'}`}>
                {trimmedSituation.length}/{SITUATION_MAX}
              </span>
            </div>
            <textarea
              id="example-situation"
              rows={5}
              value={situation}
              maxLength={SITUATION_MAX}
              disabled={submitting}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g. At the airport, three counter agents were all waiting for the same scanner..."
              className="w-full bg-[#0a0e1a] border border-[#243044] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none resize-none leading-relaxed"
            />
            {!situationValid && situation.length > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">Write at least {SITUATION_MIN} characters so others understand the story.</p>
            )}
          </div>

          {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#243044]">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!nameValid || !situationValid || submitting}>
            {submitting ? 'Sharing...' : 'Share example'}
          </Button>
        </div>
      </div>
    </div>
  );
}
