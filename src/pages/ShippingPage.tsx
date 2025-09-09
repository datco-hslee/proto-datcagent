import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Filter, Eye, Edit3, Truck, Package, MapPin, Clock, CheckCircle, AlertCircle, BarChart3, Calendar, Users } from "lucide-react";
import styles from "./ShippingPage.module.css";
// Import the ERP data from the JSON file
import erpDataJson from '../../DatcoDemoData2.json';
import { generateMassiveERPData } from '../data/massiveERPData';

interface Shipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  customer: string;
  customerAddress: string;
  status: "preparing" | "shipped" | "transit" | "delivered" | "returned" | "cancelled";
  priority: "standard" | "express" | "urgent";
  carrier: string;
  shippingMethod?: string;
  shippingDate?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: string | number;
  dimensions: string;
  shippingCost?: number;
  cost?: number;
  destination?: string;
  createdDate?: string;
  items?: Array<{
    name: string;
    quantity: number;
    weight: string;
  }>;
  notes?: string;
  // ERP specific fields
  customerCode?: string;
  itemCode?: string;
  itemName?: string;
  shipmentQuantity?: number;
}

// Function to get shipping data from ERP
const getShipmentsFromERPData = (): Shipment[] => {
  try {
    const shippingData = erpDataJson.sheets?.출하 || [];
    const customers = erpDataJson.sheets?.거래처마스터 || [];
    const itemMaster = erpDataJson.sheets?.품목마스터 || [];

    const erpShipments = shippingData.map((shipment: any) => {
      const customer = customers.find((cust: any) => cust.거래처코드 === shipment.거래처코드);
      const item = itemMaster.find((item: any) => item.품목코드 === shipment.품목코드);

      // Map ERP status to internal status
      let status: "preparing" | "shipped" | "transit" | "delivered" | "returned" | "cancelled" = "preparing";
      if (shipment.상태 === "SHIPPED" || shipment.상태 === "출하완료") status = "shipped";
      else if (shipment.상태 === "PLANNED" || shipment.상태 === "계획") status = "preparing";
      else if (shipment.상태 === "TRANSIT" || shipment.상태 === "운송중") status = "transit";
      else if (shipment.상태 === "DELIVERED" || shipment.상태 === "배송완료") status = "delivered";
      else if (shipment.상태 === "CANCELLED" || shipment.상태 === "취소") status = "cancelled";

      // Determine priority based on quantity
      const quantity = shipment.출하수량 || shipment.출하지시수량 || 0;
      let priority: "standard" | "express" | "urgent" = "standard";
      if (quantity > 2000) priority = "urgent";
      else if (quantity > 1000) priority = "express";

      return {
        id: `ERP-${shipment.출하번호}`,
        trackingNumber: `TRK-${shipment.출하번호}`,
        orderId: shipment.수주번호 || shipment.출하번호,
        customer: customer?.거래처명 || "미지정 고객",
        customerAddress: `${customer?.거래처명 || "미지정 고객"} - ${customer?.구분 || "일반"} 거래처`,
        status,
        priority,
        carrier: "한진택배", // Default carrier for ERP data
        shippingMethod: "택배",
        shippingDate: shipment.출하일자 || shipment.출하일 || "2025-09-01",
        estimatedDelivery: shipment.예상도착일 || "2025-09-05",
        actualDelivery: status === "delivered" ? (shipment.출하일자 || shipment.출하일) : undefined,
        weight: `${(quantity * 0.5).toFixed(1)}`, // Estimated weight as string
        dimensions: "40x30x20cm", // Default dimensions
        shippingCost: Math.floor(quantity * 1500), // Estimated shipping cost
        destination: customer?.거래처명?.includes("현대") ? "울산" : customer?.거래처명?.includes("기아") ? "광주" : customer?.거래처명?.includes("제네시스") ? "서울" : "기타 지역",
        createdDate: shipment.출하일자 || shipment.출하일 || "2025-09-01",
        items: [{
          name: item?.품목명 || shipment.품목코드 || shipment.품목,
          quantity: quantity,
          weight: `${(quantity * 0.5).toFixed(1)}kg`
        }],
        notes: `ERP 출하: ${item?.품목명 || shipment.품목코드 || shipment.품목} ${quantity}개`,
        // ERP specific fields
        customerCode: shipment.거래처코드,
        itemCode: shipment.품목코드 || shipment.품목,
        itemName: item?.품목명 || shipment.품목코드 || shipment.품목,
        shipmentQuantity: quantity
      };
    });

    return erpShipments;
  } catch (error) {
    console.error("Error processing ERP shipping data:", error);
    return [];
  }
};

