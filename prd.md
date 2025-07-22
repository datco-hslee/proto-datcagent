# 소규모 기업용 Odoo 통합 업무 시스템 프로토타입 PRD

## 개요

본 문서는 `answer.md`에서 설계된 'AI Assistant 기반 역할 중심 워크플로우' 메뉴 구조를 React + shadcn/ui로 구현하는 **프론트엔드 전용 프로토타입**의 상세 요구사항을 정의합니다.

### 프로토타입 특성

- **백엔드 개발 불필요**: 모든 데이터는 프론트엔드의 가상 데이터로 시뮬레이션
- **완전한 시연 가능**: 실제 API 없이도 모든 기능 체험 가능
- **즉시 실행 가능**: 브라우저에서 바로 실행되는 정적 웹 애플리케이션
- **현실적 시뮬레이션**: 실제 업무 시나리오를 가상 데이터로 완벽 재현
- **인터랙티브 튜토리얼**: AI 기반 실시간 가이드 시스템

가상 데이터를 활용하여 실제 업무 시나리오를 시뮬레이션하고, 설계된 개선사항들을 체험할 수 있는 인터랙티브 프로토타입을 제작합니다.

## 기술 스택

### 프론트엔드

- **React 18**: 메인 프레임워크
- **TypeScript**: 타입 안전성
- **shadcn/ui**: UI 컴포넌트 라이브러리
- **Tailwind CSS**: 스타일링
- **Lucide React**: 아이콘
- **React Router DOM**: 라우팅
- **Zustand**: 상태 관리
- **React Query**: 가상 API 시뮬레이션 (실제 백엔드 없이 데이터 페칭 패턴 구현)

### 개발 도구

- **Vite**: 빌드 도구
- **ESLint + Prettier**: 코드 품질
- **Vitest**: 단위 테스트
- **Playwright**: E2E 테스트

## 프로젝트 구조

```
src/
├── components/
│   ├── ui/                    # shadcn/ui 컴포넌트
│   ├── layout/               # 레이아웃 컴포넌트
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── AIAssistant.tsx
│   ├── tutorial/             # 튜토리얼 시스템 컴포넌트
│   │   ├── TutorialChatbot.tsx
│   │   ├── TutorialOverlay.tsx
│   │   └── MenuHighlighter.tsx
│   ├── business/             # 비즈니스 로직 컴포넌트
│   │   ├── customer/
│   │   ├── operations/
│   │   └── management/
│   └── common/               # 공통 컴포넌트
├── pages/                    # 페이지 컴포넌트
├── hooks/                    # 커스텀 훅
├── store/                    # Zustand 스토어
├── data/                     # 가상 데이터
├── types/                    # TypeScript 타입 정의
├── utils/                    # 유틸리티 함수
└── tests/                    # 테스트 파일
```

## 핵심 기능 요구사항

### 1. AI 비서 (중앙 허브)

#### 1.1 기본 인터페이스

- **위치**: 화면 상단 고정 헤더
- **구성요소**:
  - 검색/명령 입력창 (Cmd+K 단축키 지원)
  - 알림 벨 아이콘 (Badge로 미읽음 개수 표시)
  - 사용자 프로필 드롭다운
  - 역할 전환 토글

#### 1.2 자연어 명령 처리

```typescript
interface AICommand {
  query: string;
  intent: "search" | "navigate" | "create" | "report";
  entities: string[];
  response: string;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}
```

**구현할 명령 예시**:

- "A고객사 견적서 초안 만들어줘" → 견적서 생성 페이지로 이동 + 고객 자동 선택
- "지난달 영업이익 보고서 보여줘" → 대시보드 이동 + 해당 차트 하이라이트
- "재고 부족 상품 알려줘" → 재고 현황 페이지 + 필터 적용

#### 1.3 개인화 알림

```typescript
interface Notification {
  id: string;
  type: "urgent" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    variant: "default" | "destructive";
    action: () => void;
  }>;
}
```

### 2. 플로팅 튜토리얼 챗봇 시스템 (신규 기능)

#### 2.1 플로팅 도움말 버튼

- **위치**: 화면 우하단 고정 (z-index: 9999)
- **디자인**: 원형 버튼 (60px × 60px), 물음표 아이콘, 파란색 배경
- **동작**: 스크롤/화면 전환과 무관하게 항상 동일 위치 유지
- **호버 효과**: 펄스 애니메이션 및 크기 증가
- **클릭 시**: 전체 화면 오버레이와 함께 채팅창 활성화

```typescript
interface FloatingHelpButton {
  position: {
    bottom: "2rem";
    right: "2rem";
  };
  size: "60px";
  icon: "HelpCircle";
  backgroundColor: "#3b82f6";
  animation: "pulse";
  zIndex: 9999;
}
```

#### 2.2 튜토리얼 오버레이 시스템 - 개선된 UX

- **배경 오버레이**:

  - 반투명 다크 배경 (`rgba(0, 0, 0, 0.3)`)
  - 약간의 블러 효과 (`backdrop-filter: blur(1px)`)
  - `pointer-events: auto`로 배경 클릭을 감지해 하이라이트 여부 분석
  - 배경 클릭으로 튜토리얼 종료, 하이라이트 클릭은 자연스럽게 통과

- **채팅창 위치 및 크기**:
  - 위치: 플로팅 버튼 근처 우하단 (`bottom: 100px, right: 20px`)
  - 크기: 400px(가로) × 550px(세로)
  - 애니메이션: 부드러운 슬라이드업 + 스케일 인 효과
  - 둥근 모서리 및 고급 그림자 효과

```typescript
interface TutorialOverlay {
  isActive: boolean;
  chatPosition: {
    bottom: "100px";
    right: "20px";
  };
  chatSize: {
    width: "400px";
    height: "550px";
  };
  overlayStyle: {
    zIndex: 20; // 사이드바/헤더(≤50) 아래에 배치하여 메뉴 클릭 스루 허용
    backgroundColor: "rgba(0, 0, 0, 0.3)";
    backdropFilter: "blur(1px)";
    pointerEvents: "auto"; // 배경 클릭 감지 및 하이라이트 여부 분석
  };
  animation: "tutorialSlideIn 0.4s ease-out";
}
```

#### 2.3 향상된 인터랙티브 챗봇 인터페이스

- **채팅 UI**:

  - 모던한 메시지 버블 디자인
  - 사용자/봇 구분 스타일링
  - 타임스탬프 표시
  - 타이핑 인디케이터 애니메이션

- **봇 캐릭터**:

  - 친근한 봇 아바타
  - 그라데이션 헤더 디자인
  - 부드러운 호버 효과

- **빠른 응답 시스템**:

  - 5가지 미리 정의된 질문 버튼
  - 호버 효과 및 클릭 피드백
  - 동적 추천 질문 업데이트

- **종료 옵션**:
  - X 버튼 (우상단)
  - ESC 키 지원
  - 500ms 딜레이 후 자동 종료 (메뉴 클릭 시)

```typescript
interface TutorialChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: Date;
  type: "text" | "quick-reply" | "highlight-trigger";
}

interface TutorialChatbot {
  messages: TutorialChatMessage[];
  isTyping: boolean;
  quickReplies: string[];
  welcomeMessage: string;
  chatStyle: {
    headerGradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
    messageStyle: "modern-bubble";
    animationType: "smooth-transition";
  };
}
```

#### 2.4 고급 메뉴 하이라이트 시스템 - 핵심 개선사항

##### 2.4.1 시각적 하이라이트 효과

