const isAdmin = (req, res, next) => {
  // req.user is set by isAuth middleware

  console.log(req.user);
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      error: "Admin access required",
    });
  }

  next();
};

module.exports = isAdmin;
