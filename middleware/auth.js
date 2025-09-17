export const requireAuth = (req, res, next) => {
  if (req.session?.user) return next();
  return res.redirect('/login');
};
export const injectUser = (req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  next();
};
