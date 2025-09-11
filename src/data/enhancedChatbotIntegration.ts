// Enhanced chatbot integration with data-driven responses and Driver.js tutorials
import axios from 'axios';
import { 
  findNavigationPathsByKeywords, 
  generateChatbotResponse, 
  type NavigationPath,
  getDriverSteps 
} from '../utils/menuTreeUtils';

// Backend API configuration
const BACKEND_API_URL = 'http://localhost:5000/api';

// Enhanced chatbot response interface
export interface EnhancedChatbotResponse {
  response: {
    title: string;
    steps: string[];
    tips: string[];
  };
  menuPath: string[];
  navigationPath?: NavigationPath;
  driverSteps?: any[];
  includeActionButton?: boolean;
  fromCache: boolean;
  timestamp: string;
  dataSource: 'backend' | 'cache' | 'local';
  confidence: number;
}

// Cache management interface
interface CacheEntry {
  query: string;
  response: EnhancedChatbotResponse;
  timestamp: string;
  expiryTime: number;
}

class EnhancedChatbotService {
  private cachePrefix = 'enhanced_chatbot_';
  private cacheExpiryHours = 24;

  // Main query processing function
  async processQuery(query: string): Promise<EnhancedChatbotResponse> {
    console.log('Processing query:', query);

    // 1. Check cache first
    const cachedResponse = this.getFromCache(query);
    if (cachedResponse) {
      console.log('Using cached response');
      return cachedResponse;
    }

    // 2. Try backend data
    try {
      const backendResponse = await this.getBackendResponse(query);
      if (backendResponse) {
        this.saveToCache(query, backendResponse);
        return backendResponse;
      }
    } catch (error) {
      console.warn('Backend request failed:', error);
    }

    // 3. Generate local response with navigation
    const localResponse = this.generateLocalResponse(query);
    this.saveToCache(query, localResponse);
    return localResponse;
  }

