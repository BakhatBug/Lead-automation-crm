import React from 'react';
import { Lead } from '../../types/index.js';
import { StatusBadge } from '../../components/Badge.js';
import { X, ExternalLink, Mail, Phone, Building2, Award, ShieldAlert, PlusCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={lead.status} />
                <span className="text-[11px] font-mono text-slate-500">ID: {lead.id}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {lead.firstName} {lead.lastName}
              </h2>
              <p className="text-sm text-blue-600 font-semibold">{lead.title}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{lead.company}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ICP Score 360 Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Transparent ICP Score
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-blue-600">{lead.score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Industry / Sector Fit</span>
                  <span className="font-semibold text-slate-900">{lead.scoreBreakdown?.icpFit ?? 30} / 35</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${((lead.scoreBreakdown?.icpFit ?? 30) / 35) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Title & Decision Authority</span>
                  <span className="font-semibold text-slate-900">{lead.scoreBreakdown?.titleSeniority ?? 22} / 25</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${((lead.scoreBreakdown?.titleSeniority ?? 22) / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Company Headcount Scale</span>
                  <span className="font-semibold text-slate-900">{lead.scoreBreakdown?.companyScale ?? 18} / 20</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${((lead.scoreBreakdown?.companyScale ?? 18) / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Contact Data Completeness</span>
                  <span className="font-semibold text-slate-900">{lead.scoreBreakdown?.completeness ?? 15} / 20</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
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
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lead 360 Intelligence
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 flex items-center gap-2 font-medium">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Email
                </span>
                <span className="font-mono text-slate-800 font-semibold">{lead.email}</span>
              </div>

              {lead.phone && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone
                  </span>
                  <span className="font-mono text-slate-800">{lead.phone}</span>
                </div>
              )}

              {lead.website && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> Website
                  </span>
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    {lead.website.replace('https://', '')}
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Industry Sector</span>
                <span className="text-slate-800 font-semibold">{lead.industry || 'Technology / SaaS'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Estimated Employees</span>
                <span className="text-slate-800 font-medium">{lead.employeeCount || 50} reps / staff</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Active Campaign</span>
                <span className="text-blue-700 font-semibold truncate max-w-[200px]">
                  {lead.campaignName || 'Not Enrolled'}
                </span>
              </div>
            </div>
          </div>

          {/* Custom Attributes & Extended CSV Data */}
          {lead.customAttributes && Object.keys(lead.customAttributes).length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Custom CSV Attributes
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(lead.customAttributes).map(([key, val]) => (
                  <div key={key} className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/80">
                    <span className="font-semibold text-amber-900 block truncate">{key}</span>
                    <span className="text-slate-700 font-mono text-[11px] truncate block">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Account Notes:</span>
              <p className="text-slate-600 leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-200 space-y-2">
          <button
            onClick={() => onConvertToDeal(lead)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Create CRM Opportunity ($ Deal)
          </button>

          <button
            onClick={() => onSuppressLead(lead.email)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 font-semibold text-xs transition-all"
          >
            <ShieldAlert className="h-4 w-4" />
            Add to Suppression List (Do Not Contact)
          </button>
        </div>
      </div>
    </div>
  );
};
