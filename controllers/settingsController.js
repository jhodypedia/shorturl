import { Setting } from '../models/index.js';

export const settingsForm = async (req, res) => {
  const entries = await Setting.findAll();
  const s = Object.fromEntries(entries.map(e => [e.key, e.value]));
  res.render('admin/settings', { s });
};

export const settingsSave = async (req, res) => {
  const pairs = ['site_name','adsterra_url','adsterra_script','brand_color','brand_logo','anti_adblock'];
  for (const key of pairs) {
    let value = req.body[key] || '';
    if (key === 'anti_adblock') value = req.body[key] ? 'on' : 'off';
    await Setting.upsert({ key, value });
  }
  res.redirect('/admin/settings');
};
