import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { FunnelMetrics, Conversation, Task } from '../../types/index.js';
import { StatCard } from '../../components/StatCard.js';
import { IntentBadge } from '../../components/Badge.js';
import { ActiveTab } from '../../components/Sidebar.js';
import {
  DollarSign,
  TrendingUp,
  Inbox,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Upload,
  Sparkles,
  Layers,
  CheckCircle2,
  Database,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenImport: () => void;
  onOpenNewCampaign: () => void;
  onOpenSimulateReply: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenImport,
  onOpenSimulateReply,
}) => {
  const [funnel, setFunnel] = useState<FunnelMetrics | null>(null);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, convs, tasks] = await Promise.all([
        api.getFunnelAnalytics(),
        api.getConversations(),
        api.getTasks(),
      ]);
      setFunnel(analyticsData.funnel);
      setRecentConversations(convs.slice(0, 4));
      setUrgentTasks(tasks.filter((t) => t.status === 'PENDING').slice(0, 3));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner with Clean Blue Gradient */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30 text-white text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Native Sales Engagement & Outbound CRM
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Turn Raw Lead Lists Into Closed Revenue
          </h1>
          <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
            CSV import → SQLite relational persistence → sequence automation → mailbox delivery →
            AI reply classification → pipeline opportunity closing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-sm hover:bg-blue-50 transition-all"
          >
            <Upload className="h-4 w-4 text-blue-600" />
            Import CSV Leads
          </button>

          <button
            onClick={onOpenSimulateReply}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/30 hover:bg-blue-500/40 text-white border border-blue-400/40 font-bold text-xs transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Simulate Reply
          </button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Pipeline"
          value={funnel ? `$${funnel.pipelineValue.toLocaleString()}` : '$208,000'}
          change="+18.4%"
          icon={DollarSign}
          subtitle="Opportunities in qualification"
        />
        <StatCard
          title="Closed Won ARR"
          value={funnel ? `$${funnel.closedWonRevenue.toLocaleString()}` : '$24,000'}
          change="3 closed deals"
          icon={TrendingUp}
          subtitle="Direct campaign attribution"
        />
        <StatCard
          title="Positive Reply Rate"
          value={funnel ? `${funnel.conversionRates.positiveReplyRate}%` : '37.5%'}
          change="9 buying signals"
          icon={Inbox}
          subtitle="AI intent classification"
        />
        <StatCard
          title="Discovery Calls"
          value={funnel ? funnel.meetingsBooked : '5'}
          change="Google & Outlook"
          icon={Calendar}
          subtitle="Calendar events synced"
        />
        <StatCard
          title="Database State"
          value="SQLite"
          change="8 Leads Synced"
          icon={Database}
          subtitle="crm.sqlite database active"
        />
      </div>

      {/* 5 Engineering Modules Division Map */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">5 Engineering Modules & Team Ownership</h2>
              <p className="text-xs text-slate-500">
                Assigned module branches on GitHub for parallel team development
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            5 Team Members
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              id: 'leads' as ActiveTab,
              num: '1',
              title: 'Lead Data & Ingestion',
              owner: 'Team Member 1',
              desc: 'CSV auto-mapping, deduplication, transparent ICP fit scoring, and compliance suppression lists.',
              branch: 'module/1-lead-data',
            },
            {
              id: 'campaigns' as ActiveTab,
              num: '2',
              title: 'Campaign & Sequence',
              owner: 'Team Member 2',
              desc: 'Multi-step sequence editor, A/B testing, wait delays, scheduling queues, and safety kill-switches.',
              branch: 'module/2-campaign-engine',
            },
            {
              id: 'mailboxes' as ActiveTab,
              num: '3',
              title: 'Mailbox & Deliverability',
              owner: 'Team Member 3',
              desc: 'Google Workspace / M365 accounts, warm-up diagnostics, SPF/DKIM/DMARC checks, and RFC email thread sync.',
              branch: 'module/3-mailbox-deliverability',
            },
            {
              id: 'inbox' as ActiveTab,
              num: '4',
              title: 'Unified Inbox & AI',
              owner: 'Team Member 4',
              desc: 'Multi-mailbox triage, 10-class intent taxonomy (Interested, Meeting, Objection, etc.), and grounded reply drafts.',
              branch: 'module/4-unified-inbox-ai',
            },
            {
              id: 'pipeline' as ActiveTab,
              num: '5',
              title: 'Pipeline CRM & Analytics',
              owner: 'Team Member 5',
              desc: 'Deals Kanban board, calendar meeting booking, SDR daily task queue, and revenue attribution analytics.',
              branch: 'module/5-pipeline-analytics',
            },
          ].map((m) => (
            <div
              key={m.num}
              onClick={() => onNavigateTab(m.id)}
              className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:border-blue-500 hover:shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="h-6 w-6 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-xs font-bold font-mono">
                    {m.num}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {m.branch}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {m.title}
                </h3>
                <div className="text-[11px] font-semibold text-blue-600 mt-0.5">{m.owner}</div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{m.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                <span>Open Module</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Activity Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hot Inbound Replies */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent AI Classified Replies</h3>
            </div>
            <button
              onClick={() => onNavigateTab('inbox')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              View Inbox <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onNavigateTab('inbox')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-900 flex items-center gap-2">
                    <span>{conv.contactName}</span>
                    <span className="text-slate-500 font-normal">({conv.company})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                    {conv.messages[conv.messages.length - 1]?.bodyText}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <IntentBadge intent={conv.intent} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority SDR Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Priority SDR Tasks for Today</h3>
            </div>
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              View Tasks <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {urgentTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigateTab('pipeline')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-900">{t.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Account: {t.company} • Rep: {t.assignedTo}
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
