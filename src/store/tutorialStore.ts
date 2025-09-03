import { create } from "zustand";
import { 
  generateInventoryResponse, 
  generateProductionResponse, 
  generateSolutionResponse 
} from "@/data/erpDemoData";

export interface TutorialMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: Date;
  type: "text" | "quick-reply" | "highlight-trigger";
}

export interface TutorialScenario {
  trigger: RegExp;
  response: string;
  highlightPath: string[];
  additionalActions?: Array<{
    type: "navigate" | "scroll" | "click" | "expandSection";
    target: string;
    delay?: number;
  }>;
}

export interface TutorialState {
  isActive: boolean;
  currentScenario: TutorialScenario | null;
  highlightedElements: string[];
  messages: TutorialMessage[];
  isTyping: boolean;
  quickReplies: string[];
}

export interface TutorialActions {
  activateTutorial: () => void;
  deactivateTutorial: () => void;
  addMessage: (message: Omit<TutorialMessage, "id" | "timestamp">) => void;
  highlightElements: (elements: string[]) => void;
  clearHighlights: () => void;
  setTyping: (isTyping: boolean) => void;
  processUserInput: (input: string) => Promise<void>;
  setQuickReplies: (replies: string[]) => void;
}

// AI 챗봇 "단비" ERP 시나리오 정의
const TUTORIAL_SCENARIOS: TutorialScenario[] = [
  // ERP 재고 조회 시나리오
  {
    trigger: /단비.*EV9|EV9.*시트.*레일.*재고|EV9.*재고|시트.*레일.*재고/i,
    response: generateInventoryResponse("EV9 전기차용 시트 레일"),
    highlightPath: ['[data-menu="inventory"]'],
    additionalActions: [{ type: "expandSection", target: "inventory-purchase", delay: 100 }],
  },
  // ERP 납품 일정 확인 시나리오  
  {
    trigger: /단비.*우신.*납품|우신.*납품.*물량|이번.*주.*우신|우신.*문제/i,
    response: generateProductionResponse("우신"),
    highlightPath: ['[data-menu="production-orders"]'],
    additionalActions: [{ type: "expandSection", target: "production-mrp", delay: 100 }],
  },
  // ERP 해결책 요청 시나리오
  {
    trigger: /단비.*해결책|해결책.*무엇|어떻게.*해결|대안.*요청/i,
    response: generateSolutionResponse(),
    highlightPath: ['[data-menu="production-orders"]', '[data-menu="purchase-orders"]'],
    additionalActions: [
      { type: "expandSection", target: "production-mrp", delay: 100 },
      { type: "expandSection", target: "inventory-purchase", delay: 200 }
    ],
  },
  // 기존 튜토리얼 시나리오들
  {
    trigger: /고객.*정보.*관리|CRM|영업.*관리|고객.*어떻게/i,
    response:
      "고객 정보는 CRM 파이프라인에서 관리할 수 있습니다! 🎯\n\n✨ 화면에서 파란색으로 하이라이트된 'CRM 파이프라인' 메뉴를 확인해보세요!\n\n📌 하이라이트된 메뉴를 클릭하면 CRM 파이프라인 페이지로 이동하여:\n• 고객별 영업 단계 추적\n• 상세 고객 정보 관리\n• 영업 기회 분석\n\n💡 지금 바로 클릭해보세요!",
    highlightPath: ['[data-menu="crm-pipeline"]'],
    additionalActions: [{ type: "expandSection", target: "sales-customer", delay: 100 }],
  },
  {
    trigger: /재고.*현황|재고.*확인|인벤토리|재고.*어디/i,
    response:
      "재고 현황은 재고 관리 메뉴에서 실시간으로 확인할 수 있습니다! 📦\n\n✨ 화면에서 파란색으로 하이라이트된 '재고 관리' 메뉴를 확인해보세요!\n\n📌 하이라이트된 메뉴를 클릭하면 재고 관리 페이지로 이동하여:\n• 실시간 재고 현황 조회\n• 부족 품목 자동 알림\n• 재고 입출고 내역 추적\n\n💡 지금 바로 클릭해보세요!",
    highlightPath: ['[data-menu="inventory"]'],
    additionalActions: [{ type: "expandSection", target: "inventory-purchase", delay: 100 }],
  },
  {
    trigger: /생산.*일정|생산.*계획|MRP|제조.*일정/i,
    response:
      "생산 일정은 생산 오더 메뉴에서 확인할 수 있습니다! 🏭\n\n✨ 화면에서 파란색으로 하이라이트된 '생산 오더' 메뉴를 확인해보세요!\n\n📌 하이라이트된 메뉴를 클릭하면 생산 관리 페이지로 이동하여:\n• 실시간 생산 진행 상황\n• 일별/주별 생산 계획\n• 설비별 가동 현황\n\n💡 지금 바로 클릭해보세요!",
    highlightPath: ['[data-menu="production-orders"]'],
    additionalActions: [{ type: "expandSection", target: "production-mrp", delay: 100 }],
  },
];

// AI 챗봇 "단비" 빠른 응답 질문들
const DEFAULT_QUICK_REPLIES = [
  "단비, EV9 전기차용 시트 레일 재고 얼마나 남았어?",
  "단비, 이번주 우신 납품 물량 문제 없지?",
  "단비, 해결책이 무엇일까?",
  "재고 현황을 확인하려면?",
  "생산 일정은 어디서 보나요?",
];

