// AI 챗봇 "단비"를 위한 데이터 통합 및 분석 함수들
import { generateComprehensiveERPData } from './comprehensiveData';
import { analyzeLaborCostsFromContext } from './employeeDataIntegration';

// 전체 데이터 생성 및 캐싱
let cachedERPData: any = null;

export const getERPData = () => {
  if (!cachedERPData) {
    cachedERPData = generateComprehensiveERPData();
  }
  return cachedERPData;
};

// 추적성 분석 함수들
export const traceProductToMaterials = (productionRecordId: string) => {
  const data = getERPData();
  const production = data.productionRecords.find((p: any) => p.id === productionRecordId);
  
  if (!production) return null;
  
  const materialsUsed = production.materialsUsed;
  const materialDetails = materialsUsed.map((material: any) => {
    const inboundRecord = data.materialInbound.find((m: any) => 
      m.materialCode === material.materialCode && m.lotNumber === material.lotNumber
    );
    return {
      ...material,
      supplier: inboundRecord?.supplierName,
      inboundDate: inboundRecord?.inboundDate,
      qualityStatus: inboundRecord?.qualityStatus
    };
  });
  
  return {
    production,
    materialsUsed: materialDetails
  };
};

export const traceDeliveryToProduction = (deliveryId: string) => {
  const data = getERPData();
  const delivery = data.deliveryRecords.find((d: any) => d.id === deliveryId);
  
  if (!delivery) return null;
  
  const productionRecords = data.productionRecords.filter((p: any) => 
    delivery.productionRecordIds.includes(p.id)
  );
  
  return {
    delivery,
    productionRecords,
    traceability: productionRecords.map((prod: any) => traceProductToMaterials(prod.id))
  };
};

// 분석 함수들
export const analyzeOnTimeDelivery = (customerId?: string, startDate?: Date, endDate?: Date) => {
  const data = getERPData();
  let deliveries = data.deliveryRecords;
  
  if (customerId) {
    deliveries = deliveries.filter((d: any) => d.customerId === customerId);
  }
  
  if (startDate && endDate) {
    deliveries = deliveries.filter((d: any) => 
      d.deliveryDate >= startDate && d.deliveryDate <= endDate
    );
  }
  
  const totalDeliveries = deliveries.length;
  const onTimeDeliveries = deliveries.filter((d: any) => d.onTimeDelivery).length;
  const onTimeRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;
  
  return {
    totalDeliveries,
    onTimeDeliveries,
    lateDeliveries: totalDeliveries - onTimeDeliveries,
    onTimeRate: Math.round(onTimeRate * 100) / 100
  };
};

export const analyzeProductionEfficiency = (startDate?: Date, endDate?: Date) => {
  const data = getERPData();
  let productions = data.productionRecords;
  
  if (startDate && endDate) {
    productions = productions.filter((p: any) => 
      p.startTime >= startDate && p.endTime <= endDate
    );
  }
  
  const totalPlanned = productions.reduce((sum: number, p: any) => sum + p.plannedQuantity, 0);
  const totalActual = productions.reduce((sum: number, p: any) => sum + p.actualQuantity, 0);
  const totalDefects = productions.reduce((sum: number, p: any) => sum + p.defectQuantity, 0);
  
  const efficiency = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;
  const defectRate = totalActual > 0 ? (totalDefects / totalActual) * 100 : 0;
  
  return {
    totalPlanned,
    totalActual,
    totalDefects,
    efficiency: Math.round(efficiency * 100) / 100,
    defectRate: Math.round(defectRate * 100) / 100
  };
};

export const analyzeInventoryTurnover = (materialCode?: string) => {
  const data = getERPData();
  let inbounds = data.materialInbound;
  let outbounds = data.productionRecords.flatMap((p: any) => p.materialsUsed);
  
  if (materialCode) {
    inbounds = inbounds.filter((i: any) => i.materialCode === materialCode);
    outbounds = outbounds.filter((o: any) => o.materialCode === materialCode);
  }
  
  const totalInbound = inbounds.reduce((sum: number, i: any) => sum + i.quantity, 0);
  const totalOutbound = outbounds.reduce((sum: number, o: any) => sum + o.actualQuantity, 0);
  const turnoverRate = totalInbound > 0 ? (totalOutbound / totalInbound) * 100 : 0;
  
  return {
    totalInbound,
    totalOutbound,
    turnoverRate: Math.round(turnoverRate * 100) / 100,
    remainingStock: totalInbound - totalOutbound
  };
};

export const analyzeLaborCosts = (department?: string, month?: string) => {
  const data = getERPData();
  let payrolls = data.payrollRecords;
  
  if (department) {
    payrolls = payrolls.filter((p: any) => p.department === department);
  }
  
  if (month) {
    payrolls = payrolls.filter((p: any) => p.month === month);
  }
  
  const totalBaseSalary = payrolls.reduce((sum: number, p: any) => sum + p.baseSalary, 0);
  const totalOvertimePay = payrolls.reduce((sum: number, p: any) => sum + p.overtimePay, 0);
  const totalPay = payrolls.reduce((sum: number, p: any) => sum + p.totalPay, 0);
  const totalWorkHours = payrolls.reduce((sum: number, p: any) => sum + p.totalWorkHours, 0);
  const totalOvertimeHours = payrolls.reduce((sum: number, p: any) => sum + p.totalOvertimeHours, 0);
  
  return {
    employeeCount: payrolls.length,
    totalBaseSalary,
    totalOvertimePay,
    totalPay,
    totalWorkHours,
    totalOvertimeHours,
    averageHourlyRate: totalWorkHours > 0 ? totalPay / totalWorkHours : 0
  };
};

