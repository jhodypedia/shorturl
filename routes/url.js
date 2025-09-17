import { Router } from "express";
import { home, shorten, redirector } from "../controllers/urlController.js";
const r=Router();
r.get("/", home);
r.post("/shorten", shorten);
r.get("/r/:code", redirector);
export default r;
