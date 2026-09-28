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
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between select-none shadow-xs">
      <div>
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200 bg-white">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">VORTEX</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                CRM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">AI Outbound OS</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-blue-100 text-blue-800 font-bold'
                        : 'bg-slate-100 text-slate-500 group-hover:text-slate-600'
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
      <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xs">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-900">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SQLite DB Online
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              SYNCED
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Relational SQLite store loaded with 8 prospects and campaigns</p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            CAN-SPAM / PECR Ready
          </span>
          <span className="font-mono">v1.1-White/Blue</span>
        </div>
      </div>
    </aside>
  );
};
