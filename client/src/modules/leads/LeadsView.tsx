import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { Lead } from '../../types/index.js';
import { StatusBadge } from '../../components/Badge.js';
import { LeadImportModal } from './LeadImportModal.js';
import { LeadDetailDrawer } from './LeadDetailDrawer.js';
import { SuppressionListModal } from './SuppressionListModal.js';
import { Search, Upload, ShieldCheck, ChevronRight } from 'lucide-react';

interface LeadsViewProps {
  onOpenConvertModal?: (lead: Lead) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onOpenConvertModal }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSuppressionOpen, setIsSuppressionOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [selectedStatus, search]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: search.trim() || undefined,
      });
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuppress = async (email: string) => {
    try {
      await api.addSuppression({ email, reason: 'MANUAL' });
      await api.updateLead(activeLead!.id, { status: 'UNSUBSCRIBED' });
      setActiveLead(null);
      loadLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leads & Account Intelligence</h2>
          <p className="text-xs text-slate-500">
            {leads.length} verified prospect records with transparent scoring from SQLite database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSuppressionOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs"
          >
            <ShieldCheck className="h-4 w-4 text-rose-500" />
            Suppression List
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all"
          >
            <Upload className="h-4 w-4" />
            Import CSV Leads
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prospect, company, title..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1">
          {['ALL', 'NEW', 'ACTIVE', 'REPLIED', 'QUALIFIED', 'WON', 'UNSUBSCRIBED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All Leads' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold">Prospect</th>
              <th className="py-3 px-4 font-semibold">Title & Role</th>
              <th className="py-3 px-4 font-semibold">Company / Sector</th>
              <th className="py-3 px-4 font-semibold">ICP Score</th>
              <th className="py-3 px-4 font-semibold">State</th>
              <th className="py-3 px-4 font-semibold">Campaign</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Loading lead intelligence from SQLite...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No prospects matching criteria. Try importing a CSV or adjusting filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setActiveLead(lead)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-all group"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">{lead.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{lead.title}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-900 font-medium">{lead.company}</div>
                    <div className="text-[11px] text-slate-500">{lead.industry || 'Technology'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(
                        lead.score
                      )}`}
                    >
                      {lead.score} / 100
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-[150px] truncate">
                    {lead.campaignName || <span className="text-slate-400">None</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-blue-600 hover:text-blue-700 text-xs font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Lead 360
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Import Modal */}
      <LeadImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => loadLeads()}
      />

      {/* Suppression List Modal */}
      <SuppressionListModal
        isOpen={isSuppressionOpen}
        onClose={() => setIsSuppressionOpen(false)}
      />

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        onConvertToDeal={(lead) => {
          if (onOpenConvertModal) onOpenConvertModal(lead);
          setActiveLead(null);
        }}
        onSuppressLead={handleSuppress}
      />
    </div>
  );
};
