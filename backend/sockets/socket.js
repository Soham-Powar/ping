let io = null;

const setIO = (socketIOInstance) => {
  io = socketIOInstance;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  setIO,
  getIO,
};

// use setIO in index.js to initialize io instance
// use getIO in other modules to access the io instance

// const { getIO } = require("../sockets/socket");

// const io = getIO();
// io.to("group:5").emit("group:message:new", data);
