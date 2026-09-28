import React, { useState, useEffect } from 'react';
import { api } from '../../api/index.js';
import { Conversation } from '../../types/index.js';
import { IntentBadge } from '../../components/Badge.js';
import {
  Send,
  Sparkles,
  RefreshCw,
  Search,
  Calendar,
} from 'lucide-react';

interface InboxViewProps {
  onBookMeetingForLead?: (leadId: string, name: string, email: string, company: string) => void;
  onConvertDealForLead?: (leadId: string, name: string, company: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  onBookMeetingForLead,
  onConvertDealForLead,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [activeIntentFilter, setActiveIntentFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Reply Composer state
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [activeIntentFilter]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations({
        intent: activeIntentFilter === 'ALL' ? undefined : activeIntentFilter,
      });
      setConversations(data);
      if (data.length > 0 && !selectedConvId) {
        setSelectedConvId(data[0].id);
        if (data[0].suggestedDraftReply) {
          setReplyText(data[0].suggestedDraftReply);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSelectConv = (conv: Conversation) => {
    setSelectedConvId(conv.id);
    setReplyText(conv.suggestedDraftReply || '');
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;

    try {
      setIsSending(true);
      const updated = await api.sendReply(selectedConversation.id, replyText.trim());
      setReplyText('');
      setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleReclassify = async () => {
    if (!selectedConversation) return;

    try {
      setIsClassifying(true);
      const res = await api.reclassifyConversation(selectedConversation.id);
      setConversations((prev) => prev.map((c) => (c.id === res.conversation.id ? res.conversation : c)));
      if (res.conversation.suggestedDraftReply) {
        setReplyText(res.conversation.suggestedDraftReply);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reclassify');
    } finally {
      setIsClassifying(false);
    }
  };

  const intentFilters: { id: string; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All Conversations' },
    { id: 'MEETING_REQUEST', label: '📅 Meeting Requests' },
    { id: 'PRICING_REQUEST', label: '💰 Pricing Inquiries' },
    { id: 'INTERESTED', label: '✨ Positive Interest' },
    { id: 'OBJECTION', label: '🛡️ Objections' },
    { id: 'OUT_OF_OFFICE', label: '🏖️ Out of Office' },
    { id: 'UNSUBSCRIBE', label: '🛑 Opt-Outs' },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-white">
      {/* Column 1: Left Rail Filters */}
      <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-slate-50/70 p-3 space-y-1 select-none flex flex-col justify-between">
        <div className="space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Smart Reply Folders
          </div>
          {intentFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveIntentFilter(f.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeIntentFilter === f.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* AI Classifier info */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-blue-600 font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            AI Guardrails Active
          </div>
          <p className="leading-snug text-slate-500">
            Autonomous drafting enabled with human review before final dispatch.
          </p>
        </div>
      </div>

      {/* Column 2: Conversation List */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search replies..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">Loading inbox...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">No conversations in this view.</div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConvId === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[170px]">
                      {conv.contactName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                      {new Date(conv.lastActivityAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium truncate mb-1.5">
                    {conv.company}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <IntentBadge intent={conv.intent} />
                    {conv.unread && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </div>

                  {lastMsg && (
                    <p className="text-[11px] text-slate-600 truncate mt-2 leading-tight">
                      {lastMsg.bodyText}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Column 3: Full Thread & AI Draft Workspace */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden">
          {/* Thread Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <IntentBadge intent={selectedConversation.intent} />
                <span className="text-xs font-mono text-emerald-600 font-semibold">
                  {Math.round((selectedConversation.intentConfidence || 0.95) * 100)}% Confidence
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-mono">{selectedConversation.contactEmail}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {selectedConversation.subject}
              </h2>
            </div>

            {/* Quick Actions for SDR */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReclassify}
                disabled={isClassifying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all disabled:opacity-50 shadow-sm"
                title="Rerun AI intent classification taxonomy on this thread"
              >
                <RefreshCw className={`h-3 w-3 ${isClassifying ? 'animate-spin' : ''}`} />
                Rerun AI
              </button>

              {onBookMeetingForLead && (
                <button
                  onClick={() =>
                    onBookMeetingForLead(
                      selectedConversation.leadId,
                      selectedConversation.contactName,
                      selectedConversation.contactEmail,
                      selectedConversation.company
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all shadow-sm"
                >
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  Book Meeting
                </button>
              )}

              {onConvertDealForLead && (
                <button
                  onClick={() =>
                    onConvertDealForLead(
                      selectedConversation.leadId,
                      selectedConversation.contactName,
                      selectedConversation.company
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                  Create Opportunity
                </button>
              )}
            </div>
          </div>

          {/* AI Reasoning Strip */}
          <div className="px-4 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
              <span className="font-bold text-blue-900">AI Intent Rationale:</span>
              <span className="text-slate-600">{selectedConversation.intentReasoning}</span>
            </div>
          </div>

          {/* Message Thread Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
            {selectedConversation.messages.map((msg) => {
              const isOutbound = msg.direction === 'OUTBOUND';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-500">
                      {isOutbound ? 'You (Outbound OS)' : selectedConversation.contactName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      isOutbound
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.bodyText}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grounded AI Reply Drafter & Composer */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Grounded AI Reply Assistant (Human-in-the-Loop)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Pre-filled via Knowledge Base
                </span>
              </div>

              {selectedConversation.suggestedDraftReply && (
                <button
                  type="button"
                  onClick={() => setReplyText(selectedConversation.suggestedDraftReply || '')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                >
                  Reset to AI Suggested Copy
                </button>
              )}
            </div>

            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Review, edit, or customize the response before sending..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white focus:outline-none font-sans leading-relaxed shadow-sm"
            />

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-500 font-medium">
                Responses are dispatched through the verified mailbox with full RFC In-Reply-To thread integrity.
              </p>

              <button
                onClick={handleSendReply}
                disabled={isSending || !replyText.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                {isSending ? 'Sending via Mailbox...' : 'Approve & Send Reply'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">
          Select a conversation from the list to view thread details.
        </div>
      )}
    </div>
  );
};
