import { useState } from 'react';
import { LayoutDashboard, Cpu, ArrowLeftRight, Shield, MemoryStick, TrafficCone } from 'lucide-react';
import { View } from '@/types';
import Overview from '@/components/Overview';
import SchedulingModule from '@/components/SchedulingModule';
import ProducerConsumerModule from '@/components/ProducerConsumerModule';
import BankersModule from '@/components/BankersModule';
import MemoryModule from '@/components/MemoryModule';

const NAV_ITEMS: { key: View; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'scheduling', label: 'CPU Scheduling', icon: <Cpu className="w-4 h-4" /> },
  { key: 'producerConsumer', label: 'Producer–Consumer', icon: <ArrowLeftRight className="w-4 h-4" /> },
  { key: 'bankers', label: "Banker's Algorithm", icon: <Shield className="w-4 h-4" /> },
  { key: 'memory', label: 'Memory Management', icon: <MemoryStick className="w-4 h-4" /> },
];

export default function App() {
  const [view, setView] = useState<View>('overview');

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0e1a]/90 backdrop-blur-md border-b border-[#243044]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-1.5 text-emerald-400">
              <TrafficCone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-100">Smart Traffic OS</span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-2">Visualizer</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex gap-6">
        {/* Sidebar nav */}
        <nav className="hidden md:flex flex-col gap-1 w-52 shrink-0 sticky top-20 self-start">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all border ${
                view === item.key
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-[#111827] hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a] border-t border-[#243044] px-2 py-2">
          <div className="flex justify-around">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition-colors ${
                  view === item.key ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {item.icon}
                <span className="truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <div className="animate-fade-in" key={view}>
            {view === 'overview' && <Overview onNavigate={setView} />}
            {view === 'scheduling' && <SchedulingModule />}
            {view === 'producerConsumer' && <ProducerConsumerModule />}
            {view === 'bankers' && <BankersModule />}
            {view === 'memory' && <MemoryModule />}
          </div>
        </main>
      </div>
    </div>
  );
}
