import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { DashboardView } from './modules/dashboard/DashboardView.js';
import { LeadsView } from './modules/leads/LeadsView.js';
import { CampaignsView } from './modules/campaigns/CampaignsView.js';
import { MailboxesView } from './modules/mailboxes/MailboxesView.js';
import { InboxView } from './modules/inbox/InboxView.js';
import { PipelineView } from './modules/pipeline/PipelineView.js';
import { LeadImportModal } from './modules/leads/LeadImportModal.js';
import { CampaignWizardModal } from './modules/campaigns/CampaignWizardModal.js';
import { SimulateReplyModal } from './modules/mailboxes/SimulateReplyModal.js';
import { NewDealModal } from './modules/pipeline/NewDealModal.js';
import { BookMeetingModal } from './modules/pipeline/BookMeetingModal.js';
import { api } from './api/index.js';
import { Mailbox, Lead } from './types/index.js';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [unreadInboxCount, setUnreadInboxCount] = useState(0);

  // Global modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCampaignWizardOpen, setIsCampaignWizardOpen] = useState(false);
  const [isSimulateReplyOpen, setIsSimulateReplyOpen] = useState(false);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isBookMeetingOpen, setIsBookMeetingOpen] = useState(false);

  // Context pre-fill for conversions
  const [convertDealLead, setConvertDealLead] = useState<{
    leadId: string;
    contactName: string;
    company: string;
  } | null>(null);

  const [bookMeetingLead, setBookMeetingLead] = useState<{
    leadId: string;
    contactName: string;
    contactEmail: string;
    company: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshSharedData();
  }, []);

  const refreshSharedData = async () => {
    try {
      const [mBoxes, convs] = await Promise.all([api.getMailboxes(), api.getConversations()]);
      setMailboxes(mBoxes);
      setUnreadInboxCount(convs.filter((c) => c.unread).length);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetSeed = async () => {
    try {
      await api.resetSeedData();
      await refreshSharedData();
      showToast('Database reset to fresh initial mock state!');
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    }
  };

  const handleOpenConvertDeal = (lead: Lead) => {
    setConvertDealLead({
      leadId: lead.id,
      contactName: `${lead.firstName} ${lead.lastName}`.trim(),
      company: lead.company,
    });
    setIsNewDealOpen(true);
  };

  const handleOpenBookMeeting = (
    leadId: string,
    contactName: string,
    contactEmail: string,
    company: string
  ) => {
    setBookMeetingLead({
      leadId,
      contactName,
      contactEmail,
      company,
    });
    setIsBookMeetingOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadInboxCount={unreadInboxCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onResetSeed={handleResetSeed}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenNewCampaign={() => setIsCampaignWizardOpen(true)}
          onOpenSimulateReply={() => setIsSimulateReplyOpen(true)}
        />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
            <span>✨ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* View Switcher */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenImport={() => setIsImportOpen(true)}
              onOpenNewCampaign={() => setIsCampaignWizardOpen(true)}
              onOpenSimulateReply={() => setIsSimulateReplyOpen(true)}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView onOpenConvertModal={handleOpenConvertDeal} />
          )}

          {activeTab === 'campaigns' && <CampaignsView />}

          {activeTab === 'mailboxes' && <MailboxesView />}

          {activeTab === 'inbox' && (
            <InboxView
              onBookMeetingForLead={handleOpenBookMeeting}
              onConvertDealForLead={(leadId, name, company) => {
                setConvertDealLead({ leadId, contactName: name, company });
                setIsNewDealOpen(true);
              }}
            />
          )}

          {activeTab === 'pipeline' && <PipelineView />}
        </main>
      </div>

      {/* Global Modals */}
      <LeadImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          refreshSharedData();
          showToast('CSV Leads imported and scored!');
        }}
      />

      <CampaignWizardModal
        isOpen={isCampaignWizardOpen}
        onClose={() => setIsCampaignWizardOpen(false)}
        onSuccess={() => {
          refreshSharedData();
          showToast('New campaign created!');
        }}
        mailboxes={mailboxes}
      />

      <SimulateReplyModal
        isOpen={isSimulateReplyOpen}
        onClose={() => setIsSimulateReplyOpen(false)}
        onSuccess={() => {
          refreshSharedData();
          showToast('Inbound webhook reply processed through AI intent pipeline!');
        }}
        mailboxes={mailboxes}
      />

      <NewDealModal
        isOpen={isNewDealOpen}
        onClose={() => {
          setIsNewDealOpen(false);
          setConvertDealLead(null);
        }}
        onSuccess={() => {
          refreshSharedData();
          showToast('Opportunity added to sales pipeline!');
        }}
        initialLead={convertDealLead}
      />

      <BookMeetingModal
        isOpen={isBookMeetingOpen}
        onClose={() => {
          setIsBookMeetingOpen(false);
          setBookMeetingLead(null);
        }}
        onSuccess={() => {
          refreshSharedData();
          showToast('Meeting booked and calendar event synced!');
        }}
        initialLead={bookMeetingLead}
      />
    </div>
  );
}

export default App;
