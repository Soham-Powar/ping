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

const getMessagesWithId = async (req, res, next) => {
  //get msgs betn me(jwt user) and provided id
  try {
    const myId = req.user.id;
    const otherUserId = Number(req.params.userId);

    if (Number.isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    if (myId === otherUserId) {
      return res.status(400).json({
        error: "Cannot fetch conversation with yourself",
      });
    }

    // check if other user exists
    // const otherUserExists = await prisma.user.findUnique({
    //   where: { id: otherUserId },
    //   select: { id: true },
    // });

    // if (!otherUserExists) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    //mark the messages read
    await prisma.message.updateMany({
      where: {
        sender_id: otherUserId,
        receiver_id: myId,
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            sender_id: myId,
            receiver_id: otherUserId,
          },
          {
            sender_id: otherUserId,
            receiver_id: myId,
          },
        ],
      },
      orderBy: {
        created_at: "asc",
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        sender_id: true,
        receiver_id: true,
        is_read: true,
        read_at: true,
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

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

const getInbox = async (req, res, next) => {
  try {
    const myId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender_id: myId }, { receiver_id: myId }],
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
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
    //we only want latest msg per convo
    const inboxMap = new Map();

    for (const msg of messages) {
      //we want to display detail on other user in the inbox
      const otherUser = msg.sender_id === myId ? msg.receiver : msg.sender;

      //check if latest msg is already added
      if (!inboxMap.has(otherUser.id)) {
        inboxMap.set(otherUser.id, {
          messageId: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          user: otherUser,
          isSentByMe: msg.sender_id === myId,
          unreadCount: 0,
        });
      }

      if (msg.receiver_id === myId && !msg.is_read) {
        inboxMap.get(otherUser.id).unreadCount++;
      }
    }
    const inbox = Array.from(inboxMap.values());

    res.json({ inbox });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMessage,
  getMessagesWithId,
  getInbox,
};
