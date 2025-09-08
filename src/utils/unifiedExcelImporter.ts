// 통합 엑셀 임포터 - 22개 ERP 챕터 모든 데이터 처리
import { DataSourceManager, type DataWithSource } from '../data/dataSourceManager';

// 22개 ERP 챕터 정의
export const ERP_CHAPTERS = {
  // 영업 & 고객 관리 (5개)
  CUSTOMERS: 'customers',
  SALES_ORDERS: 'salesOrders', 
  QUOTATIONS: 'quotations',
  CRM_PIPELINE: 'crmPipeline',
  SALES_ANALYTICS: 'salesAnalytics',
  
  // 생산 & MRP (4개)
  PRODUCTION_ORDERS: 'productionOrders',
  WORK_INSTRUCTIONS: 'workInstructions',
  BOM_MANAGEMENT: 'bomManagement',
  QUALITY_CONTROL: 'qualityControl',
  
  // 재고 & 구매 (4개)
  INVENTORY: 'inventory',
  PURCHASE_ORDERS: 'purchaseOrders',
  SUPPLIERS: 'suppliers',
  WAREHOUSE: 'warehouse',
  
  // 인사 & 급여 (4개)
  EMPLOYEES: 'employees',
  PAYROLL: 'payroll',
  ATTENDANCE: 'attendance',
  PERFORMANCE: 'performance',
  
  // 회계 & 재무 (3개)
  ACCOUNTING: 'accounting',
  BUDGET: 'budget',
  FINANCIAL_REPORTS: 'financialReports',
  
  // 기타 관리 (2개)
  PROJECTS: 'projects',
  DOCUMENTS: 'documents'
} as const;

export interface UnifiedExcelImportResult {
  success: boolean;
  processedChapters: string[];
  totalRecords: number;
  data: Record<string, DataWithSource<any>[]>;
  errors: string[];
  warnings: string[];
  summary: {
    [key: string]: {
      records: number;
      validRecords: number;
      errorRecords: number;
    };
  };
}

// 엑셀 시트명 → ERP 챕터 매핑
const SHEET_MAPPING: Record<string, string> = {
  // 한글 시트명
  '고객': ERP_CHAPTERS.CUSTOMERS,
  '고객정보': ERP_CHAPTERS.CUSTOMERS,
  '거래처': ERP_CHAPTERS.CUSTOMERS,
  
  '주문': ERP_CHAPTERS.SALES_ORDERS,
  '판매주문': ERP_CHAPTERS.SALES_ORDERS,
  '영업주문': ERP_CHAPTERS.SALES_ORDERS,
  
  '견적': ERP_CHAPTERS.QUOTATIONS,
  '견적서': ERP_CHAPTERS.QUOTATIONS,
  
  '생산오더': ERP_CHAPTERS.PRODUCTION_ORDERS,
  '생산계획': ERP_CHAPTERS.PRODUCTION_ORDERS,
  '제조오더': ERP_CHAPTERS.PRODUCTION_ORDERS,
  
  '작업지시': ERP_CHAPTERS.WORK_INSTRUCTIONS,
  '작업지시서': ERP_CHAPTERS.WORK_INSTRUCTIONS,
  
  'BOM': ERP_CHAPTERS.BOM_MANAGEMENT,
  '자재명세서': ERP_CHAPTERS.BOM_MANAGEMENT,
  '부품명세서': ERP_CHAPTERS.BOM_MANAGEMENT,
  
  '재고': ERP_CHAPTERS.INVENTORY,
  '재고현황': ERP_CHAPTERS.INVENTORY,
  '창고재고': ERP_CHAPTERS.INVENTORY,
  
  '구매': ERP_CHAPTERS.PURCHASE_ORDERS,
  '구매주문': ERP_CHAPTERS.PURCHASE_ORDERS,
  '발주': ERP_CHAPTERS.PURCHASE_ORDERS,
  
  '공급업체': ERP_CHAPTERS.SUPPLIERS,
  '협력업체': ERP_CHAPTERS.SUPPLIERS,
  '벤더': ERP_CHAPTERS.SUPPLIERS,
  
  '직원': ERP_CHAPTERS.EMPLOYEES,
  '사원': ERP_CHAPTERS.EMPLOYEES,
  '인사': ERP_CHAPTERS.EMPLOYEES,
  
  '급여': ERP_CHAPTERS.PAYROLL,
  '월급': ERP_CHAPTERS.PAYROLL,
  '임금': ERP_CHAPTERS.PAYROLL,
  
  '근태': ERP_CHAPTERS.ATTENDANCE,
  '출근': ERP_CHAPTERS.ATTENDANCE,
  '근무시간': ERP_CHAPTERS.ATTENDANCE,
  
  '회계': ERP_CHAPTERS.ACCOUNTING,
  '장부': ERP_CHAPTERS.ACCOUNTING,
  '계정': ERP_CHAPTERS.ACCOUNTING,
  
  '예산': ERP_CHAPTERS.BUDGET,
  '예산계획': ERP_CHAPTERS.BUDGET,
  
  '프로젝트': ERP_CHAPTERS.PROJECTS,
  '과제': ERP_CHAPTERS.PROJECTS,
  
  // 영문 시트명
  'customers': ERP_CHAPTERS.CUSTOMERS,
  'sales': ERP_CHAPTERS.SALES_ORDERS,
  'orders': ERP_CHAPTERS.SALES_ORDERS,
  'quotes': ERP_CHAPTERS.QUOTATIONS,
  'production': ERP_CHAPTERS.PRODUCTION_ORDERS,
  'manufacturing': ERP_CHAPTERS.PRODUCTION_ORDERS,
  'work_instructions': ERP_CHAPTERS.WORK_INSTRUCTIONS,
  'bom': ERP_CHAPTERS.BOM_MANAGEMENT,
  'inventory': ERP_CHAPTERS.INVENTORY,
  'stock': ERP_CHAPTERS.INVENTORY,
  'purchase': ERP_CHAPTERS.PURCHASE_ORDERS,
  'suppliers': ERP_CHAPTERS.SUPPLIERS,
  'vendors': ERP_CHAPTERS.SUPPLIERS,
  'employees': ERP_CHAPTERS.EMPLOYEES,
  'hr': ERP_CHAPTERS.EMPLOYEES,
  'payroll': ERP_CHAPTERS.PAYROLL,
  'salary': ERP_CHAPTERS.PAYROLL,
  'attendance': ERP_CHAPTERS.ATTENDANCE,
  'accounting': ERP_CHAPTERS.ACCOUNTING,
  'budget': ERP_CHAPTERS.BUDGET,
  'projects': ERP_CHAPTERS.PROJECTS
};

