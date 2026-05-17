/**
 * Ethiopian Calendar Conversion Utilities
 * The Ethiopian calendar has 13 months: 12 months of 30 days + Pagume (5 or 6 days).
 * Ethiopian New Year falls on September 11 (or 12 in leap years) Gregorian.
 * Ethiopian year = Gregorian year - 7 (or -8 depending on month).
 */

const ETH_MONTHS = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"
];

const ETH_MONTHS_EN = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
];

const ETH_DAYS = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];
const ETH_DAYS_SHORT = ["እሑ", "ሰኞ", "ማክ", "ረቡ", "ሐሙ", "ዓር", "ቅዳ"];

export interface EthDate {
  year: number;
  month: number; // 1-13
  day: number;   // 1-30
}

function isEthLeapYear(year: number): boolean {
  return year % 4 === 3;
}

function ethDaysInMonth(month: number, year: number): number {
  if (month <= 12) return 30;
  return isEthLeapYear(year) ? 6 : 5;
}

/** Convert Gregorian Date to Ethiopian Date */
export function toEthiopian(gDate: Date): EthDate {
  const jdn = gregorianToJDN(gDate.getFullYear(), gDate.getMonth() + 1, gDate.getDate());
  return jdnToEthiopian(jdn);
}

/** Convert Ethiopian Date to Gregorian Date */
export function toGregorian(eth: EthDate): Date {
  const jdn = ethiopianToJDN(eth.year, eth.month, eth.day);
  const g = jdnToGregorian(jdn);
  return new Date(g.year, g.month - 1, g.day);
}

function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

function ethiopianToJDN(y: number, m: number, d: number): number {
  return 1723856 + 365 * (y - 1) + Math.floor(y / 4) + 30 * (m - 1) + d - 1;
}

function jdnToEthiopian(jdn: number): EthDate {
  const r = Math.floor((jdn - 1723856) % 1461);
  const n = Math.floor(r % 365) + 365 * Math.floor(Math.floor(r / 365) / 4);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

/** Get month name in Amharic */
export function getEthMonthName(month: number): string {
  return ETH_MONTHS[month - 1] || "";
}

/** Get month name in English */
export function getEthMonthNameEn(month: number): string {
  return ETH_MONTHS_EN[month - 1] || "";
}

/** Get day names (short, Amharic) */
export function getEthDayNames(): string[] {
  return ETH_DAYS_SHORT;
}

/** Get days in a given Ethiopian month */
export function getEthDaysInMonth(month: number, year: number): number {
  return ethDaysInMonth(month, year);
}

/** Get the Gregorian weekday (0=Sun) of the 1st of an Ethiopian month */
export function getFirstDayOfEthMonth(year: number, month: number): number {
  const gDate = toGregorian({ year, month, day: 1 });
  return gDate.getDay();
}

/** Navigate to next Ethiopian month */
export function nextEthMonth(year: number, month: number): { year: number; month: number } {
  if (month === 13) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

/** Navigate to previous Ethiopian month */
export function prevEthMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 13 };
  return { year, month: month - 1 };
}

/** Format Ethiopian date for display */
export function formatEthDate(eth: EthDate): string {
  return `${getEthMonthName(eth.month)} ${eth.day}, ${eth.year}`;
}

/** Format Ethiopian date in English */
export function formatEthDateEn(eth: EthDate): string {
  return `${getEthMonthNameEn(eth.month)} ${eth.day}, ${eth.year}`;
}

/** Check if an Ethiopian date is today */
export function isEthToday(eth: EthDate): boolean {
  const today = toEthiopian(new Date());
  return eth.year === today.year && eth.month === today.month && eth.day === today.day;
}

/** Check if Ethiopian date is in the past */
export function isEthPast(eth: EthDate): boolean {
  const today = toEthiopian(new Date());
  const todayG = toGregorian(today);
  const checkG = toGregorian(eth);
  todayG.setHours(0,0,0,0);
  checkG.setHours(0,0,0,0);
  return checkG < todayG;
}
