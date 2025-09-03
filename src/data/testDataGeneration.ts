// 대량 ERP 데이터 생성 테스트
import { generateMassiveERPData, getDataSummary, generateChatbotResponse } from './massiveERPData';

// 데이터 생성 및 테스트
export const runDataGenerationTest = () => {
  try {
    console.log('🧪 ERP 대량 데이터 생성 테스트 시작...\n');
    
    // 1. 데이터 생성
    const data = generateMassiveERPData();
    
    // 2. 생성된 데이터 요약
    const summary = getDataSummary();
    console.log('📊 생성된 데이터 요약:');
    console.log(`• 기간: ${summary.period}`);
    console.log(`• 고객사: ${summary.customers}`);
    console.log(`• 공급업체: ${summary.suppliers}`);
    console.log(`• 자재: ${summary.materials}`);
    console.log(`• 제품: ${summary.products}`);
    console.log(`• 직원: ${summary.employees}`);
    console.log(`• 총 거래: ${summary.totalTransactions}`);
    console.log(`• 추적성: ${summary.traceabilityComplete ? '✅' : '❌'}`);
    console.log('');
    
    // 3. 상세 통계
    console.log('📈 상세 거래 통계:');
    console.log(`• 영업 주문: ${data.salesOrders.length}건`);
    console.log(`• 구매 주문: ${data.purchaseOrders.length}건`);
    console.log(`• 자재 입고: ${data.materialInbounds.length}건`);
    console.log(`• 생산 주문: ${data.productionOrders.length}건`);
    console.log(`• 출하/납품: ${data.shipments.length}건`);
    console.log(`• 근태 기록: ${data.attendanceRecords.length}건`);
    console.log(`• 급여 기록: ${data.payrollRecords.length}건`);
    console.log(`• 회계 분개: ${data.accountingEntries.length}건`);
    console.log('');
    
    // 4. 챗봇 응답 테스트
    console.log('🤖 AI 챗봇 응답 테스트:');
    console.log('');
    
    const testQueries = [
      '현재 시스템 현황을 알려주세요',
      '납기 준수율은 어떻게 되나요?',
      '생산 효율성을 분석해주세요',
      '재고 회전율은 어떤가요?',
      '인건비 분석 결과를 보여주세요',
      '재무 성과는 어떻게 되나요?'
    ];
    
    testQueries.forEach((query, index) => {
      console.log(`${index + 1}. 질문: "${query}"`);
      const response = generateChatbotResponse(query);
      console.log(`답변: ${response.substring(0, 200)}...\n`);
    });
    
    // 5. 데이터 무결성 검증
    console.log('🔍 데이터 무결성 검증:');
    
    // 영업 주문 → 생산 주문 연결 확인
    const linkedProductions = data.productionOrders.filter((po: any) => 
      data.salesOrders.some((so: any) => so.id === po.salesOrderId)
    );
    console.log(`• 영업-생산 연결: ${linkedProductions.length}/${data.productionOrders.length}건 (${Math.round(linkedProductions.length/data.productionOrders.length*100)}%)`);
    
    // 구매 주문 → 자재 입고 연결 확인
    const linkedInbounds = data.materialInbounds.filter((inb: any) => 
      data.purchaseOrders.some((po: any) => po.id === inb.purchaseOrderId)
    );
    console.log(`• 구매-입고 연결: ${linkedInbounds.length}/${data.materialInbounds.length}건 (${Math.round(linkedInbounds.length/data.materialInbounds.length*100)}%)`);
    
    // 생산 주문 → 출하 연결 확인
    const linkedShipments = data.shipments.filter((ship: any) => 
      ship.items.some((item: any) => 
        item.productionOrderIds.some((poId: string) => 
          data.productionOrders.some((po: any) => po.id === poId)
        )
      )
    );
    console.log(`• 생산-출하 연결: ${linkedShipments.length}/${data.shipments.length}건 (${Math.round(linkedShipments.length/data.shipments.length*100)}%)`);
    
    console.log('\n✅ ERP 대량 데이터 생성 테스트 완료!');
    
    return {
      success: true,
      summary,
      dataCount: {
        salesOrders: data.salesOrders.length,
        purchaseOrders: data.purchaseOrders.length,
        materialInbounds: data.materialInbounds.length,
        productionOrders: data.productionOrders.length,
        shipments: data.shipments.length,
        attendanceRecords: data.attendanceRecords.length,
        payrollRecords: data.payrollRecords.length,
        accountingEntries: data.accountingEntries.length,
        total: data.summary.totalTransactions
      }
    };
    
  } catch (error) {
    console.error('❌ 데이터 생성 테스트 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
};

// 모듈에서 직접 실행하는 경우
if (require.main === module) {
  runDataGenerationTest();
}