  // Get response from Python backend
  private async getBackendResponse(query: string): Promise<EnhancedChatbotResponse | null> {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/chatbot/enhanced-query`, {
        query,
        includeNavigation: true,
        includeDriverSteps: true
      }, {
        timeout: 5000
      });

      return {
        ...response.data,
        fromCache: false,
        dataSource: 'backend' as const,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Backend API error:', error);
      return null;
    }
  }

  // Generate local response with navigation paths
  private generateLocalResponse(query: string): EnhancedChatbotResponse {
    const keywords = this.extractKeywords(query);
    const navigationPaths = findNavigationPathsByKeywords(keywords);
    
    if (navigationPaths.length > 0) {
      const bestPath = navigationPaths[0]; // Use first match for now
      const response = generateChatbotResponse(query, bestPath);
      
      // Check if we need action button (3rd step)
      const lowerQuery = query.toLowerCase();
      const includeActionButton = lowerQuery.includes('추가') || lowerQuery.includes('등록') || lowerQuery.includes('생성');
      const driverSteps = getDriverSteps(bestPath, includeActionButton);

      return {
        response: response.response,
        menuPath: response.menuPath,
        navigationPath: bestPath,
        driverSteps,
        fromCache: false,
        timestamp: new Date().toISOString(),
        dataSource: 'local',
        confidence: this.calculateConfidence(query, bestPath)
      };
    }

    // Fallback response
    return this.generateFallbackResponse(query);
  }

  // Extract keywords from query
  private extractKeywords(query: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      '영업': ['영업', '고객', '판매', 'crm', '파이프라인'],
      '고객': ['고객', '거래처', '업체', '회사'],
      '생산': ['생산', '제조', '공정', '작업', 'mrp'],
      '재고': ['재고', '입고', '출고', '창고', '물류'],
      '구매': ['구매', '발주', '공급업체', '조달'],
      '급여': ['급여', '인사', '직원', '근태', '출퇴근'],
      '회계': ['회계', '재무', '예산', '세금', '장부'],
      '주문': ['주문', '오더', '발주'],
      '견적': ['견적', '견적서', '가격'],
      '출하': ['출하', '배송', '납품', '물류']
    };

    const keywords: string[] = [];
    const lowerQuery = query.toLowerCase();

    for (const [category, terms] of Object.entries(keywordMap)) {
      if (terms.some(term => lowerQuery.includes(term))) {
        keywords.push(category);
        keywords.push(...terms.filter(term => lowerQuery.includes(term)));
      }
    }

    return [...new Set(keywords)]; // Remove duplicates
  }

  // Calculate confidence score for response
  private calculateConfidence(query: string, navigationPath: NavigationPath): number {
    const queryWords = query.toLowerCase().split(' ');
    const pathText = `${navigationPath.sectionName} ${navigationPath.menuName}`.toLowerCase();
    
    let matches = 0;
    for (const word of queryWords) {
      if (pathText.includes(word)) {
        matches++;
      }
    }

    return Math.min((matches / queryWords.length) * 100, 95);
  }

  // Generate fallback response
  private generateFallbackResponse(_query: string): EnhancedChatbotResponse {
    const responses = [
      {
        title: 'ERP 시스템 안내',
        steps: [
          '좌측 메뉴에서 관련 섹션을 찾아보세요.',
          '각 메뉴는 기능별로 구성되어 있습니다.',
          '추가 도움이 필요하면 구체적인 질문을 해주세요.'
        ],
        tips: [
          '영업, 생산, 재고, 인사 등 주요 업무별로 메뉴가 구성되어 있습니다.',
          '각 메뉴를 클릭하면 상세 기능을 확인할 수 있습니다.'
        ]
      }
    ];

    return {
      response: responses[0],
      menuPath: [],
      fromCache: false,
      timestamp: new Date().toISOString(),
      dataSource: 'local',
      confidence: 50
    };
  }

  // Cache management methods
  private saveToCache(query: string, response: EnhancedChatbotResponse): void {
    try {
      const cacheKey = this.getCacheKey(query);
      const cacheEntry: CacheEntry = {
        query,
        response: { ...response, fromCache: true },
        timestamp: new Date().toISOString(),
        expiryTime: Date.now() + (this.cacheExpiryHours * 60 * 60 * 1000)
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      console.log('Response cached for query:', query);
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  private getFromCache(query: string): EnhancedChatbotResponse | null {
    try {
      const cacheKey = this.getCacheKey(query);
      const cachedData = localStorage.getItem(cacheKey);

      if (!cachedData) return null;

      const cacheEntry: CacheEntry = JSON.parse(cachedData);

      // Check expiry
      if (Date.now() > cacheEntry.expiryTime) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return { ...cacheEntry.response, fromCache: true };
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  private getCacheKey(query: string): string {
    return `${this.cachePrefix}${btoa(encodeURIComponent(query))}`;
  }

  // Cache management utilities
  public clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  public getCacheStats(): { count: number; totalSize: number } {
    let count = 0;
    let totalSize = 0;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.cachePrefix)) {
          count++;
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      });
    } catch (error) {
      console.error('Cache stats error:', error);
    }

    return { count, totalSize };
  }

  // Preload common queries
  public async preloadCommonQueries(): Promise<void> {
    const commonQueries = [
      '영업 고객 추가방법 알려줘',
      '재고 관리는 어떻게 하나요?',
      '생산 오더 등록 방법',
      '급여 관리 방법 알려줘',
      '구매 발주는 어떻게 하나요?',
      '출하 관리 방법',
      '회계 처리 방법'
    ];

    for (const query of commonQueries) {
      if (!this.getFromCache(query)) {
        await this.processQuery(query);
      }
    }

    console.log('Common queries preloaded');
  }
}

// Export singleton instance
export const enhancedChatbotService = new EnhancedChatbotService();
export default enhancedChatbotService;