- **하이라이트 방식**:

  - 3px 파란색 테두리 (`#3b82f6`)
  - 흰색 외곽선 효과 (`0 0 0 2px rgba(255, 255, 255, 0.9)`)
  - **블러 효과 완전 제거**: 하이라이트된 영역은 선명하게 표시
  - **밝기 증가**: `filter: brightness(1.3) contrast(1.2)`
  - **z-index 최상위**: `60000`으로 오버레이 위에 표시

- **애니메이션**:
  - 펄스 + 글로우 복합 애니메이션
  - 호버 시 약간의 스케일 증가 (`scale(1.03)`)
  - 부드러운 전환 효과 (`transition: all 0.3s ease`)

```typescript
interface MenuHighlightStyle {
  border: "3px solid #3b82f6";
  borderRadius: "12px";
  boxShadow: ["0 0 25px rgba(59, 130, 246, 0.8)", "inset 0 0 25px rgba(59, 130, 246, 0.2)", "0 0 0 2px rgba(255, 255, 255, 0.9)"];
  filter: "brightness(1.3) contrast(1.2)";
  backdropFilter: "none"; // 블러 효과 제거
  zIndex: 60000;
  pointerEvents: "auto"; // 하이라이트 영역에서도 클릭 가능
  animation: "tutorialPulse 2s infinite, tutorialGlow 2s infinite";
  cursor: "pointer";
  isolation: "isolate"; // 부모 블러에서 격리
}
```

##### 2.4.2 원활한 클릭 동작

- **자연스러운 이벤트 처리**:
  - `preventDefault()` 및 `stopPropagation()` 제거
  - 원래 클릭 이벤트가 그대로 실행됨
  - 500ms 후 튜토리얼 자동 종료
  - 페이지 이동 후에도 자연스러운 전환

```typescript
interface MenuClickBehavior {
  eventHandling: "passthrough"; // 이벤트 차단 없음
  tutorialCloseDelay: 500; // ms
  navigationMode: "immediate"; // 즉시 페이지 이동
  debugging: {
    consoleLogging: true;
    elementTracking: true;
  };
}
```

#### 2.5 확장된 튜토리얼 시나리오 - 실제 구현 기준

**5가지 핵심 시나리오 지원**:

1. **"고객 정보를 어떻게 관리하나요?"**

   - 하이라이트: `[data-menu="customer-business"]` (영업 & 고객 메뉴)
   - 응답: CRM 파이프라인 상세 설명 + 클릭 유도 메시지
   - 클릭 시: CRM 페이지로 즉시 이동

2. **"재고 현황을 확인하려면?"**

   - 하이라이트: `#inventory-purchase` (재고 & 구매 메뉴)
   - 응답: 재고 관리 기능 설명 + 실시간 현황 안내
   - 클릭 시: 재고 관리 페이지로 이동

3. **"직원 휴가 승인은 어디서 하나요?"**

   - 하이라이트: `[data-menu="company-operations"]` (인사 & 급여 메뉴)
   - 응답: 인사 관리 워크플로우 설명
   - 클릭 시: 직원 관리 페이지로 이동

4. **"견적서는 어떻게 만드나요?"**

   - 하이라이트: `[data-menu="customer-business"]` (영업 & 고객 메뉴)
   - 응답: 견적서 생성 프로세스 안내
   - 클릭 시: 견적서 관리 페이지로 이동

5. **"생산 일정은 어디서 보나요?"**
   - 하이라이트: `#production-mrp` (생산 & MRP 메뉴)
   - 응답: 생산 계획 및 MRP 기능 설명
   - 클릭 시: 생산 관리 페이지로 이동

```typescript
interface TutorialScenario {
  trigger: RegExp;
  response: string;
  highlightPath: string[];
  additionalFeatures: {
    clickInstruction: string; // "💡 지금 바로 클릭해보세요!"
    contextualInfo: string[]; // 기능별 상세 설명 목록
    followUpSuggestions: string[]; // 후속 질문 제안
  };
}

const TUTORIAL_SCENARIOS: TutorialScenario[] = [
  {
    trigger: /고객.*정보.*관리|CRM|영업.*관리|고객.*어떻게/i,
    response: `고객 정보는 CRM 파이프라인에서 관리할 수 있습니다! 🎯

✨ 화면에서 파란색으로 하이라이트된 '영업 & 고객' 메뉴를 확인해보세요!

📌 하이라이트된 메뉴를 클릭하면 CRM 파이프라인 페이지로 이동하여:
• 고객별 영업 단계 추적
• 상세 고객 정보 관리
• 영업 기회 분석

💡 지금 바로 클릭해보세요!`,
    highlightPath: ['[data-menu="customer-business"]'],
    additionalFeatures: {
      clickInstruction: "💡 지금 바로 클릭해보세요!",
      contextualInfo: ["고객별 영업 단계 추적", "상세 고객 정보 관리", "영업 기회 분석"],
      followUpSuggestions: ["다른 기능도 궁금해요", "이 메뉴에서 뭘 할 수 있나요?", "처음부터 다시 알려주세요"],
    },
  },
  // ... 나머지 시나리오들
];
```

#### 2.6 상태 관리 - Zustand 기반

```typescript
interface TutorialState {
  isActive: boolean;
  currentScenario: TutorialScenario | null;
  highlightedElements: string[];
  messages: TutorialChatMessage[];
  isTyping: boolean;
  quickReplies: string[];
}

interface TutorialActions {
  activateTutorial: () => void;
  deactivateTutorial: () => void;
  addMessage: (message: Omit<TutorialChatMessage, "id" | "timestamp">) => void;
  highlightElements: (elements: string[]) => void;
  clearHighlights: () => void;
  setTyping: (isTyping: boolean) => void;
  processUserInput: (input: string) => Promise<void>;
  setQuickReplies: (replies: string[]) => void;
}

// Zustand Store 구현
const useTutorialStore = create<TutorialState & TutorialActions>((set, get) => ({
  // 초기 상태
  isActive: false,
  currentScenario: null,
  highlightedElements: [],
  messages: [],
  isTyping: false,
  quickReplies: [
    "고객 정보를 어떻게 관리하나요?",
    "재고 현황을 확인하려면?",
    "직원 휴가 승인은 어디서 하나요?",
    "견적서는 어떻게 만드나요?",
    "생산 일정은 어디서 보나요?",
  ],

  // 핵심 액션들
  activateTutorial: () => {
    set({ isActive: true });
    // 웰컴 메시지 자동 추가
    const welcomeMessage: TutorialChatMessage = {
      id: Date.now().toString(),
      sender: "bot",
      content:
        "안녕하세요! 👋 테크솔루션 업무 시스템 도우미입니다.\n\n궁금한 기능이나 메뉴에 대해 언제든 물어보세요. 아래 질문을 선택하거나 직접 입력해주세요!",
      timestamp: new Date(),
      type: "text",
    };
    set((state) => ({ messages: [welcomeMessage] }));
  },

  deactivateTutorial: () => {
    set({
      isActive: false,
      currentScenario: null,
      highlightedElements: [],
      messages: [],
      isTyping: false,
    });
  },

  processUserInput: async (input: string) => {
    // 시나리오 매칭 로직
    // 타이핑 애니메이션
    // 하이라이트 실행
    // 응답 메시지 생성
  },
}));
```

#### 2.7 기술적 구현 세부사항

##### 2.7.1 컴포넌트 구조

```
src/components/tutorial/
├── FloatingHelpButton.tsx    # 플로팅 도움말 버튼
├── TutorialOverlay.tsx       # 메인 채팅 오버레이
├── MenuHighlighter.tsx       # 메뉴 하이라이트 관리
└── index.ts                  # 컴포넌트 익스포트
```

