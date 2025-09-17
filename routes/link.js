import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { dashboard, listLinks, createLinkForm, createLink, editLinkForm, updateLink, deleteLink, openShort } from '../controllers/linkController.js';

const r = Router();
r.get('/dashboard', requireAuth, dashboard);
r.get('/links', requireAuth, listLinks);
r.get('/links/new', requireAuth, createLinkForm);
r.post('/links', requireAuth, createLink);
r.get('/links/:id/edit', requireAuth, editLinkForm);
r.post('/links/:id', requireAuth, updateLink);
r.post('/links/:id/delete', requireAuth, deleteLink);

app.get('/r/:code', (req, res, next) => {
  res.locals.layout = false;
  next();
}, openShort);
r.get('/adblock-warning', (req, res) => res.render('redirect/adblock_warning', { siteName: res.locals.SITE_NAME }));

export default r;
