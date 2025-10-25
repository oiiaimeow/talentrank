import React from "react";

type InputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "email" | "password" | "datetime-local" | "date" | "time";
  disabled?: boolean;
  error?: string;
  fullWidth?: boolean;
};

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false,
  error,
  fullWidth = false,
}) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-xs)",
    width: fullWidth ? "100%" : "auto",
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--color-card)",
    border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
    borderRadius: "var(--radius)",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    color: "var(--color-text)",
    transition: "border-color 0.2s",
    width: "100%",
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text)" }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
        onFocus={(e) => !error && (e.target.style.borderColor = "var(--color-primary)")}
        onBlur={(e) => (e.target.style.borderColor = error ? "var(--color-error)" : "var(--color-border)")}
      />
      {error && (
        <span style={{ fontSize: "0.75rem", color: "var(--color-error)" }}>{error}</span>
      )}
    </div>
  );
};

type TextAreaProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  rows?: number;
  fullWidth?: boolean;
};

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  rows = 4,
  fullWidth = false,
}) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-xs)",
    width: fullWidth ? "100%" : "auto",
  };

  const textareaStyle: React.CSSProperties = {
    background: "var(--color-card)",
    border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
    borderRadius: "var(--radius)",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    color: "var(--color-text)",
    transition: "border-color 0.2s",
    width: "100%",
    resize: "vertical",
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text)" }}>
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        style={textareaStyle}
        onFocus={(e) => !error && (e.target.style.borderColor = "var(--color-primary)")}
        onBlur={(e) => (e.target.style.borderColor = error ? "var(--color-error)" : "var(--color-border)")}
      />
      {error && (
        <span style={{ fontSize: "0.75rem", color: "var(--color-error)" }}>{error}</span>
      )}
    </div>
  );
};

