import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadsRouter from './modules/leads/leads.routes.js';
import campaignsRouter from './modules/campaigns/campaigns.routes.js';
import mailboxesRouter from './modules/mailboxes/mailboxes.routes.js';
import inboxRouter from './modules/inbox/inbox.routes.js';
import pipelineRouter from './modules/pipeline/pipeline.routes.js';
import { db } from './db/store.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Module APIs
app.use('/api/leads', leadsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/mailboxes', mailboxesRouter);
app.use('/api/conversations', inboxRouter);
app.use('/api/pipeline', pipelineRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    platform: 'AI Sales Outbound CRM Operating System',
    timestamp: new Date().toISOString(),
    modules: {
      module1_leads: 'Active',
      module2_campaigns: 'Active',
      module3_mailboxes: 'Active',
      module4_inbox_ai: 'Active',
      module5_pipeline: 'Active',
    },
  });
});

// Dev helper: reset to initial seed
app.post('/api/reset-seed', (_req, res) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Database reset to initial sample state.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AI Sales Outbound CRM Backend API running on port ${PORT}`);
  console.log(`👉 Module 1 (Leads & Enrichment):    http://localhost:${PORT}/api/leads`);
  console.log(`👉 Module 2 (Campaigns & Sequence): http://localhost:${PORT}/api/campaigns`);
  console.log(`👉 Module 3 (Mailboxes & Sync):     http://localhost:${PORT}/api/mailboxes`);
  console.log(`👉 Module 4 (Unified Inbox & AI):   http://localhost:${PORT}/api/conversations`);
  console.log(`👉 Module 5 (Pipeline & Analytics): http://localhost:${PORT}/api/pipeline/deals`);
  console.log(`======================================================\n`);
});
