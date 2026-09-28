# ⚡ VORTEX CRM — AI Outbound Sales Operating System

> **A research-backed B2B sales engagement platform and CRM that turns raw lead files into closed revenue through grounded AI and automated reply intelligence.**

Built according to the comprehensive blueprint in [AI_Sales_Outbound_CRM_Product_Research_and_Blueprint.docx](file:///d:/Projects/lead%20automation/AI_Sales_Outbound_CRM_Product_Research_and_Blueprint.docx).

---

## 🎯 The Core Loop
```
CSV Import → Auto-Clean & Enrich → Transparent ICP Score → Generate Grounded Sequence
       ↓
Send Through Connected Mailboxes (Google / M365 with Rate Limits & DNS Health)
       ↓
Real-Time Inbound Webhook Push → Reconstruct RFC Message Thread
       ↓
10-Class AI Reply Intent Classifier (Meeting, Pricing, Objection, OOO, Unsubscribe)
       ↓
Stop / Branch Sequence → Grounded AI Draft Reply (Human Approval)
       ↓
Move Pipeline Opportunity (Kanban) → Book Calendar Discovery Call → Revenue Attribution
```

---

## 👥 5-Module Team Division & Ownership

| Module | Focus Area | Assignee | Git Branch |
| :--- | :--- | :--- | :--- |
| **Module 1** | **Lead Ingestion & ICP Scoring** | Team Member 1 | `module/1-lead-data` |
| **Module 2** | **Campaign Builder & Sequence Engine** | Team Member 2 | `module/2-campaign-engine` |
| **Module 3** | **Mailbox & Deliverability Infrastructure** | Team Member 3 | `module/3-mailbox-deliverability` |
| **Module 4** | **Unified Inbox & AI Intent Intelligence** | Team Member 4 | `module/4-unified-inbox-ai` |
| **Module 5** | **Pipeline CRM, Calendar & Revenue Analytics**| Team Member 5 | `module/5-pipeline-analytics` |

👉 **Read the full specs, user stories, and acceptance criteria in [MODULES_DIVISION_AND_ROADMAP.md](file:///d:/Projects/lead%20automation/MODULES_DIVISION_AND_ROADMAP.md).**  
👉 **Read the Git workflow and PR guidelines in [GITHUB_COLLABORATION_GUIDE.md](file:///d:/Projects/lead%20automation/GITHUB_COLLABORATION_GUIDE.md).**

---

## 🚀 Quickstart: Run Locally in 60 Seconds

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 10+

### Installation & Launch
```bash
# 1. From root directory, install dependencies:
npm install
cd server && npm install
cd ../client && npm install
cd ..

# 2. Run both Backend API and Frontend UI concurrently:
npm run dev
```

- **Frontend Application UI:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🌟 Key Product Features Implemented

### 1. Executive Cockpit Dashboard
- Active Pipeline counter (`$208,000`), Closed Won ARR (`$24,000`), Positive Reply Rate (`37.5%`), and Booked Meetings.
- Interactive 5-Module Team Roadmap with 1-click navigation.
- Recent AI-classified reply feed & urgent SDR task ticker.

### 2. Lead Management & Smart CSV Ingestion (Module 1)
- **4-Step CSV Wizard:** Upload / Paste CSV, auto-detect 8+ columns, validation preview with hygiene checks (skips duplicates and suppressed contacts), and batch ICP scoring.
- **Lead 360 Drawer:** Transparent scoring breakdown (Industry Fit, Title Seniority, Scale, Data Completeness), firmographics, and 1-click convert to deal.
- **Workspace Suppression List:** Full CAN-SPAM and PECR compliance rules.

### 3. Campaign Builder & Sequence Automation (Module 2)
- Multi-step visual sequence builder: `EMAIL` steps with token interpolation (`{{firstName}}`, `{{company}}`), `WAIT` delays (business days), and `CONDITION` branch rules.
- **A/B Testing Engine:** 50/50 split test on email subject and body copy.
- **Safety Kill-Switch:** Blueprint non-negotiable safety control to immediately halt all campaign sends in an emergency.
- **Batch Send Simulator:** Dispatches step 1 to enrolled leads in batch with live counter updates.

### 4. Mailbox & Deliverability Infrastructure (Module 3)
- Connect Google Workspace and Microsoft 365 mailboxes.
- Daily sending limit slider (35–50 recommended) vs `sentToday` gauge to protect domain reputation.
- DNS Authentication monitoring: SPF, DKIM 2048-bit, and DMARC enforcement pills.
- **Inbound Webhook Simulator:** Inject test replies to verify webhook processing, RFC thread reconstruction, and AI classification live.

### 5. Unified Inbox & AI Intelligence (Module 4)
- **3-Column Sales Workspace:** Intent filter rail, conversation list, and chronological thread reader.
- **10-Class Reply Intent Taxonomy:** `INTERESTED`, `MEETING_REQUEST`, `PRICING_REQUEST`, `QUESTION`, `OBJECTION`, `NOT_NOW`, `NOT_INTERESTED`, `OUT_OF_OFFICE`, `UNSUBSCRIBE`, `BOUNCE`.
- **Grounded AI Reply Drafter:** Generates grounded, contextual responses ready for human review, editing, or 1-click dispatch.
- **Rerun AI Button:** Re-evaluates conversation threads on demand.

### 6. Sales Pipeline CRM, Calendar & Revenue Analytics (Module 5)
- **Deals Kanban Board:** Drag or advance deals through `Qualified` → `Meeting Scheduled` → `Proposal` → `Closed Won 🏆` with total deal value sum per column.
- **SDR Priority Task Queue:** Auto-generated action items triggered by positive replies.
- **Calendar Discovery Calls:** Synced meeting cards with attendee info, video call links, and booking modal.
- **Revenue Attribution Matrix:** Direct ROI tracking showing sent vs won ARR for every campaign.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Backend:** Node.js, Express, TypeScript, TSX, Cors, Multer, UUID
- **Database / Store:** Typed relational store with JSON persistence (`server/data/db.json`) and pre-seeded realistic B2B dataset
- **DevOps / CI:** GitHub Actions (`.github/workflows/ci.yml`), custom PR template
