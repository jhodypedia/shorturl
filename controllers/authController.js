import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { User } from '../models/index.js';

export const getLogin = (req, res) => res.render('auth/login');
export const getRegister = (req, res) => res.render('auth/register');

export const postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('auth/register', { error: 'Data tidak valid' });

  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    req.session.user = { id: user.id, name: user.name, role: user.role };

    // realtime notify
    const io = req.app.get('io');
    io.emit('new_user', { name: user.name, email: user.email });
    io.emit('update_counter', { type: 'users', value: await User.count() });

    res.redirect('/dashboard');
  } catch (e) {
    res.render('auth/register', { error: 'Email sudah digunakan' });
  }
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.render('auth/login', { error: 'Email/Password salah' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.render('auth/login', { error: 'Email/Password salah' });
  if (user.status !== 'active') return res.render('auth/login', { error: 'Akun disuspend' });
  req.session.user = { id: user.id, name: user.name, role: user.role };
  res.redirect('/dashboard');
};

export const logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
