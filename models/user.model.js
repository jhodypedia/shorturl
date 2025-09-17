import { DataTypes } from "sequelize";
import db from "../config/database.js";

const User = db.define("User", {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, defaultValue: "User" },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("admin","user"), defaultValue: "user" },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  resetToken: { type: DataTypes.STRING },
  resetTokenExp: { type: DataTypes.DATE }
});

export default User;
