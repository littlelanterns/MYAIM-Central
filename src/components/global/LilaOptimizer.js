// src/components/global/LilaOptimizer.js - WITH PORTAL FIX
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Send, Minimize2, Edit3 } from 'lucide-react';
import './LilaComponents.css';

const LilaOptimizer = ({ isOpen, onClose }) => {
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
          content: `Hi! I'm LiLa™ Optimizer! ✨

I help you create better prompts that get amazing results from any AI! I can help you:

🎯 **Improve Existing Prompts**
- Make your prompts clearer and more specific
- Add context and structure for better results
- Optimize for different AI platforms

✨ **Create New Prompts**
- Build prompts from scratch for any task
- Add role-playing and context for better responses
- Structure complex multi-step requests

🔧 **Troubleshoot Prompt Issues**
- Fix prompts that aren't working well
- Improve consistency in AI responses
- Make prompts more effective

What prompt would you like me to help you optimize today?`,
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
      const response = generateOptimizerResponse(input);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const generateOptimizerResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('help') || lowerInput.includes('improve') || lowerInput.includes('better')) {
      return `I'd love to help improve that prompt! ✨

**Here's my optimization approach:**

1. **Clarify the role** - Who should the AI act as?
2. **Define the task** - What exactly do you want?
3. **Add context** - What background info helps?
4. **Specify format** - How should the response look?
5. **Include examples** - Show what good looks like

**For your prompt: "${userInput}"**

Let me suggest some improvements:

🎯 **Add a clear role**: "Act as an expert [field] who..."
📋 **Be specific about the task**: Instead of "help me," try "create a detailed plan for..."
🌟 **Add context**: "For a family with [situation]..."
📤 **Specify output format**: "Provide 5 bullet points..." or "Write a 200-word summary..."

Would you like me to rewrite your specific prompt with these improvements?`;
    }
    
    if (lowerInput.includes('write') || lowerInput.includes('create') || lowerInput.includes('make')) {
      return `Perfect! Let's create an amazing prompt together! 🎯

**For writing/creation prompts, here's the magic formula:**

**🎭 ROLE**: "Act as an expert [specialist] with [experience]..."
**📋 TASK**: "Create a [specific thing] that [does what]..."
**🌍 CONTEXT**: "For [audience] who [situation]..."
**📝 FORMAT**: "Structure it as [format] with [elements]..."
**✨ STYLE**: "Use a [tone] tone that [feeling]..."

**Example transformation:**
❌ Original: "Write me something about parenting"
✅ Optimized: "Act as a child development expert with 15 years of experience. Create a practical guide for managing toddler tantrums that busy working parents can implement immediately. Structure it as 5 actionable strategies with real-world examples. Use an empathetic yet confident tone that makes parents feel supported, not judged."

**What specifically are you trying to create?** The more details you give me, the better I can optimize it!`;
    }
    
    if (lowerInput.includes('not working') || lowerInput.includes('bad') || lowerInput.includes('wrong')) {
      return `I can definitely help fix that! 🔧

**Common prompt problems and fixes:**

**🔍 Too Vague**
- Problem: "Help me with dinner"
- Fix: "Create a 30-minute healthy dinner recipe for 2 adults using chicken, vegetables, and pantry staples"

**🎯 Missing Context**
- Problem: "Write a letter"
- Fix: "Write a professional yet warm letter to my child's teacher explaining a 3-day absence due to family emergency"

**📝 No Clear Format**
- Problem: "Tell me about budgeting"
- Fix: "Create a step-by-step budgeting guide with 5 actionable steps, each explained in 2-3 sentences with a real example"

**🎭 No Role Definition**
- Problem: "Give me advice"
- Fix: "Act as a financial advisor and give me advice for saving $500 monthly on a $60K household income"

**What's the prompt that's not working well for you?** I'll help you diagnose and fix it!`;
    }
    
    return `I'm here to make your prompts absolutely amazing! 🚀

**I can help you with:**

🔧 **Fix Broken Prompts**
- Diagnose why prompts aren't working
- Add missing context and clarity
- Improve response quality

✨ **Create New Prompts**
- Build prompts from scratch for any task
- Add role-playing for better AI responses
- Structure complex multi-step requests

🎯 **Optimize Existing Prompts**
- Make good prompts even better
- Add specificity and context
- Improve consistency across AI platforms

**Just share any prompt with me and I'll:**
- Analyze what's working and what isn't
- Suggest specific improvements
- Rewrite it to be more effective
- Explain why the changes will help

**What prompt would you like to work on?** You can paste an existing one or describe what you're trying to accomplish!`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="lila-optimizer-overlay" onClick={onClose}>
      <div 
        className={`lila-optimizer-modal ${isMinimized ? 'minimized' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lila-optimizer-header">
          <div className="lila-optimizer-title">
            <img 
              src="/lila-opt.png" 
              alt="LiLa Optimizer" 
              className="lila-optimizer-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h3>LiLa™ Optimizer</h3>
              <p>Smart AI</p>
            </div>
          </div>
          <div className="lila-optimizer-controls">
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
            <div className="lila-optimizer-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="optimizer-message-time">
                    {message.timestamp}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="lila-optimizer-input">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Paste a prompt to optimize, or describe what you want to create..."
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

export default LilaOptimizer;