const express = require("express");
const router = express.Router();

const {
  deleteUser,
  getMyProfile,
  getUserById,
} = require("../controllers/userController");
const isAuth = require("../middlewares/isAuth");

router.delete("/me", isAuth, deleteUser);
router.get("/me", isAuth, getMyProfile);
router.get("/:userId", getUserById);

module.exports = router;
