import type { MouseEvent } from "react";
import { useI18n } from "../i18n";
import "./ImportModal.css";

interface ImportModalProps {
  isOpen: boolean;
  isClosing: boolean;
  importCss: string;
  setImportCss: (css: string) => void;
  onClose: () => void;
  onImport: () => void;
}

export const ImportModal = ({
  isOpen,
  isClosing,
  importCss,
  setImportCss,
  onClose,
  onImport,
}: ImportModalProps) => {
  const { t } = useI18n();
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
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{t('import.title')}</h3>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>
            {t('import.description')}
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
            {t('import.cancel')}
          </button>
          <button className="btn-primary" onClick={onImport}>
            {t('import.apply')}
          </button>
        </div>
      </div>
    </div>
  );
};
