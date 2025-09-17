import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Link = sequelize.define('links', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  target: { type: DataTypes.TEXT, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: true },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  timestamps: true // ✅ createdAt & updatedAt otomatis
});

// Relasi
Link.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Link, { foreignKey: 'userId' });

export default Link;
