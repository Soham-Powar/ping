const Router = require("express");
const messageRouter = Router();

const {
  createMessage,
  getMessagesWithId,
} = require("../controllers/messageController");
const isAuth = require("../middlewares/isAuth");

messageRouter.post("/", isAuth, createMessage);
messageRouter.get("/:userId", isAuth, getMessagesWithId);

module.exports = messageRouter;
