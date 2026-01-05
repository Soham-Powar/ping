const { prisma } = require("../lib/prisma");

const createGroup = async (req, res, next) => {
  try {
    const creatorId = req.user.id;
    const { name, memberIds = [], avatar_url } = req.body;

    //input validations
    if (!name || typeof name !== "string") {
      const err = new Error("Group name is required");
      err.statusCode = 400;
      throw err;
    }

    if (!Array.isArray(memberIds)) {
      const err = new Error("memberIds must be an array");
      err.statusCode = 400;
      throw err;
    }

    //remove duplicates + creator if present
    const uniqueMemberIds = [
      ...new Set(memberIds.filter((id) => id !== creatorId)),
    ];

    //make it transaction bcz we need it to be atomic
    const group = await prisma.$transaction(async (tx) => {
      //tx is instance of prisma client
      //use tx instead of prisma inside
      const group = await tx.group.create({
        data: {
          name,
          avatar_url,
          created_by: creatorId,
        },
      });

      await tx.groupMember.create({
        data: {
          user_id: creatorId,
          group_id: group.id,
          role: "ADMIN",
        },
      });

      if (uniqueMemberIds.length > 0) {
        await tx.groupMember.createMany({
          data: uniqueMemberIds.map((userId) => ({
            group_id: group.id,
            user_id: userId,
            role: "MEMBER",
          })),
          skipDuplicates: true,
        });
      }

      return group;
    });
    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createGroup };
