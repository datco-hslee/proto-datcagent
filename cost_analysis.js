// Cost Analysis for ERP Demo Data

const MATERIALS = [
  { code: 'MAT-001', name: '스틸 레일 원재료', unitPrice: 15000 },
  { code: 'MAT-002', name: '알루미늄 프레임 소재', unitPrice: 25000 },
  { code: 'MAT-003', name: '플라스틱 커버 소재', unitPrice: 8000 },
  { code: 'MAT-004', name: '볼트 및 너트 세트', unitPrice: 500 },
  { code: 'MAT-005', name: '전동 모터 어셈블리', unitPrice: 120000 },
  { code: 'MAT-006', name: '베어링 세트', unitPrice: 8500 },
  { code: 'MAT-007', name: '스프링 세트', unitPrice: 3500 },
  { code: 'MAT-008', name: '전선 하네스', unitPrice: 12000 },
  { code: 'MAT-009', name: '고무 패킹', unitPrice: 2500 },
  { code: 'MAT-010', name: '윤활유', unitPrice: 15000 }
];

const PRODUCTS = [
  {
    code: 'EV9-SR-001',
    name: 'EV9 전기차용 시트 레일',
    unitPrice: 55000,
    standardCost: 41250,
    bomItems: [
      { materialCode: 'MAT-001', quantity: 2 },
      { materialCode: 'MAT-004', quantity: 1 },
      { materialCode: 'MAT-006', quantity: 1 },
      { materialCode: 'MAT-007', quantity: 1 }
    ]
  },
  {
    code: 'GV70-SF-002',
    name: 'GV70 SUV 시트 프레임',
    unitPrice: 85000,
    standardCost: 63750,
    bomItems: [
      { materialCode: 'MAT-002', quantity: 1 },
      { materialCode: 'MAT-004', quantity: 2 },
      { materialCode: 'MAT-009', quantity: 4 }
    ]
  },
  {
    code: 'IONIQ6-DH-003',
    name: '아이오닉6 도어 힌지',
    unitPrice: 32000,
    standardCost: 24000,
    bomItems: [
      { materialCode: 'MAT-001', quantity: 1 },
      { materialCode: 'MAT-004', quantity: 1 },
      { materialCode: 'MAT-010', quantity: 0.1 }
    ]
  },
  {
    code: 'PREM-SA-004',
    name: '프리미엄 시트 어셈블리',
    unitPrice: 180000,
    standardCost: 135000,
    bomItems: [
      { materialCode: 'MAT-002', quantity: 1 },
      { materialCode: 'MAT-005', quantity: 1 },
      { materialCode: 'MAT-008', quantity: 1 },
      { materialCode: 'MAT-003', quantity: 2 }
    ]
  },
  {
    code: 'ELEC-SM-005',
    name: '전동 시트 모터',
    unitPrice: 150000,
    standardCost: 112500,
    bomItems: [
      { materialCode: 'MAT-005', quantity: 1 },
      { materialCode: 'MAT-008', quantity: 1 },
      { materialCode: 'MAT-003', quantity: 1 }
    ]
  }
];

function analyzeCosts() {
  console.log('=== 제품별 원가 분석 결과 ===\n');

  const results = [];
  
  PRODUCTS.forEach(product => {
    let calculatedMaterialCost = 0;
    const materialDetails = [];

    product.bomItems.forEach(bomItem => {
      const material = MATERIALS.find(m => m.code === bomItem.materialCode);
      if (material) {
        const totalCost = material.unitPrice * bomItem.quantity;
        calculatedMaterialCost += totalCost;
        materialDetails.push({
          name: material.name,
          quantity: bomItem.quantity,
          unitCost: material.unitPrice,
          totalCost: totalCost
        });
      }
    });

    const laborAndOverheadCost = product.standardCost - calculatedMaterialCost;
    const grossMargin = product.unitPrice - product.standardCost;
    const grossMarginPercent = (grossMargin / product.unitPrice) * 100;
    const materialCostRatio = (calculatedMaterialCost / product.standardCost) * 100;

    console.log(`제품: ${product.name} (${product.code})`);
    console.log(`판매가격: ${product.unitPrice.toLocaleString()}원`);
    console.log(`표준원가: ${product.standardCost.toLocaleString()}원`);
    console.log(`계산된 자재비: ${calculatedMaterialCost.toLocaleString()}원`);
    console.log(`인건비+간접비: ${laborAndOverheadCost.toLocaleString()}원`);
    console.log(`매출총이익: ${grossMargin.toLocaleString()}원 (${grossMarginPercent.toFixed(1)}%)`);
    console.log(`자재비 비율: ${materialCostRatio.toFixed(1)}%`);
    
    console.log('\n자재별 상세:');
    materialDetails.forEach(detail => {
      console.log(`  - ${detail.name}: ${detail.quantity} × ${detail.unitCost.toLocaleString()}원 = ${detail.totalCost.toLocaleString()}원`);
    });
    console.log('\n' + '='.repeat(60) + '\n');

    results.push({
      product: product.name,
      grossMarginPercent,
      materialCostRatio,
      calculatedMaterialCost,
      standardCost: product.standardCost,
      isRealistic: materialCostRatio >= 40 && materialCostRatio <= 80 && grossMarginPercent >= 15 && grossMarginPercent <= 35
    });
  });

  // Summary
  const avgGrossMargin = results.reduce((sum, p) => sum + p.grossMarginPercent, 0) / results.length;
  const avgMaterialRatio = results.reduce((sum, p) => sum + p.materialCostRatio, 0) / results.length;
  const unrealisticProducts = results.filter(p => !p.isRealistic);

  console.log('=== 전체 요약 ===');
  console.log(`평균 매출총이익률: ${avgGrossMargin.toFixed(1)}%`);
  console.log(`평균 자재비 비율: ${avgMaterialRatio.toFixed(1)}%`);
  
  if (unrealisticProducts.length > 0) {
    console.log('\n=== 비현실적인 원가 구조 제품 ===');
    unrealisticProducts.forEach(p => {
      console.log(`- ${p.product}: 자재비 ${p.materialCostRatio.toFixed(1)}%, 이익률 ${p.grossMarginPercent.toFixed(1)}%`);
    });
  }

  return results;
}

analyzeCosts();
