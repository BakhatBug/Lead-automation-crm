import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { Suppression } from '../../types/index.js';
import { X, ShieldAlert, Plus, Trash2 } from 'lucide-react';

interface SuppressionListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuppressionListModal: React.FC<SuppressionListModalProps> = ({ isOpen, onClose }) => {
  const [suppressions, setSuppressions] = useState<Suppression[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [type, setType] = useState<'email' | 'domain'>('email');
  const [reason, setReason] = useState<'MANUAL' | 'UNSUBSCRIBE' | 'BOUNCE' | 'LEGAL'>('MANUAL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSuppressions();
    }
  }, [isOpen]);

  const loadSuppressions = async () => {
    try {
      const data = await api.getSuppressions();
      setSuppressions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    try {
      setLoading(true);
      await api.addSuppression({
        [type]: inputVal.trim().toLowerCase(),
        reason,
      });
      setInputVal('');
      loadSuppressions();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <div>
              <h2 className="text-base font-bold text-white">Global Workspace Suppression List</h2>
              <p className="text-xs text-slate-400">Do-Not-Contact rules (CAN-SPAM & PECR compliance)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add new rule */}
        <form onSubmit={handleAdd} className="my-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-300">Add New Suppression Rule</div>
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="email">Email Address</option>
              <option value="domain">Entire Domain (@domain.com)</option>
            </select>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={type === 'email' ? 'e.g. prospect@company.com' : 'e.g. competitor.com'}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Suppress
            </button>
          </div>
        </form>

        {/* List of suppressions */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {suppressions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No active suppression rules.</div>
          ) : (
            suppressions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs"
              >
                <div>
                  <div className="font-mono text-white font-medium">
                    {s.email || `@${s.domain}`}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Reason: <span className="text-rose-400 font-semibold">{s.reason}</span> • Source: {s.source}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-800 pt-3 mt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
