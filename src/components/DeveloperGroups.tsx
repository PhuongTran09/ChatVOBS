import './DeveloperSections.css';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n/types';
import type { DevGroup } from '../data/developerProfile';
import { getTechIcon } from '../data/techIcons';
import { TechChip } from './TechChip';

interface DeveloperGroupsProps {
  titleKey: TranslationKey;
  groups: readonly DevGroup[];
  noteKey?: TranslationKey;
}

/**
 * Skill and tool chips only. A bar or a percentage would be a self-assigned number
 * with nothing behind it, which is the same mistake the overlays just stopped making.
 */
export function DeveloperGroups({ titleKey, groups}: DeveloperGroupsProps) {
  const { t } = useI18n();

  return (
    <div className="dev-block">
      <div className="dev-block-head">
        <h2 className="dev-block-title">{t(titleKey)}</h2>
      </div>
      <div className="dev-group-grid">
        {groups.map((group) => (
          <div key={group.titleKey} className="dev-group">
            <h4 className="dev-group-title">{t(group.titleKey)}</h4>
            <div className="dev-chips">
              {group.tags.map((tag) => (
                <TechChip key={tag} tag={tag} icon={getTechIcon(tag)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
