import type { FC, Dispatch, SetStateAction } from "react";
import { Control } from "./Control";
import { fields } from "../data/fields";
import type { CustomizerValues } from "../types/customizer";
import { useI18n } from "../i18n";
import "./ControlPanel.css";

interface ControlPanelProps {
  values: CustomizerValues;
  setValue: (id: string, value: string | number | boolean) => void;
  setAnimationTick: Dispatch<SetStateAction<number>>;
}

export const ControlPanel: FC<ControlPanelProps> = ({
  values,
  setValue,
  setAnimationTick,
}) => {
  const { t } = useI18n();

  return (
    <aside className="customizer-panel glass-card slide-right">
      <div className="panel-header">
        <span className="badge badge-primary">{t('panel.control')}</span>
        <span className="badge badge-secondary">{t('panel.groups', { count: fields.length })}</span>
      </div>

      <div className="panel-content custom-scrollbar">
        {fields.map((group) => (
          <section className="control-group" key={group.title}>
            <div className="group-heading">
              <h3>{t(`field.group.${group.title.toLowerCase().replace(/\s+/g, "").split("/")[0]}`)}</h3>
            </div>
            {group.colors && (
              <div className="color-group fade-in-up">
                {group.colors.map((control) => (
                  <Control
                    key={control.id}
                    control={control}
                    values={values}
                    setValue={setValue}
                  />
                ))}
              </div>
            )}

            {group.controls && (
              <div className="group-controls fade-in-up">
                {group.controls.map((control) => (
                  <Control
                    key={control.id}
                    control={control}
                    values={values}
                    setValue={setValue}
                  />
                ))}
              </div>
            )}

            {group.checkboxes && (
              <div className="checkbox-group fade-in-up">
                {group.checkboxes.map((control) => (
                  <Control
                    key={control.id}
                    control={control}
                    values={values}
                    setValue={setValue}
                  />
                ))}
              </div>
            )}

            {group.title === "Animation" && (
              <button
                className="btn-primary play-animation fade-in-up"
                onClick={() => setAnimationTick((v) => v + 1)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {t('customizer.play_animation')}
              </button>
            )}
          </section>
        ))}
      </div>
    </aside>
  );
};