// Function to get massive ERP shipments
const getMassiveERPShipments = (): Shipment[] => {
  try {
    const massiveData = generateMassiveERPData();
    const shipments = massiveData.shipments || [];
    const customers = massiveData.customers || [];
    const salesOrders = massiveData.salesOrders || [];

    return shipments.map((shipment: any) => {
      const customer = customers.find((c: any) => c.id === shipment.customerId);
      const salesOrder = salesOrders.find((so: any) => so.id === shipment.salesOrderId);
      
      // Map massive ERP status to internal status
      let status: "preparing" | "shipped" | "transit" | "delivered" | "returned" | "cancelled" = "preparing";
      if (shipment.status === "delivered") status = "delivered";
      else if (shipment.status === "shipped") status = "shipped";
      else if (shipment.status === "in_transit") status = "transit";
      else if (shipment.status === "cancelled") status = "cancelled";
      else if (shipment.status === "returned") status = "returned";
      
      // Determine priority based on order amount
      const orderAmount = salesOrder?.totalAmount || 0;
      let priority: "standard" | "express" | "urgent" = "standard";
      if (orderAmount > 100000000) priority = "urgent";
      else if (orderAmount > 50000000) priority = "express";
      
      const shippingDate = (() => {
        const date = new Date(shipment.actualShipDate || shipment.plannedShipDate);
        return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
      })();
      
      const estimatedDelivery = (() => {
        const date = new Date(shipment.estimatedDeliveryDate);
        return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
      })();
      
      return {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        orderId: shipment.salesOrderId,
        customer: customer?.contactPerson || "알 수 없는 고객",
        customerAddress: `${customer?.company || "미지정 회사"} - ${customer?.address || "주소 미상"}`,
        status,
        priority,
        carrier: shipment.carrier || "한진택배",
        shippingMethod: shipment.shippingMethod || "택배",
        shippingDate,
        estimatedDelivery,
        actualDelivery: status === "delivered" ? shippingDate : undefined,
        weight: `${shipment.totalWeight || 0}`,
        dimensions: `${shipment.dimensions || "40x30x20cm"}`,
        shippingCost: shipment.shippingCost || 0,
        destination: customer?.address?.split(' ')[0] || "기타 지역",
        createdDate: shippingDate,
        items: shipment.items?.map((item: any) => ({
          name: item.productName,
          quantity: item.quantity,
          weight: `${(item.quantity * 0.5).toFixed(1)}kg`
        })) || [],
        notes: `대량 ERP 출하: ${shipment.items?.map((item: any) => item.productName).join(', ') || '상품'} 배송`,
        customerCode: customer?.id,
        itemCode: shipment.items?.[0]?.productCode,
        itemName: shipment.items?.[0]?.productName,
        shipmentQuantity: shipment.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
      };
    });
  } catch (error) {
    console.error("Error processing massive ERP shipping data:", error);
    return [];
  }
};

