import { Sequelize } from "sequelize";
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { User, Url, Setting, Server, Click } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname,"../views/email_template.ejs");

export const dashboard=async(req,res)=>{
  const totalLinks=await Url.count();
  const totalClicks=await Url.sum("clicks")||0;
  const totalUsers=await User.count();
  const recent=await Url.findAll({ limit:10, order:[["createdAt","DESC"]] });

  const topCountries=await Click.findAll({
    attributes:["country",[Sequelize.fn("COUNT",Sequelize.col("id")),"count"]],
    group:["country"], order:[[Sequelize.literal("count"),"DESC"]], limit:5
  });

  res.render("dashboard",{
    stats:{ totalLinks,totalClicks,totalUsers },
    recent,
    chartLabels: topCountries.map(c=>c.country||"Unknown"),
    chartData: topCountries.map(c=>Number(c.get("count")))
  });
};

export const urls=async(req,res)=>{
  const list=await Url.findAll({ order:[["createdAt","DESC"]] });
  res.render("urls",{ list });
};

export const urlAnalytics=async(req,res)=>{
  const url=await Url.findByPk(req.params.id,{ include:[Click] });
  if(!url){ req.flash("error","URL tidak ada"); return res.redirect("/admin/urls"); }
  res.render("url_analytics",{ url, clicks:url.Clicks });
};

export const users=async(req,res)=>{
  const list=await User.findAll({ order:[["createdAt","DESC"]] });
  res.render("users",{ list });
};

export const getSettings=async(req,res)=>{
  const ad=(await Setting.findOne({where:{key:"adsterra_js"}}))?.value||"";
  res.render("settings",{ adsterra: ad });
};
export const saveSettings=async(req,res)=>{
  await Setting.upsert({ key:"adsterra_js", value:req.body.adsterra_js||"" });
  req.flash("success","Settings tersimpan");
  res.redirect("/admin/settings");
};

export const getSMTP=async(req,res)=>{
  const keys=["smtp_host","smtp_port","smtp_user","smtp_pass","smtp_from"];
  const values={}; for(const k of keys) values[k]=(await Setting.findOne({where:{key:k}}))?.value||"";
  res.render("smtp",{ values });
};
export const saveSMTP=async(req,res)=>{
  for(const k of ["smtp_host","smtp_port","smtp_user","smtp_pass","smtp_from"])
    await Setting.upsert({ key:k, value:req.body[k]||"" });
  req.flash("success","SMTP updated");
  res.redirect("/admin/smtp");
};
export const testSMTP=async(req,res)=>{
  const to=req.body.to;
  if(!to){ req.flash("error","Email tujuan kosong"); return res.redirect("/admin/smtp"); }
  const host=(await Setting.findOne({where:{key:"smtp_host"}}))?.value;
  const port=(await Setting.findOne({where:{key:"smtp_port"}}))?.value;
  const userMail=(await Setting.findOne({where:{key:"smtp_user"}}))?.value;
  const pass=(await Setting.findOne({where:{key:"smtp_pass"}}))?.value;
  const from=(await Setting.findOne({where:{key:"smtp_from"}}))?.value || "no-reply@short.local";
  try{
    const t=nodemailer.createTransport({ host, port:Number(port||587), secure:false, auth:(userMail&&pass)?{user:userMail,pass}:undefined });
    const html=await ejs.renderFile(templatePath,{
      subject:"Test Email",
      message:"Ini adalah email percobaan dari ShortURL App.",
      buttonUrl: process.env.APP_BASE_URL,
      buttonText:"Buka Website"
    });
    await t.sendMail({ from,to,subject:"Test Email",html });
    req.flash("success","Test email terkirim ke "+to);
  }catch(e){ req.flash("error","Gagal kirim: "+e.message); }
  res.redirect("/admin/smtp");
};
