import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { Mailbox } from '../../types/index.js';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  Sliders,
  HelpCircle,
} from 'lucide-react';

interface BounceGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailbox: Mailbox | null;
  onSuccess: () => void;
}

export const BounceGuardModal: React.FC<BounceGuardModalProps> = ({
  isOpen,
  onClose,
  mailbox,
  onSuccess,
}) => {
  const [currentBox, setCurrentBox] = useState<Mailbox | null>(mailbox);
  const [bouncedEmail, setBouncedEmail] = useState('invalid.recipient@unknown-domain.io');
  const [rfcCode, setRfcCode] = useState('550 5.1.1');
  const [reason, setReason] = useState('Recipient address rejected: User unknown or domain not accepting mail');
  const [quarantineThreshold, setQuarantineThreshold] = useState<number>(3.0);
  const [simulating, setSimulating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [updatingThreshold, setUpdatingThreshold] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'danger' | 'info';
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (mailbox) {
      setCurrentBox(mailbox);
      setQuarantineThreshold(mailbox.quarantineThreshold ?? 3.0);
      setFeedback(null);
    }
  }, [mailbox]);

  if (!isOpen || !currentBox) return null;

  const currentBounceCount = currentBox.bounceCount || 0;
  const currentBounceRate = currentBox.bounceRate || 0;
  const threshold = currentBox.quarantineThreshold ?? 3.0;
  const isQuarantined = Boolean(currentBox.isQuarantined);

  // Handle Live Hard Bounce Simulation
  const handleSimulateBounce = async () => {
    if (!bouncedEmail.trim()) return;
    try {
      setSimulating(true);
      setFeedback(null);

      const res = await api.recordMailboxBounce(currentBox.id, {
        bouncedEmail: bouncedEmail.trim(),
        rfcCode,
        reason,
      });

      setCurrentBox(res.mailbox);

      if (res.quarantineTriggered) {
        setFeedback({
          type: 'danger',
          title: '🚨 Quarantine Kill-Switch Activated!',
          message: `Bounce rate reached ${res.bounceRate}% (threshold: ${threshold}%). Mailbox immediately paused and excluded from pool dispatch rotation. Recipient ${bouncedEmail} added to global suppressions table.`,
        });
      } else {
        setFeedback({
          type: res.isQuarantined ? 'danger' : 'info',
          title: res.isQuarantined ? '⚠️ Mailbox in Quarantine' : '⚡ Bounce Recorded',
          message: `${res.message} Target address ${bouncedEmail} marked as HARD_BOUNCE in suppression list.`,
        });
      }

      onSuccess();
    } catch (err: any) {
      setFeedback({
        type: 'danger',
        title: 'Simulation Error',
        message: err.message || 'Failed to simulate bounce',
      });
    } finally {
      setSimulating(false);
    }
  };

  // Handle Quarantine Reset
  const handleResetQuarantine = async () => {
    try {
      setResetting(true);
      setFeedback(null);

      const res = await api.resetMailboxQuarantine(currentBox.id);
      setCurrentBox(res.mailbox);

      setFeedback({
        type: 'success',
        title: '🛡️ Mailbox Reactivated!',
        message: res.message || 'Bounce counters cleared. Mailbox restored to active dispatch rotation.',
      });

      onSuccess();
    } catch (err: any) {
      setFeedback({
        type: 'danger',
        title: 'Reset Error',
        message: err.message || 'Failed to reset quarantine',
      });
    } finally {
      setResetting(false);
    }
  };

  // Handle Save Quarantine Threshold
  const handleSaveThreshold = async () => {
    try {
      setUpdatingThreshold(true);
      const updated = await api.updateMailbox(currentBox.id, {
        quarantineThreshold: Number(quarantineThreshold),
      });
      setCurrentBox(updated);
      setFeedback({
        type: 'success',
        title: 'Threshold Updated',
        message: `Safety threshold set to ${quarantineThreshold}% for this mailbox.`,
      });
      onSuccess();
    } catch (err: any) {
      setFeedback({
        type: 'danger',
        title: 'Update Error',
        message: err.message || 'Failed to update threshold',
      });
    } finally {
      setUpdatingThreshold(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`p-6 border-b flex items-start justify-between ${
          isQuarantined
            ? 'bg-gradient-to-r from-rose-50 via-rose-50/40 to-white border-rose-200'
            : 'bg-gradient-to-r from-emerald-50/60 via-blue-50/40 to-white border-slate-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shadow-sm ${
              isQuarantined ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isQuarantined ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isQuarantined
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {isQuarantined ? '🚨 QUARANTINED' : '🛡️ DELIVERABILITY GUARD ACTIVE'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {currentBox.provider}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Bounce Rate & Domain Quarantine Guard</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{currentBox.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Action Feedback Banner */}
          {feedback && (
            <div className={`p-4 rounded-2xl border transition-all ${
              feedback.type === 'danger'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-start gap-2.5">
                {feedback.type === 'danger' ? (
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">{feedback.title}</h4>
                  <p className="mt-0.5 leading-relaxed text-xs">{feedback.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1 */}
            <div className={`p-4 rounded-2xl border ${
              currentBounceRate >= threshold
                ? 'bg-rose-50/70 border-rose-200'
                : currentBounceRate >= 2.0
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-[11px] font-semibold text-slate-500">Current Bounce Rate</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-2xl font-black font-mono ${
                  currentBounceRate >= threshold
                    ? 'text-rose-600'
                    : currentBounceRate >= 2.0
                    ? 'text-amber-600'
                    : 'text-slate-900'
                }`}>
                  {currentBounceRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">/ {threshold}% max</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {currentBounceRate < 2.0
                  ? '✅ Healthy (Google Compliant)'
                  : currentBounceRate < threshold
                  ? '⚠️ Approaching Safety Ceiling'
                  : '🚨 Exceeded Safety Threshold'}
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="text-[11px] font-semibold text-slate-500">Recorded Bounces</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-mono text-slate-900">{currentBounceCount}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  / {Math.max(currentBox.sentToday || 0, currentBounceCount)} attempts
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Sent today: {currentBox.sentToday || 0} emails</div>
            </div>

            {/* Metric 3 */}
            <div className={`p-4 rounded-2xl border ${
              isQuarantined
                ? 'bg-rose-50 border-rose-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="text-[11px] font-semibold text-slate-500">Dispatch Kill-Switch</div>
              <div className="flex items-center gap-1.5 mt-1">
                {isQuarantined ? (
                  <>
                    <Lock className="h-5 w-5 text-rose-600" />
                    <span className="text-sm font-black text-rose-700">LOCKED</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-black text-emerald-700">ARMED (ACTIVE)</span>
                  </>
                )}
              </div>
              <div className={`text-[10px] mt-1 ${isQuarantined ? 'text-rose-600' : 'text-emerald-700'}`}>
                {isQuarantined ? 'Outbound dispatch blocked' : 'Rotates in dispatch pool'}
              </div>
            </div>
          </div>

          {/* Deliverability Risk Gauge Meter */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Deliverability Risk Spectrum</span>
              <span className="text-[11px] font-mono text-slate-500">
                Industry Threshold: <strong className="text-rose-600">{threshold}% Max</strong>
              </span>
            </div>

            <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
              {/* Safe zone: 0 - 2% (40% width on a 5% scale) */}
              <div className="h-full bg-emerald-500" style={{ width: '40%' }} title="Safe: 0 - 2.0%" />
              {/* Warning zone: 2% - 3% (20% width on a 5% scale) */}
              <div className="h-full bg-amber-400" style={{ width: '20%' }} title="Warning: 2.0 - 3.0%" />
              {/* Quarantine zone: 3% - 5%+ (40% width on a 5% scale) */}
              <div className="h-full bg-rose-500" style={{ width: '40%' }} title="Quarantine: >= 3.0%" />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-0.5">
              <span>0% (Clean)</span>
              <span className="text-emerald-700 font-semibold">2.0% (Risk Warning)</span>
              <span className="text-rose-700 font-bold">3.0% (Quarantine Kill-Switch)</span>
              <span>5.0%+</span>
            </div>
          </div>

          {/* Quarantine Alert Card & Action Button */}
          {isQuarantined ? (
            <div className="p-4 rounded-2xl border border-rose-300 bg-rose-50/80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-200 text-rose-800 mt-0.5">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-900 text-sm">Automated Domain Quarantine Activated</h4>
                  <p className="text-rose-700 text-xs leading-relaxed">
                    {currentBox.quarantineReason ||
                      'Bounce rate exceeded safety threshold. Outbound sends paused to protect domain reputation.'}
                  </p>
                  <p className="text-[11px] text-rose-600 font-medium pt-1">
                    To safeguard your root domain from Google/Microsoft spam blacklists, this mailbox will remain
                    quarantined until manually reviewed and reactivated.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleResetQuarantine}
                  disabled={resetting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
                  <span>{resetting ? 'Reactivating Mailbox...' : 'Reset Quarantine & Reactivate Mailbox'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 mt-0.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-emerald-900 text-sm">Automated Kill-Switch is Armed</h4>
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    This mailbox is actively participating in outbound round-robin dispatch. If bounce rates
                    reach or exceed {threshold}%, the kill-switch will automatically quarantine it and stop all sends.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Live Hard Bounce Simulator Form */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h4 className="font-bold text-slate-900 text-sm">Live Hard Bounce & RFC Kill-Switch Simulator</h4>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                QA & Demo Tool
              </span>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              Simulate an inbound RFC delivery failure (e.g. <code>550 User Unknown</code>). The system will recalculate
              the mailbox bounce rate, auto-suppress the email globally across all campaigns, and trip the quarantine kill-switch
              if the safety threshold is breached.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Recipient Email (Will be injected into Global Suppressions)
                </label>
                <input
                  type="email"
                  value={bouncedEmail}
                  onChange={(e) => setBouncedEmail(e.target.value)}
                  placeholder="e.g. unknown.lead@prospect-corp.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    RFC Error Status Code
                  </label>
                  <select
                    value={rfcCode}
                    onChange={(e) => {
                      setRfcCode(e.target.value);
                      if (e.target.value === '550 5.1.1') {
                        setReason('550 5.1.1 Recipient address rejected: User unknown or mailbox not found');
                      } else if (e.target.value === '554 5.4.1') {
                        setReason('554 5.4.1 Recipient address rejected: Access denied / Spam firewall');
                      } else if (e.target.value === '552 5.2.2') {
                        setReason('552 5.2.2 Mailbox quota exceeded: Permanent delivery failure');
                      } else {
                        setReason('553 5.3.0 Invalid or non-existent recipient domain');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="550 5.1.1">RFC 550 5.1.1 (User Unknown - Hard Bounce)</option>
                    <option value="554 5.4.1">RFC 554 5.4.1 (Delivery Failed / Firewall)</option>
                    <option value="552 5.2.2">RFC 552 5.2.2 (Mailbox Quota Exceeded)</option>
                    <option value="553 5.3.0">RFC 553 5.3.0 (Invalid Domain)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Diagnostic Reason
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Each click records +1 bounce and updates the SQLite store in real time.
                </div>
                <button
                  type="button"
                  onClick={handleSimulateBounce}
                  disabled={simulating || !bouncedEmail.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`h-4 w-4 ${simulating ? 'animate-bounce' : ''}`} />
                  <span>{simulating ? 'Processing Bounce...' : '⚡ Trigger Hard Bounce'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Threshold Tuning Card */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-slate-500" />
                <h4 className="font-bold text-slate-800 text-xs">Quarantine Threshold Sensitivity</h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-600">{quarantineThreshold}%</span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={quarantineThreshold}
                onChange={(e) => setQuarantineThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <button
                type="button"
                onClick={handleSaveThreshold}
                disabled={updatingThreshold}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap"
              >
                {updatingThreshold ? 'Saving...' : 'Save Limit'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Standard Google Workspace & Microsoft 365 deliverability limit is <strong>3.0%</strong>. Setting it lower (e.g. 2.0%) triggers earlier quarantine for high-reputation production domains.
            </p>
          </div>

          {/* Informational Guidance */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>Deliverability Engineering Best Practices</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <li>
                <strong>Automatic Global Suppression:</strong> Any lead returning an RFC 550 or 554 error is immediately suppressed to prevent subsequent campaign steps from hitting the dead address.
              </li>
              <li>
                <strong>Domain Reputation Quarantine:</strong> Removing high-bounce inboxes from the sending rotation prevents IP throttling and protects other connected mailboxes on the same domain.
              </li>
              <li>
                <strong>Lead Scrubbing:</strong> If a mailbox triggers quarantine, use CSV email verification or verify lead lists before resetting quarantine.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <div className="text-[11px] text-slate-500 font-mono">
            Safety Mechanism: RFC 5321 / RFC 3463 Compliance
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
