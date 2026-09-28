import { Router } from 'express';
import { PipelineController } from './pipeline.controller.js';

const router = Router();

router.get('/deals', PipelineController.getAllDeals);
router.post('/deals', PipelineController.createDeal);
router.patch('/deals/:id', PipelineController.updateDeal);

router.get('/tasks', PipelineController.getAllTasks);
router.post('/tasks', PipelineController.createTask);
router.patch('/tasks/:id', PipelineController.updateTask);

router.get('/meetings', PipelineController.getAllMeetings);
router.post('/meetings', PipelineController.bookMeeting);

router.get('/analytics/funnel', PipelineController.getFunnelAnalytics);

export default router;
