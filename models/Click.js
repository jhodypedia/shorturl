import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Link from './Link.js';

const Click = sequelize.define('clicks', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  linkId: { type: DataTypes.INTEGER, allowNull: false },
  ip: { type: DataTypes.STRING, allowNull: true },
  ua: { type: DataTypes.TEXT, allowNull: true },
  country: { type: DataTypes.STRING(3), allowNull: true },
  device: { type: DataTypes.STRING, allowNull: true },
  referer: { type: DataTypes.TEXT, allowNull: true }
}, {
  timestamps: true // ✅ createdAt & updatedAt otomatis
});

// Relasi
Click.belongsTo(Link, { foreignKey: 'linkId' });
Link.hasMany(Click, { foreignKey: 'linkId' });

export default Click;
