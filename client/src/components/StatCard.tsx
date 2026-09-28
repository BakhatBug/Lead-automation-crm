import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtitle?: string;
  color?: 'indigo' | 'emerald' | 'violet' | 'amber' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtitle,
  color = 'indigo',
}) => {
  const colorGradients = {
    indigo: 'from-indigo-500/10 to-indigo-500/0 border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500/10 to-emerald-500/0 border-emerald-500/20 text-emerald-400',
    violet: 'from-violet-500/10 to-violet-500/0 border-violet-500/20 text-violet-400',
    amber: 'from-amber-500/10 to-amber-500/0 border-amber-500/20 text-amber-400',
    blue: 'from-blue-500/10 to-blue-500/0 border-blue-500/20 text-blue-400',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-slate-700 ${colorGradients[color].split(' ')[2]}`}
    >
      <div className={`absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-gradient-to-br ${colorGradients[color]} opacity-40 blur-xl`} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`rounded-lg bg-slate-800/80 p-2.5 ${colorGradients[color].split(' ').pop()}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
