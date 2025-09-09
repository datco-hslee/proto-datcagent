import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Calculator,
  Layers,
  Upload,
  Download,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  FileText,
  Factory,
  TrendingUp,
} from "lucide-react";
import erpDataJson from '../../DatcoDemoData2.json';

interface BomItem {
  id: string;
  itemCode: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string;
  leadTime: number;
  stockLevel: number;
  minStock: number;
  category: "raw_material" | "component" | "sub_assembly" | "finished_good";
  children?: BomItem[];
  isExpanded?: boolean;
}

interface Product {
  id: string;
  code: string;
  name: string;
  version: string;
  status: "active" | "inactive" | "development";
  totalCost: number;
  bomItems: BomItem[];
  lastUpdated: Date;
  createdBy: string;
  // 생산 오더 정보 추가
  productionStatus?: string;
  productionPriority?: string;
  productionOrderNumber?: string;
  customerName?: string;
  // 품목마스터 정보 추가
  itemCategory?: string;
  unit?: string;
  standardPrice?: number;
  moq?: number;
  safetyStock?: number;
  leadTimeDays?: number;
}

// 생산 오더 기반 실제 제품 데이터
const getProductsFromProductionData = (dynamicData: any): Product[] => {
  return dynamicData.productionOrders.map((plan: any) => {
    // 생산 계획에 따른 BOM 구성
    const bomItems: BomItem[] = [];
    
    // 제품 코드나 이름을 기반으로 BOM 구조 결정
    const productType = plan.productCode || plan.productName;
    
    if (productType.includes("시트") || productType.includes("SEAT")) {
      bomItems.push(
        {
          id: `bom-${plan.id}-1`,
          itemCode: "SR-001",
          itemName: "시트 레일 프레임",
          description: "메인 시트 레일 구조체",
          quantity: Math.ceil(plan.quantity * 0.02), // 생산량의 2%
          unit: "EA",
          unitCost: 15000,
          totalCost: Math.ceil(plan.quantity * 0.02) * 15000,
          supplier: "대창공업",
          leadTime: 7,
          stockLevel: 1200,
          minStock: 200,
          category: "component",
          children: [
            {
              id: `bom-${plan.id}-1-1`,
              itemCode: "ST-001",
              itemName: "강철 파이프",
              description: "고강도 강철 파이프 20mm",
              quantity: Math.ceil(plan.quantity * 0.08), // 생산량의 8%
              unit: "M",
              unitCost: 2500,
              totalCost: Math.ceil(plan.quantity * 0.08) * 2500,
              supplier: "한국정밀",
              leadTime: 3,
              stockLevel: 5000,
              minStock: 1000,
              category: "raw_material",
            },
            {
              id: `bom-${plan.id}-1-2`,
              itemCode: "BR-001",
              itemName: "베어링 세트",
              description: "정밀 볼 베어링",
              quantity: Math.ceil(plan.quantity * 0.16), // 생산량의 16%
              unit: "EA",
              unitCost: 1200,
              totalCost: Math.ceil(plan.quantity * 0.16) * 1200,
              supplier: "동양금속",
              leadTime: 5,
              stockLevel: 800,
              minStock: 100,
              category: "component",
            },
          ],
        },
        {
          id: `bom-${plan.id}-2`,
          itemCode: "MT-001",
          itemName: "전동 모터",
          description: "시트 조절용 DC 모터",
          quantity: Math.ceil(plan.quantity * 0.01), // 생산량의 1%
          unit: "EA",
          unitCost: 25000,
          totalCost: Math.ceil(plan.quantity * 0.01) * 25000,
          supplier: "한국정밀",
          leadTime: 14,
          stockLevel: 150,
          minStock: 30,
          category: "component",
        },
        {
          id: `bom-${plan.id}-3`,
          itemCode: "CT-001",
          itemName: "제어 회로",
          description: "시트 제어 PCB",
          quantity: Math.ceil(plan.quantity * 0.01), // 생산량의 1%
          unit: "EA",
          unitCost: 8000,
          totalCost: Math.ceil(plan.quantity * 0.01) * 8000,
          supplier: "대창공업",
          leadTime: 10,
          stockLevel: 200,
          minStock: 50,
          category: "component",
        }
      );
    } else if (productType.includes("모터") || productType.includes("MOTOR")) {
      bomItems.push(
        {
          id: `bom-${plan.id}-1`,
          itemCode: "MC-001",
          itemName: "모터 코어",
          description: "고효율 모터 코어",
          quantity: Math.ceil(plan.quantity * 0.01), // 생산량의 1%
          unit: "EA",
          unitCost: 12000,
          totalCost: Math.ceil(plan.quantity * 0.01) * 12000,
          supplier: "한국정밀",
          leadTime: 7,
          stockLevel: 300,
          minStock: 60,
          category: "component",
        },
        {
          id: `bom-${plan.id}-2`,
          itemCode: "WR-001",
          itemName: "구리선 코일",
          description: "고순도 구리선",
          quantity: Math.ceil(plan.quantity * 0.5), // 생산량의 50%
          unit: "M",
          unitCost: 150,
          totalCost: Math.ceil(plan.quantity * 0.5) * 150,
          supplier: "동양금속",
          leadTime: 5,
          stockLevel: 2000,
          minStock: 500,
          category: "raw_material",
        }
      );
    } else {
      // 기본 제품 (레일, 기타 부품)
      bomItems.push(
        {
          id: `bom-${plan.id}-1`,
          itemCode: "RL-001",
          itemName: "슬라이드 레일",
          description: "정밀 슬라이드 레일",
          quantity: Math.ceil(plan.quantity * 0.02), // 생산량의 2%
          unit: "EA",
          unitCost: 8000,
          totalCost: Math.ceil(plan.quantity * 0.02) * 8000,
          supplier: "대창공업",
          leadTime: 7,
          stockLevel: 400,
          minStock: 80,
          category: "component",
        }
      );
    }

    const totalCost = bomItems.reduce((sum, item) => sum + item.totalCost, 0);

    return {
      id: plan.id,
      code: plan.productCode || plan.id.toUpperCase().replace('-', ''),
      name: plan.productName,
      version: "v1.0",
      status: plan.status === "진행중" ? "active" : plan.status === "계획" ? "development" : "inactive",
      totalCost,
      bomItems,
      lastUpdated: new Date(),
      createdBy: "생산관리팀",
      // 생산 오더 정보 추가
      productionStatus: plan.status,
      productionPriority: plan.priority,
      productionOrderNumber: plan.orderNumber,
      customerName: plan.customerName || "고객정보없음",
    };
  });
};

