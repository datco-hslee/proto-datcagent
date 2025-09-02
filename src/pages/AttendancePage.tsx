import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Filter, Eye, Clock, Calendar, User, CheckCircle, AlertCircle, Coffee, Home, Briefcase, BarChart3 } from "lucide-react";
import { useEmployees } from "@/context/EmployeeContext";
import styles from "./AttendancePage.module.css";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  workingHours: number;
  overtimeHours: number;
  status: "present" | "absent" | "late" | "early_leave" | "vacation" | "sick_leave";
  notes?: string;
}

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: "1",
    employeeId: "EMP001",
    employeeName: "김철수",
    department: "개발팀",
    date: "2024-01-21",
    checkIn: "09:00",
    checkOut: "18:30",
    breakStart: "12:00",
    breakEnd: "13:00",
    workingHours: 8.5,
    overtimeHours: 0.5,
    status: "present",
  },
  {
    id: "2",
    employeeId: "EMP002",
    employeeName: "이영희",
    department: "마케팅팀",
    date: "2024-01-21",
    checkIn: "09:15",
    checkOut: "18:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    workingHours: 7.75,
    overtimeHours: 0,
    status: "late",
  },
  {
    id: "3",
    employeeId: "EMP003",
    employeeName: "박지민",
    department: "영업팀",
    date: "2024-01-21",
    checkIn: "08:45",
    checkOut: "17:30",
    breakStart: "12:00",
    breakEnd: "13:00",
    workingHours: 7.75,
    overtimeHours: 0,
    status: "early_leave",
  },
  {
    id: "4",
    employeeId: "EMP004",
    employeeName: "최민수",
    department: "인사팀",
    date: "2024-01-21",
    workingHours: 0,
    overtimeHours: 0,
    status: "vacation",
    notes: "연차휴가",
  },
  {
    id: "5",
    employeeId: "EMP005",
    employeeName: "정수현",
    department: "회계팀",
    date: "2024-01-21",
    workingHours: 0,
    overtimeHours: 0,
    status: "sick_leave",
    notes: "병가",
  },
  {
    id: "6",
    employeeId: "EMP006",
    employeeName: "강민준",
    department: "개발팀",
    date: "2024-01-21",
    checkIn: "09:00",
    checkOut: "20:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    workingHours: 10,
    overtimeHours: 2,
    status: "present",
  },
];

const statusConfig = {
  present: { label: "정상출근", color: "success", icon: CheckCircle },
  absent: { label: "결근", color: "destructive", icon: AlertCircle },
  late: { label: "지각", color: "destructive", icon: Clock },
  early_leave: { label: "조퇴", color: "secondary", icon: Home },
  vacation: { label: "휴가", color: "default", icon: Coffee },
  sick_leave: { label: "병가", color: "secondary", icon: AlertCircle },
};

