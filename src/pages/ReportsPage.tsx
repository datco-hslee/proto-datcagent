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
  Download,
  Share,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Building,
} from "lucide-react";
import styles from "./ReportsPage.module.css";

interface Report {
  id: string;
  name: string;
  category: "financial" | "sales" | "operations" | "hr" | "inventory" | "customer";
  type: "chart" | "table" | "dashboard" | "summary";
  description: string;
  lastUpdated: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  status: "ready" | "generating" | "error";
  data: {
    title: string;
    value: number | string;
    change?: number;
    trend?: "up" | "down" | "stable";
  }[];
  createdBy: string;
  tags: string[];
}

const mockReports: Report[] = [
  {
    id: "1",
    name: "월간 매출 보고서",
    category: "financial",
    type: "dashboard",
    description: "월별 매출 현황 및 성장률 분석",
    lastUpdated: "2024-01-21",
    frequency: "monthly",
    status: "ready",
    data: [
      { title: "총 매출", value: "₩125,000,000", change: 12.5, trend: "up" },
      { title: "순이익", value: "₩25,000,000", change: 8.3, trend: "up" },
      { title: "매출 성장률", value: "12.5%", change: 2.1, trend: "up" },
      { title: "고객 수", value: "1,250", change: 5.2, trend: "up" },
    ],
    createdBy: "재무팀",
    tags: ["매출", "재무", "월간"],
  },
  {
    id: "2",
    name: "영업 성과 분석",
    category: "sales",
    type: "chart",
    description: "영업팀별 성과 및 목표 달성률",
    lastUpdated: "2024-01-20",
    frequency: "weekly",
    status: "ready",
    data: [
      { title: "신규 고객", value: "45명", change: 15.0, trend: "up" },
      { title: "계약 성사율", value: "68%", change: -2.3, trend: "down" },
      { title: "평균 거래금액", value: "₩2,800,000", change: 7.8, trend: "up" },
      { title: "영업 파이프라인", value: "₩85,000,000", change: 12.1, trend: "up" },
    ],
    createdBy: "영업팀",
    tags: ["영업", "성과", "주간"],
  },
  {
    id: "3",
    name: "재고 현황 보고서",
    category: "inventory",
    type: "table",
    description: "품목별 재고 현황 및 회전율 분석",
    lastUpdated: "2024-01-21",
    frequency: "daily",
    status: "ready",
    data: [
      { title: "총 재고 가치", value: "₩45,000,000", change: -3.2, trend: "down" },
      { title: "재고 회전율", value: "4.2회", change: 8.5, trend: "up" },
      { title: "품절 품목", value: "12개", change: -20.0, trend: "down" },
      { title: "과재고 품목", value: "8개", change: 0, trend: "stable" },
    ],
    createdBy: "물류팀",
    tags: ["재고", "물류", "일간"],
  },
  {
    id: "4",
    name: "인사 현황 리포트",
    category: "hr",
    type: "summary",
    description: "직원 현황 및 인사 지표 요약",
    lastUpdated: "2024-01-19",
    frequency: "monthly",
    status: "ready",
    data: [
      { title: "총 직원 수", value: "125명", change: 8.7, trend: "up" },
      { title: "평균 근속 연수", value: "3.2년", change: 0.5, trend: "up" },
      { title: "이직률", value: "12%", change: -2.1, trend: "down" },
      { title: "교육 참여율", value: "85%", change: 5.0, trend: "up" },
    ],
    createdBy: "인사팀",
    tags: ["인사", "직원", "월간"],
  },
  {
    id: "5",
    name: "고객 만족도 분석",
    category: "customer",
    type: "chart",
    description: "고객 만족도 설문 결과 및 트렌드",
    lastUpdated: "2024-01-18",
    frequency: "quarterly",
    status: "generating",
    data: [
      { title: "평균 만족도", value: "4.2/5.0", change: 0.3, trend: "up" },
      { title: "NPS 점수", value: "45점", change: 8, trend: "up" },
      { title: "재구매율", value: "72%", change: 3.5, trend: "up" },
      { title: "추천 의향", value: "78%", change: 5.2, trend: "up" },
    ],
    createdBy: "CS팀",
    tags: ["고객", "만족도", "분기"],
  },
  {
    id: "6",
    name: "운영 효율성 대시보드",
    category: "operations",
    type: "dashboard",
    description: "전사 운영 지표 및 효율성 분석",
    lastUpdated: "2024-01-21",
    frequency: "daily",
    status: "ready",
    data: [
      { title: "생산성 지수", value: "92%", change: 3.2, trend: "up" },
      { title: "품질 점수", value: "4.8/5.0", change: 0.1, trend: "up" },
      { title: "처리 시간", value: "2.3일", change: -8.0, trend: "down" },
      { title: "자동화율", value: "65%", change: 12.0, trend: "up" },
    ],
    createdBy: "운영팀",
    tags: ["운영", "효율성", "일간"],
  },
];

