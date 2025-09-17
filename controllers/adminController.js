import { User, Link } from '../models/index.js';
import { sequelize } from '../models/index.js';

// ===============================
// Dashboard Admin
// ===============================
export const adminDashboard = async (req, res) => {
  const [totals] = await sequelize.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) as totalUsers,
      (SELECT COUNT(*) FROM links) as totalLinks,
      (SELECT COUNT(*) FROM clicks) as totalClicks
  `, { type: sequelize.QueryTypes.SELECT });

  const range = parseInt(req.query.range || '7');
  const startDate = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

  // ✅ Statistik klik per hari
  const clicksByDay = await sequelize.query(`
    SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date,
           COUNT(id) as count
    FROM clicks
    WHERE createdAt >= :startDate
    GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
    ORDER BY date ASC
  `, {
    replacements: { startDate },
    type: sequelize.QueryTypes.SELECT
  });

  // ✅ Top 5 links
  const topLinks = await sequelize.query(`
    SELECT l.id, l.code, l.title, u.name,
           COUNT(c.id) as clickCount
    FROM clicks c
    JOIN links l ON l.id = c.linkId
    JOIN users u ON u.id = l.userId
    WHERE c.createdAt >= :startDate
    GROUP BY l.id, l.code, l.title, u.name
    ORDER BY clickCount DESC
    LIMIT 5
  `, {
    replacements: { startDate },
    type: sequelize.QueryTypes.SELECT
  });

  // ✅ Top countries
  const topCountries = await sequelize.query(`
    SELECT country, COUNT(id) as count
    FROM clicks
    WHERE createdAt >= :startDate
    GROUP BY country
    ORDER BY count DESC
    LIMIT 5
  `, {
    replacements: { startDate },
    type: sequelize.QueryTypes.SELECT
  });

  // ✅ Top browsers
  const topBrowsers = await sequelize.query(`
    SELECT TRIM(SUBSTRING_INDEX(ua, ' ', 1)) as browser,
           COUNT(id) as count
    FROM clicks
    WHERE createdAt >= :startDate
    GROUP BY browser
    ORDER BY count DESC
    LIMIT 5
  `, {
    replacements: { startDate },
    type: sequelize.QueryTypes.SELECT
  });

  // ✅ Device distribution
  const deviceDist = await sequelize.query(`
    SELECT device, COUNT(id) as count
    FROM clicks
    WHERE createdAt >= :startDate
    GROUP BY device
  `, {
    replacements: { startDate },
    type: sequelize.QueryTypes.SELECT
  });

  const chartData = {
    labels: clicksByDay.map(c => c.date),
    values: clicksByDay.map(c => c.count)
  };

  res.render('admin/dashboard', {
    totalUsers: totals.totalUsers,
    totalLinks: totals.totalLinks,
    totalClicks: totals.totalClicks,
    chartData,
    topLinks,
    topCountries,
    topBrowsers,
    deviceDist,
    range
  });
};

// ===============================
// Users Management
// ===============================
export const usersTable = async (req, res) => {
  const users = await sequelize.query(`
    SELECT * FROM users ORDER BY id DESC
  `, { type: sequelize.QueryTypes.SELECT });

  res.render('admin/users', { users });
};

export const toggleUser = async (req, res) => {
  await sequelize.query(`
    UPDATE users
    SET status = CASE WHEN status = 'active' THEN 'suspended' ELSE 'active' END
    WHERE id = :id
  `, {
    replacements: { id: req.params.id }
  });
  res.redirect('/admin/users');
};

// ===============================
// Links Management
// ===============================
export const linksTable = async (req, res) => {
  const links = await sequelize.query(`
    SELECT l.*, u.name, u.email
    FROM links l
    JOIN users u ON u.id = l.userId
    ORDER BY l.id DESC
  `, { type: sequelize.QueryTypes.SELECT });

  res.render('admin/links', { links });
};

// ===============================
// Statistik per Link
// ===============================
export const linkStats = async (req, res) => {
  const { id } = req.params;

  const [link] = await sequelize.query(`
    SELECT l.*, u.name, u.email
    FROM links l
    JOIN users u ON u.id = l.userId
    WHERE l.id = :id
  `, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT
  });
  if (!link) return res.status(404).send('Link tidak ditemukan');

  // ✅ Statistik klik per hari per link
  const clicksByDay = await sequelize.query(`
    SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date,
           COUNT(id) as count
    FROM clicks
    WHERE linkId = :id
    GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
    ORDER BY date ASC
  `, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT
  });

  const chartData = {
    labels: clicksByDay.map(c => c.date),
    values: clicksByDay.map(c => c.count)
  };

  const clicksByCountry = await sequelize.query(`
    SELECT country, COUNT(id) as count
    FROM clicks
    WHERE linkId = :id
    GROUP BY country
    ORDER BY count DESC
  `, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT
  });

  const clicksByDevice = await sequelize.query(`
    SELECT device, COUNT(id) as count
    FROM clicks
    WHERE linkId = :id
    GROUP BY device
  `, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT
  });

  const clicksByBrowser = await sequelize.query(`
    SELECT TRIM(SUBSTRING_INDEX(ua, ' ', 1)) as browser,
           COUNT(id) as count
    FROM clicks
    WHERE linkId = :id
    GROUP BY browser
    ORDER BY count DESC
  `, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT
  });

  const clicks = await sequelize.query(`
    SELECT * FROM clicks
    WHERE linkId = :id
    ORDER BY id DESC
  `, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT
  });

  res.render('admin/stats', {
    link,
    chartData,
    clicks,
    clicksByCountry,
    clicksByDevice,
    clicksByBrowser
  });
};
