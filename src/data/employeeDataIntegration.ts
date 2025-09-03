// 직원 데이터 통합 및 동기화 모듈
import type { Employee } from '../types/employee';

// EmployeeContext와 동일한 데이터 구조
export const UNIFIED_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    employeeId: "E2021001",
    name: "김철수",
    position: "생산팀장",
    department: "생산부",
    email: "kcs@company.com",
    phone: "010-1234-5678",
    hireDate: "2021-03-15",
    salary: 4500000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["생산관리", "품질관리", "팀리더십"],
    performanceScore: 92,
  },
  {
    id: "EMP-002",
    employeeId: "E2022005",
    name: "이영희",
    position: "생산작업자",
    department: "생산부",
    email: "lyh@company.com",
    phone: "010-2345-6789",
    hireDate: "2022-01-10",
    salary: 3200000,
    status: "재직",
    workType: "정규직",
    manager: "김철수",
    skills: ["기계조작", "품질검사", "안전관리"],
    performanceScore: 88,
  },
  {
    id: "EMP-003",
    employeeId: "E2020012",
    name: "박민수",
    position: "품질검사원",
    department: "품질부",
    email: "pms@company.com",
    phone: "010-3456-7890",
    hireDate: "2020-09-01",
    salary: 3500000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["품질관리", "검사장비", "데이터분석"],
    performanceScore: 85,
  },
  {
    id: "EMP-004",
    employeeId: "E2023001",
    name: "정수진",
    position: "생산작업자",
    department: "생산부",
    email: "jsj@company.com",
    phone: "010-4567-8901",
    hireDate: "2023-02-01",
    salary: 3200000,
    status: "재직",
    workType: "정규직",
    manager: "김철수",
    skills: ["조립작업", "품질관리", "효율개선"],
    performanceScore: 78,
  },
  {
    id: "EMP-005",
    employeeId: "E2021008",
    name: "최영호",
    position: "생산반장",
    department: "생산부",
    email: "cyh@company.com",
    phone: "010-5678-9012",
    hireDate: "2021-06-15",
    salary: 3800000,
    status: "재직",
    workType: "정규직",
    manager: "김철수",
    skills: ["현장관리", "작업지도", "안전관리"],
    performanceScore: 90,
  },
  {
    id: "EMP-006",
    employeeId: "E2022010",
    name: "김영수",
    position: "구매담당자",
    department: "구매부",
    email: "kys@company.com",
    phone: "010-6789-0123",
    hireDate: "2022-04-01",
    salary: 3600000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["구매협상", "공급업체관리", "원가분석"],
    performanceScore: 82,
  },
  {
    id: "EMP-007",
    employeeId: "E2021015",
    name: "이미경",
    position: "영업대표",
    department: "영업부",
    email: "lmk@company.com",
    phone: "010-7890-1234",
    hireDate: "2021-08-01",
    salary: 4200000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["영업전략", "고객관리", "계약협상"],
    performanceScore: 87,
  },
  {
    id: "EMP-008",
    employeeId: "E2023005",
    name: "송현우",
    position: "품질관리자",
    department: "품질부",
    email: "shw@company.com",
    phone: "010-8901-2345",
    hireDate: "2023-01-15",
    salary: 3800000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["품질시스템", "ISO관리", "프로세스개선"],
    performanceScore: 84,
  },
];

// massiveERPData 형식으로 변환하는 함수
export const convertToMassiveERPFormat = (employees: Employee[]) => {
  return employees.map(emp => ({
    id: emp.id,
    employeeNumber: emp.employeeId,
    name: emp.name,
    department: emp.department,
    position: emp.position,
    jobGrade: emp.position.includes('팀장') ? 'M2' : emp.position.includes('반장') ? 'S5' : 'S3',
    hireDate: new Date(emp.hireDate),
    baseSalary: emp.salary,
    hourlyRate: Math.round(emp.salary / 209), // 월 평균 근무시간 209시간
    overtimeRate: Math.round(emp.salary / 209 * 1.5),
    nightShiftRate: Math.round(emp.salary / 209 * 1.2),
    weekendRate: Math.round(emp.salary / 209 * 2),
    holidayRate: Math.round(emp.salary / 209 * 3),
    status: emp.status === '재직' ? 'active' : 'inactive'
  }));
};

