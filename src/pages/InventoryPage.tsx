import React, { useState } from "react";
import { Search, Plus, Filter, Download, Edit, Eye, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  location: string;
  supplier: string;
  lastUpdated: string;
  status: "정상" | "부족" | "과다" | "없음";
}

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
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
      정상: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      부족: { bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
      과다: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
      없음: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    };

    const colorSet = colors[status as keyof typeof colors] || colors["정상"];

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

  const stockLevelBarStyle: React.CSSProperties = {
    width: "6rem",
    height: "0.5rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "0.25rem",
    overflow: "hidden",
  };

  const stockFillStyle = (current: number, min: number, max: number): React.CSSProperties => {
    const percentage = Math.min((current / max) * 100, 100);
    let color = "#16a34a"; // 정상 (녹색)

    if (current === 0) color = "#dc2626"; // 없음 (빨강)
    else if (current < min) color = "#d97706"; // 부족 (주황)
    else if (current > max * 0.9) color = "#2563eb"; // 과다 (파랑)

    return {
      height: "100%",
      width: `${percentage}%`,
      backgroundColor: color,
      borderRadius: "0.25rem",
      transition: "width 0.3s ease",
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
  const inventoryItems: InventoryItem[] = [
    {
      id: "INV-001",
      code: "RAW-001",
      name: "스테인리스 스틸 파이프",
      category: "원자재",
      currentStock: 450,
      minStock: 100,
      maxStock: 1000,
      unit: "개",
      unitPrice: 45000,
      totalValue: 20250000,
      location: "창고A-1구역",
      supplier: "한국철강",
      lastUpdated: "2024-01-18",
      status: "정상",
    },
    {
      id: "INV-002",
      code: "COMP-001",
      name: "제어 모듈",
      category: "부품",
      currentStock: 25,
      minStock: 50,
      maxStock: 200,
      unit: "개",
      unitPrice: 150000,
      totalValue: 3750000,
      location: "창고B-2구역",
      supplier: "전자부품상사",
      lastUpdated: "2024-01-17",
      status: "부족",
    },
    {
      id: "INV-003",
      code: "FIN-001",
      name: "완제품 A형",
      category: "완제품",
      currentStock: 80,
      minStock: 30,
      maxStock: 100,
      unit: "대",
      unitPrice: 500000,
      totalValue: 40000000,
      location: "출하창고",
      supplier: "자체생산",
      lastUpdated: "2024-01-19",
      status: "정상",
    },
    {
      id: "INV-004",
      code: "RAW-002",
      name: "알루미늄 시트",
      category: "원자재",
      currentStock: 0,
      minStock: 50,
      maxStock: 300,
      unit: "장",
      unitPrice: 25000,
      totalValue: 0,
      location: "창고A-3구역",
      supplier: "알루미늄코리아",
      lastUpdated: "2024-01-15",
      status: "없음",
    },
    {
      id: "INV-005",
      code: "TOOL-001",
      name: "정밀 드릴 비트",
      category: "공구",
      currentStock: 180,
      minStock: 20,
      maxStock: 100,
      unit: "개",
      unitPrice: 8000,
      totalValue: 1440000,
      location: "공구창고",
      supplier: "정밀공구",
      lastUpdated: "2024-01-16",
      status: "과다",
    },
  ];

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "전체" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "전체" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "정상":
        return <Package style={{ height: "1rem", width: "1rem" }} />;
      case "부족":
        return <TrendingDown style={{ height: "1rem", width: "1rem" }} />;
      case "과다":
        return <TrendingUp style={{ height: "1rem", width: "1rem" }} />;
      case "없음":
        return <AlertTriangle style={{ height: "1rem", width: "1rem" }} />;
      default:
        return <Package style={{ height: "1rem", width: "1rem" }} />;
    }
  };

  // 통계 계산
  const stats = {
    totalItems: inventoryItems.length,
    lowStock: inventoryItems.filter((i) => i.status === "부족" || i.status === "없음").length,
    totalValue: inventoryItems.reduce((sum, item) => sum + item.totalValue, 0),
    categories: new Set(inventoryItems.map((i) => i.category)).size,
  };

  const categories = ["전체", ...Array.from(new Set(inventoryItems.map((i) => i.category)))];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>재고 관리</h1>
        <p style={subtitleStyle}>실시간 재고 현황을 모니터링하고 효율적으로 관리하세요</p>
      </div>

      {/* Statistics Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.5rem" }}>{stats.totalItems}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>총 품목수</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#dc2626", marginBottom: "0.5rem" }}>{stats.lowStock}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>부족/품절</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.5rem" }}>{formatCurrency(stats.totalValue)}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>총 재고가치</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "0.5rem" }}>{stats.categories}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>카테고리</div>
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
              placeholder="품목명, 코드, 공급업체로 검색..."
              style={searchInputStyle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select style={filterSelectStyle} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select style={filterSelectStyle} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="전체">전체 상태</option>
            <option value="정상">정상</option>
            <option value="부족">부족</option>
            <option value="과다">과다</option>
            <option value="없음">없음</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={secondaryButtonStyle}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            고급 필터
          </button>
          <button style={secondaryButtonStyle}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            재고 리포트
          </button>
          <button style={primaryButtonStyle}>
            <Plus style={{ height: "1rem", width: "1rem" }} />새 품목 등록
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={thStyle}>품목코드</th>
              <th style={thStyle}>품목명</th>
              <th style={thStyle}>카테고리</th>
              <th style={thStyle}>현재고</th>
              <th style={thStyle}>재고수준</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>단가</th>
              <th style={thStyle}>총 가치</th>
              <th style={thStyle}>위치</th>
              <th style={thStyle}>공급업체</th>
              <th style={thStyle}>최종수정</th>
              <th style={thStyle}>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} style={{ transition: "background-color 0.2s ease" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: "#374151" }}>{item.code}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.id}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.unit}</div>
                </td>
                <td style={tdStyle}>{item.category}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{item.currentStock.toLocaleString()}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    최소: {item.minStock} / 최대: {item.maxStock}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={stockLevelBarStyle}>
                    <div style={stockFillStyle(item.currentStock, item.minStock, item.maxStock)} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    {Math.round((item.currentStock / item.maxStock) * 100)}%
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: statusBadgeStyle(item.status).color }}>{getStatusIcon(item.status)}</span>
                    <span style={statusBadgeStyle(item.status)}>{item.status}</span>
                  </div>
                </td>
                <td style={tdStyle}>{formatCurrency(item.unitPrice)}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(item.totalValue)}</div>
                </td>
                <td style={tdStyle}>{item.location}</td>
                <td style={tdStyle}>{item.supplier}</td>
                <td style={tdStyle}>{item.lastUpdated}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button style={actionButtonStyle} title="보기">
                      <Eye style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="편집">
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="재고조정">
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
        총 {filteredItems.length}개 품목이 표시됨 (전체 {inventoryItems.length}개 중)
      </div>
    </div>
  );
}
