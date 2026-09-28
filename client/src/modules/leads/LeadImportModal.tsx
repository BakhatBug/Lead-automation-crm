import React, { useState } from 'react';
import { api } from '../../api/index.js';
import { X, Upload, CheckCircle2, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { Lead } from '../../types/index.js';

interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_CSV = `First Name,Last Name,Email,Company,Job Title,Website,Industry,Employees
Marcus,Aurelius,marcus@philosophytech.io,PhilosophyTech,Chief Executive Officer,https://philosophytech.io,Enterprise SaaS,120
Clara,Oswald,clara.o@timestream.co,TimeStream Systems,VP of Demand Generation,https://timestream.co,Cloud Software,85
Bruce,Wayne,bruce@gothamdefense.org,Gotham Defense,Head of Security Operations,https://gothamdefense.org,Cybersecurity,450
Diana,Prince,diana@themyscira.net,Themyscira AI,Director of Partnerships,https://themyscira.net,AI Software,60
Logan,Howlett,logan@weaponxlabs.com,WeaponX Labs,VP of Engineering,https://weaponxlabs.com,Biotech,190`;

export const LeadImportModal: React.FC<LeadImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<any>({});
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    duplicates: number;
    suppressed: number;
    invalidEmails: number;
    sampleLeads: Lead[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParsePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.parseCSVPreview(csvText);
      setHeaders(res.headers);
      setMapping(res.suggestedMapping);
      setPreviewRows(res.previewRows);
      setTotalRows(res.totalRows);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.importCSVLeads(csvText, mapping, ['CSV Import', 'Auto-Scored']);
      setImportResult(res);
      setStep(4);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to import leads');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Module 1 Feature
              </span>
              <h2 className="text-lg font-bold text-white">Smart CSV / XLSX Ingestion Wizard</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Auto-mapping, deduplication, ICP scoring & suppression checks
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 my-4 rounded-xl border border-slate-800/80 text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-400 font-semibold' : 'text-slate-500'}`}>
            <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            Upload / Raw CSV
          </div>
          <ArrowRight className="h-3 w-3 text-slate-600" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-400 font-semibold' : 'text-slate-500'}`}>
            <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            Column Auto-Mapping
          </div>
          <ArrowRight className="h-3 w-3 text-slate-600" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-400 font-semibold' : 'text-slate-500'}`}>
            <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            Validation & ICP Preview
          </div>
          <ArrowRight className="h-3 w-3 text-slate-600" />
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
            <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">4</span>
            Import Complete
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Input CSV */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Paste CSV Data or Edit Sample Below:
              </label>
              <button
                onClick={() => setCsvText(SAMPLE_CSV)}
                className="text-xs text-indigo-400 hover:underline"
              >
                Load Pre-Configured Sample CSV
              </button>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              placeholder="First Name,Last Name,Email,Company,Job Title..."
            />
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Supports comma-separated rows with standard quotation marks</span>
              <span>{csvText.split('\n').filter((l) => l.trim()).length - 1} rows detected</span>
            </div>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
              ✨ Auto-Detection Complete: We analyzed {headers.length} headers and mapped them to core CRM entities. Verify or adjust below.
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { field: 'email', label: 'Email Address *', required: true },
                { field: 'firstName', label: 'First Name', required: true },
                { field: 'lastName', label: 'Last Name', required: false },
                { field: 'company', label: 'Company / Organization *', required: true },
                { field: 'title', label: 'Job Title', required: false },
                { field: 'website', label: 'Company Website / Domain', required: false },
                { field: 'industry', label: 'Industry Vertical', required: false },
                { field: 'employeeCount', label: 'Employee Headcount', required: false },
              ].map(({ field, label, required }) => (
                <div key={field} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex justify-between">
                    <span>{label}</span>
                    {required && <span className="text-[10px] text-rose-400">Required</span>}
                  </label>
                  <select
                    value={mapping[field] || ''}
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Do Not Map --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        Column: {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Validation Preview */}
        {step === 3 && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Previewing first 5 rows with mapped schema:</span>
              <span className="font-semibold text-white">{totalRows} total leads to import</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Company</th>
                    <th className="p-2.5">Title</th>
                    <th className="p-2.5">Est. ICP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                  {previewRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-medium text-white">
                        {r[mapping.firstName]} {r[mapping.lastName]}
                      </td>
                      <td className="p-2.5 font-mono text-slate-300">{r[mapping.email]}</td>
                      <td className="p-2.5 text-slate-300">{r[mapping.company]}</td>
                      <td className="p-2.5 text-slate-400">{r[mapping.title]}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          HIGH FIT
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Automatic Hygiene Filters Active:
              </div>
              <p>• Duplicate emails will be skipped automatically.</p>
              <p>• Email addresses on the global suppression list will be suppressed.</p>
              <p>• Each lead receives a transparent 0-100 ICP fit score based on seniority and sector.</p>
            </div>
          </div>
        )}

        {/* Step 4: Import Complete */}
        {step === 4 && importResult && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-6">
            <div className="h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Import Complete!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Successfully processed and cleaned your CSV file into the CRM
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 w-full max-w-lg mt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-lg font-bold text-emerald-400">{importResult.importedCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Imported</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-lg font-bold text-amber-400">{importResult.duplicates}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Duplicates</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-lg font-bold text-rose-400">{importResult.suppressed}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Suppressed</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-lg font-bold text-slate-400">{importResult.invalidEmails}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Invalid Email</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-900 border border-slate-800"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              {step === 4 ? 'Close' : 'Cancel'}
            </button>

            {step === 1 && (
              <button
                onClick={handleParsePreview}
                disabled={loading || !csvText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Parse & Auto-Map Columns'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!mapping.email || !mapping.company}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Review Cleaned Data
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleExecuteImport}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
              >
                {loading ? 'Importing & Scoring...' : `Confirm Import (${totalRows} Leads)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
