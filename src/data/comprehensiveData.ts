// 대량 ERP 데모 데이터 생성 (3-6개월치)

// 인터페이스 정의 (로컬)
interface MaterialInbound {
  id: string;
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
  qualityStatus: "passed" | "pending" | "failed";
  warehouseLocation: string;
  purchaseOrderId: string;
}

interface MaterialOutbound {
  id: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  outboundDate: Date;
  lotNumber: string;
  productionOrderId: string;
  workOrderId: string;
  usedBy: string;
  purpose: "production" | "maintenance" | "sample";
}

interface MaterialUsage {
  materialCode: string;
  materialName: string;
  plannedQuantity: number;
  actualQuantity: number;
  lotNumber: string;
  unit: string;
}

interface ProductionRecord {
  id: string;
  workOrderId: string;
  productCode: string;
  productName: string;
  plannedQuantity: number;
  actualQuantity: number;
  defectQuantity: number;
  startTime: Date;
  endTime: Date;
  workerId: string;
  workerName: string;
  shiftId: string;
  materialsUsed: MaterialUsage[];
  qualityCheckId: string;
  status: "completed" | "in-progress" | "paused" | "cancelled";
}

interface DeliveryRecord {
  id: string;
  deliveryOrderId: string;
  customerId: string;
  customerName: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  deliveryDate: Date;
  scheduledDate: Date;
  onTimeDelivery: boolean;
  deliveryAddress: string;
  driverName: string;
  vehicleNumber: string;
  deliveryCost: number;
  productionRecordIds: string[];
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  workHours: number;
  overtimeHours: number;
  shiftType: "day" | "night" | "weekend" | "holiday";
  status: "present" | "absent" | "late" | "early_leave";
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  month: string;
  baseSalary: number;
  overtimePay: number;
  nightShiftAllowance: number;
  weekendAllowance: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  totalPay: number;
  deductions: number;
  netPay: number;
}

interface AccountingEntry {
  id: string;
  date: Date;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  referenceType: "purchase" | "production" | "sales" | "payroll" | "delivery" | "other";
  referenceId: string;
  department: string;
}

