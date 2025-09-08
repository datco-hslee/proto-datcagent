import React, { useState } from "react";
import { Shield, Users, Plus, Edit, Trash2, Search, Filter, ChevronDown } from "lucide-react";

// ERP 데이터 import
import erpDataJson from '../../DatcoDemoData2.json';

// ERP 데이터 변수 정의
const erpData = erpDataJson;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  lastLogin: Date;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export function UserPermissionsPage() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // ERP 데이터에서 사용자 정보 추출
  const getERPUsers = (): User[] => {
    return erpData.sheets.사용자권한.map((user: any) => ({
      id: user.사용자ID,
      name: user.사용자명,
      email: `${user.사용자ID}@company.com`,
      role: user.권한레벨 === "ADMIN" ? "관리자" : user.권한레벨 === "MANAGER" ? "관리자" : "일반사용자",
      department: user.부서,
      status: "active" as const,
      lastLogin: new Date("2024-01-15T10:30:00"),
      permissions: user.접근모듈 === "ALL" ? ["read", "write", "delete", "admin"] : user.접근모듈.split(",").map((module: string) => module.trim())
    }));
  };

  // 샘플 사용자 데이터
  const getSampleUsers = (): User[] => [
    {
      id: "1",
      name: "김철수",
      email: "kim@company.com",
      role: "관리자",
      department: "IT",
      status: "active",
      lastLogin: new Date("2024-01-15T10:30:00"),
      permissions: ["read", "write", "delete", "admin"]
    },
    {
      id: "2",
      name: "이영희",
      email: "lee@company.com",
      role: "생산관리자",
      department: "생산",
      status: "active",
      lastLogin: new Date("2024-01-15T09:15:00"),
      permissions: ["read", "write"]
    },
    {
      id: "3",
      name: "박민수",
      email: "park@company.com",
      role: "일반사용자",
      department: "영업",
      status: "inactive",
      lastLogin: new Date("2024-01-10T14:20:00"),
      permissions: ["read"]
    }
  ];

  // ERP 데이터에서 역할 정보 추출
  const getERPRoles = (): Role[] => {
    const roleMap = new Map<string, { permissions: Set<string>, userCount: number, description: string }>();
    
    erpData.sheets.사용자권한.forEach((user: any) => {
      const roleName = user.권한레벨 === "ADMIN" ? "관리자" : user.권한레벨 === "MANAGER" ? "관리자" : "일반사용자";
      const permissions = user.접근모듈 === "ALL" ? ["read", "write", "delete", "admin"] : user.접근모듈.split(",").map((module: string) => module.trim());
      
      if (!roleMap.has(roleName)) {
        roleMap.set(roleName, {
          permissions: new Set(),
          userCount: 0,
          description: user.권한레벨 === "ADMIN" ? "시스템 전체 관리 권한" : user.권한레벨 === "MANAGER" ? "부서별 관리 권한" : "기본 조회 권한"
        });
      }
      
      const role = roleMap.get(roleName)!;
      permissions.forEach((p: string) => role.permissions.add(p));
      role.userCount++;
    });
    
    return Array.from(roleMap.entries()).map(([name, data], index) => ({
      id: (index + 1).toString(),
      name,
      description: data.description,
      permissions: Array.from(data.permissions),
      userCount: data.userCount
    }));
  };

  // 샘플 역할 데이터
  const getSampleRoles = (): Role[] => [
    {
      id: "1",
      name: "관리자",
      description: "시스템 전체 관리 권한",
      permissions: ["read", "write", "delete", "admin", "user_management"],
      userCount: 2
    },
    {
      id: "2",
      name: "생산관리자",
      description: "생산 관련 모듈 관리 권한",
      permissions: ["read", "write", "production_management"],
      userCount: 5
    },
    {
      id: "3",
      name: "일반사용자",
      description: "기본 조회 권한",
      permissions: ["read"],
      userCount: 15
    }
  ];

  // 현재 데이터 소스에 따른 데이터 반환
  const getCurrentUsers = (): User[] => {
    return selectedDataSource === "erp" ? getERPUsers() : getSampleUsers();
  };

  const getCurrentRoles = (): Role[] => {
    return selectedDataSource === "erp" ? getERPRoles() : getSampleRoles();
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb",
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    backgroundColor: "white",
    color: "#374151",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    width: "100%",
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "#10b981" : "#6b7280";
  };

  const getStatusLabel = (status: string) => {
    return status === "active" ? "활성" : "비활성";
  };

  return (
    <div style={{ padding: "1.5rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>사용자 권한 관리</h1>
          <p style={{ color: "#6b7280" }}>사용자 계정과 역할별 권한을 관리하세요</p>
        </div>
        <button style={primaryButtonStyle}>
          <Plus size={16} />
          새 사용자 추가
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          style={{
            ...secondaryButtonStyle,
            backgroundColor: activeTab === "users" ? "#3b82f6" : "white",
            color: activeTab === "users" ? "white" : "#374151",
          }}
          onClick={() => setActiveTab("users")}
        >
          <Users size={16} />
          사용자 관리
        </button>
        <button
          style={{
            ...secondaryButtonStyle,
            backgroundColor: activeTab === "roles" ? "#3b82f6" : "white",
            color: activeTab === "roles" ? "white" : "#374151",
          }}
          onClick={() => setActiveTab("roles")}
        >
          <Shield size={16} />
          역할 관리
        </button>
      </div>


      {/* 검색 및 필터 */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            placeholder={activeTab === "users" ? "사용자 이름, 이메일로 검색..." : "역할명으로 검색..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{...inputStyle, paddingLeft: "2.5rem"}}
          />
        </div>
        <button style={secondaryButtonStyle}>
          <Filter size={16} />
          필터
        </button>
      </div>

      {/* 데이터 소스 선택 및 뱃지 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* 데이터 소스 선택 */}
          <div style={{ position: "relative" }}>
            <select
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")}
              style={{
                appearance: "none",
                padding: "0.375rem 2rem 0.375rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                backgroundColor: "white",
                fontSize: "0.875rem",
                cursor: "pointer",
                minWidth: "180px"
              }}
            >
              <option value="erp">닷코 시연 데이터</option>
              <option value="sample">생성된 샘플 데이터</option>
            </select>
            <ChevronDown size={16} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
          </div>
          {/* 데이터 소스 뱃지 */}
          <div style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "0.375rem",
            fontSize: "0.75rem",
            fontWeight: 500,
            backgroundColor: selectedDataSource === "erp" ? "#3b82f6" : "#f59e0b",
            color: "white"
          }}>
            {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
          </div>
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#111827", margin: 0 }}>
          {activeTab === "users" ? "" : "역할별 권한"}
        </h2>
      </div>

      {activeTab === "users" ? (
        /* 사용자 목록 */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
          {getCurrentUsers().map((user) => (
            <div key={user.id} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.25rem" }}>{user.name}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{user.email}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor: getStatusColor(user.status) + "20",
                    color: getStatusColor(user.status)
                  }}>
                    {getStatusLabel(user.status)}
                  </span>
                  <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", backgroundColor: getStatusColor(user.status) }} />
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.875rem", marginBottom: "1rem" }}>
                <div>
                  <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>역할</p>
                  <p style={{ fontWeight: 500 }}>{user.role}</p>
                </div>
                <div>
                  <p style={{ color: "#6b7280", marginBottom: "0.25rem" }}>부서</p>
                  <p style={{ fontWeight: 500 }}>{user.department}</p>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <p style={{ color: "#6b7280", marginBottom: "0.5rem", fontSize: "0.875rem" }}>권한</p>
                <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                  {user.permissions.map((permission) => (
                    <span
                      key={permission}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        backgroundColor: "#f3f4f6",
                        color: "#374151"
                      }}
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" }}>
                <p style={{ color: "#6b7280" }}>
                  마지막 로그인: {user.lastLogin.toLocaleDateString('ko-KR')}
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button 
                    onClick={() => {
                      setEditingUser(user);
                      setShowEditUserModal(true);
                    }}
                    style={{...secondaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.5rem"}}
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`${user.name} 사용자를 삭제하시겠습니까?`)) {
                        // 삭제 로직 구현 필요
                        alert('삭제 기능은 추후 구현 예정입니다.');
                      }
                    }}
                    style={{...secondaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.5rem", color: "#dc2626", borderColor: "#dc2626"}}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 역할 목록 */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
          {getCurrentRoles().map((role) => (
            <div key={role.id} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.25rem" }}>{role.name}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{role.description}</p>
                </div>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: "#3b82f620",
                  color: "#3b82f6"
                }}>
                  {role.userCount}명
                </span>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <p style={{ color: "#6b7280", marginBottom: "0.5rem", fontSize: "0.875rem" }}>권한</p>
                <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        backgroundColor: "#10b98120",
                        color: "#10b981"
                      }}
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                  onClick={() => {
                    setEditingRole(role);
                    setShowEditRoleModal(true);
                  }}
                  style={{...secondaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.5rem"}}
                >
                  <Edit size={12} />
                  편집
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`${role.name} 역할을 삭제하시겠습니까?`)) {
                      // 삭제 로직 구현 필요
                      alert('삭제 기능은 추후 구현 예정입니다.');
                    }
                  }}
                  style={{...secondaryButtonStyle, fontSize: "0.75rem", padding: "0.25rem 0.5rem", color: "#dc2626", borderColor: "#dc2626"}}
                >
                  <Trash2 size={12} />
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 사용자 편집 모달 */}
      {showEditUserModal && editingUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "0.5rem",
            width: "90%",
            maxWidth: "500px",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>사용자 편집</h2>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>사용자명</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>이메일</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>역할</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              >
                <option value="관리자">관리자</option>
                <option value="일반사용자">일반사용자</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>부서</label>
              <input
                type="text"
                value={editingUser.department}
                onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  backgroundColor: "white",
                  color: "#374151",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 저장 로직 구현 필요
                  alert('저장 기능은 추후 구현 예정입니다.');
                  setShowEditUserModal(false);
                  setEditingUser(null);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #3b82f6",
                  borderRadius: "0.375rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 역할 편집 모달 */}
      {showEditRoleModal && editingRole && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "0.5rem",
            width: "90%",
            maxWidth: "500px",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>역할 편집</h2>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>역할명</label>
              <input
                type="text"
                value={editingRole.name}
                onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>설명</label>
              <textarea
                value={editingRole.description}
                onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500 }}>권한</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["read", "write", "delete", "admin"].map((permission) => (
                  <label key={permission} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <input
                      type="checkbox"
                      checked={editingRole.permissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingRole({
                            ...editingRole,
                            permissions: [...editingRole.permissions, permission]
                          });
                        } else {
                          setEditingRole({
                            ...editingRole,
                            permissions: editingRole.permissions.filter(p => p !== permission)
                          });
                        }
                      }}
                    />
                    <span style={{ fontSize: "0.875rem" }}>{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowEditRoleModal(false);
                  setEditingRole(null);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  backgroundColor: "white",
                  color: "#374151",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  // 저장 로직 구현 필요
                  alert('저장 기능은 추후 구현 예정입니다.');
                  setShowEditRoleModal(false);
                  setEditingRole(null);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #3b82f6",
                  borderRadius: "0.375rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