export const AttendancePage: React.FC = () => {
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<AttendanceRecord>>({});

  // 직원 데이터를 기반으로 근태 기록 생성
  const generateAttendanceRecordsFromEmployees = () => {
    const activeEmployees = employees.filter(emp => emp.status === "재직");
    const today = new Date().toISOString().split('T')[0];
    
    return activeEmployees.map(emp => ({
      id: `att_${emp.id}_${today}`,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.department,
      date: today,
      checkIn: "09:00",
      checkOut: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      workingHours: 8,
      overtimeHours: 0,
      status: "present" as const,
    }));
  };

  useEffect(() => {
    if (employees.length > 0) {
      setAttendanceRecords(generateAttendanceRecordsFromEmployees());
    }
  }, [employees]);

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || record.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    return <StatusIcon className={styles.statusIcon} />;
  };

  // 통계 계산
  const totalEmployees = attendanceRecords.length;
  const presentEmployees = attendanceRecords.filter((r) => r.status === "present").length;
  const lateEmployees = attendanceRecords.filter((r) => r.status === "late").length;
  const totalWorkingHours = attendanceRecords.reduce((sum, r) => sum + r.workingHours, 0);
  const totalOvertimeHours = attendanceRecords.reduce((sum, r) => sum + r.overtimeHours, 0);

  const departments = [...new Set(attendanceRecords.map((r) => r.department))];

  // 근태 기록 추가 핸들러
  const handleAddRecord = () => {
    if (!newRecord.employeeId || !newRecord.date) return;
    
    const employee = employees.find(emp => emp.employeeId === newRecord.employeeId);
    if (!employee) return;

    const record: AttendanceRecord = {
      id: `att_${Date.now()}`,
      employeeId: newRecord.employeeId,
      employeeName: employee.name,
      department: employee.department,
      date: newRecord.date || new Date().toISOString().split('T')[0],
      checkIn: newRecord.checkIn,
      checkOut: newRecord.checkOut,
      breakStart: newRecord.breakStart,
      breakEnd: newRecord.breakEnd,
      workingHours: newRecord.workingHours || 0,
      overtimeHours: newRecord.overtimeHours || 0,
      status: newRecord.status || "present",
      notes: newRecord.notes,
    };

    setAttendanceRecords(prev => [...prev, record]);
    setNewRecord({});
    setShowAddModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>근태 관리</h1>
            <p className={styles.subtitle}>직원 출퇴근 및 근무시간을 관리하세요</p>
          </div>
          <Button className={styles.addButton} onClick={() => setShowAddModal(true)}>
            <Plus className={styles.icon} />
            근태 기록
          </Button>
        </div>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>  
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 직원수</span>
                <span className={styles.statValue}>{totalEmployees}명</span>
              </div>
              <div className={styles.statIcon}>
                <User />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>정상 출근</span>
                <span className={`${styles.statValue} ${styles.presentEmployees}`}>{presentEmployees}명</span>
              </div>
              <div className={styles.statIcon}>
                <CheckCircle />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>지각자</span>
                <span className={`${styles.statValue} ${styles.lateEmployees}`}>{lateEmployees}명</span>
              </div>
              <div className={styles.statIcon}>
                <Clock />
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>총 근무시간</span>
                <span className={`${styles.statValue} ${styles.totalWorkHours}`}>{totalWorkingHours.toFixed(1)}h</span>
              </div>
              <div className={styles.statIcon}>
                <Briefcase />
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="직원명, 사번, 부서로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <Filter className={styles.filterIcon} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 상태</option>
              <option value="present">정상출근</option>
              <option value="late">지각</option>
              <option value="early_leave">조퇴</option>
              <option value="absent">결근</option>
              <option value="vacation">휴가</option>
              <option value="sick_leave">병가</option>
            </select>

            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={styles.filterSelect}>
              <option value="all">모든 부서</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.recordsGrid}>
          {filteredRecords.map((record) => (
            <Card key={record.id} className={styles.recordCard}>
              <div className={styles.cardHeader}>
                <div className={styles.employeeInfo}>
                  <h3 className={styles.employeeName}>{record.employeeName}</h3>
                  <div className={styles.employeeDetails}>
                    <span className={styles.employeeId}>{record.employeeId}</span>
                    <span className={styles.department}>{record.department}</span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>
                    <Eye className={styles.actionIcon} />
                  </Button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.dateSection}>
                  <Calendar className={styles.dateIcon} />
                  <div className={styles.dateInfo}>
                    <span className={styles.dateLabel}>근무일</span>
                    <span className={styles.dateValue}>{record.date}</span>
                  </div>
                  <Badge variant={statusConfig[record.status]?.color as any} className={styles.statusBadge}>
                    {getStatusIcon(record.status)}
                    {statusConfig[record.status]?.label}
                  </Badge>
                </div>

                {record.checkIn && record.checkOut ? (
                  <div className={styles.timeSection}>
                    <div className={styles.timeGrid}>
                      <div className={styles.timeItem}>
                        <span className={styles.timeLabel}>출근</span>
                        <span className={styles.timeValue}>{record.checkIn}</span>
                      </div>
                      <div className={styles.timeItem}>
                        <span className={styles.timeLabel}>퇴근</span>
                        <span className={styles.timeValue}>{record.checkOut}</span>
                      </div>
                      {record.breakStart && record.breakEnd && (
                        <>
                          <div className={styles.timeItem}>
                            <span className={styles.timeLabel}>휴게시작</span>
                            <span className={styles.timeValue}>{record.breakStart}</span>
                          </div>
                          <div className={styles.timeItem}>
                            <span className={styles.timeLabel}>휴게종료</span>
                            <span className={styles.timeValue}>{record.breakEnd}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.absenceSection}>
                    <div className={styles.absenceInfo}>
                      <span className={styles.absenceReason}>{record.notes || "사유 없음"}</span>
                    </div>
                  </div>
                )}

                <div className={styles.hoursSection}>
                  <div className={styles.hoursGrid}>
                    <div className={styles.hoursItem}>
                      <Briefcase className={styles.hoursIcon} />
                      <div className={styles.hoursData}>
                        <span className={styles.hoursLabel}>근무시간</span>
                        <span className={styles.hoursValue}>{record.workingHours}h</span>
                      </div>
                    </div>
                    {record.overtimeHours > 0 && (
                      <div className={styles.hoursItem}>
                        <Clock className={styles.hoursIcon} />
                        <div className={styles.hoursData}>
                          <span className={styles.hoursLabel}>연장근무</span>
                          <span className={styles.overtimeValue}>{record.overtimeHours}h</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedRecord && (
        <div className={styles.modal} onClick={() => setSelectedRecord(null)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>근태 상세 정보</h2>
              <Button variant="ghost" onClick={() => setSelectedRecord(null)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.recordHeader}>
                <div className={styles.recordMainInfo}>
                  <h3>
                    {selectedRecord.employeeName} ({selectedRecord.employeeId})
                  </h3>
                  <p>
                    {selectedRecord.department} • {selectedRecord.date}
                  </p>
                  <Badge variant={statusConfig[selectedRecord.status]?.color as any}>{statusConfig[selectedRecord.status]?.label}</Badge>
                </div>
              </div>

              <div className={styles.modalDetailsGrid}>
                <div className={styles.modalDetailSection}>
                  <h4>출퇴근 기록</h4>
                  <div className={styles.modalDetailGrid}>
                    {selectedRecord.checkIn ? (
                      <>
                        <div className={styles.modalDetailRow}>
                          <span>출근시간:</span>
                          <span>{selectedRecord.checkIn}</span>
                        </div>
                        <div className={styles.modalDetailRow}>
                          <span>퇴근시간:</span>
                          <span>{selectedRecord.checkOut || "미체크"}</span>
                        </div>
                        {selectedRecord.breakStart && (
                          <>
                            <div className={styles.modalDetailRow}>
                              <span>휴게시작:</span>
                              <span>{selectedRecord.breakStart}</span>
                            </div>
                            <div className={styles.modalDetailRow}>
                              <span>휴게종료:</span>
                              <span>{selectedRecord.breakEnd}</span>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className={styles.modalDetailRow}>
                        <span>사유:</span>
                        <span>{selectedRecord.notes || "기록 없음"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.modalDetailSection}>
                  <h4>근무 시간</h4>
                  <div className={styles.modalDetailGrid}>
                    <div className={styles.modalDetailRow}>
                      <span>총 근무시간:</span>
                      <span className={styles.workingHours}>{selectedRecord.workingHours}시간</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>연장근무:</span>
                      <span className={styles.overtimeHours}>{selectedRecord.overtimeHours}시간</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>기준근무시간:</span>
                      <span>8시간</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRecord.notes && (
                <div className={styles.notesSection}>
                  <h4>특이사항</h4>
                  <div className={styles.notesContent}>{selectedRecord.notes}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 근태 기록 추가 모달 */}
      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <Card className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>근태 기록 추가</h2>
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className={styles.closeButton}>
                ✕
              </Button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.attendanceForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>직원 선택</label>
                    <select
                      value={newRecord.employeeId || ""}
                      onChange={(e) => setNewRecord({...newRecord, employeeId: e.target.value})}
                      className={styles.selectInput}
                    >
                      <option value="">직원을 선택하세요</option>
                      {employees.filter(emp => emp.status === "재직").map((emp) => (
                        <option key={emp.id} value={emp.employeeId}>
                          {emp.name} ({emp.employeeId}) - {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>근무일</label>
                    <Input
                      type="date"
                      value={newRecord.date || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>출근시간</label>
                    <Input
                      type="time"
                      value={newRecord.checkIn || ""}
                      onChange={(e) => setNewRecord({...newRecord, checkIn: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>퇴근시간</label>
                    <Input
                      type="time"
                      value={newRecord.checkOut || ""}
                      onChange={(e) => setNewRecord({...newRecord, checkOut: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>휴게시작</label>
                    <Input
                      type="time"
                      value={newRecord.breakStart || ""}
                      onChange={(e) => setNewRecord({...newRecord, breakStart: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>휴게종료</label>
                    <Input
                      type="time"
                      value={newRecord.breakEnd || ""}
                      onChange={(e) => setNewRecord({...newRecord, breakEnd: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>근무시간</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newRecord.workingHours || ""}
                      onChange={(e) => setNewRecord({...newRecord, workingHours: Number(e.target.value)})}
                      placeholder="근무시간 (시간)"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>연장근무</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newRecord.overtimeHours || ""}
                      onChange={(e) => setNewRecord({...newRecord, overtimeHours: Number(e.target.value)})}
                      placeholder="연장근무 (시간)"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>근태 상태</label>
                    <select
                      value={newRecord.status || "present"}
                      onChange={(e) => setNewRecord({...newRecord, status: e.target.value as AttendanceRecord['status']})}
                      className={styles.selectInput}
                    >
                      <option value="present">정상출근</option>
                      <option value="late">지각</option>
                      <option value="early_leave">조퇴</option>
                      <option value="absent">결근</option>
                      <option value="vacation">휴가</option>
                      <option value="sick_leave">병가</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>특이사항</label>
                  <textarea
                    value={newRecord.notes || ""}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    placeholder="특이사항이나 메모를 입력하세요"
                    className={styles.textArea}
                    rows={3}
                  />
                </div>

                <div className={styles.modalActions}>
                  <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddRecord}>
                    근태 기록 추가
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
