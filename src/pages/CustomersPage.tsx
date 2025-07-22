import React, { useState } from "react";
import { Search, Plus, Filter, Download, Edit, Eye, Phone, Mail, MapPin, Building } from "lucide-react";

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
  const customers: Customer[] = [
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

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "전체" || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
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
          <button style={secondaryButtonStyle}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            필터
          </button>
          <button style={secondaryButtonStyle}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            내보내기
          </button>
          <button style={primaryButtonStyle}>
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
                    <button style={actionButtonStyle} title="보기">
                      <Eye style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="편집">
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="연락하기">
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
        총 {filteredCustomers.length}명의 고객이 표시됨 (전체 {customers.length}명 중)
      </div>
    </div>
  );
}
