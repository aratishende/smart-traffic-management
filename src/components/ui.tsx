import { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function Panel({ title, subtitle, icon, children, className = '', actions }: PanelProps) {
  return (
    <div className={`bg-[#111827] border border-[#243044] rounded-xl ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#243044]">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-slate-400">{icon}</span>}
            <div>
              {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '' }: ButtonProps) {
  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

interface InputProps {
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  min?: number;
}

export function Input({ type = 'text', value, onChange, placeholder, className = '', min }: InputProps) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-[#0a0e1a] border border-[#243044] rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none transition-colors ${className}`}
    />
  );
}

interface BadgeProps {
  children: ReactNode;
  color?: 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' | 'violet';
}

export function Badge({ children, color = 'slate' }: BadgeProps) {
  const colors = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    slate: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    violet: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  accent?: string;
}

export function StatCard({ label, value, unit, icon, accent = 'text-emerald-400' }: StatCardProps) {
  return (
    <div className="bg-[#0a0e1a] border border-[#243044] rounded-xl px-4 py-3.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</span>
        {icon && <span className={accent}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold font-mono ${accent}`}>{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}
