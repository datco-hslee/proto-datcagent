// 간단한 데이터 확인 스크립트
console.log('=== ERP 데이터 확인 ===\n');

// 기본 제품 정보
const PRODUCTS = [
  {
    id: 'PROD-001',
    code: 'EV9-SR-001',
    name: 'EV9 전기차용 시트 레일',
    unitPrice: 55000,
    bomItems: [
      { materialCode: 'MAT-001', materialName: '스틸 레일 원재료', quantity: 2 },
      { materialCode: 'MAT-004', materialName: '볼트 및 너트 세트', quantity: 1 },
      { materialCode: 'MAT-006', materialName: '베어링 세트', quantity: 1 },
      { materialCode: 'MAT-007', materialName: '스프링 세트', quantity: 1 }
    ]
  },
  {
    id: 'PROD-004',
    code: 'PREM-SA-004',
    name: '프리미엄 시트 어셈블리',
    unitPrice: 180000,
    bomItems: [
      { materialCode: 'MAT-002', materialName: '알루미늄 프레임 소재', quantity: 1 },
      { materialCode: 'MAT-005', materialName: '전동 모터 어셈블리', quantity: 1 },
      { materialCode: 'MAT-008', materialName: '전선 하네스', quantity: 1 },
      { materialCode: 'MAT-003', materialName: '플라스틱 커버 소재', quantity: 2 }
    ]
  }
];

const MATERIALS = [
  { code: 'MAT-001', name: '스틸 레일 원재료', unitPrice: 15000 },
  { code: 'MAT-002', name: '알루미늄 프레임 소재', unitPrice: 25000 },
  { code: 'MAT-003', name: '플라스틱 커버 소재', unitPrice: 8000 },
  { code: 'MAT-004', name: '볼트 및 너트 세트', unitPrice: 500 },
  { code: 'MAT-005', name: '전동 모터 어셈블리', unitPrice: 85000 },
  { code: 'MAT-006', name: '베어링 세트', unitPrice: 8500 },
  { code: 'MAT-007', name: '스프링 세트', unitPrice: 3500 },
  { code: 'MAT-008', name: '전선 하네스', unitPrice: 12000 }
];

console.log('📋 제품 정보:');
PRODUCTS.forEach(product => {
  console.log(`\n• ${product.name} (${product.code})`);
  console.log(`  판매가: ${product.unitPrice.toLocaleString()}원`);
  console.log(`  BOM 구성:`);
  
  let totalMaterialCost = 0;
  product.bomItems.forEach(bomItem => {
    const material = MATERIALS.find(m => m.code === bomItem.materialCode);
    const itemCost = material ? material.unitPrice * bomItem.quantity : 0;
    totalMaterialCost += itemCost;
    
    console.log(`    - ${bomItem.materialName}: ${bomItem.quantity}개 × ${material?.unitPrice.toLocaleString()}원 = ${itemCost.toLocaleString()}원`);
  });
  
  const grossMargin = product.unitPrice - totalMaterialCost;
  const marginRate = (grossMargin / product.unitPrice * 100).toFixed(1);
  
  console.log(`  총 자재비: ${totalMaterialCost.toLocaleString()}원`);
  console.log(`  매출총이익: ${grossMargin.toLocaleString()}원 (${marginRate}%)`);
});

console.log('\n🔧 자재 정보:');
MATERIALS.forEach(material => {
  console.log(`• ${material.name}: ${material.unitPrice.toLocaleString()}원`);
});

console.log('\n✅ 기본 데이터 확인 완료!');
console.log('\n📌 전체 데이터를 확인하려면:');
console.log('1. 애플리케이션 실행 후 브라우저 개발자 도구에서');
console.log('2. Console 탭에서 다음 명령어 실행:');
console.log('   window.generateMassiveERPData()');
console.log('3. 또는 AI 챗봇에서 "데이터 요약 보여줘" 질문');
