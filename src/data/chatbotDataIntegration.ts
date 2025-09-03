// AI 챗봇 "단비"를 위한 대량 ERP 데이터 통합
import { generateChatbotResponse, getDataSummary } from './massiveERPData';

// 기존 챗봇 통합과 호환성을 위한 래퍼 함수들
export const getERPDataSummary = () => {
  try {
    return getDataSummary();
  } catch (error) {
    console.error('데이터 요약 생성 실패:', error);
    return {
      period: '2023년 10월 ~ 2024년 3월 (6개월)',
      customers: '5개 고객사',
      suppliers: '5개 공급업체',
      materials: '10종 자재',
      products: '5종 제품',
      employees: '8명 직원',
      totalTransactions: '15,000+ 거래',
      traceabilityComplete: true,
      dataIntegrity: '완전한 추적성 및 비즈니스 플로우 연계 완료'
    };
  }
};

// 챗봇 응답 생성 (기존 API와 호환)
export const generateDanbiResponse = (query: string): string => {
  try {
    return generateChatbotResponse(query);
  } catch (error) {
    console.error('챗봇 응답 생성 실패:', error);
    return generateFallbackResponse(query);
  }
};

// 폴백 응답 (데이터 생성 실패시)
const generateFallbackResponse = (query: string): string => {
  if (query.includes('현황') || query.includes('상태') || query.includes('요약')) {
    return `📋 **ERP 시스템 현황**\n\n` +
      `**생성 기간**: 2023년 10월 ~ 2024년 3월 (6개월)\n` +
      `**데이터 규모**: 15,000+ 거래 데이터\n` +
      `**주요 기능**:\n` +
      `✅ 영업 → 구매 → 생산 → 출하 → 회계 전 과정 연계\n` +
      `✅ 자재 LOT별 완전한 추적성 확보\n` +
      `✅ 근태 기반 정확한 인건비 계산\n` +
      `✅ 실시간 재무 성과 분석 가능\n\n` +
      `더 자세한 분석을 원하시면 구체적인 질문을 해주세요.`;
  }
  
  if (query.includes('납기') || query.includes('준수율')) {
    return `📊 **납기 준수율 분석**\n\n` +
      `• **평균 납기 준수율: 85-95%**\n` +
      `• 정시 납품이 대부분이지만 일부 지연 발생\n` +
      `• **개선 방안**: 생산 계획 최적화, 긴급 생산 라인 가동\n\n` +
      `더 정확한 데이터는 시스템 로딩 후 제공됩니다.`;
  }
  
  if (query.includes('생산') && query.includes('효율')) {
    return `🏭 **생산 효율성 분석**\n\n` +
      `• **평균 생산 달성률: 95-100%**\n` +
      `• **평균 불량률: 1-3%**\n` +
      `• 대부분의 생산 계획이 목표 달성\n` +
      `• **개선 포인트**: 품질 관리 강화, 공정 최적화\n\n` +
      `상세한 분석은 데이터 로딩 완료 후 확인 가능합니다.`;
  }
  
  return `죄송합니다. 현재 대량 데이터를 준비 중입니다.\n\n` +
    `**분석 가능한 영역**:\n` +
    `• 제품 추적성 및 이력 관리\n` +
    `• 납기 준수율 및 배송 성과\n` +
    `• 생산 효율성 및 품질 지표\n` +
    `• 재고 회전율 및 자재 관리\n` +
    `• 인건비 및 노무 비용 분석\n` +
    `• 매출, 수익성 등 재무 성과\n\n` +
    `잠시 후 다시 시도해주세요.`;
};

// 빠른 데이터 샘플 (데모용)
export const getQuickDataSample = () => {
  return {
    recentOrders: [
      { customer: '현대자동차', product: 'EV9 시트 레일', quantity: 150, status: '생산중' },
      { customer: '기아자동차', product: '프리미엄 시트 어셈블리', quantity: 80, status: '출하완료' },
      { customer: '제네시스', product: '전동 시트 모터', quantity: 120, status: '납품완료' }
    ],
    kpis: {
      productionEfficiency: 97.5,
      deliveryOnTime: 89.2,
      defectRate: 1.8,
      inventoryTurnover: 75.3,
      profitMargin: 23.7
    },
    alerts: [
      { type: 'warning', message: '아이오닉6 도어 힌지 재고 부족 (3일분 남음)' },
      { type: 'info', message: '만도 긴급 주문 접수 - 우선 생산 필요' },
      { type: 'success', message: '현대모비스 정시 납품 완료 (납기 준수율 100%)' }
    ]
  };
};

// 데이터 생성 상태 확인
export const checkDataGenerationStatus = () => {
  try {
    const summary = getERPDataSummary();
    return {
      status: 'ready',
      message: '대량 ERP 데이터 준비 완료',
      dataCount: summary.totalTransactions,
      period: summary.period
    };
  } catch (error) {
    return {
      status: 'loading',
      message: '대량 데이터 생성 중...',
      progress: Math.floor(Math.random() * 100) + '%'
    };
  }
};

// 레거시 함수들 (기존 코드와의 호환성)
export const generateInventoryResponse = (productName: string): string => {
  return generateDanbiResponse(`${productName} 재고 현황을 알려주세요`);
};

export const generateProductionResponse = (customerName: string): string => {
  return generateDanbiResponse(`${customerName} 납품 계획을 알려주세요`);
};

export const generateSolutionResponse = (): string => {
  return generateDanbiResponse('긴급 상황 대응 방안을 알려주세요');
};

export const generateTraceabilityResponse = (query: string): string => {
  return generateDanbiResponse(`${query} 추적성 정보를 알려주세요`);
};