// Sample shipment data for comparison
const getSampleShipments = (): Shipment[] => [
  {
    id: "1",
    trackingNumber: "TRK-2024-001",
    orderId: "ORD-2024-015",
    customer: "김철수",
    customerAddress: "서울시 강남구 테헤란로 123",
    status: "delivered",
    priority: "standard",
    carrier: "CJ대한통운",
    shippingMethod: "택배",
    estimatedDelivery: "2024-01-20",
    actualDelivery: "2024-01-19",
    weight: 2.5,
    dimensions: "30x20x15 cm",
    cost: 3500,
    destination: "서울",
    createdDate: "2024-01-18",
  },
  {
    id: "2",
    trackingNumber: "TRK-2024-002",
    orderId: "ORD-2024-016",
    customer: "이영희",
    customerAddress: "부산시 해운대구 센텀중앙로 456",
    status: "transit",
    priority: "express",
    carrier: "한진택배",
    shippingMethod: "당일배송",
    estimatedDelivery: "2024-01-21",
    weight: 1.2,
    dimensions: "25x15x10 cm",
    cost: 5500,
    destination: "부산",
    createdDate: "2024-01-20",
  },
  {
    id: "3",
    trackingNumber: "TRK-2024-003",
    orderId: "ORD-2024-017",
    customer: "박지민",
    customerAddress: "대구시 중구 동성로 789",
    status: "shipped",
    priority: "urgent",
    carrier: "로젠택배",
    shippingMethod: "특급배송",
    estimatedDelivery: "2024-01-22",
    weight: 5.8,
    dimensions: "50x30x25 cm",
    cost: 8500,
    destination: "대구",
    createdDate: "2024-01-19",
  },
  {
    id: "4",
    trackingNumber: "TRK-2024-004",
    orderId: "ORD-2024-018",
    customer: "최민수",
    customerAddress: "인천시 연수구 송도국제도시 101",
    status: "preparing",
    priority: "standard",
    carrier: "CJ대한통운",
    shippingMethod: "택배",
    estimatedDelivery: "2024-01-23",
    weight: 3.2,
    dimensions: "40x25x20 cm",
    cost: 4000,
    destination: "인천",
    createdDate: "2024-01-21",
  },
  {
    id: "5",
    trackingNumber: "TRK-2024-005",
    orderId: "ORD-2024-019",
    customer: "정수현",
    customerAddress: "광주시 서구 상무중앙로 202",
    status: "returned",
    priority: "standard",
    carrier: "한진택배",
    shippingMethod: "택배",
    estimatedDelivery: "2024-01-20",
    weight: 1.8,
    dimensions: "20x15x12 cm",
    cost: 3500,
    destination: "광주",
    createdDate: "2024-01-17",
  },
];

const statusConfig = {
  preparing: { label: "준비중", color: "secondary", icon: Package },
  shipped: { label: "발송완료", color: "default", icon: Truck },
  transit: { label: "배송중", color: "default", icon: Clock },
  delivered: { label: "배송완료", color: "success", icon: CheckCircle },
  returned: { label: "반송", color: "destructive", icon: AlertCircle },
  cancelled: { label: "취소", color: "destructive", icon: AlertCircle },
};

const priorityConfig = {
  standard: { label: "일반", color: "secondary" },
  express: { label: "특급", color: "default" },
  urgent: { label: "긴급", color: "destructive" },
};

