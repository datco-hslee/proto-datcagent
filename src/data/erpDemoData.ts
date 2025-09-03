// ERP 데모 데이터 - AI 챗봇 "단비" 시나리오용 (3-6개월 대량 데이터)

// 기본 인터페이스들
export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  currentStock: number;
  unit: string;
  daysRemaining: number;
  customer: string;
  status: "sufficient" | "low" | "critical";
  location: string;
  lastUpdated: Date;
  unitPrice: number;
  totalValue: number;
}

// 입고/출고 추적을 위한 새로운 인터페이스들
export interface MaterialInbound {
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

export interface MaterialOutbound {
  id: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  outboundDate: Date;
  lotNumber: string;
  productionOrderId: string;
  workOrderId: string;
  usedBy: string; // 작업자
  purpose: "production" | "maintenance" | "sample";
}

export interface ProductionRecord {
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

export interface MaterialUsage {
  materialCode: string;
  materialName: string;
  plannedQuantity: number;
  actualQuantity: number;
  lotNumber: string;
  unit: string;
}

export interface DeliveryRecord {
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
  productionRecordIds: string[]; // 추적성을 위한 생산 기록 연결
}

export interface AttendanceRecord {
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

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  month: string; // YYYY-MM
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

export interface AccountingEntry {
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

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: Date;
  requestedDeliveryDate: Date;
  items: SalesOrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "in_production" | "ready" | "delivered" | "cancelled";
}

export interface SalesOrderItem {
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface ProductionPlan {
  id: string;
  customer: string;
  productName: string;
  targetQuantity: number;
  completedQuantity: number;
  unit: string;
  dueDate: Date;
  status: "on-track" | "at-risk" | "delayed";
  weeklyTarget: number;
  currentWeekProgress: number;
}

export interface SupplierInfo {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  emergencyAvailable: boolean;
  priceIncrease: number; // 긴급 조달시 가격 상승률 (%)
  deliveryDays: number;
  reliability: "high" | "medium" | "low";
}

export interface WorkShift {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  workers: number;
  efficiency: number; // %
  available: boolean;
}

// 재고 데모 데이터
export const INVENTORY_DEMO_DATA: InventoryItem[] = [
  {
    id: "inv-001",
    name: "EV9 전기차용 시트 레일",
    code: "EV9-SR-001",
    currentStock: 1200,
    unit: "EA",
    daysRemaining: 10,
    customer: "현대자동차",
    status: "sufficient",
    location: "창고 A-1",
    lastUpdated: new Date("2024-01-15T09:30:00"),
    unitPrice: 45000,
    totalValue: 54000000
  },
  {
    id: "inv-002", 
    name: "GV70 SUV 시트 프레임",
    code: "GV70-SF-002",
    currentStock: 450,
    unit: "EA",
    daysRemaining: 3,
    customer: "제네시스",
    status: "low",
    location: "창고 B-2",
    lastUpdated: new Date("2024-01-15T10:15:00"),
    unitPrice: 78000,
    totalValue: 35100000
  },
  {
    id: "inv-003",
    name: "아이오닉6 도어 힌지",
    code: "IONIQ6-DH-003",
    currentStock: 80,
    unit: "EA", 
    daysRemaining: 1,
    customer: "현대자동차",
    status: "critical",
    location: "창고 C-1",
    lastUpdated: new Date("2024-01-15T11:00:00"),
    unitPrice: 32000,
    totalValue: 2560000
  }
];

// 생산 계획 데모 데이터
export const PRODUCTION_DEMO_DATA: ProductionPlan[] = [
  {
    id: "prod-001",
    customer: "우신",
    productName: "프리미엄 시트 어셈블리",
    targetQuantity: 3000,
    completedQuantity: 2800,
    unit: "EA",
    dueDate: new Date("2024-01-19T18:00:00"), // 이번 주 금요일
    status: "at-risk",
    weeklyTarget: 3000,
    currentWeekProgress: 93.3 // 2800/3000 * 100
  },
  {
    id: "prod-002", 
    customer: "현대모비스",
    productName: "전동 시트 모터",
    targetQuantity: 1500,
    completedQuantity: 1450,
    unit: "EA",
    dueDate: new Date("2024-01-20T17:00:00"),
    status: "on-track",
    weeklyTarget: 1500,
    currentWeekProgress: 96.7
  },
  {
    id: "prod-003",
    customer: "만도",
    productName: "시트 슬라이드 레일",
    targetQuantity: 2200,
    completedQuantity: 1800,
    unit: "EA", 
    dueDate: new Date("2024-01-18T16:00:00"),
    status: "delayed",
    weeklyTarget: 2200,
    currentWeekProgress: 81.8
  }
];

// 공급업체 데모 데이터
export const SUPPLIER_DEMO_DATA: SupplierInfo[] = [
  {
    id: "sup-001",
    name: "대창공업",
    contactPerson: "김철수",
    phone: "02-1234-5678",
    emergencyAvailable: true,
    priceIncrease: 25, // 25% 가격 상승
    deliveryDays: 1,
    reliability: "high"
  },
  {
    id: "sup-002",
    name: "한국정밀",
    contactPerson: "이영희", 
    phone: "031-9876-5432",
    emergencyAvailable: true,
    priceIncrease: 15,
    deliveryDays: 2,
    reliability: "high"
  },
  {
    id: "sup-003",
    name: "동양금속",
    contactPerson: "박민수",
    phone: "032-5555-7777",
    emergencyAvailable: false,
    priceIncrease: 0,
    deliveryDays: 5,
    reliability: "medium"
  }
];

// 교대 근무 데모 데이터
export const WORK_SHIFT_DEMO_DATA: WorkShift[] = [
  {
    id: "shift-001",
    shiftName: "주간 정규",
    startTime: "08:00",
    endTime: "17:00",
    workers: 25,
    efficiency: 100,
    available: true
  },
  {
    id: "shift-002", 
    shiftName: "야간 정규",
    startTime: "18:00",
    endTime: "02:00",
    workers: 18,
    efficiency: 85,
    available: true
  },
  {
    id: "shift-003",
    shiftName: "주말 특근",
    startTime: "09:00", 
    endTime: "18:00",
    workers: 12,
    efficiency: 90,
    available: true
  },
  {
    id: "shift-004",
    shiftName: "긴급 연장",
    startTime: "17:00",
    endTime: "21:00", 
    workers: 15,
    efficiency: 75,
    available: true
  }
];

// AI 챗봇 응답 생성 함수들
export const generateInventoryResponse = (productName: string): string => {
  const item = INVENTORY_DEMO_DATA.find(item => 
    item.name.toLowerCase().includes(productName.toLowerCase()) ||
    productName.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
  );

  if (item) {
    const statusText = item.status === "sufficient" ? "충분" : 
                     item.status === "low" ? "부족 위험" : "긴급 보충 필요";
    
    return `현재 ${item.name} 재고는 ${item.currentStock.toLocaleString()}${item.unit}입니다. ${item.customer} 납품 일정 기준으로 약 ${item.daysRemaining}일 분량입니다.\n\n📍 보관 위치: ${item.location}\n⚠️ 상태: ${statusText}\n🕐 최종 업데이트: ${item.lastUpdated.toLocaleString('ko-KR')}`;
  }
  
  return "해당 제품의 재고 정보를 찾을 수 없습니다. 제품명을 다시 확인해주세요.";
};

export const generateProductionResponse = (customerName: string): string => {
  const plans = PRODUCTION_DEMO_DATA.filter(plan => 
    plan.customer.toLowerCase().includes(customerName.toLowerCase())
  );

  if (plans.length > 0) {
    const plan = plans[0];
    const shortage = plan.targetQuantity - plan.completedQuantity;
    const statusText = plan.status === "on-track" ? "문제없음" :
                      plan.status === "at-risk" ? "위험" : "지연";

    return `이번 주 ${plan.customer} 납품 목표 ${plan.targetQuantity.toLocaleString()}${plan.unit} 중 ${plan.completedQuantity.toLocaleString()}${plan.unit}는 확보 가능합니다. ${shortage.toLocaleString()}${plan.unit} 부족 위험이 있습니다.\n\n📊 진행률: ${plan.currentWeekProgress.toFixed(1)}%\n⚠️ 상태: ${statusText}\n📅 납기: ${plan.dueDate.toLocaleDateString('ko-KR')}`;
  }

  return "해당 고객사의 납품 계획을 찾을 수 없습니다.";
};

export const generateSolutionResponse = (): string => {
  const emergencySupplier = SUPPLIER_DEMO_DATA.find(s => s.emergencyAvailable);
  const extraShift = WORK_SHIFT_DEMO_DATA.find(s => s.shiftName.includes("긴급") || s.shiftName.includes("연장"));
  
  if (emergencySupplier && extraShift) {
    const costIncrease = Math.round(200 * (emergencySupplier.priceIncrease / 100) * 10000); // 200EA * 가격상승률 * 단가(가정)
    
    return `해결책은 다음과 같습니다:\n\n1️⃣ **라인 교대 편성**\n   • ${extraShift.shiftName} 투입 (${extraShift.startTime}-${extraShift.endTime})\n   • 추가 생산능력: ${extraShift.workers}명, 효율 ${extraShift.efficiency}%\n\n2️⃣ **긴급 조달**\n   • ${emergencySupplier.name} 긴급 발주\n   • 납기: ${emergencySupplier.deliveryDays}일 내 공급 가능\n   • 추가 비용: 약 ${costIncrease.toLocaleString()}원 (${emergencySupplier.priceIncrease}% 상승)\n\n✅ **결과**: 납기 충족 가능\n📞 **담당자**: ${emergencySupplier.contactPerson} (${emergencySupplier.phone})`;
  }

  return "현재 이용 가능한 해결책을 분석 중입니다.";
};
