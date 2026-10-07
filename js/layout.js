import { h } from "./dom.js?v=4";
import { icon } from "./icons.js?v=4";
import { addressLines, formatDate, waHref } from "./format.js?v=4";

const PRIMARY = [
  { href: "./", label: "Home", id: "home" },
  { href: "about", label: "About", id: "about" },
  { href: "committee", label: "Committee", id: "committee" },
  { href: "notices", label: "Notices", id: "notices" },
  { href: "events", label: "Events", id: "events" },
  { href: "houses", label: "Houses", id: "houses" },
  { href: "gallery", label: "Gallery", id: "gallery" }
];

const MORE = [
  { href: "contacts", label: "Important contacts", id: "contacts" },
  { href: "documents", label: "Documents and forms", id: "documents" },
  { href: "emergency", label: "Emergency contacts", id: "emergency" },
  { href: "contact", label: "Contact us", id: "contact" },
  { href: "residents", label: "Residents' portal", id: "residents" }
];

export function mountShell(site) {
  const app = document.getElementById("app");
  app.replaceChildren(
    site.publish === true ? null : previewBar(site),
    h("a", { class: "skip", href: "#content" }, "Skip to content"),
    header(site),
    h("main", { id: "content", tabindex: "-1" }),
    footer(site),
    whatsappButton(site)
  );
}

export function closeMenus() {
  document.querySelector(".nav")?.classList.remove("is-open");
  document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
  document.querySelector(".more")?.classList.remove("is-open");
  document.querySelector(".more-toggle")?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
}

export function setActive(path) {
  const id = path.split("/").filter(Boolean)[0] || "home";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const on = link.dataset.nav === id;
    link.classList.toggle("is-active", on);
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const directoryOn = MORE.some((item) => item.id === id) && id !== "emergency" && id !== "contact";
  document.querySelector(".more-toggle")?.classList.toggle("is-active", directoryOn);
}

function previewBar(site) {
  return h(
    "p",
    { class: "preview" },
    site.previewText || "Preview site. Sample notices and documents are not official announcements."
  );
}

function header(site) {
  const toggle = h(
    "button",
    {
      class: "nav-toggle",
      type: "button",
      "aria-expanded": "false",
      "aria-controls": "site-nav",
      onclick: () => {
        const nav = document.getElementById("site-nav");
        const open = !nav.classList.contains("is-open");
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
      }
    },
    h("span", { class: "nav-toggle-lines", "aria-hidden": "true" }),
    h("span", { class: "sr" }, "Menu")
  );

  return h(
    "header",
    { class: "site-header" },
    h(
      "div",
      { class: "utility" },
      h(
        "div",
        { class: "wrap utility-inner" },
        h("p", null, site.placeLine),
        h("a", { href: "emergency" }, "Emergency 112")
      )
    ),
    h(
      "div",
      { class: "wrap header-bar" },
      h(
        "a",
        { class: "brand", href: "./" },
        h("img", { src: "assets/logo.svg?v=4", alt: "", width: "44", height: "44" }),
        h(
          "span",
          null,
          h("strong", null, site.shortName),
          h("small", null, site.kind)
        )
      ),
      toggle,
      h(
        "nav",
        { class: "nav", id: "site-nav", "aria-label": "Primary" },
        ...PRIMARY.map((item) =>
          h("a", { href: item.href, "data-nav": item.id }, item.label)
        ),
        moreMenu(),
        h(
          "span",
          { class: "nav-actions" },
          h("a", { class: "emergency-link", href: "emergency", "data-nav": "emergency" }, "Emergency"),
          h("a", { class: "button button-small", href: "contact", "data-nav": "contact" }, "Contact")
        )
      )
    )
  );
}

function moreMenu() {
  const panelId = "directory-menu";
  const button = h(
    "button",
    {
      class: "more-toggle",
      type: "button",
      "aria-expanded": "false",
      "aria-controls": panelId,
      onclick: (event) => {
        event.stopPropagation();
        const wrap = button.closest(".more");
        const open = !wrap.classList.contains("is-open");
        wrap.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", open ? "true" : "false");
      }
    },
    "Directory"
  );
  return h(
    "div",
    { class: "more" },
    button,
    h(
      "div",
      { class: "more-panel", id: panelId },
      ...MORE.map((item) =>
        h("a", {
          href: item.href,
          "data-nav": item.id === "emergency" || item.id === "contact" ? null : item.id
        }, item.label)
      )
    )
  );
}

function footer(site) {
  const lines = addressLines(site.address);
  return h(
    "footer",
    { class: "site-footer" },
    h(
      "div",
      { class: "wrap footer-grid" },
      h(
        "div",
        null,
        h("p", { class: "footer-mark" }, site.name),
        site.nameMl ? h("p", { class: "mal", lang: "ml" }, site.nameMl) : null,
        h("p", null, lines.join(", ")),
        site.updated ? h("p", { class: "fine" }, `Details updated ${formatDate(site.updated)}`) : null
      ),
      h(
        "div",
        null,
        h("p", { class: "footer-label" }, "On this site"),
        h(
          "ul",
          null,
          ...PRIMARY.slice(1).map((item) => h("li", null, h("a", { href: item.href }, item.label)))
        )
      ),
      h(
        "div",
        null,
        h("p", { class: "footer-label" }, "Directory"),
        h(
          "ul",
          null,
          ...MORE.map((item) => h("li", null, h("a", { href: item.href }, item.label)))
        )
      ),
      h(
        "div",
        null,
        h("p", { class: "footer-label" }, "Call first"),
        h("a", { class: "footer-call", href: "tel:112" }, "112"),
        h("p", { class: "fine" }, "Police, fire, and ambulance through the national emergency number."),
        site.contact?.phone
          ? h("a", { href: `tel:${String(site.contact.phone).replace(/[^\d+]/g, "")}` }, site.contact.phone)
          : null
      )
    ),
    h(
      "div",
      { class: "wrap footer-base" },
      h("p", null, `${site.shortName} · ${site.address?.city || "Thiruvananthapuram"}`),
      h("a", { href: "residents" }, "Residents' portal — not open yet")
    )
  );
}

function whatsappButton(site) {
  const number = site.whatsapp?.number || "";
  const href = waHref(number, site.whatsapp?.prefill || "");
  const attrs = {
    class: "whatsapp",
    href: href || "contact#whatsapp",
    "aria-label": href ? "WhatsApp the association" : "WhatsApp number coming soon"
  };
  if (href) {
    attrs.target = "_blank";
    attrs.rel = "noopener noreferrer";
  }
  return h("a", attrs, icon("whatsapp"), h("span", null, "WhatsApp"));
}
