export function formatCurrency(amount: number | string, currency = "ETB") {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(numeric);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

/**
 * Converts a Gregorian date to an Ethiopian calendar date.
 * Uses the Julian Day Number method (epoch JDN 1723856 = Meskerem 1, 1 AM).
 * Verified: May 9, 2026 = Ginbot 1, 2018 ET
 */
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnToEthiopian(jdn: number): { year: number; month: number; day: number } {
  const ETHIOPIAN_EPOCH = 1723856;
  const r = (jdn - ETHIOPIAN_EPOCH) % 1461;
  const n = r % 365 + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - ETHIOPIAN_EPOCH) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = n % 30 + 1;
  return { year, month, day };
}

const ETHIOPIAN_MONTHS = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miyazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
];

export function formatEthiopianTime(dateString: string): string {
  // Use UTC hours so the timezone of the viewer doesn't shift the time display
  const date = new Date(dateString);
  // Get Ethiopia local hour (UTC+3)
  const utcHour = date.getUTCHours();
  const utcMin = date.getUTCMinutes();
  const etHour = (utcHour + 3) % 24; // Ethiopia is UTC+3

  const period = (etHour >= 6 && etHour < 18) ? "LT (Day)" : "LT (Night)";
  let ethH = etHour - 6;
  if (ethH <= 0) ethH += 12;
  if (ethH > 12) ethH -= 12;

  return `${ethH}:${utcMin.toString().padStart(2, "0")} ${period}`;
}

export function formatEthiopianDate(dateString: string): string {
  const date = new Date(dateString);
  // Use UTC date adjusted for Ethiopia UTC+3 to get the correct calendar day
  const utcHour = date.getUTCHours();
  let year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1; // 1-indexed
  let day = date.getUTCDate();

  // Advance by 3 hours (ET offset) before converting to Ethiopian date
  const msEt = date.getTime() + 3 * 60 * 60 * 1000;
  const dateEt = new Date(msEt);
  year = dateEt.getUTCFullYear();
  month = dateEt.getUTCMonth() + 1;
  day = dateEt.getUTCDate();

  const jdn = gregorianToJDN(year, month, day);
  const eth = jdnToEthiopian(jdn);
  const monthName = ETHIOPIAN_MONTHS[eth.month - 1] ?? `Month${eth.month}`;
  return `${monthName} ${eth.day}, ${eth.year}`;
}

export function formatEthiopianDateTime(dateString: string) {
  return `${formatEthiopianTime(dateString)} on ${formatEthiopianDate(dateString)}`;
}

export function maskPhone(phone: string) {
  if (phone.length < 6) {
    return phone;
  }

  return `${phone.slice(0, 5)}••••${phone.slice(-2)}`;
}
