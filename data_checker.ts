// ERP 데이터 확인용 TypeScript 스크립트
import { generateMassiveERPData, getDataSummary } from './src/data/massiveERPData';

console.log('=== ERP 데이터 확인 시작 ===\n');

// 데이터 생성
const data = generateMassiveERPData();

// 요약 정보
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

// 제품별 BOM 정보 확인
console.log('\n🔧 제품별 BOM 구성:');
const products = [
  { id: 'PROD-001', name: 'EV9 전기차용 시트 레일' },
  { id: 'PROD-004', name: '프리미엄 시트 어셈블리' },
  { id: 'PROD-005', name: '전동 시트 모터' }
];

products.forEach(product => {
  const productData = data.salesOrders?.find((so: any) => 
    so.items.some((item: any) => item.productId === product.id)
  );
  if (productData) {
    console.log(`\n• ${product.name}:`);
    const item = productData.items.find((item: any) => item.productId === product.id);
    console.log(`  - 단가: ${item?.unitPrice?.toLocaleString()}원`);
    console.log(`  - 주문 수량: ${item?.quantity}개`);
  }
});

// 최근 데이터 샘플
console.log('\n🔍 최근 데이터 샘플:');

if (data.salesOrders?.length > 0) {
  const recentSO = data.salesOrders[data.salesOrders.length - 1];
  console.log('\n📋 최근 영업 주문:');
  console.log(`• 주문번호: ${recentSO.orderNumber}`);
  console.log(`• 고객: ${recentSO.customerName}`);
  console.log(`• 주문일: ${recentSO.orderDate.toLocaleDateString('ko-KR')}`);
  console.log(`• 총액: ${recentSO.totalAmount.toLocaleString()}원`);
  console.log(`• 상태: ${recentSO.status}`);
}

if (data.materialInbounds?.length > 0) {
  const recentInbound = data.materialInbounds[data.materialInbounds.length - 1];
  console.log('\n📦 최근 자재 입고:');
  console.log(`• 자재명: ${recentInbound.materialName}`);
  console.log(`• 수량: ${recentInbound.quantity.toLocaleString()}${recentInbound.unit}`);
  console.log(`• 입고일: ${recentInbound.inboundDate.toLocaleDateString('ko-KR')}`);
  console.log(`• LOT번호: ${recentInbound.lotNumber}`);
  console.log(`• 현재재고: ${recentInbound.currentStock.toLocaleString()}${recentInbound.unit}`);
}

console.log('\n✅ 데이터 확인 완료!');
