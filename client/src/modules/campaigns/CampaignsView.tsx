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
  Sparkles,
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campaigns & Sequence Automation</h2>
          <p className="text-xs text-slate-500">
            Multi-step email cadences with automated unenrollment on reply, A/B testing & safety kill-switches
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      {actionMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium animate-in fade-in shadow-sm">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            {actionMessage}
          </span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">Loading active campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">No campaigns found. Create your first campaign above.</div>
        ) : (
          campaigns.map((camp) => (
            <div
              key={camp.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition-all ${
                camp.safetyKillSwitch
                  ? 'border-rose-300 bg-rose-50/20'
                  : camp.status === 'ACTIVE'
                  ? 'border-blue-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        camp.safetyKillSwitch
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : camp.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : camp.status === 'PAUSED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {camp.safetyKillSwitch ? 'KILLED (EMERGENCY STOP)' : camp.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">ID: {camp.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{camp.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{camp.objective}</p>
                </div>

                {/* Campaign Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulateSend(camp.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all shadow-sm"
                    title="Simulate sending step 1 to pending leads in batch"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Simulate Step 1 Send
                  </button>

                  {camp.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handlePause(camp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 transition-all shadow-sm"
                    >
                      <Pause className="h-3.5 w-3.5" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLaunch(camp.id)}
                      disabled={camp.safetyKillSwitch}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Launch
                    </button>
                  )}

                  {/* Safety Kill Switch (Non-negotiable requirement in blueprint) */}
                  <button
                    onClick={() => handleToggleKillSwitch(camp.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                      camp.safetyKillSwitch
                        ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                        : 'bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border-rose-200'
                    }`}
                    title="Non-negotiable Safety Control: Immediately stops all outgoing sequences"
                  >
                    <AlertOctagon className="h-3.5 w-3.5" />
                    {camp.safetyKillSwitch ? 'Kill-Switch Engaged' : 'Kill Switch'}
                  </button>
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 py-4 border-b border-slate-200">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-base font-bold text-slate-900">{camp.stats.leadsCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Leads Enrolled</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-base font-bold text-blue-600">{camp.stats.sentCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Sent</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-base font-bold text-indigo-600">{camp.stats.openedCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Opened</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-base font-bold text-amber-600">{camp.stats.repliedCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total Replies</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-base font-bold text-emerald-600">{camp.stats.positiveRepliesCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Positive Intent</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-base font-bold text-blue-700">
                    ${camp.stats.revenueWon.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Revenue Won</div>
                </div>
              </div>

              {/* Sequence Steps Summary */}
              <div className="pt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-bold text-slate-700">Target Audience:</span>
                  <span>{camp.targetAudience}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-slate-500">
                  <span className="text-blue-600 font-bold">{camp.steps.length} Steps:</span>
                  {camp.steps.map((s, idx) => (
                    <span
                      key={s.id || idx}
                      className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold"
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
