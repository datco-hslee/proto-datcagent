import os
import json
import google.generativeai as genai
from typing import Dict, List, Any, Optional, Union

# Gemini API 설정
GEMINI_API_KEY = "AIzaSyAmMVWSAWlaDHr8JEeeysjCVPP1QHtQxls"
genai.configure(api_key=GEMINI_API_KEY)

# 모델 설정
model = genai.GenerativeModel('gemini-1.5-pro')

# ERP 데이터 소스 경로
ERP_DATA_PATHS = {
    "datco_demo": "../DatcoDemoData.json",
    "datco_demo2": "../DatcoDemoData2.json",
    "complete_erp": "../complete_erp_data.json"
}

# 디버그 모드 - 실제 Gemini API 호출을 위해 False로 설정
DEBUG_MODE = False

def load_erp_data(data_source: str = "all") -> Dict[str, Any]:
    """
    ERP 데이터를 로드하는 함수
    
    Args:
        data_source: 데이터 소스 ("datco_demo", "datco_demo2", "complete_erp" 또는 "all")
        
    Returns:
        Dict: 로드된 ERP 데이터
    """
    result = {}
    
    # 디버그 모드일 경우 더미 데이터 사용
    if DEBUG_MODE:
        if DEBUG_MODE:
            print("DEBUG MODE: Using sample ERP data instead of loading from files")
            # 더미 데이터 생성
            return {
                "sample_data": {
                    "sheets": {
                        "근태": [
                            {"id": "ATT001", "사번": "EMP001", "이름": "김생산", "출근시간": "09:00", "퇴근시간": "18:00", "상태": "정상"},
                            {"id": "ATT002", "사번": "EMP002", "이름": "이제조", "출근시간": "08:30", "퇴근시간": "17:30", "상태": "정상"},
                            {"id": "ATT003", "사번": "EMP003", "이름": "박품질", "출근시간": "09:15", "퇴근시간": "18:30", "상태": "지각"}
                        ],
                        "급여": [
                            {"id": "PAY001", "사번": "EMP001", "이름": "김생산", "기본급": 3500000, "수당": 500000, "공제": 350000, "총지급액": 3650000},
                            {"id": "PAY002", "사번": "EMP002", "이름": "이제조", "기본급": 3000000, "수당": 300000, "공제": 300000, "총지급액": 3000000},
                            {"id": "PAY003", "사번": "EMP003", "이름": "박품질", "기본급": 4000000, "수당": 600000, "공제": 400000, "총지급액": 4200000}
                        ],
                        "생산계획": [
                            {"id": "PP001", "품목코드": "ITEM001", "품목명": "시트 레일", "계획수량": 1800, "계획일자": "2025-09-10"},
                            {"id": "PP002", "품목코드": "ITEM002", "품목명": "시트 프레임", "계획수량": 1200, "계획일자": "2025-09-15"}
                        ]
                    }
                }
            }
    
    # 실제 파일에서 데이터 로드 시도
    try:
        if data_source == "all":
            # 모든 데이터 소스 로드
            for source_name, path in ERP_DATA_PATHS.items():
                try:
                    full_path = os.path.join(os.path.dirname(__file__), path)
                    print(f"Attempting to load {source_name} from {full_path}")
                    if os.path.exists(full_path):
                        with open(full_path, 'r', encoding='utf-8') as f:
                            result[source_name] = json.load(f)
                            print(f"Successfully loaded {source_name}")
                    else:
                        print(f"File not found: {full_path}")
                except Exception as e:
                    print(f"Error loading {source_name}: {e}")
        else:
            # 특정 데이터 소스만 로드
            if data_source in ERP_DATA_PATHS:
                try:
                    full_path = os.path.join(os.path.dirname(__file__), ERP_DATA_PATHS[data_source])
                    print(f"Attempting to load {data_source} from {full_path}")
                    if os.path.exists(full_path):
                        with open(full_path, 'r', encoding='utf-8') as f:
                            result[data_source] = json.load(f)
                            print(f"Successfully loaded {data_source}")
                    else:
                        print(f"File not found: {full_path}")
                except Exception as e:
                    print(f"Error loading {data_source}: {e}")
    except Exception as e:
        print(f"Unexpected error in load_erp_data: {e}")
    
    # 데이터가 비어있으면 더미 데이터 사용
    if not result:
        print("No data loaded, using sample data instead")
        result = {
            "sample_data": {
                "sheets": {
                    "근태": [
                        {"id": "ATT001", "사번": "EMP001", "이름": "김생산", "출근시간": "09:00", "퇴근시간": "18:00", "상태": "정상"}
                    ]
                }
            }
        }
    
    return result

