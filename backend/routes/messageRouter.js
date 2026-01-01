const Router = require("express");
const messageRouter = Router();

const { createMessage } = require("../controllers/messageController");
const isAuth = require("../middlewares/isAuth");

messageRouter.post("/", isAuth, createMessage);

module.exports = messageRouter;
