import { v4 as uuidv4 } from 'uuid';
import { Link, Click, Setting, User } from '../models/index.js';
import * as UAParser from 'ua-parser-js';
const parser = new UAParser.UAParser();
import geoip from 'geoip-lite';

const genCode = () => uuidv4().split('-')[0];

export const dashboard = async (req, res) => {
  const links = await Link.findAll({ where: { userId: req.session.user.id }, order: [['id','DESC']] });
  res.render('user/dashboard', { links });
};
export const listLinks = async (req, res) => {
  const links = await Link.findAll({ where: { userId: req.session.user.id }, order: [['id','DESC']] });
  res.render('user/links', { links });
};
export const createLinkForm = (req, res) => res.render('user/link_new');
export const createLink = async (req, res) => {
  const { target, title } = req.body;
  const code = genCode();
  await Link.create({ code, target, title, userId: req.session.user.id });

  const io = req.app.get('io');
  io.emit('update_counter', { type: 'links', value: await Link.count() });

  res.redirect('/links');
};
export const editLinkForm = async (req, res) => {
  const link = await Link.findOne({ where: { id: req.params.id, userId: req.session.user.id } });
  if (!link) return res.redirect('/links');
  res.render('user/link_edit', { link });
};
export const updateLink = async (req, res) => {
  const { target, title, enabled } = req.body;
  await Link.update({ target, title, enabled: enabled === 'on' }, { where: { id: req.params.id, userId: req.session.user.id } });
  res.redirect('/links');
};
export const deleteLink = async (req, res) => {
  await Link.destroy({ where: { id: req.params.id, userId: req.session.user.id } });
  res.redirect('/links');
};

// public short open
export const openShort = async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOne({ where: { code, enabled: true }, include: [{ model: User }] });
  if (!link) return res.status(404).send('Link tidak ditemukan');

  const parser = new UAParser(req.headers['user-agent']);
  const uaData = parser.getResult();
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  const geo = geoip.lookup(ip);

  const newClick = await Click.create({
    linkId: link.id,
    ip,
    ua: req.headers['user-agent'],
    device: uaData.device?.type || 'desktop',
    country: geo?.country || '??',
    referer: req.get('referer') || null
  });

  // realtime
  const io = req.app.get('io');
  io.emit('new_click', { link: link.code, linkId: link.id, user: link.userId, ip, country: geo?.country || '??', date: newClick.createdAt.toISOString().split('T')[0] });
  io.emit('update_counter', { type: 'clicks', value: await Click.count() });

  // settings
  const siteName = (await Setting.findByPk('site_name'))?.value || process.env.SITE_NAME || 'ShortPro';
  const adUrl = (await Setting.findByPk('adsterra_url'))?.value || process.env.ADSTERRA_URL || '';
  const adScript = (await Setting.findByPk('adsterra_script'))?.value || '';
  const antiAdblock = (await Setting.findByPk('anti_adblock'))?.value || 'off';

  res.render('redirect/ads', { target: link.target, adUrl, adScript, siteName, antiAdblock });
};
