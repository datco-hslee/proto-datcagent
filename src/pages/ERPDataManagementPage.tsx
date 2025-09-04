import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { generateMassiveERPData } from '../data/massiveERPData';
import { generateDynamicERPData, enrichProductionOrdersWithCustomerData } from '../data/dynamicERPData';
import { 
  getDateRange, 
  generateCompanyProductTimeline, 
  generatePeriodStatistics,
  type DateRangeType 
} from '../data/timelineAnalysis';
import { useCustomers } from '../context/CustomerContext';

interface ERPDataStats {
  totalSalesOrders: number;
  totalPurchaseOrders: number;
  totalProductionOrders: number;
  totalShipments: number;
  totalRevenue: number;
  totalCosts: number;
  activeCustomers: number;
  activeSuppliers: number;
  inventoryValue: number;
  pendingOrders: number;
  completedOrders: number;
  onTimeDeliveryRate: number;
  averageLeadTime: number;
  qualityScore: number;
  productionEfficiency: number;
  insufficientMaterials: number;
}

interface BOMSufficiencyResult {
  purchaseOrderId: string;
  orderNumber: string;
  supplier: string;
  overallSufficiency: string;
  totalMaterials: number;
  sufficientMaterials: number;
  insufficientMaterials: number;
}

export function ERPDataManagementPage() {
  const { customers } = useCustomers();
  const [erpData, setErpData] = useState<any>(null);
  const [erpStats, setErpStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [bomAnalysis, setBomAnalysis] = useState<any>(null);
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    dateRange: 'all',
    company: 'all',
    product: 'all',
    status: 'all'
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeType>('this_week');
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [inventoryDateRange, setInventoryDateRange] = useState<DateRangeType>('this_month');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [showMaterialDetailModal, setShowMaterialDetailModal] = useState(false);

  const pageStyle: React.CSSProperties = {
    padding: '2rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    minHeight: '100vh',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: '1.1rem',
  };

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '1rem',
  };

  const tabButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabButtonStyle,
    background: '#3b82f6',
    color: 'white',
  };

  const cardGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  const statCardStyle: React.CSSProperties = {
    padding: '1.5rem',
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  };

  const statHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  };

  const statTitleStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
  };

  const loadTimelineDataWithCustomDates = () => {
    if (erpData.salesOrders && erpData.purchaseOrders && erpData.productionOrders && erpData.shipments) {
      let dateRange;
      
      if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
        dateRange = getDateRange('custom', new Date(customStartDate), new Date(customEndDate));
      } else {
        dateRange = getDateRange(selectedPeriod);
      }
      
      const companyTimelines = generateCompanyProductTimeline(
        erpData.salesOrders,
        erpData.purchaseOrders,
        erpData.productionOrders,
        erpData.shipments,
        dateRange
      );
      const statistics = generatePeriodStatistics(companyTimelines, dateRange);
      
      setTimelineData({
        dateRange,
        companyTimelines,
        statistics
      });
    }
  };

  // 날짜 범위가 변경될 때마다 타임라인 데이터 새로고침
  useEffect(() => {
    if (erpData.salesOrders && selectedPeriod !== 'custom') {
      loadTimelineDataWithCustomDates();
    }
  }, [selectedPeriod, erpData.salesOrders]);

  useEffect(() => {
    if (erpData.salesOrders && selectedPeriod === 'custom' && customStartDate && customEndDate) {
      loadTimelineDataWithCustomDates();
    }
  }, [customStartDate, customEndDate, erpData.salesOrders]);

  useEffect(() => {
    loadTimelineDataWithCustomDates();
    
    // 개발자 도구에서 ERP 데이터 접근을 위한 전역 함수 등록
    (window as any).getERPData = () => {
      console.log('📊 현재 로드된 ERP 데이터:', erpData);
      return erpData;
    };
    
    (window as any).searchProductionOrders = (productCode: string, month: number, day: number) => {
      if (!erpData.productionOrders) {
        console.log('❌ ERP 데이터가 로드되지 않았습니다. 먼저 "데이터 새로고침" 버튼을 클릭하세요.');
        return [];
      }
      
      const results = erpData.productionOrders
        .map((po: any, index: number) => ({ ...po, arrayIndex: index }))
        .filter((po: any) => po.productCode === productCode)
        .filter((po: any) => {
          const dates = [po.plannedStartDate, po.actualStartDate, po.plannedEndDate, po.actualEndDate];
          return dates.some((date: any) => {
            if (!date) return false;
            const d = new Date(date);
            return d.getMonth() === (month - 1) && d.getDate() === day; // month는 0부터 시작
          });
        });

      console.log(`🎯 결과: productionOrders 배열에서 ${month}월${day}일 ${productCode}는 ${results.length}개 발견`);
      results.forEach((result: any, idx: number) => {
        console.log(`${idx + 1}. productionOrders[${result.arrayIndex}] - ID: ${result.id}`);
        console.log(`   계획 시작일: ${result.plannedStartDate}`);
        console.log(`   실제 시작일: ${result.actualStartDate}`);
        console.log(`   계획 종료일: ${result.plannedEndDate}`);
        console.log(`   실제 종료일: ${result.actualEndDate}`);
      });
      
      return results;
    };
    
    (window as any).getInventoryData = () => {
      console.log('📦 현재 재고 현황 데이터:', inventoryStatus);
      return inventoryStatus;
    };
    
    (window as any).searchByDate = (year: number, month: number, day: number) => {
      if (!erpData.salesOrders) {
        console.log('❌ ERP 데이터가 로드되지 않았습니다. 먼저 "데이터 새로고침" 버튼을 클릭하세요.');
        return {};
      }
      
      const targetDate = new Date(year, month - 1, day); // month는 0부터 시작
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      console.log(`🔍 ${dateStr} 데이터 검색 중...`);
      
      // 영업 주문 검색
      const salesOrders = erpData.salesOrders.filter((so: any) => {
        const orderDate = new Date(so.orderDate);
        const deliveryDate = new Date(so.requestedDeliveryDate);
        const confirmedDate = new Date(so.confirmedDeliveryDate);
        return isSameDate(orderDate, targetDate) || 
               isSameDate(deliveryDate, targetDate) || 
               isSameDate(confirmedDate, targetDate);
      });
      
      // 구매 주문 검색
      const purchaseOrders = erpData.purchaseOrders.filter((po: any) => {
        const orderDate = new Date(po.orderDate);
        const expectedDate = new Date(po.expectedDeliveryDate);
        const actualDate = po.actualDeliveryDate ? new Date(po.actualDeliveryDate) : null;
        return isSameDate(orderDate, targetDate) || 
               isSameDate(expectedDate, targetDate) || 
               (actualDate && isSameDate(actualDate, targetDate));
      });
      
      // 생산 주문 검색
      const productionOrders = erpData.productionOrders.filter((po: any) => {
        const plannedStart = new Date(po.plannedStartDate);
        const plannedEnd = new Date(po.plannedEndDate);
        const actualStart = po.actualStartDate ? new Date(po.actualStartDate) : null;
        const actualEnd = po.actualEndDate ? new Date(po.actualEndDate) : null;
        return isSameDate(plannedStart, targetDate) || 
               isSameDate(plannedEnd, targetDate) ||
               (actualStart && isSameDate(actualStart, targetDate)) ||
               (actualEnd && isSameDate(actualEnd, targetDate));
      });
      
      // 자재 입고 검색
      const materialInbounds = erpData.materialInbounds.filter((mi: any) => {
        const inboundDate = new Date(mi.inboundDate);
        const qualityDate = new Date(mi.qualityCheckDate);
        return isSameDate(inboundDate, targetDate) || isSameDate(qualityDate, targetDate);
      });
      
      // 출하/배송 검색
      const shipments = erpData.shipments.filter((s: any) => {
        const plannedShip = new Date(s.plannedShipDate);
        const actualShip = new Date(s.actualShipDate);
        const plannedDelivery = new Date(s.plannedDeliveryDate);
        const actualDelivery = s.actualDeliveryDate ? new Date(s.actualDeliveryDate) : null;
        return isSameDate(plannedShip, targetDate) || 
               isSameDate(actualShip, targetDate) ||
               isSameDate(plannedDelivery, targetDate) ||
               (actualDelivery && isSameDate(actualDelivery, targetDate));
      });
      
      const results = {
        date: dateStr,
        salesOrders,
        purchaseOrders,
        productionOrders,
        materialInbounds,
        shipments
      };
      
      console.log(`📊 ${dateStr} 검색 결과:`);
      console.log(`  • 영업 주문: ${salesOrders.length}건`);
      console.log(`  • 구매 주문: ${purchaseOrders.length}건`);
      console.log(`  • 생산 주문: ${productionOrders.length}건`);
      console.log(`  • 자재 입고: ${materialInbounds.length}건`);
      console.log(`  • 출하/배송: ${shipments.length}건`);
      
      // UI에 필터링된 데이터 적용
      setDateFilter(dateStr);
      setFilteredData(results);
      
      return results;
    };
    
    // 날짜 비교 헬퍼 함수
    const isSameDate = (date1: Date, date2: Date) => {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    };
    
    // 날짜 필터 초기화 함수
    (window as any).clearDateFilter = () => {
      setDateFilter(null);
      setFilteredData(null);
      console.log('🔄 날짜 필터가 초기화되었습니다.');
    };
    
    // 회사별 타임라인 조회 함수
    (window as any).getCompanyTimeline = (companyName?: string) => {
      if (!erpData.salesOrders.length) {
        console.log('❌ ERP 데이터가 로드되지 않았습니다. "데이터 새로고침" 버튼을 먼저 클릭하세요.');
        return null;
      }

      const allItems = [...erpData.salesOrders, ...erpData.purchaseOrders, ...erpData.productionOrders, ...erpData.materialInbounds, ...erpData.shipments];
      
      if (companyName) {
        // 특정 회사 검색
        const companyItems = allItems.filter(item => 
          (item.companyName && item.companyName.includes(companyName)) ||
          (item.supplierName && item.supplierName.includes(companyName)) ||
          (item.customerName && item.customerName.includes(companyName))
        );
        
        console.log(`🏢 "${companyName}" 회사 타임라인 조회:`);
        console.log(`  - 총 활동: ${companyItems.length}건`);
        
        // 제품별로 그룹화
        const productGroups = companyItems.reduce((acc: any, item: any) => {
          const productCode = item.productCode || item.materialCode;
          if (!productCode) return acc;
          
          if (!acc[productCode]) {
            acc[productCode] = {
              productCode,
              productName: item.productName || item.materialName || productCode,
              orders: [],
              totalQuantity: 0,
              totalAmount: 0
            };
          }
          
          acc[productCode].orders.push({
            id: item.id,
            type: item.type || 'order',
            date: item.orderDate || item.deliveryDate || item.inboundDate || item.shipmentDate,
            quantity: item.quantity || item.orderQuantity,
            amount: item.amount || item.orderAmount,
            status: item.status,
            description: `${item.productName || item.materialName} 관련 ${item.type || '주문'}`
          });
          
          acc[productCode].totalQuantity += (item.quantity || item.orderQuantity || 0);
          acc[productCode].totalAmount += (item.amount || item.orderAmount || 0);
          
          return acc;
        }, {});
        
        Object.values(productGroups).forEach((product: any) => {
          console.log(`\n📦 ${product.productName} (${product.productCode}):`);
          console.log(`  - 총 주문: ${product.orders.length}건`);
          console.log(`  - 총 수량: ${product.totalQuantity.toLocaleString()}개`);
          console.log(`  - 총 금액: ₩${product.totalAmount.toLocaleString()}`);
          
          product.orders.slice(0, 3).forEach((order: any, idx: number) => {
            console.log(`  ${idx + 1}. ${order.type === 'order' ? '📋 주문' : order.type === 'production' ? '🏭 생산' : order.type === 'shipment' ? '🚚 출하' : '📦 기타'} ${new Date(order.date).toLocaleDateString('ko-KR')}`);
            console.log(`     수량: ${order.quantity?.toLocaleString() || 'N/A'}개, 금액: ₩${order.amount?.toLocaleString() || 'N/A'}, 상태: ${order.status || 'N/A'}`);
          });
          
          if (product.orders.length > 3) {
            console.log(`     ... 외 ${product.orders.length - 3}건 더`);
          }
        });
        
        return productGroups;
      } else {
        // 전체 회사 목록
        const companies = [...new Set(allItems.map(item => 
          item.companyName || item.supplierName || item.customerName
        ).filter(Boolean))];
        
        console.log('🏢 전체 회사 목록:');
        companies.forEach((company, idx) => {
          const companyItems = allItems.filter(item => 
            item.companyName === company || item.supplierName === company || item.customerName === company
          );
          console.log(`  ${idx + 1}. ${company} (${companyItems.length}건 활동)`);
        });
        
        console.log('\n💡 특정 회사 조회: getCompanyTimeline("회사명")');
        return companies;
      }
    };

    // 특정 날짜의 회사별 타임라인 조회 함수
    (window as any).getCompanyTimelineByDate = (year: number, month: number, day: number, companyName?: string) => {
      if (!erpData.salesOrders.length) {
        console.log('❌ ERP 데이터가 로드되지 않았습니다. "데이터 새로고침" 버튼을 먼저 클릭하세요.');
        return null;
      }

      // 먼저 날짜로 필터링
      const targetDate = new Date(year, month - 1, day);
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const isSameDate = (date1: Date, date2: Date) => {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
      };

      // 날짜별 필터링
      const salesOrders = erpData.salesOrders.filter((so: any) => {
        const orderDate = new Date(so.orderDate);
        const deliveryDate = new Date(so.requestedDeliveryDate);
        const confirmedDate = new Date(so.confirmedDeliveryDate);
        return isSameDate(orderDate, targetDate) || 
               isSameDate(deliveryDate, targetDate) || 
               isSameDate(confirmedDate, targetDate);
      });
      
      const purchaseOrders = erpData.purchaseOrders.filter((po: any) => {
        const orderDate = new Date(po.orderDate);
        const expectedDate = new Date(po.expectedDeliveryDate);
        const actualDate = po.actualDeliveryDate ? new Date(po.actualDeliveryDate) : null;
        return isSameDate(orderDate, targetDate) || 
               isSameDate(expectedDate, targetDate) || 
               (actualDate && isSameDate(actualDate, targetDate));
      });
      
      const productionOrders = erpData.productionOrders.filter((po: any) => {
        const plannedStart = new Date(po.plannedStartDate);
        const plannedEnd = new Date(po.plannedEndDate);
        const actualStart = po.actualStartDate ? new Date(po.actualStartDate) : null;
        const actualEnd = po.actualEndDate ? new Date(po.actualEndDate) : null;
        return isSameDate(plannedStart, targetDate) || 
               isSameDate(plannedEnd, targetDate) || 
               (actualStart && isSameDate(actualStart, targetDate)) || 
               (actualEnd && isSameDate(actualEnd, targetDate));
      });
      
      const materialInbounds = erpData.materialInbounds.filter((mi: any) => {
        const inboundDate = new Date(mi.inboundDate);
        const inspectionDate = mi.qualityInspectionDate ? new Date(mi.qualityInspectionDate) : null;
        return isSameDate(inboundDate, targetDate) || 
               (inspectionDate && isSameDate(inspectionDate, targetDate));
      });
      
      const shipments = erpData.shipments.filter((s: any) => {
        const plannedShipDate = new Date(s.plannedShipmentDate);
        const actualShipDate = s.actualShipmentDate ? new Date(s.actualShipmentDate) : null;
        const plannedDeliveryDate = new Date(s.plannedDeliveryDate);
        const actualDeliveryDate = s.actualDeliveryDate ? new Date(s.actualDeliveryDate) : null;
        return isSameDate(plannedShipDate, targetDate) || 
               (actualShipDate && isSameDate(actualShipDate, targetDate)) || 
               isSameDate(plannedDeliveryDate, targetDate) || 
               (actualDeliveryDate && isSameDate(actualDeliveryDate, targetDate));
      });

      const allFilteredItems = [...salesOrders, ...purchaseOrders, ...productionOrders, ...materialInbounds, ...shipments];
      
      console.log(`📅 ${dateStr} 날짜 필터링 결과:`);
      console.log(`  - 영업 주문: ${salesOrders.length}건`);
      console.log(`  - 구매 주문: ${purchaseOrders.length}건`);
      console.log(`  - 생산 주문: ${productionOrders.length}건`);
      console.log(`  - 자재 입고: ${materialInbounds.length}건`);
      console.log(`  - 출하/배송: ${shipments.length}건`);
      console.log(`  - 총 ${allFilteredItems.length}건`);

      if (companyName) {
        // 특정 회사 검색
        const companyItems = allFilteredItems.filter(item => 
          (item.companyName && item.companyName.includes(companyName)) ||
          (item.supplierName && item.supplierName.includes(companyName)) ||
          (item.customerName && item.customerName.includes(companyName))
        );
        
        console.log(`\n🏢 "${companyName}" 회사의 ${dateStr} 활동:`);
        console.log(`  - 해당 날짜 활동: ${companyItems.length}건`);
        
        if (companyItems.length === 0) {
          console.log('  ❌ 해당 날짜에 활동이 없습니다.');
          return null;
        }
        
        // 제품별로 그룹화
        const productGroups = companyItems.reduce((acc: any, item: any) => {
          const productCode = item.productCode || item.materialCode;
          if (!productCode) return acc;
          
          if (!acc[productCode]) {
            acc[productCode] = {
              productCode,
              productName: item.productName || item.materialName || productCode,
              orders: [],
              totalQuantity: 0,
              totalAmount: 0
            };
          }
          
          acc[productCode].orders.push({
            id: item.id,
            type: item.type || 'order',
            date: item.orderDate || item.deliveryDate || item.inboundDate || item.shipmentDate,
            quantity: item.quantity || item.orderQuantity,
            amount: item.amount || item.orderAmount,
            status: item.status,
            description: `${item.productName || item.materialName} 관련 ${item.type || '주문'}`
          });
          
          acc[productCode].totalQuantity += (item.quantity || item.orderQuantity || 0);
          acc[productCode].totalAmount += (item.amount || item.orderAmount || 0);
          
          return acc;
        }, {});
        
        Object.values(productGroups).forEach((product: any) => {
          console.log(`\n📦 ${product.productName} (${product.productCode}):`);
          console.log(`  - 주문: ${product.orders.length}건`);
          console.log(`  - 수량: ${product.totalQuantity.toLocaleString()}개`);
          console.log(`  - 금액: ₩${product.totalAmount.toLocaleString()}`);
          
          product.orders.forEach((order: any, idx: number) => {
            console.log(`  ${idx + 1}. ${order.type === 'order' ? '📋 주문' : order.type === 'production' ? '🏭 생산' : order.type === 'shipment' ? '🚚 출하' : '📦 기타'} ${new Date(order.date).toLocaleDateString('ko-KR')}`);
            console.log(`     수량: ${order.quantity?.toLocaleString() || 'N/A'}개, 금액: ₩${order.amount?.toLocaleString() || 'N/A'}, 상태: ${order.status || 'N/A'}`);
          });
        });
        
        return productGroups;
      } else {
        // 해당 날짜의 전체 회사 목록
        const companies = [...new Set(allFilteredItems.map(item => 
          item.companyName || item.supplierName || item.customerName
        ).filter(Boolean))];
        
        console.log(`\n🏢 ${dateStr} 날짜의 활동 회사들:`);
        companies.forEach((company, idx) => {
          const companyItems = allFilteredItems.filter(item => 
            item.companyName === company || item.supplierName === company || item.customerName === company
          );
          console.log(`  ${idx + 1}. ${company} (${companyItems.length}건 활동)`);
        });
        
        console.log(`\n💡 특정 회사 조회: getCompanyTimelineByDate(${year}, ${month}, ${day}, "회사명")`);
        return companies;
      }
    };

    console.log('🔧 개발자 도구 함수 등록 완료:');
    console.log('  - getERPData(): 전체 ERP 데이터 조회');
    console.log('  - searchProductionOrders(productCode, month, day): 특정 제품의 특정 날짜 생산 주문 검색');
    console.log('  - searchByDate(year, month, day): 특정 날짜의 모든 ERP 활동 검색');
    console.log('  - getCompanyTimeline(companyName): 회사별 상세 타임라인 조회');
    console.log('  - getCompanyTimelineByDate(year, month, day, companyName): 특정 날짜의 회사별 타임라인 조회');
    console.log('  - clearDateFilter(): 날짜 필터 초기화');
    console.log('  - getInventoryData(): 재고 현황 데이터 조회');
    console.log('');
    console.log('💡 사용 예시:');
    console.log('  searchByDate(2025, 9, 4)  // 2025년 9월 4일 데이터 검색');
  }, [customStartDate, customEndDate, erpData.salesOrders, erpData, inventoryStatus]);

  const loadERPData = async () => {
    setLoading(true);
    try {
      // Generate dynamic ERP data using customer context
      const dynamicData = generateDynamicERPData(customers);
      const staticData = generateMassiveERPData();
      
      // Merge dynamic customer data with static ERP data
      const mergedData = {
        ...staticData,
        customers: dynamicData.customers,
        salesOrders: [...dynamicData.salesOrders, ...staticData.salesOrders],
        productionOrders: enrichProductionOrdersWithCustomerData(
          [...dynamicData.productionOrders, ...staticData.productionOrders],
          [...dynamicData.salesOrders, ...staticData.salesOrders],
          dynamicData.customers
        )
      };
      
      setErpData(mergedData);
      
      // 개발자 도구에 함수 등록
      (window as any).getCompanyTimeline = () => {
        console.log('=== 회사별 타임라인 데이터 ===');
        const timeline = generateCompanyProductTimeline(mergedData);
        console.table(timeline);
        return timeline;
      };

      (window as any).getCompanyTimelineByDate = (targetDate: string) => {
        console.log(`=== ${targetDate} 날짜의 회사별 타임라인 ===`);
        const timeline = generateCompanyProductTimeline(mergedData);
        const filteredTimeline = timeline.filter(item => item.date === targetDate);
        console.table(filteredTimeline);
        return filteredTimeline;
      };

      console.log('개발자 도구 함수가 등록되었습니다:');
      console.log('- getCompanyTimeline(): 전체 회사별 타임라인 조회');
      console.log('- getCompanyTimelineByDate("YYYY-MM-DD"): 특정 날짜의 타임라인 조회');
      console.log('동적 고객 데이터가 ERP 시스템에 통합되었습니다.');
      
    } catch (error) {
      console.error('ERP 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🚀 ERP 데이터 로딩 시작...');
      const data = generateMassiveERPData();
      setErpData(data);

      // 통계 데이터 계산
      const stats: ERPDataStats = {
        totalSalesOrders: data.salesOrders?.length || 0,
        totalPurchaseOrders: data.purchaseOrders?.length || 0,
        totalProductionOrders: data.productionOrders?.length || 0,
        totalShipments: data.shipments?.length || 0,
        totalRevenue: data.salesOrders?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0,
        totalCosts: data.purchaseOrders?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0,
        activeCustomers: new Set(data.salesOrders?.map((order: any) => order.customerName) || []).size,
        activeSuppliers: new Set(data.purchaseOrders?.map((order: any) => order.supplierName) || []).size,
        inventoryValue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        onTimeDeliveryRate: 0,
        averageLeadTime: 0,
        qualityScore: 0,
        productionEfficiency: 0,
        insufficientMaterials: 0
      };

      setErpData(data);
      setErpStats(stats);
      
    } catch (error) {
      console.error('ERP 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const data = generateMassiveERPData();
      
      // CSV 형태로 데이터 변환
      const csvData = {
        salesOrders: data.salesOrders,
        purchaseOrders: data.purchaseOrders,
        productionOrders: data.productionOrders,
        shipments: data.shipments,
        materialInbounds: data.materialInbounds
      };
      
      // 각 데이터 타입별로 CSV 생성
      Object.entries(csvData).forEach(([key, items]) => {
        if (items.length > 0) {
          const csvContent = convertToCSV(items);
          downloadCSV(csvContent, `${key}_${new Date().toISOString().split('T')[0]}.csv`);
        }
      });
      
      console.log('✅ 데이터 내보내기 완료');
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateRealInventoryStatus = (data: any) => {
    // 자재별로 그룹화하여 실제 재고 현황 계산
    const materialMap = new Map();
    
    // 입고 데이터 집계
    data.materialInbounds?.forEach((inbound: any) => {
      const key = inbound.materialCode;
      if (!materialMap.has(key)) {
        materialMap.set(key, {
          materialCode: inbound.materialCode,
          materialName: inbound.materialName,
          unit: inbound.unit,
          totalInbound: 0,
          totalConsumed: 0,
          inboundRecords: [],
          consumptionRecords: [],
          lastInboundDate: null,
          qualityStatus: inbound.qualityStatus,
          warehouseLocation: inbound.warehouseLocation,
          lotNumbers: new Set()
        });
      }
      
      const material = materialMap.get(key);
      material.totalInbound += inbound.quantity;
      material.inboundRecords.push(inbound);
      material.lastInboundDate = inbound.inboundDate;
      material.lotNumbers.add(inbound.lotNumber);
    });
    
    // 소모 데이터 집계
    data.productionOrders?.forEach((po: any) => {
      po.workOrders?.forEach((wo: any) => {
        wo.materialsConsumed?.forEach((consumed: any) => {
          const key = consumed.materialCode;
          if (materialMap.has(key)) {
            const material = materialMap.get(key);
            material.totalConsumed += consumed.actualQuantity;
            material.consumptionRecords.push({
              ...consumed,
              productionOrderId: po.id,
              workOrderId: wo.id,
              productName: po.productName
            });
          }
        });
      });
    });
    
    // 재고 현황 계산 및 반환
    return Array.from(materialMap.values()).map(material => {
      const remainingQty = material.totalInbound - material.totalConsumed;
      const turnoverRate = material.totalInbound > 0 ? (material.totalConsumed / material.totalInbound) * 100 : 0;
      
      return {
        materialCode: material.materialCode,
        materialName: material.materialName,
        unit: material.unit,
        inboundQty: material.totalInbound,
        consumedQty: material.totalConsumed,
        remainingQty: Math.max(0, remainingQty),
        turnoverRate: `${Math.round(turnoverRate)}%`,
        lastInboundDate: material.lastInboundDate,
        qualityStatus: material.qualityStatus,
        warehouseLocation: material.warehouseLocation,
        lotCount: material.lotNumbers.size,
        inboundRecords: material.inboundRecords,
        consumptionRecords: material.consumptionRecords,
        status: remainingQty < 100 ? 'low' : remainingQty < 50 ? 'critical' : 'normal'
      };
    }).sort((a, b) => b.inboundQty - a.inboundQty);
  };

  const filterInventoryByDateRange = (inventory: any[], dateRange: DateRangeType) => {
    const range = getDateRange(dateRange);
    return inventory.filter(item => {
      if (!item.lastInboundDate) return false;
      const itemDate = new Date(item.lastInboundDate);
      return itemDate >= range.start && itemDate <= range.end;
    });
  };

  const handleMaterialClick = (material: any) => {
    setSelectedMaterial(material);
    setShowMaterialDetailModal(true);
    console.log('📋 선택된 자재 상세 정보:', material);
  };

  const analyzeBOMSufficiency = (data: any, purchaseOrders: any[]): BOMSufficiencyResult[] => {
    // BOM 충족도 분석 로직 (간소화된 버전)
    return purchaseOrders.map(po => ({
      purchaseOrderId: po.id,
      orderNumber: po.orderNumber,
      supplier: po.supplierName || 'Unknown',
      overallSufficiency: `${Math.floor(Math.random() * 30 + 70)}%`,
      totalMaterials: po.items?.length || 0,
      sufficientMaterials: Math.floor((po.items?.length || 0) * 0.8),
      insufficientMaterials: Math.floor((po.items?.length || 0) * 0.2),
    }));
  };

  const analyzeInventoryStatus = (data: any) => {
    // 재고 현황 분석 로직 (간소화된 버전)
    const materials = ['MAT-001', 'MAT-002', 'MAT-003', 'MAT-004', 'MAT-005'];
    return materials.map(materialCode => ({
      materialCode,
      materialName: `자재 ${materialCode}`,
      inboundQty: Math.floor(Math.random() * 1000 + 500),
      consumedQty: Math.floor(Math.random() * 800 + 200),
      remainingQty: Math.floor(Math.random() * 400 + 100),
      turnoverRate: `${Math.floor(Math.random() * 40 + 60)}%`,
    }));
  };

  const loadTimelineData = () => {
    if (erpData.salesOrders && erpData.purchaseOrders && erpData.productionOrders && erpData.shipments) {
      const dateRange = getDateRange(selectedDateRange);
      const companyTimelines = generateCompanyProductTimeline(
        erpData.salesOrders,
        erpData.purchaseOrders,
        erpData.productionOrders,
        erpData.shipments,
        dateRange
      );
      const statistics = generatePeriodStatistics(companyTimelines, dateRange);
      
      setTimelineData({
        dateRange,
        companyTimelines,
        statistics
      });
    }
  };

  const renderTimelineTab = () => {
    // ERP 데이터가 없으면 먼저 로드하라고 안내
    if (!erpData.salesOrders || !erpData.purchaseOrders) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <Clock style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem' }} />
          <p>먼저 "데이터 새로고침" 버튼을 클릭하여 ERP 데이터를 로드해주세요.</p>
        </div>
      );
    }

    if (!timelineData) {
      loadTimelineData();
      return (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          <Clock style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem' }} />
          <p>타임라인 데이터를 로딩 중...</p>
        </div>
      );
    }

    const { dateRange, companyTimelines, statistics } = timelineData;

    return (
      <div>
        {/* 기간 선택 */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>📅 기간별 타임라인 분석</h3>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>기간 선택:</label>
              <select 
                value={selectedDateRange} 
                onChange={(e) => {
                  setSelectedDateRange(e.target.value as DateRangeType);
                  setTimelineData(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="today">오늘</option>
                <option value="yesterday">어제</option>
                <option value="this_week">이번 주</option>
                <option value="last_week">지난 주</option>
                <option value="2_weeks_ago">2주 전</option>
                <option value="this_month">이번 달</option>
                <option value="last_month">지난 달</option>
                <option value="2_months_ago">2달 전</option>
                <option value="this_quarter">이번 분기</option>
                <option value="last_quarter">지난 분기</option>
                <option value="this_year">올해</option>
                <option value="custom">사용자 지정</option>
              </select>
            </div>
            
            {selectedDateRange === 'custom' && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>시작일:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>종료일:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
                <Button
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      setTimelineData(null);
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem'
                  }}
                >
                  적용
                </Button>
              </div>
            )}
            
            <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
              📊 선택된 기간: <span style={{ color: '#1f2937', fontWeight: '600' }}>{dateRange.label}</span>
            </div>
          </div>
        </div>

        {/* 통계 요약 */}
        <div style={cardGridStyle}>
          <div style={statCardStyle}>
            <div style={statHeaderStyle}>
              <div style={statTitleStyle}>총 고객사</div>
              <Users style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} />
            </div>
            <div style={statValueStyle}>{statistics.summary.totalCustomers}</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {dateRange.label} 기간
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statHeaderStyle}>
              <div style={statTitleStyle}>총 매출액</div>
              <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />
            </div>
            <div style={statValueStyle}>₩{statistics.summary.totalSalesAmount.toLocaleString()}</div>
            <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {statistics.summary.totalOrders}건 주문
            </div>
          </div>

          <div style={statCardStyle}>
            <div style={statHeaderStyle}>
              <div style={statTitleStyle}>총 구매액</div>
              <Package style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} />
            </div>
            <div style={statValueStyle}>₩{statistics.summary.totalPurchaseAmount.toLocaleString()}</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {statistics.summary.totalPurchases}건 구매
            </div>
          </div>
        </div>

        {/* 상위 고객사 */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart style={{ width: '1.25rem', height: '1.25rem' }} />
            상위 고객사 ({dateRange.label})
          </h4>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>고객사</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>주문 건수</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>총 금액</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600', color: '#374151' }}>제품 수</th>
                </tr>
              </thead>
              <tbody>
                {statistics.topCustomers.map((customer, index) => (
                  <tr key={customer.companyName} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          {index + 1}
                        </Badge>
                        {customer.companyName}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>{customer.orderCount}건</td>
                    <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>
                      ₩{customer.totalValue.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>{customer.products.length}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 회사별 상세 타임라인 */}
        <div>
          <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock style={{ width: '1.25rem', height: '1.25rem' }} />
            회사별 상세 타임라인
          </h4>
          {dateFilter && (
            <div style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: '#dbeafe', 
              border: '1px solid #3b82f6', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#1e40af', fontWeight: '600' }}>
                📅 날짜 필터 활성: {dateFilter}
              </span>
              <button 
                onClick={() => {
                  setDateFilter(null);
                  setFilteredData(null);
                }}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                필터 해제
              </button>
            </div>
          )}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {(() => {
              if (filteredData) {
                const allFilteredItems = [...filteredData.salesOrders, ...filteredData.purchaseOrders, ...filteredData.productionOrders, ...filteredData.materialInbounds, ...filteredData.shipments];
                console.log(`🔍 UI 표시용 데이터 변환 시작:`);
                console.log(`  - 원본 필터링된 항목 수: ${allFilteredItems.length}개`);
                
                let skippedCompany = 0;
                let skippedProduct = 0;
                
                const processedData = Object.entries(
                  allFilteredItems.reduce((acc: any, item: any) => {
                    const companyName = item.companyName || item.supplierName || item.customerName;
                    if (!companyName) {
                      skippedCompany++;
                      return acc; // 회사명이 없으면 건너뛰기
                    }
                    if (!acc[companyName]) {
                      acc[companyName] = {
                        companyName,
                        companyType: item.companyType || 'unknown',
                        products: []
                      };
                    }
                    
                    // 제품별로 그룹화 (productCode가 없는 항목은 제외)
                    const productCode = item.productCode || item.materialCode;
                    if (!productCode) {
                      skippedProduct++;
                      return acc; // productCode가 없으면 건너뛰기
                    }
                    let product = acc[companyName].products.find((p: any) => p.productCode === productCode);
                    if (!product) {
                      product = {
                        productCode,
                        productName: item.productName || item.materialName || productCode,
                        totalOrders: 0,
                        totalAmount: 0,
                        timeline: []
                      };
                      acc[companyName].products.push(product);
                    }
                    
                    // 타임라인 이벤트 추가
                    const eventDate = new Date(item.orderDate || item.deliveryDate || item.inboundDate || item.shipmentDate);
                    product.timeline.push({
                      id: item.id || `${productCode}-${Date.now()}`,
                      type: item.type || 'order',
                      date: eventDate,
                      description: item.description || `${productCode} 관련 활동`,
                      status: item.status || 'completed',
                      quantity: item.quantity || item.orderQuantity,
                      amount: item.amount || item.orderAmount
                    });
                    
                    product.totalOrders += 1;
                    product.totalAmount += (item.amount || item.orderAmount || 0);
                    
                    return acc;
                  }, {})
                ).map(([companyName, company]: [string, any]) => company);
                
                console.log(`  - 회사명 없어서 제외된 항목: ${skippedCompany}개`);
                console.log(`  - 제품코드 없어서 제외된 항목: ${skippedProduct}개`);
                console.log(`  - 최종 표시될 회사 수: ${processedData.length}개`);
                
                return processedData;
              } else {
                return companyTimelines;
              }
            })().slice(0, 5).map((company) => (
              <div key={company.companyName} style={{ 
                background: 'white', 
                borderRadius: '1rem', 
                padding: '1.5rem', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h5 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {company.companyType === 'customer' ? 
                      <Users style={{ width: '1rem', height: '1rem', color: '#3b82f6' }} /> :
                      <Truck style={{ width: '1rem', height: '1rem', color: '#8b5cf6' }} />
                    }
                    {company.companyName}
                  </h5>
                  <Badge variant={company.companyType === 'customer' ? 'default' : 'secondary'}>
                    {company.companyType === 'customer' ? '고객사' : '공급업체'}
                  </Badge>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {company.products.slice(0, 3).map((product) => (
                    <div key={product.productCode} style={{ 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '0.5rem', 
                      padding: '1rem' 
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{product.productName}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        {product.productCode} • {product.totalOrders}건 주문
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>
                        ₩{product.totalAmount.toLocaleString()}
                      </div>
                      
                      {/* 타임라인 이벤트 */}
                      <div style={{ marginTop: '0.75rem' }}>
                        {product.timeline.slice(0, 3).map((event, idx) => (
                          <div key={`${product.productCode}-${event.id}-${idx}`} 
                            onClick={() => {
                              setSelectedTimelineItem({ event, product, company });
                              setShowDetailModal(true);
                            }}
                            style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '0.25rem',
                            marginBottom: '0.75rem',
                            cursor: 'pointer',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#fafafa',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                            e.currentTarget.style.borderColor = '#3b82f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fafafa';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                          >
                            {/* 이벤트 헤더 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                background: event.type === 'order' ? '#3b82f6' : 
                                           event.type === 'production' ? '#f59e0b' : 
                                           event.type === 'shipment' ? '#10b981' : '#8b5cf6'
                              }}></div>
                              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                                {event.type === 'order' ? '📋 주문' : 
                                 event.type === 'production' ? '🏭 생산' : 
                                 event.type === 'shipment' ? '🚚 출하' : '📦 기타'}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {event.date.toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            
                            {/* 상세 정보 */}
                            <div style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: '1.4' }}>
                              <div style={{ marginBottom: '0.25rem' }}>
                                <strong>부품:</strong> {product.productName} ({product.productCode})
                              </div>
                              {event.quantity && (
                                <div style={{ marginBottom: '0.25rem' }}>
                                  <strong>수량:</strong> {event.quantity.toLocaleString()}개
                                </div>
                              )}
                              {event.amount && (
                                <div style={{ marginBottom: '0.25rem' }}>
                                  <strong>금액:</strong> <span style={{ color: '#10b981', fontWeight: '600' }}>₩{event.amount.toLocaleString()}</span>
                                </div>
                              )}
                              <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                상태: {event.status === 'completed' ? '✅ 완료' : 
                                      event.status === 'in_progress' ? '🔄 진행중' : 
                                      event.status === 'pending' ? '⏳ 대기중' : event.status}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* 더보기 버튼 */}
                        {product.timeline.length > 3 && (
                          <div style={{ 
                            textAlign: 'center', 
                            marginTop: '0.5rem',
                            fontSize: '0.75rem',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            padding: '0.25rem'
                          }}
                          onClick={() => {
                            setSelectedTimelineItem({ event: null, product, company });
                            setShowDetailModal(true);
                          }}
                          >
                            + {product.timeline.length - 3}개 더보기
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 상세 정보 모달 */}
        {showDetailModal && selectedTimelineItem && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>상세 정보</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >×</button>
              </div>
              
              {renderDetailModalContent()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDetailModalContent = () => {
    if (!selectedTimelineItem) return null;
    
    const { event, product, company } = selectedTimelineItem;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 기본 정보 */}
        <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>기본 정보</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>회사명</div>
              <div style={{ fontWeight: '600' }}>{company.companyName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>회사 유형</div>
              <Badge variant={company.companyType === 'customer' ? 'default' : 'secondary'}>
                {company.companyType === 'customer' ? '고객사' : '공급업체'}
              </Badge>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>제품명</div>
              <div style={{ fontWeight: '600' }}>{product.productName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>제품 코드</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{product.productCode}</div>
            </div>
          </div>
        </div>
        
        {/* 이벤트 상세 */}
        <div style={{ padding: '1.5rem', backgroundColor: '#fefefe', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: event.type === 'order' ? '#3b82f6' : 
                         event.type === 'production' ? '#f59e0b' : 
                         event.type === 'shipment' ? '#10b981' : '#8b5cf6'
            }}></div>
            {event.type === 'order' ? '주문 정보' : 
             event.type === 'production' ? '생산 정보' : 
             event.type === 'shipment' ? '배송 정보' : '기타 정보'}
          </h4>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>이벤트 날짜</div>
              <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                {event.date.toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'short'
                })}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>상태</div>
              <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                {event.status === 'completed' ? '완료' : 
                 event.status === 'in_progress' ? '진행중' : 
                 event.status === 'pending' ? '대기중' : event.status}
              </Badge>
            </div>
            
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>설명</div>
              <div style={{ lineHeight: '1.5' }}>{event.description}</div>
            </div>
            
            {event.quantity && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>수량</div>
                <div style={{ fontWeight: '600' }}>{event.quantity.toLocaleString()}개</div>
              </div>
            )}
            
            {event.amount && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>금액</div>
                <div style={{ fontWeight: '600', color: '#10b981' }}>₩{event.amount.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* 제작 및 완료 예정 정보 */}
        <div style={{ padding: '1.5rem', backgroundColor: '#f0f9ff', borderRadius: '0.75rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>일정 정보</h4>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {event.type === 'production' && (
              <>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>생산 시작 예정</div>
                  <div style={{ fontWeight: '600' }}>
                    {new Date(event.date.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>생산 완료 예정</div>
                  <div style={{ fontWeight: '600', color: '#f59e0b' }}>
                    {new Date(event.date.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>예상 리드타임</div>
                  <div style={{ fontWeight: '600' }}>7일</div>
                </div>
              </>
            )}
            
            {event.type === 'order' && (
              <>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>주문 접수일</div>
                  <div style={{ fontWeight: '600' }}>{event.date.toLocaleDateString('ko-KR')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>납품 예정일</div>
                  <div style={{ fontWeight: '600', color: '#3b82f6' }}>
                    {new Date(event.date.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </>
            )}
            
            {event.type === 'shipment' && (
              <>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>출하일</div>
                  <div style={{ fontWeight: '600' }}>{event.date.toLocaleDateString('ko-KR')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>배송 완료 예정</div>
                  <div style={{ fontWeight: '600', color: '#10b981' }}>
                    {new Date(event.date.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* 관련 정보 */}
        <div style={{ padding: '1.5rem', backgroundColor: '#fafafa', borderRadius: '0.75rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>제품 통계</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>총 주문 건수</div>
              <div style={{ fontWeight: '600', fontSize: '1.25rem' }}>{product.totalOrders}건</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>총 주문 금액</div>
              <div style={{ fontWeight: '600', fontSize: '1.25rem', color: '#10b981' }}>₩{product.totalAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    loadERPData();
  }, [customers]);

  const renderOverviewTab = () => (
    <div>
      <div style={cardGridStyle}>
        <div style={statCardStyle}>
          <div style={statHeaderStyle}>
            <div style={statTitleStyle}>영업 주문</div>
            <ShoppingCart style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} />
          </div>
          <div style={statValueStyle}>{erpStats?.totalSalesOrders?.toLocaleString() || 0}</div>
          <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <TrendingUp style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem' }} />
            +12% 전월 대비
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statHeaderStyle}>
            <div style={statTitleStyle}>구매 주문</div>
            <Package style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} />
          </div>
          <div style={statValueStyle}>{erpStats?.totalPurchaseOrders?.toLocaleString() || 0}</div>
          <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <TrendingUp style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem' }} />
            +8% 전월 대비
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statHeaderStyle}>
            <div style={statTitleStyle}>생산 주문</div>
            <Database style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} />
          </div>
          <div style={statValueStyle}>{erpStats?.totalProductionOrders?.toLocaleString() || 0}</div>
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <AlertTriangle style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem' }} />
            3건 지연
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statHeaderStyle}>
            <div style={statTitleStyle}>출하/배송</div>
            <Truck style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />
          </div>
          <div style={statValueStyle}>₩{erpStats?.totalRevenue?.toLocaleString() || 0}</div>
          <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <CheckCircle style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.25rem' }} />
            98% 정시 배송
          </div>
        </div>
      </div>

      <div style={cardGridStyle}>
        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            <BarChart3 style={{ width: '1.25rem', height: '1.25rem', display: 'inline', marginRight: '0.5rem' }} />
            데이터 생성 현황
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>자재 입고</span>
              <Badge variant="secondary">{erpData?.materialInbounds?.length?.toLocaleString() || 0}건</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>근태 기록</span>
              <Badge variant="secondary">{erpData?.attendanceRecords?.length?.toLocaleString() || 0}건</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>급여 기록</span>
              <Badge variant="secondary">{erpData?.payrollRecords?.length?.toLocaleString() || 0}건</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>회계 분개</span>
              <Badge variant="secondary">{erpData?.accountingEntries?.length?.toLocaleString() || 0}건</Badge>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            <Clock style={{ width: '1.25rem', height: '1.25rem', display: 'inline', marginRight: '0.5rem' }} />
            데이터 생성 기간
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>시작일</span>
              <span style={{ fontWeight: '600' }}>2023년 7월 1일</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>종료일</span>
              <span style={{ fontWeight: '600' }}>2024년 6월 30일</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>총 기간</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>12개월</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>총 거래</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>
                {Object.values(erpStats || {}).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0).toLocaleString()}건
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // 생산 주문 탭 렌더링 (영업 주문과 연동)
  const renderProductionOrdersTab = () => {
    const { productionOrders, salesOrders } = erpData;
    
    if (!productionOrders || productionOrders.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <p>생산 주문 데이터가 없습니다.</p>
        </div>
      );
    }

    // 생산 주문과 영업 주문 연동
    const enrichedProductionOrders = productionOrders.map((order: any) => {
      const relatedSalesOrder = salesOrders?.find((so: any) => so.id === order.salesOrderId);
      return {
        ...order,
        customerName: relatedSalesOrder?.customerName || '고객정보없음',
        customerOrderNumber: relatedSalesOrder?.orderNumber || '',
        salesPerson: relatedSalesOrder?.salesPerson || '',
        orderAmount: relatedSalesOrder?.totalAmount || 0,
        requestedDeliveryDate: relatedSalesOrder?.requestedDeliveryDate || order.plannedEndDate
      };
    });

    return (
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Input
            placeholder="생산 주문 번호, 제품명 또는 고객명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <Button variant="outline">
            <Search style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            검색
          </Button>
          <Badge variant="outline">
            총 {productionOrders.length}개 생산 주문
          </Badge>
        </div>

        <Card className="p-6">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            생산 주문 현황 (고객 주문 연동)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>생산주문번호</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>고객명</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>제품명</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>수량</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>주문금액</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>납기일</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>상태</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>진행률</th>
                </tr>
              </thead>
              <tbody>
                {enrichedProductionOrders.slice(0, 50).map((order: any, index: number) => (
                  <tr key={order.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#3b82f6' }}>
                      {order.orderNumber || order.id}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '600', color: '#059669' }}>
                      {order.customerName}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {order.productName || order.productCode}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {(order.plannedQuantity || order.quantity || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#dc2626' }}>
                      ₩{order.orderAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {new Date(order.requestedDeliveryDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <Badge variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {order.status === 'completed' ? '완료' :
                         order.status === 'in_progress' ? '진행중' :
                         order.status === 'planned' ? '계획' : '대기'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '8px', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '4px',
                        margin: '0 auto',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${order.progress || 0}%`,
                          height: '100%',
                          backgroundColor: order.progress >= 100 ? '#10b981' : 
                                          order.progress >= 50 ? '#f59e0b' : '#3b82f6',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {order.progress || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // BOM 관리 탭 (생산 주문과 영업 주문 연동)
  const renderBOMAnalysisTab = () => {
    const { productionOrders, salesOrders } = erpData;
    
    if (!productionOrders || productionOrders.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <p>생산 주문 데이터가 없습니다.</p>
        </div>
      );
    }

    // 생산 주문에서 BOM 정보 추출 및 고객 정보 연동
    const bomData = productionOrders.map((order: any) => {
      const materials = order.workOrders?.[0]?.materialsConsumed || [];
      const totalMaterials = materials.length;
      const sufficientMaterials = materials.filter((m: any) => m.availableQuantity >= m.requiredQuantity).length;
      const insufficientMaterials = totalMaterials - sufficientMaterials;
      const overallSufficiency = totalMaterials > 0 ? Math.round((sufficientMaterials / totalMaterials) * 100) : 100;

      // 관련 영업 주문 찾기
      const relatedSalesOrder = salesOrders?.find((so: any) => so.id === order.salesOrderId);

      return {
        productionOrderId: order.id,
        orderNumber: order.orderNumber || order.id,
        productName: order.productName || order.productCode,
        customerName: relatedSalesOrder?.customerName || '고객정보없음',
        salesPerson: relatedSalesOrder?.salesPerson || '',
        orderAmount: relatedSalesOrder?.totalAmount || 0,
        overallSufficiency: `${overallSufficiency}%`,
        totalMaterials,
        sufficientMaterials,
        insufficientMaterials,
        materials
      };
    });

    return (
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Input
            placeholder="생산 주문 번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <Button variant="outline">
            <Search style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            검색
          </Button>
          <Badge variant="outline">
            총 {bomData.length}개 생산 주문 BOM 분석
          </Badge>
        </div>

        <Card className="p-6">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            BOM 충족도 분석 (생산 주문 기반)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>생산주문번호</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>고객명</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>제품명</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>주문금액</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>BOM 충족도</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>충족 자재</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>부족 자재</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {bomData.slice(0, 50).map((item: any, index: number) => (
                  <tr key={item.productionOrderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#3b82f6' }}>{item.orderNumber}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '600', color: '#059669' }}>{item.customerName}</td>
                    <td style={{ padding: '0.75rem' }}>{item.productName}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#dc2626' }}>
                      ₩{item.orderAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <Badge variant={parseInt(item.overallSufficiency) >= 90 ? "default" : "secondary"}>
                        {item.overallSufficiency}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {item.sufficientMaterials}/{item.totalMaterials}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {item.insufficientMaterials > 0 ? (
                        <Badge variant="destructive">{item.insufficientMaterials}</Badge>
                      ) : (
                        <span style={{ color: '#10b981' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {parseInt(item.overallSufficiency) >= 90 ? (
                        <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
                      ) : (
                        <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // 작업지시 탭 (생산 주문 기반)
  const renderWorkInstructionsTab = () => {
    const { productionOrders, salesOrders } = erpData;
    
    if (!productionOrders || productionOrders.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <p>생산 주문 데이터가 없습니다.</p>
        </div>
      );
    }

    // 생산 주문에서 작업 지시 정보 추출 (고객 및 주문 정보 포함)
    const workInstructions = productionOrders.flatMap((order: any) => {
      const relatedSalesOrder = salesOrders?.find((so: any) => so.id === order.salesOrderId);
      return (order.workOrders || []).map((workOrder: any, index: number) => ({
        id: workOrder.id || `${order.id}-WO-${index}`,
        productionOrderNumber: order.orderNumber || order.id,
        productName: order.productName || order.productCode,
        customerName: relatedSalesOrder?.customerName || '고객정보없음',
        salesPerson: relatedSalesOrder?.salesPerson || '',
        orderAmount: relatedSalesOrder?.totalAmount || 0,
        requestedDeliveryDate: relatedSalesOrder?.requestedDeliveryDate || order.plannedEndDate,
        workOrderNumber: workOrder.workOrderNumber || `WO-${index + 1}`,
        workCenter: workOrder.workCenter || '작업센터-A',
        operation: workOrder.operation || '조립',
        plannedStartDate: workOrder.plannedStartDate || order.plannedStartDate,
        plannedEndDate: workOrder.plannedEndDate || order.plannedEndDate,
        actualStartDate: workOrder.actualStartDate,
        actualEndDate: workOrder.actualEndDate,
        status: workOrder.status || order.status,
        assignedWorker: workOrder.assignedWorker || '작업자-미지정',
        materials: workOrder.materialsConsumed || [],
        instructions: workOrder.instructions || '표준 작업 지시서에 따라 진행'
      }));
    });

    return (
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Input
            placeholder="작업지시서 번호 또는 작업센터로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <Button variant="outline">
            <Search style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            검색
          </Button>
          <Badge variant="outline">
            총 {workInstructions.length}개 작업지시
          </Badge>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {workInstructions.slice(0, 20).map((instruction: any) => (
            <Card key={instruction.id} className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
                  작업지시서 {instruction.workOrderNumber}
                </h4>
                <Badge variant={
                  instruction.status === 'completed' ? 'default' :
                  instruction.status === 'in_progress' ? 'secondary' : 'outline'
                }>
                  {instruction.status === 'completed' ? '완료' :
                   instruction.status === 'in_progress' ? '진행중' :
                   instruction.status === 'planned' ? '계획' : '대기'}
                </Badge>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>생산주문:</span>
                  <div style={{ fontWeight: 600, color: '#3b82f6' }}>{instruction.productionOrderNumber}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>고객명:</span>
                  <div style={{ fontWeight: 600, color: '#059669' }}>{instruction.customerName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>제품명:</span>
                  <div style={{ fontWeight: 600 }}>{instruction.productName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>주문금액:</span>
                  <div style={{ fontWeight: 600, color: '#dc2626' }}>₩{instruction.orderAmount.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>작업센터:</span>
                  <div style={{ fontWeight: 600, color: '#059669' }}>{instruction.workCenter}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>작업자:</span>
                  <div style={{ fontWeight: 600 }}>{instruction.assignedWorker}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>계획 시작일:</span>
                  <div style={{ fontWeight: 600 }}>{new Date(instruction.plannedStartDate).toLocaleDateString('ko-KR')}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>계획 완료일:</span>
                  <div style={{ fontWeight: 600 }}>{new Date(instruction.plannedEndDate).toLocaleDateString('ko-KR')}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>작업 지시사항:</span>
                <div style={{ 
                  marginTop: '0.25rem', 
                  padding: '0.75rem', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}>
                  {instruction.instructions}
                </div>
              </div>

              {instruction.materials.length > 0 && (
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    소요 자재 ({instruction.materials.length}개):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {instruction.materials.slice(0, 5).map((material: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {material.materialCode} ({material.requiredQuantity}개)
                      </Badge>
                    ))}
                    {instruction.materials.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{instruction.materials.length - 5}개 더
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderInventoryTab = () => {
    const filteredInventory = filterInventoryByDateRange(inventoryStatus, inventoryDateRange);
    
    return (
      <div>
        {/* 날짜 범위 선택기 */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: '600', color: '#374151' }}>기간 선택:</label>
          <select 
            value={inventoryDateRange} 
            onChange={(e) => setInventoryDateRange(e.target.value as DateRangeType)}
            style={{ 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.375rem',
              backgroundColor: 'white'
            }}
          >
            <option value="today">오늘</option>
            <option value="yesterday">어제</option>
            <option value="this_week">이번 주</option>
            <option value="last_week">지난 주</option>
            <option value="this_month">이번 달</option>
            <option value="last_month">지난 달</option>
            <option value="this_quarter">이번 분기</option>
            <option value="last_quarter">지난 분기</option>
          </select>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            ({getDateRange(inventoryDateRange).label})
          </span>
        </div>

        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
            재고 현황 분석 ({filteredInventory.length}개 자재)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>자재코드</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>자재명</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>입고수량</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>소모수량</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>잔여수량</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>회전율</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>상태</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>LOT 수</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <tr 
                    key={item.materialCode} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => handleMaterialClick(item)}
                  >
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{item.materialCode}</td>
                    <td style={{ 
                      padding: '0.75rem', 
                      color: '#3b82f6', 
                      fontWeight: '500',
                      textDecoration: 'underline'
                    }}>
                      {item.materialName}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.inboundQty.toLocaleString()} {item.unit}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.consumedQty.toLocaleString()} {item.unit}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <span style={{ 
                        color: item.status === 'critical' ? '#dc2626' : 
                               item.status === 'low' ? '#f59e0b' : '#374151',
                        fontWeight: item.status !== 'normal' ? '600' : 'normal'
                      }}>
                        {item.remainingQty.toLocaleString()} {item.unit}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <Badge variant={parseInt(item.turnoverRate) > 80 ? "default" : "secondary"}>
                        {item.turnoverRate}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <Badge variant={
                        item.status === 'critical' ? "destructive" : 
                        item.status === 'low' ? "secondary" : "default"
                      }>
                        {item.status === 'critical' ? '위험' : 
                         item.status === 'low' ? '부족' : '정상'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.lotCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredInventory.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              선택한 기간에 해당하는 재고 데이터가 없습니다.
            </div>
          )}
        </Card>

        {/* 자재 상세 정보 모달 */}
        {showMaterialDetailModal && selectedMaterial && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              margin: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
                  자재 상세 정보: {selectedMaterial.materialName}
                </h3>
                <Button 
                  onClick={() => setShowMaterialDetailModal(false)}
                  style={{ padding: '0.5rem' }}
                >
                  ✕
                </Button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <strong>자재코드:</strong> {selectedMaterial.materialCode}
                </div>
                <div>
                  <strong>단위:</strong> {selectedMaterial.unit}
                </div>
                <div>
                  <strong>총 입고량:</strong> {selectedMaterial.inboundQty.toLocaleString()} {selectedMaterial.unit}
                </div>
                <div>
                  <strong>총 소모량:</strong> {selectedMaterial.consumedQty.toLocaleString()} {selectedMaterial.unit}
                </div>
                <div>
                  <strong>잔여량:</strong> {selectedMaterial.remainingQty.toLocaleString()} {selectedMaterial.unit}
                </div>
                <div>
                  <strong>회전율:</strong> {selectedMaterial.turnoverRate}
                </div>
                <div>
                  <strong>LOT 수:</strong> {selectedMaterial.lotCount}개
                </div>
                <div>
                  <strong>창고 위치:</strong> {selectedMaterial.warehouseLocation}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>입고 이력</h4>
                <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>입고일</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>수량</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>LOT</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>공급업체</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMaterial.inboundRecords?.slice(0, 10).map((record: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                            {new Date(record.inboundDate).toLocaleDateString('ko-KR')}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>
                            {record.quantity.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                            {record.lotNumber}
                          </td>
                          <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                            {record.supplierName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>소모 이력</h4>
                <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>소모일</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>수량</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>제품명</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>LOT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMaterial.consumptionRecords?.slice(0, 10).map((record: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                            {new Date(record.consumptionTime).toLocaleDateString('ko-KR')}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>
                            {record.actualQuantity.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                            {record.productName}
                          </td>
                          <td style={{ padding: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                            {record.lotNumber}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const toggleOrderDetails = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const toggleShowAllOrders = (groupRange: string) => {
    setShowAllOrders((prev: {[key: string]: boolean}) => ({
      ...prev,
      [groupRange]: !prev[groupRange]
    }));
  };

  const renderBOMDetailTab = () => {
    const { purchaseOrders, bom } = erpData;
    
    // 구매 주문이 없는 경우 처리
    if (!purchaseOrders || purchaseOrders.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <p>구매 주문 데이터가 없습니다.</p>
        </div>
      );
    }
    
    // 구매 주문을 100개씩 그룹화
    const groupedPurchaseOrders = [];
    for (let i = 0; i < purchaseOrders.length; i += 100) {
      const group = purchaseOrders.slice(i, i + 100);
      groupedPurchaseOrders.push({
        range: `${i}~${Math.min(i + 99, purchaseOrders.length - 1)}`,
        orders: group,
        totalValue: group.reduce((sum: number, order: any) => sum + (order.totalAmount || order.amount || 0), 0),
        materialCount: new Set(group.map((order: any) => order.materialCode || order.material)).size
      });
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          <Input
            type="text"
            placeholder="구매 주문 범위 또는 자재 검색..."
            style={{ maxWidth: '300px' }}
          />
          <Badge variant="outline">
            총 {purchaseOrders.length}개 주문 / {groupedPurchaseOrders.length}개 그룹
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
          {groupedPurchaseOrders.map((group, groupIndex) => (
            <Card key={groupIndex} className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  구매 주문 {group.range}
                </h4>
                <Badge variant="secondary">
                  {group.orders.length}개 주문
                </Badge>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>총 주문 금액:</span>
                  <div style={{ fontWeight: 600, color: '#059669', fontSize: '1.1rem' }}>
                    ₩{group.totalValue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>자재 종류:</span>
                  <div style={{ fontWeight: 600, color: '#1d4ed8', fontSize: '1.1rem' }}>
                    {group.materialCount}개 자재
                  </div>
                </div>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem' }}>
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '0.25rem', color: '#64748b' }}>주문번호</th>
                      <th style={{ textAlign: 'left', padding: '0.25rem', color: '#64748b' }}>자재</th>
                      <th style={{ textAlign: 'right', padding: '0.25rem', color: '#64748b' }}>수량</th>
                      <th style={{ textAlign: 'right', padding: '0.25rem', color: '#64748b' }}>금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllOrders[group.range] ? group.orders : group.orders.slice(0, 10)).map((order: any, orderIndex: number) => (
                      <React.Fragment key={orderIndex}>
                        <tr style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} 
                            onClick={() => toggleOrderDetails(order.id || order.orderNumber || `${group.range}-${orderIndex}`)}>
                          <td style={{ padding: '0.25rem', fontWeight: 500, color: '#3b82f6' }}>
                            {order.orderNumber || order.id || `PO-${orderIndex}`}
                            {expandedOrders.has(order.id || order.orderNumber || `${group.range}-${orderIndex}`) ? ' ▼' : ' ▶'}
                          </td>
                          <td style={{ padding: '0.25rem' }}>
                            {order.items ? `${order.items.length}개 자재` : (order.materialCode || order.material || 'N/A')}
                          </td>
                          <td style={{ padding: '0.25rem', textAlign: 'right' }}>
                            {order.items ? order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0).toLocaleString() : (order.quantity || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.25rem', textAlign: 'right', color: '#059669' }}>
                            ₩{(order.totalAmount || order.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                        {expandedOrders.has(order.id || order.orderNumber || `${group.range}-${orderIndex}`) && order.items && (
                          <tr>
                            <td colSpan={4} style={{ padding: '0', backgroundColor: '#f8fafc' }}>
                              <div style={{ padding: '1rem', margin: '0.5rem' }}>
                                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                  주문 세부 항목
                                </h5>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                  {order.items.map((item: any, itemIndex: number) => (
                                    <div key={itemIndex} style={{ 
                                      display: 'grid', 
                                      gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                                      gap: '0.5rem', 
                                      padding: '0.5rem', 
                                      backgroundColor: 'white', 
                                      borderRadius: '0.25rem',
                                      fontSize: '0.8rem'
                                    }}>
                                      <div>
                                        <div style={{ fontWeight: 600 }}>{item.materialName || item.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.materialCode}</div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        {(item.quantity || 0).toLocaleString()} {item.unit || 'EA'}
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        ₩{(item.unitPrice || 0).toLocaleString()}
                                      </div>
                                      <div style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                                        ₩{(item.totalPrice || 0).toLocaleString()}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {group.orders.length > 10 && !showAllOrders[group.range] && (
                      <tr>
                        <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <Button 
                            variant="outline" 
                            onClick={() => toggleShowAllOrders(group.range)}
                            style={{ fontSize: '0.875rem' }}
                          >
                            모두 보기 ({group.orders.length}개 주문)
                          </Button>
                        </td>
                      </tr>
                    )}
                    {showAllOrders[group.range] && group.orders.length > 10 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <Button 
                            variant="outline" 
                            onClick={() => toggleShowAllOrders(group.range)}
                            style={{ fontSize: '0.875rem' }}
                          >
                            접기
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Array.from(new Set(group.orders.slice(0, 5).map((order: any) => order.materialCode || order.material).filter(Boolean))).map((materialCode: unknown, matIndex: number) => {
                  const materialStr = String(materialCode);
                  const bomItem = bom?.find((b: any) => b.materialCode === materialStr);
                  return (
                    <Badge key={matIndex} variant="outline" className="text-xs">
                      {materialStr} {bomItem ? `(BOM: ${bomItem.requiredQuantity})` : ''}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <Database style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} />
          ERP 데이터 관리
        </h1>
        <p style={subtitleStyle}>
          생성된 대량 ERP 데이터를 조회하고 분석할 수 있습니다.
        </p>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          {loading ? '로딩 중...' : '데이터 새로고침'}
        </Button>
        <Button variant="outline" onClick={handleExportData}>
          <Download style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          데이터 내보내기
        </Button>
        <Button variant="outline" onClick={() => setShowFilterModal(true)}>
          <Filter style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          필터
        </Button>
      </div>

      <div style={tabsStyle}>
        <button
          style={activeTab === 'overview' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('overview')}
        >
          개요
        </button>
        <button
          style={activeTab === 'production' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('production')}
        >
          생산 오더
        </button>
        <button
          style={activeTab === 'bom' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('bom')}
        >
          BOM 관리
        </button>
        <button
          style={activeTab === 'workInstructions' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('workInstructions')}
        >
          작업지시
        </button>
        <button
          style={activeTab === 'inventory' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('inventory')}
        >
          재고 현황
        </button>
        <button
          style={activeTab === 'bomDetail' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('bomDetail')}
        >
          BOM 세부 분석
        </button>
        <button
          style={activeTab === 'timeline' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('timeline')}
        >
          타임라인 분석
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <RefreshCw style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          <p>ERP 데이터를 로딩하고 있습니다...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'production' && renderProductionOrdersTab()}
          {activeTab === 'bom' && renderBOMAnalysisTab()}
          {activeTab === 'workInstructions' && renderWorkInstructionsTab()}
          {activeTab === 'inventory' && renderInventoryTab()}
          {activeTab === 'bomDetail' && renderBOMDetailTab()}
          {activeTab === 'timeline' && renderTimelineTab()}
        </>
      )}
      
      {/* 필터 모달 */}
      {showFilterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            width: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>데이터 필터</h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>기간</label>
                <select 
                  value={filterOptions.dateRange}
                  onChange={(e) => setFilterOptions({...filterOptions, dateRange: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="all">전체 기간</option>
                  <option value="today">오늘</option>
                  <option value="this_week">이번 주</option>
                  <option value="this_month">이번 달</option>
                  <option value="last_month">지난 달</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>회사</label>
                <select 
                  value={filterOptions.company}
                  onChange={(e) => setFilterOptions({...filterOptions, company: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="all">전체 회사</option>
                  <option value="현대자동차">현대자동차</option>
                  <option value="기아자동차">기아자동차</option>
                  <option value="제네시스">제네시스</option>
                  <option value="우신">우신</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>제품</label>
                <select 
                  value={filterOptions.product}
                  onChange={(e) => setFilterOptions({...filterOptions, product: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="all">전체 제품</option>
                  <option value="PREM-SA-004">프리미엄 시트 어셈블리</option>
                  <option value="ELEC-SM-003">전동 시트 모터</option>
                  <option value="SEAT-SR-002">시트 슬라이드 레일</option>
                  <option value="EV9-SR-001">EV9 시트 레일</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>상태</label>
                <select 
                  value={filterOptions.status}
                  onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="all">전체 상태</option>
                  <option value="pending">대기</option>
                  <option value="confirmed">확정</option>
                  <option value="in_progress">진행중</option>
                  <option value="completed">완료</option>
                  <option value="shipped">출하</option>
                  <option value="delivered">납품완료</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setShowFilterModal(false)}>
                취소
              </Button>
              <Button onClick={() => {
                console.log('필터 적용:', filterOptions);
                setShowFilterModal(false);
                loadData(); // 필터 적용 후 데이터 새로고침
              }}>
                필터 적용
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
