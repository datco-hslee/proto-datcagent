import React, { useState, useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Bot, Send, X } from 'lucide-react';
import enhancedChatbotService, { type EnhancedChatbotResponse } from '../../data/enhancedChatbotIntegration';
import { createDriverInstance, expandMenuSection, addHighlightEffect, removeHighlightEffect, CUSTOMER_ADD_BUTTON_SELECTOR } from '../../utils/driverHelper';
import styles from './ChatbotTutorial.module.css';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string | React.ReactNode;
  timestamp: Date;
}

interface ChatbotTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotTutorial: React.FC<ChatbotTutorialProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    '영업 고객 추가방법 알려줘',
    '재고 관리는 어떻게 하나요?',
    '생산 오더 등록 방법',
    '급여 관리 방법 알려줘'
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const driverRef = useRef<any>(null);
  
  // 초기 웰컴 메시지
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'bot',
        content: (
          <div>
            <p><strong>안녕하세요! 👋</strong></p>
            <p>DATCO AI 어시스턴트입니다. 업무 관련 질문이나 도움이 필요한 기능에 대해 물어보세요.</p>
            <p>예시: "영업 고객 추가방법 알려줘", "재고 관리는 어떻게 하나요?"</p>
          </div>
        ),
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      
      // 입력창에 포커스
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, messages.length]);
  
  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Driver.js 초기화
  useEffect(() => {
    driverRef.current = createDriverInstance();
    
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);
  
  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsTyping(true);
    
    try {
      // 향상된 챗봇 서비스 사용
      console.log('쿼리 처리 시작:', currentQuery);
      const enhancedResponse = await enhancedChatbotService.processQuery(currentQuery);
      console.log('응답 받음:', enhancedResponse);
      
      // 응답 메시지 생성
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'bot',
        content: formatEnhancedBotResponse(enhancedResponse),
        timestamp: new Date()
      };
      
      // 타이핑 애니메이션 후 메시지 표시
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, botMessage]);
        
        // 디버그 로그
        console.log('하이라이트 정보:', {
          navigationPath: enhancedResponse.navigationPath ? '있음' : '없음',
          driverSteps: enhancedResponse.driverSteps ? `있음 (${enhancedResponse.driverSteps.length} 단계)` : '없음',
          menuPath: enhancedResponse.menuPath ? enhancedResponse.menuPath.join(' -> ') : '없음',
          includeActionButton: enhancedResponse.includeActionButton || false
        });
        
        // 하이라이트 실행
        if (enhancedResponse.navigationPath && enhancedResponse.driverSteps) {
          console.log('향상된 네비게이션 실행');
          executeEnhancedNavigation(enhancedResponse);
        } else if (enhancedResponse.menuPath && enhancedResponse.menuPath.length > 0) {
          console.log('기본 메뉴 하이라이트 실행');
          highlightMenuPath(enhancedResponse.menuPath);
        }
      }, 1000);
      
    } catch (error) {
      console.error('메시지 처리 중 오류:', error);
      setIsTyping(false);
      
      // 오류 메시지
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'bot',
        content: '죄송합니다. 요청을 처리하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  // 향상된 봇 응답 포맷팅
  const formatEnhancedBotResponse = (response: EnhancedChatbotResponse): React.ReactNode => {
    if (!response) {
      return '죄송합니다. 응답을 받지 못했습니다. 다시 시도해주세요.';
    }
    
    return (
      <div className={styles.botResponseContainer}>
        <h3 className={styles.responseTitle}>{response.response.title}</h3>
        
        <div className={styles.stepsContainer}>
          <h4>단계:</h4>
          <ol>
            {response.response.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
        
        {response.response.tips && response.response.tips.length > 0 && (
          <div className={styles.tipsContainer}>
            <h4>팁:</h4>
            <ul>
              {response.response.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className={styles.responseMetadata}>
          {response.fromCache && (
            <div className={styles.cacheInfo}>
              <small>📋 캐시된 응답</small>
            </div>
          )}
          {response.confidence && (
            <div className={styles.confidenceInfo}>
              <small>🎯 정확도: {Math.round(response.confidence)}%</small>
            </div>
          )}
          <div className={styles.dataSourceInfo}>
            <small>📊 데이터 소스: {response.dataSource === 'backend' ? '백엔드 서버' : response.dataSource === 'cache' ? '캐시' : '로컬'}</small>
          </div>
        </div>
      </div>
    );
  };
  
  // 향상된 네비게이션 실행
  const executeEnhancedNavigation = async (response: EnhancedChatbotResponse) => {
    console.log('향상된 네비게이션 시작');
    
    if (!driverRef.current) {
      console.log('Driver.js 인스턴스 생성');
      driverRef.current = createDriverInstance();
    } else {
      // 기존 인스턴스 제거 후 재생성
      driverRef.current.destroy();
      driverRef.current = createDriverInstance();
    }
    
    if (!response.navigationPath || !response.driverSteps) {
      console.warn('네비게이션 데이터 없음');
      return;
    }
    
    try {
      // 1. 섹션 자동 확장
      const sectionId = response.navigationPath.dataSectionId;
      console.log(`섹션 ID: ${sectionId} 확장 시도`);
      expandMenuSection(sectionId);
      
      // 2. Driver.js 설정
      console.log('Driver.js 설정:', response.driverSteps);
      driverRef.current.setSteps(response.driverSteps);
      
      // 3. 이벤트 핸들러 설정
      driverRef.current.setConfig({
        showProgress: true,
        steps: response.driverSteps,
        onHighlightStarted: (element: any) => {
          console.log('하이라이트 시작:', element);
          if (element && element instanceof HTMLElement) {
            addHighlightEffect(element);
          }
        },
        onNextClick: async (_element: any, _step: any, options: any) => {
          const currentStepIndex = options.state.currentStep;
          console.log(`다음 단계로 이동: ${currentStepIndex} -> ${currentStepIndex + 1}`);
          
          // 메뉴 항목 클릭 처리 (2단계)
          if (currentStepIndex === 1 && response.navigationPath) {
            const menuId = response.navigationPath.dataMenu;
            const menuElement = document.querySelector(`[data-menu="${menuId}"]`) as HTMLElement;
            if (menuElement) {
              console.log('메뉴 항목 클릭:', menuId);
              menuElement.click();
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // 3단계가 있는 경우 (고객 추가 버튼)
              if (response.driverSteps && response.driverSteps.length > 2) {
                console.log('3단계 버튼 검색 시작');
                let retries = 0;
                const maxRetries = 10;
                
                while (retries < maxRetries) {
                  const buttons = document.querySelectorAll('button');
                  console.log(`버튼 ${buttons.length}개 발견`);
                  
                  // 버튼 텍스트 로깅
                  buttons.forEach((btn, idx) => {
                    console.log(`버튼 ${idx + 1}: ${btn.textContent?.trim() || '[텍스트 없음]'}`);
                  });
                  
                  const addButton = document.querySelector(CUSTOMER_ADD_BUTTON_SELECTOR);
                  if (addButton) {
                    console.log('새 고객 추가 버튼 발견!');
                    break;
                  }
                  
                  await new Promise(resolve => setTimeout(resolve, 300));
                  retries++;
                }
              }
            }
          }
          
          driverRef.current.moveNext();
        },
        onDeselected: (element: any) => {
          if (element && element instanceof HTMLElement) {
            removeHighlightEffect(element);
          }
        }
      });
      
      // 4. 튜토리얼 시작
      console.log('Driver.js 튜토리얼 시작');
      driverRef.current.drive();
      
    } catch (error) {
      console.error('네비게이션 오류:', error);
    }
  };
  
  // 기본 메뉴 하이라이트
  const highlightMenuPath = (menuPath: string[]) => {
    console.log('기본 메뉴 하이라이트:', menuPath);
    
    if (!driverRef.current) {
      driverRef.current = createDriverInstance();
    } else {
      driverRef.current.destroy();
      driverRef.current = createDriverInstance();
    }
    
    const steps = [];
    
    // 1단계: 메뉴 섹션
    if (menuPath.length > 0) {
      steps.push({
        element: `[data-section-id="${menuPath[0]}"]`,
        popover: {
          title: '1단계: 메뉴 섹션',
          description: '이 메뉴 섹션을 클릭하여 확장하세요.',
          side: 'right' as const,
          align: 'start' as const
        }
      });
      
      // 섹션 자동 확장
      expandMenuSection(menuPath[0]);
    }
    
    // 2단계: 메뉴 항목
    if (menuPath.length > 1) {
      steps.push({
        element: `[data-menu="${menuPath[1]}"]`,
        popover: {
          title: '2단계: 메뉴 항목',
          description: '이 메뉴를 클릭하여 해당 페이지로 이동하세요.',
          side: 'right' as const,
          align: 'start' as const
        }
      });
    }
    
    // 3단계: 새 고객 추가 버튼 (고객 관리 페이지인 경우)
    if (menuPath.includes('customers')) {
      steps.push({
        element: CUSTOMER_ADD_BUTTON_SELECTOR,
        popover: {
          title: '3단계: 새 고객 추가',
          description: '이 버튼을 클릭하여 새로운 고객을 추가하세요.',
          side: 'right' as const,
          align: 'start' as const
        }
      });
    }
    
    if (steps.length > 0) {
      // 이벤트 핸들러 설정
      driverRef.current.setConfig({
        showProgress: true,
        steps: steps,
        onHighlightStarted: (element: any) => {
          if (element && element instanceof HTMLElement) {
            addHighlightEffect(element);
          }
        },
        onNextClick: async (_element: any, _step: any, options: any) => {
          const currentStepIndex = options.state.currentStep;
          
          // 메뉴 항목 클릭 처리 (2단계)
          if (currentStepIndex === 1 && menuPath.length > 1) {
            const menuElement = document.querySelector(`[data-menu="${menuPath[1]}"]`) as HTMLElement;
            if (menuElement) {
              menuElement.click();
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
          
          driverRef.current.moveNext();
        },
        onDeselected: (element: any) => {
          if (element && element instanceof HTMLElement) {
            removeHighlightEffect(element);
          }
        }
      });
      
      // 튜토리얼 시작
      driverRef.current.drive();
    }
  };
  
  // 빠른 응답 클릭 처리
  const handleQuickReplyClick = (reply: string) => {
    setInputValue(reply);
    handleSendMessage();
  };
  
  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* 어두운 배경 오버레이 */}
      <div 
        className={styles.overlay}
        onClick={onClose}
      />
      
      {/* 챗봇 창 */}
      <div className={styles.chatContainer}>
        {/* 헤더 */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderInfo}>
            <div className={styles.chatBotIcon}>
              <Bot size={24} />
            </div>
            <div>
              <h3 className={styles.chatTitle}>DATCO AI 어시스턴트</h3>
              <p className={styles.chatSubtitle}>ERP 업무를 도와드려요!</p>
            </div>
          </div>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* 메시지 영역 */}
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`${styles.messageWrapper} ${
                message.sender === 'user' ? styles.userMessage : styles.botMessage
              }`}
            >
              <div className={styles.messageContent}>
                {message.content}
                <div className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* 타이핑 인디케이터 */}
          {isTyping && (
            <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* 빠른 응답 버튼 */}
        {quickReplies.length > 0 && (
          <div className={styles.quickRepliesContainer}>
            <div className={styles.quickRepliesLabel}>추천 질문:</div>
            <div className={styles.quickRepliesButtons}>
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  className={styles.quickReplyButton}
                  onClick={() => handleQuickReplyClick(reply)}
                  disabled={isTyping}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 입력 영역 */}
        <div className={styles.inputContainer}>
          <input
            ref={inputRef}
            type="text"
            className={styles.chatInput}
            placeholder="메시지를 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <button
            className={styles.sendButton}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatbotTutorial;
