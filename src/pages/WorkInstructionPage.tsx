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
  Trash2,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Package,
  Settings,
  FileText,
  BarChart3,
} from "lucide-react";
import styles from "./WorkInstructionPage.module.css";

interface WorkInstruction {
  id: string;
  instructionNumber: string;
  productName: string;
  productCode: string;
  bomId: string;
  quantity: number;
  unit: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "pending" | "in_progress" | "paused" | "completed" | "cancelled";
  assignedWorker: string;
  workStation: string;
  estimatedTime: number; // minutes
  actualTime?: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  instructions: string;
  notes?: string;
  qualityCheck: boolean;
  materials: {
    name: string;
    quantity: number;
    unit: string;
    available: number;
  }[];
}

const mockWorkInstructions: WorkInstruction[] = [
  {
    id: "1",
    instructionNumber: "WI-2024-001",
    productName: "스마트 센서 모듈",
    productCode: "SSM-001",
    bomId: "BOM-SSM-001",
    quantity: 100,
    unit: "EA",
    priority: "high",
    status: "in_progress",
    assignedWorker: "김기술",
    workStation: "조립라인 A",
    estimatedTime: 480,
    actualTime: 320,
    startDate: "2024-01-20",
    dueDate: "2024-01-22",
    instructions: "1. PCB 보드 검사\n2. 센서 부품 조립\n3. 소프트웨어 설치\n4. 최종 테스트",
    qualityCheck: true,
    materials: [
      { name: "PCB 보드", quantity: 100, unit: "EA", available: 100 },
      { name: "센서 칩", quantity: 100, unit: "EA", available: 95 },
      { name: "케이스", quantity: 100, unit: "EA", available: 100 },
    ],
  },
  {
    id: "2",
    instructionNumber: "WI-2024-002",
    productName: "자동화 제어기",
    productCode: "AC-002",
    bomId: "BOM-AC-002",
    quantity: 50,
    unit: "EA",
    priority: "normal",
    status: "pending",
    assignedWorker: "이제조",
    workStation: "조립라인 B",
    estimatedTime: 360,
    startDate: "2024-01-22",
    dueDate: "2024-01-24",
    instructions: "1. 메인보드 조립\n2. 케이블 연결\n3. 펌웨어 업로드\n4. 기능 테스트",
    qualityCheck: true,
    materials: [
      { name: "메인보드", quantity: 50, unit: "EA", available: 50 },
      { name: "제어 케이블", quantity: 200, unit: "M", available: 180 },
      { name: "제어 박스", quantity: 50, unit: "EA", available: 45 },
    ],
  },
  {
    id: "3",
    instructionNumber: "WI-2024-003",
    productName: "LED 조명 패널",
    productCode: "LED-003",
    bomId: "BOM-LED-003",
    quantity: 200,
    unit: "EA",
    priority: "urgent",
    status: "completed",
    assignedWorker: "박전기",
    workStation: "조립라인 C",
    estimatedTime: 240,
    actualTime: 220,
    startDate: "2024-01-18",
    dueDate: "2024-01-20",
    completedDate: "2024-01-19",
    instructions: "1. LED 칩 배치\n2. 회로 연결\n3. 방열판 부착\n4. 전기 안전 테스트",
    qualityCheck: true,
    materials: [
      { name: "LED 칩", quantity: 800, unit: "EA", available: 800 },
      { name: "방열판", quantity: 200, unit: "EA", available: 200 },
      { name: "전원 드라이버", quantity: 200, unit: "EA", available: 200 },
    ],
  },
  {
    id: "4",
    instructionNumber: "WI-2024-004",
    productName: "모터 드라이브",
    productCode: "MD-004",
    bomId: "BOM-MD-004",
    quantity: 75,
    unit: "EA",
    priority: "normal",
    status: "paused",
    assignedWorker: "최기계",
    workStation: "조립라인 D",
    estimatedTime: 420,
    actualTime: 180,
    startDate: "2024-01-21",
    dueDate: "2024-01-25",
    instructions: "1. 모터 마운트 조립\n2. 드라이브 회로 설치\n3. 케이블 하네스 연결\n4. 동작 테스트",
    notes: "부품 공급 지연으로 일시 중단",
    qualityCheck: false,
    materials: [
      { name: "모터 마운트", quantity: 75, unit: "EA", available: 75 },
      { name: "드라이브 모듈", quantity: 75, unit: "EA", available: 50 },
      { name: "연결 케이블", quantity: 300, unit: "M", available: 250 },
    ],
  },
  {
    id: "5",
    instructionNumber: "WI-2024-005",
    productName: "디스플레이 유닛",
    productCode: "DU-005",
    bomId: "BOM-DU-005",
    quantity: 30,
    unit: "EA",
    priority: "low",
    status: "cancelled",
    assignedWorker: "정디스플레이",
    workStation: "조립라인 E",
    estimatedTime: 300,
    startDate: "2024-01-19",
    dueDate: "2024-01-23",
    instructions: "1. 디스플레이 모듈 검사\n2. 터치패널 부착\n3. 인터페이스 연결\n4. 표시 테스트",
    notes: "고객 주문 취소",
    qualityCheck: false,
    materials: [
      { name: "디스플레이 패널", quantity: 30, unit: "EA", available: 30 },
      { name: "터치 센서", quantity: 30, unit: "EA", available: 30 },
      { name: "컨트롤러 보드", quantity: 30, unit: "EA", available: 30 },
    ],
  },
];