##### 2.7.2 CSS 애니메이션 정의

```css
@keyframes tutorialPulse {
  0%,
  100% {
    box-shadow: 0 0 25px rgba(59, 130, 246, 0.8);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 35px rgba(59, 130, 246, 1);
    transform: scale(1.02);
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
```

##### 2.7.3 접근성 및 사용성

- **키보드 지원**: ESC 키로 튜토리얼 종료
- **포커스 관리**: 오버레이 활성화 시 입력창 자동 포커스
- **스크린 리더**: ARIA 레이블 및 역할 정의
- **반응형**: 모바일 환경에서의 적절한 크기 조정

#### 2.8 성능 최적화 및 디버깅

##### 2.8.1 성능 고려사항

- **DOM 조작 최적화**: 하이라이트 요소 캐싱
- **이벤트 리스너 관리**: 컴포넌트 언마운트 시 정리
- **애니메이션 성능**: CSS 애니메이션 우선 사용
- **메모리 누수 방지**: 타이머 및 이벤트 리스너 정리

##### 2.8.2 개발자 도구

- **콘솔 로깅**: 상세한 디버깅 정보 제공
- **상태 추적**: Zustand DevTools 연동
- **에러 처리**: Try-catch 블록으로 안정성 확보

```typescript
// 디버깅 지원
interface TutorialDebugInfo {
  elementCount: number;
  activeScenario: string | null;
  messageHistory: number;
  performanceMetrics: {
    highlightTime: number;
    responseTime: number;
  };
}
```

### 3. 메인 메뉴 구조

#### 3.1 고객 비즈니스 (Customer Business)

##### 3.1.1 영업 기회 관리

- **대표 화면**: CRM 파이프라인 칸반 보드
- **구현 요소**:
  - 드래그 앤 드롭으로 단계 이동
  - 고객 카드에 핵심 정보 표시 (회사명, 담당자, 예상금액, 진행률)
  - 사이드 패널로 고객 상세 정보 표시
  - 활동 타임라인 (통화, 이메일, 미팅 히스토리)

```typescript
interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  estimatedValue: number;
  stage: "prospect" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
  probability: number;
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
}
```

##### 3.1.2 견적/주문

- **대표 화면**: 견적서 리스트 테이블
- **구현 요소**:
  - 탭으로 견적서/주문서 전환
  - 상태별 필터링 (작성중, 발송대기, 승인대기, 확정)
  - 견적서 생성 마법사 (Wizard)
  - PDF 미리보기 및 다운로드

##### 3.1.3 생산 계획/지시

- **대표 화면**: 생산 오더 현황 테이블
- **구현 요소**:
  - 생산 일정 간트 차트
  - BOM 트리 뷰어
  - 작업 지시서 생성/인쇄
  - 진행률 프로그레스 바

##### 3.1.4 자재 조달

- **대표 화면**: 발주 현황 대시보드
- **구현 요소**:
  - 발주 요청 승인 워크플로우
  - 공급업체 성과 차트
  - 자동 발주 제안 알림
  - 납기 추적 타임라인

##### 3.1.5 재고/출하

- **대표 화면**: 입출고 현황 테이블
- **구현 요소**:
  - 실시간 재고 현황 위젯
  - 재고 이동 히스토리
  - 출하 라벨 생성
  - 배송 추적 통합

##### 3.1.6 세금계산서/수금

- **대표 화면**: 송장 관리 테이블
- **구현 요소**:
  - 송장 자동 생성 규칙
  - 수금 현황 차트
  - 연체 관리 대시보드
  - 세금계산서 전자발행

#### 3.2 회사 운영 (Company Operations)

##### 3.2.1 인사/급여/휴가/경비

- **대표 화면**: 직원 관리 대시보드
- **구현 요소**:
  - 조직도 트리 뷰
  - 근태 현황 캘린더
  - 휴가 승인 워크플로우
  - 경비 정산 마법사

##### 3.2.2 프로젝트/R&D

- **대표 화면**: 프로젝트 현황 칸반
- **구현 요소**:
  - 프로젝트 타임라인 뷰
  - 태스크 할당 매트릭스
  - 문서 버전 관리
  - 리소스 배분 차트

##### 3.2.3 품질/설비 관리

- **대표 화면**: 품질 대시보드
- **구현 요소**:
  - 부적합 관리 워크플로우
  - 설비 가동률 모니터링
  - 예방 보전 스케줄
  - 품질 트렌드 차트

#### 3.3 경영 정보 (Management Information)

##### 3.3.1 통합 대시보드

- **구현 요소**:
  - 매출/매입 현황 차트
  - KPI 게이지 위젯
  - 트렌드 분석 그래프
  - 실시간 알림 피드

##### 3.3.2 지식/문서 중앙화

- **구현 요소**:
  - 문서 트리 네비게이션
  - 태그 기반 검색
  - 마크다운 에디터
  - 협업 코멘트 시스템

### 4. 개인화 메뉴 (역할별 퀵 액세스)

#### 4.1 역할 시스템

```typescript
interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  quickLinks: QuickLink[];
  defaultDashboard: string;
}

interface QuickLink {
  label: string;
  icon: string;
  path: string;
  badge?: number;
}
```

#### 4.2 역할별 권한 및 UI 구성

