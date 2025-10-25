import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
}) => {
  const baseStyle: React.CSSProperties = {
    fontWeight: 600,
    borderRadius: "var(--radius)",
    transition: "all 0.2s",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? "100%" : "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  };

  const sizeStyles = {
    sm: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
    md: { padding: "0.75rem 1.5rem", fontSize: "1rem" },
    lg: { padding: "1rem 2rem", fontSize: "1.125rem" },
  };

  const variantStyles = {
    primary: {
      background: "linear-gradient(135deg, var(--color-primary), #F472B6)",
      color: "white",
    },
    secondary: {
      background: "linear-gradient(135deg, var(--color-secondary), #A78BFA)",
      color: "white",
    },
    outline: {
      background: "transparent",
      color: "var(--color-text)",
      border: "2px solid var(--color-border)",
    },
    ghost: {
      background: "rgba(255, 255, 255, 0.05)",
      color: "var(--color-text)",
    },
  };

  return (
    <button
      type={type}
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

