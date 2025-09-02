import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit3,
  FileText,
  Calculator,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Receipt,
  Trash2,
} from "lucide-react";
import styles from "./TaxPage.module.css";

interface TaxDocument {
  id: string;
  type: "tax_invoice" | "cash_receipt" | "vat_return" | "income_tax";
  documentNumber: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerBusinessNumber: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: "issued" | "sent" | "confirmed" | "cancelled" | "overdue";
  category: string;
  description: string;
  issuedBy: string;
}

const mockTaxDocuments: TaxDocument[] = [
  {
    id: "1",
    type: "tax_invoice",
    documentNumber: "TAX-2024-001",
    issueDate: "2024-01-20",
    dueDate: "2024-02-20",
    customerName: "(주)테크노솔루션",
    customerBusinessNumber: "123-45-67890",
    amount: 1000000,
    vatAmount: 100000,
    totalAmount: 1100000,
    status: "confirmed",
    category: "용역",
    description: "IT 컨설팅 서비스",
    issuedBy: "김세무",
  },
  {
    id: "2",
    type: "tax_invoice",
    documentNumber: "TAX-2024-002",
    issueDate: "2024-01-21",
    dueDate: "2024-02-21",
    customerName: "디지털마케팅(주)",
    customerBusinessNumber: "234-56-78901",
    amount: 2000000,
    vatAmount: 200000,
    totalAmount: 2200000,
    status: "sent",
    category: "상품",
    description: "소프트웨어 라이센스",
    issuedBy: "이세무",
  },
  {
    id: "3",
    type: "cash_receipt",
    documentNumber: "CR-2024-001",
    issueDate: "2024-01-19",
    dueDate: "2024-01-19",
    customerName: "개인고객",
    customerBusinessNumber: "890-12-34567",
    amount: 500000,
    vatAmount: 50000,
    totalAmount: 550000,
    status: "issued",
    category: "서비스",
    description: "개인 컨설팅",
    issuedBy: "박세무",
  },
  {
    id: "4",
    type: "vat_return",
    documentNumber: "VAT-2024-Q1",
    issueDate: "2024-01-15",
    dueDate: "2024-01-25",
    customerName: "국세청",
    customerBusinessNumber: "000-00-00000",
    amount: 5000000,
    vatAmount: 500000,
    totalAmount: 500000,
    status: "overdue",
    category: "부가세신고",
    description: "2024년 1분기 부가세 신고",
    issuedBy: "최세무",
  },
  {
    id: "5",
    type: "tax_invoice",
    documentNumber: "TAX-2024-003",
    issueDate: "2024-01-22",
    dueDate: "2024-02-22",
    customerName: "스마트팩토리(주)",
    customerBusinessNumber: "345-67-89012",
    amount: 3000000,
    vatAmount: 300000,
    totalAmount: 3300000,
    status: "cancelled",
    category: "제조",
    description: "자동화 장비 공급",
    issuedBy: "정세무",
  },
];

const typeConfig = {
  tax_invoice: { label: "세금계산서", color: "default", icon: FileText },
  cash_receipt: { label: "현금영수증", color: "secondary", icon: Receipt },
  vat_return: { label: "부가세신고", color: "default", icon: Calculator },
  income_tax: { label: "소득세신고", color: "secondary", icon: Building },
};

const statusConfig = {
  issued: { label: "발행완료", color: "default", icon: FileText },
  sent: { label: "전송완료", color: "default", icon: CheckCircle },
  confirmed: { label: "승인완료", color: "success", icon: CheckCircle },
  cancelled: { label: "취소", color: "destructive", icon: AlertCircle },
  overdue: { label: "기한초과", color: "destructive", icon: Clock },
};

