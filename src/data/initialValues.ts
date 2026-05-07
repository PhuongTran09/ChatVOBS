import { fields } from "./fields";

type Values = Record<string, any>;

export const initialValues: Values = fields.reduce(
  (result: Values, group) => {

    group.controls?.forEach((control) => {
      if (control.type === "checkbox") {
        result[control.id] = !!control.checked;
      } else {
        result[control.id] = control.value || "";
      }

      if (control.type === "color-range") {
        result[control.rangeId] =
          control.rangeValue || "0";
      }
    });


    group.checkboxes?.forEach((control) => {
      result[control.id] = !!control.checked;
    });

    group.colors?.forEach((control) => {
      result[control.id] = control.value || "";

      if (control.type === "color-range") {
        result[control.rangeId] =
          control.rangeValue || "0";
      }
    });

    return result;
  },
  {} as Values
);