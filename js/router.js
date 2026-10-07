export function sitePath() {
  const basePath = new URL(document.baseURI).pathname.replace(/\/$/, "");
  let path = location.pathname;
  if (basePath && path.toLowerCase().startsWith(basePath.toLowerCase())) {
    path = path.slice(basePath.length);
  }
  if (path.endsWith("/index.html")) path = path.slice(0, -"/index.html".length);
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

const listeners = new Set();

export function onRoute(fn) {
  listeners.add(fn);
  window.addEventListener("popstate", fn);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function navigate(href) {
  const url = new URL(href, document.baseURI);
  if (url.origin !== location.origin) {
    location.assign(url.href);
    return;
  }
  const next = url.pathname + url.search + url.hash;
  const current = location.pathname + location.search + location.hash;
  if (next !== current) history.pushState(null, "", next);
  notify();
}

export function isInternalPage(anchor, event) {
  if (!anchor || !anchor.href) return false;
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, document.baseURI);
  if (url.origin !== location.origin) return false;
  if (/\.(html|pdf|ics|txt|svg|png|jpe?g|webp)$/i.test(url.pathname) && !url.pathname.endsWith("/index.html")) {
    return false;
  }
  const basePath = new URL(document.baseURI).pathname.replace(/\/$/, "");
  return url.pathname.toLowerCase().startsWith(basePath.toLowerCase());
}
