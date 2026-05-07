import type {
  ControlItem,
  SelectControl,
  CheckboxControl,
  ColorRangeControl,
} from "../types/customizer";
import './Control.css';

type Values = Record<string, any>;

interface ControlProps {
  control: ControlItem;
  values: Values;
  setValue: (id: string, value: any) => void;
}

export function Control({ control, values, setValue }: ControlProps) {
  if (control.type === "select") {
    const c = control as SelectControl;
    return (
      <div className="control-item">
        {c.label && <label className="control-label" htmlFor={c.id}>{c.label}</label>}
        <div className="control-input-wrapper">
          <select
            id={c.id}
            className="modern-input"
            value={values[c.id]}
            onChange={(e) => setValue(c.id, e.target.value)}
          >
            {(c.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="select-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>
    );
  }

  if (control.type === "checkbox") {
    const c = control as CheckboxControl;
    const isChecked = !!values[c.id];

    return (
      <label className="control-item toggle-item" htmlFor={c.id}>
        {c.label && <span className="control-label">{c.label}</span>}
        <div className={`toggle-switch ${isChecked ? 'checked' : ''}`}>
          <input
            id={c.id}
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={(e) => setValue(c.id, e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </div>
      </label>
    );
  }

  if (control.type === "color-range") {
    const c = control as ColorRangeControl;

    return (
      <div className="control-item color-range-item">
        {c.label && <span className="control-label">{c.label}</span>}
        <div className="color-range-inputs">
          <div className="color-picker-wrapper">
            <input
              id={c.id}
              type="color"
              className="modern-color-picker"
              value={values[c.id]}
              onChange={(e) => setValue(c.id, e.target.value)}
            />
          </div>

          <input
            id={c.rangeId}
            type="range"
            className="modern-range"
            min="0"
            max="1"
            step="0.01"
            value={values[c.rangeId]}
            onChange={(e) => setValue(c.rangeId, e.target.value)}
          />

          <span className="range-value badge badge-secondary">
            {Math.round(Number(values[c.rangeId] ?? 0) * 100)}%
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="control-item">
      {control.label && <label className="control-label" htmlFor={control.id}>{control.label}</label>}
      <input
        id={control.id}
        type={control.type}
        className="modern-input"
        value={values[control.id]}
        onChange={(e) => setValue(control.id, e.target.value)}
      />
    </div>
  );
}