```typescript
const ROLE_PERMISSIONS = {
  대표: {
    permissions: ["all"],
    quickLinks: [
      { label: "통합 대시보드", icon: "BarChart3", path: "/dashboard", badge: null },
      { label: "매출 현황", icon: "TrendingUp", path: "/reports/sales", badge: null },
      { label: "재무 현황", icon: "DollarSign", path: "/finance/overview", badge: null },
      { label: "인사 현황", icon: "Users", path: "/hr/overview", badge: null },
    ],
    defaultView: "executive-dashboard",
    widgets: ["sales-overview", "financial-kpi", "employee-count", "production-status"],
  },

  영업팀장: {
    permissions: ["sales", "crm", "quotes", "customers"],
    quickLinks: [
      { label: "영업 파이프라인", icon: "Target", path: "/sales/pipeline", badge: 5 },
      { label: "견적서 관리", icon: "FileText", path: "/sales/quotes", badge: 3 },
      { label: "고객 관리", icon: "Users", path: "/sales/customers", badge: null },
      { label: "영업 실적", icon: "BarChart", path: "/sales/reports", badge: null },
    ],
    defaultView: "sales-pipeline",
    widgets: ["pipeline-summary", "monthly-targets", "customer-activities", "quote-status"],
  },

  생산팀장: {
    permissions: ["production", "mrp", "quality", "maintenance"],
    quickLinks: [
      { label: "생산 계획", icon: "Calendar", path: "/production/planning", badge: 2 },
      { label: "BOM 관리", icon: "Layers", path: "/production/bom", badge: null },
      { label: "작업 지시", icon: "ClipboardList", path: "/production/work-orders", badge: 7 },
      { label: "품질 관리", icon: "Shield", path: "/quality/dashboard", badge: 1 },
    ],
    defaultView: "production-overview",
    widgets: ["production-schedule", "work-order-status", "quality-metrics", "equipment-status"],
  },

  구매팀장: {
    permissions: ["purchase", "inventory", "vendors", "stock"],
    quickLinks: [
      { label: "발주 관리", icon: "ShoppingCart", path: "/purchase/orders", badge: 4 },
      { label: "재고 현황", icon: "Package", path: "/inventory/overview", badge: 12 },
      { label: "공급업체", icon: "Truck", path: "/purchase/vendors", badge: null },
      { label: "입출고", icon: "ArrowUpDown", path: "/inventory/movements", badge: null },
    ],
    defaultView: "purchase-dashboard",
    widgets: ["purchase-requests", "inventory-levels", "vendor-performance", "delivery-tracking"],
  },

  회계팀장: {
    permissions: ["accounting", "finance", "invoicing", "payments"],
    quickLinks: [
      { label: "송장 관리", icon: "Receipt", path: "/accounting/invoices", badge: 8 },
      { label: "수금 관리", icon: "CreditCard", path: "/accounting/payments", badge: 3 },
      { label: "재무제표", icon: "PieChart", path: "/accounting/reports", badge: null },
      { label: "세금계산서", icon: "FileCheck", path: "/accounting/tax", badge: 2 },
    ],
    defaultView: "accounting-dashboard",
    widgets: ["invoice-status", "payment-due", "cash-flow", "tax-summary"],
  },

  인사팀장: {
    permissions: ["hr", "employees", "payroll", "leave"],
    quickLinks: [
      { label: "직원 관리", icon: "UserCog", path: "/hr/employees", badge: null },
      { label: "급여 관리", icon: "Banknote", path: "/hr/payroll", badge: 1 },
      { label: "휴가 승인", icon: "Calendar", path: "/hr/leave", badge: 4 },
      { label: "근태 관리", icon: "Clock", path: "/hr/attendance", badge: null },
    ],
    defaultView: "hr-dashboard",
    widgets: ["employee-overview", "leave-requests", "attendance-summary", "payroll-status"],
  },

  개발팀장: {
    permissions: ["project", "development", "documents", "knowledge"],
    quickLinks: [
      { label: "프로젝트", icon: "FolderOpen", path: "/projects/overview", badge: 3 },
      { label: "태스크 관리", icon: "CheckSquare", path: "/projects/tasks", badge: 12 },
      { label: "문서 관리", icon: "FileText", path: "/documents/library", badge: null },
      { label: "지식베이스", icon: "BookOpen", path: "/knowledge/base", badge: null },
    ],
    defaultView: "project-dashboard",
    widgets: ["project-progress", "task-summary", "document-recent", "knowledge-popular"],
  },
};
```

#### 4.3 역할별 데이터 접근 범위

```typescript
const DATA_ACCESS_SCOPE = {
  대표: {
    customers: "all", // 모든 고객 데이터
    orders: "all", // 모든 주문 데이터
    financial: "all", // 모든 재무 데이터
    employees: "all", // 모든 직원 데이터
    projects: "all", // 모든 프로젝트 데이터
  },

  영업팀장: {
    customers: "all",
    orders: "sales-department", // 영업팀 관련 주문만
    financial: "sales-revenue", // 매출 관련 재무 데이터만
    employees: "sales-team", // 영업팀 직원만
    projects: "sales-projects", // 영업 관련 프로젝트만
  },

  생산팀장: {
    customers: "view-only", // 고객 정보 조회만
    orders: "production-view", // 생산 관련 주문 정보
    financial: "production-cost", // 생산원가 관련만
    employees: "production-team",
    projects: "production-projects",
  },

  구매팀장: {
    customers: "suppliers-only", // 공급업체 정보만
    orders: "purchase-orders", // 구매 주문만
    financial: "purchase-budget", // 구매 예산 관련만
    employees: "purchase-team",
    projects: "purchase-projects",
  },

  회계팀장: {
    customers: "billing-info", // 청구 관련 고객 정보
    orders: "financial-view", // 재무 관련 주문 정보
    financial: "all", // 모든 재무 데이터
    employees: "payroll-info", // 급여 관련 직원 정보
    projects: "financial-tracking", // 재무 추적 프로젝트
  },

  인사팀장: {
    customers: "none", // 고객 데이터 접근 불가
    orders: "none",
    financial: "hr-budget", // 인사 예산만
    employees: "all", // 모든 직원 데이터
    projects: "hr-projects", // 인사 관련 프로젝트만
  },

  개발팀장: {
    customers: "project-clients", // 프로젝트 고객만
    orders: "development-orders", // 개발 관련 주문
    financial: "project-budget", // 프로젝트 예산만
    employees: "development-team",
    projects: "all", // 모든 프로젝트
  },
};
```

## 메뉴 구조 정의

### 전체 시스템 메뉴 트리

