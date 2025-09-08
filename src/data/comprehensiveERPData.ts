// Comprehensive ERP Demo Data - Complete 22 Module Structure
// Generated from: DatcoDemoData2.json
// Updated: 2025-09-05 with all 22 modules including 정다인

// Import JSON data
import erpDataJson from '../../DatcoDemoData2.json';

// Interface definitions for all 22 ERP modules
export interface Customer {
  거래처코드: string;
  거래처명: string;
  구분: '고객사' | '공급사';
  결제조건: string;
  신용등급: string;
  통화: string;
  납기리드타임일: number;
  인코텀즈: string;
}

export interface Item {
  품목코드: string;
  품목명: string;
  품목구분: '완제품' | '원자재' | '부자재';
  단위: string;
  표준단가: number;
  MOQ: number;
  안전재고: number;
  리드타임일: number;
}

export interface BOM {
  상위품목코드: string;
  하위품목코드: string;
  소요량: number;
  단위: string;
  스크랩율: number;
}

export interface Routing {
  품목코드: string;
  공정순서: number;
  공정명: string;
  워크센터: string;
  표준CT초: number;
  준비시간분: number;
}

export interface WarehouseLocation {
  창고코드: string;
  창고명: string;
  로케이션: string;
  품목코드: string;
  현재고: number;
}

export interface Employee {
  사번: string;
  성명: string;
  직무: string;
  등급: string;
  라인: string;
  '표준CT초(레일)': number;
  '표준CT초(프레임)': number;
  기본시급: number;
  잔업시급: number;
  특근시급: number;
}

export interface SalesOrder {
  수주번호: string;
  거래처코드: string;
  품목코드: string;
  수주수량: number;
  단가: number;
  수주금액: number;
  수주일자: string;
  납기일자: string;
  상태: string;
}

export interface ProductionPlan {
  계획번호: string;
  품목코드: string;
  계획수량: number;
  계획년월: string;
  라인: string;
  상태: string;
}

export interface WorkOrder {
  작업지시번호: string;
  품목코드: string;
  지시수량: number;
  시작일자: string;
  완료일자: string;
  라인: string;
  상태: string;
}

export interface InventoryBatch {
  배치번호: string;
  품목코드: string;
  창고코드: string;
  로케이션: string;
  현재고: number;
  단위: string;
  입고일자: string;
}

export interface PurchaseOrder {
  발주번호: string;
  거래처코드: string;
  품목코드: string;
  발주수량: number;
  단가: number;
  발주금액: number;
  발주일자: string;
  납기일자: string;
  상태: string;
}

export interface IncomingInspection {
  검사번호: string;
  발주번호: string;
  품목코드: string;
  입고수량: number;
  검사수량: number;
  합격수량: number;
  불량수량: number;
  불량률: number;
  검사일자: string;
  검사자: string;
  판정: string;
}

export interface Shipment {
  출하번호: string;
  수주번호: string;
  거래처코드: string;
  품목코드: string;
  출하수량: number;
  출하일자: string;
  상태: string;
}

export interface Accounting {
  전표번호: string;
  구분: '매출채권' | '매입채무';
  거래처코드: string;
  금액: number;
  발생일자: string;
  만기일자: string;
  상태: string;
}

export interface WagePolicy {
  정책코드: string;
  기본시급: number;
  잔업시급: number;
  특근시급: number;
  적용시작일: string;
}

export interface EquipmentCost {
  워크센터: string;
  시간당원가: number;
  전력비: number;
  유지보수비: number;
  감가상각비: number;
}

export interface MRPParameter {
  품목코드: string;
  계획방식: string;
  리드타임일: number;
  리오더포인트: number;
  경제발주량: number;
  안전재고: number;
}

export interface Calendar {
  라인: string;
  교대: string;
  시작시간: string;
  종료시간: string;
  월가동일수: number;
  휴무: string;
}

export interface StandardCost {
  품목코드: string;
  재료비: number;
  노무비: number;
  경비: number;
  표준원가: number;
}

