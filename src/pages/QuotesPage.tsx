import React, { useState } from "react";
import { Search, Plus, Filter, Download, Edit, Eye, Send, Clock, CheckCircle, XCircle, FileText, DollarSign } from "lucide-react";

interface Quote {
  id: string;
  quoteNumber: string;
  customer: string;
  company: string;
  status: "임시저장" | "발송대기" | "발송완료" | "승인" | "거절" | "만료";
  quoteDate: string;
  validUntil: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  items: number;
  representative: string;
  notes: string;
}

export function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [dateRange, setDateRange] = useState("전체");

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
      임시저장: { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" },
      발송대기: { bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
      발송완료: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
      승인: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      거절: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
      만료: { bg: "#fafafa", color: "#6b7280", border: "#e5e7eb" },
    };

    const colorSet = colors[status as keyof typeof colors] || colors["임시저장"];

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
  const quotes: Quote[] = [
    {
      id: "QUO-001",
      quoteNumber: "QT-2024-001",
      customer: "김철수",
      company: "ABC 제조업체",
      status: "발송완료",
      quoteDate: "2024-01-15",
      validUntil: "2024-02-15",
      totalAmount: 50000000,
      discount: 2500000,
      finalAmount: 47500000,
      items: 5,
      representative: "이영희",
      notes: "긴급 프로젝트 건",
    },
    {
      id: "QUO-002",
      quoteNumber: "QT-2024-002",
      customer: "박영희",
      company: "XYZ 솔루션",
      status: "승인",
      quoteDate: "2024-01-18",
      validUntil: "2024-02-28",
      totalAmount: 35000000,
      discount: 1000000,
      finalAmount: 34000000,
      items: 3,
      representative: "김대표",
      notes: "장기 계약 할인 적용",
    },
    {
      id: "QUO-003",
      quoteNumber: "QT-2024-003",
      customer: "정민수",
      company: "DEF 엔지니어링",
      status: "발송대기",
      quoteDate: "2024-01-20",
      validUntil: "2024-02-20",
      totalAmount: 28000000,
      discount: 0,
      finalAmount: 28000000,
      items: 4,
      representative: "이영희",
      notes: "",
    },
    {
      id: "QUO-004",
      quoteNumber: "QT-2024-004",
      customer: "최수진",
      company: "GHI 테크놀로지",
      status: "임시저장",
      quoteDate: "2024-01-22",
      validUntil: "2024-03-01",
      totalAmount: 67000000,
      discount: 3000000,
      finalAmount: 64000000,
      items: 8,
      representative: "김대표",
      notes: "검토 중인 사양서 반영 필요",
    },
    {
      id: "QUO-005",
      quoteNumber: "QT-2024-005",
      customer: "윤정호",
      company: "JKL 시스템즈",
      status: "거절",
      quoteDate: "2024-01-12",
      validUntil: "2024-01-30",
      totalAmount: 23000000,
      discount: 500000,
      finalAmount: 22500000,
      items: 2,
      representative: "이영희",
      notes: "예산 초과로 거절",
    },
  ];

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "전체" || quote.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "임시저장":
        return <FileText style={{ height: "1rem", width: "1rem" }} />;
      case "발송대기":
        return <Clock style={{ height: "1rem", width: "1rem" }} />;
      case "발송완료":
        return <Send style={{ height: "1rem", width: "1rem" }} />;
      case "승인":
        return <CheckCircle style={{ height: "1rem", width: "1rem" }} />;
      case "거절":
        return <XCircle style={{ height: "1rem", width: "1rem" }} />;
      case "만료":
        return <Clock style={{ height: "1rem", width: "1rem" }} />;
      default:
        return <FileText style={{ height: "1rem", width: "1rem" }} />;
    }
  };

  const isExpiringSoon = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    return expiryDate < today;
  };

  // 통계 계산
  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === "임시저장").length,
    sent: quotes.filter((q) => q.status === "발송완료").length,
    approved: quotes.filter((q) => q.status === "승인").length,
    totalValue: quotes.filter((q) => q.status === "승인").reduce((sum, quote) => sum + quote.finalAmount, 0),
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>견적 관리</h1>
        <p style={subtitleStyle}>견적서 작성부터 승인까지 전 과정을 효율적으로 관리하세요</p>
      </div>

      {/* Statistics Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.5rem" }}>{stats.total}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>전체 견적</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#d97706", marginBottom: "0.5rem" }}>{stats.draft}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>임시저장</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2563eb", marginBottom: "0.5rem" }}>{stats.sent}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>발송완료</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.5rem" }}>{stats.approved}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>승인</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "0.5rem" }}>{formatCurrency(stats.totalValue)}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>승인된 총액</div>
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
              placeholder="견적번호, 고객명으로 검색..."
              style={searchInputStyle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select style={filterSelectStyle} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="전체">전체 상태</option>
            <option value="임시저장">임시저장</option>
            <option value="발송대기">발송대기</option>
            <option value="발송완료">발송완료</option>
            <option value="승인">승인</option>
            <option value="거절">거절</option>
            <option value="만료">만료</option>
          </select>

          <select style={filterSelectStyle} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="전체">전체 기간</option>
            <option value="이번달">이번 달</option>
            <option value="지난달">지난 달</option>
            <option value="3개월">최근 3개월</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={secondaryButtonStyle}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            고급 필터
          </button>
          <button style={secondaryButtonStyle}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            견적 리포트
          </button>
          <button style={primaryButtonStyle}>
            <Plus style={{ height: "1rem", width: "1rem" }} />새 견적 작성
          </button>
        </div>
      </div>

      {/* Quotes Table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={thStyle}>견적번호</th>
              <th style={thStyle}>고객정보</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>견적일</th>
              <th style={thStyle}>유효기한</th>
              <th style={thStyle}>견적금액</th>
              <th style={thStyle}>할인</th>
              <th style={thStyle}>최종금액</th>
              <th style={thStyle}>항목수</th>
              <th style={thStyle}>담당자</th>
              <th style={thStyle}>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map((quote) => (
              <tr key={quote.id} style={{ transition: "background-color 0.2s ease" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: "#374151" }}>{quote.quoteNumber}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{quote.id}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{quote.customer}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{quote.company}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: statusBadgeStyle(quote.status).color }}>{getStatusIcon(quote.status)}</span>
                    <span style={statusBadgeStyle(quote.status)}>{quote.status}</span>
                  </div>
                </td>
                <td style={tdStyle}>{quote.quoteDate}</td>
                <td style={tdStyle}>
                  <div
                    style={{
                      color: isExpired(quote.validUntil) ? "#dc2626" : isExpiringSoon(quote.validUntil) ? "#d97706" : "#374151",
                      fontWeight: isExpired(quote.validUntil) || isExpiringSoon(quote.validUntil) ? 600 : 400,
                    }}
                  >
                    {quote.validUntil}
                    {isExpired(quote.validUntil) && <div style={{ fontSize: "0.75rem" }}>만료됨</div>}
                    {isExpiringSoon(quote.validUntil) && <div style={{ fontSize: "0.75rem" }}>곧 만료</div>}
                  </div>
                </td>
                <td style={tdStyle}>{formatCurrency(quote.totalAmount)}</td>
                <td style={tdStyle}>
                  {quote.discount > 0 ? (
                    <div style={{ color: "#dc2626", fontWeight: 500 }}>-{formatCurrency(quote.discount)}</div>
                  ) : (
                    <span style={{ color: "#6b7280" }}>없음</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: "#16a34a" }}>{formatCurrency(quote.finalAmount)}</div>
                </td>
                <td style={tdStyle}>{quote.items}개</td>
                <td style={tdStyle}>{quote.representative}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button style={actionButtonStyle} title="보기">
                      <Eye style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="편집">
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    {quote.status === "발송대기" && (
                      <button style={actionButtonStyle} title="발송">
                        <Send style={{ height: "1rem", width: "1rem" }} />
                      </button>
                    )}
                    <button style={actionButtonStyle} title="PDF 다운로드">
                      <Download style={{ height: "1rem", width: "1rem" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results Summary & Notes */}
      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1rem",
        }}
      >
        <div
          style={{
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            color: "#6b7280",
          }}
        >
          총 {filteredQuotes.length}개의 견적이 표시됨 (전체 {quotes.length}개 중)
        </div>
        <div
          style={{
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <div style={{ color: "#dc2626", fontWeight: 600, marginBottom: "0.5rem" }}>
            ⚠️ 곧 만료되는 견적: {quotes.filter((q) => isExpiringSoon(q.validUntil)).length}개
          </div>
          <div style={{ color: "#6b7280" }}>만료된 견적: {quotes.filter((q) => isExpired(q.validUntil)).length}개</div>
        </div>
      </div>
    </div>
  );
}
