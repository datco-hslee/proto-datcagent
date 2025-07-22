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
  Users,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  User,
} from "lucide-react";
import styles from "./ProjectsPage.module.css";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "onHold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  manager: string;
  teamMembers: string[];
  category: string;
  client: string;
  milestones: number;
  completedMilestones: number;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "ERP 시스템 개발",
    description: "기업 자원 관리 시스템 개발 및 구축",
    status: "active",
    priority: "high",
    progress: 65,
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    budget: 150000000,
    spent: 98000000,
    manager: "김철수",
    teamMembers: ["김철수", "이영희", "박지민", "최민수"],
    category: "소프트웨어 개발",
    client: "내부 프로젝트",
    milestones: 8,
    completedMilestones: 5,
  },
  {
    id: "2",
    name: "모바일 앱 리뉴얼",
    description: "iOS/Android 앱 UI/UX 개선 및 기능 추가",
    status: "active",
    priority: "medium",
    progress: 42,
    startDate: "2024-01-15",
    endDate: "2024-04-30",
    budget: 80000000,
    spent: 35000000,
    manager: "이영희",
    teamMembers: ["이영희", "정수현", "강민준"],
    category: "모바일 개발",
    client: "ABC 코퍼레이션",
    milestones: 6,
    completedMilestones: 2,
  },
  {
    id: "3",
    name: "데이터 분석 플랫폼",
    description: "빅데이터 분석 및 AI 기반 인사이트 제공 플랫폼",
    status: "planning",
    priority: "high",
    progress: 15,
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    budget: 200000000,
    spent: 12000000,
    manager: "박지민",
    teamMembers: ["박지민", "최민수", "정수현", "강민준", "윤서영"],
    category: "데이터 분석",
    client: "XYZ 그룹",
    milestones: 10,
    completedMilestones: 1,
  },
  {
    id: "4",
    name: "웹사이트 리뉴얼",
    description: "회사 공식 웹사이트 디자인 및 기능 개선",
    status: "completed",
    priority: "low",
    progress: 100,
    startDate: "2023-11-01",
    endDate: "2024-01-15",
    budget: 25000000,
    spent: 23500000,
    manager: "최민수",
    teamMembers: ["최민수", "윤서영"],
    category: "웹 개발",
    client: "내부 프로젝트",
    milestones: 4,
    completedMilestones: 4,
  },
  {
    id: "5",
    name: "보안 시스템 강화",
    description: "네트워크 보안 및 데이터 보호 시스템 구축",
    status: "onHold",
    priority: "critical",
    progress: 30,
    startDate: "2024-01-20",
    endDate: "2024-05-31",
    budget: 120000000,
    spent: 36000000,
    manager: "정수현",
    teamMembers: ["정수현", "강민준"],
    category: "보안",
    client: "내부 프로젝트",
    milestones: 7,
    completedMilestones: 2,
  },
];

const statusConfig = {
  planning: { label: "계획중", color: "secondary", icon: FileText },
  active: { label: "진행중", color: "default", icon: Clock },
  onHold: { label: "보류", color: "destructive", icon: AlertCircle },
  completed: { label: "완료", color: "success", icon: CheckCircle },
  cancelled: { label: "취소", color: "destructive", icon: AlertCircle },
};

const priorityConfig = {
  low: { label: "낮음", color: "secondary" },
  medium: { label: "보통", color: "default" },
  high: { label: "높음", color: "destructive" },
  critical: { label: "긴급", color: "destructive" },
};

