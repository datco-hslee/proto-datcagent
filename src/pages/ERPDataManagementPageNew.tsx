import React, { useState } from 'react';
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
  TrendingUp,
  Plus,
  Settings
} from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';

export function ERPDataManagementPage() {
  const { customers } = useCustomers();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock ERP data based on customer context
  const erpStats = {
    totalCustomers: customers.length,
    totalSalesOrders: customers.length * 3,
    totalProductionOrders: customers.length * 2,
    totalRevenue: customers.reduce((sum, customer) => sum + (customer.totalOrderValue || 0), 0),
    activeOrders: Math.floor(customers.length * 1.5),
    completedOrders: Math.floor(customers.length * 2.5),
    totalShipments: customers.length * 4,
    inventoryItems: 1250,
    suppliers: 45
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb",
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    backgroundColor: "white",
    color: "#374151",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const tabButtonStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    border: "none",
    background: "transparent",
    color: "#6b7280",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: "0.375rem",
    transition: "all 0.2s ease",
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabButtonStyle,
    backgroundColor: "#3b82f6",
    color: "white",
  };

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('ERP 데이터가 새로고침되었습니다.');
    }, 1000);
  };

  const handleExportData = () => {
    console.log('데이터 내보내기 시작...');
    // Mock export functionality
    const data = {
      customers: customers,
      stats: erpStats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erp-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderOverviewTab = () => (
    <div>
      {/* 통계 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>총 고객</p>
              <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827" }}>{erpStats.totalCustomers.toLocaleString()}</p>
            </div>
            <Users size={24} style={{ color: "#3b82f6" }} />
          </div>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>영업 주문</p>
              <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827" }}>{erpStats.totalSalesOrders.toLocaleString()}</p>
            </div>
            <ShoppingCart size={24} style={{ color: "#10b981" }} />
          </div>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>생산 주문</p>
              <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827" }}>{erpStats.totalProductionOrders.toLocaleString()}</p>
            </div>
            <Package size={24} style={{ color: "#f59e0b" }} />
          </div>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>총 매출</p>
              <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827" }}>₩{erpStats.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp size={24} style={{ color: "#8b5cf6" }} />
          </div>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>활성 주문</p>
              <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827" }}>{erpStats.activeOrders.toLocaleString()}</p>
            </div>
            <Clock size={24} style={{ color: "#ef4444" }} />
          </div>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>완료 주문</p>
              <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827" }}>{erpStats.completedOrders.toLocaleString()}</p>
            </div>
            <CheckCircle size={24} style={{ color: "#10b981" }} />
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>최근 ERP 활동</h3>
        <div style={{ space: "1rem" }}>
          {customers.slice(0, 5).map((customer, index) => (
            <div key={customer.id} style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              padding: "0.75rem 0",
              borderBottom: index < 4 ? "1px solid #f3f4f6" : "none"
            }}>
              <div>
                <p style={{ fontWeight: 500, color: "#111827" }}>{customer.companyName}</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  최근 주문: {new Date(customer.lastOrderDate || Date.now()).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 500, color: "#111827" }}>₩{(customer.totalOrderValue || 0).toLocaleString()}</p>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: customer.status === 'active' ? "#dcfce7" : "#fef3c7",
                  color: customer.status === 'active' ? "#166534" : "#92400e"
                }}>
                  {customer.status === 'active' ? '활성' : '대기'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataManagementTab = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Database size={20} style={{ color: "#3b82f6" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>데이터 동기화</h3>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
            마지막 동기화: {new Date().toLocaleString('ko-KR')}
          </p>
          <button 
            style={primaryButtonStyle}
            onClick={handleRefreshData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? '동기화 중...' : '데이터 새로고침'}
          </button>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Download size={20} style={{ color: "#10b981" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>데이터 내보내기</h3>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
            ERP 데이터를 JSON 형식으로 내보내기
          </p>
          <button style={primaryButtonStyle} onClick={handleExportData}>
            <Download size={16} />
            데이터 내보내기
          </button>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Settings size={20} style={{ color: "#f59e0b" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>데이터 설정</h3>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
            데이터 보존 정책 및 백업 설정
          </p>
          <button style={secondaryButtonStyle}>
            <Settings size={16} />
            설정 관리
          </button>
        </div>
      </div>

      {/* 데이터 품질 지표 */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>데이터 품질 지표</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.5rem" }}>98.5%</div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>데이터 정확도</div>
          </div>
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>99.2%</div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>데이터 완성도</div>
          </div>
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b", marginBottom: "0.5rem" }}>15분</div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>평균 동기화 시간</div>
          </div>
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#8b5cf6", marginBottom: "0.5rem" }}>24/7</div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>시스템 가용성</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <BarChart3 size={20} style={{ color: "#3b82f6" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>매출 분석</h3>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>이번 달</span>
              <span style={{ fontWeight: 500 }}>₩{(erpStats.totalRevenue * 0.3).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>지난 달</span>
              <span style={{ fontWeight: 500 }}>₩{(erpStats.totalRevenue * 0.25).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>성장률</span>
              <span style={{ fontWeight: 500, color: "#10b981" }}>+20%</span>
            </div>
          </div>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Truck size={20} style={{ color: "#10b981" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>배송 현황</h3>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>총 배송</span>
              <span style={{ fontWeight: 500 }}>{erpStats.totalShipments}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>배송 완료</span>
              <span style={{ fontWeight: 500 }}>{Math.floor(erpStats.totalShipments * 0.85)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>정시 배송률</span>
              <span style={{ fontWeight: 500, color: "#10b981" }}>94.2%</span>
            </div>
          </div>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <AlertTriangle size={20} style={{ color: "#ef4444" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>알림 및 경고</h3>
          </div>
          <div style={{ space: "0.5rem" }}>
            <div style={{ padding: "0.5rem", backgroundColor: "#fef2f2", borderRadius: "0.25rem", marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#dc2626" }}>재고 부족: 3개 품목</p>
            </div>
            <div style={{ padding: "0.5rem", backgroundColor: "#fffbeb", borderRadius: "0.25rem", marginBottom: "0.5rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#d97706" }}>지연 주문: 2건</p>
            </div>
            <div style={{ padding: "0.5rem", backgroundColor: "#f0f9ff", borderRadius: "0.25rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#0369a1" }}>시스템 점검 예정</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "1.5rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={24} />
            ERP 데이터 관리
          </h1>
          <p style={{ color: "#6b7280" }}>통합 ERP 시스템의 데이터를 관리하고 모니터링하세요</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
            <input
              type="text"
              placeholder="데이터 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: "2.5rem",
                paddingRight: "1rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                width: "200px"
              }}
            />
          </div>
          <button style={secondaryButtonStyle}>
            <Filter size={16} />
            필터
          </button>
          <button style={primaryButtonStyle}>
            <Plus size={16} />
            새 데이터
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>
        <button
          style={activeTab === 'overview' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          개요
        </button>
        <button
          style={activeTab === 'data' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('data')}
        >
          <Database size={16} />
          데이터 관리
        </button>
        <button
          style={activeTab === 'analytics' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={16} />
          분석
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'data' && renderDataManagementTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
}
