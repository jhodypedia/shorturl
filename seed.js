import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import db from "./config/database.js";
import { User, Setting } from "./models/index.js";

(async()=>{
  await db.sync();
  const email = process.env.ADMIN_EMAIL || "admin@short.local";
  const pass = process.env.ADMIN_PASSWORD || "admin123";
  const exist = await User.findOne({ where:{ email } });
  if(!exist){
    const hash = await bcrypt.hash(pass,10);
    await User.create({ email, name:"Administrator", passwordHash:hash, role:"admin" });
    console.log("Admin dibuat:", email, "/", pass);
  } else {
    console.log("Admin sudah ada:", email);
  }
  await Setting.findOrCreate({ where:{ key:"adsterra_js" }, defaults:{ value:"" } });
  console.log("Seed selesai"); process.exit(0);
})();
