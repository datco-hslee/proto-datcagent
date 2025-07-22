import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { useTutorialStore } from "@/store/tutorialStore";

export function FloatingHelpButton() {
  const [isHovered, setIsHovered] = useState(false);

  // Zustand store 사용 시도해보고, 에러가 있으면 기본값 사용
  let isActive = false;
  let activateTutorial = () => console.log("Tutorial activation attempted");

  try {
    const store = useTutorialStore();
    isActive = store.isActive;
    activateTutorial = store.activateTutorial;
  } catch (error) {
    console.error("Error accessing tutorial store:", error);
  }

  // 디버깅용 콘솔 로그
  useEffect(() => {
    console.log("FloatingHelpButton mounted, isActive:", isActive);
  }, []);

  const handleClick = () => {
    console.log("FloatingHelpButton clicked");
    try {
      activateTutorial();
    } catch (error) {
      console.error("Error activating tutorial:", error);
    }
  };

  // 강제로 항상 렌더링 (디버깅용)
  console.log("FloatingHelpButton render, isActive:", isActive);

  return (
    <>
      {/* 매우 간단한 버전 */}
      <div
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 9999,
          width: "60px",
          height: "60px",
          backgroundColor: "#3b82f6",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          border: "2px solid white",
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <HelpCircle size={24} color="white" strokeWidth={2} />
      </div>

      {/* 툴팁 */}
      {isHovered && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "32px",
            zIndex: 10000,
            backgroundColor: "#1f2937",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "14px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          도움이 필요하신가요? 🤗
        </div>
      )}


    </>
  );
}
