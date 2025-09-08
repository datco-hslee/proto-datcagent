import { useState } from "react";
import { Search, Plus, Filter, Download, Edit, Send, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import erpDataJson from '../../DatcoDemoData2.json';

interface Quote {
  id: string;
  quoteNumber: string;
  customer: string;
  company: string;
  status: "임시저장" | "발송대기" | "발송완료" | "승인" | "거절" | "만료";
  quoteDate: string;
  validUntil: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  items: number;
  representative: string;
  notes: string;
}

export function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [dateRange, setDateRange] = useState("전체");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  
  // 새 견적 폼 상태
  const [newQuoteForm, setNewQuoteForm] = useState({
    quoteNumber: "",
    customer: "",
    company: "",
    status: "임시저장",
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: "",
    totalAmount: "",
    discount: "",
    items: "",
    representative: "",
    notes: "",
  });
  
  // 편집 견적 폼 상태
  const [editQuoteForm, setEditQuoteForm] = useState({
    quoteNumber: "",
    customer: "",
    company: "",
    status: "임시저장",
    quoteDate: "",
    validUntil: "",
    totalAmount: "",
    discount: "",
    items: "",
    representative: "",
    notes: "",
  });
  
  // 고급 필터 상태
  const [advancedFilters, setAdvancedFilters] = useState({
    company: "",
    representative: "",
    minAmount: "",
    maxAmount: "",
    validFrom: "",
    validTo: "",
    hasDiscount: "",
    minItems: "",
    maxItems: "",
  });

  // 버튼 핸들러들
  const handleAdvancedFilter = () => {
    setShowAdvancedFilter(true);
  };

  const applyQuoteFilters = () => {
    setShowAdvancedFilter(false);
    alert('고급 필터가 적용되었습니다.');
  };

  const resetQuoteFilters = () => {
    setAdvancedFilters({
      company: "",
      representative: "",
      minAmount: "",
      maxAmount: "",
      validFrom: "",
      validTo: "",
      hasDiscount: "",
      minItems: "",
      maxItems: "",
    });
    setSelectedStatus("전체");
    setDateRange("전체");
    setSearchTerm("");
  };

  const handleQuoteReport = () => {
    // CSV 헤더 정의
    const headers = [
      '견적번호',
      '고객명',
      '회사명',
      '상태',
      '견적일',
      '유효기한',
      '견적금액',
      '할인금액',
      '최종금액',
      '항목수',
      '담당자',
      '비고'
    ];

    // 견적 데이터를 CSV 형식으로 변환
    const csvData = filteredQuotes.map(quote => [
      quote.quoteNumber,
      quote.customer,
      quote.company,
      quote.status,
      quote.quoteDate,
      quote.validUntil,
      quote.totalAmount.toLocaleString(),
      quote.discount.toLocaleString(),
      quote.finalAmount.toLocaleString(),
      quote.items.toString(),
      quote.representative,
      quote.notes
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
      link.setAttribute('download', `견적리포트_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`${filteredQuotes.length}개의 견적 데이터가 CSV 파일로 내보내졌습니다.`);
    } else {
      alert('파일 다운로드가 지원되지 않는 브라우저입니다.');
    }
  };

  const handleCreateQuote = () => {
    setShowCreateQuote(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditQuoteForm({
      quoteNumber: quote.quoteNumber,
      customer: quote.customer,
      company: quote.company,
      status: quote.status,
      quoteDate: quote.quoteDate,
      validUntil: quote.validUntil,
      totalAmount: quote.totalAmount.toString(),
      discount: quote.discount.toString(),
      items: quote.items.toString(),
      representative: quote.representative,
      notes: quote.notes,
    });
    setEditingQuote(quote);
  };

  // 새 견적 생성 처리
  const handleSubmitNewQuote = () => {
    if (!newQuoteForm.customer || !newQuoteForm.company || !newQuoteForm.validUntil) {
      alert('필수 필드를 모두 입력해주세요.');
      return;
    }

    const newQuote: Quote = {
      id: `QUO-${Date.now()}`,
      quoteNumber: newQuoteForm.quoteNumber || `QT-2024-${String(allQuotes.length + 1).padStart(3, '0')}`,
      customer: newQuoteForm.customer,
      company: newQuoteForm.company,
      status: newQuoteForm.status as Quote['status'],
      quoteDate: newQuoteForm.quoteDate,
      validUntil: newQuoteForm.validUntil,
      totalAmount: parseFloat(newQuoteForm.totalAmount) || 0,
      discount: parseFloat(newQuoteForm.discount) || 0,
      finalAmount: (parseFloat(newQuoteForm.totalAmount) || 0) - (parseFloat(newQuoteForm.discount) || 0),
      items: parseInt(newQuoteForm.items) || 1,
      representative: newQuoteForm.representative,
      notes: newQuoteForm.notes,
    };

    setUserAddedQuotes([...userAddedQuotes, newQuote]);
    setNewQuoteForm({
      quoteNumber: "",
      customer: "",
      company: "",
      status: "임시저장",
      quoteDate: new Date().toISOString().split('T')[0],
      validUntil: "",
      totalAmount: "",
      discount: "",
      items: "",
      representative: "",
      notes: "",
    });
    setShowCreateQuote(false);
    alert('새 견적이 성공적으로 생성되었습니다.');
  };

  // 견적 편집 처리
  const handleSubmitEditQuote = () => {
    if (!editQuoteForm.customer || !editQuoteForm.company || !editQuoteForm.validUntil) {
      alert('필수 필드를 모두 입력해주세요.');
      return;
    }

    const updatedQuote: Quote = {
      ...editingQuote!,
      quoteNumber: editQuoteForm.quoteNumber,
      customer: editQuoteForm.customer,
      company: editQuoteForm.company,
      status: editQuoteForm.status as Quote['status'],
      quoteDate: editQuoteForm.quoteDate,
      validUntil: editQuoteForm.validUntil,
      totalAmount: parseFloat(editQuoteForm.totalAmount) || 0,
      discount: parseFloat(editQuoteForm.discount) || 0,
      finalAmount: (parseFloat(editQuoteForm.totalAmount) || 0) - (parseFloat(editQuoteForm.discount) || 0),
      items: parseInt(editQuoteForm.items) || 1,
      representative: editQuoteForm.representative,
      notes: editQuoteForm.notes,
    };

    setUserAddedQuotes(userAddedQuotes.map((quote: Quote) => quote.id === editingQuote!.id ? updatedQuote : quote));
    setEditingQuote(null);
    alert('견적이 성공적으로 수정되었습니다.');
  };

  const handleSendQuote = (quote: Quote) => {
    alert(`${quote.quoteNumber} 견적서를 발송합니다.`);
  };

  const handleDownloadPDF = (quote: Quote) => {
    alert(`${quote.quoteNumber} 견적서 PDF를 다운로드합니다.`);
  };

  const closeModals = () => {
    setShowAdvancedFilter(false);
    setShowCreateQuote(false);
    setEditingQuote(null);
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
      임시저장: { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" },
      발송대기: { bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
      발송완료: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
      승인: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      거절: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
      만료: { bg: "#fafafa", color: "#6b7280", border: "#e5e7eb" },
    };

    const colorSet = colors[status as keyof typeof colors] || colors["임시저장"];

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

  const actionButtonStyle: React.CSSProperties = {
    padding: "0.25rem",
    border: "none",
    background: "transparent",
    borderRadius: "0.25rem",
    cursor: "pointer",
    color: "#6b7280",
    transition: "all 0.2s ease",
  };

  // ERP 데이터에서 견적 추출 (수주 데이터 활용)
  const getERPQuotes = (): Quote[] => {
    const orders = erpDataJson.sheets.수주 || [];
    const customers = erpDataJson.sheets.거래처마스터 || [];
    const items = erpDataJson.sheets.품목마스터 || [];

    return orders.map((order: any) => {
      const customer = customers.find((c: any) => c.거래처코드 === order.거래처코드);
      const item = items.find((i: any) => i.품목코드 === order.품목코드);
      
      // 견적 상태 계산 (수주 상태 기반)
      let quoteStatus: Quote['status'] = "발송완료";
      if (order.상태 === "완료") quoteStatus = "승인";
      else if (order.상태 === "취소") quoteStatus = "거절";
      else if (new Date(order.납기일자) < new Date()) quoteStatus = "만료";
      
      // 할인 계산 (5-15% 랜덤)
      const discountRate = 0.05 + Math.random() * 0.1;
      const discount = Math.floor(order.수주금액 * discountRate);
      
      // 견적 유효기한 (견적일로부터 30일)
      const quoteDate = new Date(order.수주일자);
      const validUntil = new Date(quoteDate);
      validUntil.setDate(validUntil.getDate() + 30);

      return {
        id: `ERP-QUO-${order.수주번호}`,
        quoteNumber: `QT-ERP-${order.수주번호}`,
        customer: customer?.거래처명 || "담당자",
        company: customer?.거래처명 || "회사명",
        status: quoteStatus,
        quoteDate: order.수주일자,
        validUntil: validUntil.toISOString().split('T')[0],
        totalAmount: order.수주금액 + discount,
        discount: discount,
        finalAmount: order.수주금액,
        items: 1,
        representative: "영업팀",
        notes: item?.품목명 ? `품목: ${item.품목명}` : "",
      };
    });
  };

  // 샘플 견적 데이터
  const getSampleQuotes = (): Quote[] => {
    return [
      {
        id: "SAMPLE-QUO-001",
        quoteNumber: "QT-2024-001",
        customer: "김철수",
        company: "ABC 제조업체",
        status: "발송완료",
        quoteDate: "2024-01-15",
        validUntil: "2024-02-15",
        totalAmount: 50000000,
        discount: 2500000,
        finalAmount: 47500000,
        items: 5,
        representative: "이영희",
        notes: "긴급 프로젝트 건",
      },
      {
        id: "SAMPLE-QUO-002",
        quoteNumber: "QT-2024-002",
        customer: "박영희",
        company: "XYZ 솔루션",
        status: "승인",
        quoteDate: "2024-01-18",
        validUntil: "2024-02-28",
        totalAmount: 35000000,
        discount: 1000000,
        finalAmount: 34000000,
        items: 3,
        representative: "김대표",
        notes: "장기 계약 할인 적용",
      },
      {
        id: "SAMPLE-QUO-003",
        quoteNumber: "QT-2024-003",
        customer: "정민수",
        company: "DEF 엔지니어링",
        status: "발송대기",
        quoteDate: "2024-01-20",
        validUntil: "2024-02-20",
        totalAmount: 28000000,
        discount: 0,
        finalAmount: 28000000,
        items: 4,
        representative: "이영희",
        notes: "",
      },
    ];
  };

  // 현재 선택된 데이터 소스에 따른 견적 반환
  const getCurrentQuotes = (): Quote[] => {
    return selectedDataSource === "erp" ? getERPQuotes() : getSampleQuotes();
  };

  // 사용자가 추가한 견적 데이터 (빈 배열로 시작)
  const [userAddedQuotes, setUserAddedQuotes] = useState<Quote[]>([]);

  // 현재 견적 목록 가져오기
  const currentQuotes = getCurrentQuotes();
  const allQuotes = [...currentQuotes, ...userAddedQuotes]; // ERP/샘플 데이터 + 사용자 추가 데이터
  
  const filteredQuotes = allQuotes.filter((quote) => {
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "전체" || quote.status === selectedStatus;
    
    // 고급 필터 적용
    const matchesCompany = !advancedFilters.company || 
      quote.company.toLowerCase().includes(advancedFilters.company.toLowerCase());
    const matchesRepresentative = !advancedFilters.representative || 
      quote.representative.toLowerCase().includes(advancedFilters.representative.toLowerCase());
    const matchesAmount = (!advancedFilters.minAmount || quote.finalAmount >= parseInt(advancedFilters.minAmount)) &&
      (!advancedFilters.maxAmount || quote.finalAmount <= parseInt(advancedFilters.maxAmount));
    const matchesItems = (!advancedFilters.minItems || quote.items >= parseInt(advancedFilters.minItems)) &&
      (!advancedFilters.maxItems || quote.items <= parseInt(advancedFilters.maxItems));
    const matchesDiscount = !advancedFilters.hasDiscount || 
      (advancedFilters.hasDiscount === "yes" && quote.discount > 0) ||
      (advancedFilters.hasDiscount === "no" && quote.discount === 0);
    
    return matchesSearch && matchesStatus && matchesCompany && matchesRepresentative && matchesAmount && matchesItems && matchesDiscount;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "임시저장":
        return <FileText style={{ height: "1rem", width: "1rem" }} />;
      case "발송대기":
        return <Clock style={{ height: "1rem", width: "1rem" }} />;
      case "발송완료":
        return <Send style={{ height: "1rem", width: "1rem" }} />;
      case "승인":
        return <CheckCircle style={{ height: "1rem", width: "1rem" }} />;
      case "거절":
        return <XCircle style={{ height: "1rem", width: "1rem" }} />;
      case "만료":
        return <Clock style={{ height: "1rem", width: "1rem" }} />;
      default:
        return <FileText style={{ height: "1rem", width: "1rem" }} />;
    }
  };

  const isExpiringSoon = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (validUntil: string) => {
    const expiryDate = new Date(validUntil);
    const today = new Date();
    return expiryDate < today;
  };

  // 통계 계산
  const stats = {
    total: allQuotes.length,
    draft: allQuotes.filter((q: Quote) => q.status === "임시저장").length,
    sent: allQuotes.filter((q: Quote) => q.status === "발송완료").length,
    approved: allQuotes.filter((q: Quote) => q.status === "승인").length,
    totalValue: allQuotes.filter((q: Quote) => q.status === "승인").reduce((sum, quote) => sum + quote.finalAmount, 0),
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={titleStyle}>견적 관리</h1>
            <p style={subtitleStyle}>견적서 작성부터 승인까지 전 과정을 효율적으로 관리하세요</p>
          </div>
          {/* 데이터 소스 표시 배지 */}
          <div
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              backgroundColor: selectedDataSource === "erp" ? "#dbeafe" : "#fef3c7",
              color: selectedDataSource === "erp" ? "#1e40af" : "#92400e",
              border: `1px solid ${selectedDataSource === "erp" ? "#93c5fd" : "#fcd34d"}`,
            }}
          >
            현재 데이터: {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.5rem" }}>{stats.total}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>전체 견적</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#d97706", marginBottom: "0.5rem" }}>{stats.draft}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>임시저장</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2563eb", marginBottom: "0.5rem" }}>{stats.sent}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>발송완료</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.5rem" }}>{stats.approved}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>승인</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "0.5rem" }}>{formatCurrency(stats.totalValue)}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>승인된 총액</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div style={actionsBarStyle}>
        <div style={searchContainerStyle}>
          {/* 데이터 소스 선택 */}
          <select 
            style={filterSelectStyle} 
            value={selectedDataSource} 
            onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")}
          >
            <option value="erp">닷코 시연 데이터</option>
            <option value="sample">생성된 샘플 데이터</option>
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
              placeholder="견적번호, 고객명으로 검색..."
              style={searchInputStyle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select style={filterSelectStyle} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="전체">전체 상태</option>
            <option value="임시저장">임시저장</option>
            <option value="발송대기">발송대기</option>
            <option value="발송완료">발송완료</option>
            <option value="승인">승인</option>
            <option value="거절">거절</option>
            <option value="만료">만료</option>
          </select>

          <select style={filterSelectStyle} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="전체">전체 기간</option>
            <option value="이번달">이번 달</option>
            <option value="지난달">지난 달</option>
            <option value="3개월">최근 3개월</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={secondaryButtonStyle} onClick={handleAdvancedFilter}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            고급 필터
          </button>
          <button style={secondaryButtonStyle} onClick={handleQuoteReport}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            견적 리포트
          </button>
          <button style={primaryButtonStyle} onClick={handleCreateQuote}>
            <Plus style={{ height: "1rem", width: "1rem" }} />새 견적 작성
          </button>
        </div>
      </div>

      {/* Quotes Table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={thStyle}>견적번호</th>
              <th style={thStyle}>고객정보</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>견적일</th>
              <th style={thStyle}>유효기한</th>
              <th style={thStyle}>견적금액</th>
              <th style={thStyle}>할인</th>
              <th style={thStyle}>최종금액</th>
              <th style={thStyle}>항목수</th>
              <th style={thStyle}>담당자</th>
              <th style={thStyle}>작업</th>
              <th style={thStyle}>비고</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map((quote) => (
              <tr key={quote.id} style={{ transition: "background-color 0.2s ease" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: "#374151" }}>{quote.quoteNumber}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{quote.id}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{quote.customer}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{quote.company}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: statusBadgeStyle(quote.status).color }}>{getStatusIcon(quote.status)}</span>
                    <span style={statusBadgeStyle(quote.status)}>{quote.status}</span>
                  </div>
                </td>
                <td style={tdStyle}>{quote.quoteDate}</td>
                <td style={tdStyle}>
                  <div
                    style={{
                      color: isExpired(quote.validUntil) ? "#dc2626" : isExpiringSoon(quote.validUntil) ? "#d97706" : "#374151",
                      fontWeight: isExpired(quote.validUntil) || isExpiringSoon(quote.validUntil) ? 600 : 400,
                    }}
                  >
                    {quote.validUntil}
                    {isExpired(quote.validUntil) && <div style={{ fontSize: "0.75rem" }}>만료됨</div>}
                    {isExpiringSoon(quote.validUntil) && <div style={{ fontSize: "0.75rem" }}>곧 만료</div>}
                  </div>
                </td>
                <td style={tdStyle}>{formatCurrency(quote.totalAmount)}</td>
                <td style={tdStyle}>
                  {quote.discount > 0 ? (
                    <div style={{ color: "#dc2626", fontWeight: 500 }}>-{formatCurrency(quote.discount)}</div>
                  ) : (
                    <span style={{ color: "#6b7280" }}>없음</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: "#16a34a" }}>{formatCurrency(quote.finalAmount)}</div>
                </td>
                <td style={tdStyle}>{quote.items}개</td>
                <td style={tdStyle}>{quote.representative}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button style={actionButtonStyle} title="편집" onClick={() => handleEditQuote(quote)}>
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    {quote.status === "발송대기" && (
                      <button style={actionButtonStyle} title="발송" onClick={() => handleSendQuote(quote)}>
                        <Send style={{ height: "1rem", width: "1rem" }} />
                      </button>
                    )}
                    <button style={actionButtonStyle} title="PDF 다운로드" onClick={() => handleDownloadPDF(quote)}>
                      <Download style={{ height: "1rem", width: "1rem" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results Summary & Notes */}
      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1rem",
        }}
      >
        <div
          style={{
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            color: "#6b7280",
          }}
        >
          총 {filteredQuotes.length}개의 견적이 표시됨 (전체 {allQuotes.length}개 중)
        </div>
        <div
          style={{
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <div style={{ color: "#dc2626", fontWeight: 600, marginBottom: "0.5rem" }}>
            ⚠️ 곧 만료되는 견적: {allQuotes.filter((q: Quote) => isExpiringSoon(q.validUntil)).length}개
          </div>
          <div style={{ color: "#6b7280" }}>만료된 견적: {allQuotes.filter((q: Quote) => isExpired(q.validUntil)).length}개</div>
        </div>
      </div>

      {/* Advanced Filter Modal */}
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최소 견적금액</label>
                    <input
                      type="number"
                      value={advancedFilters.minAmount}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, minAmount: e.target.value})}
                      placeholder="0"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최대 견적금액</label>
                    <input
                      type="number"
                      value={advancedFilters.maxAmount}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, maxAmount: e.target.value})}
                      placeholder="999999999"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최소 항목수</label>
                    <input
                      type="number"
                      value={advancedFilters.minItems}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, minItems: e.target.value})}
                      placeholder="1"
                      min="1"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최대 항목수</label>
                    <input
                      type="number"
                      value={advancedFilters.maxItems}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, maxItems: e.target.value})}
                      placeholder="100"
                      min="1"
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
                
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>할인 여부</label>
                  <select
                    value={advancedFilters.hasDiscount}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, hasDiscount: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      background: "white"
                    }}
                  >
                    <option value="">전체</option>
                    <option value="yes">할인 있음</option>
                    <option value="no">할인 없음</option>
                  </select>
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button
                    onClick={resetQuoteFilters}
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
                    onClick={applyQuoteFilters}
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

      {showCreateQuote && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>새 견적 작성</h2>
              <button style={closeButtonStyle} onClick={closeModals}>
                ×
              </button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>견적번호</label>
                    <input
                      type="text"
                      value={newQuoteForm.quoteNumber}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, quoteNumber: e.target.value})}
                      placeholder="자동 생성됩니다"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>상태</label>
                    <select
                      value={newQuoteForm.status}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, status: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    >
                      <option value="임시저장">임시저장</option>
                      <option value="발송완료">발송완료</option>
                      <option value="승인">승인</option>
                      <option value="거절">거절</option>
                      <option value="만료">만료</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>고객명 *</label>
                    <input
                      type="text"
                      value={newQuoteForm.customer}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, customer: e.target.value})}
                      placeholder="고객명을 입력하세요"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>회사명 *</label>
                    <input
                      type="text"
                      value={newQuoteForm.company}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, company: e.target.value})}
                      placeholder="회사명을 입력하세요"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>견적일</label>
                    <input
                      type="date"
                      value={newQuoteForm.quoteDate}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, quoteDate: e.target.value})}
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>유효기한 *</label>
                    <input
                      type="date"
                      value={newQuoteForm.validUntil}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, validUntil: e.target.value})}
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>견적금액</label>
                    <input
                      type="number"
                      value={newQuoteForm.totalAmount}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, totalAmount: e.target.value})}
                      placeholder="0"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>할인금액</label>
                    <input
                      type="number"
                      value={newQuoteForm.discount}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, discount: e.target.value})}
                      placeholder="0"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>항목수</label>
                    <input
                      type="number"
                      value={newQuoteForm.items}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, items: e.target.value})}
                      placeholder="1"
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
                      value={newQuoteForm.representative}
                      onChange={(e) => setNewQuoteForm({...newQuoteForm, representative: e.target.value})}
                      placeholder="담당자명을 입력하세요"
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

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>비고</label>
                  <textarea
                    value={newQuoteForm.notes}
                    onChange={(e) => setNewQuoteForm({...newQuoteForm, notes: e.target.value})}
                    placeholder="추가 정보를 입력하세요"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button
                    onClick={closeModals}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      background: "white",
                      cursor: "pointer",
                      fontSize: "0.875rem"
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmitNewQuote}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "0.375rem",
                      background: "#3b82f6",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "0.875rem"
                    }}
                  >
                    생성
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingQuote && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{editingQuote.quoteNumber} 편집</h2>
              <button style={closeButtonStyle} onClick={closeModals}>
                ×
              </button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>견적번호</label>
                    <input
                      type="text"
                      value={editQuoteForm.quoteNumber}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, quoteNumber: e.target.value})}
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>상태</label>
                    <select
                      value={editQuoteForm.status}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, status: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.375rem",
                        fontSize: "0.875rem"
                      }}
                    >
                      <option value="임시저장">임시저장</option>
                      <option value="발송완료">발송완료</option>
                      <option value="승인">승인</option>
                      <option value="거절">거절</option>
                      <option value="만료">만료</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>고객명 *</label>
                    <input
                      type="text"
                      value={editQuoteForm.customer}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, customer: e.target.value})}
                      placeholder="고객명을 입력하세요"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>회사명 *</label>
                    <input
                      type="text"
                      value={editQuoteForm.company}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, company: e.target.value})}
                      placeholder="회사명을 입력하세요"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>견적일</label>
                    <input
                      type="date"
                      value={editQuoteForm.quoteDate}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, quoteDate: e.target.value})}
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>유효기한 *</label>
                    <input
                      type="date"
                      value={editQuoteForm.validUntil}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, validUntil: e.target.value})}
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>견적금액</label>
                    <input
                      type="number"
                      value={editQuoteForm.totalAmount}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, totalAmount: e.target.value})}
                      placeholder="0"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>할인금액</label>
                    <input
                      type="number"
                      value={editQuoteForm.discount}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, discount: e.target.value})}
                      placeholder="0"
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
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>항목수</label>
                    <input
                      type="number"
                      value={editQuoteForm.items}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, items: e.target.value})}
                      placeholder="1"
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
                      value={editQuoteForm.representative}
                      onChange={(e) => setEditQuoteForm({...editQuoteForm, representative: e.target.value})}
                      placeholder="담당자명을 입력하세요"
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

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>비고</label>
                  <textarea
                    value={editQuoteForm.notes}
                    onChange={(e) => setEditQuoteForm({...editQuoteForm, notes: e.target.value})}
                    placeholder="추가 정보를 입력하세요"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button
                    onClick={closeModals}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      background: "white",
                      cursor: "pointer",
                      fontSize: "0.875rem"
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmitEditQuote}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "0.375rem",
                      background: "#3b82f6",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "0.875rem"
                    }}
                  >
                    수정
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
