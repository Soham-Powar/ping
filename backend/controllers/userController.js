const { prisma } = require("../lib/prisma");

const getMyProfile = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      const err = new Error("Invalid userId");
      err.statusCode = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar_url: true,
        created_at: true,
      },
    });

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    await prisma.user.update({
      where: { id: userId },
      data: {
        username: `deleted_user_${userId}`,
        email: `deleted_user_${userId}@ping.local`,
        password: null,
        bio: null,
        avatar_url: null,
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// const updateUser = async (req, res, next) => {
//   try {
//     const userId = Number(req.user.id);
//     const { bio } = req.body;
//   } catch (err) {
//     next(err);
//   }
// };

module.exports = {
  deleteUser,
  getMyProfile,
  getUserById,
};
