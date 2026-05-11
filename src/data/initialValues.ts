import { fields } from "./fields";
import type { CustomizerValues } from "../types/customizer";

export const initialValues: CustomizerValues = fields.reduce(
  (result: CustomizerValues, group) => {

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
  {} as CustomizerValues
);
