import {
  Lead,
  Campaign,
  Mailbox,
  Conversation,
  Opportunity,
  Task,
  Meeting,
  Suppression,
  FunnelMetrics,
  AttributionRecord,
  AuditLog,
} from '../types/index.js';

const API_BASE = '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API Error: ${res.status} ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.error) errorMsg = errData.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Module 1: Leads
  getLeads: async (params?: { status?: string; campaignId?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.campaignId) q.append('campaignId', params.campaignId);
    if (params?.search) q.append('search', params.search);
    const res = await fetchJSON<{ success: boolean; leads: Lead[] }>(`/leads?${q.toString()}`);
    return res.leads;
  },

  getLeadById: async (id: string) => {
    const res = await fetchJSON<{ success: boolean; lead: Lead }>(`/leads/${id}`);
    return res.lead;
  },

  createLead: async (leadData: Partial<Lead>) => {
    const res = await fetchJSON<{ success: boolean; lead: Lead }>(`/leads`, {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
    return res.lead;
  },

  updateLead: async (id: string, updates: Partial<Lead>) => {
    const res = await fetchJSON<{ success: boolean; lead: Lead }>(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.lead;
  },

  deleteLead: async (id: string) => {
    return fetchJSON<{ success: boolean; message: string }>(`/leads/${id}`, { method: 'DELETE' });
  },

  parseCSVPreview: async (csvText: string) => {
    return fetchJSON<{
      success: boolean;
      totalRows: number;
      headers: string[];
      suggestedMapping: any;
      previewRows: any[];
    }>('/leads/parse-preview', {
      method: 'POST',
      body: JSON.stringify({ csvText }),
    });
  },

  importCSVLeads: async (csvText: string, mapping: any, tags?: string[]) => {
    return fetchJSON<{
      success: boolean;
      importedCount: number;
      duplicates: number;
      suppressed: number;
      invalidEmails: number;
      sampleLeads: Lead[];
    }>('/leads/import', {
      method: 'POST',
      body: JSON.stringify({ csvText, mapping, tags }),
    });
  },

  getSuppressions: async () => {
    const res = await fetchJSON<{ success: boolean; suppressions: Suppression[] }>('/leads/suppressions');
    return res.suppressions;
  },

  addSuppression: async (data: { email?: string; domain?: string; reason?: string }) => {
    const res = await fetchJSON<{ success: boolean; suppression: Suppression }>('/leads/suppressions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.suppression;
  },

  // Module 2: Campaigns
  getCampaigns: async () => {
    const res = await fetchJSON<{ success: boolean; campaigns: Campaign[] }>('/campaigns');
    return res.campaigns;
  },

  createCampaign: async (campaignData: Partial<Campaign>) => {
    const res = await fetchJSON<{ success: boolean; campaign: Campaign }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
    return res.campaign;
  },

  updateCampaign: async (id: string, updates: Partial<Campaign>) => {
    const res = await fetchJSON<{ success: boolean; campaign: Campaign }>(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.campaign;
  },

  launchCampaign: async (id: string) => {
    const res = await fetchJSON<{ success: boolean; message: string; campaign: Campaign }>(`/campaigns/${id}/launch`, {
      method: 'POST',
    });
    return res.campaign;
  },

  pauseCampaign: async (id: string) => {
    const res = await fetchJSON<{ success: boolean; message: string; campaign: Campaign }>(`/campaigns/${id}/pause`, {
      method: 'POST',
    });
    return res.campaign;
  },

  toggleKillSwitch: async (id: string) => {
    const res = await fetchJSON<{ success: boolean; message: string; campaign: Campaign }>(
      `/campaigns/${id}/kill-switch`,
      { method: 'POST' }
    );
    return res.campaign;
  },

  enrollLeadsInCampaign: async (campaignId: string, leadIds: string[]) => {
    return fetchJSON<{ success: boolean; enrolledCount: number; message: string }>(
      `/campaigns/${campaignId}/enroll-leads`,
      {
        method: 'POST',
        body: JSON.stringify({ leadIds }),
      }
    );
  },

  simulateCampaignSend: async (campaignId: string) => {
    return fetchJSON<{ success: boolean; sentCount: number; message: string }>(
      `/campaigns/${campaignId}/simulate-send`,
      { method: 'POST' }
    );
  },

  // Module 3: Mailboxes
  getMailboxes: async () => {
    const res = await fetchJSON<{ success: boolean; mailboxes: Mailbox[] }>('/mailboxes');
    return res.mailboxes;
  },

  getMailboxHealth: async (id: string) => {
    return fetchJSON<{
      success: boolean;
      diagnostics: {
        status: string;
        healthScore: number;
        issues: string[];
        recommendations: string[];
      };
    }>(`/mailboxes/${id}/health`);
  },

  connectMailbox: async (data: { provider: string; email: string; name?: string; dailySendLimit?: number }) => {
    const res = await fetchJSON<{ success: boolean; mailbox: Mailbox }>('/mailboxes/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.mailbox;
  },

  simulateInboundReply: async (data: {
    fromEmail: string;
    fromName?: string;
    subject?: string;
    bodyText: string;
    mailboxId?: string;
  }) => {
    return fetchJSON<{ success: boolean; message: string; conversation: Conversation }>(
      '/mailboxes/webhook/simulate-reply',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // Module 4: Unified Inbox & AI
  getConversations: async (params?: { intent?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.intent) q.append('intent', params.intent);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    const res = await fetchJSON<{ success: boolean; conversations: Conversation[] }>(`/conversations?${q.toString()}`);
    return res.conversations;
  },

  getConversationById: async (id: string) => {
    const res = await fetchJSON<{ success: boolean; conversation: Conversation }>(`/conversations/${id}`);
    return res.conversation;
  },

  sendReply: async (conversationId: string, bodyText: string, subject?: string) => {
    const res = await fetchJSON<{ success: boolean; message: string; conversation: Conversation }>(
      `/conversations/${conversationId}/reply`,
      {
        method: 'POST',
        body: JSON.stringify({ bodyText, subject }),
      }
    );
    return res.conversation;
  },

  reclassifyConversation: async (conversationId: string) => {
    return fetchJSON<{ success: boolean; classification: any; conversation: Conversation }>(
      `/conversations/${conversationId}/reclassify`,
      { method: 'POST' }
    );
  },

  generateDraft: async (conversationId: string) => {
    return fetchJSON<{ success: boolean; draft: string; conversation: Conversation }>(
      `/conversations/${conversationId}/generate-draft`,
      { method: 'POST' }
    );
  },

  // Module 5: Pipeline & Analytics
  getDeals: async (params?: { stage?: string; owner?: string }) => {
    const q = new URLSearchParams();
    if (params?.stage) q.append('stage', params.stage);
    if (params?.owner) q.append('owner', params.owner);
    const res = await fetchJSON<{ success: boolean; deals: Opportunity[] }>(`/pipeline/deals?${q.toString()}`);
    return res.deals;
  },

  createDeal: async (dealData: Partial<Opportunity>) => {
    const res = await fetchJSON<{ success: boolean; deal: Opportunity }>('/pipeline/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    });
    return res.deal;
  },

  updateDeal: async (id: string, updates: Partial<Opportunity>) => {
    const res = await fetchJSON<{ success: boolean; deal: Opportunity }>(`/pipeline/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.deal;
  },

  getTasks: async () => {
    const res = await fetchJSON<{ success: boolean; tasks: Task[] }>('/pipeline/tasks');
    return res.tasks;
  },

  createTask: async (taskData: Partial<Task>) => {
    const res = await fetchJSON<{ success: boolean; task: Task }>('/pipeline/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return res.task;
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const res = await fetchJSON<{ success: boolean; task: Task }>(`/pipeline/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.task;
  },

  getMeetings: async () => {
    const res = await fetchJSON<{ success: boolean; meetings: Meeting[] }>('/pipeline/meetings');
    return res.meetings;
  },

  bookMeeting: async (meetingData: Partial<Meeting>) => {
    const res = await fetchJSON<{ success: boolean; meeting: Meeting }>('/pipeline/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
    return res.meeting;
  },

  getFunnelAnalytics: async () => {
    return fetchJSON<{
      success: boolean;
      funnel: FunnelMetrics;
      attribution: AttributionRecord[];
      auditLogs: AuditLog[];
    }>('/pipeline/analytics/funnel');
  },

  resetSeedData: async () => {
    return fetchJSON<{ success: boolean; message: string }>('/reset-seed', { method: 'POST' });
  },
};
