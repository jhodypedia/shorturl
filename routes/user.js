import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { Url, Click, User } from "../models/index.js";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const r=Router();
r.use(requireAuth);

// dashboard
r.get("/dashboard", async (req,res)=>{
  const uid=req.session.user.id;
  const totalLinks=await Url.count({ where:{ userId:uid } });
  const totalClicks=await Url.sum("clicks", { where:{ userId:uid } }) || 0;
  const recent=await Url.findAll({ where:{ userId:uid }, order:[["createdAt","DESC"]], limit:5 });
  const lastClicks=await Click.findAll({ include:[Url], where:{ urlId: recent.map(u=>u.id) }, limit:5, order:[["createdAt","DESC"]] });
  res.render("user_dashboard",{ stats:{ totalLinks,totalClicks }, recent, lastClicks });
});

// my urls
r.get("/urls", async (req,res)=>{
  const list=await Url.findAll({ where:{ userId:req.session.user.id }, order:[["createdAt","DESC"]] });
  res.render("user_urls",{ list });
});
r.post("/urls", async (req,res)=>{
  const { url }=req.body; if(!url){ req.flash("error","URL kosong"); return res.redirect("/user/urls"); }
  const code=nanoid(7); await Url.create({ originalUrl:url, shortCode:code, userId:req.session.user.id });
  req.flash("success","URL dibuat"); res.redirect("/user/urls");
});
r.post("/urls/:id/delete", async (req,res)=>{
  const u=await Url.findOne({ where:{ id:req.params.id, userId:req.session.user.id } });
  if(u) await u.destroy();
  req.flash("success","Dihapus"); res.redirect("/user/urls");
});

// profile
r.get("/profile", async (req,res)=>{
  res.render("user_profile",{ user: await User.findByPk(req.session.user.id) });
});
r.post("/profile", async (req,res)=>{
  const { name,password }=req.body;
  const u=await User.findByPk(req.session.user.id);
  u.name=name||u.name;
  if(password && password.length>=6) u.passwordHash=await bcrypt.hash(password,10);
  await u.save();
  req.session.user.name=u.name;
  req.flash("success","Profile updated");
  res.redirect("/user/profile");
});

export default r;
