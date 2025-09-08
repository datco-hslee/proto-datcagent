// 데이터 소스 관리 및 구분을 위한 유틸리티
export type DataSource = {
  id: string;
  type: 'test_generated' | 'imported' | 'demo_data';
  name: string;
  description: string;
  createdAt: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    importTime?: string;
  };
};

export interface DataWithSource<T> {
  data: T;
  source: DataSource;
  metadata?: {
    rowNumber?: number;
    sheetName?: string;
    validationStatus?: 'valid' | 'warning' | 'error';
    validationMessages?: string[];
  };
}

// 기본 데이터 소스 정의
export const DATA_SOURCES: Record<string, DataSource> = {
  TEST_GENERATED: {
    id: 'test_generated',
    name: '테스트 데이터 (자동생성)',
    type: 'test_generated',
    createdAt: '2024-01-01T00:00:00Z',
    description: '시스템에서 자동 생성된 테스트용 더미 데이터'
  },
  DEMO_DATA: {
    id: 'demo_data',
    name: '닷코 시연 데이터',
    type: 'demo_data',
    createdAt: new Date().toISOString(),
    description: '닷코 시연용으로 준비된 실제 제조업 데이터'
  }
};

// 데이터 소스 관리 클래스
export class DataSourceManager {
  private static instance: DataSourceManager;
  private dataSources: Map<string, DataSource> = new Map();

  private constructor() {
    // 기본 데이터 소스 등록
    Object.values(DATA_SOURCES).forEach(source => {
      this.dataSources.set(source.id, source);
    });
  }

  static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager();
    }
    return DataSourceManager.instance;
  }

  // 새 데이터 소스 등록 (엑셀 파일 임포트 시)
  registerImportedSource(fileName: string, fileSize: number): DataSource {
    const source: DataSource = {
      id: `imported_${Date.now()}`,
      name: `엑셀 임포트 (${fileName})`,
      type: 'imported',
      createdAt: new Date().toISOString(),
      description: `${fileName} 파일에서 임포트된 데이터`,
      metadata: {
        fileName,
        fileSize,
        importTime: new Date().toISOString()
      }
    };

    this.dataSources.set(source.id, source);
    return source;
  }

  getSource(id: string): DataSource | undefined {
    return this.dataSources.get(id);
  }

  getAllSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }

  // 데이터에 소스 정보 첨부
  wrapWithSource<T>(data: T, sourceId: string, metadata?: any): DataWithSource<T> {
    const source = this.getSource(sourceId);
    if (!source) {
      throw new Error(`Data source not found: ${sourceId}`);
    }

    return {
      data,
      source,
      metadata
    };
  }
}

// 데이터 소스별 스타일링
export const getSourceBadgeStyle = (sourceType: DataSource['type']) => {
  const baseStyle = {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    display: 'inline-block'
  };

  switch (sourceType) {
    case 'test_generated':
      return {
        ...baseStyle,
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fbbf24'
      };
    case 'demo_data':
      return {
        ...baseStyle,
        backgroundColor: '#d1fae5',
        color: '#065f46',
        border: '1px solid #10b981'
      };
    case 'imported':
      return {
        ...baseStyle,
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        border: '1px solid #3b82f6'
      };
    default:
      return baseStyle;
  }
};

// 데이터 소스 아이콘
export const getSourceIcon = (sourceType: DataSource['type']) => {
  switch (sourceType) {
    case 'test_generated':
      return '🧪';
    case 'demo_data':
      return '🎯';
    case 'imported':
      return '📊';
    default:
      return '📄';
  }
};