const categoryConfig = {
  financial: { label: "재무", color: "default", icon: DollarSign },
  sales: { label: "영업", color: "default", icon: TrendingUp },
  operations: { label: "운영", color: "secondary", icon: BarChart3 },
  hr: { label: "인사", color: "secondary", icon: Users },
  inventory: { label: "재고", color: "default", icon: Package },
  customer: { label: "고객", color: "default", icon: Building },
};

const typeConfig = {
  chart: { label: "차트", color: "default", icon: BarChart3 },
  table: { label: "테이블", color: "secondary", icon: FileText },
  dashboard: { label: "대시보드", color: "default", icon: PieChart },
  summary: { label: "요약", color: "secondary", icon: FileText },
};

const statusConfig = {
  ready: { label: "준비완료", color: "success" },
  generating: { label: "생성중", color: "default" },
  error: { label: "오류", color: "destructive" },
};

const frequencyConfig = {
  daily: { label: "일간", color: "default" },
  weekly: { label: "주간", color: "secondary" },
  monthly: { label: "월간", color: "default" },
  quarterly: { label: "분기", color: "secondary" },
  yearly: { label: "연간", color: "default" },
};

export const ReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryIcon = (category: string) => {
    const CategoryIcon = categoryConfig[category as keyof typeof categoryConfig]?.icon || FileText;
    return <CategoryIcon className={styles.categoryIcon} />;
  };

  const getTypeIcon = (type: string) => {
    const TypeIcon = typeConfig[type as keyof typeof typeConfig]?.icon || FileText;
    return <TypeIcon className={styles.typeIcon} />;
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === "up") return <TrendingUp className={styles.trendUp} />;
    if (trend === "down") return <TrendingDown className={styles.trendDown} />;
    return null;
  };

  // 통계 계산
  const totalReports = mockReports.length;
  const readyReports = mockReports.filter((r) => r.status === "ready").length;
  const categories = [...new Set(mockReports.map((r) => r.category))];
  const types = [...new Set(mockReports.map((r) => r.type))];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>보고서 센터</h1>
            <p className={styles.subtitle}>비즈니스 인사이트를 위한 종합 보고서를 확인하세요</p>
          </div>
          <Button className={styles.addButton}>
            <Plus className={styles.icon} />
            보고서 생성
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 보고서</span>
                <span className={styles.statValue}>{totalReports}개</span>
              </div>
              <div className={styles.statIcon}>
                <FileText />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>사용 가능</span>
                <span className={styles.statValue}>{readyReports}개</span>
              </div>
              <div className={styles.statIcon}>
                <BarChart3 />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>카테고리</span>
                <span className={styles.statValue}>{categories.length}개</span>
              </div>
              <div className={styles.statIcon}>
                <PieChart />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>보고서 유형</span>
                <span className={styles.statValue}>{types.length}개</span>
              </div>
              <div className={styles.statIcon}>
                <Building />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="보고서명, 설명, 태그로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 카테고리</option>
              <option value="financial">재무</option>
              <option value="sales">영업</option>
              <option value="operations">운영</option>
              <option value="hr">인사</option>
              <option value="inventory">재고</option>
              <option value="customer">고객</option>
            </select>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 유형</option>
              <option value="chart">차트</option>
              <option value="table">테이블</option>
              <option value="dashboard">대시보드</option>
              <option value="summary">요약</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.reportsGrid}>
          {filteredReports.map((report) => (
            <Card key={report.id} className={styles.reportCard}>
              <div className={styles.cardHeader}>
                <div className={styles.reportInfo}>
                  <h3 className={styles.reportName}>{report.name}</h3>
                  <div className={styles.reportMeta}>
                    <Badge variant={categoryConfig[report.category]?.color as any} className={styles.categoryBadge}>
                      {getCategoryIcon(report.category)}
                      {categoryConfig[report.category]?.label}
                    </Badge>
                    <Badge variant={typeConfig[report.type]?.color as any} className={styles.typeBadge}>
                      {getTypeIcon(report.type)}
                      {typeConfig[report.type]?.label}
                    </Badge>
                    <Badge variant={statusConfig[report.status]?.color as any} className={styles.statusBadge}>
                      {statusConfig[report.status]?.label}
                    </Badge>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className={styles.actionIcon} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.description}>{report.description}</p>

                <div className={styles.dataSection}>
                  <div className={styles.dataGrid}>
                    {report.data.slice(0, 4).map((item, index) => (
                      <div key={index} className={styles.dataItem}>
                        <div className={styles.dataHeader}>
                          <span className={styles.dataLabel}>{item.title}</span>
                          {item.trend && getTrendIcon(item.trend)}
                        </div>
                        <div className={styles.dataValue}>{item.value}</div>
                        {item.change !== undefined && (
                          <div
                            className={`${styles.dataChange} ${
                              item.change > 0 ? styles.positive : item.change < 0 ? styles.negative : styles.neutral
                            }`}
                          >
                            {item.change > 0 ? "+" : ""}
                            {item.change}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.metaInfo}>
                  <div className={styles.metaRow}>
                    <Calendar className={styles.metaIcon} />
                    <div className={styles.metaData}>
                      <span className={styles.metaLabel}>최근 업데이트</span>
                      <span className={styles.metaValue}>{report.lastUpdated}</span>
                    </div>
                    <Badge variant={frequencyConfig[report.frequency]?.color as any} className={styles.frequencyBadge}>
                      {frequencyConfig[report.frequency]?.label}
                    </Badge>
                  </div>

                  <div className={styles.metaRow}>
                    <Users className={styles.metaIcon} />
                    <div className={styles.metaData}>
                      <span className={styles.metaLabel}>생성자</span>
                      <span className={styles.metaValue}>{report.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.tagsSection}>
                  {report.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedReport && (
        <div className={styles.modal} onClick={() => setSelectedReport(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>보고서 상세</h2>
              <Button variant="ghost" onClick={() => setSelectedReport(null)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.reportHeader}>
                <div className={styles.reportMainInfo}>
                  <h3>{selectedReport.name}</h3>
                  <p className={styles.reportDescription}>{selectedReport.description}</p>
                  <div className={styles.reportBadges}>
                    <Badge variant={categoryConfig[selectedReport.category]?.color as any}>{categoryConfig[selectedReport.category]?.label}</Badge>
                    <Badge variant={typeConfig[selectedReport.type]?.color as any}>{typeConfig[selectedReport.type]?.label}</Badge>
                    <Badge variant={statusConfig[selectedReport.status]?.color as any}>{statusConfig[selectedReport.status]?.label}</Badge>
                  </div>
                </div>
              </div>

              <div className={styles.modalDataSection}>
                <h4>주요 지표</h4>
                <div className={styles.modalDataGrid}>
                  {selectedReport.data.map((item, index) => (
                    <div key={index} className={styles.modalDataItem}>
                      <div className={styles.modalDataHeader}>
                        <span className={styles.modalDataLabel}>{item.title}</span>
                        {item.trend && getTrendIcon(item.trend)}
                      </div>
                      <div className={styles.modalDataValue}>{item.value}</div>
                      {item.change !== undefined && (
                        <div
                          className={`${styles.modalDataChange} ${
                            item.change > 0 ? styles.positive : item.change < 0 ? styles.negative : styles.neutral
                          }`}
                        >
                          {item.change > 0 ? "+" : ""}
                          {item.change}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalInfoSection}>
                <h4>보고서 정보</h4>
                <div className={styles.modalInfoGrid}>
                  <div className={styles.modalInfoRow}>
                    <span>생성자:</span>
                    <span>{selectedReport.createdBy}</span>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>업데이트 주기:</span>
                    <span>{frequencyConfig[selectedReport.frequency]?.label}</span>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>최근 업데이트:</span>
                    <span>{selectedReport.lastUpdated}</span>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>태그:</span>
                    <span>{selectedReport.tags.join(", ")}</span>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <Button variant="default">
                  <Eye className={styles.actionIcon} />
                  보고서 보기
                </Button>
                <Button variant="outline">
                  <Download className={styles.actionIcon} />
                  다운로드
                </Button>
                <Button variant="outline">
                  <Share className={styles.actionIcon} />
                  공유
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
