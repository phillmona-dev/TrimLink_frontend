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

export function maskPhone(phone: string) {
  if (phone.length < 6) {
    return phone;
  }

  return `${phone.slice(0, 5)}••••${phone.slice(-2)}`;
}
