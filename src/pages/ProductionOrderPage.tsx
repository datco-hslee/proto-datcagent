import React, { useState, useMemo } from "react";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Pause, 
  Plus,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Factory,
  RotateCcw,
  Eye,
  Edit,
  Package,
} from "lucide-react";
import erpDataJson from "../../DatcoDemoData2.json";
import { generateMassiveERPData } from "../data/massiveERPData";

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
  // Item master details
  itemCategory?: string;
  standardPrice?: number;
  moq?: number;
  safetyStock?: number;
  leadTimeDays?: number;
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


// Calculate dynamic metrics based on actual order data
const calculateProductionMetrics = (orders: ProductionOrder[]): ProductionMetric[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Count in-progress orders
  const inProgressCount = orders.filter(order => order.status === "in-progress").length;
  
  // Count orders due today
  const todayDueCount = orders.filter(order => {
    const dueDate = new Date(order.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime() && order.status !== "completed";
  }).length;
  
  // Count delayed orders (past due date and not completed)
  const delayedCount = orders.filter(order => {
    const dueDate = new Date(order.dueDate);
    dueDate.setHours(23, 59, 59, 999);
    return dueDate.getTime() < today.getTime() && order.status !== "completed";
  }).length;
  
  // Calculate average efficiency (actual hours vs estimated hours)
  const ordersWithHours = orders.filter(order => order.estimatedHours > 0 && order.actualHours > 0);
  const avgEfficiency = ordersWithHours.length > 0 
    ? Math.round((ordersWithHours.reduce((sum, order) => sum + (order.estimatedHours / order.actualHours), 0) / ordersWithHours.length) * 100)
    : 0;
  
  return [
    {
      label: "총 오더",
      value: `${orders.length}건`,
      change: 0,
      icon: Package,
      color: "gray",
    },
    {
      label: "진행 중인 오더",
      value: `${inProgressCount}건`,
      change: 0, // Could be calculated by comparing with previous day if needed
      icon: Factory,
      color: "blue",
    },
    {
      label: "오늘 완료 예정",
      value: `${todayDueCount}건`,
      change: 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "지연 위험",
      value: `${delayedCount}건`,
      change: 0,
      icon: AlertTriangle,
      color: "orange",
    },
    {
      label: "평균 효율성",
      value: `${avgEfficiency}%`,
      change: 0,
      icon: TrendingUp,
      color: "purple",
    },
  ];
};

export function ProductionOrderPage() {
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedDataSource, setSelectedDataSource] = useState<string>("erp");
  const [showDetailedFilters, setShowDetailedFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  
  // Generate sample production orders (original generated data)
  const getSampleProductionOrders = (): ProductionOrder[] => {
    return [
      {
        id: "PO-001",
        orderNumber: "PO-2024-001",
        productName: "스마트 센서 모듈",
        productCode: "SSM-001",
        quantity: 500,
        unit: "EA",
        status: "in-progress",
        priority: "high",
        startDate: new Date("2024-09-01"),
        dueDate: new Date("2024-09-15"),
        completedQuantity: 250,
        assignedTeam: "생산팀 A",
        estimatedHours: 120,
        actualHours: 65,
        progress: 50,
        customer: "테크놀로지 주식회사",
        materials: [
          { id: "MAT-001", name: "MCU 칩셋", requiredQuantity: 500, availableQuantity: 450, unit: "EA", status: "shortage" },
          { id: "MAT-002", name: "센서 보드", requiredQuantity: 500, availableQuantity: 500, unit: "EA", status: "available" }
        ],
        notes: "고객 요청으로 품질 검사 강화 필요",
        itemCategory: "완제품",
        standardPrice: 85000,
        moq: 100,
        safetyStock: 50,
        leadTimeDays: 7
      },
      {
        id: "PO-002", 
        orderNumber: "PO-2024-002",
        productName: "IoT 컨트롤러",
        productCode: "IOT-002",
        quantity: 300,
        unit: "EA",
        status: "planned",
        priority: "medium",
        startDate: new Date("2024-09-10"),
        dueDate: new Date("2024-09-25"),
        completedQuantity: 0,
        assignedTeam: "생산팀 B",
        estimatedHours: 90,
        actualHours: 0,
        progress: 0,
        customer: "스마트솔루션",
        materials: [
          { id: "MAT-003", name: "제어 보드", requiredQuantity: 300, availableQuantity: 280, unit: "EA", status: "shortage" },
          { id: "MAT-004", name: "케이스", requiredQuantity: 300, availableQuantity: 350, unit: "EA", status: "available" }
        ],
        itemCategory: "완제품",
        standardPrice: 125000,
        moq: 50,
        safetyStock: 30,
        leadTimeDays: 10
      },
      {
        id: "PO-003",
        orderNumber: "PO-2024-003", 
        productName: "산업용 디스플레이",
        productCode: "IND-003",
        quantity: 150,
        unit: "EA",
        status: "completed",
        priority: "low",
        startDate: new Date("2024-08-15"),
        dueDate: new Date("2024-08-30"),
        completedQuantity: 150,
        assignedTeam: "생산팀 A",
        estimatedHours: 60,
        actualHours: 58,
        progress: 100,
        customer: "글로벌인더스트리",
        materials: [
          { id: "MAT-005", name: "LCD 패널", requiredQuantity: 150, availableQuantity: 0, unit: "EA", status: "ordered" },
          { id: "MAT-006", name: "백라이트", requiredQuantity: 150, availableQuantity: 0, unit: "EA", status: "ordered" }
        ],
        itemCategory: "완제품",
        standardPrice: 450000,
        moq: 20,
        safetyStock: 10,
        leadTimeDays: 14
      }
    ];
  };

  // Generate production orders from ERP JSON data - only work orders, no production plans
  const getProductionOrdersFromERPData = (): ProductionOrder[] => {
    // Get data from ERP JSON - only work orders
    const workOrders = erpDataJson.sheets.작업지시 || [];
    const itemMaster = erpDataJson.sheets.품목마스터 || [];
    const bomData = erpDataJson.sheets.BOM || [];
    
    // Create a map of items for quick lookup
    const itemMap = new Map<string, any>();
    itemMaster.forEach((item: any) => {
      itemMap.set(item.품목코드, item);
    });
    
    // Process ONLY the 2 work orders from ERP data
    return workOrders.map((workOrder: any) => {
      const item = itemMap.get(workOrder.품목코드);
      if (!item) return null;
      
      const status = workOrder.상태 === "RELEASED" ? "in-progress" : 
                    workOrder.상태 === "PLANNED" ? "planned" : 
                    workOrder.상태 === "COMPLETED" ? "completed" : "planned";
      
      // Get materials from BOM data
      const materials: Material[] = bomData
        .filter((bom: any) => bom.상위품목코드 === workOrder.품목코드)
        .map((bom: any, bomIndex: number) => {
          const childItem = itemMap.get(bom.하위품목코드);
          return {
            id: `${workOrder.작업지시번호}-mat-${bomIndex}`,
            name: childItem?.품목명 || bom.하위품목코드,
            requiredQuantity: bom.소요량 * workOrder.지시수량,
            availableQuantity: Math.floor((bom.소요량 * workOrder.지시수량) * 0.9),
            unit: bom.단위 || "EA",
            status: Math.random() > 0.3 ? "available" : "shortage"
          };
        });
      
      return {
        id: workOrder.작업지시번호,
        orderNumber: workOrder.작업지시번호,
        productName: item.품목명,
        productCode: workOrder.품목코드,
        quantity: workOrder.지시수량,
        unit: "EA",
        status: status as ProductionOrder['status'],
        priority: "medium" as ProductionOrder['priority'],
        startDate: new Date(workOrder.시작일자 || new Date()),
        dueDate: new Date(workOrder.완료일자 || new Date()),
        completedQuantity: status === "completed" ? workOrder.지시수량 : 
                          status === "in-progress" ? Math.floor(workOrder.지시수량 * 0.5) : 0,
        assignedTeam: workOrder.라인 || "LINE-1",
        estimatedHours: Math.floor(workOrder.지시수량 * 0.2),
        actualHours: status === "completed" ? Math.floor(workOrder.지시수량 * 0.18) : 
                     status === "in-progress" ? Math.floor(workOrder.지시수량 * 0.1) : 0,
        progress: status === "completed" ? 100 : 
                 status === "in-progress" ? 50 : 0,
        customer: "현대자동차",
        materials: materials,
        notes: `ERP 작업지시: ${workOrder.작업지시번호}`,
        // Item master details
        itemCategory: item.품목구분,
        standardPrice: item.표준단가,
        moq: item.MOQ,
        safetyStock: item.안전재고,
        leadTimeDays: item.리드타임일
      };
    }).filter(Boolean) as ProductionOrder[];
  };

  // Generate production orders from massive ERP data
  const getMassiveERPProductionOrders = (): ProductionOrder[] => {
    try {
      const massiveERPData = generateMassiveERPData();
      const productionOrders = massiveERPData.productionOrders || [];
      
      return productionOrders.map((po: any) => {
        // Convert massive ERP productionOrder to ProductionOrder interface
        const materials: Material[] = po.workOrders?.flatMap((wo: any) => 
          wo.materialsConsumed?.map((mc: any, index: number) => ({
            id: `${po.id}-mat-${index}`,
            name: mc.materialCode || 'Unknown Material',
            requiredQuantity: mc.plannedQuantity || 0,
            availableQuantity: mc.actualQuantity || 0,
            unit: 'EA',
            status: mc.actualQuantity >= mc.plannedQuantity ? 'available' : 'shortage'
          })) || []
        ) || [];
        
        // Map status from massive ERP to UI status
        const status = po.status === 'completed' ? 'completed' :
                      po.status === 'in_progress' ? 'in-progress' :
                      po.status === 'planned' ? 'planned' : 'planned';
        
        // Map priority from massive ERP to UI priority
        const priority = po.priority === 'urgent' ? 'high' :
                        po.priority === 'normal' ? 'medium' : 'medium';
        
        // Calculate progress based on actual vs planned quantity
        const progress = po.plannedQuantity > 0 ? 
          Math.round((po.actualQuantity / po.plannedQuantity) * 100) : 0;
        
        return {
          id: po.id,
          orderNumber: po.orderNumber,
          productName: po.productName,
          productCode: po.productCode,
          quantity: po.plannedQuantity,
          unit: 'EA',
          status: status as ProductionOrder['status'],
          priority: priority as ProductionOrder['priority'],
          startDate: po.plannedStartDate ? new Date(po.plannedStartDate) : new Date(),
          dueDate: po.plannedEndDate ? new Date(po.plannedEndDate) : new Date(),
          completedQuantity: po.actualQuantity || 0,
          assignedTeam: po.workOrders?.[0]?.workCenterName || 'Production Team',
          estimatedHours: po.workOrders?.length * 8 || 40, // 8 hours per work order
          actualHours: po.workOrders?.filter((wo: any) => wo.actualEndTime).length * 8 || 0,
          progress: Math.min(progress, 100),
          customer: '대량 ERP 고객사',
          materials: materials,
          notes: `대량 ERP 생산오더: ${po.orderNumber}`,
          itemCategory: '완제품',
          standardPrice: 100000, // Default price for massive ERP data
          moq: 50,
          safetyStock: 25,
          leadTimeDays: 7
        };
      }).filter(Boolean) as ProductionOrder[];
    } catch (error) {
      console.error('Error converting massive ERP production orders:', error);
      return [];
    }
  };

  // Get orders based on selected data source
  const getCurrentOrders = (): ProductionOrder[] => {
    if (selectedDataSource === "sample") {
      return getSampleProductionOrders();
    } else if (selectedDataSource === "massive") {
      return getMassiveERPProductionOrders();
    } else {
      return getProductionOrdersFromERPData();
    }
  };

  const [orders, setOrders] = useState<ProductionOrder[]>([]);

  // Update orders when data source changes
  React.useEffect(() => {
    console.log("Data source changed to:", selectedDataSource);
    const newOrders = getCurrentOrders();
    console.log("Setting orders:", newOrders);
    setOrders(newOrders);
  }, [selectedDataSource]);

  // Initialize orders on component mount
  React.useEffect(() => {
    console.log("Component mounted, initializing orders");
    const initialOrders = getCurrentOrders();
    console.log("Initial orders:", initialOrders);
    setOrders(initialOrders);
  }, []);
  
  // Additional filter states
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: "", end: "" });
  const [progressFilter, setProgressFilter] = useState({ min: 0, max: 100 });

  // Calculate production metrics dynamically
  const productionMetrics = useMemo(() => calculateProductionMetrics(orders), [orders]);

  // Create order form state
  const [newOrder, setNewOrder] = useState({
    productName: "",
    productCode: "",
    quantity: "",
    unit: "개",
    customer: "",
    assignedTeam: "",
    priority: "medium" as ProductionOrder["priority"],
    startDate: "",
    dueDate: "",
    notes: ""
  });

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

  // Handler functions
  const handleCreateOrder = () => {
    if (!newOrder.productName || !newOrder.quantity || !newOrder.customer || !newOrder.assignedTeam || !newOrder.startDate || !newOrder.dueDate) {
      alert("모든 필수 필드를 입력해주세요.");
      return;
    }

    const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
    const createdOrder: ProductionOrder = {
      id: Date.now().toString(),
      orderNumber,
      productName: newOrder.productName,
      productCode: newOrder.productCode || `PC-${Date.now().toString().slice(-4)}`,
      quantity: parseInt(newOrder.quantity),
      unit: newOrder.unit,
      status: "planned",
      priority: newOrder.priority,
      customer: newOrder.customer,
      assignedTeam: newOrder.assignedTeam,
      startDate: new Date(newOrder.startDate),
      dueDate: new Date(newOrder.dueDate),
      progress: 0,
      completedQuantity: 0,
      estimatedHours: 0,
      actualHours: 0,
      materials: [],
      notes: newOrder.notes
    };

    setOrders(prev => [createdOrder, ...prev]);
    setShowCreateModal(false);
    setNewOrder({
      productName: "",
      productCode: "",
      quantity: "",
      unit: "개",
      customer: "",
      assignedTeam: "",
      priority: "medium",
      startDate: "",
      dueDate: "",
      notes: ""
    });
    alert("새 생산 오더가 생성되었습니다.");
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewOrder({
      productName: "",
      productCode: "",
      quantity: "",
      unit: "개",
      customer: "",
      assignedTeam: "",
      priority: "medium",
      startDate: "",
      dueDate: "",
      notes: ""
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    const matchesTeam = teamFilter === "all" || order.assignedTeam === teamFilter;
    const matchesCustomer = customerFilter === "all" || order.customer === customerFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRangeFilter.start || dateRangeFilter.end) {
      const orderDate = new Date(order.startDate);
      if (dateRangeFilter.start) {
        matchesDateRange = matchesDateRange && orderDate >= new Date(dateRangeFilter.start);
      }
      if (dateRangeFilter.end) {
        matchesDateRange = matchesDateRange && orderDate <= new Date(dateRangeFilter.end);
      }
    }
    
    // Progress filter
    const matchesProgress = order.progress >= progressFilter.min && order.progress <= progressFilter.max;

    return matchesSearch && matchesStatus && matchesPriority && matchesTeam && matchesCustomer && matchesDateRange && matchesProgress;
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

  // 오더 상태 변경 핸들러
  const handleStartOrder = (orderId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: "in-progress" as const }
          : order
      )
    );
  };

  const handlePauseOrder = (orderId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: "on-hold" as const }
          : order
      )
    );
  };

  const handleResumeOrder = (orderId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: "in-progress" as const }
          : order
      )
    );
  };

  // 오더 편집 핸들러
  const handleEditOrder = (order: ProductionOrder) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingOrder(null);
  };

  const handleSaveEditOrder = () => {
    if (!editingOrder) return;

    // 유효성 검사
    if (!editingOrder.productName || !editingOrder.productCode || editingOrder.quantity <= 0) {
      alert("필수 필드를 모두 입력해주세요.");
      return;
    }

    // 오더 업데이트
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === editingOrder.id ? editingOrder : order
      )
    );

    handleCloseEditModal();
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
          <button 
            style={{...buttonBaseStyle, backgroundColor: "#3b82f6", color: "white"}}
            onClick={() => handleStartOrder(order.id)}
          >
            <Play size={12} />
            시작
          </button>
        );
      case "in-progress":
        return (
          <button 
            style={{...buttonBaseStyle, backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db"}}
            onClick={() => handlePauseOrder(order.id)}
          >
            <Pause size={12} />
            일시정지
          </button>
        );
      case "on-hold":
        return (
          <button 
            style={{...buttonBaseStyle, backgroundColor: "#10b981", color: "white"}}
            onClick={() => handleResumeOrder(order.id)}
          >
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>생산 오더 관리</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p style={{ color: "#6b7280" }}>생산 계획 및 진행 상황을 관리합니다</p>
            <span style={{
              padding: "0.25rem 0.75rem",
              backgroundColor: selectedDataSource === "erp" ? "#dbeafe" : 
                              selectedDataSource === "massive" ? "#dcfce7" : "#fef3c7",
              color: selectedDataSource === "erp" ? "#1e40af" : 
                    selectedDataSource === "massive" ? "#166534" : "#92400e",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500
            }}>
              {selectedDataSource === "erp" ? "닷코 시연 데이터" : 
               selectedDataSource === "massive" ? "대량 ERP 데이터" : "생성된 샘플 데이터"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button style={{...secondaryButtonStyle}}>
            <Filter size={16} />
            상세 필터
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{...primaryButtonStyle}}
          >
            <Plus size={16} />새 오더 생성
          </button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {productionMetrics.map((metric: ProductionMetric, index: number) => (
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
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* 데이터 소스 선택 */}
          <select
            value={selectedDataSource}
            onChange={(e) => setSelectedDataSource(e.target.value)}
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              backgroundColor: "white",
              minWidth: "160px"
            }}
          >
            <option value="erp">닷코 시연 데이터</option>
            <option value="massive">대량 ERP 데이터</option>
            <option value="sample">생성된 샘플 데이터</option>
          </select>
          
          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}

            // 모든 상태 css
            style={{...inputStyle, width: "40px", minWidth: "150px"}}
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
            // 모든 우선순위 css
            style={{...inputStyle, width: "40px", minWidth: "150px"}}
          >
            <option value="all">모든 우선순위</option>
            <option value="urgent">긴급</option>
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
          <button
            onClick={() => setShowDetailedFilters(!showDetailedFilters)}
            style={{
              ...primaryButtonStyle,
              backgroundColor: showDetailedFilters ? "#1d4ed8" : "#3b82f6",
            }}
          >
            <Filter size={18} />
            상세 필터
          </button>
        </div>
        
        {/* 상세 필터 */}
        {showDetailedFilters && (
          <div style={{
            ...cardStyle,
            padding: "1rem",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0"
          }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: "1rem" }}>상세 필터</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {/* 팀 필터 */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  담당팀
                </label>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  style={inputStyle}
                >
                  <option value="all">모든 팀</option>
                  <option value="생산팀 A">생산팀 A</option>
                  <option value="생산팀 B">생산팀 B</option>
                  <option value="생산팀 C">생산팀 C</option>
                  <option value="품질관리팀">품질관리팀</option>
                </select>
              </div>
              
              {/* 고객사 필터 */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  고객사
                </label>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  style={inputStyle}
                >
                  <option value="all">모든 고객사</option>
                  <option value="ABC 전자">ABC 전자</option>
                  <option value="XYZ 산업">XYZ 산업</option>
                  <option value="DEF 기업">DEF 기업</option>
                  <option value="GHI 코퍼레이션">GHI 코퍼레이션</option>
                </select>
              </div>
              
              {/* 시작일 필터 */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  시작일 (시작)
                </label>
                <input
                  type="date"
                  value={dateRangeFilter.start}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              
              {/* 종료일 필터 */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  시작일 (종료)
                </label>
                <input
                  type="date"
                  value={dateRangeFilter.end}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              
              {/* 진행률 필터 */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  진행률 범위: {progressFilter.min}% - {progressFilter.max}%
                </label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressFilter.min}
                    onChange={(e) => setProgressFilter(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressFilter.max}
                    onChange={(e) => setProgressFilter(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>
            
            {/* 필터 초기화 버튼 */}
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setTeamFilter("all");
                  setCustomerFilter("all");
                  setDateRangeFilter({ start: "", end: "" });
                  setProgressFilter({ min: 0, max: 100 });
                }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                필터 초기화
              </button>
            </div>
          </div>
        )}
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
              <div style={{ width: "100%", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                  <span>진행률</span>
                  <span>
                    {order.completedQuantity}/{order.quantity}
                  </span>
                </div>
                <div style={{ width: "100%", backgroundColor: "#e5e7eb", borderRadius: "9999px", height: "0.5rem", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "0.5rem",
                      borderRadius: "9999px",
                      transition: "all 0.3s",
                      backgroundColor: order.progress === 100 ? "#10b981" : order.progress > 50 ? "#3b82f6" : "#f59e0b",
                      width: `${Math.min(order.progress, 100)}%`,
                      maxWidth: "100%"
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
                <button 
                  style={{...secondaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.5rem", backgroundColor: "transparent", border: "none"}}
                  onClick={() => handleEditOrder(order)}
                >
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
                <div style={{ flex: 1, position: "relative", height: "2rem", backgroundColor: "#f3f4f6", borderRadius: "0.25rem", overflow: "hidden" }}>
                  {/* 전체 기간 배경 바 (100% 너비) */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: "100%",
                      borderRadius: "0.25rem",
                      backgroundColor: getStatusColorHex(order.status),
                      opacity: 0.2
                    }}
                  />
                  {/* 진행률 바 - 0%부터 시작해서 진행률만큼 표시 */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      borderRadius: "0.25rem",
                      backgroundColor: getStatusColorHex(order.status),
                      width: `${Math.min(order.progress, 100)}%`,
                      maxWidth: "100%"
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#000000", fontWeight: 600, textShadow: "0 0 2px rgba(255,255,255,0.8)" }}>{order.progress}%</div>
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

                {/* 품목 마스터 정보 */}
                <div style={cardStyle}>
                  <div style={{ paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>품목 마스터 정보</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                    <div>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>품목구분</p>
                      <p style={{ fontWeight: 500 }}>{selectedOrder.itemCategory || "미정"}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>표준단가</p>
                      <p style={{ fontWeight: 500, color: "#10b981" }}>
                        {selectedOrder.standardPrice ? `₩${selectedOrder.standardPrice.toLocaleString()}` : "미정"}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>MOQ</p>
                      <p style={{ fontWeight: 500 }}>
                        {selectedOrder.moq ? `${selectedOrder.moq.toLocaleString()} ${selectedOrder.unit}` : "미정"}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>안전재고</p>
                      <p style={{ fontWeight: 500 }}>
                        {selectedOrder.safetyStock ? `${selectedOrder.safetyStock.toLocaleString()} ${selectedOrder.unit}` : "미정"}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>리드타임</p>
                      <p style={{ fontWeight: 500 }}>{selectedOrder.leadTimeDays ? `${selectedOrder.leadTimeDays}일` : "미정"}</p>
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            padding: "2rem",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>새 생산 오더 생성</h2>
              <button
                onClick={handleCloseCreateModal}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  제품명 *
                </label>
                <input
                  type="text"
                  value={newOrder.productName}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, productName: e.target.value }))}
                  style={inputStyle}
                  placeholder="제품명을 입력하세요"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  제품 코드
                </label>
                <input
                  type="text"
                  value={newOrder.productCode}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, productCode: e.target.value }))}
                  style={inputStyle}
                  placeholder="자동 생성됩니다"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  수량 *
                </label>
                <input
                  type="number"
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, quantity: e.target.value }))}
                  style={inputStyle}
                  placeholder="수량"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  단위
                </label>
                <select
                  value={newOrder.unit}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, unit: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="개">개</option>
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="m">m</option>
                  <option value="세트">세트</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  고객사 *
                </label>
                <input
                  type="text"
                  value={newOrder.customer}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, customer: e.target.value }))}
                  style={inputStyle}
                  placeholder="고객사명"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  담당팀 *
                </label>
                <select
                  value={newOrder.assignedTeam}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, assignedTeam: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">팀 선택</option>
                  <option value="생산팀 A">생산팀 A</option>
                  <option value="생산팀 B">생산팀 B</option>
                  <option value="생산팀 C">생산팀 C</option>
                  <option value="품질관리팀">품질관리팀</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  시작일 *
                </label>
                <input
                  type="date"
                  value={newOrder.startDate}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, startDate: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  완료 예정일 *
                </label>
                <input
                  type="date"
                  value={newOrder.dueDate}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, dueDate: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                우선순위
              </label>
              <select
                value={newOrder.priority}
                onChange={(e) => setNewOrder(prev => ({ ...prev, priority: e.target.value as ProductionOrder["priority"] }))}
                style={inputStyle}
              >
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
                <option value="urgent">긴급</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                특이사항
              </label>
              <textarea
                value={newOrder.notes}
                onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                style={{
                  ...inputStyle,
                  minHeight: "80px",
                  resize: "vertical"
                }}
                placeholder="특이사항이나 추가 정보를 입력하세요"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={handleCloseCreateModal}
                style={secondaryButtonStyle}
              >
                취소
              </button>
              <button
                onClick={handleCreateOrder}
                style={primaryButtonStyle}
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 오더 편집 모달 */}
      {showEditModal && editingOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", marginBottom: "1.5rem" }}>
              생산 오더 편집
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  제품명 *
                </label>
                <input
                  type="text"
                  value={editingOrder.productName}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, productName: e.target.value } : null)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  제품 코드 *
                </label>
                <input
                  type="text"
                  value={editingOrder.productCode}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, productCode: e.target.value } : null)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  수량 *
                </label>
                <input
                  type="number"
                  value={editingOrder.quantity}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, quantity: parseInt(e.target.value) || 0 } : null)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  단위
                </label>
                <input
                  type="text"
                  value={editingOrder.unit}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, unit: e.target.value } : null)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  고객사
                </label>
                <input
                  type="text"
                  value={editingOrder.customer}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, customer: e.target.value } : null)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  담당팀
                </label>
                <select
                  value={editingOrder.assignedTeam}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, assignedTeam: e.target.value } : null)}
                  style={inputStyle}
                >
                  <option value="생산팀 A">생산팀 A</option>
                  <option value="생산팀 B">생산팀 B</option>
                  <option value="생산팀 C">생산팀 C</option>
                  <option value="품질관리팀">품질관리팀</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  시작일 *
                </label>
                <input
                  type="date"
                  value={editingOrder.startDate instanceof Date ? editingOrder.startDate.toISOString().split('T')[0] : editingOrder.startDate}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, startDate: new Date(e.target.value) } : null)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  완료 예정일 *
                </label>
                <input
                  type="date"
                  value={editingOrder.dueDate instanceof Date ? editingOrder.dueDate.toISOString().split('T')[0] : editingOrder.dueDate}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, dueDate: new Date(e.target.value) } : null)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  상태
                </label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, status: e.target.value as ProductionOrder["status"] } : null)}
                  style={inputStyle}
                >
                  <option value="planned">계획됨</option>
                  <option value="in-progress">진행중</option>
                  <option value="completed">완료</option>
                  <option value="on-hold">일시정지</option>
                  <option value="cancelled">취소</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  우선순위
                </label>
                <select
                  value={editingOrder.priority}
                  onChange={(e) => setEditingOrder(prev => prev ? { ...prev, priority: e.target.value as ProductionOrder["priority"] } : null)}
                  style={inputStyle}
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                  <option value="urgent">긴급</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                특이사항
              </label>
              <textarea
                value={editingOrder.notes || ""}
                onChange={(e) => setEditingOrder(prev => prev ? { ...prev, notes: e.target.value } : null)}
                style={{
                  ...inputStyle,
                  minHeight: "80px",
                  resize: "vertical"
                }}
                placeholder="특이사항이나 추가 정보를 입력하세요"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={handleCloseEditModal}
                style={secondaryButtonStyle}
              >
                취소
              </button>
              <button
                onClick={handleSaveEditOrder}
                style={primaryButtonStyle}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
