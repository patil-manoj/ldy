export const SERVICES = ['wash_fold', 'iron', 'wash_iron', 'dry_clean'];

export const SERVICE_LABELS = {
  wash_fold: 'Wash & Fold',
  iron: 'Ironing',
  wash_iron: 'Wash & Iron',
  dry_clean: 'Dry Clean',
};

export function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function settingsToObject(settings) {
  return Object.fromEntries(settings.map(({ key, value }) => [key, value]));
}