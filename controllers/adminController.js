import { User, Link, Click } from '../models/index.js';
import { sequelize } from '../models/index.js';
import { Op } from 'sequelize';

export const adminDashboard = async (req, res) => {
  const totalUsers = await User.count();
  const totalLinks = await Link.count();
  const totalClicks = await Click.count();

  const range = parseInt(req.query.range || '7');
  const startDate = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

  const clicksByDay = await Click.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { createdAt: { [Op.gte]: startDate } },
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
  });

  const topLinks = await Click.findAll({
    attributes: ['linkId', [sequelize.fn('COUNT', sequelize.col('id')), 'clickCount']],
    include: [{ model: Link, attributes: ['id','code','title'], include: [{ model: User, attributes: ['name'] }] }],
    where: { createdAt: { [Op.gte]: startDate } },
    group: ['linkId','link.id','link->user.id'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit: 5
  });

  const topCountries = await Click.findAll({
    attributes: ['country', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where: { createdAt: { [Op.gte]: startDate } },
    group: ['country'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit: 5
  });

  const topBrowsers = await Click.findAll({
    attributes: [
      [sequelize.fn('SUBSTRING_INDEX', sequelize.col('ua'), ' ', 1), 'browser'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { createdAt: { [Op.gte]: startDate } },
    group: ['browser'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit: 5
  });

  const deviceDist = await Click.findAll({
    attributes: ['device', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where: { createdAt: { [Op.gte]: startDate } },
    group: ['device']
  });

  const chartData = {
    labels: clicksByDay.map(c => c.dataValues.date),
    values: clicksByDay.map(c => c.dataValues.count)
  };

  res.render('admin/dashboard', { totalUsers, totalLinks, totalClicks, chartData, topLinks, topCountries, topBrowsers, deviceDist, range });
};

export const usersTable = async (req, res) => {
  const users = await User.findAll({ order: [['id','DESC']] });
  res.render('admin/users', { users });
};
export const toggleUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.redirect('/admin/users');
  user.status = user.status === 'active' ? 'suspended' : 'active';
  await user.save();
  res.redirect('/admin/users');
};
export const linksTable = async (req, res) => {
  const links = await Link.findAll({ include: [{ model: User, attributes: ['name','email'] }], order: [['id','DESC']] });
  res.render('admin/links', { links });
};

export const linkStats = async (req, res) => {
  const { id } = req.params;
  const link = await Link.findByPk(id, { include: User });
  if (!link) return res.status(404).send('Link tidak ditemukan');

  const clicksByDay = await Click.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { linkId: id },
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
  });
  const chartData = {
    labels: clicksByDay.map(c => c.dataValues.date),
    values: clicksByDay.map(c => c.dataValues.count)
  };

  const clicksByCountry = await Click.findAll({
    attributes: ['country', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where: { linkId: id }, group: ['country'], order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
  });
  const clicksByDevice = await Click.findAll({
    attributes: ['device', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    where: { linkId: id }, group: ['device']
  });
  const clicksByBrowser = await Click.findAll({
    attributes: [
      [sequelize.fn('SUBSTRING_INDEX', sequelize.col('ua'), ' ', 1), 'browser'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { linkId: id }, group: ['browser'], order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
  });

  const clicks = await Click.findAll({ where: { linkId: id }, order: [['id','DESC']] });

  res.render('admin/stats', { link, chartData, clicks, clicksByCountry, clicksByDevice, clicksByBrowser });
};
