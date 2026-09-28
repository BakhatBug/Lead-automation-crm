import React from 'react';
import { ActiveTab } from './Sidebar.js';
import { RefreshCw, Sparkles, Plus, Upload, Play } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onResetSeed: () => void;
  onOpenImport?: () => void;
  onOpenNewCampaign?: () => void;
  onOpenSimulateReply?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onResetSeed,
  onOpenImport,
  onOpenNewCampaign,
  onOpenSimulateReply,
}) => {
  const titles: Record<ActiveTab, { title: string; subtitle: string; owner: string }> = {
    dashboard: {
      title: 'Sales Outbound & Revenue Cockpit',
      subtitle: 'Real-time performance across lead research, active sequences, reply intelligence & revenue',
      owner: 'Executive / Unified View',
    },
    leads: {
      title: 'Lead Management & Enrichment Engine',
      subtitle: 'CSV/XLSX Ingestion, auto-column mapping, deduplication, ICP scoring & suppression lists',
      owner: 'Team Member 1: Lead Data & Ingestion',
    },
    campaigns: {
      title: 'Campaign Builder & Sequence Automation',
      subtitle: 'Multi-step sequences, token interpolation, A/B variants, stop conditions & safety kill-switch',
      owner: 'Team Member 2: Sequence Automation Engine',
    },
    mailboxes: {
      title: 'Mailbox Infrastructure & Deliverability',
      subtitle: 'Google Workspace / M365 accounts, warm-up diagnostics, SPF/DKIM/DMARC & sending limits',
      owner: 'Team Member 3: Mailbox & Webhook Infrastructure',
    },
    inbox: {
      title: 'Unified Inbox & AI Conversation Intelligence',
      subtitle: 'Real-time reply threading, 10-class intent taxonomy, confidence scoring & grounded AI reply drafts',
      owner: 'Team Member 4: Unified Inbox & AI Intelligence',
    },
    pipeline: {
      title: 'Sales Pipeline (Kanban), Calendar & Analytics',
      subtitle: 'Deal stages, automated qualification, calendar bookings, SDR task queue & revenue attribution',
      owner: 'Team Member 5: Pipeline CRM & Revenue Analytics',
    },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-16 px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-white tracking-tight">{current.title}</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-mono">
            {current.owner}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate max-w-2xl">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        {onOpenSimulateReply && (
          <button
            onClick={onOpenSimulateReply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-all shadow-sm"
            title="Simulate an incoming email reply to test AI Intent Classification and threading"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            Simulate Reply
          </button>
        )}

        {onOpenImport && activeTab === 'leads' && (
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-sm"
          >
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </button>
        )}

        {onOpenNewCampaign && activeTab === 'campaigns' && (
          <button
            onClick={onOpenNewCampaign}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New Campaign
          </button>
        )}

        <button
          onClick={onResetSeed}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800 transition-all"
          title="Reset local mock database to fresh initial state"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Mock Data
        </button>
      </div>
    </header>
  );
};
