import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface SalesMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  period: string;
}

interface ChartData {
  month: string;
  revenue: number;
  target: number;
  leads: number;
  conversion: number;
}

interface SalesPersonPerformance {
  id: string;
  name: string;
  revenue: number;
  target: number;
  leads: number;
  deals: number;
  conversionRate: number;
  rank: number;
}

// 가상 데이터
const SALES_METRICS: SalesMetric[] = [
  {
    label: "월간 매출",
    value: "₩247,500,000",
    change: 12.5,
    trend: "up",
    period: "vs 지난달",
  },
  {
    label: "신규 리드",
    value: "156",
    change: 8.2,
    trend: "up",
    period: "vs 지난달",
  },
  {
    label: "전환율",
    value: "23.4%",
    change: -2.1,
    trend: "down",
    period: "vs 지난달",
  },
  {
    label: "평균 거래액",
    value: "₩18,500,000",
    change: 0.0,
    trend: "neutral",
    period: "vs 지난달",
  },
];

const MONTHLY_DATA: ChartData[] = [
  { month: "2023년 7월", revenue: 150000000, target: 180000000, leads: 100, conversion: 20.0 },
  { month: "2023년 8월", revenue: 165000000, target: 185000000, leads: 110, conversion: 21.2 },
  { month: "2023년 9월", revenue: 170000000, target: 190000000, leads: 115, conversion: 22.1 },
  { month: "2023년 10월", revenue: 175000000, target: 195000000, leads: 118, conversion: 21.8 },
  { month: "2023년 11월", revenue: 180000000, target: 200000000, leads: 120, conversion: 22.5 },
  { month: "2023년 12월", revenue: 220000000, target: 200000000, leads: 140, conversion: 24.1 },
  { month: "2024년 1월", revenue: 195000000, target: 210000000, leads: 135, conversion: 21.8 },
  { month: "2024년 2월", revenue: 240000000, target: 220000000, leads: 150, conversion: 25.3 },
  { month: "2024년 3월", revenue: 265000000, target: 230000000, leads: 160, conversion: 26.8 },
  { month: "2024년 4월", revenue: 247500000, target: 240000000, leads: 156, conversion: 23.4 },
  { month: "2024년 5월", revenue: 280000000, target: 250000000, leads: 170, conversion: 27.2 },
  { month: "2024년 6월", revenue: 295000000, target: 260000000, leads: 180, conversion: 28.5 },
];

// 직원관리에서 가져온 실제 직원 데이터
interface Employee {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  status: string;
  workType: string;
  manager: string;
  skills: string[];
  performanceScore: number;
}

const EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    employeeId: "EMP2024001",
    name: "이영희",
    position: "영업팀장",
    department: "영업부",
    email: "yhlee@company.com",
    phone: "010-1234-5678",
    hireDate: "2020-03-15",
    salary: 6000000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["영업전략", "고객관리", "협상"],
    performanceScore: 92,
  },
  {
    id: "EMP-002",
    employeeId: "EMP2024002",
    name: "박기술",
    position: "개발팀장",
    department: "기술부",
    email: "ktpark@company.com",
    phone: "010-2345-6789",
    hireDate: "2019-01-10",
    salary: 7000000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["Python", "React", "DevOps"],
    performanceScore: 88,
  },
  {
    id: "EMP-003",
    employeeId: "EMP2024003",
    name: "최생산",
    position: "생산관리자",
    department: "생산부",
    email: "scchoi@company.com",
    phone: "010-3456-7890",
    hireDate: "2021-06-01",
    salary: 5500000,
    status: "재직",
    workType: "정규직",
    manager: "김대표",
    skills: ["품질관리", "생산계획", "안전관리"],
    performanceScore: 85,
  },
  {
    id: "EMP-004",
    employeeId: "EMP2024004",
    name: "정회계",
    position: "경리과장",
    department: "경영지원부",
    email: "hjjung@company.com",
    phone: "010-4567-8901",
    hireDate: "2022-09-01",
    salary: 4500000,
    status: "휴직",
    workType: "정규직",
    manager: "김대표",
    skills: ["재무관리", "세무", "ERP"],
    performanceScore: 78,
  },
  {
    id: "EMP-005",
    employeeId: "EMP2024005",
    name: "김신입",
    position: "마케팅 인턴",
    department: "마케팅부",
    email: "snekim@company.com",
    phone: "010-5678-9012",
    hireDate: "2024-01-08",
    salary: 2500000,
    status: "재직",
    workType: "인턴",
    manager: "이영희",
    skills: ["소셜미디어", "콘텐츠 제작"],
    performanceScore: 72,
  },
];

