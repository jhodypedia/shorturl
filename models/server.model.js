import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Server = db.define("Server", {
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  note: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM("online","offline","unknown"), defaultValue: "unknown" }
});

export default Server;
