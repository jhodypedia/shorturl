import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import {
  dashboard, urls, urlAnalytics, users,
  getSettings, saveSettings,
  getSMTP, saveSMTP, testSMTP
} from "../controllers/adminController.js";

const r=Router();
r.use(requireAdmin);
r.get("/", dashboard);
r.get("/urls", urls);
r.get("/urls/:id/analytics", urlAnalytics);
r.get("/users", users);
r.get("/settings", getSettings);
r.post("/settings", saveSettings);
r.get("/smtp", getSMTP);
r.post("/smtp", saveSMTP);
r.post("/smtp/test", testSMTP);
export default r;
