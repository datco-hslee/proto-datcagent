import React, { useEffect } from 'react';
import { driver } from 'driver.js';

// 대시보드 튜토리얼 컴포넌트
export const DashboardTutorial: React.FC = () => {
  useEffect(() => {
    // 페이지가 로드된 후 튜토리얼 시작 (약간의 지연 추가)
    const timer = setTimeout(() => {
      try {
        // 새로운 튜토리얼 인스턴스 생성
        const driverObj = driver({
          showProgress: true,
          animate: true,
          showButtons: ['next', 'previous', 'close'],
          steps: [
            {
              element: '#dashboard-title',
              popover: {
                title: '통합 대시보드',
                description: '제조업무해결사 주식회사의 실시간 경영 현황을 확인할 수 있는 대시보드입니다.'
              }
            },
            {
              element: '#metrics-container > div:nth-child(1)',
              popover: {
                title: '이번 달 매출',
                description: '회사의 이번 달 총 매출액을 보여줍니다. 전월 대비 증감률도 확인할 수 있습니다.'
              }
            },
            {
              element: '#metrics-container > div:nth-child(2)',
              popover: {
                title: '신규 고객',
                description: '이번 달에 새롭게 추가된 고객 수를 보여줍니다.'
              }
            },
            {
              element: '#metrics-container > div:nth-child(3)',
              popover: {
                title: '진행 중인 주문',
                description: '현재 처리 중인 주문의 총 개수를 보여줍니다.'
              }
            },
            {
              element: '#metrics-container > div:nth-child(4)',
              popover: {
                title: '재고 회전율',
                description: '재고가 판매되는 속도를 나타내는 지표입니다. 높을수록 재고 관리가 효율적입니다.'
              }
            },
            {
              element: '#recent-activities',
              popover: {
                title: '최근 활동',
                description: '시스템에서 발생한 최근 활동들을 시간순으로 보여줍니다. 주문, 생산, 재고, 출하 등의 활동이 표시됩니다.'
              }
            }
          ]
        });
        
        // 튜토리얼 시작
        driverObj.drive();
      } catch (error) {
        console.error('튜토리얼 시작 중 오류 발생:', error);
      }
    }, 1500); // 1500ms 지연 추가 (시간 증가)
    
    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
};

export default DashboardTutorial;