```
📱 테크솔루션 통합 업무 시스템
├── 🤖 AI 비서 (상단 고정)
│   ├── 🔍 검색/명령 입력창 (Cmd+K)
│   ├── 🔔 알림 센터 (Badge 표시)
│   ├── 👤 사용자 프로필
│   └── 🔄 역할 전환 토글
│
├── 📊 **통합 대시보드** (홈)
│   ├── 역할별 맞춤 대시보드
│   ├── KPI 위젯
│   ├── 실시간 알림 피드
│   └── 퀵 액세스 링크
│
├── 💼 **고객 비즈니스** (Customer Business)
│   ├── 🎯 **영업 기회 관리**
│   │   ├── 📋 CRM 파이프라인 (칸반 보드) [대표화면]
│   │   ├── 👥 고객 목록 (사이드 패널)
│   │   ├── 📞 활동 타임라인
│   │   └── 📈 영업 성과 분석
│   │
│   ├── 📄 **견적/주문**
│   │   ├── 📝 견적서 리스트 [대표화면]
│   │   ├── 📋 주문서 리스트 (탭 전환)
│   │   ├── 🧙‍♂️ 견적서 생성 마법사
│   │   ├── 📑 PDF 미리보기
│   │   └── 📊 견적/주문 현황
│   │
│   ├── 🏭 **생산 계획/지시**
│   │   ├── 📅 생산 오더 현황 [대표화면]
│   │   ├── 🗂️ BOM 관리 (사이드바 링크)
│   │   ├── 📊 생산 간트 차트
│   │   ├── 📋 작업 지시서
│   │   └── 📈 진행률 모니터링
│   │
│   ├── 🛒 **자재 조달**
│   │   ├── 📦 발주 현황 대시보드 [대표화면]
│   │   ├── 🚚 공급업체 관리 (헤더 링크)
│   │   ├── ✅ 발주 승인 워크플로우
│   │   ├── 📈 공급업체 성과 차트
│   │   └── 🕒 납기 추적 타임라인
│   │
│   ├── 📦 **재고/출하**
│   │   ├── 📊 입출고 현황 테이블 [대표화면]
│   │   ├── 📋 실시간 재고 현황 (우측 위젯)
│   │   ├── 📝 재고 이동 히스토리
│   │   ├── 🏷️ 출하 라벨 생성
│   │   └── 🚛 배송 추적
│   │
│   └── 💰 **세금계산서/수금**
│       ├── 🧾 송장 관리 테이블 [대표화면]
│       ├── 💳 수금 처리 (액션 버튼)
│       ├── 📊 수금 현황 차트
│       ├── ⚠️ 연체 관리 대시보드
│       └── 📋 세금계산서 전자발행
│
├── 🏢 **회사 운영** (Company Operations)
│   ├── 👥 **인사/급여/휴가/경비**
│   │   ├── 👤 직원 관리 대시보드 [대표화면]
│   │   ├── 🌳 조직도 트리 뷰
│   │   ├── 📅 근태 현황 캘린더
│   │   ├── 🏖️ 휴가 승인 워크플로우
│   │   ├── 💰 급여 관리
│   │   └── 💳 경비 정산 마법사
│   │
│   ├── 📋 **프로젝트/R&D**
│   │   ├── 📊 프로젝트 현황 칸반 [대표화면]
│   │   ├── 📅 프로젝트 타임라인 뷰
│   │   ├── ✅ 태스크 할당 매트릭스
│   │   ├── 📁 문서 버전 관리
│   │   └── 📊 리소스 배분 차트
│   │
│   └── 🛡️ **품질/설비 관리**
│       ├── 📊 품질 대시보드 [대표화면]
│       ├── ⚠️ 부적합 관리 워크플로우
│       ├── 🔧 설비 가동률 모니터링
│       ├── 📅 예방 보전 스케줄
│       └── 📈 품질 트렌드 차트
│
├── 📈 **경영 정보** (Management Information)
│   ├── 📊 **통합 대시보드**
│   │   ├── 💹 매출/매입 현황 차트
│   │   ├── 🎯 KPI 게이지 위젯
│   │   ├── 📈 트렌드 분석 그래프
│   │   └── 🔔 실시간 알림 피드
│   │
│   └── 📚 **지식/문서 중앙화**
│       ├── 🌳 문서 트리 네비게이션
│       ├── 🔍 태그 기반 검색
│       ├── ✏️ 마크다운 에디터
│       └── 💬 협업 코멘트 시스템
│
└── ⚡ **개인화 메뉴** (역할별 퀵 액세스)
    ├── 👔 **대표**
    │   ├── 📊 통합 대시보드
    │   ├── 📈 매출 현황
    │   ├── 💰 재무 현황
    │   └── 👥 인사 현황
    │
    ├── 🎯 **영업팀장**
    │   ├── 🎯 영업 파이프라인 (Badge: 5)
    │   ├── 📄 견적서 관리 (Badge: 3)
    │   ├── 👥 고객 관리
    │   └── 📊 영업 실적
    │
    ├── 🏭 **생산팀장**
    │   ├── 📅 생산 계획 (Badge: 2)
    │   ├── 🗂️ BOM 관리
    │   ├── 📋 작업 지시 (Badge: 7)
    │   └── 🛡️ 품질 관리 (Badge: 1)
    │
    ├── 🛒 **구매팀장**
    │   ├── 📦 발주 관리 (Badge: 4)
    │   ├── 📊 재고 현황 (Badge: 12)
    │   ├── 🚚 공급업체
    │   └── 📦 입출고
    │
    ├── 💰 **회계팀장**
    │   ├── 🧾 송장 관리 (Badge: 8)
    │   ├── 💳 수금 관리 (Badge: 3)
    │   ├── 📊 재무제표
    │   └── 📋 세금계산서 (Badge: 2)
    │
    ├── 👥 **인사팀장**
    │   ├── 👤 직원 관리
    │   ├── 💰 급여 관리 (Badge: 1)
    │   ├── 📅 휴가 승인 (Badge: 4)
    │   └── 🕒 근태 관리
    │
    └── 💻 **개발팀장**
        ├── 📁 프로젝트 (Badge: 3)
        ├── ✅ 태스크 관리 (Badge: 12)
        ├── 📄 문서 관리
        └── 📚 지식베이스
```

### 메뉴 구조의 핵심 설계 원칙

#### 1. 3-Tier 아키텍처

- **Tier 1**: AI 비서 (상단 고정 - 모든 기능의 진입점)
- **Tier 2**: 워크플로우 중심 메인 메뉴 (고객 비즈니스 → 회사 운영 → 경영 정보)
- **Tier 3**: 역할별 개인화 퀵 액세스

#### 2. 대표화면 우선 원칙

- **[대표화면]** 표시된 항목이 메인 화면
- 관련 기능들은 탭, 사이드패널, 드릴다운으로 접근
- UX 일관성을 위한 명확한 화면 계층 구조

#### 3. Badge 알림 시스템

- 숫자 Badge는 해당 역할의 처리 대기 건수 표시
- 사용자 주의를 필요로 하는 항목 강조
- 실시간 업데이트로 업무 우선순위 제시

#### 4. 직관적 아이콘 체계

- 이모지 기반 아이콘으로 메뉴 식별성 향상
- 일관된 시각적 패턴으로 사용자 학습 비용 최소화
- 업무 도메인을 반영한 직관적 아이콘 선택

#### 5. 프로세스 연결성

- 고객 비즈니스: 영업 → 생산 → 조달 → 재고 → 수금의 자연스러운 흐름
- 회사 운영: 내부 자원 관리의 통합적 접근
- 경영 정보: 의사결정을 위한 통합된 정보 제공

## UX 설계 구현

### 1. 대표 화면 우선 원칙

각 통합 메뉴의 대표 화면을 메인으로 하고, 관련 기능들을 다음 방식으로 접근:

- **탭 전환**: 견적서 ↔ 주문서
- **사이드 패널**: 고객 상세 정보
- **컨텍스트 메뉴**: 관련 액션들
- **드릴다운**: BOM 상세 보기

### 2. 일관된 네비게이션 패턴

#### 2.1 브레드크럼 네비게이션

```
홈 > 고객 비즈니스 > 영업 기회 관리 > A고객사 상세
```

#### 2.2 공통 액션 버튼

- 생성: Primary 버튼 (우상단)
- 편집: Ghost 버튼 (각 행)
- 삭제: Destructive 버튼 (컨텍스트 메뉴)
- 내보내기: Secondary 버튼 (필터 영역)

## 가상 데이터 설계

### 데이터 시뮬레이션 원칙

- **완전한 프론트엔드 구현**: 모든 데이터는 TypeScript 파일로 정의
- **실시간 상태 변경**: LocalStorage + Zustand로 데이터 변경사항 유지
- **실제 API 모방**: setTimeout을 사용한 비동기 응답 시뮬레이션
- **관계형 데이터**: 실제 DB와 동일한 관계 구조로 가상 데이터 설계
- **백엔드 불필요**: 서버, 데이터베이스, API 개발 불필요

### 1. 회사 정보

```typescript
const COMPANY_DATA = {
  name: "테크솔루션 주식회사",
  industry: "제조업 (전자부품)",
  employees: 18,
  founded: "2018-03-15",
  revenue: "12억원 (2023년)",
};
```

### 2. 사용자 데이터

#### 2.1 전체 사용자 목록 (18명)

