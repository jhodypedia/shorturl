import { sequelize } from '../models/index.js';
await sequelize.sync({ alter: true });
console.log('DB synced');
process.exit(0);
