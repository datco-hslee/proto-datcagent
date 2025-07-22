import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Filter, Eye, Edit3, Truck, Package, MapPin, Clock, CheckCircle, AlertCircle, BarChart3, Calendar, Users } from "lucide-react";
import styles from "./ShippingPage.module.css";

interface Shipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  customer: string;
  customerAddress: string;
  status: "preparing" | "shipped" | "transit" | "delivered" | "returned" | "cancelled";
  priority: "standard" | "express" | "urgent";
  carrier: string;
  shippingMethod: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  dimensions: string;
  cost: number;
  destination: string;
  createdDate: string;
}

const mockShipments: Shipment[] = [
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

  const filteredShipments = mockShipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || shipment.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    return <StatusIcon className={styles.statusIcon} />;
  };

  // 통계 계산
  const totalShipments = mockShipments.length;
  const activeShipments = mockShipments.filter((s) => ["shipped", "transit"].includes(s.status)).length;
  const deliveredToday = mockShipments.filter((s) => s.actualDelivery === "2024-01-21").length;
  const totalShippingCost = mockShipments.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>배송 관리</h1>
            <p className={styles.subtitle}>주문 배송 상태를 추적하고 물류를 관리하세요</p>
          </div>
          <Button className={styles.addButton}>
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

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="추적번호, 고객명, 주문번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
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
                  <h3 className={styles.trackingNumber}>{shipment.trackingNumber}</h3>
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
                  <Button variant="ghost" size="sm">
                    <Edit3 className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.customerInfo}>
                  <div className={styles.customerDetail}>
                    <Users className={styles.customerIcon} />
                    <div className={styles.customerData}>
                      <span className={styles.customerName}>{shipment.customer}</span>
                      <span className={styles.orderId}>주문: {shipment.orderId}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.addressInfo}>
                  <MapPin className={styles.addressIcon} />
                  <div className={styles.addressData}>
                    <span className={styles.addressLabel}>배송지</span>
                    <span className={styles.addressValue}>{shipment.customerAddress}</span>
                  </div>
                </div>

                <div className={styles.shipmentDetails}>
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>택배사</span>
                      <span className={styles.detailValue}>{shipment.carrier}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>배송방법</span>
                      <span className={styles.detailValue}>{shipment.shippingMethod}</span>
                    </div>
                  </div>
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>중량</span>
                      <span className={styles.detailValue}>{shipment.weight}kg</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>배송비</span>
                      <span className={styles.detailValue}>{formatCurrency(shipment.cost)}</span>
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
                      <span>{formatCurrency(selectedShipment.cost)}</span>
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
    </div>
  );
};
