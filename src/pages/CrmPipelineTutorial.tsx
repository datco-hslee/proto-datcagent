import React, { useEffect } from 'react';
import { driver } from 'driver.js';

// CRM 파이프라인 튜토리얼 컴포넌트
export const CrmPipelineTutorial: React.FC = () => {
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
              element: '#crm-title',
              popover: {
                title: 'CRM 파이프라인',
                description: '영업 기회를 단계별로 관리하고 추적할 수 있는 CRM 파이프라인입니다. 드래그 앤 드롭으로 리드를 이동시킬 수 있습니다.'
              }
            },
            {
              element: '#data-source-selector',
              popover: {
                title: '데이터 소스 선택',
                description: '닷코 시연 데이터와 생성된 샘플 데이터 중에서 선택할 수 있습니다. 실제 ERP 데이터와 테스트용 샘플 데이터를 비교해보세요.'
              }
            },
            {
              element: '#search-container',
              popover: {
                title: '검색 기능',
                description: '고객명이나 회사명으로 리드를 빠르게 검색할 수 있습니다. 실시간으로 결과가 필터링됩니다.'
              }
            },
            {
              element: '#pipeline-board',
              popover: {
                title: '파이프라인 보드',
                description: '영업 단계별로 리드가 정리되어 있습니다. 잠재고객부터 성공/실패까지 6단계로 구성되어 있습니다.'
              }
            },
            {
              element: '#pipeline-board .stage-section:first-child',
              popover: {
                title: '잠재고객 단계',
                description: '새로운 영업 기회가 시작되는 단계입니다. 리드 카드를 드래그하여 다음 단계로 이동시킬 수 있습니다.'
              }
            },
            {
              element: '#add-lead-button',
              popover: {
                title: '새 영업 기회 추가',
                description: '새로운 리드를 추가할 수 있습니다. 고객 정보, 예상 거래액, 성공 확률 등을 입력할 수 있습니다.'
              }
            },
            {
              element: '#filter-button',
              popover: {
                title: '필터 기능',
                description: '단계, 거래액, 소스 등 다양한 조건으로 리드를 필터링할 수 있습니다.'
              }
            }
          ]
        });
        
        // 튜토리얼 시작
        driverObj.drive();
      } catch (error) {
        console.error('CRM 파이프라인 튜토리얼 시작 중 오류 발생:', error);
      }
    }, 1500); // 1500ms 지연 추가
    
    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
};

export default CrmPipelineTutorial;
