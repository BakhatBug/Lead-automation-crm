import { Request, Response } from 'express';
import { db } from '../../db/store.js';
import { AIService } from './ai.service.js';
import { Message } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class InboxController {
  // GET /api/conversations
  static getAllConversations(req: Request, res: Response) {
    try {
      const { intent, status, search } = req.query;
      let convs = db.getConversations();

      if (intent && typeof intent === 'string') {
        convs = convs.filter((c) => c.intent === intent);
      }
      if (status && typeof status === 'string') {
        convs = convs.filter((c) => c.status === status);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        convs = convs.filter(
          (c) =>
            c.contactName.toLowerCase().includes(q) ||
            c.contactEmail.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.subject.toLowerCase().includes(q)
        );
      }

      res.json({ success: true, count: convs.length, conversations: convs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/conversations/:id
  static getConversationById(req: Request, res: Response) {
    const conv = db.getConversationById(req.params.id as string);
    if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' });

    // Mark as read
    db.updateConversation(conv.id, { unread: false });

    res.json({ success: true, conversation: conv });
  }

  // POST /api/conversations/:id/reply
  static sendReply(req: Request, res: Response) {
    try {
      const conv = db.getConversationById(req.params.id as string);
      if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' });

      const { bodyText, subject } = req.body;
      if (!bodyText) return res.status(400).json({ success: false, error: 'bodyText is required' });

      const activeMailboxes = db.getMailboxes().filter((m) => m.status === 'HEALTHY');
      const mailbox = activeMailboxes[0] || db.getMailboxes()[0];
      const now = new Date().toISOString();

      const lastInbound = conv.messages.slice().reverse().find((m) => m.direction === 'INBOUND');

      const newMsg: Message = {
        id: `msg-${uuidv4().slice(0, 8)}`,
        conversationId: conv.id,
        mailboxId: mailbox.id,
        providerMessageId: `prov-${uuidv4().slice(0, 10)}`,
        threadId: conv.messages[0]?.threadId || `th-${uuidv4().slice(0, 10)}`,
        direction: 'OUTBOUND',
        fromEmail: mailbox.email,
        toEmail: conv.contactEmail,
        subject: subject || (conv.subject.startsWith('Re:') ? conv.subject : `Re: ${conv.subject}`),
        bodyText,
        inReplyTo: lastInbound?.rfcMessageId,
        timestamp: now,
      };

      db.addMessageToConversation(conv.id, newMsg);

      // Update conversation state to WAITING and clear unread
      db.updateConversation(conv.id, {
        status: 'WAITING',
        unread: false,
        lastActivityAt: now,
      });

      // Update mailbox send count
      db.updateMailbox(mailbox.id, {
        sentToday: mailbox.sentToday + 1,
        lastSyncAt: now,
      });

      db.addAuditLog({
        id: `audit-${uuidv4().slice(0, 8)}`,
        eventType: 'REPLY_SENT',
        entityType: 'Conversation',
        entityId: conv.id,
        description: `Sent reply to ${conv.contactName} (${conv.contactEmail}).`,
        actor: 'User',
        timestamp: now,
      });

      res.status(201).json({
        success: true,
        message: 'Reply sent successfully',
        conversation: db.getConversationById(conv.id),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/conversations/:id/reclassify
  static reclassifyConversation(req: Request, res: Response) {
    try {
      const conv = db.getConversationById(req.params.id as string);
      if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' });

      const lastInbound = conv.messages.slice().reverse().find((m) => m.direction === 'INBOUND');
      if (!lastInbound) {
        return res.status(400).json({ success: false, error: 'No inbound message found to classify' });
      }

      const classification = AIService.classifyReply(lastInbound.bodyText);
      const draft = AIService.generateDraftReply(
        lastInbound.bodyText,
        conv.contactName,
        conv.company,
        classification.intent
      );

      const updated = db.updateConversation(conv.id, {
        intent: classification.intent,
        intentConfidence: classification.confidence,
        intentReasoning: classification.reasoning,
        suggestedDraftReply: draft,
      });

      res.json({
        success: true,
        classification,
        conversation: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/conversations/:id/generate-draft
  static generateDraft(req: Request, res: Response) {
    try {
      const conv = db.getConversationById(req.params.id as string);
      if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' });

      const lastInbound = conv.messages.slice().reverse().find((m) => m.direction === 'INBOUND');
      const body = lastInbound ? lastInbound.bodyText : conv.subject;

      const draft = AIService.generateDraftReply(body, conv.contactName, conv.company, conv.intent);
      const updated = db.updateConversation(conv.id, { suggestedDraftReply: draft });

      res.json({ success: true, draft, conversation: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