// 영업부 직원들만 필터링하고 영업 성과 데이터로 변환
const getSalesPerformance = (): SalesPersonPerformance[] => {
  const salesEmployees = EMPLOYEES.filter(emp => emp.department === "영업부");
  
  // 영업부 직원이 없으면 빈 배열 반환
  if (salesEmployees.length === 0) {
    return [];
  }
  
  return salesEmployees.map((emp) => {
    // 성과점수를 기반으로 영업 데이터 생성
    const performanceMultiplier = emp.performanceScore / 100;
    
    // 직급별 기본 매출 목표 설정
    let baseTarget = 50000000; // 기본 5천만원
    if (emp.position.includes("팀장")) baseTarget = 100000000;
    else if (emp.position.includes("주임")) baseTarget = 70000000;
    else if (emp.position.includes("대리")) baseTarget = 60000000;
    
    const target = baseTarget;
    const revenue = Math.round(target * performanceMultiplier * 1.1); // 고정값으로 변경
    const leads = Math.round(30 + (emp.performanceScore / 100) * 20); // 고정값으로 변경
    const deals = Math.round(leads * (emp.performanceScore / 100) * 0.3);
    const conversionRate = Math.round((deals / leads) * 100 * 10) / 10;
    
    return {
      id: emp.id,
      name: emp.name,
      revenue,
      target,
      leads,
      deals,
      conversionRate,
      rank: 1,
    };
  }).sort((a, b) => b.revenue - a.revenue).map((emp, index) => ({ ...emp, rank: index + 1 }));
};

const SALES_PERFORMANCE = getSalesPerformance();