// 급여 기록 생성을 위한 인터페이스
export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  payPeriod: string;
  payDate: Date;
  baseSalary: number;
  overtimePay: number;
  nightShiftPay: number;
  weekendPay: number;
  holidayPay: number;
  grossPay: number;
  socialInsurance: number;
  incomeTax: number;
  netPay: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  totalNightHours: number;
  totalWeekendHours: number;
  totalHolidayHours: number;
}

// 통합된 급여 기록 생성 함수
export const generateUnifiedPayrollRecords = (employees: Employee[]): PayrollRecord[] => {
  const payrollRecords: PayrollRecord[] = [];
  let idCounter = 1;

  // 6개월 데이터 생성 (2023-10 ~ 2024-03)
  const months = ['2023-10', '2023-11', '2023-12', '2024-01', '2024-02', '2024-03'];

  months.forEach(month => {
    employees.filter(emp => emp.status === '재직').forEach(employee => {
      const [year, monthNum] = month.split('-').map(Number);
      const payDate = new Date(year, monthNum - 1, 25); // 매월 25일 급여 지급

      // 근무시간 계산 (월 평균 + 랜덤 변동)
      const baseWorkHours = 209; // 월 평균 근무시간
      const totalWorkHours = baseWorkHours + Math.floor(Math.random() * 20) - 10; // ±10시간 변동
      const totalOvertimeHours = Math.floor(Math.random() * 30); // 0-30시간 연장근무
      const totalNightHours = employee.department === '생산부' ? Math.floor(Math.random() * 20) : 0;
      const totalWeekendHours = Math.floor(Math.random() * 16); // 주말근무
      const totalHolidayHours = Math.floor(Math.random() * 8); // 휴일근무

      // 급여 계산
      const hourlyRate = Math.round(employee.salary / 209);
      const baseSalary = employee.salary;
      const overtimePay = totalOvertimeHours * hourlyRate * 1.5;
      const nightShiftPay = totalNightHours * hourlyRate * 0.2; // 야간수당 20%
      const weekendPay = totalWeekendHours * hourlyRate * 1.0; // 주말수당 100%
      const holidayPay = totalHolidayHours * hourlyRate * 2.0; // 휴일수당 200%

      const grossPay = baseSalary + overtimePay + nightShiftPay + weekendPay + holidayPay;
      const socialInsurance = Math.round(grossPay * 0.09); // 사회보험료 9%
      const incomeTax = Math.round(grossPay * 0.06); // 소득세 6%
      const netPay = grossPay - socialInsurance - incomeTax;

      payrollRecords.push({
        id: `PAY-${idCounter.toString().padStart(6, '0')}`,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        position: employee.position,
        payPeriod: month,
        payDate,
        baseSalary,
        overtimePay,
        nightShiftPay,
        weekendPay,
        holidayPay,
        grossPay,
        socialInsurance,
        incomeTax,
        netPay,
        totalWorkHours,
        totalOvertimeHours,
        totalNightHours,
        totalWeekendHours,
        totalHolidayHours
      });

      idCounter++;
    });
  });

  return payrollRecords;
};

// 인건비 분석 함수 (통합 데이터 기반)
export const analyzeUnifiedLaborCosts = (department?: string, month?: string) => {
  const employees = UNIFIED_EMPLOYEES.filter(emp => emp.status === '재직');
  const payrollRecords = generateUnifiedPayrollRecords(employees);
  
  let filteredPayrolls = payrollRecords;
  
  if (department) {
    filteredPayrolls = filteredPayrolls.filter(p => p.department === department);
  }
  
  if (month) {
    filteredPayrolls = filteredPayrolls.filter(p => p.payPeriod === month);
  }
  
  const totalBaseSalary = filteredPayrolls.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalOvertimePay = filteredPayrolls.reduce((sum, p) => sum + p.overtimePay, 0);
  const totalGrossPay = filteredPayrolls.reduce((sum, p) => sum + p.grossPay, 0);
  const totalWorkHours = filteredPayrolls.reduce((sum, p) => sum + p.totalWorkHours, 0);
  const totalOvertimeHours = filteredPayrolls.reduce((sum, p) => sum + p.totalOvertimeHours, 0);
  
  return {
    employeeCount: new Set(filteredPayrolls.map(p => p.employeeId)).size, // 중복 제거한 실제 직원 수
    totalBaseSalary,
    totalOvertimePay,
    totalPay: totalGrossPay,
    totalWorkHours,
    totalOvertimeHours,
    averageHourlyRate: totalWorkHours > 0 ? totalGrossPay / totalWorkHours : 0,
    payrollRecords: filteredPayrolls
  };
};
