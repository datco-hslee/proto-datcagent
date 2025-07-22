import React, { useState } from "react";
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Package,
  Calculator,
  Search,
  Plus,
  Edit,
  Copy,
  Download,
  Upload,
  Eye,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
}

// 가상 데이터
const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    code: "SSM-100",
    name: "스마트 센서 모듈",
    version: "v2.1",
    status: "active",
    totalCost: 45000,
    lastUpdated: new Date("2024-01-15"),
    createdBy: "정생산",
    bomItems: [
      {
        id: "bom-1",
        itemCode: "PCB-001",
        itemName: "PCB 메인보드",
        description: "스마트 센서용 메인 PCB",
        quantity: 1,
        unit: "EA",
        unitCost: 15000,
        totalCost: 15000,
        supplier: "A전자부품",
        leadTime: 7,
        stockLevel: 250,
        minStock: 50,
        category: "component",
        children: [
          {
            id: "bom-1-1",
            itemCode: "RES-001",
            itemName: "저항 1KΩ",
            description: "1% 정밀 저항",
            quantity: 10,
            unit: "EA",
            unitCost: 50,
            totalCost: 500,
            supplier: "B부품상사",
            leadTime: 3,
            stockLevel: 5000,
            minStock: 1000,
            category: "raw_material",
          },
          {
            id: "bom-1-2",
            itemCode: "CAP-001",
            itemName: "세라믹 커패시터 100nF",
            description: "50V 세라믹 커패시터",
            quantity: 5,
            unit: "EA",
            unitCost: 100,
            totalCost: 500,
            supplier: "B부품상사",
            leadTime: 3,
            stockLevel: 3000,
            minStock: 500,
            category: "raw_material",
          },
        ],
      },
      {
        id: "bom-2",
        itemCode: "SENSOR-001",
        itemName: "온도 센서 IC",
        description: "디지털 온도 센서",
        quantity: 1,
        unit: "EA",
        unitCost: 8000,
        totalCost: 8000,
        supplier: "C센서테크",
        leadTime: 14,
        stockLevel: 120,
        minStock: 30,
        category: "component",
      },
      {
        id: "bom-3",
        itemCode: "CASE-001",
        itemName: "플라스틱 케이스",
        description: "IP65 등급 보호 케이스",
        quantity: 1,
        unit: "EA",
        unitCost: 3500,
        totalCost: 3500,
        supplier: "D플라스틱",
        leadTime: 10,
        stockLevel: 180,
        minStock: 40,
        category: "component",
      },
      {
        id: "bom-4",
        itemCode: "CONN-001",
        itemName: "방수 커넥터",
        description: "4핀 방수 커넥터",
        quantity: 2,
        unit: "EA",
        unitCost: 2500,
        totalCost: 5000,
        supplier: "E커넥터",
        leadTime: 5,
        stockLevel: 300,
        minStock: 60,
        category: "component",
      },
    ],
  },
  {
    id: "prod-2",
    code: "IOT-200",
    name: "IoT 제어기",
    version: "v1.3",
    status: "active",
    totalCost: 85000,
    lastUpdated: new Date("2024-01-10"),
    createdBy: "한계획",
    bomItems: [
      {
        id: "bom-5",
        itemCode: "MB-002",
        itemName: "IoT 메인보드",
        description: "WiFi/Bluetooth 통합 보드",
        quantity: 1,
        unit: "EA",
        unitCost: 35000,
        totalCost: 35000,
        supplier: "F통신모듈",
        leadTime: 21,
        stockLevel: 80,
        minStock: 20,
        category: "component",
      },
      {
        id: "bom-6",
        itemCode: "LCD-001",
        itemName: '3.5" TFT LCD',
        description: "터치스크린 포함",
        quantity: 1,
        unit: "EA",
        unitCost: 25000,
        totalCost: 25000,
        supplier: "G디스플레이",
        leadTime: 14,
        stockLevel: 45,
        minStock: 15,
        category: "component",
      },
    ],
  },
];

