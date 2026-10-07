export function todayISO() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function formatTime(value) {
  if (!value) return "";
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour)) return value;
  const date = new Date();
  date.setHours(hour, minute || 0, 0, 0);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function formatWhen(item) {
  const date = formatDate(item.date);
  const start = formatTime(item.start);
  const end = formatTime(item.end);
  if (start && end) return `${date} · ${start} – ${end}`;
  if (start) return `${date} · ${start}`;
  return date;
}

export function telHref(phone) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

export function waHref(number, text) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "";
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}

export function addressLines(address = {}) {
  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    address.pin,
    address.country
  ].filter(Boolean);
}

export function mapsEmbed(query) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

export function mapsLink(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function byDateDesc(items) {
  return [...(items || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

export function sortNotices(items) {
  return [...(items || [])].sort((a, b) => {
    const pinned = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    if (pinned) return pinned;
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
}

export function upcoming(items) {
  const today = todayISO();
  return [...(items || [])]
    .filter((item) => item.date >= today)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

export function past(items) {
  const today = todayISO();
  return [...(items || [])]
    .filter((item) => item.date < today)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function findById(items, id) {
  return (items || []).find((item) => item.id === id) || null;
}

export function downloadIcs(event) {
  const start = icsDate(event.date, event.start);
  const end = icsDate(event.date, event.end || addHour(event.start));
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dr CRP Nagar Residents Association//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@drcrpnagar`,
    `DTSTAMP:${icsNow()}`,
    event.start ? `DTSTART:${start}` : `DTSTART;VALUE=DATE:${event.date.replace(/-/g, "")}`,
    event.start ? `DTEND:${end}` : `DTEND;VALUE=DATE:${nextDay(event.date)}`,
    `SUMMARY:${icsText(event.title)}`,
    `LOCATION:${icsText(event.venue || "")}`,
    `DESCRIPTION:${icsText(event.summary || "")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${event.id}.ics`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function icsDate(iso, time) {
  const [hour, minute] = (time || "00:00").split(":");
  return `${iso.replace(/-/g, "")}T${String(hour).padStart(2, "0")}${String(minute || "00").padStart(2, "0")}00`;
}

function addHour(time) {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour + 1, minute || 0, 0, 0);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function nextDay(iso) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

function icsNow() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function icsText(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
