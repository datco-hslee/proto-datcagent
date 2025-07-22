import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Filter, Eye, Edit3, Trash2, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import styles from "./PurchasePage.module.css";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  supplierEmail: string;
  items: number;
  totalAmount: number;
  status: "draft" | "sent" | "confirmed" | "received" | "cancelled";
  orderDate: string;
  expectedDate: string;
  category: string;
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-001",
    supplier: "㈜테크부품",
    supplierEmail: "sales@techparts.co.kr",
    items: 5,
    totalAmount: 2500000,
    status: "confirmed",
    orderDate: "2024-01-15",
    expectedDate: "2024-01-25",
    category: "전자부품",
  },
  {
    id: "2",
    poNumber: "PO-2024-002",
    supplier: "글로벌머티리얼",
    supplierEmail: "order@globalmaterial.com",
    items: 3,
    totalAmount: 1200000,
    status: "sent",
    orderDate: "2024-01-16",
    expectedDate: "2024-01-22",
    category: "원재료",
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
    expectedDate: "2024-01-30",
    category: "소프트웨어",
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
    expectedDate: "2024-01-20",
    category: "사무용품",
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
    expectedDate: "2024-01-28",
    category: "기계부품",
  },
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
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const filteredOrders = mockPurchaseOrders.filter((order) => {
    const matchesSearch =
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) || order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <h1 className={styles.title}>구매 관리</h1>
            <p className={styles.subtitle}>구매 주문을 생성하고 관리하세요</p>
          </div>
          <Button className={styles.addButton}>
            <Plus className={styles.icon} />
            신규 구매 주문
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 주문 금액</span>
                <span className={styles.statValue}>₩17,300,000</span>
              </div>
              <div className={styles.statIcon}>
                <Package />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>진행 중인 주문</span>
                <span className={styles.statValue}>3건</span>
              </div>
              <div className={styles.statIcon}>
                <Truck />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>이번 달 입고</span>
                <span className={styles.statValue}>12건</span>
              </div>
              <div className={styles.statIcon}>
                <CheckCircle />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="주문번호, 공급업체명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 상태</option>
              <option value="draft">작성중</option>
              <option value="sent">발송됨</option>
              <option value="confirmed">확정됨</option>
              <option value="received">입고완료</option>
              <option value="cancelled">취소됨</option>
            </select>
          </div>
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
                  <Button variant="ghost" size="sm">
                    <Edit3 className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm">
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
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>주문 품목</span>
                    <span className={styles.detailValue}>{order.items}개</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>총 금액</span>
                    <span className={styles.detailValue}>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>카테고리</span>
                    <span className={styles.detailValue}>{order.category}</span>
                  </div>
                </div>

                <div className={styles.dateInfo}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>주문일</span>
                    <span className={styles.dateValue}>{order.orderDate}</span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>예정일</span>
                    <span className={styles.dateValue}>{order.expectedDate}</span>
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
                    <span>주문번호:</span>
                    <span>{selectedOrder.poNumber}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>상태:</span>
                    <Badge variant={statusConfig[selectedOrder.status]?.color as any}>{statusConfig[selectedOrder.status]?.label}</Badge>
                  </div>
                  <div className={styles.detailRow}>
                    <span>주문일:</span>
                    <span>{selectedOrder.orderDate}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>예정일:</span>
                    <span>{selectedOrder.expectedDate}</span>
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
                    <span>카테고리:</span>
                    <span>{selectedOrder.category}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>주문 요약</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailRow}>
                    <span>총 품목 수:</span>
                    <span>{selectedOrder.items}개</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>총 금액:</span>
                    <span className={styles.totalAmount}>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
