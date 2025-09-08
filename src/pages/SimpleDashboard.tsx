// 통합 대시보드 컴포넌트
import React, { useState, useEffect, useMemo } from 'react';
import erpDataJson from '../../DatcoDemoData2.json';

interface RecentActivity {
  id: string;
  text: string;
  detail: string;
  color: string;
  timestamp: Date;
  type: 'order' | 'production' | 'inventory' | 'shipment' | 'purchase';
}

export function SimpleDashboard() {
  // ERP 데이터에서 최근 활동 추출 함수
  const getRecentActivitiesFromERP = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    const now = new Date();

    try {
      // 수주 데이터에서 활동 생성
      const salesOrders = erpDataJson.sheets?.수주 || [];
      const customers = erpDataJson.sheets?.거래처마스터 || [];
      const customerMap = new Map(customers.map(c => [c.거래처코드, c.거래처명]));

      salesOrders.forEach((order: any, index: number) => {
        const customerName = customerMap.get(order.거래처코드) || order.거래처코드;
        const orderDate = new Date(order.수주일자);
        const hoursAgo = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60));
        
        activities.push({
          id: `order-${order.수주번호}`,
          text: "새로운 주문이 접수되었습니다",
          detail: `${customerName} - ${order.수주번호}, ${hoursAgo < 24 ? hoursAgo + '시간 전' : Math.floor(hoursAgo/24) + '일 전'}`,
          color: "#10b981",
          timestamp: orderDate,
          type: 'order'
        });
      });

      // 작업지시 데이터에서 활동 생성
      const workOrders = erpDataJson.sheets?.작업지시 || [];
      const items = erpDataJson.sheets?.품목마스터 || [];
      const itemMap = new Map(items.map(i => [i.품목코드, i.품목명]));

      workOrders.forEach((wo: any) => {
        const itemName = itemMap.get(wo.품목코드) || wo.품목코드;
        const startDate = new Date(wo.시작일자);
        const hoursAgo = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60));
        
        activities.push({
          id: `work-${wo.작업지시번호}`,
          text: wo.상태 === "RELEASED" ? "생산이 시작되었습니다" : "생산 계획이 수립되었습니다",
          detail: `${itemName} ${wo.지시수량}EA - ${wo.작업지시번호}, ${hoursAgo < 24 ? hoursAgo + '시간 전' : Math.floor(hoursAgo/24) + '일 전'}`,
          color: wo.상태 === "RELEASED" ? "#3b82f6" : "#8b5cf6",
          timestamp: startDate,
          type: 'production'
        });
      });

      // 구매발주 데이터에서 활동 생성
      const purchaseOrders = erpDataJson.sheets?.구매발주 || [];
      purchaseOrders.forEach((po: any) => {
        const supplierName = customerMap.get(po.거래처코드) || po.거래처코드;
        const orderDate = new Date(po.발주일자);
        const hoursAgo = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60));
        
        activities.push({
          id: `purchase-${po.발주번호}`,
          text: "구매 발주가 생성되었습니다",
          detail: `${supplierName} - ${po.발주번호}, ${hoursAgo < 24 ? hoursAgo + '시간 전' : Math.floor(hoursAgo/24) + '일 전'}`,
          color: "#f59e0b",
          timestamp: orderDate,
          type: 'purchase'
        });
      });

      // 출하 데이터에서 활동 생성
      const shipments = erpDataJson.sheets?.출하 || [];
      shipments.forEach((shipment: any) => {
        const customerName = customerMap.get(shipment.거래처코드) || shipment.거래처코드;
        const itemName = itemMap.get(shipment.품목코드) || shipment.품목코드;
        // 출하일자가 없으면 현재 시간 기준으로 임의 설정
        const shipDate = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
        const hoursAgo = Math.floor((now.getTime() - shipDate.getTime()) / (1000 * 60 * 60));
        
        activities.push({
          id: `shipment-${shipment.출하번호}`,
          text: shipment.상태 === "SHIPPED" ? "제품이 출하되었습니다" : "출하가 계획되었습니다",
          detail: `${customerName} - ${itemName} ${shipment.출하수량}EA, ${hoursAgo < 24 ? hoursAgo + '시간 전' : Math.floor(hoursAgo/24) + '일 전'}`,
          color: shipment.상태 === "SHIPPED" ? "#06b6d4" : "#8b5cf6",
          timestamp: shipDate,
          type: 'shipment'
        });
      });

      // 재고 부족 알림 생성 (케이스정의 데이터 활용)
      const shortageAnalysis = erpDataJson.sheets?.케이스정의 || [];
      shortageAnalysis.forEach((case_def: any) => {
        if (case_def.부족여부 !== "없음") {
          const alertTime = new Date(now.getTime() - Math.random() * 6 * 60 * 60 * 1000);
          const hoursAgo = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60 * 60));
          
          activities.push({
            id: `shortage-${case_def.케이스명}`,
            text: "재고 부족 알림이 발생했습니다",
            detail: `${case_def.케이스명} - ${case_def.부족여부}, ${hoursAgo}시간 전`,
            color: "#ef4444",
            timestamp: alertTime,
            type: 'inventory'
          });
        }
      });

    } catch (error) {
      console.error('ERP 데이터 로딩 중 오류:', error);
    }

    // 시간순으로 정렬하고 최신 6개만 반환
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 6);
  };

  const recentActivities = useMemo(() => getRecentActivitiesFromERP(), []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        통합 대시보드
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        제조업무해결사 주식회사의 실시간 경영 현황을 확인하세요
      </p>
      
      {/* 기본 메트릭 카드들 */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div style={{
          padding: "1.5rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            이번 달 매출
          </h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
            ₩247,500,000
          </p>
          <p style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "0.25rem" }}>
            +12.5% 증가
          </p>
        </div>

        <div style={{
          padding: "1.5rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            신규 고객
          </h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
            23
          </p>
          <p style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "0.25rem" }}>
            +8.2% 증가
          </p>
        </div>

        <div style={{
          padding: "1.5rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            진행 중인 주문
          </h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
            156
          </p>
          <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem" }}>
            -2.1% 감소
          </p>
        </div>

        <div style={{
          padding: "1.5rem",
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            재고 회전율
          </h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>
            2.4회
          </p>
          <p style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "0.25rem" }}>
            +0.8 증가
          </p>
        </div>
      </div>

      {/* 엑셀 업로드 섹션 - 주석 처리됨 */}
      {/*
      <div style={{
        padding: "2rem",
        backgroundColor: "#f9fafb",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>
          📊 통합 데이터 관리 센터
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          엑셀 파일을 업로드하여 모든 ERP 모듈에 실시간으로 데이터를 연동하세요
        </p>

        <UnifiedExcelUploader 
          onUploadComplete={(result: UnifiedExcelImportResult) => {
            console.log('업로드 완료:', result);
          }}
        />

        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: "#e0f2fe",
          borderRadius: "8px",
          border: "1px solid #0891b2"
        }}>
          <p style={{ fontSize: "0.875rem", color: "#0c4a6e", margin: 0 }}>
            💡 <strong>사용 방법:</strong> 위 업로드 영역에 엑셀 파일을 드래그하거나 클릭하여 업로드하세요. 
            시트명에 따라 자동으로 해당 ERP 모듈에 데이터가 분류되어 저장됩니다.
          </p>
        </div>
      </div>
      */}

      {/* 최근 활동 */}
      <div style={{
        padding: "1.5rem",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
          최근 활동
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {recentActivities.map((activity, index) => (
            <div key={index} style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: activity.color,
                marginTop: "0.5rem"
              }} />
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>
                  {activity.text}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                  {activity.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
