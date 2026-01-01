const { prisma } = require("../lib/prisma");

const createMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res.status(400).json({
        error: "receiverId and content are required",
      });
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return res.status(400).json({
        error: "Message content cannot be empty",
      });
    }

    // Prevent self-messaging
    if (senderId === receiverId) {
      return res.status(400).json({
        error: "You cannot send a message to yourself",
      });
    }

    // check if receiver exists
    const receiverExists = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiverExists) {
      return res.status(404).json({
        error: "Receiver does not exist",
      });
    }

    const message = await prisma.message.create({
      data: {
        content: trimmedContent,
        sender_id: senderId,
        receiver_id: receiverId,
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        sender: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

module.exports = { createMessage };
