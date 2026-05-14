import Event from '../models/Event.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';

class ChatbotService {
  constructor() {
    this.context = new Map(); // Store user context
    this.responses = {
      greetings: [
        "Hello! I'm your Eventization assistant. How can I help you today?",
        "Hi there! Welcome to Eventization. What can I do for you?",
        "Greetings! I'm here to help you with events and registrations. What do you need?"
      ],
      farewell: [
        "Goodbye! Have a great day!",
        "See you later! Feel free to come back if you need help.",
        "Bye! Don't hesitate to ask if you need assistance."
      ],
      help: [
        "I can help you with:\n- Finding events\n- Event registrations\n- Event details\n- Account questions\n- And much more!",
        "I'm your Eventization assistant! I can help you discover events, manage registrations, and answer questions about our platform."
      ],
      unknown: [
        "I'm not sure I understand. Could you rephrase that?",
        "I didn't quite get that. Can you tell me more?",
        "Hmm, I'm not sure how to help with that. Try asking about events, registrations, or your account."
      ]
    };
  }

  async processMessage(userId, message, userInfo = null) {
    try {
      // Store user context
      if (!this.context.has(userId)) {
        this.context.set(userId, { messages: [], userInfo });
      }
      
      const userContext = this.context.get(userId);
      userContext.messages.push({ role: 'user', content: message, timestamp: new Date() });

      // Process the message and generate response
      const response = await this.generateResponse(message, userInfo, userContext);
      
      // Store bot response
      userContext.messages.push({ role: 'bot', content: response, timestamp: new Date() });
      
      // Keep only last 20 messages to prevent memory issues
      if (userContext.messages.length > 20) {
        userContext.messages = userContext.messages.slice(-20);
      }

      return {
        response,
        suggestions: await this.generateSuggestions(message, userInfo)
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        response: "I'm having trouble understanding right now. Please try again later.",
        suggestions: []
      };
    }
  }

  async generateResponse(message, userInfo, context) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check for greetings
    if (this.isGreeting(lowerMessage)) {
      return this.getRandomResponse('greetings');
    }
    
    // Check for farewells
    if (this.isFarewell(lowerMessage)) {
      return this.getRandomResponse('farewell');
    }
    
    // Check for help requests
    if (this.isHelpRequest(lowerMessage)) {
      return this.getRandomResponse('help');
    }
    
    // Event-related queries
    if (this.isEventQuery(lowerMessage)) {
      return await this.handleEventQuery(lowerMessage, userInfo);
    }
    
    // Registration queries
    if (this.isRegistrationQuery(lowerMessage)) {
      return await this.handleRegistrationQuery(lowerMessage, userInfo);
    }
    
    // Account queries
    if (this.isAccountQuery(lowerMessage)) {
      return await this.handleAccountQuery(lowerMessage, userInfo);
    }
    
    // Platform information
    if (this.isPlatformQuery(lowerMessage)) {
      return this.handlePlatformQuery(lowerMessage);
    }
    
