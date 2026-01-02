const express = require("express");
const router = express.Router();

const { deleteUser } = require("../controllers/userController");
const isAuth = require("../middlewares/isAuth");

router.delete("/me", isAuth, deleteUser);

module.exports = router;
