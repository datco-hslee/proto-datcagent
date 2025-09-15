import { useEffect } from "react";
import { useTutorialStore } from "@/store/tutorialStore";
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function MenuHighlighter() {
  const { highlightedElements, isActive, currentScenario } = useTutorialStore();

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
    // 기존 Driver.js 인스턴스 정리
    if ((window as any).tutorialDriver) {
      (window as any).tutorialDriver.destroy();
      delete (window as any).tutorialDriver;
    }

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
      
      // Driver.js 인스턴스 생성 및 설정
      const driverInstance = driver({
        showProgress: true,
        smoothScroll: true,
        animate: true,
        stagePadding: 15,
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        allowClose: true,
        showButtons: ['next', 'previous', 'close'],
        disableActiveInteraction: false,
        popoverClass: 'datco-driver-popover',
        // 하이라이트 유지를 위한 설정
        doneBtnText: '완료',
        nextBtnText: '다음',
        prevBtnText: '이전',
        progressText: '{{current}} / {{total}}'
      });

      // 전역 변수로 저장
      (window as any).tutorialDriver = driverInstance;

      // 영업 고객 추가 시나리오인 경우 Driver.js 단계별 가이드 실행
      if (currentScenario && currentScenario.response.includes('영업 고객 추가')) {
        console.log("Driver.js: Starting customer addition tutorial");
        
        // 모든 단계를 하나의 인스턴스로 통합
        const steps = [
          {
            element: '[data-section-id="sales-customer"]',
            popover: {
              title: 'Step 1: 영업 & 고객 섹션',
              description: '왼쪽 사이드바에서 "영업 & 고객" 섹션을 확인하세요. 이 섹션에는 고객 관리와 관련된 모든 기능이 있습니다.',
              side: 'right' as const,
              align: 'start' as const
            }
          },
          {
            element: '[data-menu="customer-management"]',
            popover: {
              title: 'Step 2: 고객 관리 메뉴',
              description: '"고객 관리" 메뉴를 클릭하여 고객 관리 페이지로 이동하세요. 여기서 모든 고객 정보를 관리할 수 있습니다.',
              side: 'right' as const,
              align: 'start' as const
            }
          }
        ];

        // 고객 추가 버튼 찾기 함수
        const findAddButton = () => {
          const buttons = document.querySelectorAll('button');
          for (const button of buttons) {
            if (button.textContent?.includes('새 고객 추가') || 
                button.textContent?.includes('고객 추가') ||
                button.textContent?.includes('추가')) {
              return button;
            }
          }
          return null;
        };

        // 고객 추가 버튼이 현재 페이지에 있는지 확인
        const addButton = findAddButton();
        if (addButton) {
          steps.push({
            element: addButton as any,
            popover: {
              title: 'Step 3: 새 고객 추가',
              description: '이 버튼을 클릭하여 새로운 고객을 추가할 수 있습니다. 고객 정보를 입력하고 저장하세요.',
              side: 'right' as const,
              align: 'start' as const
            }
          });
        }

        // 단계별 네비게이션 처리
        driverInstance.setConfig({
          // 하이라이트 시작 시 스타일 제거
          onHighlightStarted: (element: any) => {
            if (element) {
              console.log('하이라이트 시작:', element);
              // 하이라이트 효과 제거 - 스타일 적용하지 않음
            }
          },
          
          onNextClick: (_element: any, _step: any, options: any) => {
            const currentStepIndex = options.state.currentStep;
            
            // Step 2에서 고객 관리 페이지로 이동
            if (currentStepIndex === 1) {
              const customerMenu = document.querySelector('[data-menu="customer-management"]') as HTMLElement;
              if (customerMenu) {
                // 하이라이트 효과 제거
                // 스타일 적용하지 않음
                
                // 클릭 이벤트 실행
                customerMenu.click();
                
                // 페이지 이동 후 Step 3 버튼 찾기 (딜레이 증가)
                setTimeout(() => {
                  const newAddButton = findAddButton();
                  if (newAddButton && steps.length === 2) {
                    // Step 3 추가
                    steps.push({
                      element: newAddButton as any,
                      popover: {
                        title: 'Step 3: 새 고객 추가',
                        description: '이 버튼을 클릭하여 새로운 고객을 추가할 수 있습니다. 고객 정보를 입력하고 저장하세요.',
                        side: 'right' as const,
                        align: 'start' as const
                      }
                    });
                    driverInstance.setSteps(steps);
                  }
                }, 300); // 딜레이 300ms로 증가
              }
            }
            
            driverInstance.moveNext();
          }
        });

        driverInstance.setSteps(steps);
        driverInstance.drive();
      } else {
        // 다른 시나리오의 경우 기존 하이라이트 방식 사용
        console.log("MenuHighlighter: Using standard highlight for scenario:", currentScenario?.response.substring(0, 50));
      }

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
  }, [highlightedElements, isActive, currentScenario]);

  return null;
}

