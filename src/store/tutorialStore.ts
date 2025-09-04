import { create } from "zustand";
import { 
  generateInventoryResponse, 
  generateSolutionResponse 
} from '../data/chatbotDataIntegration';
import { 
  generateTraceabilityResponse
} from '../data/chatbotIntegration';

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
  // 인건비 분석 (우선순위 높임 - 다른 패턴과 겹치지 않도록)
  {
    trigger: /인건비|급여.*분석|노무비|인력.*비용|급여.*현황|.*부.*인건비|.*부.*급여|.*팀.*인건비|.*팀.*급여/i,
    response: generateTraceabilityResponse("인건비"),
    highlightPath: ['[data-menu="payroll"]'],
    additionalActions: [{ type: "expandSection", target: "hr-payroll", delay: 100 }],
  },
  // 추적성 관련 쿼리
  {
    trigger: /추적|이력|트레이스|어디서.*왔|어떻게.*만들어/i,
    response: generateTraceabilityResponse("추적"),
    highlightPath: ['[data-menu="production-orders"]'],
    additionalActions: [{ type: "expandSection", target: "production-mrp", delay: 100 }],
  },
  // 납기 준수율 분석
  {
    trigger: /납기.*준수|납기.*율|정시.*납품|지연.*납품|납기.*분석/i,
    response: generateTraceabilityResponse("납기"),
    highlightPath: ['[data-menu="shipping"]'],
    additionalActions: [{ type: "expandSection", target: "logistics-shipping", delay: 100 }],
  },
  // 생산 효율성 분석 (인건비와 겹치지 않도록 패턴 수정)
  {
    trigger: /(?!.*인건비)(?!.*급여)생산.*효율|생산.*실적|(?!.*인건비)(?!.*급여)생산.*분석|불량률|생산성/i,
    response: generateTraceabilityResponse("생산 효율"),
    highlightPath: ['[data-menu="production-orders"]'],
    additionalActions: [{ type: "expandSection", target: "production-mrp", delay: 100 }],
  },
  // 재고 회전율 분석
  {
    trigger: /재고.*회전|재고.*소모|재고.*분석|재고.*효율/i,
    response: generateTraceabilityResponse("재고 회전"),
    highlightPath: ['[data-menu="inventory"]'],
    additionalActions: [{ type: "expandSection", target: "inventory-purchase", delay: 100 }],
  },
  // ERP 재고 조회 시나리오 (기존)
  {
    trigger: /단비.*EV9|EV9.*시트.*레일.*재고|EV9.*재고|시트.*레일.*재고/i,
    response: generateInventoryResponse("EV9 전기차용 시트 레일"),
    highlightPath: ['[data-menu="inventory"]'],
    additionalActions: [{ type: "expandSection", target: "inventory-purchase", delay: 100 }],
  },
  // ERP 납품 일정 확인 시나리오 (기존)
  {
    trigger: /단비.*우신.*납품|우신.*납품.*물량|이번.*주.*우신|우신.*문제/i,
    response: generateInventoryResponse("우신 납품"),
    highlightPath: ['[data-menu="production-orders"]'],
    additionalActions: [{ type: "expandSection", target: "production-mrp", delay: 100 }],
  },
  // ERP 해결책 요청 시나리오 (기존)
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
  "제품 추적 이력을 보여줘",
  "납기 준수율은 어떻게 되나요?",
  "생산 효율성 분석해줘",
  "재고 회전율 확인하고 싶어요",
  "인건비 분석 결과 알려줘",
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
      // 매칭되지 않은 경우 포괄적 분석 시도
      let fallbackResponse = "";
      
      // 일반적인 ERP 키워드로 포괄적 응답 시도
      if (input.includes("분석") || input.includes("현황") || input.includes("상태")) {
        fallbackResponse = generateTraceabilityResponse(input);
      } else if (input.includes("데이터") || input.includes("정보") || input.includes("조회")) {
        fallbackResponse = "📊 **ERP 데이터 현황**\n\n" +
          "현재 시스템에는 6개월간의 완전한 추적 가능한 데이터가 준비되어 있습니다:\n\n" +
          "• **자재 입고**: 500+ 건의 입고 기록\n" +
          "• **생산 실적**: 800+ 건의 생산 기록\n" +
          "• **납품 이력**: 600+ 건의 납품 기록\n" +
          "• **근태 관리**: 650+ 건의 출근 기록\n" +
          "• **급여 처리**: 30+ 건의 급여 기록\n" +
          "• **회계 분개**: 2000+ 건의 회계 기록\n\n" +
          "구체적인 분석이나 조회를 원하시면 아래 추천 질문을 선택해보세요!";
      } else {
        // 기본 응답
        const defaultResponses = [
          "ERP 시스템의 다양한 기능을 활용해보세요! 📊\n\n아래 추천 질문으로 시작해보시거나, 구체적인 업무 관련 질문을 해주세요:",
          "어떤 ERP 데이터나 분석이 필요하신가요? 🤔\n\n추적성, 생산성, 재고, 납기, 인건비 등 다양한 분석이 가능합니다!",
          "6개월간의 완전한 ERP 데이터로 근거 기반 답변을 제공할 수 있습니다! ✨\n\n아래에서 관심 있는 분야를 선택해보세요:",
        ];
        
        fallbackResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      }

      addMessage({
        sender: "bot",
        content: fallbackResponse,
        type: "text",
      });

      setQuickReplies(DEFAULT_QUICK_REPLIES);
    }
  },
}));
