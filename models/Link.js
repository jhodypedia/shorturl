import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Link = sequelize.define('links', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(12), unique: true },
  target: { type: DataTypes.TEXT, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true }
});
export default Link;