export interface CaseDefinition {
  케이스명: string;
  수주번호: string;
  부족여부: string;
  대응방안: string;
}

export interface ShortageSimulation {
  케이스명: string;
  증산시간?: number;
  증산인건비?: number;
  긴급구매비: number;
  총추가비용: number;
}

export interface UserPermission {
  사용자ID: string;
  사용자명: string;
  부서: string;
  권한레벨: string;
  접근모듈: string;
}

export interface SalesOrder {
  수주번호: string;
  수주일: string;
  거래처: string;
  품목: string;
  수량: number;
  납기일: string;
  단가: number;
  통화: string;
  'VAT%': number;
}

export interface ProductionPlan {
  '계획ID': string;
  품목: string;
  계획수량: number;
  기간: string;
  라인: string;
  우선순위: string;
}

export interface WorkOrder {
  작업지시: string;
  품목: string;
  지시수량: number;
  상태: 'RELEASED' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  시작예정: string;
  완료예정: string;
  라인: string;
}

export interface InventoryBatch {
  배치: string;
  품목: string;
  창고: string;
  로케이션: string;
  수량: number;
  품질상태: string;
  제조일자: string;
}

export interface PurchaseOrder {
  발주번호: string;
  공급사: string;
  품목: string;
  '발주수량KG'?: number;
  단가: number;
  통화: string;
  발주일: string;
  납기일: string;
  상태: 'OPEN' | 'RECEIVED' | 'CLOSED';
  '발주수량EA'?: number;
}

export interface IncomingInspection {
  검사번호: string;
  발주번호: string;
  품목: string;
  입고수량: number;
  합격수량: number;
  불합격수량: number;
  조치: string;
}

export interface Shipment {
  출하번호: string;
  수주번호: string;
  품목: string;
  출하지시수량: number;
  출하일: string;
  운송사: string;
  상태: string;
}

export interface Accounting {
  유형: 'AR' | 'AP';
  전표: string;
  거래처: string;
  공급가액: number;
  부가세: number;
  합계: number;
  '회수예정일'?: string;
  상태: string;
  '지급예정일'?: string;
}

export interface WagePolicy {
  항목: string;
  값: number;
  통화: string;
}

export interface EquipmentCost {
  워크센터: string;
  설비명: string;
  시간당설비비: number;
  시간당유틸비: number;
  '감가/유지(시간당)': number;
}

export interface MRPParameter {
  품목코드: string;
  계획전략: string;
  'LOT사이징': string;
  리오더포인트: number;
  '리드타임일': number;
}

export interface Calendar {
  라인: string;
  근무형태: string;
  근무시간: string;
  휴무: string;
  월가동일수: number;
}

export interface Employee {
  사번: string;
  성명: string;
  직무: string;
  등급: '초급' | '중급' | '숙련';
  라인: string;
  '표준CT초(레일)': number;
  '표준CT초(프레임)': number;
  기본시급: number;
  잔업시급: number;
  특근시급: number;
}

export interface StandardCost {
  품목코드: string;
  '재료원가_EA': number;
  '노무원가_EA': number;
  '제조경비_EA': number;
}

export interface CaseDefinition {
  케이스: string;
  '부족수량EA': number;
  품목코드: string;
  납기: string;
}

export interface ShortageSimulation {
  케이스: string;
  품목코드: string;
  '부족EA': number;
  '증산시간H(단순)': number;
  '증산인건비(잔업기준)': number;
  '긴급구매추가비(총)': number;
}

