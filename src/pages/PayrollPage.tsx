import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useEmployees } from "../context/EmployeeContext";
import type { PayrollRecord } from "../types/employee";
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


// 실제 직원 데이터를 기반으로 급여 기록을 생성하는 함수
const generatePayrollRecordsFromEmployees = (employees: any[]) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM 형식
  
  return employees
    .filter(emp => emp.status === "재직")
    .map((employee) => ({
      id: `payroll-${employee.employeeId}`,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      period: currentMonth,
      baseSalary: employee.salary,
      allowances: Math.floor(employee.salary * 0.1), // 기본급의 10%로 설정
      overtime: 0, // 초기값 0
      deductions: Math.floor(employee.salary * 0.03), // 기본급의 3%로 설정
      tax: Math.floor(employee.salary * 0.15), // 기본급의 15%로 설정
      netPay: employee.salary + Math.floor(employee.salary * 0.1) - Math.floor(employee.salary * 0.03) - Math.floor(employee.salary * 0.15),
      status: "draft" as const,
      payDate: "",
    }));
};

const statusConfig = {
  draft: { label: "작성중", color: "secondary", icon: FileText },
  approved: { label: "승인됨", color: "default", icon: CheckCircle },
  paid: { label: "지급완료", color: "success", icon: DollarSign },
  cancelled: { label: "취소됨", color: "destructive", icon: AlertCircle },
};

export const PayrollPage: React.FC = () => {
  const { employees, getEmployeeById, getActiveEmployees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [calculationData, setCalculationData] = useState({
    employeeId: "",
    period: "",
    baseSalary: 0,
    allowances: 0,
    overtimeHours: 0,
    overtimeRate: 1.5
  });

  // 직원 데이터가 변경될 때마다 급여 기록을 업데이트
  useEffect(() => {
    if (employees.length > 0) {
      const generatedRecords = generatePayrollRecordsFromEmployees(employees);
      setPayrollRecords(generatedRecords);
    }
  }, [employees]);

  const filteredRecords = payrollRecords.filter((record) => {
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

  const totalPayroll = payrollRecords.reduce((sum, record) => sum + record.netPay, 0);
  const totalTax = payrollRecords.reduce((sum, record) => sum + record.tax, 0);
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
                <span className={styles.statValue}>{payrollRecords.length}명</span>
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
                  {Math.round((payrollRecords.filter((r) => r.status === "paid").length / payrollRecords.length) * 100)}%
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
