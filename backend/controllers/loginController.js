const { prisma } = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginPost = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(401).json({
        error: "User doesn't exist",
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...safeUser } = user;

    res.json({
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginPost,
};
