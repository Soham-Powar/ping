const { prisma } = require("../lib/prisma");

const createMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      const err = new Error("receiverId and content are required");
      err.statusCode = 400;
      throw err;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      const err = new Error("Message content cannot be empty");
      err.statusCode = 400;
      throw err;
    }

    // Prevent self-messaging
    if (senderId === receiverId) {
      const err = new Error("You cannot send a message to yourself");
      err.statusCode = 400;
      throw err;
    }

    // check if receiver exists
    const receiverExists = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiverExists) {
      const err = new Error("Receiver does not exist");
      err.statusCode = 404;
      throw err;
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

    const limit = Number(req.query.limit) || 20;
    //we will use created_at for cursor pagination
    const cursor = req.query.cursor;

    if (Number.isNaN(otherUserId)) {
      const err = new Error("Invalid userId");
      err.statusCode = 400;
      throw err;
    }

    if (myId === otherUserId) {
      const err = new Error("Cannot fetch conversation with yourself");
      err.statusCode = 400;
      throw err;
    }

    // check if other user exists
    // const otherUserExists = await prisma.user.findUnique({
    //   where: { id: otherUserId },
    //   select: { id: true },
    // });

    // if (!otherUserExists) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    //mark the unread messages read
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
          { sender_id: myId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: myId },
        ],
        ...(cursor && { created_at: { lt: new Date(cursor) } }),
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit + 1,
      //fetch one extra to check if more msgs are there
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

    let nextCursor = null;
    if (messages.length > limit) {
      messages.pop();
      nextCursor = messages[messages.length - 1].created_at;
    }
    messages.reverse();
    res.json({ messages, nextCursor });
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
