const jwt = require("jsonwebtoken");

function isAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.sendStatus(401);
  }
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
}

module.exports = isAuth;
