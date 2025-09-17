import db from "../config/database.js";
import User from "./user.model.js";
import Url from "./url.model.js";
import Setting from "./setting.model.js";
import Server from "./server.model.js";
import Click from "./click.model.js";

User.hasMany(Url, { foreignKey: "userId" });
Url.belongsTo(User, { foreignKey: "userId" });

export { db, User, Url, Setting, Server, Click };