export function BomManagementPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(MOCK_PRODUCTS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);

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

  const renderBomTree = (items: BomItem[], level: number = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.has(item.id);
      const stockStatus = getStockStatus(item.stockLevel, item.minStock);

      return (
        <div key={item.id} className="border-b border-gray-100 last:border-b-0">
          <div
            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
            style={{ paddingLeft: `${level * 24 + 12}px` }}
            onClick={() => hasChildren && toggleExpand(item.id)}
          >
            <div className="w-4">
              {hasChildren && (isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />)}
            </div>

            <div className="flex-1 grid grid-cols-8 gap-4 items-center text-sm">
              <div>
                <p className="font-medium">{item.itemCode}</p>
                <p className="text-gray-500 text-xs">{item.itemName}</p>
              </div>
              <div>
                <p>{item.description}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{item.quantity}</p>
                <p className="text-gray-500 text-xs">{item.unit}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.unitCost)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.totalCost)}</p>
              </div>
              <div>
                <Badge className={getCategoryColor(item.category)}>{getCategoryLabel(item.category)}</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {getStockIcon(stockStatus)}
                  <span
                    className={`text-xs ${
                      stockStatus === "danger" ? "text-red-600" : stockStatus === "warning" ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {item.stockLevel}
                  </span>
                </div>
              </div>
              <div className="text-center text-gray-500">
                <p>{item.leadTime}일</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {hasChildren && isExpanded && item.children && renderBomTree(item.children, level + 1)}
        </div>
      );
    });
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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BOM 관리</h1>
          <p className="text-gray-500">제품 구성 정보와 자재 소요량을 관리하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            가져오기
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />새 BOM 생성
          </Button>
        </div>
      </div>

      {/* 제품 선택 및 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">제품 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MOCK_PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {product.code} {product.version}
                      </p>
                    </div>
                    <Badge
                      className={
                        product.status === "active"
                          ? "bg-green-100 text-green-600"
                          : product.status === "development"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {product.status === "active" ? "활성" : product.status === "development" ? "개발중" : "비활성"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">총 원가: {formatCurrency(product.totalCost)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {selectedProduct && (
            <>
              {/* 제품 정보 카드 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedProduct.name}</CardTitle>
                      <p className="text-gray-500">
                        {selectedProduct.code} - {selectedProduct.version}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">총 원가</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedProduct.totalCost)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">상태</p>
                      <Badge
                        className={
                          selectedProduct.status === "active"
                            ? "bg-green-100 text-green-600"
                            : selectedProduct.status === "development"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {selectedProduct.status === "active" ? "활성" : selectedProduct.status === "development" ? "개발중" : "비활성"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500">마지막 수정</p>
                      <p className="font-medium">{selectedProduct.lastUpdated.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">작성자</p>
                      <p className="font-medium">{selectedProduct.createdBy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-3">
                <Button variant={showCostAnalysis ? "default" : "outline"} onClick={() => setShowCostAnalysis(!showCostAnalysis)}>
                  <Calculator className="h-4 w-4 mr-2" />
                  원가 분석
                </Button>
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  자재 소요량 계산
                </Button>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="BOM 항목 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>

              {/* 원가 분석 패널 */}
              {showCostAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>원가 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold">카테고리별 원가</h4>
                        {["raw_material", "component", "sub_assembly"].map((category) => {
                          const items = selectedProduct.bomItems.filter((item) => item.category === category);
                          const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
                          const percentage = (totalCost / selectedProduct.totalCost) * 100;

                          return (
                            <div key={category} className="flex justify-between items-center">
                              <span className="text-sm">{getCategoryLabel(category as BomItem["category"])}</span>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(totalCost)}</p>
                                <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">공급업체별 원가</h4>
                        {Array.from(new Set(selectedProduct.bomItems.map((item) => item.supplier))).map((supplier) => {
                          const items = selectedProduct.bomItems.filter((item) => item.supplier === supplier);
                          const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
                          const percentage = (totalCost / selectedProduct.totalCost) * 100;

                          return (
                            <div key={supplier} className="flex justify-between items-center">
                              <span className="text-sm">{supplier}</span>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(totalCost)}</p>
                                <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">재고 위험 분석</h4>
                        {selectedProduct.bomItems
                          .filter((item) => getStockStatus(item.stockLevel, item.minStock) !== "safe")
                          .map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <span className="text-sm">{item.itemName}</span>
                              <div className="flex items-center gap-1">
                                {getStockIcon(getStockStatus(item.stockLevel, item.minStock))}
                                <span className="text-xs">
                                  {item.stockLevel}/{item.minStock}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* BOM 트리 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    BOM 구조
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 헤더 */}
                  <div className="grid grid-cols-8 gap-4 p-3 bg-gray-50 text-sm font-medium text-gray-600 border-b">
                    <div>품목코드/명</div>
                    <div>설명</div>
                    <div className="text-center">수량</div>
                    <div className="text-right">단가</div>
                    <div className="text-right">금액</div>
                    <div>카테고리</div>
                    <div className="text-center">재고</div>
                    <div className="text-center">납기</div>
                  </div>

                  {/* BOM 트리 */}
                  <div className="border border-gray-200 rounded-b">{renderBomTree(selectedProduct.bomItems)}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
