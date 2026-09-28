import React from 'react';
import { ReplyIntent, LeadStatus, DealStage } from '../types/index.js';

export const IntentBadge: React.FC<{ intent: ReplyIntent }> = ({ intent }) => {
  const styles: Record<ReplyIntent, string> = {
    INTERESTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEETING_REQUEST: 'bg-blue-50 text-blue-700 border-blue-300 font-semibold',
    PRICING_REQUEST: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    QUESTION: 'bg-amber-50 text-amber-700 border-amber-200',
    OBJECTION: 'bg-orange-50 text-orange-700 border-orange-200',
    NOT_NOW: 'bg-slate-100 text-slate-700 border-slate-200',
    NOT_INTERESTED: 'bg-rose-50 text-rose-700 border-rose-200',
    OUT_OF_OFFICE: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    UNSUBSCRIBE: 'bg-red-50 text-red-700 border-red-200',
    BOUNCE: 'bg-red-100 text-red-800 border-red-200',
    UNKNOWN: 'bg-slate-100 text-slate-600 border-slate-200',
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
    NEW: 'bg-slate-100 text-slate-700 border-slate-200',
    ENROLLED: 'bg-blue-50 text-blue-700 border-blue-200',
    ACTIVE: 'bg-sky-50 text-sky-700 border-sky-200',
    REPLIED: 'bg-amber-50 text-amber-700 border-amber-200',
    QUALIFIED: 'bg-teal-50 text-teal-700 border-teal-200',
    MEETING_BOOKED: 'bg-blue-100 text-blue-800 border-blue-300 font-medium',
    OPPORTUNITY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    WON: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    LOST: 'bg-rose-50 text-rose-700 border-rose-200',
    UNSUBSCRIBED: 'bg-red-50 text-red-700 border-red-200',
    BOUNCED: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border font-medium ${styles[status]}`}>
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
    NEW_DISCOVERED: 'bg-slate-100 text-slate-700 border-slate-200',
    CONTACTED: 'bg-blue-50 text-blue-700 border-blue-200',
    ENGAGED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    QUALIFIED: 'bg-teal-50 text-teal-700 border-teal-200',
    MEETING_SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-300 font-semibold',
    PROPOSAL: 'bg-amber-50 text-amber-700 border-amber-200',
    WON: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    LOST: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border ${colors[stage]}`}>
      {labels[stage]}
    </span>
  );
};
