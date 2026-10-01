import { Request, Response } from 'express';
import { db } from '../../db/store.js';
import { Mailbox } from '../../types/index.js';
import { MailboxesService } from './mailboxes.service.js';
import { AIService } from '../inbox/ai.service.js';
import { v4 as uuidv4 } from 'uuid';

export class MailboxesController {
  // GET /api/mailboxes
  static getAllMailboxes(_req: Request, res: Response) {
    res.json({ success: true, mailboxes: db.getMailboxes() });
  }

  // GET /api/mailboxes/:id
  static getMailboxById(req: Request, res: Response) {
    const mailbox = db.getMailboxById(req.params.id as string);
    if (!mailbox) return res.status(404).json({ success: false, error: 'Mailbox not found' });
    res.json({ success: true, mailbox });
  }

  // GET /api/mailboxes/:id/health
  static getMailboxHealth(req: Request, res: Response) {
    const mailbox = db.getMailboxById(req.params.id as string);
    if (!mailbox) return res.status(404).json({ success: false, error: 'Mailbox not found' });

    const diagnostics = MailboxesService.checkMailboxHealth(mailbox);
    res.json({ success: true, diagnostics });
  }

  // GET /api/mailboxes/:id/dns
  static async getDnsDiagnostics(req: Request, res: Response) {
    try {
      const forceFix = req.query.fix === 'true';
      const result = await MailboxesService.diagnoseMailboxDns(req.params.id as string, forceFix);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(err.message.includes('not found') ? 404 : 500).json({ success: false, error: err.message });
    }
  }

