import React, { useState } from 'react';
import { api } from '../../api/index.js';
import { MailboxProvider } from '../../types/index.js';
import { X, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ConnectMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConnectMailboxModal: React.FC<ConnectMailboxModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [provider, setProvider] = useState<MailboxProvider>('GOOGLE');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [dailySendLimit, setDailySendLimit] = useState(40);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.connectMailbox({
        provider,
        email: email.trim(),
        name: name.trim() || email,
        dailySendLimit,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect mailbox');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Module 3 Feature
              </span>
              <h2 className="text-base font-bold text-white">Connect Business Mailbox</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Google Workspace & Microsoft 365 OAuth</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Provider</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('GOOGLE')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  provider === 'GOOGLE'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                }`}
              >
                Google Workspace
              </button>
              <button
                type="button"
                onClick={() => setProvider('MICROSOFT')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  provider === 'MICROSOFT'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                }`}
              >
                Microsoft 365
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Display Name / Rep Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Mailbox Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@yourcompany.com"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex justify-between">
              <span>Daily Sending Quota</span>
              <span className="text-indigo-400 font-mono font-bold">{dailySendLimit} / day</span>
            </label>
            <input
              type="range"
              min={15}
              max={100}
              step={5}
              value={dailySendLimit}
              onChange={(e) => setDailySendLimit(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Recommended: 35-50 sends/day per inbox to maintain 99%+ deliverability.
            </p>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Automated Deliverability Guard
            </div>
            <p>SPF, DKIM, and DMARC records will be verified upon authorization.</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {loading ? 'Authorizing...' : 'Authorize & Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
