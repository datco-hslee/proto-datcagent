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
  Calculator,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import styles from "./PayrollPage.module.css";

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  baseSalary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  tax: number;
  netPay: number;
  status: "draft" | "approved" | "paid" | "cancelled";
  payDate: string;
}

const mockPayrollRecords: PayrollRecord[] = [
  {
    id: "1",
    employeeId: "EMP001",
    employeeName: "김철수",
    department: "개발팀",
    position: "시니어 개발자",
    period: "2024-01",
    baseSalary: 4500000,
    allowances: 300000,
    overtime: 200000,
    deductions: 120000,
    tax: 680000,
    netPay: 4200000,
    status: "paid",
    payDate: "2024-01-25",
  },
  {
    id: "2",
    employeeId: "EMP002",
    employeeName: "이영희",
    department: "마케팅팀",
    position: "팀장",
    period: "2024-01",
    baseSalary: 5200000,
    allowances: 400000,
    overtime: 150000,
    deductions: 140000,
    tax: 820000,
    netPay: 4790000,
    status: "paid",
    payDate: "2024-01-25",
  },
  {
    id: "3",
    employeeId: "EMP003",
    employeeName: "박지민",
    department: "영업팀",
    position: "영업 대표",
    period: "2024-01",
    baseSalary: 3800000,
    allowances: 250000,
    overtime: 180000,
    deductions: 100000,
    tax: 590000,
    netPay: 3540000,
    status: "approved",
    payDate: "2024-01-30",
  },
  {
    id: "4",
    employeeId: "EMP004",
    employeeName: "최민수",
    department: "인사팀",
    position: "주임",
    period: "2024-01",
    baseSalary: 3200000,
    allowances: 200000,
    overtime: 120000,
    deductions: 80000,
    tax: 480000,
    netPay: 2960000,
    status: "draft",
    payDate: "2024-01-30",
  },
  {
    id: "5",
    employeeId: "EMP005",
    employeeName: "정수현",
    department: "회계팀",
    position: "대리",
    period: "2024-01",
    baseSalary: 3600000,
    allowances: 180000,
    overtime: 100000,
    deductions: 90000,
    tax: 520000,
    netPay: 3270000,
    status: "approved",
    payDate: "2024-01-30",
  },
];

const statusConfig = {
  draft: { label: "작성중", color: "secondary", icon: FileText },
  approved: { label: "승인됨", color: "default", icon: CheckCircle },
  paid: { label: "지급완료", color: "success", icon: DollarSign },
  cancelled: { label: "취소됨", color: "destructive", icon: AlertCircle },
};

