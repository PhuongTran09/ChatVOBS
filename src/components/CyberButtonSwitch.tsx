import './CyberButtonSwitch.css';

interface CyberButtonSwitchProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  activeColor?: 'cyan' | 'magenta' | 'green';
  size?: 'normal' | 'small';
}

export const CyberButtonSwitch = ({
  options,
  value,
  onChange,
  activeColor = 'cyan',
  size = 'normal',
}: CyberButtonSwitchProps) => {
  return (
    <div className={`cyber-btn-group color-${activeColor} size-${size}`}>
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          className={`cyber-switch-btn ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <span className="btn-content">{opt.label}</span>
          <span className="btn-indicator" />
          <span className="btn-index">0{idx + 1}</span>
        </button>
      ))}
    </div>
  );
};
