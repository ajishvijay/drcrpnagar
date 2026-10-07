import { loadAll } from "./api.js";
import { h } from "./dom.js";
import { mountShell, setActive, closeMenus } from "./layout.js";
import { pageTitle, renderPage } from "./pages.js";
import { isInternalPage, navigate, onRoute, sitePath } from "./router.js";

let data = null;

const boot = document.getElementById("boot");
const app = document.getElementById("app");

try {
  data = await loadAll();
  mountShell(data.site);
  applyPublish(data.site);
  boot?.remove();
  show();
  onRoute(show);
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenus();
  });
} catch (error) {
  boot?.remove();
  app.replaceChildren(loadError(error));
}

function show() {
  const path = sitePath();
  closeMenus();
  const main = document.getElementById("content");
  if (!main) return;
  main.replaceChildren(renderPage(path, data));
  setActive(path);
  const title = pageTitle(path, data);
  document.title = path === "/" ? data.site.name : `${title} · ${data.site.shortName}`;
  const description = document.querySelector('meta[name="description"]');
  if (description && data.site.description) description.setAttribute("content", data.site.description);
  main.focus({ preventScroll: true });
  if (location.hash) {
    document.querySelector(location.hash)?.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
}

function onClick(event) {
  if (event.target.closest(".more")) {
    /* keep directory open while interacting inside it */
  } else {
    document.querySelector(".more")?.classList.remove("is-open");
    document.querySelector(".more-toggle")?.setAttribute("aria-expanded", "false");
  }
  const anchor = event.target.closest("a");
  if (!isInternalPage(anchor, event)) return;
  const url = new URL(anchor.href, document.baseURI);
  if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
  event.preventDefault();
  navigate(anchor.href);
}

function applyPublish(site) {
  let robots = document.querySelector('meta[name="robots"]');
  if (site.publish === true) {
    robots?.remove();
    return;
  }
  if (!robots) {
    robots = document.createElement("meta");
    robots.setAttribute("name", "robots");
    document.head.append(robots);
  }
  robots.setAttribute("content", "noindex, nofollow");
}

function loadError(error) {
  return h(
    "section",
    { class: "load-error wrap" },
    h("p", { class: "kicker" }, "Dr. CRP Nagar"),
    h("h1", null, "The pages could not be loaded"),
    h(
      "p",
      null,
      "Open the site through a web server, such as XAMPP or Cloudflare. Opening the HTML file directly from a folder cannot load the notices and other pages."
    ),
    h("p", { class: "fine" }, error.message || "Unknown error")
  );
}
