import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: "활성" | "비활성" | "잠재";
  totalOrders: number;
  totalAmount: number;
  lastContact: string;
  representative: string;
  // ERP 관련 추가 필드
  industry?: string;
  creditRating?: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB';
  paymentTerms?: number;
  contactPerson?: string;
}

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalAmount' | 'lastContact'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerByCompany: (company: string) => Customer | undefined;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// 초기 고객 데이터 (고객 관리와 ERP 데이터 통합)
const initialCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "김철수",
    company: "ABC 제조업체",
    email: "kim@abc.com",
    phone: "010-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    status: "활성",
    totalOrders: 45,
    totalAmount: 125000000,
    lastContact: "2024-01-15",
    representative: "이영희",
    industry: "제조업",
    creditRating: "AAA",
    paymentTerms: 60,
    contactPerson: "김철수"
  },
  {
    id: "CUST-002",
    name: "박영희",
    company: "XYZ 솔루션",
    email: "park@xyz.com",
    phone: "010-9876-5432",
    address: "경기도 성남시 분당구 정자로 456",
    status: "활성",
    totalOrders: 32,
    totalAmount: 89500000,
    lastContact: "2024-01-18",
    representative: "김대표",
    industry: "IT솔루션",
    creditRating: "AAA",
    paymentTerms: 45,
    contactPerson: "박영희"
  },
  {
    id: "CUST-003",
    name: "정민수",
    company: "DEF 엔지니어링",
    email: "jung@def.com",
    phone: "010-5555-7777",
    address: "인천시 연수구 컨벤시아대로 789",
    status: "잠재",
    totalOrders: 12,
    totalAmount: 34000000,
    lastContact: "2024-01-10",
    representative: "이영희",
    industry: "엔지니어링",
    creditRating: "AA",
    paymentTerms: 30,
    contactPerson: "정민수"
  },
  {
    id: "CUST-004",
    name: "최수진",
    company: "GHI 테크놀로지",
    email: "choi@ghi.com",
    phone: "010-3333-4444",
    address: "대전시 유성구 과학로 321",
    status: "비활성",
    totalOrders: 8,
    totalAmount: 15000000,
    lastContact: "2023-12-20",
    representative: "김대표",
    industry: "기술서비스",
    creditRating: "AA",
    paymentTerms: 45,
    contactPerson: "최수진"
  },
  {
    id: "CUST-005",
    name: "윤정호",
    company: "JKL 시스템즈",
    email: "yun@jkl.com",
    phone: "010-7777-8888",
    address: "부산시 해운대구 센텀로 654",
    status: "활성",
    totalOrders: 28,
    totalAmount: 76500000,
    lastContact: "2024-01-17",
    representative: "이영희",
    industry: "시스템개발",
    creditRating: "A",
    paymentTerms: 30,
    contactPerson: "윤정호"
  }
];

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  // 로컬 스토리지에서 고객 데이터 로드
  useEffect(() => {
    const savedCustomers = localStorage.getItem('erp-customers');
    if (savedCustomers) {
      try {
        const parsedCustomers = JSON.parse(savedCustomers);
        setCustomers(parsedCustomers);
      } catch (error) {
        console.error('고객 데이터 로드 실패:', error);
      }
    }
  }, []);

  // 고객 데이터 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('erp-customers', JSON.stringify(customers));
  }, [customers]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalOrders' | 'totalAmount' | 'lastContact'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      totalOrders: 0,
      totalAmount: 0,
      lastContact: new Date().toISOString().split('T')[0],
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === id ? { ...customer, ...customerData } : customer
      )
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  const getCustomerByCompany = (company: string) => {
    return customers.find(customer => customer.company === company);
  };

  return (
    <CustomerContext.Provider value={{
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomerById,
      getCustomerByCompany
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
