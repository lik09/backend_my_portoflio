// Toast.jsx
import React, { useEffect } from "react";
import { Alert } from "antd";

export default function Toast({ type = "info", message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 70,
        right: 20,
        zIndex: 9999,
        minWidth: 250,
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <Alert
        message={message}
        type={type} // "success" | "error" | "info" | "warning"
        showIcon
        closable
        onClose={onClose}
      />
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
