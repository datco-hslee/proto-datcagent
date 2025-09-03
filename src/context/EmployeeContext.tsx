import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Employee } from '../types/employee';

interface EmployeeContextType {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void;
  getEmployeeById: (employeeId: string) => Employee | undefined;
  getActiveEmployees: () => Employee[];
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// 통합된 직원 데이터 (massiveERPData와 동기화)
const INITIAL_EMPLOYEES: Employee[] = [
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

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const updateEmployee = (employeeId: string, updates: Partial<Employee>) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.employeeId === employeeId ? { ...emp, ...updates } : emp
      )
    );
  };

  const getEmployeeById = (employeeId: string): Employee | undefined => {
    return employees.find(emp => emp.employeeId === employeeId);
  };

  const getActiveEmployees = (): Employee[] => {
    return employees.filter(emp => emp.status === "재직");
  };

  const value: EmployeeContextType = {
    employees,
    setEmployees,
    addEmployee,
    updateEmployee,
    getEmployeeById,
    getActiveEmployees,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
