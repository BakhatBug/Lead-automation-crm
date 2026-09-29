import {
  Lead,
  Campaign,
  Mailbox,
  Conversation,
  Message,
  Opportunity,
  Task,
  Meeting,
  Suppression,
  AuditLog,
} from '../types/index.js';
import { sqliteDb, initDatabaseSchema, feedDatabaseData } from './sqlite.js';

class SQLiteStore {
  constructor() {
    initDatabaseSchema();
    feedDatabaseData(false);
  }

  // --- Leads ---
  getLeads(): Lead[] {
    const rows = sqliteDb.prepare('SELECT * FROM leads ORDER BY createdAt DESC').all() as any[];
    return rows.map(this.mapLeadRow);
  }

  getLeadById(id: string): Lead | undefined {
    const row = sqliteDb.prepare('SELECT * FROM leads WHERE id = ?').get(id) as any;
    return row ? this.mapLeadRow(row) : undefined;
  }

  getLeadByEmail(email: string): Lead | undefined {
    const row = sqliteDb.prepare('SELECT * FROM leads WHERE LOWER(email) = LOWER(?)').get(email.trim()) as any;
    return row ? this.mapLeadRow(row) : undefined;
  }

  addLead(lead: Lead): Lead {
    const stmt = sqliteDb.prepare(`
      INSERT INTO leads (
        id, firstName, lastName, email, phone, company, title, website, industry, employeeCount,
        score, scoreBreakdown, status, campaignId, campaignName, tags, notes, verifiedEmail, createdAt, updatedAt
      ) VALUES (
        @id, @firstName, @lastName, @email, @phone, @company, @title, @website, @industry, @employeeCount,
        @score, @scoreBreakdown, @status, @campaignId, @campaignName, @tags, @notes, @verifiedEmail, @createdAt, @updatedAt
      )
    `);

    stmt.run({
      id: lead.id,
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      email: lead.email,
      phone: lead.phone || null,
      company: lead.company,
      title: lead.title || 'Decision Maker',
      website: lead.website || null,
      industry: lead.industry || null,
      employeeCount: lead.employeeCount ?? null,
      score: lead.score || 70,
      scoreBreakdown: JSON.stringify(lead.scoreBreakdown || { icpFit: 25, titleSeniority: 20, companyScale: 15, completeness: 10 }),
      status: lead.status || 'NEW',
      campaignId: lead.campaignId || null,
      campaignName: lead.campaignName || null,
      tags: JSON.stringify(lead.tags || []),
      notes: lead.notes || null,
      verifiedEmail: lead.verifiedEmail ? 1 : 0,
      createdAt: lead.createdAt || new Date().toISOString(),
      updatedAt: lead.updatedAt || new Date().toISOString(),
    });
    return lead;
  }