```typescript
const USERS = [
  // 경영진 (2명)
  {
    id: "user-ceo",
    name: "김대표",
    email: "ceo@techsolution.co.kr",
    role: "대표",
    department: "경영진",
    avatar: "/avatars/ceo.jpg",
    permissions: ["all"],
    defaultDashboard: "executive",
  },
  {
    id: "user-coo",
    name: "박이사",
    email: "coo@techsolution.co.kr",
    role: "이사",
    department: "경영진",
    avatar: "/avatars/coo.jpg",
    permissions: ["management", "operations"],
    defaultDashboard: "management",
  },

  // 영업팀 (3명)
  {
    id: "user-sales-manager",
    name: "이영업",
    email: "sales@techsolution.co.kr",
    role: "영업팀장",
    department: "영업팀",
    avatar: "/avatars/sales-manager.jpg",
    permissions: ["sales", "crm", "quotes"],
    defaultDashboard: "sales",
  },
  {
    id: "user-sales-rep1",
    name: "최세일즈",
    email: "sales1@techsolution.co.kr",
    role: "영업담당자",
    department: "영업팀",
    avatar: "/avatars/sales1.jpg",
    permissions: ["sales", "crm"],
    defaultDashboard: "sales",
  },
  {
    id: "user-sales-rep2",
    name: "장고객",
    email: "sales2@techsolution.co.kr",
    role: "영업담당자",
    department: "영업팀",
    avatar: "/avatars/sales2.jpg",
    permissions: ["sales", "crm"],
    defaultDashboard: "sales",
  },

  // 생산팀 (4명)
  {
    id: "user-production-manager",
    name: "정생산",
    email: "production@techsolution.co.kr",
    role: "생산팀장",
    department: "생산팀",
    avatar: "/avatars/production-manager.jpg",
    permissions: ["production", "mrp", "quality"],
    defaultDashboard: "production",
  },
  {
    id: "user-production-planner",
    name: "한계획",
    email: "planner@techsolution.co.kr",
    role: "생산계획담당자",
    department: "생산팀",
    avatar: "/avatars/planner.jpg",
    permissions: ["production", "mrp"],
    defaultDashboard: "production",
  },
  {
    id: "user-quality-manager",
    name: "남품질",
    email: "quality@techsolution.co.kr",
    role: "품질관리담당자",
    department: "생산팀",
    avatar: "/avatars/quality.jpg",
    permissions: ["quality", "maintenance"],
    defaultDashboard: "quality",
  },
  {
    id: "user-maintenance",
    name: "서설비",
    email: "maintenance@techsolution.co.kr",
    role: "설비담당자",
    department: "생산팀",
    avatar: "/avatars/maintenance.jpg",
    permissions: ["maintenance", "equipment"],
    defaultDashboard: "maintenance",
  },

  // 구매/자재팀 (2명)
  {
    id: "user-purchase-manager",
    name: "구매진",
    email: "purchase@techsolution.co.kr",
    role: "구매팀장",
    department: "구매팀",
    avatar: "/avatars/purchase.jpg",
    permissions: ["purchase", "inventory", "vendors"],
    defaultDashboard: "purchase",
  },
  {
    id: "user-inventory",
    name: "재고철",
    email: "inventory@techsolution.co.kr",
    role: "재고관리담당자",
    department: "구매팀",
    avatar: "/avatars/inventory.jpg",
    permissions: ["inventory", "stock"],
    defaultDashboard: "inventory",
  },

  // 재무/회계팀 (2명)
  {
    id: "user-accounting-manager",
    name: "회계숙",
    email: "accounting@techsolution.co.kr",
    role: "회계팀장",
    department: "재무팀",
    avatar: "/avatars/accounting.jpg",
    permissions: ["accounting", "finance", "invoicing"],
    defaultDashboard: "accounting",
  },
  {
    id: "user-finance",
    name: "재무현",
    email: "finance@techsolution.co.kr",
    role: "재무담당자",
    department: "재무팀",
    avatar: "/avatars/finance.jpg",
    permissions: ["finance", "payments"],
    defaultDashboard: "finance",
  },

  // 인사/총무팀 (2명)
  {
    id: "user-hr-manager",
    name: "인사라",
    email: "hr@techsolution.co.kr",
    role: "인사팀장",
    department: "인사팀",
    avatar: "/avatars/hr.jpg",
    permissions: ["hr", "employees", "payroll"],
    defaultDashboard: "hr",
  },
  {
    id: "user-admin",
    name: "총무김",
    email: "admin@techsolution.co.kr",
    role: "총무담당자",
    department: "인사팀",
    avatar: "/avatars/admin.jpg",
    permissions: ["hr", "facilities"],
    defaultDashboard: "admin",
  },

  // 개발/IT팀 (3명)
  {
    id: "user-dev-manager",
    name: "개발석",
    email: "dev@techsolution.co.kr",
    role: "개발팀장",
    department: "개발팀",
    avatar: "/avatars/dev-manager.jpg",
    permissions: ["project", "development", "documents"],
    defaultDashboard: "development",
  },
  {
    id: "user-developer1",
    name: "코딩민",
    email: "dev1@techsolution.co.kr",
    role: "개발자",
    department: "개발팀",
    avatar: "/avatars/dev1.jpg",
    permissions: ["project", "development"],
    defaultDashboard: "development",
  },
  {
    id: "user-it-admin",
    name: "시스템준",
    email: "it@techsolution.co.kr",
    role: "IT관리자",
    department: "개발팀",
    avatar: "/avatars/it.jpg",
    permissions: ["system", "documents", "all_view"],
    defaultDashboard: "system",
  },
];
```

#### 2.2 역할별 테스트 계정 정의

```typescript
const TEST_ACCOUNTS = {
  // 대표용 계정 - 모든 기능 접근 가능
  executive: {
    username: "ceo@techsolution.co.kr",
    password: "test123!",
    role: "대표",
    features: ["통합대시보드", "경영분석", "전사현황", "의사결정지원"],
  },

  // 영업담당자 계정 - CRM, 견적, 고객관리 중심
  sales: {
    username: "sales@techsolution.co.kr",
    password: "test123!",
    role: "영업팀장",
    features: ["CRM파이프라인", "견적관리", "고객관리", "영업실적"],
  },

  // 생산관리자 계정 - MRP, 생산계획, 품질관리
  production: {
    username: "production@techsolution.co.kr",
    password: "test123!",
    role: "생산팀장",
    features: ["생산계획", "BOM관리", "작업지시", "품질관리"],
  },

  // 구매담당자 계정 - 구매, 재고, 공급업체 관리
  purchase: {
    username: "purchase@techsolution.co.kr",
    password: "test123!",
    role: "구매팀장",
    features: ["발주관리", "재고현황", "공급업체관리", "입출고"],
  },

  // 회계담당자 계정 - 재무, 회계, 세금계산서
  accounting: {
    username: "accounting@techsolution.co.kr",
    password: "test123!",
    role: "회계팀장",
    features: ["송장관리", "수금관리", "재무제표", "세금계산서"],
  },

  // 인사담당자 계정 - 인사, 급여, 휴가관리
  hr: {
    username: "hr@techsolution.co.kr",
    password: "test123!",
    role: "인사팀장",
    features: ["직원관리", "급여관리", "휴가승인", "근태관리"],
  },

  // 개발팀장 계정 - 프로젝트, R&D, 문서관리
  development: {
    username: "dev@techsolution.co.kr",
    password: "test123!",
    role: "개발팀장",
    features: ["프로젝트관리", "태스크관리", "문서관리", "지식베이스"],
  },
};
```

### 3. 비즈니스 데이터

#### 3.1 고객/영업 데이터

- 30개 잠재고객 (다양한 단계별 분포)
- 50개 견적서 (승인, 대기, 거절 상태)
- 25개 확정 주문
- 실제 회사명과 유사한 가상 고객사

#### 3.2 생산/재고 데이터

- 15개 제품 BOM
- 30개 생산 오더 (진행중, 완료, 계획)
- 100개 원자재 재고 현황
- 지난 6개월 생산 실적

#### 3.3 재무 데이터

- 월별 매출/매입 현황 (12개월)
- 손익계산서 데이터
- 현금흐름 데이터
- 고객별 매출 분석

## AI 에이전트 시뮬레이션

### 프론트엔드 AI 구현 방식

- **실제 LLM 불필요**: 규칙 기반 자연어 처리로 AI 동작 시뮬레이션
- **패턴 매칭**: 사전 정의된 명령어 패턴으로 사용자 입력 분석
- **컨텍스트 인식**: 현재 사용자 역할과 페이지에 따른 맞춤 응답
- **즉시 응답**: 서버 통신 없이 클라이언트에서 즉시 처리

