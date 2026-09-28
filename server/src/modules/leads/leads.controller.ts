import { Request, Response } from 'express';
import { db } from '../../db/store.js';
import { LeadsService } from './leads.service.js';
import { v4 as uuidv4 } from 'uuid';

export class LeadsController {
  // GET /api/leads
  static getAllLeads(req: Request, res: Response) {
    try {
      const { status, campaignId, search } = req.query;
      let leads = db.getLeads();

      if (status && typeof status === 'string') {
        leads = leads.filter((l) => l.status === status);
      }
      if (campaignId && typeof campaignId === 'string') {
        leads = leads.filter((l) => l.campaignId === campaignId);
      }
      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        leads = leads.filter(
          (l) =>
            l.firstName.toLowerCase().includes(query) ||
            l.lastName.toLowerCase().includes(query) ||
            l.email.toLowerCase().includes(query) ||
            l.company.toLowerCase().includes(query) ||
            l.title.toLowerCase().includes(query)
        );
      }

      res.json({ success: true, count: leads.length, leads });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/leads/:id
  static getLeadById(req: Request, res: Response) {
    const lead = db.getLeadById(req.params.id as string);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, lead });
  }

  // POST /api/leads
  static createLead(req: Request, res: Response) {
    try {
      const data = req.body;
      if (!data.email || !data.company) {
        return res.status(400).json({ success: false, error: 'Email and company are required' });
      }

      if (db.isSuppressed(data.email)) {
        return res.status(400).json({ success: false, error: 'Email address is on the suppression list' });
      }

      if (db.getLeadByEmail(data.email)) {
        return res.status(400).json({ success: false, error: 'A lead with this email already exists' });
      }

      const { score, breakdown } = LeadsService.calculateLeadScore(data);

      const newLead = db.addLead({
        id: `lead-${uuidv4().slice(0, 8)}`,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email.trim(),
        phone: data.phone,
        company: data.company.trim(),
        title: data.title || 'Decision Maker',
        website: data.website,
        industry: data.industry || 'Technology',
        employeeCount: data.employeeCount ? Number(data.employeeCount) : 50,
        score,
        scoreBreakdown: breakdown,
        status: data.status || 'NEW',
        campaignId: data.campaignId,
        tags: data.tags || ['Manual Add'],
        notes: data.notes,
        verifiedEmail: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json({ success: true, lead: newLead });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // PATCH /api/leads/:id
  static updateLead(req: Request, res: Response) {
    const updated = db.updateLead(req.params.id as string, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, lead: updated });
  }

  // DELETE /api/leads/:id
  static deleteLead(req: Request, res: Response) {
    const deleted = db.deleteLead(req.params.id as string);
    if (!deleted) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted successfully' });
  }

  // POST /api/leads/parse-preview
  static parsePreview(req: Request, res: Response) {
    try {
      const { csvText } = req.body;
      if (!csvText) return res.status(400).json({ success: false, error: 'csvText is required' });

      const rows = LeadsService.parseCSV(csvText);
      if (rows.length === 0) {
        return res.status(400).json({ success: false, error: 'No valid rows detected in CSV' });
      }

      const headers = Object.keys(rows[0]);
      const suggestedMapping = LeadsService.detectColumnMapping(headers);

      res.json({
        success: true,
        totalRows: rows.length,
        headers,
        suggestedMapping,
        previewRows: rows.slice(0, 5),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/leads/import
  static importLeads(req: Request, res: Response) {
    try {
      const { csvText, mapping, tags } = req.body;
      if (!csvText || !mapping) {
        return res.status(400).json({ success: false, error: 'csvText and column mapping are required' });
      }

      const rows = LeadsService.parseCSV(csvText);
      const result = LeadsService.processImport(rows, mapping, tags);

      res.json({
        success: true,
        importedCount: result.imported.length,
        duplicates: result.duplicates,
        suppressed: result.suppressed,
        invalidEmails: result.invalidEmails,
        sampleLeads: result.imported.slice(0, 3),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/suppressions
  static getSuppressions(_req: Request, res: Response) {
    res.json({ success: true, suppressions: db.getSuppressions() });
  }

  // POST /api/suppressions
  static addSuppression(req: Request, res: Response) {
    try {
      const { email, domain, reason, source } = req.body;
      if (!email && !domain) {
        return res.status(400).json({ success: false, error: 'Email or domain is required' });
      }

      const sup = db.addSuppression({
        id: `sup-${uuidv4().slice(0, 8)}`,
        email: email ? email.toLowerCase().trim() : undefined,
        domain: domain ? domain.toLowerCase().trim() : undefined,
        reason: reason || 'MANUAL',
        source: source || 'User Action',
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({ success: true, suppression: sup });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
