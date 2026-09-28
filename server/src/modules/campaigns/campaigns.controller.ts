import { Request, Response } from 'express';
import { db } from '../../db/store.js';
import { Campaign, SequenceStep } from '../../types/index.js';
import { SequenceEngine } from './sequence.engine.js';
import { v4 as uuidv4 } from 'uuid';

export class CampaignsController {
  // GET /api/campaigns
  static getAllCampaigns(_req: Request, res: Response) {
    res.json({ success: true, campaigns: db.getCampaigns() });
  }

  // GET /api/campaigns/:id
  static getCampaignById(req: Request, res: Response) {
    const campaign = db.getCampaignById(req.params.id as string);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
    res.json({ success: true, campaign });
  }

  // POST /api/campaigns
  static createCampaign(req: Request, res: Response) {
    try {
      const { name, objective, targetAudience, mailboxIds, steps } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'Campaign name is required' });

      const campaignId = `camp-${uuidv4().slice(0, 8)}`;

      const formattedSteps: SequenceStep[] = (steps || []).map((s: any, idx: number) => ({
        id: s.id || `step-${uuidv4().slice(0, 8)}`,
        campaignId,
        stepNumber: idx + 1,
        type: s.type || 'EMAIL',
        delayDays: s.delayDays || 0,
        subject: s.subject || '',
        bodyTemplate: s.bodyTemplate || '',
        variantB: s.variantB,
        conditionRules: s.conditionRules || {
          ifReplied: 'STOP_SEQUENCE',
          ifNoReplyDays: 3,
        },
      }));

      const newCampaign: Campaign = {
        id: campaignId,
        name,
        objective: objective || 'Drive qualified pipeline',
        targetAudience: targetAudience || 'B2B Executives',
        status: 'DRAFT',
        mailboxIds: mailboxIds || ['box-1'],
        safetyKillSwitch: false,
        steps: formattedSteps,
        stats: {
          leadsCount: 0,
          sentCount: 0,
          deliveredCount: 0,
          openedCount: 0,
          repliedCount: 0,
          positiveRepliesCount: 0,
          meetingsBooked: 0,
          opportunitiesCreated: 0,
          revenueWon: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.addCampaign(newCampaign);

      db.addAuditLog({
        id: `audit-${uuidv4().slice(0, 8)}`,
        eventType: 'CAMPAIGN_CREATED',
        entityType: 'Campaign',
        entityId: campaignId,
        description: `Created campaign "${name}" with ${formattedSteps.length} sequence steps.`,
        actor: 'User',
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({ success: true, campaign: newCampaign });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // PATCH /api/campaigns/:id
  static updateCampaign(req: Request, res: Response) {
    const updated = db.updateCampaign(req.params.id as string, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Campaign not found' });
    res.json({ success: true, campaign: updated });
  }

  // POST /api/campaigns/:id/launch
  static launchCampaign(req: Request, res: Response) {
    const campaign = db.getCampaignById(req.params.id as string);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    if (campaign.safetyKillSwitch) {
      return res.status(400).json({ success: false, error: 'Cannot launch: Safety kill-switch is engaged.' });
    }

    if (campaign.steps.length === 0) {
      return res.status(400).json({ success: false, error: 'Cannot launch: Sequence has no steps.' });
    }

    const updated = db.updateCampaign(campaign.id, { status: 'ACTIVE' });

    db.addAuditLog({
      id: `audit-${uuidv4().slice(0, 8)}`,
      eventType: 'CAMPAIGN_LAUNCHED',
      entityType: 'Campaign',
      entityId: campaign.id,
      description: `Launched campaign "${campaign.name}". Sequence scheduler activated.`,
      actor: 'User',
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Campaign launched successfully', campaign: updated });
  }

  // POST /api/campaigns/:id/pause
  static pauseCampaign(req: Request, res: Response) {
    const campaign = db.getCampaignById(req.params.id as string);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    const updated = db.updateCampaign(campaign.id, { status: 'PAUSED' });
    res.json({ success: true, message: 'Campaign paused', campaign: updated });
  }

  // POST /api/campaigns/:id/kill-switch
  static toggleKillSwitch(req: Request, res: Response) {
    const campaign = db.getCampaignById(req.params.id as string);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    const newState = !campaign.safetyKillSwitch;
    const newStatus = newState ? 'KILLED' : 'PAUSED';

    const updated = db.updateCampaign(campaign.id, {
      safetyKillSwitch: newState,
      status: newStatus,
    });

    db.addAuditLog({
      id: `audit-${uuidv4().slice(0, 8)}`,
      eventType: newState ? 'CAMPAIGN_KILLED' : 'CAMPAIGN_UNLOCKED',
      entityType: 'Campaign',
      entityId: campaign.id,
      description: newState
        ? `Safety kill-switch ENGAGED for "${campaign.name}". All sends halted immediately.`
        : `Safety kill-switch disengaged for "${campaign.name}".`,
      actor: 'User',
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: newState ? 'Campaign emergency kill-switch engaged' : 'Kill-switch deactivated',
      campaign: updated,
    });
  }

  // POST /api/campaigns/:id/enroll-leads
  static enrollLeads(req: Request, res: Response) {
    try {
      const campaign = db.getCampaignById(req.params.id as string);
      if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

      const { leadIds } = req.body;
      if (!Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ success: false, error: 'leadIds array is required' });
      }

      let enrolledCount = 0;
      leadIds.forEach((id: string) => {
        const lead = db.getLeadById(id);
        if (lead && lead.status !== 'UNSUBSCRIBED' && lead.status !== 'BOUNCED') {
          db.updateLead(lead.id, {
            status: 'ENROLLED',
            campaignId: campaign.id,
            campaignName: campaign.name,
          });
          enrolledCount++;
        }
      });

      // Update campaign stats
      db.updateCampaign(campaign.id, {
        stats: {
          ...campaign.stats,
          leadsCount: campaign.stats.leadsCount + enrolledCount,
        },
      });

      res.json({
        success: true,
        enrolledCount,
        message: `Successfully enrolled ${enrolledCount} leads into ${campaign.name}`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/campaigns/:id/simulate-send
  static simulateSendBatch(req: Request, res: Response) {
    try {
      const campaign = db.getCampaignById(req.params.id as string);
      if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

      const enrolledLeads = db
        .getLeads()
        .filter((l) => (l.campaignId === campaign.id || !l.campaignId) && (l.status === 'ENROLLED' || l.status === 'NEW'))
        .slice(0, 3); // send up to 3 for immediate simulation feedback

      if (enrolledLeads.length === 0) {
        return res.json({ success: true, sentCount: 0, message: 'No pending enrolled leads found to send to.' });
      }

      const results = enrolledLeads.map((lead) => SequenceEngine.executeInitialSend(campaign, lead));
      const successful = results.filter((r) => r.success);

      res.json({
        success: true,
        sentCount: successful.length,
        message: `Dispatched step 1 email to ${successful.length} leads. Inboxes updated.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
