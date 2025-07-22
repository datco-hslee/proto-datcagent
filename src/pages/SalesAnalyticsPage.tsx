import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SalesMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  period: string;
}

interface ChartData {
  month: string;
  revenue: number;
  target: number;
  leads: number;
  conversion: number;
}

interface SalesPersonPerformance {
  id: string;
  name: string;
  revenue: number;
  target: number;
  leads: number;
  deals: number;
  conversionRate: number;
  rank: number;
}

// 가상 데이터
const SALES_METRICS: SalesMetric[] = [
  {
    label: "월간 매출",
    value: "₩247,500,000",
    change: 12.5,
    trend: "up",
    period: "vs 지난달",
  },
  {
    label: "신규 리드",
    value: "156",
    change: 8.2,
    trend: "up",
    period: "vs 지난달",
  },
  {
    label: "전환율",
    value: "23.4%",
    change: -2.1,
    trend: "down",
    period: "vs 지난달",
  },
  {
    label: "평균 거래액",
    value: "₩18,500,000",
    change: 0.0,
    trend: "neutral",
    period: "vs 지난달",
  },
];

const MONTHLY_DATA: ChartData[] = [
  { month: "1월", revenue: 180000000, target: 200000000, leads: 120, conversion: 22.5 },
  { month: "2월", revenue: 220000000, target: 200000000, leads: 140, conversion: 24.1 },
  { month: "3월", revenue: 195000000, target: 210000000, leads: 135, conversion: 21.8 },
  { month: "4월", revenue: 240000000, target: 220000000, leads: 150, conversion: 25.3 },
  { month: "5월", revenue: 265000000, target: 230000000, leads: 160, conversion: 26.8 },
  { month: "6월", revenue: 247500000, target: 240000000, leads: 156, conversion: 23.4 },
];

const SALES_PERFORMANCE: SalesPersonPerformance[] = [
  {
    id: "sp-1",
    name: "이영업",
    revenue: 89500000,
    target: 80000000,
    leads: 45,
    deals: 12,
    conversionRate: 26.7,
    rank: 1,
  },
  {
    id: "sp-2",
    name: "최세일즈",
    revenue: 72300000,
    target: 70000000,
    leads: 38,
    deals: 9,
    conversionRate: 23.7,
    rank: 2,
  },
  {
    id: "sp-3",
    name: "장고객",
    revenue: 65200000,
    target: 65000000,
    leads: 42,
    deals: 8,
    conversionRate: 19.0,
    rank: 3,
  },
];

export function SalesAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedView, setSelectedView] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "down":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case "neutral":
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "neutral":
        return "text-gray-400";
    }
  };

  const getMaxRevenue = () => Math.max(...MONTHLY_DATA.map((d) => Math.max(d.revenue, d.target)));

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">영업 분석</h1>
          <p className="text-gray-500">영업 성과와 트렌드를 분석하고 인사이트를 확인하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 기간 선택 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">기간:</span>
        {[
          { value: "1month", label: "1개월" },
          { value: "3months", label: "3개월" },
          { value: "6months", label: "6개월" },
          { value: "1year", label: "1년" },
        ].map((period) => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period.value)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SALES_METRICS.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className={`text-xs flex items-center mt-1 ${getTrendColor(metric.trend)}`}>
                {metric.change !== 0 && (
                  <>
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}%<span className="text-gray-500 ml-1">{metric.period}</span>
                  </>
                )}
                {metric.change === 0 && <span className="text-gray-500">변화 없음</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 매출 트렌드 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              월별 매출 vs 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-end justify-between gap-2">
              {MONTHLY_DATA.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex flex-col gap-1 w-full">
                    {/* 목표 바 */}
                    <div
                      className="bg-gray-200 rounded-t w-full transition-all duration-300"
                      style={{
                        height: `${(data.target / getMaxRevenue()) * 200}px`,
                        minHeight: "20px",
                      }}
                      title={`목표: ${formatCurrency(data.target)}`}
                    />
                    {/* 매출 바 */}
                    <div
                      className={`rounded-b w-full transition-all duration-300 ${data.revenue >= data.target ? "bg-green-500" : "bg-blue-500"}`}
                      style={{
                        height: `${(data.revenue / getMaxRevenue()) * 200}px`,
                        minHeight: "20px",
                      }}
                      title={`매출: ${formatCurrency(data.revenue)}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>실제 매출</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>목표</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>목표 달성</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 리드 및 전환율 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              월별 리드 & 전환율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-end justify-between gap-2">
              {MONTHLY_DATA.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex flex-col gap-1 w-full items-center">
                    {/* 리드 수 바 */}
                    <div
                      className="bg-orange-400 rounded w-full transition-all duration-300"
                      style={{
                        height: `${(data.leads / 200) * 150}px`,
                        minHeight: "10px",
                      }}
                      title={`리드: ${data.leads}개`}
                    />
                    {/* 전환율 표시 */}
                    <div className="text-xs font-semibold text-purple-600 mt-1">{data.conversion}%</div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>리드 수</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded"></div>
                <span>전환율 (%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 영업팀 성과 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            영업팀 개인 성과
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SALES_PERFORMANCE.map((person) => (
              <div key={person.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">{person.rank}</div>
                  <div>
                    <h3 className="font-semibold">{person.name}</h3>
                    <p className="text-sm text-gray-500">
                      {person.deals}건 성사 • 전환율 {person.conversionRate}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">매출</p>
                    <p className="font-semibold">{formatCurrency(person.revenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">목표 달성률</p>
                    <p className={`font-semibold ${person.revenue >= person.target ? "text-green-600" : "text-orange-600"}`}>
                      {Math.round((person.revenue / person.target) * 100)}%
                    </p>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${person.revenue >= person.target ? "bg-green-500" : "bg-blue-500"}`}
                      style={{
                        width: `${Math.min((person.revenue / person.target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <Badge variant={person.revenue >= person.target ? "default" : "secondary"}>{person.leads} 리드</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 인사이트 및 제안 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              긍정적 인사이트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800">월간 목표 초과 달성</h4>
                <p className="text-sm text-green-700">이번 달 매출이 목표 대비 103% 달성하여 ₩7,500,000 초과 실적을 기록했습니다.</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800">리드 증가 추세</h4>
                <p className="text-sm text-blue-700">신규 리드가 지난달 대비 8.2% 증가하여 영업 파이프라인이 건강하게 성장하고 있습니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              개선 제안
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800">전환율 개선 필요</h4>
                <p className="text-sm text-orange-700">
                  전환율이 23.4%로 지난달 대비 2.1% 감소했습니다. 리드 품질 개선이나 후속 관리 강화를 권장합니다.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800">영업팀 교육 제안</h4>
                <p className="text-sm text-yellow-700">
                  개별 성과 편차가 큽니다. 상위 성과자의 베스트 프랙티스를 팀 전체에 공유하는 것을 권장합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
