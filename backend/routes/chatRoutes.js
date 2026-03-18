const express = require('express');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/start', chatController.startChat);
router.get('/', chatController.getMyChats);
router.get('/:chatId/messages', chatController.getChatMessages);
router.post('/:chatId/messages', chatController.sendMessage);

module.exports = router;
