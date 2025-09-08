import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Download,
  TrendingUp,
  TrendingDown,
  Receipt,
  PieChart,
  Building,
  Check,
  X,
  Edit,
  Calculator,
  FileText,
  Calendar,
  CreditCard,
  DollarSign,
} from "lucide-react";
import styles from "./AccountingPage.module.css";
import erpDataJson from "../../DatcoDemoData2.json";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  account: string;
  status: "completed" | "pending" | "cancelled";
  reference: string;
  taxDeductible: boolean;
  // ERP AR/AP 추가 필드
  arApType?: "AR" | "AP"; // 유형
  voucher?: string; // 전표
  customer?: string; // 거래처
  supplyAmount?: number; // 공급가액
  vat?: number; // 부가세
  totalAmount?: number; // 합계
  collectionDueDate?: string; // 회수예정일
  paymentDueDate?: string; // 지급예정일
  arApStatus?: "미수" | "미지급" | "완료"; // AR/AP 상태
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2024-01-20",
    description: "제품 판매 수입",
    category: "매출",
    type: "income",
    amount: 15000000,
    account: "기업은행 주계좌",
    status: "completed",
    reference: "INV-2024-001",
    taxDeductible: false,
  },
  {
    id: "2",
    date: "2024-01-18",
    description: "사무용품 구매",
    category: "사무비",
    type: "expense",
    amount: 350000,
    account: "기업은행 주계좌",
    status: "completed",
    reference: "EXP-2024-012",
    taxDeductible: true,
  },
  {
    id: "3",
    date: "2024-01-15",
    description: "직원 급여 지급",
    category: "인건비",
    type: "expense",
    amount: 18500000,
    account: "기업은행 주계좌",
    status: "completed",
    reference: "PAY-2024-001",
    taxDeductible: true,
  },
  {
    id: "4",
    date: "2024-01-12",
    description: "컨설팅 서비스 수입",
    category: "용역수입",
    type: "income",
    amount: 5200000,
    account: "우리은행 부계좌",
    status: "completed",
    reference: "INV-2024-002",
    taxDeductible: false,
  },
  {
    id: "5",
    date: "2024-01-10",
    description: "마케팅 광고비",
    category: "광고선전비",
    type: "expense",
    amount: 2800000,
    account: "기업은행 주계좌",
    status: "pending",
    reference: "EXP-2024-015",
    taxDeductible: true,
  },
  {
    id: "6",
    date: "2024-01-08",
    description: "임대료 지급",
    category: "임차료",
    type: "expense",
    amount: 3200000,
    account: "기업은행 주계좌",
    status: "completed",
    reference: "EXP-2024-008",
    taxDeductible: true,
  },
];

const statusConfig = {
  completed: { label: "완료", color: "success" },
  pending: { label: "대기중", color: "default" },
  cancelled: { label: "취소", color: "destructive" },
};

// ERP 회계 데이터 추출 함수
const getERPTransactions = (): Transaction[] => {
  const arApData = erpDataJson.sheets["회계(AR_AP)"] || [];
  const customerData = erpDataJson.sheets["거래처마스터"] || [];
  
  return arApData.map((item: any, index: number) => {
    const isReceivable = item.구분 === "매출채권";
    const amount = item.금액 || 0;
    const supplyAmount = Math.round(amount / 1.1); // 부가세 10% 역산
    const vat = amount - supplyAmount;
    
    // 거래처 정보 찾기
    const customer = customerData.find((c: any) => c.거래처코드 === item.거래처코드);
    const customerName = customer?.거래처명 || item.거래처코드;
    
    return {
      id: item.전표번호 || `ERP-${index + 1}`,
      date: item.발생일자 || new Date().toISOString().split('T')[0],
      description: isReceivable ? `매출채권 - ${customerName}` : `매입채무 - ${customerName}`,
      category: isReceivable ? "매출" : "매입",
      type: isReceivable ? "income" as const : "expense" as const,
      amount: amount,
      account: "기업은행 주계좌",
      status: item.상태 === "미수금" || item.상태 === "미지급" ? "pending" as const : "completed" as const,
      reference: item.전표번호 || `REF-${index + 1}`,
      taxDeductible: true,
      // ERP AR/AP 추가 필드
      arApType: isReceivable ? "AR" : "AP",
      voucher: item.전표번호,
      customer: customerName,
      supplyAmount: supplyAmount,
      vat: vat,
      totalAmount: amount,
      collectionDueDate: isReceivable ? item.만기일자 : undefined,
      paymentDueDate: !isReceivable ? item.만기일자 : undefined,
      arApStatus: item.상태 === "미수금" ? "미수" : item.상태 === "미지급" ? "미지급" : "완료",
    };
  });
};