// 챕터별 데이터 매핑 함수들
export class UnifiedDataMapper {
  
  // 고객 데이터 매핑
  static mapCustomers(row: any, rowIndex: number): any {
    return {
      id: row['고객ID'] || row['ID'] || `CUST-${Date.now()}-${rowIndex}`,
      companyName: row['회사명'] || row['거래처명'] || row['고객명'] || row['Company'] || '',
      contactPerson: row['담당자'] || row['연락담당자'] || row['Contact'] || '',
      email: row['이메일'] || row['EMAIL'] || row['Email'] || '',
      phone: row['전화번호'] || row['연락처'] || row['Phone'] || '',
      address: row['주소'] || row['Address'] || '',
      businessType: row['업종'] || row['사업분야'] || row['Business Type'] || '',
      creditRating: row['신용등급'] || row['Credit Rating'] || 'B',
      paymentTerms: row['결제조건'] || row['Payment Terms'] || '월말결제',
      taxId: row['사업자번호'] || row['Tax ID'] || ''
    };
  }

  // 판매 주문 매핑
  static mapSalesOrders(row: any, rowIndex: number): any {
    return {
      id: row['주문ID'] || row['Order ID'] || `SO-${Date.now()}-${rowIndex}`,
      orderNumber: row['주문번호'] || row['Order Number'] || `SO-2024-${String(rowIndex).padStart(3, '0')}`,
      customerId: row['고객ID'] || row['Customer ID'] || '',
      customerName: row['고객명'] || row['Customer Name'] || '',
      productName: row['제품명'] || row['Product Name'] || '',
      productCode: row['제품코드'] || row['Product Code'] || '',
      quantity: parseInt(row['수량'] || row['Quantity']) || 0,
      unitPrice: parseFloat(row['단가'] || row['Unit Price']) || 0,
      totalAmount: parseFloat(row['총금액'] || row['Total Amount']) || 0,
      orderDate: this.parseDate(row['주문일'] || row['Order Date']),
      deliveryDate: this.parseDate(row['납기일'] || row['Delivery Date']),
      status: this.mapStatus(row['상태'] || row['Status']),
      priority: this.mapPriority(row['우선순위'] || row['Priority'])
    };
  }

