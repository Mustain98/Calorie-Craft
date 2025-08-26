// src/components/mealplan/utils.js

// Convert a decimal in 0.25 steps to a friendly fraction text
export function formatFraction(q) {
  const n = Math.round(Number(q || 0) * 4); // denominator 4 (quarters)
  const whole = Math.floor(n / 4);
  const rem = n % 4;
  const frac =
    rem === 0 ? "" :
    rem === 1 ? "1/4" :
    rem === 2 ? "1/2" :
    rem === 3 ? "3/4" : "";

  if (whole === 0) return frac || "0";
  if (!frac) return String(whole);
  return `${whole} ${frac}`;
}
