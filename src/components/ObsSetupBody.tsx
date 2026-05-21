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
      
      <img 
        src="/assets/images/obs-mockup.png" 
        alt="OBS Setup Mockup" 
        style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--cyan-dim)', margin: '15px 0' }}
      />
      
      <p>{t('obs.body.step4')}</p>
      <p>{t('obs.body.step5')}</p>
      <p className="blink-cursor">_</p>
    </div>
  );
}