// ERP JSON 데이터를 기반으로 제품 목록 생성 (생산오더 페이지와 동일한 로직 사용)
const getProductsFromERPData = (): Product[] => {
  const products: Product[] = [];
  const bomMap = new Map<string, any[]>();
  const itemMap = new Map<string, any>();
  
  // 품목마스터 데이터를 맵으로 구성
  erpDataJson.sheets.품목마스터?.forEach((item: any) => {
    itemMap.set(item.품목코드, item);
  });
  
  // BOM 데이터를 상위품목별로 그룹화
  erpDataJson.sheets.BOM?.forEach((bom: any) => {
    const parentCode = bom.상위품목코드;
    if (!bomMap.has(parentCode)) {
      bomMap.set(parentCode, []);
    }
    bomMap.get(parentCode)!.push(bom);
  });
  
  // 작업지시 데이터를 기반으로 제품 생성 (생산오더 페이지와 동일)
  erpDataJson.sheets.작업지시?.forEach((workOrder: any) => {
    const item = itemMap.get(workOrder.품목코드);
    if (!item) return;
    
    const bomItems: BomItem[] = [];
    const bomData = bomMap.get(workOrder.품목코드) || [];
    
    // BOM 구조 생성
    bomData.forEach((bom: any, index: number) => {
      const childItem = itemMap.get(bom.하위품목코드);
      if (childItem) {
        bomItems.push({
          id: `bom-${workOrder.작업지시번호}-${index}`,
          itemCode: bom.하위품목코드,
          itemName: childItem.품목명,
          description: `${childItem.품목명} - ${childItem.품목구분}`,
          quantity: bom.소요량,
          unit: bom.단위 || "EA",
          unitCost: childItem.표준단가 || 0,
          totalCost: (childItem.표준단가 || 0) * bom.소요량,
          supplier: "ERP 공급사",
          leadTime: 7,
          stockLevel: Math.floor(Math.random() * 1000) + 100,
          minStock: 50,
          category: childItem.품목구분 === "원자재" ? "raw_material" : "component",
        });
      }
    });
    
    const totalCost = bomItems.reduce((sum, item) => sum + item.totalCost, 0);
    
    // 생산오더 페이지와 동일한 상태 매핑 로직 사용
    const status = workOrder.상태 === "RELEASED" ? "active" : 
                  workOrder.상태 === "PLANNED" ? "development" : 
                  workOrder.상태 === "COMPLETED" ? "inactive" : "development";
    
    const productionStatus = workOrder.상태 === "RELEASED" ? "진행중" : 
                            workOrder.상태 === "PLANNED" ? "계획" : 
                            workOrder.상태 === "COMPLETED" ? "완료" : "계획";
    
    products.push({
      id: workOrder.작업지시번호,
      code: workOrder.품목코드,
      name: item.품목명,
      version: "v1.0",
      status: status,
      totalCost: totalCost || item.표준단가 || 0,
      bomItems,
      lastUpdated: new Date(),
      createdBy: "ERP 시스템",
      productionStatus: productionStatus,
      productionPriority: "보통",
      productionOrderNumber: workOrder.작업지시번호,
      customerName: "ERP 고객",
      // 품목마스터 정보 추가
      itemCategory: item.품목구분,
      unit: item.단위,
      standardPrice: item.표준단가,
      moq: item.MOQ,
      safetyStock: item.안전재고,
      leadTimeDays: item.리드타임일,
    });
  });
  
  // 작업지시가 없는 생산계획도 추가 (계획 상태로)
  erpDataJson.sheets.생산계획?.forEach((plan: any) => {
    const item = itemMap.get(plan.품목코드);
    if (!item) return;
    
    // 이미 작업지시가 있는 품목은 제외
    const hasWorkOrder = erpDataJson.sheets.작업지시?.some((wo: any) => wo.품목코드 === plan.품목코드);
    if (hasWorkOrder) return;
    
    const bomItems: BomItem[] = [];
    const bomData = bomMap.get(plan.품목코드) || [];
    
    // BOM 구조 생성
    bomData.forEach((bom: any, index: number) => {
      const childItem = itemMap.get(bom.하위품목코드);
      if (childItem) {
        bomItems.push({
          id: `bom-${plan.계획번호}-${index}`,
          itemCode: bom.하위품목코드,
          itemName: childItem.품목명,
          description: `${childItem.품목명} - ${childItem.품목구분}`,
          quantity: bom.소요량,
          unit: bom.단위 || "EA",
          unitCost: childItem.표준단가 || 0,
          totalCost: (childItem.표준단가 || 0) * bom.소요량,
          supplier: "ERP 공급사",
          leadTime: 7,
          stockLevel: Math.floor(Math.random() * 1000) + 100,
          minStock: 50,
          category: childItem.품목구분 === "원자재" ? "raw_material" : "component",
        });
      }
    });
    
    const totalCost = bomItems.reduce((sum, item) => sum + item.totalCost, 0);
    
    products.push({
      id: plan.계획번호,
      code: plan.품목코드,
      name: item.품목명,
      version: "v1.0",
      status: "development", // 생산계획은 항상 개발중(계획) 상태
      totalCost: totalCost || item.표준단가 || 0,
      bomItems,
      lastUpdated: new Date(),
      createdBy: "ERP 시스템",
      productionStatus: "계획",
      productionPriority: "보통",
      productionOrderNumber: "",
      customerName: "ERP 고객",
      // 품목마스터 정보 추가
      itemCategory: item.품목구분,
      unit: item.단위,
      standardPrice: item.표준단가,
      moq: item.MOQ,
      safetyStock: item.안전재고,
      leadTimeDays: item.리드타임일,
    });
  });
  
  return products;
};

