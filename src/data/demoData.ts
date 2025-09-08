// 닷코 시연용 데이터 - 새로운 구조화된 ERP 데이터 사용
import { comprehensiveERPData, getCustomerByCode, getItemByCode } from './comprehensiveERPData';

export const DEMO_DATA = {
  // 거래처마스터에서 고객사만 추출
  customers: comprehensiveERPData.customers
    .filter(partner => partner.구분 === '고객사')
    .map(customer => ({
      id: customer.거래처코드,
      companyName: customer.거래처명,
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      businessType: '자동차부품',
      creditRating: customer.신용등급,
      paymentTerms: customer.결제조건,
      taxId: ''
    })),

  // 수주 데이터를 salesOrders로 매핑
  salesOrders: comprehensiveERPData.salesOrders.map(order => ({
    id: order.수주번호,
    orderNumber: order.수주번호,
    customerId: order.거래처,
    customerName: getCustomerByCode(order.거래처)?.거래처명 || '',
    productName: getItemByCode(order.품목)?.품목명 || order.품목,
    productCode: order.품목,
    quantity: order.수량,
    unitPrice: order.단가,
    totalAmount: order.수량 * order.단가,
    orderDate: order.수주일,
    deliveryDate: order.납기일,
    status: '진행중',
    priority: '보통'
  })),

  // 작업지시를 productionOrders로 매핑
  productionOrders: comprehensiveERPData.workOrders.map(order => ({
    id: order.작업지시,
    orderNumber: order.작업지시,
    productName: getItemByCode(order.품목)?.품목명 || order.품목,
    productCode: order.품목,
    quantity: order.지시수량,
    plannedStartDate: order.시작예정,
    plannedEndDate: order.완료예정,
    actualStartDate: order.상태 === 'RELEASED' ? order.시작예정 : undefined,
    actualEndDate: undefined,
    status: order.상태 === 'RELEASED' ? '진행중' : '계획중',
    priority: '보통',
    workCenter: order.라인,
    assignedWorker: ''
  })),

  // BOM 데이터 매핑
  bomData: comprehensiveERPData.bom.map((bom, index) => ({
    id: `BOM-${index + 1}`,
    productCode: bom.상위품목,
    productName: getItemByCode(bom.상위품목)?.품목명 || bom.상위품목,
    componentCode: bom.하위품목,
    componentName: getItemByCode(bom.하위품목)?.품목명 || bom.하위품목,
    quantity: bom.소요량,
    unit: bom.단위,
    unitCost: 0,
    supplier: '',
    leadTime: 5
  })),

  // 재고배치를 inventory로 매핑
  inventory: comprehensiveERPData.inventoryBatches.map(item => ({
    id: item.배치,
    itemCode: item.품목,
    productName: getItemByCode(item.품목)?.품목명 || item.품목,
    currentStock: item.수량,
    minStock: getItemByCode(item.품목)?.안전재고 || 100,
    maxStock: (getItemByCode(item.품목)?.안전재고 || 100) * 3,
    unitCost: 0,
    location: `${item.창고}-${item.로케이션}`,
    lastUpdated: item.제조일자
  })),

  // 구매발주를 purchases로 매핑
  purchases: comprehensiveERPData.purchaseOrders.map(order => ({
    id: order.발주번호,
    orderNumber: order.발주번호,
    supplierId: order.공급사,
    supplierName: getCustomerByCode(order.공급사)?.거래처명 || order.공급사,
    itemCode: order.품목,
    salesOrderId: comprehensiveERPData.salesOrders.find(so => so.품목 === order.품목)?.수주번호 || '',
    quantity: order.발주수량KG || order.발주수량EA || 0,
    unitPrice: order.단가,
    totalAmount: (order.발주수량KG || order.발주수량EA || 0) * order.단가,
    orderDate: order.발주일,
    deliveryDate: order.납기일,
    status: order.상태 === 'OPEN' ? '진행중' : order.상태
  })),

  // 인원마스터를 employees로 매핑
  employees: comprehensiveERPData.employees.map(emp => ({
    id: emp.사번,
    employeeNumber: emp.사번,
    name: emp.성명,
    department: '생산부',
    position: emp.직무,
    hireDate: '2020-01-01',
    salary: emp.기본시급 * 8 * 22, // 일일 8시간 * 월 22일
    email: `${emp.사번}@company.com`,
    phone: '010-0000-0000',
    status: '재직'
  })),

  // 급여 데이터 생성 (인원마스터 기반)
  payroll: comprehensiveERPData.employees.map(emp => ({
    id: `PAY-${emp.사번}-202509`,
    employeeId: emp.사번,
    employeeName: emp.성명,
    month: '2025-09',
    baseSalary: emp.기본시급 * 8 * 22,
    overtime: emp.잔업시급 * 10, // 월 10시간 잔업 가정
    bonus: 0,
    deductions: (emp.기본시급 * 8 * 22) * 0.1, // 10% 공제
    netPay: (emp.기본시급 * 8 * 22) + (emp.잔업시급 * 10) - ((emp.기본시급 * 8 * 22) * 0.1)
  }))
};

// 시연 데이터 통계
export const DEMO_DATA_STATS = {
  customers: DEMO_DATA.customers.length,
  salesOrders: DEMO_DATA.salesOrders.length,
  productionOrders: DEMO_DATA.productionOrders.length,
  bomData: DEMO_DATA.bomData.length,
  inventory: DEMO_DATA.inventory.length,
  purchases: DEMO_DATA.purchases.length,
  employees: DEMO_DATA.employees.length,
  payroll: DEMO_DATA.payroll.length,
  totalRecords: Object.values(DEMO_DATA).reduce((sum, arr) => sum + arr.length, 0),
  totalSalesAmount: DEMO_DATA.salesOrders.reduce((sum, order) => sum + order.totalAmount, 0),
  totalPurchaseAmount: DEMO_DATA.purchases.reduce((sum, order) => sum + order.totalAmount, 0)
};