export const ShippingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample" | "massive">("erp");
  const [showNewShipmentModal, setShowNewShipmentModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  
  // Get current shipments based on selected data source
  const getCurrentShipments = (): Shipment[] => {
    if (selectedDataSource === "erp") return getShipmentsFromERPData();
    if (selectedDataSource === "massive") return getMassiveERPShipments();
    return getSampleShipments();
  };

  const [shipments, setShipments] = useState<Shipment[]>(getCurrentShipments());
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
    trackingNumber: "",
    orderId: "",
    customer: "",
    customerAddress: "",
    status: "preparing",
    priority: "standard",
    carrier: "",
    shippingMethod: "",
    estimatedDelivery: "",
    weight: 0,
    dimensions: "",
    cost: 0,
    destination: "",
    createdDate: new Date().toISOString().split('T')[0],
  });

  // Update shipments when data source changes
  useEffect(() => {
    setShipments(getCurrentShipments());
  }, [selectedDataSource]);

  const filteredShipments = shipments.filter((shipment: Shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.destination || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || shipment.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "₩0";
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    return <StatusIcon className={styles.statusIcon} />;
  };

  // 신규 배송 등록
  const handleCreateShipment = () => {
    setShowNewShipmentModal(true);
    setEditingShipment(null);
    const newTrackingNumber = `TRK-2024-${String(shipments.length + 1).padStart(3, '0')}`;
    setNewShipment({
      trackingNumber: newTrackingNumber,
      orderId: "",
      customer: "",
      customerAddress: "",
      status: "preparing",
      priority: "standard",
      carrier: "",
      shippingMethod: "",
      estimatedDelivery: "",
      weight: 0,
      dimensions: "",
      cost: 0,
      destination: "",
      createdDate: new Date().toISOString().split('T')[0],
    });
  };

  // 배송 편집
  const handleEditShipment = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setNewShipment(shipment);
    setShowNewShipmentModal(true);
  };

  // 배송 저장
  const handleSaveShipment = () => {
    if (!newShipment.orderId || !newShipment.customer || !newShipment.carrier) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    if (editingShipment) {
      // 편집 모드
      setShipments((prev: Shipment[]) => 
        prev.map((shipment: Shipment) => 
          shipment.id === editingShipment.id 
            ? { ...newShipment, id: editingShipment.id } as Shipment
            : shipment
        )
      );
      alert("배송 정보가 수정되었습니다.");
    } else {
      // 신규 생성 모드
      const newId = String(shipments.length + 1);
      setShipments((prev: Shipment[]) => [...prev, { ...newShipment, id: newId } as Shipment]);
      alert("새로운 배송이 등록되었습니다.");
    }

    setShowNewShipmentModal(false);
    setEditingShipment(null);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowNewShipmentModal(false);
    setEditingShipment(null);
  };

  // 통계 계산
  const totalShipments = shipments.length;
  
  // 추가 통계 계산
  const activeShipments = shipments.filter((s: Shipment) => s.status === "shipped" || s.status === "transit").length;
  const today = new Date().toISOString().split('T')[0];
  const deliveredToday = shipments.filter((s: Shipment) => s.status === "delivered" && s.actualDelivery === today).length;
  const totalShippingCost = shipments.reduce((sum: number, s: Shipment) => sum + (s.shippingCost || s.cost || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>배송 관리</h1>
            <p className={styles.subtitle}>주문 배송 상태를 추적하고 물류를 관리하세요</p>
            <div className={styles.dataSourceBadge}>
              <Badge variant={
                selectedDataSource === "erp" ? "default" : 
                selectedDataSource === "massive" ? "destructive" : "secondary"
              }>
                {selectedDataSource === "erp" ? "닷코 시연 데이터" : 
                 selectedDataSource === "massive" ? "대량 ERP 데이터" : "생성된 샘플 데이터"}
              </Badge>
            </div>
          </div>
          <Button className={styles.addButton} onClick={handleCreateShipment}>
            <Plus className={styles.icon} />
            배송 등록
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 배송</span>
                <span className={styles.statValue}>{totalShipments}건</span>
              </div>
              <div className={styles.statIcon}>
                <Package />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>배송중</span>
                <span className={styles.statValue}>{activeShipments}건</span>
              </div>
              <div className={styles.statIcon}>
                <Truck />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>오늘 배송완료</span>
                <span className={styles.statValue}>{deliveredToday}건</span>
              </div>
              <div className={styles.statIcon}>
                <CheckCircle />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 배송비</span>
                <span className={styles.statValue}>{formatCurrency(totalShippingCost)}</span>
              </div>
              <div className={styles.statIcon}>
                <BarChart3 />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <Input
              type="text"
              placeholder="배송번호, 고객명, 주문번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterGroup}>
            {/* <label className={styles.filterLabel}>데이터 소스</label> */}
            <select 
              value={selectedDataSource} 
              onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample" | "massive")}
              className={styles.filterSelect}
            >
              <option value="erp">닷코 시연 데이터</option>
              <option value="sample">생성된 샘플 데이터</option>
              <option value="massive">대량 ERP 데이터</option>
            </select>
            
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 상태</option>
              <option value="preparing">준비중</option>
              <option value="shipped">발송완료</option>
              <option value="transit">배송중</option>
              <option value="delivered">배송완료</option>
              <option value="returned">반송</option>
              <option value="cancelled">취소</option>
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 우선순위</option>
              <option value="standard">일반</option>
              <option value="express">특급</option>
              <option value="urgent">긴급</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.shipmentsGrid}>
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className={styles.shipmentCard}>
              <div className={styles.cardHeader}>
                <div className={styles.shipmentInfo}>
                  <h3 className={styles.trackingNumber}>출하번호: {shipment.id.replace('ERP-', '')}</h3>
                  <div className={styles.shipmentMeta}>
                    <Badge variant={statusConfig[shipment.status]?.color as any} className={styles.statusBadge}>
                      {getStatusIcon(shipment.status)}
                      {statusConfig[shipment.status]?.label}
                    </Badge>
                    <Badge variant={priorityConfig[shipment.priority]?.color as any} className={styles.priorityBadge}>
                      {priorityConfig[shipment.priority]?.label}
                    </Badge>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedShipment(shipment)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditShipment(shipment)}>
                    <Edit3 className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.customerInfo}>
                  <div className={styles.customerDetail}>
                    <Users className={styles.customerIcon} />
                    <div className={styles.customerData}>
                      <span className={styles.customerName}>품목: {shipment.itemName || shipment.itemCode}</span>
                      <span className={styles.orderId}>수주번호: {shipment.orderId}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.addressInfo}>
                  <MapPin className={styles.addressIcon} />
                  <div className={styles.addressData}>
                    <span className={styles.addressLabel}>출하지시수량</span>
                    <span className={styles.addressValue}>{shipment.shipmentQuantity?.toLocaleString() || 0}개</span>
                  </div>
                </div>

                <div className={styles.shipmentDetails}>
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>운송사</span>
                      <span className={styles.detailValue}>{selectedDataSource === 'erp' ? '로지스' : shipment.carrier}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>출하일</span>
                      <span className={styles.detailValue}>{shipment.shippingDate}</span>
                    </div>
                  </div>
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>고객</span>
                      <span className={styles.detailValue}>{shipment.customer}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>배송비</span>
                      <span className={styles.detailValue}>{formatCurrency(shipment.cost || shipment.shippingCost)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.deliveryInfo}>
                  <Calendar className={styles.deliveryIcon} />
                  <div className={styles.deliveryData}>
                    <div className={styles.deliveryItem}>
                      <span className={styles.deliveryLabel}>예상 배송일</span>
                      <span className={styles.deliveryValue}>{shipment.estimatedDelivery}</span>
                    </div>
                    {shipment.actualDelivery && (
                      <div className={styles.deliveryItem}>
                        <span className={styles.deliveryLabel}>실제 배송일</span>
                        <span className={styles.deliveryValue}>{shipment.actualDelivery}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedShipment && (
        <div className={styles.modal} onClick={() => setSelectedShipment(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>배송 상세 정보</h2>
              <Button variant="ghost" onClick={() => setSelectedShipment(null)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.shipmentHeader}>
                <div className={styles.shipmentMainInfo}>
                  <h3>{selectedShipment.trackingNumber}</h3>
                  <div className={styles.shipmentBadges}>
                    <Badge variant={statusConfig[selectedShipment.status]?.color as any}>{statusConfig[selectedShipment.status]?.label}</Badge>
                    <Badge variant={priorityConfig[selectedShipment.priority]?.color as any}>
                      {priorityConfig[selectedShipment.priority]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className={styles.modalDetailsGrid}>
                <div className={styles.modalDetailSection}>
                  <h4>주문 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>주문번호:</span>
                      <span>{selectedShipment.orderId}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>고객명:</span>
                      <span>{selectedShipment.customer}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>목적지:</span>
                      <span>{selectedShipment.destination}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>배송 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>택배사:</span>
                      <span>{selectedShipment.carrier}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>배송방법:</span>
                      <span>{selectedShipment.shippingMethod}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>배송비:</span>
                      <span>{formatCurrency(selectedShipment.cost || selectedShipment.shippingCost)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>패키지 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>중량:</span>
                      <span>{selectedShipment.weight}kg</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>크기:</span>
                      <span>{selectedShipment.dimensions}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>배송 일정</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>발송일:</span>
                      <span>{selectedShipment.createdDate}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>예상 배송일:</span>
                      <span>{selectedShipment.estimatedDelivery}</span>
                    </div>
                    {selectedShipment.actualDelivery && (
                      <div className={styles.modalDetailRow}>
                        <span>실제 배송일:</span>
                        <span className={styles.actualDelivery}>{selectedShipment.actualDelivery}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.addressSection}>
                <h4>배송 주소</h4>
                <div className={styles.fullAddress}>{selectedShipment.customerAddress}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showNewShipmentModal && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingShipment ? "배송 정보 수정" : "신규 배송 등록"}
              </h2>
              <Button variant="ghost" onClick={handleCloseModal} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>추적번호</label>
                  <Input
                    value={newShipment.trackingNumber || ""}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    placeholder="추적번호"
                    disabled
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>주문번호 *</label>
                  <Input
                    value={newShipment.orderId || ""}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, orderId: e.target.value }))}
                    placeholder="주문번호를 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>고객명 *</label>
                  <Input
                    value={newShipment.customer || ""}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="고객명을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>배송지 주소</label>
                  <Input
                    value={newShipment.customerAddress || ""}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, customerAddress: e.target.value }))}
                    placeholder="배송지 주소를 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>택배사 *</label>
                  <select
                    value={newShipment.carrier || ""}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, carrier: e.target.value }))}
                    className={styles.formSelect}
                  >
                    <option value="">택배사 선택</option>
                    <option value="CJ대한통운">CJ대한통운</option>
                    <option value="한진택배">한진택배</option>
                    <option value="로젠택배">로젠택배</option>
                    <option value="우체국택배">우체국택배</option>
                    <option value="롯데택배">롯데택배</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>배송방법</label>
                  <select
                    value={newShipment.shippingMethod || ""}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, shippingMethod: e.target.value }))}
                    className={styles.formSelect}
                  >
                    <option value="">배송방법 선택</option>
                    <option value="택배">택배</option>
                    <option value="당일배송">당일배송</option>
                    <option value="특급배송">특급배송</option>
                    <option value="새벽배송">새벽배송</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>상태</label>
                  <select
                    value={newShipment.status || "preparing"}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, status: e.target.value as any }))}
                    className={styles.formSelect}
                  >
                    <option value="preparing">준비중</option>
                    <option value="shipped">발송완료</option>
                    <option value="transit">배송중</option>
                    <option value="delivered">배송완료</option>
                    <option value="returned">반송</option>
                    <option value="cancelled">취소</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>우선순위</label>
                  <select
                    value={newShipment.priority || "standard"}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, priority: e.target.value as any }))}
                    className={styles.formSelect}
                  >
                    <option value="standard">일반</option>
                    <option value="express">특급</option>
                    <option value="urgent">긴급</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>중량 (kg)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newShipment.weight || 0}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    placeholder="중량을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>크기</label>
                  <Input
                    value={newShipment.dimensions || ""}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, dimensions: e.target.value }))}
                    placeholder="예: 30x20x15 cm"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>배송비 (원)</label>
                  <Input
                    type="number"
                    min="0"
                    value={newShipment.cost || 0}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                    placeholder="배송비를 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>목적지</label>
                  <Input
                    value={newShipment.destination || ""}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="목적지를 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>예상 배송일</label>
                  <Input
                    type="date"
                    value={newShipment.estimatedDelivery || ""}
                    onChange={(e) => setNewShipment(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <Button variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
                <Button onClick={handleSaveShipment}>
                  {editingShipment ? "수정" : "등록"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
