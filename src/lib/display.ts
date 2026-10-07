export const MAX_DIGITS = 9;

export const ERROR = "Error";

export function groupThousands(value: string) {
  const [whole, fraction] = value.split(".");
  const sign = whole.startsWith("-") ? "-" : "";
  const grouped = (sign ? whole.slice(1) : whole).replace(
    /\B(?=(\d{3})+$)/g,
    ",",
  );
  return fraction === undefined
    ? sign + grouped
    : `${sign}${grouped}.${fraction}`;
}

export function countDigits(value: string) {
  return value.replace(/\D/g, "").length;
}

export function formatResult(value: number) {
  if (!Number.isFinite(value)) return ERROR;
  if (value === 0) return "0";

  const magnitude = Math.abs(value);
  if (magnitude >= 10 ** MAX_DIGITS || magnitude < 10 ** -MAX_DIGITS) {
    return value
      .toExponential(3)
      .replace(/\.?0+e/, "e")
      .replace("e+", "e");
  }

  const wholeDigits = Math.floor(magnitude).toString().length;
  const fixed = value.toFixed(MAX_DIGITS - wholeDigits);
  return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
}
