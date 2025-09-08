import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, Edit, Eye, Phone, Mail, UserCheck, UserX, Award, Clock } from "lucide-react";
import { useEmployees } from "../context/EmployeeContext";
import type { Employee } from "../types/employee";

export function EmployeesPage() {
  const { employees, setEmployees, addEmployee, updateEmployee, getDataSourceSummary, getEmployeesByDataSource } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [selectedWorkType, setSelectedWorkType] = useState("전체");
  const [selectedDataSource, setSelectedDataSource] = useState("전체");
  const [currentEmployees, setCurrentEmployees] = useState<Employee[]>([]);
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 10000000 });
  const [performanceRange, setPerformanceRange] = useState({ min: 0, max: 100 });
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployeeForm, setNewEmployeeForm] = useState<Partial<Employee>>({
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    salary: 0,
    status: "재직",
    workType: "정규직",
    manager: "",
    skills: [],
    performanceScore: 0
  });

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


  // 데이터 소스 변경 시 직원 데이터 업데이트
  useEffect(() => {
    if (selectedDataSource === "전체") {
      setCurrentEmployees(employees);
    } else {
      const sourceEmployees = getEmployeesByDataSource(selectedDataSource as "demo" | "erp" | "generated" | "massive");
      setCurrentEmployees(sourceEmployees);
    }
  }, [selectedDataSource, employees, getEmployeesByDataSource]);

  // 초기 로드 시 전체 직원 데이터 설정
  useEffect(() => {
    setCurrentEmployees(employees);
  }, [employees]);

  const filteredEmployees = currentEmployees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = selectedDepartment === "전체" || emp.department === selectedDepartment;
    const matchesStatus = selectedStatus === "전체" || emp.status === selectedStatus;
    const matchesWorkType = selectedWorkType === "전체" || emp.workType === selectedWorkType;
    const matchesSalary = emp.salary >= salaryRange.min && emp.salary <= salaryRange.max;
    const matchesPerformance = emp.performanceScore >= performanceRange.min && emp.performanceScore <= performanceRange.max;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus &&
      matchesWorkType &&
      matchesSalary &&
      matchesPerformance
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "우수";
    if (score >= 80) return "양호";
    if (score >= 70) return "보통";
    if (score >= 60) return "개선필요";
    return "미흡";
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

  // 통계 계산 (현재 선택된 데이터 소스 기준)
  const stats = {
    total: currentEmployees.filter((e) => e.status !== "퇴사").length,
    active: currentEmployees.filter((e) => e.status === "재직").length,
    onLeave: currentEmployees.filter((e) => e.status === "휴직").length,
    departments: Array.from(new Set(currentEmployees.map((e) => e.department))).length,
    avgPerformance: currentEmployees.length > 0 ? Math.round(
      currentEmployees.reduce((sum, e) => sum + e.performanceScore, 0) / currentEmployees.length
    ) : 0,
  };

  const departments = ["전체", ...Array.from(new Set(currentEmployees.map((e) => e.department)))];
  const workTypes = ["전체", "정규직", "계약직", "인턴"];
  const dataSourceSummary = getDataSourceSummary();
  const dataSources = ["전체", ...Object.keys(dataSourceSummary)];

  // 모달 스타일
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
    zIndex: 50,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "1rem",
    padding: "2rem",
    maxWidth: "32rem",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    border: "2px solid #e5e7eb",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    transition: "border-color 0.2s ease",
  };

  // 함수들
  const handleAdvancedFilter = () => {
    setShowAdvancedFilter(true);
  };

  const handleExportEmployeeList = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "직원번호,이름,부서,직책,상태,고용형태,연락처,입사일,급여,성과점수\n" +
      filteredEmployees.map(emp => 
        `${emp.employeeId},${emp.name},${emp.department},${emp.position},${emp.status},${emp.workType},${emp.phone},${emp.hireDate},${emp.salary},${emp.performanceScore}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `직원명단_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewEmployee = () => {
    setShowNewEmployeeModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewEmployeeForm(employee);
    setShowEditModal(true);
  };

  const handlePerformanceEvaluation = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPerformanceModal(true);
  };

  const handleAddEmployee = () => {
    if (newEmployeeForm.name && newEmployeeForm.position && newEmployeeForm.department) {
      const newEmployee: Employee = {
        id: `EMP-${Date.now()}`,
        employeeId: `EMP${new Date().getFullYear()}${String(employees.length + 1).padStart(3, '0')}`,
        name: newEmployeeForm.name!,
        position: newEmployeeForm.position!,
        department: newEmployeeForm.department!,
        email: newEmployeeForm.email || "",
        phone: newEmployeeForm.phone || "",
        hireDate: new Date().toISOString().split('T')[0],
        salary: newEmployeeForm.salary || 0,
        status: newEmployeeForm.status || "재직",
        workType: newEmployeeForm.workType || "정규직",
        manager: newEmployeeForm.manager || "",
        skills: newEmployeeForm.skills || [],
        performanceScore: 0,
      };
      addEmployee(newEmployee);
      setShowNewEmployeeModal(false);
      setNewEmployeeForm({
        name: "",
        position: "",
        department: "",
        email: "",
        phone: "",
        salary: 0,
        status: "재직",
        workType: "정규직",
        manager: "",
        skills: [],
      });
    }
  };

  const handleSubmitNewEmployee = () => {
    if (!newEmployeeForm.name || !newEmployeeForm.department || !newEmployeeForm.position) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    const newEmployee: Employee = {
      id: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      employeeId: `EMP2024${String(employees.length + 1).padStart(3, '0')}`,
      name: newEmployeeForm.name!,
      position: newEmployeeForm.position!,
      department: newEmployeeForm.department!,
      email: newEmployeeForm.email!,
      phone: newEmployeeForm.phone!,
      hireDate: new Date().toISOString().split('T')[0],
      salary: newEmployeeForm.salary || 0,
      status: newEmployeeForm.status as Employee['status'] || "재직",
      workType: newEmployeeForm.workType as Employee['workType'] || "정규직",
      manager: newEmployeeForm.manager || "",
      skills: newEmployeeForm.skills || [],
      performanceScore: newEmployeeForm.performanceScore || 0,
    };

    setEmployees([...employees, newEmployee]);
    setNewEmployeeForm({
      name: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      salary: 0,
      status: "재직",
      workType: "정규직",
      manager: "",
      skills: [],
      performanceScore: 0
    });
    setShowNewEmployeeModal(false);
  };

  const handleUpdateEmployee = () => {
    if (!selectedEmployee || !newEmployeeForm.name) return;

    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id 
        ? { ...emp, ...newEmployeeForm } as Employee
        : emp
    );
    
    setEmployees(updatedEmployees);
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const handleUpdatePerformance = (newScore: number, notes: string) => {
    if (!selectedEmployee) return;

    const updatedEmployees = employees.map(emp => 
      emp.id === selectedEmployee.id 
        ? { ...emp, performanceScore: newScore, notes }
        : emp
    );
    
    setEmployees(updatedEmployees);
    setShowPerformanceModal(false);
    setSelectedEmployee(null);
  };

  const closeModals = () => {
    setShowAdvancedFilter(false);
    setShowNewEmployeeModal(false);
    setShowEditModal(false);
    setShowPerformanceModal(false);
    setShowViewModal(false);
    setSelectedEmployee(null);
  };

  const resetAdvancedFilters = () => {
    setSelectedWorkType("전체");
    setSalaryRange({ min: 0, max: 10000000 });
    setPerformanceRange({ min: 0, max: 100 });
  };

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

          <select style={filterSelectStyle} value={selectedDataSource} onChange={(e) => setSelectedDataSource(e.target.value)}>
            {dataSources.map((source) => (
              <option key={source} value={source}>
                {source === "전체" ? "전체 데이터" : dataSourceSummary[source]?.label || source}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={secondaryButtonStyle} onClick={handleAdvancedFilter}>
            <Filter style={{ height: "1rem", width: "1rem" }} />
            고급 필터
          </button>
          <button style={secondaryButtonStyle} onClick={handleExportEmployeeList}>
            <Download style={{ height: "1rem", width: "1rem" }} />
            직원 명단
          </button>
          <button style={primaryButtonStyle} onClick={handleNewEmployee}>
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
              <th style={thStyle}>데이터 출처</th>
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
                  <div style={{ fontSize: "0.75rem" }}>
                    <div style={{ fontWeight: 500, color: "#374151" }}>
                      {employee.dataSourceLabel || employee.dataSource || "알 수 없음"}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.7rem" }}>
                      {employee.dataSource === "erp" ? "ERP 시스템" : 
                       employee.dataSource === "generated" ? "샘플 데이터" : "기타"}
                    </div>
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
                    <button style={actionButtonStyle} title="보기" onClick={() => { 
                      setSelectedEmployee(employee); 
                      setShowViewModal(true);
                    }}>
                      <Eye style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="편집" onClick={() => handleEditEmployee(employee)}>
                      <Edit style={{ height: "1rem", width: "1rem" }} />
                    </button>
                    <button style={actionButtonStyle} title="성과평가" onClick={() => handlePerformanceEvaluation(employee)}>
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
        총 {filteredEmployees.length}명의 직원이 표시됨 (현재 데이터 소스: {currentEmployees.length}명 중)
      </div>

      {/* Advanced Filter Modal */}
      {showAdvancedFilter && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>고급 필터</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>고용형태</label>
                <select style={inputStyle} value={selectedWorkType} onChange={(e) => setSelectedWorkType(e.target.value)}>
                  {workTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>급여 범위</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="number"
                    placeholder="최소"
                    value={salaryRange.min}
                    onChange={(e) => setSalaryRange({...salaryRange, min: Number(e.target.value)})}
                    style={{...inputStyle, width: "50%"}}
                  />
                  <span>~</span>
                  <input
                    type="number"
                    placeholder="최대"
                    value={salaryRange.max}
                    onChange={(e) => setSalaryRange({...salaryRange, max: Number(e.target.value)})}
                    style={{...inputStyle, width: "50%"}}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>성과점수 범위</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="number"
                    placeholder="최소"
                    min="0"
                    max="100"
                    value={performanceRange.min}
                    onChange={(e) => setPerformanceRange({...performanceRange, min: Number(e.target.value)})}
                    style={{...inputStyle, width: "50%"}}
                  />
                  <span>~</span>
                  <input
                    type="number"
                    placeholder="최대"
                    min="0"
                    max="100"
                    value={performanceRange.max}
                    onChange={(e) => setPerformanceRange({...performanceRange, max: Number(e.target.value)})}
                    style={{...inputStyle, width: "50%"}}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button style={secondaryButtonStyle} onClick={resetAdvancedFilters}>
                초기화
              </button>
              <button style={secondaryButtonStyle} onClick={closeModals}>
                취소
              </button>
              <button style={primaryButtonStyle} onClick={closeModals}>
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Employee Modal */}
      {showNewEmployeeModal && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={{...modalStyle, maxWidth: "40rem"}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>신규 직원 등록</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>이름 *</label>
                <input
                  type="text"
                  value={newEmployeeForm.name || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, name: e.target.value})}
                  style={inputStyle}
                  placeholder="직원 이름을 입력하세요"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>직책 *</label>
                <input
                  type="text"
                  value={newEmployeeForm.position || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, position: e.target.value})}
                  style={inputStyle}
                  placeholder="직책을 입력하세요"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>부서 *</label>
                <select
                  value={newEmployeeForm.department || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, department: e.target.value})}
                  style={inputStyle}
                >
                  <option value="">부서 선택</option>
                  {departments.filter(d => d !== "전체").map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>고용형태</label>
                <select
                  value={newEmployeeForm.workType || "정규직"}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, workType: e.target.value as Employee['workType']})}
                  style={inputStyle}
                >
                  <option value="정규직">정규직</option>
                  <option value="계약직">계약직</option>
                  <option value="인턴">인턴</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>이메일</label>
                <input
                  type="email"
                  value={newEmployeeForm.email || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, email: e.target.value})}
                  style={inputStyle}
                  placeholder="이메일을 입력하세요"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>전화번호</label>
                <input
                  type="tel"
                  value={newEmployeeForm.phone || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, phone: e.target.value})}
                  style={inputStyle}
                  placeholder="010-0000-0000"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>급여</label>
                <input
                  type="number"
                  value={newEmployeeForm.salary || 0}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, salary: Number(e.target.value)})}
                  style={inputStyle}
                  placeholder="급여를 입력하세요"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>관리자</label>
                <input
                  type="text"
                  value={newEmployeeForm.manager || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, manager: e.target.value})}
                  style={inputStyle}
                  placeholder="관리자 이름을 입력하세요"
                />
              </div>
            </div>
            
            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>주요 스킬 (쉼표로 구분)</label>
              <input
                type="text"
                value={newEmployeeForm.skills?.join(", ") || ""}
                onChange={(e) => setNewEmployeeForm({...newEmployeeForm, skills: e.target.value.split(", ").filter(s => s.trim())})}
                style={inputStyle}
                placeholder="예: React, TypeScript, Node.js"
              />
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button style={secondaryButtonStyle} onClick={closeModals}>
                취소
              </button>
              <button style={primaryButtonStyle} onClick={handleSubmitNewEmployee}>
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={{...modalStyle, maxWidth: "40rem"}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>{selectedEmployee.name} 정보 수정</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>이름</label>
                <input
                  type="text"
                  value={newEmployeeForm.name || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, name: e.target.value})}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>직책</label>
                <input
                  type="text"
                  value={newEmployeeForm.position || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, position: e.target.value})}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>부서</label>
                <select
                  value={newEmployeeForm.department || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, department: e.target.value})}
                  style={inputStyle}
                >
                  {departments.filter(d => d !== "전체").map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>상태</label>
                <select
                  value={newEmployeeForm.status || "재직"}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, status: e.target.value as Employee['status']})}
                  style={inputStyle}
                >
                  <option value="재직">재직</option>
                  <option value="휴직">휴직</option>
                  <option value="퇴사">퇴사</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>이메일</label>
                <input
                  type="email"
                  value={newEmployeeForm.email || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, email: e.target.value})}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>전화번호</label>
                <input
                  type="tel"
                  value={newEmployeeForm.phone || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, phone: e.target.value})}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>급여</label>
                <input
                  type="number"
                  value={newEmployeeForm.salary || 0}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, salary: Number(e.target.value)})}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>관리자</label>
                <input
                  type="text"
                  value={newEmployeeForm.manager || ""}
                  onChange={(e) => setNewEmployeeForm({...newEmployeeForm, manager: e.target.value})}
                  style={inputStyle}
                />
              </div>
            </div>
            
            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>주요 스킬</label>
              <input
                type="text"
                value={newEmployeeForm.skills?.join(", ") || ""}
                onChange={(e) => setNewEmployeeForm({...newEmployeeForm, skills: e.target.value.split(", ").filter(s => s.trim())})}
                style={inputStyle}
                placeholder="예: React, TypeScript, Node.js"
              />
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button style={secondaryButtonStyle} onClick={closeModals}>
                취소
              </button>
              <button style={primaryButtonStyle} onClick={handleUpdateEmployee}>
                수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Evaluation Modal */}
      {showPerformanceModal && selectedEmployee && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>{selectedEmployee.name} 성과평가</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "0.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>현재 정보</h3>
                <p><strong>직책:</strong> {selectedEmployee.position}</p>
                <p><strong>부서:</strong> {selectedEmployee.department}</p>
                <p><strong>현재 성과점수:</strong> {selectedEmployee.performanceScore}% ({getPerformanceLevel(selectedEmployee.performanceScore)})</p>
              </div>
              
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>새로운 성과점수</h3>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedEmployee.performanceScore}
                    onChange={(e) => {
                      const newScore = Number(e.target.value);
                      setEmployees(employees.map(emp => 
                        emp.id === selectedEmployee.id 
                          ? { ...emp, performanceScore: newScore }
                          : emp
                      ));
                      setSelectedEmployee({ ...selectedEmployee, performanceScore: newScore });
                    }}
                    style={{ flex: 1 }}
                  />
                  <div style={{ 
                    fontSize: "1.25rem", 
                    fontWeight: "bold", 
                    color: selectedEmployee.performanceScore >= 80 ? "#16a34a" : selectedEmployee.performanceScore >= 60 ? "#d97706" : "#dc2626",
                    minWidth: "4rem"
                  }}>
                    {selectedEmployee.performanceScore}점
                  </div>
                </div>
                <div style={{ width: "100%", height: "0.5rem", backgroundColor: "#e5e7eb", borderRadius: "0.25rem", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      height: "100%", 
                      width: `${selectedEmployee.performanceScore}%`, 
                      backgroundColor: selectedEmployee.performanceScore >= 80 ? "#16a34a" : selectedEmployee.performanceScore >= 60 ? "#d97706" : "#dc2626",
                      transition: "width 0.3s ease"
                    }} 
                  />
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button style={secondaryButtonStyle} onClick={closeModals}>
                  취소
                </button>
                <button style={primaryButtonStyle} onClick={() => {
                  alert(`${selectedEmployee.name}의 성과점수가 ${selectedEmployee.performanceScore}점으로 업데이트되었습니다.`);
                  closeModals();
                }}>
                  평가 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div style={modalOverlayStyle} onClick={closeModals}>
          <div style={{...modalStyle, maxWidth: "40rem"}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>{selectedEmployee.name} 상세정보</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Profile Section */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "0.5rem" }}>
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: 600,
                  }}
                >
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>{selectedEmployee.name}</h3>
                  <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>{selectedEmployee.position}</p>
                  <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>직원번호: {selectedEmployee.employeeId}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>부서</label>
                  <p style={{ padding: "0.5rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem", margin: 0 }}>{selectedEmployee.department}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>고용형태</label>
                  <span style={workTypeBadgeStyle(selectedEmployee.workType)}>{selectedEmployee.workType}</span>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>상태</label>
                  <span style={statusBadgeStyle(selectedEmployee.status)}>{selectedEmployee.status}</span>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>입사일</label>
                  <p style={{ padding: "0.5rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem", margin: 0 }}>{selectedEmployee.hireDate}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.75rem" }}>연락처 정보</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
                    <Phone style={{ height: "1rem", width: "1rem", color: "#6b7280" }} />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem" }}>
                    <Mail style={{ height: "1rem", width: "1rem", color: "#6b7280" }} />
                    <span>{selectedEmployee.email}</span>
                  </div>
                </div>
              </div>

              {/* Performance & Salary */}
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.75rem" }}>성과 및 급여</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>성과점수</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={performanceBarStyle}>
                        <div style={performanceFillStyle(selectedEmployee.performanceScore)} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{selectedEmployee.performanceScore}%</div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{getPerformanceLevel(selectedEmployee.performanceScore)}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>급여</label>
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#16a34a", margin: 0 }}>{formatCurrency(selectedEmployee.salary)}</p>
                  </div>
                </div>
              </div>

              {/* Skills & Manager */}
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.75rem" }}>스킬 및 관리</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>주요 스킬</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {selectedEmployee.skills.map((skill, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.375rem 0.75rem",
                            backgroundColor: "#eff6ff",
                            color: "#2563eb",
                            borderRadius: "0.375rem",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>관리자</label>
                    <p style={{ padding: "0.5rem", backgroundColor: "#f9fafb", borderRadius: "0.375rem", margin: 0 }}>{selectedEmployee.manager}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button style={secondaryButtonStyle} onClick={closeModals}>
                닫기
              </button>
              <button style={primaryButtonStyle} onClick={() => {
                closeModals();
                handleEditEmployee(selectedEmployee);
              }}>
                편집
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
