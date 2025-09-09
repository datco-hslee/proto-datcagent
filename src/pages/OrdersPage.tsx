import { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, Edit, Package, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import erpDataJson from '../../DatcoDemoData2.json';
import { generateMassiveERPData } from '../data/massiveERPData';

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
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample" | "massive">("erp");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 새 주문 폼 상태
  const [newOrderForm, setNewOrderForm] = useState({
    customer: "",
    company: "",
    status: "대기중" as Order["status"],
    priority: "보통" as Order["priority"],
    orderDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    totalAmount: "",
    items: "",
    representative: "",
  });

  // 편집 주문 폼 상태
  const [editOrderForm, setEditOrderForm] = useState({
    customer: "",
    company: "",
    status: "대기중",
    priority: "보통",
    orderDate: "",
    dueDate: "",
    totalAmount: "",
    items: "",
    representative: "",
    progress: "",
  });

  // 고급 필터 상태
  const [advancedFilters, setAdvancedFilters] = useState({
    company: "",
    representative: "",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
    minProgress: "",
    maxProgress: "",
  });

  // ERP 데이터에서 주문 정보 추출
  const getERPOrders = (): Order[] => {
    const salesOrders = erpDataJson.sheets.수주 || [];
    const customers = erpDataJson.sheets.거래처마스터?.filter((item: any) => item.구분 === '고객사') || [];
    const itemMaster = erpDataJson.sheets.품목마스터 || [];

    return salesOrders.map((order, index) => {
      const customer = customers.find(c => c.거래처코드 === order.거래처코드);
      const item = itemMaster.find(i => i.품목코드 === order.품목코드);
      
      // 상태 계산 (수주일자와 납기일자 기반)
      const orderDate = new Date(order.수주일자);
      const dueDate = new Date(order.납기일자);
      const today = new Date();
      
      let status: Order["status"];
      let progress: number;
      
      if (order.상태 === "확정") {
        if (dueDate < today) {
          status = "완료";
          progress = 100;
        } else if (orderDate <= today && today <= dueDate) {
          status = "진행중";
          const totalDays = (dueDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          const passedDays = (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          progress = Math.min(Math.max(Math.round((passedDays / totalDays) * 100), 0), 100);
        } else {
          status = "대기중";
          progress = 0;
        }
      } else {
        status = "취소";
        progress = 0;
      }
      
      // 우선순위 계산 (주문 금액 기반)
      const priority: Order["priority"] = order.수주금액 >= 100000000 ? "높음" : 
                                        order.수주금액 >= 50000000 ? "보통" : "낮음";

      return {
        id: order.수주번호,
        orderNumber: order.수주번호,
        customer: customer ? customer.거래처명 : "알 수 없음",
        company: customer ? customer.거래처명 : "알 수 없음",
        status,
        priority,
        orderDate: order.수주일자,
        dueDate: order.납기일자,
        totalAmount: order.수주금액,
        items: order.수주수량,
        representative: "영업팀",
        progress
      };
    });
  };

  // 샘플 주문 데이터
  const getSampleOrders = (): Order[] => {
    return [
      {
        id: "SAMPLE-001",
        orderNumber: "PO-SAMPLE-001",
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
        id: "SAMPLE-002",
        orderNumber: "PO-SAMPLE-002",
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
        id: "SAMPLE-003",
        orderNumber: "PO-SAMPLE-003",
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
      }
    ];
  };

  // 대량 ERP 데이터에서 주문 정보 추출
  const getMassiveERPOrders = (): Order[] => {
    const massiveData = generateMassiveERPData();
    const salesOrders = massiveData.salesOrders || [];
    const customers = massiveData.customers || [];

    return salesOrders.map((order: any) => {
      const customer = customers.find((c: any) => c.id === order.customerId);
      
      // 상태 계산 (주문일자와 납기일자 기반)
      const orderDate = new Date(order.orderDate);
      const dueDate = new Date(order.dueDate);
      const today = new Date();
      
      let status: Order["status"];
      let progress: number;
      
      if (order.status === "confirmed") {
        if (dueDate < today) {
          status = "완료";
          progress = 100;
        } else if (orderDate <= today && today <= dueDate) {
          status = "진행중";
          const totalDays = (dueDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          const passedDays = (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          progress = Math.min(Math.max(Math.round((passedDays / totalDays) * 100), 0), 100);
        } else {
          status = "대기중";
          progress = 0;
        }
      } else {
        status = "취소";
        progress = 0;
      }
      
      // 우선순위 계산 (주문 금액 기반)
      const priority: Order["priority"] = order.totalAmount >= 100000000 ? "높음" : 
                                        order.totalAmount >= 50000000 ? "보통" : "낮음";

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: customer ? customer.contactPerson : "알 수 없음",
        company: customer ? customer.company : "알 수 없음",
        status,
        priority,
        orderDate: (() => {
          const date = new Date(order.orderDate);
          return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
        })(),
        dueDate: (() => {
          const date = new Date(order.requestedDeliveryDate || order.confirmedDeliveryDate);
          return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
        })(),
        totalAmount: order.totalAmount,
        items: order.items?.length || 1,
        representative: "영업팀",
        progress
      };
    });
  };

  // 현재 선택된 데이터 소스에 따른 주문 목록
  const getCurrentOrders = (): Order[] => {
    if (selectedDataSource === "erp") {
      return getERPOrders();
    } else if (selectedDataSource === "massive") {
      return getMassiveERPOrders();
    } else {
      return getSampleOrders();
    }
  };

  // 데이터 소스 변경 시 주문 목록 업데이트
  useEffect(() => {
    // 데이터 소스가 변경되면 현재 주문 목록을 업데이트
    setCurrentPage(1); // 데이터 소스 변경 시 첫 페이지로 이동
  }, [selectedDataSource]);

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, advancedFilters]);

  // 버튼 핸들러들
  const handleAdvancedFilter = () => {
    setShowAdvancedFilter(true);
  };

  const applyAdvancedFilters = () => {
    setShowAdvancedFilter(false);
    alert('고급 필터가 적용되었습니다.');
  };

  const resetOrderFilters = () => {
    setAdvancedFilters({
      company: "",
      representative: "",
      minAmount: "",
      maxAmount: "",
      dateFrom: "",
      dateTo: "",
      minProgress: "",
      maxProgress: "",
    });
    setSelectedStatus("전체");
    setSelectedPriority("전체");
    setSearchTerm("");
  };

  const handleExport = () => {
    // CSV 헤더 정의
    const headers = [
      '주문번호',
      '고객명',
      '회사명',
      '상태',
      '우선순위',
      '주문일',
      '납기일',
      '총 금액',
      '아이템 수',
      '담당자',
      '진행률'
    ];

    // 주문 데이터를 CSV 형식으로 변환
    const csvData = filteredOrders.map(order => [
      order.orderNumber,
      order.customer,
      order.company,
      order.status,
      order.priority,
      order.orderDate,
      order.dueDate,
      order.totalAmount.toLocaleString(),
      order.items.toString(),
      order.representative,
      `${order.progress}%`
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
      link.setAttribute('download', `주문목록_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`${filteredOrders.length}개의 주문 데이터가 CSV 파일로 내보내졌습니다.`);
    } else {
      alert('파일 다운로드가 지원되지 않는 브라우저입니다.');
    }
  };

  const handleCreateOrder = () => {
    setShowCreateOrder(true);
  };

  const createNewOrder = () => {
    if (!newOrderForm.customer || !newOrderForm.company || !newOrderForm.dueDate) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const newOrder: Order = {
      id: `ORD-${String(allOrders.length + 1).padStart(3, '0')}`,
      orderNumber: `PO-2024-${String(allOrders.length + 1).padStart(3, '0')}`,
      customer: newOrderForm.customer,
      company: newOrderForm.company,
      status: newOrderForm.status,
      priority: newOrderForm.priority,
      orderDate: newOrderForm.orderDate,
      dueDate: newOrderForm.dueDate,
      totalAmount: parseInt(newOrderForm.totalAmount) || 0,
      items: parseInt(newOrderForm.items) || 1,
      representative: newOrderForm.representative,
      progress: 0,
    };

    setOrders([...orders, newOrder]);
    setShowCreateOrder(false);
    setNewOrderForm({
      customer: "",
      company: "",
      status: "대기중",
      priority: "보통",
      orderDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      totalAmount: "",
      items: "",
      representative: "",
    });
    alert('새 주문이 성공적으로 생성되었습니다.');
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditOrderForm({
      customer: order.customer,
      company: order.company,
      status: order.status,
      priority: order.priority,
      orderDate: order.orderDate,
      dueDate: order.dueDate,
      totalAmount: order.totalAmount.toString(),
      items: order.items.toString(),
      representative: order.representative,
      progress: order.progress.toString(),
    });
  };

  const updateOrder = () => {
    if (!editingOrder) return;
    
    if (!editOrderForm.customer || !editOrderForm.company || !editOrderForm.dueDate) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const updatedOrder: Order = {
      ...editingOrder,
      customer: editOrderForm.customer,
      company: editOrderForm.company,
      status: editOrderForm.status as Order["status"],
      priority: editOrderForm.priority as Order["priority"],
      orderDate: editOrderForm.orderDate,
      dueDate: editOrderForm.dueDate,
      totalAmount: parseInt(editOrderForm.totalAmount) || 0,
      items: parseInt(editOrderForm.items) || 1,
      representative: editOrderForm.representative,
      progress: parseInt(editOrderForm.progress) || 0,
    };

    setOrders(orders.map(order => 
      order.id === editingOrder.id ? updatedOrder : order
    ));
    
    setEditingOrder(null);
    alert('주문이 성공적으로 수정되었습니다.');
  };

  const handleShippingManagement = (order: Order) => {
    alert(`${order.orderNumber} 주문의 배송을 관리합니다.`);
  };

  const closeModals = () => {
    setShowAdvancedFilter(false);
    setShowCreateOrder(false);
    setEditingOrder(null);
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

  // 샘플 데이터를 state로 변환 (새 주문 추가용)
  const [orders, setOrders] = useState<Order[]>([]);

  // 현재 주문 목록 가져오기
  const currentOrders = getCurrentOrders();
  const allOrders = [...currentOrders, ...orders]; // ERP/샘플 데이터 + 사용자 추가 데이터
  
  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "전체" || order.status === selectedStatus;
    const matchesPriority = selectedPriority === "전체" || order.priority === selectedPriority;
    
    // 고급 필터 적용
    const matchesCompany = !advancedFilters.company || 
      order.company.toLowerCase().includes(advancedFilters.company.toLowerCase());
    const matchesRepresentative = !advancedFilters.representative || 
      order.representative.toLowerCase().includes(advancedFilters.representative.toLowerCase());
    const matchesProgress = (!advancedFilters.minProgress || order.progress >= parseInt(advancedFilters.minProgress)) &&
      (!advancedFilters.maxProgress || order.progress <= parseInt(advancedFilters.maxProgress));
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCompany && matchesRepresentative && matchesProgress;
  });

  // 페이지네이션 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status === "대기중").length,
    inProgress: allOrders.filter((o) => o.status === "진행중").length,
    completed: allOrders.filter((o) => o.status === "완료").length,
  };

  const exportToCSV = () => {
    const csvData = filteredOrders.map(order => ({
      '주문번호': order.orderNumber,
      '고객명': order.customer,
      '회사명': order.company,
      '상태': order.status,
      '우선순위': order.priority,
      '주문일자': order.orderDate,
      '납기일자': order.dueDate,
      '주문금액': order.totalAmount.toLocaleString(),
      '품목수': order.items,
      '담당자': order.representative,
      '진행률': `${order.progress}%`
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${selectedDataSource}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...headerStyle }}>
        <div>
          <h1 style={titleStyle}>주문 관리</h1>
          <p style={subtitleStyle}>주문 현황을 실시간으로 모니터링하고 관리하세요</p>
        </div>
        {/* 데이터 소스 표시 배지 */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: "500",
            backgroundColor: selectedDataSource === "erp" ? "#dbeafe" : 
                             selectedDataSource === "sample" ? "#fef3c7" : "#f0fdf4",
            color: selectedDataSource === "erp" ? "#1e40af" : 
                   selectedDataSource === "sample" ? "#d97706" : "#16a34a",
            border: `1px solid ${selectedDataSource === "erp" ? "#93c5fd" : 
                                 selectedDataSource === "sample" ? "#fcd34d" : "#bbf7d0"}`,
            marginTop: "0.75rem",
          }}
        >
          {selectedDataSource === "erp" ? "닷코 시연 데이터" : 
             selectedDataSource === "sample" ? "생성된 샘플 데이터" : "대량 ERP 데이터"}
        </div>
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
          {/* 데이터 소스 선택 */}
          <select
            value={selectedDataSource}
            onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample" | "massive")}
            style={{
              ...filterSelectStyle,
              minWidth: "200px",
              marginRight: "0.5rem"
            }}
          >
            <option value="erp">닷코 시연 데이터</option>
            <option value="sample">생성된 샘플 데이터</option>
            <option value="massive">대량 ERP 데이터</option>
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
          <button style={secondaryButtonStyle} onClick={handleAdvancedFilter}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            고급 필터
          </button>
          <button style={secondaryButtonStyle} onClick={handleExport}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            내보내기
          </button>
          <button style={primaryButtonStyle} onClick={handleCreateOrder}>
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
            {paginatedOrders.map((order) => (
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
                    <button style={actionButtonStyle} title="편집" onClick={() => handleEditOrder(order)}>
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="배송관리" onClick={() => handleShippingManagement(order)}>
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
        총 {filteredOrders.length}개의 주문 중 {paginatedOrders.length}개가 표시됨 (전체 {allOrders.length}개 중)
      </div>

      {/* Pagination Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '1.5rem',
        gap: '1rem'
      }}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={currentPage === 1 ? {...secondaryButtonStyle, cursor: 'not-allowed', opacity: 0.5} : secondaryButtonStyle}
        >
          이전
        </button>
        <span style={{fontSize: '0.875rem', fontWeight: 500}}>
          페이지 {currentPage} / {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? {...secondaryButtonStyle, cursor: 'not-allowed', opacity: 0.5} : secondaryButtonStyle}
        >
          다음
        </button>
      </div>

      {/* 모달들 */}
      {showAdvancedFilter && (
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>담당자</label>
                    <input
                      type="text"
                      value={advancedFilters.representative}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, representative: e.target.value})}
                      placeholder="담당자명으로 검색..."
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
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>주문일 (시작)</label>
                    <input
                      type="date"
                      value={advancedFilters.dateFrom}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>주문일 (끝)</label>
                    <input
                      type="date"
                      value={advancedFilters.dateTo}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
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
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최소 진행률 (%)</label>
                    <input
                      type="number"
                      value={advancedFilters.minProgress}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, minProgress: e.target.value})}
                      placeholder="0"
                      min="0"
                      max="100"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최대 진행률 (%)</label>
                    <input
                      type="number"
                      value={advancedFilters.maxProgress}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, maxProgress: e.target.value})}
                      placeholder="100"
                      min="0"
                      max="100"
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
                
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button
                    onClick={resetOrderFilters}
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

      {showCreateOrder && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>새 주문 생성</h2>
              <button style={closeButtonStyle} onClick={closeModals}>
                ×
              </button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    고객명 *
                  </label>
                  <input
                    type="text"
                    value={newOrderForm.customer}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="고객명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    회사명 *
                  </label>
                  <input
                    type="text"
                    value={newOrderForm.company}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="회사명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    상태
                  </label>
                  <select
                    value={newOrderForm.status}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, status: e.target.value as Order["status"] }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem"
                    }}
                  >
                    <option value="대기중">대기중</option>
                    <option value="진행중">진행중</option>
                    <option value="완료">완료</option>
                    <option value="취소">취소</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    우선순위
                  </label>
                  <select
                    value={newOrderForm.priority}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, priority: e.target.value as Order["priority"] }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem"
                    }}
                  >
                    <option value="낮음">낮음</option>
                    <option value="보통">보통</option>
                    <option value="높음">높음</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    주문일
                  </label>
                  <input
                    type="date"
                    value={newOrderForm.orderDate}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, orderDate: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    납기일 *
                  </label>
                  <input
                    type="date"
                    value={newOrderForm.dueDate}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem"
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    총 금액
                  </label>
                  <input
                    type="number"
                    value={newOrderForm.totalAmount}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="총 금액을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    아이템 수
                  </label>
                  <input
                    type="number"
                    value={newOrderForm.items}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, items: e.target.value }))}
                    placeholder="아이템 수를 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#374151" }}>
                    담당자
                  </label>
                  <input
                    type="text"
                    value={newOrderForm.representative}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, representative: e.target.value }))}
                    placeholder="담당자명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  onClick={closeModals}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    background: "white",
                    color: "#64748b",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  취소
                </button>
                <button
                  onClick={createNewOrder}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    color: "white",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  주문 생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingOrder && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{editingOrder.orderNumber} 편집</h2>
              <button style={closeButtonStyle} onClick={closeModals}>
                ×
              </button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
                    고객명 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editOrderForm.customer}
                    onChange={(e) => setEditOrderForm({...editOrderForm, customer: e.target.value})}
                    placeholder="고객명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      transition: "border-color 0.2s",
                      outline: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
                    회사명 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editOrderForm.company}
                    onChange={(e) => setEditOrderForm({...editOrderForm, company: e.target.value})}
                    placeholder="회사명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      transition: "border-color 0.2s",
                      outline: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>상태</label>
                  <select
                    value={editOrderForm.status}
                    onChange={(e) => setEditOrderForm({...editOrderForm, status: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      backgroundColor: "white",
                      outline: "none",
                    }}
                  >
                    <option value="대기중">대기중</option>
                    <option value="진행중">진행중</option>
                    <option value="완료">완료</option>
                    <option value="취소">취소</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>우선순위</label>
                  <select
                    value={editOrderForm.priority}
                    onChange={(e) => setEditOrderForm({...editOrderForm, priority: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      backgroundColor: "white",
                      outline: "none",
                    }}
                  >
                    <option value="낮음">낮음</option>
                    <option value="보통">보통</option>
                    <option value="높음">높음</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>주문일</label>
                  <input
                    type="date"
                    value={editOrderForm.orderDate}
                    onChange={(e) => setEditOrderForm({...editOrderForm, orderDate: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
                    납기일 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={editOrderForm.dueDate}
                    onChange={(e) => setEditOrderForm({...editOrderForm, dueDate: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>총 금액</label>
                  <input
                    type="number"
                    value={editOrderForm.totalAmount}
                    onChange={(e) => setEditOrderForm({...editOrderForm, totalAmount: e.target.value})}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>아이템 수</label>
                  <input
                    type="number"
                    value={editOrderForm.items}
                    onChange={(e) => setEditOrderForm({...editOrderForm, items: e.target.value})}
                    placeholder="1"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>진행률 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editOrderForm.progress}
                    onChange={(e) => setEditOrderForm({...editOrderForm, progress: e.target.value})}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>담당자</label>
                <input
                  type="text"
                  value={editOrderForm.representative}
                  onChange={(e) => setEditOrderForm({...editOrderForm, representative: e.target.value})}
                  placeholder="담당자명을 입력하세요"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  onClick={closeModals}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                    color: "#6b7280",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  취소
                </button>
                <button
                  onClick={updateOrder}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
                >
                  수정 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
