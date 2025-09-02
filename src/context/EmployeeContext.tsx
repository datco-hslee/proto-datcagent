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

// 초기 직원 데이터
const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    employeeId: "EMP2024001",
    name: "이영희",
    position: "영업팀장",
    department: "영업부",
    email: "yhlee@company.com",
    phone: "010-1234-5678",
    hireDate: "2020-03-15",
    salary: 6000000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["영업전략", "고객관리", "협상"],
    performanceScore: 92,
  },
  {
    id: "EMP-002",
    employeeId: "EMP2024002",
    name: "박기술",
    position: "개발팀장",
    department: "기술부",
    email: "ktpark@company.com",
    phone: "010-2345-6789",
    hireDate: "2019-01-10",
    salary: 7000000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["Python", "React", "DevOps"],
    performanceScore: 88,
  },
  {
    id: "EMP-003",
    employeeId: "EMP2024003",
    name: "최생산",
    position: "생산관리자",
    department: "생산부",
    email: "scchoi@company.com",
    phone: "010-3456-7890",
    hireDate: "2021-06-01",
    salary: 5500000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["품질관리", "생산계획", "안전관리"],
    performanceScore: 85,
  },
  {
    id: "EMP-004",
    employeeId: "EMP2024004",
    name: "정회계",
    position: "경리과장",
    department: "경영지원부",
    email: "hjjung@company.com",
    phone: "010-4567-8901",
    hireDate: "2022-09-01",
    salary: 4500000,
    status: "휴직",
    workType: "정규직",
    manager: "김대표",
    skills: ["재무관리", "세무", "ERP"],
    performanceScore: 78,
  },
  {
    id: "EMP-005",
    employeeId: "EMP2024005",
    name: "김신입",
    position: "마케팅 인턴",
    department: "마케팅부",
    email: "snekim@company.com",
    phone: "010-5678-9012",
    hireDate: "2024-01-08",
    salary: 2500000,
    status: "재직",
    workType: "인턴",
    manager: "이영희",
    skills: ["소셜미디어", "콘텐츠 제작"],
    performanceScore: 72,
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
