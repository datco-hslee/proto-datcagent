// Menu tree structure for chatbot navigation and Driver.js tutorials
export interface MenuItem {
  id: string;
  name: string;
  path: string;
  dataMenu: string;
  description?: string;
}

export interface MenuSection {
  id: string;
  name: string;
  dataSectionId: string;
  children: MenuItem[];
}

export interface MenuTree {
  sections: MenuSection[];
}

export interface NavigationPath {
  sectionId: string;
  sectionName: string;
  menuId: string;
  menuName: string; 
  path: string;
  dataMenu: string;
  dataSectionId: string;
  steps: string[];
}

// Complete menu tree structure
export const getMenuTree = (): MenuTree => {
  return {
    sections: [
      {
        id: 'sales-customer',
        name: '영업/고객',
        dataSectionId: 'sales-customer',
        children: [
          { id: 'crm-pipeline', name: 'CRM 파이프라인', path: '/crm-pipeline', dataMenu: 'crm-pipeline', description: '영업 기회 관리 및 고객 파이프라인 추적' },
          { id: 'customers', name: '고객 관리', path: '/customers', dataMenu: 'customers', description: '고객 정보 등록, 수정, 조회' },
          { id: 'orders', name: '주문 관리', path: '/orders', dataMenu: 'orders', description: '고객 주문 접수 및 처리' },
          { id: 'quotes', name: '견적 관리', path: '/quotes', dataMenu: 'quotes', description: '고객 견적서 작성 및 관리' },
          { id: 'sales-analytics', name: '영업 분석', path: '/sales-analytics', dataMenu: 'sales-analytics', description: '영업 실적 및 성과 분석' }
        ]
      },
      {
        id: 'production-mrp',
        name: '생산/MRP',
        dataSectionId: 'production-mrp',
        children: [
          { id: 'production-orders', name: '생산 오더', path: '/production-orders', dataMenu: 'production-orders', description: '생산 계획 및 작업 지시 관리' },
          { id: 'work-instructions', name: '작업 지시서', path: '/work-instructions', dataMenu: 'work-instructions', description: '상세 작업 지시 및 진행 상황 관리' },
          { id: 'bom', name: 'BOM 관리', path: '/bom', dataMenu: 'bom', description: '제품 구성 정보 및 자재 소요량 관리' }
        ]
      },
      {
        id: 'inventory-purchase',
        name: '재고/구매',
        dataSectionId: 'inventory-purchase',
        children: [
          { id: 'inventory', name: '재고 관리', path: '/inventory', dataMenu: 'inventory', description: '재고 현황 조회 및 입출고 관리' },
          { id: 'purchasing', name: '구매 관리', path: '/purchasing', dataMenu: 'purchasing', description: '구매 발주 및 입고 처리' },
          { id: 'suppliers', name: '공급업체 관리', path: '/suppliers', dataMenu: 'suppliers', description: '공급업체 정보 및 거래 관리' }
        ]
      },
      {
        id: 'logistics-shipping',
        name: '물류/출하',
        dataSectionId: 'logistics-shipping',
        children: [
          { id: 'shipping', name: '출하 관리', path: '/shipping', dataMenu: 'shipping', description: '제품 출하 및 배송 관리' }
        ]
      },
      {
        id: 'hr-payroll',
        name: '인사/급여',
        dataSectionId: 'hr-payroll',
        children: [
          { id: 'employees', name: '직원 관리', path: '/employees', dataMenu: 'employees', description: '직원 정보 및 조직 관리' },
          { id: 'attendance', name: '근태 관리', path: '/attendance', dataMenu: 'attendance', description: '출퇴근 및 근무 시간 관리' },
          { id: 'payroll', name: '급여 관리', path: '/payroll', dataMenu: 'payroll', description: '급여 계산 및 지급 관리' }
        ]
      },
      {
        id: 'finance-accounting',
        name: '재무/회계',
        dataSectionId: 'finance-accounting',
        children: [
          { id: 'accounting', name: '회계 관리', path: '/accounting', dataMenu: 'accounting', description: '회계 처리 및 장부 관리' },
          { id: 'budget', name: '예산 관리', path: '/budget', dataMenu: 'budget', description: '예산 계획 및 실행 관리' },
          { id: 'taxes', name: '세금 관리', path: '/taxes', dataMenu: 'taxes', description: '세무 신고 및 관리' },
          { id: 'reports', name: '재무 보고서', path: '/reports', dataMenu: 'reports', description: '재무제표 및 각종 보고서' }
        ]
      },
      {
        id: 'projects-documents',
        name: '프로젝트/문서',
        dataSectionId: 'projects-documents',
        children: [
          { id: 'projects', name: '프로젝트 관리', path: '/projects', dataMenu: 'projects', description: '프로젝트 계획 및 진행 관리' },
          { id: 'documents', name: '문서 관리', path: '/documents', dataMenu: 'documents', description: '업무 문서 및 자료 관리' }
        ]
      },
      {
        id: 'system-settings',
        name: '시스템/설정',
        dataSectionId: 'system-settings',
        children: [
          { id: 'erp-data', name: 'ERP 데이터 관리', path: '/erp-data', dataMenu: 'erp-data', description: 'ERP 시스템 데이터 관리' },
          { id: 'settings', name: '시스템 설정', path: '/settings', dataMenu: 'settings', description: '시스템 환경 설정' },
          { id: 'permissions', name: '권한 관리', path: '/permissions', dataMenu: 'permissions', description: '사용자 권한 및 접근 제어' },
          { id: 'integrations', name: '연동 관리', path: '/integrations', dataMenu: 'integrations', description: '외부 시스템 연동 관리' }
        ]
      }
    ]
  };
};

