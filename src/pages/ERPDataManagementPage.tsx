import React, { useState, useEffect } from "react";
import { 
  Database, 
  FileText, 
  Users, 
  Package, 
  ShoppingCart, 
  Factory, 
  Truck, 
  DollarSign,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Filter,
  Search
} from "lucide-react";
import erpDataJson from '../../DatcoDemoData2.json';

interface ERPDataStats {
  totalSheets: number;
  totalRecords: number;
  lastUpdated: string;
}

interface SheetInfo {
  name: string;
  recordCount: number;
  icon: React.ReactNode;
  description: string;
  sampleData?: any[];
}

const ERPDataManagementPage: React.FC = () => {
  const [selectedDataSource, setSelectedDataSource] = useState<string>("erp");
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // ERP 데이터 통계 계산
  const getERPDataStats = (): ERPDataStats => {
    const sheets = Object.keys(erpDataJson.sheets);
    const totalRecords = sheets.reduce((total, sheetName) => {
      return total + (erpDataJson.sheets[sheetName as keyof typeof erpDataJson.sheets]?.length || 0);
    }, 0);

    return {
      totalSheets: sheets.length,
      totalRecords,
      lastUpdated: erpDataJson.exported_at || "2025-09-05"
    };
  };

  // 시트 정보 매핑
  const getSheetInfo = (): SheetInfo[] => {
    const sheetMappings = [
      { key: "거래처마스터", name: "거래처 마스터", icon: <Users size={20} />, description: "고객사 및 공급사 정보" },
      { key: "품목마스터", name: "품목 마스터", icon: <Package size={20} />, description: "완제품, 원자재, 부자재 정보" },
      { key: "BOM", name: "BOM", icon: <BarChart3 size={20} />, description: "자재 소요량 및 구성 정보" },
      { key: "라우팅", name: "라우팅", icon: <Factory size={20} />, description: "생산 공정 및 작업 순서" },
      { key: "수주", name: "수주", icon: <ShoppingCart size={20} />, description: "고객 주문 정보" },
      { key: "생산계획", name: "생산 계획", icon: <BarChart3 size={20} />, description: "월별 생산 계획" },
      { key: "작업지시", name: "작업 지시", icon: <FileText size={20} />, description: "생산 작업 지시서" },
      { key: "재고배치", name: "재고 배치", icon: <Package size={20} />, description: "창고별 재고 현황" },
      { key: "구매발주", name: "구매 발주", icon: <ShoppingCart size={20} />, description: "원자재 구매 주문" },
      { key: "품질관리", name: "품질 관리", icon: <Settings size={20} />, description: "입고 검사 및 품질 데이터" },
      { key: "출하", name: "출하", icon: <Truck size={20} />, description: "제품 출하 정보" },
      { key: "회계(AR_AP)", name: "회계 (AR/AP)", icon: <DollarSign size={20} />, description: "매출채권 및 매입채무" },
      { key: "인사급여", name: "인사 급여", icon: <Users size={20} />, description: "직원 정보 및 급여 데이터" },
      { key: "원가관리", name: "원가 관리", icon: <DollarSign size={20} />, description: "임금 정책 및 설비 원가" },
      { key: "MRP파라미터", name: "MRP 파라미터", icon: <Settings size={20} />, description: "자재 소요 계획 설정" },
      { key: "생산능력", name: "생산 능력", icon: <Factory size={20} />, description: "라인별 생산 능력 정보" },
      { key: "부족분석시뮬레이션", name: "부족 분석", icon: <BarChart3 size={20} />, description: "생산 부족 분석 및 대응책" },
      { key: "사용자권한", name: "사용자 권한", icon: <Users size={20} />, description: "시스템 사용자 권한 관리" },
      { key: "시스템파라미터", name: "시스템 파라미터", icon: <Settings size={20} />, description: "시스템 설정 및 파라미터" }
    ];

    return sheetMappings.map(mapping => {
      const data = erpDataJson.sheets[mapping.key as keyof typeof erpDataJson.sheets] || [];
      return {
        name: mapping.name,
        recordCount: Array.isArray(data) ? data.length : 0,
        icon: mapping.icon,
        description: mapping.description,
        sampleData: Array.isArray(data) ? data.slice(0, 3) : []
      };
    });
  };

  // 샘플 데이터 생성
  const getSampleDataInfo = (): SheetInfo[] => {
    return [
      {
        name: "샘플 거래처",
        recordCount: 5,
        icon: <Users size={20} />,
        description: "테스트용 거래처 데이터",
        sampleData: [
          { 거래처명: "테크놀로지 주식회사", 구분: "고객사", 신용등급: "AA" },
          { 거래처명: "스마트솔루션", 구분: "고객사", 신용등급: "A" },
          { 거래처명: "글로벌인더스트리", 구분: "고객사", 신용등급: "AA" }
        ]
      },
      {
        name: "샘플 품목",
        recordCount: 8,
        icon: <Package size={20} />,
        description: "테스트용 품목 데이터",
        sampleData: [
          { 품목명: "스마트 센서 모듈", 품목구분: "완제품", 표준단가: 85000 },
          { 품목명: "IoT 컨트롤러", 품목구분: "완제품", 표준단가: 120000 },
          { 품목명: "산업용 디스플레이", 품목구분: "완제품", 표준단가: 450000 }
        ]
      },
      {
        name: "샘플 생산 오더",
        recordCount: 3,
        icon: <Factory size={20} />,
        description: "테스트용 생산 주문 데이터",
        sampleData: [
          { 주문번호: "PO-2024-001", 제품명: "스마트 센서 모듈", 수량: 500 },
          { 주문번호: "PO-2024-002", 제품명: "IoT 컨트롤러", 수량: 300 },
          { 주문번호: "PO-2024-003", 제품명: "산업용 디스플레이", 수량: 150 }
        ]
      }
    ];
  };

  const stats = getERPDataStats();
  const erpSheets = getSheetInfo();
  const sampleSheets = getSampleDataInfo();
  const currentSheets = selectedDataSource === "erp" ? erpSheets : sampleSheets;

  // 데이터 미리보기
  const handlePreview = (sheetName: string, data: any[]) => {
    setSelectedSheet(sheetName);
    setPreviewData(data);
    setShowPreview(true);
  };

  // 스타일 정의
  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb",
  };

  const buttonStyle: React.CSSProperties = {
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

  const inputStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    width: "100%",
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* 헤더 */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
              ERP 데이터 관리
            </h1>
            <p style={{ color: "#6b7280" }}>닷코 시연 데이터와 샘플 데이터를 관리합니다</p>
            <span style={{
              padding: "0.25rem 0.75rem",
              backgroundColor: selectedDataSource === "erp" ? "#dbeafe" : "#fef3c7",
              color: selectedDataSource === "erp" ? "#1e40af" : "#92400e",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500
            }}>
              {selectedDataSource === "erp" ? "닷코 시연 데이터" : "생성된 샘플 데이터"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button style={buttonStyle}>
              <Download size={18} />
              내보내기
            </button>
            <button style={buttonStyle}>
              <Upload size={18} />
              가져오기
            </button>
            <button style={buttonStyle}>
              <RefreshCw size={18} />
              새로고침
            </button>
          </div>
        </div>

        {/* 데이터 소스 선택 */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
          <select
            value={selectedDataSource}
            onChange={(e) => setSelectedDataSource(e.target.value)}
            style={{
              ...inputStyle,
              width: "200px"
            }}
          >
            <option value="erp">닷코 시연 데이터</option>
            <option value="sample">생성된 샘플 데이터</option>
          </select>
          
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
            <input
              type="text"
              placeholder="시트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: "2.5rem"
              }}
            />
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.75rem", backgroundColor: "#dbeafe", borderRadius: "0.5rem" }}>
              <Database size={24} style={{ color: "#1e40af" }} />
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>총 시트 수</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
                {selectedDataSource === "erp" ? stats.totalSheets : sampleSheets.length}
              </p>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.75rem", backgroundColor: "#d1fae5", borderRadius: "0.5rem" }}>
              <FileText size={24} style={{ color: "#065f46" }} />
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>총 레코드 수</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
                {selectedDataSource === "erp" ? stats.totalRecords.toLocaleString() : "47"}
              </p>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.75rem", backgroundColor: "#fef3c7", borderRadius: "0.5rem" }}>
              <RefreshCw size={24} style={{ color: "#92400e" }} />
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>마지막 업데이트</p>
              <p style={{ fontSize: "1rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
                {selectedDataSource === "erp" ? "2025-09-05" : "2024-12-01"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 시트 목록 */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#111827", marginBottom: "1rem" }}>
          데이터 시트 목록
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {currentSheets
            .filter(sheet => sheet.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((sheet, index) => (
            <div key={index} style={{
              ...cardStyle,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ color: "#3b82f6" }}>
                    {sheet.icon}
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: 0 }}>
                    {sheet.name}
                  </h3>
                </div>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: 500
                }}>
                  {sheet.recordCount}건
                </span>
              </div>
              
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
                {sheet.description}
              </p>
              
              {sheet.sampleData && sheet.sampleData.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.5rem" }}>샘플 데이터:</p>
                  <div style={{ fontSize: "0.75rem", color: "#374151" }}>
                    {sheet.sampleData.slice(0, 2).map((item, idx) => (
                      <div key={idx} style={{ marginBottom: "0.25rem" }}>
                        {Object.entries(item).slice(0, 2).map(([key, value]) => (
                          <span key={key} style={{ marginRight: "0.5rem" }}>
                            <strong>{key}:</strong> {String(value)}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => handlePreview(sheet.name, sheet.sampleData || [])}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#6b7280",
                  fontSize: "0.75rem",
                  padding: "0.375rem 0.75rem"
                }}
              >
                <Eye size={14} />
                미리보기
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 데이터 미리보기 모달 */}
      {showPreview && (
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
          zIndex: 50,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            maxWidth: "80%",
            maxHeight: "80%",
            width: "800px",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
                {selectedSheet} - 데이터 미리보기
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  padding: "0.5rem",
                  borderRadius: "0.25rem",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
            
            {previewData.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                      {Object.keys(previewData[0]).map(key => (
                        <th key={key} style={{
                          padding: "0.75rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#374151",
                          border: "1px solid #d1d5db"
                        }}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, idx) => (
                          <td key={idx} style={{
                            padding: "0.75rem",
                            fontSize: "0.875rem",
                            color: "#374151",
                            border: "1px solid #d1d5db"
                          }}>
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
                미리보기 데이터가 없습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ERPDataManagementPage;
