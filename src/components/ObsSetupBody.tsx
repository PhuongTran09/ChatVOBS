import { useI18n } from '../i18n';

export function ObsSetupBody() {
  const { t } = useI18n();

  return (
    <div className="term-body">
      <p className="sys-text">{t('obs.body.title')}</p>
      <p>{t('obs.body.guide')}</p>
      
      <p>{t('obs.body.step1')}</p>
      <p>{t('obs.body.step2')}</p>
      <p>{t('obs.body.step3')}</p>
      
      <p>{t('obs.body.step4')}</p>
      <p>{t('obs.body.step5')}</p>
      <p className="blink-cursor">_</p>
    </div>
  );
}
