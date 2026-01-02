const { prisma } = require("../lib/prisma");

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
};
