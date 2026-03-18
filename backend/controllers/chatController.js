const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Car = require('../models/Car');

const withChatRelations = (query) =>
  query
    .populate('buyer', 'name email phone')
    .populate('seller', 'name email phone')
    .populate('car', 'title brand model year price seller postedBy')
    .populate({
      path: 'messages',
      populate: { path: 'sender', select: 'name email' },
      options: { sort: { createdAt: 1 } },
    });

exports.startChat = async (req, res) => {
  try {
    const { carId } = req.body;
    if (!carId) {
      return res.status(400).json({
        success: false,
        message: 'carId is required.',
      });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.',
      });
    }

    if (!car.postedBy) {
      return res.status(400).json({
        success: false,
        message: 'This car listing is legacy data without seller account mapping.',
      });
    }

    const buyerId = req.user._id;
    const sellerId = car.postedBy;

    if (String(buyerId) === String(sellerId)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start chat on your own listing.',
      });
    }

    let chat = await Chat.findOne({ car: carId, buyer: buyerId, seller: sellerId });
    if (!chat) {
      chat = await Chat.create({
        car: carId,
        buyer: buyerId,
        seller: sellerId,
      });
    }

    const populatedChat = await withChatRelations(Chat.findById(chat._id));
    return res.status(200).json({
      success: true,
      data: populatedChat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await withChatRelations(
      Chat.find({
        $or: [{ buyer: userId }, { seller: userId }],
      }).sort({ lastMessageAt: -1 })
    );

    return res.status(200).json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await withChatRelations(Chat.findById(chatId));
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    const isParticipant =
      String(chat.buyer._id) === String(userId) || String(chat.seller._id) === String(userId);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this chat.',
      });
    }

    return res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    const isParticipant = String(chat.buyer) === String(userId) || String(chat.seller) === String(userId);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to send messages in this chat.',
      });
    }

    const message = await Message.create({
      chat: chatId,
      sender: userId,
      content: content.trim(),
    });

    chat.messages.push(message._id);
    chat.lastMessageAt = new Date();
    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name email');
    const io = req.app.get('io');
    io.to(chatId).emit('chat:message', {
      chatId,
      message: populatedMessage,
    });

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