    // Default response
    return this.getRandomResponse('unknown');
  }

  isGreeting(message) {
    const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => message.includes(greeting));
  }

  isFarewell(message) {
    const farewells = ['bye', 'goodbye', 'see you', 'later', 'farewell'];
    return farewells.some(farewell => message.includes(farewell));
  }

  isHelpRequest(message) {
    const helpKeywords = ['help', 'what can you do', 'how can you help', 'assist', 'support'];
    return helpKeywords.some(keyword => message.includes(keyword));
  }

  isEventQuery(message) {
    const eventKeywords = ['event', 'events', 'find', 'search', 'upcoming', 'today', 'this week', 'category', 'tech', 'sports', 'workshop'];
    return eventKeywords.some(keyword => message.includes(keyword));
  }

  isRegistrationQuery(message) {
    const regKeywords = ['register', 'registration', 'sign up', 'attend', 'join', 'my registrations', 'passes'];
    return regKeywords.some(keyword => message.includes(keyword));
  }

  isAccountQuery(message) {
    const accountKeywords = ['account', 'profile', 'login', 'signup', 'my details', 'points', 'role'];
    return accountKeywords.some(keyword => message.includes(keyword));
  }

  isPlatformQuery(message) {
    const platformKeywords = ['what is', 'about', 'platform', 'eventization', 'how does', 'features'];
    return platformKeywords.some(keyword => message.includes(keyword));
  }

  async handleEventQuery(message, userInfo) {
    try {
      // Extract category from message
      const categories = ['tech', 'sports', 'cultural', 'workshop'];
      let category = null;
      
      for (const cat of categories) {
        if (message.includes(cat)) {
          category = cat.charAt(0).toUpperCase() + cat.slice(1);
          break;
        }
      }

      // Get events
      const filter = { status: 'approved', date: { $gte: new Date() } };
      if (category) {
        filter.category = category;
      }

      const events = await Event.find(filter).sort({ date: 1 }).limit(5);
      
      if (events.length === 0) {
        return category 
          ? `I don't see any upcoming ${category} events right now. Try checking other categories or create one if you're an organizer!`
          : "I don't see any upcoming events right now. Check back later or create your own event!";
      }

      let response = category 
        ? `I found ${events.length} upcoming ${category} events:\n\n`
        : `Here are some upcoming events:\n\n`;

      events.forEach((event, index) => {
        const eventDate = new Date(event.date).toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
        response += `${index + 1}. **${event.title}**\n   - ${event.category}\n   - ${eventDate}\n   - ${event.location}\n\n`;
      });

      response += "Would you like more details about any of these events?";
      return response;

    } catch (error) {
      return "I'm having trouble finding events right now. Please try again later.";
    }
  }

  async handleRegistrationQuery(message, userInfo) {
    if (!userInfo) {
      return "Please log in to check your registrations. I can help you find events without logging in though!";
    }

    try {
      const registrations = await Registration.find({ 
        user: userInfo.id 
      }).populate('event').sort({ createdAt: -1 });

      if (registrations.length === 0) {
        return "You haven't registered for any events yet! Would you like me to help you find some upcoming events?";
      }

      const upcomingRegs = registrations.filter(reg => 
        new Date(reg.event.date) > new Date() && reg.status === 'registered'
      );

      let response = `You have ${registrations.length} total registrations`;
      
      if (upcomingRegs.length > 0) {
        response += ` and ${upcomingRegs.length} upcoming events:\n\n`;
        upcomingRegs.slice(0, 3).forEach((reg, index) => {
          const eventDate = new Date(reg.event.date).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
          response += `${index + 1}. **${reg.event.title}**\n   - ${eventDate}\n   - ${reg.event.location}\n   - Status: ${reg.status}\n\n`;
        });
      } else {
        response += ". You don't have any upcoming events. Would you like to find some new events to join?";
      }

      return response;

    } catch (error) {
      return "I'm having trouble accessing your registrations right now. Please try again later.";
    }
  }

  async handleAccountQuery(message, userInfo) {
    if (!userInfo) {
      return "I can help you with account questions once you're logged in. Would you like to know how to sign up or log in?";
    }

    let response = `Hello ${userInfo.name}! Here's your account information:\n\n`;
    response += `- **Role**: ${userInfo.role}\n`;
    response += `- **Email**: ${userInfo.email}\n`;
    response += `- **Points**: ${userInfo.points || 0}\n`;
    
    if (userInfo.interests && userInfo.interests.length > 0) {
      response += `- **Interests**: ${userInfo.interests.join(', ')}\n`;
    }

    response += `\nIs there anything specific about your account you'd like to know?`;
    return response;
  }

  handlePlatformQuery(message) {
    return `**Eventization** is your all-in-one campus event platform! Here's what we offer:

**For Students:**
- Discover and register for events
- Get QR code passes for easy check-in
- Rate and review events
- Personalized event recommendations

**For Organizers:**
- Create and manage events
- Track registrations in real-time
- Export participant data
- AI-powered attendance predictions

**For Everyone:**
- Secure authentication
- Real-time announcements
- Mobile-friendly interface
- 24/7 chat support (that's me!)

Would you like to know more about any specific feature?`;
  }

  async generateSuggestions(message, userInfo) {
    const suggestions = [];
    
    if (this.isEventQuery(message.toLowerCase())) {
      suggestions.push("Tell me about tech events", "What's happening this week?", "Find sports events");
    }
    
    if (this.isRegistrationQuery(message.toLowerCase())) {
      suggestions.push("Show my upcoming events", "How do I register?", "Cancel registration");
    }
    
    if (!userInfo) {
      suggestions.push("How to sign up?", "What events are available?", "Tell me about Eventization");
    } else {
      suggestions.push("My account details", "Upcoming events", "Help with registration");
    }

    return suggestions.slice(0, 3);
  }

  getRandomResponse(type) {
    const responses = this.responses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getChatHistory(userId, limit = 10) {
    const context = this.context.get(userId);
    if (!context) return [];
    
    return context.messages.slice(-limit);
  }

  clearContext(userId) {
    this.context.delete(userId);
  }
}

export default new ChatbotService();
