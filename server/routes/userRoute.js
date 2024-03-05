const router = require('express').Router();
const userController = require('../controllers/userController');
const passport = require('passport');

router.post('/', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/email', userController.sendEmail);
router.post('/auth', userController.checkAuth);
router.put('/password', userController.changePassword);
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  userController.getUser
);
router.get('/refresh', userController.refreshUser);
router.get(
  '/logout',
  passport.authenticate('jwt', { session: false }),
  userController.logout
);

module.exports = router;
