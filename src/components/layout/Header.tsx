import React, { useState } from "react";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/Logo";
import { AIAssistant } from "./AIAssistant";

interface HeaderProps {
  currentUser?: {
    name: string;
    role: string;
    avatar?: string;
  };
  notifications?: number;
}

export function Header({ currentUser, notifications = 0 }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    height: "4rem",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "none",
    padding: "0 1.5rem",
  };

  const leftSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  };

  const logoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem", // 간격을 늘려서 더 자연스럽게
  };

  const logoIconStyle: React.CSSProperties = {
    display: "flex",
    height: "1.75rem", // 28px에 맞게 조정
    width: "1.75rem", // 28px에 맞게 조정
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    background: "transparent", // 배경 제거
    color: "white",
    // boxShadow 제거
  };

  const logoTextStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: "1.25rem",
    background: "linear-gradient(135deg, #1f2937, #374151)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const notificationButtonStyle: React.CSSProperties = {
    position: "relative",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "none",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(8px)",
    transition: "all 0.2s ease",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  };

  const userSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  const avatarStyle: React.CSSProperties = {
    height: "2rem",
    width: "2rem",
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Left: Logo & Search */}
        <div style={leftSectionStyle}>
          {/* Logo */}
          <div style={logoStyle}>
            <div style={logoIconStyle}>
              <Logo width={28} height={28} className="drop-shadow-sm" />
            </div>
            <span style={logoTextStyle}>닷코 제조업무해결사</span>
          </div>

          {/* AI Assistant */}
          <AIAssistant
            isExpanded={isSearchFocused}
            onToggle={() => setIsSearchFocused(!isSearchFocused)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Right: Notifications & User */}
        <div style={rightSectionStyle}>
          {/* Notifications */}
          <button style={notificationButtonStyle}>
            <Bell style={{ height: "1.25rem", width: "1.25rem", color: "#374151" }} />
            {notifications > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "-0.25rem",
                  right: "-0.25rem",
                  height: "1.25rem",
                  width: "1.25rem",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {notifications > 9 ? "9+" : notifications}
              </div>
            )}
          </button>

          {/* User Profile */}
          <div style={userSectionStyle}>
            <div style={avatarStyle}>
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              ) : (
                <User style={{ height: "1rem", width: "1rem", color: "#6b7280" }} />
              )}
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1f2937" }}>{currentUser?.name || "김대표"}</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{currentUser?.role || "대표"}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
