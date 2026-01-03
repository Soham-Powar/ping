const express = require("express");
const router = express.Router();

const {
  deleteUser,
  getMyProfile,
  getUserById,
  updateUser,
} = require("../controllers/userController");
const isAuth = require("../middlewares/isAuth");
const upload = require("../middlewares/upload");

router.delete("/me", isAuth, deleteUser);
router.get("/me", isAuth, getMyProfile);
router.patch("/me", isAuth, upload.single("avatar"), updateUser);
router.get("/:userId", getUserById);

module.exports = router;
