import React, { useState } from "react";
import { Settings, Save, RefreshCw, Bell, Shield, Globe, Palette } from "lucide-react";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: true,
    },
    display: {
      theme: "light",
      language: "ko",
      timezone: "Asia/Seoul",
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
    system: {
      autoBackup: true,
      backupFrequency: "daily",
      dataRetention: 365,
    }
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb",
    marginBottom: "1.5rem",
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    width: "100%",
  };

  const handleSave = () => {
    alert("설정이 저장되었습니다.");
  };

  return (
    <div style={{ padding: "1.5rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>시스템 설정</h1>
          <p style={{ color: "#6b7280" }}>시스템 환경설정 및 개인화 옵션을 관리하세요</p>
        </div>
        <button style={primaryButtonStyle} onClick={handleSave}>
          <Save size={16} />
          설정 저장
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {/* 알림 설정 */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Bell size={20} style={{ color: "#3b82f6" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>알림 설정</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: e.target.checked }
                }))}
              />
              <span>이메일 알림</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: e.target.checked }
                }))}
              />
              <span>푸시 알림</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, sms: e.target.checked }
                }))}
              />
              <span>SMS 알림</span>
            </label>
          </div>
        </div>

        {/* 화면 설정 */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Palette size={20} style={{ color: "#3b82f6" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>화면 설정</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                테마
              </label>
              <select
                value={settings.display.theme}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  display: { ...prev.display, theme: e.target.value }
                }))}
                style={inputStyle}
              >
                <option value="light">라이트</option>
                <option value="dark">다크</option>
                <option value="auto">자동</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                언어
              </label>
              <select
                value={settings.display.language}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  display: { ...prev.display, language: e.target.value }
                }))}
                style={inputStyle}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        {/* 보안 설정 */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Shield size={20} style={{ color: "#3b82f6" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>보안 설정</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={settings.security.twoFactor}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, twoFactor: e.target.checked }
                }))}
              />
              <span>2단계 인증</span>
            </label>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                세션 타임아웃 (분)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                }))}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* 시스템 설정 */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Settings size={20} style={{ color: "#3b82f6" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827" }}>시스템 설정</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={settings.system.autoBackup}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, autoBackup: e.target.checked }
                }))}
              />
              <span>자동 백업</span>
            </label>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                백업 주기
              </label>
              <select
                value={settings.system.backupFrequency}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, backupFrequency: e.target.value }
                }))}
                style={inputStyle}
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
