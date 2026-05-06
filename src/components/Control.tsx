import type {
  ControlItem,
  SelectControl,
  CheckboxControl,
  ColorRangeControl,
} from "../types/customizer";

type Values = Record<string, any>;

interface ControlProps {
  control: ControlItem;
  values: Values;
  setValue: (id: string, value: any) => void;
}

export function Control({ control, values, setValue }: ControlProps) {
  const renderInput = () => {
    if (control.type === "select") {
      const c = control as SelectControl;
      const options = c.options ?? [];

      return (
        <select
          id={c.id}
          value={values[c.id]}
          onChange={(e) => setValue(c.id, e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (control.type === "checkbox") {
      const c = control as CheckboxControl;

      return (
        <input
          id={c.id}
          type="checkbox"
          checked={!!values[c.id]}
          onChange={(e) => setValue(c.id, e.target.checked)}
        />
      );
    }

    if (control.type === "color-range") {
      const c = control as ColorRangeControl;

      return (
        <>
          <input
            id={c.id}
            type="color"
            value={values[c.id]}
            onChange={(e) => setValue(c.id, e.target.value)}
          />

          <input
            id={c.rangeId}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={values[c.rangeId]}
            onChange={(e) => setValue(c.rangeId, e.target.value)}
          />
        </>
      );
    }

    return (
      <input
        id={control.id}
        type={control.type}
        value={values[control.id]}
        onChange={(e) => setValue(control.id, e.target.value)}
      />
    );
  };

  return (
    <label className="control-item" htmlFor={control.id}>
      {control.label ? <span className="control-label">{control.label}</span> : null}
      <span className="control-input">{renderInput()}</span>
    </label>
  );
}