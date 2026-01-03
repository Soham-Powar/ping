const Router = require("express");
const messageRouter = Router();

const {
  createMessage,
  getMessagesWithId,
  getInbox,
} = require("../controllers/messageController");
const isAuth = require("../middlewares/isAuth");
const upload = require("../middlewares/upload");

messageRouter.post("/", isAuth, upload.single("image"), createMessage);
messageRouter.get("/inbox", isAuth, getInbox);
messageRouter.get("/:userId", isAuth, getMessagesWithId);

module.exports = messageRouter;
