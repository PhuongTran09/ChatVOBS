import type { CustomizerValues } from "../types/customizer";
import type {
  ControlItem,
  SelectControl,
  CheckboxControl,
  ColorRangeControl,
} from "../types/customizer";
import { useI18n } from "../i18n";
import { CyberToggle } from "./CyberToggle";
import './Control.css';

interface ControlProps {
  control: ControlItem;
  values: CustomizerValues;
  setValue: (id: string, value: string | number | boolean) => void;
}

export function Control({ control, values, setValue }: ControlProps) {
  const { t } = useI18n();

  if (control.type === "select") {
    const c = control as SelectControl;
    return (
      <div className="control-item">
        {c.label && <label className="control-label" htmlFor={c.id}>{t(`field.${c.id}.label`)}</label>}
        <div className="control-input-wrapper">
          <select
            id={c.id}
            className="modern-input"
            value={String(values[c.id] ?? '')}
            onChange={(e) => setValue(c.id, e.target.value)}
          >
            {(c.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (control.type === "checkbox") {
    const c = control as CheckboxControl;
    const isChecked = !!values[c.id];

    return (
      <div className="control-item toggle-item-wrapper">
        <CyberToggle
          labelLeft={c.label ? t(`field.${c.id}.label`) : undefined}
          value={isChecked}
          onChange={(val) => setValue(c.id, val)}
          activeColor="cyan"
        />
      </div>
    );
  }

  if (control.type === "color-range") {
    const c = control as ColorRangeControl;

    return (
      <div className="control-item color-range-item">
        {c.label && <span className="control-label">{t(`field.${c.id}.label`)}</span>}
        <div className="color-range-inputs">
          <div className="color-picker-wrapper">
            <input
              id={c.id}
              type="color"
              className="modern-color-picker"
              value={String(values[c.id] ?? '')}
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
            value={Number(values[c.rangeId] ?? 0)}
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
      {control.label && <label className="control-label" htmlFor={control.id}>{t(`field.${control.id}.label`)}</label>}
      <input
        id={control.id}
        type={control.type}
        className="modern-input"
        value={String(values[control.id] ?? '')}
        onChange={(e) => setValue(control.id, e.target.value)}
      />
    </div>
  );
}