  // 생산 오더 매핑
  static mapProductionOrders(row: any, rowIndex: number): any {
    return {
      id: row['생산ID'] || row['Production ID'] || `PO-${Date.now()}-${rowIndex}`,
      orderNumber: row['생산번호'] || row['Production Number'] || `PO-2024-${String(rowIndex).padStart(3, '0')}`,
      productName: row['제품명'] || row['Product Name'] || '',
      productCode: row['제품코드'] || row['Product Code'] || '',
      quantity: parseInt(row['수량'] || row['Quantity']) || 0,
      plannedStartDate: this.parseDate(row['계획시작일'] || row['Planned Start']),
      plannedEndDate: this.parseDate(row['계획완료일'] || row['Planned End']),
      actualStartDate: this.parseDate(row['실제시작일'] || row['Actual Start']),
      actualEndDate: this.parseDate(row['실제완료일'] || row['Actual End']),
      status: this.mapStatus(row['상태'] || row['Status']),
      priority: this.mapPriority(row['우선순위'] || row['Priority']),
      workCenter: row['작업장'] || row['Work Center'] || '',
      assignedWorker: row['담당자'] || row['Assigned Worker'] || ''
    };
  }

  // BOM 데이터 매핑
  static mapBOM(row: any, rowIndex: number): any {
    return {
      id: row['BOM_ID'] || `BOM-${Date.now()}-${rowIndex}`,
      productCode: row['제품코드'] || row['Product Code'] || '',
      productName: row['제품명'] || row['Product Name'] || '',
      componentCode: row['부품코드'] || row['Component Code'] || '',
      componentName: row['부품명'] || row['Component Name'] || '',
      quantity: parseFloat(row['소요량'] || row['Required Qty']) || 1,
      unit: row['단위'] || row['Unit'] || 'EA',
      unitCost: parseFloat(row['단가'] || row['Unit Cost']) || 0,
      supplier: row['공급업체'] || row['Supplier'] || '',
      leadTime: parseInt(row['리드타임'] || row['Lead Time']) || 0
    };
  }

  // 재고 데이터 매핑
  static mapInventory(row: any, rowIndex: number): any {
    return {
      id: row['재고ID'] || row['Inventory ID'] || `INV-${Date.now()}-${rowIndex}`,
      itemCode: row['품목코드'] || row['Item Code'] || '',
      itemName: row['품목명'] || row['Item Name'] || '',
      currentStock: parseInt(row['현재고'] || row['Current Stock']) || 0,
      minStock: parseInt(row['최소재고'] || row['Min Stock']) || 0,
      maxStock: parseInt(row['최대재고'] || row['Max Stock']) || 0,
      unitCost: parseFloat(row['단가'] || row['Unit Cost']) || 0,
      location: row['위치'] || row['Location'] || '',
      lastUpdated: this.parseDate(row['최종수정일'] || row['Last Updated']) || new Date().toISOString()
    };
  }

  // 구매 주문 매핑
  static mapPurchaseOrders(row: any, rowIndex: number): any {
    return {
      id: row['구매ID'] || row['Purchase ID'] || `PO-${Date.now()}-${rowIndex}`,
      orderNumber: row['구매번호'] || row['PO Number'] || `PO-2024-${String(rowIndex).padStart(3, '0')}`,
      supplierId: row['공급업체ID'] || row['Supplier ID'] || '',
      supplierName: row['공급업체명'] || row['Supplier Name'] || '',
      itemCode: row['품목코드'] || row['Item Code'] || '',
      itemName: row['품목명'] || row['Item Name'] || '',
      quantity: parseInt(row['수량'] || row['Quantity']) || 0,
      unitPrice: parseFloat(row['단가'] || row['Unit Price']) || 0,
      totalAmount: parseFloat(row['총금액'] || row['Total Amount']) || 0,
      orderDate: this.parseDate(row['주문일'] || row['Order Date']),
      deliveryDate: this.parseDate(row['납기일'] || row['Delivery Date']),
      status: this.mapStatus(row['상태'] || row['Status'])
    };
  }

  // 직원 데이터 매핑
  static mapEmployees(row: any, rowIndex: number): any {
    return {
      id: row['직원ID'] || row['Employee ID'] || `EMP-${Date.now()}-${rowIndex}`,
      employeeNumber: row['사번'] || row['Employee Number'] || `E${String(rowIndex).padStart(3, '0')}`,
      name: row['이름'] || row['성명'] || row['Name'] || '',
      department: row['부서'] || row['Department'] || '',
      position: row['직급'] || row['Position'] || '',
      hireDate: this.parseDate(row['입사일'] || row['Hire Date']),
      salary: parseFloat(row['급여'] || row['Salary']) || 0,
      email: row['이메일'] || row['Email'] || '',
      phone: row['전화번호'] || row['Phone'] || '',
      status: row['상태'] || row['Status'] || '재직중'
    };
  }

