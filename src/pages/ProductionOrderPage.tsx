import React, { useState } from "react";
import {
  Factory,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Filter,
  Plus,
  Search,
  Eye,
  Edit,
} from "lucide-react";

interface ProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  status: "planned" | "in-progress" | "completed" | "on-hold" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  startDate: Date;
  dueDate: Date;
  completedQuantity: number;
  assignedTeam: string;
  estimatedHours: number;
  actualHours: number;
  materials: Material[];
  progress: number;
  customer: string;
  notes?: string;
}

interface Material {
  id: string;
  name: string;
  requiredQuantity: number;
  availableQuantity: number;
  unit: string;
  status: "available" | "shortage" | "ordered";
}

interface ProductionMetric {
  label: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

// 가상 데이터
const PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: "po-001",
    orderNumber: "PO-2024-001",
    productName: "스마트 센서 모듈",
    productCode: "SSM-100",
    quantity: 500,
    unit: "EA",
    status: "in-progress",
    priority: "high",
    startDate: new Date("2024-01-15"),
    dueDate: new Date("2024-01-25"),
    completedQuantity: 320,
    assignedTeam: "생산팀 A",
    estimatedHours: 120,
    actualHours: 78,
    progress: 64,
    customer: "A전자",
    materials: [
      { id: "m1", name: "PCB 기판", requiredQuantity: 500, availableQuantity: 500, unit: "EA", status: "available" },
      { id: "m2", name: "센서 칩", requiredQuantity: 500, availableQuantity: 320, unit: "EA", status: "shortage" },
      { id: "m3", name: "외부 케이스", requiredQuantity: 500, availableQuantity: 500, unit: "EA", status: "available" },
    ],
  },
  {
    id: "po-002",
    orderNumber: "PO-2024-002",
    productName: "IoT 제어기",
    productCode: "IOT-200",
    quantity: 200,
    unit: "EA",
    status: "planned",
    priority: "medium",
    startDate: new Date("2024-01-20"),
    dueDate: new Date("2024-02-05"),
    completedQuantity: 0,
    assignedTeam: "생산팀 B",
    estimatedHours: 80,
    actualHours: 0,
    progress: 0,
    customer: "B기술",
    materials: [
      { id: "m4", name: "메인보드", requiredQuantity: 200, availableQuantity: 150, unit: "EA", status: "shortage" },
      { id: "m5", name: "디스플레이", requiredQuantity: 200, availableQuantity: 200, unit: "EA", status: "available" },
    ],
  },
  {
    id: "po-003",
    orderNumber: "PO-2024-003",
    productName: "자동화 컨트롤러",
    productCode: "AC-300",
    quantity: 100,
    unit: "EA",
    status: "completed",
    priority: "low",
    startDate: new Date("2024-01-05"),
    dueDate: new Date("2024-01-18"),
    completedQuantity: 100,
    assignedTeam: "생산팀 A",
    estimatedHours: 60,
    actualHours: 55,
    progress: 100,
    customer: "C솔루션",
    materials: [
      { id: "m6", name: "프로세서", requiredQuantity: 100, availableQuantity: 100, unit: "EA", status: "available" },
      { id: "m7", name: "커넥터", requiredQuantity: 400, availableQuantity: 400, unit: "EA", status: "available" },
    ],
  },
  {
    id: "po-004",
    orderNumber: "PO-2024-004",
    productName: "무선 모니터링 장치",
    productCode: "WMD-150",
    quantity: 300,
    unit: "EA",
    status: "on-hold",
    priority: "urgent",
    startDate: new Date("2024-01-22"),
    dueDate: new Date("2024-02-10"),
    completedQuantity: 50,
    assignedTeam: "생산팀 C",
    estimatedHours: 150,
    actualHours: 25,
    progress: 17,
    customer: "D시스템",
    materials: [
      { id: "m8", name: "무선 모듈", requiredQuantity: 300, availableQuantity: 50, unit: "EA", status: "shortage" },
      { id: "m9", name: "배터리", requiredQuantity: 300, availableQuantity: 300, unit: "EA", status: "available" },
    ],
  },
];

