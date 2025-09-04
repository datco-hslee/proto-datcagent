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
  const [erpData, setErpData] = useState<any>({});
  const [stats, setStats] = useState<ERPDataStats | null>(null);
  const [bomAnalysis, setBomAnalysis] = useState<BOMSufficiencyResult[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showAllOrders, setShowAllOrders] = useState<{[key: string]: boolean}>({});
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

  const tabButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabButtonStyle,
    background: '#3b82f6',
    color: 'white',
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
        <Card style={{ padding: '1.5rem' }}>
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
        </Card>

        <Card style={{ padding: '1.5rem' }}>
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
                    {parseInt(item.overallSufficiency) >= 90 ? (
                      <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
                    ) : (
                      <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
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
      <Card style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
          재고 현황 분석
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>자재코드</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>자재명</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>입고수량</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>소모수량</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>잔여수량</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>회전율</th>
              </tr>
            </thead>
            <tbody>
              {inventoryStatus.map((item, index) => (
                <tr key={item.materialCode} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{item.materialCode}</td>
                  <td style={{ padding: '0.75rem' }}>{item.materialName}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.inboundQty.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.consumedQty.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <span style={{ color: item.remainingQty < 100 ? '#ef4444' : '#374151' }}>
                      {item.remainingQty.toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <Badge variant={parseInt(item.turnoverRate) > 80 ? "default" : "secondary"}>
                      {item.turnoverRate}
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

  const toggleOrderDetails = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const toggleShowAllOrders = (groupRange: string) => {
    setShowAllOrders(prev => ({
      ...prev,
      [groupRange]: !prev[groupRange]
    }));
  };

  const renderBOMDetailTab = () => {
    const { purchaseOrders, bom } = erpData;
    
    // 구매 주문이 없는 경우 처리
    if (!purchaseOrders || purchaseOrders.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <p>구매 주문 데이터가 없습니다.</p>
        </div>
      );
    }
    
    // 구매 주문을 100개씩 그룹화
    const groupedPurchaseOrders = [];
    for (let i = 0; i < purchaseOrders.length; i += 100) {
      const group = purchaseOrders.slice(i, i + 100);
      groupedPurchaseOrders.push({
        range: `${i}~${Math.min(i + 99, purchaseOrders.length - 1)}`,
        orders: group,
        totalValue: group.reduce((sum: number, order: any) => sum + (order.totalAmount || order.amount || 0), 0),
        materialCount: new Set(group.map((order: any) => order.materialCode || order.material)).size
      });
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          <Input
            type="text"
            placeholder="구매 주문 범위 또는 자재 검색..."
            style={{ maxWidth: '300px' }}
          />
          <Badge variant="outline">
            총 {purchaseOrders.length}개 주문 / {groupedPurchaseOrders.length}개 그룹
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
          {groupedPurchaseOrders.map((group, groupIndex) => (
            <Card key={groupIndex} className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  구매 주문 {group.range}
                </h4>
                <Badge variant="secondary">
                  {group.orders.length}개 주문
                </Badge>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>총 주문 금액:</span>
                  <div style={{ fontWeight: 600, color: '#059669', fontSize: '1.1rem' }}>
                    ₩{group.totalValue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>자재 종류:</span>
                  <div style={{ fontWeight: 600, color: '#1d4ed8', fontSize: '1.1rem' }}>
                    {group.materialCount}개 자재
                  </div>
                </div>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem' }}>
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '0.25rem', color: '#64748b' }}>주문번호</th>
                      <th style={{ textAlign: 'left', padding: '0.25rem', color: '#64748b' }}>자재</th>
                      <th style={{ textAlign: 'right', padding: '0.25rem', color: '#64748b' }}>수량</th>
                      <th style={{ textAlign: 'right', padding: '0.25rem', color: '#64748b' }}>금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllOrders[group.range] ? group.orders : group.orders.slice(0, 10)).map((order: any, orderIndex: number) => (
                      <React.Fragment key={orderIndex}>
                        <tr style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} 
                            onClick={() => toggleOrderDetails(order.id || order.orderNumber || `${group.range}-${orderIndex}`)}>
                          <td style={{ padding: '0.25rem', fontWeight: 500, color: '#3b82f6' }}>
                            {order.orderNumber || order.id || `PO-${orderIndex}`}
                            {expandedOrders.has(order.id || order.orderNumber || `${group.range}-${orderIndex}`) ? ' ▼' : ' ▶'}
                          </td>
                          <td style={{ padding: '0.25rem' }}>
                            {order.items ? `${order.items.length}개 자재` : (order.materialCode || order.material || 'N/A')}
                          </td>
                          <td style={{ padding: '0.25rem', textAlign: 'right' }}>
                            {order.items ? order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0).toLocaleString() : (order.quantity || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.25rem', textAlign: 'right', color: '#059669' }}>
                            ₩{(order.totalAmount || order.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                        {expandedOrders.has(order.id || order.orderNumber || `${group.range}-${orderIndex}`) && order.items && (
                          <tr>
                            <td colSpan={4} style={{ padding: '0', backgroundColor: '#f8fafc' }}>
                              <div style={{ padding: '1rem', margin: '0.5rem' }}>
                                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                  주문 세부 항목
                                </h5>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                  {order.items.map((item: any, itemIndex: number) => (
                                    <div key={itemIndex} style={{ 
                                      display: 'grid', 
                                      gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                                      gap: '0.5rem', 
                                      padding: '0.5rem', 
                                      backgroundColor: 'white', 
                                      borderRadius: '0.25rem',
                                      fontSize: '0.8rem'
                                    }}>
                                      <div>
                                        <div style={{ fontWeight: 600 }}>{item.materialName || item.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.materialCode}</div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        {(item.quantity || 0).toLocaleString()} {item.unit || 'EA'}
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        ₩{(item.unitPrice || 0).toLocaleString()}
                                      </div>
                                      <div style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                                        ₩{(item.totalPrice || 0).toLocaleString()}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {group.orders.length > 10 && !showAllOrders[group.range] && (
                      <tr>
                        <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <Button 
                            variant="outline" 
                            onClick={() => toggleShowAllOrders(group.range)}
                            style={{ fontSize: '0.875rem' }}
                          >
                            모두 보기 ({group.orders.length}개 주문)
                          </Button>
                        </td>
                      </tr>
                    )}
                    {showAllOrders[group.range] && group.orders.length > 10 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <Button 
                            variant="outline" 
                            onClick={() => toggleShowAllOrders(group.range)}
                            style={{ fontSize: '0.875rem' }}
                          >
                            접기
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Array.from(new Set(group.orders.slice(0, 5).map((order: any) => order.materialCode || order.material).filter(Boolean))).map((materialCode: unknown, matIndex: number) => {
                  const materialStr = String(materialCode);
                  const bomItem = bom?.find((b: any) => b.materialCode === materialStr);
                  return (
                    <Badge key={matIndex} variant="outline" className="text-xs">
                      {materialStr} {bomItem ? `(BOM: ${bomItem.requiredQuantity})` : ''}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <Database style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} />
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
          style={activeTab === 'overview' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('overview')}
        >
          개요
        </button>
        <button
          style={activeTab === 'bom' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('bom')}
        >
          BOM 분석
        </button>
        <button
          style={activeTab === 'inventory' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('inventory')}
        >
          재고 현황
        </button>
        <button
          style={activeTab === 'bomDetail' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('bomDetail')}
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
          {activeTab === 'bom' && renderBOMAnalysisTab()}
          {activeTab === 'inventory' && renderInventoryTab()}
          {activeTab === 'bomDetail' && renderBOMDetailTab()}
        </>
      )}
    </div>
  );
}