// 데이터 생성 유틸리티 함수들
const generateDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateLotNumber = (date: Date, materialCode: string): string => {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${materialCode}-${dateStr}-${randomNum}`;
};

// 기준 데이터
const MATERIALS = [
  { code: 'MAT-001', name: '스틸 시트 레일', unitPrice: 15000, supplier: 'SUP-001' },
  { code: 'MAT-002', name: '알루미늄 프레임', unitPrice: 25000, supplier: 'SUP-002' },
  { code: 'MAT-003', name: '플라스틱 커버', unitPrice: 8000, supplier: 'SUP-003' },
  { code: 'MAT-004', name: '볼트 세트', unitPrice: 500, supplier: 'SUP-001' },
  { code: 'MAT-005', name: '전동 모터', unitPrice: 120000, supplier: 'SUP-004' }
];

const PRODUCTS = [
  { code: 'PROD-001', name: '프리미엄 시트 어셈블리', price: 180000 },
  { code: 'PROD-002', name: '전동 시트 모터', price: 150000 },
  { code: 'PROD-003', name: '시트 슬라이드 레일', price: 45000 },
  { code: 'PROD-004', name: 'EV9 시트 레일', price: 55000 },
  { code: 'PROD-005', name: 'GV70 시트 프레임', price: 85000 }
];

const CUSTOMERS = [
  { id: 'CUST-001', name: '현대자동차' },
  { id: 'CUST-002', name: '기아자동차' },
  { id: 'CUST-003', name: '제네시스' },
  { id: 'CUST-004', name: '현대모비스' },
  { id: 'CUST-005', name: '만도' }
];

const SUPPLIERS = [
  { id: 'SUP-001', name: '대창공업' },
  { id: 'SUP-002', name: '한국정밀' },
  { id: 'SUP-003', name: '동양금속' },
  { id: 'SUP-004', name: '모터텍' }
];

const EMPLOYEES = [
  { id: 'EMP-001', name: '김철수', dept: '생산부', position: '팀장', salary: 4500000 },
  { id: 'EMP-002', name: '이영희', dept: '생산부', position: '작업자', salary: 3200000 },
  { id: 'EMP-003', name: '박민수', dept: '품질부', position: '검사원', salary: 3500000 },
  { id: 'EMP-004', name: '정수진', dept: '생산부', position: '작업자', salary: 3200000 },
  { id: 'EMP-005', name: '최영호', dept: '생산부', position: '반장', salary: 3800000 }
];

// 3-6개월 데이터 생성
const START_DATE = new Date('2023-10-01');
const END_DATE = new Date('2024-03-31');
const dateRange = generateDateRange(START_DATE, END_DATE);

// 1. 자재 입고 데이터 생성 (추적성의 시작점)
export const generateMaterialInboundData = (): MaterialInbound[] => {
  const inboundData: MaterialInbound[] = [];
  let idCounter = 1;

  dateRange.forEach(date => {
    // 주 3-4회 자재 입고
    if (Math.random() < 0.6) {
      const material = getRandomElement(MATERIALS);
      const supplier = SUPPLIERS.find(s => s.id === material.supplier)!;
      const quantity = Math.floor(Math.random() * 500) + 100;
      
      inboundData.push({
        id: `IN-${idCounter.toString().padStart(6, '0')}`,
        materialCode: material.code,
        materialName: material.name,
        supplierId: supplier.id,
        supplierName: supplier.name,
        quantity,
        unit: 'EA',
        unitPrice: material.unitPrice,
        totalAmount: quantity * material.unitPrice,
        inboundDate: date,
        lotNumber: generateLotNumber(date, material.code),
        qualityStatus: Math.random() < 0.95 ? 'passed' : 'pending',
        warehouseLocation: `창고-${String.fromCharCode(65 + Math.floor(Math.random() * 3))}-${Math.floor(Math.random() * 10) + 1}`,
        purchaseOrderId: `PO-${idCounter.toString().padStart(6, '0')}`
      });
      
      idCounter++;
    }
  });

  return inboundData;
};

// 2. 생산 기록 데이터 생성 (자재 소모 추적)
export const generateProductionRecords = (inboundData: MaterialInbound[]): ProductionRecord[] => {
  const productionData: ProductionRecord[] = [];
  let idCounter = 1;

  dateRange.forEach(date => {
    // 평일에만 생산 (월-금)
    if (date.getDay() >= 1 && date.getDay() <= 5) {
      const dailyProductions = Math.floor(Math.random() * 3) + 1; // 하루 1-3개 작업지시
      
      for (let i = 0; i < dailyProductions; i++) {
        const product = getRandomElement(PRODUCTS);
        const employee = getRandomElement(EMPLOYEES.filter(e => e.dept === '생산부'));
        const plannedQty = Math.floor(Math.random() * 100) + 50;
        const actualQty = Math.floor(plannedQty * (0.85 + Math.random() * 0.15)); // 85-100% 달성률
        const defectQty = Math.floor(actualQty * (Math.random() * 0.05)); // 0-5% 불량률
        
        // 해당 제품에 필요한 자재 선택 (입고된 자재 중에서)
        const availableMaterials = inboundData.filter(m => 
          m.inboundDate <= date && m.qualityStatus === 'passed'
        );
        
        const materialsUsed = availableMaterials.slice(0, 2 + Math.floor(Math.random() * 2)).map(material => ({
          materialCode: material.materialCode,
          materialName: material.materialName,
          plannedQuantity: Math.floor(Math.random() * 5) + 1,
          actualQuantity: Math.floor(Math.random() * 5) + 1,
          lotNumber: material.lotNumber,
          unit: 'EA'
        }));

        const startTime = new Date(date);
        startTime.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 2 + Math.floor(Math.random() * 6));

        productionData.push({
          id: `PROD-REC-${idCounter.toString().padStart(6, '0')}`,
          workOrderId: `WO-${idCounter.toString().padStart(6, '0')}`,
          productCode: product.code,
          productName: product.name,
          plannedQuantity: plannedQty,
          actualQuantity: actualQty,
          defectQuantity: defectQty,
          startTime,
          endTime,
          workerId: employee.id,
          workerName: employee.name,
          shiftId: 'SHIFT-001',
          materialsUsed,
          qualityCheckId: `QC-${idCounter.toString().padStart(6, '0')}`,
          status: 'completed'
        });
        
        idCounter++;
      }
    }
  });

  return productionData;
};

// 3. 납품 기록 데이터 생성 (생산→납품 추적)
export const generateDeliveryRecords = (productionData: ProductionRecord[]): DeliveryRecord[] => {
  const deliveryData: DeliveryRecord[] = [];
  let idCounter = 1;

  // 생산 완료된 제품들을 기반으로 납품 생성
  const completedProductions = productionData.filter(p => p.status === 'completed');
  
  completedProductions.forEach(production => {
    // 생산 완료 후 1-7일 내 납품
    if (Math.random() < 0.8) { // 80% 확률로 납품
      const deliveryDate = new Date(production.endTime);
      deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 7) + 1);
      
      const scheduledDate = new Date(deliveryDate);
      scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 3)); // 예정일은 실제보다 빠름
      
      const customer = getRandomElement(CUSTOMERS);
      const onTime = deliveryDate <= scheduledDate;
      
      deliveryData.push({
        id: `DEL-${idCounter.toString().padStart(6, '0')}`,
        deliveryOrderId: `DO-${idCounter.toString().padStart(6, '0')}`,
        customerId: customer.id,
        customerName: customer.name,
        productCode: production.productCode,
        productName: production.productName,
        quantity: production.actualQuantity - production.defectQuantity,
        unit: 'EA',
        deliveryDate,
        scheduledDate,
        onTimeDelivery: onTime,
        deliveryAddress: `${customer.name} 본사`,
        driverName: `운전기사${Math.floor(Math.random() * 5) + 1}`,
        vehicleNumber: `${Math.floor(Math.random() * 100)}허${Math.floor(Math.random() * 10000)}`,
        deliveryCost: Math.floor(Math.random() * 50000) + 30000,
        productionRecordIds: [production.id]
      });
      
      idCounter++;
    }
  });

  return deliveryData;
};

// 4. 근태 기록 데이터 생성
export const generateAttendanceRecords = (): AttendanceRecord[] => {
  const attendanceData: AttendanceRecord[] = [];
  let idCounter = 1;

  dateRange.forEach(date => {
    EMPLOYEES.forEach(employee => {
      // 주말 제외하고 95% 출근율
      if (date.getDay() >= 1 && date.getDay() <= 5 && Math.random() < 0.95) {
        const checkIn = new Date(date);
        checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30)); // 8-9:30 출근
        
        const workHours = 8 + Math.random() * 2; // 8-10시간 근무
        const checkOut = new Date(checkIn);
        checkOut.setHours(checkIn.getHours() + Math.floor(workHours), Math.floor((workHours % 1) * 60));
        
        const overtimeHours = Math.max(0, workHours - 8);
        const isLate = checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 0);
        
        attendanceData.push({
          id: `ATT-${idCounter.toString().padStart(6, '0')}`,
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.dept,
          position: employee.position,
          date,
          checkIn,
          checkOut,
          workHours,
          overtimeHours,
          shiftType: 'day',
          status: isLate ? 'late' : 'present'
        });
        
        idCounter++;
      }
    });
  });

  return attendanceData;
};

// 5. 급여 기록 데이터 생성 (근태 기반)
export const generatePayrollRecords = (attendanceData: AttendanceRecord[]): PayrollRecord[] => {
  const payrollData: PayrollRecord[] = [];
  let idCounter = 1;

  // 월별로 급여 계산
  for (let year = 2023; year <= 2024; year++) {
    const startMonth = year === 2023 ? 10 : 1;
    const endMonth = year === 2024 ? 3 : 12;
    
    for (let month = startMonth; month <= endMonth; month++) {
      EMPLOYEES.forEach(employee => {
        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        
        // 해당 월의 근태 데이터 집계
        const monthlyAttendance = attendanceData.filter(att => 
          att.employeeId === employee.id &&
          att.date.getFullYear() === year &&
          att.date.getMonth() + 1 === month
        );
        
        const totalWorkHours = monthlyAttendance.reduce((sum, att) => sum + att.workHours, 0);
        const totalOvertimeHours = monthlyAttendance.reduce((sum, att) => sum + att.overtimeHours, 0);
        
        const overtimePay = totalOvertimeHours * (employee.salary / 209) * 1.5; // 시급 * 1.5배
        const nightShiftAllowance = totalOvertimeHours > 20 ? 100000 : 0;
        const weekendAllowance = 0; // 주말 근무 없음
        
        const totalPay = employee.salary + overtimePay + nightShiftAllowance + weekendAllowance;
        const deductions = totalPay * 0.1; // 10% 공제
        const netPay = totalPay - deductions;
        
        payrollData.push({
          id: `PAY-${idCounter.toString().padStart(6, '0')}`,
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.dept,
          position: employee.position,
          month: monthStr,
          baseSalary: employee.salary,
          overtimePay,
          nightShiftAllowance,
          weekendAllowance,
          totalWorkHours,
          totalOvertimeHours,
          totalPay,
          deductions,
          netPay
        });
        
        idCounter++;
      });
    }
  }

  return payrollData;
};

// 6. 회계 분개 데이터 생성 (모든 거래의 회계 처리)
export const generateAccountingEntries = (
  inboundData: MaterialInbound[],
  deliveryData: DeliveryRecord[],
  payrollData: PayrollRecord[]
): AccountingEntry[] => {
  const accountingData: AccountingEntry[] = [];
  let idCounter = 1;

  // 자재 구매 분개
  inboundData.forEach(inbound => {
    accountingData.push({
      id: `ACC-${idCounter.toString().padStart(6, '0')}`,
      date: inbound.inboundDate,
      accountCode: '140', // 원재료
      accountName: '원재료',
      debitAmount: inbound.totalAmount,
      creditAmount: 0,
      description: `${inbound.materialName} 구매`,
      referenceType: 'purchase',
      referenceId: inbound.id,
      department: '구매부'
    });
    
    accountingData.push({
      id: `ACC-${(idCounter + 1).toString().padStart(6, '0')}`,
      date: inbound.inboundDate,
      accountCode: '210', // 매입채무
      accountName: '매입채무',
      debitAmount: 0,
      creditAmount: inbound.totalAmount,
      description: `${inbound.supplierName} 매입채무`,
      referenceType: 'purchase',
      referenceId: inbound.id,
      department: '구매부'
    });
    
    idCounter += 2;
  });

  // 매출 분개 (납품 기준)
  deliveryData.forEach(delivery => {
    const product = PRODUCTS.find(p => p.code === delivery.productCode)!;
    const salesAmount = delivery.quantity * product.price;
    
    accountingData.push({
      id: `ACC-${idCounter.toString().padStart(6, '0')}`,
      date: delivery.deliveryDate,
      accountCode: '110', // 매출채권
      accountName: '매출채권',
      debitAmount: salesAmount,
      creditAmount: 0,
      description: `${delivery.customerName} 매출`,
      referenceType: 'sales',
      referenceId: delivery.id,
      department: '영업부'
    });
    
    accountingData.push({
      id: `ACC-${(idCounter + 1).toString().padStart(6, '0')}`,
      date: delivery.deliveryDate,
      accountCode: '410', // 매출
      accountName: '매출',
      debitAmount: 0,
      creditAmount: salesAmount,
      description: `${delivery.productName} 매출`,
      referenceType: 'sales',
      referenceId: delivery.id,
      department: '영업부'
    });
    
    idCounter += 2;
  });

  // 급여 분개
  payrollData.forEach(payroll => {
    const payDate = new Date(`${payroll.month}-25`); // 매월 25일 급여 지급
    
    accountingData.push({
      id: `ACC-${idCounter.toString().padStart(6, '0')}`,
      date: payDate,
      accountCode: '510', // 급여
      accountName: '급여',
      debitAmount: payroll.totalPay,
      creditAmount: 0,
      description: `${payroll.employeeName} ${payroll.month} 급여`,
      referenceType: 'payroll',
      referenceId: payroll.id,
      department: payroll.department
    });
    
    accountingData.push({
      id: `ACC-${(idCounter + 1).toString().padStart(6, '0')}`,
      date: payDate,
      accountCode: '220', // 미지급금
      accountName: '미지급금',
      debitAmount: 0,
      creditAmount: payroll.netPay,
      description: `${payroll.employeeName} 급여 지급`,
      referenceType: 'payroll',
      referenceId: payroll.id,
      department: payroll.department
    });
    
    idCounter += 2;
  });

  return accountingData;
};

// 전체 데이터 생성 함수
export const generateComprehensiveERPData = () => {
  console.log('🔄 대량 ERP 데이터 생성 시작...');
  
  const inboundData = generateMaterialInboundData();
  console.log(`✅ 자재 입고 데이터: ${inboundData.length}건`);
  
  const productionData = generateProductionRecords(inboundData);
  console.log(`✅ 생산 기록 데이터: ${productionData.length}건`);
  
  const deliveryData = generateDeliveryRecords(productionData);
  console.log(`✅ 납품 기록 데이터: ${deliveryData.length}건`);
  
  const attendanceData = generateAttendanceRecords();
  console.log(`✅ 근태 기록 데이터: ${attendanceData.length}건`);
  
  const payrollData = generatePayrollRecords(attendanceData);
  console.log(`✅ 급여 기록 데이터: ${payrollData.length}건`);
  
  const accountingData = generateAccountingEntries(inboundData, deliveryData, payrollData);
  console.log(`✅ 회계 분개 데이터: ${accountingData.length}건`);
  
  return {
    materialInbound: inboundData,
    productionRecords: productionData,
    deliveryRecords: deliveryData,
    attendanceRecords: attendanceData,
    payrollRecords: payrollData,
    accountingEntries: accountingData
  };
};