### 1. 명령어 파싱 엔진

```typescript
class AICommandParser {
  parse(query: string): AICommand {
    // 자연어 → 구조화된 명령 변환
    // 키워드 매칭, 엔티티 추출 (정규식 기반)
    // 실제 NLP API 없이 프론트엔드에서 처리
  }

  suggest(context: string): string[] {
    // 상황별 명령어 제안 (미리 정의된 템플릿 활용)
  }
}
```

### 2. 스마트 알림 시스템

```typescript
class SmartNotificationEngine {
  generateAlerts(): Notification[] {
    // 재고 부족, 납기 지연, 승인 대기 등
    // 비즈니스 룰 기반 알림 생성 (가상 데이터 기반)
    // 실시간 계산으로 동적 알림 생성
  }
}
```

### 3. 자동 응답 시나리오

- **20가지 주요 명령어 패턴**: 미리 정의된 응답 템플릿
- **각 명령어별 3-5개 응답 변형**: 랜덤 선택으로 자연스러운 대화
- **컨텍스트 기반 스마트 제안**: 사용자 역할과 현재 화면에 맞는 추천

## 테스트 시나리오

### 1. 역할별 사용자 여정 테스트

#### 1.1 대표 (김대표) - 경영 의사결정 시나리오

**로그인**: `ceo@techsolution.co.kr` / `test123!`

**아침 업무 (9:00 AM)**

1. 로그인 → 통합 대시보드 자동 표시
2. 전날 매출/주요 지표 확인 (KPI 위젯들)
3. AI 비서: "어제 매출 현황과 오늘 중요한 일정 알려줘"
4. 알림 확인: 결재 대기 3건, 긴급 이슈 1건

**점심 미팅 후 분석 (1:00 PM)** 5. AI 명령: "이번 달 영업이익률 보여줘" 6. 매출 트렌드 차트 드릴다운으로 상세 분석 7. 부서별 성과 비교 (영업팀 vs 생산팀 효율성) 8. 주요 의사결정: 신규 장비 투자 검토

**저녁 보고서 작성 (6:00 PM)** 9. 월간 경영 보고서 생성 요청 10. 각 부서장들과의 화상회의 일정 조율

#### 1.2 영업팀장 (이영업) - 영업 프로세스 시나리오

**로그인**: `sales@techsolution.co.kr` / `test123!`

**아침 파이프라인 체크 (8:30 AM)**

1. 로그인 → CRM 파이프라인 자동 표시
2. 오늘 연락할 고객 리스트 확인 (5건)
3. AI 비서: "오늘 할 일 알려줘" → 미팅 3건, 견적서 마감 2건
4. 긴급 알림: A사 견적서 답변 기한 오늘까지

**고객 미팅 및 견적 작업 (10:00 AM - 3:00 PM)** 5. 새 영업 기회 등록: "B전자 신규 프로젝트" 6. 드래그앤드롭으로 기존 고객 단계 업데이트 7. 견적서 생성 마법사 사용: C사 추가 주문 8. PDF 생성 및 이메일 자동 발송

**오후 follow-up (4:00 PM)** 9. 고객 활동 타임라인 업데이트 (통화, 미팅 결과) 10. 다음주 영업 목표 설정 및 팀원 업무 배분

#### 1.3 생산팀장 (정생산) - 생산 관리 시나리오

**로그인**: `production@techsolution.co.kr` / `test123!`

**주간 생산 계획 (월요일 8:00 AM)**

1. 로그인 → 생산 현황 대시보드 표시
2. 이번 주 생산 오더 현황 확인 (7건 진행중)
3. AI 알림: "자재 부족으로 인한 지연 위험 2건"
4. 간트 차트에서 일정 조정 필요 작업 식별

**BOM 및 자재 관리 (화요일 10:00 AM)** 5. BOM 트리 뷰어로 신제품 설계 검토 6. 자재 소요량 자동 계산 결과 확인 7. 구매팀에 발주 요청 생성 (3개 원자재) 8. 작업 지시서 생성 및 현장 전달

**품질 및 설비 점검 (수요일 2:00 PM)** 9. 품질 트렌드 차트에서 불량률 증가 감지 10. 설비 가동률 모니터링: 프레스기 효율 저하 확인 11. 예방 보전 스케줄 조정 결정

#### 1.4 구매팀장 (구매진) - 구매/재고 관리 시나리오

**로그인**: `purchase@techsolution.co.kr` / `test123!`

**발주 요청 처리 (9:00 AM)**

1. 로그인 → 발주 대시보드 표시
2. 승인 대기 발주 요청 4건 확인
3. AI 추천: "안전재고 이하 품목 3개, 자동 발주 제안"
4. 공급업체 성과 차트 확인 후 업체 선정

**재고 및 납기 관리 (11:00 AM)** 5. 실시간 재고 현황 위젯에서 부족 품목 확인 6. 재고 이동 히스토리 분석 7. 납기 추적 타임라인에서 지연 배송 3건 식별 8. 대체 공급업체 검토 및 긴급 주문 처리

#### 1.5 회계팀장 (회계숙) - 재무 관리 시나리오

**로그인**: `accounting@techsolution.co.kr` / `test123!`

**월초 정산 업무 (매월 1일)**

1. 로그인 → 회계 대시보드 표시
2. 미발행 송장 8건 일괄 생성
3. 연체 관리: 30일 초과 미수금 3건 확인
4. AI 지원: "지난달 매출 대비 수금률 분석"

**세무 및 보고서 (매월 10일)** 5. 세금계산서 전자발행 처리 6. 현금흐름 차트 검토 7. 월간 재무제표 생성 및 경영진 보고 8. 예산 대비 실적 분석

#### 1.6 인사팀장 (인사라) - 인사 관리 시나리오

**로그인**: `hr@techsolution.co.kr` / `test123!`

**일일 인사 업무**

1. 로그인 → 인사 대시보드 표시
2. 휴가 승인 요청 4건 처리
3. 근태 현황 캘린더에서 지각/결근 확인
4. 신입사원 온보딩 체크리스트 업데이트

**급여 처리 (매월 25일)** 5. 급여 계산 시스템 실행 6. 개인별 급여명세서 생성 7. 4대보험 및 세금 정산 8. 경비 정산 승인 처리

#### 1.7 개발팀장 (개발석) - 프로젝트 관리 시나리오

**로그인**: `dev@techsolution.co.kr` / `test123!`

**프로젝트 현황 관리**

1. 로그인 → 프로젝트 대시보드 표시
2. 진행중인 프로젝트 3건 상태 확인
3. 태스크 할당 매트릭스에서 업무 재분배
4. 프로젝트 타임라인 업데이트

**문서 및 지식 관리** 5. 기술 문서 버전 관리 및 업데이트 6. 지식베이스에 새로운 개발 가이드 추가 7. 팀원들과 협업 코멘트 교환 8. 월간 개발 실적 보고서 작성

### 2. 기능별 단위 테스트

#### 2.1 AI 비서 기능 테스트

```typescript
describe("AI Assistant", () => {
  test("자연어 명령 파싱 정확도 > 85%", () => {
    const testCommands = [
      "A고객사 견적서 초안 만들어줘",
      "지난달 영업이익 보고서 보여줘",
      "재고 부족 상품 알려줘",
      "이번 주 생산 일정 확인해줘",
      "미승인 휴가 신청 보여줘",
    ];
    // 각 명령어의 의도 파악 및 엔티티 추출 테스트
  });

  test("컨텍스트 기반 응답 생성", () => {
    // 사용자 역할별 다른 응답 생성 확인
  });
});
```

