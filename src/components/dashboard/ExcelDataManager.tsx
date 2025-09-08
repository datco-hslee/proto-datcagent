import React, { useState } from 'react';
import { Upload, Database, Filter, BarChart3, FileSpreadsheet } from 'lucide-react';
import { ExcelUploader } from '../common/ExcelUploader';
import { DataSourceFilter, DataSourceBadge } from '../common/DataSourceBadge';
import { useGlobalData } from '../../context/GlobalDataContext';
import type { ExcelImportResult } from '../../utils/excelImporter';

export const ExcelDataManager: React.FC = () => {
  const {
    dataSources,
    selectedDataSources,
    toggleDataSource,
    selectAllDataSources,
    selectNoDataSources,
    importExcelData,
    getDataSourceStats,
    isLoading
  } = useGlobalData();

  const [activeUploadType, setActiveUploadType] = useState<string>('');
  const [showUploader, setShowUploader] = useState(false);
  const stats = getDataSourceStats();

  const uploadTypes = [
    { id: 'salesOrders', label: '영업 & 주문 데이터', icon: BarChart3, description: '고객, 견적서, 주문 정보' },
    { id: 'productionOrders', label: '생산 & MRP 데이터', icon: Database, description: '생산계획, 작업지시서, BOM' },
    { id: 'inventory', label: '재고 & 구매 데이터', icon: FileSpreadsheet, description: '재고현황, 구매주문, 입출고' },
    { id: 'employees', label: '인사 & 급여 데이터', icon: Upload, description: '직원정보, 급여, 근태관리' }
  ];

  const handleImportComplete = (result: ExcelImportResult<any>) => {
    if (result.success && result.data.length > 0) {
      const mappedData = result.data.map(item => item.data);
      importExcelData(mappedData, activeUploadType, 'uploaded_file.xlsx', 1024);
      setShowUploader(false);
      setActiveUploadType('');
    }
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Database size={24} color="#3b82f6" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
            통합 데이터 관리 센터
          </h2>
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
          엑셀 파일을 업로드하여 모든 ERP 모듈에 실시간으로 데이터를 연동하세요
        </p>
      </div>

      {/* 데이터 현황 요약 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Database size={16} color="#10b981" />
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>총 데이터</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
            {stats.total.toLocaleString()}건
          </p>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Filter size={16} color="#3b82f6" />
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>활성 소스</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
            {selectedDataSources.length}/{dataSources.length}
          </p>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileSpreadsheet size={16} color="#f59e0b" />
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>임포트 파일</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
            {dataSources.filter(s => s.type === 'imported').length}개
          </p>
        </div>
      </div>

      {/* 업로드 타입 선택 */}
      {!showUploader && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            데이터 업로드 선택
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1rem' 
          }}>
            {uploadTypes.map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setActiveUploadType(type.id);
                  setShowUploader(true);
                }}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <type.icon size={24} color="#3b82f6" />
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {type.label}
                  </h4>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 엑셀 업로더 */}
      {showUploader && activeUploadType && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
              {uploadTypes.find(t => t.id === activeUploadType)?.label} 업로드
            </h3>
            <button
              onClick={() => {
                setShowUploader(false);
                setActiveUploadType('');
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              취소
            </button>
          </div>
          
          <ExcelUploader
            dataType={activeUploadType as any}
            onImportComplete={handleImportComplete}
          />
        </div>
      )}

      {/* 데이터 소스 필터 */}
      <div style={{ marginBottom: '2rem' }}>
        <DataSourceFilter
          selectedSources={selectedDataSources}
          availableSources={dataSources}
          onSourceToggle={toggleDataSource}
          onSelectAll={selectAllDataSources}
          onSelectNone={selectNoDataSources}
        />
      </div>

      {/* 데이터 소스별 통계 */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
          데이터 소스별 현황
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {dataSources.map(source => (
            <div
              key={source.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <DataSourceBadge source={source} />
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                    {source.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                    {source.description}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {stats.bySource[source.id] || 0}건
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                  {selectedDataSources.includes(source.id) ? '활성' : '비활성'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            padding: '2rem',
            backgroundColor: '#fff',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
              데이터를 처리하고 있습니다...
            </p>
          </div>
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
