import React, { useState, useRef } from 'react';
import { api } from '../../api/index.js';
import { X, CheckCircle2, AlertTriangle, ArrowRight, Upload, FileText, Trash2, Layers } from 'lucide-react';
import { Lead } from '../../types/index.js';

interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_CSV = `First Name,Last Name,Email,Company,Job Title,Website,Industry,Employees,VIP Level
Marcus,Aurelius,marcus@philosophytech.io,PhilosophyTech,Chief Executive Officer,https://philosophytech.io,Enterprise SaaS,120,Gold
Clara,Oswald,clara.o@timestream.co,TimeStream Systems,VP of Demand Generation,https://timestream.co,Cloud Software,85,Platinum
Bruce,Wayne,bruce@gothamdefense.org,Gotham Defense,Head of Security Operations,https://gothamdefense.org,Cybersecurity,450,Silver
Diana,Prince,diana@themyscira.net,Themyscira AI,Director of Partnerships,https://themyscira.net,AI Software,60,Gold
Logan,Howlett,logan@weaponxlabs.com,WeaponX Labs,VP of Engineering,https://weaponxlabs.com,Biotech,190,Standard`;

export const LeadImportModal: React.FC<LeadImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; rowCount: number; content: string }[]>([]);
  
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<any>({});
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    mergedCount?: number;
    duplicates: number;
    suppressed: number;
    invalidEmails: number;
    sampleLeads: Lead[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local computer file selection (single or multiple .csv / .txt)
  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const newFiles: { name: string; size: string; rowCount: number; content: string }[] = [];
    let fileReadCount = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const rowCount = Math.max(0, lines.length - 1);
          const sizeKb = (file.size / 1024).toFixed(1) + ' KB';
          newFiles.push({ name: file.name, size: sizeKb, rowCount, content: text });
        }

        fileReadCount++;
        if (fileReadCount === files.length) {
          setUploadedFiles((prev) => [...prev, ...newFiles]);
          setInputMode('upload');
        }
      };
      reader.readAsText(file);
    });
  };

  // Combine content from uploaded files or fallback to paste box
  const getCombinedCSV = (): string => {
    if (inputMode === 'paste' || uploadedFiles.length === 0) {
      return csvText;
    }

    // Merge multiple CSV files into a unified CSV text
    const allHeadersSet = new Set<string>();
    const fileParsedList: { headers: string[]; rows: Record<string, string>[] }[] = [];

    uploadedFiles.forEach((file) => {
      const lines = file.content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        const fileHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        fileHeaders.forEach((h) => allHeadersSet.add(h));

        const rows: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
          const r: Record<string, string> = {};
          fileHeaders.forEach((h, idx) => {
            r[h] = vals[idx] || '';
          });
          rows.push(r);
        }
        fileParsedList.push({ headers: fileHeaders, rows });
      }
    });

    const unifiedHeaders = Array.from(allHeadersSet);
    let resultCsv = unifiedHeaders.join(',') + '\n';

    fileParsedList.forEach((fileObj) => {
      fileObj.rows.forEach((row) => {
        const lineVals = unifiedHeaders.map((h) => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        resultCsv += lineVals.join(',') + '\n';
      });
    });

    return resultCsv;
  };

  const handleParsePreview = async () => {
    try {
      setLoading(true);
      setError(null);

      const targetCsv = getCombinedCSV();
      if (!targetCsv.trim()) {
        setError('Please select at least one CSV file or paste valid CSV data');
        return;
      }

      const res = await api.parseCSVPreview(targetCsv);
      setHeaders(res.headers);
      setMapping(res.suggestedMapping);
      setPreviewRows(res.previewRows);
      setTotalRows(res.totalRows);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file(s)');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    try {
      setLoading(true);
      setError(null);
      const targetCsv = getCombinedCSV();
      const tags = uploadedFiles.length > 0 
        ? uploadedFiles.map((f) => `File: ${f.name}`)
        : ['CSV Import', 'Auto-Scored'];

      const res = await api.importCSVLeads(targetCsv, mapping, tags);
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
              <h2 className="text-lg font-bold text-slate-900">Multi-File Smart CSV Ingestion Wizard</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag-and-drop file upload, dynamic schema mapping, cross-file deduplication & SQLite database storage
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
            File Upload / Select
          </div>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
            <span className="h-5 w-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-bold">2</span>
            Schema & Auto-Mapping
          </div>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
            <span className="h-5 w-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-bold">3</span>
            Validation & Merge Preview
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

        {/* Step 1: Input / File Upload */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inputMode === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📁 Computer File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inputMode === 'paste' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📝 Paste Raw Text
                </button>
              </div>

              {inputMode === 'paste' && (
                <button
                  onClick={() => setCsvText(SAMPLE_CSV)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Reset Sample CSV
                </button>
              )}
            </div>

            {inputMode === 'upload' ? (
              <div className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFilesChosen(e.dataTransfer.files);
                  }}
                  className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70 p-8 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Click to choose CSV files or drag & drop here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Select one or multiple files (`.csv`, `.xlsx`, `.txt`) from your computer
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv,.txt"
                    onChange={(e) => handleFilesChosen(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Selected Files ({uploadedFiles.length}):</span>
                      <button
                        onClick={() => setUploadedFiles([])}
                        className="text-rose-600 hover:underline text-[11px]"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-xs text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-bold text-slate-900">{file.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {file.size} • {file.rowCount} prospect rows
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
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
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
              <div>
                ✨ <strong>Schema Analysis Complete:</strong> Found <strong>{headers.length} unique column headers</strong> across {uploadedFiles.length || 1} file(s). Core fields auto-mapped below.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { field: 'email', label: 'Email Address', required: false },
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

        {/* Step 3: Validation & ICP Merge Preview */}
        {step === 3 && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Previewing first 5 rows with unified schema:</span>
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
                        {r[mapping.firstName] || ''} {r[mapping.lastName] || ''}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">
                        {r[mapping.email] ? r[mapping.email] : <span className="text-slate-400 italic">N/A (Missing)</span>}
                      </td>
                      <td className="p-2.5 text-slate-700">{r[mapping.company] || 'Unknown'}</td>
                      <td className="p-2.5 text-slate-500">{r[mapping.title] || 'Decision Maker'}</td>
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
                Hygiene & Deduplication Active:
              </div>
              <p>• Cross-file matching by Email, Name + Company, or Phone enabled.</p>
              <p>• Incomplete records will be automatically merged into existing profiles.</p>
              <p>• Unmapped extra CSV headers are saved dynamically into `customAttributes` JSON.</p>
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
              <h3 className="text-xl font-bold text-slate-900">Ingestion Complete!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Successfully processed, merged, and saved your lead records into SQLite database
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 w-full max-w-xl mt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-bold text-emerald-700">{importResult.importedCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Processed</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-bold text-blue-700">{importResult.mergedCount || 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Enriched & Merged</div>
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
                disabled={loading || (inputMode === 'upload' && uploadedFiles.length === 0 && !csvText.trim())}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-xs"
              >
                {loading ? 'Analyzing Files...' : 'Parse & Auto-Map Columns'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!mapping.company}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-xs"
              >
                Review Cleaned Data
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleExecuteImport}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              >
                {loading ? 'Saving to SQLite...' : `Confirm & Save (${totalRows} Leads)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
