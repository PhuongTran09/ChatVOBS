import { useState } from "react";
import { useChatPreview } from "../hooks/useChatPreview";
import { Control } from "../components/Control";

import "../styles/style.css";
import "../styles/custom.css";
import "../styles/ChatCustomizerPage.css";

import { fields } from "../data/fields";
import { initialValues } from "../data/initialValues";
import { exampleMarkup } from "../data/exampleMarkup";
import { createChatCustomizerHelpers } from "../utils/chatCustomizer";

type Values = Record<string, any>;

export function ChatCustomizerPage({
  onBackHome,
}: {
  onBackHome: () => void;
}) {
  const [values, setValues] = useState<Values>(initialValues);

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

  return (
    <div className="chat-customizer-page fade-in">
      <header className="page-header glass-card slide-down">
        <div className="header-left">
          <button className="btn-icon" onClick={onBackHome}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back</span>
          </button>
          <div className="header-titles">
            <h1 className="page-title">Chat Live Customizer</h1>
          </div>
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
                      <polygon points="5 3 19 12 5 21 5 3"/>
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

            <div
              id="fakebody"
              className="chat-preview custom-scrollbar"
              dangerouslySetInnerHTML={{ __html: exampleMarkup }}
            />
          </section>

          <section className="css-card glass-card">
            <div className="card-header">
             <span className="badge badge-primary">CSS OUTPUT</span>
              <button
                className="btn-secondary copy-button"
                onClick={() => navigator.clipboard.writeText(cssOutput)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
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

      <style>{previewStyle}</style>
    </div>
  );
}