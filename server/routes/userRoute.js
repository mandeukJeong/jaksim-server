const router = require("express").Router();
const userController = require("../controllers/userController");

router.post("/", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/email", userController.sendEmail);
router.post("/auth", userController.checkAuth);
router.put("/password", userController.changePassword);

module.exports = router;