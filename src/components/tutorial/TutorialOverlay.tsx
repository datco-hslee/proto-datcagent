import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User } from "lucide-react";
import { useTutorialStore } from "@/store/tutorialStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TutorialOverlay() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  let isActive = false;
  let messages: any[] = [];
  let isTyping = false;
  let quickReplies: string[] = [];
  let deactivateTutorial = () => console.log("Deactivate tutorial attempted");
  let processUserInput = async (input: string) => console.log("Process input:", input);
  let clearHighlights = () => console.log("Clear highlights attempted");

  try {
    const store = useTutorialStore();
    isActive = store.isActive;
    messages = store.messages;
    isTyping = store.isTyping;
    quickReplies = store.quickReplies;
    deactivateTutorial = store.deactivateTutorial;
    processUserInput = store.processUserInput;
    clearHighlights = store.clearHighlights;
  } catch (error) {
    console.error("Error accessing tutorial store in overlay:", error);
  }

  // 디버깅 로그
  console.log("TutorialOverlay render, isActive:", isActive, "messages count:", messages.length);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 오버레이가 열릴 때 입력창에 포커스
  useEffect(() => {
    if (isActive) {
      console.log("TutorialOverlay activated, setting focus");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isActive]);

  // ESC 키로 튜토리얼 종료
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        console.log("ESC key pressed, closing tutorial");
        clearHighlights();
        deactivateTutorial();
      }
    };

    if (isActive) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, clearHighlights, deactivateTutorial]);

  const handleClose = () => {
    console.log("TutorialOverlay close clicked");
    clearHighlights();
    deactivateTutorial();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    console.log("Sending message:", inputValue);
    await processUserInput(inputValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = async (reply: string) => {
    console.log("Quick reply clicked:", reply);
    await processUserInput(reply);
  };

  console.log("TutorialOverlay about to render, isActive:", isActive);

  return (
    <>
      {/* 튜토리얼 오버레이 시스템 */}
      {isActive && (
        <>
          {/* 어두운 배경 오버레이 - 기존 화면을 반투명하게 가리고 배경 클릭 처리 */}
          <div
            data-tutorial-overlay="background"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              // 낮은 z-index로 설정하여 사이드바/헤더(50)보다 아래에 위치시켜
              // 하이라이트 요소들이 오버레이 위에 올라올 수 있도록 함
              zIndex: 20,
              backdropFilter: "blur(1px)",
              pointerEvents: "auto", // 배경 클릭 감지를 위해 활성화
              cursor: "pointer",
            }}
            onClick={(e) => {
              // 하이라이트된 요소 클릭인지 다양한 방법으로 확인
              const clickedElement = e.target as HTMLElement;
              const isHighlightedElement = clickedElement.closest(".tutorial-highlight");

              // 더 정확한 검사: 직접 클래스를 가진 요소 또는 data-menu 속성을 가진 요소 찾기
              const highlightedByClass = clickedElement.classList.contains("tutorial-highlight");
              const highlightedParent = clickedElement.closest(".tutorial-highlight");
              const menuElement = clickedElement.closest("[data-menu]");
              const isMenuHighlighted = menuElement && menuElement.classList.contains("tutorial-highlight");

              console.log("Background overlay clicked - detailed analysis", {
                target: e.target,
                currentTarget: e.currentTarget,
                clickedElementTag: clickedElement.tagName,
                clickedElementClass: clickedElement.className,
                clickedElementDataMenu: clickedElement.getAttribute("data-menu"),
                highlightedByClass,
                highlightedParent: !!highlightedParent,
                menuElement: !!menuElement,
                menuElementDataMenu: menuElement?.getAttribute("data-menu"),
                isMenuHighlighted,
                clientX: e.clientX,
                clientY: e.clientY,
              });

              // 하이라이트된 요소를 클릭한 경우 - 이벤트를 차단하지 말고 자연스럽게 전달
              const actualHighlightedElement = isHighlightedElement || highlightedParent || (isMenuHighlighted ? menuElement : null);

              if (actualHighlightedElement) {
                console.log("Highlighted element detected - allowing natural click:", {
                  element: actualHighlightedElement,
                  tagName: actualHighlightedElement.tagName,
                  className: actualHighlightedElement.className,
                  dataMenu: actualHighlightedElement.getAttribute("data-menu"),
                });

                // 이벤트를 차단하지 않고 자연스럽게 전달되도록 함
                // 하지만 배경 오버레이에서는 아무것도 하지 않음
                return;
              }

              // 배경 자체를 클릭한 경우에만 튜토리얼 종료
              if (e.target === e.currentTarget) {
                console.log("Background clicked, closing tutorial");
                clearHighlights();
                deactivateTutorial();
              }
            }}
          />

          {/* 채팅창 - 플로팅 버튼 근처 (우하단) */}
          <div
            data-tutorial-overlay="chat"
            style={{
              position: "fixed",
              bottom: "100px",
              right: "20px",
              zIndex: 50001, // 하이라이트(60000)보다 아래
              width: "400px",
              height: "550px",
              backgroundColor: "white",
              borderRadius: "20px",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "3px solid #3b82f6",
              transform: "scale(1)",
              transformOrigin: "bottom right",
              animation: "tutorialSlideIn 0.4s ease-out",
            }}
          >
            {/* 헤더 */}
            <div
              data-tutorial-overlay="header"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "white",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bot size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: "700", fontSize: "18px" }}>닷코 AI 챗봇 "단비"</h3>
                  <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>ERP 업무를 도와드려요!</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                }}
              >
                ×
              </button>
            </div>

            {/* 메시지 영역 */}
            <div
              data-tutorial-overlay="messages"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                backgroundColor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#6b7280", padding: "30px 20px" }}>
                  <h3 style={{ margin: "0 0 10px 0", color: "#374151", fontSize: "18px" }}>안녕하세요! 👋</h3>
                  <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.5" }}>
                    테크솔루션 업무 시스템의 튜토리얼 도우미입니다.
                    <br />
                    궁금한 기능이나 메뉴에 대해 언제든 물어보세요!
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    style={{
                      display: "flex",
                      justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "12px 16px",
                        borderRadius: "16px",
                        backgroundColor: message.sender === "user" ? "#3b82f6" : "white",
                        color: message.sender === "user" ? "white" : "#1f2937",
                        border: message.sender === "bot" ? "1px solid #e5e7eb" : "none",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        fontSize: "14px",
                      }}
                    >
                      <p style={{ margin: 0, lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{message.content}</p>
                      <p
                        style={{
                          margin: "6px 0 0 0",
                          fontSize: "11px",
                          opacity: 0.7,
                        }}
                      >
                        {message.timestamp
                          ? message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* 타이핑 인디케이터 */}
              {isTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "16px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "4px" }}>
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "#6b7280",
                          borderRadius: "50%",
                          animation: "bounce 1.4s infinite ease-in-out",
                        }}
                      />
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "#6b7280",
                          borderRadius: "50%",
                          animation: "bounce 1.4s infinite ease-in-out 0.2s",
                        }}
                      />
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "#6b7280",
                          borderRadius: "50%",
                          animation: "bounce 1.4s infinite ease-in-out 0.4s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 빠른 응답 버튼들 */}
            {quickReplies.length > 0 && (
              <div
                data-tutorial-overlay="quick-replies"
                style={{
                  padding: "16px",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: "white",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>추천 질문:</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      disabled={isTyping}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        borderRadius: "16px",
                        border: "1px solid #bfdbfe",
                        cursor: isTyping ? "not-allowed" : "pointer",
                        opacity: isTyping ? 0.5 : 1,
                        transition: "all 0.2s",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        if (!isTyping) {
                          e.currentTarget.style.backgroundColor = "#dbeafe";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isTyping) {
                          e.currentTarget.style.backgroundColor = "#eff6ff";
                        }
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 입력 영역 */}
            <div
              data-tutorial-overlay="input"
              style={{
                padding: "16px",
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "white",
                display: "flex",
                gap: "8px",
              }}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                disabled={isTyping}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  fontSize: "14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  outline: "none",
                  backgroundColor: isTyping ? "#f3f4f6" : "white",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                style={{
                  padding: "10px 14px",
                  backgroundColor: !inputValue.trim() || isTyping ? "#d1d5db" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: !inputValue.trim() || isTyping ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "44px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (inputValue.trim() && !isTyping) {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (inputValue.trim() && !isTyping) {
                    e.currentTarget.style.backgroundColor = "#3b82f6";
                  }
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @keyframes tutorialSlideIn {
          0% {
            transform: scale(0.85) translateY(30px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
