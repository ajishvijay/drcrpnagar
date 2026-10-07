const ICONS = {
  bell: `<path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/>`,
  calendar: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>`,
  file: `<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8 13h8M8 17h5"/>`,
  phone: `<path d="M8 3.5h2.8l1.2 3.2-2 1.2a12.5 12.5 0 0 0 6.1 6.1l1.2-2 3.2 1.2V16a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 6 6.7 2 2 0 0 1 8 3.5z"/>`,
  pin: `<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/>`,
  home: `<path d="M4 11.5 12 4l8 7.5"/><path d="M6.5 10.5V20h11V10.5"/><path d="M10 20v-5h4v5"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>`,
  users: `<path d="M16 19.5v-.8a3.7 3.7 0 0 0-3.7-3.7H7.2A3.7 3.7 0 0 0 3.5 18.7v.8"/><circle cx="9.8" cy="8" r="2.8"/><path d="M20.5 19.5v-.7a3.2 3.2 0 0 0-2.4-3.1"/><circle cx="16.2" cy="8.2" r="2.3"/>`,
  alert: `<path d="M12 4 3.2 19h17.6L12 4z"/><path d="M12 10v4.2"/><path d="M12 17h.01"/>`,
  download: `<path d="M12 4v11"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M5 19.5h14"/>`,
  arrow: `<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>`,
  search: `<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>`,
  whatsapp: `<path d="M6 18.5 7.1 15A7.2 7.2 0 1 1 9.2 17.4L6 18.5z"/><path d="M9.2 10.2c.3 2 2.4 3.4 4 3.6"/>`,
  lock: `<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`,
  external: `<path d="M14 5h5v5"/><path d="M19 5 10 14"/><path d="M17 13.5V18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4.5"/>`
};

export function icon(name) {
  const holder = document.createElement("div");
  holder.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icon">${ICONS[name] || ""}</svg>`;
  return holder.firstElementChild;
}
