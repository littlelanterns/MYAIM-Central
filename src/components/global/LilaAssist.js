// src/components/global/LilaAssist.js - AI Assistant for feature guidance
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2 } from 'lucide-react';
import './LilaComponents.css';

const LilaAssist = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting when opened
      setMessages([
        {
          role: 'assistant',
          content: `Hi there! I'm LiLa Assist! 🌟 

I'm here to help you get the most out of your AIMfM experience! I can help you with:

✨ **Learning AIMfM Features**
- Understanding the Command Center
- Using Quick Actions effectively
- Making the most of your Smart Notepad

🎯 **Workflow Optimization**
- Setting up your ideal workspace
- Tips for better productivity
- Family coordination strategies

💡 **Best Practices**
- Getting better results from AI
- Organizing your family's information
- Tips and tricks for power users

What would you like to learn about first?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response (in real implementation, this would call OpenRouter)
    setTimeout(() => {
      const response = generateAssistResponse(input);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const generateAssistResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('command center') || lowerInput.includes('dashboard')) {
      return `The Command Center is your home base! 🏠

**What you can do from here:**
- **Navigate to different sections** - Family Dashboard, Library, Archive
- **Access LiLa Assistants** - Get help with any feature
- **Quick overview** - See what's available in AIMfM

**Pro Tips:**
- Each card shows what that section does
- Click on any card to explore that area
- The LiLa Assistants card will grow as we add more features

**Getting Started:**
1. Try clicking on "Family Dashboard" to see task management
2. Check out the "Library" for AI learning resources
3. Use the theme selector (top right) to personalize your experience

What specific area interests you most?`;
    }
    
    if (lowerInput.includes('quick actions') || lowerInput.includes('actions')) {
      return `Quick Actions are your productivity boosters! ⚡

**How they work:**
- **Scroll through available actions** - Use the arrows to see more
- **Click to activate** - Each action applies a specific "persona" or context
- **Usage tracking** - Frequently used actions automatically move to the front
- **Add custom actions** - Use the + button to create your own

**Popular Actions:**
- **Me with Manners** - Get help with polite communication
- **Task Breaker** - Break down complex tasks into steps
- **Meal Planner** - Plan family meals and shopping
- **Mediator** - Help resolve family conflicts

**Tips:**
- Try different actions to see how they change AI responses
- Create actions for your family's specific needs
- The most-used actions will appear first automatically

Which type of action would be most helpful for your family?`;
    }
    
    if (lowerInput.includes('notepad') || lowerInput.includes('notes')) {
      return `The Smart Notepad is your family's digital brain! 🧠

**Key Features:**
- **Multiple tabs** - Organize different topics or projects
- **Rich formatting** - Bold, italic, lists, and more formatting options
- **Save functionality** - Download your notes as files
- **Theme integration** - Matches your chosen color theme

**Smart Uses:**
- **Family meeting notes** - Keep track of decisions and plans
- **Project planning** - Break down big family goals
- **AI conversation summaries** - Save important insights
- **Quick capture** - Jot down ideas as they come

**Pro Tips:**
- Double-click tab names to rename them
- Use the + button to create new tabs for different topics
- The notepad content persists while you navigate the app
- Copy important AI responses here for future reference

What type of notes do you want to organize first?`;
    }
    
    if (lowerInput.includes('theme') || lowerInput.includes('color')) {
      return `Themes make AIMfM feel like home! 🎨

**Available Themes:**
- **Standard themes** - Classic AIMfM, Rose Gold, Forest Calm, Ocean Breeze
- **Seasonal themes** - Fresh Spring, Sunny Summer, Cozy Autumn, Winter Wonderland  
- **Holiday themes** - Christmas Joy, Fall Fun

**How themes work:**
- **Change the entire app** - Colors, gradients, and mood
- **Instant switching** - See changes immediately
- **Saved preferences** - Your choice persists across sessions

**Finding your theme:**
- **Rose Gold** - Luxurious and warm
- **Ocean Breeze** - Cool and calming
- **Forest Calm** - Natural and grounding
- **Classic AIMfM** - The original brand colors

**Pro Tip:** Try switching themes based on your mood or the season! Each one creates a different feeling while using the app.

What kind of mood or feeling do you want your workspace to have?`;
    }
    
    return `I'd love to help you with that! 🌟

**I can guide you through:**
- **Command Center** - Understanding the main navigation
- **Quick Actions** - Using persona shortcuts effectively  
- **Smart Notepad** - Organizing your family's information
- **Themes** - Personalizing your workspace
- **Family Features** - Setting up for your family's needs
- **Best Practices** - Getting the most out of AIMfM

**Popular Questions:**
- "How do I use Quick Actions?"
- "What can I do with the Smart Notepad?"
- "How do themes work?"
- "What's the best way to organize my family's information?"

What specific feature would you like to explore? Just ask me about anything you see in the interface!`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="lila-assist-overlay">
      <div className={`lila-assist-modal ${isMinimized ? 'minimized' : ''}`}>
        <div className="lila-assist-header">
          <div className="lila-assist-title">
            <img src="/lila-asst.png" alt="LiLa Assist" className="lila-assist-avatar" />
            <div>
              <h3>LiLa Assist</h3>
              <p>Your AIMfM Guide</p>
            </div>
          </div>
          <div className="lila-assist-controls">
            <button onClick={() => setIsMinimized(!isMinimized)} className="minimize-btn">
              <Minimize2 size={16} />
            </button>
            <button onClick={onClose} className="close-btn">
              <X size={16} />
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            <div className="lila-assist-messages">
              {messages.map((message, index) => (
                <div key={index} className={`assist-message ${message.role}`}>
                  <div className="assist-message-content">
                    {message.content}
                  </div>
                  <div className="assist-message-time">
                    {message.timestamp}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="lila-assist-input">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about any AIMfM feature..."
                rows="2"
              />
              <button onClick={handleSend} disabled={!input.trim()}>
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LilaAssist;