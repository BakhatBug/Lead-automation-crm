import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import {
  Mailbox,
  DispatchStrategy,
  DispatchSimulationResult,
} from '../../types/index.js';
import {
  Shuffle,
  Scale,
  Flame,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Send,
  Calendar,
} from 'lucide-react';

interface DispatchSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailboxes: Mailbox[];
  onDispatched?: () => void;
}

export const DispatchSimulatorModal: React.FC<DispatchSimulatorModalProps> = ({
  isOpen,
  onClose,
  mailboxes,
  onDispatched,
}) => {
  const [batchSize, setBatchSize] = useState<number>(60);
  const [strategy, setStrategy] = useState<DispatchStrategy>('ROUND_ROBIN');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [minDelay, setMinDelay] = useState<number>(60);
  const [maxDelay, setMaxDelay] = useState<number>(180);
  const [simulation, setSimulation] = useState<DispatchSimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [executeMessage, setExecuteMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALLOCATIONS' | 'TIMELINE'>('ALLOCATIONS');

  useEffect(() => {
    if (isOpen && mailboxes.length > 0) {
      // Default select all non-disconnected mailboxes
      const activeIds = mailboxes.filter((m) => m.status !== 'DISCONNECTED').map((m) => m.id);
      setSelectedIds(activeIds);
      runSimulation(batchSize, strategy, activeIds);
      setExecuteMessage(null);
    }
  }, [isOpen, mailboxes]);

  if (!isOpen) return null;

  const runSimulation = async (
    targetBatch: number = batchSize,
    targetStrategy: DispatchStrategy = strategy,
    targetIds: string[] = selectedIds
  ) => {
    try {
      setLoading(true);
      const res = await api.simulateMailboxDispatch({
        batchSize: targetBatch,
        strategy: targetStrategy,
        selectedMailboxIds: targetIds,
        minDelaySec: minDelay,
        maxDelaySec: maxDelay,
      });
      setSimulation(res.result);
    } catch (err: any) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyChange = (newStrategy: DispatchStrategy) => {
    setStrategy(newStrategy);
    runSimulation(batchSize, newStrategy, selectedIds);
  };

  const handleBatchSizeChange = (newSize: number) => {
    setBatchSize(newSize);
    runSimulation(newSize, strategy, selectedIds);
  };

  const toggleMailboxSelection = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
    if (next.length > 0) {
      runSimulation(batchSize, strategy, next);
    }
  };

  const handleExecuteDispatch = async () => {
    try {
      setExecuting(true);
      const res = await api.executeMailboxDispatch({
        batchSize,
        strategy,
        selectedMailboxIds: selectedIds,
      });

      setExecuteMessage(res.message);
      if (onDispatched) onDispatched();
      // Refresh simulation with new updated usage counts
      setTimeout(() => {
        runSimulation(batchSize, strategy, selectedIds);
      }, 500);
    } catch (err: any) {
      console.error('Execution failed:', err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <Shuffle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Round-Robin Mailbox Pool & Dispatch Simulator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                  Load Balancer
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Rotate outbound campaign volume across multiple inboxes with randomized delay jitter to protect domain reputations
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
        {executeMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{executeMessage}</span>
            </div>
            <button
              onClick={() => setExecuteMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-[11px] underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls: Batch Size & Strategy Selector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Batch Size input */}
            <div className="md:col-span-5 p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Campaign Batch Size</span>
                <span className="text-sm font-extrabold text-blue-600 font-mono">
                  {batchSize} emails
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={batchSize}
                onChange={(e) => handleBatchSizeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="flex items-center gap-1.5 pt-1">
                {[30, 60, 100, 150, 200].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleBatchSizeChange(num)}
                    className={`flex-1 py-1 rounded text-[11px] font-bold border transition-all ${
                      batchSize === num
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Pacing Jitter Settings */}
            <div className="md:col-span-7 p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-600" />
                  Anti-Spam Human Delay Jitter
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {minDelay}s – {maxDelay}s / send
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Randomized delays between consecutive sends prevent email service providers (Google/Outlook)
                from detecting robotic burst patterns.
              </p>
              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600">
                  <span>Min:</span>
                  <input
                    type="number"
                    min="30"
                    max="120"
                    value={minDelay}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMinDelay(val);
                      runSimulation(batchSize, strategy, selectedIds);
                    }}
                    className="w-16 px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                  />
                  <span>sec</span>
                </label>

                <label className="flex items-center gap-2 text-slate-600">
                  <span>Max:</span>
                  <input
                    type="number"
                    min="90"
                    max="300"
                    value={maxDelay}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMaxDelay(val);
                      runSimulation(batchSize, strategy, selectedIds);
                    }}
                    className="w-16 px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                  />
                  <span>sec</span>
                </label>
              </div>
            </div>
          </div>

          {/* Strategy Selector Cards */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Dispatch Routing Algorithm</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Round Robin */}
              <div
                onClick={() => handleStrategyChange('ROUND_ROBIN')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  strategy === 'ROUND_ROBIN'
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded bg-blue-100 text-blue-700">
                    <Shuffle className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Sequential Round-Robin</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Rotates evenly across inboxes (Box 1 &rarr; Box 2 &rarr; Box 3), distributing traffic uniformly.
                </p>
              </div>

              {/* Least Utilized */}
              <div
                onClick={() => handleStrategyChange('LEAST_UTILIZED')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  strategy === 'LEAST_UTILIZED'
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded bg-indigo-100 text-indigo-700">
                    <Scale className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Least-Utilized (Quota Balancing)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Prioritizes mailboxes with the highest remaining quota today, evening out total send usage.
                </p>
              </div>

              {/* Warm-Up Weighted */}
              <div
                onClick={() => handleStrategyChange('WARMUP_WEIGHTED')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  strategy === 'WARMUP_WEIGHTED'
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded bg-orange-100 text-orange-600">
                    <Flame className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Warm-Up Weighted Priority</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Sends larger share through 100% warmed inboxes and throttles younger domains still ramping up.
                </p>
              </div>
            </div>
          </div>

          {/* Active Mailbox Pool Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Active Mailbox Pool ({selectedIds.length} Inboxes Selected)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Click an inbox to include/exclude from dispatch
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mailboxes.map((box) => {
                const isSelected = selectedIds.includes(box.id);
                const remaining = Math.max(0, box.dailySendLimit - box.sentToday);

                return (
                  <div
                    key={box.id}
                    onClick={() => toggleMailboxSelection(box.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-50 border-blue-300 ring-1 ring-blue-200'
                        : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="overflow-hidden mr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                          {box.provider}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate block">
                          {box.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{box.email}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 block">Quota Left</span>
                      <span
                        className={`text-xs font-bold font-mono ${
                          remaining > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {remaining} / {box.dailySendLimit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulation Output Dashboard */}
          {simulation && (
            <div className="space-y-4 pt-2">
              {/* Output metric chips */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                  <span className="text-[10px] font-bold uppercase text-blue-600 block mb-0.5">
                    Total Dispatched
                  </span>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {simulation.totalAllocated} / {simulation.totalRequested}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {simulation.overflowUnallocated > 0
                      ? `${simulation.overflowUnallocated} overflow unallocated`
                      : '100% capacity accommodated'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                    Estimated Duration
                  </span>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    ~{simulation.estimatedDurationMinutes} mins
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Spaced across business hours
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                    Average Jitter Delay
                  </span>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {simulation.averageDelaySec} sec / email
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Randomized variance</div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-0.5">
                    Domain Health Guard
                  </span>
                  <div className="text-lg font-black text-emerald-700 flex items-center gap-1.5">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Active</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    Daily safety caps enforced
                  </div>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveTab('ALLOCATIONS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'ALLOCATIONS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Mailbox Allocation & Quotas
                </button>
                <button
                  onClick={() => setActiveTab('TIMELINE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'TIMELINE'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Send Schedule & Jitter Timeline Preview
                </button>
              </div>

              {/* Tab 1: Allocations View */}
              {activeTab === 'ALLOCATIONS' && (
                <div className="space-y-3">
                  {simulation.allocations.map((alloc) => (
                    <div
                      key={alloc.mailboxId}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {alloc.provider}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{alloc.mailboxName}</span>
                          <span className="text-xs text-slate-500 font-mono">({alloc.email})</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {alloc.quotaExhausted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Daily Cap Reached
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-800 font-mono">
                            <strong className="text-blue-600">+{alloc.allocatedCount}</strong> assigned &bull; Total:{' '}
                            {alloc.endingSentToday} / {alloc.dailySendLimit}
                          </span>
                        </div>
                      </div>

                      {/* Multi-segmented quota bar */}
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex">
                        {/* Previously sent today */}
                        <div
                          style={{
                            width: `${(alloc.startingSentToday / alloc.dailySendLimit) * 100}%`,
                          }}
                          className="bg-slate-400 h-full"
                          title={`Previously sent: ${alloc.startingSentToday}`}
                        />
                        {/* New allocated in this batch */}
                        <div
                          style={{
                            width: `${(alloc.allocatedCount / alloc.dailySendLimit) * 100}%`,
                          }}
                          className="bg-blue-600 h-full"
                          title={`Assigned in this batch: ${alloc.allocatedCount}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Timeline View */}
              {activeTab === 'TIMELINE' && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Sequence Preview (First 50 Emails with Randomized Human Delays)</span>
                    <span className="font-mono">Paced between {minDelay}s and {maxDelay}s</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {simulation.scheduleTimeline.map((item) => (
                      <div
                        key={item.index}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs font-mono border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 w-6">#{item.index}</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                            {item.provider}
                          </span>
                          <span className="text-slate-800 font-semibold">{item.mailboxEmail}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[11px]">{item.scheduledAtFormatted}</span>
                          <span className="text-blue-600 text-[11px] font-bold">
                            +{item.delayFromPreviousSec}s delay
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Deliverability Engine Analysis
                </span>
                <ul className="text-xs text-slate-700 space-y-1 pl-5 list-disc">
                  {simulation.insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div className="text-[11px] text-slate-500 font-mono">
            {selectedIds.length === 0 ? (
              <span className="text-rose-600 font-bold">Select at least 1 mailbox</span>
            ) : (
              <span>Ready to dispatch {batchSize} leads across {selectedIds.length} inboxes</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runSimulation(batchSize, strategy, selectedIds)}
              disabled={loading || executing || selectedIds.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? 'Re-calculating...' : '⚡ Re-calculate'}
            </button>

            <button
              onClick={handleExecuteDispatch}
              disabled={loading || executing || selectedIds.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {executing ? 'Executing Batch...' : 'Execute Test Dispatch Batch'}
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
