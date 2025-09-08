// ERP 시스템 타임라인 분석 및 날짜 기반 필터링 유틸리티

import type { 
  SalesOrder, 
  PurchaseOrder, 
  ProductionOrder, 
  Shipment,
 
} from './massiveERPData';

// 날짜 범위 타입 정의
export type DateRangeType = 
  | 'today'
  | 'yesterday' 
  | 'this_week'
  | 'last_week'
  | '2_weeks_ago'
  | 'this_month'
  | 'last_month'
  | '2_months_ago'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface TimelineNode {
  id: string;
  type: 'order' | 'purchase' | 'inbound' | 'production' | 'work_order' | 'shipment' | 'delivery';
  date: Date;
  status: string;
  description: string;
  relatedIds: string[];
  customer?: string;
  supplier?: string;
  product?: string;
  quantity?: number;
  amount?: number;
}

export interface CompanyProductTimeline {
  companyName: string;
  companyType: 'customer' | 'supplier';
  products: {
    productCode: string;
    productName: string;
    timeline: TimelineNode[];
    totalOrders: number;
    totalAmount: number;
    avgLeadTime: number;
    onTimeDeliveryRate: number;
  }[];
  totalValue: number;
  orderCount: number;
}

// 날짜 범위 계산 함수
export const getDateRange = (rangeType: DateRangeType, customStart?: Date, customEnd?: Date): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (rangeType) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: '오늘'
      };
      
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: '어제'
      };
      
    case 'this_week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일부터
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      return {
        start: startOfWeek,
        end: endOfWeek,
        label: '이번 주'
      };
      
    case 'last_week':
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      return {
        start: lastWeekStart,
        end: lastWeekEnd,
        label: '지난 주'
      };
      
    case '2_weeks_ago':
      const twoWeeksAgoStart = new Date(today);
      twoWeeksAgoStart.setDate(today.getDate() - today.getDay() - 14);
      const twoWeeksAgoEnd = new Date(twoWeeksAgoStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      return {
        start: twoWeeksAgoStart,
        end: twoWeeksAgoEnd,
        label: '2주 전'
      };
      
    case 'this_month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return {
        start: startOfMonth,
        end: endOfMonth,
        label: '이번 달'
      };
      
    case 'last_month':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return {
        start: lastMonthStart,
        end: lastMonthEnd,
        label: '지난 달'
      };
      
    case '2_months_ago':
      const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const twoMonthsAgoEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      return {
        start: twoMonthsAgoStart,
        end: twoMonthsAgoEnd,
        label: '2달 전'
      };
      
    case 'this_quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
      const quarterEnd = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
      return {
        start: quarterStart,
        end: quarterEnd,
        label: `${now.getFullYear()}년 ${currentQuarter + 1}분기`
      };
      
    case 'last_quarter':
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      const year = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const quarter = lastQuarter < 0 ? 3 : lastQuarter;
      const lastQuarterStart = new Date(year, quarter * 3, 1);
      const lastQuarterEnd = new Date(year, (quarter + 1) * 3, 0, 23, 59, 59, 999);
      return {
        start: lastQuarterStart,
        end: lastQuarterEnd,
        label: `${year}년 ${quarter + 1}분기`
      };
      
    case 'this_year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return {
        start: yearStart,
        end: yearEnd,
        label: `${now.getFullYear()}년`
      };
      
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom date range requires start and end dates');
      }
      return {
        start: customStart,
        end: customEnd,
        label: `${customStart.toLocaleDateString('ko-KR')} ~ ${customEnd.toLocaleDateString('ko-KR')}`
      };
      
    default:
      return getDateRange('this_week');
  }
};

// 날짜가 범위 내에 있는지 확인
export const isDateInRange = (date: Date, range: DateRange): boolean => {
  return date >= range.start && date <= range.end;
};

// 타임라인 노드 생성 함수들
export const createOrderTimelineNode = (order: SalesOrder): TimelineNode => ({
  id: order.id,
  type: 'order',
  date: order.orderDate,
  status: order.status,
  description: `${order.customerName} - ${order.items.map(i => i.productName).join(', ')}`,
  relatedIds: [order.id],
  customer: order.customerName,
  quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
  amount: order.totalAmount
});

