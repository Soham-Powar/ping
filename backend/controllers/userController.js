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

const supabase = require("../config/supabase");
const updateUser = async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const { bio } = req.body;

    let avatarUrl;

    if (req.file) {
      const { originalname, mimetype, buffer } = req.file;

      if (!mimetype.startsWith("image/")) {
        const err = new Error("Only image files are allowed");
        err.statusCode = 400;
        throw err;
      }

      const safeName = originalname.replace(/\s+/g, "_");
      const filePath = `avatars/${Date.now()}_${safeName}`;

      const { error } = await supabase.storage
        .from("ping-files")
        .upload(filePath, buffer, { contentType: mimetype, upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from("ping-files")
        .getPublicUrl(filePath);

      avatarUrl = data.publicUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatar_url: avatarUrl }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        updated_at: true,
      },
    });
    res.json({ user: updatedUser });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const myId = Number(req.user.id);

    const users = await prisma.user.findMany({
      where: {
        id: { not: myId },
        is_deleted: false,
      },
      select: {
        id: true,
        username: true,
        avatar_url: true,
        created_at: true,
      },
      orderBy: {
        username: "asc",
      },
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  deleteUser,
  getMyProfile,
  getUserById,
  updateUser,
  getAllUsers,
};
