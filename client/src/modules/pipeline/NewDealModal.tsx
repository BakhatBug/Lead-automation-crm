import React, { useState } from 'react';
import { api } from '../../api/index.js';
import { DealStage } from '../../types/index.js';
import { X, DollarSign } from 'lucide-react';

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialLead?: {
    leadId: string;
    contactName: string;
    company: string;
  } | null;
}

export const NewDealModal: React.FC<NewDealModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialLead,
}) => {
  const [title, setTitle] = useState(
    initialLead ? `${initialLead.company} - Outbound CRM Expansion` : ''
  );
  const [company, setCompany] = useState(initialLead?.company || '');
  const [contactName, setContactName] = useState(initialLead?.contactName || '');
  const [amount, setAmount] = useState(24000);
  const [stage, setStage] = useState<DealStage>('QUALIFIED');
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-11-30');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    try {
      setLoading(true);
      await api.createDeal({
        title: title.trim(),
        company: company.trim(),
        contactName: contactName.trim() || 'Primary Contact',
        amount: Number(amount),
        stage,
        expectedCloseDate,
        leadId: initialLead?.leadId,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create CRM Opportunity ($ Deal)</h2>
              <p className="text-xs text-slate-400">Add to revenue pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Opportunity Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acme Corp - 25 Seat Expansion"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Company Name *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Primary Contact</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Deal Value ($ USD) *</label>
              <input
                type="number"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Initial Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="QUALIFIED">Qualified</option>
                <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
                <option value="PROPOSAL">Proposal Sent</option>
                <option value="WON">Closed Won</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Target Close Date</label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
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
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
