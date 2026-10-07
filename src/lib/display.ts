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