export const TaxPage: React.FC = () => {
  const [documents, setDocuments] = useState<TaxDocument[]>(mockTaxDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<TaxDocument | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<TaxDocument | null>(null);
  const [formData, setFormData] = useState<Partial<TaxDocument>>({});

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    const TypeIcon = typeConfig[type as keyof typeof typeConfig]?.icon || FileText;
    return <TypeIcon className={styles.typeIcon} />;
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    return <StatusIcon className={styles.statusIcon} />;
  };

  // 통계 계산
  const totalDocuments = documents.length;
  const totalAmount = documents.reduce((sum, doc) => sum + doc.totalAmount, 0);
  const totalVat = documents.reduce((sum, doc) => sum + doc.vatAmount, 0);
  const overdueCount = documents.filter((doc) => doc.status === "overdue").length;

  const handleCreateTaxInvoice = () => {
    setFormData({
      type: 'tax_invoice',
      status: 'issued',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 0,
      vatAmount: 0,
      totalAmount: 0
    });
    setShowCreateModal(true);
  };

  const handleEditDocument = (document: TaxDocument) => {
    setFormData(document);
    setEditingDocument(document);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('이 세무 문서를 삭제하시겠습니까?')) {
      setDocuments(documents.filter(doc => doc.id !== documentId));
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setEditingDocument(null);
    setFormData({});
  };

  const handleFormChange = (field: keyof TaxDocument, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate VAT and total when amount changes
      if (field === 'amount') {
        const amount = Number(value) || 0;
        const vatAmount = Math.round(amount * 0.1);
        updated.vatAmount = vatAmount;
        updated.totalAmount = amount + vatAmount;
      }
      
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!formData.documentNumber || !formData.customerName || !formData.amount) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (editingDocument) {
      // Update existing document
      setDocuments(prev => prev.map(doc => 
        doc.id === editingDocument.id ? { ...doc, ...formData } as TaxDocument : doc
      ));
    } else {
      // Create new document
      const newDocument: TaxDocument = {
        id: Date.now().toString(),
        documentNumber: formData.documentNumber || '',
        customerName: formData.customerName || '',
        customerBusinessNumber: formData.customerBusinessNumber || '',
        amount: Number(formData.amount) || 0,
        vatAmount: Number(formData.vatAmount) || 0,
        totalAmount: Number(formData.totalAmount) || 0,
        type: formData.type as TaxDocument['type'] || 'tax_invoice',
        status: formData.status as TaxDocument['status'] || 'issued',
        issueDate: formData.issueDate || '',
        dueDate: formData.dueDate || '',
        category: formData.category || '',
        description: formData.description || '',
        issuedBy: formData.issuedBy || '시스템'
      };
      setDocuments(prev => [newDocument, ...prev]);
    }

    handleCloseModals();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>세금 관리</h1>
            <p className={styles.subtitle}>세금계산서 발행 및 세무 관리를 효율적으로 처리하세요</p>
          </div>
          <Button className={styles.addButton} onClick={handleCreateTaxInvoice}>
            <Plus className={styles.icon} />
            세금계산서 발행
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 문서</span>
                <span className={styles.statValue}>{totalDocuments}건</span>
              </div>
              <div className={styles.statIcon}>
                <FileText />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 금액</span>
                <span className={styles.statValue}>{formatCurrency(totalAmount)}</span>
              </div>
              <div className={styles.statIcon}>
                <DollarSign />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>부가세 합계</span>
                <span className={styles.statValue}>{formatCurrency(totalVat)}</span>
              </div>
              <div className={styles.statIcon}>
                <Calculator />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>기한 초과</span>
                <span className={styles.statValue}>{overdueCount}건</span>
              </div>
              <div className={styles.statIcon}>
                <AlertCircle />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="문서번호, 고객명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 문서</option>
              <option value="tax_invoice">세금계산서</option>
              <option value="cash_receipt">현금영수증</option>
              <option value="vat_return">부가세신고</option>
              <option value="income_tax">소득세신고</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 상태</option>
              <option value="issued">발행완료</option>
              <option value="sent">전송완료</option>
              <option value="confirmed">승인완료</option>
              <option value="cancelled">취소</option>
              <option value="overdue">기한초과</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.documentsGrid}>
          {filteredDocuments.map((document) => (
            <Card key={document.id} className={styles.documentCard}>
              <div className={styles.cardHeader}>
                <div className={styles.documentInfo}>
                  <h3 className={styles.documentNumber}>{document.documentNumber}</h3>
                  <div className={styles.documentMeta}>
                    <Badge variant={typeConfig[document.type]?.color as any} className={styles.typeBadge}>
                      {getTypeIcon(document.type)}
                      {typeConfig[document.type]?.label}
                    </Badge>
                    <Badge variant={statusConfig[document.status]?.color as any} className={styles.statusBadge}>
                      {getStatusIcon(document.status)}
                      {statusConfig[document.status]?.label}
                    </Badge>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDocument(document)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditDocument(document)}>
                    <Edit3 className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(document.id)}>
                    <Trash2 className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.customerInfo}>
                  <Building className={styles.customerIcon} />
                  <div className={styles.customerData}>
                    <span className={styles.customerName}>{document.customerName}</span>
                    <span className={styles.businessNumber}>사업자번호: {document.customerBusinessNumber}</span>
                  </div>
                </div>

                <div className={styles.amountSection}>
                  <div className={styles.amountGrid}>
                    <div className={styles.amountItem}>
                      <span className={styles.amountLabel}>공급가액</span>
                      <span className={styles.supplyAmount}>{formatCurrency(document.amount)}</span>
                    </div>
                    <div className={styles.amountItem}>
                      <span className={styles.amountLabel}>부가세</span>
                      <span className={styles.vatAmount}>{formatCurrency(document.vatAmount)}</span>
                    </div>
                    <div className={styles.amountItem}>
                      <span className={styles.amountLabel}>합계</span>
                      <span className={styles.totalAmount}>{formatCurrency(document.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.dateInfo}>
                  <Calendar className={styles.dateIcon} />
                  <div className={styles.dateData}>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>발행일</span>
                      <span className={styles.dateValue}>{document.issueDate}</span>
                    </div>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>만료일</span>
                      <span className={styles.dateValue}>{document.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.categoryInfo}>
                  <span className={styles.categoryTag}>{document.category}</span>
                  <span className={styles.issuedBy}>발행: {document.issuedBy}</span>
                </div>

                <div className={styles.description}>
                  <p className={styles.descriptionText}>{document.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedDocument && (
        <div className={styles.modal} onClick={() => setSelectedDocument(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>세무 문서 상세</h2>
              <Button variant="ghost" onClick={() => setSelectedDocument(null)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.documentHeader}>
                <div className={styles.documentMainInfo}>
                  <h3>{selectedDocument.documentNumber}</h3>
                  <div className={styles.documentBadges}>
                    <Badge variant={typeConfig[selectedDocument.type]?.color as any}>{typeConfig[selectedDocument.type]?.label}</Badge>
                    <Badge variant={statusConfig[selectedDocument.status]?.color as any}>{statusConfig[selectedDocument.status]?.label}</Badge>
                  </div>
                </div>
              </div>

              <div className={styles.modalDetailsGrid}>
                <div className={styles.modalDetailSection}>
                  <h4>고객 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>고객명:</span>
                      <span>{selectedDocument.customerName}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>사업자번호:</span>
                      <span>{selectedDocument.customerBusinessNumber}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>카테고리:</span>
                      <span>{selectedDocument.category}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>금액 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>공급가액:</span>
                      <span className={styles.supplyAmountModal}>{formatCurrency(selectedDocument.amount)}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>부가세:</span>
                      <span className={styles.vatAmountModal}>{formatCurrency(selectedDocument.vatAmount)}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>총 금액:</span>
                      <span className={styles.totalAmountModal}>{formatCurrency(selectedDocument.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>발행 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>발행일:</span>
                      <span>{selectedDocument.issueDate}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>만료일:</span>
                      <span>{selectedDocument.dueDate}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>발행자:</span>
                      <span>{selectedDocument.issuedBy}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.descriptionSection}>
                <h4>상세 내용</h4>
                <div className={styles.fullDescription}>{selectedDocument.description}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Tax Invoice Modal */}
      {showCreateModal && (
        <div className={styles.modal} onClick={handleCloseModals}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>세금계산서 발행</h2>
              <Button variant="ghost" onClick={handleCloseModals} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>문서번호 *</label>
                  <Input
                    value={formData.documentNumber || ''}
                    onChange={(e) => handleFormChange('documentNumber', e.target.value)}
                    placeholder="TAX-2024-001"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>고객명 *</label>
                  <Input
                    value={formData.customerName || ''}
                    onChange={(e) => handleFormChange('customerName', e.target.value)}
                    placeholder="고객명을 입력하세요"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>사업자번호</label>
                  <Input
                    value={formData.customerBusinessNumber || ''}
                    onChange={(e) => handleFormChange('customerBusinessNumber', e.target.value)}
                    placeholder="123-45-67890"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>공급가액 *</label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                    placeholder="1000000"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>부가세</label>
                  <Input
                    type="number"
                    value={formData.vatAmount || ''}
                    onChange={(e) => handleFormChange('vatAmount', e.target.value)}
                    placeholder="자동 계산됨"
                    className={styles.formInput}
                    readOnly
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>총 금액</label>
                  <Input
                    type="number"
                    value={formData.totalAmount || ''}
                    onChange={(e) => handleFormChange('totalAmount', e.target.value)}
                    placeholder="자동 계산됨"
                    className={styles.formInput}
                    readOnly
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>발행일</label>
                  <Input
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={(e) => handleFormChange('issueDate', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>만료일</label>
                  <Input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => handleFormChange('dueDate', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>카테고리</label>
                  <Input
                    value={formData.category || ''}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    placeholder="용역, 상품, 서비스 등"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>발행자</label>
                  <Input
                    value={formData.issuedBy || ''}
                    onChange={(e) => handleFormChange('issuedBy', e.target.value)}
                    placeholder="발행자명"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>상세 내용</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="세금계산서 상세 내용을 입력하세요"
                    className={styles.formTextarea}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <Button variant="outline" onClick={handleCloseModals} className={styles.cancelButton}>
                  취소
                </Button>
                <Button onClick={handleSubmit} className={styles.submitButton}>
                  발행
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDocument && (
        <div className={styles.modal} onClick={handleCloseModals}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>세무 문서 수정</h2>
              <Button variant="ghost" onClick={handleCloseModals} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>문서번호 *</label>
                  <Input
                    value={formData.documentNumber || ''}
                    onChange={(e) => handleFormChange('documentNumber', e.target.value)}
                    placeholder="TAX-2024-001"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>고객명 *</label>
                  <Input
                    value={formData.customerName || ''}
                    onChange={(e) => handleFormChange('customerName', e.target.value)}
                    placeholder="고객명을 입력하세요"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>사업자번호</label>
                  <Input
                    value={formData.customerBusinessNumber || ''}
                    onChange={(e) => handleFormChange('customerBusinessNumber', e.target.value)}
                    placeholder="123-45-67890"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>공급가액 *</label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                    placeholder="1000000"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>부가세</label>
                  <Input
                    type="number"
                    value={formData.vatAmount || ''}
                    onChange={(e) => handleFormChange('vatAmount', e.target.value)}
                    placeholder="자동 계산됨"
                    className={styles.formInput}
                    readOnly
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>총 금액</label>
                  <Input
                    type="number"
                    value={formData.totalAmount || ''}
                    onChange={(e) => handleFormChange('totalAmount', e.target.value)}
                    placeholder="자동 계산됨"
                    className={styles.formInput}
                    readOnly
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>상태</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="issued">발행완료</option>
                    <option value="sent">전송완료</option>
                    <option value="confirmed">승인완료</option>
                    <option value="cancelled">취소</option>
                    <option value="overdue">기한초과</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>발행일</label>
                  <Input
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={(e) => handleFormChange('issueDate', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>만료일</label>
                  <Input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => handleFormChange('dueDate', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>카테고리</label>
                  <Input
                    value={formData.category || ''}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    placeholder="용역, 상품, 서비스 등"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>발행자</label>
                  <Input
                    value={formData.issuedBy || ''}
                    onChange={(e) => handleFormChange('issuedBy', e.target.value)}
                    placeholder="발행자명"
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>상세 내용</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="세금계산서 상세 내용을 입력하세요"
                    className={styles.formTextarea}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <Button variant="outline" onClick={handleCloseModals} className={styles.cancelButton}>
                  취소
                </Button>
                <Button onClick={handleSubmit} className={styles.submitButton}>
                  수정
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