export const PayrollPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  const filteredRecords = mockPayrollRecords.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || record.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    return <StatusIcon className={styles.statusIcon} />;
  };

  const totalPayroll = mockPayrollRecords.reduce((sum, record) => sum + record.netPay, 0);
  const totalTax = mockPayrollRecords.reduce((sum, record) => sum + record.tax, 0);
  const departments = [...new Set(mockPayrollRecords.map((r) => r.department))];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>급여 관리</h1>
            <p className={styles.subtitle}>직원 급여를 계산하고 관리하세요</p>
          </div>
          <Button className={styles.addButton}>
            <Plus className={styles.icon} />
            급여 계산
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 급여 지급액</span>
                <span className={styles.statValue}>{formatCurrency(totalPayroll)}</span>
              </div>
              <div className={styles.statIcon}>
                <DollarSign />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 세금 공제액</span>
                <span className={styles.statValue}>{formatCurrency(totalTax)}</span>
              </div>
              <div className={styles.statIcon}>
                <Calculator />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>처리 직원 수</span>
                <span className={styles.statValue}>{mockPayrollRecords.length}명</span>
              </div>
              <div className={styles.statIcon}>
                <Users />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>지급 완료율</span>
                <span className={styles.statValue}>
                  {Math.round((mockPayrollRecords.filter((r) => r.status === "paid").length / mockPayrollRecords.length) * 100)}%
                </span>
              </div>
              <div className={styles.statIcon}>
                <TrendingUp />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="직원명, 사번으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 상태</option>
              <option value="draft">작성중</option>
              <option value="approved">승인됨</option>
              <option value="paid">지급완료</option>
              <option value="cancelled">취소됨</option>
            </select>

            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 부서</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.recordsGrid}>
          {filteredRecords.map((record) => (
            <Card key={record.id} className={styles.recordCard}>
              <div className={styles.cardHeader}>
                <div className={styles.employeeInfo}>
                  <h3 className={styles.employeeName}>{record.employeeName}</h3>
                  <div className={styles.employeeDetails}>
                    <span className={styles.employeeId}>{record.employeeId}</span>
                    <span className={styles.department}>{record.department}</span>
                    <span className={styles.position}>{record.position}</span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.periodSection}>
                  <Calendar className={styles.periodIcon} />
                  <div className={styles.periodInfo}>
                    <span className={styles.periodLabel}>급여 기간</span>
                    <span className={styles.periodValue}>{record.period}</span>
                  </div>
                  <Badge variant={statusConfig[record.status]?.color as any} className={styles.statusBadge}>
                    {getStatusIcon(record.status)}
                    {statusConfig[record.status]?.label}
                  </Badge>
                </div>

                <div className={styles.salaryBreakdown}>
                  <div className={styles.salaryItem}>
                    <span className={styles.salaryLabel}>기본급</span>
                    <span className={styles.salaryValue}>{formatCurrency(record.baseSalary)}</span>
                  </div>
                  <div className={styles.salaryItem}>
                    <span className={styles.salaryLabel}>수당</span>
                    <span className={styles.salaryValue}>{formatCurrency(record.allowances)}</span>
                  </div>
                  <div className={styles.salaryItem}>
                    <span className={styles.salaryLabel}>연장근무</span>
                    <span className={styles.salaryValue}>{formatCurrency(record.overtime)}</span>
                  </div>
                  <div className={styles.salaryItem}>
                    <span className={styles.salaryLabel}>공제액</span>
                    <span className={`${styles.salaryValue} ${styles.deduction}`}>-{formatCurrency(record.deductions)}</span>
                  </div>
                  <div className={styles.salaryItem}>
                    <span className={styles.salaryLabel}>세금</span>
                    <span className={`${styles.salaryValue} ${styles.deduction}`}>-{formatCurrency(record.tax)}</span>
                  </div>
                </div>

                <div className={styles.netPaySection}>
                  <div className={styles.netPayInfo}>
                    <span className={styles.netPayLabel}>실수령액</span>
                    <span className={styles.netPayValue}>{formatCurrency(record.netPay)}</span>
                  </div>
                  <div className={styles.payDateInfo}>
                    <span className={styles.payDateLabel}>지급일</span>
                    <span className={styles.payDateValue}>{record.payDate}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedRecord && (
        <div className={styles.modal} onClick={() => setSelectedRecord(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>급여 명세서</h2>
              <div className={styles.modalActions}>
                <Button variant="outline" size="sm">
                  <Download className={styles.icon} />
                  PDF 다운로드
                </Button>
                <Button variant="ghost" onClick={() => setSelectedRecord(null)} className={styles.closeButton}>
                  ✕
                </Button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.payslipHeader}>
                <div className={styles.employeeSection}>
                  <h3>{selectedRecord.employeeName}</h3>
                  <div className={styles.employeeData}>
                    <div>사번: {selectedRecord.employeeId}</div>
                    <div>부서: {selectedRecord.department}</div>
                    <div>직급: {selectedRecord.position}</div>
                  </div>
                </div>
                <div className={styles.periodSection}>
                  <div>급여 기간: {selectedRecord.period}</div>
                  <div>지급일: {selectedRecord.payDate}</div>
                  <Badge variant={statusConfig[selectedRecord.status]?.color as any}>{statusConfig[selectedRecord.status]?.label}</Badge>
                </div>
              </div>

              <div className={styles.payslipBody}>
                <div className={styles.salarySection}>
                  <h4>지급 내역</h4>
                  <div className={styles.payslipGrid}>
                    <div className={styles.payslipRow}>
                      <span>기본급</span>
                      <span>{formatCurrency(selectedRecord.baseSalary)}</span>
                    </div>
                    <div className={styles.payslipRow}>
                      <span>각종 수당</span>
                      <span>{formatCurrency(selectedRecord.allowances)}</span>
                    </div>
                    <div className={styles.payslipRow}>
                      <span>연장근무수당</span>
                      <span>{formatCurrency(selectedRecord.overtime)}</span>
                    </div>
                    <div className={`${styles.payslipRow} ${styles.subtotal}`}>
                      <span>지급액 소계</span>
                      <span>{formatCurrency(selectedRecord.baseSalary + selectedRecord.allowances + selectedRecord.overtime)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.deductionSection}>
                  <h4>공제 내역</h4>
                  <div className={styles.payslipGrid}>
                    <div className={styles.payslipRow}>
                      <span>국민연금</span>
                      <span className={styles.deduction}>{formatCurrency(Math.round(selectedRecord.deductions * 0.4))}</span>
                    </div>
                    <div className={styles.payslipRow}>
                      <span>건강보험</span>
                      <span className={styles.deduction}>{formatCurrency(Math.round(selectedRecord.deductions * 0.3))}</span>
                    </div>
                    <div className={styles.payslipRow}>
                      <span>고용보험</span>
                      <span className={styles.deduction}>{formatCurrency(Math.round(selectedRecord.deductions * 0.3))}</span>
                    </div>
                    <div className={styles.payslipRow}>
                      <span>소득세</span>
                      <span className={styles.deduction}>{formatCurrency(Math.round(selectedRecord.tax * 0.8))}</span>
                    </div>
                    <div className={styles.payslipRow}>
                      <span>지방소득세</span>
                      <span className={styles.deduction}>{formatCurrency(Math.round(selectedRecord.tax * 0.2))}</span>
                    </div>
                    <div className={`${styles.payslipRow} ${styles.subtotal}`}>
                      <span>공제액 소계</span>
                      <span className={styles.deduction}>{formatCurrency(selectedRecord.deductions + selectedRecord.tax)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.finalSection}>
                  <div className={`${styles.payslipRow} ${styles.final}`}>
                    <span>실수령액</span>
                    <span className={styles.finalAmount}>{formatCurrency(selectedRecord.netPay)}</span>
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
