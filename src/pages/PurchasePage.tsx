import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Eye, Edit3, Trash2, Package, CheckCircle, Clock, AlertCircle } from "lucide-react";
import styles from "./PurchasePage.module.css";
import erpDataJson from '../../DatcoDemoData2.json';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierEmail: string;
  supplierCode?: string;
  itemCode?: string;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  items: number;
  totalAmount: number;
  status: "draft" | "sent" | "confirmed" | "received" | "cancelled";
  orderDate: string;
  deliveryDate: string;
  description: string;
  priority: "high" | "medium" | "low";
  unit?: string;
}

// ERP 데이터에서 구매 주문 추출 함수
const getPurchaseOrdersFromERPData = () => {
  const purchaseOrders = erpDataJson.sheets?.구매발주 || [];
  const suppliers = erpDataJson.sheets?.거래처마스터 || [];
  const itemMaster = erpDataJson.sheets?.품목마스터 || [];

  const erpPurchaseOrders = purchaseOrders.map((po: any) => {
    const supplier = suppliers.find((sup: any) => sup.거래처코드 === po.거래처코드);
    const item = itemMaster.find((item: any) => item.품목코드 === po.품목코드);
    
    const quantity = po.발주수량 || 0;
    const unitPrice = po.단가 || item?.표준단가 || 0;
    const totalAmount = po.발주금액 || (quantity * unitPrice);
    
    // 상태 매핑
    let status: "draft" | "sent" | "confirmed" | "received" | "cancelled" = "confirmed";
    if (po.상태 === "발주완료" || po.상태 === "CONFIRMED") status = "confirmed";
    else if (po.상태 === "DRAFT") status = "draft";
    else if (po.상태 === "SENT") status = "sent";
    else if (po.상태 === "RECEIVED") status = "received";
    else if (po.상태 === "CANCELLED") status = "cancelled";

    return {
      id: `ERP-${po.발주번호}`,
      poNumber: po.발주번호,
      supplier: supplier?.거래처명 || "미지정 공급사",
      supplierEmail: `${supplier?.거래처코드 || 'unknown'}@supplier.com`,
      supplierCode: po.거래처코드,
      itemCode: po.품목코드,
      itemName: item?.품목명 || po.품목코드,
      quantity: quantity,
      unitPrice: unitPrice,
      unit: item?.단위 || "EA",
      items: 1, // ERP 데이터에서는 품목별로 개별 발주
      totalAmount,
      status,
      orderDate: po.발주일자 || "2025-09-01",
      deliveryDate: po.납기일자 || "2025-09-15",
      description: `${item?.품목명 || po.품목코드} ${quantity}${item?.단위 || 'EA'} 구매`,
      priority: (totalAmount > 10000000 ? "high" : totalAmount > 5000000 ? "medium" : "low") as "high" | "medium" | "low"
    };
  });

  return erpPurchaseOrders;
};

// 생성된 샘플 데이터
const getGeneratedPurchaseOrders = (): PurchaseOrder[] => [
  {
    id: "1",
    poNumber: "PO-2024-001",
    supplier: "테크 서플라이",
    supplierEmail: "orders@techsupply.co.kr",
    items: 5,
    totalAmount: 2500000,
    status: "confirmed",
    orderDate: "2024-03-15",
    deliveryDate: "2024-03-25",
    description: "전자부품 일괄 구매",
    priority: "high"
  },
  {
    id: "2",
    poNumber: "PO-2024-002",
    supplier: "글로벌머티리얼",
    supplierEmail: "order@globalmaterial.com",
    items: 3,
    totalAmount: 1200000,
    status: "sent",
    orderDate: "2024-03-16",
    deliveryDate: "2024-03-22",
    description: "원재료 구매",
    priority: "medium"
  },
  {
    id: "3",
    poNumber: "PO-2024-003",
    supplier: "스마트솔루션",
    supplierEmail: "contact@smartsol.kr",
    items: 8,
    totalAmount: 4800000,
    status: "draft",
    orderDate: "2024-01-17",
    deliveryDate: "2024-01-30",
    description: "소프트웨어 라이선스",
    priority: "high"
  },
  {
    id: "4",
    poNumber: "PO-2024-004",
    supplier: "프리미엄공급",
    supplierEmail: "sales@premium.co.kr",
    items: 12,
    totalAmount: 3600000,
    status: "received",
    orderDate: "2024-01-10",
    deliveryDate: "2024-01-20",
    description: "사무용품 일괄구매",
    priority: "low"
  },
  {
    id: "5",
    poNumber: "PO-2024-005",
    supplier: "인더스트리얼파츠",
    supplierEmail: "info@industrial.kr",
    items: 6,
    totalAmount: 5200000,
    status: "cancelled",
    orderDate: "2024-01-18",
    deliveryDate: "2024-01-28",
    description: "기계부품 교체",
    priority: "medium"
  }
];