const PRODUCTION_METRICS: ProductionMetric[] = [
  {
    label: "진행 중인 오더",
    value: "3건",
    change: 1,
    icon: Factory,
    color: "blue",
  },
  {
    label: "오늘 완료 예정",
    value: "2건",
    change: 0,
    icon: CheckCircle,
    color: "green",
  },
  {
    label: "지연 위험",
    value: "1건",
    change: -1,
    icon: AlertTriangle,
    color: "orange",
  },
  {
    label: "평균 효율성",
    value: "87%",
    change: 5,
    icon: TrendingUp,
    color: "purple",
  },
];

export function ProductionOrderPage() {
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // 스타일 정의
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

  const inputStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    width: "100%",
  };

  const badgeStyle: React.CSSProperties = {
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: 500,
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    maxWidth: "32rem",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
  };

  const getPriorityColorStyle = (priority: string): React.CSSProperties => {
    switch (priority) {
      case "urgent":
        return { backgroundColor: "#dc2626", color: "white" };
      case "high":
        return { backgroundColor: "#ea580c", color: "white" };
      case "medium":
        return { backgroundColor: "#ca8a04", color: "white" };
      case "low":
        return { backgroundColor: "#16a34a", color: "white" };
      default:
        return { backgroundColor: "#6b7280", color: "white" };
    }
  };

  const getStatusColorHex = (status: string): string => {
    switch (status) {
      case "planned":
        return "#3b82f6";
      case "in-progress":
        return "#f59e0b";
      case "completed":
        return "#10b981";
      case "on-hold":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusColor = (status: ProductionOrder["status"]) => {
    switch (status) {
      case "planned":
        return "bg-gray-500";
      case "in-progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "on-hold":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: ProductionOrder["status"]) => {
    switch (status) {
      case "planned":
        return "계획됨";
      case "in-progress":
        return "진행중";
      case "completed":
        return "완료";
      case "on-hold":
        return "보류";
      case "cancelled":
        return "취소";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: ProductionOrder["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-600";
      case "medium":
        return "bg-blue-100 text-blue-600";
      case "high":
        return "bg-orange-100 text-orange-600";
      case "urgent":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityLabel = (priority: ProductionOrder["priority"]) => {
    switch (priority) {
      case "low":
        return "낮음";
      case "medium":
        return "보통";
      case "high":
        return "높음";
      case "urgent":
        return "긴급";
      default:
        return priority;
    }
  };

  const filteredOrders = PRODUCTION_ORDERS.filter((order) => {
    const matchesSearch =
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const getActionButton = (order: ProductionOrder) => {
    const buttonBaseStyle: React.CSSProperties = {
      padding: "0.25rem 0.75rem",
      borderRadius: "0.375rem",
      border: "none",
      cursor: "pointer",
      fontSize: "0.75rem",
      fontWeight: 500,
      display: "inline-flex",
      alignItems: "center",
      gap: "0.25rem",
    };

    switch (order.status) {
      case "planned":
        return (
          <button style={{...buttonBaseStyle, backgroundColor: "#3b82f6", color: "white"}}>
            <Play size={12} />
            시작
          </button>
        );
      case "in-progress":
        return (
          <button style={{...buttonBaseStyle, backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db"}}>
            <Pause size={12} />
            일시정지
          </button>
        );
      case "on-hold":
        return (
          <button style={{...buttonBaseStyle, backgroundColor: "#10b981", color: "white"}}>
            <RotateCcw size={12} />
            재개
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "1.5rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>생산 오더 현황</h1>
          <p style={{ color: "#6b7280" }}>생산 일정과 진행 상황을 실시간으로 관리하세요</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button style={{...secondaryButtonStyle}}>
            <Filter size={16} />
            상세 필터
          </button>
          <button style={{...primaryButtonStyle}}>
            <Plus size={16} />새 오더 생성
          </button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {PRODUCTION_METRICS.map((metric, index) => (
          <div key={index} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 500, color: "#6b7280" }}>{metric.label}</h3>
              <metric.icon size={16} style={{ color: `var(--${metric.color}-600, #6b7280)` }} />
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{metric.value}</div>
            {metric.change !== 0 && (
              <p style={{ fontSize: "0.75rem", color: metric.change > 0 ? "#10b981" : "#ef4444" }}>
                {metric.change > 0 ? "+" : ""}
                {metric.change} vs 어제
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 필터 및 검색 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            placeholder="제품명, 오더번호, 고객사로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{...inputStyle, paddingLeft: "2.5rem"}}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="all">모든 상태</option>
            <option value="planned">계획됨</option>
            <option value="in-progress">진행중</option>
            <option value="completed">완료</option>
            <option value="on-hold">보류</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="all">모든 우선순위</option>
            <option value="urgent">긴급</option>
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </div>
      </div>

      {/* 생산 오더 목록 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {filteredOrders.map((order) => (
          <div key={order.id} style={{...cardStyle, cursor: "pointer"}} onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"} onMouseLeave={(e) => e.currentTarget.style.boxShadow = cardStyle.boxShadow}>
            <div style={{ paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.25rem" }}>{order.productName}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{order.orderNumber}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{...badgeStyle, ...getPriorityColorStyle(order.priority)}}>{getPriorityLabel(order.priority)}</span>
                  <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", backgroundColor: getStatusColorHex(order.status) }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* 기본 정보 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.875rem" }}>
                <div>
                  <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>수량</p>
                  <p style={{ fontWeight: 500 }}>
                    {order.quantity.toLocaleString()} {order.unit}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>고객사</p>
                  <p style={{ fontWeight: 500 }}>{order.customer}</p>
                </div>
                <div>
                  <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>완료율</p>
                  <p style={{ fontWeight: 500 }}>{order.progress}%</p>
                </div>
                <div>
                  <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>담당팀</p>
                  <p style={{ fontWeight: 500 }}>{order.assignedTeam}</p>
                </div>
              </div>

              {/* 진행률 바 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                  <span>진행률</span>
                  <span>
                    {order.completedQuantity}/{order.quantity}
                  </span>
                </div>
                <div style={{ width: "100%", backgroundColor: "#e5e7eb", borderRadius: "9999px", height: "0.5rem" }}>
                  <div
                    style={{
                      height: "0.5rem",
                      borderRadius: "9999px",
                      transition: "all 0.3s",
                      backgroundColor: order.progress === 100 ? "#10b981" : order.progress > 50 ? "#3b82f6" : "#f59e0b",
                      width: `${order.progress}%`
                    }}
                  />
                </div>
              </div>

              {/* 일정 정보 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#6b7280" }}>
                  <Calendar size={12} />
                  <span>
                    {formatDate(order.startDate)} - {formatDate(order.dueDate)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    color: getDaysRemaining(order.dueDate) < 0 ? "#dc2626" : getDaysRemaining(order.dueDate) <= 3 ? "#ea580c" : "#16a34a"
                  }}
                >
                  <Clock size={12} />
                  <span>
                    {getDaysRemaining(order.dueDate) < 0
                      ? `${Math.abs(getDaysRemaining(order.dueDate))}일 지연`
                      : `${getDaysRemaining(order.dueDate)}일 남음`}
                  </span>
                </div>
              </div>

              {/* 자재 상태 미리보기 */}
              <div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>자재 상태</p>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {order.materials.map((material) => (
                    <div
                      key={material.id}
                      style={{
                        width: "0.5rem",
                        height: "0.5rem",
                        borderRadius: "50%",
                        backgroundColor: material.status === "available" ? "#10b981" : material.status === "shortage" ? "#ef4444" : "#eab308"
                      }}
                      title={`${material.name}: ${material.status}`}
                    />
                  ))}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.5rem" }}>
                {getActionButton(order)}
                <button style={{...secondaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.75rem"}} onClick={() => setSelectedOrder(order)}>
                  <Eye size={12} />
                  상세보기
                </button>
                <button style={{...secondaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.5rem", backgroundColor: "transparent", border: "none"}}>
                  <Edit size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 간트 차트 뷰 */}
      <div style={cardStyle}>
        <div style={{ paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={20} />
            생산 일정 간트 차트
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredOrders.map((order) => {
            const totalDays = Math.ceil((order.dueDate.getTime() - order.startDate.getTime()) / (1000 * 3600 * 24));
            const startOffset = Math.ceil((order.startDate.getTime() - new Date("2024-01-01").getTime()) / (1000 * 3600 * 24));

            return (
              <div key={order.id} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "12rem", fontSize: "0.875rem" }}>
                  <p style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.productName}</p>
                  <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>{order.orderNumber}</p>
                </div>
                <div style={{ flex: 1, position: "relative", height: "2rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      height: "100%",
                      borderRadius: "0.25rem",
                      backgroundColor: getStatusColorHex(order.status),
                      opacity: 0.8,
                      left: `${(startOffset / 31) * 100}%`,
                      width: `${(totalDays / 31) * 100}%`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      height: "100%",
                      borderRadius: "0.25rem",
                      backgroundColor: getStatusColorHex(order.status),
                      left: `${(startOffset / 31) * 100}%`,
                      width: `${(totalDays / 31) * (order.progress / 100) * 100}%`,
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "white", fontWeight: 500 }}>{order.progress}%</div>
                </div>
                <div style={{ width: "5rem", fontSize: "0.75rem", color: "#6b7280" }}>{formatDate(order.dueDate)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {selectedOrder && (
        <div style={modalOverlayStyle} onClick={() => setSelectedOrder(null)}>
          <div style={{...modalStyle, maxWidth: "64rem"}} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{selectedOrder.productName} 상세 정보</h2>
              <button style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }} onClick={() => setSelectedOrder(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={cardStyle}>
                  <div style={{ paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>기본 정보</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>오더 번호</p>
                        <p style={{ fontWeight: 500 }}>{selectedOrder.orderNumber}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>제품 코드</p>
                        <p style={{ fontWeight: 500 }}>{selectedOrder.productCode}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>수량</p>
                        <p style={{ fontWeight: 500 }}>
                          {selectedOrder.quantity.toLocaleString()} {selectedOrder.unit}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>완료 수량</p>
                        <p style={{ fontWeight: 500 }}>
                          {selectedOrder.completedQuantity.toLocaleString()} {selectedOrder.unit}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>고객사</p>
                        <p style={{ fontWeight: 500 }}>{selectedOrder.customer}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>담당팀</p>
                        <p style={{ fontWeight: 500 }}>{selectedOrder.assignedTeam}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={{ paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>일정 및 진행률</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>시작일</p>
                        <p style={{ fontWeight: 500 }}>{selectedOrder.startDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>완료 예정일</p>
                        <p style={{ fontWeight: 500 }}>{selectedOrder.dueDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>예상 시간</p>
                        <p style={{ fontWeight: 500 }}>{selectedOrder.estimatedHours}시간</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>실제 시간</p>
                        <p style={{ fontWeight: 500 }}>{selectedOrder.actualHours}시간</p>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <span>진행률</span>
                        <span>{selectedOrder.progress}%</span>
                      </div>
                      <div style={{ width: "100%", backgroundColor: "#e5e7eb", borderRadius: "9999px", height: "0.75rem" }}>
                        <div style={{ height: "0.75rem", backgroundColor: "#3b82f6", borderRadius: "9999px", transition: "all 0.3s", width: `${selectedOrder.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={cardStyle}>
                  <div style={{ paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>자재 현황</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {selectedOrder.materials.map((material) => (
                      <div key={material.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.25rem" }}>
                        <div>
                          <p style={{ fontWeight: 500 }}>{material.name}</p>
                          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            {material.availableQuantity}/{material.requiredQuantity} {material.unit}
                          </p>
                        </div>
                        <span
                          style={{
                            ...badgeStyle,
                            backgroundColor: material.status === "available" ? "#dcfce7" : material.status === "shortage" ? "#fecaca" : "#fef3c7",
                            color: material.status === "available" ? "#16a34a" : material.status === "shortage" ? "#dc2626" : "#d97706"
                          }}
                        >
                          {material.status === "available" ? "충분" : material.status === "shortage" ? "부족" : "주문됨"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div style={cardStyle}>
                    <div style={{ paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>특이사항</h3>
                    </div>
                    <p style={{ fontSize: "0.875rem" }}>{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button style={secondaryButtonStyle} onClick={() => setSelectedOrder(null)}>
                닫기
              </button>
              <button style={primaryButtonStyle}>
                편집
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
