export default function adminOnly(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  return res.status(403).render('auth/login', { error: 'Akses ditolak', csrfToken: req.csrfToken() });
}
