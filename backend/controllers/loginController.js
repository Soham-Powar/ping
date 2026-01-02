const { prisma } = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginPost = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const err = new Error("Username and password are required");
      err.statusCode = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      const err = new Error("User doesn't exist");
      err.statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const err = new Error("Invalid password");
      err.statusCode = 401;
      throw err;
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
