// 대량 ERP 데모 데이터 생성 시스템 (3-6개월치)
// 완전한 비즈니스 플로우: 영업→구매→생산→재고→납품→인사/급여→회계

// ==================== 인터페이스 정의 ====================

export interface Customer {
  id: string;
  name: string;
  industry: string;
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB';
  paymentTerms: number; // 일 단위
  address: string;
  contactPerson: string;
  phone: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
  standardCost: number; // 표준원가
  leadTime: number; // 생산 리드타임 (일)
  bomItems: BOMItem[];
}

export interface BOMItem {
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: Date;
  requestedDeliveryDate: Date;
  confirmedDeliveryDate: Date;
  items: SalesOrderItem[];
  totalAmount: number;
  status: 'quotation' | 'confirmed' | 'in_production' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  salesPerson: string;
  notes: string;
}

export interface SalesOrderItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  requestedDate: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate: Date | null;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'completed';
  urgencyLevel: 'normal' | 'urgent' | 'emergency';
  additionalCost: number; // 긴급 조달시 추가 비용
}

export interface PurchaseOrderItem {
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface MaterialInbound {
  id: string;
  purchaseOrderId: string;
  materialCode: string;
  materialName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  inboundDate: Date;
  lotNumber: string;
  expiryDate: Date | null;
  qualityStatus: 'passed' | 'pending' | 'failed' | 'quarantine';
  qualityCheckDate: Date;
  qualityCheckBy: string;
  warehouseLocation: string;
  currentStock: number;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  salesOrderId: string;
  productId: string;
  productCode: string;
  productName: string;
  plannedQuantity: number;
  actualQuantity: number;
  defectQuantity: number;
  reworkQuantity: number;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  status: 'planned' | 'released' | 'in_progress' | 'completed' | 'partially_completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  workOrders: WorkOrder[];
}

export interface WorkOrder {
  id: string;
  productionOrderId: string;
  operationSequence: number;
  operationName: string;
  workCenterId: string;
  workCenterName: string;
  plannedStartTime: Date;
  plannedEndTime: Date;
  actualStartTime: Date | null;
  actualEndTime: Date | null;
  plannedQuantity: number;
  actualQuantity: number;
  defectQuantity: number;
  workerId: string;
  workerName: string;
  shiftId: string;
  status: 'planned' | 'started' | 'completed' | 'paused' | 'cancelled';
  materialsConsumed: MaterialConsumption[];
  qualityCheckResults: QualityCheck[];
}

export interface MaterialConsumption {
  materialCode: string;
  materialName: string;
  lotNumber: string;
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
  consumptionTime: Date;
  warehouseLocation: string;
}

export interface QualityCheck {
  id: string;
  workOrderId: string;
  checkType: 'incoming' | 'in_process' | 'final' | 'outgoing';
  checkDate: Date;
  checkBy: string;
  quantityChecked: number;
  quantityPassed: number;
  quantityFailed: number;
  defectCodes: string[];
  corrective_action: string;
  status: 'passed' | 'failed' | 'rework_required';
}

export interface InventoryMovement {
  id: string;
  materialCode: string;
  materialName: string;
  movementType: 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'return';
  quantity: number;
  unit: string;
  fromLocation: string;
  toLocation: string;
  movementDate: Date;
  referenceType: 'purchase' | 'production' | 'sales' | 'adjustment';
  referenceId: string;
  lotNumber: string;
  reason: string;
  authorizedBy: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  salesOrderId: string;
  customerId: string;
  customerName: string;
  plannedShipDate: Date;
  actualShipDate: Date;
  plannedDeliveryDate: Date;
  actualDeliveryDate: Date | null;
  items: ShipmentItem[];
  driverName: string;
  vehicleNumber: string;
  trackingNumber: string;
  shippingCost: number;
  status: 'planned' | 'picked' | 'shipped' | 'in_transit' | 'delivered' | 'returned';
  deliveryAddress: string;
  deliveryNotes: string;
}

export interface ShipmentItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  lotNumbers: string[];
  productionOrderIds: string[];
}

export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  department: string;
  position: string;
  jobGrade: string;
  hireDate: Date;
  baseSalary: number;
  hourlyRate: number;
  overtimeRate: number;
  nightShiftRate: number;
  weekendRate: number;
  holidayRate: number;
  status: 'active' | 'inactive' | 'terminated';
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: Date;
  shiftId: string;
  shiftName: string;
  plannedStartTime: Date;
  plannedEndTime: Date;
  actualCheckIn: Date | null;
  actualCheckOut: Date | null;
  regularHours: number;
  overtimeHours: number;
  nightShiftHours: number;
  weekendHours: number;
  holidayHours: number;
  breakTime: number;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'sick' | 'vacation';
  notes: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  payPeriod: string; // YYYY-MM
  payDate: Date;
  baseSalary: number;
  regularPay: number;
  overtimePay: number;
  nightShiftPay: number;
  weekendPay: number;
  holidayPay: number;
  bonuses: number;
  allowances: number;
  grossPay: number;
  incomeTax: number;
  nationalInsurance: number;
  healthInsurance: number;
  pensionContribution: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
}

export interface AccountingEntry {
  id: string;
  entryNumber: string;
  date: Date;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  referenceType: 'sales' | 'purchase' | 'production' | 'payroll' | 'inventory' | 'depreciation' | 'adjustment';
  referenceId: string;
  department: string;
  costCenter: string;
  createdBy: string;
  approvedBy: string;
  status: 'draft' | 'posted' | 'reversed';
}

export interface FinancialReport {
  id: string;
  reportType: 'income_statement' | 'balance_sheet' | 'cash_flow';
  period: string; // YYYY-MM
  reportDate: Date;
  data: FinancialData[];
}

export interface FinancialData {
  accountCode: string;
  accountName: string;
  amount: number;
  percentage?: number;
}

// ==================== 기준 데이터 ====================

const CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'ABC 제조업체',
    industry: '제조업',
    creditRating: 'AAA',
    paymentTerms: 60,
    address: '서울시 강남구 테헤란로 123',
    contactPerson: '김철수',
    phone: '010-1234-5678'
  },
  {
    id: 'CUST-002',
    name: 'XYZ 솔루션',
    industry: 'IT솔루션',
    creditRating: 'AAA',
    paymentTerms: 45,
    address: '경기도 성남시 분당구 정자로 456',
    contactPerson: '박영희',
    phone: '010-9876-5432'
  },
  {
    id: 'CUST-003',
    name: 'DEF 엔지니어링',
    industry: '엔지니어링',
    creditRating: 'AA',
    paymentTerms: 30,
    address: '인천시 연수구 컨벤시아대로 789',
    contactPerson: '정민수',
    phone: '010-5555-7777'
  },
  {
    id: 'CUST-004',
    name: 'GHI 테크놀로지',
    industry: '기술서비스',
    creditRating: 'AA',
    paymentTerms: 45,
    address: '대전시 유성구 과학로 321',
    contactPerson: '최수진',
    phone: '010-3333-4444'
  },
  {
    id: 'CUST-005',
    name: 'JKL 시스템즈',
    industry: '시스템개발',
    creditRating: 'A',
    paymentTerms: 30,
    address: '부산시 해운대구 센텀로 654',
    contactPerson: '윤정호',
    phone: '010-7777-8888'
  }
];

const SUPPLIERS = [
  { id: 'SUP-001', name: '대창공업', reliability: 'high', leadTime: 3, emergencyAvailable: true, priceIncrease: 25 },
  { id: 'SUP-002', name: '한국정밀', reliability: 'high', leadTime: 5, emergencyAvailable: true, priceIncrease: 15 },
  { id: 'SUP-003', name: '동양금속', reliability: 'medium', leadTime: 7, emergencyAvailable: false, priceIncrease: 0 },
  { id: 'SUP-004', name: '모터텍', reliability: 'high', leadTime: 10, emergencyAvailable: true, priceIncrease: 30 },
  { id: 'SUP-005', name: '플라스틱코리아', reliability: 'medium', leadTime: 5, emergencyAvailable: false, priceIncrease: 0 }
];

const MATERIALS = [
  { code: 'MAT-001', name: '스틸 레일 원재료', unitPrice: 15000, supplier: 'SUP-001', category: '금속' },
  { code: 'MAT-002', name: '알루미늄 프레임 소재', unitPrice: 25000, supplier: 'SUP-002', category: '금속' },
  { code: 'MAT-003', name: '플라스틱 커버 소재', unitPrice: 8000, supplier: 'SUP-005', category: '플라스틱' },
  { code: 'MAT-004', name: '볼트 및 너트 세트', unitPrice: 500, supplier: 'SUP-001', category: '체결재' },
  { code: 'MAT-005', name: '전동 모터 어셈블리', unitPrice: 85000, supplier: 'SUP-004', category: '전자부품' },
  { code: 'MAT-006', name: '베어링 세트', unitPrice: 8500, supplier: 'SUP-002', category: '기계부품' },
  { code: 'MAT-007', name: '스프링 세트', unitPrice: 3500, supplier: 'SUP-001', category: '기계부품' },
  { code: 'MAT-008', name: '전선 하네스', unitPrice: 12000, supplier: 'SUP-004', category: '전자부품' },
  { code: 'MAT-009', name: '고무 패킹', unitPrice: 2500, supplier: 'SUP-005', category: '고무' },
  { code: 'MAT-010', name: '윤활유', unitPrice: 15000, supplier: 'SUP-003', category: '화학' }
];

