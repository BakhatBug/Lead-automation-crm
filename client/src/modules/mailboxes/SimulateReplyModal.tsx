import React, { useState } from 'react';
import { api } from '../../api/index.js';
import { Mailbox } from '../../types/index.js';
import { X, Sparkles, Send, CheckCircle2 } from 'lucide-react';

interface SimulateReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mailboxes: Mailbox[];
}

const PRESET_TEMPLATES = [
  {
    name: '📅 Meeting Request (Elena Rostova)',
    fromEmail: 'elena.rostova@cloudscale.ai',
    fromName: 'Elena Rostova',
    subject: 'Re: Scaling CloudScale.ai outbound',
    bodyText:
      'Hi Alex, this is very timely. We are actively reviewing our outbound toolchain this quarter. Do you have 20 minutes this Thursday at 2:00 PM EST to walk through the intent classification?',
  },
  {
    name: '💰 Pricing / Volume Inquiry (Marcus Brody)',
    fromEmail: 'm.brody@finleap-tech.com',
    fromName: 'Marcus Brody',
    subject: 'Re: Scaling FinLeap Tech outbound',
    bodyText:
      'Alex, looks promising. What does pricing look like for a team of 15 SDRs, and what is your mailbox warmup guarantee?',
  },
  {
    name: '🛡️ Objection / Competitor (David Zhang)',
    fromEmail: 'david@nexusdata.io',
    fromName: 'David Zhang',
    subject: 'Re: Outbound pipeline at NexusData',
    bodyText:
      'We already use Apollo and HubSpot. Why would we add another system to our sales tech stack?',
  },
  {
    name: '🏖️ Out of Office Auto-Reply',
    fromEmail: 'traveler@acmecorp.com',
    fromName: 'Jordan Lee',
    subject: 'Automatic reply: Out of Office until Oct 12',
    bodyText:
      'Thank you for your message. I am currently out of the office for the annual summit with no email access until Oct 12th.',
  },
  {
    name: '🛑 Unsubscribe / Opt-Out',
    fromEmail: 'removeme@legacycorp.net',
    fromName: 'Thomas Vance',
    subject: 'Please remove me',
    bodyText:
      'Unsubscribe. Please take me off your mailing list immediately and do not contact me again.',
  },
];

export const SimulateReplyModal: React.FC<SimulateReplyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mailboxes,
}) => {
  const [selectedMailboxId, setSelectedMailboxId] = useState(mailboxes[0]?.id || '');
  const [fromName, setFromName] = useState(PRESET_TEMPLATES[0].fromName);
  const [fromEmail, setFromEmail] = useState(PRESET_TEMPLATES[0].fromEmail);
  const [subject, setSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [bodyText, setBodyText] = useState(PRESET_TEMPLATES[0].bodyText);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (t: typeof PRESET_TEMPLATES[0]) => {
    setFromName(t.fromName);
    setFromEmail(t.fromEmail);
    setSubject(t.subject);
    setBodyText(t.bodyText);
    setResult(null);
  };

  const handleSendSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.simulateInboundReply({
        mailboxId: selectedMailboxId || mailboxes[0]?.id,
        fromEmail: fromEmail.trim(),
        fromName: fromName.trim(),
        subject: subject.trim(),
        bodyText: bodyText.trim(),
      });
      setResult(res);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Simulate Incoming Reply Webhook</h2>
              <p className="text-xs text-slate-500">
                Tests Provider Webhook → RFC Threading → AI Intent Classifier → Grounded Reply Draft
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="my-3 space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Quick Inbound Scenarios:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(t)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs border border-slate-200 hover:border-blue-200 transition-all font-medium shadow-sm"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendSimulation} className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Mailbox</label>
              <select
                value={selectedMailboxId}
                onChange={(e) => setSelectedMailboxId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
              >
                {mailboxes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">From Name</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Prospect Email Address</label>
            <input
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Reply Email Body Text</label>
            <textarea
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none font-sans shadow-sm"
            />
          </div>

          {result && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Inbound Webhook Processed!
              </div>
              <p className="text-slate-700 font-medium">
                Intent: <span className="font-bold text-slate-900">{result.conversation.intent}</span> (Confidence:{' '}
                {Math.round(result.conversation.intentConfidence * 100)}%)
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Reasoning: {result.conversation.intentReasoning}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              {loading ? 'Processing Pipeline...' : 'Inject Incoming Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
