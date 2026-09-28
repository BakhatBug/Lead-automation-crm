import { Router } from 'express';
import { LeadsController } from './leads.controller.js';

const router = Router();

router.get('/', LeadsController.getAllLeads);
router.get('/suppressions', LeadsController.getSuppressions);
router.post('/suppressions', LeadsController.addSuppression);
router.get('/:id', LeadsController.getLeadById);
router.post('/', LeadsController.createLead);
router.patch('/:id', LeadsController.updateLead);
router.delete('/:id', LeadsController.deleteLead);
router.post('/parse-preview', LeadsController.parsePreview);
router.post('/import', LeadsController.importLeads);

export default router;
