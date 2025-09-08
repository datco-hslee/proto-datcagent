import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Employee } from '../types/employee';
import { setEmployeeContextData } from '../data/employeeDataIntegration';
import erpDataJson from '../../DatcoDemoData2.json';
import { generateMassiveERPData } from '../data/massiveERPData';

interface EmployeeContextType {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void;
  getEmployeeById: (employeeId: string) => Employee | undefined;
  getActiveEmployees: () => Employee[];
  getEmployeesByDataSource: (dataSource: "generated" | "erp" | "demo" | "massive") => Employee[];
  getDataSourceSummary: () => { [key: string]: { count: number; label: string } };
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Convert ERP employee data to Employee interface (DatcoDemoData2.json)
const convertERPEmployeeToEmployee = (erpEmployee: any): Employee => {
  return {
    id: `ERP-${erpEmployee.사번}`,
    employeeId: erpEmployee.사번,
    name: erpEmployee.성명,
    position: erpEmployee.직무,
    department: erpEmployee.라인 || "생산부",
    email: `${erpEmployee.사번.toLowerCase()}@company.com`,
    phone: "010-0000-0000", // Default phone number
    hireDate: "2023-01-01", // Default hire date
    salary: erpEmployee.기본시급 * 8 * 22 || 3000000, // Estimate monthly salary
    status: "재직" as const,
    workType: "정규직" as const,
    manager: "김대표", // Default manager
    skills: [erpEmployee.직무 || "일반작업"],
    performanceScore: 85, // Default performance score
    dataSource: "erp" as const,
    dataSourceLabel: "닷코 시연 데이터"
  };
};

// Convert massive ERP employee data to Employee interface
const convertMassiveERPEmployeeToEmployee = (erpEmployee: any): Employee => {
  return {
    id: `MASSIVE-${erpEmployee.id}`,
    employeeId: erpEmployee.id,
    name: erpEmployee.name,
    position: erpEmployee.position,
    department: erpEmployee.department,
    email: erpEmployee.email,
    phone: erpEmployee.phone,
    hireDate: erpEmployee.hireDate,
    salary: erpEmployee.salary,
    status: erpEmployee.status === 'active' ? '재직' : '퇴직',
    workType: erpEmployee.workType === 'full_time' ? '정규직' : '계약직',
    manager: erpEmployee.manager || '',
    skills: erpEmployee.skills || [],
    performanceScore: erpEmployee.performanceScore || 85,
    dataSource: "massive" as const,
    dataSourceLabel: "대량 ERP 데이터"
  };
};

// Get massive ERP employees data
const getMassiveERPEmployees = (): Employee[] => {
  try {
    const massiveData = generateMassiveERPData();
    return massiveData.employees.map(convertMassiveERPEmployeeToEmployee);
  } catch (error) {
    console.warn('Failed to load massive ERP data:', error);
    return [];
  }
};

// Original generated employee data
const GENERATED_EMPLOYEES: Employee[] = [
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
    dataSource: "generated",
    dataSourceLabel: "생성된 샘플 데이터"
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
    dataSource: "generated",
    dataSourceLabel: "생성된 샘플 데이터"
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
    skills: ["품질검사", "데이터분석", "ISO관리"],
    performanceScore: 85,
    dataSource: "generated",
    dataSourceLabel: "생성된 샘플 데이터"
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
    dataSource: "generated",
    dataSourceLabel: "생성된 샘플 데이터"
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
    dataSource: "generated",
    dataSourceLabel: "생성된 샘플 데이터"
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
    dataSource: "generated",
    dataSourceLabel: "생성된 샘플 데이터"
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
    performanceScore: 95,
    dataSource: "generated",
    dataSourceLabel: "생성된 샘플 데이터"
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
    skills: ["품질시스템", "프로세스개선", "데이터분석"],
    performanceScore: 87,
    dataSource: "generated",
    dataSourceLabel: "생성된 샘플 데이터"
  }
];

// Load employees from comprehensive ERP data and combine with generated data
const ERP_EMPLOYEES: Employee[] = (erpDataJson.sheets.인원마스터 || []).map(convertERPEmployeeToEmployee);
const INITIAL_EMPLOYEES: Employee[] = [...GENERATED_EMPLOYEES, ...ERP_EMPLOYEES];

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  // 직원 데이터가 변경될 때마다 통합 모듈에 동기화
  useEffect(() => {
    setEmployeeContextData(employees);
  }, [employees]);

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

  const getEmployeesByDataSource = (dataSource: "generated" | "erp" | "demo" | "massive"): Employee[] => {
    return employees.filter(emp => emp.dataSource === dataSource);
  };

  const getDataSourceSummary = () => {
    const summary: { [key: string]: { count: number; label: string } } = {};
    
    employees.forEach(emp => {
      const source = emp.dataSource || "unknown";
      if (!summary[source]) {
        summary[source] = {
          count: 0,
          label: emp.dataSourceLabel || source
        };
      }
      summary[source].count++;
    });
    
    return summary;
  };

  const value: EmployeeContextType = {
    employees,
    setEmployees,
    addEmployee,
    updateEmployee,
    getEmployeeById,
    getActiveEmployees,
    getEmployeesByDataSource,
    getDataSourceSummary,
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
