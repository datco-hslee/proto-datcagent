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
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  Calendar,
  CreditCard,
  Receipt,
  Building,
  PieChart,
} from "lucide-react";
import styles from "./AccountingPage.module.css";

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

export const AccountingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = mockTransactions.filter((transaction) => {
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

  // 계산된 통계
  const totalIncome = mockTransactions.filter((t) => t.type === "income" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = mockTransactions.filter((t) => t.type === "expense" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const taxDeductibleExpense = mockTransactions
    .filter((t) => t.type === "expense" && t.taxDeductible && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>회계 관리</h1>
            <p className={styles.subtitle}>수입과 지출을 관리하고 재무 현황을 파악하세요</p>
          </div>
          <Button className={styles.addButton}>
            <Plus className={styles.icon} />
            거래 등록
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 수입</span>
                <span className={styles.statValue}>{formatCurrency(totalIncome)}</span>
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
                <span className={styles.statValue}>{formatCurrency(totalExpense)}</span>
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
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="내역, 카테고리, 참조번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
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

      <div className={styles.content}>
        <div className={styles.transactionsGrid}>
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className={styles.transactionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.transactionInfo}>
                  <div className={styles.transactionMeta}>
                    <span className={styles.transactionDate}>{transaction.date}</span>
                    <Badge variant={statusConfig[transaction.status]?.color as any} className={styles.statusBadge}>
                      {statusConfig[transaction.status]?.label}
                    </Badge>
                  </div>
                  <h3 className={styles.transactionDescription}>{transaction.description}</h3>
                  <span className={styles.transactionReference}>{transaction.reference}</span>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.amountSection}>
                  <div className={`${styles.amountInfo} ${transaction.type === "income" ? styles.incomeAmount : styles.expenseAmount}`}>
                    {transaction.type === "income" ? <TrendingUp className={styles.amountIcon} /> : <TrendingDown className={styles.amountIcon} />}
                    <div className={styles.amountData}>
                      <span className={styles.amountLabel}>{transaction.type === "income" ? "수입" : "지출"}</span>
                      <span className={styles.amountValue}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
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
                      <span className={styles.detailValue}>{transaction.category}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <Building className={styles.detailIcon} />
                    <div className={styles.detailInfo}>
                      <span className={styles.detailLabel}>계좌</span>
                      <span className={styles.detailValue}>{transaction.account}</span>
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
                <Button variant="outline" size="sm">
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
    </div>
  );
};
