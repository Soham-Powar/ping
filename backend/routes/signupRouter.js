const Router = require("express");
const signupRouter = Router();

const signupController = require("../controllers/signupController");

signupRouter.post("/", signupController.signupPost);

module.exports = signupRouter;
