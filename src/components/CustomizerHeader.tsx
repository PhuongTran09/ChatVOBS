import React from "react";
import "./CustomizerHeader.css";

interface CustomizerHeaderProps {
  onBackHome: () => void;
  onImportClick: () => void;
}

export const CustomizerHeader: React.FC<CustomizerHeaderProps> = ({
  onBackHome,
  onImportClick,
}) => {
  return (
    <header className="page-header glass-card slide-down">
      <div className="header-left">
        <button className="btn-icon" onClick={onBackHome}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <div className="header-titles">
          <h1 className="page-title">Chat Live Customizer</h1>
        </div>
      </div>
      <div className="header-actions">
        <button className="btn-primary" onClick={onImportClick}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          <span>Import CSS</span>
        </button>
      </div>
    </header>
  );
};
