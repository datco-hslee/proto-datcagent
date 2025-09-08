import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { DataSourceManager, type DataWithSource, type DataSource } from '../data/dataSourceManager';
import { useCustomers } from './CustomerContext';
import { DEMO_DATA } from '../data/demoData';
import { generateDynamicERPData } from '../data/dynamicERPData';
import { comprehensiveERPData, getDataSummary } from '../data/comprehensiveERPData';
import erpDataJson from '../../DatcoDemoData2.json';

// 통합 데이터 타입 정의
export interface GlobalERPData {
  customers: any[];
  salesOrders: DataWithSource<any>[];
  productionOrders: DataWithSource<any>[];
  bomData: DataWithSource<any>[];
  inventory: DataWithSource<any>[];
  purchases: DataWithSource<any>[];
  employees: DataWithSource<any>[];
  payroll: DataWithSource<any>[];
  workInstructions: DataWithSource<any>[];
}

interface GlobalDataContextType {
  erpData: GlobalERPData;
  dataSources: DataSource[];
  selectedDataSources: string[];
  isLoading: boolean;
  
  // 데이터 소스 관리
  toggleDataSource: (sourceId: string) => void;
  selectAllDataSources: () => void;
  selectNoDataSources: () => void;
  
  // 엑셀 데이터 임포트
  importExcelData: (dataType: string, data: any[], fileName: string, fileSize: number) => void;
  
  // 필터링된 데이터 조회
  getFilteredData: <T>(data: DataWithSource<T>[]) => DataWithSource<T>[];
  
  // 데이터 통계
  getDataSourceStats: () => any;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export const GlobalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { customers } = useCustomers();
  const [erpData, setErpData] = useState<GlobalERPData>({
    customers: [],
    salesOrders: [],
    productionOrders: [],
    bomData: [],
    inventory: [],
    purchases: [],
    employees: [],
    payroll: [],
    workInstructions: []
  });
  
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dataSourceManager = DataSourceManager.getInstance();

