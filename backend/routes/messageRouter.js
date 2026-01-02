const Router = require("express");
const messageRouter = Router();

const {
  createMessage,
  getMessagesWithId,
  getInbox,
} = require("../controllers/messageController");
const isAuth = require("../middlewares/isAuth");

messageRouter.post("/", isAuth, createMessage);
messageRouter.get("/inbox", isAuth, getInbox);
messageRouter.get("/:userId", isAuth, getMessagesWithId);

module.exports = messageRouter;
