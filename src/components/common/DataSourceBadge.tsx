import React from 'react';
import { DataSource, getSourceBadgeStyle, getSourceIcon } from '../../data/dataSourceManager';

interface DataSourceBadgeProps {
  source: DataSource;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ 
  source, 
  showIcon = true, 
  showTooltip = true,
  size = 'sm'
}) => {
  const style = getSourceBadgeStyle(source.type);
  const icon = getSourceIcon(source.type);
  
  const sizeStyle = size === 'md' ? {
    padding: '4px 12px',
    fontSize: '0.875rem'
  } : {};

  const badgeElement = (
    <span 
      style={{ 
        ...style, 
        ...sizeStyle,
        cursor: showTooltip ? 'help' : 'default'
      }}
      title={showTooltip ? `${source.name}\n${source.description || ''}` : undefined}
    >
      {showIcon && <span style={{ marginRight: '4px' }}>{icon}</span>}
      {source.name}
    </span>
  );

  return badgeElement;
};

// 데이터 소스 필터 컴포넌트
interface DataSourceFilterProps {
  selectedSources: string[];
  availableSources: DataSource[];
  onSourceToggle: (sourceId: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
}

export const DataSourceFilter: React.FC<DataSourceFilterProps> = ({
  selectedSources,
  availableSources,
  onSourceToggle,
  onSelectAll,
  onSelectNone
}) => {
  return (
    <div style={{ 
      padding: '1rem', 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600' }}>
          데이터 소스 필터
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onSelectAll}
            style={{
              padding: '2px 8px',
              fontSize: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            전체선택
          </button>
          <button
            onClick={onSelectNone}
            style={{
              padding: '2px 8px',
              fontSize: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            선택해제
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {availableSources.map(source => (
          <label
            key={source.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <input
              type="checkbox"
              checked={selectedSources.includes(source.id)}
              onChange={() => onSourceToggle(source.id)}
              style={{ margin: 0 }}
            />
            <DataSourceBadge source={source} size="sm" />
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              ({source.type === 'imported' && source.fileInfo ? 
                `${source.fileInfo.fileName}` : 
                source.description?.substring(0, 30) + '...'
              })
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
