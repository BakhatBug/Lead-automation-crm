import { Router } from 'express';
import { InboxController } from './inbox.controller.js';

const router = Router();

router.get('/', InboxController.getAllConversations);
router.get('/:id', InboxController.getConversationById);
router.post('/:id/reply', InboxController.sendReply);
router.post('/:id/reclassify', InboxController.reclassifyConversation);
router.post('/:id/generate-draft', InboxController.generateDraft);

export default router;
