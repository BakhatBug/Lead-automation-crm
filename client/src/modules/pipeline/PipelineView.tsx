import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import {
  Opportunity,
  DealStage,
  Task,
  Meeting,
  FunnelMetrics,
  AttributionRecord,
} from '../../types/index.js';
import { StageBadge } from '../../components/Badge.js';
import { NewDealModal } from './NewDealModal.js';
import { BookMeetingModal } from './BookMeetingModal.js';
import {
  KanbanSquare,
  CheckSquare,
  Calendar,
  BarChart3,
  Plus,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Briefcase,
} from 'lucide-react';

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'QUALIFIED', label: '1. Qualified', color: 'border-cyan-500/30' },
  { id: 'MEETING_SCHEDULED', label: '2. Meeting Scheduled', color: 'border-violet-500/40' },
  { id: 'PROPOSAL', label: '3. Proposal Sent', color: 'border-amber-500/30' },
  { id: 'WON', label: '4. Closed Won 🏆', color: 'border-emerald-500/50' },
];

export const PipelineView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'tasks' | 'calendar' | 'analytics'>('kanban');
  const [deals, setDeals] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [funnel, setFunnel] = useState<FunnelMetrics | null>(null);
  const [attribution, setAttribution] = useState<AttributionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isBookMeetingOpen, setIsBookMeetingOpen] = useState(false);

  useEffect(() => {
    loadPipelineData();
  }, [activeTab]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      const [dealsData, tasksData, meetingsData, analyticsData] = await Promise.all([
        api.getDeals(),
        api.getTasks(),
        api.getMeetings(),
        api.getFunnelAnalytics(),
      ]);
      setDeals(dealsData);
      setTasks(tasksData);
      setMeetings(meetingsData);
      setFunnel(analyticsData.funnel);
      setAttribution(analyticsData.attribution);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async (deal: Opportunity, nextStage: DealStage) => {
    try {
      const updated = await api.updateDeal(deal.id, { stage: nextStage });
      setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
      const updated = await api.updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const totalPipeline = deals
    .filter((d) => d.stage !== 'LOST')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalWon = deals
    .filter((d) => d.stage === 'WON')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Revenue Pipeline & Sales Execution</h2>
          <p className="text-xs text-slate-400">
            Total Active Pipeline: <strong className="text-emerald-400 font-mono">${totalPipeline.toLocaleString()}</strong> • Won: <strong className="text-violet-400 font-mono">${totalWon.toLocaleString()}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'calendar' ? (
            <button
              onClick={() => setIsBookMeetingOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 transition-all"
            >
              <Calendar className="h-4 w-4" />
              Book Meeting
            </button>
          ) : (
            <button
              onClick={() => setIsNewDealOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Opportunity
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'kanban'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <KanbanSquare className="h-4 w-4" />
          Deals Kanban Board
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'tasks'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          SDR Today Tasks ({tasks.filter((t) => t.status === 'PENDING').length})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'calendar'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Discovery Meetings ({meetings.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Revenue Attribution & Funnel
        </button>
      </div>

      {/* View 1: Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div
                key={stage.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 min-h-[500px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {stage.label}
                    </h3>
                    <div className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">
                      ${stageValue.toLocaleString()} ({stageDeals.length})
                    </div>
                  </div>
                  <span className="h-5 w-5 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-600">No deals in this stage</div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2.5 transition-all hover:border-slate-700 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-bold text-white tracking-tight line-clamp-1">
                            {deal.title}
                          </span>
                          <span className="font-mono text-xs font-extrabold text-emerald-400">
                            ${deal.amount.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>{deal.company}</span>
                          <span className="text-slate-500 font-mono">{deal.expectedCloseDate}</span>
                        </div>

                        {/* Probability Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>Win Probability</span>
                            <span>{deal.probability}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick stage transition button */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Rep: {deal.owner.split(' ')[0]}</span>

                          {stage.id === 'QUALIFIED' && (
                            <button
                              onClick={() => handleAdvanceStage(deal, 'MEETING_SCHEDULED')}
                              className="flex items-center gap-1 text-violet-400 hover:underline font-semibold"
                            >
                              Advance to Meeting <ArrowRight className="h-2.5 w-2.5" />
                            </button>
                          )}
                          {stage.id === 'MEETING_SCHEDULED' && (
                            <button
                              onClick={() => handleAdvanceStage(deal, 'PROPOSAL')}
                              className="flex items-center gap-1 text-amber-400 hover:underline font-semibold"
                            >
                              Send Proposal <ArrowRight className="h-2.5 w-2.5" />
                            </button>
                          )}
                          {stage.id === 'PROPOSAL' && (
                            <button
                              onClick={() => handleAdvanceStage(deal, 'WON')}
                              className="flex items-center gap-1 text-emerald-400 hover:underline font-bold"
                            >
                              Close Won! 🏆
                            </button>
                          )}
                          {stage.id === 'WON' && (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Won
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: SDR Today Tasks */}
      {activeTab === 'tasks' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">SDR Daily Priority Action Queue</h3>
              <p className="text-xs text-slate-400">
                Generated automatically from positive reply intent and meeting prep triggers
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task)}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isCompleted
                      ? 'border-slate-800/50 bg-slate-950/40 opacity-60'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => {}}
                      className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span
                        className={`text-xs font-semibold ${
                          isCompleted ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Account: {task.company || 'General'}</span>
                        <span>•</span>
                        <span>Assignee: {task.assignedTo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Due: {task.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 3: Calendar & Discovery Meetings */}
      {activeTab === 'calendar' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Scheduled Discovery & Demo Calls</h3>
              <p className="text-xs text-slate-400">
                Synced automatically via connected Google Calendar and Microsoft 365
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-slate-950 p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      CALENDAR EVENT
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{m.title}</h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {m.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div>
                    <strong>Attendee:</strong> {m.contactName} ({m.contactEmail})
                  </div>
                  <div>
                    <strong>Company:</strong> {m.company}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono pt-1">
                    <Clock className="h-3.5 w-3.5 text-violet-400" />
                    <span>{new Date(m.startTime).toLocaleString()}</span>
                  </div>
                </div>

                {m.notes && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                    {m.notes}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <a
                    href={m.calendarLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-md shadow-violet-600/20"
                  >
                    Join Call <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 4: Revenue Attribution & Funnel Analytics */}
      {activeTab === 'analytics' && funnel && (
        <div className="space-y-6">
          {/* Conversion Funnel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Full-Funnel Sales Conversion Rates</h3>
            <p className="text-xs text-slate-400">
              End-to-end attribution: from cold lead CSV import down to signed revenue contracts
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-2xl font-black text-white">{funnel.totalLeads}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold mt-1">Leads Ingested</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-2xl font-black text-indigo-400">{funnel.totalSent}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold mt-1">
                  Emails Sent ({funnel.conversionRates.replyRate}% Reply)
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-2xl font-black text-emerald-400">{funnel.positiveReplies}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold mt-1">
                  Positive Replies ({funnel.conversionRates.positiveReplyRate}%)
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-2xl font-black text-violet-400">{funnel.meetingsBooked}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold mt-1">
                  Meetings Booked ({funnel.conversionRates.meetingRate}%)
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-2xl font-black text-emerald-400">
                  ${funnel.closedWonRevenue.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold mt-1">
                  Won Revenue ({funnel.conversionRates.winRate}% Win)
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Revenue Attribution Matrix */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Campaign Revenue Attribution</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Campaign Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Sent</th>
                    <th className="p-3">Total Replies</th>
                    <th className="p-3">Positive</th>
                    <th className="p-3">Meetings</th>
                    <th className="p-3">Pipeline ($)</th>
                    <th className="p-3">Won Revenue ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950">
                  {attribution.map((camp) => (
                    <tr key={camp.campaignId} className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-white">{camp.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {camp.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{camp.sent}</td>
                      <td className="p-3 font-mono text-slate-300">{camp.replies}</td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{camp.positiveReplies}</td>
                      <td className="p-3 font-mono text-violet-400 font-bold">{camp.meetings}</td>
                      <td className="p-3 font-mono text-white font-bold">${camp.pipelineValue.toLocaleString()}</td>
                      <td className="p-3 font-mono text-emerald-400 font-black">
                        ${camp.revenueWon.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewDealModal
        isOpen={isNewDealOpen}
        onClose={() => setIsNewDealOpen(false)}
        onSuccess={loadPipelineData}
      />

      <BookMeetingModal
        isOpen={isBookMeetingOpen}
        onClose={() => setIsBookMeetingOpen(false)}
        onSuccess={loadPipelineData}
      />
    </div>
  );
};
