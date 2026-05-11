import { useState } from "react";
import { useChatPreview } from "../hooks/useChatPreview";
import { Control } from "../components/Control";
import "../styles/ChatCustomizerPage.css";

import { fields } from "../data/fields";
import { initialValues } from "../data/initialValues";
import { exampleMarkup } from "../data/exampleMarkup";
import { createChatCustomizerHelpers, parseCssToValues } from "../utils/chatCustomizer";

// Import 2 file mới tạo
import { ShadowPreview } from "../components/ShadowPreview";
import { youtubeChatStructureCss } from "../data/youtubeChatStructure";

type Values = Record<string, any>;

export function ChatCustomizerPage({
  onBackHome,
}: {
  onBackHome: () => void;
}) {
  const [values, setValues] = useState<Values>(initialValues);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [importCss, setImportCss] = useState("");

  const { callbacks, isChecked, generateStyle } = createChatCustomizerHelpers(values);

  const { cssOutput, previewStyle, setLastChangedId, setAnimationTick } = useChatPreview(
    values,
    generateStyle,
    callbacks,
    isChecked
  );

  const setValue = (id: string, value: any) => {
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
    } catch (error) {
      alert("Lỗi khi đọc CSS. Vui lòng kiểm tra lại định dạng!");
    }
  };

  const combinedCss = `
  ${youtubeChatStructureCss}
  ${previewStyle}
  `;

  return (
    <div className="chat-customizer-page fade-in">
      <header className="page-header glass-card slide-down">
        <div className="header-left">
          <button className="btn-icon" onClick={onBackHome}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <div className="header-titles">
            <h1 className="page-title">Chat Live Customizer</h1>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setIsImportModalOpen(true)}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
             <span>Import CSS</span>
          </button>
        </div>
      </header>

      <div className="page-grid">
        <aside className="customizer-panel glass-card slide-right">
          <div className="panel-header">
            <span className="badge badge-primary">CONTROL</span>
            <span className="badge badge-secondary">{fields.length} groups</span>
          </div>

          <div className="panel-content custom-scrollbar">
            {fields.map((group) => (
              <section className="control-group" key={group.title}>
                <div className="group-heading">
                  <h3>{group.title}</h3>
                </div>
                {group.colors && (
                  <div className="color-group fade-in-up">
                    {group.colors.map((control) => (
                      <Control key={control.id} control={control} values={values} setValue={setValue} />
                    ))}
                  </div>
                )}

                {group.controls && (
                  <div className="group-controls fade-in-up">
                    {group.controls.map((control) => (
                      <Control key={control.id} control={control} values={values} setValue={setValue} />
                    ))}
                  </div>
                )}

                {group.checkboxes && (
                  <div className="checkbox-group fade-in-up">
                    {group.checkboxes.map((control) => (
                      <Control key={control.id} control={control} values={values} setValue={setValue} />
                    ))}
                  </div>
                )}

                {group.title === "Animation" && (
                  <button
                    className="btn-primary play-animation fade-in-up"
                    onClick={() => setAnimationTick((v) => v + 1)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Play Animation
                  </button>
                )}
              </section>
            ))}
          </div>
        </aside>

        <div className="preview-panel slide-left">
          <section className="preview-card glass-card">
            <div className="card-header">
              <div className="header-titles">
                <span className="badge badge-primary">PREVIEW EXAMPLE</span>
              </div>
              <div className="live-indicator">
                <span className="status-dot green pulse-anim" />
                Active
              </div>
            </div>

            <ShadowPreview
              id="fakebody"
              className="chat-preview"
              htmlContent={exampleMarkup}
              cssContent={combinedCss} 
            />
          </section>

          <section className="css-card glass-card">
            <div className="card-header">
              <span className="badge badge-primary">CSS OUTPUT</span>
              <button
                className="btn-secondary copy-button"
                onClick={() => {
                   navigator.clipboard.writeText(cssOutput);
                   alert("Đã copy CSS vào bộ nhớ tạm!");
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy CSS
              </button>
            </div>

            <textarea
              className="css-output custom-scrollbar"
              value={cssOutput}
              readOnly
              rows={12}
            />
          </section>
        </div>
      </div>

      {/* Modal Import CSS */}
      {isImportModalOpen && (
        <div className={`modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`} onClick={closeModal}>
          <div className={`modal-content glass-card ${isClosing ? 'glass-out' : 'glass-in'}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Import Custom CSS</h3>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Dán đoạn code CSS đã lưu của bạn vào đây để khôi phục các cài đặt.</p>
              <textarea
                className="modern-input custom-scrollbar"
                placeholder=":root { ..."
                value={importCss}
                onChange={(e) => setImportCss(e.target.value)}
                rows={10}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Hủy</button>
              <button className="btn-primary" onClick={handleImportCss}>Áp dụng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}