const priorityConfig = {
  low: { label: "낮음", color: "secondary" },
  normal: { label: "보통", color: "default" },
  high: { label: "높음", color: "destructive" },
  urgent: { label: "긴급", color: "destructive" },
};

const statusConfig = {
  pending: { label: "대기중", color: "secondary", icon: Clock },
  in_progress: { label: "진행중", color: "default", icon: PlayCircle },
  paused: { label: "일시중단", color: "secondary", icon: PauseCircle },
  completed: { label: "완료", color: "success", icon: CheckCircle },
  cancelled: { label: "취소", color: "destructive", icon: AlertCircle },
};

export const WorkInstructionPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedInstruction, setSelectedInstruction] = useState<WorkInstruction | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<WorkInstruction | null>(null);
  const [newInstructionData, setNewInstructionData] = useState({
    productName: "",
    productCode: "",
    quantity: 1,
    unit: "EA",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    assignedWorker: "",
    workStation: "",
    estimatedTime: 480,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    instructions: ""
  });

  const filteredInstructions = mockWorkInstructions.filter((instruction) => {
    const matchesSearch =
      instruction.instructionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instruction.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instruction.assignedWorker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instruction.workStation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || instruction.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || instruction.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    return <StatusIcon className={styles.statusIcon} />;
  };

  const getProgressPercentage = (instruction: WorkInstruction) => {
    if (instruction.status === "completed") return 100;
    if (instruction.status === "cancelled") return 0;
    if (instruction.actualTime && instruction.estimatedTime) {
      return Math.min((instruction.actualTime / instruction.estimatedTime) * 100, 100);
    }
    return 0;
  };

  const getMaterialStatus = (materials: WorkInstruction["materials"]) => {
    const totalItems = materials.length;
    const availableItems = materials.filter((m) => m.available >= m.quantity).length;
    return { totalItems, availableItems, percentage: (availableItems / totalItems) * 100 };
  };

  // Handler functions
  const handleCreateInstruction = () => {
    if (!newInstructionData.productName || !newInstructionData.productCode || !newInstructionData.assignedWorker) {
      alert('제품명, 제품코드, 작업자를 입력해주세요.');
      return;
    }

    const newInstruction: WorkInstruction = {
      id: `wi-${Date.now()}`,
      instructionNumber: `WI-2024-${String(mockWorkInstructions.length + 1).padStart(3, '0')}`,
      productName: newInstructionData.productName,
      productCode: newInstructionData.productCode,
      bomId: `BOM-${newInstructionData.productCode}`,
      quantity: newInstructionData.quantity,
      unit: newInstructionData.unit,
      priority: newInstructionData.priority,
      status: "pending",
      assignedWorker: newInstructionData.assignedWorker,
      workStation: newInstructionData.workStation,
      estimatedTime: newInstructionData.estimatedTime,
      startDate: newInstructionData.startDate,
      dueDate: newInstructionData.dueDate,
      instructions: newInstructionData.instructions,
      qualityCheck: false,
      materials: []
    };

    // 실제 구현에서는 상태 관리를 통해 추가해야 합니다
    mockWorkInstructions.push(newInstruction);
    setShowCreateModal(false);
    setNewInstructionData({
      productName: "",
      productCode: "",
      quantity: 1,
      unit: "EA",
      priority: "normal",
      assignedWorker: "",
      workStation: "",
      estimatedTime: 480,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructions: ""
    });
    alert(`새 작업지시서 "${newInstruction.instructionNumber}"이 생성되었습니다.`);
  };

  const handleEditInstruction = (instruction: WorkInstruction) => {
    setEditingInstruction(instruction);
    setNewInstructionData({
      productName: instruction.productName,
      productCode: instruction.productCode,
      quantity: instruction.quantity,
      unit: instruction.unit,
      priority: instruction.priority,
      assignedWorker: instruction.assignedWorker,
      workStation: instruction.workStation,
      estimatedTime: instruction.estimatedTime,
      startDate: instruction.startDate,
      dueDate: instruction.dueDate,
      instructions: instruction.instructions
    });
    setShowCreateModal(true);
  };

  const handleUpdateInstruction = () => {
    if (!editingInstruction || !newInstructionData.productName || !newInstructionData.productCode || !newInstructionData.assignedWorker) {
      alert('제품명, 제품코드, 작업자를 입력해주세요.');
      return;
    }

    // 실제 구현에서는 상태 관리를 통해 업데이트해야 합니다
    const index = mockWorkInstructions.findIndex(i => i.id === editingInstruction.id);
    if (index !== -1) {
      mockWorkInstructions[index] = {
        ...editingInstruction,
        productName: newInstructionData.productName,
        productCode: newInstructionData.productCode,
        quantity: newInstructionData.quantity,
        unit: newInstructionData.unit,
        priority: newInstructionData.priority,
        assignedWorker: newInstructionData.assignedWorker,
        workStation: newInstructionData.workStation,
        estimatedTime: newInstructionData.estimatedTime,
        startDate: newInstructionData.startDate,
        dueDate: newInstructionData.dueDate,
        instructions: newInstructionData.instructions
      };
    }

    setShowCreateModal(false);
    setEditingInstruction(null);
    setNewInstructionData({
      productName: "",
      productCode: "",
      quantity: 1,
      unit: "EA",
      priority: "normal",
      assignedWorker: "",
      workStation: "",
      estimatedTime: 480,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructions: ""
    });
    alert(`작업지시서 "${editingInstruction.instructionNumber}"이 수정되었습니다.`);
  };

  const handleDeleteInstruction = (instruction: WorkInstruction) => {
    if (window.confirm(`"${instruction.instructionNumber} - ${instruction.productName}" 작업지시서를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      // 실제 구현에서는 상태 관리를 통해 삭제해야 합니다
      const index = mockWorkInstructions.findIndex(i => i.id === instruction.id);
      if (index !== -1) {
        mockWorkInstructions.splice(index, 1);
      }
      alert(`작업지시서 "${instruction.instructionNumber}"이 삭제되었습니다.`);
    }
  };

  // 통계 계산
  const totalInstructions = mockWorkInstructions.length;
  const inProgressCount = mockWorkInstructions.filter((i) => i.status === "in_progress").length;
  const completedCount = mockWorkInstructions.filter((i) => i.status === "completed").length;
  const urgentCount = mockWorkInstructions.filter((i) => i.priority === "urgent").length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>작업 지시서</h1>
            <p className={styles.subtitle}>생산 작업 지시를 관리하고 진행 상황을 추적하세요</p>
          </div>
          <Button className={styles.addButton} onClick={() => setShowCreateModal(true)}>
            <Plus className={styles.icon} />
            작업지시 생성
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 작업지시</span>
                <span className={styles.statValue}>{totalInstructions}건</span>
              </div>
              <div className={styles.statIcon}>
                <FileText />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>진행중</span>
                <span className={styles.statValue}>{inProgressCount}건</span>
              </div>
              <div className={styles.statIcon}>
                <PlayCircle />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>완료</span>
                <span className={styles.statValue}>{completedCount}건</span>
              </div>
              <div className={styles.statIcon}>
                <CheckCircle />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>긴급</span>
                <span className={styles.statValue}>{urgentCount}건</span>
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
              placeholder="작업지시번호, 제품명, 작업자명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 상태</option>
              <option value="pending">대기중</option>
              <option value="in_progress">진행중</option>
              <option value="paused">일시중단</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 우선순위</option>
              <option value="low">낮음</option>
              <option value="normal">보통</option>
              <option value="high">높음</option>
              <option value="urgent">긴급</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.instructionsGrid}>
          {filteredInstructions.map((instruction) => {
            const progressPercentage = getProgressPercentage(instruction);
            const materialStatus = getMaterialStatus(instruction.materials);

            return (
              <Card key={instruction.id} className={styles.instructionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.instructionInfo}>
                    <h3 className={styles.instructionNumber}>{instruction.instructionNumber}</h3>
                    <div className={styles.instructionMeta}>
                      <Badge variant={statusConfig[instruction.status]?.color as any} className={styles.statusBadge}>
                        {getStatusIcon(instruction.status)}
                        {statusConfig[instruction.status]?.label}
                      </Badge>
                      <Badge variant={priorityConfig[instruction.priority]?.color as any} className={styles.priorityBadge}>
                        {priorityConfig[instruction.priority]?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedInstruction(instruction)}>
                      <Eye className={styles.actionIcon} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteInstruction(instruction)}>
                      <Trash2 className={styles.actionIcon} style={{ color: '#dc2626' }} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditInstruction(instruction)}>
                      <Edit3 className={styles.actionIcon} />
                    </Button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.productInfo}>
                    <Package className={styles.productIcon} />
                    <div className={styles.productData}>
                      <span className={styles.productName}>{instruction.productName}</span>
                      <span className={styles.productCode}>코드: {instruction.productCode}</span>
                      <span className={styles.quantity}>
                        {instruction.quantity} {instruction.unit}
                      </span>
                    </div>
                  </div>

                  <div className={styles.workInfo}>
                    <div className={styles.workRow}>
                      <User className={styles.workIcon} />
                      <div className={styles.workData}>
                        <span className={styles.workLabel}>작업자</span>
                        <span className={styles.workValue}>{instruction.assignedWorker}</span>
                      </div>
                    </div>
                    <div className={styles.workRow}>
                      <Settings className={styles.workIcon} />
                      <div className={styles.workData}>
                        <span className={styles.workLabel}>작업장</span>
                        <span className={styles.workValue}>{instruction.workStation}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.timeInfo}>
                    <div className={styles.timeRow}>
                      <Clock className={styles.timeIcon} />
                      <div className={styles.timeData}>
                        <span className={styles.timeLabel}>예상 시간</span>
                        <span className={styles.timeValue}>
                          {Math.floor(instruction.estimatedTime / 60)}시간 {instruction.estimatedTime % 60}분
                        </span>
                      </div>
                    </div>
                    {instruction.actualTime && (
                      <div className={styles.timeRow}>
                        <BarChart3 className={styles.timeIcon} />
                        <div className={styles.timeData}>
                          <span className={styles.timeLabel}>실제 시간</span>
                          <span className={styles.timeValue}>
                            {Math.floor(instruction.actualTime / 60)}시간 {instruction.actualTime % 60}분
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>진행률</span>
                      <span className={styles.progressValue}>{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }} />
                    </div>
                  </div>

                  <div className={styles.materialSection}>
                    <div className={styles.materialHeader}>
                      <span className={styles.materialLabel}>자재 준비</span>
                      <span className={styles.materialStatus}>
                        {materialStatus.availableItems}/{materialStatus.totalItems} 준비됨
                      </span>
                    </div>
                    <div className={styles.materialBar}>
                      <div
                        className={`${styles.materialFill} ${
                          materialStatus.percentage === 100 ? styles.materialComplete : styles.materialIncomplete
                        }`}
                        style={{ width: `${materialStatus.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.dateInfo}>
                    <Calendar className={styles.dateIcon} />
                    <div className={styles.dateData}>
                      <div className={styles.dateItem}>
                        <span className={styles.dateLabel}>시작일</span>
                        <span className={styles.dateValue}>{instruction.startDate}</span>
                      </div>
                      <div className={styles.dateItem}>
                        <span className={styles.dateLabel}>완료 예정</span>
                        <span className={styles.dateValue}>{instruction.dueDate}</span>
                      </div>
                      {instruction.completedDate && (
                        <div className={styles.dateItem}>
                          <span className={styles.dateLabel}>완료일</span>
                          <span className={styles.dateValue}>{instruction.completedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {instruction.notes && (
                    <div className={styles.notesSection}>
                      <div className={styles.notesHeader}>
                        <AlertCircle className={styles.notesIcon} />
                        <span className={styles.notesLabel}>비고</span>
                      </div>
                      <p className={styles.notesText}>{instruction.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedInstruction && (
        <div className={styles.modal} onClick={() => setSelectedInstruction(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>작업지시서 상세</h2>
              <Button variant="ghost" onClick={() => setSelectedInstruction(null)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.instructionHeader}>
                <div className={styles.instructionMainInfo}>
                  <h3>{selectedInstruction.instructionNumber}</h3>
                  <p>
                    {selectedInstruction.productName} ({selectedInstruction.productCode})
                  </p>
                  <div className={styles.instructionBadges}>
                    <Badge variant={statusConfig[selectedInstruction.status]?.color as any}>{statusConfig[selectedInstruction.status]?.label}</Badge>
                    <Badge variant={priorityConfig[selectedInstruction.priority]?.color as any}>
                      {priorityConfig[selectedInstruction.priority]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className={styles.modalDetailsGrid}>
                <div className={styles.modalDetailSection}>
                  <h4>작업 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>제품 코드:</span>
                      <span>{selectedInstruction.productCode}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>수량:</span>
                      <span>
                        {selectedInstruction.quantity} {selectedInstruction.unit}
                      </span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>작업자:</span>
                      <span>{selectedInstruction.assignedWorker}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>작업장:</span>
                      <span>{selectedInstruction.workStation}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>일정 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>시작일:</span>
                      <span>{selectedInstruction.startDate}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>완료 예정:</span>
                      <span>{selectedInstruction.dueDate}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>예상 시간:</span>
                      <span>
                        {Math.floor(selectedInstruction.estimatedTime / 60)}시간 {selectedInstruction.estimatedTime % 60}분
                      </span>
                    </div>
                    {selectedInstruction.actualTime && (
                      <div className={styles.modalDetailRow}>
                        <span>실제 시간:</span>
                        <span>
                          {Math.floor(selectedInstruction.actualTime / 60)}시간 {selectedInstruction.actualTime % 60}분
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.instructionsSection}>
                <h4>작업 지시사항</h4>
                <div className={styles.instructionsContent}>
                  {selectedInstruction.instructions.split("\n").map((line, index) => (
                    <div key={index} className={styles.instructionLine}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.materialsSection}>
                <h4>필요 자재</h4>
                <div className={styles.materialsGrid}>
                  {selectedInstruction.materials.map((material, index) => (
                    <div key={index} className={styles.materialItem}>
                      <div className={styles.materialInfo}>
                        <span className={styles.materialName}>{material.name}</span>
                        <span className={styles.materialQuantity}>
                          필요: {material.quantity} {material.unit}
                        </span>
                        <span
                          className={`${styles.materialAvailable} ${
                            material.available >= material.quantity ? styles.sufficient : styles.insufficient
                          }`}
                        >
                          재고: {material.available} {material.unit}
                        </span>
                      </div>
                      <div className={`${styles.materialStatus} ${material.available >= material.quantity ? styles.statusOk : styles.statusLow}`}>
                        {material.available >= material.quantity ? "✓" : "⚠"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedInstruction.notes && (
                <div className={styles.notesModalSection}>
                  <h4>비고사항</h4>
                  <div className={styles.notesModalContent}>{selectedInstruction.notes}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 작업지시 생성/편집 모달 */}
      {showCreateModal && (
        <div className={styles.modal} onClick={() => {
          setShowCreateModal(false);
          setEditingInstruction(null);
        }}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingInstruction ? '작업지시서 편집' : '새 작업지시서 생성'}
              </h2>
              <Button variant="ghost" onClick={() => {
                setShowCreateModal(false);
                setEditingInstruction(null);
              }} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>제품명</label>
                    <input
                      type="text"
                      placeholder="제품명을 입력하세요"
                      value={newInstructionData.productName}
                      onChange={(e) => setNewInstructionData({...newInstructionData, productName: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>제품코드</label>
                    <input
                      type="text"
                      placeholder="제품코드를 입력하세요"
                      value={newInstructionData.productCode}
                      onChange={(e) => setNewInstructionData({...newInstructionData, productCode: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>수량</label>
                    <input
                      type="number"
                      min="1"
                      value={newInstructionData.quantity}
                      onChange={(e) => setNewInstructionData({...newInstructionData, quantity: Number(e.target.value)})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>단위</label>
                    <select
                      value={newInstructionData.unit}
                      onChange={(e) => setNewInstructionData({...newInstructionData, unit: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="EA">EA</option>
                      <option value="SET">SET</option>
                      <option value="KG">KG</option>
                      <option value="M">M</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>우선순위</label>
                    <select
                      value={newInstructionData.priority}
                      onChange={(e) => setNewInstructionData({...newInstructionData, priority: e.target.value as any})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="low">낮음</option>
                      <option value="normal">보통</option>
                      <option value="high">높음</option>
                      <option value="urgent">긴급</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>작업자</label>
                    <input
                      type="text"
                      placeholder="작업자명을 입력하세요"
                      value={newInstructionData.assignedWorker}
                      onChange={(e) => setNewInstructionData({...newInstructionData, assignedWorker: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>작업장</label>
                    <input
                      type="text"
                      placeholder="작업장을 입력하세요"
                      value={newInstructionData.workStation}
                      onChange={(e) => setNewInstructionData({...newInstructionData, workStation: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>예상시간 (분)</label>
                    <input
                      type="number"
                      min="1"
                      value={newInstructionData.estimatedTime}
                      onChange={(e) => setNewInstructionData({...newInstructionData, estimatedTime: Number(e.target.value)})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>시작일</label>
                    <input
                      type="date"
                      value={newInstructionData.startDate}
                      onChange={(e) => setNewInstructionData({...newInstructionData, startDate: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>완료예정일</label>
                    <input
                      type="date"
                      value={newInstructionData.dueDate}
                      onChange={(e) => setNewInstructionData({...newInstructionData, dueDate: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>작업 지시사항</label>
                  <textarea
                    placeholder="작업 지시사항을 입력하세요 (각 단계는 새 줄로 구분)"
                    value={newInstructionData.instructions}
                    onChange={(e) => setNewInstructionData({...newInstructionData, instructions: e.target.value})}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem' }}>
                  <Button variant="outline" onClick={() => {
                    setShowCreateModal(false);
                    setEditingInstruction(null);
                  }}>
                    취소
                  </Button>
                  <Button onClick={editingInstruction ? handleUpdateInstruction : handleCreateInstruction}>
                    <Plus size={16} />
                    {editingInstruction ? '수정' : '생성'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
