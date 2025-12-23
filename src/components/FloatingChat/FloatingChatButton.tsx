import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const FloatingChatButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{id: number; text: string; sender: 'user' | 'bot'}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showSelectionTooltip, setShowSelectionTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show the button after component mounts to avoid SSR issues
    setIsVisible(true);

    // Add event listeners for text selection and mouseup
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        const selectedText = selection.toString().trim();
        if (selectedText.length > 5) { // Only if more than 5 characters are selected
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setSelectedText(selectedText);
          setTooltipPosition({ x: rect.left, y: rect.top - 10 });
          setShowSelectionTooltip(true);
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
        setShowSelectionTooltip(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    setShowSelectionTooltip(false);
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if ((text && text.trim() === '') || isLoading) return;

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      text: text,
      sender: 'user' as const
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setShowSelectionTooltip(false);
    setIsLoading(true);

    try {
      // Call the RAG backend API
      const response = await fetch(`https://humanoid-robotics-backend-production.up.railway.app/api/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: `query_${Date.now()}`,
          question: text,
          query_mode: selectedText ? "selected-text" : "book-wide", // Use selected-text mode if we have selected text
          selected_text: selectedText || undefined, // Include selected text if available
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add bot response
      const botResponse = {
        id: Date.now() + 1,
        text: data.answer || "Sorry, I couldn't process your request at the moment.",
        sender: 'bot' as const
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error communicating with RAG backend:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error processing your request. Please try again later.",
        sender: 'bot' as const
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setSelectedText(''); // Clear the selected text after sending
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to ask about selected text
  const handleAskAboutSelection = () => {
    setInputValue(`Explain this: ${selectedText.substring(0, 200)}${selectedText.length > 200 ? '...' : ''}`);
    setShowSelectionTooltip(false);
  };

  // Function to send selected text directly
  const handleSendSelection = () => {
    handleSendMessage(selectedText);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <BrowserOnly fallback={<div style={{ display: 'none' }} />}>
      {() => (
        <>
          {/* Selection Tooltip */}
          {showSelectionTooltip && selectedText && (
            <div
              style={{
                position: 'fixed',
                top: `${tooltipPosition.y}px`,
                left: `${tooltipPosition.x}px`,
                zIndex: 10000,
                backgroundColor: 'white',
                color: 'black',
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                maxWidth: '300px',
                wordWrap: 'break-word',
                border: '1px solid #ddd',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: '#f0f8ff'
                }}
                onClick={handleAskAboutSelection}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ask about this text</span>
                  <span>👉</span>
                </div>
                <div style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {selectedText}
                </div>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: '#f8f9fa'
                }}
                onClick={handleSendSelection}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Analyze this text</span>
                  <span>🔍</span>
                </div>
              </div>
            </div>
          )}

          {/* Chat Window */}
          {isChatOpen && (
            <div
              ref={chatWindowRef}
              style={{
                position: 'fixed',
                bottom: '90px',
                right: '20px',
                zIndex: 9998,
                width: '350px',
                height: '450px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                overflow: 'hidden',
                border: '1px solid #e0e0e0'
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  backgroundColor: '#007cba',
                  color: 'white',
                  padding: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <h3 style={{ margin: 0, fontSize: '16px' }}>Chat with Physical AI Textbook</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Chat Messages */}
              <div
                style={{
                  flex: 1,
                  padding: '15px',
                  overflowY: 'auto',
                  backgroundColor: '#f9f9f9',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                      fontStyle: 'italic'
                    }}
                  >
                    Ask me about Physical AI and Humanoid Robotics!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                          backgroundColor: message.sender === 'user' ? '#007cba' : '#e9ecef',
                          color: message.sender === 'user' ? 'white' : '#333',
                          padding: '10px 15px',
                          borderRadius: '18px',
                          maxWidth: '80%',
                          wordWrap: 'break-word'
                        }}
                      >
                        {message.text}
                      </div>
                    ))}
                    {isLoading && (
                      <div
                        style={{
                          alignSelf: 'flex-start',
                          backgroundColor: '#e9ecef',
                          color: '#333',
                          padding: '10px 15px',
                          borderRadius: '18px',
                          maxWidth: '80%'
                        }}
                      >
                        Thinking...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div
                style={{
                  padding: '10px',
                  backgroundColor: 'white',
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex'
                }}
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedText ? "Ask about selected text..." : "Ask about Physical AI & Humanoid Robotics..."}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '20px',
                    border: '1px solid #ddd',
                    resize: 'none',
                    minHeight: '40px',
                    maxHeight: '80px',
                    fontSize: '14px'
                  }}
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  style={{
                    marginLeft: '10px',
                    padding: '10px 15px',
                    backgroundColor: isLoading ? '#cccccc' : '#007cba',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: (!inputValue.trim() || isLoading) ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {isLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          )}

          {/* Floating Chat Button */}
          <div
            onClick={handleChatToggle}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 9999,
              cursor: 'pointer',
              backgroundColor: '#007cba', // Docusaurus blue color
              color: 'white',
              padding: '15px',
              borderRadius: '50%',
              fontSize: '20px',
              fontWeight: 'bold',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              border: 'none',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = '#006ba1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#007cba';
            }}
            title="Open Chat"
            aria-label="Open Chat"
          >
            {isChatOpen ? '×' : '💬'}
          </div>
        </>
      )}
    </BrowserOnly>
  );
};

export default FloatingChatButton;