import { useTranslation } from '../i18n/I18nContext';

export default function Marquee() {
  const { t } = useTranslation();
  const ITEMS = [
    t('Food Delivery'), t('Coffee Runs'), t('Groceries'), t('Printouts'), t('Campus Favors'),
    t('Merch & Gear'), t('Library Runs'), t('Pharmacy'), t('Earn While You Study'), t('Student-to-Student'),
  ];
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="mwrap">
      <div className="mtrack">
        {doubled.map((item, i) => (
          <div className="mitem" key={i}>
            <div className="mdot" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
