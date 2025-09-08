import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useEmployees } from "../context/EmployeeContext";
import erpDataJson from "../../DatcoDemoData2.json";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Briefcase,
  Home,
  Coffee,
} from "lucide-react";
import styles from "./AttendancePage.module.css";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  workHours: string;
  status: "present" | "absent" | "late" | "early_leave" | "vacation" | "sick_leave";
  overtime: string;
  notes?: string;
  breakStart?: string;
  breakEnd?: string;
  overtimeHours?: number;
}

// ERP 인원마스터 데이터를 기반으로 출근 기록 생성 (오늘 날짜만)
const getERPAttendanceRecords = (): AttendanceRecord[] => {
  const today = new Date();
  const records: AttendanceRecord[] = [];
  const employees = erpDataJson.sheets.인원마스터 || [];
  const dateStr = today.toISOString().split('T')[0];

  employees.forEach((emp: any, empIndex: number) => {
    // 95% 확률로 출근 (ERP 직원들은 더 성실함)
    if (Math.random() > 0.05) {
      const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9시 사이
      const checkInMinute = Math.floor(Math.random() * 60);
      const checkOutHour = 17 + Math.floor(Math.random() * 3); // 17-19시 사이
      const checkOutMinute = Math.floor(Math.random() * 60);

      const checkInTime = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`;
      const checkOutTime = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`;

      // 근무 시간 계산
      const workMinutes = (checkOutHour * 60 + checkOutMinute) - (checkInHour * 60 + checkInMinute);
      const workHours = Math.floor(workMinutes / 60);
      const remainingMinutes = workMinutes % 60;

      // 상태 결정
      let status: AttendanceRecord["status"] = "present";
      if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0)) {
        status = "late";
      }
      if (workHours < 8) {
        status = "early_leave";
      }

      records.push({
        id: `attendance-erp-${emp.사번}-${dateStr}`,
        employeeId: emp.사번,
        employeeName: emp.성명,
        department: emp.직무,
        date: dateStr,
        checkInTime,
        checkOutTime,
        workHours: `${workHours}:${remainingMinutes.toString().padStart(2, '0')}`,
        status,
        overtime: workHours > 8 ? `${workHours - 8}:${remainingMinutes.toString().padStart(2, '0')}` : "0:00",
        notes: status === "late" ? "지각" : status === "early_leave" ? "조퇴" : ""
      });
    } else {
      // 결근
      records.push({
        id: `attendance-erp-${emp.사번}-${dateStr}`,
        employeeId: emp.사번,
        employeeName: emp.성명,
        department: emp.직무,
        date: dateStr,
        checkInTime: "",
        checkOutTime: "",
        workHours: "0:00",
        status: "absent",
        overtime: "0:00",
        notes: "결근"
      });
    }
  });

  return records;
};

// 샘플 출근 기록 데이터 생성 함수
const getSampleAttendanceRecords = (): AttendanceRecord[] => {
  const today = new Date();
  const records: AttendanceRecord[] = [];

  // 최근 30일간의 출근 기록 생성
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 주말 제외
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];

    // 5명의 직원에 대한 출근 기록
    const employees = [
      { id: "EMP001", name: "김철수", department: "개발팀" },
      { id: "EMP002", name: "이영희", department: "마케팅팀" },
      { id: "EMP003", name: "박민수", department: "영업팀" },
      { id: "EMP004", name: "최지훈", department: "인사팀" },
      { id: "EMP005", name: "정다인", department: "재무팀" }
    ];

    employees.forEach((emp, empIndex) => {
      // 90% 확률로 출근
      if (Math.random() > 0.1) {
        const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9시 사이
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkOutHour = 17 + Math.floor(Math.random() * 3); // 17-19시 사이
        const checkOutMinute = Math.floor(Math.random() * 60);

        const checkInTime = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`;
        const checkOutTime = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`;

        // 근무 시간 계산
        const workMinutes = (checkOutHour * 60 + checkOutMinute) - (checkInHour * 60 + checkInMinute);
        const workHours = Math.floor(workMinutes / 60);
        const remainingMinutes = workMinutes % 60;

        // 상태 결정
        let status: AttendanceRecord["status"] = "present";
        if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0)) {
          status = "late";
        }
        if (workHours < 8) {
          status = "early_leave";
        }

        records.push({
          id: `attendance-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          date: dateStr,
          checkInTime,
          checkOutTime,
          workHours: `${workHours}:${remainingMinutes.toString().padStart(2, '0')}`,
          status,
          overtime: workHours > 8 ? `${workHours - 8}:${remainingMinutes.toString().padStart(2, '0')}` : "0:00",
          notes: status === "late" ? "지각" : status === "early_leave" ? "조퇴" : ""
        });
      } else {
        // 결근
        records.push({
          id: `attendance-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          date: dateStr,
          checkInTime: "",
          checkOutTime: "",
          workHours: "0:00",
          status: "absent",
          overtime: "0:00",
          notes: "결근"
        });
      }
    });
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const statusConfig = {
  present: { label: "정상출근", color: "success", icon: CheckCircle },
  absent: { label: "결근", color: "destructive", icon: AlertTriangle },
  late: { label: "지각", color: "destructive", icon: Clock },
  early_leave: { label: "조퇴", color: "secondary", icon: Home },
  vacation: { label: "휴가", color: "default", icon: Coffee },
  sick_leave: { label: "병가", color: "secondary", icon: AlertTriangle },
};

