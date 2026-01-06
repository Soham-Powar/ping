const Router = require("express");
const groupRouter = Router();

const {
  createGroup,
  getMyGroups,
  getGroupMessages,
  createGroupMessage,
  leaveGroup,
} = require("../controllers/groupController");
const isAuth = require("../middlewares/isAuth");
const isGroupMember = require("../middlewares/isGroupMember");
const upload = require("../middlewares/upload");

groupRouter.post("/", isAuth, createGroup);
groupRouter.get("/", isAuth, getMyGroups);
groupRouter.get("/:groupId/messages", isAuth, isGroupMember, getGroupMessages);
groupRouter.post(
  "/:groupId/messages",
  isAuth,
  isGroupMember,
  upload.single("image"),
  createGroupMessage
);
groupRouter.delete("/:groupId/leave", isAuth, isGroupMember, leaveGroup);

module.exports = groupRouter;
