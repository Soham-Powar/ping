const { prisma } = require("../lib/prisma");

const isGroupMember = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const groupId = Number(req.params.groupId);

    if (isNaN(groupId)) {
      const err = new Error("Invalid group id");
      err.statusCode = 400;
      throw err;
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        // for composite unique use this
        group_id_user_id: {
          group_id: groupId,
          user_id: userId,
        },
      },
    });

    if (!membership) {
      const err = new Error("You are not member of this group");
      err.statusCode = 403;
      throw err;
    }
    req.groupMember = membership;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isGroupMember;
