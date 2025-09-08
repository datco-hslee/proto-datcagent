// 엑셀 파일 임포트 및 데이터 변환 유틸리티
import { DataSourceManager, DataWithSource } from '../data/dataSourceManager';

export interface ExcelImportResult<T> {
  success: boolean;
  data: DataWithSource<T>[];
  errors: string[];
  warnings: string[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
  };
}

// 엑셀 데이터를 ERP 구조에 맞게 변환하는 매핑 함수들
export class ERPDataMapper {
  
  // 생산 오더 매핑
  static mapProductionOrder(row: any, rowIndex: number): any {
    return {
      id: row['오더ID'] || `PO-${Date.now()}-${rowIndex}`,
      orderNumber: row['오더번호'] || `PO-2024-${String(rowIndex).padStart(3, '0')}`,
      productName: row['제품명'] || row['상품명'] || '',
      productCode: row['제품코드'] || row['상품코드'] || '',
      quantity: parseInt(row['수량']) || 0,
      unit: row['단위'] || 'EA',
      status: this.mapStatus(row['상태'] || row['진행상태']),
      priority: this.mapPriority(row['우선순위'] || row['중요도']),
      plannedStartDate: this.parseDate(row['시작예정일'] || row['계획시작일']),
      plannedEndDate: this.parseDate(row['완료예정일'] || row['계획완료일']),
      actualStartDate: this.parseDate(row['실제시작일']),
      actualEndDate: this.parseDate(row['실제완료일']),
      customerName: row['고객명'] || row['거래처명'] || '',
      orderAmount: parseFloat(row['주문금액'] || row['금액']) || 0,
      notes: row['비고'] || row['메모'] || ''
    };
  }

  // BOM 데이터 매핑
  static mapBOMData(row: any, rowIndex: number): any {
    return {
      id: row['BOM_ID'] || `BOM-${Date.now()}-${rowIndex}`,
      productCode: row['제품코드'] || row['상위코드'] || '',
      productName: row['제품명'] || row['상위품목명'] || '',
      componentCode: row['부품코드'] || row['하위코드'] || '',
      componentName: row['부품명'] || row['하위품목명'] || '',
      quantity: parseFloat(row['소요량'] || row['수량']) || 1,
      unit: row['단위'] || 'EA',
      unitCost: parseFloat(row['단가'] || row['부품단가']) || 0,
      totalCost: parseFloat(row['총비용'] || row['합계금액']) || 0,
      supplier: row['공급업체'] || row['협력사'] || '',
      leadTime: parseInt(row['리드타임'] || row['조달기간']) || 0
    };
  }

  // 고객 데이터 매핑
  static mapCustomerData(row: any, rowIndex: number): any {
    return {
      id: row['고객ID'] || `CUST-${Date.now()}-${rowIndex}`,
      companyName: row['회사명'] || row['거래처명'] || '',
      contactPerson: row['담당자'] || row['연락담당자'] || '',
      email: row['이메일'] || row['EMAIL'] || '',
      phone: row['전화번호'] || row['연락처'] || '',
      address: row['주소'] || '',
      businessType: row['업종'] || row['사업분야'] || '',
      creditRating: row['신용등급'] || 'B',
      paymentTerms: row['결제조건'] || '월말결제',
      taxId: row['사업자번호'] || ''
    };
  }

