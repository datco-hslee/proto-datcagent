import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Filter, Eye, Edit3, Trash2, Building2, Phone, Mail, MapPin, Star, TrendingUp, Package } from "lucide-react";
import styles from "./SuppliersPage.module.css";
// Import the ERP data from the JSON file
import erpDataJson from '../../DatcoDemoData2.json';
import { generateMassiveERPData } from '../data/massiveERPData';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  status: "active" | "inactive" | "pending";
  totalOrders: number;
  totalAmount: number;
  lastOrderDate: string;
  paymentTerms: string;
  leadTime: number;
  // ERP 데이터 추가 필드
  supplierCode?: string;
  creditRating?: string;
  incoterms?: string;
}

// ERP 데이터에서 거래처 정보 추출 (공급사만)
const getSuppliersFromERPData = (): Supplier[] => {
  try {
    if (!erpDataJson || !erpDataJson.sheets) {
      console.warn("ERP 데이터가 없습니다. 빈 배열을 반환합니다.");
      return [];
    }

    const suppliers = erpDataJson.sheets?.거래처마스터?.filter((item: any) => item.구분 === '공급사') || [];
    const purchaseOrders = erpDataJson.sheets?.구매발주 || [];

    if (!Array.isArray(suppliers)) {
      console.warn("거래처마스터 데이터가 배열이 아닙니다.");
      return [];
    }
    
    return suppliers.map((supplier: any) => {
      // 해당 공급업체의 구매 주문 정보 집계
      const supplierOrders = Array.isArray(purchaseOrders) 
        ? purchaseOrders.filter((po: any) => po.공급업체코드 === supplier.거래처코드)
        : [];
      const totalOrders = supplierOrders.length;
      const totalAmount = supplierOrders.reduce((sum: number, po: any) => sum + (po.총금액 || 0), 0);
      const lastOrder = supplierOrders.length > 0 
        ? supplierOrders.sort((a: any, b: any) => new Date(b.발주일자).getTime() - new Date(a.발주일자).getTime())[0]
        : null;
      
      // 0.5 단위로 별점 생성
      const generateERPRating = (): number => {
        const baseRating = 3 + Math.random() * 2; // 3-5 범위
        return Math.round(baseRating * 2) / 2; // 0.5 단위로 반올림
      };
      
      return {
        id: supplier.거래처코드,
        supplierCode: supplier.거래처코드,
        name: supplier.거래처명,
        contact: supplier.담당자 || "담당자",
        email: `${supplier.거래처코드.toLowerCase()}@${supplier.거래처명.replace(/\s+/g, '').toLowerCase()}.com`,
        phone: supplier.전화번호 || "02-1234-5678",
        address: supplier.주소 || "서울시 강남구",
        category: supplier.업종 || "제조업",
        rating: generateERPRating(),
        status: "active" as const,
        totalOrders: totalOrders,
        totalAmount: totalAmount,
        lastOrderDate: lastOrder ? new Date(lastOrder.발주일자).toISOString().split('T')[0] : "2024-01-01",
        leadTime: supplier.리드타임일 || 7,
        paymentTerms: supplier.결제조건 || "월말 결제",
        creditRating: supplier.신용등급 || "A",
        incoterms: supplier.인코텀즈 || "DDP"
      };
    });
  } catch (error) {
    console.error("ERP 데이터 로딩 오류:", error);
    return [];
  }
};

// 대량 ERP 데이터에서 공급업체 정보 추출
const getMassiveERPSuppliers = (): Supplier[] => {
  try {
    const massiveData = generateMassiveERPData();
    const suppliers = massiveData.suppliers || [];
    const purchaseOrders = massiveData.purchaseOrders || [];
    
    return suppliers.map((supplier: any) => {
      // 해당 공급업체의 구매 주문 정보 집계
      const supplierOrders = purchaseOrders.filter((po: any) => po.supplierId === supplier.id);
      const totalOrders = supplierOrders.length;
      const totalAmount = supplierOrders.reduce((sum: number, po: any) => sum + (po.totalAmount || 0), 0);
      const lastOrder = supplierOrders.length > 0 
        ? supplierOrders.sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0]
        : null;
      
      // 공급업체 신뢰도에 따른 등급 매핑 (0.5 단위로 제한)
      const generateRating = (min: number, max: number): number => {
        const range = (max - min) * 2; // 0.5 단위로 변환
        const randomStep = Math.floor(Math.random() * (range + 1));
        return Math.min(5, Math.max(0, min + (randomStep * 0.5)));
      };
      
      const ratingMap = {
        'high': generateRating(4.0, 5.0),
        'medium': generateRating(3.0, 4.5),
        'low': generateRating(2.0, 3.5)
      };
      
      return {
        id: supplier.id,
        supplierCode: supplier.id,
        name: supplier.name,
        contact: "담당자",
        email: `${supplier.id.toLowerCase().replace('-', '')}@${supplier.name.replace(/\s+/g, '').toLowerCase()}.com`,
        phone: "02-" + Math.floor(Math.random() * 9000 + 1000) + "-" + Math.floor(Math.random() * 9000 + 1000),
        address: "서울시 " + ["강남구", "서초구", "송파구", "영등포구", "마포구"][Math.floor(Math.random() * 5)],
        category: ["제조업", "유통업", "서비스업", "IT업"][Math.floor(Math.random() * 4)],
        rating: ratingMap[supplier.reliability as keyof typeof ratingMap] || 3.0,
        status: "active" as const,
        totalOrders: totalOrders,
        totalAmount: totalAmount,
        lastOrderDate: lastOrder ? new Date(lastOrder.orderDate).toISOString().split('T')[0] : "2024-01-01",
        leadTime: supplier.leadTime || 7,
        paymentTerms: "30일 후 지급",
        creditRating: supplier.reliability === 'high' ? 'A+' : supplier.reliability === 'medium' ? 'A' : 'B+'
      };
    });
  } catch (error) {
    console.error("Error processing massive ERP supplier data:", error);
    return [];
  }
};

