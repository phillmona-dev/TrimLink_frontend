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

export function formatEthiopianTime(dateString: string) {
  const date = new Date(dateString);
  let h = date.getHours();
  const m = date.getMinutes();
  
  const period = (h >= 6 && h < 18) ? "LT (Day)" : "LT (Night)";
  
  let ethH = h - 6;
  if (ethH <= 0) ethH += 12;
  if (ethH > 12) ethH -= 12;
  
  return `${ethH}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatEthiopianDate(dateString: string) {
  const date = new Date(dateString);
  const ethiopianMonths = [
    "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yakatit",
    "Magabit", "Miyazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
  ];
  
  // Very rough approximation for UI purposes (1 slot = 1 year approx in this context)
  // For production, use a library like 'ethiopian-calendar'
  // But for now let's use the display pattern the user wants: "Miyazia 27, 2018"
  
  const gYear = date.getFullYear();
  const gMonth = date.getMonth();
  const gDay = date.getDate();
  
  // Subtract 8 years as a base approximation for Ethiopian year
  let ethYear = gYear - 8;
  let ethMonthIdx = (gMonth + 4) % 12; // Approximation
  let ethDay = gDay;
  
  return `${ethiopianMonths[ethMonthIdx]} ${ethDay}, ${ethYear}`;
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
