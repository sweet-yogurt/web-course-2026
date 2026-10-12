/* ---------- Форматирование денег ---------- */

const fmtFull = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 2,
});

const fmtNum = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

const SHORT_SUFFIXES = [
  "", "K", "M", "B", "T", "Q",
  "Qi", "Sx", "Sp", "Oc", "No",
  "Dc", "Ud", "Dd", "Td", "Qd",
  "Qq", "Sd", "St", "Od", "Nd",
  "Vg", "Uv", "Dv", "Tv", "Qv",
  "Qq", "Sq", "St", "Ot", "Nt",
  "Tg", "Ut", "Dt", "Tt", "Qt",
];

const LONG_SUFFIXES = [
  "", "тыс.", "млн", "млрд", "трлн", "квдрлн",
  "квнтлн", "скстлн", "сптлн", "октлн", "нонлн",
  "децлн", "ундцлн", "дудцлн", "трдцлн", "квтдцлн",
  "квндцлн", "сксдцлн", "сптдцлн", "октдцлн", "нвмдцлн",
  "вгнтлн", "увгнтлн", "двгнтлн", "трвгнтлн", "квдвгнтлн",
  "квнгнтлн", "сксвгнтлн", "сптвгнтлн", "октвгнтлн", "нвмвгнтлн",
  "тригнтлн", "утригнтлн", "дтригнтлн", "ттригнтлн", "квдтригнтлн",
];

const UNITS = (() => {
  const units = [];
  for (let exp = 3; exp <= 306; exp += 3) {
    const idx = exp / 3;
    units.push({
      value: Math.pow(10, exp),
      short: SHORT_SUFFIXES[idx] || `e${exp}`,
      long: LONG_SUFFIXES[idx] || `×10^${exp}`,
    });
  }
  return units.reverse();
})();

export function formatMoney(value) {
  return fmtFull.format(value);
}

export function formatMoneyCompact(value, opts = {}) {
  const {
    style = "long",
    maxDigits = 4,
    withCurrency = true,
    sign = false,
  } = opts;

  const n = Number(value);
  if (!isFinite(n)) return "—";

  const abs = Math.abs(n);
  const signStr = sign
    ? (n > 0 ? "+" : n < 0 ? "−" : "")
    : (n < 0 ? "−" : "");

  if (abs < 1000) {
    const rounded = roundToSignificant(abs, maxDigits);
    return `${signStr}${fmtNum.format(rounded)}${withCurrency ? " Br" : ""}`;
  }

  for (const unit of UNITS) {
    if (abs >= unit.value) {
      const scaled = abs / unit.value;
      const rounded = roundToSignificant(scaled, maxDigits);
      const suffix = style === "short" ? unit.short : unit.long;
      const sep = style === "short" ? "" : " ";
      return `${signStr}${fmtNum.format(rounded)}${sep}${suffix}${withCurrency ? " Br" : ""}`;
    }
  }

  return `${signStr}${n.toExponential(2).replace("e+", "e")}${withCurrency ? " Br" : ""}`;
}

function roundToSignificant(num, digits) {
  if (num === 0) return 0;
  const abs = Math.abs(num);
  const magnitude = Math.floor(Math.log10(abs));
  const factor = Math.pow(10, digits - 1 - magnitude);
  return Math.round(num * factor) / factor;
}

export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
