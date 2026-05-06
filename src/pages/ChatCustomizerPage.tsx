import { useState } from "react";
import { useChatPreview } from "../hooks/useChatPreview";
import { Control } from "../components/Control";
import "../styles/style.css";
import "../styles/custom.css";
import "../styles/ChatCustomizerPage.css";
import {
  exampleMarkup,
  fields,
  initialValues,
} from "../data/chatCustomizerData";
import { createChatCustomizerHelpers } from "../utils/chatCustomizer";

type Values = Record<string, any>;

export function ChatCustomizerPage({
  onBackHome,
}: {
  onBackHome: () => void;
}) {
  const [values, setValues] = useState<Values>(initialValues);

  const { callbacks, isChecked, generateStyle } =
    createChatCustomizerHelpers(values);

  const { cssOutput, previewStyle, setLastChangedId, setAnimationTick } =
    useChatPreview(values, generateStyle, callbacks, isChecked);

  const setValue = (id: string, value: any) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    setLastChangedId(id);
  };

  return (
    <div className="chat-customizer-page">
      <div className="page-header">
        <button className="back-button" onClick={onBackHome}>
          ← Back
        </button>
        <h2>Chat live Custom</h2>
      </div>

      <div className="page-grid">
        <aside className="customizer-panel">
          {fields.map((group) => (
            <section className="control-group" key={group.title}>
              <h3>{group.title}</h3>
              <div className="group-controls">
                {group.controls.map((control) => (
                  <Control
                    key={control.id}
                    control={control}
                    values={values}
                    setValue={setValue}
                  />
                ))}
              </div>

              {group.title === "Animation" && (
                <button
                  className="play-animation"
                  onClick={() => setAnimationTick((v) => v + 1)}
                >
                  Play animation
                </button>
              )}
            </section>
          ))}
        </aside>

        <div className="preview-panel">
          <div className="preview-card">
            <h3>Example</h3>
            <div
              id="fakebody"
              className="chat-preview"
              dangerouslySetInnerHTML={{ __html: exampleMarkup }}
            />
          </div>

          <div className="css-card">
            <h3>CSS</h3>
            <textarea className="css-output" value={cssOutput} readOnly rows={12} />
          </div>
        </div>
      </div>

      <style>{previewStyle}</style>
    </div>
  );
}