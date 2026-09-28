import React from 'react';
import { ReplyIntent, LeadStatus, DealStage } from '../types/index.js';

export const IntentBadge: React.FC<{ intent: ReplyIntent }> = ({ intent }) => {
  const styles: Record<ReplyIntent, string> = {
    INTERESTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MEETING_REQUEST: 'bg-violet-500/10 text-violet-400 border-violet-500/30 font-semibold animate-pulse',
    PRICING_REQUEST: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    QUESTION: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    OBJECTION: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    NOT_NOW: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    NOT_INTERESTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    OUT_OF_OFFICE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    UNSUBSCRIBE: 'bg-red-500/15 text-red-400 border-red-500/40',
    BOUNCE: 'bg-red-500/20 text-red-300 border-red-500/50',
    UNKNOWN: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };

  const labels: Record<ReplyIntent, string> = {
    INTERESTED: 'Interested',
    MEETING_REQUEST: '📅 Meeting Request',
    PRICING_REQUEST: '💰 Pricing Inquiry',
    QUESTION: 'Question',
    OBJECTION: 'Objection / Competitor',
    NOT_NOW: 'Not Right Now',
    NOT_INTERESTED: 'Not Interested',
    OUT_OF_OFFICE: 'Out of Office',
    UNSUBSCRIBE: 'Unsubscribe',
    BOUNCE: 'Bounced',
    UNKNOWN: 'Unclassified',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${
        styles[intent] || styles.UNKNOWN
      }`}
    >
      {labels[intent] || intent}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const styles: Record<LeadStatus, string> = {
    NEW: 'bg-slate-800 text-slate-300 border-slate-700',
    ENROLLED: 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50',
    ACTIVE: 'bg-blue-950/60 text-blue-300 border-blue-700/50',
    REPLIED: 'bg-amber-950/60 text-amber-300 border-amber-700/50',
    QUALIFIED: 'bg-teal-950/60 text-teal-300 border-teal-700/50',
    MEETING_BOOKED: 'bg-violet-950/60 text-violet-300 border-violet-700/50',
    OPPORTUNITY: 'bg-purple-950/60 text-purple-300 border-purple-700/50',
    WON: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60 font-semibold',
    LOST: 'bg-rose-950/50 text-rose-400 border-rose-800/40',
    UNSUBSCRIBED: 'bg-red-950/70 text-red-400 border-red-800/50',
    BOUNCED: 'bg-red-950/80 text-red-500 border-red-800/60',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const StageBadge: React.FC<{ stage: DealStage }> = ({ stage }) => {
  const labels: Record<DealStage, string> = {
    NEW_DISCOVERED: 'Discovered',
    CONTACTED: 'Contacted',
    ENGAGED: 'Engaged',
    QUALIFIED: 'Qualified',
    MEETING_SCHEDULED: 'Meeting Scheduled',
    PROPOSAL: 'Proposal Sent',
    WON: 'Closed Won',
    LOST: 'Closed Lost',
  };

  const colors: Record<DealStage, string> = {
    NEW_DISCOVERED: 'bg-slate-800 text-slate-300 border-slate-700',
    CONTACTED: 'bg-blue-900/40 text-blue-300 border-blue-800',
    ENGAGED: 'bg-indigo-900/40 text-indigo-300 border-indigo-800',
    QUALIFIED: 'bg-cyan-900/40 text-cyan-300 border-cyan-800',
    MEETING_SCHEDULED: 'bg-violet-900/50 text-violet-300 border-violet-700 font-semibold',
    PROPOSAL: 'bg-amber-900/40 text-amber-300 border-amber-700',
    WON: 'bg-emerald-900/50 text-emerald-300 border-emerald-600 font-bold',
    LOST: 'bg-rose-900/40 text-rose-400 border-rose-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs border ${colors[stage]}`}>
      {labels[stage]}
    </span>
  );
};
