import React from 'react';
import { SequenceStep } from '../../types/index.js';
import { Mail, Clock, GitBranch, Plus, Trash2, Split } from 'lucide-react';

interface SequenceTimelineEditorProps {
  steps: SequenceStep[];
  onChange: (steps: SequenceStep[]) => void;
  readonly?: boolean;
}

export const SequenceTimelineEditor: React.FC<SequenceTimelineEditorProps> = ({
  steps,
  onChange,
  readonly = false,
}) => {
  const addStep = (type: 'EMAIL' | 'WAIT' | 'CONDITION') => {
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      campaignId: '',
      stepNumber: steps.length + 1,
      type,
      delayDays: type === 'WAIT' ? 2 : 0,
      subject: type === 'EMAIL' ? 'Scaling outbound for {{company}}' : '',
      bodyTemplate:
        type === 'EMAIL'
          ? 'Hi {{firstName}},\n\nWanted to reach out regarding {{company}}...\n\nBest,\nYour Name'
          : '',
      conditionRules:
        type === 'CONDITION'
          ? {
              ifReplied: 'STOP_SEQUENCE',
              ifNoReplyDays: 3,
            }
          : undefined,
    };
    onChange([...steps, newStep]);
  };

  const updateStep = (index: number, updates: Partial<SequenceStep>) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    onChange(updated.map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  };

  return (
    <div className="space-y-4">
      <div className="relative pl-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
        {steps.map((step, idx) => (
          <div key={step.id || idx} className="relative mb-6 last:mb-0 group">
            {/* Step icon marker */}
            <div className="absolute -left-6 top-1.5 h-6 w-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shadow-md">
              {step.type === 'EMAIL' ? (
                <Mail className="h-3 w-3 text-indigo-400" />
              ) : step.type === 'WAIT' ? (
                <Clock className="h-3 w-3 text-amber-400" />
              ) : (
                <GitBranch className="h-3 w-3 text-teal-400" />
              )}
            </div>

            {/* Step Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-indigo-400">STEP {idx + 1}:</span>
                  <span className="text-xs font-semibold text-white">
                    {step.type === 'EMAIL'
                      ? 'Personalized Email Send'
                      : step.type === 'WAIT'
                      ? `Wait ${step.delayDays} Business Days`
                      : 'Conditional Branch & Stop Rule'}
                  </span>
                </div>

                {!readonly && steps.length > 1 && (
                  <button
                    onClick={() => removeStep(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Step Type Config */}
              {step.type === 'EMAIL' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Subject Line (Supports Tokens: {`{{firstName}}, {{company}}, {{title}}`})
                    </label>
                    <input
                      type="text"
                      disabled={readonly}
                      value={step.subject}
                      onChange={(e) => updateStep(idx, { subject: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Email Body Template
                    </label>
                    <textarea
                      rows={4}
                      disabled={readonly}
                      value={step.bodyTemplate}
                      onChange={(e) => updateStep(idx, { bodyTemplate: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-sans"
                    />
                  </div>

                  {/* A/B Testing Variant Toggle */}
                  {!readonly && (
                    <div className="pt-2">
                      {step.variantB ? (
                        <div className="p-3 bg-violet-950/20 border border-violet-800/40 rounded-lg space-y-2">
                          <div className="flex items-center justify-between text-xs text-violet-300 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <Split className="h-3.5 w-3.5 text-violet-400" />
                              Variant B (50% Traffic Split)
                            </span>
                            <button
                              onClick={() => updateStep(idx, { variantB: undefined })}
                              className="text-[10px] text-rose-400 hover:underline"
                            >
                              Remove Variant B
                            </button>
                          </div>
                          <input
                            type="text"
                            value={step.variantB.subject}
                            onChange={(e) =>
                              updateStep(idx, {
                                variantB: { ...step.variantB!, subject: e.target.value },
                              })
                            }
                            placeholder="Variant B Subject..."
                            className="w-full rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-white"
                          />
                          <textarea
                            rows={3}
                            value={step.variantB.bodyTemplate}
                            onChange={(e) =>
                              updateStep(idx, {
                                variantB: { ...step.variantB!, bodyTemplate: e.target.value },
                              })
                            }
                            placeholder="Variant B Body copy..."
                            className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            updateStep(idx, {
                              variantB: {
                                subject: `Quick question for {{firstName}}`,
                                bodyTemplate: `Hi {{firstName}},\n\nJust bumping this briefly...`,
                              },
                            })
                          }
                          className="text-[11px] text-violet-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add A/B Test Variant
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step.type === 'WAIT' && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">Delay before next sequence action:</span>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    disabled={readonly}
                    value={step.delayDays}
                    onChange={(e) => updateStep(idx, { delayDays: Number(e.target.value) })}
                    className="w-16 rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-center text-white"
                  />
                  <span className="text-slate-500">Business days (skips weekends)</span>
                </div>
              )}

              {step.type === 'CONDITION' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
                    <span className="font-semibold text-emerald-400">Automatic Stop Condition:</span> If any
                    reply, positive intent, meeting booking, or unsubscribe occurs, the lead is immediately
                    unenrolled and sequence halts.
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!readonly && (
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => addStep('EMAIL')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Email Touch
          </button>
          <button
            onClick={() => addStep('WAIT')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Wait Delay
          </button>
          <button
            onClick={() => addStep('CONDITION')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-400 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Branch / Stop Rule
          </button>
        </div>
      )}
    </div>
  );
};
