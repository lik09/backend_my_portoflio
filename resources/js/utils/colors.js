// Fixed 8-hue categorical palette (CVD-validated). Assign in this order only —
// never cycle/hash. Beyond 8 categories, extra ones get a generated color (see below).
export const CATEGORICAL_PALETTE = {
  light: ['#DB1A1A', '#FF3E9B', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'],
  dark: ['#DB1A1A', '#FF3E9B', '#eda100', '#008300', '#9085e9', '#e66767', '#d55181', '#d95926'],
};

// Golden angle — rotating hue by this amount each step spreads colors with no
// practical repeat, however many categories overflow past the fixed palette.
const OVERFLOW_HUE_STEP = 137.50776;
const OVERFLOW_SATURATION = 55;
const OVERFLOW_LIGHTNESS = { light: 45, dark: 62 };

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n) => Math.round(f(n) * 255).toString(16).padStart(2, '0');
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

function generateOverflowColor(overflowIndex, isDark) {
  const hue = (overflowIndex * OVERFLOW_HUE_STEP) % 360;
  return hslToHex(hue, OVERFLOW_SATURATION, OVERFLOW_LIGHTNESS[isDark ? 'dark' : 'light']);
}

// keys: array of unique category keys in the fixed order to assign (e.g. sorted by type id)
export function getCategoricalColors(keys, isDark) {
  const palette = isDark ? CATEGORICAL_PALETTE.dark : CATEGORICAL_PALETTE.light;
  return keys.map((_, idx) => palette[idx] ?? generateOverflowColor(idx - palette.length, isDark));
}
