import express from "express";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import flash from "connect-flash";
import helmet from "helmet";
import csrf from "csurf";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

import db from "./config/database.js";
import "./models/index.js";

import authRoutes from "./routes/auth.js";
import urlRoutes from "./routes/url.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.disable("x-powered-by");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax" }
}));
app.use(flash());

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout");

const csrfProtection = csrf();
app.use((req,res,next)=>{
  if (req.path.startsWith("/r/")) return next();  // skip halaman redirect
  return csrfProtection(req,res,next);
});

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : null;
  res.locals.user = req.session.user || null;
  res.locals.baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  next();
});

app.use("/api", rateLimit({ windowMs: 60_000, max: 60 }));

app.use("/", urlRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

db.sync().then(()=>console.log("DB synced"));
app.listen(process.env.PORT || 3000, ()=> console.log(`Running at http://localhost:${process.env.PORT||3000}`));
