import React, { useState } from "react";
import { Search, Plus, Filter, Download, Edit, Eye, Phone, Mail, UserCheck, UserX, Award, Clock } from "lucide-react";

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
  status: "재직" | "휴직" | "퇴사";
  workType: "정규직" | "계약직" | "인턴";
  manager: string;
  skills: string[];
  performanceScore: number;
  avatar?: string;
}

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");

  const containerStyle: React.CSSProperties = {
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

  const statsContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  };

  const statCardStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    borderRadius: "1rem",
    padding: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };

  const actionsBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    padding: "1rem",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    borderRadius: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  const searchContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const searchInputStyle: React.CSSProperties = {
    padding: "0.5rem 1rem 0.5rem 2.5rem",
    border: "2px solid #e5e7eb",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    width: "20rem",
    background: "white",
    transition: "all 0.2s ease",
  };

  const filterSelectStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    background: "white",
    cursor: "pointer",
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "rgba(255, 255, 255, 0.8)",
    color: "#374151",
    border: "1px solid #d1d5db",
  };

  const tableContainerStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    borderRadius: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const tableHeaderStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
    borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
  };

  const thStyle: React.CSSProperties = {
    padding: "1rem",
    textAlign: "left",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
  };

  const tdStyle: React.CSSProperties = {
    padding: "1rem",
    borderBottom: "1px solid rgba(229, 231, 235, 0.3)",
    fontSize: "0.875rem",
    color: "#374151",
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    const colors = {
      재직: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      휴직: { bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
      퇴사: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    };

    const colorSet = colors[status as keyof typeof colors] || colors["재직"];

    return {
      fontSize: "0.75rem",
      fontWeight: 500,
      padding: "0.25rem 0.5rem",
      borderRadius: "0.375rem",
      backgroundColor: colorSet.bg,
      color: colorSet.color,
      border: `1px solid ${colorSet.border}`,
    };
  };

  const workTypeBadgeStyle = (workType: string): React.CSSProperties => {
    const colors = {
      정규직: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
      계약직: { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" },
      인턴: { bg: "#fdf4ff", color: "#c026d3", border: "#f0abfc" },
    };

    const colorSet = colors[workType as keyof typeof colors] || colors["정규직"];

    return {
      fontSize: "0.75rem",
      fontWeight: 500,
      padding: "0.25rem 0.5rem",
      borderRadius: "0.375rem",
      backgroundColor: colorSet.bg,
      color: colorSet.color,
      border: `1px solid ${colorSet.border}`,
    };
  };

  const performanceBarStyle: React.CSSProperties = {
    width: "4rem",
    height: "0.5rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "0.25rem",
    overflow: "hidden",
  };

  const performanceFillStyle = (score: number): React.CSSProperties => {
    let color = "#dc2626"; // 낮음 (빨강)
    if (score >= 80) color = "#16a34a"; // 높음 (녹색)
    else if (score >= 60) color = "#d97706"; // 보통 (주황)

    return {
      height: "100%",
      width: `${score}%`,
      backgroundColor: color,
      borderRadius: "0.25rem",
      transition: "width 0.3s ease",
    };
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "0.25rem",
    border: "none",
    background: "transparent",
    borderRadius: "0.25rem",
    cursor: "pointer",
    color: "#6b7280",
    transition: "all 0.2s ease",
  };

  // 샘플 데이터
  const employees: Employee[] = [
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

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "전체" || emp.department === selectedDepartment;
    const matchesStatus = selectedStatus === "전체" || emp.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "재직":
        return <UserCheck style={{ height: "1rem", width: "1rem" }} />;
      case "휴직":
        return <Clock style={{ height: "1rem", width: "1rem" }} />;
      case "퇴사":
        return <UserX style={{ height: "1rem", width: "1rem" }} />;
      default:
        return <UserCheck style={{ height: "1rem", width: "1rem" }} />;
    }
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return "우수";
    if (score >= 60) return "보통";
    return "개선필요";
  };

  // 통계 계산
  const stats = {
    total: employees.filter((e) => e.status !== "퇴사").length,
    active: employees.filter((e) => e.status === "재직").length,
    onLeave: employees.filter((e) => e.status === "휴직").length,
    departments: new Set(employees.filter((e) => e.status !== "퇴사").map((e) => e.department)).size,
    avgPerformance: Math.round(
      employees.filter((e) => e.status === "재직").reduce((sum, emp) => sum + emp.performanceScore, 0) /
        employees.filter((e) => e.status === "재직").length
    ),
  };

  const departments = ["전체", ...Array.from(new Set(employees.map((e) => e.department)))];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>직원 관리</h1>
        <p style={subtitleStyle}>직원 정보와 성과를 체계적으로 관리하세요</p>
      </div>

      {/* Statistics Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.5rem" }}>{stats.total}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>총 직원수</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.5rem" }}>{stats.active}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>재직중</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#d97706", marginBottom: "0.5rem" }}>{stats.onLeave}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>휴직중</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "0.5rem" }}>{stats.departments}</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>부서수</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#dc2626", marginBottom: "0.5rem" }}>{stats.avgPerformance}%</div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>평균 성과</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div style={actionsBarStyle}>
        <div style={searchContainerStyle}>
          <div style={{ position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                height: "1rem",
                width: "1rem",
                color: "#6b7280",
              }}
            />
            <input
              type="text"
              placeholder="이름, 직원번호, 직책으로 검색..."
              style={searchInputStyle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select style={filterSelectStyle} value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select style={filterSelectStyle} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="전체">전체 상태</option>
            <option value="재직">재직</option>
            <option value="휴직">휴직</option>
            <option value="퇴사">퇴사</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={secondaryButtonStyle}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            고급 필터
          </button>
          <button style={secondaryButtonStyle}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            직원 명단
          </button>
          <button style={primaryButtonStyle}>
            <Plus style={{ height: "1rem", width: "1rem" }} />
            신규 직원 등록
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead style={tableHeaderStyle}>
            <tr>
              <th style={thStyle}>직원정보</th>
              <th style={thStyle}>부서/직책</th>
              <th style={thStyle}>고용형태</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>연락처</th>
              <th style={thStyle}>입사일</th>
              <th style={thStyle}>급여</th>
              <th style={thStyle}>성과점수</th>
              <th style={thStyle}>관리자</th>
              <th style={thStyle}>주요 스킬</th>
              <th style={thStyle}>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} style={{ transition: "background-color 0.2s ease" }}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      {employee.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{employee.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{employee.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{employee.department}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{employee.position}</div>
                </td>
                <td style={tdStyle}>
                  <span style={workTypeBadgeStyle(employee.workType)}>{employee.workType}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: statusBadgeStyle(employee.status).color }}>{getStatusIcon(employee.status)}</span>
                    <span style={statusBadgeStyle(employee.status)}>{employee.status}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Phone style={{ height: "0.875rem", width: "0.875rem", color: "#6b7280" }} />
                      <span style={{ fontSize: "0.75rem" }}>{employee.phone}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Mail style={{ height: "0.875rem", width: "0.875rem", color: "#6b7280" }} />
                      <span style={{ fontSize: "0.75rem" }}>{employee.email}</span>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>{employee.hireDate}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(employee.salary)}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={performanceBarStyle}>
                      <div style={performanceFillStyle(employee.performanceScore)} />
                    </div>
                    <div style={{ fontSize: "0.75rem" }}>
                      <div style={{ fontWeight: 600 }}>{employee.performanceScore}%</div>
                      <div style={{ color: "#6b7280" }}>{getPerformanceLevel(employee.performanceScore)}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>{employee.manager}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                    {employee.skills.slice(0, 2).map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.125rem 0.375rem",
                          backgroundColor: "#f3f4f6",
                          color: "#374151",
                          borderRadius: "0.25rem",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {employee.skills.length > 2 && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.125rem 0.375rem",
                          backgroundColor: "#e5e7eb",
                          color: "#6b7280",
                          borderRadius: "0.25rem",
                        }}
                      >
                        +{employee.skills.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button style={actionButtonStyle} title="보기">
                      <Eye style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="편집">
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="성과평가">
                      <Award style={{ height: "1rem", width: "1rem" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          color: "#6b7280",
        }}
      >
        총 {filteredEmployees.length}명의 직원이 표시됨 (전체 {employees.length}명 중)
      </div>
    </div>
  );
}
