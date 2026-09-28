import React, { useState } from 'react';
import { api } from '../../api/index.js';
import { MailboxProvider } from '../../types/index.js';
import { X, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Module 3
              </span>
              <h2 className="text-base font-bold text-slate-900">Connect Business Mailbox</h2>
            </div>
            <p className="text-xs text-slate-500">Google Workspace & Microsoft 365 OAuth</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Provider</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('GOOGLE')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  provider === 'GOOGLE'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                Google Workspace
              </button>
              <button
                type="button"
                onClick={() => setProvider('MICROSOFT')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  provider === 'MICROSOFT'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                Microsoft 365
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Display Name / Rep Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Mailbox Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@yourcompany.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex justify-between">
              <span>Daily Sending Quota</span>
              <span className="text-blue-600 font-mono font-bold">{dailySendLimit} / day</span>
            </label>
            <input
              type="range"
              min={15}
              max={100}
              step={5}
              value={dailySendLimit}
              onChange={(e) => setDailySendLimit(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Recommended: 35-50 sends/day per inbox to maintain 99%+ deliverability.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Automated Deliverability Guard
            </div>
            <p>SPF, DKIM, and DMARC records will be verified upon authorization.</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-all"
            >
              {loading ? 'Authorizing...' : 'Authorize & Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
