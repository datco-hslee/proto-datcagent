import React, { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import ChatbotTutorial from './ChatbotTutorial';
import styles from './ChatbotButton.module.css';

const ChatbotButton: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(prev => !prev);
  };

  return (
    <>
      <button 
        className={styles.chatbotButton}
        onClick={toggleChatbot}
        aria-label="AI 어시스턴트 열기"
      >
        <MessageSquareText size={24} />
        <span className={styles.chatbotButtonText}>AI 어시스턴트</span>
      </button>
      
      <ChatbotTutorial 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </>
  );
};

export default ChatbotButton;
