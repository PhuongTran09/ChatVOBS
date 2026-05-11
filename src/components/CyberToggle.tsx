import React from 'react';
import './CyberToggle.css';

interface CyberToggleProps {
  labelLeft?: string;
  labelRight?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  activeColor?: 'cyan' | 'magenta' | 'green';
}

export const CyberToggle: React.FC<CyberToggleProps> = ({
  labelLeft,
  labelRight,
  value,
  onChange,
  activeColor = 'cyan',
}) => {
  return (
    <div className={`cyber-toggle-container color-${activeColor}`}>
      {labelLeft && <span className={`toggle-label ${!value ? 'active' : ''}`}>{labelLeft}</span>}
      <div 
        className={`cyber-toggle ${value ? 'checked' : ''}`}
        onClick={() => onChange(!value)}
      >
        <div className="toggle-track">
          <div className="toggle-thumb">
            <div className="thumb-inner" />
          </div>
        </div>
      </div>
      {labelRight && <span className={`toggle-label ${value ? 'active' : ''}`}>{labelRight}</span>}
    </div>
  );
};