export const AttendancePage: React.FC = () => {
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<"erp" | "sample">("erp");
  const [newRecord, setNewRecord] = useState<Partial<AttendanceRecord>>({});

  // 직원 데이터를 기반으로 출근 기록 생성
  const generateAttendanceRecordsFromEmployees = (): AttendanceRecord[] => {
    const activeEmployees = employees.filter(emp => emp.status === "재직");
    const today = new Date().toISOString().split('T')[0];

    return activeEmployees.map(emp => ({
      id: `att_${emp.id}_${today}`,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.department,
      date: today,
      checkInTime: "09:00",
      checkOutTime: "18:00",
      workHours: "8:00",
      status: "present" as const,
      overtime: "0:00",
      notes: ""
    }));
  };

  // 현재 출근 기록 가져오기
  const getCurrentAttendanceRecords = (): AttendanceRecord[] => {
    if (selectedDataSource === "sample") {
      return getSampleAttendanceRecords();
    } else {
      // ERP 인원마스터 데이터 기반 출근 기록
      return getERPAttendanceRecords();
    }
  };

  // 데이터 소스 변경 시 출근 기록 업데이트
  useEffect(() => {
    const records = getCurrentAttendanceRecords();
    setAttendanceRecords(records);
  }, [selectedDataSource]);

  const currentAttendanceRecords = getCurrentAttendanceRecords();

  const filteredRecords = currentAttendanceRecords.filter((record) => {
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
  const totalEmployees = [...new Set(currentAttendanceRecords.map(r => r.employeeId))].length;
  const presentEmployees = currentAttendanceRecords.filter((r) => r.status === "present").length;
  const lateEmployees = currentAttendanceRecords.filter((r) => r.status === "late").length;
  const totalWorkingHours = currentAttendanceRecords.reduce((sum, r) => {
    const [hours, minutes] = r.workHours.split(':').map(Number);
    return sum + hours + (minutes / 60);
  }, 0);
  const totalOvertimeHours = currentAttendanceRecords.reduce((sum, r) => {
    const [hours, minutes] = r.overtime.split(':').map(Number);
    return sum + hours + (minutes / 60);
  }, 0);

  const departments = [...new Set(currentAttendanceRecords.map((r) => r.department))];

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
      checkInTime: newRecord.checkInTime || "",
      checkOutTime: newRecord.checkOutTime || "",
      workHours: newRecord.workHours || "0:00",
      overtime: newRecord.overtime || "0:00",
      breakStart: newRecord.breakStart,
      breakEnd: newRecord.breakEnd,
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
          {/* 데이터 소스 선택 */}
          <div className={styles.filterGroup}>
            {/* <label className={styles.filterLabel}>데이터 소스</label> */}
            <select
              className={styles.filterSelect}
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value as "erp" | "sample")}
            >
              <option value="erp">닷코 시연 데이터</option>
              <option value="sample">생성된 샘플 데이터</option>
            </select>
          </div>
          
          {/* 데이터 소스 표시 배지 */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: selectedDataSource === 'erp' ? '#3b82f6' : '#f59e0b',
            color: 'white',
            marginLeft: '8px',
            marginTop: '4px',
            whiteSpace: 'nowrap',
            height: '28px'
          }}>
            {selectedDataSource === 'erp' ? '닷코 시연 데이터' : '생성된 샘플 데이터'}
          </div>
          
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

                {record.checkInTime && record.checkOutTime ? (
                  <div className={styles.timeSection}>
                    <div className={styles.timeGrid}>
                      <div className={styles.timeItem}>
                        <span className={styles.timeLabel}>출근</span>
                        <span className={styles.timeValue}>{record.checkInTime}</span>
                      </div>
                      <div className={styles.timeItem}>
                        <span className={styles.timeLabel}>퇴근</span>
                        <span className={styles.timeValue}>{record.checkOutTime || "미체크"}</span>
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
                        <span className={styles.hoursValue}>{record.workHours || "0시간"}</span>
                      </div>
                    </div>
                    {record.overtimeHours && record.overtimeHours > 0 && (
                      <div className={styles.hoursItem}>
                        <Clock className={styles.hoursIcon} />
                        <div className={styles.hoursData}>
                          <span className={styles.hoursLabel}>연장근무</span>
                          <span className={styles.overtimeValue}>{record.overtimeHours}시간</span>
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
                    <div className={styles.modalDetailRow}>
                      <span>체크인:</span>
                      <span>{selectedRecord.checkInTime || "미체크인"}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>체크아웃:</span>
                      <span>{selectedRecord.checkOutTime || "미체크아웃"}</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>근무시간:</span>
                      <span>{selectedRecord.workHours || "0시간"}</span>
                    </div>
                    {selectedRecord.breakStart && selectedRecord.breakEnd && (
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
                    {(!selectedRecord.checkInTime || !selectedRecord.checkOutTime) && (
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
                      <span className={styles.workingHours}>{selectedRecord.workHours}시간</span>
                    </div>
                    <div className={styles.modalDetailRow}>
                      <span>연장근무:</span>
                      <span className={styles.overtimeHours}>{selectedRecord.overtime}시간</span>
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
                      value={newRecord.checkInTime || ""}
                      onChange={(e) => setNewRecord({...newRecord, checkInTime: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>퇴근시간</label>
                    <Input
                      type="time"
                      value={newRecord.checkOutTime || ""}
                      onChange={(e) => setNewRecord({...newRecord, checkOutTime: e.target.value})}
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
                      value={newRecord.workHours || ""}
                      onChange={(e) => setNewRecord({...newRecord, workHours: e.target.value})}
                      placeholder="근무시간 (시간)"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>연장근무</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={newRecord.overtime || ""}
                      onChange={(e) => setNewRecord({...newRecord, overtime: e.target.value})}
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
