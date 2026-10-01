import { Router } from 'express';
import { MailboxesController } from './mailboxes.controller.js';

const router = Router();

router.get('/', MailboxesController.getAllMailboxes);
router.get('/:id', MailboxesController.getMailboxById);
router.get('/:id/health', MailboxesController.getMailboxHealth);
router.get('/:id/dns', MailboxesController.getDnsDiagnostics);
router.patch('/:id', MailboxesController.updateMailbox);
router.post('/connect', MailboxesController.connectMailbox);
router.post('/test-connection', MailboxesController.testMailboxConnection);
router.post('/dispatch-pool/simulate', MailboxesController.simulateDispatchPool);
router.post('/dispatch-pool/execute', MailboxesController.executeDispatchBatch);
router.post('/webhook/simulate-reply', MailboxesController.simulateIncomingReply);
router.post('/:id/bounce', MailboxesController.recordBounce);
router.post('/:id/quarantine/reset', MailboxesController.resetQuarantine);

export default router;
