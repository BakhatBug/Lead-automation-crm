import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  initialLeads,
  initialCampaigns,
  initialMailboxes,
  initialConversations,
  initialOpportunities,
  initialTasks,
  initialMeetings,
  initialSuppressions,
  initialAuditLogs,
} from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'crm.sqlite');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const sqliteDb = new Database(DB_PATH);

// Enable WAL mode for high performance & concurrency
sqliteDb.pragma('journal_mode = WAL');

export function initDatabaseSchema() {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      firstName TEXT,
      lastName TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      company TEXT,
      title TEXT,
      website TEXT,
      industry TEXT,
      employeeCount INTEGER,
      score INTEGER,
      scoreBreakdown TEXT,
      status TEXT,
      campaignId TEXT,
      campaignName TEXT,
      tags TEXT,
      notes TEXT,
      verifiedEmail INTEGER DEFAULT 1,
      customAttributes TEXT,
      userId TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);

  try {
    sqliteDb.exec(`ALTER TABLE leads ADD COLUMN customAttributes TEXT;`);
  } catch (e) {}
  try {
    sqliteDb.exec(`ALTER TABLE leads ADD COLUMN userId TEXT;`);
  } catch (e) {}

  sqliteDb.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_campaignId ON leads(campaignId);
    CREATE INDEX IF NOT EXISTS idx_leads_userId ON leads(userId);

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT,
      objective TEXT,
      targetAudience TEXT,
      status TEXT,
      mailboxIds TEXT,
      steps TEXT,
      stats TEXT,
      safetyKillSwitch INTEGER DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS mailboxes (
      id TEXT PRIMARY KEY,
      provider TEXT,
      email TEXT UNIQUE,
      name TEXT,
      status TEXT,
      dailySendLimit INTEGER,
      sentToday INTEGER DEFAULT 0,
      warmUpProgress INTEGER DEFAULT 50,
      spfValid INTEGER DEFAULT 1,
      dkimValid INTEGER DEFAULT 1,
      dmarcValid INTEGER DEFAULT 1,
      lastSyncAt TEXT,
      smtpHost TEXT,
      smtpPort INTEGER,
      imapHost TEXT,
      imapPort INTEGER,
      username TEXT,
      useSsl INTEGER DEFAULT 1,
      warmupEnabled INTEGER DEFAULT 1,
      warmupStartingLimit INTEGER DEFAULT 5,
      warmupDailyIncrement INTEGER DEFAULT 3,
      warmupTargetLimit INTEGER DEFAULT 45,
      warmupReplyRate INTEGER DEFAULT 35,
      bounceCount INTEGER DEFAULT 0,
      bounceRate REAL DEFAULT 0.0,
      quarantineThreshold REAL DEFAULT 3.0,
      isQuarantined INTEGER DEFAULT 0,
      quarantineReason TEXT
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      leadId TEXT,
      contactName TEXT,
      contactEmail TEXT,
      company TEXT,
      subject TEXT,
      intent TEXT,
      intentConfidence REAL,
      intentReasoning TEXT,
      status TEXT,
      suggestedDraftReply TEXT,
      draftApproved INTEGER DEFAULT 0,
      lastActivityAt TEXT,
      unread INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_contactEmail ON conversations(contactEmail);
    CREATE INDEX IF NOT EXISTS idx_conversations_intent ON conversations(intent);

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversationId TEXT,
      mailboxId TEXT,
      providerMessageId TEXT,
      threadId TEXT,
      direction TEXT,
      fromEmail TEXT,
      toEmail TEXT,
      subject TEXT,
      bodyText TEXT,
      bodyHtml TEXT,
      rfcMessageId TEXT,
      inReplyTo TEXT,
      referencesHeader TEXT,
      timestamp TEXT,
      FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversationId ON messages(conversationId);

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT,
      accountId TEXT,
      leadId TEXT,
      contactName TEXT,
      company TEXT,
      amount REAL,
      currency TEXT,
      stage TEXT,
      probability INTEGER,
      expectedCloseDate TEXT,
      owner TEXT,
      sourceCampaignId TEXT,
      sourceCampaignName TEXT,
      notes TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      type TEXT,
      priority TEXT,
      status TEXT,
      dueDate TEXT,
      leadId TEXT,
      contactName TEXT,
      company TEXT,
      assignedTo TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      title TEXT,
      leadId TEXT,
      contactName TEXT,
      contactEmail TEXT,
      company TEXT,
      startTime TEXT,
      endTime TEXT,
      status TEXT,
      calendarLink TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS suppressions (
      id TEXT PRIMARY KEY,
      email TEXT,
      domain TEXT,
      reason TEXT,
      source TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      eventType TEXT,
      entityType TEXT,
      entityId TEXT,
      description TEXT,
      actor TEXT,
      timestamp TEXT
    );
  `);

  // Safe runtime column migration for existing SQLite databases
  try {
    const columns = (sqliteDb.pragma('table_info(mailboxes)') as Array<{ name: string }>).map((c) => c.name);
    if (!columns.includes('smtpHost')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN smtpHost TEXT');
    if (!columns.includes('smtpPort')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN smtpPort INTEGER');
    if (!columns.includes('imapHost')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN imapHost TEXT');
    if (!columns.includes('imapPort')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN imapPort INTEGER');
    if (!columns.includes('username')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN username TEXT');
    if (!columns.includes('useSsl')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN useSsl INTEGER DEFAULT 1');
    if (!columns.includes('warmupEnabled')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN warmupEnabled INTEGER DEFAULT 1');
    if (!columns.includes('warmupStartingLimit')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN warmupStartingLimit INTEGER DEFAULT 5');
    if (!columns.includes('warmupDailyIncrement')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN warmupDailyIncrement INTEGER DEFAULT 3');
    if (!columns.includes('warmupTargetLimit')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN warmupTargetLimit INTEGER DEFAULT 45');
    if (!columns.includes('warmupReplyRate')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN warmupReplyRate INTEGER DEFAULT 35');
    if (!columns.includes('bounceCount')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN bounceCount INTEGER DEFAULT 0');
    if (!columns.includes('bounceRate')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN bounceRate REAL DEFAULT 0.0');
    if (!columns.includes('quarantineThreshold')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN quarantineThreshold REAL DEFAULT 3.0');
    if (!columns.includes('isQuarantined')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN isQuarantined INTEGER DEFAULT 0');
    if (!columns.includes('quarantineReason')) sqliteDb.exec('ALTER TABLE mailboxes ADD COLUMN quarantineReason TEXT');
  } catch (e) {
    console.error('[Database Migration Error]', e);
  }
}

export function feedDatabaseData(forceReset: boolean = false) {
  initDatabaseSchema();

  const countRow = sqliteDb.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
  if (countRow.count > 0 && !forceReset) {
    console.log(`[Database] SQLite database has ${countRow.count} leads. Skipping seed.`);
    return;
  }

  console.log('[Database] Feeding SQLite database with complete initial sales dataset...');

  const transaction = sqliteDb.transaction(() => {
    // Clear existing
    sqliteDb.exec(`
      DELETE FROM messages;
      DELETE FROM conversations;
      DELETE FROM leads;
      DELETE FROM campaigns;
      DELETE FROM mailboxes;
      DELETE FROM opportunities;
      DELETE FROM tasks;
      DELETE FROM meetings;
      DELETE FROM suppressions;
      DELETE FROM audit_logs;
    `);

    // Insert Leads
    const insertLead = sqliteDb.prepare(`
      INSERT INTO leads (
        id, firstName, lastName, email, phone, company, title, website, industry, employeeCount,
        score, scoreBreakdown, status, campaignId, campaignName, tags, notes, verifiedEmail, createdAt, updatedAt
      ) VALUES (
        @id, @firstName, @lastName, @email, @phone, @company, @title, @website, @industry, @employeeCount,
        @score, @scoreBreakdown, @status, @campaignId, @campaignName, @tags, @notes, @verifiedEmail, @createdAt, @updatedAt
      )
    `);

    for (const lead of initialLeads) {
      insertLead.run({
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone || null,
        company: lead.company,
        title: lead.title,
        website: lead.website || null,
        industry: lead.industry || null,
        employeeCount: lead.employeeCount ?? null,
        score: lead.score,
        scoreBreakdown: JSON.stringify(lead.scoreBreakdown),
        status: lead.status,
        campaignId: lead.campaignId || null,
        campaignName: lead.campaignName || null,
        tags: JSON.stringify(lead.tags || []),
        notes: lead.notes || null,
        verifiedEmail: lead.verifiedEmail ? 1 : 0,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      });
    }

    // Insert Campaigns
    const insertCampaign = sqliteDb.prepare(`
      INSERT INTO campaigns (
        id, name, objective, targetAudience, status, mailboxIds, steps, stats, safetyKillSwitch, createdAt, updatedAt
      ) VALUES (
        @id, @name, @objective, @targetAudience, @status, @mailboxIds, @steps, @stats, @safetyKillSwitch, @createdAt, @updatedAt
      )
    `);

    for (const camp of initialCampaigns) {
      insertCampaign.run({
        id: camp.id,
        name: camp.name,
        objective: camp.objective,
        targetAudience: camp.targetAudience,
        status: camp.status,
        mailboxIds: JSON.stringify(camp.mailboxIds || []),
        steps: JSON.stringify(camp.steps || []),
        stats: JSON.stringify(camp.stats),
        safetyKillSwitch: camp.safetyKillSwitch ? 1 : 0,
        createdAt: camp.createdAt,
        updatedAt: camp.updatedAt,
      });
    }

    // Insert Mailboxes
    const insertMailbox = sqliteDb.prepare(`
      INSERT INTO mailboxes (
        id, provider, email, name, status, dailySendLimit, sentToday, warmUpProgress, spfValid, dkimValid, dmarcValid, lastSyncAt
      ) VALUES (
        @id, @provider, @email, @name, @status, @dailySendLimit, @sentToday, @warmUpProgress, @spfValid, @dkimValid, @dmarcValid, @lastSyncAt
      )
    `);

    for (const box of initialMailboxes) {
      insertMailbox.run({
        id: box.id,
        provider: box.provider,
        email: box.email,
        name: box.name,
        status: box.status,
        dailySendLimit: box.dailySendLimit,
        sentToday: box.sentToday,
        warmUpProgress: box.warmUpProgress,
        spfValid: box.spfValid ? 1 : 0,
        dkimValid: box.dkimValid ? 1 : 0,
        dmarcValid: box.dmarcValid ? 1 : 0,
        lastSyncAt: box.lastSyncAt,
      });
    }

    // Insert Conversations and Messages
    const insertConv = sqliteDb.prepare(`
      INSERT INTO conversations (
        id, leadId, contactName, contactEmail, company, subject, intent, intentConfidence,
        intentReasoning, status, suggestedDraftReply, draftApproved, lastActivityAt, unread
      ) VALUES (
        @id, @leadId, @contactName, @contactEmail, @company, @subject, @intent, @intentConfidence,
        @intentReasoning, @status, @suggestedDraftReply, @draftApproved, @lastActivityAt, @unread
      )
    `);

    const insertMsg = sqliteDb.prepare(`
      INSERT INTO messages (
        id, conversationId, mailboxId, providerMessageId, threadId, direction, fromEmail, toEmail,
        subject, bodyText, bodyHtml, rfcMessageId, inReplyTo, referencesHeader, timestamp
      ) VALUES (
        @id, @conversationId, @mailboxId, @providerMessageId, @threadId, @direction, @fromEmail, @toEmail,
        @subject, @bodyText, @bodyHtml, @rfcMessageId, @inReplyTo, @referencesHeader, @timestamp
      )
    `);

    for (const conv of initialConversations) {
      insertConv.run({
        id: conv.id,
        leadId: conv.leadId,
        contactName: conv.contactName,
        contactEmail: conv.contactEmail,
        company: conv.company,
        subject: conv.subject,
        intent: conv.intent,
        intentConfidence: conv.intentConfidence,
        intentReasoning: conv.intentReasoning,
        status: conv.status,
        suggestedDraftReply: conv.suggestedDraftReply || null,
        draftApproved: conv.draftApproved ? 1 : 0,
        lastActivityAt: conv.lastActivityAt,
        unread: conv.unread ? 1 : 0,
      });

      for (const msg of conv.messages) {
        insertMsg.run({
          id: msg.id,
          conversationId: conv.id,
          mailboxId: msg.mailboxId,
          providerMessageId: msg.providerMessageId,
          threadId: msg.threadId,
          direction: msg.direction,
          fromEmail: msg.fromEmail,
          toEmail: msg.toEmail,
          subject: msg.subject,
          bodyText: msg.bodyText,
          bodyHtml: msg.bodyHtml || null,
          rfcMessageId: msg.rfcMessageId || null,
          inReplyTo: msg.inReplyTo || null,
          referencesHeader: msg.references || null,
          timestamp: msg.timestamp,
        });
      }
    }

    // Insert Opportunities
    const insertOpp = sqliteDb.prepare(`
      INSERT INTO opportunities (
        id, title, accountId, leadId, contactName, company, amount, currency, stage, probability,
        expectedCloseDate, owner, sourceCampaignId, sourceCampaignName, notes, createdAt, updatedAt
      ) VALUES (
        @id, @title, @accountId, @leadId, @contactName, @company, @amount, @currency, @stage, @probability,
        @expectedCloseDate, @owner, @sourceCampaignId, @sourceCampaignName, @notes, @createdAt, @updatedAt
      )
    `);

    for (const opp of initialOpportunities) {
      insertOpp.run({
        id: opp.id,
        title: opp.title,
        accountId: opp.accountId || null,
        leadId: opp.leadId,
        contactName: opp.contactName,
        company: opp.company,
        amount: opp.amount,
        currency: opp.currency,
        stage: opp.stage,
        probability: opp.probability,
        expectedCloseDate: opp.expectedCloseDate,
        owner: opp.owner,
        sourceCampaignId: opp.sourceCampaignId || null,
        sourceCampaignName: opp.sourceCampaignName || null,
        notes: opp.notes || null,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
      });
    }

    // Insert Tasks
    const insertTask = sqliteDb.prepare(`
      INSERT INTO tasks (
        id, title, type, priority, status, dueDate, leadId, contactName, company, assignedTo, createdAt
      ) VALUES (
        @id, @title, @type, @priority, @status, @dueDate, @leadId, @contactName, @company, @assignedTo, @createdAt
      )
    `);

    for (const task of initialTasks) {
      insertTask.run({
        id: task.id,
        title: task.title,
        type: task.type,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        leadId: task.leadId || null,
        contactName: task.contactName || null,
        company: task.company || null,
        assignedTo: task.assignedTo,
        createdAt: task.createdAt,
      });
    }

    // Insert Meetings
    const insertMeeting = sqliteDb.prepare(`
      INSERT INTO meetings (
        id, title, leadId, contactName, contactEmail, company, startTime, endTime, status, calendarLink, notes
      ) VALUES (
        @id, @title, @leadId, @contactName, @contactEmail, @company, @startTime, @endTime, @status, @calendarLink, @notes
      )
    `);

    for (const meet of initialMeetings) {
      insertMeeting.run({
        id: meet.id,
        title: meet.title,
        leadId: meet.leadId || null,
        contactName: meet.contactName,
        contactEmail: meet.contactEmail,
        company: meet.company,
        startTime: meet.startTime,
        endTime: meet.endTime,
        status: meet.status,
        calendarLink: meet.calendarLink,
        notes: meet.notes || null,
      });
    }

    // Insert Suppressions
    const insertSuppression = sqliteDb.prepare(`
      INSERT INTO suppressions (id, email, domain, reason, source, createdAt)
      VALUES (@id, @email, @domain, @reason, @source, @createdAt)
    `);

    for (const sup of initialSuppressions) {
      insertSuppression.run({
        id: sup.id,
        email: sup.email || null,
        domain: sup.domain || null,
        reason: sup.reason,
        source: sup.source,
        createdAt: sup.createdAt,
      });
    }

    // Insert Audit Logs
    const insertAudit = sqliteDb.prepare(`
      INSERT INTO audit_logs (id, eventType, entityType, entityId, description, actor, timestamp)
      VALUES (@id, @eventType, @entityType, @entityId, @description, @actor, @timestamp)
    `);

    for (const log of initialAuditLogs) {
      insertAudit.run({
        id: log.id,
        eventType: log.eventType,
        entityType: log.entityType,
        entityId: log.entityId,
        description: log.description,
        actor: log.actor,
        timestamp: log.timestamp,
      });
    }
  });

  transaction();
  console.log('[Database] SQLite database successfully seeded with relational data.');
}