const PRODUCTS: Product[] = [
  {
    id: 'PROD-001',
    code: 'EV9-SR-001',
    name: 'EV9 전기차용 시트 레일',
    category: '시트부품',
    unitPrice: 55000,
    unit: 'EA',
    standardCost: 45000,
    leadTime: 3,
    bomItems: [
      { materialCode: 'MAT-001', materialName: '스틸 레일 원재료', quantity: 2, unit: 'EA' },
      { materialCode: 'MAT-004', materialName: '볼트 및 너트 세트', quantity: 1, unit: 'SET' },
      { materialCode: 'MAT-006', materialName: '베어링 세트', quantity: 1, unit: 'SET' },
      { materialCode: 'MAT-007', materialName: '스프링 세트', quantity: 1, unit: 'SET' }
    ]
  },
  {
    id: 'PROD-002',
    code: 'GV70-SF-002',
    name: 'GV70 SUV 시트 프레임',
    category: '시트부품',
    unitPrice: 85000,
    unit: 'EA',
    standardCost: 63750,
    leadTime: 4,
    bomItems: [
      { materialCode: 'MAT-002', materialName: '알루미늄 프레임 소재', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-004', materialName: '볼트 및 너트 세트', quantity: 2, unit: 'SET' },
      { materialCode: 'MAT-009', materialName: '고무 패킹', quantity: 4, unit: 'EA' }
    ]
  },
  {
    id: 'PROD-003',
    code: 'IONIQ6-DH-003',
    name: '아이오닉6 도어 힌지',
    category: '도어부품',
    unitPrice: 32000,
    unit: 'EA',
    standardCost: 24000,
    leadTime: 2,
    bomItems: [
      { materialCode: 'MAT-001', materialName: '스틸 레일 원재료', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-004', materialName: '볼트 및 너트 세트', quantity: 1, unit: 'SET' },
      { materialCode: 'MAT-010', materialName: '윤활유', quantity: 0.1, unit: 'L' }
    ]
  },
  {
    id: 'PROD-004',
    code: 'PREM-SA-004',
    name: '프리미엄 시트 어셈블리',
    category: '시트어셈블리',
    unitPrice: 180000,
    unit: 'EA',
    standardCost: 155000,
    leadTime: 5,
    bomItems: [
      { materialCode: 'MAT-002', materialName: '알루미늄 프레임 소재', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-005', materialName: '전동 모터 어셈블리', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-008', materialName: '전선 하네스', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-003', materialName: '플라스틱 커버 소재', quantity: 2, unit: 'EA' }
    ]
  },
  {
    id: 'PROD-005',
    code: 'ELEC-SM-005',
    name: '전동 시트 모터',
    category: '전동부품',
    unitPrice: 150000,
    unit: 'EA',
    standardCost: 125000,
    leadTime: 4,
    bomItems: [
      { materialCode: 'MAT-005', materialName: '전동 모터 어셈블리', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-008', materialName: '전선 하네스', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-003', materialName: '플라스틱 커버 소재', quantity: 1, unit: 'EA' }
    ]
  }
];

const EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    employeeNumber: 'E2021001',
    name: '김철수',
    department: '생산부',
    position: '생산팀장',
    jobGrade: 'M2',
    hireDate: new Date('2021-03-15'),
    baseSalary: 4500000,
    hourlyRate: 21600,
    overtimeRate: 32400,
    nightShiftRate: 25920,
    weekendRate: 43200,
    holidayRate: 64800,
    status: 'active'
  },
  {
    id: 'EMP-002',
    employeeNumber: 'E2022005',
    name: '이영희',
    department: '생산부',
    position: '생산작업자',
    jobGrade: 'S3',
    hireDate: new Date('2022-01-10'),
    baseSalary: 3200000,
    hourlyRate: 15400,
    overtimeRate: 23100,
    nightShiftRate: 18480,
    weekendRate: 30800,
    holidayRate: 46200,
    status: 'active'
  },
  {
    id: 'EMP-003',
    employeeNumber: 'E2020012',
    name: '박민수',
    department: '품질부',
    position: '품질검사원',
    jobGrade: 'S4',
    hireDate: new Date('2020-09-01'),
    baseSalary: 3500000,
    hourlyRate: 16800,
    overtimeRate: 25200,
    nightShiftRate: 20160,
    weekendRate: 33600,
    holidayRate: 50400,
    status: 'active'
  },
  {
    id: 'EMP-004',
    employeeNumber: 'E2023001',
    name: '정수진',
    department: '생산부',
    position: '생산작업자',
    jobGrade: 'S2',
    hireDate: new Date('2023-02-01'),
    baseSalary: 3200000,
    hourlyRate: 15400,
    overtimeRate: 23100,
    nightShiftRate: 18480,
    weekendRate: 30800,
    holidayRate: 46200,
    status: 'active'
  },
  {
    id: 'EMP-005',
    employeeNumber: 'E2021008',
    name: '최영호',
    department: '생산부',
    position: '생산반장',
    jobGrade: 'S5',
    hireDate: new Date('2021-06-15'),
    baseSalary: 3800000,
    hourlyRate: 18300,
    overtimeRate: 27450,
    nightShiftRate: 21960,
    weekendRate: 36600,
    holidayRate: 54900,
    status: 'active'
  },
  {
    id: 'EMP-006',
    employeeNumber: 'E2022010',
    name: '김영수',
    department: '구매부',
    position: '구매담당자',
    jobGrade: 'S4',
    hireDate: new Date('2022-04-01'),
    baseSalary: 3600000,
    hourlyRate: 17300,
    overtimeRate: 25950,
    nightShiftRate: 20760,
    weekendRate: 34600,
    holidayRate: 51900,
    status: 'active'
  },
  {
    id: 'EMP-007',
    employeeNumber: 'E2021015',
    name: '이미경',
    department: '영업부',
    position: '영업대표',
    jobGrade: 'M1',
    hireDate: new Date('2021-08-01'),
    baseSalary: 4200000,
    hourlyRate: 20200,
    overtimeRate: 30300,
    nightShiftRate: 24240,
    weekendRate: 40400,
    holidayRate: 60600,
    status: 'active'
  },
  {
    id: 'EMP-008',
    employeeNumber: 'E2023005',
    name: '송현우',
    department: '품질부',
    position: '품질관리자',
    jobGrade: 'S5',
    hireDate: new Date('2023-01-15'),
    baseSalary: 3800000,
    hourlyRate: 18300,
    overtimeRate: 27450,
    nightShiftRate: 21960,
    weekendRate: 36600,
    holidayRate: 54900,
    status: 'active'
  }
];

const WORK_CENTERS = [
  { id: 'WC-001', name: '레일 가공 라인', efficiency: 95 },
  { id: 'WC-002', name: '프레임 용접 라인', efficiency: 92 },
  { id: 'WC-003', name: '어셈블리 라인 1', efficiency: 88 },
  { id: 'WC-004', name: '어셈블리 라인 2', efficiency: 90 },
  { id: 'WC-005', name: '검사 및 포장 라인', efficiency: 98 }
];

const SHIFTS = [
  { id: 'SHIFT-001', name: '주간 정규', startTime: '08:00', endTime: '17:00', type: 'regular' },
  { id: 'SHIFT-002', name: '야간 정규', startTime: '18:00', endTime: '03:00', type: 'night' },
  { id: 'SHIFT-003', name: '주말 특근', startTime: '09:00', endTime: '18:00', type: 'weekend' },
  { id: 'SHIFT-004', name: '긴급 연장', startTime: '17:00', endTime: '21:00', type: 'overtime' }
];

// ==================== 유틸리티 함수 ====================

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

const generateWorkingDays = (startDate: Date, endDate: Date): Date[] => {
  return generateDateRange(startDate, endDate).filter(date => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // 월-금
  });
};

