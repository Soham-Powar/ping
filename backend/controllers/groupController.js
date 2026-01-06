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

const getMyGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const memberships = await prisma.groupMember.findMany({
      where: { user_id: userId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        joined_at: "desc",
      },
    });

    // for each grp - we need last msg and unread count to show
    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const groupId = membership.group.id;

        const lastMessage = await prisma.groupMessage.findFirst({
          where: { group_id: groupId },
          orderBy: { created_at: "desc" },
          select: {
            content: true,
            image_url: true,
            created_at: true,
            sender_id: true,
          },
        });
        // unread count
        const unreadCount = await prisma.groupMessage.count({
          where: {
            group_id: groupId,
            created_at: membership.last_read_at
              ? { gt: membership.last_read_at }
              : undefined,
          },
        });
        return {
          id: groupId,
          name: membership.group.name,
          avatar_url: membership.group.avatar_url,
          lastMessage,
          unreadCount,
        };
      })
    );
    res.status(200).json(groups);
  } catch (err) {
    next(err);
  }
};

const getGroupMessages = async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);

    if (isNaN(groupId)) {
      const err = new Error("Invalid group id");
      err.statusCode = 400;
      throw err;
    }

    const limit = Number(req.query.limit) || 20;
    const cursor = req.query.cursor;

    const messages = await prisma.groupMessage.findMany({
      where: {
        group_id: groupId,
        ...(cursor && {
          created_at: { lt: new Date(cursor) },
        }),
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    //mark as read
    await prisma.groupMember.update({
      where: {
        group_id_user_id: {
          group_id: groupId,
          user_id: req.user.id,
        },
      },
      data: {
        last_read_at: new Date(),
      },
    });

    let nextCursor = null;
    if (messages.length > limit) {
      messages.pop();
      nextCursor = messages[messages.length - 1].created_at;
    }
    messages.reverse();
    res.json({ messages, nextCursor });
  } catch (error) {
    next(error);
  }
};

const { uploadImage } = require("../utils/uploadImage");
const createGroupMessage = async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);
    const senderId = req.user.id;
    const { content } = req.body;

    if (isNaN(groupId)) {
      const err = new Error("Invalid group id");
      err.statusCode = 400;
      throw err;
    }

    if (!content && !req.file) {
      const err = new Error("Message must contain text or image");
      err.statusCode = 400;
      throw err;
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImage({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        folder: "chat-images",
      });
    }

    const message = await prisma.groupMessage.create({
      data: {
        group_id: groupId,
        sender_id: senderId,
        content: content?.trim() || null,
        image_url: imageUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    // sender has read their own message
    await prisma.groupMember.update({
      where: {
        group_id_user_id: {
          group_id: groupId,
          user_id: senderId,
        },
      },
      data: {
        last_read_at: new Date(),
      },
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;
    const membership = req.groupMember;

    if (isNaN(groupId)) {
      const err = new Error("Invalid group id");
      err.statusCode = 400;
      throw err;
    }

    await prisma.$transaction(async (tx) => {
      //if user is admin..check if another admin is there
      if (membership.role == "ADMIN") {
        const admins = await tx.groupMember.findMany({
          where: {
            group_id: groupId,
            role: "ADMIN",
          },
        });
        //if only one admin that is to be deleted
        if (admins.length === 1) {
          //find random new admin
          const nextAdmin = await tx.groupMember.findFirst({
            where: {
              group_id: groupId,
              user_id: { not: userId },
            },
          });

          if (!nextAdmin) {
            const err = new Error("Cannot leave group as the only member");
            err.statusCode = 400;
            throw err;
          }

          //make the next user admin
          await tx.groupMember.update({
            where: {
              id: nextAdmin.id,
            },
            data: {
              role: "ADMIN",
            },
          });
        }
      }
      await tx.groupMember.delete({
        where: {
          group_id_user_id: { group_id: groupId, user_id: userId },
        },
      });
    });
    res.status(200).json({ message: "Left group successfully" });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);
    const targetUserId = Number(req.params.userId);
    const adminUserId = req.user.id;

    if (isNaN(groupId) || isNaN(targetUserId)) {
      const err = new Error("Invalid group or user id");
      err.statusCode = 400;
      throw err;
    }

    //admin cant remove himself ---- can leave
    if (targetUserId === adminUserId) {
      const err = new Error("Use leave group to remove yourself");
      err.statusCode = 400;
      throw err;
    }

    await prisma.$transaction(async (tx) => {
      // ensure target is a member
      const targetMembership = await tx.groupMember.findUnique({
        where: {
          group_id_user_id: {
            group_id: groupId,
            user_id: targetUserId,
          },
        },
      });

      if (!targetMembership) {
        const err = new Error("User is not a member of this group");
        err.statusCode = 404;
        throw err;
      }

      // remove membership
      await tx.groupMember.delete({
        where: {
          group_id_user_id: {
            group_id: groupId,
            user_id: targetUserId,
          },
        },
      });
    });
    res.status(200).json({ message: "Member removed successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupMessages,
  createGroupMessage,
  leaveGroup,
  removeMember,
};