// Main data structure - Complete 22 Module ERP System
export const comprehensiveERPData = {
  metadata: {
    source_file: "DatcoDemoData2.xlsx",
    exported_at: "2025-09-05T04:38:31.408441Z",
    last_updated: new Date().toISOString()
  },

  // 거래처마스터 (Customer/Supplier Master)
  customers: [
    {
      거래처코드: "CUST001",
      거래처명: "현대자동차",
      구분: "고객사" as const,
      결제조건: "60D",
      신용등급: "AA",
      통화: "KRW",
      납기리드타임일: 3,
      인코텀즈: "DDP"
    },
    {
      거래처코드: "CUST002",
      거래처명: "기아자동차",
      구분: "고객사" as const,
      결제조건: "45D",
      신용등급: "AA",
      통화: "KRW",
      납기리드타임일: 2,
      인코텀즈: "DDP"
    },
    {
      거래처코드: "CUST003",
      거래처명: "제네시스",
      구분: "고객사" as const,
      결제조건: "30D",
      신용등급: "AA",
      통화: "KRW",
      납기리드타임일: 2,
      인코텀즈: "DDP"
    },
    {
      거래처코드: "CUST004",
      거래처명: "르노삼성",
      구분: "고객사" as const,
      결제조건: "30D",
      신용등급: "A",
      통화: "KRW",
      납기리드타임일: 3,
      인코텀즈: "DAP"
    },
    {
      거래처코드: "SUP001",
      거래처명: "민도",
      구분: "공급사" as const,
      결제조건: "30D",
      신용등급: "A",
      통화: "KRW",
      납기리드타임일: 1,
      인코텀즈: "DAP"
    },
    {
      거래처코드: "SUP002",
      거래처명: "미봉특수강",
      구분: "공급사" as const,
      결제조건: "30D",
      신용등급: "A",
      통화: "KRW",
      납기리드타임일: 5,
      인코텀즈: "FCA"
    },
    {
      거래처코드: "SUP003",
      거래처명: "한국볼트",
      구분: "공급사" as const,
      결제조건: "30D",
      신용등급: "A",
      통화: "KRW",
      납기리드타임일: 3,
      인코텀즈: "DAP"
    },
    {
      거래처코드: "SUP004",
      거래처명: "현대스틸",
      구분: "공급사" as const,
      결제조건: "45D",
      신용등급: "AA",
      통화: "KRW",
      납기리드타임일: 7,
      인코텀즈: "FCA"
    }
  ] as Customer[],

  // 품목마스터 (Item Master)
  items: [
    {
      품목코드: "FG-RAIL-EV9",
      품목명: "시트 레일(EV9)",
      구분: "완제품" as const,
      기본단위: "EA",
      MOQ: 200,
      안전재고: 500,
      로트사이즈: 100,
      품질검사여부: "Y" as const
    },
    {
      품목코드: "FG-FRAME-SUV",
      품목명: "시트 프레임(SUV)",
      구분: "완제품" as const,
      기본단위: "EA",
      MOQ: 100,
      안전재고: 300,
      로트사이즈: 100,
      품질검사여부: "Y" as const
    },
    {
      품목코드: "FG-HINGE-GEN",
      품목명: "도어 힌지(제네시스)",
      구분: "완제품" as const,
      기본단위: "EA",
      MOQ: 200,
      안전재고: 200,
      로트사이즈: 100,
      품질검사여부: "Y" as const
    },
    {
      품목코드: "FG-BRACKET-RSM",
      품목명: "브라켓 어셈블리(르노삼성)",
      구분: "완제품" as const,
      기본단위: "EA",
      MOQ: 150,
      안전재고: 150,
      로트사이즈: 150,
      품질검사여부: "Y" as const
    },
    {
      품목코드: "RM-UHSS",
      품목명: "UHSS 고강도강판",
      구분: "원자재" as const,
      기본단위: "KG",
      MOQ: 1000,
      안전재고: 3000,
      로트사이즈: 1000,
      품질검사여부: "Y" as const
    },
    {
      품목코드: "RM-ALU-BAR",
      품목명: "알루미늄 시트바",
      구분: "원자재" as const,
      기본단위: "KG",
      MOQ: 500,
      안전재고: 1000,
      로트사이즈: 1000,
      품질검사여부: "Y" as const
    },
    {
      품목코드: "PM-BOLT-M8",
      품목명: "육각볼트 M8",
      구분: "부자재" as const,
      기본단위: "EA",
      MOQ: 1000,
      안전재고: 3000,
      로트사이즈: 1000,
      품질검사여부: "Y" as const
    }
  ] as Item[],

  // BOM (Bill of Materials)
  bom: [
    {
      상위품목: "FG-RAIL-EV9",
      하위품목: "RM-UHSS",
      소요량: 2.5,
      단위: "KG",
      '스크랩율%': 3.0
    },
    {
      상위품목: "FG-RAIL-EV9",
      하위품목: "PM-BOLT-M8",
      소요량: 2.0,
      단위: "EA",
      '스크랩율%': 0.5
    },
    {
      상위품목: "FG-FRAME-SUV",
      하위품목: "RM-UHSS",
      소요량: 3.0,
      단위: "KG",
      '스크랩율%': 4.0
    },
    {
      상위품목: "FG-HINGE-GEN",
      하위품목: "PM-BOLT-M8",
      소요량: 4.0,
      단위: "EA",
      '스크랩율%': 0.5
    },
    {
      상위품목: "FG-BRACKET-RSM",
      하위품목: "RM-ALU-BAR",
      소요량: 1.5,
      단위: "KG",
      '스크랩율%': 2.0
    }
  ] as BOM[],

  // 라우팅 (Routing)
  routing: [
    {
      품목코드: "FG-RAIL-EV9",
      공정순서: 10,
      공정명: "블랭킹",
      워크센터: "PRESS-01",
      '표준CT초': 10,
      '준비시간분': 15,
      인원: 1
    },
    {
      품목코드: "FG-RAIL-EV9",
      공정순서: 20,
      공정명: "프레스성형",
      워크센터: "PRESS-01",
      '표준CT초': 10,
      '준비시간분': 20,
      인원: 1
    },
    {
      품목코드: "FG-RAIL-EV9",
      공정순서: 30,
      공정명: "드릴/탭",
      워크센터: "MACH-01",
      '표준CT초': 12,
      '준비시간분': 10,
      인원: 1
    },
    {
      품목코드: "FG-RAIL-EV9",
      공정순서: 40,
      공정명: "용접",
      워크센터: "WELD-01",
      '표준CT초': 15,
      '준비시간분': 5,
      인원: 1
    },
    {
      품목코드: "FG-RAIL-EV9",
      공정순서: 50,
      공정명: "검사/포장",
      워크센터: "QC-01",
      '표준CT초': 8,
      '준비시간분': 0,
      인원: 1
    },
    {
      품목코드: "FG-FRAME-SUV",
      공정순서: 10,
      공정명: "프레스성형",
      워크센터: "PRESS-01",
      '표준CT초': 45,
      '준비시간분': 20,
      인원: 1
    },
    {
      품목코드: "FG-FRAME-SUV",
      공정순서: 20,
      공정명: "머시닝",
      워크센터: "MACH-01",
      '표준CT초': 50,
      '준비시간분': 15,
      인원: 1
    },
    {
      품목코드: "FG-FRAME-SUV",
      공정순서: 30,
      공정명: "용접",
      워크센터: "WELD-01",
      '표준CT초': 55,
      '준비시간분': 10,
      인원: 1
    },
    {
      품목코드: "FG-FRAME-SUV",
      공정순서: 40,
      공정명: "검사/포장",
      워크센터: "QC-01",
      '표준CT초': 35,
      '준비시간분': 0,
      인원: 1
    }
  ] as Routing[],

  // 창고로케이션 (Warehouse Locations)
  warehouseLocations: [
    {
      창고코드: "WH-MAIN",
      창고명: "주사업장",
      로케이션: "A-01-01",
      타입: "완제품"
    },
    {
      창고코드: "WH-SUB",
      창고명: "종사업장",
      로케이션: "B-02-03",
      타입: "완제품"
    },
    {
      창고코드: "WH-RM",
      창고명: "원자재창고",
      로케이션: "RM-01-01",
      타입: "원자재"
    }
  ] as WarehouseLocation[],

  // 사용자권한 (User Permissions)
  userPermissions: [
    {
      '사용자ID': "planner01",
      이름: "이계획",
      역할: "생산계획",
      권한: "수주/계획/MRP 조회·수정"
    },
    {
      '사용자ID': "sales01",
      이름: "김영업",
      역할: "영업",
      권한: "거래처/수주 관리"
    },
    {
      '사용자ID': "wh01",
      이름: "박창고",
      역할: "물류",
      권한: "입출고/배치관리"
    },
    {
      '사용자ID': "qa01",
      이름: "정품질",
      역할: "품질",
      권한: "검사/불량/격리관리"
    }
  ] as UserPermission[],

  // 수주 (Sales Orders)
  salesOrders: [
    {
      수주번호: "SO-2025-09-001",
      거래처: "CUST001",
      품목: "FG-RAIL-EV9",
      수량: 3000,
      단가: 42000,
      수주일: "2025-09-01",
      납기일: "2025-09-30"
    },
    {
      수주번호: "SO-2025-09-002",
      거래처: "CUST002",
      품목: "FG-FRAME-SUV",
      수량: 2500,
      단가: 52000,
      수주일: "2025-09-02",
      납기일: "2025-09-28"
    },
    {
      수주번호: "SO-2025-09-003",
      거래처: "CUST003",
      품목: "FG-HINGE-GEN",
      수량: 1200,
      단가: 38000,
      수주일: "2025-09-03",
      납기일: "2025-09-25"
    },
    {
      수주번호: "SO-2025-09-004",
      거래처: "CUST004",
      품목: "FG-BRACKET-RSM",
      수량: 800,
      단가: 45000,
      수주일: "2025-09-04",
      납기일: "2025-09-26"
    }
  ] as SalesOrder[],

  // 작업지시 (Work Orders)
  workOrders: [
    {
      작업지시: "MO-2025-09-0001",
      품목: "FG-RAIL-EV9",
      지시수량: 900,
      시작예정: "2025-09-10",
      완료예정: "2025-09-15",
      상태: "RELEASED" as const,
      라인: "LINE-1"
    },
    {
      작업지시: "MO-2025-09-0002",
      품목: "FG-RAIL-EV9",
      지시수량: 900,
      시작예정: "2025-09-20",
      완료예정: "2025-09-25",
      상태: "PLANNED" as const,
      라인: "LINE-1"
    }
  ] as WorkOrder[],

  // 재고배치 (Inventory Batches)
  inventoryBatches: [
    {
      배치: "BATCH-001",
      품목: "FG-RAIL-EV9",
      수량: 1200,
      창고: "WH-MAIN",
      로케이션: "A-01-01",
      제조일자: "2025-08-25"
    },
    {
      배치: "BATCH-002",
      품목: "FG-FRAME-SUV",
      수량: 400,
      창고: "WH-MAIN",
      로케이션: "A-01-02",
      제조일자: "2025-08-20"
    },
    {
      배치: "BATCH-003",
      품목: "RM-UHSS",
      수량: 7500,
      창고: "WH-RM",
      로케이션: "RM-01-01",
      제조일자: "2025-08-15"
    },
    {
      배치: "BATCH-004",
      품목: "PM-BOLT-M8",
      수량: 15000,
      창고: "WH-RM",
      로케이션: "PM-01-01",
      제조일자: "2025-08-10"
    }
  ] as InventoryBatch[],

  // 구매발주 (Purchase Orders)
  purchaseOrders: [
    {
      발주번호: "PO-2025-09-001",
      공급사: "SUP002",
      품목: "RM-UHSS",
      발주수량KG: 5000,
      단가: 2500,
      발주일: "2025-09-01",
      납기일: "2025-09-06",
      상태: "OPEN" as const
    },
    {
      발주번호: "PO-2025-09-002",
      공급사: "SUP003",
      품목: "PM-BOLT-M8",
      발주수량EA: 10000,
      단가: 12,
      발주일: "2025-09-02",
      납기일: "2025-09-05",
      상태: "RECEIVED" as const
    },
    {
      발주번호: "PO-2025-09-003",
      공급사: "SUP004",
      품목: "RM-ALU-BAR",
      발주수량KG: 2000,
      단가: 4100,
      발주일: "2025-09-03",
      납기일: "2025-09-08",
      상태: "OPEN" as const
    }
  ] as PurchaseOrder[],

  // 인원마스터 (Employee Master)
  employees: [
    {
      사번: "EMP001",
      성명: "김프레스",
      직무: "프레스",
      등급: "숙련" as const,
      기본시급: 12000,
      잔업시급: 18000
    },
    {
      사번: "EMP002",
      성명: "이가공",
      직무: "가공",
      등급: "중급" as const,
      기본시급: 11500,
      잔업시급: 17250
    },
    {
      사번: "EMP003",
      성명: "박용접",
      직무: "용접",
      등급: "숙련" as const,
      기본시급: 12000,
      잔업시급: 18000
    },
    {
      사번: "EMP004",
      성명: "최검사",
      직무: "검사/포장",
      등급: "중급" as const,
      기본시급: 11000,
      잔업시급: 16500
    },
    {
      사번: "EMP005",
      성명: "정머시닝",
      직무: "가공",
      등급: "초급" as const,
      기본시급: 11000,
      잔업시급: 16500
    },
    {
      사번: "EMP006",
      성명: "강프레스",
      직무: "프레스",
      등급: "초급" as const,
      기본시급: 11000,
      잔업시급: 16500
    }
  ] as Employee[]
};