  // 초기 데이터 로드 및 고객 데이터 변경 시 업데이트
  useEffect(() => {
    const loadInitialData = () => {
      setIsLoading(true);
      
      try {
        // 1. 자동 생성 데이터 로드
        const dynamicData = generateDynamicERPData(customers);
        const testSource = dataSourceManager.getSource('test_generated')!;
        
        // 2. 시연 데이터 로드
        const demoSource = dataSourceManager.getSource('demo_data')!;
        
        // 자동 생성 데이터를 DataWithSource로 래핑
        const wrappedSalesOrders = dynamicData.salesOrders.map((order: any) => 
          dataSourceManager.wrapWithSource(order, testSource.id)
        );
        
        const wrappedProductionOrders = dynamicData.productionOrders.map((order: any) => 
          dataSourceManager.wrapWithSource(order, testSource.id)
        );

        // 시연 데이터를 DataWithSource로 래핑
        const wrappedDemoSalesOrders = DEMO_DATA.salesOrders.map((order: any) => 
          dataSourceManager.wrapWithSource(order, demoSource.id)
        );
        
        const wrappedDemoProductionOrders = DEMO_DATA.productionOrders.map((order: any) => 
          dataSourceManager.wrapWithSource(order, demoSource.id)
        );

        const wrappedDemoBomData = DEMO_DATA.bomData.map((bom: any) => 
          dataSourceManager.wrapWithSource(bom, demoSource.id)
        );

        const wrappedDemoInventory = DEMO_DATA.inventory.map((item: any) => 
          dataSourceManager.wrapWithSource(item, demoSource.id)
        );

        const wrappedDemoPurchases = DEMO_DATA.purchases.map((purchase: any) => 
          dataSourceManager.wrapWithSource(purchase, demoSource.id)
        );

        const wrappedDemoEmployees = DEMO_DATA.employees.map((emp: any) => 
          dataSourceManager.wrapWithSource(emp, demoSource.id)
        );

        const wrappedDemoPayroll = DEMO_DATA.payroll.map((pay: any) => 
          dataSourceManager.wrapWithSource(pay, demoSource.id)
        );

        // 추가 테스트 데이터 생성
        const wrappedBomData = generateTestBOMData().map((bom: any) => 
          dataSourceManager.wrapWithSource(bom, testSource.id)
        );
        
        const wrappedInventory = generateTestInventoryData().map((item: any) => 
          dataSourceManager.wrapWithSource(item, testSource.id)
        );
        
        const wrappedPurchases = generateTestPurchaseData().map((purchase: any) => 
          dataSourceManager.wrapWithSource(purchase, testSource.id)
        );
        
        const wrappedEmployees = generateERPEmployeeData().map((employee: any) => 
          dataSourceManager.wrapWithSource(employee, testSource.id)
        );
        
        const wrappedPayroll = generateTestPayrollData().map((payroll: any) => 
          dataSourceManager.wrapWithSource(payroll, testSource.id)
        );

        setErpData({
          customers,
          salesOrders: [...wrappedSalesOrders, ...wrappedDemoSalesOrders],
          productionOrders: [...wrappedProductionOrders, ...wrappedDemoProductionOrders],
          bomData: [...wrappedBomData, ...wrappedDemoBomData],
          inventory: [...wrappedInventory, ...wrappedDemoInventory],
          purchases: [...wrappedPurchases, ...wrappedDemoPurchases],
          employees: [...wrappedEmployees, ...wrappedDemoEmployees],
          payroll: [...wrappedPayroll, ...wrappedDemoPayroll],
          workInstructions: []
        });

        // 데이터 소스 목록 업데이트
        const allSources = dataSourceManager.getAllSources();
        setDataSources(allSources);
        setSelectedDataSources(allSources.map(s => s.id));
        
      } catch (error) {
        console.error('초기 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [customers]);

  // 데이터 소스 토글
  const toggleDataSource = (sourceId: string) => {
    setSelectedDataSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const selectAllDataSources = () => {
    setSelectedDataSources(dataSources.map(s => s.id));
  };

  const selectNoDataSources = () => {
    setSelectedDataSources([]);
  };

  // 엑셀 데이터 임포트
  const importExcelData = (dataType: string, data: any[], fileName: string, fileSize: number) => {
    const importedSource = dataSourceManager.registerImportedSource(fileName, fileSize);
    
    const wrappedData = data.map((item, index) => 
      dataSourceManager.wrapWithSource(item, importedSource.id, {
        rowNumber: index + 2,
        sheetName: 'Sheet1',
        validationStatus: 'valid' as const
      })
    );

    setErpData(prev => {
      const updated = { ...prev };
      
      switch (dataType) {
        case 'salesOrders':
          updated.salesOrders = [...prev.salesOrders, ...wrappedData];
          break;
        case 'productionOrders':
          updated.productionOrders = [...prev.productionOrders, ...wrappedData];
          break;
        case 'bomData':
          updated.bomData = [...prev.bomData, ...wrappedData];
          break;
        case 'inventory':
          updated.inventory = [...prev.inventory, ...wrappedData];
          break;
        case 'purchases':
          updated.purchases = [...prev.purchases, ...wrappedData];
          break;
        case 'employees':
          updated.employees = [...prev.employees, ...wrappedData];
          break;
        case 'payroll':
          updated.payroll = [...prev.payroll, ...wrappedData];
          break;
      }
      
      return updated;
    });

    // 데이터 소스 목록 업데이트
    const allSources = dataSourceManager.getAllSources();
    setDataSources(allSources);
    setSelectedDataSources(prev => [...prev, importedSource.id]);
  };

  // 필터링된 데이터 조회 (선택된 데이터 소스만)
  const getFilteredData = <T,>(dataArray: DataWithSource<T>[]): DataWithSource<T>[] => {
    if (selectedDataSources.length === 0) return dataArray;
    
    return dataArray.filter(item => selectedDataSources.includes(item.source.id));
  };

  // 데이터 통계
  const getDataSourceStats = () => {
    const allData = [
      ...erpData.salesOrders,
      ...erpData.productionOrders,
      ...erpData.bomData,
      ...erpData.inventory,
      ...erpData.purchases,
      ...erpData.employees,
      ...erpData.payroll,
      ...erpData.workInstructions
    ];

    const bySource: Record<string, number> = {};
    allData.forEach(item => {
      bySource[item.source.id] = (bySource[item.source.id] || 0) + 1;
    });

    return {
      total: allData.length,
      bySource
    };
  };

  return (
    <GlobalDataContext.Provider value={{
      erpData,
      dataSources,
      selectedDataSources,
      isLoading,
      toggleDataSource,
      selectAllDataSources,
      selectNoDataSources,
      importExcelData,
      getFilteredData,
      getDataSourceStats
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
};

// 테스트 데이터 생성 함수들
const generateTestBOMData = () => [
  {
    id: 'BOM-001',
    productCode: 'SSM-001',
    productName: '스마트 센서 모듈',
    components: [
      { code: 'IC-001', name: '메인 프로세서', quantity: 1, unitCost: 15000 },
      { code: 'RES-001', name: '저항 세트', quantity: 10, unitCost: 500 },
      { code: 'CAP-001', name: '커패시터 세트', quantity: 5, unitCost: 800 }
    ],
    totalCost: 19000,
    status: '진행중'
  }
];

const generateTestInventoryData = () => [
  {
    id: 'INV-001',
    itemCode: 'IC-001',
    itemName: '메인 프로세서',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitCost: 15000,
    location: 'A-01-01',
    lastUpdated: new Date().toISOString()
  }
];

const generateTestPurchaseData = () => [
  {
    id: 'PO-001',
    orderNumber: 'PO-2024-001',
    supplier: '전자부품 공급사',
    items: [
      { code: 'IC-001', name: '메인 프로세서', quantity: 100, unitPrice: 15000 }
    ],
    totalAmount: 1500000,
    status: '주문완료',
    orderDate: '2024-09-01'
  }
];

const generateERPEmployeeData = () => {
  return (erpDataJson.sheets.인원마스터 || []).map((erpEmployee: any) => ({
    id: `EMP-${erpEmployee.사번}`,
    employeeNumber: erpEmployee.사번,
    name: erpEmployee.성명,
    department: erpEmployee.라인 || '생산팀',
    position: erpEmployee.직무,
    hireDate: '2023-01-01',
    salary: erpEmployee.기본시급 * 8 * 22 || 3000000,
    status: '재직중'
  }));
};

const generateTestPayrollData = () => [
  {
    id: 'PAY-001',
    employeeId: 'EMP-001',
    employeeName: '김기술',
    month: '2024-09',
    baseSalary: 4500000,
    overtime: 300000,
    bonus: 500000,
    deductions: 450000,
    netPay: 4850000
  }
];
