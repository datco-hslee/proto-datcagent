import React, { useState } from "react";
import { Search, Plus, Filter, Download, Edit, Eye, Package, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  company: string;
  status: "대기중" | "진행중" | "완료" | "취소";
  priority: "높음" | "보통" | "낮음";
  orderDate: string;
  dueDate: string;
  totalAmount: number;
  items: number;
  representative: string;
  progress: number;
}

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [selectedPriority, setSelectedPriority] = useState("전체");

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

  const statsContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  };

  const statCardStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    borderRadius: "1rem",
    padding: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
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
      대기중: { bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
      진행중: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
      완료: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      취소: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    };

    const colorSet = colors[status as keyof typeof colors] || colors["대기중"];

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

  const priorityBadgeStyle = (priority: string): React.CSSProperties => {
    const colors = {
      높음: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
      보통: { bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
      낮음: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    };

    const colorSet = colors[priority as keyof typeof colors] || colors["보통"];

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

  const progressBarStyle: React.CSSProperties = {
    width: "4rem",
    height: "0.5rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "0.25rem",
    overflow: "hidden",
  };

  const progressFillStyle = (percentage: number): React.CSSProperties => ({
    height: "100%",
    width: `${percentage}%`,
    backgroundColor: "#3b82f6",
    borderRadius: "0.25rem",
    transition: "width 0.3s ease",
  });

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
  const orders: Order[] = [
    {
      id: "ORD-001",
      orderNumber: "PO-2024-001",
      customer: "김철수",
      company: "ABC 제조업체",
      status: "진행중",
      priority: "높음",
      orderDate: "2024-01-15",
      dueDate: "2024-02-15",
      totalAmount: 45000000,
      items: 5,
      representative: "이영희",
      progress: 75,
    },
    {
      id: "ORD-002",
      orderNumber: "PO-2024-002",
      customer: "박영희",
      company: "XYZ 솔루션",
      status: "대기중",
      priority: "보통",
      orderDate: "2024-01-18",
      dueDate: "2024-02-28",
      totalAmount: 32000000,
      items: 3,
      representative: "김대표",
      progress: 25,
    },
    {
      id: "ORD-003",
      orderNumber: "PO-2024-003",
      customer: "정민수",
      company: "DEF 엔지니어링",
      status: "완료",
      priority: "낮음",
      orderDate: "2024-01-10",
      dueDate: "2024-01-25",
      totalAmount: 18000000,
      items: 2,
      representative: "이영희",
      progress: 100,
    },
    {
      id: "ORD-004",
      orderNumber: "PO-2024-004",
      customer: "최수진",
      company: "GHI 테크놀로지",
      status: "진행중",
      priority: "높음",
      orderDate: "2024-01-20",
      dueDate: "2024-03-01",
      totalAmount: 67000000,
      items: 8,
      representative: "김대표",
      progress: 50,
    },
    {
      id: "ORD-005",
      orderNumber: "PO-2024-005",
      customer: "윤정호",
      company: "JKL 시스템즈",
      status: "취소",
      priority: "보통",
      orderDate: "2024-01-12",
      dueDate: "2024-02-20",
      totalAmount: 23000000,
      items: 4,
      representative: "이영희",
      progress: 0,
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "전체" || order.status === selectedStatus;
    const matchesPriority = selectedPriority === "전체" || order.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "대기중":
        return <Clock style={{ height: "1rem", width: "1rem" }} />;
      case "진행중":
        return <AlertCircle style={{ height: "1rem", width: "1rem" }} />;
      case "완료":
        return <CheckCircle style={{ height: "1rem", width: "1rem" }} />;
      case "취소":
        return <XCircle style={{ height: "1rem", width: "1rem" }} />;
      default:
        return <Clock style={{ height: "1rem", width: "1rem" }} />;
    }
  };

  // 통계 계산
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "대기중").length,
    inProgress: orders.filter((o) => o.status === "진행중").length,
    completed: orders.filter((o) => o.status === "완료").length,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>주문 관리</h1>
        <p style={subtitleStyle}>주문 현황을 실시간으로 모니터링하고 관리하세요</p>
      </div>

      {/* Statistics Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.5rem" }}>{stats.total}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>전체 주문</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#d97706", marginBottom: "0.5rem" }}>{stats.pending}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>대기중</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2563eb", marginBottom: "0.5rem" }}>{stats.inProgress}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>진행중</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.5rem" }}>{stats.completed}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>완료</div>
        </div>
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
              placeholder="주문번호, 고객명으로 검색..."
              style={searchInputStyle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select style={filterSelectStyle} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="전체">전체 상태</option>
            <option value="대기중">대기중</option>
            <option value="진행중">진행중</option>
            <option value="완료">완료</option>
            <option value="취소">취소</option>
          </select>

          <select style={filterSelectStyle} value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
            <option value="전체">전체 우선순위</option>
            <option value="높음">높음</option>
            <option value="보통">보통</option>
            <option value="낮음">낮음</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={secondaryButtonStyle}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            고급 필터
          </button>
          <button style={secondaryButtonStyle}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            내보내기
          </button>
          <button style={primaryButtonStyle}>
            <Plus style={{ height: "1rem", width: "1rem" }} />새 주문 생성
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={thStyle}>주문번호</th>
              <th style={thStyle}>고객정보</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>우선순위</th>
              <th style={thStyle}>주문일</th>
              <th style={thStyle}>납기일</th>
              <th style={thStyle}>금액</th>
              <th style={thStyle}>항목수</th>
              <th style={thStyle}>진행률</th>
              <th style={thStyle}>담당자</th>
              <th style={thStyle}>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} style={{ transition: "background-color 0.2s ease" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: "#374151" }}>{order.orderNumber}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{order.id}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{order.customer}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{order.company}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: statusBadgeStyle(order.status).color }}>{getStatusIcon(order.status)}</span>
                    <span style={statusBadgeStyle(order.status)}>{order.status}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={priorityBadgeStyle(order.priority)}>{order.priority}</span>
                </td>
                <td style={tdStyle}>{order.orderDate}</td>
                <td style={tdStyle}>
                  <div
                    style={{
                      color: new Date(order.dueDate) < new Date() ? "#dc2626" : "#374151",
                      fontWeight: new Date(order.dueDate) < new Date() ? 600 : 400,
                    }}
                  >
                    {order.dueDate}
                  </div>
                </td>
                <td style={tdStyle}>{formatCurrency(order.totalAmount)}</td>
                <td style={tdStyle}>{order.items}개</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={progressBarStyle}>
                      <div style={progressFillStyle(order.progress)} />
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{order.progress}%</span>
                  </div>
                </td>
                <td style={tdStyle}>{order.representative}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button style={actionButtonStyle} title="보기">
                      <Eye style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="편집">
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="배송관리">
                      <Package style={{ height: "1rem", width: "1rem" }} />
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
        총 {filteredOrders.length}개의 주문이 표시됨 (전체 {orders.length}개 중)
      </div>
    </div>
  );
}
