// ToolTip.tsx
import React, { useState } from "react";
import "./ToolTip.css";

interface ToolTipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const ToolTip: React.FC<ToolTipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="tooltip"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div
        className={`tooltip__content ${
          isVisible ? "tooltip__content--visible" : "tooltip__content--hidden"
        }`}
        style={{ visibility: isVisible ? "visible" : "hidden" }}
      >
        {content}
      </div>
    </div>
  );
};

export default ToolTip;
