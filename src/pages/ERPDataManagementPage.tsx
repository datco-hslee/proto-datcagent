import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { generateMassiveERPData } from '../data/massiveERPData';

interface ERPDataStats {
  salesOrders: number;
  purchaseOrders: number;
  materialInbounds: number;
  productionOrders: number;
  shipments: number;
  attendanceRecords: number;
  payrollRecords: number;
  accountingEntries: number;
}

interface BOMSufficiencyResult {
  purchaseOrderId: string;
  orderNumber: string;
  supplier: string;
  overallSufficiency: string;
  totalMaterials: number;
  sufficientMaterials: number;
  insufficientMaterials: number;
}

export function ERPDataManagementPage() {
  const [erpData, setErpData] = useState<any>(null);
  const [stats, setStats] = useState<ERPDataStats | null>(null);
  const [bomAnalysis, setBomAnalysis] = useState<BOMSufficiencyResult[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bom-analysis' | 'inventory' | 'bom-detail'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const pageStyle: React.CSSProperties = {
    padding: '2rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    minHeight: '100vh',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: '1.1rem',
  };

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '1rem',
  };

  const tabStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    background: '#3b82f6',
    color: 'white',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
  };


  const cardGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  const statCardStyle: React.CSSProperties = {
    padding: '1.5rem',
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  };

  const statHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  };

  const statTitleStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
  };

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🚀 ERP 데이터 로딩 시작...');
      const data = generateMassiveERPData();
      setErpData(data);

      // 통계 계산
      const newStats: ERPDataStats = {
        salesOrders: data.salesOrders?.length || 0,
        purchaseOrders: data.purchaseOrders?.length || 0,
        materialInbounds: data.materialInbounds?.length || 0,
        productionOrders: data.productionOrders?.length || 0,
        shipments: data.shipments?.length || 0,
        attendanceRecords: data.attendanceRecords?.length || 0,
        payrollRecords: data.payrollRecords?.length || 0,
        accountingEntries: data.accountingEntries?.length || 0,
      };
      setStats(newStats);

      // BOM 충족도 분석 (처음 10개 구매주문)
      if (data.purchaseOrders && data.purchaseOrders.length > 0) {
        const bomResults = analyzeBOMSufficiency(data, data.purchaseOrders.slice(0, 10));
        setBomAnalysis(bomResults);
      }

      // 재고 현황 분석
      if (data.materialInbounds && data.productionOrders) {
        const inventory = analyzeInventoryStatus(data);
        setInventoryStatus(inventory);
      }

      console.log('✅ ERP 데이터 로딩 완료');
    } catch (error) {
      console.error('❌ ERP 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBOMSufficiency = (data: any, purchaseOrders: any[]): BOMSufficiencyResult[] => {
    // BOM 충족도 분석 로직 (간소화된 버전)
    return purchaseOrders.map(po => ({
      purchaseOrderId: po.id,
      orderNumber: po.orderNumber,
      supplier: po.supplierName || 'Unknown',
      overallSufficiency: `${Math.floor(Math.random() * 30 + 70)}%`,
      totalMaterials: po.items?.length || 0,
      sufficientMaterials: Math.floor((po.items?.length || 0) * 0.8),
      insufficientMaterials: Math.floor((po.items?.length || 0) * 0.2),
    }));
  };

  const analyzeInventoryStatus = (data: any) => {
    // 재고 현황 분석 로직 (간소화된 버전)
    const materials = ['MAT-001', 'MAT-002', 'MAT-003', 'MAT-004', 'MAT-005'];
    return materials.map(materialCode => ({
      materialCode,
      materialName: `자재 ${materialCode}`,
      inboundQty: Math.floor(Math.random() * 1000 + 500),
      consumedQty: Math.floor(Math.random() * 800 + 200),
      remainingQty: Math.floor(Math.random() * 400 + 100),
      turnoverRate: `${Math.floor(Math.random() * 40 + 60)}%`,
    }));
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderOverviewTab = () => (
    <div>
      <div style={cardGridStyle}>
        <div style={statCardStyle}>
          <div style={statHeaderStyle}>
            <div style={statTitleStyle}>영업 주문</div>
            <ShoppingCart style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} />
          </div>
          <div style={statValueStyle}>{stats?.salesOrders?.toLocaleString() || 0}</div>
          <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <TrendingUp style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem' }} />
            +12% 전월 대비
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statHeaderStyle}>
            <div style={statTitleStyle}>구매 주문</div>
            <Package style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} />
          </div>
          <div style={statValueStyle}>{stats?.purchaseOrders?.toLocaleString() || 0}</div>
          <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <TrendingUp style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem' }} />
            +8% 전월 대비
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statHeaderStyle}>
            <div style={statTitleStyle}>생산 주문</div>
            <Database style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} />
          </div>
          <div style={statValueStyle}>{stats?.productionOrders?.toLocaleString() || 0}</div>
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <AlertTriangle style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem' }} />
            3건 지연
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statHeaderStyle}>
            <div style={statTitleStyle}>출하/배송</div>
            <Truck style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />
          </div>
          <div style={statValueStyle}>{stats?.shipments?.toLocaleString() || 0}</div>
          <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <CheckCircle style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem' }} />
            98% 정시 배송
          </div>
        </div>
      </div>

      <div style={cardGridStyle}>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            <BarChart3 style={{ width: '1.25rem', height: '1.25rem', display: 'inline', marginRight: '0.5rem' }} />
            데이터 생성 현황
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>자재 입고</span>
              <Badge variant="secondary">{stats?.materialInbounds?.toLocaleString() || 0}건</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>근태 기록</span>
              <Badge variant="secondary">{stats?.attendanceRecords?.toLocaleString() || 0}건</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>급여 기록</span>
              <Badge variant="secondary">{stats?.payrollRecords?.toLocaleString() || 0}건</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>회계 분개</span>
              <Badge variant="secondary">{stats?.accountingEntries?.toLocaleString() || 0}건</Badge>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            <Clock style={{ width: '1.25rem', height: '1.25rem', display: 'inline', marginRight: '0.5rem' }} />
            데이터 생성 기간
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>시작일</span>
              <span style={{ fontWeight: '600' }}>2023년 7월 1일</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>종료일</span>
              <span style={{ fontWeight: '600' }}>2024년 6월 30일</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>총 기간</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>12개월</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>총 거래</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>
                {Object.values(stats || {}).reduce((sum, val) => sum + val, 0).toLocaleString()}건
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderBOMAnalysisTab = () => (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Input
          placeholder="구매 주문 번호로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <Button variant="outline">
          <Search style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          검색
        </Button>
      </div>

      <Card style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
          BOM 충족도 분석 결과
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>주문번호</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>공급업체</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>전체 충족도</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>충족 자재</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>부족 자재</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {bomAnalysis.map((item, index) => (
                <tr key={item.purchaseOrderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{item.orderNumber}</td>
                  <td style={{ padding: '0.75rem' }}>{item.supplier}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <Badge variant={parseInt(item.overallSufficiency) >= 90 ? "default" : "secondary"}>
                      {item.overallSufficiency}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {item.sufficientMaterials}/{item.totalMaterials}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {item.insufficientMaterials > 0 ? (
                      <Badge variant="destructive">{item.insufficientMaterials}</Badge>
                    ) : (
                      <span style={{ color: '#10b981' }}>0</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {item.insufficientMaterials > 0 ? (
                      <Badge variant="destructive">부족</Badge>
                    ) : (
                      <Badge variant="default">충분</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderInventoryTab = () => (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Input
          placeholder="자재명 또는 코드로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <Button variant="outline">
          <Search style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          검색
        </Button>
      </div>

      <Card style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
          재고 현황 분석
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>자재명</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>자재코드</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>입고량</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>소모량</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>잔여량</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>회전율</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {inventoryStatus.map((item) => (
                <tr key={item.materialCode} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem' }}>{item.materialName}</td>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{item.materialCode}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.inboundQty}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.consumedQty}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.remainingQty}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.turnoverRate}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.inboundQuantity.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.consumedQuantity.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.remainingQuantity.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.turnoverRate.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <Badge variant={item.status === 'sufficient' ? 'default' : 'destructive'}>
                      {item.status === 'sufficient' ? '충분' : '부족'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

  const renderBOMDetailTab = () => {
    const allERPData = generateMassiveERPData();
    
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <Input
            placeholder="데이터 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            BOM 세부 분석 - 전체 ERP 데이터
          </h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>구매 주문</h4>
              <p>총 {allERPData.purchaseOrders?.length || 0}건</p>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>판매 주문</h4>
              <p>총 {allERPData.salesOrders?.length || 0}건</p>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>생산 주문</h4>
              <p>총 {allERPData.productionOrders?.length || 0}건</p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <Database style={{ width: '2rem', height: '2rem' }} />
          ERP 데이터 관리
        </h1>
        <p style={subtitleStyle}>
          생성된 대량 ERP 데이터를 조회하고 분석할 수 있습니다.
        </p>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          {loading ? '로딩 중...' : '데이터 새로고침'}
        </Button>
        <Button variant="outline">
          <Download style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          데이터 내보내기
        </Button>
        <Button variant="outline">
          <Filter style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          필터
        </Button>
      </div>

      <div style={tabsStyle}>
        <button
          style={activeTab === 'overview' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('overview')}
        >
          개요
        </button>
        <button
          style={activeTab === 'bom-analysis' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('bom-analysis')}
        >
          BOM 충족성 분석
        </button>
        <button
          style={activeTab === 'inventory' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('inventory')}
        >
          재고 현황
        </button>
        <button
          style={activeTab === 'bom-detail' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('bom-detail')}
        >
          BOM 세부 분석
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <RefreshCw style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          <p>ERP 데이터를 로딩하고 있습니다...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'bom-analysis' && renderBOMAnalysisTab()}
          {activeTab === 'inventory' && renderInventoryTab()}
          {activeTab === 'bom-detail' && renderBOMDetailTab()}
        </>
      )}
    </div>
  );
}
