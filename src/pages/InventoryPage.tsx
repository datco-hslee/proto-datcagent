import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Search, Plus, Filter, Download, Edit, Eye, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import erpDataJson from '../../DatcoDemoData2.json';
import { generateMassiveERPData } from '../data/massiveERPData';

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  location: string;
  supplier: string;
  lastUpdated: string;
  status: "정상" | "부족" | "과다" | "없음";
  // 품목마스터 정보
  itemCategory?: string; // 품목구분
  standardPrice?: number; // 표준단가
  moq?: number; // MOQ
  safetyStock?: number; // 안전재고
  leadTimeDays?: number; // 리드타임일
}

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample" | "massive">("erp");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [showViewItem, setShowViewItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showAdjustStock, setShowAdjustStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // 고급 필터 상태
  const [advancedFilters, setAdvancedFilters] = useState({
    supplier: "",
    location: "",
    minStock: "",
    maxStock: "",
    minValue: "",
    maxValue: "",
    dateFrom: "",
    dateTo: "",
  });
  
  // 새 품목 폼 상태
  const [newItemForm, setNewItemForm] = useState({
    code: "",
    name: "",
    category: "",
    currentStock: "",
    minStock: "",
    maxStock: "",
    unit: "",
    unitPrice: "",
    location: "",
    supplier: "",
    status: "",
  });
  
  // 편집 품목 폼 상태
  const [editItemForm, setEditItemForm] = useState({
    code: "",
    name: "",
    category: "",
    currentStock: "",
    minStock: "",
    maxStock: "",
    unit: "",
    unitPrice: "",
    location: "",
    supplier: "",
    status: "",
    // 품목마스터 정보
    itemCategory: "",
    standardPrice: "",
    moq: "",
    safetyStock: "",
    leadTimeDays: "",
  });
  
  // 재고 조정 폼 상태
  const [adjustForm, setAdjustForm] = useState({
    adjustmentType: "increase",
    quantity: "",
    reason: "",
    notes: "",
  });

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
      정상: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      부족: { bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
      과다: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
      없음: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    };

    const colorSet = colors[status as keyof typeof colors] || colors["정상"];

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

  const stockLevelBarStyle: React.CSSProperties = {
    width: "6rem",
    height: "0.5rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "0.25rem",
    overflow: "hidden",
  };

  const stockFillStyle = (current: number, min: number, max: number): React.CSSProperties => {
    const percentage = Math.min((current / max) * 100, 100);
    let color = "#16a34a"; // 정상 (녹색)

    if (current === 0) color = "#dc2626"; // 없음 (빨강)
    else if (current < min) color = "#d97706"; // 부족 (주황)
    else if (current > max * 0.9) color = "#2563eb"; // 과다 (파랑)

    return {
      height: "100%",
      width: `${percentage}%`,
      backgroundColor: color,
      borderRadius: "0.25rem",
      transition: "width 0.3s ease",
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

  // ERP 데이터에서 재고 정보 가져오기
  const getInventoryFromERPData = (): InventoryItem[] => {
    const inventory = erpDataJson.sheets?.['재고배치'] || [];
    const itemMaster = erpDataJson.sheets?.품목마스터 || [];
    const suppliers = erpDataJson.sheets?.거래처마스터 || [];
    
    const erpInventoryItems = inventory.map((batch: any) => {
      const item = itemMaster.find((item: any) => item.품목코드 === batch.품목코드);
      const supplier = suppliers.find((sup: any) => sup.구분 === "공급사");
      
      const currentStock = batch.현재고 || 0;
      const minStock = item?.안전재고 || 100;
      const maxStock = (item?.MOQ || 1000) * 2;
      const unitPrice = item?.표준단가 || 1000;
      
      let status: "정상" | "부족" | "과다" | "없음" = "정상";
      if (currentStock === 0) status = "없음";
      else if (currentStock < minStock) status = "부족";
      else if (currentStock > maxStock * 0.9) status = "과다";
      
      return {
        id: `ERP-${batch.배치번호}`,
        code: batch.품목코드,
        name: item?.품목명 || `품목-${batch.품목코드}`,
        category: item?.품목구분 === "완제품" ? "완제품" : 
                 item?.품목구분 === "원자재" ? "원자재" : "부자재",
        currentStock,
        minStock,
        maxStock,
        unit: batch.단위 || "EA",
        unitPrice,
        totalValue: currentStock * unitPrice,
        location: `${batch.창고코드}-${batch.로케이션}`,
        supplier: supplier?.거래처명 || "미지정",
        lastUpdated: batch.입고일자 || "2025-09-01",
        status,
        // 품목마스터 정보 추가
        itemCategory: item?.품목구분 || "미정",
        standardPrice: item?.표준단가 || 0,
        moq: item?.MOQ || 0,
        safetyStock: item?.안전재고 || 0,
        leadTimeDays: item?.리드타임일 || 0
      };
    });
    
    return erpInventoryItems;
  };

  // Massive ERP 데이터에서 materialInbounds를 재고 아이템으로 변환
  const getInventoryFromMassiveERP = (): InventoryItem[] => {
    const massiveData = generateMassiveERPData();
    console.log('🔍 Massive ERP Data Keys:', Object.keys(massiveData));
    console.log('🔍 MaterialInbounds Length:', massiveData.materialInbounds?.length || 0);
    
    const materialInbounds = massiveData.materialInbounds || [];
    
    const inventoryItems: InventoryItem[] = [];
    
    // materialInbounds 데이터를 InventoryItem으로 변환 (직접 변환)
    materialInbounds.forEach((inbound: any) => {
      console.log('🔍 Processing inbound:', inbound);
      
      // MaterialInbound 인터페이스에 따라 직접 변환
      const currentStock = inbound.currentStock || inbound.quantity || 0;
      const unitPrice = inbound.unitPrice || 1000;
      const minStock = 50; // 기본값
      const maxStock = 1000; // 기본값
      
      let status: "정상" | "부족" | "과다" | "없음" = "정상";
      if (currentStock === 0) status = "없음";
      else if (currentStock < minStock) status = "부족";
      else if (currentStock > maxStock * 0.9) status = "과다";
      
      inventoryItems.push({
        id: `MASSIVE-${inbound.id}`,
        code: inbound.materialCode,
        name: inbound.materialName,
        category: "원자재", // 기본 카테고리
        currentStock,
        minStock,
        maxStock,
        unit: inbound.unit || "EA",
        unitPrice,
        totalValue: currentStock * unitPrice,
        location: inbound.warehouseLocation || "창고A-1구역",
        supplier: inbound.supplierName || "미지정",
        lastUpdated: inbound.inboundDate ? new Date(inbound.inboundDate).toISOString().split('T')[0] : "2025-09-01",
        status,
        itemCategory: "raw",
        standardPrice: unitPrice,
        moq: 100,
        safetyStock: minStock,
        leadTimeDays: 7
      });
    });
    
    console.log('🔍 Generated inventory items:', inventoryItems.length);
    return inventoryItems;
  };

  // 현재 선택된 데이터 소스에 따라 재고 데이터 반환
  const getCurrentInventoryItems = (): InventoryItem[] => {
    if (selectedDataSource === "erp") {
      return getInventoryFromERPData();
    } else if (selectedDataSource === "massive") {
      return getInventoryFromMassiveERP();
    } else {
      return getSampleInventoryItems();
    }
  };

  // 데이터 소스 변경 시 재고 데이터 업데이트
  useEffect(() => {
    setInventoryItems(getCurrentInventoryItems());
  }, [selectedDataSource]);

  // 생성된 샘플 데이터
  const getSampleInventoryItems = (): InventoryItem[] => [
    {
      id: "GEN-001",
      code: "RAW-001",
      name: "스테인리스 스틸 파이프",
      category: "원자재",
      currentStock: 450,
      minStock: 100,
      maxStock: 1000,
      unit: "개",
      unitPrice: 45000,
      totalValue: 20250000,
      location: "창고A-1구역",
      supplier: "대한철강",
      lastUpdated: "2025-09-07",
      status: "정상",
    },
    {
      id: "GEN-002",
      code: "COMP-001",
      name: "제어 모듈",
      category: "부품",
      currentStock: 25,
      minStock: 50,
      maxStock: 200,
      unit: "개",
      unitPrice: 150000,
      totalValue: 3750000,
      location: "창고B-2구역",
      supplier: "전자부품상사",
      lastUpdated: "2024-01-17",
      status: "부족",
    },
    {
      id: "GEN-003",
      code: "FIN-001",
      name: "완제품 A형",
      category: "완제품",
      currentStock: 80,
      minStock: 30,
      maxStock: 100,
      unit: "대",
      unitPrice: 500000,
      totalValue: 40000000,
      location: "출하창고",
      supplier: "자체생산",
      lastUpdated: "2024-01-19",
      status: "정상",
    },
    {
      id: "GEN-004",
      code: "RAW-002",
      name: "알루미늄 시트",
      category: "원자재",
      currentStock: 0,
      minStock: 50,
      maxStock: 300,
      unit: "장",
      unitPrice: 25000,
      totalValue: 0,
      location: "창고A-3구역",
      supplier: "알루미늄코리아",
      lastUpdated: "2024-01-15",
      status: "없음",
    },
    {
      id: "GEN-005",
      code: "TOOL-001",
      name: "정밀 드릴 비트",
      category: "공구",
      currentStock: 180,
      minStock: 20,
      maxStock: 100,
      unit: "개",
      unitPrice: 8000,
      totalValue: 1440000,
      location: "공구창고",
      supplier: "정밀공구",
      lastUpdated: "2024-01-16",
      status: "과다",
    },
  ];

  // 초기 데이터 로드
  // 필터나 데이터 소스가 변경되면 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, selectedDataSource, advancedFilters]);

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "전체" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "전체" || item.status === selectedStatus;
    
    // 고급 필터 적용
    const matchesSupplier = !advancedFilters.supplier || 
      item.supplier.toLowerCase().includes(advancedFilters.supplier.toLowerCase());
    const matchesLocation = !advancedFilters.location || 
      item.location.toLowerCase().includes(advancedFilters.location.toLowerCase());
    const matchesMinStock = !advancedFilters.minStock || item.currentStock >= parseInt(advancedFilters.minStock);
    const matchesMaxStock = !advancedFilters.maxStock || item.currentStock <= parseInt(advancedFilters.maxStock);
    const matchesMinValue = !advancedFilters.minValue || item.totalValue >= parseInt(advancedFilters.minValue);
    const matchesMaxValue = !advancedFilters.maxValue || item.totalValue <= parseInt(advancedFilters.maxValue);
    
    return matchesSearch && matchesCategory && matchesStatus && 
           matchesSupplier && matchesLocation && matchesMinStock && 
           matchesMaxStock && matchesMinValue && matchesMaxValue;
  });

  // 페이지네이션 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "정상":
        return <Package style={{ height: "1rem", width: "1rem" }} />;
      case "부족":
        return <TrendingDown style={{ height: "1rem", width: "1rem" }} />;
      case "과다":
        return <TrendingUp style={{ height: "1rem", width: "1rem" }} />;
      case "없음":
        return <AlertTriangle style={{ height: "1rem", width: "1rem" }} />;
      default:
        return <Package style={{ height: "1rem", width: "1rem" }} />;
    }
  };

  // 통계 계산
  const stats = {
    totalItems: inventoryItems.length,
    lowStock: inventoryItems.filter((i) => i.status === "부족" || i.status === "없음").length,
    totalValue: inventoryItems.reduce((sum, item) => sum + item.totalValue, 0),
    categories: new Set(inventoryItems.map((i) => i.category)).size,
  };

  const categories = ["전체", ...Array.from(new Set(inventoryItems.map((i) => i.category)))];

  // 핸들러 함수들
  const handleInventoryReport = () => {
    // CSV 헤더 정의
    const headers = [
      '품목코드',
      '품목명',
      '카테고리',
      '현재고',
      '최소재고',
      '최대재고',
      '단위',
      '단가',
      '총가치',
      '위치',
      '공급업체',
      '상태',
      '최종수정일'
    ];

    // 재고 데이터를 CSV 형식으로 변환
    const csvData = filteredItems.map(item => [
      item.code,
      item.name,
      item.category,
      item.currentStock.toString(),
      item.minStock.toString(),
      item.maxStock.toString(),
      item.unit,
      item.unitPrice.toLocaleString(),
      item.totalValue.toLocaleString(),
      item.location,
      item.supplier,
      item.status,
      item.lastUpdated
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
      link.setAttribute('download', `재고리포트_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`${filteredItems.length}개의 재고 데이터가 CSV 파일로 내보내졌습니다.`);
    } else {
      alert('파일 다운로드가 지원되지 않는 브라우저입니다.');
    }
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowViewItem(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditItemForm({
      code: item.code,
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString(),
      unit: item.unit,
      unitPrice: item.unitPrice.toString(),
      location: item.location,
      supplier: item.supplier,
      status: item.status,
      // 품목마스터 정보
      itemCategory: item.itemCategory || "",
      standardPrice: (item.standardPrice || 0).toString(),
      moq: (item.moq || 0).toString(),
      safetyStock: (item.safetyStock || 0).toString(),
      leadTimeDays: (item.leadTimeDays || 0).toString(),
    });
    setShowEditItem(true);
  };

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustForm({
      adjustmentType: "increase",
      quantity: "",
      reason: "",
      notes: "",
    });
    setShowAdjustStock(true);
  };

  const createNewItem = () => {
    if (!newItemForm.code || !newItemForm.name || !newItemForm.category) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const currentStock = parseInt(newItemForm.currentStock) || 0;
    const unitPrice = parseInt(newItemForm.unitPrice) || 0;

    const newItem: InventoryItem = {
      id: `INV-${String(inventoryItems.length + 1).padStart(3, '0')}`,
      code: newItemForm.code,
      name: newItemForm.name,
      category: newItemForm.category,
      currentStock: currentStock,
      minStock: parseInt(newItemForm.minStock) || 0,
      maxStock: parseInt(newItemForm.maxStock) || 100,
      unit: newItemForm.unit,
      unitPrice: unitPrice,
      totalValue: currentStock * unitPrice,
      location: newItemForm.location,
      supplier: newItemForm.supplier,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: currentStock === 0 ? "없음" : 
              currentStock < parseInt(newItemForm.minStock) ? "부족" :
              currentStock > parseInt(newItemForm.maxStock) * 0.9 ? "과다" : "정상"
    };

    setInventoryItems([...inventoryItems, newItem]);
    setShowNewItem(false);
    setNewItemForm({
      code: "",
      name: "",
      category: "",
      currentStock: "",
      minStock: "",
      maxStock: "",
      unit: "",
      unitPrice: "",
      location: "",
      supplier: "",
      status: "",
    });
    alert('새 품목이 성공적으로 등록되었습니다.');
  };

  const updateItem = () => {
    if (!selectedItem) return;
    
    if (!editItemForm.code || !editItemForm.name || !editItemForm.category) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const currentStock = parseInt(editItemForm.currentStock) || 0;
    const unitPrice = parseInt(editItemForm.unitPrice) || 0;

    const updatedItem: InventoryItem = {
      ...selectedItem,
      code: editItemForm.code,
      name: editItemForm.name,
      category: editItemForm.category,
      currentStock: currentStock,
      minStock: parseInt(editItemForm.minStock) || 0,
      maxStock: parseInt(editItemForm.maxStock) || 100,
      unit: editItemForm.unit,
      unitPrice: unitPrice,
      totalValue: currentStock * unitPrice,
      location: editItemForm.location,
      supplier: editItemForm.supplier,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: currentStock === 0 ? "없음" : 
              currentStock < parseInt(editItemForm.minStock) ? "부족" :
              currentStock > parseInt(editItemForm.maxStock) * 0.9 ? "과다" : "정상"
    };

    setInventoryItems(inventoryItems.map(item => 
      item.id === selectedItem.id ? updatedItem : item
    ));
    
    setShowEditItem(false);
    setSelectedItem(null);
    alert('품목이 성공적으로 수정되었습니다.');
  };

  const adjustStock = () => {
    if (!selectedItem || !adjustForm.quantity || !adjustForm.reason) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const adjustmentQuantity = parseInt(adjustForm.quantity);
    const newStock = adjustForm.adjustmentType === "increase" 
      ? selectedItem.currentStock + adjustmentQuantity
      : selectedItem.currentStock - adjustmentQuantity;

    if (newStock < 0) {
      alert('재고가 음수가 될 수 없습니다.');
      return;
    }

    const updatedItem: InventoryItem = {
      ...selectedItem,
      currentStock: newStock,
      totalValue: newStock * selectedItem.unitPrice,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: newStock === 0 ? "없음" : 
              newStock < selectedItem.minStock ? "부족" :
              newStock > selectedItem.maxStock * 0.9 ? "과다" : "정상"
    };

    setInventoryItems(inventoryItems.map(item => 
      item.id === selectedItem.id ? updatedItem : item
    ));
    
    setShowAdjustStock(false);
    setSelectedItem(null);
    alert(`재고가 성공적으로 ${adjustForm.adjustmentType === "increase" ? "증가" : "감소"}되었습니다.`);
  };

  const applyAdvancedFilters = () => {
    setShowAdvancedFilter(false);
    alert('고급 필터가 적용되었습니다.');
  };

  const resetFilters = () => {
    setAdvancedFilters({
      supplier: "",
      location: "",
      minStock: "",
      maxStock: "",
      minValue: "",
      maxValue: "",
      dateFrom: "",
      dateTo: "",
    });
    setSelectedCategory("전체");
    setSelectedStatus("전체");
    setSearchTerm("");
  };

  const closeModals = () => {
    setShowAdvancedFilter(false);
    setShowNewItem(false);
    setShowViewItem(false);
    setShowEditItem(false);
    setShowAdjustStock(false);
    setSelectedItem(null);
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
    maxWidth: "600px",
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h1 style={titleStyle}>재고 관리</h1>
            <p style={subtitleStyle}>실시간 재고 현황을 모니터링하고 효율적으로 관리하세요</p>
            <div style={{ marginTop: "0.5rem" }}>
              <Badge variant={selectedDataSource === "erp" ? "default" : selectedDataSource === "massive" ? "destructive" : "secondary"}>
                {selectedDataSource === "erp" ? "닷코 시연 데이터" : 
                 selectedDataSource === "massive" ? "대량 ERP 데이터" : 
                 "생성된 샘플 데이터"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.5rem" }}>{stats.totalItems}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>총 품목수</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#dc2626", marginBottom: "0.5rem" }}>{stats.lowStock}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>부족/품절</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.5rem" }}>{formatCurrency(stats.totalValue)}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>총 재고가치</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "0.5rem" }}>{stats.categories}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>카테고리</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div style={actionsBarStyle}>
        <div style={searchContainerStyle}>
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
              placeholder="품목명, 코드, 공급업체로 검색..."
              style={searchInputStyle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select style={filterSelectStyle} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select style={filterSelectStyle} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="전체">전체 상태</option>
            <option value="정상">정상</option>
            <option value="부족">부족</option>
            <option value="과다">과다</option>
            <option value="없음">없음</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>데이터 소스:</label> */}
            <select 
              style={filterSelectStyle} 
              value={selectedDataSource} 
              onChange={(e) => {
                const newSource = e.target.value as "erp" | "sample" | "massive";
                setSelectedDataSource(newSource);
              }}
            >
              <option value="erp">닷코 시연 데이터</option>
              <option value="sample">생성된 샘플 데이터</option>
              <option value="massive">대량 ERP 데이터 </option>
            </select>
          </div>
          <button style={secondaryButtonStyle} onClick={() => setShowAdvancedFilter(true)}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            고급 필터
          </button>
          <button style={secondaryButtonStyle} onClick={handleInventoryReport}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            재고 리포트
          </button>
          <button style={primaryButtonStyle} onClick={() => setShowNewItem(true)}>
            <Plus style={{ height: "1rem", width: "1rem" }} />새 품목 등록
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={thStyle}>품목</th>
              <th style={thStyle}>재고 수준</th>
              <th style={thStyle}>재고량 (단위)</th>
              <th style={thStyle}>재고 가치</th>
              <th style={thStyle}>위치</th>
              <th style={thStyle}>공급업체</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>최종 수정일</th>
              <th style={thStyle}>작업</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id} style={{ transition: "background-color 0.2s ease" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: "#374151" }}>{item.code}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.id}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.unit}</div>
                </td>
                <td style={tdStyle}>{item.category}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{item.currentStock.toLocaleString()}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    최소: {item.minStock} / 최대: {item.maxStock}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={stockLevelBarStyle}>
                    <div style={stockFillStyle(item.currentStock, item.minStock, item.maxStock)} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    {Math.round((item.currentStock / item.maxStock) * 100)}%
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: statusBadgeStyle(item.status).color }}>{getStatusIcon(item.status)}</span>
                    <span style={statusBadgeStyle(item.status)}>{item.status}</span>
                  </div>
                </td>
                <td style={tdStyle}>{formatCurrency(item.unitPrice)}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(item.totalValue)}</div>
                </td>
                <td style={tdStyle}>{item.location}</td>
                <td style={tdStyle}>{item.supplier}</td>
                <td style={tdStyle}>{item.lastUpdated}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button style={actionButtonStyle} title="보기" onClick={() => handleViewItem(item)}>
                      <Eye style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="편집" onClick={() => handleEditItem(item)}>
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="재고조정" onClick={() => handleAdjustStock(item)}>
                      <Package style={{ height: "1rem", width: "1rem" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        총 {filteredItems.length}개 품목이 표시됨 (전체 {inventoryItems.length}개 중)
      </div>

      {/* 모달들 */}
      {showAdvancedFilter && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>고급 필터</h2>
              <button style={closeButtonStyle} onClick={closeModals}>×</button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>공급업체</label>
                  <input
                    type="text"
                    value={advancedFilters.supplier}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, supplier: e.target.value})}
                    placeholder="공급업체명으로 검색..."
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
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>위치</label>
                  <input
                    type="text"
                    value={advancedFilters.location}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, location: e.target.value})}
                    placeholder="위치로 검색..."
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
                  onClick={resetFilters}
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
      )}

      {/* 새 품목 등록 모달 */}
      {showNewItem && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>새 품목 등록</h2>
              <button style={closeButtonStyle} onClick={closeModals}>×</button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    품목코드 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newItemForm.code}
                    onChange={(e) => setNewItemForm({...newItemForm, code: e.target.value})}
                    placeholder="예: RAW-001"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    품목명 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm({...newItemForm, name: e.target.value})}
                    placeholder="품목명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    카테고리 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({...newItemForm, category: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">카테고리 선택</option>
                    <option value="원자재">원자재</option>
                    <option value="부품">부품</option>
                    <option value="완제품">완제품</option>
                    <option value="공구">공구</option>
                    <option value="소모품">소모품</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>단위</label>
                  <input
                    type="text"
                    value={newItemForm.unit}
                    onChange={(e) => setNewItemForm({...newItemForm, unit: e.target.value})}
                    placeholder="예: 개, 장, 대"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>현재고</label>
                  <input
                    type="number"
                    value={newItemForm.currentStock}
                    onChange={(e) => setNewItemForm({...newItemForm, currentStock: e.target.value})}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최소재고</label>
                  <input
                    type="number"
                    value={newItemForm.minStock}
                    onChange={(e) => setNewItemForm({...newItemForm, minStock: e.target.value})}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최대재고</label>
                  <input
                    type="number"
                    value={newItemForm.maxStock}
                    onChange={(e) => setNewItemForm({...newItemForm, maxStock: e.target.value})}
                    placeholder="100"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>단가</label>
                  <input
                    type="number"
                    value={newItemForm.unitPrice}
                    onChange={(e) => setNewItemForm({...newItemForm, unitPrice: e.target.value})}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>위치</label>
                  <input
                    type="text"
                    value={newItemForm.location}
                    onChange={(e) => setNewItemForm({...newItemForm, location: e.target.value})}
                    placeholder="예: 창고A-1구역"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>공급업체</label>
                <input
                  type="text"
                  value={newItemForm.supplier}
                  onChange={(e) => setNewItemForm({...newItemForm, supplier: e.target.value})}
                  placeholder="공급업체명을 입력하세요"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
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
                  }}
                >
                  취소
                </button>
                <button
                  onClick={createNewItem}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  품목 등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 품목 보기 모달 */}
      {showViewItem && selectedItem && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{selectedItem.name} 상세정보</h2>
              <button style={closeButtonStyle} onClick={closeModals}>×</button>
            </div>
            <div style={modalContentStyle}>
              {/* 기본 정보 */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#374151", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>기본 정보</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>품목코드</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                      {selectedItem.code}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>품목명</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                      {selectedItem.name}
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>품목구분</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                      {selectedItem.itemCategory || "미정"}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>단위</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                      {selectedItem.unit}
                    </div>
                  </div>
                </div>
              </div>

              {/* 품목마스터 정보 */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#374151", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>품목마스터 정보</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>표준단가</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f0f9ff", borderRadius: "0.5rem", fontSize: "0.875rem", color: "#1e40af" }}>
                      ₩{(selectedItem.standardPrice || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>MOQ</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f0fdf4", borderRadius: "0.5rem", fontSize: "0.875rem", color: "#16a34a" }}>
                      {(selectedItem.moq || 0).toLocaleString()} {selectedItem.unit}
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>안전재고</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#fffbeb", borderRadius: "0.5rem", fontSize: "0.875rem", color: "#d97706" }}>
                      {(selectedItem.safetyStock || 0).toLocaleString()} {selectedItem.unit}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>리드타임일</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#fef2f2", borderRadius: "0.5rem", fontSize: "0.875rem", color: "#dc2626" }}>
                      {selectedItem.leadTimeDays || 0}일
                    </div>
                  </div>
                </div>
              </div>

              {/* 재고 정보 */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#374151", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>재고 정보</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>현재고</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                      {selectedItem.currentStock.toLocaleString()} {selectedItem.unit}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>최소재고</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                      {selectedItem.minStock.toLocaleString()} {selectedItem.unit}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>최대재고</label>
                    <div style={{ padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
                      {selectedItem.maxStock.toLocaleString()} {selectedItem.unit}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  onClick={closeModals}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 품목 편집 모달 */}
      {showEditItem && selectedItem && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{selectedItem.name} 편집</h2>
              <button style={closeButtonStyle} onClick={closeModals}>×</button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    품목코드 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editItemForm.code}
                    onChange={(e) => setEditItemForm({...editItemForm, code: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    품목명 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editItemForm.name}
                    onChange={(e) => setEditItemForm({...editItemForm, name: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                    카테고리 <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={editItemForm.category}
                    onChange={(e) => setEditItemForm({...editItemForm, category: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">카테고리 선택</option>
                    <option value="원자재">원자재</option>
                    <option value="부품">부품</option>
                    <option value="완제품">완제품</option>
                    <option value="공구">공구</option>
                    <option value="소모품">소모품</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>단위</label>
                  <input
                    type="text"
                    value={editItemForm.unit}
                    onChange={(e) => setEditItemForm({...editItemForm, unit: e.target.value})}
                    placeholder="예: 개, 장, 대"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>현재고</label>
                  <input
                    type="number"
                    value={editItemForm.currentStock}
                    onChange={(e) => setEditItemForm({...editItemForm, currentStock: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최소재고</label>
                  <input
                    type="number"
                    value={editItemForm.minStock}
                    onChange={(e) => setEditItemForm({...editItemForm, minStock: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>최대재고</label>
                  <input
                    type="number"
                    value={editItemForm.maxStock}
                    onChange={(e) => setEditItemForm({...editItemForm, maxStock: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>단가</label>
                  <input
                    type="number"
                    value={editItemForm.unitPrice}
                    onChange={(e) => setEditItemForm({...editItemForm, unitPrice: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>위치</label>
                  <input
                    type="text"
                    value={editItemForm.location}
                    onChange={(e) => setEditItemForm({...editItemForm, location: e.target.value})}
                    placeholder="예: 창고A-1구역"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>공급업체</label>
                  <input
                    type="text"
                    value={editItemForm.supplier}
                    onChange={(e) => setEditItemForm({...editItemForm, supplier: e.target.value})}
                    placeholder="공급업체명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>상태</label>
                  <select
                    value={editItemForm.status}
                    onChange={(e) => setEditItemForm({...editItemForm, status: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="정상">정상</option>
                    <option value="부족">부족</option>
                    <option value="과다">과다</option>
                    <option value="없음">없음</option>
                  </select>
                </div>
              </div>

              {/* 품목마스터 정보 */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#374151", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>품목마스터 정보</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>품목구분</label>
                    <select
                      value={editItemForm.itemCategory}
                      onChange={(e) => setEditItemForm({...editItemForm, itemCategory: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">품목구분 선택</option>
                      <option value="완제품">완제품</option>
                      <option value="원자재">원자재</option>
                      <option value="부자재">부자재</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>표준단가</label>
                    <input
                      type="number"
                      value={editItemForm.standardPrice}
                      onChange={(e) => setEditItemForm({...editItemForm, standardPrice: e.target.value})}
                      placeholder="표준단가를 입력하세요"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>MOQ</label>
                    <input
                      type="number"
                      value={editItemForm.moq}
                      onChange={(e) => setEditItemForm({...editItemForm, moq: e.target.value})}
                      placeholder="최소주문량"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>안전재고</label>
                    <input
                      type="number"
                      value={editItemForm.safetyStock}
                      onChange={(e) => setEditItemForm({...editItemForm, safetyStock: e.target.value})}
                      placeholder="안전재고량"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>리드타임일</label>
                    <input
                      type="number"
                      value={editItemForm.leadTimeDays}
                      onChange={(e) => setEditItemForm({...editItemForm, leadTimeDays: e.target.value})}
                      placeholder="리드타임(일)"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />
                  </div>
                </div>
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
                  }}
                >
                  취소
                </button>
                <button
                  onClick={updateItem}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  수정 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 재고 조정 모달 */}
      {showAdjustStock && selectedItem && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{selectedItem.name} 재고 조정</h2>
              <button style={closeButtonStyle} onClick={closeModals}>×</button>
            </div>
            <div style={modalContentStyle}>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>현재 재고</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#374151" }}>
                    {selectedItem.currentStock.toLocaleString()} {selectedItem.unit}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>조정 유형</label>
                <select
                  value={adjustForm.adjustmentType}
                  onChange={(e) => setAdjustForm({...adjustForm, adjustmentType: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                  }}
                >
                  <option value="increase">재고 증가</option>
                  <option value="decrease">재고 감소</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                  조정 수량 <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({...adjustForm, quantity: e.target.value})}
                  placeholder="조정할 수량을 입력하세요"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                  조정 사유 <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({...adjustForm, reason: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">사유 선택</option>
                  <option value="입고">입고</option>
                  <option value="출고">출고</option>
                  <option value="재고실사">재고실사</option>
                  <option value="손실">손실</option>
                  <option value="기타">기타</option>
                </select>
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
                  }}
                >
                  취소
                </button>
                <button
                  onClick={adjustStock}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  재고 조정
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
