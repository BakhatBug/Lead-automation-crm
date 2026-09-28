# 🚀 5-Module Team Division, Architecture & Refinement Roadmap

This document outlines the **5 Engineering Modules** designed for your 5-member team to work in parallel on Git and GitHub with zero merge friction and clear domain ownership.

---

## 🏗️ System Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │    Executive Cockpit & Dashboard       │
                      │    (Unified Funnel & Revenue OS)       │
                      └──────────────────┬─────────────────────┘
                                         │
     ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
     │                   │                               │                   │
┌────▼─────────────┐ ┌───▼──────────────┐ ┌──────────────▼─────┐ ┌───────────▼─────┐ ┌─────────────▼──────┐
│     MODULE 1     │ │     MODULE 2     │ │      MODULE 3      │ │     MODULE 4    │ │     MODULE 5       │
│ Lead Data &      │ │ Campaign Builder │ │ Mailbox &          │ │ Unified Inbox & │ │ Pipeline (CRM),    │
│ Ingestion Engine │ │ & Sequence Engine│ │ Deliverability     │ │ AI Conversation │ │ Calendar & Revenue │
│ (Team Member 1)  │ │ (Team Member 2)  │ │ (Team Member 3)    │ │ (Team Member 4) │ │ (Team Member 5)    │
└──────────────────┘ └──────────────────┘ └────────────────────┘ └─────────────────┘ └────────────────────┘
```

---

## 👤 Module 1: Lead Management, Import Wizard & Data Intelligence
**Assignee:** Team Member 1  
**Git Branch:** `module/1-lead-data`  
**Core Responsibility:** Lead ingestion, field mapping, data hygiene, transparent ICP scoring, and suppression management.

### 📂 Codebase Ownership
- **Backend:**
  - `server/src/modules/leads/leads.service.ts`
  - `server/src/modules/leads/leads.controller.ts`
  - `server/src/modules/leads/leads.routes.ts`
- **Frontend:**
  - `client/src/modules/leads/LeadsView.tsx`
  - `client/src/modules/leads/LeadImportModal.tsx`
  - `client/src/modules/leads/LeadDetailDrawer.tsx`
  - `client/src/modules/leads/SuppressionListModal.tsx`

### 🎯 Key Implemented Capabilities
1. **Multi-Step CSV / XLSX Ingestion Wizard:**
   - Raw text / file upload with sample CSV pre-population.
   - Auto-detection algorithm for 8+ CRM columns (`email`, `firstName`, `lastName`, `company`, `title`, `website`, `industry`, `employeeCount`).
   - Live validation preview showing first 5 rows and total row counts.
2. **Transparent ICP Fit Scoring (0–100):**
   - Title Seniority (up to 25 pts): C-Level / VP / Founder vs Director vs Manager.
   - Industry Fit (up to 35 pts): SaaS, Cloud, Tech, AI, Cybersecurity.
   - Company Scale (up to 20 pts): 20–500 employees sweet spot.
   - Data Completeness (up to 20 pts): Phone, Website, Names.
3. **Data Hygiene & Compliance:**
   - Deduplication: rejects duplicate emails automatically.
   - Suppression checking: checks incoming leads against workspace suppression rules.
4. **Lead 360 Detail Drawer:**
   - Visual breakdown bars for each scoring factor.
   - Quick convert to CRM Opportunity or instant suppression.

### 📋 Member 1 Refinement Tasks (Next Steps)
- [ ] Add `.xlsx` binary file drag-and-drop parsing using `xlsx` npm library.
- [ ] Connect external enrichment provider abstraction (e.g., Clay / Clearbit / Apollo API stub) to fetch missing LinkedIn URLs and employee counts.
- [ ] Add CSV export functionality with applied filters.
- [ ] Implement domain-level deduplication (alert if 3+ leads from the same company exist).

---

## 👤 Module 2: Campaign Builder & Sequence Automation Engine
**Assignee:** Team Member 2  
**Git Branch:** `module/2-campaign-engine`  
**Core Responsibility:** Campaign lifecycle, visual sequence builder, A/B variant copy testing, token interpolation, and safety kill-switches.

### 📂 Codebase Ownership
- **Backend:**
  - `server/src/modules/campaigns/sequence.engine.ts`
  - `server/src/modules/campaigns/campaigns.controller.ts`
  - `server/src/modules/campaigns/campaigns.routes.ts`
- **Frontend:**
  - `client/src/modules/campaigns/CampaignsView.tsx`
  - `client/src/modules/campaigns/CampaignWizardModal.tsx`
  - `client/src/modules/campaigns/SequenceTimelineEditor.tsx`

### 🎯 Key Implemented Capabilities
1. **Campaign Creation Wizard:**
   - Configure Campaign Objective, ICP Target Audience, and Mailbox Sending Pool.
2. **Visual Sequence Flow Editor:**
   - Sequence Steps: `EMAIL` touches, `WAIT` delays (business days), and `CONDITION` branch rules.
   - Template token interpolation: `{{firstName}}`, `{{company}}`, `{{title}}`, `{{industry}}`.
   - **A/B Variant Split Testing:** Add Variant B subject and body with deterministic 50/50 split.
3. **Sequence Execution & State Machine:**
   - `NEW` → `ENROLLED` → `ACTIVE` → `REPLIED` → `QUALIFIED` → `WON`.
   - Automatic stop conditions on prospect reply or meeting booked.
4. **Safety Kill-Switch (Blueprint Non-Negotiable):**
   - Instant campaign kill switch that locks outbound sends if spam or provider errors trigger.
5. **Batch Send Simulator:**
   - Dispatches step 1 to enrolled leads in batch with live UI counters.

### 📋 Member 2 Refinement Tasks (Next Steps)
- [ ] Add business-hour sending windows (e.g., send only 9:00 AM - 5:00 PM in prospect timezone).
- [ ] Add sequence branching logic: "If prospect clicked link in email 1, move to fast-track step 3".
- [ ] Build A/B test statistical significance calculator (show whether Variant A or B has higher positive reply rate).
- [ ] Add Multi-channel step options: "Task: Connect on LinkedIn" or "Task: SDR Phone Call".

---

## 👤 Module 3: Mailbox Infrastructure, Deliverability & Real-Time Sync
**Assignee:** Team Member 3  
**Git Branch:** `module/3-mailbox-deliverability`  
**Core Responsibility:** Mailbox connections (Google Workspace & Microsoft 365), warm-up gauges, sending quotas, DNS health (SPF, DKIM, DMARC), and webhook ingestion.

### 📂 Codebase Ownership
- **Backend:**
  - `server/src/modules/mailboxes/mailboxes.service.ts`
  - `server/src/modules/mailboxes/mailboxes.controller.ts`
  - `server/src/modules/mailboxes/mailboxes.routes.ts`
- **Frontend:**
  - `client/src/modules/mailboxes/MailboxesView.tsx`
  - `client/src/modules/mailboxes/ConnectMailboxModal.tsx`
  - `client/src/modules/mailboxes/SimulateReplyModal.tsx`

### 🎯 Key Implemented Capabilities
1. **Multi-Mailbox Management:**
   - Google Workspace & Microsoft 365 provider support.
   - Per-mailbox daily outbound sending limit (slider 15–100 emails/day).
   - Real-time gauge: `sentToday` vs `dailySendLimit`.
2. **Deliverability & Reputation Engine:**
   - DNS verification pills: SPF valid, DKIM 2048-bit valid, DMARC enforced.
   - Warm-up progress tracker (0–100%) to prevent spam folder placement.
3. **Inbound Webhook & RFC Thread Resolver:**
   - Webhook processor for inbound replies.
   - Preserves RFC headers: `Message-ID`, `In-Reply-To`, `References`.
4. **Interactive Inbound Webhook Simulator:**
   - Test modal with pre-configured scenarios (Meeting Request, Pricing Inquiry, Competitor Objection, Out of Office, Unsubscribe).
   - Simulates real-time push events from Gmail / Outlook and triggers AI pipeline.

### 📋 Member 3 Refinement Tasks (Next Steps)
- [ ] Integrate real Google Workspace OAuth2 flow (`google-auth-library`) with refresh token encryption.
- [ ] Integrate Microsoft Graph API (`@microsoft/microsoft-graph-client`) for Outlook mail sync.
- [ ] Implement live DNS lookup using Node.js `dns.promises.resolveTxt` to verify SPF and DMARC records against live domains.
- [ ] Implement mailbox rotation logic (round-robin sending across 5+ mailboxes to distribute load).

---

## 👤 Module 4: Unified Inbox & AI Conversation Intelligence
**Assignee:** Team Member 4  
**Git Branch:** `module/4-unified-inbox-ai`  
**Core Responsibility:** 3-column unified inbox, 10-class intent taxonomy classification, semantic confidence scoring, and grounded AI reply drafter.

### 📂 Codebase Ownership
- **Backend:**
  - `server/src/modules/inbox/ai.service.ts`
  - `server/src/modules/inbox/inbox.controller.ts`
  - `server/src/modules/inbox/inbox.routes.ts`
- **Frontend:**
  - `client/src/modules/inbox/InboxView.tsx`
  - `client/src/components/Badge.tsx` (IntentBadge)

### 🎯 Key Implemented Capabilities
1. **3-Column Sales Inbox:**
   - Column 1: Smart intent folders (Meeting Requests, Pricing, Positive Interest, Objections, OOO, Unsubscribed).
   - Column 2: Thread list with unread markers, company snippets, and intent badges.
   - Column 3: Full chronological thread bubbles with sender badges and timestamps.
2. **10-Class AI Intent Taxonomy:**
   - `INTERESTED` (Positive buying signals)
   - `MEETING_REQUEST` (Prospect proposes time/calendar)
   - `PRICING_REQUEST` (Asks about volume/seat costs)
   - `QUESTION` (General product inquiry)
   - `OBJECTION` (Mentions competitors like Apollo/HubSpot or budget)
   - `NOT_NOW` (Timing objection)
   - `NOT_INTERESTED` (Polite pass)
   - `OUT_OF_OFFICE` (Vacation/conference auto-reply)
   - `UNSUBSCRIBE` (Legal opt-out request)
   - `BOUNCE` (Delivery failure)
3. **Confidence Scoring & Reasoning:**
   - Displays percentage confidence (e.g., 97%) and human-readable rationale.
4. **Grounded AI Reply Assistant (Human-in-the-Loop):**
   - Generates contextual draft replies pre-referencing product facts and meeting links.
   - SDR can review, edit, or 1-click approve and send.
   - Reclassify button to re-evaluate threads with updated AI prompts.

### 📋 Member 4 Refinement Tasks (Next Steps)
- [ ] Connect Gemini 1.5 / OpenAI GPT-4o API using `.env` key for live generative responses.
- [ ] Add Workspace Knowledge Base manager: allow users to paste product brochures, FAQs, and pricing tiers that the AI cites in drafts.
- [ ] Add multi-language classification (Spanish, German, French replies).
- [ ] Add 1-click objection handling quick-swaps (e.g., "Switch to Apollo objection", "Switch to Budget objection").

---

## 👤 Module 5: Sales Pipeline (CRM), Calendar & Revenue Analytics
**Assignee:** Team Member 5  
**Git Branch:** `module/5-pipeline-analytics`  
**Core Responsibility:** Deals Kanban board, stage progression, Google/Outlook calendar discovery call booking, SDR task queue, and revenue attribution analytics.

### 📂 Codebase Ownership
- **Backend:**
  - `server/src/modules/pipeline/analytics.service.ts`
  - `server/src/modules/pipeline/pipeline.controller.ts`
  - `server/src/modules/pipeline/pipeline.routes.ts`
- **Frontend:**
  - `client/src/modules/pipeline/PipelineView.tsx`
  - `client/src/modules/pipeline/NewDealModal.tsx`
  - `client/src/modules/pipeline/BookMeetingModal.tsx`

### 🎯 Key Implemented Capabilities
1. **Deals Kanban Board:**
   - Stages: `Qualified` → `Meeting Scheduled` → `Proposal Sent` → `Closed Won 🏆`.
   - Total deal value counter ($) per column.
   - Probability bar (40% → 60% → 80% → 100%).
   - 1-click stage progression buttons.
2. **SDR Priority Action Queue:**
   - Automated task generation triggered by incoming positive replies or meeting prep.
   - Priority badges (`HIGH`, `MEDIUM`, `LOW`), due dates, and completion checkboxes.
3. **Calendar & Discovery Meetings:**
   - Synced meeting cards with attendee info, video call links (Zoom / Google Meet), and notes.
   - Direct booking modal with date-time picker.
4. **Full-Funnel & Campaign Revenue Attribution:**
   - Funnel metrics: Leads → Sent → Delivered → Replied → Positive → Meetings → Pipeline → Won Revenue ($).
   - Campaign ROI table showing sent vs won ARR for every campaign.

### 📋 Member 5 Refinement Tasks (Next Steps)
- [ ] Add drag-and-drop support on Kanban columns using HTML5 Drag and Drop or `@hello-pangea/dnd`.
- [ ] Add calendar time slot picker (e.g., Cal.com or Calendly webhook integration).
- [ ] Build CSV deal export & pipeline velocity chart (average days from qualified to won).
- [ ] Implement deal loss reason tracking modal when moving deal to `Closed Lost`.

---

## 🔄 Daily Collaboration Rhythm for the Team
1. **Standup (10 mins):** Each member shares:
   - What they built in their module.
   - What they are refining today.
   - Any dependency on another module's API.
2. **Cross-Module Integration Contract:**
   - All modules communicate through the typed REST API (`/api/...`).
   - If Member 4 updates conversation intent, Module 2 (Campaigns) and Module 5 (Pipeline) react through standard API contracts.
3. **Always Run Before Committing:**
   ```bash
   npm run build
   ```