// Find navigation path for a specific menu item
export const findNavigationPath = (menuId: string): NavigationPath | null => {
  const menuTree = getMenuTree();
  
  for (const section of menuTree.sections) {
    for (const menu of section.children) {
      if (menu.id === menuId) {
        return {
          sectionId: section.id,
          sectionName: section.name,
          menuId: menu.id,
          menuName: menu.name,
          path: menu.path,
          dataMenu: menu.dataMenu,
          dataSectionId: section.dataSectionId,
          steps: [
            `좌측 메뉴에서 "${section.name}" 섹션을 클릭하세요.`,
            `"${menu.name}" 메뉴를 선택하세요.`,
            `${menu.description || '해당 페이지에서 작업을 진행하세요.'}`
          ]
        };
      }
    }
  }
  
  return null;
};

// Find all possible navigation paths for keyword matching
export const findNavigationPathsByKeywords = (keywords: string[]): NavigationPath[] => {
  const menuTree = getMenuTree();
  const paths: NavigationPath[] = [];
  
  for (const section of menuTree.sections) {
    for (const menu of section.children) {
      const searchText = `${section.name} ${menu.name} ${menu.description || ''}`.toLowerCase();
      
      if (keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
        paths.push({
          sectionId: section.id,
          sectionName: section.name,
          menuId: menu.id,
          menuName: menu.name,
          path: menu.path,
          dataMenu: menu.dataMenu,
          dataSectionId: section.dataSectionId,
          steps: [
            `좌측 메뉴에서 "${section.name}" 섹션을 클릭하세요.`,
            `"${menu.name}" 메뉴를 선택하세요.`,
            `${menu.description || '해당 페이지에서 작업을 진행하세요.'}`
          ]
        });
      }
    }
  }
  
  return paths;
};