export function SalesAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    department: "전체",
    performanceMin: 0,
    performanceMax: 100,
    revenueMin: 0,
    revenueMax: 200000000
  });
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());

  // 기간별 데이터 필터링
  const getFilteredMonthlyData = () => {
    const periodMap = {
      "1month": 1,
      "3months": 3,
      "6months": 6,
      "1year": 12
    };
    const months = periodMap[selectedPeriod as keyof typeof periodMap] || 6;
    return MONTHLY_DATA.slice(-months);
  };

  // 필터링된 영업 성과 데이터
  const getFilteredSalesPerformance = () => {
    return SALES_PERFORMANCE.filter(person => {
      const employee = EMPLOYEES.find(emp => emp.id === person.id);
      if (!employee) return false;
      
      const matchesDepartment = filterCriteria.department === "전체" || employee.department === filterCriteria.department;
      const matchesPerformance = employee.performanceScore >= filterCriteria.performanceMin &&
        employee.performanceScore <= filterCriteria.performanceMax;
      const matchesRevenue = person.revenue >= filterCriteria.revenueMin && person.revenue <= filterCriteria.revenueMax;
      
      return matchesDepartment && matchesPerformance && matchesRevenue;
    });
  };

  // 버튼 핸들러들
  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const handleExport = () => {
    const filteredData = getFilteredSalesPerformance();
    const csvContent = "data:text/csv;charset=utf-8," + 
      "순위,이름,매출,목표,달성률,리드수,계약건수,전환율\n" +
      filteredData.map(person => 
        `${person.rank},${person.name},${person.revenue},${person.target},${Math.round((person.revenue / person.target) * 100)}%,${person.leads},${person.deals},${person.conversionRate}%`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `영업분석_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    setLastRefreshTime(new Date());
    // 실제로는 API 호출 등을 통해 데이터를 새로고침
    alert(`데이터가 새로고침되었습니다. (${new Date().toLocaleTimeString()})`);
  };

  const applyFilter = () => {
    setShowFilterModal(false);
  };

  const resetFilter = () => {
    setFilterCriteria({
      department: "전체",
      performanceMin: 0,
      performanceMax: 100,
      revenueMin: 0,
      revenueMax: 200000000
    });
  };

  const closeModal = () => {
    setShowFilterModal(false);
  };

  // 모달 스타일들
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
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <ArrowUpRight style={{ height: "1rem", width: "1rem", color: "#16a34a" }} />;
      case "down":
        return <ArrowDownRight style={{ height: "1rem", width: "1rem", color: "#dc2626" }} />;
      case "neutral":
        return <Minus style={{ height: "1rem", width: "1rem", color: "#9ca3af" }} />;
    }
  };


  const getMaxRevenue = () => Math.max(...MONTHLY_DATA.map((d) => Math.max(d.revenue, d.target)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.5rem" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>영업 분석</h1>
          <p style={{ color: "#6b7280" }}>영업 성과와 트렌드를 분석하고 인사이트를 확인하세요</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            backgroundColor: "white",
            cursor: "pointer",
            fontSize: "0.875rem"
          }} onClick={handleFilter}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            필터
          </button>
          <button style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            backgroundColor: "white",
            cursor: "pointer",
            fontSize: "0.875rem"
          }} onClick={handleExport}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            내보내기
          </button>
          <button style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            backgroundColor: "white",
            cursor: "pointer",
            fontSize: "0.875rem"
          }} onClick={handleRefresh}>
            <RefreshCw style={{ height: "1rem", width: "1rem" }} />
            새로고침
          </button>
        </div>
      </div>

      {/* 기간 선택 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>기간:</span>
        {[
          { value: "1month", label: "1개월" },
          { value: "3months", label: "3개월" },
          { value: "6months", label: "6개월" },
          { value: "1year", label: "1년" },
        ].map((period) => (
          <button
            key={period.value}
            style={{
              padding: "0.375rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              backgroundColor: selectedPeriod === period.value ? "#3b82f6" : "white",
              color: selectedPeriod === period.value ? "white" : "#374151",
              cursor: "pointer",
              fontSize: "0.875rem"
            }}
            onClick={() => setSelectedPeriod(period.value)}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* 주요 지표 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
        {SALES_METRICS.map((metric, index) => (
          <div key={index} style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 500, color: "#6b7280" }}>{metric.label}</h3>
              {getTrendIcon(metric.trend)}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.25rem" }}>{metric.value}</div>
            <div style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", color: metric.trend === "up" ? "#16a34a" : metric.trend === "down" ? "#dc2626" : "#6b7280" }}>
              {metric.change !== 0 && (
                <>
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%<span style={{ color: "#6b7280", marginLeft: "0.25rem" }}>{metric.period}</span>
                </>
              )}
              {metric.change === 0 && <span style={{ color: "#6b7280" }}>변화 없음</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 차트 영역 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {/* 매출 트렌드 차트 */}
        <div style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          minHeight: "20rem",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <BarChart3 style={{ height: "1.25rem", width: "1.25rem" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 600, lineHeight: "1.2" }}>월별 매출 vs 목표 ({selectedPeriod === "1month" ? "1개월" : selectedPeriod === "3months" ? "3개월" : selectedPeriod === "6months" ? "6개월" : "1년"})</h3>
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{ height: "6rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "0.5rem", marginBottom: "1rem" }}>
            {getFilteredMonthlyData().map((data, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", width: "100%" }}>
                  {/* 목표 바 */}
                  <div
                    style={{
                      backgroundColor: "#e5e7eb",
                      borderTopLeftRadius: "0.25rem",
                      borderTopRightRadius: "0.25rem",
                      width: "100%",
                      transition: "all 0.3s ease",
                      height: `${(data.target / getMaxRevenue()) * 60}px`,
                      minHeight: "12px",
                    }}
                    title={`목표: ${formatCurrency(data.target)}`}
                  />
                  {/* 매출 바 */}
                  <div
                    style={{
                      backgroundColor: data.revenue >= data.target ? "#10b981" : "#3b82f6",
                      borderBottomLeftRadius: "0.25rem",
                      borderBottomRightRadius: "0.25rem",
                      width: "100%",
                      transition: "all 0.3s ease",
                      height: `${(data.revenue / getMaxRevenue()) * 60}px`,
                      minHeight: "12px",
                    }}
                    title={`매출: ${formatCurrency(data.revenue)}`}
                  />
                </div>
                <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 500, textAlign: "center", whiteSpace: "nowrap", marginTop: "0.75rem", lineHeight: "1" }}>{data.month}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "0.75rem", height: "0.75rem", backgroundColor: "#3b82f6", borderRadius: "0.125rem" }}></div>
              <span>실제 매출</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "0.75rem", height: "0.75rem", backgroundColor: "#e5e7eb", borderRadius: "0.125rem" }}></div>
              <span>목표</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "0.75rem", height: "0.75rem", backgroundColor: "#10b981", borderRadius: "0.125rem" }}></div>
              <span>목표 달성</span>
            </div>
          </div>
        </div>

        {/* 리드 및 전환율 차트 */}
        <div style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", paddingBottom: "0.5rem" }}>
            <Target style={{ height: "1.25rem", width: "1.25rem" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 600, lineHeight: "1.2" }}>월별 리드 & 전환율 ({selectedPeriod === "1month" ? "1개월" : selectedPeriod === "3months" ? "3개월" : selectedPeriod === "6months" ? "6개월" : "1년"})</h3>
          </div>
          <div style={{ height: "18rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "0.5rem", marginTop: "1rem" }}>
            {getFilteredMonthlyData().map((data, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", width: "100%", alignItems: "center" }}>
                  {/* 리드 수 바 */}
                  <div
                    style={{
                      backgroundColor: "#fb923c",
                      borderRadius: "0.25rem",
                      width: "100%",
                      transition: "all 0.3s ease",
                      height: `${(data.leads / 200) * 100}px`,
                      minHeight: "10px",
                    }}
                    title={`리드: ${data.leads}개`}
                  />
                  {/* 전환율 표시 */}
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7c3aed", marginTop: "0.25rem" }}>{data.conversion}%</div>
                </div>
                <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 500, textAlign: "center", whiteSpace: "nowrap", marginTop: "0.75rem", lineHeight: "1" }}>{data.month}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "0.75rem", height: "0.75rem", backgroundColor: "#fb923c", borderRadius: "0.125rem" }}></div>
              <span>리드 수</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "0.75rem", height: "0.75rem", backgroundColor: "#7c3aed", borderRadius: "0.125rem" }}></div>
              <span>전환율 (%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 영업팀 성과 */}
      <div style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        padding: "1.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Users style={{ height: "1.25rem", width: "1.25rem" }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>영업팀 개인 성과</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {getFilteredSalesPerformance().length > 0 ? (
            getFilteredSalesPerformance().map((person) => (
              <div key={person.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", backgroundColor: "#dbeafe", color: "#2563eb", borderRadius: "50%", fontWeight: 600 }}>{person.rank}</div>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{person.name}</h3>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {person.deals}건 성사 • 전환율 {person.conversionRate}%
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>매출</p>
                    <p style={{ fontWeight: 600 }}>{formatCurrency(person.revenue)}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>목표 달성률</p>
                    <p style={{ fontWeight: 600, color: person.revenue >= person.target ? "#16a34a" : "#ea580c" }}>
                      {Math.round((person.revenue / person.target) * 100)}%
                    </p>
                  </div>
                  <div style={{ width: "8rem", backgroundColor: "#e5e7eb", borderRadius: "9999px", height: "0.5rem" }}>
                    <div
                      style={{
                        height: "0.5rem",
                        borderRadius: "9999px",
                        transition: "all 0.3s ease",
                        backgroundColor: person.revenue >= person.target ? "#10b981" : "#3b82f6",
                        width: `${Math.min((person.revenue / person.target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor: person.revenue >= person.target ? "#3b82f6" : "#6b7280",
                    color: "white"
                  }}>{person.leads} 리드</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: "3rem", 
              textAlign: "center", 
              color: "#6b7280",
              backgroundColor: "#f9fafb",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb"
            }}>
              <Users style={{ height: "3rem", width: "3rem", color: "#d1d5db", margin: "0 auto 1rem" }} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>영업팀 데이터 없음</h3>
              <p style={{ fontSize: "0.875rem" }}>현재 영업부에 등록된 직원이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 인사이트 및 제안 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        <div style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <TrendingUp style={{ height: "1.25rem", width: "1.25rem", color: "#16a34a" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>긍정적 인사이트</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ padding: "0.75rem", backgroundColor: "#f0fdf4", borderRadius: "0.5rem", border: "1px solid #bbf7d0" }}>
              <h4 style={{ fontWeight: 600, color: "#166534", marginBottom: "0.5rem" }}>월간 목표 초과 달성</h4>
              <p style={{ fontSize: "0.875rem", color: "#15803d" }}>이번 달 매출이 목표 대비 103% 달성하여 ₩7,500,000 초과 실적을 기록했습니다.</p>
            </div>
            <div style={{ padding: "0.75rem", backgroundColor: "#eff6ff", borderRadius: "0.5rem", border: "1px solid #bfdbfe" }}>
              <h4 style={{ fontWeight: 600, color: "#1e40af", marginBottom: "0.5rem" }}>리드 증가 추세</h4>
              <p style={{ fontSize: "0.875rem", color: "#1d4ed8" }}>신규 리드가 지난달 대비 8.2% 증가하여 영업 파이프라인이 건강하게 성장하고 있습니다.</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <TrendingDown style={{ height: "1.25rem", width: "1.25rem", color: "#ea580c" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>개선 제안</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ padding: "0.75rem", backgroundColor: "#fff7ed", borderRadius: "0.5rem", border: "1px solid #fed7aa" }}>
              <h4 style={{ fontWeight: 600, color: "#9a3412", marginBottom: "0.5rem" }}>전환율 개선 필요</h4>
              <p style={{ fontSize: "0.875rem", color: "#c2410c" }}>
                전환율이 23.4%로 지난달 대비 2.1% 감소했습니다. 리드 품질 개선이나 후속 관리 강화를 권장합니다.
              </p>
            </div>
            <div style={{ padding: "0.75rem", backgroundColor: "#fefce8", borderRadius: "0.5rem", border: "1px solid #fde047" }}>
              <h4 style={{ fontWeight: 600, color: "#a16207", marginBottom: "0.5rem" }}>영업팀 교육 제안</h4>
              <p style={{ fontSize: "0.875rem", color: "#ca8a04" }}>
                개별 성과 편차가 큽니다. 상위 성과자의 베스트 프랙티스를 팀 전체에 공유하는 것을 권장합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 모달 */}
      {showFilterModal && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={{...modalStyle, maxWidth: "30rem"}} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>필터 설정</h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* 부서 필터 */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>부서</label>
                <select 
                  value={filterCriteria.department}
                  onChange={(e) => setFilterCriteria({...filterCriteria, department: e.target.value})}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                >
                  <option value="전체">전체</option>
                  <option value="영업부">영업부</option>
                  <option value="마케팅부">마케팅부</option>
                  <option value="개발부">개발부</option>
                  <option value="인사부">인사부</option>
                </select>
              </div>

              {/* 성과점수 범위 */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>성과점수 범위</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filterCriteria.performanceMin}
                    onChange={(e) => setFilterCriteria({...filterCriteria, performanceMin: Number(e.target.value)})}
                    style={{ flex: 1, padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                    placeholder="최소"
                  />
                  <span>~</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filterCriteria.performanceMax}
                    onChange={(e) => setFilterCriteria({...filterCriteria, performanceMax: Number(e.target.value)})}
                    style={{ flex: 1, padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                    placeholder="최대"
                  />
                </div>
              </div>

              {/* 매출 범위 */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>매출 범위 (원)</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="number"
                    min="0"
                    value={filterCriteria.revenueMin}
                    onChange={(e) => setFilterCriteria({...filterCriteria, revenueMin: Number(e.target.value)})}
                    style={{ flex: 1, padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                    placeholder="최소 매출"
                  />
                  <span>~</span>
                  <input
                    type="number"
                    min="0"
                    value={filterCriteria.revenueMax}
                    onChange={(e) => setFilterCriteria({...filterCriteria, revenueMax: Number(e.target.value)})}
                    style={{ flex: 1, padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                    placeholder="최대 매출"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                onClick={resetFilter}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                초기화
              </button>
              <button
                onClick={applyFilter}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
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
