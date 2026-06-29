import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Bot, Send, Trash2, Sparkles, TrendingUp, ShoppingCart,
  PiggyBank, Target, Lightbulb, RefreshCw, User, Copy, Check
} from 'lucide-react';

const SUGGESTION_CHIPS = [
  { icon: <ShoppingCart size={14} />, text: 'Can I afford a ₹90,000 laptop?' },
  { icon: <TrendingUp size={14} />, text: 'How is my spending this month?' },
  { icon: <PiggyBank size={14} />, text: 'How much should I be saving?' },
  { icon: <Target size={14} />, text: 'How can I reach my goals faster?' },
  { icon: <Lightbulb size={14} />, text: 'Give me 3 tips to cut expenses.' },
  { icon: <TrendingUp size={14} />, text: 'Where should I invest my balance?' },
];

const MessageBubble = ({ msg }) => {
  const [copied, setCopied] = useState(false);
  const isAI = msg.sender === 'ai';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      flexDirection: isAI ? 'row' : 'row-reverse',
      maxWidth: '100%',
      animation: 'fadeSlideIn 0.3s ease',
    }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: isAI ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isAI ? '0 2px 8px rgba(22,163,74,0.3)' : '0 2px 8px rgba(99,102,241,0.3)'
      }}>
        {isAI ? <Bot size={18} color="white" /> : <User size={18} color="white" />}
      </div>

      {/* Bubble + Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: 'calc(100% - 60px)' }}>
        <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, marginBottom: '2px', textAlign: isAI ? 'left' : 'right' }}>
          {isAI ? 'Nexus AI' : 'You'} · {msg.time}
        </div>
        <div style={{
          background: isAI ? 'white' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: isAI ? '#1f2937' : 'white',
          padding: '12px 16px',
          borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          fontSize: '0.92rem',
          lineHeight: '1.6',
          border: isAI ? '1px solid #f3f4f6' : 'none',
          boxShadow: isAI ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 8px rgba(99,102,241,0.25)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {msg.text}
        </div>
        {isAI && (
          <button
            onClick={handleCopy}
            style={{
              alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px',
              transition: 'color 0.2s'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Bot size={18} color="white" />
    </div>
    <div style={{
      background: 'white', border: '1px solid #f3f4f6', padding: '14px 18px',
      borderRadius: '4px 16px 16px 16px', display: 'flex', gap: '4px', alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#16a34a',
          animation: `bounce 1s ${delay}s infinite`
        }} />
      ))}
    </div>
  </div>
);

const AIAdvisor = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm Nexus AI, your personal financial advisor. I have access to your complete financial data — your income, expenses, savings, and goals.\n\nAsk me anything about your finances! 💡",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg = {
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:8000/ai/chat',
        { message: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: res.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: '⚠️ I had trouble connecting to the AI service. Please try again in a moment.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      sender: 'ai',
      text: "Chat cleared! I'm ready to help with your financial questions. 💡",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      background: '#f8fafc',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
    }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <Bot size={26} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Nexus AI Advisor
              <span style={{
                background: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', fontWeight: 700,
                padding: '2px 8px', borderRadius: '20px', letterSpacing: '1px'
              }}>LIVE</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', marginTop: '2px' }}>
              Powered by GPT4Free · Analyzes your real financial data
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          title="Clear chat"
          style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '10px', padding: '8px 14px', color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {/* ── Messages Area ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: '#f8fafc',
      }}>
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggestion Chips ── */}
      {messages.length <= 1 && !isLoading && (
        <div style={{
          padding: '0 24px 16px',
          flexShrink: 0,
          background: '#f8fafc'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> Try asking...
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SUGGESTION_CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => sendMessage(chip.text)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '20px',
                  border: '1px solid #d1fae5', background: 'white',
                  color: '#065f46', fontSize: '0.82rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.borderColor = '#6ee7b7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#d1fae5'; }}
              >
                {chip.icon} {chip.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Area ── */}
      <div style={{
        padding: '16px 24px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          background: '#f9fafb',
          border: '2px solid #e5e7eb',
          borderRadius: '16px',
          padding: '10px 14px',
          transition: 'border-color 0.2s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = '#16a34a'}
          onBlurCapture={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask me about your finances... (Shift+Enter for new line)"
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: '0.92rem', lineHeight: '1.5', resize: 'none',
              color: '#1f2937', maxHeight: '120px', overflowY: 'auto'
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            style={{
              width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
              background: input.trim() && !isLoading ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#e5e7eb',
              border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: input.trim() && !isLoading ? '0 2px 8px rgba(22,163,74,0.3)' : 'none'
            }}
          >
            {isLoading
              ? <RefreshCw size={16} color="#9ca3af" style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={16} color={input.trim() ? 'white' : '#9ca3af'} style={{ marginLeft: '2px' }} />
            }
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9ca3af', marginTop: '8px' }}>
          AI responses are based on your actual financial data · Press Enter to send
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
