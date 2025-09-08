import { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, Edit, Eye, Phone, Mail, Building } from "lucide-react";
import { useCustomers } from "../context/CustomerContext";
import type { Customer } from "../context/CustomerContext";
import erpDataJson from '../../DatcoDemoData2.json';

export function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  
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
    거래처코드: "",
    거래처명: "",
    구분: "",
    결제조건: "",
    신용등급: "",
    통화: "",
    납기리드타임일: 0,
    인코텀즈: "",
  });
  
  // 고급 필터 상태
  const [advancedFilters, setAdvancedFilters] = useState({
    company: "",
    minOrders: "",
    maxOrders: "",
    dateRange: "전체",
    location: "",
  });

  // ERP 데이터에서 고객 정보 추출
  const getERPCustomers = (): Customer[] => {
    const customers = erpDataJson.sheets.거래처마스터?.filter((item: any) => item.구분 === '고객사') || [];
    const salesOrders = erpDataJson.sheets.수주 || [];
    const arData = erpDataJson.sheets['회계(AR_AP)']?.filter((item: any) => item.구분 === '매출채권') || [];

    return customers.map((customer, index) => {
      const customerOrders = salesOrders.filter(order => order.거래처코드 === customer.거래처코드);
      const customerAR = arData.filter((ar: any) => ar.거래처코드 === customer.거래처코드);
      
      const totalOrders = customerOrders.length;
      const totalAmount = customerOrders.reduce((sum, order) => sum + order.수주금액, 0);
      const lastOrderDate = customerOrders.length > 0 
        ? customerOrders.sort((a, b) => new Date(b.수주일자).getTime() - new Date(a.수주일자).getTime())[0].수주일자
        : "2024-01-01";

      return {
        id: customer.거래처코드,
        name: customer.거래처명,
        company: customer.거래처명,
        email: `contact@${customer.거래처명.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: "02-" + (1000 + index * 111).toString() + "-" + (1000 + index * 222).toString(),
        address: `서울시 ${['강남구', '서초구', '송파구', '영등포구'][index % 4]} ${customer.거래처명} 본사`,
        status: (totalOrders > 2 ? "활성" : totalOrders > 0 ? "잠재" : "비활성") as Customer["status"],
        totalOrders,
        totalAmount,
        lastContact: lastOrderDate,
        representative: "영업팀",
        industry: "자동차부품",
        creditRating: customer.신용등급 as Customer["creditRating"],
        paymentTerms: parseInt(customer.결제조건.replace('D', '')),
        contactPerson: customer.거래처명 + " 담당자",
        // ERP 거래처마스터 속성들
        거래처코드: customer.거래처코드,
        거래처명: customer.거래처명,
        구분: customer.구분,
        결제조건: customer.결제조건,
        신용등급: customer.신용등급,
        통화: customer.통화,
        납기리드타임일: customer.납기리드타임일,
        인코텀즈: customer.인코텀즈
      };
    });
  };

  // 샘플 고객 데이터
  const getSampleCustomers = (): Customer[] => {
    return [
      {
        id: "SAMPLE-001",
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
        industry: "제조업",
        creditRating: "AAA",
        paymentTerms: 60,
        contactPerson: "김철수"
      },
      {
        id: "SAMPLE-002",
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
        industry: "IT솔루션",
        creditRating: "AAA",
        paymentTerms: 45,
        contactPerson: "박영희"
      },
      {
        id: "SAMPLE-003",
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
        industry: "엔지니어링",
        creditRating: "AA",
        paymentTerms: 30,
        contactPerson: "정민수"
      }
    ];
  };

  // 현재 선택된 데이터 소스에 따른 고객 목록
  const getCurrentCustomers = (): Customer[] => {
    return selectedDataSource === "erp" ? getERPCustomers() : getSampleCustomers();
  };

  // 데이터 소스 변경 시 고객 목록 업데이트
  useEffect(() => {
    // 데이터 소스가 변경되면 현재 고객 목록을 업데이트
  }, [selectedDataSource]);

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

    addCustomer(newCustomerForm);
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
    const csvData = currentCustomers.filter((customer) => {
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
    }).map(customer => [
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
      
      alert(`${csvData.length}개의 고객 데이터가 CSV 파일로 내보내졌습니다.`);
    } else {
      alert('파일 다운로드가 지원되지 않는 브라우저입니다.');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      status: customer.status,
      representative: customer.representative,
      거래처코드: customer.거래처코드 || "",
      거래처명: customer.거래처명 || "",
      구분: customer.구분 || "",
      결제조건: customer.결제조건 || "",
      신용등급: customer.신용등급 || "",
      통화: customer.통화 || "",
      납기리드타임일: customer.납기리드타임일 || 0,
      인코텀즈: customer.인코텀즈 || "",
    });
  };

  const handleUpdateCustomer = () => {
    if (!editForm.name || !editForm.company || !editForm.email) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, editForm);
      setEditingCustomer(null);
      alert('고객 정보가 업데이트되었습니다.');
    }
  };

  const handleCallCustomer = (customer: Customer) => {
    // 실제 구현에서는 전화 시스템과 연동
    alert(`${customer.name}(${customer.phone})에게 전화를 겁니다.`);
  };

  const handleViewCustomer = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  const closeModals = () => {
    setShowAddCustomerModal(false);
    setShowFilterModal(false);
    setEditingCustomer(null);
    setViewingCustomer(null);
  };

  // 정렬 함수
  const handleSort = (row: any, field: any) => {
    // 정렬 로직 구현
    console.log('정렬:', field);
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

  // 필터링된 고객 목록
  const currentCustomers = getCurrentCustomers();
  const filteredCustomers = currentCustomers.filter((customer: Customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div style={{ marginBottom: "1rem" }}>
          <h1 style={titleStyle}>고객 관리</h1>
          <p style={subtitleStyle}>고객 정보를 효율적으로 관리하고 분석하세요</p>
          <div
            style={{
              alignItems: "center",
              display: "inline-flex",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: "500",
              backgroundColor: selectedDataSource === "erp" ? "#dbeafe" : "#fef3c7",
              color: selectedDataSource === "erp" ? "#1e40af" : "#92400e",
              border: `1px solid ${selectedDataSource === "erp" ? "#93c5fd" : "#fcd34d"}`,
              marginTop: "0.75rem",
            }}
          >
            {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div style={actionsBarStyle}>
        <div style={searchContainerStyle}>
          <select 
            style={filterSelectStyle} 
            value={selectedDataSource} 
            onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")}
          >
            <option value="erp">닷코 시연 데이터</option>
            <option value="sample">생성된 샘플 데이터</option>
          </select>

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
            {filteredCustomers.map((customer, index) => (
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
                    <button style={actionButtonStyle} title="보기" onClick={() => handleViewCustomer(customer)}>
                      <Eye style={{ height: "1rem", width: "1rem" }} />
                    </button>
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
        총 {filteredCustomers.length}명의 고객이 표시됨 (전체 {currentCustomers.length}명 중)
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

                {/* ERP 정보 섹션 */}
                <div style={{ marginTop: "1.5rem" }}>
                  <h3 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600, color: "#374151" }}>ERP 정보</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>거래처코드</label>
                      <input
                        type="text"
                        value={editForm.거래처코드}
                        onChange={(e) => setEditForm({...editForm, 거래처코드: e.target.value})}
                        placeholder="거래처코드를 입력하세요"
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
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>거래처명</label>
                      <input
                        type="text"
                        value={editForm.거래처명}
                        onChange={(e) => setEditForm({...editForm, 거래처명: e.target.value})}
                        placeholder="거래처명을 입력하세요"
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
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>구분</label>
                      <input
                        type="text"
                        value={editForm.구분}
                        onChange={(e) => setEditForm({...editForm, 구분: e.target.value})}
                        placeholder="구분을 입력하세요"
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
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>결제조건</label>
                      <input
                        type="text"
                        value={editForm.결제조건}
                        onChange={(e) => setEditForm({...editForm, 결제조건: e.target.value})}
                        placeholder="결제조건을 입력하세요"
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
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>신용등급</label>
                      <input
                        type="text"
                        value={editForm.신용등급}
                        onChange={(e) => setEditForm({...editForm, 신용등급: e.target.value})}
                        placeholder="신용등급을 입력하세요"
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
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>통화</label>
                      <input
                        type="text"
                        value={editForm.통화}
                        onChange={(e) => setEditForm({...editForm, 통화: e.target.value})}
                        placeholder="통화를 입력하세요"
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
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>납기리드타임일</label>
                      <input
                        type="number"
                        value={editForm.납기리드타임일}
                        onChange={(e) => setEditForm({...editForm, 납기리드타임일: parseInt(e.target.value) || 0})}
                        placeholder="납기리드타임일을 입력하세요"
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
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>인코텀즈</label>
                      <input
                        type="text"
                        value={editForm.인코텀즈}
                        onChange={(e) => setEditForm({...editForm, 인코텀즈: e.target.value})}
                        placeholder="인코텀즈를 입력하세요"
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
                    onClick={handleUpdateCustomer}
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

      {/* 고객 정보 보기 모달 */}
      {viewingCustomer && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{viewingCustomer.name} 정보</h2>
              <button style={closeButtonStyle} onClick={closeModals}>
                ×
              </button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* 기본 정보 */}
                <div>
                  <h3 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600, color: "#374151" }}>기본 정보</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>고객명</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.name}</div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>회사명</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.company}</div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>이메일</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.email}</div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>전화번호</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.phone}</div>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>주소</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.address}</div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>상태</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.status}</div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>담당자</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.representative}</div>
                    </div>
                  </div>
                </div>

                {/* ERP 정보 */}
                <div>
                  <h3 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600, color: "#374151" }}>ERP 정보</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {viewingCustomer.거래처코드 && (
                      <div>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>거래처코드</label>
                        <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.거래처코드}</div>
                      </div>
                    )}
                    {viewingCustomer.거래처명 && (
                      <div>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>거래처명</label>
                        <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.거래처명}</div>
                      </div>
                    )}
                    {viewingCustomer.구분 && (
                      <div>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>구분</label>
                        <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.구분}</div>
                      </div>
                    )}
                    {viewingCustomer.결제조건 && (
                      <div>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>결제조건</label>
                        <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.결제조건}</div>
                      </div>
                    )}
                    {viewingCustomer.신용등급 && (
                      <div>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>신용등급</label>
                        <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.신용등급}</div>
                      </div>
                    )}
                    {viewingCustomer.통화 && (
                      <div>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>통화</label>
                        <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.통화}</div>
                      </div>
                    )}
                    {viewingCustomer.납기리드타임일 && (
                      <div>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>납기리드타임일</label>
                        <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.납기리드타임일}일</div>
                      </div>
                    )}
                    {viewingCustomer.인코텀즈 && (
                      <div>
                        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>인코텀즈</label>
                        <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.인코텀즈}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 거래 정보 */}
                <div>
                  <h3 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600, color: "#374151" }}>거래 정보</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>총 주문수</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.totalOrders}건</div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>총 거래액</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.totalAmount.toLocaleString()}원</div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500, color: "#6b7280" }}>마지막 연락일</label>
                      <div style={{ padding: "0.5rem", background: "#f9fafb", borderRadius: "0.375rem", fontSize: "0.875rem" }}>{viewingCustomer.lastContact}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
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
                    닫기
                  </button>
                  <button
                    onClick={() => {
                      setViewingCustomer(null);
                      handleEditCustomer(viewingCustomer);
                    }}
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
                    편집
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
