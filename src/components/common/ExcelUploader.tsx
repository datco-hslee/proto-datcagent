import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useExcelImport, ExcelImportResult } from '../../utils/excelImporter';
import { DataSourceBadge } from './DataSourceBadge';

interface ExcelUploaderProps {
  dataType: 'production' | 'bom' | 'customer';
  onImportComplete: (result: ExcelImportResult<any>) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // MB
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  dataType,
  onImportComplete,
  acceptedFormats = ['.xlsx', '.xls', '.csv'],
  maxFileSize = 10
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<ExcelImportResult<any> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importFile } = useExcelImport();

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
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // 파일 유효성 검사
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      alert(`지원하지 않는 파일 형식입니다. (${acceptedFormats.join(', ')})`);
      return;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      alert(`파일 크기가 너무 큽니다. (최대 ${maxFileSize}MB)`);
      return;
    }

    setIsProcessing(true);
    setUploadResult(null);

    try {
      const result = await importFile(file, dataType);
      setUploadResult(result);
      onImportComplete(result);
    } catch (error) {
      console.error('파일 처리 오류:', error);
      setUploadResult({
        success: false,
        data: [],
        errors: [`파일 처리 중 오류가 발생했습니다: ${error}`],
        warnings: [],
        summary: { totalRows: 0, validRows: 0, errorRows: 1, warningRows: 0 }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDataTypeLabel = (type: string) => {
    const labels = {
      production: '생산 오더',
      bom: 'BOM 데이터',
      customer: '고객 정보'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 파일 업로드 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {isProcessing ? (
            <>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ margin: 0, color: '#6b7280' }}>파일을 처리하고 있습니다...</p>
            </>
          ) : (
            <>
              <FileSpreadsheet size={48} color="#6b7280" />
              <div>
                <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                  {getDataTypeLabel(dataType)} 엑셀 파일 업로드
                </p>
                <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  파일을 드래그하거나 클릭하여 선택하세요
                </p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#9ca3af', fontSize: '0.75rem' }}>
                  지원 형식: {acceptedFormats.join(', ')} (최대 {maxFileSize}MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 업로드 결과 */}
      {uploadResult && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            padding: '1rem',
            border: `1px solid ${uploadResult.success ? '#10b981' : '#ef4444'}`,
            borderRadius: '8px',
            backgroundColor: uploadResult.success ? '#ecfdf5' : '#fef2f2'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {uploadResult.success ? (
                <CheckCircle size={20} color="#10b981" />
              ) : (
                <AlertCircle size={20} color="#ef4444" />
              )}
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                {uploadResult.success ? '임포트 완료' : '임포트 실패'}
              </h4>
            </div>

            {/* 요약 정보 */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '1rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <div>
                <span style={{ color: '#6b7280' }}>총 행수: </span>
                <span style={{ fontWeight: '600' }}>{uploadResult.summary.totalRows}</span>
              </div>
              <div>
                <span style={{ color: '#10b981' }}>성공: </span>
                <span style={{ fontWeight: '600', color: '#10b981' }}>{uploadResult.summary.validRows}</span>
              </div>
              <div>
                <span style={{ color: '#f59e0b' }}>경고: </span>
                <span style={{ fontWeight: '600', color: '#f59e0b' }}>{uploadResult.summary.warningRows}</span>
              </div>
              <div>
                <span style={{ color: '#ef4444' }}>오류: </span>
                <span style={{ fontWeight: '600', color: '#ef4444' }}>{uploadResult.summary.errorRows}</span>
              </div>
            </div>

            {/* 오류 메시지 */}
            {uploadResult.errors.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontSize: '0.875rem' }}>오류:</h5>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#7f1d1d' }}>
                  {uploadResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 경고 메시지 */}
            {uploadResult.warnings.length > 0 && (
              <div>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b', fontSize: '0.875rem' }}>경고:</h5>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#92400e' }}>
                  {uploadResult.warnings.slice(0, 5).map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                  {uploadResult.warnings.length > 5 && (
                    <li>... 외 {uploadResult.warnings.length - 5}개</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* 임포트된 데이터 미리보기 */}
          {uploadResult.success && uploadResult.data.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600' }}>
                임포트된 데이터 미리보기 (상위 3개)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {uploadResult.data.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      backgroundColor: '#fff',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600' }}>
                        {item.data.productName || item.data.companyName || `항목 ${index + 1}`}
                      </span>
                      <DataSourceBadge source={item.source} size="sm" />
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                      {dataType === 'production' && (
                        <>주문번호: {item.data.orderNumber} | 수량: {item.data.quantity} {item.data.unit}</>
                      )}
                      {dataType === 'customer' && (
                        <>연락처: {item.data.phone} | 이메일: {item.data.email}</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