def get_system_prompt() -> str:
    """
    Gemini API에 전달할 시스템 프롬프트를 반환하는 함수
    
    Returns:
        str: 시스템 프롬프트
    """
    return """
    당신은 닫코(DATCO)의 ERP 시스템 AI 어시스턴트인 '단비'입니다. 
    사용자의 질문에 대해 ERP 데이터를 분석하고 정확한 답변을 제공해야 합니다.
    
    ## 데이터 소스
    다음 데이터 소스를 활용할 수 있습니다:
    1. 닫코 시연 데이터 (DatcoDemoData2.json) - 주요 ERP 모듈 22개 포함
    2. 대량 ERP 데이터 (complete_erp_data.json) - 3-6개월치 시계열 데이터
    3. 생성된 샘플 데이터 (시스템에 내장된 샘플 데이터)
    
    ## 주요 ERP 모듈
    다음 모듈에 대한 질문에 응답할 수 있어야 합니다:
    - 인사/급여: 직원 관리, 근태 관리, 급여 관리, 인건비 분석
    - 생산/MRP: 생산 오더, 작업 지시, BOM 관리
    - 재고/구매: 재고 관리, 구매 발주, 공급업체 관리
    - 영업/고객: CRM 파이프라인, 판매 주문, 고객 관리
    - 물류/출하: 출하 관리, 배송 관리
    - 재무/회계: 회계 관리, 예산 관리, 세금 관리
    - 보고서/분석: 보고서, 분석, 대시보드
    
    ## 특별 분석 기능
    다음 특별 분석 기능을 제공할 수 있어야 합니다:
    1. 인건비 분석: 부서별/전체 인건비 분석, 기본급/연장근무수당/총액 계산
    2. 재고 회전율 분석: 입고량/소모량/잔여재고 기반 회전율 계산
    3. LOT 추적: 입고-생산-재고-납품 흐름 추적
    4. 생산성 분석: 작업자별/라인별 생산성 분석
    5. 재고 부족 분석: 생산계획 대비 필요 부품 수량 계산
    
    ## 데이터 연관성
    다음 데이터 연관성을 이해하고 활용해야 합니다:
    - 고객사(거래처마스터) → 수주 → 생산계획 → 작업지시 → 출하
    - 부품(BOM) → 재고 → 구매발주 → 입고
    - 인원마스터 → 근태 → 급여 → 회계(전표)
    
    ## 답변 가이드라인
    답변 시 다음 사항을 준수하세요:
    - 데이터에 근거한 정확한 정보만 제공하세요.
    - 데이터 출처를 명시하세요 (예: "닫코 시연 데이터에 따르면...")
    - 한국어로 답변하세요.
    - 수치 데이터는 표 형식으로 정리해서 보여주세요.
    - 통화 단위는 한국원(₩)으로 표시하고 콤마(,)로 자릿수 구분하세요.
    - 데이터가 없는 질문에는 정직하게 "해당 데이터를 찾을 수 없습니다"라고 답변하세요.
    - 인건비 분석 질문에는 급여관리 페이지의 데이터를 기반으로 응답하세요.
    - 질문에 부서명이 언급되면 해당 부서만의 데이터를 분석하여 응답하세요.
    """