export const createPurchaseTimelineNode = (purchase: PurchaseOrder): TimelineNode => ({
  id: purchase.id,
  type: 'purchase',
  date: purchase.orderDate,
  status: purchase.status,
  description: `${purchase.supplierName} - ${purchase.items.map(i => i.materialName).join(', ')}`,
  relatedIds: [purchase.id],
  supplier: purchase.supplierName,
  quantity: purchase.items.reduce((sum, item) => sum + item.quantity, 0),
  amount: purchase.totalAmount
});

export const createProductionTimelineNode = (production: ProductionOrder): TimelineNode => ({
  id: production.id,
  type: 'production',
  date: production.actualStartDate || production.plannedStartDate,
  status: production.status,
  description: `${production.productName} 생산 (${production.actualQuantity || production.plannedQuantity}EA)`,
  relatedIds: [production.id, production.salesOrderId],
  product: production.productName,
  quantity: production.actualQuantity || production.plannedQuantity
});

export const createShipmentTimelineNode = (shipment: Shipment): TimelineNode => ({
  id: shipment.id,
  type: 'shipment',
  date: shipment.actualShipDate || shipment.plannedShipDate,
  status: shipment.status,
  description: `${shipment.customerName} 배송 - ${shipment.items.map(i => i.productName).join(', ')}`,
  relatedIds: [shipment.id, shipment.salesOrderId],
  customer: shipment.customerName,
  quantity: shipment.items.reduce((sum, item) => sum + item.quantity, 0)
});

// 회사별 제품 타임라인 생성
export const generateCompanyProductTimeline = (
  salesOrders: SalesOrder[],
  purchaseOrders: PurchaseOrder[],
  productionOrders: ProductionOrder[],
  shipments: Shipment[],
  dateRange: DateRange
): CompanyProductTimeline[] => {
  const companyMap = new Map<string, CompanyProductTimeline>();
  
  // 고객사별 주문 데이터 처리
  salesOrders
    .filter(order => isDateInRange(order.orderDate, dateRange))
    .forEach(order => {
      if (!companyMap.has(order.customerName)) {
        companyMap.set(order.customerName, {
          companyName: order.customerName,
          companyType: 'customer',
          products: [],
          totalValue: 0,
          orderCount: 0
        });
      }
      
      const company = companyMap.get(order.customerName)!;
      company.totalValue += order.totalAmount;
      company.orderCount += 1;
      
      order.items.forEach(item => {
        let product = company.products.find(p => p.productCode === item.productCode);
        if (!product) {
          product = {
            productCode: item.productCode,
            productName: item.productName,
            timeline: [],
            totalOrders: 0,
            totalAmount: 0,
            avgLeadTime: 0,
            onTimeDeliveryRate: 0
          };
          company.products.push(product);
        }
        
        product.timeline.push(createOrderTimelineNode(order));
        product.totalOrders += 1;
        product.totalAmount += item.totalPrice;
        
        // 관련 생산 주문 추가
        const relatedProduction = productionOrders.find(p => 
          p.salesOrderId === order.id && p.productCode === item.productCode
        );
        if (relatedProduction && isDateInRange(relatedProduction.actualStartDate || relatedProduction.plannedStartDate, dateRange)) {
          product.timeline.push(createProductionTimelineNode(relatedProduction));
        }
        
        // 관련 배송 추가
        const relatedShipment = shipments.find(s => 
          s.salesOrderId === order.id && s.items.some(si => si.productCode === item.productCode)
        );
        if (relatedShipment && relatedShipment.actualShipDate && isDateInRange(relatedShipment.actualShipDate, dateRange)) {
          product.timeline.push(createShipmentTimelineNode(relatedShipment));
        }
        
        // 타임라인 정렬
        product.timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
      });
    });
  
  // 공급업체별 구매 데이터 처리
  purchaseOrders
    .filter(order => isDateInRange(order.orderDate, dateRange))
    .forEach(order => {
      if (!companyMap.has(order.supplierName)) {
        companyMap.set(order.supplierName, {
          companyName: order.supplierName,
          companyType: 'supplier',
          products: [],
          totalValue: 0,
          orderCount: 0
        });
      }
      
      const company = companyMap.get(order.supplierName)!;
      company.totalValue += order.totalAmount;
      company.orderCount += 1;
      
      order.items.forEach(item => {
        let product = company.products.find(p => p.productCode === item.materialCode);
        if (!product) {
          product = {
            productCode: item.materialCode,
            productName: item.materialName,
            timeline: [],
            totalOrders: 0,
            totalAmount: 0,
            avgLeadTime: 0,
            onTimeDeliveryRate: 0
          };
          company.products.push(product);
        }
        
        product.timeline.push(createPurchaseTimelineNode(order));
        product.totalOrders += 1;
        product.totalAmount += item.totalPrice;
        
        // 타임라인 정렬
        product.timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
      });
    });
  
  return Array.from(companyMap.values());
};

