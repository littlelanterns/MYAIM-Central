// src/components/BestIntentions/BrainDumpCoach.tsx
import React, { FC, useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Sparkles, CheckCircle, RotateCcw } from 'lucide-react';
import { processBrainDumpConversation } from '../../lib/aiServices';

interface BrainDumpCoachProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedPrivacy: 'private' | 'parents_only' | 'family';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface IntentionPreview {
  title: string;
  current_state: string;
  desired_state: string;
  why_it_matters: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

const BrainDumpCoach: FC<BrainDumpCoachProps> = ({ 
  isOpen, 
  onClose, 
  onBack, 
  selectedPrivacy 
}) => {
  const [step, setStep] = useState<'initial' | 'conversation' | 'complete'>('initial');
  const [initialDump, setInitialDump] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [intentionPreview, setIntentionPreview] = useState<IntentionPreview | null>(null);
  const [isIntentionReady, setIsIntentionReady] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const styles = {
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',  // ✅ Align left instead of center
      paddingLeft: '2rem',            // ✅ Space from left edge
      zIndex: 2000,                   // ✅ Consistent z-index (not 99999)
      backdropFilter: 'blur(4px)',
    },
    modalContent: {
      background: 'var(--background-color, #fff4ec)',
      borderRadius: '16px',
      maxWidth: '900px',    // ✅ Slightly narrower to leave space for Smart Notepad
      width: '90%',
      height: '85vh',
      maxHeight: '700px',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      border: '1px solid var(--accent-color, #d4e3d9)',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid var(--accent-color, #d4e3d9)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(244, 220, 183, 0.5))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    headerTitle: {
      color: 'var(--primary-color, #68a395)',
      fontSize: '1.5rem',
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontWeight: '600',
      margin: 0,
    },
    privacyBadge: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      fontSize: '0.75rem',
      padding: '4px 8px',
      borderRadius: '12px',
      fontWeight: '500',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'var(--text-color, #5a4033)',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      opacity: 0.7,
      fontSize: '24px',
      transition: 'opacity 0.2s',
    },
    body: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    initialDumpContainer: {
      padding: '32px',
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
    },
    textarea: {
      flex: 1,
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '1rem',
      color: 'var(--text-color, #5a4033)',
      background: 'white',
      resize: 'none' as const,
      outline: 'none',
      minHeight: '200px',
      fontFamily: 'inherit',
      lineHeight: '1.6',
    },
    conversationContainer: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    messagesContainer: {
      flex: 1,
      overflow: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    messageUser: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '18px 18px 4px 18px',
      maxWidth: '70%',
      alignSelf: 'flex-end',
      fontSize: '0.95rem',
      lineHeight: '1.4',
    },
    messageAssistant: {
      background: 'white',
      color: 'var(--text-color, #5a4033)',
      padding: '12px 16px',
      borderRadius: '18px 18px 18px 4px',
      maxWidth: '70%',
      alignSelf: 'flex-start',
      border: '1px solid var(--accent-color, #d4e3d9)',
      fontSize: '0.95rem',
      lineHeight: '1.4',
    },
    inputContainer: {
      padding: '20px',
      borderTop: '1px solid var(--accent-color, #d4e3d9)',
      background: 'rgba(255, 255, 255, 0.5)',
    },
    inputArea: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end',
    },
    messageInput: {
      flex: 1,
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '20px',
      padding: '12px 16px',
      fontSize: '0.95rem',
      color: 'var(--text-color, #5a4033)',
      background: 'white',
      resize: 'none' as const,
      outline: 'none',
      maxHeight: '100px',
      minHeight: '44px',
    },
    sendButton: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '44px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
    previewPanel: {
      width: '320px',
      borderLeft: '1px solid var(--accent-color, #d4e3d9)',
      background: 'rgba(255, 255, 255, 0.7)',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    previewHeader: {
      padding: '16px',
      borderBottom: '1px solid var(--accent-color, #d4e3d9)',
      background: 'rgba(104, 163, 149, 0.1)',
    },
    previewContent: {
      flex: 1,
      padding: '16px',
      overflow: 'auto',
    },
    previewField: {
      marginBottom: '16px',
    },
    previewLabel: {
      fontSize: '0.8rem',
      fontWeight: '600',
      color: 'var(--primary-color, #68a395)',
      marginBottom: '4px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    previewValue: {
      fontSize: '0.9rem',
      color: 'var(--text-color, #5a4033)',
      lineHeight: '1.4',
      fontStyle: 'italic',
    },
    actionButton: {
      background: 'var(--primary-color, #68a395)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500',
    },
    secondaryButton: {
      background: 'none',
      color: 'var(--text-color, #5a4033)',
      border: '1px solid var(--accent-color, #d4e3d9)',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
  };

  const handleStartBrainDump = async () => {
    if (!initialDump.trim()) return;
    
    setStep('conversation');
    setIsAiThinking(true);
    
    // Add user's brain dump to messages
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: initialDump,
      timestamp: new Date(),
    };
    
    setMessages([userMessage]);
    
    try {
      // Call OpenRouter API with the initial brain dump
      const result = await processBrainDumpConversation([userMessage], true);
      
      if (result.success) {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiResponse]);
        
        // Update intention preview if AI provided one
        if (result.intention) {
          setIntentionPreview(result.intention);
        }
        
        if (result.intentionReady) {
          setIsIntentionReady(true);
        }
      } else {
        // Fallback response on error
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm here to help you sort through your thoughts. Let me understand what's on your mind - what area feels most important to you right now?",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('Error processing brain dump:', error);
      // Fallback response
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having a little trouble connecting right now, but I'm here to listen. Can you tell me more about what's concerning you most?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    }
    
