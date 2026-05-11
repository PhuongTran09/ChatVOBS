import React from "react";
import { ShadowPreview } from "./ShadowPreview";
import { exampleMarkup } from "../data/exampleMarkup";
import "./PreviewSection.css";

interface PreviewSectionProps {
  combinedCss: string;
  cssOutput: string;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  combinedCss,
  cssOutput,
}) => {
  return (
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
  );
};
