import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { Mailbox, DnsDiagnosticResult, DnsRecordDetail } from '../../types/index.js';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  X,
  Server,
  Key,
  FileText,
  Radio,
  Sparkles,
} from 'lucide-react';

interface DnsInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailbox: Mailbox | null;
  onUpdated?: () => void;
}

type RegistrarType = 'HOSTINGER' | 'CLOUDFLARE' | 'GODADDY' | 'NAMECHEAP';

export const DnsInspectorModal: React.FC<DnsInspectorModalProps> = ({
  isOpen,
  onClose,
  mailbox,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DnsDiagnosticResult | null>(null);
  const [activeTab, setActiveTab] = useState<'RECORDS' | 'GUIDES'>('RECORDS');
  const [selectedRegistrar, setSelectedRegistrar] = useState<RegistrarType>('HOSTINGER');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && mailbox) {
      loadDnsDiagnostics();
    } else {
      setDiagnostics(null);
      setSuccessMessage(null);
    }
  }, [isOpen, mailbox]);

  if (!isOpen || !mailbox) return null;

  const loadDnsDiagnostics = async (forceFix: boolean = false) => {
    try {
      if (forceFix) setVerifying(true);
      else setLoading(true);

      const res = await api.getMailboxDnsDiagnostics(mailbox.id, forceFix);
      setDiagnostics(res.result);

      if (forceFix) {
        setSuccessMessage('DNS Handshake successful! Mailbox records validated and updated in database.');
        if (onUpdated) onUpdated();
      }
    } catch (err: any) {
      console.error('Failed to load DNS diagnostics:', err);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderRecordCard = (
    title: string,
    key: string,
    record?: DnsRecordDetail,
    icon?: React.ReactNode
  ) => {
    if (!record) return null;

    const isValid = record.status === 'VALID';
    const isWarning = record.status === 'WARNING';

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all space-y-3">
        {/* Record Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isValid ? 'bg-emerald-50 text-emerald-600' : isWarning ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
              {icon || <FileText className="h-4 w-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">{title}</h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {record.type}
                </span>
                {record.importance === 'CRITICAL' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                    Mandatory
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{record.description}</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
              isValid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isWarning
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isValid ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </>
            ) : isWarning ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                Review
              </>
            ) : (
              <>
                <ShieldAlert className="h-3 w-3" />
                Missing
              </>
            )}
          </span>
        </div>

        {/* Record Values with 1-click copy */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1 text-xs">
          {/* Host */}
          <div className="md:col-span-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
            <div className="overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Host / Name</span>
              <span className="font-mono text-slate-800 font-semibold truncate block" title={record.host}>
                {record.host}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(record.host, `${key}-host`)}
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all shrink-0 ml-1"
              title="Copy host name"
            >
              {copiedKey === `${key}-host` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Expected Value */}
          <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
            <div className="overflow-hidden w-full mr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Expected Record Value</span>
              <span className="font-mono text-slate-800 text-[11px] truncate block select-all" title={record.expectedValue}>
                {record.expectedValue}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(record.expectedValue, `${key}-val`)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shrink-0 shadow-xs"
              title="Copy record value"
            >
              {copiedKey === `${key}-val` ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">DNS Deliverability & Authentication Inspector</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                  {mailbox.provider === 'HOSTINGER'
                    ? '🟣 Hostinger Mail'
                    : mailbox.provider === 'ZOHO'
                    ? '🟡 Zoho Mail'
                    : mailbox.provider === 'GOOGLE'
                    ? '🇬 Google Workspace'
                    : mailbox.provider === 'MICROSOFT'
                    ? 'Ⓜ️ Microsoft 365'
                    : '⚙️ Custom SMTP'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {mailbox.name} &bull; <strong className="text-slate-700">{mailbox.email}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-[11px] underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Top Score & Mandate Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-4 border-blue-200 flex items-center justify-center bg-white shadow-xs">
                  <span className="text-lg font-black text-blue-700 font-mono">
                    {diagnostics ? `${diagnostics.overallScore}%` : '...'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deliverability Health</span>
                <h4 className="text-sm font-bold text-slate-900">
                  {diagnostics?.overallStatus === 'READY'
                    ? 'Inbox Placement: Optimal'
                    : diagnostics?.overallStatus === 'WARNING'
                    ? 'Inbox Placement: Moderate Risk'
                    : 'Inbox Placement: Spam Risk'}
                </h4>
                <p className="text-[11px] text-slate-600">
                  {diagnostics?.overallStatus === 'READY'
                    ? 'All security protocols passing RFC validation.'
                    : 'Missing DNS records may cause bounce or spam placement.'}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-center space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">2024–2026 Google & Yahoo Bulk Sender Compliance</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gmail and Yahoo require all outbound sending domains to implement <strong className="text-slate-800">SPF</strong>,{' '}
                <strong className="text-slate-800">DKIM</strong>, and an enforced <strong className="text-slate-800">DMARC policy</strong>.
                Domains without these records suffer up to an <strong className="text-rose-600">85% spam routing rate</strong>.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('RECORDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'RECORDS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              DNS Record Configuration
            </button>
            <button
              onClick={() => setActiveTab('GUIDES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'GUIDES'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Registrar Setup Guides (Hostinger, Cloudflare, GoDaddy)
            </button>
          </div>

          {/* Tab 1: Records View */}
          {activeTab === 'RECORDS' && (
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  Resolving domain DNS records...
                </div>
              ) : diagnostics ? (
                <>
                  {renderRecordCard(
                    'SPF (Sender Policy Framework)',
                    'spf',
                    diagnostics.records.spf,
                    <Server className="h-4 w-4 text-blue-600" />
                  )}

                  {renderRecordCard(
                    'DKIM (DomainKeys Identified Mail - 2048 Bit)',
                    'dkim',
                    diagnostics.records.dkim,
                    <Key className="h-4 w-4 text-emerald-600" />
                  )}

                  {renderRecordCard(
                    'DMARC (Domain-based Message Authentication)',
                    'dmarc',
                    diagnostics.records.dmarc,
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  )}

                  {renderRecordCard(
                    'MX (Mail Routing & Reply Capture)',
                    'mx',
                    diagnostics.records.mx,
                    <Radio className="h-4 w-4 text-amber-600" />
                  )}

                  {renderRecordCard(
                    'Custom Tracking CNAME (Zero Shared Pixel)',
                    'tracking',
                    diagnostics.records.trackingDomain,
                    <ExternalLink className="h-4 w-4 text-purple-600" />
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* Tab 2: Registrar Guides View */}
          {activeTab === 'GUIDES' && (
            <div className="space-y-4">
              {/* Registrar selector pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'HOSTINGER', label: 'Hostinger hPanel' },
                  { id: 'CLOUDFLARE', label: 'Cloudflare DNS' },
                  { id: 'GODADDY', label: 'GoDaddy' },
                  { id: 'NAMECHEAP', label: 'Namecheap' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedRegistrar(item.id as RegistrarType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedRegistrar === item.id
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Guide Contents */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 text-xs">
                {selectedRegistrar === 'HOSTINGER' && (
                  <>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>🟣 Setting up DNS records in Hostinger hPanel</span>
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-700 leading-relaxed">
                      <li>Log in to your <strong>Hostinger hPanel</strong> account.</li>
                      <li>Navigate to <strong>Domains</strong> &gt; Click <strong>Manage</strong> next to your domain.</li>
                      <li>In the left sidebar, click <strong>DNS / Nameservers</strong>.</li>
                      <li>
                        Under <strong>Manage DNS Records</strong>, select <strong>TXT</strong> from the Type dropdown.
                      </li>
                      <li>
                        <strong>SPF:</strong> Set Name as <code>@</code> and TXT Value to{' '}
                        <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-800">
                          {diagnostics?.records.spf.expectedValue || 'v=spf1 include:_spf.mail.hostinger.com ~all'}
                        </code>.
                      </li>
                      <li>
                        <strong>DKIM:</strong> Set Name as <code>hostingermail._domainkey</code> and paste your 2048-bit DKIM key into TXT Value.
                      </li>
                      <li>
                        <strong>DMARC:</strong> Set Name as <code>_dmarc</code> and TXT Value to{' '}
                        <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-800">
                          {diagnostics?.records.dmarc.expectedValue || 'v=DMARC1; p=quarantine;'}
                        </code>.
                      </li>
                      <li>Click <strong>Add Record</strong> and allow 10–30 minutes for DNS propagation worldwide.</li>
                    </ol>
                  </>
                )}

                {selectedRegistrar === 'CLOUDFLARE' && (
                  <>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>🟠 Setting up DNS records in Cloudflare</span>
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-700 leading-relaxed">
                      <li>Log in to your <strong>Cloudflare Dashboard</strong> and select your domain.</li>
                      <li>Navigate to <strong>DNS</strong> &gt; <strong>Records</strong> in the side menu.</li>
                      <li>Click <strong>Add Record</strong>.</li>
                      <li>Select Type <strong>TXT</strong>.</li>
                      <li>
                        For SPF, set Name as <code>@</code> and Content as your SPF value.
                      </li>
                      <li>
                        For DMARC, set Name as <code>_dmarc</code> and Content as your DMARC policy.
                      </li>
                      <li>
                        <strong>Important:</strong> For any mail or tracking CNAME records, make sure Proxy status is set to <strong>DNS only (Grey Cloud)</strong>, not Proxied (Orange Cloud).
                      </li>
                    </ol>
                  </>
                )}

                {selectedRegistrar === 'GODADDY' && (
                  <>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>🟢 Setting up DNS records in GoDaddy</span>
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-700 leading-relaxed">
                      <li>Log in to your <strong>GoDaddy Domain Portfolio</strong>.</li>
                      <li>Select your domain and click <strong>Manage DNS</strong>.</li>
                      <li>Click <strong>Add New Record</strong> and select <strong>TXT</strong>.</li>
                      <li>In the Name field, enter <code>@</code> for SPF, or <code>_dmarc</code> for DMARC.</li>
                      <li>In the Value field, paste the corresponding record value from the Records tab.</li>
                      <li>Set TTL to <strong>1/2 Hour</strong> (or default 1 Hour) and click <strong>Save</strong>.</li>
                    </ol>
                  </>
                )}

                {selectedRegistrar === 'NAMECHEAP' && (
                  <>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>🔴 Setting up DNS records in Namecheap</span>
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-700 leading-relaxed">
                      <li>Log in to your <strong>Namecheap Dashboard</strong>.</li>
                      <li>Find your domain in the <strong>Domain List</strong> and click <strong>Manage</strong>.</li>
                      <li>Switch to the <strong>Advanced DNS</strong> tab.</li>
                      <li>Click <strong>Add New Record</strong> and choose <strong>TXT Record</strong>.</li>
                      <li>Paste the Host and Value, set TTL to <strong>Automatic</strong>, and click the green checkmark.</li>
                    </ol>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div className="text-[11px] text-slate-500 font-mono">
            {diagnostics?.lastCheckedAt ? (
              <span>Last verified: {new Date(diagnostics.lastCheckedAt).toLocaleTimeString()}</span>
            ) : (
              <span>Awaiting diagnostic run</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadDnsDiagnostics(false)}
              disabled={loading || verifying}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              Re-query DNS
            </button>

            <button
              onClick={() => loadDnsDiagnostics(true)}
              disabled={loading || verifying}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50"
            >
              <Sparkles className={`h-3.5 w-3.5 ${verifying ? 'animate-spin' : ''}`} />
              {verifying ? 'Running Live Handshake...' : '⚡ Validate & Apply Handshake'}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
