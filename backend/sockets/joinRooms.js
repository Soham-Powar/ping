const { prisma } = require("../lib/prisma");

//only have socket parameter not next
const joinRooms = async (socket) => {
  const userId = socket.user.id;

  // Join personal room
  socket.join(`user:${userId}`);

  // Fetch groups the user is a member of
  const groupMemberships = await prisma.groupMember.findMany({
    where: { user_id: userId },
    select: { group_id: true },
  });

  // Join each group room
  for (const { group_id } of groupMemberships) {
    socket.join(`group:${group_id}`);
  }
  // now this socket is listening to messages sent to user:userId and group:groupId rooms
  console.log(`User ${userId} joined ${groupMemberships.length} group rooms`);
};

module.exports = joinRooms;
