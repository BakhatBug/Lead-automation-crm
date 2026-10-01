import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { Mailbox, BlacklistScanResult } from '../../types/index.js';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
  Globe,
  Radio,
  Server,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface BlacklistMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailbox: Mailbox | null;
  onUpdated: () => void;
}

export const BlacklistMonitorModal: React.FC<BlacklistMonitorModalProps> = ({
  isOpen,
  onClose,
  mailbox,
  onUpdated,
}) => {
  const [scanResult, setScanResult] = useState<BlacklistScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && mailbox) {
      handleRunScan(false);
    } else {
      setScanResult(null);
      setError(null);
    }
  }, [isOpen, mailbox?.id]);

  if (!isOpen || !mailbox) return null;

  const handleRunScan = async (simulate: boolean = false) => {
    try {
      if (simulate) setSimulating(true);
      else setScanning(true);
      setError(null);

      const res = await api.scanMailboxBlacklists(mailbox.id, simulate);
      setScanResult(res.result);
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to scan DNSBL blacklists');
    } finally {
      setScanning(false);
      setSimulating(false);
    }
  };

  const domain = mailbox.email.split('@')[1] || 'domain.com';
  const overallStatus = scanResult?.overallStatus || mailbox.blacklistStatus || 'CLEAN';
  const reputationScore = scanResult?.reputationScore ?? 100;
  const isBlacklisted = overallStatus === 'BLACKLISTED';
  const isWarning = overallStatus === 'WARNING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`p-6 border-b flex items-start justify-between ${
          isBlacklisted
            ? 'bg-gradient-to-r from-rose-50 via-rose-50/40 to-white border-rose-200'
            : isWarning
            ? 'bg-gradient-to-r from-amber-50 via-amber-50/40 to-white border-amber-200'
            : 'bg-gradient-to-r from-emerald-50/60 via-blue-50/40 to-white border-slate-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shadow-sm ${
              isBlacklisted
                ? 'bg-rose-100 text-rose-700'
                : isWarning
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isBlacklisted ? <ShieldAlert className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isBlacklisted
                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : isWarning
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {isBlacklisted
                    ? '🚨 BLACKLISTED (DELISTING REQUIRED)'
                    : isWarning
                    ? '⚠️ REPUTATION WARNING'
                    : '✅ CLEAN (ZERO LISTINGS)'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {mailbox.provider}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-Time Domain & IP Blacklist Monitor</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                <span>{mailbox.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Server className="h-3 w-3 text-slate-400" />
                  IP: {scanResult?.ipAddress || 'Resolving...'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Scan Error</h4>
                <p className="mt-0.5 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Top Scorecard Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1: Reputation Score */}
            <div className={`p-4 rounded-2xl border ${
              reputationScore >= 90
                ? 'bg-emerald-50/70 border-emerald-200'
                : reputationScore >= 70
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-rose-50/70 border-rose-200'
            }`}>
              <div className="text-[11px] font-semibold text-slate-500">Deliverability Reputation</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-2xl font-black font-mono ${
                  reputationScore >= 90
                    ? 'text-emerald-700'
                    : reputationScore >= 70
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}>
                  {reputationScore}
                </span>
                <span className="text-[11px] font-mono text-slate-400">/ 100</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {reputationScore >= 90
                  ? 'Pristine inbox placement'
                  : reputationScore >= 70
                  ? 'Moderate risk of junk folder'
                  : 'Critical deliverability penalty'}
              </div>
            </div>

            {/* Metric 2: Monitored Lists */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="text-[11px] font-semibold text-slate-500">Global DNSBL Networks</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-mono text-slate-900">
                  {scanResult?.totalChecked ?? 8}
                </span>
                <span className="text-[11px] font-mono text-slate-400">Checked Live</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Spamhaus, Barracuda, SpamCop, SORBS</div>
            </div>

            {/* Metric 3: Active Listings */}
            <div className={`p-4 rounded-2xl border ${
              (scanResult?.listedCount || 0) > 0
                ? 'bg-rose-50 border-rose-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="text-[11px] font-semibold text-slate-500">Active Blocklist Listings</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-2xl font-black font-mono ${
                  (scanResult?.listedCount || 0) > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {scanResult?.listedCount ?? 0}
                </span>
                <span className="text-[11px] font-mono text-slate-400">Listings Detected</span>
              </div>
              <div className={`text-[10px] mt-1 ${
                (scanResult?.listedCount || 0) > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-700'
              }`}>
                {(scanResult?.listedCount || 0) > 0 ? 'Delisting required' : 'Zero listings detected'}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70">
            <div>
              <div className="font-bold text-slate-800 text-xs">DNSBL Reputation Scanner</div>
              <div className="text-[11px] text-slate-500">
                Last Scanned: {scanResult?.scannedAt ? new Date(scanResult.scannedAt).toLocaleTimeString() : 'Never'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRunScan(false)}
                disabled={scanning || simulating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${scanning ? 'animate-spin' : ''}`} />
                <span>{scanning ? 'Querying DNSBLs...' : 'Scan All Blacklists'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunScan(true)}
                disabled={scanning || simulating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all cursor-pointer disabled:opacity-50"
                title="Simulate listing on SpamCop/SORBS to test delisting workflow"
              >
                <Zap className="h-3.5 w-3.5 text-amber-600" />
                <span>Simulate Blacklist Hit</span>
              </button>
            </div>
          </div>

          {/* Blacklist Listing Alert Banner if detected */}
          {isBlacklisted && (
            <div className="p-4 rounded-2xl border border-rose-300 bg-rose-50/90 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900 text-sm">Critical Deliverability Alert: Active Blacklist Listing</h4>
                  <p className="text-rose-700 text-xs leading-relaxed mt-0.5">
                    Your domain <code>{domain}</code> or sending IP is listed on high-severity anti-spam blacklists.
                    Receiving mail servers (including Google Workspace and Microsoft 365) may reject outgoing messages with RFC 554 errors.
                  </p>
                  <p className="text-[11px] text-rose-600 font-medium pt-1">
                    👉 Click the <strong>Delist Request</strong> links below to open official removal forms.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DNSBL Provider Table / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Monitored Global RBL / DNSBL Zones</span>
              <span className="text-[11px] font-mono text-slate-500">
                {scanResult?.checks ? `${scanResult.checks.length} zones checked` : 'Awaiting scan'}
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
              {scanning ? (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
                  <div className="font-bold text-slate-700 text-xs">Querying Global DNSBL Root Servers...</div>
                  <div className="text-[11px] text-slate-400 font-mono">Resolving reversed IP & domain hashes</div>
                </div>
              ) : scanResult?.checks && scanResult.checks.length > 0 ? (
                scanResult.checks.map((check, idx) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{check.providerName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {check.type}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          check.isListed
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {check.isListed ? '🚨 LISTED' : '✅ CLEAN'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-xl leading-relaxed">
                        {check.description}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400">
                        Query: {check.host} {check.listedCode ? `→ Returned: ${check.listedCode}` : '→ NXDOMAIN'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {check.isListed && check.delistUrl && (
                        <a
                          href={check.delistUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                        >
                          <span>Delist Request</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {!check.isListed && (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Not Listed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No scan data available. Click "Scan All Blacklists" above.
                </div>
              )}
            </div>
          </div>

          {/* Educational Best Practices Box */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>How Anti-Spam Gateways Use DNSBL Checks</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <li>
                <strong>Spamhaus ZEN & Barracuda</strong> are queried in real time by over 80% of Fortune 500 mail servers before accepting SMTP handshakes.
              </li>
              <li>
                <strong>Common Listing Causes:</strong> High bounce rates (&gt; 3%), spam trap hits (sending to recycled or honeypot emails), or aggressive burst sending without human pacing jitter.
              </li>
              <li>
                <strong>Automated Delisting:</strong> Most tier-1 blocklists allow 1-click self-service delisting once send volume is paused and recipient lists are scrubbed.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <div className="text-[11px] text-slate-500 font-mono">
            DNSBL Protocol: RFC 5782 Compliant Lookup
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
