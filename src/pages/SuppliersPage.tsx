import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Filter, Eye, Edit3, Trash2, Building2, Phone, Mail, MapPin, Star, TrendingUp, Package } from "lucide-react";
import styles from "./SuppliersPage.module.css";
// Import the ERP data from the JSON file
import erpDataJson from '../../DatcoDemoData2.json';

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

// ERP 데이터에서 거래처 정보 추출 (공급사 + 고객사)
const getSuppliersFromERPData = (companyTypeFilter: string = "all"): Supplier[] => {
  try {
    if (!erpDataJson || !erpDataJson.sheets) {
      console.warn("ERP 데이터가 없습니다. 빈 배열을 반환합니다.");
      return [];
    }

    const suppliers = erpDataJson.sheets?.거래처마스터?.filter((item: any) => item.구분 === '공급사') || [];
    const purchaseOrders = erpDataJson.sheets?.구매발주 || [];
    const itemMaster = erpDataJson.sheets?.품목마스터 || [];
    const arData = erpDataJson.sheets['회계(AR_AP)']?.filter((item: any) => item.구분 === '매입채무') || [];

    if (!Array.isArray(suppliers)) {
      console.warn("거래처마스터 데이터가 배열이 아닙니다.");
      return [];
    }

    // 회사 유형에 따른 필터링
    const filteredSuppliers = suppliers.filter((supplier: any) => {
      if (companyTypeFilter === "all") return true;
      if (companyTypeFilter === "supplier") return supplier.구분 === "공급사";
      if (companyTypeFilter === "customer") return supplier.구분 === "고객사";
      return true;
    });
    
    return filteredSuppliers.map((supplier: any) => {
      // 해당 공급업체의 구매 주문 정보 집계
      const supplierOrders = Array.isArray(purchaseOrders) 
        ? purchaseOrders.filter((po: any) => po.공급업체코드 === supplier.거래처코드)
        : [];
      const totalOrders = supplierOrders.length;
      const totalAmount = supplierOrders.reduce((sum: number, po: any) => sum + (po.총금액 || 0), 0);
      const lastOrder = supplierOrders.length > 0 
        ? supplierOrders.sort((a: any, b: any) => new Date(b.발주일자).getTime() - new Date(a.발주일자).getTime())[0]
        : null;
      
      return {
        id: `ERP-${supplier.거래처코드}`,
        supplierCode: supplier.거래처코드,
        name: supplier.거래처명 || "공급업체명 없음",
        contact: "담당자",
        email: `${(supplier.거래처코드 || 'supplier').toLowerCase()}@company.com`,
        phone: "02-1234-5678",
        address: "서울시 강남구",
        category: "제조업",
        rating: Math.min(5, Math.max(1, Math.floor(Math.random() * 5) + 1)),
        status: "active",
        totalOrders: totalOrders,
        totalAmount: totalAmount,
        lastOrderDate: lastOrder ? lastOrder.발주일자 : "2024-01-01",
        leadTime: supplier.납기리드타임일 || 7,
        paymentTerms: supplier.결제조건 || "30D",
        creditRating: supplier.신용등급 || "A",
        incoterms: supplier.인코텀즈 || "DDP"
      };
    });
  } catch (error) {
    console.error("ERP 데이터 로딩 오류:", error);
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
    rating: 4.8,
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
    rating: 4.5,
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
    rating: 4.9,
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
    rating: 4.2,
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
    rating: 3.8,
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // 데이터 소스에 따른 공급업체 목록 가져오기
  const getCurrentSuppliers = (): Supplier[] => {
    return selectedDataSource === "erp" ? getSuppliersFromERPData(companyTypeFilter) : getSampleSuppliers();
  };
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(getCurrentSuppliers());
  
  // 데이터 소스 또는 회사 유형 변경 시 공급업체 목록 업데이트
  useEffect(() => {
    setSuppliers(getCurrentSuppliers());
  }, [selectedDataSource, companyTypeFilter]);
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
    return Array.from({ length: 5 }, (_, i) => <Star key={i} className={`${styles.star} ${i < Math.floor(rating) ? styles.starFilled : ""}`} />);
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
              <Badge variant={selectedDataSource === "erp" ? "default" : "secondary"}>
                {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
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
              onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")}
              className={styles.filterSelect}
              style={{ marginRight: '10px' }}
            >
              <option value="erp">닷코 시연 데이터</option>
              <option value="sample">생성된 샘플 데이터</option>
            </select>

            {/* 회사 유형 필터 (ERP 데이터일 때만 표시) */}
            {selectedDataSource === "erp" && (
              <select 
                value={companyTypeFilter} 
                onChange={(e) => setCompanyTypeFilter(e.target.value)}
                className={styles.filterSelect}
                style={{ marginRight: '10px' }}
              >
                <option value="all">모든 거래처</option>
                <option value="supplier">공급사</option>
                <option value="customer">고객사</option>
              </select>
            )}
            
            <Filter className={styles.filterIcon} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
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
