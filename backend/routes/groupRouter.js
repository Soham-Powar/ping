const Router = require("express");
const groupRouter = Router();

const {
  createGroup,
  getMyGroups,
  getGroupMessages,
} = require("../controllers/groupController");
const isAuth = require("../middlewares/isAuth");
const isGroupMember = require("../middlewares/isGroupMember");

groupRouter.post("/", isAuth, createGroup);
groupRouter.get("/", isAuth, getMyGroups);
groupRouter.get("/:groupId/messages", isAuth, isGroupMember, getGroupMessages);

module.exports = groupRouter;
