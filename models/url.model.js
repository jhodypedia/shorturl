import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Url = db.define("Url", {
  originalUrl: { type: DataTypes.TEXT, allowNull: false },
  shortCode: { type: DataTypes.STRING(16), unique: true, allowNull: false },
  clicks: { type: DataTypes.INTEGER, defaultValue: 0 },
  isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false }
});

export default Url;
