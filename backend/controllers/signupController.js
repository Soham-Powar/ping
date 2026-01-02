const { prisma } = require("../lib/prisma");
const bcrypt = require("bcryptjs");

const signupPost = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!username || !email || !password) {
      const err = new Error("Username, email, and password are required");
      err.statusCode = 400;
      throw err;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      const err = new Error("Username or email already exists");
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        created_at: true,
      },
    });

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { signupPost };
