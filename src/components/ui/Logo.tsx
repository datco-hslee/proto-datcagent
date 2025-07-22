import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ width = 32, height = 32, className = "" }) => {
  return (
    <img
      src="/datco-icon.png"
      alt="닷코 로고"
      width={width}
      height={height}
      className={`transition-all duration-300 ${className}`}
      style={{
        objectFit: "contain",
        display: "block",
      }}
    />
  );
};
