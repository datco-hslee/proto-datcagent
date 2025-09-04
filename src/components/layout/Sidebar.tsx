import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  MessageSquare,
  DollarSign,
  Building2,
  UserCheck,
  Truck,
  Briefcase,
  Shield,
  Clock,
  Layers,
  BookOpen,
  PieChart,
  ChevronDown,
  ChevronRight,
  Database,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["quick-access"]));

  const sidebarStyle: React.CSSProperties = {
    width: "16rem",
    height: "calc(100vh - 4rem)",
    background: "linear-gradient(180deg, rgba(30, 58, 138, 0.95) 0%, rgba(99, 102, 241, 0.9) 100%)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    position: "fixed",
    left: 0,
    top: "4rem",
    zIndex: 40,
    overflow: "auto",
    boxShadow: "4px 0 24px rgba(0, 0, 0, 0.1)",
  };

  const sidebarContentStyle: React.CSSProperties = {
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  };

  const sectionStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.75rem",
    padding: "0.75rem",
    backdropFilter: "blur(8px)",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "rgba(255, 255, 255, 0.95)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.5rem",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    transition: "all 0.2s ease",
  };

  const sectionHeaderHoverStyle: React.CSSProperties = {
    ...sectionHeaderStyle,
    background: "rgba(255, 255, 255, 0.1)",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.5rem",
  };

  const navListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
  };

  const navItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.9)",
    textDecoration: "none",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const navItemHoverStyle: React.CSSProperties = {
    ...navItemStyle,
    background: "rgba(255, 255, 255, 0.15)",
    color: "white",
    transform: "translateX(4px)",
  };

  const navItemActiveStyle: React.CSSProperties = {
    ...navItemStyle,
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  };

  const badgeStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 600,
    backgroundColor: "#ef4444",
    color: "white",
    borderRadius: "0.375rem",
    padding: "0.125rem 0.375rem",
    minWidth: "1.25rem",
    textAlign: "center",
    marginLeft: "auto",
  };

  const quickAccessItems = [
    { name: "대시보드", icon: LayoutDashboard, path: "/", badge: null },
    { name: "CRM 파이프라인", icon: Users, path: "/crm-pipeline", badge: "5" },
    { name: "고객", icon: Users, path: "/customers", badge: "3" },
    { name: "주문", icon: ShoppingCart, path: "/orders", badge: "12" },
    { name: "재고", icon: Package, path: "/inventory", badge: null },
  ];

  const mainNavSections = [
    {
      id: "sales-customer",
      title: "영업 & 고객",
      icon: Users,
      dataMenu: "customer-business",
      items: [
        { name: "CRM 파이프라인", icon: Users, path: "/crm-pipeline", badge: "5", dataMenu: "crm-pipeline" },
        { name: "고객 관리", icon: Users, path: "/customers", badge: null, dataMenu: "customer-management" },
        { name: "주문 관리", icon: ShoppingCart, path: "/orders", badge: "5", dataMenu: "order-management" },
        { name: "견적 관리", icon: FileText, path: "/quotes", badge: null, dataMenu: "quote-management" },
        { name: "영업 분석", icon: BarChart3, path: "/sales-analytics", badge: null, dataMenu: "sales-analytics" },
      ],
    },
    {
      id: "production-mrp",
      title: "생산 & MRP",
      icon: Settings,
      dataMenu: "production-mrp",
      items: [
        { name: "생산 오더", icon: Settings, path: "/production-orders", badge: "3", dataMenu: "production-orders" },
        { name: "BOM 관리", icon: Layers, path: "/bom", badge: null, dataMenu: "bom" },
        { name: "작업 지시", icon: Clock, path: "/work-instructions", badge: "7", dataMenu: "work-instructions" },
      ],
    },
    {
      id: "inventory-purchase",
      title: "재고 & 구매",
      icon: Package,
      dataMenu: "inventory-purchase",
      items: [
        { name: "재고 관리", icon: Package, path: "/inventory", badge: "2", dataMenu: "inventory" },
        { name: "구매 관리", icon: DollarSign, path: "/purchasing", badge: null, dataMenu: "purchasing" },
        { name: "공급업체", icon: Building2, path: "/suppliers", badge: null, dataMenu: "suppliers" },
        { name: "배송 관리", icon: Truck, path: "/shipping", badge: null, dataMenu: "shipping" },
      ],
    },
    {
      id: "hr-payroll",
      title: "인사 & 급여",
      icon: UserCheck,
      dataMenu: "company-operations",
      items: [
        { name: "직원 관리", icon: UserCheck, path: "/employees", badge: null, dataMenu: "hr-management" },
        { name: "급여 관리", icon: DollarSign, path: "/payroll", badge: null, dataMenu: "payroll" },
        { name: "근태 관리", icon: Clock, path: "/attendance", badge: null, dataMenu: "attendance" },
        { name: "프로젝트", icon: Briefcase, path: "/projects", badge: "3", dataMenu: "projects" },
      ],
    },
    {
      id: "accounting-finance",
      title: "회계 & 재무",
      icon: PieChart,
      items: [
        { name: "회계 관리", icon: PieChart, path: "/accounting", badge: null },
        { name: "예산 관리", icon: BarChart3, path: "/budget", badge: null },
        { name: "세금 관리", icon: FileText, path: "/taxes", badge: null },
        { name: "보고서", icon: FileText, path: "/reports", badge: null },
      ],
    },
    {
      id: "operations",
      title: "운영",
      icon: Briefcase,
      items: [
        { name: "문서 관리", icon: BookOpen, path: "/documents", badge: null },
        { name: "일정 관리", icon: Calendar, path: "/calendar", badge: null },
        { name: "커뮤니케이션", icon: MessageSquare, path: "/communication", badge: "7" },
        { name: "품질 관리", icon: Shield, path: "/quality", badge: null },
      ],
    },
    {
      id: "system",
      title: "시스템",
      icon: Settings,
      items: [
        { name: "설정", icon: Settings, path: "/settings", badge: null },
        { name: "사용자 권한", icon: Shield, path: "/permissions", badge: null },
        { name: "통합 관리", icon: Layers, path: "/integrations", badge: null },
        { name: "ERP 데이터 관리", icon: Database, path: "/erp-data", badge: null },
      ],
    },
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const NavItem = ({
    item,
    isActive = false,
  }: {
    item: { name: string; icon: any; path: string; badge: string | null; dataMenu?: string };
    isActive?: boolean;
  }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <NavLink
        to={item.path}
        style={isActive ? navItemActiveStyle : isHovered ? navItemHoverStyle : navItemStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-menu={item.dataMenu}
      >
        <item.icon style={{ height: "1rem", width: "1rem" }} />
        <span>{item.name}</span>
        {item.badge && <span style={badgeStyle}>{item.badge}</span>}
      </NavLink>
    );
  };

  const SectionHeader = ({
    section,
    isExpanded,
    onToggle,
  }: {
    section: { id: string; title: string; icon: any };
    isExpanded: boolean;
    onToggle: () => void;
  }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div
        style={isHovered ? sectionHeaderHoverStyle : sectionHeaderStyle}
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <section.icon style={{ height: "1rem", width: "1rem" }} />
          <span>{section.title}</span>
        </div>
        {isExpanded ? <ChevronDown style={{ height: "1rem", width: "1rem" }} /> : <ChevronRight style={{ height: "1rem", width: "1rem" }} />}
      </div>
    );
  };

  return (
    <div style={sidebarStyle}>
      <div style={sidebarContentStyle}>
        {/* Quick Access */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>빠른 액세스</h3>
          <div style={navListStyle}>
            {quickAccessItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Main Navigation with Accordion */}
        {mainNavSections.map((section) => (
          <div key={section.id} style={sectionStyle} data-menu={section.dataMenu} data-section-id={section.id}>
            <SectionHeader section={section} isExpanded={expandedSections.has(section.id)} onToggle={() => toggleSection(section.id)} />
            {expandedSections.has(section.id) && (
              <div style={navListStyle}>
                {section.items.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
