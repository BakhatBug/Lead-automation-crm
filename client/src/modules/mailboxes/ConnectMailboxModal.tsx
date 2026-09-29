import React, { useState } from 'react';
import { api } from '../../api/index.js';
import { MailboxProvider } from '../../types/index.js';
import { X, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Zap, ExternalLink } from 'lucide-react';

interface ConnectMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConnectMailboxModal: React.FC<ConnectMailboxModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [provider, setProvider] = useState<MailboxProvider>('GOOGLE');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [dailySendLimit, setDailySendLimit] = useState(40);

  // SMTP/IMAP Custom Fields
  const [smtpHost, setSmtpHost] = useState('smtp.hostinger.com');
  const [smtpPort, setSmtpPort] = useState(465);
  const [imapHost, setImapHost] = useState('imap.hostinger.com');
  const [imapPort, setImapPort] = useState(993);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [useSsl, setUseSsl] = useState(true);

  // Test Connection Handshake State
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    smtpStatus: string;
    imapStatus: string;
    latencyMs: number;
    spfStatus: string;
    dkimStatus: string;
    dmarcStatus: string;
    message: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-fill presets based on provider
  const handleSelectProvider = (p: MailboxProvider) => {
    setProvider(p);
    setTestResult(null);
    setError(null);

    if (p === 'HOSTINGER') {
      setSmtpHost('smtp.hostinger.com');
      setSmtpPort(465);
      setImapHost('imap.hostinger.com');
      setImapPort(993);
      setUseSsl(true);
    } else if (p === 'ZOHO') {
      setSmtpHost('smtppro.zoho.com');
      setSmtpPort(465);
      setImapHost('imappro.zoho.com');
      setImapPort(993);
      setUseSsl(true);
    } else if (p === 'CUSTOM_SMTP') {
      const domain = email.includes('@') ? email.split('@')[1] : 'yourdomain.com';
      setSmtpHost(`mail.${domain}`);
      setSmtpPort(465);
      setImapHost(`mail.${domain}`);
      setImapPort(993);
      setUseSsl(true);
    }
  };

  const handleTestConnection = async () => {
    if (!email.trim()) {
      setError('Please provide an email address first.');
      return;
    }

    try {
      setTestingConnection(true);
      setError(null);
      const res = await api.testMailboxConnection({
        provider,
        email: email.trim(),
        smtpHost,
        smtpPort,
        imapHost,
        imapPort,
        username: username || email,
        password,
      });

      if (res.result) {
        setTestResult(res.result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to establish connection handshake.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.connectMailbox({
        provider,
        email: email.trim(),
        name: name.trim() || email,
        dailySendLimit,
        smtpHost: provider !== 'GOOGLE' && provider !== 'MICROSOFT' ? smtpHost : undefined,
        smtpPort: provider !== 'GOOGLE' && provider !== 'MICROSOFT' ? smtpPort : undefined,
        imapHost: provider !== 'GOOGLE' && provider !== 'MICROSOFT' ? imapHost : undefined,
        imapPort: provider !== 'GOOGLE' && provider !== 'MICROSOFT' ? imapPort : undefined,
        username: username || email,
        useSsl,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect mailbox');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Module 3 • Multi-Provider Hub
              </span>
              <h2 className="text-base font-bold text-slate-900">Connect Business Mailbox</h2>
            </div>
            <p className="text-xs text-slate-500">Google Workspace, Microsoft 365, Hostinger, Zoho & Custom SMTP</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
          {/* Provider Selection Cards */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Choose Mailbox Provider</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectProvider('GOOGLE')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
                  provider === 'GOOGLE'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-base">🇬 Google</span>
                <span className="text-[10px] text-slate-400 font-normal">Workspace OAuth</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectProvider('MICROSOFT')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
                  provider === 'MICROSOFT'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-base">Ⓜ️ Microsoft</span>
                <span className="text-[10px] text-slate-400 font-normal">365 / Outlook</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectProvider('HOSTINGER')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
                  provider === 'HOSTINGER'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-base">🟣 Hostinger</span>
                <span className="text-[10px] text-slate-400 font-normal">SMTP/IMAP Auto</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectProvider('ZOHO')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
                  provider === 'ZOHO'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-base">🟡 Zoho Mail</span>
                <span className="text-[10px] text-slate-400 font-normal">Workplace SMTP</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectProvider('CUSTOM_SMTP')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all shadow-sm col-span-2 sm:col-span-2 ${
                  provider === 'CUSTOM_SMTP'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-base">⚙️ Custom SMTP / IMAP</span>
                <span className="text-[10px] text-slate-400 font-normal">cPanel, Namecheap, Private Mail Server</span>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Display / Rep Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Business Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@yourcompany.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm font-mono"
              />
            </div>
          </div>

          {/* Conditional: OAuth Notice for Google / Microsoft */}
          {(provider === 'GOOGLE' || provider === 'MICROSOFT') && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                1-Click Enterprise OAuth 2.0
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                No passwords required. Outbound emails and reply synchronization use official{' '}
                {provider === 'GOOGLE' ? 'Google Gmail REST API' : 'Microsoft Graph API'} with automated token refresh.
              </p>
            </div>
          )}

          {/* Conditional: SMTP / IMAP Configuration for Hostinger, Zoho, Custom */}
          {provider !== 'GOOGLE' && provider !== 'MICROSOFT' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {provider === 'HOSTINGER'
                    ? 'Hostinger Mail Configuration'
                    : provider === 'ZOHO'
                    ? 'Zoho Mail Configuration'
                    : 'Custom SMTP & IMAP Credentials'}
                </span>
                <span className="text-[10px] font-mono text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  SSL/TLS Port 465 & 993
                </span>
              </div>

              {/* Password / App Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Mailbox App Password *</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {provider === 'HOSTINGER' ? 'Hostinger Webmail Password' : 'Generated App Password'}
                  </span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm font-mono"
                />
              </div>

              {/* Host and Ports */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">SMTP Host (Send)</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">IMAP Host (Receive)</label>
                  <input
                    type="text"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">IMAP Port</label>
                  <input
                    type="number"
                    value={imapPort}
                    onChange={(e) => setImapPort(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Daily Quota Slider */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex justify-between">
              <span>Daily Sending Quota</span>
              <span className="text-blue-600 font-mono font-bold">{dailySendLimit} / day</span>
            </label>
            <input
              type="range"
              min={15}
              max={100}
              step={5}
              value={dailySendLimit}
              onChange={(e) => setDailySendLimit(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Recommended: 35–50 sends/day per inbox to avoid provider rate limiting and spam flagging.
            </p>
          </div>

          {/* Test Handshake Section */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection || !email.trim()}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all shadow-sm disabled:opacity-50"
            >
              <Zap className={`h-3.5 w-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              {testingConnection ? 'Testing SMTP & IMAP Handshake...' : '⚡ Test Connection & DNS Records'}
            </button>

            {testResult && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Handshake Verified!
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600">{testResult.latencyMs}ms latency</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 pt-1">
                  <div>SMTP Send: <span className="font-bold text-emerald-700">{testResult.smtpStatus}</span></div>
                  <div>IMAP Sync: <span className="font-bold text-emerald-700">{testResult.imapStatus}</span></div>
                  <div className="col-span-2 font-mono text-[10px] text-slate-500">{testResult.spfStatus}</div>
                  <div className="col-span-2 font-mono text-[10px] text-slate-500">{testResult.dkimStatus}</div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-all"
          >
            {loading ? 'Authorizing...' : 'Authorize & Connect Mailbox'}
          </button>
        </div>
      </div>
    </div>
  );
};
