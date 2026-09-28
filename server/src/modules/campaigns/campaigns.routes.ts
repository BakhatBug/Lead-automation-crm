import { Router } from 'express';
import { CampaignsController } from './campaigns.controller.js';

const router = Router();

router.get('/', CampaignsController.getAllCampaigns);
router.get('/:id', CampaignsController.getCampaignById);
router.post('/', CampaignsController.createCampaign);
router.patch('/:id', CampaignsController.updateCampaign);
router.post('/:id/launch', CampaignsController.launchCampaign);
router.post('/:id/pause', CampaignsController.pauseCampaign);
router.post('/:id/kill-switch', CampaignsController.toggleKillSwitch);
router.post('/:id/enroll-leads', CampaignsController.enrollLeads);
router.post('/:id/simulate-send', CampaignsController.simulateSendBatch);

export default router;