    setIsAiThinking(false);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isAiThinking) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage('');
    setIsAiThinking(true);
    setConversationCount(prev => prev + 1);
    
    try {
      // Call OpenRouter API with the full conversation history
      const result = await processBrainDumpConversation(updatedMessages);
      
      if (result.success) {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiResponse]);
        
        // Update intention preview if AI provided one
        if (result.intention) {
          setIntentionPreview(result.intention);
        }
        
        if (result.intentionReady) {
          setIsIntentionReady(true);
        }
      } else {
        // Fallback response on error
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Can you tell me more about that? I want to make sure I understand what's most important to you.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      // Fallback response
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Can you help me understand what matters most to you in this situation?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    }
    
    setIsAiThinking(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (step === 'initial') {
        handleStartBrainDump();
      } else {
        handleSendMessage();
      }
    }
  };

  const renderInitialDump = () => (
    <div style={styles.initialDumpContainer}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h3 style={{ 
          color: 'var(--primary-color, #68a395)', 
          fontSize: '1.3rem', 
          margin: '0 0 8px 0',
          fontWeight: '600'
        }}>
          Let's start with a brain dump
        </h3>
        <p style={{ 
          color: 'var(--text-color, #5a4033)', 
          opacity: 0.8, 
          margin: 0,
          lineHeight: '1.5'
        }}>
          Share what's on your mind... what areas are you frustrated with? What do you want to improve? 
          What's concerning you about your family? Just dump it all here - I'll help you sort through it.
        </p>
      </div>
      
      <textarea
        ref={textareaRef}
        style={styles.textarea}
        value={initialDump}
        onChange={(e) => setInitialDump(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Start typing whatever comes to mind... there's no wrong way to do this. Maybe you're worried about screen time, or bedtime battles, or wanting more family connection, or personal goals you can't seem to reach..."
        autoFocus
      />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '20px'
      }}>
        <button 
          onClick={onBack}
          style={styles.secondaryButton}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-color, #d4e3d9)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <ArrowLeft size={16} style={{ marginRight: '4px' }} />
          Back
        </button>
        
        <button 
          onClick={handleStartBrainDump}
          disabled={!initialDump.trim()}
          style={{
            ...styles.actionButton,
            opacity: initialDump.trim() ? 1 : 0.5,
            cursor: initialDump.trim() ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={(e) => {
            if (initialDump.trim()) e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            if (initialDump.trim()) e.currentTarget.style.opacity = '1';
          }}
        >
          <Sparkles size={18} />
          Help me sort this out
        </button>
      </div>
    </div>
  );

  const renderConversation = () => (
    <div style={styles.conversationContainer}>
      <div style={styles.chatArea}>
        <div style={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={message.role === 'user' ? styles.messageUser : styles.messageAssistant}
            >
              {message.content}
            </div>
          ))}
          
          {isAiThinking && (
            <div style={styles.messageAssistant}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} className="animate-pulse" />
                AI is thinking...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div style={styles.inputContainer}>
          <div style={styles.inputArea}>
            <textarea
              style={styles.messageInput}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share more about what you're thinking..."
              disabled={isAiThinking}
              rows={1}
            />
            <button
              style={{
                ...styles.sendButton,
                opacity: currentMessage.trim() && !isAiThinking ? 1 : 0.5,
                cursor: currentMessage.trim() && !isAiThinking ? 'pointer' : 'not-allowed',
              }}
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isAiThinking}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div style={styles.previewPanel}>
        <div style={styles.previewHeader}>
          <h4 style={{ 
            margin: 0, 
            color: 'var(--primary-color, #68a395)',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            Forming Intention
          </h4>
        </div>
        
        <div style={styles.previewContent}>
          {intentionPreview ? (
            <>
              <div style={styles.previewField}>
                <div style={styles.previewLabel}>Title</div>
                <div style={styles.previewValue}>{intentionPreview.title}</div>
              </div>
              
              <div style={styles.previewField}>
                <div style={styles.previewLabel}>Current State</div>
                <div style={styles.previewValue}>{intentionPreview.current_state}</div>
              </div>
              
              <div style={styles.previewField}>
                <div style={styles.previewLabel}>Desired State</div>
                <div style={styles.previewValue}>{intentionPreview.desired_state}</div>
              </div>
              
              <div style={styles.previewField}>
                <div style={styles.previewLabel}>Why It Matters</div>
                <div style={styles.previewValue}>{intentionPreview.why_it_matters}</div>
              </div>
              
              <div style={styles.previewField}>
                <div style={styles.previewLabel}>Category</div>
                <div style={styles.previewValue}>{intentionPreview.category}</div>
              </div>
              
              {isIntentionReady && (
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    style={styles.actionButton}
                    onClick={() => setStep('complete')}
                  >
                    <CheckCircle size={18} />
                    Create This Intention
                  </button>
                  
                  <button 
                    style={styles.secondaryButton}
                    onClick={() => {
                      setStep('initial');
                      setMessages([]);
                      setIntentionPreview(null);
                      setIsIntentionReady(false);
                      setConversationCount(0);
                    }}
                  >
                    <RotateCcw size={16} style={{ marginRight: '4px' }} />
                    Start Over
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--text-color, #5a4033)', 
              opacity: 0.6,
              padding: '20px 0'
            }}>
              <Sparkles size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Your intention will appear here as we talk...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <CheckCircle size={64} style={{ color: 'var(--primary-color, #68a395)', marginBottom: '24px' }} />
      <h3 style={{ 
        color: 'var(--primary-color, #68a395)', 
        fontSize: '1.5rem', 
        margin: '0 0 16px 0' 
      }}>
        Intention Created!
      </h3>
      <p style={{ 
        color: 'var(--text-color, #5a4033)', 
        margin: '0 0 32px 0',
        fontSize: '1rem',
        lineHeight: '1.5'
      }}>
        "{intentionPreview?.title}" has been added to your family's Best Intentions.
      </p>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          style={styles.actionButton}
          onClick={onClose}
        >
          View All Intentions
        </button>
        
        <button 
          style={styles.secondaryButton}
          onClick={() => {
            setStep('initial');
            setInitialDump('');
            setMessages([]);
            setIntentionPreview(null);
            setIsIntentionReady(false);
            setConversationCount(0);
          }}
        >
          Create Another
        </button>
      </div>
    </div>
  );

  const getPrivacyDisplay = () => {
    switch (selectedPrivacy) {
      case 'family': return 'Family';
      case 'parents_only': return 'Parents Only';
      case 'private': return 'Private';
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h2 style={styles.headerTitle}>Brain Dump Coach</h2>
            <span style={styles.privacyBadge}>{getPrivacyDisplay()}</span>
          </div>
          <button 
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            ×
          </button>
        </div>

        <div style={styles.body}>
          {step === 'initial' && renderInitialDump()}
          {step === 'conversation' && renderConversation()}
          {step === 'complete' && renderComplete()}
        </div>
      </div>
    </div>
  );
};

export default BrainDumpCoach;