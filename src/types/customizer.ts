export type ControlType =
  | "select"
  | "checkbox"
  | "color"
  | "range"
  | "color-range"
  | "number";

export interface ControlBase {
  id: string;
  label?: string;
  value?: string;
}

export interface SelectControl extends ControlBase {
  type: "select";
  options?: string[];
}

export interface CheckboxControl extends ControlBase {
  type: "checkbox";
  checked?: boolean;
}

export interface ColorRangeControl extends ControlBase {
  type: "color-range";
  rangeId: string;
  rangeValue?: string;
}

export interface ValueControl extends ControlBase {
  type: "color" | "range" | "number";
}

export type ControlItem =
  | SelectControl
  | CheckboxControl
  | ColorRangeControl
  | ValueControl;

export interface FieldGroup {
  title: string;
  controls: ControlItem[];
}