  // POST /api/mailboxes/test-connection
  static async testMailboxConnection(req: Request, res: Response) {
    try {
      const { provider, email, smtpHost, smtpPort, imapHost, imapPort, username, password } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email address is required' });
      }

      const result = await MailboxesService.testConnectionHandshake({
        provider: provider || 'GOOGLE',
        email: email.trim().toLowerCase(),
        smtpHost,
        smtpPort: smtpPort ? Number(smtpPort) : undefined,
        imapHost,
        imapPort: imapPort ? Number(imapPort) : undefined,
        username,
        password,
      });

      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/mailboxes/connect
  static connectMailbox(req: Request, res: Response) {
    try {
      const {
        provider,
        email,
        name,
        dailySendLimit,
        smtpHost,
        smtpPort,
        imapHost,
        imapPort,
        username,
        useSsl,
      } = req.body;

      if (!provider || !email) {
        return res.status(400).json({ success: false, error: 'Provider and email are required' });
      }

      const mailboxId = `box-${uuidv4().slice(0, 8)}`;
      const newMailbox: Mailbox = {
        id: mailboxId,
        provider,
        email: email.trim().toLowerCase(),
        name: name || email,
        status: 'HEALTHY',
        dailySendLimit: dailySendLimit ? Number(dailySendLimit) : 40,
        sentToday: 0,
        warmUpProgress: 75,
        spfValid: true,
        dkimValid: true,
        dmarcValid: true,
        lastSyncAt: new Date().toISOString(),
        smtpHost: smtpHost || (provider === 'HOSTINGER' ? 'smtp.hostinger.com' : provider === 'ZOHO' ? 'smtppro.zoho.com' : undefined),
        smtpPort: smtpPort ? Number(smtpPort) : 465,
        imapHost: imapHost || (provider === 'HOSTINGER' ? 'imap.hostinger.com' : provider === 'ZOHO' ? 'imappro.zoho.com' : undefined),
        imapPort: imapPort ? Number(imapPort) : 993,
        username: username || email,
        useSsl: useSsl !== undefined ? Boolean(useSsl) : true,
      };

      db.addMailbox(newMailbox);

      db.addAuditLog({
        id: `audit-${uuidv4().slice(0, 8)}`,
        eventType: 'MAILBOX_CONNECTED',
        entityType: 'Mailbox',
        entityId: mailboxId,
        description: `Connected ${newMailbox.provider} mailbox: ${newMailbox.email}`,
        actor: 'User',
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({ success: true, mailbox: newMailbox });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/mailboxes/webhook/simulate-reply
  static simulateIncomingReply(req: Request, res: Response) {
    try {
      const { fromEmail, fromName, subject, bodyText, mailboxId } = req.body;
      if (!fromEmail || !bodyText) {
        return res.status(400).json({ success: false, error: 'fromEmail and bodyText are required' });
      }

      const targetMailbox = mailboxId ? db.getMailboxById(mailboxId) : db.getMailboxes()[0];
      if (!targetMailbox) {
        return res.status(400).json({ success: false, error: 'No active mailbox found' });
      }

      // 1. Process inbound message via MailboxesService
      const { conversation, message } = MailboxesService.processInboundEmailWebhook({
        mailboxId: targetMailbox.id,
        fromEmail,
        fromName,
        toEmail: targetMailbox.email,
        subject: subject || 'Re: Partnership Inquiry',
        bodyText,
      });

      // 2. Automatically trigger AI classification and grounded draft generation
      const classification = AIService.classifyReply(bodyText);
      const draft = AIService.generateDraftReply(bodyText, conversation.contactName, conversation.company, classification.intent);

      db.updateConversation(conversation.id, {
        intent: classification.intent,
        intentConfidence: classification.confidence,
        intentReasoning: classification.reasoning,
        suggestedDraftReply: draft,
      });

      // 3. Stop sequence if interested or unsubscribed
      if (classification.intent === 'UNSUBSCRIBE') {
        db.addSuppression({
          id: `sup-${uuidv4().slice(0, 8)}`,
          email: fromEmail,
          reason: 'UNSUBSCRIBE',
          source: 'AI Reply Classification',
          createdAt: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        message: 'Inbound email received and processed via AI classification pipeline',
        conversation: db.getConversationById(conversation.id),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // PATCH /api/mailboxes/:id
  static updateMailbox(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = db.updateMailbox(id as string, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Mailbox not found' });
      }
      res.json({ success: true, mailbox: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/mailboxes/dispatch-pool/simulate
  static simulateDispatchPool(req: Request, res: Response) {
    try {
      const { batchSize, strategy, selectedMailboxIds, minDelaySec, maxDelaySec } = req.body;
      const result = MailboxesService.simulateDispatchPool({
        batchSize: Number(batchSize) || 50,
        strategy,
        selectedMailboxIds,
        minDelaySec: minDelaySec ? Number(minDelaySec) : undefined,
        maxDelaySec: maxDelaySec ? Number(maxDelaySec) : undefined,
      });
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // POST /api/mailboxes/dispatch-pool/execute
  static executeDispatchBatch(req: Request, res: Response) {
    try {
      const { batchSize, strategy, selectedMailboxIds } = req.body;
      const result = MailboxesService.executeDispatchBatch({
        batchSize: Number(batchSize) || 50,
        strategy,
        selectedMailboxIds,
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // POST /api/mailboxes/:id/bounce
  static recordBounce(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { bouncedEmail, rfcCode, reason } = req.body;
      const result = MailboxesService.recordBounce(id as string, {
        bouncedEmail,
        rfcCode,
        reason,
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(err.message.includes('not found') ? 404 : 400).json({ success: false, error: err.message });
    }
  }

  // POST /api/mailboxes/:id/quarantine/reset
  static resetQuarantine(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = MailboxesService.resetQuarantine(id as string);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(err.message.includes('not found') ? 404 : 400).json({ success: false, error: err.message });
    }
  }

  // POST /api/mailboxes/:id/blacklists/scan
  static async scanBlacklists(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { simulateListing } = req.body;
      const result = await MailboxesService.scanMailboxBlacklists(id as string, Boolean(simulateListing));
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(err.message.includes('not found') ? 404 : 500).json({ success: false, error: err.message });
    }
  }
}
