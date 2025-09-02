export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  status: "재직" | "휴직" | "퇴사";
  workType: "정규직" | "계약직" | "인턴";
  manager: string;
  skills: string[];
  performanceScore: number;
  avatar?: string;
}

export interface PayrollRecord {
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
