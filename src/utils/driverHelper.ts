// Driver.js 하이라이트 기능을 위한 유틸리티 함수
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Driver.js 인스턴스 생성 함수
export const createDriverInstance = () => {
  return driver({
    showProgress: true,
    smoothScroll: true,
    animate: true,
    stagePadding: 10,
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    allowClose: false,
    showButtons: ['next', 'previous'],
    disableActiveInteraction: false,
    popoverClass: 'datco-driver-popover'
  });
};

// 메뉴 섹션 하이라이트 단계 생성
export const createSectionHighlightStep = (sectionId: string, sectionName: string) => {
  return {
    element: `[data-section-id="${sectionId}"]`,
    popover: {
      title: '1단계: 메뉴 섹션',
      description: `"${sectionName}" 섹션을 클릭하여 확장하세요.`,
      side: 'right' as const,
      align: 'start' as const
    }
  };
};

// 메뉴 항목 하이라이트 단계 생성
export const createMenuHighlightStep = (menuId: string, menuName: string) => {
  return {
    element: `[data-menu="${menuId}"]`,
    popover: {
      title: '2단계: 메뉴 항목',
      description: `"${menuName}" 메뉴를 클릭하여 해당 페이지로 이동하세요.`,
      side: 'right' as const,
      align: 'start' as const
    }
  };
};

// 버튼 하이라이트 단계 생성
export const createButtonHighlightStep = (buttonSelector: string, title: string, description: string) => {
  return {
    element: buttonSelector,
    popover: {
      title: title,
      description: description,
      side: 'right' as const,
      align: 'start' as const
    }
  };
};

// 메뉴 섹션 자동 확장
export const expandMenuSection = (sectionId: string) => {
  try {
    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (sectionElement) {
      console.log('섹션 요소 발견:', sectionId);
      const headerElement = sectionElement.querySelector('div[style*="cursor: pointer"]') as HTMLElement;
      if (headerElement) {
        console.log('헤더 요소 발견, 클릭 시도');
        headerElement.click();
        return true;
      }
    }
  } catch (error) {
    console.error('섹션 확장 오류:', error);
  }
  return false;
};

// 하이라이트 요소에 시각적 효과 추가
export const addHighlightEffect = (element: HTMLElement) => {
  if (element) {
    element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
    element.style.transition = 'box-shadow 0.3s ease';
  }
};

// 하이라이트 요소에서 시각적 효과 제거
export const removeHighlightEffect = (element: HTMLElement) => {
  if (element) {
    element.style.boxShadow = '';
  }
};

// 고객 추가 버튼 선택자 - 순수 JavaScript 방식
export const getCustomerAddButtonSelector = () => {
  // 모든 버튼 요소 가져오기
  const allButtons = document.querySelectorAll('button');
  
  // 버튼 중에서 '새 고객 추가' 또는 '고객 추가' 텍스트가 포함된 것 찾기
  for (const button of Array.from(allButtons)) {
    if (button.textContent && (
        button.textContent.includes('새 고객 추가') || 
        button.textContent.includes('고객 추가')
      )) {
      return button;
    }
  }
  
  // SVG 아이콘이 있는 버튼 중에서 '새' 또는 '추가' 텍스트가 포함된 것 찾기
  for (const button of Array.from(allButtons)) {
    if (button.querySelector('svg') && button.textContent && (
        button.textContent.includes('새') || 
        button.textContent.includes('추가')
      )) {
      return button;
    }
  }
  
  // 스타일로 구분 (파란색 배경의 버튼)
  for (const button of Array.from(allButtons)) {
    const style = window.getComputedStyle(button);
    if (style.backgroundColor.includes('rgb(59, 130, 246)') || // 파란색
        style.backgroundColor.includes('#3b82f6') || 
        style.backgroundColor.includes('rgb(99, 102, 241)')) { // 보라색
      return button;
    }
  }
  
  return null;
};

// 고객 추가 버튼 선택자 문자열 (하이라이트용)
export const CUSTOMER_ADD_BUTTON_SELECTOR = 'button';