const statusConfig = {
  draft: { label: "작성중", color: "secondary", icon: Edit3 },
  sent: { label: "발송됨", color: "default", icon: Clock },
  confirmed: { label: "확정됨", color: "success", icon: CheckCircle },
  received: { label: "입고완료", color: "success", icon: Package },
  cancelled: { label: "취소됨", color: "destructive", icon: AlertCircle },
};

export const PurchasePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [newOrder, setNewOrder] = useState<Partial<PurchaseOrder>>({
    poNumber: "",
    supplier: "",
    supplierEmail: "",
    items: 0,
    totalAmount: 0,
  });

  // 현재 데이터 소스에 따른 구매 주문 가져오기
  const getCurrentOrders = () => {
    return selectedDataSource === "erp" ? getPurchaseOrdersFromERPData() : getGeneratedPurchaseOrders();
  };

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(getCurrentOrders());

  // 데이터 소스 변경 시 구매 주문 업데이트
  React.useEffect(() => {
    setPurchaseOrders(getCurrentOrders());
  }, [selectedDataSource]);

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) || order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 신규 구매 주문 생성
  const handleCreateOrder = () => {
    setShowNewOrderModal(true);
    setEditingOrder(null);
    setNewOrder({
      poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier: "",
      supplierEmail: "",
      items: 0,
      totalAmount: 0,
    });
  };

  // 구매 주문 편집
  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setNewOrder(order);
    setShowNewOrderModal(true);
  };

  // 구매 주문 삭제
  const handleDeleteOrder = (orderId: string) => {
    if (confirm("정말로 이 구매 주문을 삭제하시겠습니까?")) {
      setPurchaseOrders(prev => prev.filter(order => order.id !== orderId));
      alert("구매 주문이 삭제되었습니다.");
    }
  };

  // 구매 주문 저장
  const handleSaveOrder = () => {
    if (!newOrder.supplier || !newOrder.supplierEmail) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    if (editingOrder) {
      // 편집 모드
      setPurchaseOrders(prev => 
        prev.map(order => 
          order.id === editingOrder.id 
            ? { ...newOrder, id: editingOrder.id } as PurchaseOrder
            : order
        )
      );
      alert("구매 주문이 수정되었습니다.");
    } else {
      // 신규 생성 모드
      const newId = String(purchaseOrders.length + 1);
      setPurchaseOrders(prev => [...prev, { ...newOrder, id: newId } as PurchaseOrder]);
      alert("새로운 구매 주문이 생성되었습니다.");
    }

    setShowNewOrderModal(false);
    setEditingOrder(null);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowNewOrderModal(false);
    setEditingOrder(null);
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    return <StatusIcon className={styles.statusIcon} />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>구매 관리</h1>
            <p className={styles.pageDescription}>구매 주문을 관리하고 추적합니다</p>
            <div className={styles.dataSourceBadge}>
              <Badge variant={selectedDataSource === "erp" ? "default" : "secondary"}>
                {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
              </Badge>
            </div>
          </div>
        </div>
        <Button className={styles.addButton} onClick={handleCreateOrder}>
          <Plus className={styles.icon} />
          신규 구매 주문
        </Button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={20} />
          <Input
            type="text"
            placeholder="구매 주문 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterControls}>
          <select
            value={selectedDataSource}
            onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")}
            className={styles.filterSelect}
          >
            <option value="erp">닷코 시연 데이터</option>
            <option value="sample">생성된 샘플 데이터</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">모든 상태</option>
            <option value="draft">작성중</option>
            <option value="sent">발송됨</option>
            <option value="confirmed">확정됨</option>
            <option value="received">입고완료</option>
            <option value="cancelled">취소됨</option>
          </select>
          <Button onClick={handleCreateOrder} className={styles.addButton}>
            <Plus size={20} />
            신규 주문
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.ordersGrid}>
          {filteredOrders.map((order) => (
            <Card key={order.id} className={styles.orderCard}>
              <div className={styles.cardHeader}>
                <div className={styles.orderInfo}>
                  <h3 className={styles.orderNumber}>{order.poNumber}</h3>
                  <Badge variant={statusConfig[order.status]?.color as any} className={styles.statusBadge}>
                    {getStatusIcon(order.status)}
                    {statusConfig[order.status]?.label}
                  </Badge>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)}>
                    <Edit3 className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order.id)}>
                    <Trash2 className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.supplierInfo}>
                  <h4 className={styles.supplierName}>{order.supplier}</h4>
                  <p className={styles.supplierEmail}>{order.supplierEmail}</p>
                </div>

                <div className={styles.orderDetails}>
                  {order.itemName && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>품목명</span>
                      <span className={styles.detailValue}>{order.itemName}</span>
                    </div>
                  )}
                  {order.quantity && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>발주수량</span>
                      <span className={styles.detailValue}>{order.quantity.toLocaleString()}{order.unit}</span>
                    </div>
                  )}
                  {order.unitPrice && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>단가</span>
                      <span className={styles.detailValue}>{formatCurrency(order.unitPrice)}</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>총 금액</span>
                    <span className={styles.detailValue}>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                <div className={styles.dateInfo}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>주문일</span>
                    <span className={styles.dateValue}>{order.orderDate}</span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>예정일</span>
                    <span className={styles.dateValue}>{order.deliveryDate}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <div className={styles.modal} onClick={() => setSelectedOrder(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>구매 주문 상세</h2>
              <Button variant="ghost" onClick={() => setSelectedOrder(null)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>주문 정보</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailRow}>
                    <span>발주번호:</span>
                    <span>{selectedOrder.poNumber}</span>
                  </div>
                  {selectedOrder.supplierCode && (
                    <div className={styles.detailRow}>
                      <span>공급사:</span>
                      <span>{selectedOrder.supplierCode}</span>
                    </div>
                  )}
                  {selectedOrder.itemCode && (
                    <div className={styles.detailRow}>
                      <span>품목코드:</span>
                      <span>{selectedOrder.itemCode}</span>
                    </div>
                  )}
                  <div className={styles.detailRow}>
                    <span>상태:</span>
                    <Badge variant={statusConfig[selectedOrder.status]?.color as any}>{statusConfig[selectedOrder.status]?.label}</Badge>
                  </div>
                  <div className={styles.detailRow}>
                    <span>발주일자:</span>
                    <span>{selectedOrder.orderDate}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>납기일자:</span>
                    <span>{selectedOrder.deliveryDate}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>공급업체 정보</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailRow}>
                    <span>업체명:</span>
                    <span>{selectedOrder.supplier}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>이메일:</span>
                    <span>{selectedOrder.supplierEmail}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>설명:</span>
                    <span>{selectedOrder.description}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>주문 상세</h3>
                <div className={styles.detailGrid}>
                  {selectedOrder.itemName && (
                    <div className={styles.detailRow}>
                      <span>품목명:</span>
                      <span>{selectedOrder.itemName}</span>
                    </div>
                  )}
                  {selectedOrder.quantity && (
                    <div className={styles.detailRow}>
                      <span>발주수량:</span>
                      <span>{selectedOrder.quantity.toLocaleString()}{selectedOrder.unit}</span>
                    </div>
                  )}
                  {selectedOrder.unitPrice && (
                    <div className={styles.detailRow}>
                      <span>단가:</span>
                      <span>{formatCurrency(selectedOrder.unitPrice)}</span>
                    </div>
                  )}
                  <div className={styles.detailRow}>
                    <span>발주금액:</span>
                    <span className={styles.totalAmount}>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 신규/편집 구매 주문 모달 */}
      {showNewOrderModal && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingOrder ? "구매 주문 편집" : "신규 구매 주문"}
              </h2>
              <Button variant="ghost" onClick={handleCloseModal} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>주문번호</label>
                  <Input
                    value={newOrder.poNumber || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, poNumber: e.target.value }))}
                    placeholder="PO-2024-001"
                    disabled={!!editingOrder}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>거래처코드</label>
                  <Input
                    value={newOrder.supplierCode || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, supplierCode: e.target.value }))}
                    placeholder="SUP001"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>공급업체명 *</label>
                  <Input
                    value={newOrder.supplier || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="공급업체명을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>품목코드</label>
                  <Input
                    value={newOrder.itemCode || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, itemCode: e.target.value }))}
                    placeholder="RM-UHSS"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>품목명</label>
                  <Input
                    value={newOrder.itemName || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder="품목명을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>설명</label>
                  <Input
                    value={newOrder.description || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="구매 주문 설명을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>우선순위</label>
                  <select
                    value={newOrder.priority || "medium"}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, priority: e.target.value as PurchaseOrder["priority"] }))}
                    className={styles.formSelect}
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>발주수량</label>
                  <Input
                    type="number"
                    value={newOrder.quantity || 0}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>단위</label>
                  <Input
                    value={newOrder.unit || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="EA, KG, M 등"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>단가 (원)</label>
                  <Input
                    type="number"
                    value={newOrder.unitPrice || 0}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, unitPrice: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>발주금액 (원)</label>
                  <Input
                    type="number"
                    value={newOrder.totalAmount || 0}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, totalAmount: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>주문일</label>
                  <Input
                    type="date"
                    value={newOrder.orderDate || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, orderDate: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>납기일자</label>
                  <Input
                    type="date"
                    value={newOrder.deliveryDate || ""}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>상태</label>
                  <select
                    value={newOrder.status || "draft"}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, status: e.target.value as PurchaseOrder["status"] }))}
                    className={styles.formSelect}
                  >
                    <option value="draft">작성중</option>
                    <option value="sent">발송됨</option>
                    <option value="confirmed">발주완료</option>
                    <option value="received">입고완료</option>
                    <option value="cancelled">취소됨</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <Button variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
                <Button onClick={handleSaveOrder}>
                  {editingOrder ? "수정" : "생성"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
