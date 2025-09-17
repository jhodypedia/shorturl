import { DataTypes } from "sequelize";
import db from "../config/database.js";
import Url from "./url.model.js";

const Click = db.define("Click", {
  ip: DataTypes.STRING,
  userAgent: DataTypes.STRING,
  referrer: DataTypes.STRING,
  country: DataTypes.STRING,
  city: DataTypes.STRING
});

Url.hasMany(Click, { foreignKey: "urlId" });
Click.belongsTo(Url, { foreignKey: "urlId" });

export default Click;
