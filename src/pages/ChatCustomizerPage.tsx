import { useState } from "react";
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

export function ChatCustomizerPage({
  onBackHome,
}: {
  onBackHome: () => void;
}) {
  const [values, setValues] = useState<CustomizerValues>(initialValues);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [importCss, setImportCss] = useState("");

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
    } catch {
      alert("Lỗi khi đọc CSS. Vui lòng kiểm tra lại định dạng!");
    }
  };

  const combinedCss = `
  ${youtubeChatStructureCss}
  ${previewStyle}
  `;

  return (
    <div className="chat-customizer-page fade-in">
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
