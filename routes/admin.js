import { Router } from 'express';
import adminOnly from '../middleware/adminOnly.js';
import { requireAuth } from '../middleware/auth.js';
import { adminDashboard, usersTable, toggleUser, linksTable, linkStats } from '../controllers/adminController.js';
import { settingsForm, settingsSave } from '../controllers/settingsController.js';

const r = Router();
r.use(requireAuth, adminOnly);

r.get('/', adminDashboard);
r.get('/users', usersTable);
r.post('/users/:id/toggle', toggleUser);
r.get('/links', linksTable);
r.get('/links/:id/stats', linkStats);
r.get('/settings', settingsForm);
r.post('/settings', settingsSave);

export default r;
