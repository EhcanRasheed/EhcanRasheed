import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error:   (msg, duration) => addToast(msg, 'error',   duration),
    info:    (msg, duration) => addToast(msg, 'info',    duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/* ─── Visual Component ─────────────────────────────── */

const typeStyles = {
  success: {
    background: 'rgba(20, 40, 26, 0.97)',
    border: '1px solid rgba(34,197,94,0.35)',
    color: '#3faa72',
    icon: '✓',
    iconBg: 'rgba(34,197,94,0.15)',
  },
  error: {
    background: 'rgba(40, 18, 18, 0.97)',
    border: '1px solid rgba(239,68,68,0.35)',
    color: '#dc4a4a',
    icon: '✕',
    iconBg: 'rgba(239,68,68,0.15)',
  },
  info: {
    background: 'rgba(15, 20, 45, 0.97)',
    border: '1px solid rgba(196,160,82,0.2)',
    color: '#d4b062',
    icon: 'i',
    iconBg: 'rgba(196,160,82,0.10)',
  },
};

function ToastItem({ toast, onRemove }) {
  const s = typeStyles[toast.type] || typeStyles.info;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        borderRadius: '10px',
        background: s.background,
        border: s.border,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        minWidth: '280px',
        maxWidth: '420px',
        pointerEvents: 'auto',
        animation: 'toastSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: s.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: s.color,
          fontWeight: 800,
          fontSize: '13px',
          flexShrink: 0,
        }}
      >
        {s.icon}
      </div>
      <span style={{ color: s.color, fontSize: '14px', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: s.color,
          opacity: 0.5,
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </div>
    </>
  );
}
