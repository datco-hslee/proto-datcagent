// 직원 데이터 통합 모듈 - EmployeeContext와 챗봇 분석 연동

import type { Employee } from '../types/employee';

// EmployeeContext에서 직원 데이터를 가져오는 함수
let employeeContextData: Employee[] = [];

export const setEmployeeContextData = (employees: Employee[]) => {
  employeeContextData = employees;
};

export const getEmployeeContextData = (): Employee[] => {
  return employeeContextData;
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
