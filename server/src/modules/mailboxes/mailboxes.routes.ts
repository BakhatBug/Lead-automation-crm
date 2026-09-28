import { Router } from 'express';
import { MailboxesController } from './mailboxes.controller.js';

const router = Router();

router.get('/', MailboxesController.getAllMailboxes);
router.get('/:id', MailboxesController.getMailboxById);
router.get('/:id/health', MailboxesController.getMailboxHealth);
router.post('/connect', MailboxesController.connectMailbox);
router.post('/webhook/simulate-reply', MailboxesController.simulateIncomingReply);

export default router;
