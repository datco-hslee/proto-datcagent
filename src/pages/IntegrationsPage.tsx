import React, { useState, useEffect } from 'react';
import { 
  Layers, Users, Cpu, Database, Activity, 
  CheckCircle, AlertTriangle, RefreshCw, 
  Settings, ExternalLink, Edit2, Save, X 
} from 'lucide-react';
import datcoDemoData2 from '../../DatcoDemoData2.json';

// 타입 정의
interface Integration {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  lastSync: Date;
  icon: string;
}

interface SystemUser {
  id: string;
  name: string;
  department: string;
  role: string;
  accessModules: string[];
  lastLogin: Date;
  status: "active" | "inactive";
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'maintenance' | 'error';
  utilizationRate: number;
  costPerHour: number;
  lastMaintenance: Date;
}

interface SystemParameter {
  id: string;
  name: string;
  category: string;
  value: string;
  unit: string;
  description: string;
  lastUpdated: Date;
}

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

export function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [activeTab, setActiveTab] = useState<"integrations" | "users" | "equipment" | "parameters" | "alerts">("integrations");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [systemParameters, setSystemParameters] = useState<SystemParameter[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingParameter, setEditingParameter] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<Partial<SystemUser>>({});
  const [editParameterData, setEditParameterData] = useState<Partial<SystemParameter>>({});
  const [syncingIntegration, setSyncingIntegration] = useState<string | null>(null);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  // ERP 데이터에서 시스템 사용자 추출
  const getERPSystemUsers = (): SystemUser[] => {
    try {
      const userPermissions = datcoDemoData2?.sheets?.사용자권한 || [];
      return userPermissions.map((user: any, index: number) => ({
        id: user.사용자ID || `user-${index}`,
        name: user.사용자명 || '미정',
        department: user.부서 || '미정',
        role: user.권한레벨 || 'USER',
        accessModules: user.접근모듈 ? user.접근모듈.split(',').map((m: string) => m.trim()) : [],
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.2 ? 'active' : 'inactive'
      }));
    } catch (error) {
      console.error('ERP 사용자 데이터 로드 오류:', error);
      return [];
    }
  };

  // ERP 데이터에서 설비 정보 추출
  const getERPEquipment = (): Equipment[] => {
    try {
      const equipmentCost = datcoDemoData2?.sheets?.설비원가 || [];
      return equipmentCost.map((eq: any, index: number) => ({
        id: eq.워크센터코드 || `eq-${index}`,
        name: eq.워크센터명 || '미정',
        type: eq.워크센터코드?.includes('PRESS') ? 'Press' : 
              eq.워크센터코드?.includes('MACH') ? 'Machining' :
              eq.워크센터코드?.includes('WELD') ? 'Welding' : 'Quality',
        status: Math.random() > 0.1 ? (Math.random() > 0.3 ? 'running' : 'idle') : 'maintenance',
        utilizationRate: Math.floor(Math.random() * 40) + 60,
        costPerHour: eq.시간당원가 || 0,
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }));
    } catch (error) {
      console.error('ERP 설비 데이터 로드 오류:', error);
      return [];
    }
  };

  // ERP 데이터에서 시스템 파라미터 추출
  const getERPSystemParameters = (): SystemParameter[] => {
    try {
      const mrpParams = datcoDemoData2?.sheets?.MRP파라미터 || [];
      const wagePolicy = datcoDemoData2?.sheets?.임금정책_원가단가 || [];
      
      const params: SystemParameter[] = [];
      
      mrpParams.forEach((param: any, index: number) => {
        params.push({
          id: `mrp-${index}`,
          name: `${param.품목명} 리드타임`,
          category: 'MRP',
          value: param.리드타임일?.toString() || '0',
          unit: '일',
          description: `${param.품목명}의 생산 리드타임`,
          lastUpdated: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
        });
        
        if (param.리오더포인트) {
          params.push({
            id: `reorder-${index}`,
            name: `${param.품목명} 리오더포인트`,
            category: 'Inventory',
            value: param.리오더포인트.toString(),
            unit: param.단위 || 'EA',
            description: `${param.품목명}의 재주문 기준점`,
            lastUpdated: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
          });
        }
      });
      
      wagePolicy.forEach((wage: any, index: number) => {
        params.push({
          id: `wage-${index}`,
          name: '기본시급',
          category: 'HR',
          value: wage.기본시급?.toString() || '0',
          unit: '원',
          description: '직원 기본 시급 설정',
          lastUpdated: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
        });
      });
      
      return params;
    } catch (error) {
      console.error('ERP 파라미터 데이터 로드 오류:', error);
      return [];
    }
  };

  // ERP 데이터에서 시스템 알림 생성
  const getERPSystemAlerts = (): SystemAlert[] => {
    try {
      const shortageSimulation = datcoDemoData2?.sheets?.["부족대응시뮬(간이)"] || [];
      const qualityInspection = datcoDemoData2?.sheets?.입고검사 || [];
      
      const alerts: SystemAlert[] = [];
      
      shortageSimulation.forEach((shortage: any, index: number) => {
        if (shortage.부족수량 && shortage.부족수량 > 0) {
          alerts.push({
            id: `shortage-${index}`,
            type: 'warning',
            title: `${shortage.케이스명} 부족 경고`,
            description: `${shortage.부족수량}개 부족, 추가비용 ${shortage.추가비용?.toLocaleString()}원 예상`,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
            resolved: Math.random() > 0.6
          });
        }
      });
      
      qualityInspection.forEach((inspection: any, index: number) => {
        const defectRate = ((inspection.검사수량 - inspection.합격수량) / inspection.검사수량) * 100;
        if (defectRate > 1) {
          alerts.push({
            id: `quality-${index}`,
            type: defectRate > 5 ? 'error' : 'warning',
            title: `품질 검사 이상`,
            description: `${inspection.품목명} 불량률 ${defectRate.toFixed(1)}% (기준: 1% 이하)`,
            timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
            resolved: Math.random() > 0.4
          });
        }
      });
      
      return alerts;
    } catch (error) {
      console.error('ERP 알림 데이터 로드 오류:', error);
      return [];
    }
  };

  // 샘플 데이터 생성 함수들
  const getSampleSystemUsers = (): SystemUser[] => [
    {
      id: 'user1',
      name: '김관리자',
      department: 'IT',
      role: 'ADMIN',
      accessModules: ['ERP', 'CRM', 'WMS', 'MES'],
      lastLogin: new Date('2024-01-15T09:30:00'),
      status: 'active'
    },
    {
      id: 'user2',
      name: '이생산',
      department: '생산',
      role: 'MANAGER',
      accessModules: ['MES', 'WMS'],
      lastLogin: new Date('2024-01-15T08:45:00'),
      status: 'active'
    },
    {
      id: 'user3',
      name: '박영업',
      department: '영업',
      role: 'USER',
      accessModules: ['CRM'],
      lastLogin: new Date('2024-01-14T17:20:00'),
      status: 'inactive'
    }
  ];

  const getSampleEquipment = (): Equipment[] => [
    {
      id: 'eq1',
      name: 'CNC 머시닝센터 #1',
      type: 'Machining',
      status: 'running',
      utilizationRate: 85,
      costPerHour: 25000,
      lastMaintenance: new Date('2024-01-10T14:00:00')
    },
    {
      id: 'eq2',
      name: '프레스 #2',
      type: 'Press',
      status: 'idle',
      utilizationRate: 45,
      costPerHour: 35000,
      lastMaintenance: new Date('2024-01-08T10:30:00')
    },
    {
      id: 'eq3',
      name: '용접 로봇 #1',
      type: 'Welding',
      status: 'maintenance',
      utilizationRate: 0,
      costPerHour: 28000,
      lastMaintenance: new Date('2024-01-15T09:00:00')
    }
  ];

  const getSampleSystemParameters = (): SystemParameter[] => [
    {
      id: 'param1',
      name: '기본 리드타임',
      category: 'MRP',
      value: '7',
      unit: '일',
      description: '표준 생산 리드타임',
      lastUpdated: new Date('2024-01-10T15:30:00')
    },
    {
      id: 'param2',
      name: '안전재고율',
      category: 'Inventory',
      value: '15',
      unit: '%',
      description: '재고 안전 비율 설정',
      lastUpdated: new Date('2024-01-12T11:20:00')
    },
    {
      id: 'param3',
      name: '기본시급',
      category: 'HR',
      value: '12000',
      unit: '원',
      description: '직원 기본 시급',
      lastUpdated: new Date('2024-01-05T09:00:00')
    }
  ];

  const getSampleSystemAlerts = (): SystemAlert[] => [
    {
      id: 'alert1',
      type: 'warning',
      title: '재고 부족 경고',
      description: 'MCU 칩 재고가 안전재고 수준 이하로 떨어졌습니다.',
      timestamp: new Date('2024-01-15T10:15:00'),
      resolved: false
    },
    {
      id: 'alert2',
      type: 'error',
      title: '설비 오류',
      description: '용접 로봇 #1에서 온도 센서 오류가 발생했습니다.',
      timestamp: new Date('2024-01-15T09:30:00'),
      resolved: false
    },
    {
      id: 'alert3',
      type: 'info',
      title: '시스템 업데이트',
      description: 'ERP 시스템 정기 업데이트가 완료되었습니다.',
      timestamp: new Date('2024-01-15T02:00:00'),
      resolved: true
    }
  ];

  // 샘플 통합 데이터
  const getSampleIntegrations = (): Integration[] => [
    {
      id: "1",
      name: "ERP 시스템",
      provider: "SAP",
      category: "ERP",
      status: "connected",
      description: "핵심 ERP 시스템과의 실시간 데이터 연동",
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: "💼"
    },
    {
      id: "2",
      name: "CRM 시스템",
      provider: "Salesforce",
      category: "CRM",
      status: "connected",
      description: "고객 관계 관리 시스템 연동",
      lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000),
      icon: "👥"
    },
    {
      id: "3",
      name: "재고 관리",
      provider: "WMS Pro",
      category: "재고",
      status: "error",
      description: "창고 관리 시스템 연동",
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: "📦"
    },
    {
      id: "4",
      name: "회계 시스템",
      provider: "QuickBooks",
      category: "회계",
      status: "connected",
      description: "재무 회계 시스템 연동",
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      icon: "💰"
    },
    {
      id: "5",
      name: "생산 관리",
      provider: "MES System",
      category: "생산",
      status: "disconnected",
      description: "제조 실행 시스템 연동",
      lastSync: new Date(Date.now() - 48 * 60 * 60 * 1000),
      icon: "🏭"
    }
  ];

  // ERP 연동 데이터 (시뮬레이션)
  const getERPIntegrations = (): Integration[] => [
    {
      id: "erp-1",
      name: "닷코 ERP 코어",
      provider: "DATCO",
      category: "ERP",
      status: "connected",
      description: "닷코 통합 ERP 시스템 연동",
      lastSync: new Date(),
      icon: "🔧"
    },
    {
      id: "erp-2",
      name: "생산계획 시스템",
      provider: "DATCO MRP",
      category: "생산",
      status: "connected",
      description: "생산계획 및 MRP 시스템",
      lastSync: new Date(Date.now() - 15 * 60 * 1000),
      icon: "📊"
    },
    {
      id: "erp-3",
      name: "품질관리 시스템",
      provider: "DATCO QMS",
      category: "품질",
      status: "connected",
      description: "품질관리 및 검사 시스템",
      lastSync: new Date(Date.now() - 45 * 60 * 1000),
      icon: "✅"
    },
    {
      id: "erp-4",
      name: "구매발주 시스템",
      provider: "DATCO PO",
      category: "구매",
      status: "connected",
      description: "구매발주 및 공급업체 관리",
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: "🛒"
    }
  ];

  // 현재 통합 데이터 가져오기
  const getCurrentIntegrations = (): Integration[] => {
    return selectedDataSource === "erp" ? getERPIntegrations() : getSampleIntegrations();
  };

  // 카테고리 목록
  const categories = ["all", "ERP", "CRM", "재고", "회계", "생산", "품질", "구매"];

  // useEffect로 데이터 로드
  useEffect(() => {
    setIntegrations(getCurrentIntegrations());
    setSystemUsers(selectedDataSource === "erp" ? getERPSystemUsers() : getSampleSystemUsers());
    setEquipment(selectedDataSource === "erp" ? getERPEquipment() : getSampleEquipment());
    setSystemParameters(selectedDataSource === "erp" ? getERPSystemParameters() : getSampleSystemParameters());
    setSystemAlerts(selectedDataSource === "erp" ? getERPSystemAlerts() : getSampleSystemAlerts());
  }, [selectedDataSource]);

  // 스타일 정의
  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "0.5rem",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "#10b981";
      case "disconnected": return "#6b7280";
      case "error": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "connected": return "연결됨";
      case "disconnected": return "연결 해제";
      case "error": return "오류";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle size={16} />;
      case "disconnected": return <RefreshCw size={16} />;
      case "error": return <AlertTriangle size={16} />;
      default: return <RefreshCw size={16} />;
    }
  };

  const filteredIntegrations = activeCategory === "all" 
    ? integrations 
    : integrations.filter(integration => integration.category === activeCategory);

  // 인터랙션 핸들러 함수들
  const handleSync = async (integrationId: string) => {
    setSyncingIntegration(integrationId);
    // 실제 동기화 로직 시뮬레이션
    setTimeout(() => {
      const updatedIntegrations = integrations.map(integration => 
        integration.id === integrationId 
          ? { ...integration, lastSync: new Date(), status: 'connected' as const }
          : integration
      );
      setIntegrations(updatedIntegrations);
      setSyncingIntegration(null);
      alert(`${integrations.find(i => i.id === integrationId)?.name} 동기화가 완료되었습니다.`);
    }, 2000);
  };

  const handleTest = async (integrationId: string) => {
    setTestingIntegration(integrationId);
    // 실제 테스트 로직 시뮬레이션
    setTimeout(() => {
      const integration = integrations.find(i => i.id === integrationId);
      const testResult = Math.random() > 0.2; // 80% 성공률
      setTestingIntegration(null);
      alert(`${integration?.name} 연결 테스트 ${testResult ? '성공' : '실패'}`);
    }, 1500);
  };

  const handleSettings = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    alert(`${integration?.name} 설정 페이지로 이동합니다.`);
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user.id);
    setEditUserData(user);
  };

  const handleSaveUser = () => {
    if (editingUser && editUserData) {
      const updatedUsers = systemUsers.map(user => 
        user.id === editingUser 
          ? { ...user, ...editUserData }
          : user
      );
      setSystemUsers(updatedUsers);
      setEditingUser(null);
      setEditUserData({});
      alert('사용자 정보가 저장되었습니다.');
    }
  };

  const handleCancelEditUser = () => {
    setEditingUser(null);
    setEditUserData({});
  };

  const handleEditParameter = (parameter: SystemParameter) => {
    setEditingParameter(parameter.id);
    setEditParameterData(parameter);
  };

  const handleSaveParameter = () => {
    if (editingParameter && editParameterData) {
      const updatedParameters = systemParameters.map(param => 
        param.id === editingParameter 
          ? { ...param, ...editParameterData }
          : param
      );
      setSystemParameters(updatedParameters);
      setEditingParameter(null);
      setEditParameterData({});
      alert('시스템 파라미터가 저장되었습니다.');
    }
  };

  const handleCancelEditParameter = () => {
    setEditingParameter(null);
    setEditParameterData({});
  };

  return (
    <div style={{ padding: "1.5rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>통합 관리</h1>
          <p style={{ color: "#6b7280" }}>시스템 연동 상태 및 운영 현황을 관리하고 모니터링하세요</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            backgroundColor: selectedDataSource === "erp" ? "#3b82f6" : "#f59e0b",
            color: "white"
          }}>
            {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
          </span>
          <select
            value={selectedDataSource}
            onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")}
            style={{
              padding: "0.5rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
              fontSize: "0.875rem"
            }}
          >
            <option value="erp">닷코 시연 데이터</option>
            <option value="sample">생성된 샘플 데이터</option>
          </select>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
        {[
          { id: "integrations", label: "시스템 연동", icon: Layers },
          { id: "users", label: "사용자 현황", icon: Users },
          { id: "equipment", label: "설비 현황", icon: Cpu },
          { id: "parameters", label: "시스템 파라미터", icon: Database },
          { id: "alerts", label: "알림 현황", icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                ...secondaryButtonStyle,
                backgroundColor: activeTab === tab.id ? "#3b82f6" : "white",
                color: activeTab === tab.id ? "white" : "#374151",
                borderBottom: "2px solid",
                borderBottomColor: activeTab === tab.id ? "#3b82f6" : "transparent",
                paddingBottom: "0.75rem"
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭별 콘텐츠 렌더링 */}
      {activeTab === "integrations" && (
        <>
          {/* 통계 카드 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>총 연동</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{integrations.length}개</p>
                </div>
                <Layers size={24} style={{ color: "#3b82f6" }} />
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>활성 연동</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>
                    {integrations.filter(i => i.status === "connected").length}개
                  </p>
                </div>
                <CheckCircle size={24} style={{ color: "#10b981" }} />
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>오류</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ef4444" }}>
                    {integrations.filter(i => i.status === "error").length}개
                  </p>
                </div>
                <AlertTriangle size={24} style={{ color: "#ef4444" }} />
              </div>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {categories.map((category) => (
              <button
                key={category}
                style={{
                  ...secondaryButtonStyle,
                  backgroundColor: activeCategory === category ? "#3b82f6" : "white",
                  color: activeCategory === category ? "white" : "#374151",
                }}
                onClick={() => setActiveCategory(category)}
              >
                {category === "all" ? "전체" : category}
              </button>
            ))}
          </div>

          {/* 연동 목록 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
            {filteredIntegrations.map((integration) => (
              <div key={integration.id} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ fontSize: "1.5rem" }}>{integration.icon}</div>
                    <div>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.25rem" }}>
                        {integration.name}
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{integration.provider}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      backgroundColor: getStatusColor(integration.status) + "20",
                      color: getStatusColor(integration.status),
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}>
                      {getStatusIcon(integration.status)}
                      {getStatusLabel(integration.status)}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
                  {integration.description}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>카테고리</p>
                    <p style={{ fontWeight: 500 }}>{integration.category}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>마지막 동기화</p>
                    <p style={{ fontWeight: 500 }}>{integration.lastSync.toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button 
                    onClick={() => handleSettings(integration.id)}
                    style={{...secondaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.75rem"}}
                  >
                    <Settings size={12} />
                    설정
                  </button>
                  <button 
                    onClick={() => handleSync(integration.id)}
                    disabled={syncingIntegration === integration.id}
                    style={{
                      ...secondaryButtonStyle, 
                      fontSize: "0.75rem", 
                      padding: "0.25rem 0.75rem",
                      opacity: syncingIntegration === integration.id ? 0.6 : 1,
                      cursor: syncingIntegration === integration.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <RefreshCw size={12} style={{ 
                      animation: syncingIntegration === integration.id ? 'spin 1s linear infinite' : 'none' 
                    }} />
                    {syncingIntegration === integration.id ? '동기화 중...' : '동기화'}
                  </button>
                  <button 
                    onClick={() => handleTest(integration.id)}
                    disabled={testingIntegration === integration.id}
                    style={{
                      ...secondaryButtonStyle, 
                      fontSize: "0.75rem", 
                      padding: "0.25rem 0.75rem",
                      opacity: testingIntegration === integration.id ? 0.6 : 1,
                      cursor: testingIntegration === integration.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ExternalLink size={12} />
                    {testingIntegration === integration.id ? '테스트 중...' : '테스트'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 사용자 현황 탭 */}
      {activeTab === "users" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {systemUsers.map((user) => (
            <div key={user.id} style={cardStyle}>
              {editingUser === user.id ? (
                // 편집 모드
                <div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>이름</label>
                    <input
                      type="text"
                      value={editUserData.name || ''}
                      onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>부서</label>
                    <input
                      type="text"
                      value={editUserData.department || ''}
                      onChange={(e) => setEditUserData({...editUserData, department: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>역할</label>
                    <input
                      type="text"
                      value={editUserData.role || ''}
                      onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>상태</label>
                    <select
                      value={editUserData.status || 'active'}
                      onChange={(e) => setEditUserData({...editUserData, status: e.target.value as 'active' | 'inactive'})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    >
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={handleSaveUser}
                      style={{
                        ...secondaryButtonStyle,
                        backgroundColor: "#10b981",
                        color: "white",
                        fontSize: "0.875rem",
                        padding: "0.5rem 1rem"
                      }}
                    >
                      <Save size={14} />
                      저장
                    </button>
                    <button
                      onClick={handleCancelEditUser}
                      style={{
                        ...secondaryButtonStyle,
                        fontSize: "0.875rem",
                        padding: "0.5rem 1rem"
                      }}
                    >
                      <X size={14} />
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 보기 모드
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>{user.name}</h3>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{user.department} · {user.role}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor: user.status === 'active' ? "#10b98120" : "#6b728020",
                        color: user.status === 'active' ? "#10b981" : "#6b7280"
                      }}>
                        {user.status === 'active' ? '활성' : '비활성'}
                      </span>
                      <button
                        onClick={() => handleEditUser(user)}
                        style={{
                          ...secondaryButtonStyle,
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem"
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>접근 모듈</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {user.accessModules.map((module, index) => (
                        <span key={index} style={{
                          padding: "0.125rem 0.5rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.75rem",
                          backgroundColor: "#f3f4f6",
                          color: "#374151"
                        }}>
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    마지막 로그인: {user.lastLogin.toLocaleDateString('ko-KR')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 설비 현황 탭 */}
      {activeTab === "equipment" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {equipment.map((eq) => (
            <div key={eq.id} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>{eq.name}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{eq.type}</p>
                </div>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: eq.status === 'running' ? "#10b98120" : 
                                  eq.status === 'idle' ? "#f59e0b20" : 
                                  eq.status === 'maintenance' ? "#ef444420" : "#6b728020",
                  color: eq.status === 'running' ? "#10b981" : 
                         eq.status === 'idle' ? "#f59e0b" : 
                         eq.status === 'maintenance' ? "#ef4444" : "#6b7280"
                }}>
                  {eq.status === 'running' ? '가동중' : 
                   eq.status === 'idle' ? '대기중' : 
                   eq.status === 'maintenance' ? '정비중' : '오류'}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>가동률</p>
                  <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827" }}>{eq.utilizationRate}%</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>시간당 원가</p>
                  <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827" }}>₩{eq.costPerHour.toLocaleString()}</p>
                </div>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                마지막 정비: {eq.lastMaintenance.toLocaleDateString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 시스템 파라미터 탭 */}
      {activeTab === "parameters" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {systemParameters.map((param) => (
            <div key={param.id} style={cardStyle}>
              {editingParameter === param.id ? (
                // 편집 모드
                <div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>파라미터명</label>
                    <input
                      type="text"
                      value={editParameterData.name || ''}
                      onChange={(e) => setEditParameterData({...editParameterData, name: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>값</label>
                    <input
                      type="text"
                      value={editParameterData.value || ''}
                      onChange={(e) => setEditParameterData({...editParameterData, value: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>단위</label>
                    <input
                      type="text"
                      value={editParameterData.unit || ''}
                      onChange={(e) => setEditParameterData({...editParameterData, unit: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>설명</label>
                    <input
                      type="text"
                      value={editParameterData.description || ''}
                      onChange={(e) => setEditParameterData({...editParameterData, description: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={handleSaveParameter}
                      style={{
                        ...secondaryButtonStyle,
                        backgroundColor: "#10b981",
                        color: "white",
                        fontSize: "0.875rem",
                        padding: "0.5rem 1rem"
                      }}
                    >
                      <Save size={14} />
                      저장
                    </button>
                    <button
                      onClick={handleCancelEditParameter}
                      style={{
                        ...secondaryButtonStyle,
                        fontSize: "0.875rem",
                        padding: "0.5rem 1rem"
                      }}
                    >
                      <X size={14} />
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 보기 모드
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>{param.name}</h3>
                      <span style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor: param.category === 'MRP' ? "#3b82f620" : 
                                        param.category === 'Inventory' ? "#10b98120" : "#f59e0b20",
                        color: param.category === 'MRP' ? "#3b82f6" : 
                               param.category === 'Inventory' ? "#10b981" : "#f59e0b"
                      }}>
                        {param.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEditParameter(param)}
                      style={{
                        ...secondaryButtonStyle,
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem"
                      }}
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827" }}>
                      {param.value} <span style={{ fontSize: "1rem", fontWeight: "normal", color: "#6b7280" }}>{param.unit}</span>
                    </p>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>설명</p>
                    <p style={{ fontSize: "0.875rem", color: "#374151" }}>{param.description}</p>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    마지막 업데이트: {param.lastUpdated.toLocaleDateString('ko-KR')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 알림 현황 탭 */}
      {activeTab === "alerts" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
          {systemAlerts.map((alert) => (
            <div key={alert.id} style={{
              ...cardStyle,
              borderLeft: `4px solid ${alert.type === 'error' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6'}`
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {alert.type === 'error' ? <AlertTriangle size={20} style={{ color: '#ef4444' }} /> :
                   alert.type === 'warning' ? <AlertTriangle size={20} style={{ color: '#f59e0b' }} /> :
                   <CheckCircle size={20} style={{ color: '#3b82f6' }} />}
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>{alert.title}</h3>
                </div>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: alert.resolved ? "#10b98120" : "#ef444420",
                  color: alert.resolved ? "#10b981" : "#ef4444"
                }}>
                  {alert.resolved ? '해결됨' : '미해결'}
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
                {alert.description}
              </p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                발생 시간: {alert.timestamp.toLocaleString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
