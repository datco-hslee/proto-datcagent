import * as React from "react";
import styles from "./button.module.css";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variantClass = variant === "default" ? styles.default : styles[variant];
  const sizeClass = size === "default" ? styles.default_size : styles[size];

  return <button className={cn(styles.button, variantClass, sizeClass, className)} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button };
