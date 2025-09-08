// 통합 엑셀 업로더 컴포넌트 - 22개 ERP 챕터 지원
import { useState, useRef } from 'react';
import { useUnifiedExcelImport, type UnifiedExcelImportResult } from '../../utils/unifiedExcelImporter';
import { useGlobalData } from '../../context/GlobalDataContext';

interface UnifiedExcelUploaderProps {
  onUploadComplete?: (result: UnifiedExcelImportResult) => void;
}

export function UnifiedExcelUploader({ onUploadComplete }: UnifiedExcelUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UnifiedExcelImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { importFile } = useUnifiedExcelImport();
  const { importExcelData } = useGlobalData();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );
    
    if (excelFile) {
      handleFileUpload(excelFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      const result = await importFile(file);
      setUploadResult(result);
      
      // 글로벌 컨텍스트에 데이터 추가
      if (result.success && result.data) {
        Object.entries(result.data).forEach(([chapter, data]) => {
          // 챕터명을 기존 데이터 타입으로 매핑하여 importExcelData 호출
          const dataTypeMapping: Record<string, string> = {
            'customers': 'customers',
            'salesOrders': 'salesOrders',
            'productionOrders': 'productionOrders',
            'bomManagement': 'bomData',
            'inventory': 'inventory',
            'purchaseOrders': 'purchases',
            'employees': 'employees',
            'payroll': 'payroll',
            'workInstructions': 'workInstructions'
          };
          
          const mappedType = dataTypeMapping[chapter];
          if (mappedType) {
            // 통합 임포터에서 이미 DataWithSource로 래핑된 데이터를 원본 데이터만 추출하여 전달
            const rawData = data.map((item: any) => item.data || item);
            importExcelData(mappedType as any, rawData, file.name, file.size);
          }
        });
      }
      
      onUploadComplete?.(result);
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      setUploadResult({
        success: false,
        processedChapters: [],
        totalRecords: 0,
        data: {},
        errors: [`파일 처리 중 오류가 발생했습니다: ${error}`],
        warnings: [],
        summary: {}
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* 파일 업로드 영역 */}
      <div
        style={{
          border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '2rem'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          color: isDragging ? '#3b82f6' : '#6b7280'
        }}>
          📊
        </div>
        
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          color: '#1f2937'
        }}>
          {isUploading ? '파일 처리 중...' : '통합 ERP 데이터 업로드'}
        </h3>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          엑셀 파일을 드래그하거나 클릭하여 업로드하세요
        </p>
        
        {isUploading && (
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#3b82f6',
              animation: 'loading 2s infinite'
            }} />
          </div>
        )}
        
        <div style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#9ca3af'
        }}>
          지원 형식: .xlsx, .xls, .csv (최대 10MB)
        </div>
      </div>

      {/* 지원 모듈 안내 */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#1e293b'
        }}>
          📋 지원하는 22개 ERP 모듈
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          fontSize: '0.875rem'
        }}>
          {[
            { category: '영업 & 고객', items: ['고객관리', '판매주문', '견적서', 'CRM파이프라인', '영업분석'] },
            { category: '생산 & MRP', items: ['생산오더', '작업지시서', 'BOM관리', '품질관리'] },
            { category: '재고 & 구매', items: ['재고현황', '구매주문', '공급업체', '창고관리'] },
            { category: '인사 & 급여', items: ['직원정보', '급여관리', '근태관리', '성과평가'] },
            { category: '회계 & 재무', items: ['회계장부', '예산관리', '재무보고서'] },
            { category: '기타 관리', items: ['프로젝트', '문서관리'] }
          ].map((group, index) => (
            <div key={index} style={{
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontWeight: '600',
                color: '#3b82f6',
                marginBottom: '0.5rem'
              }}>
                {group.category}
              </div>
              {group.items.map((item, idx) => (
                <div key={idx} style={{
                  color: '#64748b',
                  fontSize: '0.8rem',
                  marginBottom: '0.25rem'
                }}>
                  • {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 업로드 결과 */}
      {uploadResult && (
        <div style={{
          border: `1px solid ${uploadResult.success ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px',
          padding: '1.5rem',
          backgroundColor: uploadResult.success ? '#f0fdf4' : '#fef2f2'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
              {uploadResult.success ? '✅' : '❌'}
            </span>
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: uploadResult.success ? '#065f46' : '#991b1b'
            }}>
              {uploadResult.success ? '업로드 완료' : '업로드 실패'}
            </h4>
          </div>

          {uploadResult.success && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#065f46', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                총 {uploadResult.totalRecords}개 레코드가 {uploadResult.processedChapters.length}개 모듈에 업로드되었습니다.
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem',
                marginTop: '1rem'
              }}>
                {Object.entries(uploadResult.summary).map(([chapter, stats]) => (
                  <div key={chapter} style={{
                    backgroundColor: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {chapter}
                    </div>
                    <div style={{ color: '#6b7280' }}>
                      {stats.validRecords}/{stats.records} 성공
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadResult.errors.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.5rem' }}>
                오류:
              </h5>
              {uploadResult.errors.map((error, index) => (
                <div key={index} style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '0.25rem' }}>
                  • {error}
                </div>
              ))}
            </div>
          )}

          {uploadResult.warnings.length > 0 && (
            <div>
              <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#d97706', marginBottom: '0.5rem' }}>
                경고:
              </h5>
              {uploadResult.warnings.map((warning, index) => (
                <div key={index} style={{ fontSize: '0.75rem', color: '#d97706', marginBottom: '0.25rem' }}>
                  • {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
}
