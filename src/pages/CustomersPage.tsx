import { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, Edit, Phone, Mail, Building } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: "활성" | "비활성" | "잠재";
  totalOrders: number;
  totalAmount: number;
  lastContact: string;
  representative: string;
}

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  
  // 새 고객 추가 폼 데이터
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    status: "잠재" as Customer["status"],
    representative: "",
  });
  
  // 편집 폼 데이터
  const [editForm, setEditForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    status: "잠재" as Customer["status"],
    representative: "",
  });
  
  // 고급 필터 상태
  const [advancedFilters, setAdvancedFilters] = useState({
    company: "",
    minOrders: "",
    maxOrders: "",
    dateRange: "전체",
    location: "",
  });

  // 초기 데이터 로드
  useEffect(() => {
    setCustomersList(sampleCustomers);
  }, []);

  // 새 고객 추가 핸들러
  const handleAddCustomer = () => {
    setNewCustomerForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      status: "잠재",
      representative: "",
    });
    setShowAddCustomerModal(true);
  };

  const handleSaveNewCustomer = () => {
    if (!newCustomerForm.name || !newCustomerForm.company || !newCustomerForm.email) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const newCustomer: Customer = {
      id: `CUST-${String(customersList.length + 1).padStart(3, '0')}`,
      ...newCustomerForm,
      totalOrders: 0,
      totalAmount: 0,
      lastContact: new Date().toISOString().split('T')[0],
    };

    setCustomersList([...customersList, newCustomer]);
    setShowAddCustomerModal(false);
    alert('새 고객이 추가되었습니다.');
  };

  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const applyAdvancedFilters = () => {
    // 고급 필터 적용 로직
    setShowFilterModal(false);
    alert('고급 필터가 적용되었습니다.');
  };

  const resetFilters = () => {
    setAdvancedFilters({
      company: "",
      minOrders: "",
      maxOrders: "",
      dateRange: "전체",
      location: "",
    });
    setSelectedStatus("전체");
    setSearchTerm("");
  };

  const handleExport = () => {
    // CSV 헤더 정의
    const headers = [
      '고객명',
      '회사명', 
      '이메일',
      '전화번호',
      '주소',
      '상태',
      '담당자',
      '총 주문수',
      '최근 연락일'
    ];

    // 고객 데이터를 CSV 형식으로 변환
    const csvData = filteredCustomers.map(customer => [
      customer.name,
      customer.company,
      customer.email,
      customer.phone,
      customer.address,
      customer.status,
      customer.representative,
      customer.totalOrders.toString(),
      customer.lastContact
    ]);

    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // BOM 추가 (한글 인코딩을 위해)
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Blob 생성 및 다운로드
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `고객목록_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`${filteredCustomers.length}개의 고객 데이터가 CSV 파일로 내보내졌습니다.`);
    } else {
      alert('파일 다운로드가 지원되지 않는 브라우저입니다.');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditForm({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      status: customer.status,
      representative: customer.representative,
    });
    setEditingCustomer(customer);
  };

  const handleSaveEditCustomer = () => {
    if (!editForm.name || !editForm.company || !editForm.email) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const updatedCustomers = customersList.map(customer => 
      customer.id === editingCustomer?.id 
        ? { ...customer, ...editForm }
        : customer
    );

    setCustomersList(updatedCustomers);
    setEditingCustomer(null);
    alert('고객 정보가 수정되었습니다.');
  };

  const handleCallCustomer = (customer: Customer) => {
    // 실제 구현에서는 전화 시스템과 연동
    alert(`${customer.name}(${customer.phone})에게 전화를 겁니다.`);
  };

  const closeModals = () => {
    setShowAddCustomerModal(false);
    setShowFilterModal(false);
    setEditingCustomer(null);
  };

  // 모달 스타일들
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "1rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
  };

  const modalHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.5rem",
    borderBottom: "1px solid #e5e7eb",
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
  };

  const modalContentStyle: React.CSSProperties = {
    padding: "1.5rem",
  };

  const closeButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#6b7280",
  };

  const containerStyle: React.CSSProperties = {
    padding: "2rem",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    minHeight: "100vh",
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: "2rem",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "0.5rem",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#6b7280",
  };

  const actionsBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    padding: "1rem",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    borderRadius: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  const searchContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const searchInputStyle: React.CSSProperties = {
    padding: "0.5rem 1rem 0.5rem 2.5rem",
    border: "2px solid #e5e7eb",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    width: "20rem",
    background: "white",
    transition: "all 0.2s ease",
  };

  const filterSelectStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    background: "white",
    cursor: "pointer",
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "rgba(255, 255, 255, 0.8)",
    color: "#374151",
    border: "1px solid #d1d5db",
  };

  const tableContainerStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    borderRadius: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const tableHeaderStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
  };

  const thStyle: React.CSSProperties = {
    padding: "1rem",
    textAlign: "left",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
  };

  const tdStyle: React.CSSProperties = {
    padding: "1rem",
    borderBottom: "1px solid rgba(229, 231, 235, 0.3)",
    fontSize: "0.875rem",
    color: "#374151",
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    const colors = {
      활성: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      비활성: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
      잠재: { bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
    };

    const colorSet = colors[status as keyof typeof colors] || colors["잠재"];

    return {
      fontSize: "0.75rem",
      fontWeight: 500,
      padding: "0.25rem 0.5rem",
      borderRadius: "0.375rem",
      backgroundColor: colorSet.bg,
      color: colorSet.color,
      border: `1px solid ${colorSet.border}`,
    };
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "0.25rem",
    border: "none",
    background: "transparent",
    borderRadius: "0.25rem",
    cursor: "pointer",
    color: "#6b7280",
    transition: "all 0.2s ease",
  };

  // 샘플 데이터
  const sampleCustomers: Customer[] = [
    {
      id: "CUST-001",
      name: "김철수",
      company: "ABC 제조업체",
      email: "kim@abc.com",
      phone: "010-1234-5678",
      address: "서울시 강남구 테헤란로 123",
      status: "활성",
      totalOrders: 45,
      totalAmount: 125000000,
      lastContact: "2024-01-15",
      representative: "이영희",
    },
    {
      id: "CUST-002",
      name: "박영희",
      company: "XYZ 솔루션",
      email: "park@xyz.com",
      phone: "010-9876-5432",
      address: "경기도 성남시 분당구 정자로 456",
      status: "활성",
      totalOrders: 32,
      totalAmount: 89500000,
      lastContact: "2024-01-18",
      representative: "김대표",
    },
    {
      id: "CUST-003",
      name: "정민수",
      company: "DEF 엔지니어링",
      email: "jung@def.com",
      phone: "010-5555-7777",
      address: "인천시 연수구 컨벤시아대로 789",
      status: "잠재",
      totalOrders: 12,
      totalAmount: 34000000,
      lastContact: "2024-01-10",
      representative: "이영희",
    },
    {
      id: "CUST-004",
      name: "최수진",
      company: "GHI 테크놀로지",
      email: "choi@ghi.com",
      phone: "010-3333-4444",
      address: "대전시 유성구 과학로 321",
      status: "비활성",
      totalOrders: 8,
      totalAmount: 15000000,
      lastContact: "2023-12-20",
      representative: "김대표",
    },
    {
      id: "CUST-005",
      name: "윤정호",
      company: "JKL 시스템즈",
      email: "yun@jkl.com",
      phone: "010-7777-8888",
      address: "부산시 해운대구 센텀로 654",
      status: "활성",
      totalOrders: 28,
      totalAmount: 76500000,
      lastContact: "2024-01-17",
      representative: "이영희",
    },
  ];

  const filteredCustomers = customersList.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "전체" || customer.status === selectedStatus;
    
    // 고급 필터 적용
    const matchesCompany = !advancedFilters.company || 
      customer.company.toLowerCase().includes(advancedFilters.company.toLowerCase());
    const matchesMinOrders = !advancedFilters.minOrders || 
      customer.totalOrders >= parseInt(advancedFilters.minOrders);
    const matchesMaxOrders = !advancedFilters.maxOrders || 
      customer.totalOrders <= parseInt(advancedFilters.maxOrders);
    const matchesLocation = !advancedFilters.location || 
      customer.address.toLowerCase().includes(advancedFilters.location.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesCompany && matchesMinOrders && matchesMaxOrders && matchesLocation;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>고객 관리</h1>
        <p style={subtitleStyle}>고객 정보를 효율적으로 관리하고 분석하세요</p>
      </div>

      {/* Actions Bar */}
      <div style={actionsBarStyle}>
        <div style={searchContainerStyle}>
          <div style={{ position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                height: "1rem",
                width: "1rem",
                color: "#6b7280",
              }}
            />
            <input
              type="text"
              placeholder="고객명, 회사명, 이메일로 검색..."
              style={searchInputStyle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select style={filterSelectStyle} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="전체">전체 상태</option>
            <option value="활성">활성</option>
            <option value="비활성">비활성</option>
            <option value="잠재">잠재</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={secondaryButtonStyle} onClick={handleFilter}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            필터
          </button>
          <button style={secondaryButtonStyle} onClick={handleExport}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            내보내기
          </button>
          <button style={primaryButtonStyle} onClick={handleAddCustomer}>
            <Plus style={{ height: "1rem", width: "1rem" }} />새 고객 추가
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={thStyle}>고객 ID</th>
              <th style={thStyle}>고객명</th>
              <th style={thStyle}>회사명</th>
              <th style={thStyle}>연락처</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>총 주문</th>
              <th style={thStyle}>총 거래액</th>
              <th style={thStyle}>마지막 연락</th>
              <th style={thStyle}>담당자</th>
              <th style={thStyle}>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} style={{ transition: "background-color 0.2s ease" }}>
                <td style={tdStyle}>{customer.id}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{customer.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{customer.email}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Building style={{ height: "1rem", width: "1rem", color: "#6b7280" }} />
                    {customer.company}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Phone style={{ height: "0.875rem", width: "0.875rem", color: "#6b7280" }} />
                      <span style={{ fontSize: "0.75rem" }}>{customer.phone}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Mail style={{ height: "0.875rem", width: "0.875rem", color: "#6b7280" }} />
                      <span style={{ fontSize: "0.75rem" }}>{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={statusBadgeStyle(customer.status)}>{customer.status}</span>
                </td>
                <td style={tdStyle}>{customer.totalOrders}건</td>
                <td style={tdStyle}>{formatCurrency(customer.totalAmount)}</td>
                <td style={tdStyle}>{customer.lastContact}</td>
                <td style={tdStyle}>{customer.representative}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button style={actionButtonStyle} title="편집" onClick={() => handleEditCustomer(customer)}>
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="전화" onClick={() => handleCallCustomer(customer)}>
                      <Phone style={{ height: "1rem", width: "1rem" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          color: "#6b7280",
        }}
      >
        총 {filteredCustomers.length}명의 고객이 표시됨 (전체 {customersList.length}명 중)
      </div>

      {/* 모달들 */}
      {showAddCustomerModal && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>새 고객 추가</h2>
              <button style={closeButtonStyle} onClick={closeModals}>
                ×
              </button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>고객명 *</label>
                    <input
                      type="text"
                      value={newCustomerForm.name}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})}
                      placeholder="고객명을 입력하세요"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>회사명 *</label>
                    <input
                      type="text"
                      value={newCustomerForm.company}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, company: e.target.value})}
                      placeholder="회사명을 입력하세요"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>이메일 *</label>
                  <input
                    type="email"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, email: e.target.value})}
                    placeholder="이메일을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>전화번호</label>
                    <input
                      type="tel"
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})}
                      placeholder="010-0000-0000"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>상태</label>
                    <select
                      value={newCustomerForm.status}
                      onChange={(e) => setNewCustomerForm({...newCustomerForm, status: e.target.value as Customer["status"]})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem",
                        background: "white"
                      }}
                    >
                      <option value="잠재">잠재</option>
                      <option value="활성">활성</option>
                      <option value="비활성">비활성</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>주소</label>
                  <input
                    type="text"
                    value={newCustomerForm.address}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, address: e.target.value})}
                    placeholder="주소를 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>담당자</label>
                  <input
                    type="text"
                    value={newCustomerForm.representative}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, representative: e.target.value})}
                    placeholder="담당자명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button
                    onClick={closeModals}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      background: "white",
                      color: "#374151",
                      fontSize: "0.875rem",
                      cursor: "pointer"
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveNewCustomer}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "0.375rem",
                      background: "#3b82f6",
                      color: "white",
                      fontSize: "0.875rem",
                      cursor: "pointer"
                    }}
                  >
                    고객 추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>고급 필터</h2>
              <button style={closeButtonStyle} onClick={closeModals}>
                ×
              </button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>회사명</label>
                  <input
                    type="text"
                    value={advancedFilters.company}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, company: e.target.value})}
                    placeholder="회사명으로 검색..."
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최소 주문수</label>
                    <input
                      type="number"
                      value={advancedFilters.minOrders}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, minOrders: e.target.value})}
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최대 주문수</label>
                    <input
                      type="number"
                      value={advancedFilters.maxOrders}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, maxOrders: e.target.value})}
                      placeholder="999"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>지역</label>
                  <input
                    type="text"
                    value={advancedFilters.location}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, location: e.target.value})}
                    placeholder="지역명으로 검색..."
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>기간</label>
                  <select
                    value={advancedFilters.dateRange}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, dateRange: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      background: "white"
                    }}
                  >
                    <option value="전체">전체 기간</option>
                    <option value="1개월">최근 1개월</option>
                    <option value="3개월">최근 3개월</option>
                    <option value="6개월">최근 6개월</option>
                    <option value="1년">최근 1년</option>
                  </select>
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button
                    onClick={resetFilters}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      background: "white",
                      color: "#374151",
                      fontSize: "0.875rem",
                      cursor: "pointer"
                    }}
                  >
                    초기화
                  </button>
                  <button
                    onClick={applyAdvancedFilters}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "0.375rem",
                      background: "#3b82f6",
                      color: "white",
                      fontSize: "0.875rem",
                      cursor: "pointer"
                    }}
                  >
                    필터 적용
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{editingCustomer.name} 편집</h2>
              <button style={closeButtonStyle} onClick={closeModals}>
                ×
              </button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>고객명 *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="고객명을 입력하세요"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>회사명 *</label>
                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                      placeholder="회사명을 입력하세요"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>이메일 *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    placeholder="이메일을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>전화번호</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      placeholder="010-0000-0000"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>상태</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value as Customer["status"]})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem",
                        background: "white"
                      }}
                    >
                      <option value="잠재">잠재</option>
                      <option value="활성">활성</option>
                      <option value="비활성">비활성</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>주소</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    placeholder="주소를 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>담당자</label>
                  <input
                    type="text"
                    value={editForm.representative}
                    onChange={(e) => setEditForm({...editForm, representative: e.target.value})}
                    placeholder="담당자명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button
                    onClick={closeModals}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      background: "white",
                      color: "#374151",
                      fontSize: "0.875rem",
                      cursor: "pointer"
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveEditCustomer}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "0.375rem",
                      background: "#3b82f6",
                      color: "white",
                      fontSize: "0.875rem",
                      cursor: "pointer"
                    }}
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
