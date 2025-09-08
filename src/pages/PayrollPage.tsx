import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Eye, 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp,
  Calculator,
  FileText,
  CheckCircle,
  Clock
} from "lucide-react";
import { useEmployees } from "../context/EmployeeContext";
import type { PayrollRecord } from "../types/employee";
import erpDataJson from '../../DatcoDemoData2.json';
import styles from "./PayrollPage.module.css";



const statusConfig = {
  draft: { label: "작성중", color: "secondary", icon: FileText },
  approved: { label: "승인됨", color: "default", icon: CheckCircle },
  paid: { label: "지급완료", color: "success", icon: DollarSign },
  cancelled: { label: "취소됨", color: "destructive", icon: Clock },
};


// 샘플 급여 데이터 생성 함수
const getSamplePayrollRecords = (): PayrollRecord[] => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  return [
    {
      id: "payroll-sample-001",
      employeeId: "EMP001",
      employeeName: "김철수",
      department: "개발팀",
      position: "시니어 개발자",
      period: currentMonth,
      baseSalary: 5500000,
      allowances: 550000,
      overtime: 200000,
      deductions: 165000,
      tax: 825000,
      netPay: 5260000,
      status: "paid",
      payDate: "2025-09-25",
    },
    {
      id: "payroll-sample-002",
      employeeId: "EMP002",
      employeeName: "이영희",
      department: "마케팅팀",
      position: "마케팅 매니저",
      period: currentMonth,
      baseSalary: 4800000,
      allowances: 480000,
      overtime: 150000,
      deductions: 144000,
      tax: 720000,
      netPay: 4566000,
      status: "approved",
      payDate: "",
    },
    {
      id: "payroll-sample-003",
      employeeId: "EMP003",
      employeeName: "박민수",
      department: "영업팀",
      position: "영업 대표",
      period: currentMonth,
      baseSalary: 4200000,
      allowances: 420000,
      overtime: 100000,
      deductions: 126000,
      tax: 630000,
      netPay: 3964000,
      status: "draft",
      payDate: "",
    }
  ];
};

