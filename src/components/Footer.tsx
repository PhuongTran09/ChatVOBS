import './Footer.css';
import { useI18n } from '../i18n';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="cyber-footer">
      <p>{t('footer.createdBy')} <span className="author-name">Yatokenji</span> / 2026</p>
    </footer>
  );
}