const generateLotNumber = (date: Date, materialCode: string): string => {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${materialCode}-${dateStr}-${randomNum}`;
};

const addBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() >= 1 && result.getDay() <= 5) {
      addedDays++;
    }
  }
  
  return result;
};

// ==================== 데이터 생성 기간 설정 ====================

const DATA_START_DATE = new Date('2024-07-01');
const DATA_END_DATE = new Date('2025-09-30');
const ALL_DATES = generateDateRange(DATA_START_DATE, DATA_END_DATE);
const WORKING_DAYS = generateWorkingDays(DATA_START_DATE, DATA_END_DATE);

// ==================== 1. 영업 주문 데이터 생성 ====================

export const generateSalesOrders = (): SalesOrder[] => {
  const salesOrders: SalesOrder[] = [];
  let orderCounter = 1;

  // 매일 8-20개 주문 생성 (12개월간)
  WORKING_DAYS.forEach((date, index) => {
    if (Math.random() < 0.85) { // 85% 확률로 주문 발생
      const customer = getRandomElement(CUSTOMERS);
      const salesPerson = getRandomElement(EMPLOYEES.filter(e => e.department === '영업부'));
      const orderItems: SalesOrderItem[] = [];
      
      // 1-5개 제품 주문 (더 많은 아이템)
      const itemCount = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < itemCount; i++) {
        const product = getRandomElement(PRODUCTS);
        const quantity = Math.floor(Math.random() * 50) + 10; // 10-60개 (현실적 수량)
        const requestedDate = addBusinessDays(date, product.leadTime + Math.floor(Math.random() * 7));
        
        orderItems.push({
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          quantity,
          unit: product.unit,
          unitPrice: product.unitPrice,
          totalPrice: quantity * product.unitPrice,
          requestedDate
        });
      }
      
      const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const maxRequestedDate = new Date(Math.max(...orderItems.map(item => item.requestedDate.getTime())));
      const confirmedDeliveryDate = addBusinessDays(maxRequestedDate, Math.floor(Math.random() * 3)); // 0-3일 지연
      
      const status = index < WORKING_DAYS.length * 0.9 ? 
        (Math.random() < 0.95 ? 'delivered' : 'shipped') : 
        (Math.random() < 0.8 ? 'in_production' : 'confirmed');

      salesOrders.push({
        id: `SO-${orderCounter.toString().padStart(6, '0')}`,
        orderNumber: `SO-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${orderCounter.toString().padStart(4, '0')}`,
        customerId: customer.id,
        customerName: customer.name,
        orderDate: date,
        requestedDeliveryDate: maxRequestedDate,
        confirmedDeliveryDate,
        items: orderItems,
        totalAmount,
        status,
        salesPerson: salesPerson.name,
        notes: Math.random() < 0.3 ? '긴급 주문 요청' : ''
      });
      
      orderCounter++;
    }
  });

  return salesOrders;
};

// ==================== 2. 구매 주문 데이터 생성 ====================

export const generatePurchaseOrders = (salesOrders: SalesOrder[]): PurchaseOrder[] => {
  const purchaseOrders: PurchaseOrder[] = [];
  let orderCounter = 1;
  
  // 영업 주문 기반으로 필요한 자재 계산
  salesOrders.forEach(so => {
    const poDate = new Date(so.orderDate);
    poDate.setDate(poDate.getDate() - Math.floor(Math.random() * 10) - 5); // 영업주문 5-15일 전 구매
    
    const materialNeeds = new Map<string, number>();
    
    // 각 제품의 BOM에 따라 필요 자재 계산
    so.items.forEach(item => {
      const product = PRODUCTS.find(p => p.id === item.productId)!;
      product.bomItems.forEach(bomItem => {
        const totalNeeded = bomItem.quantity * item.quantity;
        materialNeeds.set(bomItem.materialCode, 
          (materialNeeds.get(bomItem.materialCode) || 0) + totalNeeded);
      });
    });
    
    // 공급업체별로 구매주문 그룹화
    const supplierGroups = new Map<string, {materialCode: string, quantity: number}[]>();
    
    materialNeeds.forEach((quantity, materialCode) => {
      const material = MATERIALS.find(m => m.code === materialCode)!;
      const supplier = material.supplier;
      
      if (!supplierGroups.has(supplier)) {
        supplierGroups.set(supplier, []);
      }
      
      // 안전재고 고려하여 20-50% 추가 주문 (더 현실적)
      const safetyStock = Math.floor(quantity * (0.2 + Math.random() * 0.3));
      const orderQuantity = quantity + safetyStock;
      
      supplierGroups.get(supplier)!.push({
        materialCode,
        quantity: orderQuantity
      });
    });
    
    // 공급업체별 구매주문 생성
    supplierGroups.forEach((materials, supplierId) => {
      const supplier = SUPPLIERS.find(s => s.id === supplierId)!;
      const urgencyLevel = so.notes.includes('긴급') ? 'emergency' : 'normal';
      const isUrgent = urgencyLevel === 'emergency';
      
      const items: PurchaseOrderItem[] = materials.map(({materialCode, quantity}) => {
        const material = MATERIALS.find(m => m.code === materialCode)!;
        const unitPrice = isUrgent && supplier.emergencyAvailable ? 
          material.unitPrice * (1 + supplier.priceIncrease / 100) : 
          material.unitPrice;
        
        return {
          materialCode,
          materialName: material.name,
          quantity,
          unit: 'EA',
          unitPrice,
          totalPrice: quantity * unitPrice
        };
      });
      
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const additionalCost = isUrgent ? totalAmount * 0.05 : 0; // 긴급 배송비 5%
      
      const expectedDeliveryDate = addBusinessDays(poDate, 
        isUrgent ? Math.ceil(supplier.leadTime / 2) : supplier.leadTime);
      
      const actualDeliveryDate = Math.random() < 0.9 ? 
        addBusinessDays(expectedDeliveryDate, Math.floor(Math.random() * 3) - 1) : // 90% 정시
        addBusinessDays(expectedDeliveryDate, Math.floor(Math.random() * 5) + 1); // 10% 지연
      
      purchaseOrders.push({
        id: `PO-${orderCounter.toString().padStart(6, '0')}`,
        orderNumber: `PO-${poDate.getFullYear()}${(poDate.getMonth() + 1).toString().padStart(2, '0')}-${orderCounter.toString().padStart(4, '0')}`,
        supplierId,
        supplierName: supplier.name,
        orderDate: poDate,
        expectedDeliveryDate,
        actualDeliveryDate,
        items,
        totalAmount: totalAmount + additionalCost,
        status: poDate < new Date() ? 'completed' : 'confirmed',
        urgencyLevel,
        additionalCost
      });
      
      orderCounter++;
    });
  });
  
  return purchaseOrders;
};

// ==================== 3. 자재 입고 데이터 생성 ====================

export const generateMaterialInbounds = (purchaseOrders: PurchaseOrder[]): MaterialInbound[] => {
  const inbounds: MaterialInbound[] = [];
  let inboundCounter = 1;
  
  purchaseOrders.forEach(po => {
    if (po.status === 'completed' && po.actualDeliveryDate) {
      po.items.forEach(item => {

        const qualityChecker = getRandomElement(EMPLOYEES.filter(e => e.department === '품질부'));
        const qualityCheckDate = new Date(po.actualDeliveryDate!);
        qualityCheckDate.setHours(qualityCheckDate.getHours() + Math.floor(Math.random() * 4) + 1);
        
        // 품질 상태 결정 (95% 합격률)
        const qualityStatus = Math.random() < 0.95 ? 'passed' : 
                             Math.random() < 0.8 ? 'pending' : 'failed';
        
        inbounds.push({
          id: `IN-${inboundCounter.toString().padStart(6, '0')}`,
          purchaseOrderId: po.id,
          materialCode: item.materialCode,
          materialName: item.materialName,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalAmount: item.totalPrice,
          inboundDate: po.actualDeliveryDate!,
          lotNumber: generateLotNumber(po.actualDeliveryDate!, item.materialCode),
          expiryDate: null, // 대부분 비소모품
          qualityStatus,
          qualityCheckDate,
          qualityCheckBy: qualityChecker.name,
          warehouseLocation: `창고-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${Math.floor(Math.random() * 20) + 1}`,
          currentStock: item.quantity // 초기 재고
        });
        
        inboundCounter++;
      });
    }
  });
  
  return inbounds;
};

// ==================== 4. 생산 주문 및 작업 지시 생성 ====================

export const generateProductionOrders = (salesOrders: SalesOrder[]): ProductionOrder[] => {
  const productionOrders: ProductionOrder[] = [];
  let orderCounter = 1;
  
  salesOrders.forEach(so => {
    if (['confirmed', 'in_production', 'ready', 'shipped', 'delivered'].includes(so.status)) {
      so.items.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId)!;
        const plannedStartDate = new Date(so.orderDate);
        plannedStartDate.setDate(plannedStartDate.getDate() + Math.floor(Math.random() * 7) + 3); // 3-10일 후 시작
        
        const plannedEndDate = addBusinessDays(plannedStartDate, product.leadTime);
        const actualStartDate = Math.random() < 0.95 ? 
          addBusinessDays(plannedStartDate, Math.floor(Math.random() * 3) - 1) : null; // 95% 시작
        
        const actualEndDate = actualStartDate ? 
          addBusinessDays(actualStartDate, product.leadTime + Math.floor(Math.random() * 2) - 1) : null;
        
        // 생산 수량 (계획 대비 95-105% 달성)
        const plannedQuantity = item.quantity;
        const actualQuantity = actualStartDate ? 
          Math.floor(plannedQuantity * (0.95 + Math.random() * 0.1)) : 0;
        const defectQuantity = Math.floor(actualQuantity * (Math.random() * 0.03)); // 0-3% 불량
        const reworkQuantity = Math.floor(defectQuantity * 0.5); // 불량의 50% 재작업
        
        const status = !actualStartDate ? 'planned' :
                      !actualEndDate ? 'in_progress' :
                      so.status === 'delivered' ? 'completed' : 'completed';
        
        const priority = so.notes.includes('긴급') ? 'urgent' : 'normal';
        
        // 작업 지시 생성
        const workOrders: WorkOrder[] = [];
        const operations = ['가공', '용접', '조립', '검사', '포장'];
        
        operations.forEach((opName, index) => {
          const workCenter = getRandomElement(WORK_CENTERS);
          const opStartTime = actualStartDate ? 
            new Date(actualStartDate.getTime() + (index * 8 * 60 * 60 * 1000)) : // 8시간 간격
            new Date(plannedStartDate.getTime() + (index * 8 * 60 * 60 * 1000));
          
          const opEndTime = new Date(opStartTime.getTime() + (6 * 60 * 60 * 1000)); // 6시간 작업
          const worker = getRandomElement(EMPLOYEES.filter(e => e.department === '생산부'));
          const shift = getRandomElement(SHIFTS);
          
          workOrders.push({
            id: `WO-${orderCounter.toString().padStart(6, '0')}-${(index + 1).toString().padStart(2, '0')}`,
            productionOrderId: `PRO-${orderCounter.toString().padStart(6, '0')}`,
            operationSequence: index + 1,
            operationName: opName,
            workCenterId: workCenter.id,
            workCenterName: workCenter.name,
            plannedStartTime: opStartTime,
            plannedEndTime: opEndTime,
            actualStartTime: actualStartDate ? opStartTime : null,
            actualEndTime: actualStartDate ? opEndTime : null,
            plannedQuantity,
            actualQuantity: actualStartDate ? actualQuantity : 0,
            defectQuantity: index === operations.length - 1 ? defectQuantity : 0, // 마지막 공정에서만 불량 발생
            workerId: worker.id,
            workerName: worker.name,
            shiftId: shift.id,
            status: actualStartDate ? 'completed' : 'planned',
            materialsConsumed: [], // 나중에 추가
            qualityCheckResults: [] // 나중에 추가
          });
        });
        
        productionOrders.push({
          id: `PRO-${orderCounter.toString().padStart(6, '0')}`,
          orderNumber: `PRO-${plannedStartDate.getFullYear()}${(plannedStartDate.getMonth() + 1).toString().padStart(2, '0')}-${orderCounter.toString().padStart(4, '0')}`,
          salesOrderId: so.id,
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          plannedQuantity,
          actualQuantity,
          defectQuantity,
          reworkQuantity,
          plannedStartDate,
          plannedEndDate,
          actualStartDate,
          actualEndDate,
          status,
          priority,
          workOrders
        });
        
        orderCounter++;
      });
    }
  });
  
  return productionOrders;
};

// ==================== 5. 자재 소모 데이터 생성 ====================

export const generateMaterialConsumptions = (
  productionOrders: ProductionOrder[], 
  materialInbounds: MaterialInbound[]
): ProductionOrder[] => {
  
  const updatedProductionOrders = productionOrders.map(po => {
    if (po.status === 'completed' || po.status === 'in_progress') {
      const product = PRODUCTS.find(p => p.id === po.productId)!;
      
      // 첫 번째 작업 지시(가공)에서 자재 소모
      const firstWorkOrder = po.workOrders[0];
      const materialsConsumed: MaterialConsumption[] = [];
      
      product.bomItems.forEach(bomItem => {
        // 해당 자재의 재고 중에서 FIFO로 소모
        const availableStock = materialInbounds
          .filter(inbound => 
            inbound.materialCode === bomItem.materialCode && 
            inbound.qualityStatus === 'passed' &&
            inbound.inboundDate <= (po.actualStartDate || po.plannedStartDate) &&
            inbound.currentStock > 0
          )
          .sort((a, b) => a.inboundDate.getTime() - b.inboundDate.getTime());
        
        const plannedQuantity = bomItem.quantity * po.plannedQuantity;
        const actualQuantity = bomItem.quantity * po.actualQuantity;
        let remainingQuantity = actualQuantity;
        
        // FIFO: 가장 오래된 재고부터 순서대로 사용
        for (const stockItem of availableStock) {
          if (remainingQuantity <= 0) break;
          
          const quantityToConsume = Math.min(remainingQuantity, stockItem.currentStock);
          
          if (quantityToConsume > 0) {
            materialsConsumed.push({
              materialCode: bomItem.materialCode,
              materialName: bomItem.materialName,
              lotNumber: stockItem.lotNumber,
              plannedQuantity: quantityToConsume === actualQuantity ? plannedQuantity : (plannedQuantity * quantityToConsume / actualQuantity),
              actualQuantity: quantityToConsume,
              unit: bomItem.unit,
              consumptionTime: firstWorkOrder.actualStartTime || firstWorkOrder.plannedStartTime,
              warehouseLocation: stockItem.warehouseLocation
            });
            
            // 재고 차감
            stockItem.currentStock -= quantityToConsume;
            remainingQuantity -= quantityToConsume;
          }
        }
        
        // 재고 부족 시 부족분 기록 (실제 생산에서는 생산 중단 또는 대체재 사용)
        if (remainingQuantity > 0) {
          // 부족분에 대해서는 가상의 소모 기록 생성 (실제로는 생산 지연 발생)
          materialsConsumed.push({
            materialCode: bomItem.materialCode,
            materialName: bomItem.materialName + ' (부족분)',
            lotNumber: 'SHORTAGE-' + Date.now(),
            plannedQuantity: plannedQuantity * remainingQuantity / actualQuantity,
            actualQuantity: remainingQuantity,
            unit: bomItem.unit,
            consumptionTime: firstWorkOrder.actualStartTime || firstWorkOrder.plannedStartTime,
            warehouseLocation: '재고부족'
          });
          
          // 생산 수량 조정 (재고 부족으로 인한 실제 생산량 감소)
          const shortageRatio = remainingQuantity / actualQuantity;
          po.actualQuantity = Math.max(0, po.actualQuantity * (1 - shortageRatio));
          
          // 생산 상태를 부분 완료로 변경
          if (po.status === 'completed' && shortageRatio > 0.1) {
            po.status = 'partially_completed';
          }
        }
      });
      
      firstWorkOrder.materialsConsumed = materialsConsumed;
    }
    
    return po;
  });
  
  return updatedProductionOrders;
};

// ==================== 6. 출하 및 납품 데이터 생성 ====================

export const generateShipments = (
  salesOrders: SalesOrder[], 
  productionOrders: ProductionOrder[]
): Shipment[] => {
  const shipments: Shipment[] = [];
  let shipmentCounter = 1;
  
  salesOrders.forEach(so => {
    if (['ready', 'shipped', 'delivered'].includes(so.status)) {
      const relatedProductions = productionOrders.filter(po => po.salesOrderId === so.id);
      const completedProductions = relatedProductions.filter(po => po.status === 'completed');
      
      if (completedProductions.length > 0) {
        const plannedShipDate = new Date(so.confirmedDeliveryDate);
        plannedShipDate.setDate(plannedShipDate.getDate() - 1); // 납기 1일 전 출하
        
        const actualShipDate = Math.random() < 0.85 ? plannedShipDate : 
          addBusinessDays(plannedShipDate, Math.floor(Math.random() * 3) + 1); // 15% 지연
        
        const actualDeliveryDate = so.status === 'delivered' ? 
          addBusinessDays(actualShipDate, 1) : null; // 출하 다음날 배송
        
        const items: ShipmentItem[] = completedProductions.map(po => ({
          productId: po.productId,
          productCode: po.productCode,
          productName: po.productName,
          quantity: po.actualQuantity - po.defectQuantity,
          unit: 'EA',
          lotNumbers: [`LOT-${po.orderNumber}`],
          productionOrderIds: [po.id]
        }));
        
        const drivers = ['김운송', '이배달', '박물류', '최급송', '정배송'];
        const shippingCost = Math.floor(Math.random() * 100000) + 50000; // 5-15만원
        
        shipments.push({
          id: `SHIP-${shipmentCounter.toString().padStart(6, '0')}`,
          shipmentNumber: `SHIP-${actualShipDate.getFullYear()}${(actualShipDate.getMonth() + 1).toString().padStart(2, '0')}-${shipmentCounter.toString().padStart(4, '0')}`,
          salesOrderId: so.id,
          customerId: so.customerId,
          customerName: so.customerName,
          plannedShipDate,
          actualShipDate,
          plannedDeliveryDate: so.confirmedDeliveryDate,
          actualDeliveryDate,
          items,
          driverName: getRandomElement(drivers),
          vehicleNumber: `${Math.floor(Math.random() * 100)}허${Math.floor(Math.random() * 10000)}`,
          trackingNumber: `TRK${Date.now().toString().slice(-8)}`,
          shippingCost,
          status: so.status === 'delivered' ? 'delivered' : 'shipped',
          deliveryAddress: CUSTOMERS.find(c => c.id === so.customerId)!.address,
          deliveryNotes: actualDeliveryDate && actualDeliveryDate <= so.confirmedDeliveryDate ? 
            '정시 배송 완료' : '배송 지연'
        });
        
        shipmentCounter++;
      }
    }
  });
  
  return shipments;
};



// ==================== 7. 근태 데이터 생성 ====================

export const generateAttendanceRecords = (productionOrders: ProductionOrder[]): Attendance[] => {
  const attendanceRecords: Attendance[] = [];
  let attendanceCounter = 1;
  
  // 모든 근무일에 대해 직원별 근태 생성
  WORKING_DAYS.forEach(date => {
    EMPLOYEES.forEach(employee => {
      // 95% 출근율
      if (Math.random() < 0.95) {
        const shift = getRandomElement(SHIFTS);
        const plannedStart = new Date(date);
        const plannedEnd = new Date(date);
        
        // 시프트 시간 설정
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);
        
        plannedStart.setHours(startHour, startMin, 0, 0);
        plannedEnd.setHours(endHour, endMin, 0, 0);
        
        // 야간 근무의 경우 다음날 종료
        if (endHour < startHour) {
          plannedEnd.setDate(plannedEnd.getDate() + 1);
        }
        
        // 실제 출퇴근 시간 (지각/조퇴 고려)
        const actualCheckIn = new Date(plannedStart);
        actualCheckIn.setMinutes(actualCheckIn.getMinutes() + Math.floor(Math.random() * 30) - 10); // -10~+20분
        
        const actualCheckOut = new Date(plannedEnd);
        actualCheckOut.setMinutes(actualCheckOut.getMinutes() + Math.floor(Math.random() * 60) - 30); // -30~+30분
        
        // 근무 시간 계산
        const totalMinutes = (actualCheckOut.getTime() - actualCheckIn.getTime()) / (1000 * 60);
        const breakTime = 60; // 1시간 휴식
        const workingMinutes = Math.max(0, totalMinutes - breakTime);
        
        const regularHours = Math.min(8, workingMinutes / 60);
        const overtimeHours = Math.max(0, (workingMinutes / 60) - 8);
        const nightShiftHours = shift.type === 'night' ? regularHours : 0;
        const weekendHours = shift.type === 'weekend' ? regularHours : 0;
        const holidayHours = 0; // 휴일 근무 없음으로 가정
        
        // 출근 상태 결정
        const isLate = actualCheckIn.getTime() > plannedStart.getTime() + (10 * 60 * 1000); // 10분 이상 지각
        const isEarlyLeave = actualCheckOut.getTime() < plannedEnd.getTime() - (10 * 60 * 1000); // 10분 이상 조퇴
        
        let status: 'present' | 'absent' | 'late' | 'early_leave' | 'sick' | 'vacation' = 'present';
        if (isLate && isEarlyLeave) status = 'early_leave';
        else if (isLate) status = 'late';
        else if (isEarlyLeave) status = 'early_leave';
        
        // 해당 직원이 해당 날짜에 생산 작업을 했는지 확인
        const workNotes = productionOrders.some(po => 
          po.workOrders.some(wo => 
            wo.workerId === employee.id && 
            wo.actualStartTime &&
            wo.actualStartTime.toDateString() === date.toDateString()
          )) ? '생산 작업 참여' : '';
        
        attendanceRecords.push({
          id: `ATT-${attendanceCounter.toString().padStart(6, '0')}`,
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          date,
          shiftId: shift.id,
          shiftName: shift.name,
          plannedStartTime: plannedStart,
          plannedEndTime: plannedEnd,
          actualCheckIn,
          actualCheckOut,
          regularHours,
          overtimeHours,
          nightShiftHours,
          weekendHours,
          holidayHours,
          breakTime,
          status,
          notes: workNotes
        });
        
        attendanceCounter++;
      } else {
        // 결근 처리
        const shift = SHIFTS[0]; // 기본 주간 근무
        const plannedStart = new Date(date);
        const plannedEnd = new Date(date);
        plannedStart.setHours(8, 0, 0, 0);
        plannedEnd.setHours(17, 0, 0, 0);
        
        attendanceRecords.push({
          id: `ATT-${attendanceCounter.toString().padStart(6, '0')}`,
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          date,
          shiftId: shift.id,
          shiftName: shift.name,
          plannedStartTime: plannedStart,
          plannedEndTime: plannedEnd,
          actualCheckIn: null,
          actualCheckOut: null,
          regularHours: 0,
          overtimeHours: 0,
          nightShiftHours: 0,
          weekendHours: 0,
          holidayHours: 0,
          breakTime: 0,
          status: Math.random() < 0.7 ? 'sick' : 'absent',
          notes: '결근'
        });
        
        attendanceCounter++;
      }
    });
  });
  
  return attendanceRecords;
};

// ==================== 8. 급여 데이터 생성 ====================

export const generatePayrollRecords = (attendanceRecords: Attendance[]): Payroll[] => {
  const payrollRecords: Payroll[] = [];
  let payrollCounter = 1;
  
  // 월별 급여 계산
  for (let year = 2023; year <= 2024; year++) {
    const startMonth = year === 2023 ? 10 : 1;
    const endMonth = year === 2024 ? 3 : 12;
    
    for (let month = startMonth; month <= endMonth; month++) {
      EMPLOYEES.forEach(employee => {
        const payPeriod = `${year}-${month.toString().padStart(2, '0')}`;
        const payDate = new Date(year, month - 1, 25); // 매월 25일 급여 지급
        
        // 해당 월의 근태 데이터 집계
        const monthlyAttendance = attendanceRecords.filter(att => 
          att.employeeId === employee.id &&
          att.date.getFullYear() === year &&
          att.date.getMonth() + 1 === month
        );
        
        const totalRegularHours = monthlyAttendance.reduce((sum, att) => sum + att.regularHours, 0);
        const totalOvertimeHours = monthlyAttendance.reduce((sum, att) => sum + att.overtimeHours, 0);
        const totalNightShiftHours = monthlyAttendance.reduce((sum, att) => sum + att.nightShiftHours, 0);
        const totalWeekendHours = monthlyAttendance.reduce((sum, att) => sum + att.weekendHours, 0);
        const totalHolidayHours = monthlyAttendance.reduce((sum, att) => sum + att.holidayHours, 0);
        
        // 급여 계산
        const regularPay = employee.baseSalary; // 고정급
        const overtimePay = totalOvertimeHours * employee.overtimeRate;
        const nightShiftPay = totalNightShiftHours * (employee.nightShiftRate - employee.hourlyRate); // 야간 수당만
        const weekendPay = totalWeekendHours * (employee.weekendRate - employee.hourlyRate); // 주말 수당만
        const holidayPay = totalHolidayHours * (employee.holidayRate - employee.hourlyRate); // 휴일 수당만
        
        const bonuses = month === 12 ? employee.baseSalary * 0.5 : 0; // 연말 보너스
        const allowances = employee.position.includes('팀장') || employee.position.includes('반장') ? 200000 : 100000; // 직책수당
        
        const grossPay = regularPay + overtimePay + nightShiftPay + weekendPay + holidayPay + bonuses + allowances;
        
        // 공제 계산
        const incomeTax = grossPay * 0.08; // 소득세 8%
        const nationalInsurance = grossPay * 0.045; // 국민연금 4.5%
        const healthInsurance = grossPay * 0.035; // 건강보험 3.5%
        const pensionContribution = grossPay * 0.045; // 퇴직연금 4.5%
        const otherDeductions = 50000; // 기타 공제 (식대, 교통비 등)
        
        const totalDeductions = incomeTax + nationalInsurance + healthInsurance + pensionContribution + otherDeductions;
        const netPay = grossPay - totalDeductions;
        
        payrollRecords.push({
          id: `PAY-${payrollCounter.toString().padStart(6, '0')}`,
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          position: employee.position,
          payPeriod,
          payDate,
          baseSalary: employee.baseSalary,
          regularPay,
          overtimePay,
          nightShiftPay,
          weekendPay,
          holidayPay,
          bonuses,
          allowances,
          grossPay,
          incomeTax,
          nationalInsurance,
          healthInsurance,
          pensionContribution,
          otherDeductions,
          totalDeductions,
          netPay,
          totalWorkHours: totalRegularHours + totalOvertimeHours,
          totalOvertimeHours
        });
        
        payrollCounter++;
      });
    }
  }
  
  return payrollRecords;
};

// ==================== 9. 회계 분개 데이터 생성 ====================

export const generateAccountingEntries = (
  salesOrders: SalesOrder[],
  purchaseOrders: PurchaseOrder[],
  payrollRecords: Payroll[],
  shipments: Shipment[]
): AccountingEntry[] => {
  const accountingEntries: AccountingEntry[] = [];
  let entryCounter = 1;
  
  // 매출 분개 (출하 기준)
  shipments.forEach(shipment => {
    const salesOrder = salesOrders.find(so => so.id === shipment.salesOrderId)!;
    const accountingClerk = getRandomElement(EMPLOYEES.filter(e => e.department !== '생산부'));
    
    // 매출채권 / 매출
    accountingEntries.push({
      id: `ACC-${entryCounter.toString().padStart(6, '0')}`,
      entryNumber: `JE-${shipment.actualShipDate.getFullYear()}${(shipment.actualShipDate.getMonth() + 1).toString().padStart(2, '0')}-${entryCounter.toString().padStart(4, '0')}`,
      date: shipment.actualShipDate,
      accountCode: '110',
      accountName: '매출채권',
      debitAmount: salesOrder.totalAmount,
      creditAmount: 0,
      description: `${shipment.customerName} 제품 출하`,
      referenceType: 'sales',
      referenceId: shipment.id,
      department: '영업부',
      costCenter: 'CC-001',
      createdBy: accountingClerk.name,
      approvedBy: accountingClerk.name,
      status: 'posted'
    });
    
    accountingEntries.push({
      id: `ACC-${(entryCounter + 1).toString().padStart(6, '0')}`,
      entryNumber: `JE-${shipment.actualShipDate.getFullYear()}${(shipment.actualShipDate.getMonth() + 1).toString().padStart(2, '0')}-${(entryCounter + 1).toString().padStart(4, '0')}`,
      date: shipment.actualShipDate,
      accountCode: '410',
      accountName: '매출',
      debitAmount: 0,
      creditAmount: salesOrder.totalAmount,
      description: `${shipment.items.map(item => item.productName).join(', ')} 매출`,
      referenceType: 'sales',
      referenceId: shipment.id,
      department: '영업부',
      costCenter: 'CC-001',
      createdBy: accountingClerk.name,
      approvedBy: accountingClerk.name,
      status: 'posted'
    });
    
    // 배송비 처리
    accountingEntries.push({
      id: `ACC-${(entryCounter + 2).toString().padStart(6, '0')}`,
      entryNumber: `JE-${shipment.actualShipDate.getFullYear()}${(shipment.actualShipDate.getMonth() + 1).toString().padStart(2, '0')}-${(entryCounter + 2).toString().padStart(4, '0')}`,
      date: shipment.actualShipDate,
      accountCode: '520',
      accountName: '운송비',
      debitAmount: shipment.shippingCost,
      creditAmount: 0,
      description: `${shipment.customerName} 배송비`,
      referenceType: 'sales',
      referenceId: shipment.id,
      department: '영업부',
      costCenter: 'CC-001',
      createdBy: accountingClerk.name,
      approvedBy: accountingClerk.name,
      status: 'posted'
    });
    
    accountingEntries.push({
      id: `ACC-${(entryCounter + 3).toString().padStart(6, '0')}`,
      entryNumber: `JE-${shipment.actualShipDate.getFullYear()}${(shipment.actualShipDate.getMonth() + 1).toString().padStart(2, '0')}-${(entryCounter + 3).toString().padStart(4, '0')}`,
      date: shipment.actualShipDate,
      accountCode: '210',
      accountName: '미지급금',
      debitAmount: 0,
      creditAmount: shipment.shippingCost,
      description: `${shipment.driverName} 운송료`,
      referenceType: 'sales',
      referenceId: shipment.id,
      department: '영업부',
      costCenter: 'CC-001',
      createdBy: accountingClerk.name,
      approvedBy: accountingClerk.name,
      status: 'posted'
    });
    
    entryCounter += 4;
  });
  
  // 매입 분개
  purchaseOrders.forEach(po => {
    if (po.status === 'completed') {
      const accountingClerk = getRandomElement(EMPLOYEES.filter(e => e.department !== '생산부'));
      
      // 원재료 / 매입채무
      accountingEntries.push({
        id: `ACC-${entryCounter.toString().padStart(6, '0')}`,
        entryNumber: `JE-${po.actualDeliveryDate!.getFullYear()}${(po.actualDeliveryDate!.getMonth() + 1).toString().padStart(2, '0')}-${entryCounter.toString().padStart(4, '0')}`,
        date: po.actualDeliveryDate!,
        accountCode: '140',
        accountName: '원재료',
        debitAmount: po.totalAmount - po.additionalCost,
        creditAmount: 0,
        description: `${po.supplierName} 자재 구매`,
        referenceType: 'purchase',
        referenceId: po.id,
        department: '구매부',
        costCenter: 'CC-002',
        createdBy: accountingClerk.name,
        approvedBy: accountingClerk.name,
        status: 'posted'
      });
      
      if (po.additionalCost > 0) {
        // 긴급 구매 추가 비용
        accountingEntries.push({
          id: `ACC-${(entryCounter + 1).toString().padStart(6, '0')}`,
          entryNumber: `JE-${po.actualDeliveryDate!.getFullYear()}${(po.actualDeliveryDate!.getMonth() + 1).toString().padStart(2, '0')}-${(entryCounter + 1).toString().padStart(4, '0')}`,
          date: po.actualDeliveryDate!,
          accountCode: '530',
          accountName: '긴급구매비용',
          debitAmount: po.additionalCost,
          creditAmount: 0,
          description: `${po.supplierName} 긴급 구매 추가비용`,
          referenceType: 'purchase',
          referenceId: po.id,
          department: '구매부',
          costCenter: 'CC-002',
          createdBy: accountingClerk.name,
          approvedBy: accountingClerk.name,
          status: 'posted'
        });
        
        entryCounter++;
      }
      
      accountingEntries.push({
        id: `ACC-${(entryCounter + 1).toString().padStart(6, '0')}`,
        entryNumber: `JE-${po.actualDeliveryDate!.getFullYear()}${(po.actualDeliveryDate!.getMonth() + 1).toString().padStart(2, '0')}-${(entryCounter + 1).toString().padStart(4, '0')}`,
        date: po.actualDeliveryDate!,
        accountCode: '210',
        accountName: '매입채무',
        debitAmount: 0,
        creditAmount: po.totalAmount,
        description: `${po.supplierName} 매입채무`,
        referenceType: 'purchase',
        referenceId: po.id,
        department: '구매부',
        costCenter: 'CC-002',
        createdBy: accountingClerk.name,
        approvedBy: accountingClerk.name,
        status: 'posted'
      });
      
      entryCounter += 2;
    }
  });
  
  // 급여 분개
  payrollRecords.forEach(payroll => {
    const accountingClerk = getRandomElement(EMPLOYEES.filter(e => e.department !== '생산부'));
    
    // 급여 / 미지급금, 예수금
    accountingEntries.push({
      id: `ACC-${entryCounter.toString().padStart(6, '0')}`,
      entryNumber: `JE-${payroll.payDate.getFullYear()}${(payroll.payDate.getMonth() + 1).toString().padStart(2, '0')}-${entryCounter.toString().padStart(4, '0')}`,
      date: payroll.payDate,
      accountCode: '510',
      accountName: '급여',
      debitAmount: payroll.grossPay,
      creditAmount: 0,
      description: `${payroll.employeeName} ${payroll.payPeriod} 급여`,
      referenceType: 'payroll',
      referenceId: payroll.id,
      department: payroll.department,
      costCenter: payroll.department === '생산부' ? 'CC-003' : 'CC-001',
      createdBy: accountingClerk.name,
      approvedBy: accountingClerk.name,
      status: 'posted'
    });
    
    accountingEntries.push({
      id: `ACC-${(entryCounter + 1).toString().padStart(6, '0')}`,
      entryNumber: `JE-${payroll.payDate.getFullYear()}${(payroll.payDate.getMonth() + 1).toString().padStart(2, '0')}-${(entryCounter + 1).toString().padStart(4, '0')}`,
      date: payroll.payDate,
      accountCode: '220',
      accountName: '미지급금',
      debitAmount: 0,
      creditAmount: payroll.netPay,
      description: `${payroll.employeeName} 급여 지급`,
      referenceType: 'payroll',
      referenceId: payroll.id,
      department: payroll.department,
      costCenter: payroll.department === '생산부' ? 'CC-003' : 'CC-001',
      createdBy: accountingClerk.name,
      approvedBy: accountingClerk.name,
      status: 'posted'
    });
    
    accountingEntries.push({
      id: `ACC-${(entryCounter + 2).toString().padStart(6, '0')}`,
      entryNumber: `JE-${payroll.payDate.getFullYear()}${(payroll.payDate.getMonth() + 1).toString().padStart(2, '0')}-${(entryCounter + 2).toString().padStart(4, '0')}`,
      date: payroll.payDate,
      accountCode: '230',
      accountName: '예수금',
      debitAmount: 0,
      creditAmount: payroll.totalDeductions,
      description: `${payroll.employeeName} 급여 공제액`,
      referenceType: 'payroll',
      referenceId: payroll.id,
      department: payroll.department,
      costCenter: payroll.department === '생산부' ? 'CC-003' : 'CC-001',
      createdBy: accountingClerk.name,
      approvedBy: accountingClerk.name,
      status: 'posted'
    });
    
    entryCounter += 3;
  });
  
  return accountingEntries;
};

// ==================== 데이터 생성 실행 (업데이트) ====================


let generatedData: any = null;

export const generateMassiveERPData = () => {
  if (generatedData) return generatedData;
  
  console.log('🚀 대량 ERP 데이터 생성 시작...');
  console.log(`📅 생성 기간: ${DATA_START_DATE.toLocaleDateString('ko-KR')} ~ ${DATA_END_DATE.toLocaleDateString('ko-KR')}`);
  
  // 1. 영업 주문 생성
  const salesOrders = generateSalesOrders();
  console.log(`✅ 영업 주문: ${salesOrders.length}건`);
  
  // 2. 구매 주문 생성
  const purchaseOrders = generatePurchaseOrders(salesOrders);
  console.log(`✅ 구매 주문: ${purchaseOrders.length}건`);
  
  // 3. 자재 입고 생성
  const materialInbounds = generateMaterialInbounds(purchaseOrders);
  console.log(`✅ 자재 입고: ${materialInbounds.length}건`);
  
  // 4. 생산 주문 생성
  let productionOrders = generateProductionOrders(salesOrders);
  console.log(`✅ 생산 주문: ${productionOrders.length}건`);
  
  // 5. 자재 소모 처리
  productionOrders = generateMaterialConsumptions(productionOrders, materialInbounds);
  console.log(`✅ 자재 소모 처리 완료`);
  
  // 6. 출하 및 납품 생성
  const shipments = generateShipments(salesOrders, productionOrders);
  console.log(`✅ 출하/납품: ${shipments.length}건`);
  
  // 7. 근태 데이터 생성
  const attendanceRecords = generateAttendanceRecords(productionOrders);
  console.log(`✅ 근태 기록: ${attendanceRecords.length}건`);
  
  // 8. 급여 데이터 생성
  const payrollRecords = generatePayrollRecords(attendanceRecords);
  console.log(`✅ 급여 기록: ${payrollRecords.length}건`);
  
  // 9. 회계 분개 생성
  const accountingEntries = generateAccountingEntries(salesOrders, purchaseOrders, payrollRecords, shipments);
  console.log(`✅ 회계 분개: ${accountingEntries.length}건`);
  
  const totalTransactions = salesOrders.length + purchaseOrders.length + materialInbounds.length + 
    productionOrders.length + shipments.length + attendanceRecords.length + payrollRecords.length + accountingEntries.length;
  
  console.log(`🎉 총 ${totalTransactions.toLocaleString()}건의 데이터 생성 완료!`);
  
  generatedData = {
    // 기준 데이터
    customers: CUSTOMERS,
    suppliers: SUPPLIERS,
    materials: MATERIALS,
    products: PRODUCTS,
    employees: EMPLOYEES,
    workCenters: WORK_CENTERS,
    shifts: SHIFTS,
    
    // 거래 데이터
    salesOrders,
    purchaseOrders,
    materialInbounds,
    productionOrders,
    shipments,
    attendanceRecords,
    payrollRecords,
    accountingEntries,
    
    // 통계 정보
    summary: {
      period: `${DATA_START_DATE.toLocaleDateString('ko-KR')} ~ ${DATA_END_DATE.toLocaleDateString('ko-KR')}`,
      totalTransactions,
      traceabilityComplete: true,
      dataIntegrity: '완전한 비즈니스 플로우 연계',
      breakdown: {
        salesOrders: salesOrders.length,
        purchaseOrders: purchaseOrders.length,
        materialInbounds: materialInbounds.length,
        productionOrders: productionOrders.length,
        shipments: shipments.length,
        attendanceRecords: attendanceRecords.length,
        payrollRecords: payrollRecords.length,
        accountingEntries: accountingEntries.length
      }
    }
  };
  
  return generatedData;
};

// ==================== 데이터 요약 정보 ====================

export const getDataSummary = () => {
  const data = generateMassiveERPData();
  return {
    period: `${DATA_START_DATE.toLocaleDateString('ko-KR')} ~ ${DATA_END_DATE.toLocaleDateString('ko-KR')} (12개월)`,
    customers: `${data.customers.length}개 고객사`,
    suppliers: `${data.suppliers.length}개 공급업체`,
    materials: `${data.materials.length}종 자재`,
    products: `${data.products.length}종 제품`,
    employees: `${data.employees.length}명 직원`,
    totalTransactions: `${data.summary.totalTransactions.toLocaleString()}건`,
    traceabilityComplete: true,
    dataIntegrity: '완전한 추적성 및 비즈니스 플로우 연계 완료'
  };
};

// ==================== AI 챗봇 분석 함수 ====================

// 추적성 분석
export const traceProductionToMaterials = (productionOrderId: string) => {
  const data = generateMassiveERPData();
  const production = data.productionOrders.find((po: ProductionOrder) => po.id === productionOrderId);
  
  if (!production) return null;
  
  const materialTraces = production.workOrders[0]?.materialsConsumed.map((material: MaterialConsumption) => {
    const inbound = data.materialInbounds.find((inb: MaterialInbound) => 
      inb.materialCode === material.materialCode && inb.lotNumber === material.lotNumber
    );
    
    const purchaseOrder = inbound ? data.purchaseOrders.find((po: PurchaseOrder) => po.id === inbound.purchaseOrderId) : null;
    
    return {
      ...material,
      supplier: purchaseOrder?.supplierName,
      purchaseDate: purchaseOrder?.orderDate,
      inboundDate: inbound?.inboundDate,
      qualityStatus: inbound?.qualityStatus,
      unitPrice: inbound?.unitPrice
    };
  }) || [];
  
  return {
    production,
    materialsUsed: materialTraces,
    salesOrder: data.salesOrders.find((so: SalesOrder) => so.id === production.salesOrderId)
  };
};

export const traceShipmentToProduction = (shipmentId: string) => {
  const data = generateMassiveERPData();
  const shipment = data.shipments.find((s: Shipment) => s.id === shipmentId);
  
  if (!shipment) return null;
  
  const relatedProductions = data.productionOrders.filter((po: ProductionOrder) => 
    shipment.items.some((item: ShipmentItem) => item.productionOrderIds.includes(po.id))
  );
  
  return {
    shipment,
    productionRecords: relatedProductions,
    traceability: relatedProductions.map((prod: ProductionOrder) => traceProductionToMaterials(prod.id))
  };
};

// 성과 분석 함수들
export const analyzeOnTimeDelivery = (customerId?: string, startDate?: Date, endDate?: Date) => {
  const data = generateMassiveERPData();
  let shipments = data.shipments;
  
  if (customerId) {
    shipments = shipments.filter((s: Shipment) => s.customerId === customerId);
  }
  
  if (startDate && endDate) {
    shipments = shipments.filter((s: Shipment) => 
      s.actualShipDate >= startDate && s.actualShipDate <= endDate
    );
  }
  
  const totalShipments = shipments.length;
  const onTimeShipments = shipments.filter((s: Shipment) => 
    s.actualDeliveryDate && s.actualDeliveryDate <= s.plannedDeliveryDate
  ).length;
  
  const onTimeRate = totalShipments > 0 ? (onTimeShipments / totalShipments) * 100 : 0;
  
  return {
    totalShipments,
    onTimeShipments,
    lateShipments: totalShipments - onTimeShipments,
    onTimeRate: Math.round(onTimeRate * 100) / 100
  };
};

export const analyzeProductionEfficiency = (startDate?: Date, endDate?: Date) => {
  const data = generateMassiveERPData();
  let productions = data.productionOrders;
  
  if (startDate && endDate) {
    productions = productions.filter((p: ProductionOrder) => 
      p.actualStartDate && p.actualStartDate >= startDate && 
      p.actualEndDate && p.actualEndDate <= endDate
    );
  }
  
  const totalPlanned = productions.reduce((sum: number, p: ProductionOrder) => sum + p.plannedQuantity, 0);
  const totalActual = productions.reduce((sum: number, p: ProductionOrder) => sum + p.actualQuantity, 0);
  const totalDefects = productions.reduce((sum: number, p: ProductionOrder) => sum + p.defectQuantity, 0);
  
  const efficiency = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;
  const defectRate = totalActual > 0 ? (totalDefects / totalActual) * 100 : 0;
  
  return {
    totalPlanned,
    totalActual,
    totalDefects,
    efficiency: Math.round(efficiency * 100) / 100,
    defectRate: Math.round(defectRate * 100) / 100,
    productionOrders: productions.length
  };
};

export const analyzeInventoryTurnover = (materialCode?: string) => {
  const data = generateMassiveERPData();
  let inbounds = data.materialInbounds;
  
  if (materialCode) {
    inbounds = inbounds.filter((i: MaterialInbound) => i.materialCode === materialCode);
  }
  
  // 자재 소모량 계산
  const totalConsumption = data.productionOrders.reduce((sum: number, po: ProductionOrder) => {
    return sum + po.workOrders.reduce((woSum: number, wo: WorkOrder) => {
      return woSum + wo.materialsConsumed
        .filter(mc => !materialCode || mc.materialCode === materialCode)
        .reduce((mcSum: number, mc: MaterialConsumption) => mcSum + mc.actualQuantity, 0);
    }, 0);
  }, 0);
  
  const totalInbound = inbounds.reduce((sum: number, i: MaterialInbound) => sum + i.quantity, 0);
  const turnoverRate = totalInbound > 0 ? (totalConsumption / totalInbound) * 100 : 0;
  
  return {
    totalInbound,
    totalConsumption,
    turnoverRate: Math.round(turnoverRate * 100) / 100,
    remainingStock: totalInbound - totalConsumption
  };
};

export const analyzeLaborCosts = (department?: string, month?: string) => {
  const data = generateMassiveERPData();
  let payrolls = data.payrollRecords;
  
  if (department) {
    payrolls = payrolls.filter((p: Payroll) => p.department === department);
  }
  
  if (month) {
    payrolls = payrolls.filter((p: Payroll) => p.payPeriod === month);
  }
  
  const totalBaseSalary = payrolls.reduce((sum: number, p: Payroll) => sum + p.baseSalary, 0);
  const totalOvertimePay = payrolls.reduce((sum: number, p: Payroll) => sum + p.overtimePay, 0);
  const totalGrossPay = payrolls.reduce((sum: number, p: Payroll) => sum + p.grossPay, 0);
  const totalWorkHours = payrolls.reduce((sum: number, p: Payroll) => sum + p.totalWorkHours, 0);
  const totalOvertimeHours = payrolls.reduce((sum: number, p: Payroll) => sum + p.totalOvertimeHours, 0);
  
  return {
    employeeCount: payrolls.length,
    totalBaseSalary,
    totalOvertimePay,
    totalGrossPay,
    totalWorkHours,
    totalOvertimeHours,
    averageHourlyRate: totalWorkHours > 0 ? totalGrossPay / totalWorkHours : 0
  };
};

export const analyzeFinancialSummary = (month?: string) => {
  const data = generateMassiveERPData();
  let entries = data.accountingEntries;
  
  if (month) {
    const [year, monthNum] = month.split('-').map(Number);
    entries = entries.filter((e: AccountingEntry) => 
      e.date.getFullYear() === year && e.date.getMonth() + 1 === monthNum
    );
  }
  
  const sales = entries
    .filter((e: AccountingEntry) => e.accountCode === '410')
    .reduce((sum: number, e: AccountingEntry) => sum + e.creditAmount, 0);
  
  const purchases = entries
    .filter((e: AccountingEntry) => e.accountCode === '140')
    .reduce((sum: number, e: AccountingEntry) => sum + e.debitAmount, 0);
  
  const payroll = entries
    .filter((e: AccountingEntry) => e.accountCode === '510')
    .reduce((sum: number, e: AccountingEntry) => sum + e.debitAmount, 0);
  
  const shippingCosts = entries
    .filter((e: AccountingEntry) => e.accountCode === '520')
    .reduce((sum: number, e: AccountingEntry) => sum + e.debitAmount, 0);
  
  const emergencyCosts = entries
    .filter((e: AccountingEntry) => e.accountCode === '530')
    .reduce((sum: number, e: AccountingEntry) => sum + e.debitAmount, 0);
  
  const totalCosts = purchases + payroll + shippingCosts + emergencyCosts;
  const grossProfit = sales - totalCosts;
  const profitMargin = sales > 0 ? (grossProfit / sales) * 100 : 0;
  
  return {
    sales,
    purchases,
    payroll,
    shippingCosts,
    emergencyCosts,
    totalCosts,
    grossProfit,
    profitMargin: Math.round(profitMargin * 100) / 100
  };
};

// ==================== AI 챗봇 응답 생성 함수 ====================

export const generateChatbotResponse = (query: string): string => {
  const data = generateMassiveERPData();
  
  // 추적성 관련 쿼리
  if (query.includes('추적') || query.includes('이력') || query.includes('LOT')) {
    const recentShipment = data.shipments[data.shipments.length - 1];
    const traceInfo = traceShipmentToProduction(recentShipment.id);
    
    if (traceInfo) {
      return `📦 **제품 추적성 분석**\n\n` +
        `**출하 정보**: ${traceInfo.shipment.items.map((item: ShipmentItem) => item.productName).join(', ')}\n` +
        `**고객**: ${traceInfo.shipment.customerName}\n` +
        `**출하일**: ${traceInfo.shipment.actualShipDate.toLocaleDateString('ko-KR')}\n` +
        `**납품일**: ${traceInfo.shipment.actualDeliveryDate?.toLocaleDateString('ko-KR') || '진행중'}\n\n` +
        `**생산 이력**:\n${traceInfo.productionRecords.map((p: ProductionOrder) => 
          `• 생산지시: ${p.orderNumber}\n` +
          `• 생산량: ${p.actualQuantity.toLocaleString()}EA (불량: ${p.defectQuantity.toLocaleString()}EA)\n` +
          `• 작업자: ${p.workOrders[0]?.workerName || 'N/A'}`
        ).join('\n')}\n\n` +
        `**사용 자재**: ${traceInfo.traceability[0]?.materialsUsed.length || 0}종 자재 사용\n` +
        `✅ **완전한 추적성 확보**: 자재 입고 → 생산 → 출하까지 전 과정 추적 가능`;
    }
  }
  
  // 납기 준수율 쿼리
  if (query.includes('납기') || query.includes('준수율') || query.includes('지연')) {
    const analysis = analyzeOnTimeDelivery();
    return `📊 **납기 준수율 분석** (6개월간)\n\n` +
      `• 총 출하 건수: ${analysis.totalShipments.toLocaleString()}건\n` +
      `• 정시 납품: ${analysis.onTimeShipments.toLocaleString()}건\n` +
      `• 지연 납품: ${analysis.lateShipments.toLocaleString()}건\n` +
      `• **납기 준수율: ${analysis.onTimeRate}%**\n\n` +
      `${analysis.onTimeRate >= 95 ? '🎯 우수한 납기 관리 (목표: 95% 이상)' : 
        analysis.onTimeRate >= 85 ? '⚠️ 납기 관리 개선 필요 (현재 85% 미만)' : 
        '🚨 납기 준수율 심각, 즉시 개선 필요'}\n\n` +
      `**개선 방안**: 생산 계획 최적화, 긴급 생산 라인 가동, 물류 프로세스 개선`;
  }
  
  // 생산 효율성 쿼리
  if (query.includes('생산') && (query.includes('효율') || query.includes('실적') || query.includes('달성률'))) {
    const analysis = analyzeProductionEfficiency();
    return `🏭 **생산 효율성 분석** (6개월간)\n\n` +
      `• 계획 생산량: ${analysis.totalPlanned.toLocaleString()}EA\n` +
      `• 실제 생산량: ${analysis.totalActual.toLocaleString()}EA\n` +
      `• 불량 수량: ${analysis.totalDefects.toLocaleString()}EA\n` +
      `• **생산 달성률: ${analysis.efficiency}%**\n` +
      `• **불량률: ${analysis.defectRate}%**\n` +
      `• 총 생산지시: ${analysis.productionOrders.toLocaleString()}건\n\n` +
      `${analysis.efficiency >= 95 && analysis.defectRate <= 3 ? '✅ 우수한 생산 성과' : 
        analysis.efficiency >= 85 && analysis.defectRate <= 5 ? '⚠️ 생산 효율 개선 필요' : 
        '🚨 생산성 및 품질 향상 시급'}\n\n` +
      `**분석**: ${analysis.efficiency < 95 ? '생산 계획 조정, ' : ''}${analysis.defectRate > 3 ? '품질 관리 강화 ' : ''}필요`;
  }
  
  // 재고 회전율 쿼리
  if (query.includes('재고') && (query.includes('회전') || query.includes('소모') || query.includes('재고율'))) {
    const analysis = analyzeInventoryTurnover();
    return `📦 **재고 회전율 분석** (6개월간)\n\n` +
      `• 총 입고량: ${analysis.totalInbound.toLocaleString()}EA\n` +
      `• 총 소모량: ${analysis.totalConsumption.toLocaleString()}EA\n` +
      `• **재고 회전율: ${analysis.turnoverRate}%**\n` +
      `• 잔여 재고: ${analysis.remainingStock.toLocaleString()}EA\n\n` +
      `${analysis.turnoverRate >= 80 ? '✅ 효율적인 재고 관리' : 
        analysis.turnoverRate >= 60 ? '⚠️ 재고 최적화 필요' : 
        '🚨 재고 과다 보유 - 재고 감축 필요'}\n\n` +
      `**권장사항**: ${analysis.turnoverRate < 60 ? '안전재고 수준 재검토, ' : ''}` +
      `자재 조달 주기 최적화, 생산 계획 정확도 향상`;
  }
  
  // 인건비 분석 쿼리 - 통합 모듈로 리다이렉트
  if (query.includes('인건비') || query.includes('급여') || query.includes('노무비') || query.includes('인력비용')) {
    // 통합된 직원 데이터 사용을 위해 chatbotIntegration으로 리다이렉트
    const { processERPQuery } = require('./chatbotIntegration');
    return processERPQuery(query);
  }
  
  // 재무 분석 쿼리
  if (query.includes('매출') || query.includes('수익') || query.includes('손익') || query.includes('재무')) {
    const analysis = analyzeFinancialSummary();
    const recentMonth = '2024-03';
    const monthlyAnalysis = analyzeFinancialSummary(recentMonth);
    
    return `📈 **재무 성과 분석**\n\n` +
      `**전체 기간 (6개월)**:\n` +
      `• 총 매출: ${analysis.sales.toLocaleString()}원\n` +
      `• 자재비: ${analysis.purchases.toLocaleString()}원\n` +
      `• 인건비: ${analysis.payroll.toLocaleString()}원\n` +
      `• 운송비: ${analysis.shippingCosts.toLocaleString()}원\n` +
      `• 긴급비용: ${analysis.emergencyCosts.toLocaleString()}원\n` +
      `• **총 비용: ${analysis.totalCosts.toLocaleString()}원**\n` +
      `• **영업이익: ${analysis.grossProfit.toLocaleString()}원**\n` +
      `• **이익률: ${analysis.profitMargin}%**\n\n` +
      `**최근 월 (${recentMonth})**:\n` +
      `• 월 매출: ${monthlyAnalysis.sales.toLocaleString()}원\n` +
      `• 월 이익률: ${monthlyAnalysis.profitMargin}%\n\n` +
      `${analysis.profitMargin >= 15 ? '🎯 건전한 수익성' : 
        analysis.profitMargin >= 10 ? '⚠️ 수익성 개선 필요' : 
        '🚨 수익성 확보 시급'}`;
  }
  
  // 긴급 상황 대응 쿼리
  if (query.includes('긴급') || query.includes('대응') || query.includes('해결책')) {
    const productionAnalysis = analyzeProductionEfficiency();
    const deliveryAnalysis = analyzeOnTimeDelivery();
    
    return `🚨 **긴급 상황 대응 방안**\n\n` +
      `**현재 상황**:\n` +
      `• 생산 달성률: ${productionAnalysis.efficiency}%\n` +
      `• 납기 준수율: ${deliveryAnalysis.onTimeRate}%\n` +
      `• 지연 납품: ${deliveryAnalysis.lateShipments}건\n\n` +
      `**즉시 대응 방안**:\n` +
      `1️⃣ **생산 증대**: 야간 근무 투입, 주말 특근 편성\n` +
      `2️⃣ **긴급 조달**: 신뢰도 높은 공급업체 긴급 발주 (비용 15-30% 증가)\n` +
      `3️⃣ **물류 최적화**: 긴급 배송 업체 활용, 직송 체계 구축\n` +
      `4️⃣ **품질 관리**: 검사 인력 추가 투입, 불량률 최소화\n\n` +
      `**예상 비용**: 약 ${Math.round(productionAnalysis.totalPlanned * 1000 * 0.2).toLocaleString()}원 추가 소요\n` +
      `**효과**: 납기 준수율 95% 이상 달성 가능`;
  }
  
  // 기본 데이터 현황 쿼리
  if (query.includes('현황') || query.includes('상태') || query.includes('요약')) {
    const summary = getDataSummary();
    return `📋 **ERP 시스템 현황** (${summary.period})\n\n` +
      `**기준 정보**:\n` +
      `• 고객사: ${summary.customers}\n` +
      `• 공급업체: ${summary.suppliers}\n` +
      `• 관리 자재: ${summary.materials}\n` +
      `• 생산 제품: ${summary.products}\n` +
      `• 총 직원: ${summary.employees}\n\n` +
      `**거래 데이터**:\n` +
      `• 총 거래 건수: ${summary.totalTransactions}\n` +
      `• 데이터 무결성: ✅ 완료\n` +
      `• 추적성: ✅ 보장\n\n` +
      `**시스템 특징**:\n` +
      `✅ 영업 → 구매 → 생산 → 출하 → 회계 전 과정 연계\n` +
      `✅ 자재 LOT별 완전한 추적성 확보\n` +
      `✅ 근태 기반 정확한 인건비 계산\n` +
      `✅ 실시간 재무 성과 분석 가능`;
  }
  
  return `죄송합니다. "${query}"에 대한 구체적인 분석 결과를 제공할 수 없습니다.\n\n` +
    `**분석 가능한 영역**:\n` +
    `• 제품 추적성 및 이력 관리\n` +
    `• 납기 준수율 및 배송 성과\n` +
    `• 생산 효율성 및 품질 지표\n` +
    `• 재고 회전율 및 자재 관리\n` +
    `• 인건비 및 노무 비용 분석\n` +
    `• 매출, 수익성 등 재무 성과\n` +
    `• 긴급 상황 대응 방안\n\n` +
    `더 구체적인 질문을 해주시면 정확한 데이터 기반 답변을 제공해드리겠습니다.`;
};

// 브라우저 콘솔에서 ERP 데이터에 접근할 수 있도록 전역 함수 추가
declare global {
  interface Window {
    getERPData: () => any;
    analyzeShortages: () => any;
    getBOMAnalysis: (productCode?: string) => any;
    analyzeBOMSufficiency: (purchaseOrderId?: string) => any;
    getInventoryStatus: () => any;
  }
}

// 브라우저 환경에서만 전역 함수 등록
if (typeof window !== 'undefined') {
  window.getERPData = () => {
    const data = generateMassiveERPData();
    console.log('📊 ERP 데이터 요약:');
    console.log(`• 영업 주문: ${data.salesOrders.length}건`);
    console.log(`• 구매 주문: ${data.purchaseOrders.length}건`);
    console.log(`• 자재 입고: ${data.materialInbounds.length}건`);
    console.log(`• 생산 주문: ${data.productionOrders.length}건`);
    console.log(`• 출하/납품: ${data.shipments.length}건`);
    return data;
  };

  window.analyzeShortages = () => {
    const data = generateMassiveERPData();
    const shortageAnalysis = {
      totalProductionOrders: data.productionOrders.length,
      partiallyCompleted: data.productionOrders.filter((po: any) => po.status === 'partially_completed').length,
      shortageRate: 0
    };
    shortageAnalysis.shortageRate = parseFloat((shortageAnalysis.partiallyCompleted / shortageAnalysis.totalProductionOrders * 100).toFixed(2));
    
    console.log('🚨 부족 분석 결과:');
    console.log(`• 총 생산 주문: ${shortageAnalysis.totalProductionOrders}건`);
    console.log(`• 부분 완료 (부족): ${shortageAnalysis.partiallyCompleted}건`);
    console.log(`• 부족률: ${shortageAnalysis.shortageRate}%`);
    
    return shortageAnalysis;
  };

  window.getBOMAnalysis = (productCode?: string) => {
    const targetProducts = productCode ? 
      PRODUCTS.filter(p => p.code === productCode) : 
      PRODUCTS;
    
    const bomAnalysis = targetProducts.map(product => {
      const totalMaterialCost = product.bomItems.reduce((sum: number, item: any) => {
        const material = MATERIALS.find(m => m.code === item.materialCode);
        return sum + (material ? material.unitPrice * item.quantity : 0);
      }, 0);
      
      const grossMargin = ((product.unitPrice - totalMaterialCost) / product.unitPrice * 100).toFixed(2);
      
      return {
        productCode: product.code,
        productName: product.name,
        unitPrice: product.unitPrice,
        materialCost: totalMaterialCost,
        grossMargin: `${grossMargin}%`,
        bomItems: product.bomItems.length
      };
    });
    
    console.log('🔧 BOM 분석 결과:');
    console.table(bomAnalysis);
    return bomAnalysis;
  };

  window.analyzeBOMSufficiency = (purchaseOrderId?: string) => {
    const data = generateMassiveERPData();
    const targetPOs = purchaseOrderId ? 
      data.purchaseOrders.filter(po => po.id === purchaseOrderId) : 
      data.purchaseOrders.slice(0, 5); // 처음 5개만 분석
    
    const analysis = targetPOs.map(po => {
      console.log(`🔍 분석 중: ${po.orderNumber}`);
      
      // 해당 PO와 연관된 영업 주문들 찾기
      const relatedSOs = data.salesOrders.filter(so => 
        Math.abs(new Date(so.orderDate).getTime() - new Date(po.orderDate).getTime()) < 30 * 24 * 60 * 60 * 1000
      );
      
      // 필요한 BOM 자재 계산
      const requiredMaterials = new Map();
      relatedSOs.forEach(so => {
        so.items.forEach(item => {
          const product = PRODUCTS.find(p => p.id === item.productId);
          if (product) {
            product.bomItems.forEach(bomItem => {
              const totalNeeded = bomItem.quantity * item.quantity;
              requiredMaterials.set(bomItem.materialCode, 
                (requiredMaterials.get(bomItem.materialCode) || 0) + totalNeeded);
            });
          }
        });
      });
      
      // PO에서 구매한 자재와 비교
      const purchasedMaterials = new Map();
      po.items.forEach(item => {
        purchasedMaterials.set(item.materialCode, item.quantity);
      });
      
      // 충족도 분석
      const sufficiencyAnalysis = [];
      requiredMaterials.forEach((required, materialCode) => {
        const purchased = purchasedMaterials.get(materialCode) || 0;
        const sufficiency = purchased >= required;
        const material = MATERIALS.find(m => m.code === materialCode);
        
        sufficiencyAnalysis.push({
          materialCode,
          materialName: material?.name || 'Unknown',
          required,
          purchased,
          surplus: purchased - required,
          sufficient: sufficiency,
          sufficiencyRate: required > 0 ? ((purchased / required) * 100).toFixed(1) + '%' : '100%'
        });
      });
      
      const totalSufficient = sufficiencyAnalysis.filter(s => s.sufficient).length;
      const overallSufficiency = (totalSufficient / sufficiencyAnalysis.length * 100).toFixed(1);
      
      return {
        purchaseOrderId: po.id,
        orderNumber: po.orderNumber,
        supplier: po.supplierName,
        overallSufficiency: overallSufficiency + '%',
        totalMaterials: sufficiencyAnalysis.length,
        sufficientMaterials: totalSufficient,
        insufficientMaterials: sufficiencyAnalysis.length - totalSufficient,
        details: sufficiencyAnalysis
      };
    });
    
    console.log('📊 BOM 충족도 분석 결과:');
    console.table(analysis.map(a => ({
      주문번호: a.orderNumber,
      공급업체: a.supplier,
      전체충족도: a.overallSufficiency,
      충족자재: `${a.sufficientMaterials}/${a.totalMaterials}`,
      부족자재: a.insufficientMaterials
    })));
    
    return analysis;
  };

  window.getInventoryStatus = () => {
    const data = generateMassiveERPData();
    console.log('📋 데이터 구조 확인:', Object.keys(data));
    const inventoryMap = new Map();
    
    // 입고 수량 집계 (안전한 접근)
    if (data.materialInbounds && Array.isArray(data.materialInbounds)) {
      data.materialInbounds.forEach((inbound: any) => {
        if (inbound.items && Array.isArray(inbound.items)) {
          inbound.items.forEach((item: any) => {
            const current = inventoryMap.get(item.materialCode) || { inbound: 0, consumed: 0 };
            current.inbound += item.quantity;
            inventoryMap.set(item.materialCode, current);
          });
        }
      });
    } else {
      console.warn('⚠️ materialInbounds 데이터가 없습니다.');
    }
    
    // 소모 수량 집계
    if (data.productionOrders && Array.isArray(data.productionOrders)) {
      data.productionOrders.forEach((po: any) => {
        if (po.materialConsumptions && Array.isArray(po.materialConsumptions)) {
          po.materialConsumptions.forEach((consumption: any) => {
            const current = inventoryMap.get(consumption.materialCode) || { inbound: 0, consumed: 0 };
            current.consumed += consumption.consumedQuantity;
            inventoryMap.set(consumption.materialCode, current);
          });
        }
      });
    } else {
      console.warn('⚠️ productionOrders 데이터가 없습니다.');
    }
    
    const inventoryStatus = Array.from(inventoryMap.entries()).map(([materialCode, data]) => {
      const material = MATERIALS.find(m => m.code === materialCode);
      return {
        materialCode,
        materialName: material?.name || 'Unknown',
        inboundQty: data.inbound,
        consumedQty: data.consumed,
        remainingQty: data.inbound - data.consumed,
        turnoverRate: data.inbound > 0 ? (data.consumed / data.inbound * 100).toFixed(2) + '%' : '0%'
      };
    });
    
    console.log('📦 재고 현황:');
    console.table(inventoryStatus);
    return inventoryStatus;
  };
}

