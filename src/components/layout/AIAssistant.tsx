import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Command,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Users,
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import styles from "./AIAssistant.module.css";

interface AICommand {
  id: string;
  query: string;
  intent: "search" | "navigate" | "create" | "report" | "analyze";
  entities: string[];
  response: string;
  actions?: Array<{
    label: string;
    path?: string;
    action?: () => void;
    icon?: any;
  }>;
  confidence: number;
}

interface AIResponse {
  command: AICommand;
  suggestions: string[];
  quickActions: Array<{
    label: string;
    path: string;
    icon: any;
    badge?: string;
  }>;
}

interface AIAssistantProps {
  isExpanded: boolean;
  onToggle: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

// 미리 정의된 명령어 패턴
const COMMAND_PATTERNS = [
  {
    pattern: /(?:a|A).*고객.*견적|견적.*a.*고객/i,
    intent: "create" as const,
    entities: ["A고객사", "견적서"],
    response: "A고객사를 위한 견적서를 작성하겠습니다.",
    actions: [
      { label: "견적서 생성", path: "/quotes", icon: FileText },
      { label: "A고객사 정보", path: "/customers", icon: Users },
    ],
  },
  {
    pattern: /지난.*달.*매출|매출.*지난.*달|영업.*실적/i,
    intent: "report" as const,
    entities: ["지난달", "매출", "보고서"],
    response: "지난달 매출 현황과 영업 실적을 보여드리겠습니다.",
    actions: [
      { label: "영업 분석", path: "/sales-analytics", icon: BarChart3 },
      { label: "매출 대시보드", path: "/", icon: TrendingUp },
    ],
  },
  {
    pattern: /재고.*부족|부족.*재고|재고.*현황/i,
    intent: "analyze" as const,
    entities: ["재고", "부족", "현황"],
    response: "재고 부족 상품과 현재 재고 현황을 확인해드리겠습니다.",
    actions: [
      { label: "재고 현황", path: "/inventory", icon: Package },
      { label: "구매 요청", path: "/purchasing", icon: ShoppingCart },
    ],
  },
  {
    pattern: /생산.*일정|일정.*생산|생산.*오더/i,
    intent: "navigate" as const,
    entities: ["생산", "일정", "오더"],
    response: "생산 일정과 오더 현황을 확인해드리겠습니다.",
    actions: [
      { label: "생산 오더", path: "/production-orders", icon: Settings },
      { label: "BOM 관리", path: "/bom", icon: Settings },
    ],
  },
  {
    pattern: /직원.*정보|인사.*관리|급여/i,
    intent: "navigate" as const,
    entities: ["직원", "인사", "급여"],
    response: "인사 관리 페이지로 이동하겠습니다.",
    actions: [
      { label: "직원 관리", path: "/employees", icon: Users },
      { label: "급여 관리", path: "/payroll", icon: DollarSign },
    ],
  },
];

// 빠른 액세스 메뉴
const QUICK_ACTIONS = [
  { label: "고객 관리", path: "/customers", icon: Users, badge: "12" },
  { label: "주문 현황", path: "/orders", icon: ShoppingCart, badge: "5" },
  { label: "재고 현황", path: "/inventory", icon: Package, badge: "3" },
  { label: "영업 분석", path: "/sales-analytics", icon: BarChart3 },
  { label: "생산 계획", path: "/production-orders", icon: Settings },
  { label: "일정 관리", path: "/calendar", icon: Calendar, badge: "2" },
];

export function AIAssistant({ isExpanded, onToggle, searchTerm, onSearchChange }: AIAssistantProps) {
  const [showResults, setShowResults] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowResults(true);
      }
      if (e.key === "Escape") {
        closeResults();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // AI 명령어 처리
  const processCommand = (query: string): AICommand => {
    const lowerQuery = query.toLowerCase();

    for (const pattern of COMMAND_PATTERNS) {
      if (pattern.pattern.test(query)) {
        return {
          id: Date.now().toString(),
          query,
          intent: pattern.intent,
          entities: pattern.entities,
          response: pattern.response,
          actions: pattern.actions,
          confidence: 0.85 + Math.random() * 0.1,
        };
      }
    }

    // 기본 응답
    return {
      id: Date.now().toString(),
      query,
      intent: "search",
      entities: [],
      response: `"${query}"에 대한 정보를 찾고 있습니다. 더 구체적인 질문을 해주시면 더 정확한 도움을 드릴 수 있습니다.`,
      actions: [
        { label: "전체 검색", path: "/search?q=" + encodeURIComponent(query), icon: Search },
      ],
      confidence: 0.6,
    };
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsProcessing(true);

    // AI 처리 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 800));

    const command = processCommand(query);
    const response: AIResponse = {
      command,
      suggestions: [
        "더 구체적인 기간을 지정해보세요",
        "특정 고객사나 제품을 명시해보세요",
        "원하는 액션을 함께 말씀해주세요"
      ],
      quickActions: QUICK_ACTIONS.slice(0, 4),
    };

    setAiResponse(response);
    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleActionClick = (action: { path?: string; action?: () => void }) => {
    if (action.path) {
      navigate(action.path);
      setShowResults(false);
      onSearchChange("");
    } else if (action.action) {
      action.action();
    }
  };

  const closeResults = () => {
    setShowResults(false);
    setAiResponse(null);
    onSearchChange("");
  };

  return (
    <div className={styles.container}>
      {/* 검색 입력창 */}
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={`${styles.searchWrapper} ${isExpanded ? styles.expanded : ''}`}>
          <Search className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            placeholder="AI에게 물어보세요... (Cmd+K)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setShowResults(true)}
            className={`${styles.searchInput} ${isExpanded ? styles.focused : ''}`}
          />
          <div className={styles.searchKbd}>
            <Command className={styles.commandIcon} />
            <span>K</span>
          </div>
        </div>
      </form>

      {/* AI 응답 결과 */}
      {showResults && (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsCard}>
            {/* 헤더 */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <MessageSquare className={styles.headerIcon} />
                <span className={styles.headerTitle}>AI 어시스턴트</span>
              </div>
              <button className={styles.closeButton} onClick={closeResults}>
                <X className={styles.closeIcon} />
              </button>
            </div>

            {isProcessing ? (
              /* 로딩 상태 */
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>AI가 요청을 처리중입니다...</p>
              </div>
            ) : aiResponse ? (
              /* AI 응답 */
              <div className={styles.response}>
                {/* 응답 메시지 */}
                <div className={styles.responseMessage}>
                  <div className={styles.responseAvatar}>
                    <MessageSquare className={styles.responseIcon} />
                  </div>
                  <div className={styles.responseContent}>
                    <p className={styles.responseText}>{aiResponse.command.response}</p>

                    {/* 신뢰도 표시 */}
                    <div className={styles.confidence}>
                      <span className={styles.confidenceLabel}>신뢰도:</span>
                      <div className={styles.confidenceBar}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`${styles.confidenceDot} ${
                              i < Math.floor(aiResponse.command.confidence * 5)
                                ? styles.confidenceDotActive
                                : styles.confidenceDotInactive
                            }`}
                          />
                        ))}
                      </div>
                      <span className={styles.confidenceValue}>
                        {Math.round(aiResponse.command.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                {aiResponse.command.actions && aiResponse.command.actions.length > 0 && (
                  <div className={styles.actions}>
                    <h4 className={styles.actionsTitle}>
                      <Lightbulb className={styles.actionsTitleIcon} />
                      추천 액션
                    </h4>
                    <div className={styles.actionButtons}>
                      {aiResponse.command.actions.map((action, index) => (
                        <button
                          key={index}
                          className={styles.actionButton}
                          onClick={() => handleActionClick(action)}
                        >
                          {action.icon && <action.icon className={styles.actionIcon} />}
                          {action.label}
                          <ArrowRight className={styles.actionArrow} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 제안 사항 */}
                {aiResponse.suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    <h4 className={styles.suggestionsTitle}>제안</h4>
                    <div className={styles.suggestionsList}>
                      {aiResponse.suggestions.map((suggestion, index) => (
                        <p key={index} className={styles.suggestion}>
                          "{suggestion}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* 빠른 액세스 */}
                <div className={styles.quickAccess}>
                  <h4 className={styles.quickAccessTitle}>빠른 액세스</h4>
                  <div className={styles.quickAccessGrid}>
                    {aiResponse.quickActions.map((action, index) => (
                      <button
                        key={index}
                        className={styles.quickAccessItem}
                        onClick={() => handleActionClick(action)}
                      >
                        <action.icon className={styles.quickAccessIcon} />
                        <span className={styles.quickAccessLabel}>{action.label}</span>
                        {action.badge && (
                          <span className={styles.quickAccessBadge}>{action.badge}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 기본 상태 */
              <div className={styles.defaultState}>
                <div className={styles.defaultHeader}>
                  <MessageSquare className={styles.defaultIcon} />
                  <h3 className={styles.defaultTitle}>무엇을 도와드릴까요?</h3>
                  <p className={styles.defaultSubtitle}>자연어로 질문하시면 AI가 도와드립니다</p>
                </div>

                <div className={styles.examples}>
                  <h4 className={styles.examplesTitle}>예시 질문</h4>
                  <div className={styles.examplesList}>
                    {['"A고객사 견적서 초안 만들어줘"', '"지난달 영업실적 보여줘"', '"재고 부족 상품 알려줘"', '"오늘 할 일 정리해줘"'].map(
                      (example, index) => (
                        <button
                          key={index}
                          className={styles.exampleButton}
                          onClick={() => {
                            onSearchChange(example.replace(/"/g, ""));
                            handleSearch(example.replace(/"/g, ""));
                          }}
                        >
                          {example}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className={styles.quickAccess}>
                  <h4 className={styles.quickAccessTitle}>빠른 액세스</h4>
                  <div className={styles.quickAccessGrid}>
                    {QUICK_ACTIONS.slice(0, 4).map((action, index) => (
                      <button
                        key={index}
                        className={styles.quickAccessItem}
                        onClick={() => handleActionClick(action)}
                      >
                        <action.icon className={styles.quickAccessIcon} />
                        <span className={styles.quickAccessLabel}>{action.label}</span>
                        {action.badge && (
                          <span className={styles.quickAccessBadge}>{action.badge}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 배경 오버레이 */}
      {showResults && <div className={styles.overlay} onClick={closeResults} />}
    </div>
  );
}
