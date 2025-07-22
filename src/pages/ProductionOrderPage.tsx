import React, { useState } from "react";
import {
  Factory,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Users,
  Package,
  Zap,
  TrendingUp,
  Filter,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  status: "planned" | "in-progress" | "completed" | "on-hold" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  startDate: Date;
  dueDate: Date;
  completedQuantity: number;
  assignedTeam: string;
  estimatedHours: number;
  actualHours: number;
  materials: Material[];
  progress: number;
  customer: string;
  notes?: string;
}

interface Material {
  id: string;
  name: string;
  requiredQuantity: number;
  availableQuantity: number;
  unit: string;
  status: "available" | "shortage" | "ordered";
}

interface ProductionMetric {
  label: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

// 가상 데이터
const PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: "po-001",
    orderNumber: "PO-2024-001",
    productName: "스마트 센서 모듈",
    productCode: "SSM-100",
    quantity: 500,
    unit: "EA",
    status: "in-progress",
    priority: "high",
    startDate: new Date("2024-01-15"),
    dueDate: new Date("2024-01-25"),
    completedQuantity: 320,
    assignedTeam: "생산팀 A",
    estimatedHours: 120,
    actualHours: 78,
    progress: 64,
    customer: "A전자",
    materials: [
      { id: "m1", name: "PCB 기판", requiredQuantity: 500, availableQuantity: 500, unit: "EA", status: "available" },
      { id: "m2", name: "센서 칩", requiredQuantity: 500, availableQuantity: 320, unit: "EA", status: "shortage" },
      { id: "m3", name: "외부 케이스", requiredQuantity: 500, availableQuantity: 500, unit: "EA", status: "available" },
    ],
  },
  {
    id: "po-002",
    orderNumber: "PO-2024-002",
    productName: "IoT 제어기",
    productCode: "IOT-200",
    quantity: 200,
    unit: "EA",
    status: "planned",
    priority: "medium",
    startDate: new Date("2024-01-20"),
    dueDate: new Date("2024-02-05"),
    completedQuantity: 0,
    assignedTeam: "생산팀 B",
    estimatedHours: 80,
    actualHours: 0,
    progress: 0,
    customer: "B기술",
    materials: [
      { id: "m4", name: "메인보드", requiredQuantity: 200, availableQuantity: 150, unit: "EA", status: "shortage" },
      { id: "m5", name: "디스플레이", requiredQuantity: 200, availableQuantity: 200, unit: "EA", status: "available" },
    ],
  },
  {
    id: "po-003",
    orderNumber: "PO-2024-003",
    productName: "자동화 컨트롤러",
    productCode: "AC-300",
    quantity: 100,
    unit: "EA",
    status: "completed",
    priority: "low",
    startDate: new Date("2024-01-05"),
    dueDate: new Date("2024-01-18"),
    completedQuantity: 100,
    assignedTeam: "생산팀 A",
    estimatedHours: 60,
    actualHours: 55,
    progress: 100,
    customer: "C솔루션",
    materials: [
      { id: "m6", name: "프로세서", requiredQuantity: 100, availableQuantity: 100, unit: "EA", status: "available" },
      { id: "m7", name: "커넥터", requiredQuantity: 400, availableQuantity: 400, unit: "EA", status: "available" },
    ],
  },
  {
    id: "po-004",
    orderNumber: "PO-2024-004",
    productName: "무선 모니터링 장치",
    productCode: "WMD-150",
    quantity: 300,
    unit: "EA",
    status: "on-hold",
    priority: "urgent",
    startDate: new Date("2024-01-22"),
    dueDate: new Date("2024-02-10"),
    completedQuantity: 50,
    assignedTeam: "생산팀 C",
    estimatedHours: 150,
    actualHours: 25,
    progress: 17,
    customer: "D시스템",
    materials: [
      { id: "m8", name: "무선 모듈", requiredQuantity: 300, availableQuantity: 50, unit: "EA", status: "shortage" },
      { id: "m9", name: "배터리", requiredQuantity: 300, availableQuantity: 300, unit: "EA", status: "available" },
    ],
  },
];

