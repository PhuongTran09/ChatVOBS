import { ShadowPreview } from "./ShadowPreview";
import { getExampleMarkup } from "../data/exampleMarkup";
import { useI18n } from "../i18n";
import "./PreviewSection.css";

interface PreviewSectionProps {
  combinedCss: string;
  cssOutput: string;
  onCssChange?: (css: string) => void;
  onCopySuccess?: () => void;
}

export const PreviewSection = ({
  combinedCss,
  cssOutput,
  onCssChange,
  onCopySuccess,
}: PreviewSectionProps) => {
  const { t } = useI18n();

  const handleCopy = () => {
    navigator.clipboard.writeText(cssOutput);
    onCopySuccess?.();
  };

  return (
    <div className="preview-panel slide-left">
      <section className="preview-card glass-card">
        <div className="card-header">
          <div className="header-titles">
            <span className="badge badge-primary">{t('preview.example')}</span>
          </div>
          <div className="live-indicator">
            <span className="status-dot green pulse-anim" />
            {t('preview.active')}
          </div>
        </div>

        <ShadowPreview
          id="fakebody"
          className="chat-preview"
          htmlContent={getExampleMarkup(t)}
          cssContent={combinedCss}
        />
      </section>

      <section className="css-card glass-card">
        <div className="card-header">
          <span className="badge badge-primary">{t('preview.css_output')}</span>
          <button
            className="btn-secondary copy-button"
            onClick={handleCopy}
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
            {t('preview.copy_css')}
          </button>
        </div>

        <textarea
          className="css-output custom-scrollbar"
          value={cssOutput}
          onChange={(e) => onCssChange?.(e.target.value)}
          spellCheck={false}
          rows={12}
        />
      </section>
    </div>
  );
};
