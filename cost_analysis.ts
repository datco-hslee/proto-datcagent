// Cost Analysis for ERP Demo Data
// Analyzing material costs vs product standard costs

interface MaterialCost {
  code: string;
  name: string;
  unitPrice: number;
}

interface BOMItem {
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
}

interface ProductCostAnalysis {
  productCode: string;
  productName: string;
  unitPrice: number;
  standardCost: number;
  calculatedMaterialCost: number;
  materialCostDetails: { material: string; quantity: number; unitCost: number; totalCost: number }[];
  laborAndOverheadCost: number;
  grossMargin: number;
  grossMarginPercent: number;
  costVariance: number;
}

const MATERIALS: MaterialCost[] = [
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
      { materialCode: 'MAT-001', materialName: '스틸 레일 원재료', quantity: 2, unit: 'EA' },
      { materialCode: 'MAT-004', materialName: '볼트 및 너트 세트', quantity: 1, unit: 'SET' },
      { materialCode: 'MAT-006', materialName: '베어링 세트', quantity: 1, unit: 'SET' },
      { materialCode: 'MAT-007', materialName: '스프링 세트', quantity: 1, unit: 'SET' }
    ]
  },
  {
    code: 'GV70-SF-002',
    name: 'GV70 SUV 시트 프레임',
    unitPrice: 85000,
    standardCost: 63750,
    bomItems: [
      { materialCode: 'MAT-002', materialName: '알루미늄 프레임 소재', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-004', materialName: '볼트 및 너트 세트', quantity: 2, unit: 'SET' },
      { materialCode: 'MAT-009', materialName: '고무 패킹', quantity: 4, unit: 'EA' }
    ]
  },
  {
    code: 'IONIQ6-DH-003',
    name: '아이오닉6 도어 힌지',
    unitPrice: 32000,
    standardCost: 24000,
    bomItems: [
      { materialCode: 'MAT-001', materialName: '스틸 레일 원재료', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-004', materialName: '볼트 및 너트 세트', quantity: 1, unit: 'SET' },
      { materialCode: 'MAT-010', materialName: '윤활유', quantity: 0.1, unit: 'L' }
    ]
  },
  {
    code: 'PREM-SA-004',
    name: '프리미엄 시트 어셈블리',
    unitPrice: 180000,
    standardCost: 135000,
    bomItems: [
      { materialCode: 'MAT-002', materialName: '알루미늄 프레임 소재', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-005', materialName: '전동 모터 어셈블리', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-008', materialName: '전선 하네스', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-003', materialName: '플라스틱 커버 소재', quantity: 2, unit: 'EA' }
    ]
  },
  {
    code: 'ELEC-SM-005',
    name: '전동 시트 모터',
    unitPrice: 150000,
    standardCost: 112500,
    bomItems: [
      { materialCode: 'MAT-005', materialName: '전동 모터 어셈블리', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-008', materialName: '전선 하네스', quantity: 1, unit: 'EA' },
      { materialCode: 'MAT-003', materialName: '플라스틱 커버 소재', quantity: 1, unit: 'EA' }
    ]
  }
];

function analyzeCosts(): ProductCostAnalysis[] {
  const results: ProductCostAnalysis[] = [];

  PRODUCTS.forEach(product => {
    let calculatedMaterialCost = 0;
    const materialCostDetails: { material: string; quantity: number; unitCost: number; totalCost: number }[] = [];

    product.bomItems.forEach(bomItem => {
      const material = MATERIALS.find(m => m.code === bomItem.materialCode);
      if (material) {
        const totalCost = material.unitPrice * bomItem.quantity;
        calculatedMaterialCost += totalCost;
        
        materialCostDetails.push({
          material: material.name,
          quantity: bomItem.quantity,
          unitCost: material.unitPrice,
          totalCost: totalCost
        });
      }
    });

    const laborAndOverheadCost = product.standardCost - calculatedMaterialCost;
    const grossMargin = product.unitPrice - product.standardCost;
    const grossMarginPercent = (grossMargin / product.unitPrice) * 100;
    const costVariance = product.standardCost - calculatedMaterialCost;

    results.push({
      productCode: product.code,
      productName: product.name,
      unitPrice: product.unitPrice,
      standardCost: product.standardCost,
      calculatedMaterialCost,
      materialCostDetails,
      laborAndOverheadCost,
      grossMargin,
      grossMarginPercent,
      costVariance
    });
  });

  return results;
}

// Run the analysis
const costAnalysis = analyzeCosts();

console.log('=== 제품별 원가 분석 결과 ===\n');

costAnalysis.forEach(analysis => {
  console.log(`제품: ${analysis.productName} (${analysis.productCode})`);
  console.log(`판매가격: ${analysis.unitPrice.toLocaleString()}원`);
  console.log(`표준원가: ${analysis.standardCost.toLocaleString()}원`);
  console.log(`계산된 자재비: ${analysis.calculatedMaterialCost.toLocaleString()}원`);
  console.log(`인건비+간접비: ${analysis.laborAndOverheadCost.toLocaleString()}원`);
  console.log(`매출총이익: ${analysis.grossMargin.toLocaleString()}원 (${analysis.grossMarginPercent.toFixed(1)}%)`);
  console.log(`원가차이: ${analysis.costVariance.toLocaleString()}원`);
  
  console.log('\n자재별 상세:');
  analysis.materialCostDetails.forEach(detail => {
    console.log(`  - ${detail.material}: ${detail.quantity} × ${detail.unitCost.toLocaleString()}원 = ${detail.totalCost.toLocaleString()}원`);
  });
  console.log('\n' + '='.repeat(60) + '\n');
});

// Summary statistics
const avgGrossMargin = costAnalysis.reduce((sum, p) => sum + p.grossMarginPercent, 0) / costAnalysis.length;
const materialCostRatio = costAnalysis.map(p => (p.calculatedMaterialCost / p.standardCost) * 100);
const avgMaterialCostRatio = materialCostRatio.reduce((sum, ratio) => sum + ratio, 0) / materialCostRatio.length;

console.log('=== 전체 요약 ===');
console.log(`평균 매출총이익률: ${avgGrossMargin.toFixed(1)}%`);
console.log(`평균 자재비 비율: ${avgMaterialCostRatio.toFixed(1)}%`);
console.log(`자재비 비율 범위: ${Math.min(...materialCostRatio).toFixed(1)}% ~ ${Math.max(...materialCostRatio).toFixed(1)}%`);
