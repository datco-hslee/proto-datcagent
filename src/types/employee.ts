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
  dataSource?: "generated" | "erp" | "demo" | "massive";
  dataSourceLabel?: string;
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
  // ERP 인원마스터 추가 속성
  grade?: string; // 등급
  productionLine?: string; // 라인
  standardCycleTimeRail?: number; // 표준CT초(레일)
  standardCycleTimeFrame?: number; // 표준CT초(프레임)
  baseHourlyRate?: number; // 기본시급
  overtimeHourlyRate?: number; // 잔업시급
  specialWorkHourlyRate?: number; // 특근시급
}