// 샘플 데이터 (기존 하드코딩 데이터)
const getSampleSuppliers = (): Supplier[] => [
  {
    id: "1",
    name: "㈜테크부품",
    contact: "김철수",
    email: "sales@techparts.co.kr",
    phone: "02-123-4567",
    address: "서울시 강남구 테헤란로 123",
    category: "전자부품",
    rating: 4.5,
    status: "active",
    totalOrders: 45,
    totalAmount: 12500000,
    lastOrderDate: "2024-01-15",
    paymentTerms: "월말 결제",
    leadTime: 7,
  },
  {
    id: "2",
    name: "글로벌머티리얼",
    contact: "이영희",
    email: "order@globalmaterial.com",
    phone: "031-987-6543",
    address: "경기도 성남시 분당구 판교로 456",
    category: "원재료",
    rating: 4.0,
    status: "active",
    totalOrders: 32,
    totalAmount: 8200000,
    lastOrderDate: "2024-01-16",
    paymentTerms: "현금 결제",
    leadTime: 10,
  },
  {
    id: "3",
    name: "스마트솔루션",
    contact: "박지민",
    email: "contact@smartsol.kr",
    phone: "02-555-7890",
    address: "서울시 마포구 월드컵북로 789",
    category: "소프트웨어",
    rating: 5.0,
    status: "active",
    totalOrders: 18,
    totalAmount: 15600000,
    lastOrderDate: "2024-01-17",
    paymentTerms: "선금 결제",
    leadTime: 14,
  },
  {
    id: "4",
    name: "프리미엄공급",
    contact: "최민수",
    email: "sales@premium.co.kr",
    phone: "051-222-3333",
    address: "부산시 해운대구 센텀중앙로 101",
    category: "사무용품",
    rating: 4.0,
    status: "active",
    totalOrders: 67,
    totalAmount: 5400000,
    lastOrderDate: "2024-01-10",
    paymentTerms: "월말 결제",
    leadTime: 5,
  },
  {
    id: "5",
    name: "인더스트리얼파츠",
    contact: "정수현",
    email: "info@industrial.kr",
    phone: "032-777-8888",
    address: "인천시 연수구 송도국제도시 202",
    category: "기계부품",
    rating: 4.0,
    status: "pending",
    totalOrders: 12,
    totalAmount: 3200000,
    lastOrderDate: "2024-01-18",
    paymentTerms: "현금 결제",
    leadTime: 21,
  },
];

const statusConfig = {
  active: { label: "활성", color: "success" },
  inactive: { label: "비활성", color: "secondary" },
  pending: { label: "검토중", color: "default" },
};

