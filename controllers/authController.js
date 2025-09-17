import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { User, Setting } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname,"../views/email_template.ejs");

async function sendEmail({to, subject, message, buttonUrl, buttonText}){
  const host=(await Setting.findOne({where:{key:"smtp_host"}}))?.value;
  const port=(await Setting.findOne({where:{key:"smtp_port"}}))?.value;
  const userMail=(await Setting.findOne({where:{key:"smtp_user"}}))?.value;
  const pass=(await Setting.findOne({where:{key:"smtp_pass"}}))?.value;
  const from=(await Setting.findOne({where:{key:"smtp_from"}}))?.value || "no-reply@short.local";

  const transporter=nodemailer.createTransport({
    host, port:Number(port||587), secure:false,
    auth:(userMail&&pass)?{user:userMail,pass}:undefined
  });

  const html=await ejs.renderFile(templatePath,{ subject,message,buttonUrl,buttonText });
  await transporter.sendMail({ from,to,subject,html });
}

export const loginForm=(req,res)=>res.render("login");
export const registerForm=(req,res)=>res.render("register");
export const forgotPasswordForm=(req,res)=>res.render("forgot");

export const login=async(req,res)=>{
  const {email,password}=req.body;
  const user=await User.findOne({where:{email}});
  if(!user){ req.flash("error","Email tidak terdaftar"); return res.redirect("/auth/login"); }
  if(!user.isActive){ req.flash("error","Akun nonaktif"); return res.redirect("/auth/login"); }
  const ok=await bcrypt.compare(password,user.passwordHash);
  if(!ok){ req.flash("error","Password salah"); return res.redirect("/auth/login"); }
  req.session.user={id:user.id,email:user.email,name:user.name,role:user.role};
  req.flash("success","Login sukses");
  res.redirect(user.role==="admin"?"/admin":"/user/dashboard");
};

export const register=async(req,res)=>{
  const {name,email,password}=req.body;
  if(await User.findOne({where:{email}})){ req.flash("error","Email sudah terdaftar"); return res.redirect("/auth/register"); }
  const hash=await bcrypt.hash(password,10);
  const user=await User.create({name,email,passwordHash:hash,role:"user"});
  req.session.user={id:user.id,email:user.email,name:user.name,role:user.role};
  try{
    await sendEmail({
      to: user.email,
      subject:"Welcome to ShortURL",
      message:`Halo ${user.name}, selamat datang di ShortURL!`,
      buttonUrl: process.env.APP_BASE_URL,
      buttonText:"Buka Dashboard"
    });
  }catch(e){ console.error("Welcome email gagal:",e.message); }
  req.flash("success","Registrasi berhasil.");
  res.redirect("/user/dashboard");
};

export const logout=(req,res)=>req.session.destroy(()=>res.redirect("/auth/login"));

export const forgotPassword=async(req,res)=>{
  const {email}=req.body;
  const user=await User.findOne({where:{email}});
  if(!user){ req.flash("error","Email tidak ditemukan"); return res.redirect("/auth/forgot"); }
  const token=crypto.randomBytes(20).toString("hex");
  user.resetToken=token; user.resetTokenExp=Date.now()+3600000; await user.save();
  const resetUrl=`${process.env.APP_BASE_URL}/auth/reset/${token}`;
  try{
    await sendEmail({ to:user.email, subject:"Reset Password", message:"Klik tombol untuk reset password.", buttonUrl:resetUrl, buttonText:"Reset Password" });
    req.flash("success","Link reset dikirim ke email.");
  }catch(e){ req.flash("error","Gagal kirim email, cek SMTP Settings."); }
  res.redirect("/auth/login");
};

export const resetForm=async(req,res)=>{
  const user=await User.findOne({where:{ resetToken:req.params.token, resetTokenExp:{[Op.gt]:Date.now()} }});
  if(!user){ req.flash("error","Token invalid/kadaluarsa"); return res.redirect("/auth/forgot"); }
  res.render("reset",{ token:req.params.token });
};

export const resetPassword=async(req,res)=>{
  const user=await User.findOne({where:{ resetToken:req.params.token, resetTokenExp:{[Op.gt]:Date.now()} }});
  if(!user){ req.flash("error","Token invalid/kadaluarsa"); return res.redirect("/auth/forgot"); }
  user.passwordHash=await bcrypt.hash(req.body.password,10);
  user.resetToken=null; user.resetTokenExp=null; await user.save();
  req.flash("success","Password direset. Silakan login.");
  res.redirect("/auth/login");
};
