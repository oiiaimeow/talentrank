import React from "react";

type CardProps = {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, hover = false, className = "" }) => {
  const style: React.CSSProperties = {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--spacing-lg)",
    transition: "all 0.3s",
    cursor: hover ? "pointer" : "default",
  };

  const hoverStyle: React.CSSProperties = hover
    ? {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 24px rgba(236, 72, 153, 0.3)",
      }
    : {};

  return (
    <div
      style={style}
      className={className}
      onMouseEnter={(e) => hover && Object.assign(e.currentTarget.style, hoverStyle)}
      onMouseLeave={(e) =>
        hover &&
        Object.assign(e.currentTarget.style, { transform: "translateY(0)", boxShadow: "none" })
      }
    >
      {children}
    </div>
  );
};

