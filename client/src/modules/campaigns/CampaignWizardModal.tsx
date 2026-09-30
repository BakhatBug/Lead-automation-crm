import React, { useState } from 'react';
import { api } from '../../api/index.js';
import { SequenceStep, Mailbox } from '../../types/index.js';
import { SequenceTimelineEditor } from './SequenceTimelineEditor.js';
import { X, ArrowRight } from 'lucide-react';

interface CampaignWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mailboxes: Mailbox[];
}

export const CampaignWizardModal: React.FC<CampaignWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mailboxes,
}) => {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('Doctor Campaign List');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedMailboxes, setSelectedMailboxes] = useState<string[]>(
    mailboxes.length > 0 ? [mailboxes[0].id] : []
  );

  React.useEffect(() => {
    if (isOpen) {
      api.getLeads().then((leads) => {
        const tagSet = new Set<string>();
        leads.forEach((l) => {
          (l.tags || []).forEach((t) => tagSet.add(t));
        });
        const tags = Array.from(tagSet);
        setAvailableTags(tags);
        if (tags.length > 0 && !targetAudience) {
          setTargetAudience(tags[0]);
        }
      }).catch(console.error);
    }
  }, [isOpen]);
  const [steps, setSteps] = useState<SequenceStep[]>([
    {
      id: 'step-1',
      campaignId: '',
      stepNumber: 1,
      type: 'EMAIL',
      delayDays: 0,
      subject: 'Scaling outbound pipeline for {{company}}',
      bodyTemplate:
        'Hi {{firstName}},\n\nI noticed {{company}} has been expanding its revenue team.\n\nWe built an AI outbound engine that automates lead enrichment and intent classification so sales teams book 3x more qualified meetings without manual prospecting.\n\nOpen to a brief 10-minute demo this week?\n\nBest,\nYour Name',
    },
    {
      id: 'step-2',
      campaignId: '',
      stepNumber: 2,
      type: 'WAIT',
      delayDays: 2,
      subject: '',
      bodyTemplate: '',
    },
    {
      id: 'step-3',
      campaignId: '',
      stepNumber: 3,
      type: 'EMAIL',
      delayDays: 2,
      subject: 'Re: Scaling outbound pipeline for {{company}}',
      bodyTemplate:
        'Hi {{firstName}},\n\nFollowing up briefly—wanted to see if this aligns with {{company}}\'s outbound priorities for this quarter?\n\nHappy to share a 2-minute walkthrough.\n\nBest,\nYour Name',
    },
    {
      id: 'step-4',
      campaignId: '',
      stepNumber: 4,
      type: 'CONDITION',
      delayDays: 3,
      subject: '',
      bodyTemplate: '',
      conditionRules: {
        ifReplied: 'STOP_SEQUENCE',
        ifNoReplyDays: 3,
      },
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please provide a campaign name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.createCampaign({
        name: name.trim(),
        objective: objective.trim() || 'Drive qualified meetings',
        targetAudience: targetAudience.trim() || 'B2B Executives',
        mailboxIds: selectedMailboxes,
        steps,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Module 2
            </span>
            <h2 className="text-lg font-bold text-slate-900">Create New Outbound Campaign</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Campaign Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 FinTech CTO Outreach"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Target Lead Segment / List Tag *</span>
                <span className="text-[10px] text-blue-600 font-normal">Enrolls only leads matching this list tag</span>
              </label>
              {availableTags.length > 0 ? (
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-blue-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
                >
                  <option value="All Leads">All Leads (Entire Database)</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      Tag Segment: {tag}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Doctor Campaign List, Stationery Shop List..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
                />
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Strategic Objective & Pitch</label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Book 20 discovery calls for AI pipeline acceleration"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Mailbox Pool */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Sending Mailbox Pool</label>
            <div className="grid grid-cols-2 gap-2.5">
              {mailboxes.map((box) => {
                const isSelected = selectedMailboxes.includes(box.id);
                return (
                  <button
                    key={box.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMailboxes(selectedMailboxes.filter((id) => id !== box.id));
                      } else {
                        setSelectedMailboxes([...selectedMailboxes, box.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between shadow-sm ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-slate-900 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{box.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{box.email}</div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {box.provider}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sequence Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Sequence Automation Flow
              </label>
              <span className="text-xs font-semibold text-blue-600">{steps.length} Steps Configured</span>
            </div>

            <SequenceTimelineEditor steps={steps} onChange={setSteps} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-all"
          >
            {loading ? 'Creating...' : 'Save & Publish Campaign'}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
