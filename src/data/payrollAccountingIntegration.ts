// 근태 데이터 → 급여계산 → 회계전표 자동연동 시스템
// 완전한 인사/급여/회계 통합 처리

import erpDataJson from '../../DatcoDemoData2.json';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string;
  breakEndTime: string;
  regularHours: number;
  overtimeHours: number;
  nightShiftHours: number;
  holidayHours: number;
  attendanceStatus: 'present' | 'absent' | 'late' | 'early_leave' | 'holiday' | 'sick_leave';
  workLocation: string;
  approvedBy: string;
  notes?: string;
}

export interface PayrollCalculation {
  id: string;
  employeeId: string;
  employeeName: string;
  payPeriod: string; // YYYY-MM
  department: string;
  position: string;
  baseSalary: number;
  
  // 근무시간 기반 계산
  regularHours: number;
  overtimeHours: number;
  nightShiftHours: number;
  holidayHours: number;
  
  // 급여 항목
  regularPay: number;
  overtimePay: number;
  nightShiftPay: number;
  holidayPay: number;
  positionAllowance: number;
  mealAllowance: number;
  transportAllowance: number;
  totalGrossPay: number;
  
  // 공제 항목
  incomeTax: number;
  nationalPension: number;
  healthInsurance: number;
  employmentInsurance: number;
  totalDeductions: number;
  
  // 최종 지급액
  netPay: number;
  payDate: Date;
  
  // 회계 연동 정보
  accountingEntryId: string;
  costCenter: string;
}

export interface AccountingEntry {
  id: string;
  entryDate: Date;
  description: string;
  referenceType: 'payroll' | 'attendance' | 'hr_expense';
  referenceId: string;
  totalAmount: number;
  entries: {
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    costCenter: string;
    department: string;
  }[];
  approvedBy: string;
  status: 'draft' | 'approved' | 'posted';
}

// ERP 데이터에서 근태 기록 생성
export const generateAttendanceFromERP = (): AttendanceRecord[] => {
  const attendanceRecords: AttendanceRecord[] = [];
  const employees = erpDataJson.sheets.인사급여 || [];
  
  // 최근 3개월간 근태 데이터 생성
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  
  employees.forEach((employee: any) => {
    for (let day = 0; day < 90; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      
      // 주말 제외
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
      
      const isHoliday = Math.random() < 0.05; // 5% 확률로 휴일
      const isAbsent = Math.random() < 0.02; // 2% 확률로 결근
      const isLate = Math.random() < 0.08; // 8% 확률로 지각
      
      let workStartTime = '08:00';
      let workEndTime = '17:00';
      let regularHours = 8;
      let overtimeHours = 0;
      let nightShiftHours = 0;
      let holidayHours = 0;
      let attendanceStatus: AttendanceRecord['attendanceStatus'] = 'present';
      
      if (isAbsent) {
        attendanceStatus = 'absent';
        regularHours = 0;
      } else if (isHoliday) {
        attendanceStatus = 'holiday';
        holidayHours = 8;
        regularHours = 0;
      } else {
        if (isLate) {
          workStartTime = '08:30';
          attendanceStatus = 'late';
          regularHours = 7.5;
        }
        
        // 잔업 확률 (30%)
        if (Math.random() < 0.3) {
          const extraHours = Math.floor(Math.random() * 4) + 1;
          overtimeHours = extraHours;
          const endHour = 17 + extraHours;
          workEndTime = `${endHour}:00`;
          
          // 야간근무 (22시 이후)
          if (endHour >= 22) {
            nightShiftHours = endHour - 22;
            overtimeHours = 22 - 17;
          }
        }
      }
      
      const record: AttendanceRecord = {
        id: `ATT-${employee.사번}-${currentDate.toISOString().slice(0, 10).replace(/-/g, '')}`,
        employeeId: employee.사번,
        employeeName: employee.성명,
        date: currentDate,
        workStartTime,
        workEndTime,
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        regularHours,
        overtimeHours,
        nightShiftHours,
        holidayHours,
        attendanceStatus,
        workLocation: employee.부서 || 'MAIN',
        approvedBy: 'SYS-AUTO',
        notes: isLate ? '지각' : isAbsent ? '결근' : isHoliday ? '휴일근무' : undefined
      };
      
      attendanceRecords.push(record);
    }
  });
  
  return attendanceRecords;
};