// 챗봇 응답 생성 함수들
export const generateTraceabilityResponse = (query: string): string => {
  const data = getERPData();
  
  // 제품 추적 쿼리
  if (query.includes('추적') || query.includes('이력')) {
    const recentDelivery = data.deliveryRecords[data.deliveryRecords.length - 1];
    const traceInfo = traceDeliveryToProduction(recentDelivery.id);
    
    if (traceInfo) {
      return `📦 **납품 추적 결과**\n\n` +
        `**납품 정보**: ${traceInfo.delivery.productName} ${traceInfo.delivery.quantity}EA\n` +
        `**고객**: ${traceInfo.delivery.customerName}\n` +
        `**납품일**: ${traceInfo.delivery.deliveryDate.toLocaleDateString('ko-KR')}\n\n` +
        `**생산 이력**:\n${traceInfo.productionRecords.map((p: any) => 
          `• 작업지시: ${p.workOrderId} (${p.workerName})\n` +
          `• 생산량: ${p.actualQuantity}EA (불량: ${p.defectQuantity}EA)`
        ).join('\n')}\n\n` +
        `**사용 자재**:\n${traceInfo.traceability[0]?.materialsUsed.map((m: any) => 
          `• ${m.materialName}: ${m.actualQuantity}EA (LOT: ${m.lotNumber})`
        ).join('\n') || '자료 없음'}`;
    }
  }
  
  // 납기 준수율 쿼리
  if (query.includes('납기') || query.includes('준수율')) {
    const analysis = analyzeOnTimeDelivery();
    return `📊 **납기 준수율 분석**\n\n` +
      `• 총 납품 건수: ${analysis.totalDeliveries}건\n` +
      `• 정시 납품: ${analysis.onTimeDeliveries}건\n` +
      `• 지연 납품: ${analysis.lateDeliveries}건\n` +
      `• **납기 준수율: ${analysis.onTimeRate}%**\n\n` +
      `${analysis.onTimeRate >= 95 ? '✅ 우수한 납기 관리' : 
        analysis.onTimeRate >= 85 ? '⚠️ 납기 관리 주의 필요' : '🚨 납기 개선 시급'}`;
  }
  
  // 생산 효율성 쿼리
  if (query.includes('생산') && (query.includes('효율') || query.includes('실적'))) {
    const analysis = analyzeProductionEfficiency();
    return `🏭 **생산 효율성 분석**\n\n` +
      `• 계획 생산량: ${analysis.totalPlanned.toLocaleString()}EA\n` +
      `• 실제 생산량: ${analysis.totalActual.toLocaleString()}EA\n` +
      `• 불량 수량: ${analysis.totalDefects.toLocaleString()}EA\n` +
      `• **생산 효율: ${analysis.efficiency}%**\n` +
      `• **불량률: ${analysis.defectRate}%**\n\n` +
      `${analysis.efficiency >= 95 ? '✅ 목표 달성' : 
        analysis.efficiency >= 85 ? '⚠️ 효율 개선 필요' : '🚨 생산성 향상 시급'}`;
  }
  
  // 재고 회전율 쿼리
  if (query.includes('재고') && (query.includes('회전') || query.includes('소모'))) {
    const analysis = analyzeInventoryTurnover();
    return `📦 **재고 회전율 분석**\n\n` +
      `• 총 입고량: ${analysis.totalInbound.toLocaleString()}EA\n` +
      `• 총 소모량: ${analysis.totalOutbound.toLocaleString()}EA\n` +
      `• **회전율: ${analysis.turnoverRate}%**\n` +
      `• 잔여 재고: ${analysis.remainingStock.toLocaleString()}EA\n\n` +
      `${analysis.turnoverRate >= 80 ? '✅ 적정 재고 관리' : 
        analysis.turnoverRate >= 60 ? '⚠️ 재고 최적화 필요' : '🚨 재고 과다 보유'}`;
  }
  
  // 인건비 분석 쿼리 (통합된 직원 데이터 사용)
  if (query.includes('인건비') || query.includes('급여') || query.includes('노무비')) {
    // 통합 모듈에서 실제 직원 데이터 기반 분석 사용
    const analysis = analyzeLaborCostsFromContext('생산부');
    return `💰 **인건비 분석 (생산부)**\n\n` +
      `• 직원 수: ${analysis.employeeCount}명\n` +
      `• 기본급 총액: ${analysis.totalBaseSalary.toLocaleString()}원\n` +
      `• 연장근무 수당: ${analysis.totalOvertimePay.toLocaleString()}원\n` +
      `• **총 인건비: ${analysis.totalPay.toLocaleString()}원**\n` +
      `• 총 근무시간: ${analysis.totalWorkHours.toLocaleString()}시간\n` +
      `• 평균 시급: ${Math.round(analysis.averageHourlyRate).toLocaleString()}원\n\n` +
      `📋 *실제 직원 관리 페이지 데이터 기반 분석 결과입니다.*`;
  }
  
  return "죄송합니다. 해당 쿼리에 대한 분석 결과를 찾을 수 없습니다. 다른 질문을 해주세요.";
};

// 데이터 요약 정보 제공
export const getDataSummary = () => {
  const data = getERPData();
  
  return {
    period: "2023년 10월 ~ 2024년 3월 (6개월)",
    materialInbound: `${data.materialInbound.length}건`,
    productionRecords: `${data.productionRecords.length}건`,
    deliveryRecords: `${data.deliveryRecords.length}건`,
    attendanceRecords: `${data.attendanceRecords.length}건`,
    payrollRecords: `${data.payrollRecords.length}건`,
    accountingEntries: `${data.accountingEntries.length}건`,
    traceabilityEnabled: true,
    dataConsistency: "모든 모듈 간 데이터 연동 완료"
  };
};