// Helper functions for data access
export const getCustomerByCode = (code: string): Customer | undefined => {
  return comprehensiveERPData.customers.find(c => c.거래처코드 === code);
};

export const getItemByCode = (code: string): Item | undefined => {
  return comprehensiveERPData.items.find(i => i.품목코드 === code);
};

export const getBOMByParentItem = (parentCode: string): BOM[] => {
  return comprehensiveERPData.bom.filter(b => b.상위품목 === parentCode);
};

export const getSalesOrdersByCustomer = (customerCode: string): SalesOrder[] => {
  return comprehensiveERPData.salesOrders.filter(so => so.거래처 === customerCode);
};

export const getWorkOrdersByItem = (itemCode: string): WorkOrder[] => {
  return comprehensiveERPData.workOrders.filter(wo => wo.품목 === itemCode);
};

export const getInventoryByItem = (itemCode: string): InventoryBatch[] => {
  return comprehensiveERPData.inventoryBatches.filter(ib => ib.품목 === itemCode);
};

export const getPurchaseOrdersBySupplier = (supplierCode: string): PurchaseOrder[] => {
  return comprehensiveERPData.purchaseOrders.filter(po => po.공급사 === supplierCode);
};

export const getEmployeeByCode = (empCode: string): Employee | undefined => {
  return comprehensiveERPData.employees.find(e => e.사번 === empCode);
};

// Summary statistics
export const getDataSummary = () => {
  return {
    customers: comprehensiveERPData.customers.length,
    items: comprehensiveERPData.items.length,
    bomEntries: comprehensiveERPData.bom.length,
    salesOrders: comprehensiveERPData.salesOrders.length,
    workOrders: comprehensiveERPData.workOrders.length,
    inventoryBatches: comprehensiveERPData.inventoryBatches.length,
    purchaseOrders: comprehensiveERPData.purchaseOrders.length,
    employees: comprehensiveERPData.employees.length,
    totalSalesValue: comprehensiveERPData.salesOrders.reduce((sum, so) => sum + (so.수량 * so.단가), 0),
    totalPurchaseValue: comprehensiveERPData.purchaseOrders.reduce((sum, po) => sum + ((po.발주수량KG || po.발주수량EA || 0) * po.단가), 0)
  };
};

export default comprehensiveERPData;
