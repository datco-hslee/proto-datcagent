import React from "react";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange";
}

export function MetricsCard({ title, value, change, trend, icon: Icon, color }: MetricsCardProps) {
  const gradientColors = {
    blue: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    green: "linear-gradient(135deg, #10b981, #059669)",
    purple: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    orange: "linear-gradient(135deg, #f59e0b, #d97706)",
  };

  const trendColors = {
    up: "#10b981",
    down: "#ef4444",
    neutral: "#6b7280",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "1rem",
    padding: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  };

  const cardHoverStyle: React.CSSProperties = {
    ...cardStyle,
    transform: "translateY(-2px)",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  };

  const gradientBarStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: gradientColors[color],
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  };

  const iconContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3rem",
    height: "3rem",
    borderRadius: "0.75rem",
    background: gradientColors[color],
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: "0.5rem",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.2,
    marginBottom: "0.75rem",
  };

  const trendContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  };

  const trendTextStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: trendColors[trend],
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div style={isHovered ? cardHoverStyle : cardStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div style={gradientBarStyle} />

      <div style={contentStyle}>
        <div style={{ flex: 1 }}>
          <h3 style={titleStyle}>{title}</h3>
          <p style={valueStyle}>{value}</p>
          <div style={trendContainerStyle}>
            <TrendIcon style={{ height: "1rem", width: "1rem", color: trendColors[trend] }} />
            <span style={trendTextStyle}>{change}</span>
          </div>
        </div>

        <div style={iconContainerStyle}>
          <Icon style={{ height: "1.5rem", width: "1.5rem", color: "white" }} />
        </div>
      </div>
    </div>
  );
}
