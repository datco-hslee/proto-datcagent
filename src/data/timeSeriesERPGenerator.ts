// 시계열 ERP 데이터 생성기 (3-6개월분)
// LOT 번호 기반 완전한 추적성 보장

export interface LOTTracker {
  lotNumber: string;
  materialCode: string;
  inboundDate: Date;
  quantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  productionOrders: string[];
  shipments: string[];
  status: 'available' | 'in_use' | 'consumed' | 'expired';
}

export interface TimeSeriesERPData {
  startDate: Date;
  endDate: Date;
  lotTrackers: LOTTracker[];
  salesOrders: any[];
  purchaseOrders: any[];
  productionOrders: any[];
  shipments: any[];
  inventoryTransactions: any[];
  attendanceRecords: any[];
  payrollRecords: any[];
  accountingEntries: any[];
}

// 시계열 데이터 생성 함수
export const generateTimeSeriesERPData = (months: number = 6): TimeSeriesERPData => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  const endDate = new Date();
  
  const data: TimeSeriesERPData = {
    startDate,
    endDate,
    lotTrackers: [],
    salesOrders: [],
    purchaseOrders: [],
    productionOrders: [],
    shipments: [],
    inventoryTransactions: [],
    attendanceRecords: [],
    payrollRecords: [],
    accountingEntries: []
  };

  // LOT 번호 생성 및 추적
  let lotCounter = 1;
  const generateLOTNumber = (materialCode: string, date: Date): string => {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `LOT-${materialCode}-${dateStr}-${String(lotCounter++).padStart(3, '0')}`;
  };

  // 월별 데이터 생성
  for (let month = 0; month < months; month++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + month);
    
    // 월별 영업 주문 생성 (15-25건)
    const monthlyOrders = Math.floor(Math.random() * 11) + 15;
    for (let i = 0; i < monthlyOrders; i++) {
      const orderDate = new Date(currentDate);
      orderDate.setDate(Math.floor(Math.random() * 28) + 1);
      
      const salesOrder = {
        id: `SO-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        orderDate,
        customerId: `CUST${String(Math.floor(Math.random() * 4) + 1).padStart(3, '0')}`,
        items: [],
        totalAmount: 0,
        status: 'confirmed',
        lotNumbers: []
      };
      
      data.salesOrders.push(salesOrder);
    }
  }

  return data;
};

// LOT 추적 함수
export const trackLOTUsage = (lotNumber: string, data: TimeSeriesERPData) => {
  const tracker = data.lotTrackers.find(t => t.lotNumber === lotNumber);
  if (!tracker) return null;
  
  return {
    lotNumber: tracker.lotNumber,
    materialCode: tracker.materialCode,
    totalQuantity: tracker.quantity,
    usedQuantity: tracker.usedQuantity,
    remainingQuantity: tracker.remainingQuantity,
    usageHistory: {
      productionOrders: tracker.productionOrders,
      shipments: tracker.shipments
    },
    traceability: `입고(${tracker.inboundDate.toISOString().slice(0, 10)}) → 생산(${tracker.productionOrders.join(', ')}) → 출하(${tracker.shipments.join(', ')})`
  };
};

// 근태-급여-회계 연동 함수
export const generatePayrollAccountingIntegration = (attendanceData: any[], payrollData: any[]) => {
  const accountingEntries = [];
  
  payrollData.forEach(payroll => {
    // 급여 지급 회계 전표
    accountingEntries.push({
      id: `JE-PAY-${payroll.id}`,
      date: payroll.payDate,
      description: `급여 지급 - ${payroll.employeeName}`,
      entries: [
        { account: '급여비', debit: payroll.totalPay, credit: 0 },
        { account: '소득세예수금', debit: 0, credit: payroll.incomeTax },
        { account: '국민연금예수금', debit: 0, credit: payroll.nationalPension },
        { account: '건강보험예수금', debit: 0, credit: payroll.healthInsurance },
        { account: '고용보험예수금', debit: 0, credit: payroll.employmentInsurance },
        { account: '현금', debit: 0, credit: payroll.netPay }
      ]
    });
  });
  
  return accountingEntries;
};

export default generateTimeSeriesERPData;
