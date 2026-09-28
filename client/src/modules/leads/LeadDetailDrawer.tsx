import React from 'react';
import { Lead } from '../../types/index.js';
import { StatusBadge } from '../../components/Badge.js';
import { X, ExternalLink, Mail, Phone, Building2, User, Award, ShieldAlert, PlusCircle } from 'lucide-react';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onConvertToDeal: (lead: Lead) => void;
  onSuppressLead: (email: string) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onConvertToDeal,
  onSuppressLead,
}) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={lead.status} />
                <span className="text-[10px] font-mono text-slate-500">ID: {lead.id}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {lead.firstName} {lead.lastName}
              </h2>
              <p className="text-sm text-indigo-400 font-medium">{lead.title}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                <span>{lead.company}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ICP Score 360 Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Transparent ICP Score
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-400">{lead.score}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Industry / Sector Fit</span>
                  <span className="font-mono text-slate-200">{lead.scoreBreakdown?.icpFit ?? 30} / 35</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${((lead.scoreBreakdown?.icpFit ?? 30) / 35) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Title & Decision Authority</span>
                  <span className="font-mono text-slate-200">{lead.scoreBreakdown?.titleSeniority ?? 22} / 25</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${((lead.scoreBreakdown?.titleSeniority ?? 22) / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Company Headcount Scale</span>
                  <span className="font-mono text-slate-200">{lead.scoreBreakdown?.companyScale ?? 18} / 20</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${((lead.scoreBreakdown?.companyScale ?? 18) / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Contact Data Completeness</span>
                  <span className="font-mono text-slate-200">{lead.scoreBreakdown?.completeness ?? 15} / 20</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${((lead.scoreBreakdown?.completeness ?? 15) / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Firmographics */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Lead 360 Intelligence
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" /> Email
                </span>
                <span className="font-mono text-slate-200">{lead.email}</span>
              </div>

              {lead.phone && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-500" /> Phone
                  </span>
                  <span className="font-mono text-slate-200">{lead.phone}</span>
                </div>
              )}

              {lead.website && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" /> Website
                  </span>
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {lead.website.replace('https://', '')}
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400">Industry Sector</span>
                <span className="text-slate-200">{lead.industry || 'Technology / SaaS'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400">Estimated Employees</span>
                <span className="text-slate-200 font-mono">{lead.employeeCount || 50} reps / staff</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400">Active Campaign</span>
                <span className="text-indigo-300 font-medium truncate max-w-[200px]">
                  {lead.campaignName || 'Not Enrolled'}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 block mb-1">Account Notes:</span>
              <p className="text-slate-400 leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button
            onClick={() => onConvertToDeal(lead)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Create CRM Opportunity ($ Deal)
          </button>

          <button
            onClick={() => onSuppressLead(lead.email)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 font-medium text-xs transition-all"
          >
            <ShieldAlert className="h-4 w-4" />
            Add to Suppression List (Do Not Contact)
          </button>
        </div>
      </div>
    </div>
  );
};
