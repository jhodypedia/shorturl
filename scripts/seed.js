import bcrypt from 'bcrypt';
import { User, Setting } from '../models/index.js';

const adminPass = await bcrypt.hash('admin123', 10);
await User.findOrCreate({
  where: { email: 'admin@site.com' },
  defaults: { name: 'Admin', password: adminPass, role: 'admin', status: 'active' }
});
await Setting.upsert({ key: 'site_name', value: 'ShortPro' });
await Setting.upsert({ key: 'adsterra_url', value: process.env.ADSTERRA_URL || '' });
await Setting.upsert({ key: 'anti_adblock', value: 'off' });
console.log('Seed ok');
process.exit(0);
