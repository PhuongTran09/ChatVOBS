import React from 'react';
import { useI18n } from '../i18n';
import { CyberButtonSwitch } from './CyberButtonSwitch';
import './LanguageSwitchFixed.css';

export const LanguageSwitchFixed: React.FC = () => {
  const { locale, toggleLocale } = useI18n();

  return (
    <div className="language-switch-fixed">
      <CyberButtonSwitch 
        options={[
          { label: 'VN', value: 'vi' },
          { label: 'EN', value: 'en' }
        ]}
        value={locale}
        onChange={() => toggleLocale()}
        activeColor="green"
        size="small"
      />
    </div>
  );
};
