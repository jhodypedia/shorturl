import { Router } from "express";
import {
  loginForm, login, logout,
  registerForm, register,
  forgotPasswordForm, forgotPassword,
  resetForm, resetPassword
} from "../controllers/authController.js";

const r=Router();
r.get("/login", loginForm);
r.post("/login", login);
r.get("/logout", logout);
r.get("/register", registerForm);
r.post("/register", register);
r.get("/forgot", forgotPasswordForm);
r.post("/forgot", forgotPassword);
r.get("/reset/:token", resetForm);
r.post("/reset/:token", resetPassword);
export default r;
