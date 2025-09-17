export function requireAuth(req,res,next){
  if(!req.session.user){
    req.flash("error","Silakan login.");
    return res.redirect("/auth/login");
  }
  next();
}
export function requireAdmin(req,res,next){
  if(!req.session.user || req.session.user.role!=="admin"){
    req.flash("error","Akses khusus admin.");
    return res.redirect("/");
  }
  next();
}
