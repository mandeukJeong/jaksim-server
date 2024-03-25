const router = require('express').Router();
const boardContoller = require('./../controllers/boardController');
router.get('/:subject', boardContoller.getBoardList);

module.exports = router;
