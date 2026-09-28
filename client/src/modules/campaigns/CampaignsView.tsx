import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { Campaign, Mailbox } from '../../types/index.js';
import { CampaignWizardModal } from './CampaignWizardModal.js';
import {
  Play,
  Pause,
  AlertOctagon,
  Plus,
  Send,
  CheckCircle2,
  Users,
  MessageSquare,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const CampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, mData] = await Promise.all([api.getCampaigns(), api.getMailboxes()]);
      setCampaigns(cData);
      setMailboxes(mData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (id: string) => {
    try {
      await api.launchCampaign(id);
      setActionMessage('Campaign launched successfully! Automated scheduler active.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await api.pauseCampaign(id);
      setActionMessage('Campaign paused.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleKillSwitch = async (id: string) => {
    try {
      const camp = await api.toggleKillSwitch(id);
      setActionMessage(
        camp.safetyKillSwitch
          ? 'EMERGENCY KILL-SWITCH ENGAGED: Outbound sends halted.'
          : 'Safety kill-switch disengaged.'
      );
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSimulateSend = async (id: string) => {
    try {
      const res = await api.simulateCampaignSend(id);
      setActionMessage(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Campaigns & Sequence Automation</h2>
          <p className="text-xs text-slate-400">
            Multi-step email cadences with automated unenrollment on reply, A/B testing & kill-switches
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      {actionMessage && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs animate-in fade-in">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            {actionMessage}
          </span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-[10px] text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading active campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No campaigns found. Create your first campaign above.</div>
        ) : (
          campaigns.map((camp) => (
            <div
              key={camp.id}
              className={`rounded-2xl border bg-slate-950 p-6 shadow-sm transition-all ${
                camp.safetyKillSwitch
                  ? 'border-rose-600/50 bg-rose-950/10'
                  : camp.status === 'ACTIVE'
                  ? 'border-indigo-500/30 shadow-indigo-500/5'
                  : 'border-slate-800'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        camp.safetyKillSwitch
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : camp.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : camp.status === 'PAUSED'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {camp.safetyKillSwitch ? 'KILLED (EMERGENCY STOP)' : camp.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {camp.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{camp.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{camp.objective}</p>
                </div>

                {/* Campaign Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulateSend(camp.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-all"
                    title="Simulate sending step 1 to pending leads in batch"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Simulate Step 1 Send
                  </button>

                  {camp.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handlePause(camp.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800"
                    >
                      <Pause className="h-3.5 w-3.5" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLaunch(camp.id)}
                      disabled={camp.safetyKillSwitch}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Launch
                    </button>
                  )}

                  {/* Safety Kill Switch (Non-negotiable requirement in blueprint) */}
                  <button
                    onClick={() => handleToggleKillSwitch(camp.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      camp.safetyKillSwitch
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                        : 'bg-slate-900 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border-slate-800 hover:border-rose-800/40'
                    }`}
                    title="Non-negotiable Safety Control: Immediately stops all outgoing sequences"
                  >
                    <AlertOctagon className="h-3.5 w-3.5" />
                    {camp.safetyKillSwitch ? 'Kill-Switch Engaged' : 'Kill Switch'}
                  </button>
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 py-4 border-b border-slate-800/60">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-base font-bold text-white">{camp.stats.leadsCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Leads Enrolled</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-base font-bold text-indigo-400">{camp.stats.sentCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Sent</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-base font-bold text-blue-400">{camp.stats.openedCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Opened</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-base font-bold text-amber-400">{camp.stats.repliedCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Replies</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-base font-bold text-emerald-400">{camp.stats.positiveRepliesCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Positive Intent</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="text-base font-bold text-violet-400">
                    ${camp.stats.revenueWon.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Revenue Won</div>
                </div>
              </div>

              {/* Sequence Steps Summary */}
              <div className="pt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="font-semibold text-slate-300">Audience:</span>
                  <span>{camp.targetAudience}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-slate-400">
                  <span className="text-indigo-400 font-bold">{camp.steps.length} Steps:</span>
                  {camp.steps.map((s, idx) => (
                    <span
                      key={s.id || idx}
                      className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]"
                    >
                      {s.type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Campaign Wizard Modal */}
      <CampaignWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => loadData()}
        mailboxes={mailboxes}
      />
    </div>
  );
};
