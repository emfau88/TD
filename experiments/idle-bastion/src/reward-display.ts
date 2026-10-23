import { language, numberFormat, t } from './i18n';

const compactNumber = numberFormat({ maximumFractionDigits: 1, useGrouping: false });
const grouped = (value: number): string => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');

/** Display only. Never round the reserved receipt or the credited currency units. */
export function offlineGoldDisplay(amountUnits: number) {
  const whole = Math.floor(amountUnits / 1000), fraction = amountUnits % 1000;
  // Build exact fractional text from integer units, including beyond safe decimal float precision.
  const exactNumber = grouped(whole) + (fraction ? (language() === 'de' ? ',' : '.') + String(fraction).padStart(3, '0').replace(/0+$/, '') : '');
  const scale = whole >= 1e12 ? { value: 1e12, label: '{0} Bio.' }
    : whole >= 1e9 ? { value: 1e9, label: '{0} Mrd.' }
    : whole >= 1e6 ? { value: 1e6, label: '{0} Mio.' } : undefined;
  const headline = amountUnits > 0 && whole === 0 ? t('Weniger als 1 Gold')
    : scale ? t('≈ +{0} Gold', t(scale.label, compactNumber.format(Math.floor(whole / (scale.value / 10)) / 10)))
    : t('+{0} Gold', grouped(whole));
  return { headline, exact: t('+{0} Gold', exactNumber), showDetails: fraction > 0 || !!scale };
}