  // 급여 데이터 매핑
  static mapPayroll(row: any, rowIndex: number): any {
    return {
      id: row['급여ID'] || row['Payroll ID'] || `PAY-${Date.now()}-${rowIndex}`,
      employeeId: row['직원ID'] || row['Employee ID'] || '',
      employeeName: row['직원명'] || row['Employee Name'] || '',
      month: row['급여월'] || row['Pay Period'] || '',
      baseSalary: parseFloat(row['기본급'] || row['Base Salary']) || 0,
      overtime: parseFloat(row['연장근무수당'] || row['Overtime']) || 0,
      bonus: parseFloat(row['상여금'] || row['Bonus']) || 0,
      deductions: parseFloat(row['공제액'] || row['Deductions']) || 0,
      netPay: parseFloat(row['실수령액'] || row['Net Pay']) || 0
    };
  }

  // 상태 매핑
  private static mapStatus(status: string): string {
    if (!status) return 'pending';
    
    const statusMap: Record<string, string> = {
      '계획': 'planned', '계획중': 'planned',
      '진행': 'in_progress', '진행중': 'in_progress', '작업중': 'in_progress',
      '완료': 'completed', '완료됨': 'completed',
      '지연': 'delayed', '연기': 'delayed',
      '중단': 'paused', '일시중단': 'paused',
      '취소': 'cancelled', '취소됨': 'cancelled',
      'planned': 'planned',
      'in_progress': 'in_progress', 'active': 'in_progress',
      'completed': 'completed', 'done': 'completed',
      'delayed': 'delayed',
      'paused': 'paused',
      'cancelled': 'cancelled'
    };
    
    return statusMap[status.toLowerCase()] || 'pending';
  }

  // 우선순위 매핑
  private static mapPriority(priority: string): string {
    if (!priority) return 'normal';
    
    const priorityMap: Record<string, string> = {
      '높음': 'high', '상': 'high', '긴급': 'urgent',
      '보통': 'normal', '중': 'normal', '일반': 'normal',
      '낮음': 'low', '하': 'low',
      'high': 'high', 'urgent': 'urgent',
      'normal': 'normal', 'medium': 'normal',
      'low': 'low'
    };
    
    return priorityMap[priority.toLowerCase()] || 'normal';
  }

  // 날짜 파싱
  private static parseDate(dateStr: string): string {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // 한국 날짜 형식 처리
        const cleaned = dateStr.replace(/[^\d]/g, '');
        if (cleaned.length === 8) {
          const year = cleaned.substring(0, 4);
          const month = cleaned.substring(4, 6);
          const day = cleaned.substring(6, 8);
          return `${year}-${month}-${day}`;
        }
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
}

// 통합 엑셀 임포터 클래스
export class UnifiedExcelImporter {
  private dataSourceManager: DataSourceManager;

  constructor() {
    this.dataSourceManager = DataSourceManager.getInstance();
  }

  // 엑셀 파일에서 모든 시트 데이터 임포트
  async importAllSheets(file: File): Promise<UnifiedExcelImportResult> {
    try {
      const source = this.dataSourceManager.registerImportedSource(file.name, file.size);
      
      // 실제 구현에서는 xlsx 라이브러리로 모든 시트 읽기
      // const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      // const sheets = workbook.SheetNames.map(name => ({
      //   name,
      //   data: XLSX.utils.sheet_to_json(workbook.Sheets[name])
      // }));
      
      // 임시 샘플 데이터 (실제로는 엑셀에서 파싱)
      const sheets = this.generateSampleSheets();
      
      const result: UnifiedExcelImportResult = {
        success: true,
        processedChapters: [],
        totalRecords: 0,
        data: {},
        errors: [],
        warnings: [],
        summary: {}
      };

      // 각 시트별로 데이터 처리
      for (const sheet of sheets) {
        const chapter = this.identifyChapter(sheet.name);
        if (!chapter) {
          result.warnings.push(`시트 "${sheet.name}"을 인식할 수 없어 건너뜁니다.`);
          continue;
        }

        try {
          const mappedData = this.mapSheetData(sheet.data, chapter, source.id);
          result.data[chapter] = mappedData;
          result.processedChapters.push(chapter);
          result.totalRecords += mappedData.length;
          
          result.summary[chapter] = {
            records: sheet.data.length,
            validRecords: mappedData.length,
            errorRecords: sheet.data.length - mappedData.length
          };
          
        } catch (error) {
          result.errors.push(`시트 "${sheet.name}" 처리 오류: ${error}`);
          result.success = false;
        }
      }

      return result;
      
    } catch (error) {
      return {
        success: false,
        processedChapters: [],
        totalRecords: 0,
        data: {},
        errors: [`파일 처리 오류: ${error}`],
        warnings: [],
        summary: {}
      };
    }
  }

