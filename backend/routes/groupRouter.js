const Router = require("express");
const groupRouter = Router();

const {
  createGroup,
  getMyGroups,
  getGroupMessages,
  createGroupMessage,
  leaveGroup,
  removeMember,
} = require("../controllers/groupController");
const isAuth = require("../middlewares/isAuth");
const isGroupMember = require("../middlewares/isGroupMember");
const isGroupAdmin = require("../middlewares/isGroupAdmin");
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
groupRouter.delete(
  "/:groupId/members/:userId",
  isAuth,
  isGroupAdmin,
  removeMember
);

module.exports = groupRouter;
