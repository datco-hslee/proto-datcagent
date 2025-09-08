import React from "react";
import { DollarSign, Users, ShoppingCart, Package, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { ExcelDataManager } from "@/components/dashboard/ExcelDataManager";

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">통합 대시보드</h1>
          <p className="text-gray-500">제조업무해결사 주식회사의 실시간 경영 현황을 확인하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            실시간 연결됨
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="이번 달 매출"
          value="₩247,500,000"
          change={{ value: 12.5, type: "increase" }}
          trend="up"
          icon={DollarSign}
          description="목표 대비 103%"
        />
        <MetricsCard title="신규 고객" value="23" change={{ value: 8.2, type: "increase" }} trend="up" icon={Users} description="이번 달 신규 가입" />
        <MetricsCard
          title="진행 중인 주문"
          value="156"
          change={{ value: -2.1, type: "decrease" }}
          trend="down"
          icon={ShoppingCart}
          description="처리 대기 중"
        />
        <MetricsCard
          title="재고 회전율"
          value="2.4회"
          change={{ value: 0.8, type: "increase" }}
          trend="up"
          icon={Package}
          description="월평균 기준"
        />
      </div>


      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 오늘의 할 일 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              오늘의 할 일
            </CardTitle>
            <CardDescription>우선순위가 높은 업무들을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">긴급 견적서 승인</p>
                  <p className="text-xs text-gray-500">A전자 프로젝트</p>
                </div>
              </div>
              <Badge variant="destructive">긴급</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">생산 일정 검토</p>
                  <p className="text-xs text-gray-500">3개 제품 라인</p>
                </div>
              </div>
              <Badge variant="outline">오늘</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">월간 실적 분석</p>
                  <p className="text-xs text-gray-500">경영진 보고용</p>
                </div>
              </div>
              <Badge variant="secondary">예정</Badge>
            </div>

            <Button className="w-full mt-4" variant="outline">
              더 많은 작업 보기
            </Button>
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>시스템에서 발생한 최근 활동들을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">새로운 주문이 접수되었습니다</p>
                  <p className="text-xs text-gray-500">B테크 - PCA-2024-001, 5분 전</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  신규
                </Badge>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">생산 계획이 업데이트되었습니다</p>
                  <p className="text-xs text-gray-500">PCB 모듈 생산 라인, 15분 전</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  업데이트
                </Badge>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">재고 알림: 안전 재고 이하</p>
                  <p className="text-xs text-gray-500">IC-4701 (12개 남음), 1시간 전</p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  주의
                </Badge>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">견적서가 승인되었습니다</p>
                  <p className="text-xs text-gray-500">C산업 - QT-2024-0891, 2시간 전</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  승인
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 부서별 현황 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>부서별 현황</CardTitle>
            <CardDescription>각 부서의 주요 지표</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>영업팀</span>
                <span className="font-medium">목표 달성률 103%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "103%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>생산팀</span>
                <span className="font-medium">가동률 89%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "89%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>구매팀</span>
                <span className="font-medium">납기 준수율 95%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>품질팀</span>
                <span className="font-medium">불량률 0.8%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 월간 매출 트렌드 (간단한 표시) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>월간 매출 트렌드</CardTitle>
            <CardDescription>최근 6개월 매출 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-2">
              {[180, 220, 195, 240, 265, 247].map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="bg-blue-100 rounded-t w-full transition-all duration-300 hover:bg-blue-200"
                    style={{ height: `${(value / 300) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-500">{["1월", "2월", "3월", "4월", "5월", "6월"][index]}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                상세 분석 보기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