export const SuppliersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample" | "massive">("erp");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  
  // 데이터 소스에 따른 공급업체 목록 가져오기
  const getCurrentSuppliers = (): Supplier[] => {
    return selectedDataSource === "erp" ? getSuppliersFromERPData() : selectedDataSource === "massive" ? getMassiveERPSuppliers() : getSampleSuppliers();
  };
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(getCurrentSuppliers());
  
  // 데이터 소스 변경 시 공급업체 목록 업데이트
  useEffect(() => {
    setSuppliers(getCurrentSuppliers());
  }, [selectedDataSource]);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    rating: 0,
    status: "pending",
    totalOrders: 0,
    totalAmount: 0,
    lastOrderDate: "",
    paymentTerms: "",
    leadTime: 0,
  });

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // 신규 공급업체 생성
  const handleCreateSupplier = () => {
    setShowNewSupplierModal(true);
    setEditingSupplier(null);
    setNewSupplier({
      name: "",
      contact: "",
      email: "",
      phone: "",
      address: "",
      category: "",
      rating: 0,
      status: "pending",
      totalOrders: 0,
      totalAmount: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
      paymentTerms: "",
      leadTime: 0,
    });
  };

  // 공급업체 편집
  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier(supplier);
    setShowNewSupplierModal(true);
  };

  // 공급업체 삭제
  const handleDeleteSupplier = (supplierId: string) => {
    if (confirm("정말로 이 공급업체를 삭제하시겠습니까?")) {
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
      alert("공급업체가 삭제되었습니다.");
    }
  };

  // 공급업체 저장
  const handleSaveSupplier = () => {
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.email || !newSupplier.category) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    if (editingSupplier) {
      // 편집 모드
      setSuppliers(prev => 
        prev.map(supplier => 
          supplier.id === editingSupplier.id 
            ? { ...newSupplier, id: editingSupplier.id } as Supplier
            : supplier
        )
      );
      alert("공급업체 정보가 수정되었습니다.");
    } else {
      // 신규 생성 모드
      const newId = String(suppliers.length + 1);
      setSuppliers(prev => [...prev, { ...newSupplier, id: newId } as Supplier]);
      alert("새로운 공급업체가 등록되었습니다.");
    }

    setShowNewSupplierModal(false);
    setEditingSupplier(null);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowNewSupplierModal(false);
    setEditingSupplier(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    // 0.5 단위로 반올림
    const normalizedRating = Math.round(rating * 2) / 2;
    
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      let starClass = styles.star;
      
      if (normalizedRating >= starValue) {
        // 완전히 채워진 별
        starClass += ` ${styles.starFilled}`;
      } else if (normalizedRating > starValue - 1 && normalizedRating < starValue) {
        // 반만 채워진 별 (예: 4.5일 때 5번째 별이 반별)
        starClass += ` ${styles.starHalf}`;
      }
      
      return <Star key={i} className={starClass} />;
    });
  };

  const categories = [...new Set(suppliers.map((s) => s.category))];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>공급업체 관리</h1>
            <p className={styles.subtitle}>공급업체 정보를 관리하고 성과를 모니터링하세요</p>
            <div className={styles.dataSourceBadge}>
              <Badge variant={selectedDataSource === "erp" ? "default" : selectedDataSource === "massive" ? "destructive" : "secondary"}>
                {selectedDataSource === "erp" ? "닷코 시연 데이터" : 
                 selectedDataSource === "massive" ? "대량 ERP 데이터" : "생성된 샘플 데이터"}
              </Badge>
            </div>
          </div>
          <Button className={styles.addButton} onClick={handleCreateSupplier}>
            <Plus className={styles.addIcon} />
            신규 공급업체
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 공급업체</span>
                <span className={styles.statValue}>{suppliers.length}개</span>
              </div>
              <div className={styles.statIcon}>
                <Building2 />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>활성 공급업체</span>
                <span className={styles.statValue}>{suppliers.filter((s) => s.status === "active").length}개</span>
              </div>
              <div className={styles.statIcon}>
                <TrendingUp />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>평균 평점</span>
                <span className={styles.statValue}>{suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1) : '0.0'}</span>
              </div>
              <div className={styles.statIcon}>
                <Star />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="공급업체명, 담당자명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            {/* 데이터 소스 선택 */}
            <select 
              value={selectedDataSource} 
              onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample" | "massive")}
              className={styles.filterSelect}
              style={{ marginRight: '10px' }}
            >
              <option value="erp">닷코 시연 데이터</option>
              <option value="sample">생성된 샘플 데이터</option>
              <option value="massive">대량 ERP 데이터</option>
            </select>
            
            <Filter className={styles.filterIcon} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")} className={styles.filterSelect}>
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">검토중</option>
            </select>

            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 카테고리</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.suppliersGrid}>
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className={styles.supplierCard}>
              <div className={styles.cardHeader}>
                <div className={styles.supplierInfo}>
                  <h3 className={styles.supplierName}>{supplier.name}</h3>
                  <div className={styles.statusSection}>
                    <Badge variant={statusConfig[supplier.status]?.color as any} className={styles.statusBadge}>
                      {statusConfig[supplier.status]?.label}
                    </Badge>
                    <div className={styles.rating}>
                      {renderStars(supplier.rating)}
                      <span className={styles.ratingValue}>{supplier.rating}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSupplier(supplier)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(supplier)}>
                    <Edit3 className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSupplier(supplier.id)}>
                    <Trash2 className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.contactInfo}>
                  <div className={styles.contactItem}>
                    <Phone className={styles.contactIcon} />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <Mail className={styles.contactIcon} />
                    <span>{supplier.email}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <MapPin className={styles.contactIcon} />
                    <span>{supplier.address}</span>
                  </div>
                </div>

                <div className={styles.businessInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>카테고리</span>
                    <span className={styles.infoValue}>{supplier.category}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>담당자</span>
                    <span className={styles.infoValue}>{supplier.contact}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>리드타임</span>
                    <span className={styles.infoValue}>{supplier.leadTime}일</span>
                  </div>
                </div>

                <div className={styles.performanceInfo}>
                  <div className={styles.performanceItem}>
                    <Package className={styles.performanceIcon} />
                    <div className={styles.performanceData}>
                      <span className={styles.performanceLabel}>총 주문</span>
                      <span className={styles.performanceValue}>{supplier.totalOrders}건</span>
                    </div>
                  </div>
                  <div className={styles.performanceItem}>
                    <TrendingUp className={styles.performanceIcon} />
                    <div className={styles.performanceData}>
                      <span className={styles.performanceLabel}>거래액</span>
                      <span className={styles.performanceValue}>{formatCurrency(supplier.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedSupplier && (
        <div className={styles.modal} onClick={() => setSelectedSupplier(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>공급업체 상세 정보</h2>
              <Button variant="ghost" onClick={() => setSelectedSupplier(null)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>기본 정보</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailRow}>
                    <span>업체명:</span>
                    <span>{selectedSupplier.name}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>담당자:</span>
                    <span>{selectedSupplier.contact}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>카테고리:</span>
                    <span>{selectedSupplier.category}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>상태:</span>
                    <Badge variant={statusConfig[selectedSupplier.status]?.color as any}>{statusConfig[selectedSupplier.status]?.label}</Badge>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>연락처 정보</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailRow}>
                    <span>전화번호:</span>
                    <span>{selectedSupplier.phone}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>이메일:</span>
                    <span>{selectedSupplier.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>주소:</span>
                    <span>{selectedSupplier.address}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>거래 정보</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailRow}>
                    <span>평점:</span>
                    <div className={styles.ratingDetail}>
                      {renderStars(selectedSupplier.rating)}
                      <span>{selectedSupplier.rating}</span>
                    </div>
                  </div>
                  <div className={styles.detailRow}>
                    <span>총 주문 건수:</span>
                    <span>{selectedSupplier.totalOrders}건</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>총 거래액:</span>
                    <span className={styles.totalAmount}>{formatCurrency(selectedSupplier.totalAmount)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>결제 조건:</span>
                    <span>{selectedSupplier.paymentTerms}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>리드타임:</span>
                    <span>{selectedSupplier.leadTime}일</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>최근 주문일:</span>
                    <span>{selectedSupplier.lastOrderDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showNewSupplierModal && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingSupplier ? "공급업체 수정" : "신규 공급업체 등록"}
              </h2>
              <Button variant="ghost" onClick={handleCloseModal} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>업체명 *</label>
                  <Input
                    value={newSupplier.name || ""}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="업체명을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>담당자 *</label>
                  <Input
                    value={newSupplier.contact || ""}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="담당자명을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>이메일 *</label>
                  <Input
                    type="email"
                    value={newSupplier.email || ""}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>전화번호</label>
                  <Input
                    value={newSupplier.phone || ""}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>주소</label>
                  <Input
                    value={newSupplier.address || ""}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="주소를 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>카테고리 *</label>
                  <select
                    value={newSupplier.category || ""}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, category: e.target.value }))}
                    className={styles.formSelect}
                  >
                    <option value="">카테고리 선택</option>
                    <option value="전자부품">전자부품</option>
                    <option value="원재료">원재료</option>
                    <option value="소프트웨어">소프트웨어</option>
                    <option value="사무용품">사무용품</option>
                    <option value="기계부품">기계부품</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>평점</label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={newSupplier.rating || 0}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                    placeholder="평점 (0-5)"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>상태</label>
                  <select
                    value={newSupplier.status || "pending"}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, status: e.target.value as any }))}
                    className={styles.formSelect}
                  >
                    <option value="pending">검토중</option>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>결제 조건</label>
                  <Input
                    value={newSupplier.paymentTerms || ""}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    placeholder="결제 조건을 입력하세요"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>리드타임 (일)</label>
                  <Input
                    type="number"
                    min="0"
                    value={newSupplier.leadTime || 0}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, leadTime: parseInt(e.target.value) || 0 }))}
                    placeholder="리드타임을 입력하세요"
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <Button variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
                <Button onClick={handleSaveSupplier}>
                  {editingSupplier ? "수정" : "등록"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
