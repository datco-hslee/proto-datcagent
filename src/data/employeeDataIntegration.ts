// 직원 데이터 통합 모듈 - EmployeeContext와 챗봇 분석 연동

import type { Employee } from '../types/employee';

// DatcoDemoData2.json의 인원마스터 데이터를 직접 하드코딩
const ERP_EMPLOYEE_DATA = [
  {
    "사번": "W001",
    "성명": "김철수",
    "직무": "프레스",
    "등급": "숙련",
    "라인": "LINE-1",
    "표준CT초(레일)": 10,
    "표준CT초(프레임)": 45,
    "기본시급": 12000,
    "잠업시급": 18000,
    "특근시급": 24000
  },
  {
    "사번": "W002",
    "성명": "이영희",
    "직무": "가공",
    "등급": "숙련",
    "라인": "LINE-1",
    "표준CT초(레일)": 12,
    "표준CT초(프레임)": 50,
    "기본시급": 12000,
    "잠업시급": 18000,
    "특근시급": 24000
  },
  {
    "사번": "W003",
    "성명": "박민수",
    "직무": "용접",
    "등급": "중급",
    "라인": "LINE-1",
    "표준CT초(레일)": 15,
    "표준CT초(프레임)": 55,
    "기본시급": 11500,
    "잠업시급": 17250,
    "특근시급": 23000
  },
  {
    "사번": "W004",
    "성명": "최지훈",
    "직무": "검사/포장",
    "등급": "중급",
    "라인": "LINE-1",
    "표준CT초(레일)": 8,
    "표준CT초(프레임)": 35,
    "기본시급": 11500,
    "잠업시급": 17250,
    "특근시급": 23000
  },
  {
    "사번": "W005",
    "성명": "정다인",
    "직무": "프레스",
    "등급": "초급",
    "라인": "LINE-1",
    "표준CT초(레일)": 14,
    "표준CT초(프레임)": 60,
    "기본시급": 11000,
    "잠업시급": 16500,
    "특근시급": 22000
  },
  {
    "사번": "W006",
    "성명": "오세영",
    "직무": "가공",
    "등급": "초급",
    "라인": "LINE-1",
    "표준CT초(레일)": 16,
    "표준CT초(프레임)": 65,
    "기본시급": 11000,
    "잠업시급": 16500,
    "특근시급": 22000
  }
];

// ERP 데이터를 Employee 형식으로 변환
const getERPEmployees = (): Employee[] => {
  try {
    // Employee 형식에 맞게 변환
    return ERP_EMPLOYEE_DATA.map((emp: any, index: number) => {
      // 급여 계산 (기본시급 * 209시간)
      const salary = (emp.기본시급 || 0) * 209;
      
      return {
        id: emp.사번 || `ERP-${index + 1}`,
        employeeId: emp.사번 || `ERP-${index + 1}`,
        name: emp.성명 || '',
        department: emp.직무 ? `${emp.직무}부` : '생산부',
        position: emp.등급 || '',
        salary: salary,
        status: '재직',
        email: `${emp.성명?.replace(/\s+/g, '')}@datco.kr` || `employee${index + 1}@datco.kr`,
        phone: `010-${1000 + index}-${5000 + index}`,
        hireDate: '2022-01-01',
        workType: '정규직',
        manager: '',
        skills: [emp.직무 || '생산'],
        performanceScore: 85,
        dataSource: 'erp'
      };
    });
  } catch (error) {
    console.error('ERP 직원 데이터 변환 오류:', error);
    return [];
  }
};

// 실제 ERP 데이터에서 가져온 직원 데이터
const ERP_EMPLOYEES = getERPEmployees();

// 기본 데이터 (실제 ERP 데이터가 없을 경우 사용)
const FALLBACK_EMPLOYEES: Employee[] = [
  { 
    id: 'EMP-001', 
    employeeId: 'EMP-001',
    name: '김철수', 
    department: '생산부', 
    position: '팀장', 
    salary: 4500000, 
    status: '재직',
    email: 'kim@datco.kr',
    phone: '010-1234-5678',
    hireDate: '2022-01-15',
    workType: '정규직',
    manager: '',
    skills: ['생산관리', '품질관리'],
    performanceScore: 90,
    dataSource: 'demo'
  },
  { 
    id: 'EMP-002', 
    employeeId: 'EMP-002',
    name: '이영희', 
    department: '생산부', 
    position: '작업자', 
    salary: 3200000, 
    status: '재직',
    email: 'lee@datco.kr',
    phone: '010-2345-6789',
    hireDate: '2022-03-10',
    workType: '정규직',
    manager: 'EMP-001',
    skills: ['프레스 운용'],
    performanceScore: 85,
    dataSource: 'demo'
  },
  { 
    id: 'EMP-003', 
    employeeId: 'EMP-003',
    name: '박민수', 
    department: '품질부', 
    position: '검사원', 
    salary: 3500000, 
    status: '재직',
    email: 'park@datco.kr',
    phone: '010-3456-7890',
    hireDate: '2022-05-20',
    workType: '정규직',
    manager: '',
    skills: ['품질검사', '분석기기 운용'],
    performanceScore: 88,
    dataSource: 'demo'
  }
];

