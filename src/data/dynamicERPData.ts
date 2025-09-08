import type { Customer } from '../context/CustomerContext';

// Product mapping based on customer industry
const getProductsByIndustry = (industry: string) => {
  const productMap: { [key: string]: Array<{code: string, name: string, basePrice: number}> } = {
    '제조업': [
      { code: 'SSM-001', name: '스마트 센서 모듈', basePrice: 850000 },
      { code: 'IOT-200', name: 'IoT 제어기', basePrice: 1200000 },
      { code: 'AC-300', name: '자동화 컨트롤러', basePrice: 2500000 },
      { code: 'WMD-150', name: '무선 모니터링 장치', basePrice: 950000 }
    ],
    'IT솔루션': [
      { code: 'SW-001', name: '클라우드 솔루션 패키지', basePrice: 3000000 },
      { code: 'DB-002', name: '데이터베이스 시스템', basePrice: 5000000 },
      { code: 'SEC-003', name: '보안 솔루션', basePrice: 2800000 },
      { code: 'AI-004', name: 'AI 분석 플랫폼', basePrice: 8000000 }
    ],
    '엔지니어링': [
      { code: 'CAD-001', name: 'CAD 설계 시스템', basePrice: 4500000 },
      { code: 'SIM-002', name: '시뮬레이션 소프트웨어', basePrice: 6000000 },
      { code: 'PLM-003', name: 'PLM 통합 솔루션', basePrice: 12000000 },
      { code: 'QC-004', name: '품질관리 시스템', basePrice: 3500000 }
    ],
    '기술서비스': [
      { code: 'MAINT-001', name: '유지보수 서비스', basePrice: 1500000 },
      { code: 'CONSULT-002', name: '기술 컨설팅', basePrice: 2000000 },
      { code: 'TRAIN-003', name: '기술 교육 프로그램', basePrice: 800000 },
      { code: 'SUPPORT-004', name: '24시간 기술지원', basePrice: 1200000 }
    ],
    '시스템개발': [
      { code: 'ERP-001', name: 'ERP 시스템', basePrice: 15000000 },
      { code: 'MES-002', name: 'MES 솔루션', basePrice: 8000000 },
      { code: 'WMS-003', name: '창고관리 시스템', basePrice: 5500000 },
      { code: 'CRM-004', name: 'CRM 플랫폼', basePrice: 4000000 }
    ]
  };
  
  return productMap[industry] || productMap['제조업']; // 기본값으로 제조업 제품 사용
};

// Simple hash function for consistent pseudo-random values
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Seeded random function for consistent values
function seededRandom(seed: string, min: number = 0, max: number = 1): number {
  const hash = simpleHash(seed);
  const normalized = (hash % 10000) / 10000; // Normalize to 0-1
  return min + normalized * (max - min);
}