export function BomManagementPage() {
  const [selectedDataSource, setSelectedDataSource] = useState<string>("erp");
  
  // Generate sample BOM products (original generated data)
  const getSampleBOMProducts = (): Product[] => {
    return [
      {
        id: "PROD-001",
        code: "SSM-001",
        name: "스마트 센서 모듈",
        version: "v1.2",
        status: "active",
        totalCost: 125000,
        lastUpdated: new Date("2024-09-01"),
        createdBy: "김개발",
        bomItems: [
          {
            id: "BOM-001",
            itemCode: "MCU-001",
            itemName: "MCU 칩셋",
            description: "32비트 ARM Cortex-M4 마이크로컨트롤러",
            quantity: 1,
            unit: "EA",
            unitCost: 25000,
            totalCost: 25000,
            supplier: "삼성전자",
            leadTime: 14,
            stockLevel: 450,
            minStock: 100,
            category: "component"
          },
          {
            id: "BOM-002",
            itemCode: "SENS-001",
            itemName: "센서 보드",
            description: "온도/습도 센서 통합 보드",
            quantity: 1,
            unit: "EA",
            unitCost: 35000,
            totalCost: 35000,
            supplier: "LG이노텍",
            leadTime: 10,
            stockLevel: 320,
            minStock: 50,
            category: "component"
          },
          {
            id: "BOM-003",
            itemCode: "PCB-001",
            itemName: "메인 PCB",
            description: "4층 PCB 기판",
            quantity: 1,
            unit: "EA",
            unitCost: 15000,
            totalCost: 15000,
            supplier: "삼성전기",
            leadTime: 7,
            stockLevel: 800,
            minStock: 200,
            category: "raw_material"
          }
        ],
        itemCategory: "완제품",
        standardPrice: 85000,
        moq: 100,
        safetyStock: 50,
        leadTimeDays: 7
      },
      {
        id: "PROD-002",
        code: "IOT-002",
        name: "IoT 컨트롤러",
        version: "v2.0",
        status: "development",
        totalCost: 180000,
        lastUpdated: new Date("2024-08-28"),
        createdBy: "이설계",
        bomItems: [
          {
            id: "BOM-004",
            itemCode: "CTRL-001",
            itemName: "제어 보드",
            description: "WiFi/Bluetooth 통합 제어 모듈",
            quantity: 1,
            unit: "EA",
            unitCost: 45000,
            totalCost: 45000,
            supplier: "SK하이닉스",
            leadTime: 12,
            stockLevel: 280,
            minStock: 80,
            category: "component"
          },
          {
            id: "BOM-005",
            itemCode: "CASE-001",
            itemName: "케이스",
            description: "알루미늄 방열 케이스",
            quantity: 1,
            unit: "EA",
            unitCost: 28000,
            totalCost: 28000,
            supplier: "동양케이스",
            leadTime: 5,
            stockLevel: 350,
            minStock: 100,
            category: "component"
          }
        ],
        itemCategory: "완제품",
        standardPrice: 125000,
        moq: 50,
        safetyStock: 30,
        leadTimeDays: 10
      }
    ];
  };

  // Get products based on selected data source
  const getCurrentProducts = (): Product[] => {
    return selectedDataSource === "sample" ? getSampleBOMProducts() : getProductsFromERPData();
  };

  const PRODUCTS = useMemo(() => getCurrentProducts(), [selectedDataSource]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Update selected product when products change
  React.useEffect(() => {
    const products = getCurrentProducts();
    setSelectedProduct(products[0] || null);
  }, [selectedDataSource]);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [showMaterialCalculation, setShowMaterialCalculation] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [productionQuantity, setProductionQuantity] = useState<number>(100);
  const [showNewBomModal, setShowNewBomModal] = useState(false);
  const [newBomData, setNewBomData] = useState({
    productCode: "",
    productName: "",
    description: "",
    version: "v1.0",
    totalCost: 0,
    bomItemCount: 0
  });

  // Handler functions
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        alert(`${file.name} 파일을 가져오는 기능을 구현 중입니다.`);
      }
    };
    input.click();
  };

  const handleExport = () => {
    if (!selectedProduct) return;
    
    const exportData = {
      product: selectedProduct,
      exportDate: new Date().toISOString(),
      bomStructure: selectedProduct.bomItems
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `BOM_${selectedProduct.code}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopyItem = (item: BomItem) => {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    alert(`${item.itemName} 정보가 클립보드에 복사되었습니다.`);
  };

  const handleEditItem = (itemId: string) => {
    setEditingItem(itemId);
  };

  const handleEditProduct = (productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
      setNewBomData({
        productCode: product.code,
        productName: product.name,
        description: `${product.name} 편집`,
        version: product.version,
        totalCost: product.totalCost,
        bomItemCount: product.bomItems.length
      });
      setShowNewBomModal(true);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (product && window.confirm(`"${product.name}" BOM을 삭제하시겠습니까?`)) {
      // 실제 구현에서는 상태 관리를 통해 제품을 삭제해야 합니다
      alert(`"${product.name}" BOM이 삭제되었습니다.`);
      // 선택된 제품이 삭제된 제품이면 선택 해제
      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }
    }
  };

  const handleSaveEdit = () => {
    setEditingItem(null);
    alert('변경사항이 저장되었습니다.');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDeleteBomItem = (itemId: string) => {
    if (window.confirm('이 BOM 항목을 삭제하시겠습니까?')) {
      // 실제 구현에서는 상태 관리를 통해 BOM 항목을 삭제해야 합니다
      alert('BOM 항목이 삭제되었습니다.');
      // 편집 중인 항목이 삭제된 항목이면 편집 모드 해제
      if (editingItem === itemId) {
        setEditingItem(null);
      }
    }
  };

  const createNewBom = () => {
    if (!newBomData.productCode || !newBomData.productName) {
      alert('제품 코드와 제품명을 입력해주세요.');
      return;
    }

    const newProduct: Product = {
      id: `prod-new-${Date.now()}`,
      code: newBomData.productCode,
      name: newBomData.productName,
      version: newBomData.version,
      status: "development",
      totalCost: newBomData.totalCost,
      bomItems: Array(newBomData.bomItemCount).fill(null).map((_, index) => ({
        id: `bom-new-${Date.now()}-${index}`,
        itemCode: `ITEM-${String(index + 1).padStart(3, '0')}`,
        itemName: `새 항목 ${index + 1}`,
        description: "새로 생성된 BOM 항목",
        quantity: 1,
        unit: "EA",
        unitCost: Math.floor(newBomData.totalCost / (newBomData.bomItemCount || 1)),
        totalCost: Math.floor(newBomData.totalCost / (newBomData.bomItemCount || 1)),
        supplier: "미정",
        leadTime: 7,
        stockLevel: 100,
        minStock: 20,
        category: "component" as const,
      })),
      lastUpdated: new Date(),
      createdBy: "사용자",
    };

    // 새 제품을 PRODUCTS 리스트에 추가하는 로직은 실제 상태 관리에서 처리해야 합니다
    setSelectedProduct(newProduct);
    setShowNewBomModal(false);
    setNewBomData({
      productCode: "",
      productName: "",
      description: "",
      version: "v1.0",
      totalCost: 0,
      bomItemCount: 0
    });
    alert(`새 BOM "${newProduct.name}"이 생성되었습니다.\n총 원가: ${formatCurrency(newProduct.totalCost)}\nBOM 항목 수: ${newProduct.bomItems.length}개`);
  };

  // Helper function to find item by code in BOM tree
  const findItemByCode = (items: BomItem[], code: string): BomItem | null => {
    for (const item of items) {
      if (item.itemCode === code) {
        return item;
      }
      if (item.children) {
        const found = findItemByCode(item.children, code);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getCategoryColor = (category: BomItem["category"]) => {
    switch (category) {
      case "raw_material":
        return "bg-blue-100 text-blue-600";
      case "component":
        return "bg-green-100 text-green-600";
      case "sub_assembly":
        return "bg-orange-100 text-orange-600";
      case "finished_good":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getCategoryLabel = (category: BomItem["category"]) => {
    switch (category) {
      case "raw_material":
        return "원자재";
      case "component":
        return "부품";
      case "sub_assembly":
        return "서브조립품";
      case "finished_good":
        return "완제품";
      default:
        return category;
    }
  };

  const getStockStatus = (stockLevel: number, minStock: number) => {
    if (stockLevel <= minStock) return "danger";
    if (stockLevel <= minStock * 2) return "warning";
    return "safe";
  };

  const getStockIcon = (status: string) => {
    switch (status) {
      case "danger":
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-3 w-3 text-orange-600" />;
      case "safe":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderBomTreeInline = (item: BomItem, level: number): React.ReactElement => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const stockStatus = getStockStatus(item.stockLevel, item.minStock);

    return (
      <div key={item.id}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 1fr 0.5fr 0.8fr",
            gap: "1rem",
            padding: "0.75rem",
            alignItems: "center",
            fontSize: "0.875rem",
            borderBottom: "1px solid #f3f4f6",
            cursor: hasChildren ? "pointer" : "default",
            paddingLeft: `${level * 1.5 + 0.75}rem`
          }}
          onClick={() => hasChildren && toggleExpand(item.id)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {hasChildren && (
              <div style={{ width: "1rem" }}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 500 }}>{item.itemCode}</p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.itemName}</p>
            </div>
          </div>
          <div>
            <p>{item.description}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 500 }}>{item.quantity}</p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.unit}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 500 }}>{formatCurrency(item.unitCost)}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 500 }}>{formatCurrency(item.totalCost)}</p>
          </div>
          <div>
            <span style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
              fontSize: "0.75rem",
              fontWeight: 500,
              backgroundColor: getCategoryColor(item.category).split(' ')[0] === 'bg-blue-100' ? '#dbeafe' : 
                             getCategoryColor(item.category).split(' ')[0] === 'bg-green-100' ? '#dcfce7' :
                             getCategoryColor(item.category).split(' ')[0] === 'bg-orange-100' ? '#fed7aa' : '#f3f4f6',
              color: getCategoryColor(item.category).split(' ')[1] === 'text-blue-600' ? '#2563eb' :
                     getCategoryColor(item.category).split(' ')[1] === 'text-green-600' ? '#16a34a' :
                     getCategoryColor(item.category).split(' ')[1] === 'text-orange-600' ? '#ea580c' : '#6b7280'
            }}>
              {getCategoryLabel(item.category)}
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
              {getStockIcon(stockStatus)}
              <span style={{
                fontSize: "0.75rem",
                color: stockStatus === "danger" ? "#dc2626" : stockStatus === "warning" ? "#ea580c" : "#16a34a"
              }}>
                {item.stockLevel}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "center", color: "#6b7280" }}>
            <p>{item.leadTime}일</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
              <button
                style={{
                  background: "none",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.25rem",
                  padding: "0.25rem",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditItem(item.id);
                }}
                title="편집"
              >
                <Edit size={12} />
              </button>
              <button
                style={{
                  background: "none",
                  border: "1px solid #dc2626",
                  borderRadius: "0.25rem",
                  padding: "0.25rem",
                  cursor: "pointer",
                  color: "#dc2626"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBomItem(item.id);
                }}
                title="삭제"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && item.children && 
          item.children.map(child => renderBomTreeInline(child, level + 1))
        }
      </div>
    );
  };

  const calculateTotalRequirement = (items: BomItem[], multiplier: number = 1): { [key: string]: number } => {
    const requirements: { [key: string]: number } = {};

    items.forEach((item) => {
      const totalQty = item.quantity * multiplier;
      if (requirements[item.itemCode]) {
        requirements[item.itemCode] += totalQty;
      } else {
        requirements[item.itemCode] = totalQty;
      }

      if (item.children) {
        const childRequirements = calculateTotalRequirement(item.children, totalQty);
        Object.keys(childRequirements).forEach((code) => {
          if (requirements[code]) {
            requirements[code] += childRequirements[code];
          } else {
            requirements[code] = childRequirements[code];
          }
        });
      }
    });

    return requirements;
  };

  // Calculate BOM metrics
  const bomMetrics = useMemo(() => {
    const totalProducts = PRODUCTS.length;
    const activeProducts = PRODUCTS.filter(p => p.status === "active").length;
    const developmentProducts = PRODUCTS.filter(p => p.status === "development").length;
    const inactiveProducts = PRODUCTS.filter(p => p.status === "inactive").length;
    const totalCost = PRODUCTS.reduce((sum, p) => sum + p.totalCost, 0);
    const avgCostPerProduct = totalProducts > 0 ? Math.round(totalCost / totalProducts) : 0;

    return [
      {
        label: "총 제품",
        value: `${totalProducts}개`,
        change: 0,
        icon: Package,
        color: "gray",
      },
      {
        label: "진행중",
        value: `${activeProducts}개`,
        change: 0,
        icon: Factory,
        color: "green",
      },
      {
        label: "계획중",
        value: `${developmentProducts}개`,
        change: 0,
        icon: AlertTriangle,
        color: "orange",
      },
      {
        label: "비활성",
        value: `${inactiveProducts}개`,
        change: 0,
        icon: CheckCircle,
        color: "gray",
      },
      {
        label: "평균 제품 원가",
        value: formatCurrency(avgCostPerProduct),
        change: 0,
        icon: TrendingUp,
        color: "purple",
      },
    ];
  }, [PRODUCTS]);

  // Filter BOM items based on search term
  const filteredBomItems = useMemo(() => {
    if (!selectedProduct || !searchTerm) return selectedProduct?.bomItems || [];
    
    const filterItems = (items: BomItem[]): BomItem[] => {
      return items.filter(item => 
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      ).map(item => ({
        ...item,
        children: item.children ? filterItems(item.children) : undefined
      }));
    };
    
    return filterItems(selectedProduct.bomItems);
  }, [selectedProduct, searchTerm]);

  // 스타일 정의 (생산 오더 페이지와 동일)
  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb",
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    backgroundColor: "white",
    color: "#374151",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    width: "100%",
  };

  const badgeStyle: React.CSSProperties = {
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: 500,
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    maxWidth: "32rem",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
  };

  return (
    <div style={{ padding: "1.5rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>BOM 관리</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p style={{ color: "#6b7280" }}>제품 구성 정보와 자재 소요량을 관리하세요</p>
            <span style={{
              padding: "0.25rem 0.75rem",
              backgroundColor: selectedDataSource === "erp" ? "#dbeafe" : "#fef3c7",
              color: selectedDataSource === "erp" ? "#1e40af" : "#92400e",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500
            }}>
              {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
            </span>
          </div>
          <div style={{ marginTop: "0.75rem", padding: "0.75rem", backgroundColor: "#f0f9ff", borderRadius: "0.5rem", border: "1px solid #0ea5e9" }}>
            <p style={{ fontSize: "0.875rem", color: "#0369a1", fontWeight: 500 }}>📋 BOM 상태 안내</p>
            <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#0369a1" }}>
              <span style={{ fontWeight: 500 }}>• 활성 (진행중):</span> 현재 생산이 진행 중인 제품의 BOM<br/>
              <span style={{ fontWeight: 500 }}>• 기획 (계획중):</span> 생산 계획 단계에 있는 제품의 BOM<br/>
              <span style={{ fontWeight: 500 }}>• 비활성 (완료):</span> 생산이 완료되었거나 중단된 제품의 BOM
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button style={secondaryButtonStyle} onClick={handleImport}>
            <Upload size={16} />
            가져오기
          </button>
          <button style={secondaryButtonStyle} onClick={handleExport}>
            <Download size={16} />
            내보내기
          </button>
          <button style={primaryButtonStyle} onClick={() => setShowNewBomModal(true)}>
            <Plus size={16} />
            새 BOM 생성
          </button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {bomMetrics.map((metric, index) => (
          <div key={index} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 500, color: "#6b7280" }}>{metric.label}</h3>
              <metric.icon size={16} style={{ color: `var(--${metric.color}-600, #6b7280)` }} />
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{metric.value}</div>
            {metric.change !== 0 && (
              <p style={{ fontSize: "0.75rem", color: metric.change > 0 ? "#10b981" : "#ef4444" }}>
                {metric.change > 0 ? "+" : ""}
                {metric.change}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 제품 목록 - 카드 그리드 레이아웃 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem", alignItems: "stretch" }}>
        {PRODUCTS.map((product) => {
          const getStatusColor = (status: string) => {
            switch (status) {
              case "active": return "#10b981";
              case "development": return "#f59e0b";
              case "inactive": return "#6b7280";
              default: return "#6b7280";
            }
          };
          
          const getStatusLabel = (status: string) => {
            switch (status) {
              case "active": return "진행중";
              case "development": return "계획중";
              case "inactive": return "비활성";
              default: return status;
            }
          };
          
          const getProductionStatusColor = (status: string) => {
            switch (status) {
              case "진행중": return "#10b981";
              case "계획": return "#3b82f6";
              case "완료": return "#6b7280";
              case "지연": return "#ef4444";
              default: return "#6b7280";
            }
          };
          
          const getPriorityColor = (priority: string) => {
            switch (priority) {
              case "높음": return "#ef4444";
              case "보통": return "#f59e0b";
              case "낮음": return "#10b981";
              default: return "#6b7280";
            }
          };

          const isSelected = selectedProduct?.id === product.id;
          
          return (
            <div 
              key={product.id} 
              style={{
                ...cardStyle,
                height: "340px",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                border: isSelected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                backgroundColor: isSelected ? "#eff6ff" : "white"
              }}
              onClick={() => setSelectedProduct(product)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = cardStyle.boxShadow || "";
                }
              }}
            >
              <div style={{ paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ 
                      fontSize: "0.95rem", 
                      fontWeight: 600, 
                      color: "#111827", 
                      marginBottom: "0.25rem",
                      lineHeight: "1.2",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>{product.name}</h3>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{product.code} - {product.version}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      backgroundColor: getStatusColor(product.status) + "20", 
                      color: getStatusColor(product.status)
                    }}>
                      {getStatusLabel(product.status)}
                    </span>
                    <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", backgroundColor: getStatusColor(product.status) }} />
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.8rem" }}>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>표준단가</p>
                    <p style={{ fontWeight: 600, color: "#10b981" }}>{formatCurrency(product.standardPrice || 0)}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>MOQ</p>
                    <p style={{ fontWeight: 500 }}>{product.moq?.toLocaleString() || "미정"} {product.unit || "EA"}</p>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.8rem" }}>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>안전재고</p>
                    <p style={{ fontWeight: 500 }}>{product.safetyStock?.toLocaleString() || "미정"} {product.unit || "EA"}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>리드타임</p>
                    <p style={{ fontWeight: 500 }}>{product.leadTimeDays || "미정"}일</p>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.8rem" }}>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>생산 진행상태</p>
                    <span style={{
                      padding: "0.2rem 0.4rem",
                      borderRadius: "0.2rem",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      backgroundColor: getProductionStatusColor(product.productionStatus || "") + "20",
                      color: getProductionStatusColor(product.productionStatus || ""),
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "inline-block",
                      maxWidth: "100%"
                    }}>
                      {product.productionStatus || "미정"}
                    </span>
                  </div>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>우선순위</p>
                    <span style={{
                      padding: "0.2rem 0.4rem",
                      borderRadius: "0.2rem",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      backgroundColor: getPriorityColor(product.productionPriority || "") + "20",
                      color: getPriorityColor(product.productionPriority || ""),
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "inline-block",
                      maxWidth: "100%"
                    }}>
                      {product.productionPriority || "미정"}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.8rem" }}>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>생산오더번호</p>
                    <p style={{ fontWeight: 500, fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.productionOrderNumber || "미정"}</p>
                  </div>
                  <div>
                    <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>BOM 항목 수</p>
                    <p style={{ fontWeight: 500 }}>{product.bomItems.length}개</p>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: "auto", 
                  display: "flex", 
                  gap: "0.25rem", 
                  paddingTop: "0.75rem",
                  justifyContent: "flex-end"
                }}>
                  <button 
                    style={{
                      backgroundColor: "transparent",
                      color: "#6b7280",
                      padding: "0.25rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      transition: "all 0.15s ease"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProduct(product.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                      e.currentTarget.style.color = "#374151";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#6b7280";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                    title="편집"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    style={{
                      backgroundColor: "transparent",
                      color: "#6b7280",
                      padding: "0.25rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      transition: "all 0.15s ease"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(product.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fef2f2";
                      e.currentTarget.style.color = "#dc2626";
                      e.currentTarget.style.borderColor = "#fecaca";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#6b7280";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                    title="삭제"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 선택된 제품 상세 정보 */}
      {selectedProduct && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* 제품 정보 카드 */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", marginBottom: "0.25rem" }}>{selectedProduct.name}</h2>
                <p style={{ color: "#6b7280" }}>{selectedProduct.code} - {selectedProduct.version}</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>생산오더: {selectedProduct.productionOrderNumber || "미정"} | 고객: {selectedProduct.customerName || "미정"}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>총 원가</p>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>{formatCurrency(selectedProduct.totalCost)}</p>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", fontSize: "0.875rem", marginBottom: "1rem" }}>
              <div>
                <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>BOM 상태</p>
                <span style={{
                  ...badgeStyle,
                  backgroundColor: selectedProduct.status === "active" ? "#10b98120" : selectedProduct.status === "development" ? "#f59e0b20" : "#6b728020",
                  color: selectedProduct.status === "active" ? "#10b981" : selectedProduct.status === "development" ? "#f59e0b" : "#6b7280"
                }}>
                  {selectedProduct.status === "active" ? "진행중" : selectedProduct.status === "development" ? "계획중" : "비활성"}
                </span>
              </div>
              <div>
                <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>생산 진행상태</p>
                <span style={{
                  ...badgeStyle,
                  backgroundColor: (selectedProduct.productionStatus === "진행중" ? "#10b981" : selectedProduct.productionStatus === "계획" ? "#3b82f6" : selectedProduct.productionStatus === "지연" ? "#ef4444" : "#6b7280") + "20",
                  color: selectedProduct.productionStatus === "진행중" ? "#10b981" : selectedProduct.productionStatus === "계획" ? "#3b82f6" : selectedProduct.productionStatus === "지연" ? "#ef4444" : "#6b7280"
                }}>
                  {selectedProduct.productionStatus || "미정"}
                </span>
              </div>
              <div>
                <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>우선순위</p>
                <span style={{
                  ...badgeStyle,
                  backgroundColor: (selectedProduct.productionPriority === "높음" ? "#ef4444" : selectedProduct.productionPriority === "보통" ? "#f59e0b" : "#10b981") + "20",
                  color: selectedProduct.productionPriority === "높음" ? "#ef4444" : selectedProduct.productionPriority === "보통" ? "#f59e0b" : "#10b981"
                }}>
                  {selectedProduct.productionPriority || "미정"}
                </span>
              </div>
              <div>
                <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>품목구분</p>
                <p style={{ fontWeight: 500 }}>{selectedProduct.itemCategory || "미정"}</p>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", fontSize: "0.875rem" }}>
              <div>
                <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>표준단가</p>
                <p style={{ fontWeight: 500, color: "#10b981" }}>{formatCurrency(selectedProduct.standardPrice || 0)}</p>
              </div>
              <div>
                <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>MOQ</p>
                <p style={{ fontWeight: 500 }}>{selectedProduct.moq?.toLocaleString() || "미정"} {selectedProduct.unit || "EA"}</p>
              </div>
              <div>
                <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>안전재고</p>
                <p style={{ fontWeight: 500 }}>{selectedProduct.safetyStock?.toLocaleString() || "미정"} {selectedProduct.unit || "EA"}</p>
              </div>
              <div>
                <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>리드타임</p>
                <p style={{ fontWeight: 500 }}>{selectedProduct.leadTimeDays || "미정"}일</p>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <button 
              style={showCostAnalysis ? primaryButtonStyle : secondaryButtonStyle}
              onClick={() => setShowCostAnalysis(!showCostAnalysis)}
            >
              <Calculator size={16} />
              원가 분석
            </button>
            <button 
              style={showMaterialCalculation ? primaryButtonStyle : secondaryButtonStyle}
              onClick={() => setShowMaterialCalculation(!showMaterialCalculation)}
            >
              <Package size={16} />
              자재 소요량 계산
            </button>
            {/* 데이터 소스 선택 */}
            <select
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                backgroundColor: "white",
                minWidth: "160px"
              }}
            >
              <option value="erp">닷코 시연 데이터</option>
              <option value="sample">생성된 샘플 데이터</option>
            </select>
            
            <div style={{ position: "relative", flex: 1, maxWidth: "24rem" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input 
                placeholder="BOM 항목 검색..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{ ...inputStyle, paddingLeft: "2.5rem" }}
              />
            </div>
          </div>

          {/* 자재 소요량 계산 패널 */}
          {showMaterialCalculation && (
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Package size={20} />
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>자재 소요량 계산</h3>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>생산 수량:</label>
                  <input
                    type="number"
                    value={productionQuantity}
                    onChange={(e) => setProductionQuantity(Number(e.target.value))}
                    style={{ ...inputStyle, width: "8rem" }}
                    min="1"
                  />
                  <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>EA</span>
                </div>
                
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", overflow: "hidden" }}>
                  <div style={{ backgroundColor: "#f9fafb", padding: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                    <h4 style={{ fontWeight: 600 }}>총 자재 소요량</h4>
                  </div>
                  <div style={{ padding: "0.75rem" }}>
                    {selectedProduct && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {Object.entries(calculateTotalRequirement(selectedProduct.bomItems, productionQuantity)).map(([itemCode, quantity]) => {
                          const item = findItemByCode(selectedProduct.bomItems, itemCode);
                          return (
                            <div key={itemCode} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6" }}>
                              <div>
                                <p style={{ fontWeight: 500 }}>{item?.itemName || itemCode}</p>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{item?.description}</p>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <p style={{ fontWeight: "bold" }}>{quantity.toLocaleString()} {item?.unit}</p>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                  재고: {item?.stockLevel?.toLocaleString() || 0} {item?.unit}
                                </p>
                                {item && item.stockLevel < quantity && (
                                  <p style={{ fontSize: "0.875rem", color: "#dc2626", fontWeight: 500 }}>
                                    부족: {(quantity - item.stockLevel).toLocaleString()} {item.unit}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 원가 분석 패널 */}
          {showCostAnalysis && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>원가 분석</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <h4 style={{ fontWeight: 600 }}>카테고리별 원가</h4>
                  {["raw_material", "component", "sub_assembly"].map((category) => {
                    const items = selectedProduct.bomItems.filter((item) => item.category === category);
                    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
                    const percentage = (totalCost / selectedProduct.totalCost) * 100;

                    return (
                      <div key={category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.875rem" }}>{getCategoryLabel(category as BomItem["category"])}</span>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontWeight: 500 }}>{formatCurrency(totalCost)}</p>
                          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <h4 style={{ fontWeight: 600 }}>공급업체별 원가</h4>
                  {Array.from(new Set(selectedProduct.bomItems.map((item) => item.supplier))).map((supplier) => {
                    const items = selectedProduct.bomItems.filter((item) => item.supplier === supplier);
                    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
                    const percentage = (totalCost / selectedProduct.totalCost) * 100;

                    return (
                      <div key={supplier} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.875rem" }}>{supplier}</span>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontWeight: 500 }}>{formatCurrency(totalCost)}</p>
                          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <h4 style={{ fontWeight: 600 }}>재고 위험 분석</h4>
                  {selectedProduct.bomItems
                    .filter((item) => getStockStatus(item.stockLevel, item.minStock) !== "safe")
                    .map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.875rem" }}>{item.itemName}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          {getStockIcon(getStockStatus(item.stockLevel, item.minStock))}
                          <span style={{ fontSize: "0.75rem" }}>
                            {item.stockLevel}/{item.minStock}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* BOM 구조 */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Layers size={20} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>BOM 구조</h3>
            </div>
            
            {/* 헤더 */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 1fr 0.5fr 0.8fr", 
              gap: "1rem", 
              padding: "0.75rem", 
              backgroundColor: "#f9fafb", 
              fontSize: "0.875rem", 
              fontWeight: 500, 
              color: "#6b7280", 
              borderBottom: "1px solid #e5e7eb" 
            }}>
              <div>품목코드/명</div>
              <div>설명</div>
              <div style={{ textAlign: "center" }}>수량</div>
              <div style={{ textAlign: "right" }}>단가</div>
              <div style={{ textAlign: "right" }}>금액</div>
              <div>카테고리</div>
              <div style={{ textAlign: "center" }}>재고</div>
              <div style={{ textAlign: "center" }}>납기</div>
              <div style={{ textAlign: "center" }}>작업</div>
            </div>

            {/* BOM 트리 */}
            <div style={{ border: "1px solid #e5e7eb", borderTop: "none" }}>
              {filteredBomItems.map((item) => renderBomTreeInline(item, 0))}
            </div>
          </div>

        </div>
      )}

      {/* 새 BOM 생성 모달 */}
      {showNewBomModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={20} />
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>새 BOM 생성</h3>
              </div>
              <button 
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem" }}
                onClick={() => setShowNewBomModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>제품 코드</label>
                  <input 
                    placeholder="예: PROD-001" 
                    value={newBomData.productCode}
                    onChange={(e) => setNewBomData({...newBomData, productCode: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>제품명</label>
                  <input 
                    placeholder="예: 새로운 제품" 
                    value={newBomData.productName}
                    onChange={(e) => setNewBomData({...newBomData, productName: e.target.value})}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>설명</label>
                <input 
                  placeholder="제품 설명을 입력하세요" 
                  value={newBomData.description}
                  onChange={(e) => setNewBomData({...newBomData, description: e.target.value})}
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>총 원가 (원)</label>
                  <input 
                    type="number"
                    placeholder="0" 
                    value={newBomData.totalCost}
                    onChange={(e) => setNewBomData({...newBomData, totalCost: Number(e.target.value)})}
                    style={inputStyle}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>BOM 항목 수</label>
                  <input 
                    type="number"
                    placeholder="0" 
                    value={newBomData.bomItemCount}
                    onChange={(e) => setNewBomData({...newBomData, bomItemCount: Number(e.target.value)})}
                    style={inputStyle}
                    min="0"
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "1rem" }}>
                <button style={secondaryButtonStyle} onClick={() => setShowNewBomModal(false)}>
                  취소
                </button>
                <button style={primaryButtonStyle} onClick={createNewBom}>
                  <Save size={16} />
                  생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 편집 모드 표시 */}
      {editingItem && (
        <div style={{ ...cardStyle, border: "2px solid #3b82f6", backgroundColor: "#eff6ff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "0.875rem", color: "#1d4ed8", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Edit size={16} />
              편집 모드: {editingItem}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                style={{ ...primaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                onClick={handleSaveEdit}
              >
                <Save size={12} />
                저장
              </button>
              <button 
                style={{ ...secondaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}
                onClick={handleCancelEdit}
              >
                <X size={12} />
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