const PRODUCTION_METRICS: ProductionMetric[] = [
  {
    label: "진행 중인 오더",
    value: "3건",
    change: 1,
    icon: Factory,
    color: "blue",
  },
  {
    label: "오늘 완료 예정",
    value: "2건",
    change: 0,
    icon: CheckCircle,
    color: "green",
  },
  {
    label: "지연 위험",
    value: "1건",
    change: -1,
    icon: AlertTriangle,
    color: "orange",
  },
  {
    label: "평균 효율성",
    value: "87%",
    change: 5,
    icon: TrendingUp,
    color: "purple",
  },
];

export function ProductionOrderPage() {
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const getStatusColor = (status: ProductionOrder["status"]) => {
    switch (status) {
      case "planned":
        return "bg-gray-500";
      case "in-progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "on-hold":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: ProductionOrder["status"]) => {
    switch (status) {
      case "planned":
        return "계획됨";
      case "in-progress":
        return "진행중";
      case "completed":
        return "완료";
      case "on-hold":
        return "보류";
      case "cancelled":
        return "취소";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: ProductionOrder["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-600";
      case "medium":
        return "bg-blue-100 text-blue-600";
      case "high":
        return "bg-orange-100 text-orange-600";
      case "urgent":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityLabel = (priority: ProductionOrder["priority"]) => {
    switch (priority) {
      case "low":
        return "낮음";
      case "medium":
        return "보통";
      case "high":
        return "높음";
      case "urgent":
        return "긴급";
      default:
        return priority;
    }
  };

  const filteredOrders = PRODUCTION_ORDERS.filter((order) => {
    const matchesSearch =
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const getActionButton = (order: ProductionOrder) => {
    switch (order.status) {
      case "planned":
        return (
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
            <Play className="h-3 w-3 mr-1" />
            시작
          </Button>
        );
      case "in-progress":
        return (
          <Button size="sm" variant="outline">
            <Pause className="h-3 w-3 mr-1" />
            일시정지
          </Button>
        );
      case "on-hold":
        return (
          <Button size="sm" className="bg-green-500 hover:bg-green-600">
            <RotateCcw className="h-3 w-3 mr-1" />
            재개
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">생산 오더 현황</h1>
          <p className="text-gray-500">생산 일정과 진행 상황을 실시간으로 관리하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            상세 필터
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />새 오더 생성
          </Button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTION_METRICS.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
              <metric.icon className={`h-4 w-4 text-${metric.color}-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change !== 0 && (
                <p className={`text-xs ${metric.change > 0 ? "text-green-600" : "text-red-600"}`}>
                  {metric.change > 0 ? "+" : ""}
                  {metric.change} vs 어제
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="제품명, 오더번호, 고객사로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">모든 상태</option>
            <option value="planned">계획됨</option>
            <option value="in-progress">진행중</option>
            <option value="completed">완료</option>
            <option value="on-hold">보류</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">모든 우선순위</option>
            <option value="urgent">긴급</option>
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </div>
      </div>

      {/* 생산 오더 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="cursor-pointer transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{order.productName}</CardTitle>
                  <p className="text-sm text-gray-500">{order.orderNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(order.priority)}>{getPriorityLabel(order.priority)}</Badge>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">수량</p>
                  <p className="font-medium">
                    {order.quantity.toLocaleString()} {order.unit}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">고객사</p>
                  <p className="font-medium">{order.customer}</p>
                </div>
                <div>
                  <p className="text-gray-500">완료율</p>
                  <p className="font-medium">{order.progress}%</p>
                </div>
                <div>
                  <p className="text-gray-500">담당팀</p>
                  <p className="font-medium">{order.assignedTeam}</p>
                </div>
              </div>

              {/* 진행률 바 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>진행률</span>
                  <span>
                    {order.completedQuantity}/{order.quantity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      order.progress === 100 ? "bg-green-500" : order.progress > 50 ? "bg-blue-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${order.progress}%` }}
                  />
                </div>
              </div>

              {/* 일정 정보 */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(order.startDate)} - {formatDate(order.dueDate)}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    getDaysRemaining(order.dueDate) < 0 ? "text-red-600" : getDaysRemaining(order.dueDate) <= 3 ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  <span>
                    {getDaysRemaining(order.dueDate) < 0
                      ? `${Math.abs(getDaysRemaining(order.dueDate))}일 지연`
                      : `${getDaysRemaining(order.dueDate)}일 남음`}
                  </span>
                </div>
              </div>

              {/* 자재 상태 미리보기 */}
              <div>
                <p className="text-sm text-gray-500 mb-2">자재 상태</p>
                <div className="flex gap-1">
                  {order.materials.map((material) => (
                    <div
                      key={material.id}
                      className={`w-2 h-2 rounded-full ${
                        material.status === "available" ? "bg-green-500" : material.status === "shortage" ? "bg-red-500" : "bg-yellow-500"
                      }`}
                      title={`${material.name}: ${material.status}`}
                    />
                  ))}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-2 pt-2">
                {getActionButton(order)}
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                  <Eye className="h-3 w-3 mr-1" />
                  상세보기
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 간트 차트 뷰 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            생산 일정 간트 차트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const totalDays = Math.ceil((order.dueDate.getTime() - order.startDate.getTime()) / (1000 * 3600 * 24));
              const startOffset = Math.ceil((order.startDate.getTime() - new Date("2024-01-01").getTime()) / (1000 * 3600 * 24));

              return (
                <div key={order.id} className="flex items-center gap-4">
                  <div className="w-48 text-sm">
                    <p className="font-medium truncate">{order.productName}</p>
                    <p className="text-gray-500 text-xs">{order.orderNumber}</p>
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-100 rounded">
                    <div
                      className={`absolute top-0 h-full rounded ${getStatusColor(order.status)} opacity-80`}
                      style={{
                        left: `${(startOffset / 31) * 100}%`,
                        width: `${(totalDays / 31) * 100}%`,
                      }}
                    />
                    <div
                      className={`absolute top-0 h-full rounded ${getStatusColor(order.status)}`}
                      style={{
                        left: `${(startOffset / 31) * 100}%`,
                        width: `${(totalDays / 31) * (order.progress / 100) * 100}%`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">{order.progress}%</div>
                  </div>
                  <div className="w-20 text-xs text-gray-500">{formatDate(order.dueDate)}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 상세 정보 모달 */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedOrder.productName} 상세 정보</h2>
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>기본 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">오더 번호</p>
                        <p className="font-medium">{selectedOrder.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">제품 코드</p>
                        <p className="font-medium">{selectedOrder.productCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">수량</p>
                        <p className="font-medium">
                          {selectedOrder.quantity.toLocaleString()} {selectedOrder.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">완료 수량</p>
                        <p className="font-medium">
                          {selectedOrder.completedQuantity.toLocaleString()} {selectedOrder.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">고객사</p>
                        <p className="font-medium">{selectedOrder.customer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">담당팀</p>
                        <p className="font-medium">{selectedOrder.assignedTeam}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>일정 및 진행률</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">시작일</p>
                          <p className="font-medium">{selectedOrder.startDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">완료 예정일</p>
                          <p className="font-medium">{selectedOrder.dueDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">예상 시간</p>
                          <p className="font-medium">{selectedOrder.estimatedHours}시간</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">실제 시간</p>
                          <p className="font-medium">{selectedOrder.actualHours}시간</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>진행률</span>
                          <span>{selectedOrder.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="h-3 bg-blue-500 rounded-full transition-all" style={{ width: `${selectedOrder.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>자재 현황</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.materials.map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-gray-500">
                              {material.availableQuantity}/{material.requiredQuantity} {material.unit}
                            </p>
                          </div>
                          <Badge
                            className={
                              material.status === "available"
                                ? "bg-green-100 text-green-600"
                                : material.status === "shortage"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-600"
                            }
                          >
                            {material.status === "available" ? "충분" : material.status === "shortage" ? "부족" : "주문됨"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedOrder.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>특이사항</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                닫기
              </Button>
              <Button>편집</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
