import React, { useState } from "react";
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
  DollarSign,
  TrendingUp,
  MessageSquare,
  X,
  Edit,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// 드래그 앤 드롭 컴포넌트들
function DroppableColumn({ stage, leads, selectedLead, onSelectLead }: {
  stage: typeof PIPELINE_STAGES[0];
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div ref={setNodeRef} className={styles.column}>
      <div className={styles.columnHeader} style={{ borderTopColor: stage.color }}>
        <div className={styles.columnHeaderContent}>
          <h3 className={styles.columnTitle}>{stage.name}</h3>
          <div className={styles.columnBadge} style={{ backgroundColor: stage.color }}>
            {leads.length}
          </div>
        </div>
        <div className={styles.columnProgress}>
          <div
            className={styles.columnProgressBar}
            style={{ backgroundColor: stage.color + '20' }}
          >
            <div
              className={styles.columnProgressFill}
              style={{
                backgroundColor: stage.color,
                width: `${leads.length > 0 ? 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.columnContent}>
        <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <SortableLeadCard
              key={lead.id}
              lead={lead}
              stage={stage}
              onSelect={onSelectLead}
              isSelected={selectedLead?.id === lead.id}
            />
          ))}
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

function SortableLeadCard({ lead, stage, onSelect, isSelected }: {
  lead: Lead;
  stage: typeof PIPELINE_STAGES[0];
  onSelect: (lead: Lead) => void;
  isSelected: boolean;
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
          {lead.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className={styles.leadCardTag}>
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className={styles.leadCardTagMore}>+{lead.tags.length - 2}</span>
          )}
        </div>
        <div className={styles.leadCardDate}>
          {new Date(lead.updatedAt).toLocaleDateString()}
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 검색 필터링
  const filteredLeads = leads.filter(lead =>
    lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 단계별 리드 개수 계산
  const stagesWithCounts = PIPELINE_STAGES.map(stage => ({
    ...stage,
    count: filteredLeads.filter(lead => lead.stage === stage.id).length
  }));

  // 단계별 리드 그룹핑
  const getLeadsByStage = (stageId: string) => {
    return filteredLeads.filter(lead => lead.stage === stageId);
  };

  // 총 예상 매출
  const totalExpectedRevenue = filteredLeads.reduce((sum, lead) => {
    return sum + (lead.estimatedValue * lead.probability / 100);
  }, 0);

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // 필요시 구현
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const leadId = active.id as string;
    const newStage = over.id as string;

    if (PIPELINE_STAGES.find(stage => stage.id === newStage)) {
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId
            ? { ...lead, stage: newStage as Lead['stage'], updatedAt: new Date() }
            : lead
        )
      );
    }

    setActiveId(null);
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleSection}>
            <div className={styles.headerIcon}>
              <Users />
            </div>
            <div>
              <h1 className={styles.headerTitle}>CRM 파이프라인</h1>
              <p className={styles.headerSubtitle}>영업 기회를 단계별로 관리하고 추적하세요</p>
            </div>
          </div>

          <div className={styles.headerStats}>
            <div className={styles.headerStat}>
              <span className={styles.headerStatLabel}>총 예상 매출</span>
              <span className={styles.headerStatValue}>
                ₩{(totalExpectedRevenue / 100000000).toFixed(1)}억원
              </span>
            </div>
          </div>

          <Button className={styles.addButton}>
            <Plus className="h-4 w-4 mr-2" />
            새 영업 기회
          </Button>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="고객명, 담당자명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Button variant="outline" className={styles.filterButton}>
          <Filter className="h-4 w-4 mr-2" />
          필터
        </Button>
      </div>

      {/* 파이프라인 통계 */}
      <div className={styles.statsGrid}>
        {stagesWithCounts.map((stage) => (
          <div key={stage.id} className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div
                className={styles.statCardProgress}
                style={{ backgroundColor: stage.color + '20' }}
              >
                <div
                  className={styles.statCardProgressFill}
                  style={{
                    backgroundColor: stage.color,
                    width: `${Math.min((stage.count / Math.max(...stagesWithCounts.map(s => s.count), 1)) * 100, 100)}%`
                  }}
                />
              </div>
              <p className={styles.statCardLabel}>{stage.name}</p>
              <p className={styles.statCardValue} style={{ color: stage.color }}>
                {stage.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 칸반 보드 */}
      <div className={styles.kanbanContainer}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className={styles.kanbanBoard}>
            {PIPELINE_STAGES.map((stage) => (
              <DroppableColumn
                key={stage.id}
                stage={stage}
                leads={getLeadsByStage(stage.id)}
                selectedLead={selectedLead}
                onSelectLead={setSelectedLead}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className={styles.dragOverlay}>
                {(() => {
                  const draggedLead = leads.find(lead => lead.id === activeId);
                  const draggedStage = PIPELINE_STAGES.find(stage =>
                    leads.find(lead => lead.id === activeId)?.stage === stage.id
                  );
                  if (draggedLead && draggedStage) {
                    return (
                      <SortableLeadCard
                        lead={draggedLead}
                        stage={draggedStage}
                        onSelect={() => {}}
                        isSelected={false}
                      />
                    );
                  }
                  return null;
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 사이드 패널 - 리드 상세 정보 */}
      {selectedLead && (
        <div className={styles.sidePanel}>
          <div className={styles.sidePanelContent}>
            {/* 패널 헤더 */}
            <div className={styles.sidePanelHeader}>
              <div className={styles.sidePanelHeaderContent}>
                <h2 className={styles.sidePanelTitle}>{selectedLead.companyName}</h2>
                <div className={styles.sidePanelHeaderActions}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className={styles.sidePanelSubtitle}>담당자: {selectedLead.contactPerson}</p>
            </div>

            {/* 기본 정보 */}
            <div className={styles.sidePanelSection}>
              <h3 className={styles.sidePanelSectionTitle}>기본 정보</h3>
              <div className={styles.sidePanelGrid}>
                <div className={styles.sidePanelField}>
                  <p className={styles.sidePanelFieldLabel}>이메일</p>
                  <p className={styles.sidePanelFieldValue}>{selectedLead.email}</p>
                </div>
                <div className={styles.sidePanelField}>
                  <p className={styles.sidePanelFieldLabel}>전화번호</p>
                  <p className={styles.sidePanelFieldValue}>{selectedLead.phone}</p>
                </div>
                <div className={styles.sidePanelField}>
                  <p className={styles.sidePanelFieldLabel}>예상 계약금액</p>
                  <p className={styles.sidePanelFieldValue}>
                    ₩{selectedLead.estimatedValue.toLocaleString()}
                  </p>
                </div>
                <div className={styles.sidePanelField}>
                  <p className={styles.sidePanelFieldLabel}>성공 확률</p>
                  <p className={styles.sidePanelFieldValue}>{selectedLead.probability}%</p>
                </div>
                <div className={styles.sidePanelField}>
                  <p className={styles.sidePanelFieldLabel}>리드 소스</p>
                  <p className={styles.sidePanelFieldValue}>{selectedLead.source}</p>
                </div>
                <div className={styles.sidePanelField}>
                  <p className={styles.sidePanelFieldLabel}>태그</p>
                  <div className={styles.sidePanelTags}>
                    {selectedLead.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className={styles.sidePanelTag}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 활동 타임라인 */}
            <div className={styles.sidePanelSection}>
              <div className={styles.sidePanelSectionHeader}>
                <h3 className={styles.sidePanelSectionTitle}>활동 내역</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  활동 추가
                </Button>
              </div>

              <div className={styles.activityList}>
                {selectedLead.activities.length > 0 ? (
                  selectedLead.activities.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {getActivityTypeIcon(activity.type)}
                      </div>
                      <div className={styles.activityContent}>
                        <h4 className={styles.activityTitle}>{activity.title}</h4>
                        <p className={styles.activityDescription}>{activity.description}</p>
                        <p className={styles.activityTimestamp}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.activityEmpty}>
                    <p className={styles.activityEmptyText}>아직 활동 내역이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className={styles.sidePanelActions}>
              <Button className={styles.actionButton}>
                <Phone className="h-4 w-4 mr-2" />
                통화 걸기
              </Button>
              <Button variant="outline" className={styles.actionButton}>
                <Mail className="h-4 w-4 mr-2" />
                이메일 발송
              </Button>
              <Button variant="outline" className={styles.actionButton}>
                <Calendar className="h-4 w-4 mr-2" />
                미팅 일정 잡기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