  // 시트명으로 ERP 챕터 식별
  private identifyChapter(sheetName: string): string | null {
    const normalizedName = sheetName.toLowerCase().trim();
    return SHEET_MAPPING[normalizedName] || null;
  }

  // 시트 데이터를 해당 챕터에 맞게 매핑
  private mapSheetData(data: any[], chapter: string, sourceId: string): DataWithSource<any>[] {
    const mappedData: DataWithSource<any>[] = [];
    
    data.forEach((row, index) => {
      try {
        let mappedRow: any;
        
        switch (chapter) {
          case ERP_CHAPTERS.CUSTOMERS:
            mappedRow = UnifiedDataMapper.mapCustomers(row, index);
            break;
          case ERP_CHAPTERS.SALES_ORDERS:
            mappedRow = UnifiedDataMapper.mapSalesOrders(row, index);
            break;
          case ERP_CHAPTERS.PRODUCTION_ORDERS:
            mappedRow = UnifiedDataMapper.mapProductionOrders(row, index);
            break;
          case ERP_CHAPTERS.BOM_MANAGEMENT:
            mappedRow = UnifiedDataMapper.mapBOM(row, index);
            break;
          case ERP_CHAPTERS.INVENTORY:
            mappedRow = UnifiedDataMapper.mapInventory(row, index);
            break;
          case ERP_CHAPTERS.PURCHASE_ORDERS:
            mappedRow = UnifiedDataMapper.mapPurchaseOrders(row, index);
            break;
          case ERP_CHAPTERS.EMPLOYEES:
            mappedRow = UnifiedDataMapper.mapEmployees(row, index);
            break;
          case ERP_CHAPTERS.PAYROLL:
            mappedRow = UnifiedDataMapper.mapPayroll(row, index);
            break;
          default:
            // 기본 매핑 (필드명 그대로 사용)
            mappedRow = { ...row, id: `${chapter}-${Date.now()}-${index}` };
        }

        const wrappedData = this.dataSourceManager.wrapWithSource(
          mappedRow,
          sourceId,
          {
            rowNumber: index + 2,
            sheetName: chapter,
            validationStatus: 'valid' as const
          }
        );
        
        mappedData.push(wrappedData);
        
      } catch (error) {
        console.error(`행 ${index + 2} 매핑 오류:`, error);
      }
    });
    
    return mappedData;
  }

  // 샘플 시트 데이터 생성 (실제 엑셀 파일 분석 후 제거)
  private generateSampleSheets() {
    return [
      {
        name: '고객',
        data: [
          {
            '고객ID': 'CUST-001',
            '회사명': '테크놀로지 주식회사',
            '담당자': '김영업',
            '이메일': 'sales@tech.com',
            '전화번호': '02-1234-5678',
            '주소': '서울시 강남구',
            '업종': '제조업'
          }
        ]
      },
      {
        name: '판매주문',
        data: [
          {
            '주문번호': 'SO-2024-001',
            '고객명': '테크놀로지 주식회사',
            '제품명': '스마트 센서',
            '수량': '100',
            '단가': '50000',
            '총금액': '5000000',
            '주문일': '2024-09-01',
            '상태': '진행중'
          }
        ]
      },
      {
        name: '생산오더',
        data: [
          {
            '생산번호': 'PO-2024-001',
            '제품명': '스마트 센서',
            '수량': '100',
            '계획시작일': '2024-09-05',
            '계획완료일': '2024-09-15',
            '상태': '계획중',
            '담당자': '김생산'
          }
        ]
      }
    ];
  }
}

// 통합 엑셀 임포트 훅
export const useUnifiedExcelImport = () => {
  const importer = new UnifiedExcelImporter();
  
  const importFile = async (file: File) => {
    return await importer.importAllSheets(file);
  };
  
  return { importFile };
};