// 샘플 회계 데이터 함수
const getSampleTransactions = (): Transaction[] => {
  return mockTransactions;
};

// 현재 선택된 데이터 소스에 따른 거래 데이터 반환
const getCurrentTransactions = (dataSource: "erp" | "sample"): Transaction[] => {
  return dataSource === "erp" ? getERPTransactions() : getSampleTransactions();
};

export const AccountingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({});
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [editedTransaction, setEditedTransaction] = useState<Partial<Transaction>>({});
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 데이터 소스 변경 시 거래 데이터 업데이트
  useEffect(() => {
    const newTransactions = getCurrentTransactions(selectedDataSource);
    setTransactions(newTransactions);
  }, [selectedDataSource]);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  // 거래 처리 함수들
  const generateTransactionId = () => {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateReferenceNumber = (type: "income" | "expense") => {
    const prefix = type === "income" ? "INV" : "EXP";
    const year = new Date().getFullYear();
    const count = transactions.filter(t => t.type === type).length + 1;
    return `${prefix}-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.category || !newTransaction.account || !newTransaction.amount) {
      alert("모든 필수 필드를 입력해주세요.");
      return;
    }

    const transaction: Transaction = {
      id: generateTransactionId(),
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      description: newTransaction.description,
      category: newTransaction.category,
      type: newTransaction.type || "expense",
      amount: Number(newTransaction.amount),
      account: newTransaction.account,
      status: newTransaction.status || "completed",
      reference: newTransaction.reference || generateReferenceNumber(newTransaction.type || "expense"),
      taxDeductible: newTransaction.taxDeductible || false,
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: "",
      category: "",
      type: "expense",
      amount: 0,
      account: "",
      status: "completed",
      reference: "",
      taxDeductible: false,
    });
    setShowAddModal(false);
  };

  const handleInputChange = (field: keyof Transaction, value: any) => {
    setNewTransaction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Edit transaction handlers
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction.id);
    setEditedTransaction(transaction);
  };

  const handleSaveTransaction = () => {
    if (!editingTransaction || !editedTransaction.description || !editedTransaction.category || !editedTransaction.account || !editedTransaction.amount) {
      alert("모든 필수 필드를 입력해주세요.");
      return;
    }

    setTransactions(prev => prev.map(t => 
      t.id === editingTransaction 
        ? { ...editedTransaction } as Transaction
        : t
    ));
    
    setEditingTransaction(null);
    setEditedTransaction({});
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditedTransaction({});
  };

  const handleEditInputChange = (field: keyof Transaction, value: any) => {
    setEditedTransaction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // View and Edit handlers
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleEditModalTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditedTransaction(transaction);
    setShowEditModal(true);
  };

  const handleSaveEditModal = () => {
    if (!selectedTransaction || !editedTransaction.description || !editedTransaction.category || !editedTransaction.account || !editedTransaction.amount) {
      alert("모든 필수 필드를 입력해주세요.");
      return;
    }

    setTransactions(prev => prev.map(t => 
      t.id === selectedTransaction.id 
        ? { ...editedTransaction } as Transaction
        : t
    ));
    
    setShowEditModal(false);
    setSelectedTransaction(null);
    setEditedTransaction({});
  };

  const handleDownloadReceipt = (transaction: Transaction) => {
    const receiptContent = `
거래 영수증
==========================================

거래 정보:
- 거래일: ${transaction.date}
- 설명: ${transaction.description}
- 참조번호: ${transaction.reference}
- 유형: ${transaction.type === "income" ? "수입" : "지출"}
- 금액: ${formatCurrency(transaction.amount)}
- 카테고리: ${transaction.category}
- 계좌: ${transaction.account}
- 상태: ${statusConfig[transaction.status]?.label}
- 세금공제: ${transaction.taxDeductible ? "가능" : "불가능"}

==========================================
발행일: ${new Date().toLocaleDateString('ko-KR')}
발행시간: ${new Date().toLocaleTimeString('ko-KR')}
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `거래영수증_${transaction.reference}_${transaction.date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 계산된 통계 (pending 상태도 포함 - ERP 데이터는 미수/미지급 상태)
  const totalIncome = transactions.filter((t) => t.type === "income" && (t.status === "completed" || t.status === "pending")).reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions.filter((t) => t.type === "expense" && (t.status === "completed" || t.status === "pending")).reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const taxDeductibleExpense = transactions
    .filter((t) => t.type === "expense" && t.taxDeductible && (t.status === "completed" || t.status === "pending"))
    .reduce((sum, t) => sum + t.amount, 0);
  return (
    <div className={styles.container}>
      <div className={styles.headerContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <Calculator className={styles.titleIcon} />
              회계 관리
            </h1>
            {/* 데이터 소스 표시 배지 */}
            <div
              className={`${styles.dataSourceBadge} ${selectedDataSource === "erp" ? styles.erp : styles.sample}`}
            >
              {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button onClick={() => setShowAddModal(true)} className={styles.addButton}>
              <Plus size={16} />
              거래 추가
            </Button>
          </div>
        </div>
        
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 수입</span>
                <span className={`${styles.statValue} ${styles.income}`}>{formatCurrency(totalIncome)}</span>
              </div>
              <div className={`${styles.statIcon} ${styles.incomeIcon}`}>
                <TrendingUp />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 지출</span>
                <span className={`${styles.statValue} ${styles.expense}`}>{formatCurrency(totalExpense)}</span>
              </div>
              <div className={`${styles.statIcon} ${styles.expenseIcon}`}>
                <TrendingDown />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>순이익</span>
                <span className={`${styles.statValue} ${netProfit >= 0 ? styles.profit : styles.loss}`}>{formatCurrency(netProfit)}</span>
              </div>
              <div className={styles.statIcon}>
                <DollarSign />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>세금공제 가능액</span>
                <span className={styles.statValue}>{formatCurrency(taxDeductibleExpense)}</span>
              </div>
              <div className={styles.statIcon}>
                <Calculator />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchSection}>
            {/* 데이터 소스 선택 */}
            <div className={styles.filterGroup}>
              <select
                value={selectedDataSource}
                onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")}
                className={styles.filterSelect}
              >
                <option value="erp">닷코 시연 데이터</option>
                <option value="sample">생성된 샘플 데이터</option>
              </select>
            </div>
            
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <Input
                type="text"
                placeholder="거래 내역 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterSection}>
              {/* <Filter className={styles.filterIcon} /> */}
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={styles.filterSelect}>
                <option value="all">모든 유형</option>
                <option value="income">수입</option>
                <option value="expense">지출</option>
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
                <option value="all">모든 상태</option>
                <option value="completed">완료</option>
                <option value="pending">대기중</option>
                <option value="cancelled">취소</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.transactionsGrid}>
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className={styles.transactionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.transactionInfo}>
                  <div className={styles.transactionMeta}>
                    {editingTransaction === transaction.id ? (
                      <Input
                        type="date"
                        value={editedTransaction.date || transaction.date}
                        onChange={(e) => handleEditInputChange("date", e.target.value)}
                        className={styles.editInput}
                      />
                    ) : (
                      <span className={styles.transactionDate}>{transaction.date}</span>
                    )}
                    <Badge variant={statusConfig[transaction.status]?.color as any} className={styles.statusBadge}>
                      {statusConfig[transaction.status]?.label}
                    </Badge>
                  </div>
                  {editingTransaction === transaction.id ? (
                    <Input
                      type="text"
                      value={editedTransaction.description || transaction.description}
                      onChange={(e) => handleEditInputChange("description", e.target.value)}
                      className={styles.editInput}
                      placeholder="거래 설명"
                    />
                  ) : (
                    <h3 className={styles.transactionDescription}>{transaction.description}</h3>
                  )}
                  <span className={styles.transactionReference}>{transaction.reference}</span>
                </div>
                <div className={styles.cardActions}>
                  {editingTransaction === transaction.id ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleSaveTransaction}>
                        <Check className={styles.actionIcon} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className={styles.actionIcon} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(transaction)}>
                        <Eye className={styles.actionIcon} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditTransaction(transaction)}>
                        <Edit className={styles.actionIcon} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(transaction)}>
                        <Download className={styles.actionIcon} />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.amountSection}>
                  <div className={`${styles.amountInfo} ${transaction.type === "income" ? styles.incomeAmount : styles.expenseAmount}`}>
                    {transaction.type === "income" ? <TrendingUp className={styles.amountIcon} /> : <TrendingDown className={styles.amountIcon} />}
                    <div className={styles.amountData}>
                      <span className={styles.amountLabel}>{transaction.type === "income" ? "수입" : "지출"}</span>
                      {editingTransaction === transaction.id ? (
                        <Input
                          type="number"
                          value={editedTransaction.amount || transaction.amount}
                          onChange={(e) => handleEditInputChange("amount", parseFloat(e.target.value) || 0)}
                          className={styles.editInput}
                          placeholder="금액"
                        />
                      ) : (
                        <span className={styles.amountValue}>
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                  {transaction.taxDeductible && (
                    <Badge variant="secondary" className={styles.taxBadge}>
                      <Receipt className={styles.taxIcon} />
                      세금공제
                    </Badge>
                  )}
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.detailItem}>
                    <PieChart className={styles.detailIcon} />
                    <div className={styles.detailInfo}>
                      <span className={styles.detailLabel}>카테고리</span>
                      {editingTransaction === transaction.id ? (
                        <Input
                          type="text"
                          value={editedTransaction.category || transaction.category}
                          onChange={(e) => handleEditInputChange("category", e.target.value)}
                          className={styles.editInput}
                          placeholder="카테고리"
                        />
                      ) : (
                        <span className={styles.detailValue}>{transaction.category}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <Building className={styles.detailIcon} />
                    <div className={styles.detailInfo}>
                      <span className={styles.detailLabel}>계좌</span>
                      {editingTransaction === transaction.id ? (
                        <Input
                          type="text"
                          value={editedTransaction.account || transaction.account}
                          onChange={(e) => handleEditInputChange("account", e.target.value)}
                          className={styles.editInput}
                          placeholder="계좌"
                        />
                      ) : (
                        <span className={styles.detailValue}>{transaction.account}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedTransaction && (
        <div className={styles.modal} onClick={() => setSelectedTransaction(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>거래 상세 정보</h2>
              <div className={styles.modalActions}>
                <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(selectedTransaction)}>
                  <Download className={styles.icon} />
                  영수증 다운로드
                </Button>
                <Button variant="ghost" onClick={() => setSelectedTransaction(null)} className={styles.closeButton}>
                  ✕
                </Button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.transactionHeader}>
                <div className={styles.transactionMainInfo}>
                  <h3>{selectedTransaction.description}</h3>
                  <div className={styles.transactionMetaInfo}>
                    <span>거래일: {selectedTransaction.date}</span>
                    <span>참조번호: {selectedTransaction.reference}</span>
                    <Badge variant={statusConfig[selectedTransaction.status]?.color as any}>{statusConfig[selectedTransaction.status]?.label}</Badge>
                  </div>
                </div>
                <div className={`${styles.transactionAmount} ${selectedTransaction.type === "income" ? styles.incomeAmount : styles.expenseAmount}`}>
                  {selectedTransaction.type === "income" ? "+" : "-"}
                  {formatCurrency(selectedTransaction.amount)}
                </div>
              </div>

              <div className={styles.modalDetailsGrid}>
                <div className={styles.modalDetailSection}>
                  <h4>거래 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>유형:</span>
                      <span className={selectedTransaction.type === "income" ? styles.incomeType : styles.expenseType}>
                        {selectedTransaction.type === "income" ? "수입" : "지출"}
                      </span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>카테고리:</span>
                      <span>{selectedTransaction.category}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>계좌:</span>
                      <span>{selectedTransaction.account}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>세금공제:</span>
                      <span className={selectedTransaction.taxDeductible ? styles.deductible : styles.nonDeductible}>
                        {selectedTransaction.taxDeductible ? "가능" : "불가능"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>부가 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>처리 상태:</span>
                      <Badge variant={statusConfig[selectedTransaction.status]?.color as any}>
                        {statusConfig[selectedTransaction.status]?.label}
                      </Badge>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>생성일:</span>
                      <span>{selectedTransaction.date}</span>
                    </div>
                    {selectedTransaction.taxDeductible && (
                      <div className={styles.modalDetailRow}>
                        <span>예상 공제액:</span>
                        <span className={styles.deductionAmount}>{formatCurrency(Math.round(selectedTransaction.amount * 0.1))}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>새 거래 등록</h2>
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>거래 유형</label>
                  <select 
                    value={newTransaction.type || "expense"} 
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="income">수입</option>
                    <option value="expense">지출</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>거래일</label>
                  <Input
                    type="date"
                    value={newTransaction.date || ""}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>설명 *</label>
                  <Input
                    type="text"
                    placeholder="거래 설명을 입력하세요"
                    value={newTransaction.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>카테고리 *</label>
                  <Input
                    type="text"
                    placeholder="카테고리를 입력하세요"
                    value={newTransaction.category || ""}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>금액 *</label>
                  <Input
                    type="number"
                    placeholder="금액을 입력하세요"
                    value={newTransaction.amount || ""}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>계좌 *</label>
                  <Input
                    type="text"
                    placeholder="계좌명을 입력하세요"
                    value={newTransaction.account || ""}
                    onChange={(e) => handleInputChange("account", e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>상태</label>
                  <select 
                    value={newTransaction.status || "completed"} 
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="completed">완료</option>
                    <option value="pending">대기중</option>
                    <option value="cancelled">취소</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>참조번호</label>
                  <Input
                    type="text"
                    placeholder="참조번호 (자동 생성됨)"
                    value={newTransaction.reference || ""}
                    onChange={(e) => handleInputChange("reference", e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newTransaction.taxDeductible || false}
                      onChange={(e) => handleInputChange("taxDeductible", e.target.checked)}
                      className={styles.checkbox}
                    />
                    세금공제 가능
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  취소
                </Button>
                <Button onClick={handleAddTransaction}>
                  저장
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 상세 보기 모달 */}
      {showDetailModal && selectedTransaction && (
        <div className={styles.modalOverlay}>
          <Card className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <FileText className={styles.modalIcon} />
                거래 상세 정보
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                <X className={styles.closeIcon} />
              </Button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.detailGrid}>
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>기본 정보</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>거래일:</span>
                    <span className={styles.detailValue}>{selectedTransaction.date}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>설명:</span>
                    <span className={styles.detailValue}>{selectedTransaction.description}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>참조번호:</span>
                    <span className={styles.detailValue}>{selectedTransaction.reference}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>유형:</span>
                    <Badge variant={selectedTransaction.type === "income" ? "success" : "destructive"}>
                      {selectedTransaction.type === "income" ? "수입" : "지출"}
                    </Badge>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>상태:</span>
                    <Badge variant={statusConfig[selectedTransaction.status]?.color as any}>
                      {statusConfig[selectedTransaction.status]?.label}
                    </Badge>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>금액 정보</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>금액:</span>
                    <span className={`${styles.detailValue} ${selectedTransaction.type === "income" ? styles.incomeText : styles.expenseText}`}>
                      {selectedTransaction.type === "income" ? "+" : "-"}{formatCurrency(selectedTransaction.amount)}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>카테고리:</span>
                    <span className={styles.detailValue}>{selectedTransaction.category}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>계좌:</span>
                    <span className={styles.detailValue}>{selectedTransaction.account}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>세금공제:</span>
                    <Badge variant={selectedTransaction.taxDeductible ? "secondary" : "outline"}>
                      {selectedTransaction.taxDeductible ? "가능" : "불가능"}
                    </Badge>
                  </div>
                </div>

                {/* ERP AR/AP 추가 정보 */}
                {selectedTransaction.arApType && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>AR/AP 정보</h3>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>유형:</span>
                      <Badge variant={selectedTransaction.arApType === "AR" ? "success" : "destructive"}>
                        {selectedTransaction.arApType}
                      </Badge>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>전표:</span>
                      <span className={styles.detailValue}>{selectedTransaction.voucher}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>거래처:</span>
                      <span className={styles.detailValue}>{selectedTransaction.customer}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>공급가액:</span>
                      <span className={styles.detailValue}>{formatCurrency(selectedTransaction.supplyAmount || 0)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>부가세:</span>
                      <span className={styles.detailValue}>{formatCurrency(selectedTransaction.vat || 0)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>합계:</span>
                      <span className={styles.detailValue}>{formatCurrency(selectedTransaction.totalAmount || 0)}</span>
                    </div>
                    {selectedTransaction.collectionDueDate && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>회수예정일:</span>
                        <span className={styles.detailValue}>{selectedTransaction.collectionDueDate}</span>
                      </div>
                    )}
                    {selectedTransaction.paymentDueDate && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>지급예정일:</span>
                        <span className={styles.detailValue}>{selectedTransaction.paymentDueDate}</span>
                      </div>
                    )}
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>AR/AP 상태:</span>
                      <Badge variant={selectedTransaction.arApStatus === "완료" ? "success" : "default"}>
                        {selectedTransaction.arApStatus}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <Button variant="outline" onClick={() => handleDownloadReceipt(selectedTransaction)}>
                  <Download className={styles.actionIcon} />
                  영수증 다운로드
                </Button>
                <Button onClick={() => {
                  setShowDetailModal(false);
                  handleEditModalTransaction(selectedTransaction);
                }}>
                  <Edit className={styles.actionIcon} />
                  편집
                </Button>
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  닫기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 편집 모달 */}
      {showEditModal && selectedTransaction && (
        <div className={styles.modalOverlay}>
          <Card className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <Edit className={styles.modalIcon} />
                거래 편집
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                <X className={styles.closeIcon} />
              </Button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>거래일</label>
                  <Input
                    type="date"
                    value={editedTransaction.date || selectedTransaction.date}
                    onChange={(e) => setEditedTransaction(prev => ({ ...prev, date: e.target.value }))}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>설명</label>
                  <Input
                    type="text"
                    value={editedTransaction.description || selectedTransaction.description}
                    onChange={(e) => setEditedTransaction(prev => ({ ...prev, description: e.target.value }))}
                    className={styles.formInput}
                    placeholder="거래 설명"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>유형</label>
                  <select
                    value={editedTransaction.type || selectedTransaction.type}
                    onChange={(e) => setEditedTransaction(prev => ({ ...prev, type: e.target.value as "income" | "expense" }))}
                    className={styles.formSelect}
                  >
                    <option value="income">수입</option>
                    <option value="expense">지출</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>카테고리</label>
                  <Input
                    type="text"
                    value={editedTransaction.category || selectedTransaction.category}
                    onChange={(e) => setEditedTransaction(prev => ({ ...prev, category: e.target.value }))}
                    className={styles.formInput}
                    placeholder="카테고리"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>금액</label>
                  <Input
                    type="number"
                    value={editedTransaction.amount || selectedTransaction.amount}
                    onChange={(e) => setEditedTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className={styles.formInput}
                    placeholder="금액"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>계좌</label>
                  <Input
                    type="text"
                    value={editedTransaction.account || selectedTransaction.account}
                    onChange={(e) => setEditedTransaction(prev => ({ ...prev, account: e.target.value }))}
                    className={styles.formInput}
                    placeholder="계좌"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>상태</label>
                  <select
                    value={editedTransaction.status || selectedTransaction.status}
                    onChange={(e) => setEditedTransaction(prev => ({ ...prev, status: e.target.value as "completed" | "pending" | "cancelled" }))}
                    className={styles.formSelect}
                  >
                    <option value="completed">완료</option>
                    <option value="pending">대기중</option>
                    <option value="cancelled">취소</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>참조번호</label>
                  <Input
                    type="text"
                    value={editedTransaction.reference || selectedTransaction.reference}
                    onChange={(e) => setEditedTransaction(prev => ({ ...prev, reference: e.target.value }))}
                    className={styles.formInput}
                    placeholder="참조번호"
                  />
                </div>

                {/* ERP AR/AP 필드 편집 */}
                {selectedTransaction.arApType && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>거래처</label>
                      <Input
                        type="text"
                        value={editedTransaction.customer || selectedTransaction.customer}
                        onChange={(e) => setEditedTransaction(prev => ({ ...prev, customer: e.target.value }))}
                        className={styles.formInput}
                        placeholder="거래처"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>공급가액</label>
                      <Input
                        type="number"
                        value={editedTransaction.supplyAmount || selectedTransaction.supplyAmount}
                        onChange={(e) => setEditedTransaction(prev => ({ ...prev, supplyAmount: parseFloat(e.target.value) || 0 }))}
                        className={styles.formInput}
                        placeholder="공급가액"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>부가세</label>
                      <Input
                        type="number"
                        value={editedTransaction.vat || selectedTransaction.vat}
                        onChange={(e) => setEditedTransaction(prev => ({ ...prev, vat: parseFloat(e.target.value) || 0 }))}
                        className={styles.formInput}
                        placeholder="부가세"
                      />
                    </div>

                    {selectedTransaction.arApType === "AR" && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>회수예정일</label>
                        <Input
                          type="date"
                          value={editedTransaction.collectionDueDate || selectedTransaction.collectionDueDate}
                          onChange={(e) => setEditedTransaction(prev => ({ ...prev, collectionDueDate: e.target.value }))}
                          className={styles.formInput}
                        />
                      </div>
                    )}

                    {selectedTransaction.arApType === "AP" && (
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>지급예정일</label>
                        <Input
                          type="date"
                          value={editedTransaction.paymentDueDate || selectedTransaction.paymentDueDate}
                          onChange={(e) => setEditedTransaction(prev => ({ ...prev, paymentDueDate: e.target.value }))}
                          className={styles.formInput}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editedTransaction.taxDeductible ?? selectedTransaction.taxDeductible}
                      onChange={(e) => setEditedTransaction(prev => ({ ...prev, taxDeductible: e.target.checked }))}
                      className={styles.checkbox}
                    />
                    세금공제 가능
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  취소
                </Button>
                <Button onClick={handleSaveEditModal}>
                  저장
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
