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

# 메뉴 트리 구조 생성 함수
def generate_menu_tree() -> Dict[str, Dict[str, Union[str, List[Dict[str, str]]]]]:
    """
    메뉴 트리 구조를 동적으로 생성하는 함수
    
    Returns:
        Dict[str, Dict[str, Union[str, List[Dict[str, str]]]]]: 메뉴 트리 구조를 담은 딕셔너리
    """
    # 메뉴 카테고리 정의
    categories = {
        "sales-customer": "영업/고객",
        "production-mrp": "생산/MRP",
        "inventory-purchase": "재고/구매",
        "hr-payroll": "인사/급여",
        "logistics-shipping": "물류/출하",
        "finance-accounting": "재무/회계",
        "reports-analytics": "보고서/분석"
    }
    
    # 메뉴 항목 정의
    menu_items: Dict[str, List[Dict[str, str]]] = {
        "sales-customer": [
            {"id": "crm-pipeline", "name": "CRM 파이프라인", "path": "/crm-pipeline"},
            {"id": "sales-orders", "name": "판매 주문", "path": "/sales-orders"},
            {"id": "customers", "name": "고객 관리", "path": "/customers"}
        ],
        "production-mrp": [
            {"id": "production-orders", "name": "생산 오더", "path": "/production-orders"},
            {"id": "work-instructions", "name": "작업 지시", "path": "/work-instructions"},
            {"id": "bom", "name": "BOM 관리", "path": "/bom"}
        ],
        "inventory-purchase": [
            {"id": "inventory", "name": "재고 관리", "path": "/inventory"},
            {"id": "purchase-orders", "name": "구매 발주", "path": "/purchase-orders"},
            {"id": "suppliers", "name": "공급업체", "path": "/suppliers"}
        ],
        "hr-payroll": [
            {"id": "employees", "name": "직원 관리", "path": "/employees"},
            {"id": "attendance", "name": "근태 관리", "path": "/attendance"},
            {"id": "payroll", "name": "급여 관리", "path": "/payroll"}
        ],
        "logistics-shipping": [
            {"id": "shipping", "name": "출하 관리", "path": "/shipping"},
            {"id": "delivery", "name": "배송 관리", "path": "/delivery"}
        ],
        "finance-accounting": [
            {"id": "accounting", "name": "회계 관리", "path": "/accounting"},
            {"id": "budget", "name": "예산 관리", "path": "/budget"},
            {"id": "tax", "name": "세금 관리", "path": "/tax"}
        ],
        "reports-analytics": [
            {"id": "reports", "name": "보고서", "path": "/reports"},
            {"id": "analytics", "name": "분석", "path": "/analytics"},
            {"id": "dashboard", "name": "대시보드", "path": "/dashboard"}
        ]
    }
    
    # 메뉴 트리 구조 생성
    menu_tree: Dict[str, Dict[str, Union[str, List[Dict[str, str]]]]] = {}
    for category_id, category_name in categories.items():
        menu_tree[category_id] = {
            "name": category_name,
            "children": menu_items.get(category_id, [])
        }
    
    return menu_tree

# 메뉴 트리 구조 생성
MENU_TREE = generate_menu_tree()

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

# 메뉴 트리 구조 API
@app.get("/api/menu-tree")
async def get_menu_tree():
    return MENU_TREE

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
    # ERP 데이터 관련 키워드 확인
    erp_keywords = [
        "근태", "출퇴근", "휴가", "급여", "생산", "재고", "판매", 
        "구매", "회계", "주문", "고객", "분석", "통계", "예산", "인사"
    ]
    
    # ERP 데이터 관련 질문인지 확인
    query_lower = query.lower()
    is_erp_query = any(keyword in query_lower for keyword in erp_keywords)
    
    if is_erp_query:
        # Gemini API를 활용하여 ERP 데이터 기반 응답 생성
        try:
            return await process_query_with_gemini(query)
        except Exception as e:
            print(f"Gemini API 오류: {e}")
            # 오류 발생 시 기본 분석 로직으로 돌아감
    
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
    
    # 기본 응답
    return [], {
        "title": "도움이 필요하신가요?",
        "steps": [
            "원하시는 기능이나 메뉴에 대해 질문해 주세요.",
            "예: '고객 추가 방법 알려줘', '재고 관리는 어떻게 하나요?'"
        ],
        "tips": [
            "메뉴 이름이나 기능을 구체적으로 언급하시면 더 정확한 도움을 드릴 수 있습니다.",
            "화면 상단의 검색 기능을 이용하셔도 됩니다."
        ]
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
