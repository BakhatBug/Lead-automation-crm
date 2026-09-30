import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { Mailbox } from '../../types/index.js';
import { ConnectMailboxModal } from './ConnectMailboxModal.js';
import { SimulateReplyModal } from './SimulateReplyModal.js';
import { DnsInspectorModal } from './DnsInspectorModal.js';
import { WarmUpSettingsModal } from './WarmUpSettingsModal.js';
import { DispatchSimulatorModal } from './DispatchSimulatorModal.js';
import {
  MailCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Flame,
  Shuffle,
} from 'lucide-react';

export const MailboxesView: React.FC = () => {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [selectedDnsMailbox, setSelectedDnsMailbox] = useState<Mailbox | null>(null);
  const [isDnsInspectorOpen, setIsDnsInspectorOpen] = useState(false);
  const [selectedWarmupMailbox, setSelectedWarmupMailbox] = useState<Mailbox | null>(null);
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [isDispatchSimulatorOpen, setIsDispatchSimulatorOpen] = useState(false);

  useEffect(() => {
    loadMailboxes();
  }, []);

  const loadMailboxes = async () => {
    try {
      setLoading(true);
      const data = await api.getMailboxes();
      setMailboxes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Mailboxes & Deliverability Infrastructure</h2>
          <p className="text-xs text-slate-500">
            Connected Google Workspace and Microsoft 365 inboxes, DNS authentication & quota monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDispatchSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all shadow-sm"
          >
            <Shuffle className="h-4 w-4 text-indigo-600" />
            Pool Dispatch Simulator
          </button>

          <button
            onClick={() => {
              setSelectedWarmupMailbox(mailboxes[0] || null);
              setIsWarmupOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-all shadow-sm"
          >
            <Flame className="h-4 w-4 text-orange-600" />
            30-Day Ramp Scheduler
          </button>

          <button
            onClick={() => setIsSimulateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            Simulate Inbound Webhook
          </button>

          <button
            onClick={() => setIsConnectOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Connect Business Mailbox
          </button>
        </div>
      </div>

      {/* Deliverability Advisory Card */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Automated Sender Reputation Protection</h4>
            <p className="text-slate-600 leading-relaxed max-w-3xl">
              Per Google and Yahoo bulk-sender mandates, each connected mailbox is strictly rate-limited
              (recommended 35–50 sends/day) and automatically throttled. All outgoing messages include valid RFC
              headers and unsubscribe tags to safeguard domain deliverability.
            </p>
          </div>
        </div>
      </div>

      {/* Mailbox Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400 font-medium">
            Loading mailbox status...
          </div>
        ) : (
          mailboxes.map((box) => (
            <div
              key={box.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 transition-all hover:border-slate-300 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {box.provider === 'HOSTINGER'
                        ? '🟣 Hostinger Mail'
                        : box.provider === 'ZOHO'
                        ? '🟡 Zoho Mail'
                        : box.provider === 'GOOGLE'
                        ? '🇬 Google Workspace'
                        : box.provider === 'MICROSOFT'
                        ? 'Ⓜ️ Microsoft 365'
                        : '⚙️ Custom SMTP'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {box.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{box.name}</h3>
                  <div className="text-xs font-mono text-slate-500">{box.email}</div>
                </div>

                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                  <MailCheck className="h-5 w-5" />
                </div>
              </div>

              {/* Sending Quota */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-semibold">Daily Outbound Quota</span>
                  <span className="font-mono text-slate-800">
                    <strong className="text-blue-600">{box.sentToday}</strong> / {box.dailySendLimit} emails
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (box.sentToday / box.dailySendLimit) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Warm-up progress */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">Mailbox Warm-Up Health</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedWarmupMailbox(box);
                        setIsWarmupOpen(true);
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-800 transition-colors"
                      title="Configure 30-day warmup ramp schedule"
                    >
                      <Flame className="h-3 w-3" />
                      <span>Ramp Schedule</span>
                    </button>
                    <span className="font-mono text-emerald-600 font-bold">{box.warmUpProgress}%</span>
                  </div>
                </div>
                <div
                  onClick={() => {
                    setSelectedWarmupMailbox(box);
                    setIsWarmupOpen(true);
                  }}
                  className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 cursor-pointer hover:border-orange-300 transition-all"
                  title="Click to configure warm-up ramp schedule"
                >
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${box.warmUpProgress}%` }}
                  />
                </div>
              </div>

              {/* DNS Authentication Status */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    DNS Deliverability Verification
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDnsMailbox(box);
                      setIsDnsInspectorOpen(true);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>Inspect DNS</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setSelectedDnsMailbox(box);
                      setIsDnsInspectorOpen(true);
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-center transition-all cursor-pointer group"
                    title="Click to inspect SPF record"
                  >
                    <div className="text-[10px] text-slate-500 group-hover:text-blue-600 font-bold font-mono">SPF</div>
                    <div className={`text-xs font-bold mt-0.5 ${box.spfValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {box.spfValid ? 'Valid' : 'Action Req'}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDnsMailbox(box);
                      setIsDnsInspectorOpen(true);
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-center transition-all cursor-pointer group"
                    title="Click to inspect DKIM record"
                  >
                    <div className="text-[10px] text-slate-500 group-hover:text-blue-600 font-bold font-mono">DKIM (2048)</div>
                    <div className={`text-xs font-bold mt-0.5 ${box.dkimValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {box.dkimValid ? 'Valid' : 'Action Req'}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDnsMailbox(box);
                      setIsDnsInspectorOpen(true);
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-center transition-all cursor-pointer group"
                    title="Click to inspect DMARC policy"
                  >
                    <div className="text-[10px] text-slate-500 group-hover:text-blue-600 font-bold font-mono">DMARC</div>
                    <div className={`text-xs font-bold mt-0.5 ${box.dmarcValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {box.dmarcValid ? 'Enforced' : 'None / Missing'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Dedicated Card Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedWarmupMailbox(box);
                    setIsWarmupOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-all shadow-xs cursor-pointer"
                >
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span>30-Day Ramp Scheduler</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDnsMailbox(box);
                    setIsDnsInspectorOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all shadow-xs cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span>Inspect DNS Records</span>
                </button>
              </div>

              {/* Sync Timestamp */}
              <div className="pt-1 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span className="font-semibold text-slate-600">{box.smtpHost ? `SMTP: ${box.smtpHost}:${box.smtpPort || 465}` : 'OAuth 2.0 Protocol'}</span>
                <span>Last Synced: {new Date(box.lastSyncAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <ConnectMailboxModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onSuccess={loadMailboxes}
      />

      <SimulateReplyModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSuccess={loadMailboxes}
        mailboxes={mailboxes}
      />

      <DnsInspectorModal
        isOpen={isDnsInspectorOpen}
        onClose={() => setIsDnsInspectorOpen(false)}
        mailbox={selectedDnsMailbox}
        onUpdated={loadMailboxes}
      />

      <WarmUpSettingsModal
        isOpen={isWarmupOpen}
        onClose={() => setIsWarmupOpen(false)}
        mailbox={selectedWarmupMailbox}
        onSuccess={loadMailboxes}
      />

      <DispatchSimulatorModal
        isOpen={isDispatchSimulatorOpen}
        onClose={() => setIsDispatchSimulatorOpen(false)}
        mailboxes={mailboxes}
        onDispatched={loadMailboxes}
      />
    </div>
  );
};