#### 2.2 권한 시스템 테스트

```typescript
describe("Role-based Access Control", () => {
  test("역할별 메뉴 접근 제한", () => {
    // 영업팀장이 회계 데이터에 접근 불가 확인
  });

  test("데이터 스코프 필터링", () => {
    // 각 역할별로 접근 가능한 데이터만 표시 확인
  });
});
```

#### 2.3 데이터 무결성 테스트

```typescript
describe("Data Integrity", () => {
  test("고객-주문-생산 연결 관계", () => {
    // 고객사별 주문 데이터와 생산 오더 연결 확인
  });

  test("재고-구매-생산 데이터 일관성", () => {
    // 재고 소모와 구매/생산 데이터 정합성 확인
  });

  test("매출-수금-회계 데이터 정합성", () => {
    // 매출 데이터와 회계 데이터 일치 확인
  });
});
```

#### 2.4 UI 컴포넌트 테스트

- 차트 렌더링 반응성 (1초 이내)
- 테이블 정렬/필터링 성능
- 드래그앤드롭 기능 정확성
- 모달/사이드패널 상태 관리
- 파일 업로드/다운로드 안정성

### 3. 성능 및 사용성 테스트

#### 3.1 성능 기준

- **초기 로딩 시간**: < 3초
- **페이지 전환 시간**: < 1초
- **대용량 테이블 렌더링**: < 2초 (1000행 기준)
- **AI 응답 시간**: < 0.5초
- **차트 업데이트**: < 0.3초

#### 3.2 E2E 테스트 시나리오

```typescript
// Playwright E2E 테스트
describe("Complete User Journey", () => {
  test("영업팀장 일일 업무 플로우", async ({ page }) => {
    // 로그인
    await page.goto("/login");
    await page.fill("[data-testid=email]", "sales@techsolution.co.kr");
    await page.fill("[data-testid=password]", "test123!");
    await page.click("[data-testid=login-btn]");

    // 대시보드 확인
    await expect(page.locator("[data-testid=sales-dashboard]")).toBeVisible();

    // AI 명령 실행
    await page.click("[data-testid=ai-search]");
    await page.fill("[data-testid=ai-input]", "오늘 할 일 알려줘");
    await page.press("[data-testid=ai-input]", "Enter");

    // 응답 확인
    await expect(page.locator("[data-testid=ai-response]")).toContainText("미팅 3건");

    // 견적서 생성
    await page.click("[data-testid=create-quote-btn]");
    await page.selectOption("[data-testid=customer-select]", "customer-001");
    await page.fill("[data-testid=quote-amount]", "5000000");
    await page.click("[data-testid=save-quote-btn]");

    // 성공 메시지 확인
    await expect(page.locator("[data-testid=success-toast]")).toBeVisible();
  });

  test("권한별 메뉴 접근 제어", async ({ page }) => {
    // 영업팀장으로 로그인
    await loginAs(page, "sales");

    // 회계 메뉴 접근 시도
    await page.goto("/accounting/invoices");

    // 접근 거부 확인
    await expect(page.locator("[data-testid=access-denied]")).toBeVisible();
  });
});
```

### 4. 데이터 정합성 체크리스트

#### 4.1 비즈니스 로직 정합성

- [ ] 견적서 → 주문서 전환 시 모든 데이터 보존
- [ ] 주문서 → 생산 오더 생성 시 BOM 정보 정확 반영
- [ ] 생산 완료 → 재고 입고 시 수량 정확 업데이트
- [ ] 출하 → 송장 발행 시 금액 자동 계산 정확성
- [ ] 수금 → 회계 처리 시 재무 데이터 일치

#### 4.2 역할별 데이터 접근 검증

- [ ] 대표: 모든 데이터 접근 가능
- [ ] 영업팀장: 영업 관련 데이터만 접근
- [ ] 생산팀장: 생산 관련 데이터만 접근
- [ ] 구매팀장: 구매/재고 데이터만 접근
- [ ] 회계팀장: 재무 관련 데이터만 접근
- [ ] 인사팀장: 인사 관련 데이터만 접근
- [ ] 개발팀장: 프로젝트 관련 데이터만 접근

#### 4.3 알림 및 워크플로우 검증

- [ ] 재고 부족 시 구매팀장에게 자동 알림
- [ ] 납기 지연 시 영업팀장과 생산팀장에게 알림
- [ ] 휴가 신청 시 인사팀장에게 승인 요청
- [ ] 견적서 승인 시 영업팀장에게 알림
- [ ] 품질 이슈 발생 시 생산팀장과 품질담당자에게 알림

#### 4.4 AI 추천 정확성 검증

- [ ] 재고 기반 자동 발주 제안의 정확성 (90% 이상)
- [ ] 고객별 맞춤 상품 추천 정확성 (80% 이상)
- [ ] 생산 일정 최적화 제안의 실용성
- [ ] 매출 예측 모델의 정확도 (오차 ±10% 이내)

## 개발 단계

### Phase 1: 기본 인프라 (1주)

1. 프로젝트 설정 및 의존성 설치
2. 기본 레이아웃 및 라우팅
3. shadcn/ui 컴포넌트 설정
4. 가상 데이터 구조 정의

### Phase 2: AI 비서 구현 (1주)

1. 검색/명령 인터페이스
2. 기본 명령어 파싱
3. 알림 시스템
4. 사용자 역할 관리

### Phase 3: 고객 비즈니스 모듈 (2주)

1. CRM 파이프라인
2. 견적/주문 관리
3. 생산 계획
4. 재고 관리

### Phase 4: 회사 운영 모듈 (1주)

1. 인사 관리
2. 프로젝트 관리
3. 품질/설비 관리

### Phase 5: 경영 정보 및 마무리 (1주)

1. 통합 대시보드
2. 지식 관리
3. 테스트 및 최적화
4. 문서화

## 성공 지표

### 1. 사용성 지표

- 신규 사용자의 주요 기능 도달 시간 < 3분
- 일일 업무 완료를 위한 클릭 수 50% 감소
- AI 명령어 성공률 > 85%

### 2. 효율성 지표

- 견적서 작성 시간 70% 단축
- 재고 확인 → 발주 프로세스 80% 단축
- 월마감 업무 시간 60% 단축

### 3. 만족도 지표

- 사용자 인터페이스 만족도 > 4.5/5
- 업무 효율성 개선 체감도 > 4.0/5
- 시스템 전환 의향도 > 80%

## 결론

본 PRD는 answer.md에서 설계된 메뉴 구조를 실제 체험할 수 있는 **완전한 프론트엔드 전용 프로토타입** 제작을 위한 완전한 가이드를 제공합니다.

### 프로토타입의 핵심 가치

- **설치 불필요**: 웹 브라우저만으로 즉시 실행 가능
- **백엔드 제로**: 서버, 데이터베이스, API 개발 불필요
- **완전한 기능**: 실제 시스템과 동일한 사용자 경험 제공
- **즉시 시연**: 고객이나 이해관계자에게 바로 데모 가능
- **빠른 검증**: 설계 아이디어를 신속하게 검증하고 피드백 수집

React + shadcn/ui 기반의 현대적인 기술 스택과 현실적인 가상 데이터를 통해, 소규모 기업의 업무 혁신을 실감할 수 있는 인터랙티브 데모를 구현할 수 있습니다.

**이 프로토타입은 백엔드 개발 없이도 모든 기능을 완전하게 시연할 수 있는 자체 완결형 웹 애플리케이션입니다.**