// Get Driver.js steps for navigation with optional action button
export const getDriverSteps = (navigationPath: NavigationPath, includeActionButton = false) => {
  const steps = [
    {
      element: `[data-section-id="${navigationPath.dataSectionId}"]`,
      popover: {
        title: '1단계: 메뉴 섹션',
        description: `"${navigationPath.sectionName}" 섹션을 클릭하여 확장하세요.`,
        side: 'right' as const,
        align: 'start' as const
      }
    },
    {
      element: `[data-menu="${navigationPath.dataMenu}"]`,
      popover: {
        title: '2단계: 메뉴 항목',
        description: `"${navigationPath.menuName}" 메뉴를 클릭하여 해당 페이지로 이동하세요.`,
        side: 'right' as const,
        align: 'start' as const
      }
    }
  ];

  // Add action button step for specific pages
  if (includeActionButton) {
    // 고객 추가 버튼
    if (navigationPath.menuId === 'customers') {
      steps.push({
        element: 'button:contains("\uc0c8 \uace0\uac1d \ucd94\uac00"), button[style*="background"]:contains("\uc0c8"), button:has(svg):contains("\uc0c8"), button[onclick*="AddCustomer"]',
        popover: {
          title: '3\ub2e8\uacc4: \uc0c8 \uace0\uac1d \ucd94\uac00',
          description: '\uc774 \ubc84\ud2bc\uc744 \ud074\ub9ad\ud558\uc5ec \uc0c8\ub85c\uc6b4 \uace0\uac1d\uc744 \ucd94\uac00\ud558\uc138\uc694.',
          side: 'right' as const,
          align: 'start' as const
        }
      });
    }
    // 주문 생성 버튼
    else if (navigationPath.menuId === 'orders') {
      steps.push({
        element: 'button:contains("\uc0c8 \uc8fc\ubb38 \uc0dd\uc131"), button:contains("\uc8fc\ubb38 \ucd94\uac00"), button:has(svg):contains("\uc0c8"), button[style*="background"]:contains("\uc0c8")',
        popover: {
          title: '3\ub2e8\uacc4: \uc0c8 \uc8fc\ubb38 \uc0dd\uc131',
          description: '\uc774 \ubc84\ud2bc\uc744 \ud074\ub9ad\ud558\uc5ec \uc0c8\ub85c\uc6b4 \uc8fc\ubb38\uc744 \uc0dd\uc131\ud558\uc138\uc694.',
          side: 'right' as const,
          align: 'start' as const
        }
      });
    }
  }

  return steps;
};

// Generate chatbot response with navigation path
export const generateChatbotResponse = (query: string, navigationPath: NavigationPath) => {
  const lowerQuery = query.toLowerCase();
  const includeActionButton = lowerQuery.includes('추가') || lowerQuery.includes('등록') || lowerQuery.includes('생성');
  
  // Enhanced steps for customer addition or order creation
  let enhancedSteps = [...navigationPath.steps];
  
  if (includeActionButton) {
    // 고객 추가 케이스
    if (navigationPath.menuId === 'customers') {
      enhancedSteps.push('우측 상단의 "새 고객 추가" 버튼을 클릭하세요.');
      enhancedSteps.push('고객 정보를 입력하고 저장하세요.');
    }
    // 주문 생성 케이스
    else if (navigationPath.menuId === 'orders') {
      enhancedSteps.push('우측 상단의 "새 주문 생성" 버튼을 클릭하세요.');
      enhancedSteps.push('고객을 선택하고 주문 정보를 입력하세요.');
      enhancedSteps.push('주문할 제품을 추가하고 수량과 가격을 입력하세요.');
      enhancedSteps.push('"저장" 버튼을 클릭하여 주문을 완료하세요.');
    }
  }
  
  // 팁 설정
  let tips = [
    '메뉴를 클릭하면 자동으로 해당 페이지로 이동합니다.',
    '각 단계별로 안내에 따라 진행하세요.'
  ];
  
  // 특정 페이지에 따른 추가 팁
  if (includeActionButton) {
    tips.push('필수 항목은 빨간 별표(*)로 표시됩니다.');
    
    if (navigationPath.menuId === 'orders') {
      tips.push('주문 상태를 "임시 저장"으로 설정하면 나중에 수정할 수 있습니다.');
      tips.push('주문이 완료되면 자동으로 생산 계획에 반영됩니다.');
    }
  } else {
    tips.push('추가 도움이 필요하면 언제든 문의하세요.');
  }
  
  return {
    response: {
      title: `${navigationPath.menuName} 사용 방법`,
      steps: enhancedSteps,
      tips: tips
    },
    menuPath: [navigationPath.dataSectionId, navigationPath.dataMenu],
    navigationPath: navigationPath,
    includeActionButton,
    fromCache: false,
    timestamp: new Date().toISOString()
  };
};
