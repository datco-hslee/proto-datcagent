import axios from 'axios';

// 프록시 설정을 사용하여 API 요청
const API_URL = '/api';

// 챗봇 응답 타입 정의
export interface ChatbotResponse {
  response: {
    title: string;
    steps: string[];
    tips: string[];
  };
  menuPath: string[];
  fromCache: boolean;
  timestamp: string;
}

// 메뉴 트리 타입 정의
export interface MenuItem {
  id: string;
  name: string;
  path: string;
}

export interface MenuSection {
  name: string;
  children: MenuItem[];
}

export interface MenuTree {
  [key: string]: MenuSection;
}

// 챗봇 서비스 클래스
class ChatbotService {
  // 메뉴 트리 가져오기
  async getMenuTree(): Promise<MenuTree> {
    try {
      const response = await axios.get(`${API_URL}/menu-tree`);
      return response.data;
    } catch (error) {
      console.error('메뉴 트리 로딩 실패:', error);
      return {};
    }
  }

  // 챗봇 질문 처리
  async processQuery(query: string): Promise<ChatbotResponse> {
    try {
      // 서버가 실행 중이지 않은 경우 로컬 응답 처리
      const localResponse = this.getLocalResponse(query);
      if (localResponse) {
        return localResponse;
      }

      const response = await axios.post(`${API_URL}/chatbot/query`, { query });
      return response.data;
    } catch (error) {
      console.error('챗봇 질문 처리 실패:', error);
      
      // 서버 연결 실패 시 로컬 응답 시도
      const localResponse = this.getLocalResponse(query);
      if (localResponse) {
        return localResponse;
      }

      return {
        response: {
          title: '연결 오류',
          steps: ['서버 연결에 문제가 발생했습니다.', '잠시 후 다시 시도해주세요.'],
          tips: ['인터넷 연결을 확인해주세요.', '서버가 실행 중인지 확인해주세요.']
        },
        menuPath: [],
        fromCache: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 로컬 응답 처리
  private getLocalResponse(query: string): ChatbotResponse | null {
    const lowerQuery = query.toLowerCase();
    
    // 영업/고객 관련 질문
    if (lowerQuery.includes('영업') || lowerQuery.includes('고객') || lowerQuery.includes('추가')) {
      return {
        response: {
          title: '고객 추가 방법',
          steps: [
            '좌측 메뉴에서 "영업/고객" 섹션을 클릭하세요.',
            '"고객 관리" 메뉴를 선택하세요.',
            '우측 상단의 "고객 추가" 버튼을 클릭하세요.',
            '고객 정보를 입력하고 저장하세요.'
          ],
          tips: [
            '고객 코드는 자동으로 생성됩니다.',
            '필수 항목은 빨간 별표(*)로 표시됩니다.',
            '저장 후 고객 목록에서 확인할 수 있습니다.'
          ]
        },
        menuPath: ['sales-customer', 'customers'],
        fromCache: false,
        timestamp: new Date().toISOString()
      };
    }
    
    // 재고 관리 관련 질문
    if (lowerQuery.includes('재고') || lowerQuery.includes('inventory')) {
      return {
        response: {
          title: '재고 관리 방법',
          steps: [
            '좌측 메뉴에서 "재고/구매" 섹션을 클릭하세요.',
            '"재고 관리" 메뉴를 선택하세요.',
            '재고 현황을 확인하고 필요시 조정하세요.',
            '입출고 내역을 통해 재고 이동을 추적하세요.'
          ],
          tips: [
            '안전재고 수준을 설정하여 자동 알림을 받으세요.',
            '정기적인 재고 실사를 진행하세요.',
            '재고 회전율을 모니터링하세요.'
          ]
        },
        menuPath: ['inventory-purchase', 'inventory'],
        fromCache: false,
        timestamp: new Date().toISOString()
      };
    }
    
    // 생산 오더 관련 질문
    if (lowerQuery.includes('생산') || lowerQuery.includes('오더') || lowerQuery.includes('production')) {
      return {
        response: {
          title: '생산 오더 등록 방법',
          steps: [
            '좌측 메뉴에서 "생산/MRP" 섹션을 클릭하세요.',
            '"생산 오더" 메뉴를 선택하세요.',
            '"생산 오더 추가" 버튼을 클릭하세요.',
            '제품, 수량, 납기일 등을 입력하고 저장하세요.'
          ],
          tips: [
            'BOM 정보를 미리 등록해두면 자동으로 자재 소요량이 계산됩니다.',
            '생산 일정을 고려하여 납기일을 설정하세요.',
            '작업 지시서와 연동하여 생산 진행 상황을 추적하세요.'
          ]
        },
        menuPath: ['production-mrp', 'production-orders'],
        fromCache: false,
        timestamp: new Date().toISOString()
      };
    }
    
    // 급여 관리 관련 질문
    if (lowerQuery.includes('급여') || lowerQuery.includes('payroll')) {
      return {
        response: {
          title: '급여 관리 방법',
          steps: [
            '좌측 메뉴에서 "인사/급여" 섹션을 클릭하세요.',
            '"급여 관리" 메뉴를 선택하세요.',
            '급여 계산 기준일을 설정하세요.',
            '직원별 급여를 계산하고 승인하세요.'
          ],
          tips: [
            '근태 데이터와 연동하여 자동 계산됩니다.',
            '세금 및 공제 항목을 정확히 설정하세요.',
            '급여 명세서를 자동으로 생성할 수 있습니다.'
          ]
        },
        menuPath: ['hr-payroll', 'payroll'],
        fromCache: false,
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }

  // 로컬 캐시 저장
  saveToLocalCache(query: string, response: ChatbotResponse): void {
    try {
      const cacheKey = `chatbot_${btoa(query)}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        response,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('로컬 캐시 저장 실패:', error);
    }
  }

  // 로컬 캐시 조회
  getFromLocalCache(query: string): ChatbotResponse | null {
    try {
      const cacheKey = `chatbot_${btoa(query)}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) return null;
      
      const { response, timestamp } = JSON.parse(cachedData);
      
      // 캐시 유효 기간 (24시간)
      const cacheExpiry = 24 * 60 * 60 * 1000;
      const cachedTime = new Date(timestamp).getTime();
      const currentTime = new Date().getTime();
      
      if (currentTime - cachedTime > cacheExpiry) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('로컬 캐시 조회 실패:', error);
      return null;
    }
  }
}

const chatbotServiceInstance = new ChatbotService();
export default chatbotServiceInstance;
export { chatbotServiceInstance as chatbotService };
