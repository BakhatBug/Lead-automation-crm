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
  Send,
  Sparkles,
  Layers,
  Users,
  CheckCircle2,
  Mail,
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
  onOpenNewCampaign,
  onOpenSimulateReply,
}) => {
  const [funnel, setFunnel] = useState<FunnelMetrics | null>(null);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Autonomous Lead-to-Revenue Sales Operating System
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Turn Cold Prospect Files into Managed Pipeline
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              CSV import → grounded AI enrichment → sequenced mailbox sending → real-time reply
              intelligence → autonomous pipeline qualification.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onOpenImport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Upload className="h-4 w-4" />
              Import Leads (CSV)
            </button>

            <button
              onClick={onOpenSimulateReply}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 text-violet-200 border border-violet-500/30 font-bold text-xs transition-all"
            >
              <Sparkles className="h-4 w-4 text-violet-400" />
              Simulate Inbound Reply
            </button>
          </div>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Pipeline"
          value={funnel ? `$${funnel.pipelineValue.toLocaleString()}` : '$208,000'}
          change="+18.4%"
          icon={DollarSign}
          color="indigo"
          subtitle="Opportunities in qualification"
        />
        <StatCard
          title="Closed Won Revenue"
          value={funnel ? `$${funnel.closedWonRevenue.toLocaleString()}` : '$24,000'}
          change="3 deals won"
          icon={TrendingUp}
          color="emerald"
          subtitle="Direct campaign attribution"
        />
        <StatCard
          title="Positive Reply Rate"
          value={funnel ? `${funnel.conversionRates.positiveReplyRate}%` : '37.5%'}
          change="9 buying signals"
          icon={Inbox}
          color="violet"
          subtitle="AI intent classification"
        />
        <StatCard
          title="Discovery Calls"
          value={funnel ? funnel.meetingsBooked : '5'}
          change="Automated sync"
          icon={Calendar}
          color="amber"
          subtitle="Google & Outlook sync"
        />
        <StatCard
          title="Domain Health"
          value="100%"
          change="SPF/DKIM Valid"
          icon={ShieldCheck}
          color="blue"
          subtitle="Daily rate-limits active"
        />
      </div>

      {/* 5 Engineering Modules Division Map (Directly for Team Members) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">5 Engineering Modules & Team Ownership Division</h2>
              <p className="text-xs text-slate-400">
                Each team member refines their assigned module with clean git branch boundaries
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
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
              desc: 'CSV auto-mapping, deduplication, transparent ICP fit scoring, firmographics, and compliance suppression lists.',
              branch: 'module/1-lead-data',
              color: 'border-blue-500/30 hover:border-blue-500 bg-blue-950/10',
            },
            {
              id: 'campaigns' as ActiveTab,
              num: '2',
              title: 'Campaign & Sequence',
              owner: 'Team Member 2',
              desc: 'Multi-step sequence editor, A/B variant testing, wait delays, scheduling queues, and non-negotiable safety kill-switches.',
              branch: 'module/2-campaign-engine',
              color: 'border-indigo-500/30 hover:border-indigo-500 bg-indigo-950/10',
            },
            {
              id: 'mailboxes' as ActiveTab,
              num: '3',
              title: 'Mailbox & Deliverability',
              owner: 'Team Member 3',
              desc: 'Google Workspace / M365 OAuth, warm-up diagnostics, SPF/DKIM/DMARC checks, and RFC email thread reconstruction.',
              branch: 'module/3-mailbox-deliverability',
              color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/10',
            },
            {
              id: 'inbox' as ActiveTab,
              num: '4',
              title: 'Unified Inbox & AI',
              owner: 'Team Member 4',
              desc: 'Multi-mailbox triage, 10-class intent taxonomy (Interested, Meeting, Objection, etc.), confidence score, and grounded reply drafts.',
              branch: 'module/4-unified-inbox-ai',
              color: 'border-violet-500/30 hover:border-violet-500 bg-violet-950/10',
            },
            {
              id: 'pipeline' as ActiveTab,
              num: '5',
              title: 'Pipeline CRM & Analytics',
              owner: 'Team Member 5',
              desc: 'Deals Kanban board, calendar meeting booking, SDR daily task queue, and end-to-end revenue attribution analytics.',
              branch: 'module/5-pipeline-analytics',
              color: 'border-amber-500/30 hover:border-amber-500 bg-amber-950/10',
            },
          ].map((m) => (
            <div
              key={m.num}
              onClick={() => onNavigateTab(m.id)}
              className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${m.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="h-6 w-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-white font-mono">
                    {m.num}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{m.branch}</span>
                </div>
                <h3 className="text-xs font-bold text-white">{m.title}</h3>
                <div className="text-[11px] font-semibold text-indigo-400 mt-0.5">{m.owner}</div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{m.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                <span>Open Module</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Activity Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hot Inbound Replies */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Recent Classified Inbound Replies</h3>
            </div>
            <button
              onClick={() => onNavigateTab('inbox')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              View Unified Inbox <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onNavigateTab('inbox')}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-white flex items-center gap-2">
                    <span>{conv.contactName}</span>
                    <span className="text-slate-500 font-normal">({conv.company})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
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
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Priority SDR Tasks for Today</h3>
            </div>
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All Tasks <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {urgentTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigateTab('pipeline')}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-white">{t.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Account: {t.company} • Assignee: {t.assignedTo}
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
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
