import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseClasses = styles.button;
  const variantClass = styles[`variant-${variant}`] || styles["variant-default"];
  const sizeClass = styles[`size-${size}`] || styles["size-default"];

  return (
    <button className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
