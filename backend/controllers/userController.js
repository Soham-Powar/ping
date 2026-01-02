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
      return res.status(404).json({ error: "User not found" });
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
      return res.status(400).json({ error: "Invalid userId" });
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
      return res.status(404).json({ error: "User not found" });
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

module.exports = {
  deleteUser,
  getMyProfile,
  getUserById,
};
