// src/components/global/LilaAssist.js - WITH PORTAL FIX
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Send, Minimize2, Edit3 } from 'lucide-react';
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
          content: `Hi! I'm LiLa™ Assist! 🌟

I'm here to help you navigate AIMfM and get the most out of your AI tools. I can help you:

🎯 **Getting Started**
- Set up your family profile and preferences
- Understand how different tools work together
- Find the right tools for your specific needs

💡 **Feature Guidance**
- Learn how to use any AIMfM feature effectively
- Get tips for better family AI workflows
- Discover hidden features and shortcuts

🔧 **Optimization Tips**
- Make your AI interactions more effective
- Customize settings for your family's style
- Get the most value from your subscription

What would you like help with today?`,
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
    
    if (lowerInput.includes('task') || lowerInput.includes('create')) {
      return `Great question about tasks! 📝

**Creating Tasks:**
- Use the "Create Task" button in Quick Actions
- Fill out all the details - assignment, frequency, rewards
- Try the AI subtask generator for complex tasks

**Task Types:**
- **Tasks**: Required responsibilities (chores, homework)
- **Opportunities**: Optional goals with rewards

**Pro Tips:**
- Use TaskBreaker AI for overwhelming tasks
- Set up templates for recurring tasks
- Track completion to see family patterns

Need help with any specific part of task creation?`;
    }
    
    if (lowerInput.includes('family') || lowerInput.includes('setup')) {
      return `Let me help you set up your family! 👨‍👩‍👧‍👦

**Family Setup Steps:**
1. **Add Family Members** - Names, ages, interests
2. **Set Preferences** - Learning styles, motivators
3. **Choose Themes** - Pick colors that match your family vibe
4. **Configure Tools** - Decide which AI features to use

**Best Practices:**
- Include everyone's personality traits
- Note each person's challenges and strengths  
- Set up age-appropriate tool access
- Start with basic features, then expand

Would you like me to walk you through any of these steps?`;
    }
    
    if (lowerInput.includes('theme') || lowerInput.includes('color')) {
      return `Themes make AIMfM feel like home! 🎨

**Available Themes:**
- **Classic**: Warm, cozy family feeling
- **Nature**: Earthy, calming tones
- **Modern**: Clean, contemporary look
- **Playful**: Bright, fun colors for active families

**How to Change:**
- Click the theme dropdown in the header
- Changes apply instantly across all tools
- Themes sync across all family member accounts

**Customization Tips:**
- Pick themes that match your family's energy
- Darker themes are easier on eyes for evening use
- Kids often prefer brighter, more colorful themes

Want help choosing the right theme for your family?`;
    }
    
    return `I'm here to help you master AIMfM! 🌟

**Common things I can help with:**
- **Getting Started**: Family setup, first steps
- **Tool Usage**: How any specific feature works
- **Troubleshooting**: When something isn't working right
- **Optimization**: Making AI work better for your family
- **Best Practices**: Tips from other successful families

**Just ask me about:**
- Setting up family profiles
- Creating and managing tasks
- Using AI features effectively
- Customizing your experience
- Finding the right tools for your needs

What specific area would you like help with?`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="lila-assist-overlay" onClick={onClose}>
      <div 
        className={`lila-assist-modal ${isMinimized ? 'minimized' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lila-assist-header">
          <div className="lila-assist-title">
            <img 
              src="/lila-asst.png" 
              alt="LiLa Assist" 
              className="lila-assist-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h3>LiLa™ Assist</h3>
              <p>Your Guide</p>
            </div>
          </div>
          <div className="lila-assist-controls">
            <button 
              className="minimize-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              <Minimize2 size={16} />
            </button>
            <button 
              className="close-btn"
              onClick={onClose}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="lila-assist-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-content">
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
                placeholder="Ask me anything about AIMfM..."
                rows={2}
              />
              <button onClick={handleSend} disabled={!input.trim()}>
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default LilaAssist;