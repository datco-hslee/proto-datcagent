import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit3,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import styles from "./BudgetPage.module.css";

interface BudgetItem {
  id: string;
  category: string;
  department: string;
  budgetName: string;
  plannedAmount: number;
  actualAmount: number;
  remainingAmount: number;
  period: string;
  startDate: string;
  endDate: string;
  status: "on_track" | "over_budget" | "under_budget" | "completed";
  priority: "low" | "medium" | "high";
  owner: string;
  description: string;
  currency: string;
}

const mockBudgetItems: BudgetItem[] = [
  {
    id: "1",
    category: "마케팅",
    department: "마케팅팀",
    budgetName: "디지털 광고 캠페인",
    plannedAmount: 50000000,
    actualAmount: 35000000,
    remainingAmount: 15000000,
    period: "2024 Q1",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    status: "on_track",
    priority: "high",
    owner: "김마케팅",
    description: "온라인 플랫폼 광고 및 소셜미디어 마케팅",
    currency: "KRW",
  },
  {
    id: "2",
    category: "개발",
    department: "개발팀",
    budgetName: "신제품 개발",
    plannedAmount: 100000000,
    actualAmount: 120000000,
    remainingAmount: -20000000,
    period: "2024 Q1",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    status: "over_budget",
    priority: "high",
    owner: "박개발",
    description: "AI 기반 제품 개발 프로젝트",
    currency: "KRW",
  },
  {
    id: "3",
    category: "인사",
    department: "인사팀",
    budgetName: "직원 교육 및 훈련",
    plannedAmount: 30000000,
    actualAmount: 15000000,
    remainingAmount: 15000000,
    period: "2024 Q1",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    status: "under_budget",
    priority: "medium",
    owner: "이인사",
    description: "직원 역량 강화 및 외부 교육",
    currency: "KRW",
  },
  {
    id: "4",
    category: "운영",
    department: "운영팀",
    budgetName: "사무용품 및 소모품",
    plannedAmount: 20000000,
    actualAmount: 18500000,
    remainingAmount: 1500000,
    period: "2024 Q1",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    status: "on_track",
    priority: "low",
    owner: "최운영",
    description: "사무용품, 소모품, 유지보수",
    currency: "KRW",
  },
  {
    id: "5",
    category: "영업",
    department: "영업팀",
    budgetName: "고객 관계 관리",
    plannedAmount: 40000000,
    actualAmount: 40000000,
    remainingAmount: 0,
    period: "2024 Q1",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    status: "completed",
    priority: "medium",
    owner: "정영업",
    description: "CRM 시스템 및 고객 서비스",
    currency: "KRW",
  },
  {
    id: "6",
    category: "IT",
    department: "IT팀",
    budgetName: "인프라 구축",
    plannedAmount: 80000000,
    actualAmount: 65000000,
    remainingAmount: 15000000,
    period: "2024 Q1",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    status: "on_track",
    priority: "high",
    owner: "한아이티",
    description: "서버 및 네트워크 인프라 업그레이드",
    currency: "KRW",
  },
];

const statusConfig = {
  on_track: { label: "진행중", color: "default", icon: Target },
  over_budget: { label: "예산초과", color: "destructive", icon: AlertCircle },
  under_budget: { label: "예산절약", color: "success", icon: TrendingDown },
  completed: { label: "완료", color: "success", icon: CheckCircle },
};

const priorityConfig = {
  low: { label: "낮음", color: "secondary" },
  medium: { label: "보통", color: "default" },
  high: { label: "높음", color: "destructive" },
};

