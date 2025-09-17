import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { sequelize, Setting } from './models/index.js';
import authRoutes from './routes/auth.js';
import linkRoutes from './routes/link.js';
import adminRoutes from './routes/admin.js';
import { injectUser } from './middleware/auth.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
app.set('io', io);

// security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15*60*1000, max: 400 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}));

// CSRF
const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);
app.use((req, res, next) => { res.locals.csrfToken = req.csrfToken(); next(); });

// view + static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(injectUser);

// globals
app.use(async (req, res, next) => {
  try {
    const siteName = (await Setting.findByPk('site_name'))?.value || process.env.SITE_NAME || 'ShortPro';
    res.locals.SITE_NAME = siteName;
    res.locals.BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT||3000}`;
  } catch {}
  next();
});

// routes
app.use(authRoutes);
app.use(linkRoutes);
app.use('/admin', adminRoutes);
app.get('/', (req, res) => res.redirect('/dashboard'));

// start
(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  server.listen(process.env.PORT || 3000, () => {
    console.log('Server running', process.env.PORT || 3000);
  });
})();
