import { useState, useEffect } from "react";
import { useChatPreview } from "../hooks/useChatPreview";
import "../styles/ChatCustomizerPage.css";

import type { CustomizerValues } from "../types/customizer";
import { initialValues } from "../data/initialValues";
import { createChatCustomizerHelpers, parseCssToValues } from "../utils/chatCustomizer";

// Import components
import { CustomizerHeader } from "../components/CustomizerHeader";
import { ControlPanel } from "../components/ControlPanel";
import { PreviewSection } from "../components/PreviewSection";
import { ImportModal } from "../components/ImportModal";
import { youtubeChatStructureCss } from "../data/youtubeChatStructure";
import { useI18n } from "../i18n";

export function ChatCustomizerPage({
  onBackHome,
}: {
  onBackHome: () => void;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState<CustomizerValues>(initialValues);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [importCss, setImportCss] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const { callbacks, generateStyle } = createChatCustomizerHelpers(values);

  const { cssOutput, previewStyle, setLastChangedId, setAnimationTick } = useChatPreview(
    values,
    generateStyle,
    callbacks
  );

  const setValue = (id: string, value: string | number | boolean) => {
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
    setLastChangedId(id);
  };

  const handleCopySuccess = () => {
    setToastType("success");
    setToastMessage(t('preview.copied_msg'));
    setShowToast(true);
  };

  const handleCssOutputChange = (newCss: string) => {
    try {
      const parsedValues = parseCssToValues(newCss, values);
      // Only update if something actually changed to avoid unnecessary re-renders
      if (JSON.stringify(parsedValues) !== JSON.stringify(values)) {
        setValues(parsedValues);
      }
    } catch {
      // Ignore errors during typing in the CSS output
    }
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsImportModalOpen(false);
      setIsClosing(false);
    }, 400);
  };

  const handleImportCss = () => {
    if (!importCss.trim()) return;
    try {
      const parsedValues = parseCssToValues(importCss, values);
      setValues(parsedValues);
      closeModal();
      setImportCss("");
      setToastType("success");
      setToastMessage(t('import.success_msg'));
      setShowToast(true); // Show success toast on import
    } catch {
      setToastType("error");
      setToastMessage(t('import.error_msg'));
      setShowToast(true);
    }
  };

  const combinedCss = `
  ${youtubeChatStructureCss}
  ${previewStyle}
  `;

  return (
    <div className="chat-customizer-page fade-in">
      {showToast && (
        <div className={`copy-toast windows-alert-compact ${toastType}`}>
          <div className="toast-body-compact">
            <div className="toast-icon-wrapper-compact">
              {toastType === "success" ? (
                <svg className="toast-icon-compact" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg className="toast-icon-compact" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
            </div>
            <span className="toast-message-compact">{toastMessage}</span>
            <button className="toast-close-btn-compact" onClick={() => setShowToast(false)}>×</button>
          </div>
          <div className="toast-progress-container-compact">
            <div className="toast-progress-bar-compact"></div>
          </div>
        </div>
      )}

      <CustomizerHeader 
        onBackHome={onBackHome} 
        onImportClick={() => setIsImportModalOpen(true)}
      />

      <div className="page-grid">
        <ControlPanel 
          values={values} 
          setValue={setValue} 
          setAnimationTick={setAnimationTick} 
        />

        <PreviewSection 
          combinedCss={combinedCss} 
          cssOutput={cssOutput} 
          onCssChange={handleCssOutputChange}
          onCopySuccess={handleCopySuccess}
        />
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        isClosing={isClosing}
        importCss={importCss}
        setImportCss={setImportCss}
        onClose={closeModal}
        onImport={handleImportCss}
      />
    </div>
  );
}
