import { useEffect } from "react";
import { useTutorialStore } from "@/store/tutorialStore";

export function MenuHighlighter() {
  const { highlightedElements, isActive } = useTutorialStore();

  useEffect(() => {
    // 기존 스타일 태그 제거
    const existingStyle = document.getElementById("tutorial-highlighter-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    // 새로운 스타일 추가 - 선명하고 밝은 하이라이트
    const style = document.createElement("style");
    style.id = "tutorial-highlighter-styles";
    style.textContent = `
        @keyframes tutorialPulse {
          0%, 100% {
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.8), inset 0 0 25px rgba(59, 130, 246, 0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 35px rgba(59, 130, 246, 1), inset 0 0 35px rgba(59, 130, 246, 0.3);
            transform: scale(1.02);
          }
        }

        @keyframes tutorialGlow {
          0%, 100% {
            background: linear-gradient(rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.15));
          }
          50% {
            background: linear-gradient(rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.25));
          }
        }

        .tutorial-highlight {
          position: relative !important;
          z-index: 60000 !important;
          border: 3px solid #3b82f6 !important;
          border-radius: 12px !important;
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.8) !important;
          animation: tutorialPulse 2s infinite, tutorialGlow 2s infinite !important;
          transition: all 0.3s ease !important;
          background: linear-gradient(rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.15)) !important;
          cursor: pointer !important;
          /* 하이라이트된 영역을 밝게 표시하고 블러 효과 제거 */
          filter: brightness(1.3) contrast(1.2) !important;
          opacity: 1 !important;
          backdrop-filter: none !important;
          pointer-events: auto !important;
          /* 배경 오버레이보다 위에 표시 */
          isolation: isolate !important;
        }

        .tutorial-highlight:hover {
          transform: scale(1.03) !important;
          box-shadow: 0 0 35px rgba(59, 130, 246, 1) !important;
          filter: brightness(1.4) contrast(1.3) !important;
        }

        /* 하이라이트된 요소의 모든 자식 요소도 밝게 하고 블러 효과 제거 */
        .tutorial-highlight *,
        .tutorial-highlight span,
        .tutorial-highlight div,
        .tutorial-highlight svg {
          opacity: 1 !important;
          filter: brightness(1.2) contrast(1.1) !important;
          color: white !important;
          backdrop-filter: none !important;
          pointer-events: auto !important;
        }

        /* 하이라이트된 아이콘도 밝게 */
        .tutorial-highlight svg {
          filter: brightness(1.5) !important;
        }

        /* 하이라이트된 영역은 부모의 블러 효과 무시 */
        .tutorial-highlight {
          isolation: isolate !important;
        }
      `;
    document.head.appendChild(style);

    return () => {
      if (document.getElementById("tutorial-highlighter-styles")) {
        document.getElementById("tutorial-highlighter-styles")?.remove();
      }
    };
  }, []);

  useEffect(() => {
    // 하이라이트 적용/제거
    const allHighlighted = document.querySelectorAll(".tutorial-highlight");
    allHighlighted.forEach((el) => {
      el.classList.remove("tutorial-highlight");
      // 기존 클릭 이벤트 제거
      const clickHandler = (el as any)._tutorialClickHandler;
      if (clickHandler) {
        el.removeEventListener("click", clickHandler);
        delete (el as any)._tutorialClickHandler;
      }
    });

    if (isActive && highlightedElements.length > 0) {
      console.log("MenuHighlighter: Starting to highlight elements:", highlightedElements);

      highlightedElements.forEach((selector) => {
        const attemptHighlight = (retryCount = 0) => {
          try {
            const elements = document.querySelectorAll(selector);
            console.log(`🔍 Selector: "${selector}" - Found ${elements.length} elements (attempt ${retryCount + 1})`);

            if (elements.length === 0 && retryCount < 3) {
              // 요소를 찾지 못한 경우 재시도 (최대 3회)
              console.log(`⏳ Retrying in 500ms... (${retryCount + 1}/3)`);
              setTimeout(() => attemptHighlight(retryCount + 1), 500);
              return;
            }

            if (elements.length === 0) {
              console.warn(`❌ No elements found for selector: "${selector}" after 3 attempts`);
              // 모든 data-section-id 요소 디버깅
              const allSectionElements = document.querySelectorAll("[data-section-id]");
              console.log(
                "📋 Available data-section-id elements:",
                Array.from(allSectionElements).map((el) => {
                  return {
                    id: el.getAttribute("data-section-id"),
                    dataMenu: el.getAttribute("data-menu"),
                    tagName: el.tagName,
                    textContent: el.textContent?.substring(0, 50),
                  };
                })
              );

              // 모든 data-menu 요소 디버깅
              const allMenuElements = document.querySelectorAll("[data-menu]");
              console.log(
                "🎯 Available data-menu elements:",
                Array.from(allMenuElements).map((el) => {
                  return {
                    dataMenu: el.getAttribute("data-menu"),
                    tagName: el.tagName,
                    className: el.className,
                    textContent: el.textContent?.substring(0, 30),
                  };
                })
              );
              return;
            }

            // 요소를 찾은 경우 하이라이트 적용
            elements.forEach((el, index) => {
              console.log(`✅ Highlighting element ${index + 1}:`, {
                tagName: el.tagName,
                className: el.className,
                textContent: el.textContent?.substring(0, 50),
                attributes: {
                  "data-section-id": el.getAttribute("data-section-id"),
                  "data-menu": el.getAttribute("data-menu"),
                },
              });
              el.classList.add("tutorial-highlight");

              // 클릭 이벤트 추가
              const clickHandler = (e: Event) => {
                console.log("🎯 Tutorial highlight clicked!", {
                  element: el,
                  dataMenu: el.getAttribute("data-menu"),
                  tagName: el.tagName,
                  className: el.className,
                  eventType: e.type,
                  timestamp: new Date().toISOString(),
                });

                console.log("Tutorial highlight clicked, allowing original action to proceed...");

                // data-menu 속성이 있는 메뉴 아이템인 경우 (실제 메뉴 아이템)
                const dataMenu = el.getAttribute("data-menu");
                if (dataMenu) {
                  console.log(`Menu item clicked: ${dataMenu}`);

                  // 하이라이트 클래스 및 이벤트 리스너 제거 (즉시)
                  el.classList.remove("tutorial-highlight");
                  el.removeEventListener("click", clickHandler);
                  delete (el as any)._tutorialClickHandler;

                  // 튜토리얼 종료 (즉시)
                  const { deactivateTutorial } = useTutorialStore.getState();
                  deactivateTutorial();

                  // 원본 이벤트가 자연스럽게 처리되도록 함 (preventDefault나 stopPropagation 호출하지 않음)
                  console.log(`Allowing original click event to proceed for: ${dataMenu}`);
                  // 이벤트를 차단하지 않으므로 React Router의 NavLink가 정상적으로 작동함
                } else {
                  // 섹션 헤더인 경우의 기존 로직 유지
                  const sectionId = el.getAttribute("data-section-id");
                  if (sectionId) {
                    const sectionHeader = el.querySelector('div[style*="cursor: pointer"]') as HTMLElement;
                    if (sectionHeader) {
                      console.log(`Triggering section toggle for: ${sectionId}`);
                      const clickEvent = new MouseEvent("click", {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                      });
                      sectionHeader.dispatchEvent(clickEvent);
                    } else {
                      console.warn(`Section header not found for: ${sectionId}`);
                    }
                  }

                  // 섹션 토글의 경우 딜레이 후 튜토리얼 종료
                  setTimeout(() => {
                    const { deactivateTutorial } = useTutorialStore.getState();
                    deactivateTutorial();
                  }, 500);
                }
              };

              el.addEventListener("click", clickHandler);
              (el as any)._tutorialClickHandler = clickHandler;

              // 요소로 부드럽게 스크롤
              setTimeout(() => {
                el.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              }, 200);
            });
          } catch (error) {
            console.warn("Invalid selector:", selector, error);
          }
        };

        // 첫 번째 시도 실행
        attemptHighlight();
      });
    }
  }, [highlightedElements, isActive]);

  return null;
}

