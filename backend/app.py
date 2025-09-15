from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Union

# Gemini API 클라이언트 임포트
from gemini_client import process_query_with_gemini

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인만 허용하도록 변경하세요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 캐시 데이터 저장소
cache_dir = os.path.join(os.path.dirname(__file__), 'cache')
os.makedirs(cache_dir, exist_ok=True)

# 메뉴 트리 구조를 위한 타입 정의
class MenuItem(BaseModel):
    id: str
    name: str
    path: str

class MenuCategory(BaseModel):
    name: str
    children: List[MenuItem]

# 통합 메뉴 및 버튼 구조 정의
class MenuStructure:
    """
    메뉴 구조를 관리하는 클래스 - 완전 동적 생성
    """
    
    # 동적으로 생성되는 메뉴 구성 (초기값은 빈 구조)
    MENU_CONFIG = {
        "categories": {},
        "pages": {}
    }
    
    @classmethod
    def update_from_frontend(cls, frontend_data=None):
        """
        프론트엔드 컴포넌트에서 메뉴 및 버튼 정보를 업데이트합니다.
        실제 구현에서는 프론트엔드 컴포넌트를 스캔하여 동적으로 업데이트합니다.
        
        Args:
            frontend_data: 프론트엔드에서 전달받은 메뉴 및 버튼 정보
        """
        # 실제 구현에서는 프론트엔드 컴포넌트를 스캔하여 동적으로 업데이트
        # 현재는 예시 구현으로 기본 구조를 유지
        if frontend_data:
            # 프론트엔드에서 전달받은 데이터로 메뉴 구조 업데이트
            for category_id, category_data in frontend_data.get('categories', {}).items():
                if category_id in cls.MENU_CONFIG['categories']:
                    cls.MENU_CONFIG['categories'][category_id].update(category_data)
                else:
                    cls.MENU_CONFIG['categories'][category_id] = category_data
            
            # 페이지 정보 업데이트
            for page_id, page_data in frontend_data.get('pages', {}).items():
                if page_id in cls.MENU_CONFIG['pages']:
                    cls.MENU_CONFIG['pages'][page_id].update(page_data)
                else:
                    cls.MENU_CONFIG['pages'][page_id] = page_data
    
    @classmethod
    def scan_frontend_components(cls):
        """
        프론트엔드 컴포넌트를 완전히 스캔하여 메뉴 및 버튼 정보를 동적으로 생성합니다.
        """
        try:
            import os
            import re
            import json
            
            # 메뉴 구성 초기화
            cls.MENU_CONFIG = {
                "categories": {},
                "pages": {}
            }
            
            # 프론트엔드 디렉토리 경로
            frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src')
            components_dir = os.path.join(frontend_dir, 'components')
            pages_dir = os.path.join(frontend_dir, 'pages')
            
            print(f"Scanning frontend directory: {frontend_dir}")
            
            # 1. Sidebar.tsx에서 카테고리와 페이지 정보 추출
            sidebar_path = os.path.join(components_dir, 'layout', 'Sidebar.tsx')
            if os.path.exists(sidebar_path):
                cls._scan_sidebar_component(sidebar_path)
            
            # 2. 모든 페이지 컴포넌트에서 버튼 정보 추출
            if os.path.exists(pages_dir):
                cls._scan_page_components(pages_dir)
            
            # 3. 컴포넌트 디렉토리에서 추가 페이지 스캔
            if os.path.exists(components_dir):
                cls._scan_component_directories(components_dir)
                
            print(f"Scanned categories: {list(cls.MENU_CONFIG['categories'].keys())}")
            print(f"Scanned pages: {list(cls.MENU_CONFIG['pages'].keys())}")
            
        except Exception as e:
            print(f"Error scanning frontend components: {e}")
    
    @classmethod
    def _scan_sidebar_component(cls, sidebar_path):
        """Sidebar.tsx 파일을 스캔하여 카테고리와 페이지 정보를 추출합니다."""
        try:
            import re
            with open(sidebar_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # 메뉴 섹션 패턴 (mainNavSections 배열에서 추출) - 더 간단한 패턴 사용
                section_pattern = r'id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*icon:\s*(\w+)'
                sections = re.findall(section_pattern, content)
                
                for section_id, title, icon in sections:
                    # 카테고리 정보 저장
                    cls.MENU_CONFIG['categories'][section_id] = {
                        "name": title,
                        "icon": icon.strip(),
                        "dataMenu": section_id
                    }
                
                # 메뉴 아이템 패턴 (더 간단하게)
                item_pattern = r'name:\s*"([^"]+)"\s*,\s*icon:\s*(\w+)\s*,\s*path:\s*"([^"]+)"'
                items = re.findall(item_pattern, content)
                
                for name, icon, path in items:
                    # 경로에서 페이지 ID 추출
                    page_id = path.strip('/').replace('/', '-') if path.strip('/') else 'dashboard'
                    
                    # 카테고리 추정 (경로 기반)
                    category = cls._determine_page_category(path)
                    
                    cls.MENU_CONFIG['pages'][page_id] = {
                        "name": name,
                        "path": path,
                        "category": category,
                        "icon": icon.strip(),
                        "dataMenu": page_id,
                        "buttons": []  # 버튼은 나중에 페이지 스캔에서 추가
                    }
                        
                print(f"Extracted {len(cls.MENU_CONFIG['categories'])} categories and {len(cls.MENU_CONFIG['pages'])} pages from Sidebar")
                
        except Exception as e:
            print(f"Error scanning sidebar component: {e}")
    
    @classmethod
    def _scan_page_components(cls, pages_dir):
        """페이지 컴포넌트들을 스캔하여 버튼 정보를 추출합니다."""
        try:
            for root, dirs, files in os.walk(pages_dir):
                for file in files:
                    if file.endswith('.tsx') or file.endswith('.jsx'):
                        file_path = os.path.join(root, file)
                        cls._extract_buttons_from_file(file_path)
                        
        except Exception as e:
            print(f"Error scanning page components: {e}")
    
    @classmethod
    def _scan_component_directories(cls, components_dir):
        """컴포넌트 디렉토리들을 스캔하여 추가 페이지와 버튼 정보를 추출합니다."""
        try:
            for root, dirs, files in os.walk(components_dir):
                for file in files:
                    if file.endswith('.tsx') or file.endswith('.jsx'):
                        file_path = os.path.join(root, file)
                        cls._extract_buttons_from_file(file_path)
                        
        except Exception as e:
            print(f"Error scanning component directories: {e}")
    
    @classmethod
    def _extract_buttons_from_file(cls, file_path):
        """개별 파일에서 버튼 정보를 추출합니다."""
        try:
            import re
            import os
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # 파일명에서 페이지 ID 추출
                file_name = os.path.basename(file_path)
                page_id = os.path.splitext(file_name)[0].lower()
                
                # Page 접미사 제거
                if page_id.endswith('page'):
                    page_id = page_id[:-4]
                
                # 하이픈으로 변환
                page_id = re.sub(r'([a-z])([A-Z])', r'\1-\2', page_id).lower()
                
                # 버튼 패턴들 정의
                button_patterns = [
                    # <Button> 태그
                    r'<Button[^>]*(?:onClick[^>]*)?>([^<]+)</Button>',
                    # <button> 태그  
                    r'<button[^>]*(?:onClick[^>]*)?>([^<]+)</button>',
                    # onClick 핸들러가 있는 div나 다른 요소들
                    r'<(?:div|span)[^>]*onClick[^>]*>([^<]+)</(?:div|span)>',
                    # 아이콘과 함께 있는 버튼들
                    r'<[^>]*>\s*<(?:Plus|Filter|Search|Edit|Delete|Save|Cancel|Add|Remove|Update|Create|Export|Import)[^>]*>\s*([^<]+)',
                ]
                
                buttons = []
                button_id_counter = 0
                
                for pattern in button_patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    for match in matches:
                        button_text = match.strip()
                        if button_text and len(button_text) < 50:  # 너무 긴 텍스트는 제외
                            # 버튼 액션 타입 결정
                            action = cls._determine_button_action(button_text)
                            
                            buttons.append({
                                "id": f"{page_id}-button-{button_id_counter}",
                                "name": button_text,
                                "action": action,
                                "color": "default"
                            })
                            button_id_counter += 1
                
                # 페이지가 이미 존재하면 버튼 정보 업데이트
                if page_id in cls.MENU_CONFIG['pages'] and buttons:
                    cls.MENU_CONFIG['pages'][page_id]['buttons'] = buttons
                elif buttons:
                    # 새 페이지 생성 (카테고리는 파일 경로로 추정)
                    category = cls._determine_page_category(file_path)
                    
                    cls.MENU_CONFIG['pages'][page_id] = {
                        "name": page_id.replace('-', ' ').title(),
                        "path": f"/{page_id}",
                        "category": category,
                        "icon": "FileText",
                        "buttons": buttons
                    }
                    
                if buttons:
                    print(f"Extracted {len(buttons)} buttons from {file_name}")
                    
        except Exception as e:
            print(f"Error extracting buttons from {file_path}: {e}")
    
    @classmethod
    def _determine_button_action(cls, button_text):
        """버튼 텍스트를 기반으로 액션 타입을 결정합니다."""
        button_text_lower = button_text.lower()
        
        if any(word in button_text_lower for word in ['추가', 'add', 'create', '생성', 'new', '새']):
            return 'add'
        elif any(word in button_text_lower for word in ['수정', 'edit', 'update', '편집', 'modify']):
            return 'edit'
        elif any(word in button_text_lower for word in ['삭제', 'delete', 'remove', '제거']):
            return 'delete'
        elif any(word in button_text_lower for word in ['필터', 'filter', '검색', 'search', '찾기']):
            return 'filter'
        elif any(word in button_text_lower for word in ['저장', 'save', '보존']):
            return 'save'
        elif any(word in button_text_lower for word in ['취소', 'cancel', '닫기', 'close']):
            return 'cancel'
        elif any(word in button_text_lower for word in ['내보내기', 'export', '다운로드', 'download']):
            return 'export'
        elif any(word in button_text_lower for word in ['가져오기', 'import', '업로드', 'upload']):
            return 'import'
        elif any(word in button_text_lower for word in ['새로고침', 'refresh', 'reload', '갱신']):
            return 'refresh'
        elif any(word in button_text_lower for word in ['시작', 'start', '실행', 'run', 'play']):
            return 'start'
        elif any(word in button_text_lower for word in ['정지', 'stop', '중지', 'pause']):
            return 'stop'
        else:
            return 'default'
    
    @classmethod
    def _determine_page_category(cls, file_path):
        """파일 경로를 기반으로 페이지 카테고리를 결정합니다."""
        path_lower = file_path.lower()
        
        if any(word in path_lower for word in ['sales', 'customer', 'crm', 'order', 'quote']):
            return 'sales-customer'
        elif any(word in path_lower for word in ['production', 'bom', 'work', 'mrp']):
            return 'production-mrp'
        elif any(word in path_lower for word in ['inventory', 'purchase', 'supplier', 'stock']):
            return 'inventory-purchase'
        elif any(word in path_lower for word in ['hr', 'employee', 'payroll', 'attendance']):
            return 'hr-payroll'
        elif any(word in path_lower for word in ['finance', 'accounting', 'budget', 'tax']):
            return 'accounting-finance'
        elif any(word in path_lower for word in ['shipping', 'logistics', 'delivery']):
            return 'logistics-shipping'
        elif any(word in path_lower for word in ['report', 'analytics', 'dashboard']):
            return 'reports-analytics'
        elif any(word in path_lower for word in ['settings', 'permissions', 'integrations', 'erp-data', 'system']):
            return 'system'
        else:
            return 'reports-analytics'  # 기본 카테고리

# 메뉴 트리 구조 생성 함수
def generate_menu_tree() -> Dict[str, Any]:
    """
    메뉴 트리 구조를 동적으로 생성하는 함수
    모든 페이지와 버튼을 포함한 완전한 트리 구조를 생성합니다.
    
    Returns:
        Dict[str, Any]: 메뉴 트리 구조를 담은 딕셔너리
    """
    # 프론트엔드 컴포넌트 스캔 (매번 최신 상태로 업데이트)
    MenuStructure.scan_frontend_components()
    
    # 메뉴 트리 구조 생성
    menu_tree = {
        "categories": {},
        "tree_structure": {}
    }
    
    # 카테고리별로 트리 구조 생성
    for category_id, category_data in MenuStructure.MENU_CONFIG['categories'].items():
        # 카테고리 기본 정보
        category_info = {
            "id": category_id,
            "name": category_data["name"],
            "icon": category_data.get("icon", "Folder"),
            "dataMenu": category_data.get("dataMenu", category_id),
            "pages": {}
        }
        
        # 해당 카테고리에 속한 페이지들 추가
        for page_id, page_data in MenuStructure.MENU_CONFIG['pages'].items():
            if page_data.get("category") == category_id:
                # 페이지 정보 구성
                page_info = {
                    "id": page_id,
                    "name": page_data["name"],
                    "path": page_data["path"],
                    "icon": page_data.get("icon", "FileText"),
                    "dataMenu": page_data.get("dataMenu", page_id),
                    "buttons": {}
                }
                
                # 페이지의 버튼들을 트리 구조에 추가
                buttons = page_data.get("buttons", [])
                for button in buttons:
                    button_info = {
                        "id": button["id"],
                        "name": button["name"],
                        "action": button["action"],
                        "color": button.get("color", "default"),
                        "selector": f"[data-button-id='{button['id']}']",  # driver.js용 셀렉터
                        "path": f"{category_id}.{page_id}.{button['action']}"  # 계층 경로
                    }
                    page_info["buttons"][button["action"]] = button_info
                
                category_info["pages"][page_id] = page_info
        
        menu_tree["categories"][category_id] = category_info
    
    # 트리 구조 생성 (driver.js 하이라이트용)
    tree_structure = {}
    for category_id, category_data in menu_tree["categories"].items():
        tree_structure[category_id] = {
            "name": category_data["name"],
            "selector": f"[data-section-id='{category_id}']",
            "children": {}
        }
        
        for page_id, page_data in category_data["pages"].items():
            tree_structure[category_id]["children"][page_id] = {
                "name": page_data["name"],
                "selector": f"[data-menu='{page_data['dataMenu']}']",
                "path": page_data["path"],
                "children": {}
            }
            
            for action, button_data in page_data["buttons"].items():
                tree_structure[category_id]["children"][page_id]["children"][action] = {
                    "name": button_data["name"],
                    "selector": button_data["selector"],
                    "action": button_data["action"],
                    "path": button_data["path"]
                }
    
    menu_tree["tree_structure"] = tree_structure
    
    # 통계 정보 추가
    menu_tree["statistics"] = {
        "total_categories": len(menu_tree["categories"]),
        "total_pages": sum(len(cat["pages"]) for cat in menu_tree["categories"].values()),
        "total_buttons": sum(
            sum(len(page["buttons"]) for page in cat["pages"].values()) 
            for cat in menu_tree["categories"].values()
        )
    }
    
    print(f"Generated menu tree: {menu_tree['statistics']['total_categories']} categories, "
          f"{menu_tree['statistics']['total_pages']} pages, "
          f"{menu_tree['statistics']['total_buttons']} buttons")
    
    return menu_tree

# Pydantic 모델 정의
class ChatbotQuery(BaseModel):
    query: str

class ChatbotResponse(BaseModel):
    response: Dict[str, Any]
    menuPath: List[str]
    fromCache: bool
    timestamp: str

# 캐시 데이터 로드
def load_cache(cache_key: str) -> Optional[Dict[str, Any]]:
    cache_file = os.path.join(cache_dir, f"{cache_key}.json")
    if os.path.exists(cache_file):
        with open(cache_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

# 캐시 데이터 저장
def save_cache(cache_key: str, data: Dict[str, Any]) -> None:
    cache_file = os.path.join(cache_dir, f"{cache_key}.json")
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 메뉴 구조 업데이트를 위한 Pydantic 모델
class MenuUpdateRequest(BaseModel):
    categories: Optional[Dict[str, Dict[str, Any]]] = None
    pages: Optional[Dict[str, Dict[str, Any]]] = None

# 메뉴 트리 구조 API
@app.get("/api/menu-tree")
async def get_menu_tree():
    # 매 요청마다 동적으로 메뉴 트리 생성
    current_menu_tree = generate_menu_tree()
    return current_menu_tree

# 메뉴 구조 업데이트 API
@app.post("/api/menu-tree/update")
async def update_menu_tree(update_data: MenuUpdateRequest):
    # 프론트엔드에서 전달받은 데이터로 메뉴 구조 업데이트
    frontend_data = {
        "categories": update_data.categories or {},
        "pages": update_data.pages or {}
    }
    
    # MenuStructure 클래스의 업데이트 메소드 호출
    MenuStructure.update_from_frontend(frontend_data)
    
    # 업데이트된 메뉴 트리 반환
    updated_menu_tree = generate_menu_tree()
    return {
        "success": True,
        "message": "메뉴 구조가 성공적으로 업데이트되었습니다.",
        "menu_tree": updated_menu_tree
    }

# 메뉴 구조 스캔 API
@app.post("/api/menu-tree/scan")
async def scan_menu_tree():
    # 프론트엔드 컴포넌트 스캔 실행
    MenuStructure.scan_frontend_components()
    
    # 업데이트된 메뉴 트리 반환
    updated_menu_tree = generate_menu_tree()
    return {
        "success": True,
        "message": "프론트엔드 컴포넌트 스캔이 성공적으로 완료되었습니다.",
        "menu_tree": updated_menu_tree
    }

# 챗봇 질문 처리 API
@app.post("/api/chatbot/query", response_model=ChatbotResponse)
async def process_query(query_data: ChatbotQuery):
    query = query_data.query
    
    # 캐시 확인
    cache_key = f"query_{hash(query)}"
    cached_response = load_cache(cache_key)
    
    if cached_response:
        return ChatbotResponse(
            response=cached_response["response"],
            menuPath=cached_response["menuPath"],
            fromCache=True,
            timestamp=cached_response["timestamp"]
        )
    
    # 질문 분석 및 메뉴 경로 찾기 (async 함수 호출)
    menu_path, response = await analyze_query(query)
    
    # 결과 캐싱
    result = {
        "response": response,
        "menuPath": menu_path,
        "fromCache": False,
        "timestamp": datetime.now().isoformat()
    }
    save_cache(cache_key, result)
    
    return ChatbotResponse(**result)

# 향상된 챗봇 질문 처리 API (드라이버 단계 포함)
class EnhancedChatbotQuery(BaseModel):
    query: str
    includeNavigation: bool = True
    includeDriverSteps: bool = True

class EnhancedChatbotResponse(BaseModel):
    response: Dict[str, Any]
    menuPath: List[str]
    navigationPath: Optional[Dict[str, Any]] = None
    driverSteps: Optional[List[Dict[str, Any]]] = None
    includeActionButton: Optional[bool] = None
    fromCache: bool
    timestamp: str
    confidence: Optional[float] = None
    dataSource: str = "backend"

@app.post("/api/chatbot/enhanced-query", response_model=EnhancedChatbotResponse)
async def process_enhanced_query(query_data: EnhancedChatbotQuery):
    query = query_data.query
    print(f"[DEBUG] Enhanced query received: {query}")
    
    # 캐시 확인
    cache_key = f"enhanced_query_{hash(query)}"
    cached_response = load_cache(cache_key)
    
    if cached_response:
        print(f"[DEBUG] Using cached enhanced response for: {query}")
        return EnhancedChatbotResponse(**cached_response)
    
    # 질문 분석 및 메뉴 경로 찾기
    menu_path, response = await analyze_query(query)
    
    # 네비게이션 경로 생성
    navigation_path = None
    driver_steps = None
    include_action_button = False
    confidence = 85.0  # 기본 확률
    
    # 새 주문 생성 관련 질문 감지
    if "새 주문 생성" in query or "주문 생성 방법" in query:
        print(f"[DEBUG] Enhanced query detected order creation pattern")
        navigation_path = {
            "sectionId": "sales-customer",
            "sectionName": "영업/고객",
            "menuId": "orders",
            "menuName": "주문 관리",
            "path": "/orders",
            "dataMenu": "orders",
            "dataSectionId": "sales-customer",
            "steps": [
                "영업/고객 메뉴에서 주문 관리를 선택합니다.",
                "주문 관리 페이지에서 '새 주문 생성' 버튼을 클릭합니다.",
                "고객을 선택하고 주문 정보를 입력합니다."
            ]
        }
        driver_steps = [
            {
                "element": f"[data-section-id=\"sales-customer\"]",
                "popover": {
                    "title": "1단계: 메뉴 섹션",
                    "description": "\"영업/고객\" 섹션을 클릭하여 확장하세요.",
                    "side": "right",
                    "align": "start"
                }
            },
            {
                "element": "[data-menu=\"orders\"]",
                "popover": {
                    "title": "2단계: 메뉴 항목",
                    "description": "\"주문 관리\" 메뉴를 클릭하여 해당 페이지로 이동하세요.",
                    "side": "right",
                    "align": "start"
                }
            },
            {
                "element": "button:contains(\"새 주문 생성\"), button:contains(\"주문 추가\"), button:has(svg):contains(\"새\"), button[style*=\"background\"]:contains(\"새\")",
                "popover": {
                    "title": "3단계: 새 주문 생성",
                    "description": "이 버튼을 클릭하여 새로운 주문을 생성하세요.",
                    "side": "right",
                    "align": "start"
                }
            }
        ]
        include_action_button = True
        confidence = 95.0  # 더 높은 확률
    # 고객 추가 관련 질문 감지
    elif "고객 추가" in query or "고객 등록" in query:
        navigation_path = {
            "sectionId": "sales-customer",
            "sectionName": "영업/고객",
            "menuId": "customers",
            "menuName": "고객 관리",
            "path": "/customers",
            "dataMenu": "customers",
            "dataSectionId": "sales-customer",
            "steps": [
                "영업/고객 메뉴에서 고객 관리를 선택합니다.",
                "고객 관리 페이지에서 '새 고객 추가' 버튼을 클릭합니다.",
                "고객 정보 양식을 작성합니다."
            ]
        }
        driver_steps = [
            {
                "element": f"[data-section-id=\"sales-customer\"]",
                "popover": {
                    "title": "1단계: 메뉴 섹션",
                    "description": "\"영업/고객\" 섹션을 클릭하여 확장하세요.",
                    "side": "right",
                    "align": "start"
                }
            },
            {
                "element": "[data-menu=\"customers\"]",
                "popover": {
                    "title": "2단계: 메뉴 항목",
                    "description": "\"고객 관리\" 메뉴를 클릭하여 해당 페이지로 이동하세요.",
                    "side": "right",
                    "align": "start"
                }
            },
            {
                "element": "button:contains(\"새 고객 추가\"), button[style*=\"background\"]:contains(\"새\"), button:has(svg):contains(\"새\"), button[onclick*=\"AddCustomer\"]",
                "popover": {
                    "title": "3단계: 새 고객 추가",
                    "description": "이 버튼을 클릭하여 새로운 고객을 추가하세요.",
                    "side": "right",
                    "align": "start"
                }
            }
        ]
        include_action_button = True
    
    # 결과 생성
    result = {
        "response": response,
        "menuPath": menu_path,
        "navigationPath": navigation_path,
        "driverSteps": driver_steps if query_data.includeDriverSteps else None,
        "includeActionButton": include_action_button,
        "fromCache": False,
        "timestamp": datetime.now().isoformat(),
        "confidence": confidence,
        "dataSource": "backend"
    }
    
    # 결과 캐싱
    save_cache(cache_key, result)
    print(f"[DEBUG] Enhanced response generated and cached for: {query}")
    
    return EnhancedChatbotResponse(**result)

# 질문 전처리 함수
def preprocess_query(query: str) -> str:
    """
    사용자 질문을 전처리하는 함수
    
    Args:
        query: 원본 질문 문자열
        
    Returns:
        str: 전처리된 질문 문자열
    """
    # 공백 제거 및 트리밍
    query = query.strip()
    
    # 불필요한 문장 부호 제거
    query = query.replace('?', ' ?').replace('.', ' .').replace('!', ' !')
    
    # 연속 공백 제거
    import re
    query = re.sub(r'\s+', ' ', query)
    
    # 특수 패턴 처리
    patterns = {
        r'\b어떻게\b': '방법',
        r'\b어떠한\b': '방법',
        r'\b어떠하게\b': '방법',
        r'\b영업 고객\b': '고객',
        r'\b고객 추가\b': '고객 추가 방법',
        r'\b추가 방법\b': '추가 방법',
        r'\b등록 방법\b': '추가 방법',
    }
    
    for pattern, replacement in patterns.items():
        query = re.sub(pattern, replacement, query)
    
    return query

# 질문 의도 분석 함수
def analyze_intent(query: str) -> Dict[str, float]:
    """
    질문의 의도를 분석하는 함수
    
    Args:
        query: 전처리된 질문 문자열
        
    Returns:
        Dict[str, float]: 의도별 확률을 나타내는 디셔너리
    """
    intent_scores = {}
    
    # 고객 추가 관련 의도 분석
    customer_add_keywords = [
        '고객', '추가', '등록', '신규', '입력', '영업', '방법'
    ]
    customer_add_score = sum(1 for keyword in customer_add_keywords if keyword in query) / len(customer_add_keywords)
    
    # 특정 패턴에 대한 가중치 부여
    if '고객 추가' in query or '고객 등록' in query:
        customer_add_score += 0.3
    
    if '방법' in query and ('고객' in query or '영업' in query):
        customer_add_score += 0.2
    
    intent_scores['add_customer'] = min(customer_add_score, 1.0)
    
    # 주문 생성 관련 의도 분석
    order_create_keywords = [
        '주문', '생성', '추가', '등록', '신규', '새', '방법'
    ]
    order_create_score = sum(1 for keyword in order_create_keywords if keyword in query) / len(order_create_keywords)
    
    # 특정 패턴에 대한 가중치 부여
    if '주문 생성' in query or '주문 등록' in query or '새 주문' in query:
        order_create_score += 0.3
    
    # 정확한 패턴 매칭
    if '새 주문 생성하는 방법' in query:
        order_create_score = 1.0  # 정확한 패턴이 매칭되면 최대 확률 부여
    
    if '방법' in query and ('주문' in query):
        order_create_score += 0.2
    
    intent_scores['create_order'] = min(order_create_score, 1.0)
    
    return intent_scores

# 고객 추가 질문 처리 함수
def handle_add_customer_query() -> tuple[List[str], Dict[str, Any]]:
    """
    고객 추가 관련 질문에 대한 응답을 생성하는 함수
    
    Returns:
        tuple: (메뉴경로 리스트, 응답 데이터 디셔너리)
    """
    return ["sales-customer", "customers"], {
        "title": "고객 추가 방법",
        "steps": [
            "영업/고객 메뉴에서 고객 관리를 선택합니다.",
            "고객 관리 페이지에서 '새 고객 추가' 버튼을 클릭합니다.",
            "고객 정보 양식을 작성합니다.",
            "'저장' 버튼을 클릭하여 새 고객을 등록합니다."
        ],
        "tips": [
            "필수 입력 항목: 고객명, 연락처, 주소",
            "고객 분류를 설정하면 나중에 필터링이 용이합니다.",
            "담당자를 지정하면 알림이 자동으로 전송됩니다.",
            "신규 고객은 등록 후 CRM 파이프라인에서 관리할 수 있습니다."
        ]
    }

# 주문 생성 질문 처리 함수
def handle_create_order_query() -> tuple[List[str], Dict[str, Any]]:
    """
    주문 생성 관련 질문에 대한 응답을 생성하는 함수
    
    Returns:
        tuple: (메뉴경로 리스트, 응답 데이터 디셔너리)
    """
    print("[DEBUG] handle_create_order_query 함수 실행")
    
    menu_path = ["sales-customer", "orders"]
    response_data = {
        "title": "새 주문 생성 방법",
        "steps": [
            "영업/고객 메뉴에서 주문 관리를 선택합니다.",
            "주문 관리 페이지에서 '새 주문 생성' 버튼을 클릭합니다.",
            "고객을 선택하고 주문 정보를 입력합니다.",
            "주문할 제품을 추가하고 수량과 가격을 입력합니다.",
            "'저장' 버튼을 클릭하여 새 주문을 등록합니다."
        ],
        "tips": [
            "필수 입력 항목: 고객명, 제품, 수량, 배송주소",
            "주문 상태를 '임시 저장'으로 설정하면 나중에 수정할 수 있습니다.",
            "주문이 완료되면 자동으로 생산 계획에 반영됩니다.",
            "주문 상태는 실시간으로 추적할 수 있습니다."
        ]
    }
    
    print(f"[DEBUG] handle_create_order_query 반환값: {menu_path}, {response_data}")
    return menu_path, response_data

# 질문 분석 함수
async def analyze_query(query: str) -> tuple[List[str], Dict[str, Any]]:
    """
    사용자 질문을 분석하여 관련 메뉴 경로와 응답을 생성합니다.
    Gemini API를 활용하여 ERP 데이터를 기반으로 응답합니다.
    
    Args:
        query: 사용자 질문 문자열
        
    Returns:
        tuple: (메뉴경로 리스트, 응답 데이터 디셔너리)
    """
    print(f"\n[DEBUG] analyze_query 시작: '{query}'")

    # 질문 전처리 (로그 및 경미한 정규화만 수행)
    original_query = query  # 원본 질문 보존
    preprocessed = preprocess_query(query)
    print(f"\n원본 질문: {original_query}")
    print(f"전처리된 질문: {preprocessed}\n")
    
    # 1) 모든 질문을 우선 Gemini로 전달 (질문 분석 포함)
    try:
        print("Gemini API로 질문 전달 (질문 분석은 Gemini가 수행)\n")
        # 원본 질문과 전처리된 질문 모두 전달해 이해를 돕는다
        enriched_query = f"{original_query} (preprocessed: {preprocessed})"
        return await process_query_with_gemini(enriched_query)
    except Exception as e:
        print(f"Gemini API 오류: {e}")
        print("기본 분석 로직으로 폴백합니다.\n")
        # Gemini 오류 시에만 로컬 규칙 기반으로 처리
    
    # 2) 폴백: 로컬 의도 분석 및 규칙 기반 응답
    query_lower = preprocessed.lower()
    
    # 특정 패턴 직접 처리 (새 주문 생성하는 방법 알려줘)
    contains_pattern1 = "새 주문 생성하는 방법" in query
    contains_pattern2 = "새 주문 생성 방법" in query
    print(f"[DEBUG] 패턴 매칭 검사: '새 주문 생성하는 방법' 포함여부 = {contains_pattern1}")
    print(f"[DEBUG] 패턴 매칭 검사: '새 주문 생성 방법' 포함여부 = {contains_pattern2}")
    
    if "새 주문 생성하는 방법" in query or "새 주문 생성 방법" in query:
        print(f"[직접 처리] '새 주문 생성하는 방법' 패턴 감지\n")
        result = handle_create_order_query()
        print(f"[DEBUG] handle_create_order_query 결과: {result}")
        return result
    
    intent = analyze_intent(query_lower)
    print(f"[FALLBACK] 의도 분석 결과: {intent}\n")
    if intent.get("add_customer", 0) > 0.7:
        return handle_add_customer_query()
    elif intent.get("create_order", 0) > 0.7:
        return handle_create_order_query()
    
    # 기본 분석 로직 (기존 코드)
    
    # 영업/고객 관련 질문
    if any(keyword in query for keyword in ["고객", "영업", "판매", "crm", "파이프라인", "영업 관리"]):
        if "추가" in query or "등록" in query or "신규" in query:
            return ["sales-customer", "customers"], {
                "title": "고객 추가 방법",
                "steps": [
                    "영업/고객 메뉴에서 고객 관리를 선택합니다.",
                    "고객 관리 페이지에서 '새 고객 추가' 버튼을 클릭합니다.",
                    "고객 정보 양식을 작성합니다.",
                    "'저장' 버튼을 클릭하여 새 고객을 등록합니다."
                ],
                "tips": [
                    "필수 입력 항목: 고객명, 연락처, 주소",
                    "고객 분류를 설정하면 나중에 필터링이 용이합니다.",
                    "담당자를 지정하면 알림이 자동으로 전송됩니다."
                ]
            }
        return ["sales-customer", "crm-pipeline"], {
            "title": "CRM 파이프라인 사용 방법",
            "steps": [
                "영업/고객 메뉴에서 CRM 파이프라인을 선택합니다.",
                "고객별 영업 단계를 확인할 수 있습니다.",
                "고객 카드를 드래그하여 영업 단계를 변경할 수 있습니다."
            ],
            "tips": [
                "고객 카드를 클릭하면 상세 정보를 확인할 수 있습니다.",
                "필터를 사용하여 특정 담당자나 단계의 고객만 볼 수 있습니다."
            ]
        }
    
    # 생산/MRP 관련 질문
    elif any(keyword in query for keyword in ["생산", "작업", "mrp", "bom", "생산 계획"]):
        return ["production-mrp", "production-orders"], {
            "title": "생산 오더 관리 방법",
            "steps": [
                "생산/MRP 메뉴에서 생산 오더를 선택합니다.",
                "현재 진행 중인 생산 오더와 계획된 오더를 확인할 수 있습니다.",
                "새 생산 오더를 등록하거나 기존 오더의 상태를 변경할 수 있습니다."
            ],
            "tips": [
                "생산 오더는 판매 주문과 연결하여 생성할 수 있습니다.",
                "자재 가용성을 확인하여 생산 계획을 수립하세요.",
                "작업 지시서는 생산 오더에서 자동 생성됩니다."
            ]
        }
    
    # 재고/구매 관련 질문
    elif any(keyword in query for keyword in ["재고", "구매", "발주", "입고", "공급", "재고 관리"]):
        return ["inventory-purchase", "inventory"], {
            "title": "재고 관리 방법",
            "steps": [
                "재고/구매 메뉴에서 재고 관리를 선택합니다.",
                "품목별 현재고와 안전재고를 확인할 수 있습니다.",
                "재고 이력을 조회하거나 재고 실사를 진행할 수 있습니다."
            ],
            "tips": [
                "안전재고 미달 품목은 빨간색으로 표시됩니다.",
                "LOT 추적이 필요한 품목은 LOT 번호로 관리됩니다.",
                "재고 이동은 출고 및 입고 기록을 남깁니다."
            ]
        }
    
    # 인사/급여 관련 질문
    elif any(keyword in query for keyword in ["인사", "급여", "직원", "근태", "인건비"]):
        return ["hr-payroll", "payroll"], {
            "title": "급여 관리 방법",
            "steps": [
                "인사/급여 메뉴에서 급여 관리를 선택합니다.",
                "직원별 급여 내역을 확인할 수 있습니다.",
                "급여 계산 및 지급 처리를 할 수 있습니다."
            ],
            "tips": [
                "근태 기록은 급여 계산에 자동으로 반영됩니다.",
                "급여 명세서는 PDF로 출력하거나 이메일로 전송할 수 있습니다.",
                "급여 지급 후 회계 전표가 자동 생성됩니다."
            ]
        }
    
    # 물류/출하 관련 질문
    elif any(keyword in query for keyword in ["물류", "출하", "배송", "납품", "운송"]):
        return ["logistics-shipping", "shipping"], {
            "title": "출하 관리 방법",
            "steps": [
                "물류/출하 메뉴에서 출하 관리를 선택합니다.",
                "출하 예정 및 완료된 출하 내역을 확인할 수 있습니다.",
                "새 출하를 등록하거나 출하 상태를 변경할 수 있습니다."
            ],
            "tips": [
                "출하는 판매 주문과 연결하여 생성할 수 있습니다.",
                "출하 시 LOT 번호를 지정하면 추적성이 유지됩니다.",
                "출하 완료 시 재고가 자동으로 감소합니다."
            ]
        }
    
    # 재무/회계 관련 질문
    elif any(keyword in query for keyword in ["재무", "회계", "예산", "세금", "전표"]):
        return ["finance-accounting", "accounting"], {
            "title": "회계 관리 방법",
            "steps": [
                "재무/회계 메뉴에서 회계 관리를 선택합니다.",
                "전표 내역을 확인하고 새 전표를 등록할 수 있습니다.",
                "재무제표를 조회하고 출력할 수 있습니다."
            ],
            "tips": [
                "판매, 구매, 급여 등의 거래는 자동으로 전표가 생성됩니다.",
                "기간별 재무 상태를 분석할 수 있습니다.",
                "세금 신고 자료를 자동으로 생성할 수 있습니다."
            ]
        }
    
    # 보고서/분석 관련 질문
    elif any(keyword in query for keyword in ["보고서", "분석", "대시보드", "통계", "리포트"]):
        return ["reports-analytics", "dashboard"], {
            "title": "대시보드 사용 방법",
            "steps": [
                "보고서/분석 메뉴에서 대시보드를 선택합니다.",
                "주요 지표와 그래프를 확인할 수 있습니다.",
                "기간 및 부서별로 필터링하여 데이터를 분석할 수 있습니다."
            ],
            "tips": [
                "대시보드는 실시간으로 업데이트됩니다.",
                "그래프를 클릭하면 상세 데이터를 확인할 수 있습니다.",
                "보고서는 PDF나 Excel로 내보낼 수 있습니다."
            ]
        }
    
    # 시간 관련 질문 감지
    time_patterns = [r'\d{1,2}[\uc2dc:]\d{0,2}', r'\uc624\uc804', r'\uc624\ud6c4', r'\ud604\uc7ac\s*\uc2dc\uac04', r'\uc9c0\uae08\s*\uc2dc\uac04']
    if any(re.search(pattern, query_lower) for pattern in time_patterns):
        current_time = datetime.now().strftime("%Y년 %m월 %d일 %H시 %M분")
        return ["reports-analytics", "dashboard"], {
            "title": "현재 시간 안내",
            "content": f"현재 시간은 {current_time}입니다. ERP 시스템에 대해 궁금하신 점이 있으시면 말씀해주세요.",
            "tips": [
                "ERP 시스템 현황을 확인하려면 'ERP 시스템 현황 보여줘'라고 질문해보세요.",
                "특정 제품의 재고를 확인하려면 '[제품명] 재고 현황은?'이라고 질문해보세요."
            ]
        }
    
    # 기본 응답
    return ["reports-analytics", "dashboard"], {
        "title": "ERP 시스템 도움말",
        "content": "어떤 ERP 정보가 필요하신가요? 다음과 같은 질문을 해보세요:\n\n- ERP 시스템 현황 보여줘\n- 시트 레일 재고 현황은?\n- 현대자동차 수주 현황 알려줘\n- 이번 달 생산 계획은?",
        "steps": [
            "원하시는 기능이나 메뉴에 대해 구체적으로 질문해 주세요.",
            "예: '고객 추가 방법 알려줘', '재고 관리는 어떻게 하나요?'"
        ],
        "tips": [
            "메뉴 이름이나 기능을 구체적으로 언급하시면 더 정확한 도움을 드릴 수 있습니다.",
            "특정 제품이나 고객사에 대한 정보를 찾으시려면 이름을 정확히 언급해주세요."
        ]
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