// 근태 기반 급여 계산
export const calculatePayrollFromAttendance = (attendanceRecords: AttendanceRecord[]): PayrollCalculation[] => {
  const payrollCalculations: PayrollCalculation[] = [];
  const employees = erpDataJson.sheets.인사급여 || [];
  const payPolicies = erpDataJson.sheets.임금정책 || [];
  
  // 월별로 그룹화
  const monthlyAttendance = new Map<string, AttendanceRecord[]>();
  
  attendanceRecords.forEach(record => {
    const monthKey = `${record.employeeId}-${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyAttendance.has(monthKey)) {
      monthlyAttendance.set(monthKey, []);
    }
    monthlyAttendance.get(monthKey)!.push(record);
  });
  
  // 각 직원의 월별 급여 계산
  monthlyAttendance.forEach((records, monthKey) => {
    const [employeeId, year, month] = monthKey.split('-');
    const employee = employees.find((e: any) => e.사번 === employeeId);
    const payPolicy = payPolicies.find((p: any) => p.등급 === employee?.등급);
    
    if (!employee || !payPolicy) return;
    
    // 근무시간 집계
    const totalRegularHours = records.reduce((sum, r) => sum + r.regularHours, 0);
    const totalOvertimeHours = records.reduce((sum, r) => sum + r.overtimeHours, 0);
    const totalNightShiftHours = records.reduce((sum, r) => sum + r.nightShiftHours, 0);
    const totalHolidayHours = records.reduce((sum, r) => sum + r.holidayHours, 0);
    
    // 급여 계산
    const regularPay = totalRegularHours * payPolicy.기본시급;
    const overtimePay = totalOvertimeHours * payPolicy.잔업시급;
    const nightShiftPay = totalNightShiftHours * payPolicy.야간시급;
    const holidayPay = totalHolidayHours * payPolicy.특근시급;
    
    const positionAllowance = employee.직책수당 || 0;
    const mealAllowance = 200000; // 식대
    const transportAllowance = 100000; // 교통비
    
    const totalGrossPay = regularPay + overtimePay + nightShiftPay + holidayPay + 
                         positionAllowance + mealAllowance + transportAllowance;
    
    // 공제액 계산
    const incomeTax = Math.floor(totalGrossPay * 0.08); // 소득세 8%
    const nationalPension = Math.floor(totalGrossPay * 0.045); // 국민연금 4.5%
    const healthInsurance = Math.floor(totalGrossPay * 0.0335); // 건강보험 3.35%
    const employmentInsurance = Math.floor(totalGrossPay * 0.008); // 고용보험 0.8%
    
    const totalDeductions = incomeTax + nationalPension + healthInsurance + employmentInsurance;
    const netPay = totalGrossPay - totalDeductions;
    
    const payDate = new Date(parseInt(year), parseInt(month) - 1, 25); // 매월 25일 지급
    
    const payroll: PayrollCalculation = {
      id: `PAY-${employeeId}-${year}${month}`,
      employeeId,
      employeeName: employee.성명,
      payPeriod: `${year}-${month}`,
      department: employee.부서,
      position: employee.직급,
      baseSalary: payPolicy.기본시급 * 160, // 월 기본급 (160시간 기준)
      
      regularHours: totalRegularHours,
      overtimeHours: totalOvertimeHours,
      nightShiftHours: totalNightShiftHours,
      holidayHours: totalHolidayHours,
      
      regularPay,
      overtimePay,
      nightShiftPay,
      holidayPay,
      positionAllowance,
      mealAllowance,
      transportAllowance,
      totalGrossPay,
      
      incomeTax,
      nationalPension,
      healthInsurance,
      employmentInsurance,
      totalDeductions,
      
      netPay,
      payDate,
      
      accountingEntryId: `JE-PAY-${employeeId}-${year}${month}`,
      costCenter: employee.부서 || 'ADMIN'
    };
    
    payrollCalculations.push(payroll);
  });
  
  return payrollCalculations;
};

// 급여 기반 회계전표 생성
export const generateAccountingEntriesFromPayroll = (payrollCalculations: PayrollCalculation[]): AccountingEntry[] => {
  const accountingEntries: AccountingEntry[] = [];
  
  payrollCalculations.forEach(payroll => {
    const entry: AccountingEntry = {
      id: payroll.accountingEntryId,
      entryDate: payroll.payDate,
      description: `급여 지급 - ${payroll.employeeName} (${payroll.payPeriod})`,
      referenceType: 'payroll',
      referenceId: payroll.id,
      totalAmount: payroll.totalGrossPay,
      entries: [
        {
          accountCode: '5100',
          accountName: '급여비',
          debit: payroll.regularPay + payroll.overtimePay + payroll.nightShiftPay + payroll.holidayPay,
          credit: 0,
          costCenter: payroll.costCenter,
          department: payroll.department
        },
        {
          accountCode: '5110',
          accountName: '제수당',
          debit: payroll.positionAllowance + payroll.mealAllowance + payroll.transportAllowance,
          credit: 0,
          costCenter: payroll.costCenter,
          department: payroll.department
        },
        {
          accountCode: '2110',
          accountName: '소득세예수금',
          debit: 0,
          credit: payroll.incomeTax,
          costCenter: payroll.costCenter,
          department: payroll.department
        },
        {
          accountCode: '2120',
          accountName: '국민연금예수금',
          debit: 0,
          credit: payroll.nationalPension,
          costCenter: payroll.costCenter,
          department: payroll.department
        },
        {
          accountCode: '2130',
          accountName: '건강보험예수금',
          debit: 0,
          credit: payroll.healthInsurance,
          costCenter: payroll.costCenter,
          department: payroll.department
        },
        {
          accountCode: '2140',
          accountName: '고용보험예수금',
          debit: 0,
          credit: payroll.employmentInsurance,
          costCenter: payroll.costCenter,
          department: payroll.department
        },
        {
          accountCode: '1110',
          accountName: '현금',
          debit: 0,
          credit: payroll.netPay,
          costCenter: payroll.costCenter,
          department: payroll.department
        }
      ],
      approvedBy: 'SYS-AUTO',
      status: 'approved'
    };
    
    accountingEntries.push(entry);
  });
  
  return accountingEntries;
};

// 통합 인사급여회계 시스템 초기화
export const initializePayrollAccountingSystem = () => {
  const attendanceRecords = generateAttendanceFromERP();
  const payrollCalculations = calculatePayrollFromAttendance(attendanceRecords);
  const accountingEntries = generateAccountingEntriesFromPayroll(payrollCalculations);
  
  return {
    attendanceRecords,
    payrollCalculations,
    accountingEntries,
    
    getEmployeePayrollSummary: (employeeId: string) => {
      const employeePayrolls = payrollCalculations.filter(p => p.employeeId === employeeId);
      const totalGrossPay = employeePayrolls.reduce((sum, p) => sum + p.totalGrossPay, 0);
      const totalNetPay = employeePayrolls.reduce((sum, p) => sum + p.netPay, 0);
      const totalDeductions = employeePayrolls.reduce((sum, p) => sum + p.totalDeductions, 0);
      
      return {
        employeeId,
        employeeName: employeePayrolls[0]?.employeeName,
        totalMonths: employeePayrolls.length,
        totalGrossPay,
        totalNetPay,
        totalDeductions,
        averageMonthlyPay: Math.round(totalNetPay / employeePayrolls.length),
        payrollHistory: employeePayrolls
      };
    },
    
    getDepartmentPayrollSummary: (department: string) => {
      const deptPayrolls = payrollCalculations.filter(p => p.department === department);
      const totalCost = deptPayrolls.reduce((sum, p) => sum + p.totalGrossPay, 0);
      
      return {
        department,
        employeeCount: new Set(deptPayrolls.map(p => p.employeeId)).size,
        totalMonthlyCost: totalCost,
        averageEmployeeCost: Math.round(totalCost / new Set(deptPayrolls.map(p => p.employeeId)).size),
        payrollBreakdown: deptPayrolls
      };
    },
    
    getAccountingImpact: () => {
      const totalPayrollExpense = accountingEntries.reduce((sum, entry) => 
        sum + entry.entries.filter(e => e.debit > 0).reduce((s, e) => s + e.debit, 0), 0
      );
      
      const totalTaxLiabilities = accountingEntries.reduce((sum, entry) => 
        sum + entry.entries.filter(e => e.accountName.includes('예수금')).reduce((s, e) => s + e.credit, 0), 0
      );
      
      return {
        totalPayrollExpense,
        totalTaxLiabilities,
        netCashOutflow: totalPayrollExpense - totalTaxLiabilities,
        monthlyEntries: accountingEntries.length,
        integrationRate: '100%' // 완전한 근태-급여-회계 연동
      };
    }
  };
};

export default initializePayrollAccountingSystem;
