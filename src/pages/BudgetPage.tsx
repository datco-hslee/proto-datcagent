import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Eye, Edit3, Plus, Search, Filter, Calendar, TrendingUp, TrendingDown, AlertTriangle, Trash2, DollarSign, Target, AlertCircle, CheckCircle, BarChart3, PieChart } from "lucide-react";
import styles from "./BudgetPage.module.css";
import erpDataJson from "../../DatcoDemoData2.json";

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

// ERP 예산 데이터 반환 함수 (회계 데이터 기반)
const getERPBudgetItems = (): BudgetItem[] => {
  const arApData = erpDataJson.sheets?.["회계(AR_AP)"] || [];
  
  // 회계 데이터를 예산 항목으로 변환
  const budgetMap = new Map<string, any>();
  
  arApData.forEach((item: any) => {
    const category = item.계정과목 || "기타";
    const key = `${category}-${item.거래처명 || "일반"}`;
    
    if (!budgetMap.has(key)) {
      budgetMap.set(key, {
        category: category,
        department: item.부서 || "재무팀",
        budgetName: `${category} 예산`,
        plannedAmount: 0,
        actualAmount: 0,
        items: []
      });
    }
    
    const budget = budgetMap.get(key);
    const amount = parseFloat(item.금액?.toString().replace(/,/g, '') || '0') || 0;
    
    budget.actualAmount += Math.abs(amount);
    budget.plannedAmount = budget.actualAmount * 1.2; // 실제 금액의 120%를 계획 금액으로 설정
    budget.items.push(item);
  });
  
  return Array.from(budgetMap.entries()).map(([key, budget], index) => ({
    id: `erp-budget-${index}`,
    category: budget.category,
    department: budget.department,
    budgetName: budget.budgetName,
    plannedAmount: Math.round(budget.plannedAmount),
    actualAmount: Math.round(budget.actualAmount),
    remainingAmount: Math.round(budget.plannedAmount - budget.actualAmount),
    period: "2024",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: budget.actualAmount > budget.plannedAmount ? "over_budget" : 
            budget.actualAmount < budget.plannedAmount * 0.8 ? "under_budget" : "on_track",
    priority: budget.actualAmount > 50000000 ? "high" : 
              budget.actualAmount > 20000000 ? "medium" : "low",
    owner: "재무담당자",
    description: `${budget.category} 관련 예산 관리`,
    currency: "KRW",
  }));
};

// 샘플 예산 데이터 반환 함수
const getSampleBudgetItems = (): BudgetItem[] => {
  return mockBudgetItems;
};

// 현재 선택된 데이터 소스에 따른 예산 데이터 반환 함수
const getCurrentBudgetItems = (dataSource: "erp" | "sample"): BudgetItem[] => {
  return dataSource === "erp" ? getERPBudgetItems() : getSampleBudgetItems();
};

