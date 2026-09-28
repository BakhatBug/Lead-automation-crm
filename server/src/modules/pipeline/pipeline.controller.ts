import { Request, Response } from 'express';
import { db } from '../../db/store.js';
import { Opportunity, Task, Meeting, DealStage } from '../../types/index.js';
import { AnalyticsService } from './analytics.service.js';
import { v4 as uuidv4 } from 'uuid';

export class PipelineController {
  // GET /api/pipeline/deals
  static getAllDeals(req: Request, res: Response) {
    try {
      const { stage, owner } = req.query;
      let deals = db.getOpportunities();

      if (stage && typeof stage === 'string') {
        deals = deals.filter((d) => d.stage === stage);
      }
      if (owner && typeof owner === 'string') {
        deals = deals.filter((d) => d.owner === owner);
      }

      res.json({ success: true, count: deals.length, deals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/pipeline/deals
  static createDeal(req: Request, res: Response) {
    try {
      const { title, leadId, contactName, company, amount, stage, expectedCloseDate, owner, sourceCampaignId } = req.body;
      if (!title || !company) {
        return res.status(400).json({ success: false, error: 'Title and company are required' });
      }

      const oppId = `opp-${uuidv4().slice(0, 8)}`;
      const newDeal: Opportunity = {
        id: oppId,
        title,
        leadId: leadId || '',
        contactName: contactName || 'Primary Contact',
        company,
        amount: Number(amount) || 12000,
        currency: 'USD',
        stage: stage || 'QUALIFIED',
        probability: stage === 'WON' ? 100 : stage === 'PROPOSAL' ? 75 : 50,
        expectedCloseDate: expectedCloseDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        owner: owner || 'Alex Morgan',
        sourceCampaignId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.addOpportunity(newDeal);

      // If leadId provided, update lead status
      if (leadId) {
        db.updateLead(leadId, { status: 'OPPORTUNITY' });
      }

      db.addAuditLog({
        id: `audit-${uuidv4().slice(0, 8)}`,
        eventType: 'OPPORTUNITY_CREATED',
        entityType: 'Opportunity',
        entityId: oppId,
        description: `Created opportunity "${title}" ($${newDeal.amount.toLocaleString()}) for ${company}.`,
        actor: 'User',
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({ success: true, deal: newDeal });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // PATCH /api/pipeline/deals/:id
  static updateDeal(req: Request, res: Response) {
    const opp = db.getOpportunityById(req.params.id as string);
    if (!opp) return res.status(404).json({ success: false, error: 'Deal not found' });

    const updates = req.body;

    // Automatic probability adjustment based on stage
    if (updates.stage && updates.stage !== opp.stage) {
      if (updates.stage === 'WON') updates.probability = 100;
      else if (updates.stage === 'LOST') updates.probability = 0;
      else if (updates.stage === 'PROPOSAL') updates.probability = 80;
      else if (updates.stage === 'MEETING_SCHEDULED') updates.probability = 60;
      else if (updates.stage === 'QUALIFIED') updates.probability = 40;
    }

    const updated = db.updateOpportunity(opp.id, updates);

    if (updates.stage && updates.stage !== opp.stage) {
      db.addAuditLog({
        id: `audit-${uuidv4().slice(0, 8)}`,
        eventType: 'DEAL_STAGE_CHANGED',
        entityType: 'Opportunity',
        entityId: opp.id,
        description: `Moved "${opp.title}" from ${opp.stage} to ${updates.stage}.`,
        actor: 'User',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ success: true, deal: updated });
  }

  // GET /api/pipeline/tasks
  static getAllTasks(_req: Request, res: Response) {
    res.json({ success: true, tasks: db.getTasks() });
  }

  // POST /api/pipeline/tasks
  static createTask(req: Request, res: Response) {
    try {
      const { title, type, priority, dueDate, leadId, contactName, company, assignedTo } = req.body;
      if (!title) return res.status(400).json({ success: false, error: 'Task title is required' });

      const taskId = `task-${uuidv4().slice(0, 8)}`;
      const newTask: Task = {
        id: taskId,
        title,
        type: type || 'EMAIL_FOLLOWUP',
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        dueDate: dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        leadId,
        contactName,
        company,
        assignedTo: assignedTo || 'Alex Morgan',
        createdAt: new Date().toISOString(),
      };

      db.addTask(newTask);
      res.status(201).json({ success: true, task: newTask });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // PATCH /api/pipeline/tasks/:id
  static updateTask(req: Request, res: Response) {
    const updated = db.updateTask(req.params.id as string, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, task: updated });
  }

  // GET /api/pipeline/meetings
  static getAllMeetings(_req: Request, res: Response) {
    res.json({ success: true, meetings: db.getMeetings() });
  }

  // POST /api/pipeline/meetings
  static bookMeeting(req: Request, res: Response) {
    try {
      const { title, leadId, contactName, contactEmail, company, startTime, endTime, calendarLink, notes } = req.body;
      if (!title || !contactEmail) {
        return res.status(400).json({ success: false, error: 'Title and contact email are required' });
      }

      const meetingId = `meet-${uuidv4().slice(0, 8)}`;
      const newMeeting: Meeting = {
        id: meetingId,
        title,
        leadId: leadId || '',
        contactName: contactName || 'Lead',
        contactEmail,
        company: company || 'Company',
        startTime: startTime || new Date(Date.now() + 86400000 * 2).toISOString(),
        endTime: endTime || new Date(Date.now() + 86400000 * 2 + 1000 * 60 * 30).toISOString(),
        status: 'SCHEDULED',
        calendarLink: calendarLink || 'https://cal.com/outboundgrowth/15min',
        notes,
      };

      db.addMeeting(newMeeting);

      // If leadId is known, advance lead and opportunity state
      if (leadId) {
        db.updateLead(leadId, { status: 'MEETING_BOOKED' });
      }

      db.addAuditLog({
        id: `audit-${uuidv4().slice(0, 8)}`,
        eventType: 'MEETING_BOOKED',
        entityType: 'Meeting',
        entityId: meetingId,
        description: `Meeting booked with ${contactName} (${company}): "${title}". Calendar event synced.`,
        actor: 'Calendar Integration',
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({ success: true, meeting: newMeeting });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/pipeline/analytics/funnel
  static getFunnelAnalytics(_req: Request, res: Response) {
    const funnel = AnalyticsService.getFunnelMetrics();
    const attribution = AnalyticsService.getCampaignAttribution();
    const auditLogs = db.getAuditLogs().slice(0, 15);
    res.json({ success: true, funnel, attribution, auditLogs });
  }
}
