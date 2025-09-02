import * as React from "react";
import styles from "./badge.module.css";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass = variant === "default" ? styles.default : styles[variant];

  return <div className={cn(styles.badge, variantClass, className)} {...props} />;
}

export { Badge };