// EmployeeContext에서 직원 데이터를 가져오는 함수
let employeeContextData: Employee[] = [];

export const setEmployeeContextData = (employees: Employee[]) => {
  employeeContextData = employees;
  console.log('직원 데이터 설정됨:', employees.length);
};

export const getEmployeeContextData = (): Employee[] => {
  // EmployeeContext에 데이터가 있으면 그것을 사용
  if (employeeContextData.length > 0) {
    return employeeContextData;
  }
  
  // ERP 데이터가 있으면 그것을 사용
  if (ERP_EMPLOYEES.length > 0) {
    console.log('실제 ERP 데이터 사용:', ERP_EMPLOYEES.length, '명');
    return ERP_EMPLOYEES;
  }
  
  // 둘 다 없으면 기본 데이터 사용
  console.log('기본 데이터 사용:', FALLBACK_EMPLOYEES.length, '명');
  return FALLBACK_EMPLOYEES;
};

// 급여 기록 인터페이스 (massiveERPData와 호환)
export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  payPeriod: string;
  baseSalary: number;
  overtimePay: number;
  nightShiftAllowance: number;
  weekendAllowance: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  payDate: Date;
}

// EmployeeContext 데이터를 기반으로 급여 기록 생성
export const generatePayrollFromEmployeeContext = (): PayrollRecord[] => {
  const payrollRecords: PayrollRecord[] = [];
  const employees = getEmployeeContextData();
  
  if (employees.length === 0) {
    console.warn('No employee data available from EmployeeContext');
    return [];
  }

  // 6개월치 급여 기록 생성 (2023-10 ~ 2024-03)
  const months = ['2023-10', '2023-11', '2023-12', '2024-01', '2024-02', '2024-03'];
  
  months.forEach(month => {
    employees
      .filter(emp => emp.status === '재직')
      .forEach((employee) => {
        const monthlyWorkHours = 160 + Math.floor(Math.random() * 40); // 160-200시간
        const overtimeHours = Math.floor(Math.random() * 20); // 0-20시간
        const hourlyRate = employee.salary / 209; // 월 기준 시급
        
        const baseSalary = employee.salary;
        const overtimePay = overtimeHours * hourlyRate * 1.5;
        const nightShiftAllowance = overtimeHours > 10 ? 50000 : 0;
        const weekendAllowance = Math.random() > 0.7 ? 30000 : 0;
        
        const grossPay = baseSalary + overtimePay + nightShiftAllowance + weekendAllowance;
        const deductions = grossPay * 0.1; // 10% 공제
        const netPay = grossPay - deductions;
        
        payrollRecords.push({
          id: `PAY-${month}-${employee.employeeId}`,
          employeeId: employee.employeeId,
          employeeName: employee.name,
          department: employee.department,
          position: employee.position,
          payPeriod: month,
          baseSalary,
          overtimePay,
          nightShiftAllowance,
          weekendAllowance,
          totalWorkHours: monthlyWorkHours,
          totalOvertimeHours: overtimeHours,
          grossPay,
          deductions,
          netPay,
          payDate: new Date(`${month}-25`)
        });
      });
  });
  
  return payrollRecords;
};

// 인건비 분석 함수 (EmployeeContext 데이터 기반)
export const analyzeLaborCostsFromContext = (department?: string, month?: string) => {
  const employees = getEmployeeContextData();
  console.log('Employee data in analyzeLaborCostsFromContext:', employees.length, employees);
  
  const payrollRecords = generatePayrollFromEmployeeContext();
  console.log('Generated payroll records:', payrollRecords.length, payrollRecords);
  
  let filteredPayrolls = payrollRecords;
  
  if (department) {
    filteredPayrolls = filteredPayrolls.filter(p => p.department === department);
    console.log(`Filtered by department '${department}':`, filteredPayrolls.length, filteredPayrolls);
  }
  
  if (month) {
    filteredPayrolls = filteredPayrolls.filter(p => p.payPeriod === month);
    console.log(`Filtered by month '${month}':`, filteredPayrolls.length);
  }
  
  const totalBaseSalary = filteredPayrolls.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalOvertimePay = filteredPayrolls.reduce((sum, p) => sum + p.overtimePay, 0);
  const totalGrossPay = filteredPayrolls.reduce((sum, p) => sum + p.grossPay, 0);
  const totalWorkHours = filteredPayrolls.reduce((sum, p) => sum + p.totalWorkHours, 0);
  const totalOvertimeHours = filteredPayrolls.reduce((sum, p) => sum + p.totalOvertimeHours, 0);
  
  return {
    employeeCount: new Set(filteredPayrolls.map(p => p.employeeId)).size,
    totalBaseSalary,
    totalOvertimePay,
    totalGrossPay,
    totalWorkHours,
    totalOvertimeHours,
    averageHourlyRate: totalWorkHours > 0 ? totalGrossPay / totalWorkHours : 0,
    totalPay: totalGrossPay
  };
};