export function PayrollPage() {
  const { employees, getEmployeeById, getActiveEmployees } = useEmployees();

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PayrollRecord["status"] | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "department" | "netPay" | "status">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [calculationData, setCalculationData] = useState({
    employeeId: "",
    period: "",
    baseSalary: 0,
    allowances: 0,
    overtimeHours: 0,
    overtimeRate: 1.5
  });

  // ERP 인원마스터 데이터를 기반으로 급여 데이터 생성
  const getERPPayrollRecords = (): PayrollRecord[] => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const erpData = erpDataJson.sheets.인원마스터 || [];
    
    return erpData.map((emp: any, index: number) => {
      const monthlyWorkHours = 173;
      // ERP 데이터에서 기본시급을 사용하여 월급 계산
      const baseHourlyRate = emp.기본시급 || 12000;
      const overtimeHourlyRate = emp.잔업시급 || 18000;
      const specialWorkHourlyRate = emp.특근시급 || 24000;
      
      const baseSalary = baseHourlyRate * monthlyWorkHours;
      const allowances = Math.floor(baseSalary * 0.1);
      const overtime = Math.floor(baseSalary * 0.15);
      const grossPay = baseSalary + allowances + overtime;
      const deductions = Math.floor(grossPay * 0.09);
      const tax = Math.floor(grossPay * 0.08);
      const netPay = grossPay - deductions - tax;
      const statuses: PayrollRecord["status"][] = ["paid", "approved", "draft"];
      const status = statuses[index % statuses.length];
      
      return {
        id: `payroll-erp-${emp.사번}`,
        employeeId: emp.사번,
        employeeName: emp.성명,
        department: emp.직무,
        position: emp.직무,
        period: currentMonth,
        baseSalary,
        allowances,
        overtime,
        deductions,
        tax,
        netPay,
        status,
        payDate: status === "paid" ? "2025-09-25" : "",
        // ERP 인원마스터 추가 속성
        grade: emp.등급,
        productionLine: emp.라인,
        standardCycleTimeRail: emp["표준CT초(레일)"],
        standardCycleTimeFrame: emp["표준CT초(프레임)"],
        baseHourlyRate: emp.기본시급,
        overtimeHourlyRate: emp.잔업시급,
        specialWorkHourlyRate: emp.특근시급,
      };
    });
  };

  // 현재 급여 기록 가져오기
  const getCurrentPayrollRecords = (): PayrollRecord[] => {
    if (selectedDataSource === "sample") {
      return getSamplePayrollRecords();
    } else {
      // ERP 인원마스터 데이터 기반 급여 기록
      return getERPPayrollRecords();
    }
  };

  // 데이터 소스 변경 시 급여 기록 업데이트
  useEffect(() => {
    const records = getCurrentPayrollRecords();
    setPayrollRecords(records);
  }, [selectedDataSource]);

  const currentPayrollRecords = getCurrentPayrollRecords();

  const filteredRecords = currentPayrollRecords.filter((record) => {
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

  const totalPayroll = currentPayrollRecords.reduce((sum, record) => sum + record.netPay, 0);
  const totalTax = currentPayrollRecords.reduce((sum, record) => sum + record.tax, 0);
  const departments = [...new Set(employees.map((e) => e.department))];

  // Salary calculation function
  const calculateSalary = () => {
    const { baseSalary, allowances, overtimeHours, overtimeRate } = calculationData;
    const hourlyRate = baseSalary / 209; // 월 기준 근무시간 (주 40시간 * 52주 / 12개월)
    const overtimePay = hourlyRate * overtimeRate * overtimeHours;
    const grossPay = baseSalary + allowances + overtimePay;
    
    // 4대보험 계산 (2024년 기준)
    const nationalPension = Math.round(grossPay * 0.045); // 국민연금 4.5%
    const healthInsurance = Math.round(grossPay * 0.03545); // 건강보험 3.545%
    const employmentInsurance = Math.round(grossPay * 0.009); // 고용보험 0.9%
    const totalInsurance = nationalPension + healthInsurance + employmentInsurance;
    
    // 소득세 계산 (간이세액표 기준 - 단순화)
    const taxableIncome = grossPay - totalInsurance;
    const incomeTax = Math.round(taxableIncome * 0.08); // 소득세 8% (단순화)
    const localTax = Math.round(incomeTax * 0.1); // 지방소득세 10%
    const totalTax = incomeTax + localTax;
    
    const netPay = grossPay - totalInsurance - totalTax;
    
    return {
      grossPay,
      overtime: overtimePay,
      deductions: totalInsurance,
      tax: totalTax,
      netPay,
      breakdown: {
        nationalPension,
        healthInsurance,
        employmentInsurance,
        incomeTax,
        localTax
      }
    };
  };

  // Handle salary calculation submission
  const handleCalculatePayroll = () => {
    const employee = getEmployeeById(calculationData.employeeId);
    if (!employee) {
      alert("직원 정보를 찾을 수 없습니다.");
      return;
    }

    const calculation = calculateSalary();
    const newRecord: PayrollRecord = {
      id: `PAY-${Date.now()}`,
      employeeId: calculationData.employeeId,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      period: calculationData.period,
      baseSalary: calculationData.baseSalary,
      allowances: calculationData.allowances,
      overtime: calculation.overtime,
      deductions: calculation.deductions,
      tax: calculation.tax,
      netPay: calculation.netPay,
      status: "draft",
      payDate: new Date().toISOString().split('T')[0]
    };
    
    setPayrollRecords([...payrollRecords, newRecord]);
    setShowCalculationModal(false);
    setCalculationData({
      employeeId: "",
      period: "",
      baseSalary: 0,
      allowances: 0,
      overtimeHours: 0,
      overtimeRate: 1.5
    });
  };

  // Download individual payslip as CSV
  const downloadPayslip = (record: PayrollRecord) => {
    const csvContent = [
      ['급여명세서'],
      [''],
      ['직원정보'],
      ['사번', record.employeeId],
      ['성명', record.employeeName],
      ['부서', record.department],
      ['직급', record.position],
      ...(record.grade ? [['등급', record.grade]] : []),
      ...(record.productionLine ? [['라인', record.productionLine]] : []),
      ...(record.baseHourlyRate ? [['기본시급', record.baseHourlyRate.toLocaleString()]] : []),
      ...(record.overtimeHourlyRate ? [['잔업시급', record.overtimeHourlyRate.toLocaleString()]] : []),
      ...(record.specialWorkHourlyRate ? [['특근시급', record.specialWorkHourlyRate.toLocaleString()]] : []),
      ...(record.standardCycleTimeRail ? [['표준CT초(레일)', record.standardCycleTimeRail.toString()]] : []),
      ...(record.standardCycleTimeFrame ? [['표준CT초(프레임)', record.standardCycleTimeFrame.toString()]] : []),
      ['급여기간', record.period],
      ['지급일', record.payDate],
      [''],
      ['지급내역'],
      ['기본급', record.baseSalary.toLocaleString()],
      ['수당', record.allowances.toLocaleString()],
      ['연장근무수당', record.overtime.toLocaleString()],
      ['지급액소계', (record.baseSalary + record.allowances + record.overtime).toLocaleString()],
      [''],
      ['공제내역'],
      ['4대보험', record.deductions.toLocaleString()],
      ['소득세', record.tax.toLocaleString()],
      ['공제액소계', (record.deductions + record.tax).toLocaleString()],
      [''],
      ['실수령액', record.netPay.toLocaleString()]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `급여명세서_${record.employeeName}_${record.period}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all payroll data as CSV
  const downloadAllPayroll = () => {
    const headers = ['사번', '성명', '부서', '직급', '급여기간', '기본급', '수당', '연장근무수당', '공제액', '세금', '실수령액', '상태', '지급일'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        record.employeeId,
        record.employeeName,
        record.department,
        record.position,
        record.period,
        record.baseSalary,
        record.allowances,
        record.overtime,
        record.deductions,
        record.tax,
        record.netPay,
        statusConfig[record.status]?.label,
        record.payDate
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `급여대장_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>급여 관리</h1>
            <p className={styles.subtitle}>직원 급여를 계산하고 관리하세요</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="outline" onClick={downloadAllPayroll}>
              <Download className={styles.icon} />
              전체 다운로드
            </Button>
            <Button className={styles.addButton} onClick={() => setShowCalculationModal(true)}>
              <Plus className={styles.icon} />
              급여 계산
            </Button>
          </div>
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
                <span className={styles.statValue}>{currentPayrollRecords.length}명</span>
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
                  {currentPayrollRecords.length > 0 ? Math.round((currentPayrollRecords.filter((r) => r.status === "paid").length / currentPayrollRecords.length) * 100) : 0}%
                </span>
              </div>
              <div className={styles.statIcon}>
                <TrendingUp />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          {/* 데이터 소스 선택 */}
          <div className={styles.filterGroup}>
            {/* <label className={styles.filterLabel}>데이터 소스</label> */}
            <select
              className={styles.filterSelect}
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")}
            >
              <option value="erp">닷코 시연 데이터</option>
              <option value="sample">생성된 샘플 데이터</option>
            </select>
          </div>
          
          {/* 데이터 소스 표시 배지 */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: selectedDataSource === 'erp' ? '#3b82f6' : '#f59e0b',
            color: 'white',
            marginLeft: '8px'
          }}>
            {selectedDataSource === 'erp' ? '닷코 시연 데이터' : '생성된 샘플 데이터'}
          </div>
          
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
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PayrollRecord["status"] | "all")} className={styles.filterSelect}>
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
                    {record.grade && <span className={styles.grade}>{record.grade}</span>}
                    {record.productionLine && <span className={styles.productionLine}>{record.productionLine}</span>}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => downloadPayslip(record)}>
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
                <Button variant="outline" size="sm" onClick={() => downloadPayslip(selectedRecord)}>
                  <Download className={styles.icon} />
                  CSV 다운로드
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
                    {selectedRecord.grade && <div>등급: {selectedRecord.grade}</div>}
                    {selectedRecord.productionLine && <div>라인: {selectedRecord.productionLine}</div>}
                    {selectedRecord.baseHourlyRate && <div>기본시급: {selectedRecord.baseHourlyRate.toLocaleString()}원</div>}
                    {selectedRecord.overtimeHourlyRate && <div>잔업시급: {selectedRecord.overtimeHourlyRate.toLocaleString()}원</div>}
                    {selectedRecord.specialWorkHourlyRate && <div>특근시급: {selectedRecord.specialWorkHourlyRate.toLocaleString()}원</div>}
                    {selectedRecord.standardCycleTimeRail && <div>표준CT초(레일): {selectedRecord.standardCycleTimeRail}초</div>}
                    {selectedRecord.standardCycleTimeFrame && <div>표준CT초(프레임): {selectedRecord.standardCycleTimeFrame}초</div>}
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

      {/* Salary Calculation Modal */}
      {showCalculationModal && (
        <div className={styles.modal} onClick={() => setShowCalculationModal(false)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>급여 계산</h2>
              <Button variant="ghost" onClick={() => setShowCalculationModal(false)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.calculationForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>직원 선택</label>
                  <select
                    value={calculationData.employeeId}
                    onChange={(e) => {
                      const selectedEmployee = getEmployeeById(e.target.value);
                      setCalculationData({
                        ...calculationData, 
                        employeeId: e.target.value,
                        baseSalary: selectedEmployee?.salary || 0
                      });
                    }}
                    className={styles.employeeSelect}
                  >
                    <option value="">직원을 선택하세요</option>
                    {getActiveEmployees().map((employee) => (
                      <option key={employee.employeeId} value={employee.employeeId}>
                        {employee.name} ({employee.employeeId}) - {employee.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>급여 기간</label>
                  <Input
                    type="month"
                    value={calculationData.period}
                    onChange={(e) => setCalculationData({...calculationData, period: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>기본급</label>
                  <Input
                    type="number"
                    value={calculationData.baseSalary}
                    onChange={(e) => setCalculationData({...calculationData, baseSalary: Number(e.target.value)})}
                    placeholder="기본급을 입력하세요"
                    disabled={!!calculationData.employeeId}
                  />
                  {calculationData.employeeId && (
                    <div className={styles.salaryNote}>
                      * 선택된 직원의 기본급이 자동으로 설정됩니다
                    </div>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>수당</label>
                  <Input
                    type="number"
                    value={calculationData.allowances}
                    onChange={(e) => setCalculationData({...calculationData, allowances: Number(e.target.value)})}
                    placeholder="수당을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>연장근무 시간</label>
                  <Input
                    type="number"
                    value={calculationData.overtimeHours}
                    onChange={(e) => setCalculationData({...calculationData, overtimeHours: Number(e.target.value)})}
                    placeholder="연장근무 시간을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>연장근무 수당률</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={calculationData.overtimeRate}
                    onChange={(e) => setCalculationData({...calculationData, overtimeRate: Number(e.target.value)})}
                    placeholder="1.5"
                  />
                </div>
                
                {calculationData.baseSalary > 0 && (
                  <div className={styles.calculationPreview}>
                    <h4>계산 결과 미리보기</h4>
                    <div className={styles.previewGrid}>
                      <div className={styles.previewItem}>
                        <span>총 지급액:</span>
                        <span>{formatCurrency(calculateSalary().grossPay)}</span>
                      </div>
                      <div className={styles.previewItem}>
                        <span>총 공제액:</span>
                        <span>{formatCurrency(calculateSalary().deductions + calculateSalary().tax)}</span>
                      </div>
                      <div className={styles.previewItem}>
                        <span>실수령액:</span>
                        <span className={styles.finalAmount}>{formatCurrency(calculateSalary().netPay)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={styles.formActions}>
                  <Button variant="outline" onClick={() => setShowCalculationModal(false)}>
                    취소
                  </Button>
                  <Button 
                    onClick={handleCalculatePayroll}
                    disabled={!calculationData.employeeId || !calculationData.period || calculationData.baseSalary <= 0}
                  >
                    <Calculator className={styles.icon} />
                    급여 계산
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
