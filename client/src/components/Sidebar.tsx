import React from 'react';
import {
  LayoutDashboard,
  Users,
  Send,
  MailCheck,
  Inbox,
  KanbanSquare,
  Sparkles,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'leads' | 'campaigns' | 'mailboxes' | 'inbox' | 'pipeline';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadInboxCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, unreadInboxCount }) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Executive Cockpit',
      moduleTag: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'leads' as ActiveTab,
      label: 'Leads & Enrichment',
      moduleTag: 'Module 1',
      icon: Users,
    },
    {
      id: 'campaigns' as ActiveTab,
      label: 'Campaigns & Sequences',
      moduleTag: 'Module 2',
      icon: Send,
    },
    {
      id: 'mailboxes' as ActiveTab,
      label: 'Mailboxes & Delivery',
      moduleTag: 'Module 3',
      icon: MailCheck,
    },
    {
      id: 'inbox' as ActiveTab,
      label: 'Unified Inbox & AI',
      moduleTag: 'Module 4',
      icon: Inbox,
      badge: unreadInboxCount > 0 ? unreadInboxCount : undefined,
    },
    {
      id: 'pipeline' as ActiveTab,
      label: 'Pipeline & Calendar',
      moduleTag: 'Module 5',
      icon: KanbanSquare,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between select-none">
      <div>
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/60">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">VORTEX</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                CRM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">AI Outbound OS</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            5 Core Engineering Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-slate-800/80 text-slate-500 group-hover:text-slate-400'
                    }`}
                  >
                    {item.moduleTag}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 space-y-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Engine Online
            </span>
            <span className="text-[10px] font-mono text-emerald-400">100% HEALTH</span>
          </div>
          <p className="text-[11px] text-slate-500">Autonomous reply classification & deliverability guards active</p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            SOC-2 / PECR Ready
          </span>
          <span className="font-mono">v1.0-MVP</span>
        </div>
      </div>
    </aside>
  );
};