// 기간별 통계 생성
export const generatePeriodStatistics = (
  companyTimelines: CompanyProductTimeline[],
  dateRange: DateRange
) => {
  const customers = companyTimelines.filter(c => c.companyType === 'customer');
  const suppliers = companyTimelines.filter(c => c.companyType === 'supplier');
  
  return {
    period: dateRange.label,
    dateRange,
    summary: {
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      totalSalesAmount: customers.reduce((sum, c) => sum + c.totalValue, 0),
      totalPurchaseAmount: suppliers.reduce((sum, c) => sum + c.totalValue, 0),
      totalOrders: customers.reduce((sum, c) => sum + c.orderCount, 0),
      totalPurchases: suppliers.reduce((sum, c) => sum + c.orderCount, 0)
    },
    topCustomers: customers
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5),
    topSuppliers: suppliers
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5),
    productStats: companyTimelines
      .flatMap(c => c.products)
      .reduce((acc, product) => {
        const existing = acc.find(p => p.productCode === product.productCode);
        if (existing) {
          existing.totalOrders += product.totalOrders;
          existing.totalAmount += product.totalAmount;
        } else {
          acc.push({
            productCode: product.productCode,
            productName: product.productName,
            totalOrders: product.totalOrders,
            totalAmount: product.totalAmount
          });
        }
        return acc;
      }, [] as Array<{productCode: string, productName: string, totalOrders: number, totalAmount: number}>)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10)
  };
};

// 사용 예시 함수
export const getTimelineForPeriod = (
  period: DateRangeType,
  salesOrders: SalesOrder[],
  purchaseOrders: PurchaseOrder[],
  productionOrders: ProductionOrder[],
  shipments: Shipment[]
) => {
  const dateRange = getDateRange(period);
  const companyTimelines = generateCompanyProductTimeline(
    salesOrders,
    purchaseOrders,
    productionOrders,
    shipments,
    dateRange
  );
  const statistics = generatePeriodStatistics(companyTimelines, dateRange);
  
  return {
    dateRange,
    companyTimelines,
    statistics
  };
};

// 챗봇용 응답 생성 함수
export const generateTimelineResponse = (
  period: DateRangeType,
  companyName?: string,
  productName?: string
): string => {
  const dateRange = getDateRange(period);
  
  let response = `📅 **${dateRange.label}** (${dateRange.start.toLocaleDateString('ko-KR')} ~ ${dateRange.end.toLocaleDateString('ko-KR')}) 기간의 `;
  
  if (companyName && productName) {
    response += `${companyName} ${productName} 관련 타임라인을 조회합니다.`;
  } else if (companyName) {
    response += `${companyName} 관련 모든 거래 내역을 조회합니다.`;
  } else if (productName) {
    response += `${productName} 관련 모든 거래 내역을 조회합니다.`;
  } else {
    response += `전체 ERP 활동 내역을 조회합니다.`;
  }
  
  return response;
};
