import { Campaign, Lead, SequenceStep, Message, Conversation } from '../../types/index.js';
import { db } from '../../db/store.js';
import { v4 as uuidv4 } from 'uuid';

export class SequenceEngine {
  // Replace template variables like {{firstName}}, {{company}}
  static interpolateTemplate(template: string, lead: Lead): string {
    return template
      .replace(/\{\{\s*firstName\s*\}\}/gi, lead.firstName || 'there')
      .replace(/\{\{\s*lastName\s*\}\}/gi, lead.lastName || '')
      .replace(/\{\{\s*company\s*\}\}/gi, lead.company || 'your company')
      .replace(/\{\{\s*title\s*\}\}/gi, lead.title || 'team')
      .replace(/\{\{\s*industry\s*\}\}/gi, lead.industry || 'software');
  }

  // Determine whether to use Variant A or Variant B for A/B testing
  static selectEmailVariant(step: SequenceStep, leadId: string): { subject: string; body: string; isVariantB: boolean } {
    if (!step.variantB || !step.variantB.subject) {
      return {
        subject: step.subject,
        body: step.bodyTemplate,
        isVariantB: false,
      };
    }

    // Deterministic 50/50 split based on lead ID hash
    const charCodeSum = leadId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const isVariantB = charCodeSum % 2 === 1;

    if (isVariantB) {
      return {
        subject: step.variantB.subject,
        body: step.variantB.bodyTemplate,
        isVariantB: true,
      };
    }

    return {
      subject: step.subject,
      body: step.bodyTemplate,
      isVariantB: false,
    };
  }

  // Execute Step 1 for an enrolled lead
  static executeInitialSend(campaign: Campaign, lead: Lead): { success: boolean; message?: Message; error?: string } {
    if (campaign.safetyKillSwitch || campaign.status !== 'ACTIVE') {
      return { success: false, error: 'Campaign is not active or kill-switch is engaged' };
    }

    if (db.isSuppressed(lead.email)) {
      db.updateLead(lead.id, { status: 'UNSUBSCRIBED' });
      return { success: false, error: 'Lead is on the suppression list' };
    }

    const firstEmailStep = campaign.steps.find((s) => s.type === 'EMAIL');
    if (!firstEmailStep) {
      return { success: false, error: 'No email step found in sequence' };
    }

    const activeMailboxes = db.getMailboxes().filter((m) => m.status === 'HEALTHY');
    if (activeMailboxes.length === 0) {
      return { success: false, error: 'No healthy mailboxes available for sending' };
    }

    // Select round-robin mailbox
    const selectedMailbox = activeMailboxes[0];

    const { subject, body } = this.selectEmailVariant(firstEmailStep, lead.id);
    const interpolatedSubject = this.interpolateTemplate(subject, lead);
    const interpolatedBody = this.interpolateTemplate(body, lead);

    // Create conversation & message record
    const convId = `conv-${uuidv4().slice(0, 8)}`;
    const msgId = `msg-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newMsg: Message = {
      id: msgId,
      conversationId: convId,
      mailboxId: selectedMailbox.id,
      providerMessageId: `prov-${uuidv4().slice(0, 12)}`,
      threadId: `th-${uuidv4().slice(0, 12)}`,
      direction: 'OUTBOUND',
      fromEmail: selectedMailbox.email,
      toEmail: lead.email,
      subject: interpolatedSubject,
      bodyText: interpolatedBody,
      timestamp: now,
    };

    const newConv: Conversation = {
      id: convId,
      leadId: lead.id,
      contactName: `${lead.firstName} ${lead.lastName}`.trim() || lead.company,
      contactEmail: lead.email,
      company: lead.company,
      subject: interpolatedSubject,
      intent: 'UNKNOWN',
      intentConfidence: 0,
      intentReasoning: 'Outreach email sent. Waiting for prospect response.',
      status: 'WAITING',
      messages: [newMsg],
      lastActivityAt: now,
      unread: false,
    };

    db.addConversation(newConv);

    // Update lead status
    db.updateLead(lead.id, {
      status: 'ACTIVE',
      campaignId: campaign.id,
      campaignName: campaign.name,
    });

    // Update mailbox quota
    db.updateMailbox(selectedMailbox.id, {
      sentToday: selectedMailbox.sentToday + 1,
      lastSyncAt: now,
    });

    // Update campaign stats
    db.updateCampaign(campaign.id, {
      stats: {
        ...campaign.stats,
        sentCount: campaign.stats.sentCount + 1,
        deliveredCount: campaign.stats.deliveredCount + 1,
      },
    });

    return { success: true, message: newMsg };
  }
}