export const BudgetPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<BudgetItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBudget, setNewBudget] = useState<Partial<BudgetItem>>({});
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editedBudget, setEditedBudget] = useState<Partial<BudgetItem>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBudget, setEditBudget] = useState<Partial<BudgetItem>>({});
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  // 데이터 소스 변경 시 예산 데이터 업데이트
  useEffect(() => {
    const newBudgetItems = getCurrentBudgetItems(selectedDataSource);
    setBudgetItems(newBudgetItems);
  }, [selectedDataSource]);

  const filteredBudgets = budgetItems.filter((budget) => {
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

  const handleCreateBudget = () => {
    if (!newBudget.budgetName || !newBudget.category || !newBudget.plannedAmount || !newBudget.department) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }

    const budget: BudgetItem = {
      id: `BUD-${Date.now()}`,
      budgetName: newBudget.budgetName,
      category: newBudget.category,
      department: newBudget.department,
      plannedAmount: Number(newBudget.plannedAmount),
      actualAmount: 0,
      remainingAmount: Number(newBudget.plannedAmount),
      period: `${newBudget.startDate?.substring(0, 7) || '2024-12'}`,
      startDate: newBudget.startDate || new Date().toISOString().split('T')[0],
      endDate: newBudget.endDate || new Date().toISOString().split('T')[0],
      status: "on_track",
      priority: newBudget.priority || "medium",
      owner: "관리자",
      description: newBudget.description || "",
      currency: "KRW"
    };

    setBudgetItems([budget, ...budgetItems]);
    setShowPlanningModal(false);
    setNewBudget({
      budgetName: "",
      category: "",
      plannedAmount: 0,
      description: "",
      priority: "medium",
      startDate: "",
      endDate: "",
      department: ""
    });
  };

  const handleEditBudget = (budget: BudgetItem) => {
    setEditingBudget(budget.id);
    setEditBudget({
      budgetName: budget.budgetName,
      category: budget.category,
      plannedAmount: budget.plannedAmount,
      description: budget.description,
      priority: budget.priority,
      startDate: budget.startDate,
      endDate: budget.endDate,
      department: budget.department,
      owner: budget.owner
    });
    setShowEditModal(true);
  };

  const handleUpdateBudget = () => {
    console.log('Updating budget:', editBudget);
    // Here you would typically update the budget in your data source
    setShowEditModal(false);
    setEditingBudget(null);
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (window.confirm('정말로 이 예산을 삭제하시겠습니까?')) {
      setBudgetItems(budgetItems.filter(budget => budget.id !== budgetId));
      console.log('예산 삭제됨:', budgetId);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingBudget(null);
    setEditBudget({
      budgetName: "",
      category: "",
      plannedAmount: 0,
      description: "",
      priority: "medium",
      startDate: "",
      endDate: "",
      department: "",
      owner: ""
    });
  };

  // 통계 계산
  const totalPlanned = budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
  const totalRemaining = budgetItems.reduce((sum, item) => sum + item.remainingAmount, 0);
  const overBudgetCount = budgetItems.filter((item) => item.status === "over_budget").length;

  const categories = [...new Set(budgetItems.map((item) => item.category))];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className={styles.title}>예산 관리</h1>
              <Badge 
                variant={selectedDataSource === "erp" ? "default" : "secondary"}
                className={`${selectedDataSource === "erp" ? "bg-blue-500" : "bg-yellow-500"} text-white text-xs px-2 py-1`}
              >
                {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
              </Badge>
            </div>
            <p className={styles.subtitle}>예산 계획과 실행을 체계적으로 관리하세요</p>
          </div>
          <Button className={styles.addButton} onClick={() => setShowPlanningModal(true)}>
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
            
            <select 
              value={selectedDataSource} 
              onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")} 
              className={styles.filterSelect}
            >
              <option value="erp">닷코 시연 데이터</option>
              <option value="sample">생성된 샘플 데이터</option>
            </select>
            
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

      {/* Budget Planning Modal */}
      {showPlanningModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>새 예산 계획</h2>
              <button className={styles.closeButton} onClick={() => setShowPlanningModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>예산명</label>
                  <Input
                    value={newBudget.budgetName}
                    onChange={(e) => setNewBudget({...newBudget, budgetName: e.target.value})}
                    placeholder="예산명을 입력하세요"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>카테고리</label>
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                    className={styles.formSelect}
                  >
                    <option value="">카테고리 선택</option>
                    <option value="마케팅">마케팅</option>
                    <option value="개발">개발</option>
                    <option value="인사">인사</option>
                    <option value="운영">운영</option>
                    <option value="영업">영업</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>부서</label>
                  <Input
                    value={newBudget.department}
                    onChange={(e) => setNewBudget({...newBudget, department: e.target.value})}
                    placeholder="담당 부서를 입력하세요"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>계획 예산</label>
                  <Input
                    type="number"
                    value={newBudget.plannedAmount}
                    onChange={(e) => setNewBudget({...newBudget, plannedAmount: e.target.value})}
                    placeholder="예산 금액을 입력하세요"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>우선순위</label>
                  <select
                    value={newBudget.priority}
                    onChange={(e) => setNewBudget({...newBudget, priority: e.target.value as 'high' | 'medium' | 'low'})}
                    className={styles.formSelect}
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>시작일</label>
                  <Input
                    type="date"
                    value={newBudget.startDate}
                    onChange={(e) => setNewBudget({...newBudget, startDate: e.target.value})}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>종료일</label>
                  <Input
                    type="date"
                    value={newBudget.endDate}
                    onChange={(e) => setNewBudget({...newBudget, endDate: e.target.value})}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>설명</label>
                  <textarea
                    value={newBudget.description}
                    onChange={(e) => setNewBudget({...newBudget, description: e.target.value})}
                    placeholder="예산 계획에 대한 설명을 입력하세요"
                    className={styles.formTextarea}
                    rows={3}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <Button variant="outline" onClick={() => setShowPlanningModal(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateBudget}>
                  예산 계획 생성
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Edit Modal */}
      {showEditModal && editingBudget && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>예산 수정</h2>
              <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>예산명</label>
                  <Input
                    value={editBudget.budgetName}
                    onChange={(e) => setEditBudget({...editBudget, budgetName: e.target.value})}
                    placeholder="예산명을 입력하세요"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>카테고리</label>
                  <select
                    value={editBudget.category}
                    onChange={(e) => setEditBudget({...editBudget, category: e.target.value})}
                    className={styles.formSelect}
                  >
                    <option value="">카테고리 선택</option>
                    <option value="마케팅">마케팅</option>
                    <option value="개발">개발</option>
                    <option value="인사">인사</option>
                    <option value="운영">운영</option>
                    <option value="영업">영업</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>부서</label>
                  <Input
                    value={editBudget.department}
                    onChange={(e) => setEditBudget({...editBudget, department: e.target.value})}
                    placeholder="담당 부서를 입력하세요"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>담당자</label>
                  <Input
                    value={editBudget.owner}
                    onChange={(e) => setEditBudget({...editBudget, owner: e.target.value})}
                    placeholder="담당자를 입력하세요"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>계획 예산</label>
                  <Input
                    type="number"
                    value={editBudget.plannedAmount}
                    onChange={(e) => setEditBudget({...editBudget, plannedAmount: e.target.value})}
                    placeholder="예산 금액을 입력하세요"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>우선순위</label>
                  <select
                    value={editBudget.priority}
                    onChange={(e) => setEditBudget({...editBudget, priority: e.target.value as 'high' | 'medium' | 'low'})}
                    className={styles.formSelect}
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>시작일</label>
                  <Input
                    type="date"
                    value={editBudget.startDate}
                    onChange={(e) => setEditBudget({...editBudget, startDate: e.target.value})}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>종료일</label>
                  <Input
                    type="date"
                    value={editBudget.endDate}
                    onChange={(e) => setEditBudget({...editBudget, endDate: e.target.value})}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>설명</label>
                  <textarea
                    value={editBudget.description}
                    onChange={(e) => setEditBudget({...editBudget, description: e.target.value})}
                    placeholder="예산 계획에 대한 설명을 입력하세요"
                    className={styles.formTextarea}
                    rows={3}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  취소
                </Button>
                <Button onClick={handleUpdateBudget}>
                  예산 수정
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <Button variant="ghost" size="sm" onClick={() => handleEditBudget(budget)}>
                      <Edit3 className={styles.actionIcon} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBudget(budget.id)}>
                      <Trash2 className={styles.actionIcon} />
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
