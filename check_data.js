// ERP 데이터 확인 스크립트
const { generateMassiveERPData, getDataSummary } = require('./src/data/massiveERPData.ts');

console.log('=== ERP 데이터 확인 시작 ===\n');

try {
  // 데이터 생성
  const data = generateMassiveERPData();
  
  // 데이터 요약 정보
  const summary = getDataSummary();
  console.log('📊 데이터 요약:');
  console.log(summary);
  
  // 각 데이터 타입별 건수
  console.log('\n📋 생성된 데이터 건수:');
  console.log(`• 영업 주문: ${data.salesOrders?.length || 0}건`);
  console.log(`• 구매 주문: ${data.purchaseOrders?.length || 0}건`);
  console.log(`• 자재 입고: ${data.materialInbounds?.length || 0}건`);
  console.log(`• 생산 주문: ${data.productionOrders?.length || 0}건`);
  console.log(`• 출하 기록: ${data.shipments?.length || 0}건`);
  console.log(`• 근태 기록: ${data.attendanceRecords?.length || 0}건`);
  console.log(`• 급여 기록: ${data.payrollRecords?.length || 0}건`);
  console.log(`• 회계 분개: ${data.accountingEntries?.length || 0}건`);
  
  // 샘플 데이터 출력
  console.log('\n🔍 샘플 데이터:');
  
  if (data.salesOrders?.length > 0) {
    console.log('\n📋 영업 주문 샘플:');
    console.log(JSON.stringify(data.salesOrders[0], null, 2));
  }
  
  if (data.productionOrders?.length > 0) {
    console.log('\n🏭 생산 주문 샘플:');
    console.log(JSON.stringify(data.productionOrders[0], null, 2));
  }
  
} catch (error) {
  console.error('❌ 데이터 생성 중 오류:', error);
}
