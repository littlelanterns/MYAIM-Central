// src/components/global/LilaHelp.js - WITH PORTAL FIX
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Send, Minimize2 } from 'lucide-react';
import './LilaComponents.css';

const LilaHelp = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm LiLa™ Help! 🛟

I'm here to troubleshoot any issues you're experiencing with AIMfM. I can help with:

🔧 **Technical Issues**
- Login and account problems
- Features not working as expected
- Connection or loading issues
- Mobile app troubles

💳 **Subscription & Billing**
- Payment questions
- Plan changes and upgrades
- Feature access issues
- Account management

🔄 **Data & Sync Issues**
- Family data not updating
- Tasks not saving properly
- Theme changes not applying
- Cross-device sync problems

📱 **Platform Compatibility**
- Browser compatibility issues
- Mobile vs desktop differences
- AI platform connection problems

What issue can I help you troubleshoot today?`,
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

    setTimeout(() => {
      const response = generateHelpResponse(input);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const generateHelpResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('login') || lowerInput.includes('password') || lowerInput.includes('account')) {
      return `Let me help with your account issues! 🔐

**Login Problems:**
- Try clearing your browser cache and cookies
- Make sure you're using the correct email address
- Check if Caps Lock is on for password entry
- Try resetting your password if needed

**Account Access:**
- Verify your subscription is active in account settings
- Some features require specific subscription tiers
- Family member accounts may have different access levels

**Quick Fixes:**
- Refresh the page and try again
- Try a different browser or incognito mode
- Check your internet connection
- Log out completely and log back in

Still having trouble? Let me know the specific error message you're seeing!`;
    }
    
    if (lowerInput.includes('task') || lowerInput.includes('saving') || lowerInput.includes('not working')) {
      return `I'll help you fix those task issues! 📝

**Common Task Problems:**
- **Not Saving**: Check your internet connection and try again
- **Missing Tasks**: Look in different family member views
- **Assignment Issues**: Make sure someone is selected as assignee
- **Frequency Problems**: Verify start date and recurrence settings

**Quick Troubleshooting:**
1. Refresh the page and check if tasks appear
2. Try creating a simple test task
3. Check if other family members can see the tasks
4. Verify you're in the right family account

**Data Sync Issues:**
- Changes may take a few seconds to sync
- Try logging out and back in to refresh data
- Check if you have multiple family accounts

What specific task problem are you experiencing?`;
    }
    
    if (lowerInput.includes('subscription') || lowerInput.includes('billing') || lowerInput.includes('payment')) {
      return `💳

**Common Subscription Issues:**
- **Can't access features**: Check if your subscription is active
- **Billing questions**: Contact support through the main website
- **Plan changes**: Upgrade/downgrade options available in account settings

**What's Included:**
- **Basic**: Core multi-AI interface and notepad
- **Pro**: All personas, unlimited context filters, priority support
- **Family**: Multiple family member accounts with parental controls

**Need Help?**
- Check your account status in settings
- Review your subscription email confirmations
- Contact billing support for payment issues

**Note**: I can't access your actual billing information for privacy reasons, but I can guide you to the right resources!

What specific subscription question can I help with?`;
    }
    
    return `I'm here to help solve your problem! 🛟

**Common Issues I Can Help With:**
- **Connection Problems** - AI platforms not connecting
- **Performance Issues** - Slow loading or lagging
- **Data Questions** - Saving, recovering, or managing your content
- **Feature Questions** - How specific features work
- **Account Issues** - Subscription and billing questions
- **Browser Problems** - Compatibility and technical issues

**For Immediate Help:**
- Try refreshing the page for minor glitches
- Check your internet connection
- Make sure you're logged into AI platforms in other tabs

Can you describe the specific issue you're experiencing? The more details you provide, the better I can help!`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="lila-help-overlay" onClick={onClose}>
      <div 
        className={`lila-help-modal ${isMinimized ? 'minimized' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lila-help-header">
          <div className="lila-help-title">
            <img 
              src="/lila-hth.png" 
              alt="LiLa Help" 
              className="lila-help-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h3>LiLa™ Help</h3>
              <p>Happy to Help</p>
            </div>
          </div>
          <div className="lila-help-controls">
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
            <div className="lila-help-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="help-message-time">
                    {message.timestamp}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="lila-help-input">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the issue you're experiencing..."
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

export default LilaHelp;