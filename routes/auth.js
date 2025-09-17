import { Router } from 'express';
import { body } from 'express-validator';
import { getLogin, getRegister, postLogin, postRegister, logout } from '../controllers/authController.js';
const r = Router();

r.get('/login', getLogin);
r.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  postLogin
);
r.get('/register', getRegister);
r.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('name').trim().escape(),
  body('password').isLength({ min: 6 }),
  postRegister
);
r.get('/logout', logout);

export default r;