export const ProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    return <StatusIcon className={styles.statusIcon} />;
  };

  // 통계 계산
  const totalProjects = mockProjects.length;
  const activeProjects = mockProjects.filter((p) => p.status === "active").length;
  const totalBudget = mockProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = mockProjects.reduce((sum, p) => sum + p.spent, 0);
  const averageProgress = Math.round(mockProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>프로젝트 관리</h1>
            <p className={styles.subtitle}>프로젝트 진행 상황을 관리하고 성과를 추적하세요</p>
          </div>
          <Button className={styles.addButton}>
            <Plus className={styles.icon} />새 프로젝트
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 프로젝트</span>
                <span className={styles.statValue}>{totalProjects}개</span>
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
                <span className={styles.statValue}>{activeProjects}개</span>
              </div>
              <div className={styles.statIcon}>
                <Clock />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 예산</span>
                <span className={styles.statValue}>{formatCurrency(totalBudget)}</span>
              </div>
              <div className={styles.statIcon}>
                <Target />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>평균 진행률</span>
                <span className={styles.statValue}>{averageProgress}%</span>
              </div>
              <div className={styles.statIcon}>
                <TrendingUp />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="프로젝트명, 매니저, 클라이언트로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 상태</option>
              <option value="planning">계획중</option>
              <option value="active">진행중</option>
              <option value="onHold">보류</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 우선순위</option>
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
              <option value="critical">긴급</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.projectsGrid}>
          {filteredProjects.map((project) => (
            <Card key={project.id} className={styles.projectCard}>
              <div className={styles.cardHeader}>
                <div className={styles.projectInfo}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  <div className={styles.projectMeta}>
                    <Badge variant={statusConfig[project.status]?.color as any} className={styles.statusBadge}>
                      {getStatusIcon(project.status)}
                      {statusConfig[project.status]?.label}
                    </Badge>
                    <Badge variant={priorityConfig[project.priority]?.color as any} className={styles.priorityBadge}>
                      {priorityConfig[project.priority]?.label}
                    </Badge>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit3 className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.projectDescription}>{project.description}</p>

                <div className={styles.progressSection}>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressLabel}>진행률</span>
                    <span className={styles.progressValue}>{project.progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className={styles.projectDetails}>
                  <div className={styles.detailItem}>
                    <User className={styles.detailIcon} />
                    <div className={styles.detailInfo}>
                      <span className={styles.detailLabel}>매니저</span>
                      <span className={styles.detailValue}>{project.manager}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <Users className={styles.detailIcon} />
                    <div className={styles.detailInfo}>
                      <span className={styles.detailLabel}>팀원</span>
                      <span className={styles.detailValue}>{project.teamMembers.length}명</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <Target className={styles.detailIcon} />
                    <div className={styles.detailInfo}>
                      <span className={styles.detailLabel}>마일스톤</span>
                      <span className={styles.detailValue}>
                        {project.completedMilestones}/{project.milestones}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.budgetSection}>
                  <div className={styles.budgetInfo}>
                    <div className={styles.budgetItem}>
                      <span className={styles.budgetLabel}>예산</span>
                      <span className={styles.budgetValue}>{formatCurrency(project.budget)}</span>
                    </div>
                    <div className={styles.budgetItem}>
                      <span className={styles.budgetLabel}>사용</span>
                      <span className={styles.budgetSpent}>{formatCurrency(project.spent)}</span>
                    </div>
                  </div>
                  <div className={styles.budgetProgress}>
                    <div
                      className={styles.budgetProgressFill}
                      style={{
                        width: `${Math.min((project.spent / project.budget) * 100, 100)}%`,
                        backgroundColor: project.spent > project.budget ? "#dc2626" : "#059669",
                      }}
                    />
                  </div>
                </div>

                <div className={styles.dateSection}>
                  <div className={styles.dateItem}>
                    <Calendar className={styles.dateIcon} />
                    <div className={styles.dateInfo}>
                      <span className={styles.dateLabel}>기간</span>
                      <span className={styles.dateValue}>
                        {project.startDate} ~ {project.endDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedProject && (
        <div className={styles.modal} onClick={() => setSelectedProject(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>프로젝트 상세</h2>
              <Button variant="ghost" onClick={() => setSelectedProject(null)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.projectHeader}>
                <div className={styles.projectMainInfo}>
                  <h3>{selectedProject.name}</h3>
                  <p>{selectedProject.description}</p>
                  <div className={styles.projectBadges}>
                    <Badge variant={statusConfig[selectedProject.status]?.color as any}>{statusConfig[selectedProject.status]?.label}</Badge>
                    <Badge variant={priorityConfig[selectedProject.priority]?.color as any}>{priorityConfig[selectedProject.priority]?.label}</Badge>
                  </div>
                </div>
                <div className={styles.projectProgress}>
                  <div className={styles.progressCircle}>
                    <span className={styles.progressPercent}>{selectedProject.progress}%</span>
                  </div>
                </div>
              </div>

              <div className={styles.modalDetailsGrid}>
                <div className={styles.modalDetailSection}>
                  <h4>프로젝트 정보</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>카테고리:</span>
                      <span>{selectedProject.category}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>클라이언트:</span>
                      <span>{selectedProject.client}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>매니저:</span>
                      <span>{selectedProject.manager}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>시작일:</span>
                      <span>{selectedProject.startDate}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>종료일:</span>
                      <span>{selectedProject.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>예산 및 진행</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>총 예산:</span>
                      <span className={styles.budgetTotal}>{formatCurrency(selectedProject.budget)}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>사용 예산:</span>
                      <span className={styles.budgetUsed}>{formatCurrency(selectedProject.spent)}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>잔여 예산:</span>
                      <span className={selectedProject.budget - selectedProject.spent >= 0 ? styles.budgetRemaining : styles.budgetOverrun}>
                        {formatCurrency(selectedProject.budget - selectedProject.spent)}
                      </span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>마일스톤:</span>
                      <span>
                        {selectedProject.completedMilestones}/{selectedProject.milestones} 완료
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>팀원 ({selectedProject.teamMembers.length}명)</h4>
                  <div className={styles.teamMembersList}>
                    {selectedProject.teamMembers.map((member, index) => (
                      <div key={index} className={styles.teamMember}>
                        <User className={styles.memberIcon} />
                        <span>{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