export const useTutorialStore = create<TutorialState & TutorialActions>((set, get) => ({
  // 상태
  isActive: false,
  currentScenario: null,
  highlightedElements: [],
  messages: [],
  isTyping: false,
  quickReplies: DEFAULT_QUICK_REPLIES,

  // 액션
  activateTutorial: () => {
    console.log("Tutorial activated");
    set({ isActive: true });

    // AI 챗봇 "단비" 웰컴 메시지 추가
    const welcomeMessage: TutorialMessage = {
      id: Date.now().toString(),
      sender: "bot",
      content:
        "안녕하세요! 👋 저는 닷코 AI 챗봇 단비입니다.\n\n자연어 기반 인터페이스로 ERP 데이터 조회 및 업무 요청을 도와드립니다! 아래 예시처럼 편하게 말씀해주세요:\n\n• \"단비, EV9 시트 레일 재고 얼마나 남았어?\"\n• \"단비, 이번주 우신 납품 물량 문제 없지?\"\n• \"단비, 해결책이 무엇일까?\"",
      timestamp: new Date(),
      type: "text",
    };

    set(() => ({
      messages: [welcomeMessage],
      quickReplies: DEFAULT_QUICK_REPLIES,
    }));
  },

  deactivateTutorial: () => {
    console.log("Tutorial deactivated");
    set({
      isActive: false,
      currentScenario: null,
      highlightedElements: [],
      messages: [],
      isTyping: false,
      quickReplies: DEFAULT_QUICK_REPLIES,
    });
  },

  addMessage: (message) => {
    const newMessage: TutorialMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  highlightElements: (elements) => {
    console.log("Highlighting elements:", elements);
    set({ highlightedElements: elements });
  },

  clearHighlights: () => {
    set({ highlightedElements: [] });
  },

  setTyping: (isTyping) => {
    set({ isTyping });
  },

  setQuickReplies: (replies) => {
    set({ quickReplies: replies });
  },

  processUserInput: async (input) => {
    const { addMessage, highlightElements, setTyping, setQuickReplies } = get();

    console.log("Processing user input:", input);

    // 사용자 메시지 추가
    addMessage({
      sender: "user",
      content: input,
      type: "text",
    });

    // 타이핑 애니메이션 시작
    setTyping(true);

    // 시나리오 매칭
    let matchedScenario: TutorialScenario | null = null;
    for (const scenario of TUTORIAL_SCENARIOS) {
      if (scenario.trigger.test(input)) {
        matchedScenario = scenario;
        break;
      }
    }

    // 1초 후 응답 (실제 AI 응답을 시뮬레이션)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTyping(false);

    if (matchedScenario) {
      // 매칭된 시나리오가 있는 경우
      set({ currentScenario: matchedScenario });

      addMessage({
        sender: "bot",
        content: matchedScenario.response,
        type: "highlight-trigger",
      });

      // 섹션 확장 액션 실행 (하이라이트 전에)
      if (matchedScenario.additionalActions) {
        for (const action of matchedScenario.additionalActions) {
          if (action.type === "expandSection") {
            console.log(`Expanding section: ${action.target}`);
            // DOM에서 해당 섹션 찾아서 확장
            setTimeout(() => {
              const sectionElement = document.querySelector(`[data-section-id="${action.target}"]`);
              if (sectionElement) {
                const headerElement = sectionElement.querySelector('div[style*="cursor: pointer"]') as HTMLElement;
                if (headerElement) {
                  // 섹션 하위 메뉴가 표시되어 있는지 확인
                  const menuList = sectionElement.querySelector('div[style*="flex-direction: column"]');
                  const isExpanded = menuList && menuList.children.length > 0;

                  if (!isExpanded) {
                    console.log(`Section ${action.target} is collapsed, expanding...`);
                    headerElement.click();
                    // 확장 후 추가 딜레이
                    setTimeout(() => {
                      console.log(`Section ${action.target} expansion completed`);
                    }, 200);
                  } else {
                    console.log(`Section ${action.target} is already expanded`);
                  }
                } else {
                  console.warn(`Header not found for section: ${action.target}`);
                }
              } else {
                console.warn(`Section not found: ${action.target}`);
              }
            }, action.delay || 100);
          }
        }
      }

      // 하이라이트 실행 (섹션 확장 후)
      setTimeout(() => {
        highlightElements(matchedScenario.highlightPath);
      }, 800); // 300ms에서 800ms로 증가

      // 관련 빠른 응답 제안
      setQuickReplies(["다른 기능도 궁금해요", "이 메뉴에서 뭘 할 수 있나요?", "처음부터 다시 알려주세요"]);
    } else {
      // 매칭되지 않은 경우 기본 응답
      const defaultResponses = [
        "죄송합니다. 그 기능에 대해서는 아직 준비된 가이드가 없어요. 😅\n\n다른 질문을 해보시거나, 아래 추천 질문을 선택해보세요!",
        "음... 정확히 어떤 기능을 찾고 계신가요? 🤔\n\n더 구체적으로 말씀해주시면 도움을 드릴 수 있어요!",
        "제가 도움드릴 수 있는 주요 기능들을 아래에서 선택해보세요! ✨",
      ];

      const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];

      addMessage({
        sender: "bot",
        content: randomResponse,
        type: "text",
      });

      setQuickReplies(DEFAULT_QUICK_REPLIES);
    }
  },
}));
