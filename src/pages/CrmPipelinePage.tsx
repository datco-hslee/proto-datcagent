import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Users,
  Plus,
  Filter,
  Search,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  X,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import styles from "./CrmPipelinePage.module.css";

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  estimatedValue: number;
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  source: string;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description: string;
  timestamp: Date;
  completed: boolean;
}

const PIPELINE_STAGES = [
  { id: 'prospect', name: '잠재고객', color: '#94a3b8', count: 0 },
  { id: 'qualified', name: '검증완료', color: '#3b82f6', count: 0 },
  { id: 'proposal', name: '제안서 발송', color: '#f59e0b', count: 0 },
  { id: 'negotiation', name: '협상중', color: '#10b981', count: 0 },
  { id: 'closed-won', name: '성공', color: '#059669', count: 0 },
  { id: 'closed-lost', name: '실패', color: '#ef4444', count: 0 },
];

// 가상 데이터
const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    companyName: 'A전자',
    contactPerson: '김영업',
    email: 'sales@a-electronics.co.kr',
    phone: '02-1234-5678',
    estimatedValue: 50000000,
    stage: 'qualified',
    probability: 70,
    activities: [
      {
        id: 'act-1',
        type: 'call',
        title: '초기 상담',
        description: '제품 요구사항 논의',
        timestamp: new Date('2024-01-15'),
        completed: true
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    tags: ['대기업', '전자부품'],
    source: '웹사이트'
  },
  {
    id: 'lead-2',
    companyName: 'B제조',
    contactPerson: '이구매',
    email: 'purchase@b-manufacturing.co.kr',
    phone: '02-9876-5432',
    estimatedValue: 30000000,
    stage: 'proposal',
    probability: 60,
    activities: [
      {
        id: 'act-2',
        type: 'email',
        title: '제안서 발송',
        description: '견적서 및 제품 카탈로그 발송',
        timestamp: new Date('2024-01-12'),
        completed: true
      }
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
    tags: ['제조업', '중견기업'],
    source: '전시회'
  },
  {
    id: 'lead-3',
    companyName: 'C건설',
    contactPerson: '박현장',
    email: 'field@c-construction.co.kr',
    phone: '02-5555-1234',
    estimatedValue: 80000000,
    stage: 'negotiation',
    probability: 85,
    activities: [
      {
        id: 'act-3',
        type: 'meeting',
        title: '현장 미팅',
        description: '프로젝트 진행 상황 점검',
        timestamp: new Date('2024-01-14'),
        completed: true
      }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-14'),
    tags: ['건설업', '대형프로젝트'],
    source: '추천'
  },
  {
    id: 'lead-4',
    companyName: 'D솔루션',
    contactPerson: '최솔루션',
    email: 'contact@d-solution.co.kr',
    phone: '02-7777-8888',
    estimatedValue: 25000000,
    stage: 'prospect',
    probability: 30,
    activities: [],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    tags: ['IT서비스', '스타트업'],
    source: '콜드콜'
  }
];

// 단계별 섹션 컴포넌트
function StageSection({ stage, leads, selectedLead, onSelectLead, onEditLead }: {
  stage: typeof PIPELINE_STAGES[0];
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div className={styles.stageSection}>
      <div className={styles.stageHeader} style={{ borderTopColor: stage.color }}>
        <div className={styles.stageHeaderContent}>
          <h3 className={styles.stageTitle}>{stage.name}</h3>
          <div className={styles.stageBadge} style={{ backgroundColor: stage.color }}>
            {leads.length}
          </div>
        </div>
        <div className={styles.stageProgress}>
          <div
            className={styles.stageProgressBar}
            style={{ backgroundColor: stage.color + '20' }}
          >
            <div
              className={styles.stageProgressFill}
              style={{
                backgroundColor: stage.color,
                width: `${leads.length > 0 ? 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.stageContent} ref={setNodeRef}>
        <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          <div className={styles.stageCards}>
            {leads.map((lead) => (
              <SortableLeadCard
                key={lead.id}
                lead={lead}
                stage={stage}
                onSelect={onSelectLead}
                isSelected={selectedLead?.id === lead.id}
                onEdit={onEditLead}
              />
            ))}
          </div>
        </SortableContext>
        {leads.length === 0 && (
          <div className={styles.emptyColumn}>
            <p className={styles.emptyText}>이 단계에는 아직 고객이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableLeadCard({ lead, stage, onSelect, isSelected, onEdit }: {
  lead: Lead;
  stage: typeof PIPELINE_STAGES[0];
  onSelect: (lead: Lead) => void;
  isSelected: boolean;
  onEdit: (lead: Lead) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.leadCard} ${isSelected ? styles.leadCardSelected : ''}`}
      onClick={() => onSelect(lead)}
    >
      <div className={styles.leadCardHeader}>
        <h4 className={styles.leadCardCompany}>{lead.companyName}</h4>
        <div className={styles.leadCardValue}>
          ₩{(lead.estimatedValue / 10000).toFixed(0)}만원
        </div>
      </div>

      <div className={styles.leadCardContact}>
        <div className={styles.leadCardContactItem}>
          <Building2 className={styles.leadCardIcon} />
          <span className={styles.leadCardContactText}>{lead.contactPerson}</span>
        </div>
        <div className={styles.leadCardContactItem}>
          <Phone className={styles.leadCardIcon} />
          <span className={styles.leadCardContactText}>{lead.phone}</span>
        </div>
      </div>

      <div className={styles.leadCardProgress}>
        <div className={styles.leadCardProgressLabel}>
          <span>성공 확률</span>
          <span className={styles.leadCardProgressValue}>{lead.probability}%</span>
        </div>
        <div className={styles.leadCardProgressBar}>
          <div
            className={styles.leadCardProgressFill}
            style={{
              width: `${lead.probability}%`,
              backgroundColor: stage.color
            }}
          />
        </div>
      </div>

      <div className={styles.leadCardFooter}>
        <div className={styles.leadCardTags}>
          {lead.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className={styles.leadCardTag}>
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className={styles.leadCardTagMore}>
              +{lead.tags.length - 2}
            </span>
          )}
        </div>
        <div className={styles.leadCardActions}>
          <span className={styles.leadCardDate}>
            {new Date(lead.updatedAt).toLocaleDateString('ko-KR')}
          </span>
          <button 
            className={styles.leadCardEditButton}
            onClick={(e) => { 
              e.stopPropagation(); 
              onEdit(lead); 
            }}
            title="리드 편집"
          >
            <Edit className={styles.leadCardEditIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}

function getActivityTypeIcon(type: Activity['type']) {
  const iconProps = { className: styles.activityIcon };

  switch (type) {
    case 'call':
      return <Phone {...iconProps} />;
    case 'email':
      return <Mail {...iconProps} />;
    case 'meeting':
      return <Calendar {...iconProps} />;
    case 'note':
      return <MessageSquare {...iconProps} />;
    default:
      return <MessageSquare {...iconProps} />;
  }
}

export function CrmPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  // 리드 편집 폼 데이터
  const [editLeadForm, setEditLeadForm] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    estimatedValue: 0,
    probability: 50,
    tags: [] as string[],
    stage: "prospect" as Lead["stage"],
  });
  
  // 새 리드 폼 데이터
  const [newLeadForm, setNewLeadForm] = useState({
    customer: "",
    company: "",
    email: "",
    phone: "",
    value: "",
    stage: "prospect" as Lead["stage"],
    source: "웹사이트",
    description: "",
    expectedCloseDate: "",
  });
  
  // 필터 상태
  const [filters, setFilters] = useState({
    stage: "전체",
    priority: "전체",
    source: "전체",
    dateRange: "전체",
    minValue: "",
    maxValue: "",
    assignedTo: "",
  });

  // 모달 닫기 함수들
  const closeModals = () => {
    setShowNewLeadModal(false);
    setShowFilterModal(false);
    setShowEditModal(false);
    setShowActivityModal(false);
    setEditingLead(null);
  };

  // 드래그 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // 리드를 새 단계로 이동
    if (PIPELINE_STAGES.find(stage => stage.id === overId)) {
      setLeads(leads.map(lead => 
        lead.id === activeId 
          ? { ...lead, stage: overId as Lead['stage'], updatedAt: new Date() }
          : lead
      ));
    }
    
    setActiveId(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 새 영업 기회 추가
  const handleAddNewLead = () => {
    setShowNewLeadModal(true);
  };

  const createNewLead = () => {
    if (!newLeadForm.customer || !newLeadForm.company || !newLeadForm.email) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      companyName: newLeadForm.company,
      contactPerson: newLeadForm.customer,
      email: newLeadForm.email,
      phone: newLeadForm.phone,
      estimatedValue: parseInt(newLeadForm.value) || 0,
      stage: newLeadForm.stage,
      probability: 50,
      source: newLeadForm.source,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      activities: [],
    };

    setLeads([...leads, newLead]);
    setShowNewLeadModal(false);
    setNewLeadForm({
      customer: "",
      company: "",
      email: "",
      phone: "",
      value: "",
      stage: "prospect",
      source: "웹사이트",
      description: "",
      expectedCloseDate: "",
    });
    alert('새 리드가 성공적으로 생성되었습니다.');
  };


  // 필터 모달 열기
  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    alert('필터가 적용되었습니다.');
  };

  const resetFilters = () => {
    setFilters({
      stage: "전체",
      priority: "전체",
      source: "전체",
      dateRange: "전체",
      minValue: "",
      maxValue: "",
      assignedTo: "",
    });
    setSearchTerm("");
  };

  // 리드 편집
  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setEditLeadForm({
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      phone: lead.phone,
      email: lead.email,
      estimatedValue: lead.estimatedValue,
      probability: lead.probability,
      tags: [...lead.tags],
      stage: lead.stage
    });
    setShowEditModal(true);
  };

  const handleSaveEditLead = () => {
    if (!editLeadForm.companyName || !editLeadForm.contactPerson) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const updatedLeads = leads.map(lead => 
      lead.id === editingLead?.id 
        ? { 
            ...lead, 
            ...editLeadForm,
            updatedAt: new Date()
          }
        : lead
    );

    setLeads(updatedLeads);
    setShowEditModal(false);
    setEditingLead(null);
    alert('리드 정보가 수정되었습니다.');
  };

  // 활동 추가
  const handleAddActivity = (lead: Lead) => {
    setEditingLead(lead);
    setShowActivityModal(true);
  };

  // 통화 걸기
  const handleCall = (lead: Lead) => {
    // 실제 구현에서는 전화 시스템과 연동
    alert(`${lead.contactPerson}(${lead.phone})에게 전화를 겁니다.`);
  };

  // 이메일 발송
  const handleSendEmail = (lead: Lead) => {
    // 실제 구현에서는 이메일 시스템과 연동
    window.open(`mailto:${lead.email}?subject=영업 문의&body=안녕하세요 ${lead.contactPerson}님,`);
  };

  // 미팅 일정 잡기
  const handleScheduleMeeting = (lead: Lead) => {
    // 실제 구현에서는 캘린더 시스템과 연동
    alert(`${lead.contactPerson}님과 미팅 일정을 잡습니다.`);
  };

  // 필터링 로직
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = searchTerm === "" || 
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = filters.stage === "전체" || lead.stage === filters.stage;
    const matchesSource = filters.source === "전체" || lead.source === filters.source;
    
    const minValue = filters.minValue ? parseInt(filters.minValue) : 0;
    const maxValue = filters.maxValue ? parseInt(filters.maxValue) : Infinity;
    const matchesValue = lead.estimatedValue >= minValue && lead.estimatedValue <= maxValue;

    return matchesSearch && matchesStage && matchesSource && matchesValue;
  });

  // 단계별로 리드 그룹화
  const getLeadsByStage = (stageId: string) => {
    return filteredLeads.filter(lead => lead.stage === stageId);
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>CRM 파이프라인</h1>
          <p className={styles.subtitle}>영업 기회를 관리하고 추적하세요</p>
        </div>
        <div className={styles.headerRight}>
          <Button variant="outline" onClick={handleFilterClick}>
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
          <Button onClick={handleAddNewLead}>
            <Plus className="h-4 w-4 mr-2" />
            새 영업 기회
          </Button>
        </div>
      </div>

      {/* 검색 */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <Input
            type="text"
            placeholder="고객명, 회사명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 파이프라인 보드 */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.pipeline}>
          {PIPELINE_STAGES.map((stage) => (
            <StageSection
              key={stage.id}
              stage={stage}
              leads={getLeadsByStage(stage.id)}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
              onEditLead={handleEditLead}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <SortableLeadCard
              lead={leads.find(lead => lead.id === activeId)!}
              stage={PIPELINE_STAGES[0]}
              onSelect={() => {}}
              onEdit={() => {}}
              isSelected={false}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 리드 편집 모달 */}
      {showEditModal && editingLead && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>리드 편집</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowEditModal(false)}
              >
                <X className={styles.modalCloseIcon} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalGrid}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel} data-required>회사명</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editLeadForm.companyName}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="회사명을 입력하세요"
                    required
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel} data-required>담당자명</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editLeadForm.contactPerson}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="담당자명을 입력하세요"
                    required
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>전화번호</label>
                  <input
                    type="tel"
                    className={styles.modalInput}
                    value={editLeadForm.phone}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>이메일</label>
                  <input
                    type="email"
                    className={styles.modalInput}
                    value={editLeadForm.email}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="이메일을 입력하세요"
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>예상 거래액</label>
                  <input
                    type="number"
                    className={styles.modalInput}
                    value={editLeadForm.estimatedValue}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, estimatedValue: Number(e.target.value) }))}
                    placeholder="예상 거래액을 입력하세요"
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>성공 확률 (%)</label>
                  <input
                    type="range"
                    className={styles.modalRange}
                    min="0"
                    max="100"
                    value={editLeadForm.probability}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, probability: Number(e.target.value) }))}
                  />
                  <span className={styles.modalRangeValue}>{editLeadForm.probability}%</span>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>단계</label>
                  <select
                    className={styles.modalSelect}
                    value={editLeadForm.stage}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, stage: e.target.value as Lead["stage"] }))}
                  >
                    <option value="prospect">잠재고객</option>
                    <option value="qualified">검증완료</option>
                    <option value="proposal">제안서 발송</option>
                    <option value="negotiation">협상중</option>
                    <option value="closed-won">성공</option>
                    <option value="closed-lost">실패</option>
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>태그</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={editLeadForm.tags.join(', ')}
                    onChange={(e) => setEditLeadForm(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    }))}
                    placeholder="태그를 쉼표로 구분하여 입력하세요"
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelButton}
                onClick={() => setShowEditModal(false)}
              >
                취소
              </button>
              <button
                className={styles.modalSaveButton}
                onClick={handleSaveEditLead}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 영업 기회 모달 */}
      {showNewLeadModal && (
        <div className={styles.modalOverlay} onClick={() => setShowNewLeadModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>새 영업 기회 추가</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowNewLeadModal(false)}
              >
                <X className={styles.modalCloseIcon} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalGrid}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel} data-required>회사명</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="회사명을 입력하세요"
                    required
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel} data-required>담당자명</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={newLeadForm.customer}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="담당자명을 입력하세요"
                    required
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>전화번호</label>
                  <input
                    type="tel"
                    className={styles.modalInput}
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>이메일</label>
                  <input
                    type="email"
                    className={styles.modalInput}
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="이메일을 입력하세요"
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>예상 거래금액</label>
                  <input
                    type="number"
                    className={styles.modalInput}
                    value={newLeadForm.value}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="예상 거래금액을 입력하세요"
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>파이프라인 단계</label>
                  <select
                    className={styles.modalSelect}
                    value={newLeadForm.stage}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, stage: e.target.value as Lead["stage"] }))}
                  >
                    {PIPELINE_STAGES.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>리드 소스</label>
                  <select
                    className={styles.modalSelect}
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, source: e.target.value }))}
                  >
                    <option value="웹사이트">웹사이트</option>
                    <option value="전시회">전시회</option>
                    <option value="추천">추천</option>
                    <option value="광고">광고</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>예상 마감일</label>
                  <input
                    type="date"
                    className={styles.modalInput}
                    value={newLeadForm.expectedCloseDate}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                  />
                </div>

                <div className={styles.modalField} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.modalLabel}>설명</label>
                  <textarea
                    className={styles.modalInput}
                    value={newLeadForm.description}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="추가 설명을 입력하세요"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelButton}
                onClick={() => setShowNewLeadModal(false)}
              >
                취소
              </button>
              <button
                className={styles.modalSaveButton}
                onClick={createNewLead}
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 필터 모달 */}
      {showFilterModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFilterModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>필터 설정</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowFilterModal(false)}
              >
                <X className={styles.modalCloseIcon} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalGrid}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>파이프라인 단계</label>
                  <select
                    className={styles.modalSelect}
                    value={filters.stage}
                    onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                  >
                    <option value="전체">전체</option>
                    {PIPELINE_STAGES.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>리드 소스</label>
                  <select
                    className={styles.modalSelect}
                    value={filters.source}
                    onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                  >
                    <option value="전체">전체</option>
                    <option value="웹사이트">웹사이트</option>
                    <option value="전시회">전시회</option>
                    <option value="추천">추천</option>
                    <option value="광고">광고</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>최소 거래금액</label>
                  <input
                    type="number"
                    className={styles.modalInput}
                    value={filters.minValue}
                    onChange={(e) => setFilters(prev => ({ ...prev, minValue: e.target.value }))}
                    placeholder="최소 금액"
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>최대 거래금액</label>
                  <input
                    type="number"
                    className={styles.modalInput}
                    value={filters.maxValue}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                    placeholder="최대 금액"
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>기간</label>
                  <select
                    className={styles.modalSelect}
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option value="전체">전체</option>
                    <option value="오늘">오늘</option>
                    <option value="이번 주">이번 주</option>
                    <option value="이번 달">이번 달</option>
                    <option value="지난 30일">지난 30일</option>
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>담당자</label>
                  <input
                    type="text"
                    className={styles.modalInput}
                    value={filters.assignedTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="담당자명"
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelButton}
                onClick={resetFilters}
              >
                초기화
              </button>
              <button
                className={styles.modalSaveButton}
                onClick={applyFilters}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
