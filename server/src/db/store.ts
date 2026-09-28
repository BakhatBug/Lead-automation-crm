import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

interface DatabaseSchema {
  leads: Lead[];
  campaigns: Campaign[];
  mailboxes: Mailbox[];
  conversations: Conversation[];
  opportunities: Opportunity[];
  tasks: Task[];
  meetings: Meeting[];
  suppressions: Suppression[];
  auditLogs: AuditLog[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class MemoryStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      leads: [...initialLeads],
      campaigns: [...initialCampaigns],
      mailboxes: [...initialMailboxes],
      conversations: [...initialConversations],
      opportunities: [...initialOpportunities],
      tasks: [...initialTasks],
      meetings: [...initialMeetings],
      suppressions: [...initialSuppressions],
      auditLogs: [...initialAuditLogs],
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } else {
        this.persist();
      }
    } catch (err) {
      console.error('Error initializing local database, falling back to memory seed:', err);
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  // --- Leads (Module 1) ---
  getLeads(): Lead[] {
    return this.data.leads;
  }

  getLeadById(id: string): Lead | undefined {
    return this.data.leads.find((l) => l.id === id);
  }

  getLeadByEmail(email: string): Lead | undefined {
    return this.data.leads.find((l) => l.email.toLowerCase() === email.toLowerCase());
  }

  addLead(lead: Lead): Lead {
    this.data.leads.unshift(lead);
    this.persist();
    return lead;
  }

  addLeads(leads: Lead[]): Lead[] {
    this.data.leads.unshift(...leads);
    this.persist();
    return leads;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead | undefined {
    const idx = this.data.leads.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.data.leads[idx] = {
      ...this.data.leads[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.leads[idx];
  }

  deleteLead(id: string): boolean {
    const before = this.data.leads.length;
    this.data.leads = this.data.leads.filter((l) => l.id !== id);
    const deleted = this.data.leads.length < before;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Campaigns (Module 2) ---
  getCampaigns(): Campaign[] {
    return this.data.campaigns;
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.data.campaigns.find((c) => c.id === id);
  }

  addCampaign(campaign: Campaign): Campaign {
    this.data.campaigns.unshift(campaign);
    this.persist();
    return campaign;
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Campaign | undefined {
    const idx = this.data.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.campaigns[idx] = {
      ...this.data.campaigns[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.campaigns[idx];
  }

  // --- Mailboxes (Module 3) ---
  getMailboxes(): Mailbox[] {
    return this.data.mailboxes;
  }

  getMailboxById(id: string): Mailbox | undefined {
    return this.data.mailboxes.find((m) => m.id === id);
  }

  addMailbox(mailbox: Mailbox): Mailbox {
    this.data.mailboxes.push(mailbox);
    this.persist();
    return mailbox;
  }

  updateMailbox(id: string, updates: Partial<Mailbox>): Mailbox | undefined {
    const idx = this.data.mailboxes.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.data.mailboxes[idx] = { ...this.data.mailboxes[idx], ...updates };
    this.persist();
    return this.data.mailboxes[idx];
  }

  // --- Conversations & Messages (Module 4) ---
  getConversations(): Conversation[] {
    return this.data.conversations;
  }

  getConversationById(id: string): Conversation | undefined {
    return this.data.conversations.find((c) => c.id === id);
  }

  getConversationByLeadId(leadId: string): Conversation | undefined {
    return this.data.conversations.find((c) => c.leadId === leadId);
  }

  addConversation(conversation: Conversation): Conversation {
    this.data.conversations.unshift(conversation);
    this.persist();
    return conversation;
  }

  updateConversation(id: string, updates: Partial<Conversation>): Conversation | undefined {
    const idx = this.data.conversations.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.conversations[idx] = { ...this.data.conversations[idx], ...updates };
    this.persist();
    return this.data.conversations[idx];
  }

  addMessageToConversation(conversationId: string, message: Message): Conversation | undefined {
    const conv = this.getConversationById(conversationId);
    if (!conv) return undefined;
    conv.messages.push(message);
    conv.lastActivityAt = message.timestamp;
    this.persist();
    return conv;
  }

  // --- Opportunities / Pipeline (Module 5) ---
  getOpportunities(): Opportunity[] {
    return this.data.opportunities;
  }

  getOpportunityById(id: string): Opportunity | undefined {
    return this.data.opportunities.find((o) => o.id === id);
  }

  addOpportunity(opportunity: Opportunity): Opportunity {
    this.data.opportunities.unshift(opportunity);
    this.persist();
    return opportunity;
  }

  updateOpportunity(id: string, updates: Partial<Opportunity>): Opportunity | undefined {
    const idx = this.data.opportunities.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    this.data.opportunities[idx] = {
      ...this.data.opportunities[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.opportunities[idx];
  }

  // --- Tasks ---
  getTasks(): Task[] {
    return this.data.tasks;
  }

  addTask(task: Task): Task {
    this.data.tasks.unshift(task);
    this.persist();
    return task;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
    this.persist();
    return this.data.tasks[idx];
  }

  // --- Meetings ---
  getMeetings(): Meeting[] {
    return this.data.meetings;
  }

  addMeeting(meeting: Meeting): Meeting {
    this.data.meetings.unshift(meeting);
    this.persist();
    return meeting;
  }

  // --- Suppressions ---
  getSuppressions(): Suppression[] {
    return this.data.suppressions;
  }

  isSuppressed(email: string, domain?: string): boolean {
    const cleanEmail = email.toLowerCase().trim();
    const cleanDomain = (domain || email.split('@')[1] || '').toLowerCase().trim();
    return this.data.suppressions.some(
      (s) =>
        (s.email && s.email.toLowerCase() === cleanEmail) ||
        (s.domain && s.domain.toLowerCase() === cleanDomain)
    );
  }

  addSuppression(suppression: Suppression): Suppression {
    this.data.suppressions.unshift(suppression);
    this.persist();
    return suppression;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  addAuditLog(log: AuditLog): AuditLog {
    this.data.auditLogs.unshift(log);
    this.persist();
    return log;
  }

  // Reset to initial seed
  resetToSeed() {
    this.data = {
      leads: [...initialLeads],
      campaigns: [...initialCampaigns],
      mailboxes: [...initialMailboxes],
      conversations: [...initialConversations],
      opportunities: [...initialOpportunities],
      tasks: [...initialTasks],
      meetings: [...initialMeetings],
      suppressions: [...initialSuppressions],
      auditLogs: [...initialAuditLogs],
    };
    this.persist();
  }
}

export const db = new MemoryStore();