def extract_relevant_data(query: str, erp_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    질문과 관련된 ERP 데이터를 추출하는 함수
    
    Args:
        query: 사용자 질문
        erp_data: 전체 ERP 데이터
        
    Returns:
        Dict: 관련 ERP 데이터
    """
    # 질문 키워드에 따라 관련 데이터 추출
    keywords = {
        "근태": ["근태", "출퇴근", "휴가", "출근", "퇴근", "지각", "연차"],
        "급여": ["급여", "월급", "연봉", "임금", "수당", "인건비", "노무비"],
        "생산": ["생산", "제조", "작업", "공정", "조립", "MRP", "작업지시"],
        "재고": ["재고", "창고", "보관", "물품", "자재", "입고", "출고"],
        "판매": ["판매", "영업", "매출", "주문", "고객", "CRM", "수주"],
        "구매": ["구매", "발주", "매입", "공급", "조달", "공급업체"],
        "회계": ["회계", "재무", "자금", "예산", "결산", "세금", "전표"],
        "BOM": ["BOM", "자재명세서", "부품표", "자재구성", "제품구성"],
        "출하": ["출하", "배송", "배송추적", "배송상태", "배송일정"],
        "인사": ["인사", "직원", "사원", "인원", "인원관리"]
    }
    
    # 질문에서 관련 모듈 찾기
    relevant_modules = []
    query_lower = query.lower()
    
    for module, terms in keywords.items():
        if any(term in query_lower for term in terms):
            relevant_modules.append(module)
    
    # 관련 모듈이 없으면 기본 모듈 추가 (인건비 분석 등 특정 케이스 처리)
    if not relevant_modules and ("인건비" in query_lower or "급여" in query_lower):
        relevant_modules = ["급여", "인사"]
    
    # 관련 데이터 추출
    relevant_data = {}
    
    # 모든 데이터 소스에서 관련 모듈 데이터 추출
    for source_name, source_data in erp_data.items():
        relevant_data[source_name] = {}
        
        # JSON 구조에 따라 데이터 추출 로직 구현
        if isinstance(source_data, dict) and "sheets" in source_data:
            sheets = source_data["sheets"]
            
            # 관련 모듈에 해당하는 시트 추출
            for module in relevant_modules:
                if module == "근태":
                    for sheet_name in ["근태", "출퇴근", "휴가", "인원마스터"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
                
                elif module == "급여":
                    for sheet_name in ["급여", "인사급여", "임금", "인원마스터"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
                
                elif module == "생산":
                    for sheet_name in ["생산계획", "작업지시", "생산실적", "BOM", "품목마스터"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
                
                elif module == "재고":
                    for sheet_name in ["재고", "품목마스터", "창고", "재고배치"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
                
                elif module == "판매":
                    for sheet_name in ["수주", "거래처마스터", "출하", "품목마스터"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
                
                elif module == "구매":
                    for sheet_name in ["구매발주", "입고", "공급업체", "거래처마스터"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
                
                elif module == "회계":
                    for sheet_name in ["회계", "AR_AP", "예산", "회계(전표)"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
                            
                elif module == "BOM":
                    for sheet_name in ["BOM", "품목마스터", "자재구성"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
                            
                elif module == "출하":
                    for sheet_name in ["출하", "배송", "거래처마스터", "품목마스터"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
                            
                elif module == "인사":
                    for sheet_name in ["인원마스터", "근태", "급여"]:
                        if sheet_name in sheets:
                            relevant_data[source_name][sheet_name] = sheets[sheet_name]
    
    # 인건비 분석 관련 케이스인 경우 특별 처리
    if "인건비" in query_lower or "급여 분석" in query_lower:
        # 인원마스터 데이터 추가 확인
        for source_name, source_data in erp_data.items():
            if isinstance(source_data, dict) and "sheets" in source_data:
                sheets = source_data["sheets"]
                if "인원마스터" in sheets:
                    if source_name not in relevant_data:
                        relevant_data[source_name] = {}
                    relevant_data[source_name]["인원마스터"] = sheets["인원마스터"]
    
    return relevant_data

async def process_query_with_gemini(query: str) -> tuple[List[str], Dict[str, Any]]:
    """
    Gemini API를 사용하여 사용자 질문을 처리하는 함수
    
    Args:
        query: 사용자 질문
        
    Returns:
        tuple: (메뉴 경로, 응답 데이터)
    """
    try:
        print(f"Processing query with Gemini: {query}")
        
        # ERP 데이터 로드
        erp_data = load_erp_data("all")
        
        # 관련 데이터 추출
        relevant_data = extract_relevant_data(query, erp_data)
        
        # 시스템 프롬프트 가져오기
        system_prompt = get_system_prompt()
        
        # 사용자 질문과 관련 데이터로 프롬프트 구성
        user_prompt = f"""
        사용자 질문: {query}
        
        관련 ERP 데이터:
        {json.dumps(relevant_data, ensure_ascii=False, indent=2)}
        
        위 데이터를 기반으로 사용자 질문에 답변해주세요.
        """
        
        print("Calling Gemini API...")
        
        # 디버그 모드일 경우 API 호출 스킵
        if DEBUG_MODE:
            print("DEBUG MODE: Skipping actual Gemini API call, using mock response")
            response_text = f"""
            ### ERP 데이터 분석 결과
            
            질문: {query}
            
            답변:
            샘플 데이터에 따르면, 이번 달 근태 현황은 다음과 같습니다:
            
            1. 김생산 사원: 정상 출근 (09:00~18:00)
            2. 이제조 사원: 정상 출근 (08:30~17:30)
            3. 박품질 사원: 지각 출근 (09:15~18:30)
            
            전체 지각율은 33.3%이며, 평균 근무시간은 8시간 45분입니다.
            """
        else:
            try:
                # Gemini API 호출
                response = await model.generate_content_async(
                    [system_prompt, user_prompt],
                    generation_config={
                        "temperature": 0.2,
                        "top_p": 0.8,
                        "top_k": 40,
                        "max_output_tokens": 2048,
                    }
                )
                
                # 응답 텍스트 추출
                response_text = response.text
                print(f"Received response from Gemini API: {response_text[:100]}...")
            except Exception as e:
                print(f"Error calling Gemini API: {e}")
                response_text = f"""
                죄송합니다. Gemini API 호출 중 오류가 발생했습니다: {str(e)}
                
                질문에 대한 답변을 생성할 수 없습니다. 다시 시도해주세요.
                """
        
        # 메뉴 경로 추론
        menu_path = infer_menu_path(query)
        
        # 응답 데이터 구성
        response_data = {
            "title": "ERP 데이터 분석 결과",
            "content": response_text,
            "data_sources": list(relevant_data.keys()),
            "timestamp": datetime.now().isoformat()
        }
        
        return menu_path, response_data
        
    except Exception as e:
        print(f"Unexpected error in process_query_with_gemini: {e}")
        # 오류 발생 시 기본 응답 반환
        error_response = {
            "title": "오류 발생",
            "content": f"""죄송합니다. 질문 처리 중 오류가 발생했습니다: {str(e)}
            
            다시 시도해주세요.""",
            "data_sources": [],
            "timestamp": datetime.now().isoformat()
        }
        
        return ["reports-analytics", "dashboard"], error_response

def infer_menu_path(query: str) -> List[str]:
    """
    사용자 질문에서 관련 메뉴 경로를 추론하는 함수
    
    Args:
        query: 사용자 질문
        
    Returns:
        List[str]: 메뉴 경로 리스트
    """
    # 질문 키워드에 따른 메뉴 경로 매핑
    menu_mappings = {
        "근태": ["hr-payroll", "attendance"],
        "급여": ["hr-payroll", "payroll"],
        "인사": ["hr-payroll", "employees"],
        "생산": ["production-mrp", "production-orders"],
        "작업": ["production-mrp", "work-instructions"],
        "BOM": ["production-mrp", "bom"],
        "재고": ["inventory-purchase", "inventory"],
        "구매": ["inventory-purchase", "purchase-orders"],
        "공급": ["inventory-purchase", "suppliers"],
        "판매": ["sales-customer", "sales-orders"],
        "고객": ["sales-customer", "customers"],
        "CRM": ["sales-customer", "crm-pipeline"],
        "출하": ["logistics-shipping", "shipping"],
        "배송": ["logistics-shipping", "delivery"],
        "회계": ["finance-accounting", "accounting"],
        "예산": ["finance-accounting", "budget"],
        "세금": ["finance-accounting", "tax"],
        "보고서": ["reports-analytics", "reports"],
        "분석": ["reports-analytics", "analytics"],
        "대시보드": ["reports-analytics", "dashboard"]
    }
    
    # 질문에서 관련 메뉴 찾기
    query_lower = query.lower()
    
    for keyword, path in menu_mappings.items():
        if keyword in query_lower:
            return path
    
    # 기본 경로
    return ["reports-analytics", "dashboard"]
