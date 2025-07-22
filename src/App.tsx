import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { CustomersPage } from "./pages/CustomersPage";
import { OrdersPage } from "./pages/OrdersPage";
import { InventoryPage } from "./pages/InventoryPage";
import { QuotesPage } from "./pages/QuotesPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { CrmPipelinePage } from "./pages/CrmPipelinePage";
import { SalesAnalyticsPage } from "./pages/SalesAnalyticsPage";
import { ProductionOrderPage } from "./pages/ProductionOrderPage";
import { WorkInstructionPage } from "./pages/WorkInstructionPage";
import { BomManagementPage } from "./pages/BomManagementPage";
import { PurchasePage } from "./pages/PurchasePage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { PayrollPage } from "./pages/PayrollPage";
import { AttendancePage } from "./pages/AttendancePage";
import { ShippingPage } from "./pages/ShippingPage";
import { BudgetPage } from "./pages/BudgetPage";
import { TaxPage } from "./pages/TaxPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AccountingPage } from "./pages/AccountingPage";
import { ProjectsPage } from "./pages/ProjectsPage";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* 고객 비즈니스 모듈 */}
        <Route path="/crm-pipeline" element={<CrmPipelinePage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/sales-analytics" element={<SalesAnalyticsPage />} />

        {/* 생산 관리 모듈 */}
        <Route path="/production-orders" element={<ProductionOrderPage />} />
        <Route path="/work-instructions" element={<WorkInstructionPage />} />
        <Route path="/bom" element={<BomManagementPage />} />

        <Route path="/purchasing" element={<PurchasePage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/accounting" element={<AccountingPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/taxes" element={<TaxPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/documents" element={<div style={{ padding: "2rem" }}>문서 관리 페이지</div>} />
        <Route path="/calendar" element={<div style={{ padding: "2rem" }}>일정 관리 페이지</div>} />
        <Route path="/communication" element={<div style={{ padding: "2rem" }}>커뮤니케이션 페이지</div>} />
        <Route path="/quality" element={<div style={{ padding: "2rem" }}>품질 관리 페이지</div>} />
        <Route path="/settings" element={<div style={{ padding: "2rem" }}>설정 페이지</div>} />
        <Route path="/permissions" element={<div style={{ padding: "2rem" }}>사용자 권한 페이지</div>} />
        <Route path="/integrations" element={<div style={{ padding: "2rem" }}>통합 관리 페이지</div>} />
      </Routes>
    </AppLayout>
  );
}

export default App;