// Dynamic ERP data generator that uses customer context data
export function generateDynamicERPData(customers: Customer[]) {
  // Create sales orders based on actual customers
  const salesOrders = customers.flatMap((customer, index) => {
    const orderCount = Math.min(customer.totalOrders || 1, 3); // Limit to 3 orders per customer
    const availableProducts = getProductsByIndustry(customer.industry || '제조업');
    
    return Array.from({ length: orderCount }, (_, orderIndex) => {
      const product = availableProducts[orderIndex % availableProducts.length];
      const seed = `${customer.id}-${orderIndex}`;
      const quantity = Math.floor(seededRandom(seed + '-qty', 10, 110));
      
      return {
        id: `SO-${customer.id}-${orderIndex + 1}`,
        orderNumber: `SO-2024-${String(index * 10 + orderIndex + 1).padStart(4, '0')}`,
        customerId: customer.id,
        customerName: customer.company,
        customerContact: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        salesPerson: customer.representative || '영업팀',
        orderDate: new Date(Date.now() - seededRandom(seed + '-orderdate', 0, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requestedDeliveryDate: new Date(Date.now() + seededRandom(seed + '-deliverydate', 7, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: ['진행중', '완료', '대기'][Math.floor(seededRandom(seed + '-status', 0, 3))],
        totalAmount: product.basePrice * quantity + Math.floor(seededRandom(seed + '-amount', 0, 1000000)), // 기본가격 * 수량 + 변동분
        items: [
          {
            productCode: product.code,
            productName: product.name,
            quantity: quantity,
            unitPrice: product.basePrice + Math.floor(seededRandom(seed + '-unitprice', 0, 200000)), // 기본가격 + 변동분
          }
        ]
      };
    });
  });

  // Create production orders linked to sales orders
  const productionOrders = salesOrders.map((salesOrder, index) => ({
    id: `PO-${salesOrder.id}`,
    orderNumber: `PO-2024-${String(index + 1).padStart(4, '0')}`,
    salesOrderId: salesOrder.id,
    productCode: salesOrder.items[0].productCode,
    productName: salesOrder.items[0].productName,
    quantity: salesOrder.items[0].quantity,
    plannedStartDate: salesOrder.orderDate,
    plannedEndDate: salesOrder.requestedDeliveryDate,
    actualStartDate: seededRandom(salesOrder.id + '-actualstart', 0, 1) > 0.5 ? salesOrder.orderDate : null,
    actualEndDate: seededRandom(salesOrder.id + '-actualend', 0, 1) > 0.7 ? salesOrder.requestedDeliveryDate : null,
    status: ['계획', '진행중', '완료', '지연'][Math.floor(seededRandom(salesOrder.id + '-status', 0, 4))],
    priority: ['높음', '보통', '낮음'][Math.floor(seededRandom(salesOrder.id + '-priority', 0, 3))],
    workOrders: [
      {
        id: `WO-${index + 1}-1`,
        workOrderNumber: `WO-${String(index + 1).padStart(4, '0')}-001`,
        operation: '조립',
        workCenter: 'WC-A01',
        plannedStartDate: salesOrder.orderDate,
        plannedEndDate: salesOrder.requestedDeliveryDate,
        status: ['대기', '진행중', '완료'][Math.floor(seededRandom(salesOrder.id + '-workstatus', 0, 3))],
        assignedWorker: '작업자-' + (Math.floor(seededRandom(salesOrder.id + '-worker', 1, 11))),
        materialsConsumed: [],
        instructions: '표준 작업 지시서에 따라 진행'
      }
    ]
  }));

  return {
    customers,
    salesOrders,
    productionOrders,
    // Add other ERP data as needed
    purchaseOrders: [],
    inventory: [],
    suppliers: []
  };
}

// Helper function to get customer by ID
export function getCustomerById(customers: Customer[], customerId: string): Customer | undefined {
  return customers.find(customer => customer.id === customerId);
}

// Helper function to enrich production orders with customer data
export function enrichProductionOrdersWithCustomerData(productionOrders: any[], salesOrders: any[], customers: Customer[]) {
  return productionOrders.map(order => {
    const relatedSalesOrder = salesOrders.find(so => so.id === order.salesOrderId);
    const customer = relatedSalesOrder ? getCustomerById(customers, relatedSalesOrder.customerId) : null;
    
    return {
      ...order,
      customerName: customer?.company || relatedSalesOrder?.customerName || '고객정보없음',
      customerContact: customer?.name || relatedSalesOrder?.customerContact || '',
      customerEmail: customer?.email || relatedSalesOrder?.customerEmail || '',
      customerPhone: customer?.phone || relatedSalesOrder?.customerPhone || '',
      salesPerson: customer?.representative || relatedSalesOrder?.salesPerson || '',
      orderAmount: relatedSalesOrder?.totalAmount || 0,
      requestedDeliveryDate: relatedSalesOrder?.requestedDeliveryDate || order.plannedEndDate
    };
  });
}
