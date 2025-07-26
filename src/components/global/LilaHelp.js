// src/components/global/LilaHelp.js - Fixed image filename
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Search } from 'lucide-react';
import './LilaComponents.css';  // Use your existing CSS file

const LilaHelp = ({ isOpen, onClose }) => {
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
          content: `Hello! I'm LiLa Help! 🛟

I'm here to help you solve problems and answer questions about AIMfM. I can help with:

🔧 **Technical Issues**
- Connection problems with AI platforms
- Browser compatibility issues
- Performance troubleshooting

📚 **FAQ & Common Questions**
- Account and subscription questions
- Feature explanations
- Best practices

🆘 **Troubleshooting**
- Error messages
- Features not working as expected
- Data and privacy questions

What can I help you troubleshoot today?`,
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
    
    if (lowerInput.includes('connect') || lowerInput.includes('login') || lowerInput.includes('auth')) {
      return `Connection issues can be frustrating! Let's troubleshoot: 🔧

**For AI Platform Connections:**
1. **Check your browser** - Make sure you're logged into ChatGPT, Claude, etc. in other tabs
2. **Clear cache** - Try refreshing the page or clearing browser cache
3. **Check status** - Look for the colored dots next to platform names (green = connected)
4. **Try incognito** - Test in a private browsing window

**Still having issues?**
- Make sure you have active subscriptions to the AI platforms you're trying to use
- Some platforms may require additional authentication steps
- Check if your browser is blocking popups or scripts

Which specific platform are you having trouble connecting to?`;
    }
    
    if (lowerInput.includes('slow') || lowerInput.includes('lag') || lowerInput.includes('performance')) {
      return `Performance issues can impact your experience! Here's how to fix them: ⚡

**Quick Fixes:**
1. **Close other tabs** - AI platforms can be resource-intensive
2. **Restart browser** - This often resolves memory issues
3. **Check internet** - Ensure you have a stable connection
4. **Reduce active panels** - Try using 1-2 AI panels instead of 4

**Browser Optimization:**
- **Chrome**: Enable hardware acceleration in settings
- **Firefox**: Clear recent history and cookies
- **Safari**: Empty caches and disable extensions temporarily

**If problems persist:**
- Try using AIMfM during off-peak hours
- Close resource-heavy applications
- Consider upgrading your browser

What specific performance issues are you experiencing?`;
    }
    
    if (lowerInput.includes('save') || lowerInput.includes('lost') || lowerInput.includes('data')) {
      return `Don't worry about losing your work! Here's how AIMfM handles data: 💾

**What's Automatically Saved:**
- Context filter settings
- Quick action preferences
- Panel layout choices

**What You Need to Save Manually:**
- Notepad content (use "Save As" button)
- AI conversations (use copy buttons)
- Optimized prompts (copy or save to notepad)

**Recovery Options:**
- Check your browser's download folder for saved files
- Look in your notepad's other tabs
- Recent conversations might still be in individual panels

**Best Practices:**
- Save important conversations to your notepad regularly
- Use "Save As" for any content you want to keep long-term
- Consider keeping a backup notepad tab for important work

What specific content are you trying to recover?`;
    }
    
    if (lowerInput.includes('subscription') || lowerInput.includes('payment') || lowerInput.includes('billing')) {
      return `I can help with subscription questions! 💳

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

  return (
    <div className="lila-help-overlay">
      <div className={`lila-help-modal ${isMinimized ? 'minimized' : ''}`}>
        <div className="lila-help-header">
          <div className="lila-help-title">
            <img src="/Lila-HtH.png" alt="LiLa Help" className="lila-help-avatar" />
            <div>
              <h3>LiLa Help</h3>
              <p>Support & FAQ</p>
            </div>
          </div>
          <div className="lila-help-controls">
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
            <div className="lila-help-messages">
              {messages.map((message, index) => (
                <div key={index} className={`help-message ${message.role}`}>
                  <div className="help-message-content">
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
                placeholder="Describe your issue or ask a question..."
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

export default LilaHelp;