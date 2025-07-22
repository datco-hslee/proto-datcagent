import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { FloatingHelpButton } from "../tutorial/FloatingHelpButton";
import { TutorialOverlay } from "../tutorial/TutorialOverlay";
import { MenuHighlighter } from "../tutorial/MenuHighlighter";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const layoutStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  };

  const mainContentStyle: React.CSSProperties = {
    display: "flex",
    flex: "1",
  };

  const contentAreaStyle: React.CSSProperties = {
    flex: "1",
    marginLeft: "16rem", // 사이드바 너비만큼
    minHeight: "calc(100vh - 4rem)", // 헤더 높이 제외
  };

  return (
    <div style={layoutStyle}>
      <Header />
      <div style={mainContentStyle}>
        <Sidebar />
        <main style={contentAreaStyle}>{children}</main>
      </div>

      {/* 튜토리얼 관련 컴포넌트들 */}
      <MenuHighlighter />
      <FloatingHelpButton />
      <TutorialOverlay />
    </div>
  );
}
