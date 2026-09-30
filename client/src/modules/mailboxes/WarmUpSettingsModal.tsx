import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { Mailbox } from '../../types/index.js';
import {
  Flame,
  ShieldCheck,
  TrendingUp,
  Sliders,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  Clock,
  Play,
  Pause,
} from 'lucide-react';

interface WarmUpSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailbox: Mailbox | null;
  onSuccess: () => void;
}

export const WarmUpSettingsModal: React.FC<WarmUpSettingsModalProps> = ({
  isOpen,
  onClose,
  mailbox,
  onSuccess,
}) => {
  const [warmupEnabled, setWarmupEnabled] = useState(true);
  const [startingLimit, setStartingLimit] = useState(5);
  const [dailyIncrement, setDailyIncrement] = useState(3);
  const [targetLimit, setTargetLimit] = useState(45);
  const [replyRate, setReplyRate] = useState(35);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (mailbox) {
      setWarmupEnabled(mailbox.warmupEnabled ?? true);
      setStartingLimit(mailbox.warmupStartingLimit ?? 5);
      setDailyIncrement(mailbox.warmupDailyIncrement ?? 3);
      setTargetLimit(mailbox.warmupTargetLimit ?? (mailbox.provider === 'HOSTINGER' ? 40 : 45));
      setReplyRate(mailbox.warmupReplyRate ?? 35);
      setSaveSuccess(false);
    }
  }, [mailbox]);

  if (!isOpen || !mailbox) return null;

  // Calculate 30-day projection curve
  const currentDay = Math.min(30, Math.max(1, Math.round((mailbox.warmUpProgress / 100) * 30)));
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const projectedLimit = Math.min(targetLimit, startingLimit + (day - 1) * dailyIncrement);
    return {
      day,
      limit: projectedLimit,
      isCurrent: day === currentDay,
      isPast: day < currentDay,
    };
  });

  const currentDayLimit = Math.min(targetLimit, startingLimit + (currentDay - 1) * dailyIncrement);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateMailbox(mailbox.id, {
        warmupEnabled,
        warmupStartingLimit: startingLimit,
        warmupDailyIncrement: dailyIncrement,
        warmupTargetLimit: targetLimit,
        warmupReplyRate: replyRate,
        dailySendLimit: warmupEnabled ? currentDayLimit : targetLimit,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Failed to update warm-up settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Mailbox Warm-Up Ramp Scheduler</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    warmupEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {warmupEnabled ? '● Active Ramping' : '○ Warm-up Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {mailbox.name} &bull; <strong className="text-slate-700">{mailbox.email}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status summary banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/40">
              <span className="text-[10px] font-bold uppercase text-orange-600 block mb-0.5">Current Phase</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>Day {currentDay} of 30</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Health Score: {mailbox.warmUpProgress}%</div>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40">
              <span className="text-[10px] font-bold uppercase text-blue-600 block mb-0.5">Today's Allowed Limit</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>{currentDayLimit} emails / day</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Sent today: {mailbox.sentToday} emails</div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-0.5">Target Safety Ceiling</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>{targetLimit} max / day</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Provider: {mailbox.provider}</div>
            </div>
          </div>

          {/* 30-Day Visual Ramp Curve Bar Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">30-Day Ramp Progression Curve</h4>
                <p className="text-[11px] text-slate-500">
                  Daily sending volume gradually increases to build domain trust with Google & Outlook spam filters
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Today: Day {currentDay}
              </span>
            </div>

            {/* Visual Bars Container */}
            <div className="h-32 flex items-end gap-1 pt-6 px-1 border-b border-slate-200">
              {days.map((d) => {
                const heightPercent = (d.limit / targetLimit) * 100;
                return (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center group relative h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 hidden group-hover:flex flex-col items-center z-10">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-900 text-white rounded whitespace-nowrap shadow-xs">
                        D{d.day}: {d.limit}/d
                      </span>
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        d.isCurrent
                          ? 'bg-blue-600 ring-2 ring-blue-400 ring-offset-1'
                          : d.isPast
                          ? 'bg-emerald-400'
                          : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span>Day 1 ({startingLimit} sends)</span>
              <span>Day 15 ({(startingLimit + 14 * dailyIncrement > targetLimit ? targetLimit : startingLimit + 14 * dailyIncrement)} sends)</span>
              <span>Day 30 ({targetLimit} max ceiling)</span>
            </div>
          </div>

          {/* Ramp Controls & Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Ramp Rate Settings */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-blue-600" />
                  Ramp Parameters
                </span>
                <button
                  type="button"
                  onClick={() => setWarmupEnabled(!warmupEnabled)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    warmupEnabled
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {warmupEnabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {warmupEnabled ? 'Pause Warmup' : 'Activate Warmup'}
                </button>
              </div>

              {/* Starting volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Starting Day 1 Volume</span>
                  <span className="font-bold text-slate-900 font-mono">{startingLimit} emails/day</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={startingLimit}
                  onChange={(e) => setStartingLimit(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Daily Ramp Step */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Daily Ramp Increment</span>
                  <span className="font-bold text-slate-900 font-mono">+{dailyIncrement} emails/day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={dailyIncrement}
                  onChange={(e) => setDailyIncrement(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Target Limit */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Target Daily Sending Ceiling</span>
                  <span className="font-bold text-slate-900 font-mono">{targetLimit} emails/day</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={targetLimit}
                  onChange={(e) => setTargetLimit(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Right: AI Peer Reply Simulation */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Peer Warmup Network & AI Reply Simulation
              </span>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Simulated Peer Reply Rate</span>
                  <span className="font-bold text-purple-700 font-mono">{replyRate}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  value={replyRate}
                  onChange={(e) => setReplyRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[11px] text-slate-500 leading-snug">
                  AI automatically exchanges positive replies with other active warm-up mailboxes. High reply rates signal to spam filters that your domain receives engagement.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1 text-[11px] text-slate-600">
                <div className="font-semibold text-blue-900 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-blue-600" />
                  Provider Recommendations
                </div>
                <p>
                  <strong>Hostinger:</strong> Cap at 35–40 sends/day (strict 100/hr policy).<br />
                  <strong>Google Workspace:</strong> Safe ceiling 45–50 sends/day.<br />
                  <strong>Zoho Mail:</strong> Safe ceiling 40–45 sends/day.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div className="text-xs text-slate-500">
            {saveSuccess ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Ramp schedule saved successfully!
              </span>
            ) : (
              <span>Ramp updates apply automatically to daily outbound throttles.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Ramp Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
