const Router = require("express");
const groupRouter = Router();

const { createGroup } = require("../controllers/groupController");
const isAuth = require("../middlewares/isAuth");

groupRouter.post("/", isAuth, createGroup);

module.exports = groupRouter;
