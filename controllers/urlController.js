import { nanoid } from "nanoid";
import fetch from "node-fetch";
import { Url, Click, Setting } from "../models/index.js";

export const home=(req,res)=> res.render("index");

export const shorten=async(req,res)=>{
  const { url } = req.body;
  if(!url || !/^https?:\/\//i.test(url)){
    req.flash("error","URL tidak valid (wajib http/https).");
    return res.redirect("/");
  }
  const code=nanoid(7);
  await Url.create({ originalUrl:url, shortCode:code, userId:req.session.user?.id || null });
  req.flash("success",`Short URL: ${process.env.APP_BASE_URL}/r/${code}`);
  res.redirect("/");
};

export const redirector=async(req,res)=>{
  const code=req.params.code;
  const url=await Url.findOne({ where:{ shortCode:code }});
  if(!url || url.isBlocked) return res.status(404).send("URL tidak ditemukan / diblokir");

  const ip=req.headers['x-forwarded-for']?.split(",")[0] || req.socket.remoteAddress;
  const userAgent=req.headers['user-agent']||"";
  const referrer=req.get("Referer")||"";
  let country=null,city=null;
  try{
    const r=await fetch(`https://ipapi.co/${ip}/json/`);
    if(r.ok){ const d=await r.json(); country=d.country_name; city=d.city; }
  }catch(e){ /* silent */ }

  await Click.create({ urlId:url.id, ip, userAgent, referrer, country, city });
  url.clicks += 1; await url.save();

  const adsterra=(await Setting.findOne({where:{key:"adsterra_js"}}))?.value || "";
  res.render("redirect",{ url, adsterra, countdown:3 });
};
