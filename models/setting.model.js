import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Setting = db.define("Setting", {
  key: { type: DataTypes.STRING, unique: true },
  value: { type: DataTypes.TEXT }
});

export default Setting;
