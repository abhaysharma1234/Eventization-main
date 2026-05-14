import chatbotService from '../services/chatbotService.js';

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || req.ip; // Use IP for anonymous users
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userInfo = req.user ? {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      points: req.user.points,
      interests: req.user.interests
    } : null;

    const response = await chatbotService.processMessage(userId, message, userInfo);
    
    res.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const { limit = 10 } = req.query;
    
    const history = chatbotService.getChatHistory(userId, parseInt(limit));
    
    res.json({ history });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Failed to get chat history' });
  }
};

export const clearChat = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    
    chatbotService.clearContext(userId);
    
    res.json({ message: 'Chat cleared successfully' });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ message: 'Failed to clear chat' });
  }
};
