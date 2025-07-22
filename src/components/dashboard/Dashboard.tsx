import React from "react";
import { DollarSign, Users, ShoppingCart, Package, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { MetricsCard } from "./MetricsCard";

interface DashboardProps {
  userRole?: string;
}

export function Dashboard({ userRole = "admin" }: DashboardProps) {
  const containerStyle: React.CSSProperties = {
    flex: 1,
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

  const metricsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  };

  const sectionsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "2rem",
  };

  const sectionCardStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "1rem",
    padding: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const taskItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    marginBottom: "0.5rem",
    background: "rgba(255, 255, 255, 0.6)",
    border: "1px solid rgba(229, 231, 235, 0.5)",
    transition: "all 0.2s ease",
  };

  const taskItemHoverStyle: React.CSSProperties = {
    ...taskItemStyle,
    background: "rgba(255, 255, 255, 0.8)",
    transform: "translateX(4px)",
  };

  const priorityBadgeStyle = (priority: "high" | "medium" | "low"): React.CSSProperties => {
    const colors = {
      high: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
      medium: { bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
      low: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    };

    return {
      fontSize: "0.75rem",
      fontWeight: 500,
      padding: "0.25rem 0.5rem",
      borderRadius: "0.375rem",
      backgroundColor: colors[priority].bg,
      color: colors[priority].color,
      border: `1px solid ${colors[priority].border}`,
    };
  };

  const activityItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    marginBottom: "0.5rem",
    background: "rgba(255, 255, 255, 0.6)",
    border: "1px solid rgba(229, 231, 235, 0.5)",
  };

  const activityDotStyle: React.CSSProperties = {
    width: "0.5rem",
    height: "0.5rem",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    marginTop: "0.25rem",
    flexShrink: 0,
  };

  const progressBarStyle: React.CSSProperties = {
    width: "100%",
    height: "0.5rem",
    backgroundColor: "rgba(229, 231, 235, 0.6)",
    borderRadius: "0.25rem",
    overflow: "hidden",
  };

  const progressFillStyle = (percentage: number, color: string): React.CSSProperties => ({
    height: "100%",
    width: `${percentage}%`,
    backgroundColor: color,
    borderRadius: "0.25rem",
    transition: "width 0.5s ease",
  });

  const chartContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: "0.5rem",
    height: "8rem",
    marginTop: "1rem",
  };

  const chartBarStyle = (height: number): React.CSSProperties => ({
    width: "2rem",
    height: `${height}%`,
    background: "linear-gradient(180deg, #3b82f6, #1d4ed8)",
    borderRadius: "0.25rem 0.25rem 0 0",
    transition: "height 0.5s ease",
  });

  const metricsData = [
    {
      title: "이번 달 매출",
      value: "₩247,500,000",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "blue" as const,
    },
    {
      title: "신규 고객",
      value: "23",
      change: "+8.2%",
      trend: "up" as const,
      icon: Users,
      color: "green" as const,
    },
    {
      title: "진행 중인 주문",
      value: "156",
      change: "-2.1%",
      trend: "down" as const,
      icon: ShoppingCart,
      color: "purple" as const,
    },
    {
      title: "재고 회전율",
      value: "2.4회",
      change: "+0.8%",
      trend: "up" as const,
      icon: Package,
      color: "orange" as const,
    },
  ];

  const todayTasks = [
    { id: 1, task: "긴급 견적서 승인", priority: "high" as const, completed: false },
    { id: 2, task: "A사와 프로젝트 회의", priority: "medium" as const, completed: false },
    { id: 3, task: "생산 일정 검토", priority: "high" as const, completed: true },
    { id: 4, task: "월간 실적 분석", priority: "low" as const, completed: false },
    { id: 5, task: "3분기 재무 리뷰", priority: "medium" as const, completed: false },
  ];

  const recentActivities = [
    { time: "방금", activity: "새로운 주문서가 접수되었습니다", user: "C사" },
    { time: "5분 전", activity: "견적서 #QT-2024-001이 승인되었습니다", user: "김대표" },
    { time: "10분 전", activity: "생산 지시서가 발행되었습니다", user: "생산팀" },
    { time: "15분 전", activity: "제품 출고가 완료되었습니다", user: "물류팀" },
    { time: "30분 전", activity: "품질 검사가 통과되었습니다", user: "품질팀" },
  ];

  const departmentStatus = [
    { name: "영업팀", progress: 85, color: "#3b82f6" },
    { name: "생산팀", progress: 92, color: "#10b981" },
    { name: "품질팀", progress: 78, color: "#f59e0b" },
    { name: "물류팀", progress: 95, color: "#8b5cf6" },
  ];

  const monthlyData = [65, 78, 82, 88, 95, 85, 90];
  const maxValue = Math.max(...monthlyData);

  const TaskItem = ({ task, priority, completed }: { task: string; priority: "high" | "medium" | "low"; completed: boolean }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div style={isHovered ? taskItemHoverStyle : taskItemStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {completed ? (
            <CheckCircle style={{ height: "1.125rem", width: "1.125rem", color: "#10b981" }} />
          ) : (
            <Clock style={{ height: "1.125rem", width: "1.125rem", color: "#6b7280" }} />
          )}
          <span
            style={{
              fontSize: "0.875rem",
              color: completed ? "#6b7280" : "#374151",
              textDecoration: completed ? "line-through" : "none",
            }}
          >
            {task}
          </span>
        </div>
        <span style={priorityBadgeStyle(priority)}>{priority === "high" ? "높음" : priority === "medium" ? "보통" : "낮음"}</span>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>통합 대시보드</h1>
        <p style={subtitleStyle}>제조업무해결사 주식회사의 실시간 경영 현황을 확인하세요</p>
      </div>

      {/* Metrics Cards */}
      <div style={metricsGridStyle}>
        {metricsData.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Sections */}
      <div style={sectionsGridStyle}>
        {/* Today's Tasks */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>
            <AlertCircle style={{ height: "1.25rem", width: "1.25rem", color: "#f59e0b" }} />
            오늘의 할 일
          </h2>
          <div>
            {todayTasks.map((item) => (
              <TaskItem key={item.id} task={item.task} priority={item.priority} completed={item.completed} />
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>
            <Clock style={{ height: "1.25rem", width: "1.25rem", color: "#3b82f6" }} />
            최근 활동
          </h2>
          <div>
            {recentActivities.map((activity, index) => (
              <div key={index} style={activityItemStyle}>
                <div style={activityDotStyle} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.25rem" }}>{activity.activity}</p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Status */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>
            <Users style={{ height: "1.25rem", width: "1.25rem", color: "#10b981" }} />
            부서별 현황
          </h2>
          <div>
            {departmentStatus.map((dept, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>{dept.name}</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: dept.color }}>{dept.progress}%</span>
                </div>
                <div style={progressBarStyle}>
                  <div style={progressFillStyle(dept.progress, dept.color)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Sales Trend */}
        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>
            <DollarSign style={{ height: "1.25rem", width: "1.25rem", color: "#8b5cf6" }} />
            월간 매출 트렌드
          </h2>
          <div style={chartContainerStyle}>
            {monthlyData.map((value, index) => (
              <div key={index} style={chartBarStyle((value / maxValue) * 100)} title={`${value}M`} />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "#6b7280",
            }}
          >
            {["1월", "2월", "3월", "4월", "5월", "6월", "7월"].map((month, index) => (
              <span key={index}>{month}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
