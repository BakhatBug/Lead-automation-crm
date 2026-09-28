import React, { useState } from 'react';
import { api } from '../../api/index.js';
import { X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                Module 1 Feature
              </span>
              <h2 className="text-lg font-bold text-slate-900">Smart CSV / XLSX Ingestion Wizard</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Auto-mapping, deduplication, ICP scoring & SQLite database storage
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 my-4 rounded-xl border border-slate-200 text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
            <span className="h-5 w-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-bold">1</span>
            Upload / Raw CSV
          </div>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
            <span className="h-5 w-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-bold">2</span>
            Column Auto-Mapping
          </div>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
            <span className="h-5 w-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-bold">3</span>
            Validation & ICP Preview
          </div>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
            <span className="h-5 w-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-bold">4</span>
            Import Complete
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Input CSV */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Paste CSV Data or Edit Sample Below:
              </label>
              <button
                onClick={() => setCsvText(SAMPLE_CSV)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Reset to Sample CSV
              </button>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              placeholder="First Name,Last Name,Email,Company,Job Title..."
            />
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Supports standard comma-separated rows with quotes</span>
              <span>{csvText.split('\n').filter((l) => l.trim()).length - 1} rows detected</span>
            </div>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
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
                  <label className="text-xs font-semibold text-slate-700 flex justify-between">
                    <span>{label}</span>
                    {required && <span className="text-[10px] text-rose-600 font-bold">Required</span>}
                  </label>
                  <select
                    value={mapping[field] || ''}
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
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
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Previewing first 5 rows with mapped schema:</span>
              <span className="font-bold text-slate-900">{totalRows} total leads to import</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-semibold">Name</th>
                    <th className="p-2.5 font-semibold">Email</th>
                    <th className="p-2.5 font-semibold">Company</th>
                    <th className="p-2.5 font-semibold">Title</th>
                    <th className="p-2.5 font-semibold">Est. ICP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-900">
                        {r[mapping.firstName]} {r[mapping.lastName]}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{r[mapping.email]}</td>
                      <td className="p-2.5 text-slate-700">{r[mapping.company]}</td>
                      <td className="p-2.5 text-slate-500">{r[mapping.title]}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          HIGH FIT
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Hygiene Filters Active:
              </div>
              <p>• Duplicate emails will be skipped automatically.</p>
              <p>• Contacts on the global suppression list will be excluded.</p>
              <p>• Each lead receives a transparent 0-100 ICP score calculated and stored in SQLite.</p>
            </div>
          </div>
        )}

        {/* Step 4: Import Complete */}
        {step === 4 && importResult && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-6">
            <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Import Complete!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Successfully processed and saved your CSV file into SQLite database
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 w-full max-w-lg mt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-bold text-emerald-700">{importResult.importedCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Imported</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-bold text-amber-700">{importResult.duplicates}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Duplicates</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-bold text-rose-700">{importResult.suppressed}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Suppressed</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-bold text-slate-600">{importResult.invalidEmails}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Invalid Email</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              {step === 4 ? 'Close' : 'Cancel'}
            </button>

            {step === 1 && (
              <button
                onClick={handleParsePreview}
                disabled={loading || !csvText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Parse & Auto-Map Columns'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!mapping.email || !mapping.company}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Review Cleaned Data
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleExecuteImport}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                {loading ? 'Saving to SQLite...' : `Confirm Import (${totalRows} Leads)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
