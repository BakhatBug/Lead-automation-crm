export type LeadStatus =
  | 'NEW'
  | 'ENROLLED'
  | 'ACTIVE'
  | 'REPLIED'
  | 'QUALIFIED'
  | 'MEETING_BOOKED'
  | 'OPPORTUNITY'
  | 'WON'
  | 'LOST'
  | 'UNSUBSCRIBED'
  | 'BOUNCED';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  title: string;
  website?: string;
  industry?: string;
  employeeCount?: number;
  score: number;
  scoreBreakdown: {
    icpFit: number;
    titleSeniority: number;
    companyScale: number;
    completeness: number;
  };
  status: LeadStatus;
  campaignId?: string;
  campaignName?: string;
  tags: string[];
  notes?: string;
  verifiedEmail: boolean;
  customAttributes?: Record<string, any>;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  signals: string[];
  fitScore: number;
  location?: string;
  linkedinUrl?: string;
}

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'KILLED';

export interface SequenceStep {
  id: string;
  campaignId: string;
  stepNumber: number;
  type: 'EMAIL' | 'WAIT' | 'CONDITION' | 'TASK';
  delayDays: number;
  subject: string;
  bodyTemplate: string;
  variantB?: {
    subject: string;
    bodyTemplate: string;
  };
  conditionRules?: {
    ifReplied: 'STOP_SEQUENCE' | 'MOVE_TO_STEP' | 'NOTIFY_SDR';
    ifNoReplyDays: number;
  };
}

export interface CampaignStats {
  leadsCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  repliedCount: number;
  positiveRepliesCount: number;
  meetingsBooked: number;
  opportunitiesCreated: number;
  revenueWon: number;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  targetAudience: string;
  status: CampaignStatus;
  mailboxIds: string[];
  steps: SequenceStep[];
  stats: CampaignStats;
  safetyKillSwitch: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MailboxProvider = 'GOOGLE' | 'MICROSOFT' | 'HOSTINGER' | 'ZOHO' | 'CUSTOM_SMTP';
export type MailboxStatus = 'HEALTHY' | 'WARNING' | 'DISCONNECTED';

export interface Mailbox {
  id: string;
  provider: MailboxProvider;
  email: string;
  name: string;
  status: MailboxStatus;
  dailySendLimit: number;
  sentToday: number;
  warmUpProgress: number; // 0 to 100%
  spfValid: boolean;
  dkimValid: boolean;
  dmarcValid: boolean;
  lastSyncAt: string;
  // Custom SMTP/IMAP credentials & host details
  smtpHost?: string;
  smtpPort?: number;
  imapHost?: string;
  imapPort?: number;
  username?: string;
  useSsl?: boolean;
}

export type EmailDirection = 'OUTBOUND' | 'INBOUND';

export interface Message {
  id: string;
  conversationId: string;
  mailboxId: string;
  providerMessageId: string;
  threadId: string;
  direction: EmailDirection;
  fromEmail: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  rfcMessageId?: string;
  inReplyTo?: string;
  references?: string;
  timestamp: string;
}

export type ReplyIntent =
  | 'INTERESTED'
  | 'MEETING_REQUEST'
  | 'PRICING_REQUEST'
  | 'QUESTION'
  | 'OBJECTION'
  | 'NOT_NOW'
  | 'NOT_INTERESTED'
  | 'OUT_OF_OFFICE'
  | 'UNSUBSCRIBE'
  | 'BOUNCE'
  | 'UNKNOWN';

export type ConversationStatus = 'NEEDS_REPLY' | 'WAITING' | 'RESOLVED' | 'CLOSED';

export interface Conversation {
  id: string;
  leadId: string;
  contactName: string;
  contactEmail: string;
  company: string;
  subject: string;
  intent: ReplyIntent;
  intentConfidence: number; // 0.0 to 1.0
  intentReasoning: string;
  status: ConversationStatus;
  messages: Message[];
  suggestedDraftReply?: string;
  draftApproved?: boolean;
  lastActivityAt: string;
  unread: boolean;
}

export type DealStage =
  | 'NEW_DISCOVERED'
  | 'CONTACTED'
  | 'ENGAGED'
  | 'QUALIFIED'
  | 'MEETING_SCHEDULED'
  | 'PROPOSAL'
  | 'WON'
  | 'LOST';

export interface Opportunity {
  id: string;
  title: string;
  accountId?: string;
  leadId: string;
  contactName: string;
  company: string;
  amount: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  owner: string;
  sourceCampaignId?: string;
  sourceCampaignName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  type: 'CALL' | 'EMAIL_FOLLOWUP' | 'REVIEW_ACCOUNT' | 'MEETING_PREP';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED';
  dueDate: string;
  leadId?: string;
  contactName?: string;
  company?: string;
  assignedTo: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  leadId: string;
  contactName: string;
  contactEmail: string;
  company: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  calendarLink: string;
  notes?: string;
}

export interface Suppression {
  id: string;
  email?: string;
  domain?: string;
  reason: 'UNSUBSCRIBE' | 'BOUNCE' | 'MANUAL' | 'LEGAL';
  source: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  description: string;
  actor: string;
  timestamp: string;
}
