import { db } from '../../db/store.js';
import { Mailbox, Message, Conversation, ReplyIntent } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class MailboxesService {
  // Deliverability Health Check
  static checkMailboxHealth(mailbox: Mailbox): {
    status: Mailbox['status'];
    healthScore: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let healthScore = 100;

    if (!mailbox.spfValid) {
      healthScore -= 30;
      issues.push('Missing or invalid SPF record in DNS');
      recommendations.push('Add "v=spf1 include:_spf.google.com ~all" to domain TXT records.');
    }

    if (!mailbox.dkimValid) {
      healthScore -= 30;
      issues.push('DKIM selector not verified');
      recommendations.push('Generate 2048-bit DKIM key in admin console and publish DNS TXT record.');
    }

    if (!mailbox.dmarcValid) {
      healthScore -= 20;
      issues.push('DMARC policy missing or p=none');
      recommendations.push('Configure DMARC policy with rua reporting to monitor deliverability.');
    }

    if (mailbox.warmUpProgress < 50) {
      healthScore -= 15;
      issues.push(`Mailbox is in early warm-up phase (${mailbox.warmUpProgress}%)`);
      recommendations.push('Keep daily sends under 25 emails until warm-up reaches 80%+.');
    }

    if (mailbox.sentToday >= mailbox.dailySendLimit) {
      healthScore -= 10;
      issues.push('Daily sending limit reached for today');
      recommendations.push('Sends paused until midnight UTC to protect sender reputation.');
    }

    let status: Mailbox['status'] = 'HEALTHY';
    if (healthScore < 50) status = 'DISCONNECTED';
    else if (healthScore < 85) status = 'WARNING';

    return {
      status,
      healthScore: Math.max(0, healthScore),
      issues,
      recommendations,
    };
  }

  // Handle incoming email webhook (from Gmail or MS Graph)
  static processInboundEmailWebhook(payload: {
    mailboxId: string;
    fromEmail: string;
    fromName?: string;
    toEmail: string;
    subject: string;
    bodyText: string;
    rfcMessageId?: string;
    inReplyTo?: string;
  }): { conversation: Conversation; message: Message } {
    const { mailboxId, fromEmail, fromName, toEmail, subject, bodyText, rfcMessageId, inReplyTo } = payload;
    const now = new Date().toISOString();

    // 1. Thread Resolver: Try to find existing conversation by contact email or thread ID
    let conversation = db.getConversations().find(
      (c) => c.contactEmail.toLowerCase() === fromEmail.toLowerCase()
    );

    let lead = db.getLeadByEmail(fromEmail);

    if (!lead) {
      // Create new lead record if first time contact
      const domain = fromEmail.split('@')[1] || '';
      const company = domain.split('.')[0].toUpperCase() || 'New Account';
      lead = db.addLead({
        id: `lead-${uuidv4().slice(0, 8)}`,
        firstName: fromName ? fromName.split(' ')[0] : 'Prospect',
        lastName: fromName && fromName.split(' ').length > 1 ? fromName.split(' ').slice(1).join(' ') : '',
        email: fromEmail,
        company,
        title: 'Prospect',
        score: 65,
        scoreBreakdown: { icpFit: 20, titleSeniority: 15, companyScale: 15, completeness: 15 },
        status: 'REPLIED',
        tags: ['Inbound Direct'],
        verifiedEmail: true,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Update lead state to REPLIED
      db.updateLead(lead.id, { status: 'REPLIED' });
    }

    const newMsgId = `msg-${uuidv4().slice(0, 8)}`;
    const newMsg: Message = {
      id: newMsgId,
      conversationId: conversation ? conversation.id : '',
      mailboxId,
      providerMessageId: `inb-prov-${uuidv4().slice(0, 10)}`,
      threadId: conversation?.messages[0]?.threadId || `th-${uuidv4().slice(0, 10)}`,
      direction: 'INBOUND',
      fromEmail,
      toEmail,
      subject,
      bodyText,
      rfcMessageId: rfcMessageId || `<${uuidv4()}@inbound.mail>`,
      inReplyTo,
      timestamp: now,
    };

    if (conversation) {
      newMsg.conversationId = conversation.id;
      db.addMessageToConversation(conversation.id, newMsg);
      db.updateConversation(conversation.id, {
        unread: true,
        status: 'NEEDS_REPLY',
        lastActivityAt: now,
      });
    } else {
      const convId = `conv-${uuidv4().slice(0, 8)}`;
      newMsg.conversationId = convId;
      conversation = db.addConversation({
        id: convId,
        leadId: lead.id,
        contactName: fromName || `${lead.firstName} ${lead.lastName}`.trim() || lead.company,
        contactEmail: fromEmail,
        company: lead.company,
        subject,
        intent: 'UNKNOWN',
        intentConfidence: 0,
        intentReasoning: 'New inbound message received. Awaiting AI classification.',
        status: 'NEEDS_REPLY',
        messages: [newMsg],
        lastActivityAt: now,
        unread: true,
      });
    }

    db.addAuditLog({
      id: `audit-${uuidv4().slice(0, 8)}`,
      eventType: 'INBOUND_MESSAGE_RECEIVED',
      entityType: 'Conversation',
      entityId: conversation.id,
      description: `Inbound email received from ${fromEmail} ("${subject}"). RFC thread resolved.`,
      actor: 'Mailbox Webhook Service',
      timestamp: now,
    });

    return { conversation, message: newMsg };
  }
}
