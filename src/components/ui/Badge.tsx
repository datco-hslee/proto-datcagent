import React from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className = "" }) => {
  const baseClasses = styles.badge;
  const variantClass = styles[`variant-${variant}`] || styles["variant-default"];

  return <span className={`${baseClasses} ${variantClass} ${className}`}>{children}</span>;
};
