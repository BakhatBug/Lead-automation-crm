import React from 'react';
import { ActiveTab } from './Sidebar.js';
import { RefreshCw, Sparkles, Plus, Upload, Database } from 'lucide-react';

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
    <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-slate-900 tracking-tight">{current.title}</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
            {current.owner}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate max-w-2xl">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        {onOpenSimulateReply && (
          <button
            onClick={onOpenSimulateReply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
            title="Simulate an incoming email reply to test AI Intent Classification and threading"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Simulate Reply
          </button>
        )}

        {onOpenImport && activeTab === 'leads' && (
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </button>
        )}

        {onOpenNewCampaign && activeTab === 'campaigns' && (
          <button
            onClick={onOpenNewCampaign}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Campaign
          </button>
        )}

        <button
          onClick={onResetSeed}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-xs"
          title="Reset SQLite database with fresh seed data"
        >
          <Database className="h-3.5 w-3.5 text-blue-600" />
          Reset DB Data
        </button>
      </div>
    </header>
  );
};
