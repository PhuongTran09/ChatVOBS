import React from "react";
import "./ImportModal.css";

interface ImportModalProps {
  isOpen: boolean;
  isClosing: boolean;
  importCss: string;
  setImportCss: (css: string) => void;
  onClose: () => void;
  onImport: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  isClosing,
  importCss,
  setImportCss,
  onClose,
  onImport,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? "fade-out" : "fade-in"}`}
      onClick={onClose}
    >
      <div
        className={`modal-content glass-card ${
          isClosing ? "glass-out" : "glass-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Import Custom CSS</h3>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>
            Dán đoạn code CSS đã lưu của bạn vào đây để khôi phục các cài đặt.
          </p>
          <textarea
            className="modern-input custom-scrollbar"
            placeholder=":root { ..."
            value={importCss}
            onChange={(e) => setImportCss(e.target.value)}
            rows={10}
          />
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-primary" onClick={onImport}>
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};