export const BudgetPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);

  const filteredBudgets = mockBudgetItems.filter((budget) => {
    const matchesSearch =
      budget.budgetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || budget.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || budget.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Target;
    return <StatusIcon className={styles.statusIcon} />;
  };

  const getBudgetUsagePercentage = (planned: number, actual: number) => {
    return planned > 0 ? Math.round((actual / planned) * 100) : 0;
  };

  const getBudgetProgressColor = (percentage: number) => {
    if (percentage <= 80) return styles.progressGreen;
    if (percentage <= 100) return styles.progressYellow;
    return styles.progressRed;
  };

  // 통계 계산
  const totalPlanned = mockBudgetItems.reduce((sum, item) => sum + item.plannedAmount, 0);
  const totalActual = mockBudgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
  const totalRemaining = mockBudgetItems.reduce((sum, item) => sum + item.remainingAmount, 0);
  const overBudgetCount = mockBudgetItems.filter((item) => item.status === "over_budget").length;

  const categories = [...new Set(mockBudgetItems.map((item) => item.category))];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>예산 관리</h1>
            <p className={styles.subtitle}>예산 계획과 실행을 체계적으로 관리하세요</p>
          </div>
          <Button className={styles.addButton}>
            <Plus className={styles.icon} />
            예산 계획
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 계획 예산</span>
                <span className={styles.statValue}>{formatCurrency(totalPlanned)}</span>
              </div>
              <div className={styles.statIcon}>
                <DollarSign />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>실제 사용</span>
                <span className={styles.statValue}>{formatCurrency(totalActual)}</span>
              </div>
              <div className={styles.statIcon}>
                <BarChart3 />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>잔여 예산</span>
                <span className={styles.statValue}>{formatCurrency(totalRemaining)}</span>
              </div>
              <div className={styles.statIcon}>
                <PieChart />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>예산 초과</span>
                <span className={styles.statValue}>{overBudgetCount}건</span>
              </div>
              <div className={styles.statIcon}>
                <AlertCircle />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="예산명, 부서, 담당자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 상태</option>
              <option value="on_track">진행중</option>
              <option value="over_budget">예산초과</option>
              <option value="under_budget">예산절약</option>
              <option value="completed">완료</option>
            </select>

            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 카테고리</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.budgetsGrid}>
          {filteredBudgets.map((budget) => {
            const usagePercentage = getBudgetUsagePercentage(budget.plannedAmount, budget.actualAmount);

            return (
              <Card key={budget.id} className={styles.budgetCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.budgetInfo}>
                    <h3 className={styles.budgetName}>{budget.budgetName}</h3>
                    <div className={styles.budgetMeta}>
                      <Badge variant={statusConfig[budget.status]?.color as any} className={styles.statusBadge}>
                        {getStatusIcon(budget.status)}
                        {statusConfig[budget.status]?.label}
                      </Badge>
                      <Badge variant={priorityConfig[budget.priority]?.color as any} className={styles.priorityBadge}>
                        {priorityConfig[budget.priority]?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBudget(budget)}>
                      <Eye className={styles.actionIcon} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit3 className={styles.actionIcon} />
                    </Button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.departmentInfo}>
                    <div className={styles.departmentDetail}>
                      <span className={styles.categoryTag}>{budget.category}</span>
                      <span className={styles.departmentName}>{budget.department}</span>
                      <span className={styles.ownerName}>담당: {budget.owner}</span>
                    </div>
                  </div>

                  <div className={styles.budgetAmounts}>
                    <div className={styles.amountRow}>
                      <div className={styles.amountItem}>
                        <span className={styles.amountLabel}>계획</span>
                        <span className={styles.plannedAmount}>{formatCurrency(budget.plannedAmount)}</span>
                      </div>
                      <div className={styles.amountItem}>
                        <span className={styles.amountLabel}>실제</span>
                        <span className={styles.actualAmount}>{formatCurrency(budget.actualAmount)}</span>
                      </div>
                    </div>
                    <div className={styles.amountRow}>
                      <div className={styles.amountItem}>
                        <span className={styles.amountLabel}>잔여</span>
                        <span className={`${styles.remainingAmount} ${budget.remainingAmount < 0 ? styles.negative : styles.positive}`}>
                          {formatCurrency(budget.remainingAmount)}
                        </span>
                      </div>
                      <div className={styles.amountItem}>
                        <span className={styles.amountLabel}>사용률</span>
                        <span className={styles.usagePercentage}>{usagePercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${getBudgetProgressColor(usagePercentage)}`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{usagePercentage}% 사용</span>
                  </div>

                  <div className={styles.periodInfo}>
                    <Calendar className={styles.periodIcon} />
                    <div className={styles.periodData}>
                      <span className={styles.periodLabel}>{budget.period}</span>
                      <span className={styles.periodDates}>
                        {budget.startDate} ~ {budget.endDate}
                      </span>
                    </div>
                  </div>

                  <div className={styles.description}>
                    <p className={styles.descriptionText}>{budget.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedBudget && (
        <div className={styles.modal} onClick={() => setSelectedBudget(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>예산 상세 정보</h2>
              <Button variant="ghost" onClick={() => setSelectedBudget(null)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.budgetHeader}>
                <div className={styles.budgetMainInfo}>
                  <h3>{selectedBudget.budgetName}</h3>
                  <div className={styles.budgetBadges}>
                    <Badge variant={statusConfig[selectedBudget.status]?.color as any}>{statusConfig[selectedBudget.status]?.label}</Badge>
                    <Badge variant={priorityConfig[selectedBudget.priority]?.color as any}>{priorityConfig[selectedBudget.priority]?.label}</Badge>
                  </div>
                </div>
              </div>

              <div className={styles.modalDetailsGrid}>
                <div className={styles.modalDetailSection}>
                  <h4>기본 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>카테고리:</span>
                      <span>{selectedBudget.category}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>부서:</span>
                      <span>{selectedBudget.department}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>담당자:</span>
                      <span>{selectedBudget.owner}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>기간:</span>
                      <span>{selectedBudget.period}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>예산 현황</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>계획 예산:</span>
                      <span className={styles.plannedAmountModal}>{formatCurrency(selectedBudget.plannedAmount)}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>실제 사용:</span>
                      <span className={styles.actualAmountModal}>{formatCurrency(selectedBudget.actualAmount)}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>잔여 예산:</span>
                      <span className={`${styles.remainingAmountModal} ${selectedBudget.remainingAmount < 0 ? styles.negative : styles.positive}`}>
                        {formatCurrency(selectedBudget.remainingAmount)}
                      </span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>사용률:</span>
                      <span>{getBudgetUsagePercentage(selectedBudget.plannedAmount, selectedBudget.actualAmount)}%</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>일정 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>시작일:</span>
                      <span>{selectedBudget.startDate}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>종료일:</span>
                      <span>{selectedBudget.endDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.descriptionSection}>
                <h4>설명</h4>
                <div className={styles.fullDescription}>{selectedBudget.description}</div>
              </div>

              <div className={styles.progressModalSection}>
                <h4>예산 사용 현황</h4>
                <div className={styles.progressModalBar}>
                  <div
                    className={`${styles.progressModalFill} ${getBudgetProgressColor(
                      getBudgetUsagePercentage(selectedBudget.plannedAmount, selectedBudget.actualAmount)
                    )}`}
                    style={{ width: `${Math.min(getBudgetUsagePercentage(selectedBudget.plannedAmount, selectedBudget.actualAmount), 100)}%` }}
                  />
                </div>
                <div className={styles.progressModalText}>
                  {getBudgetUsagePercentage(selectedBudget.plannedAmount, selectedBudget.actualAmount)}% 사용 (
                  {formatCurrency(selectedBudget.actualAmount)} / {formatCurrency(selectedBudget.plannedAmount)})
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