  // 상태 매핑 (한글 → 영문)
  private static mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      '계획': 'planned',
      '계획중': 'planned',
      '진행': 'in_progress',
      '진행중': 'in_progress',
      '작업중': 'in_progress',
      '완료': 'completed',
      '완료됨': 'completed',
      '지연': 'delayed',
      '중단': 'paused',
      '취소': 'cancelled'
    };
    return statusMap[status] || 'planned';
  }

  // 우선순위 매핑
  private static mapPriority(priority: string): string {
    const priorityMap: Record<string, string> = {
      '높음': 'high',
      '상': 'high',
      '긴급': 'urgent',
      '보통': 'normal',
      '중': 'normal',
      '일반': 'normal',
      '낮음': 'low',
      '하': 'low'
    };
    return priorityMap[priority] || 'normal';
  }

  // 날짜 파싱
  private static parseDate(dateStr: string): string {
    if (!dateStr) return '';
    
    try {
      // 다양한 날짜 형식 지원
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // 한국 날짜 형식 (YYYY.MM.DD, YYYY-MM-DD 등) 처리
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

// 엑셀 파일 처리 클래스
export class ExcelImporter {
  private dataSourceManager: DataSourceManager;

  constructor() {
    this.dataSourceManager = DataSourceManager.getInstance();
  }

  // 엑셀 파일에서 생산 오더 데이터 임포트
  async importProductionOrders(file: File): Promise<ExcelImportResult<any>> {
    try {
      const source = this.dataSourceManager.registerImportedSource(file.name, file.size);
      
      // 실제 구현에서는 xlsx 라이브러리 사용
      // const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      // const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      // 임시 더미 데이터 (실제로는 엑셀에서 파싱)
      const rawData = this.generateSampleExcelData();
      
      const results: DataWithSource<any>[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];
      
      rawData.forEach((row, index) => {
        try {
          const mappedData = ERPDataMapper.mapProductionOrder(row, index);
          const validation = this.validateProductionOrder(mappedData);
          
          const wrappedData = this.dataSourceManager.wrapWithSource(
            mappedData,
            source.id,
            {
              rowNumber: index + 2, // 엑셀 행 번호 (헤더 제외)
              sheetName: 'Sheet1',
              validationStatus: validation.isValid ? 'valid' : 'warning',
              validationMessages: validation.messages
            }
          );
          
          results.push(wrappedData);
          
          if (!validation.isValid) {
            warnings.push(`행 ${index + 2}: ${validation.messages.join(', ')}`);
          }
          
        } catch (error) {
          errors.push(`행 ${index + 2}: 데이터 변환 오류 - ${error}`);
        }
      });
      
      return {
        success: errors.length === 0,
        data: results,
        errors,
        warnings,
        summary: {
          totalRows: rawData.length,
          validRows: results.filter(r => r.metadata?.validationStatus === 'valid').length,
          errorRows: errors.length,
          warningRows: warnings.length
        }
      };
      
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [`파일 처리 오류: ${error}`],
        warnings: [],
        summary: { totalRows: 0, validRows: 0, errorRows: 1, warningRows: 0 }
      };
    }
  }

  // 데이터 유효성 검증
  private validateProductionOrder(data: any): { isValid: boolean; messages: string[] } {
    const messages: string[] = [];
    
    if (!data.productName) messages.push('제품명이 누락되었습니다');
    if (!data.productCode) messages.push('제품코드가 누락되었습니다');
    if (data.quantity <= 0) messages.push('수량이 올바르지 않습니다');
    if (!data.customerName) messages.push('고객명이 누락되었습니다');
    
    return {
      isValid: messages.length === 0,
      messages
    };
  }

  // 샘플 엑셀 데이터 생성 (실제 엑셀 파일 분석 후 제거)
  private generateSampleExcelData(): any[] {
    return [
      {
        '오더번호': 'PO-2024-001',
        '제품명': '스마트 센서 모듈',
        '제품코드': 'SSM-001',
        '수량': '100',
        '단위': 'EA',
        '상태': '진행중',
        '우선순위': '높음',
        '시작예정일': '2024-09-01',
        '완료예정일': '2024-09-15',
        '고객명': '테크놀로지 주식회사',
        '주문금액': '5000000',
        '비고': '긴급 주문'
      },
      {
        '오더번호': 'PO-2024-002',
        '제품명': 'IoT 게이트웨이',
        '제품코드': 'IGW-002',
        '수량': '50',
        '단위': 'EA',
        '상태': '계획중',
        '우선순위': '보통',
        '시작예정일': '2024-09-10',
        '완료예정일': '2024-09-25',
        '고객명': '스마트시티 솔루션',
        '주문금액': '7500000',
        '비고': '정기 주문'
      }
    ];
  }
}

// 엑셀 파일 업로드 컴포넌트에서 사용할 훅
export const useExcelImport = () => {
  const importer = new ExcelImporter();
  
  const importFile = async (file: File, dataType: 'production' | 'bom' | 'customer') => {
    switch (dataType) {
      case 'production':
        return await importer.importProductionOrders(file);
      default:
        throw new Error(`지원하지 않는 데이터 타입: ${dataType}`);
    }
  };
  
  return { importFile };
};