  addLeads(leads: Lead[]): Lead[] {
    const insert = sqliteDb.prepare(`
      INSERT INTO leads (
        id, firstName, lastName, email, phone, company, title, website, industry, employeeCount,
        score, scoreBreakdown, status, campaignId, campaignName, tags, notes, verifiedEmail, createdAt, updatedAt
      ) VALUES (
        @id, @firstName, @lastName, @email, @phone, @company, @title, @website, @industry, @employeeCount,
        @score, @scoreBreakdown, @status, @campaignId, @campaignName, @tags, @notes, @verifiedEmail, @createdAt, @updatedAt
      )
    `);

    const tx = sqliteDb.transaction((items: Lead[]) => {
      for (const lead of items) {
        insert.run({
          id: lead.id,
          firstName: lead.firstName || '',
          lastName: lead.lastName || '',
          email: lead.email,
          phone: lead.phone || null,
          company: lead.company,
          title: lead.title || 'Decision Maker',
          website: lead.website || null,
          industry: lead.industry || null,
          employeeCount: lead.employeeCount ?? null,
          score: lead.score || 70,
          scoreBreakdown: JSON.stringify(lead.scoreBreakdown || { icpFit: 25, titleSeniority: 20, companyScale: 15, completeness: 10 }),
          status: lead.status || 'NEW',
          campaignId: lead.campaignId || null,
          campaignName: lead.campaignName || null,
          tags: JSON.stringify(lead.tags || []),
          notes: lead.notes || null,
          verifiedEmail: lead.verifiedEmail ? 1 : 0,
          createdAt: lead.createdAt || new Date().toISOString(),
          updatedAt: lead.updatedAt || new Date().toISOString(),
        });
      }
    });

    tx(leads);
    return leads;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead | undefined {
    const existing = this.getLeadById(id);
    if (!existing) return undefined;

    const merged = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const stmt = sqliteDb.prepare(`
      UPDATE leads SET
        firstName = @firstName, lastName = @lastName, email = @email, phone = @phone,
        company = @company, title = @title, website = @website, industry = @industry,
        employeeCount = @employeeCount, score = @score, scoreBreakdown = @scoreBreakdown,
        status = @status, campaignId = @campaignId, campaignName = @campaignName,
        tags = @tags, notes = @notes, verifiedEmail = @verifiedEmail, updatedAt = @updatedAt
      WHERE id = @id
    `);

    stmt.run({
      id: merged.id,
      firstName: merged.firstName || '',
      lastName: merged.lastName || '',
      email: merged.email,
      phone: merged.phone || null,
      company: merged.company,
      title: merged.title || 'Decision Maker',
      website: merged.website || null,
      industry: merged.industry || null,
      employeeCount: merged.employeeCount ?? null,
      score: merged.score,
      scoreBreakdown: JSON.stringify(merged.scoreBreakdown),
      status: merged.status,
      campaignId: merged.campaignId || null,
      campaignName: merged.campaignName || null,
      tags: JSON.stringify(merged.tags || []),
      notes: merged.notes || null,
      verifiedEmail: merged.verifiedEmail ? 1 : 0,
      updatedAt: merged.updatedAt,
    });

    return merged;
  }

  deleteLead(id: string): boolean {
    const res = sqliteDb.prepare('DELETE FROM leads WHERE id = ?').run(id);
    return res.changes > 0;
  }

  private mapLeadRow(row: any): Lead {
    return {
      ...row,
      scoreBreakdown: typeof row.scoreBreakdown === 'string' ? JSON.parse(row.scoreBreakdown) : row.scoreBreakdown,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
      verifiedEmail: Boolean(row.verifiedEmail),
    };
  }

  // --- Campaigns ---
  getCampaigns(): Campaign[] {
    const rows = sqliteDb.prepare('SELECT * FROM campaigns ORDER BY createdAt DESC').all() as any[];
    return rows.map(this.mapCampaignRow);
  }

  getCampaignById(id: string): Campaign | undefined {
    const row = sqliteDb.prepare('SELECT * FROM campaigns WHERE id = ?').get(id) as any;
    return row ? this.mapCampaignRow(row) : undefined;
  }

  addCampaign(c: Campaign): Campaign {
    const stmt = sqliteDb.prepare(`
      INSERT INTO campaigns (
        id, name, objective, targetAudience, status, mailboxIds, steps, stats, safetyKillSwitch, createdAt, updatedAt
      ) VALUES (
        @id, @name, @objective, @targetAudience, @status, @mailboxIds, @steps, @stats, @safetyKillSwitch, @createdAt, @updatedAt
      )
    `);

    stmt.run({
      id: c.id,
      name: c.name,
      objective: c.objective || '',
      targetAudience: c.targetAudience || '',
      status: c.status || 'DRAFT',
      mailboxIds: JSON.stringify(c.mailboxIds || []),
      steps: JSON.stringify(c.steps || []),
      stats: JSON.stringify(c.stats),
      safetyKillSwitch: c.safetyKillSwitch ? 1 : 0,
      createdAt: c.createdAt || new Date().toISOString(),
      updatedAt: c.updatedAt || new Date().toISOString(),
    });

    return c;
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Campaign | undefined {
    const existing = this.getCampaignById(id);
    if (!existing) return undefined;

    const merged = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const stmt = sqliteDb.prepare(`
      UPDATE campaigns SET
        name = @name, objective = @objective, targetAudience = @targetAudience, status = @status,
        mailboxIds = @mailboxIds, steps = @steps, stats = @stats, safetyKillSwitch = @safetyKillSwitch,
        updatedAt = @updatedAt
      WHERE id = @id
    `);

    stmt.run({
      id: merged.id,
      name: merged.name,
      objective: merged.objective || '',
      targetAudience: merged.targetAudience || '',
      status: merged.status,
      mailboxIds: JSON.stringify(merged.mailboxIds || []),
      steps: JSON.stringify(merged.steps || []),
      stats: JSON.stringify(merged.stats),
      safetyKillSwitch: merged.safetyKillSwitch ? 1 : 0,
      updatedAt: merged.updatedAt,
    });

    return merged;
  }

  private mapCampaignRow(row: any): Campaign {
    return {
      ...row,
      mailboxIds: typeof row.mailboxIds === 'string' ? JSON.parse(row.mailboxIds) : row.mailboxIds || [],
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps || [],
      stats: typeof row.stats === 'string' ? JSON.parse(row.stats) : row.stats,
      safetyKillSwitch: Boolean(row.safetyKillSwitch),
    };
  }

  // --- Mailboxes ---
  getMailboxes(): Mailbox[] {
    const rows = sqliteDb.prepare('SELECT * FROM mailboxes ORDER BY name ASC').all() as any[];
    return rows.map((r) => ({
      ...r,
      spfValid: Boolean(r.spfValid),
      dkimValid: Boolean(r.dkimValid),
      dmarcValid: Boolean(r.dmarcValid),
      useSsl: r.useSsl !== null ? Boolean(r.useSsl) : true,
    }));
  }

  getMailboxById(id: string): Mailbox | undefined {
    const r = sqliteDb.prepare('SELECT * FROM mailboxes WHERE id = ?').get(id) as any;
    if (!r) return undefined;
    return {
      ...r,
      spfValid: Boolean(r.spfValid),
      dkimValid: Boolean(r.dkimValid),
      dmarcValid: Boolean(r.dmarcValid),
      useSsl: r.useSsl !== null ? Boolean(r.useSsl) : true,
    };
  }

  addMailbox(m: Mailbox): Mailbox {
    const stmt = sqliteDb.prepare(`
      INSERT INTO mailboxes (
        id, provider, email, name, status, dailySendLimit, sentToday, warmUpProgress, spfValid, dkimValid, dmarcValid, lastSyncAt,
        smtpHost, smtpPort, imapHost, imapPort, username, useSsl
      ) VALUES (
        @id, @provider, @email, @name, @status, @dailySendLimit, @sentToday, @warmUpProgress, @spfValid, @dkimValid, @dmarcValid, @lastSyncAt,
        @smtpHost, @smtpPort, @imapHost, @imapPort, @username, @useSsl
      )
    `);

    stmt.run({
      id: m.id,
      provider: m.provider,
      email: m.email,
      name: m.name,
      status: m.status || 'HEALTHY',
      dailySendLimit: m.dailySendLimit || 40,
      sentToday: m.sentToday || 0,
      warmUpProgress: m.warmUpProgress || 50,
      spfValid: m.spfValid ? 1 : 0,
      dkimValid: m.dkimValid ? 1 : 0,
      dmarcValid: m.dmarcValid ? 1 : 0,
      lastSyncAt: m.lastSyncAt || new Date().toISOString(),
      smtpHost: m.smtpHost || null,
      smtpPort: m.smtpPort ?? null,
      imapHost: m.imapHost || null,
      imapPort: m.imapPort ?? null,
      username: m.username || null,
      useSsl: m.useSsl !== undefined ? (m.useSsl ? 1 : 0) : 1,
    });

    return m;
  }

  updateMailbox(id: string, updates: Partial<Mailbox>): Mailbox | undefined {
    const existing = this.getMailboxById(id);
    if (!existing) return undefined;

    const merged = { ...existing, ...updates };
    const stmt = sqliteDb.prepare(`
      UPDATE mailboxes SET
        provider = @provider, email = @email, name = @name, status = @status,
        dailySendLimit = @dailySendLimit, sentToday = @sentToday, warmUpProgress = @warmUpProgress,
        spfValid = @spfValid, dkimValid = @dkimValid, dmarcValid = @dmarcValid, lastSyncAt = @lastSyncAt,
        smtpHost = @smtpHost, smtpPort = @smtpPort, imapHost = @imapHost, imapPort = @imapPort,
        username = @username, useSsl = @useSsl
      WHERE id = @id
    `);

    stmt.run({
      id: merged.id,
      provider: merged.provider,
      email: merged.email,
      name: merged.name,
      status: merged.status,
      dailySendLimit: merged.dailySendLimit,
      sentToday: merged.sentToday,
      warmUpProgress: merged.warmUpProgress,
      spfValid: merged.spfValid ? 1 : 0,
      dkimValid: merged.dkimValid ? 1 : 0,
      dmarcValid: merged.dmarcValid ? 1 : 0,
      lastSyncAt: merged.lastSyncAt,
      smtpHost: merged.smtpHost || null,
      smtpPort: merged.smtpPort ?? null,
      imapHost: merged.imapHost || null,
      imapPort: merged.imapPort ?? null,
      username: merged.username || null,
      useSsl: merged.useSsl ? 1 : 0,
    });

    return merged;
  }

  // --- Conversations & Messages ---
  getConversations(): Conversation[] {
    const rows = sqliteDb.prepare('SELECT * FROM conversations ORDER BY lastActivityAt DESC').all() as any[];
    return rows.map((r) => this.hydrateConversation(r));
  }

  getConversationById(id: string): Conversation | undefined {
    const row = sqliteDb.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return this.hydrateConversation(row);
  }

  getConversationByLeadId(leadId: string): Conversation | undefined {
    const row = sqliteDb.prepare('SELECT * FROM conversations WHERE leadId = ?').get(leadId) as any;
    if (!row) return undefined;
    return this.hydrateConversation(row);
  }

  addConversation(c: Conversation): Conversation {
    const stmt = sqliteDb.prepare(`
      INSERT INTO conversations (
        id, leadId, contactName, contactEmail, company, subject, intent, intentConfidence,
        intentReasoning, status, suggestedDraftReply, draftApproved, lastActivityAt, unread
      ) VALUES (
        @id, @leadId, @contactName, @contactEmail, @company, @subject, @intent, @intentConfidence,
        @intentReasoning, @status, @suggestedDraftReply, @draftApproved, @lastActivityAt, @unread
      )
    `);

    stmt.run({
      id: c.id,
      leadId: c.leadId,
      contactName: c.contactName,
      contactEmail: c.contactEmail,
      company: c.company,
      subject: c.subject,
      intent: c.intent,
      intentConfidence: c.intentConfidence,
      intentReasoning: c.intentReasoning,
      status: c.status,
      suggestedDraftReply: c.suggestedDraftReply || null,
      draftApproved: c.draftApproved ? 1 : 0,
      lastActivityAt: c.lastActivityAt,
      unread: c.unread ? 1 : 0,
    });

    if (c.messages && c.messages.length > 0) {
      for (const m of c.messages) {
        this.insertMessage(c.id, m);
      }
    }

    return c;
  }

  updateConversation(id: string, updates: Partial<Conversation>): Conversation | undefined {
    const existing = this.getConversationById(id);
    if (!existing) return undefined;

    const merged = { ...existing, ...updates };
    const stmt = sqliteDb.prepare(`
      UPDATE conversations SET
        leadId = @leadId, contactName = @contactName, contactEmail = @contactEmail, company = @company,
        subject = @subject, intent = @intent, intentConfidence = @intentConfidence, intentReasoning = @intentReasoning,
        status = @status, suggestedDraftReply = @suggestedDraftReply, draftApproved = @draftApproved,
        lastActivityAt = @lastActivityAt, unread = @unread
      WHERE id = @id
    `);

    stmt.run({
      id: merged.id,
      leadId: merged.leadId,
      contactName: merged.contactName,
      contactEmail: merged.contactEmail,
      company: merged.company,
      subject: merged.subject,
      intent: merged.intent,
      intentConfidence: merged.intentConfidence,
      intentReasoning: merged.intentReasoning,
      status: merged.status,
      suggestedDraftReply: merged.suggestedDraftReply || null,
      draftApproved: merged.draftApproved ? 1 : 0,
      lastActivityAt: merged.lastActivityAt,
      unread: merged.unread ? 1 : 0,
    });

    return merged;
  }

  addMessageToConversation(conversationId: string, msg: Message): Conversation | undefined {
    this.insertMessage(conversationId, msg);
    sqliteDb.prepare('UPDATE conversations SET lastActivityAt = ? WHERE id = ?').run(msg.timestamp, conversationId);
    return this.getConversationById(conversationId);
  }

  private insertMessage(conversationId: string, m: Message) {
    const stmt = sqliteDb.prepare(`
      INSERT OR REPLACE INTO messages (
        id, conversationId, mailboxId, providerMessageId, threadId, direction, fromEmail, toEmail,
        subject, bodyText, bodyHtml, rfcMessageId, inReplyTo, referencesHeader, timestamp
      ) VALUES (
        @id, @conversationId, @mailboxId, @providerMessageId, @threadId, @direction, @fromEmail, @toEmail,
        @subject, @bodyText, @bodyHtml, @rfcMessageId, @inReplyTo, @referencesHeader, @timestamp
      )
    `);

    stmt.run({
      id: m.id,
      conversationId,
      mailboxId: m.mailboxId,
      providerMessageId: m.providerMessageId,
      threadId: m.threadId,
      direction: m.direction,
      fromEmail: m.fromEmail,
      toEmail: m.toEmail,
      subject: m.subject,
      bodyText: m.bodyText,
      bodyHtml: m.bodyHtml || null,
      rfcMessageId: m.rfcMessageId || null,
      inReplyTo: m.inReplyTo || null,
      referencesHeader: m.references || null,
      timestamp: m.timestamp,
    });
  }

  private hydrateConversation(r: any): Conversation {
    const messages = sqliteDb.prepare('SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC').all(r.id) as any[];
    return {
      ...r,
      draftApproved: Boolean(r.draftApproved),
      unread: Boolean(r.unread),
      messages: messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        mailboxId: m.mailboxId,
        providerMessageId: m.providerMessageId,
        threadId: m.threadId,
        direction: m.direction,
        fromEmail: m.fromEmail,
        toEmail: m.toEmail,
        subject: m.subject,
        bodyText: m.bodyText,
        bodyHtml: m.bodyHtml,
        rfcMessageId: m.rfcMessageId,
        inReplyTo: m.inReplyTo,
        references: m.referencesHeader,
        timestamp: m.timestamp,
      })),
    };
  }

  // --- Opportunities ---
  getOpportunities(): Opportunity[] {
    const rows = sqliteDb.prepare('SELECT * FROM opportunities ORDER BY updatedAt DESC').all() as any[];
    return rows.map((r) => ({
      ...r,
      accountId: r.accountId || undefined,
      sourceCampaignId: r.sourceCampaignId || undefined,
      sourceCampaignName: r.sourceCampaignName || undefined,
      notes: r.notes || undefined,
    }));
  }

  getOpportunityById(id: string): Opportunity | undefined {
    const r = sqliteDb.prepare('SELECT * FROM opportunities WHERE id = ?').get(id) as any;
    if (!r) return undefined;
    return {
      ...r,
      accountId: r.accountId || undefined,
      sourceCampaignId: r.sourceCampaignId || undefined,
      sourceCampaignName: r.sourceCampaignName || undefined,
      notes: r.notes || undefined,
    };
  }

  addOpportunity(opp: Opportunity): Opportunity {
    const stmt = sqliteDb.prepare(`
      INSERT INTO opportunities (
        id, title, accountId, leadId, contactName, company, amount, currency, stage, probability,
        expectedCloseDate, owner, sourceCampaignId, sourceCampaignName, notes, createdAt, updatedAt
      ) VALUES (
        @id, @title, @accountId, @leadId, @contactName, @company, @amount, @currency, @stage, @probability,
        @expectedCloseDate, @owner, @sourceCampaignId, @sourceCampaignName, @notes, @createdAt, @updatedAt
      )
    `);

    stmt.run({
      id: opp.id,
      title: opp.title,
      accountId: opp.accountId || null,
      leadId: opp.leadId,
      contactName: opp.contactName,
      company: opp.company,
      amount: opp.amount,
      currency: opp.currency || 'USD',
      stage: opp.stage,
      probability: opp.probability,
      expectedCloseDate: opp.expectedCloseDate,
      owner: opp.owner,
      sourceCampaignId: opp.sourceCampaignId || null,
      sourceCampaignName: opp.sourceCampaignName || null,
      notes: opp.notes || null,
      createdAt: opp.createdAt || new Date().toISOString(),
      updatedAt: opp.updatedAt || new Date().toISOString(),
    });

    return opp;
  }

  updateOpportunity(id: string, updates: Partial<Opportunity>): Opportunity | undefined {
    const existing = this.getOpportunityById(id);
    if (!existing) return undefined;

    const merged = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const stmt = sqliteDb.prepare(`
      UPDATE opportunities SET
        title = @title, accountId = @accountId, leadId = @leadId, contactName = @contactName,
        company = @company, amount = @amount, currency = @currency, stage = @stage,
        probability = @probability, expectedCloseDate = @expectedCloseDate, owner = @owner,
        sourceCampaignId = @sourceCampaignId, sourceCampaignName = @sourceCampaignName,
        notes = @notes, updatedAt = @updatedAt
      WHERE id = @id
    `);

    stmt.run({
      id: merged.id,
      title: merged.title,
      accountId: merged.accountId || null,
      leadId: merged.leadId,
      contactName: merged.contactName,
      company: merged.company,
      amount: merged.amount,
      currency: merged.currency,
      stage: merged.stage,
      probability: merged.probability,
      expectedCloseDate: merged.expectedCloseDate,
      owner: merged.owner,
      sourceCampaignId: merged.sourceCampaignId || null,
      sourceCampaignName: merged.sourceCampaignName || null,
      notes: merged.notes || null,
      updatedAt: merged.updatedAt,
    });

    return merged;
  }

  // --- Tasks ---
  getTasks(): Task[] {
    return sqliteDb.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all() as Task[];
  }

  addTask(t: Task): Task {
    const stmt = sqliteDb.prepare(`
      INSERT INTO tasks (
        id, title, type, priority, status, dueDate, leadId, contactName, company, assignedTo, createdAt
      ) VALUES (
        @id, @title, @type, @priority, @status, @dueDate, @leadId, @contactName, @company, @assignedTo, @createdAt
      )
    `);
    stmt.run({
      id: t.id,
      title: t.title,
      type: t.type,
      priority: t.priority,
      status: t.status || 'PENDING',
      dueDate: t.dueDate,
      leadId: t.leadId || null,
      contactName: t.contactName || null,
      company: t.company || null,
      assignedTo: t.assignedTo,
      createdAt: t.createdAt || new Date().toISOString(),
    });
    return t;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const existing = sqliteDb.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
    if (!existing) return undefined;

    const merged = { ...existing, ...updates };
    const stmt = sqliteDb.prepare(`
      UPDATE tasks SET
        title = @title, type = @type, priority = @priority, status = @status,
        dueDate = @dueDate, assignedTo = @assignedTo
      WHERE id = @id
    `);
    stmt.run({
      id: merged.id,
      title: merged.title,
      type: merged.type,
      priority: merged.priority,
      status: merged.status,
      dueDate: merged.dueDate,
      assignedTo: merged.assignedTo,
    });
    return merged;
  }

  // --- Meetings ---
  getMeetings(): Meeting[] {
    return sqliteDb.prepare('SELECT * FROM meetings ORDER BY startTime ASC').all() as Meeting[];
  }

  addMeeting(m: Meeting): Meeting {
    const stmt = sqliteDb.prepare(`
      INSERT INTO meetings (
        id, title, leadId, contactName, contactEmail, company, startTime, endTime, status, calendarLink, notes
      ) VALUES (
        @id, @title, @leadId, @contactName, @contactEmail, @company, @startTime, @endTime, @status, @calendarLink, @notes
      )
    `);
    stmt.run({
      id: m.id,
      title: m.title,
      leadId: m.leadId || null,
      contactName: m.contactName,
      contactEmail: m.contactEmail,
      company: m.company,
      startTime: m.startTime,
      endTime: m.endTime,
      status: m.status || 'SCHEDULED',
      calendarLink: m.calendarLink,
      notes: m.notes || null,
    });
    return m;
  }

  // --- Suppressions ---
  getSuppressions(): Suppression[] {
    return sqliteDb.prepare('SELECT * FROM suppressions ORDER BY createdAt DESC').all() as Suppression[];
  }

  isSuppressed(email: string, domain?: string): boolean {
    const cleanEmail = email.toLowerCase().trim();
    const cleanDomain = (domain || email.split('@')[1] || '').toLowerCase().trim();

    const row = sqliteDb.prepare(`
      SELECT 1 FROM suppressions
      WHERE LOWER(email) = ? OR LOWER(domain) = ?
      LIMIT 1
    `).get(cleanEmail, cleanDomain);

    return Boolean(row);
  }

  addSuppression(s: Suppression): Suppression {
    const stmt = sqliteDb.prepare(`
      INSERT INTO suppressions (id, email, domain, reason, source, createdAt)
      VALUES (@id, @email, @domain, @reason, @source, @createdAt)
    `);
    stmt.run({
      id: s.id,
      email: s.email ? s.email.toLowerCase().trim() : null,
      domain: s.domain ? s.domain.toLowerCase().trim() : null,
      reason: s.reason,
      source: s.source,
      createdAt: s.createdAt,
    });
    return s;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return sqliteDb.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all() as AuditLog[];
  }

  addAuditLog(log: AuditLog): AuditLog {
    const stmt = sqliteDb.prepare(`
      INSERT INTO audit_logs (id, eventType, entityType, entityId, description, actor, timestamp)
      VALUES (@id, @eventType, @entityType, @entityId, @description, @actor, @timestamp)
    `);
    stmt.run(log);
    return log;
  }

  resetToSeed() {
    feedDatabaseData(true);
  }
}

export const db = new SQLiteStore();
