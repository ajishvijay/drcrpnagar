import { h } from "./dom.js?v=3";
import { icon } from "./icons.js?v=3";
import {
  addressLines,
  sortNotices,
  downloadIcs,
  findById,
  formatDate,
  formatWhen,
  mapsEmbed,
  mapsLink,
  past,
  telHref,
  upcoming,
  waHref
} from "./format.js?v=3";

const ROUTES = [
  { re: /^\/$/, name: "home", title: () => "Home" },
  { re: /^\/about$/, name: "about", title: () => "About the association" },
  { re: /^\/committee$/, name: "committee", title: () => "Committee members" },
  { re: /^\/notices$/, name: "notices", title: () => "Notices and announcements" },
  { re: /^\/notices\/([a-z0-9-]+)$/, name: "notice", keys: ["id"], title: (data, params) => findById(data.notices.items, params.id)?.title || "Notice" },
  { re: /^\/events$/, name: "events", title: () => "Events" },
  { re: /^\/events\/([a-z0-9-]+)$/, name: "event", keys: ["id"], title: (data, params) => findById(data.events.items, params.id)?.title || "Event" },
  { re: /^\/houses$/, name: "houses", title: () => "House directory" },
  { re: /^\/gallery$/, name: "gallery", title: () => "Gallery" },
  { re: /^\/contacts$/, name: "contacts", title: () => "Important contacts" },
  { re: /^\/documents$/, name: "documents", title: () => "Documents and forms" },
  { re: /^\/emergency$/, name: "emergency", title: () => "Emergency contacts" },
  { re: /^\/contact$/, name: "contact", title: () => "Contact us" },
  { re: /^\/residents$/, name: "residents", title: () => "Residents' portal" }
];

export function pageTitle(path, data) {
  const route = matchRoute(path);
  if (!route) return "Page not found";
  return route.title(data, route.params);
}

export function renderPage(path, data) {
  const route = matchRoute(path);
  if (!route) return notFound();
  return PAGES[route.name](data, route.params);
}

function matchRoute(path) {
  for (const route of ROUTES) {
    const match = path.match(route.re);
    if (!match) continue;
    const params = {};
    (route.keys || []).forEach((key, index) => {
      params[key] = match[index + 1];
    });
    return { ...route, params };
  }
  return null;
}

const PAGES = {
  home: renderHome,
  about: renderAbout,
  committee: renderCommittee,
  notices: renderNotices,
  notice: renderNotice,
  events: renderEvents,
  event: renderEvent,
  houses: renderHouses,
  gallery: renderGallery,
  contacts: renderContacts,
  documents: renderDocuments,
  emergency: renderEmergency,
  contact: renderContact,
  residents: renderResidents
};

function renderHome(data) {
  const { site, notices, events, about, committee, documents, houses } = data;
  const latest = sortNotices(notices.items).slice(0, 3);
  const nextEvents = upcoming(events.items).slice(0, 2);
  const featured = latest[0];

  return h(
    "div",
    null,
    h(
      "section",
      { class: "hero" },
      h(
        "div",
        { class: "wrap hero-grid" },
        h(
          "div",
          null,
          h("p", { class: "kicker" }, site.hero.kicker),
          site.nameMl ? h("p", { class: "mal hero-mal", lang: "ml" }, site.nameMl) : null,
          h("h1", null, site.hero.title),
          h("p", { class: "lede" }, site.hero.text),
          h(
            "div",
            { class: "hero-actions" },
            h("a", { class: "button", href: "notices" }, "Latest notices"),
            h("a", { class: "button button-ghost", href: "emergency" }, "Emergency contacts")
          )
        ),
        h(
          "aside",
          { class: "board", "aria-label": "Latest from the association" },
          h("p", { class: "board-label" }, "Notice board"),
          featured
            ? h(
                "a",
                { class: "board-main", href: `notices/${featured.id}` },
                h("span", { class: "tag" }, featured.category),
                h("strong", null, featured.title),
                h("span", null, featured.summary)
              )
            : h("p", null, "Notices will appear here."),
          nextEvents[0]
            ? h(
                "a",
                { class: "board-next", href: `events/${nextEvents[0].id}` },
                h("span", null, "Next"),
                h("strong", null, nextEvents[0].title),
                h("span", null, formatWhen(nextEvents[0]))
              )
            : h("p", { class: "fine" }, "No upcoming event is listed."),
          notices.sample ? h("p", { class: "board-note" }, "Sample items, not official notices.") : null
        )
      )
    ),
    h(
      "section",
      { class: "section" },
      h(
        "div",
        { class: "wrap tile-grid" },
        tile("houses", "home", "Houses", `${houses?.items?.length || 0} in the register`),
        tile("notices", "bell", "Notices", `${notices.items.length} on the board`),
        tile("events", "calendar", "Events", `${upcoming(events.items).length} coming up`),
        tile("documents", "file", "Documents", `${documents.items.length} forms and papers`),
        tile("emergency", "alert", "Emergency", "112 and other helplines")
      )
    ),
    h(
      "section",
      { class: "section" },
      h(
        "div",
        { class: "wrap" },
        sectionHead("Notices", "From the notice board", { href: "notices", label: "All notices" }),
        sampleNote(notices, "These notices are samples so the board has a shape. They are not official announcements."),
        latest.length
          ? h("div", { class: "card-grid" }, ...latest.map((item) => noticeCard(item)))
          : empty("No notices yet.")
      )
    ),
    h(
      "section",
      { class: "section section-tint" },
      h(
        "div",
        { class: "wrap split" },
        h(
          "div",
          null,
          h("p", { class: "kicker" }, "About"),
          h("h2", null, about.homeTitle),
          h("p", null, about.lead),
          h("a", { class: "text-link", href: "about" }, "About the association", icon("arrow"))
        ),
        h(
          "ul",
          { class: "duty-list" },
          ...about.responsibilities.slice(0, 4).map((item) =>
            h("li", null, h("strong", null, item.title), h("span", null, item.text))
          )
        )
      )
    ),
    h(
      "section",
      { class: "section" },
      h(
        "div",
        { class: "wrap" },
        sectionHead("Committee", "Who carries the work", { href: "committee", label: "All roles" }),
        h(
          "div",
          { class: "role-row" },
          ...committee.members.slice(0, 5).map((member) =>
            h(
              "article",
              { class: "role-card" },
              h("h3", null, member.name || member.role),
              h("p", { class: "role" }, member.name ? member.role : "Name yet to be published"),
              member.phone ? h("a", { href: telHref(member.phone) }, member.phone) : null
            )
          )
        )
      )
    ),
    h(
      "section",
      { class: "section" },
      h(
        "div",
        { class: "wrap" },
        sectionHead("Events", "Coming up", { href: "events", label: "All events" }),
        nextEvents.length
          ? h("div", { class: "card-grid" }, ...nextEvents.map((item) => eventCard(item)))
          : empty("No upcoming event is listed.")
      )
    ),
    h(
      "section",
      { class: "section section-map" },
      h(
        "div",
        { class: "wrap map-grid" },
        h(
          "div",
          null,
          h("p", { class: "kicker" }, "Find us"),
          h("h2", null, site.map.title || "Dr. CRP Nagar"),
          h("p", null, addressLines(site.address).join(", ")),
          site.map.note ? h("p", { class: "fine" }, site.map.note) : null,
          h(
            "div",
            { class: "hero-actions" },
            h("a", { class: "button", href: mapsLink(site.map.query), target: "_blank", rel: "noopener noreferrer" }, "Open in Google Maps", icon("external")),
            h("a", { class: "button button-ghost", href: "houses" }, "House directory")
          )
        ),
        mapFrame(site, false)
      )
    )
  );
}

function renderAbout(data) {
  const { about } = data;
  return h(
    "article",
    null,
    pageHead("About", "About the association", about.lead),
    h(
      "div",
      { class: "wrap narrow stack" },
      ...about.paragraphs.map((paragraph) => h("p", null, paragraph)),
      h("h2", null, "What the association looks after"),
      h(
        "div",
        { class: "info-grid" },
        ...about.responsibilities.map((item) =>
          h("article", { class: "info-card" }, h("h3", null, item.title), h("p", null, item.text))
        )
      ),
      h("h2", null, "How decisions are made"),
      h(
        "ol",
        { class: "steps" },
        ...about.howWeWork.map((item) =>
          h("li", null, h("strong", null, item.title), h("span", null, item.text))
        )
      ),
      h("h2", null, about.area.title),
      h("ul", { class: "plain-list" }, ...about.area.points.map((point) => h("li", null, point)))
    )
  );
}

function renderCommittee(data) {
  const { committee } = data;
  return h(
    "article",
    null,
    pageHead("Committee", "Committee members", committee.intro),
    h(
      "div",
      { class: "wrap" },
      committee.term ? h("p", { class: "term" }, committee.term) : null,
      h(
        "div",
        { class: "committee-grid" },
        ...committee.members.map((member) =>
          h(
            "article",
            { class: "committee-card" },
            h("p", { class: "kicker" }, member.role),
            h("h2", { class: member.name ? null : "is-empty" }, member.name || "Name yet to be published"),
            member.house ? h("p", null, member.house) : null,
            member.phone
              ? h("a", { class: "text-link", href: telHref(member.phone) }, member.phone)
              : h("p", { class: "fine" }, "Phone number not published"),
            h("p", null, member.duty)
          )
        )
      )
    )
  );
}

function renderNotices(data) {
  const { notices } = data;
  const categories = ["All", ...new Set(notices.items.map((item) => item.category).filter(Boolean))];
  const state = { category: "All", query: "" };
  const list = h("div", { class: "stack" });
  const chips = h("div", { class: "chips", role: "toolbar", "aria-label": "Filter notices" });

  function paintChips() {
    chips.replaceChildren(
      ...categories.map((category) =>
        h(
          "button",
          {
            type: "button",
            class: state.category === category ? "chip is-on" : "chip",
            "aria-pressed": state.category === category ? "true" : "false",
            onclick: () => {
              state.category = category;
              paintChips();
              draw();
            }
          },
          category
        )
      )
    );
  }

  function draw() {
    const query = state.query.trim().toLowerCase();
    const items = sortNotices(notices.items).filter((item) => {
      const categoryOk = state.category === "All" || item.category === state.category;
      const haystack = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
      return categoryOk && (!query || haystack.includes(query));
    });
    list.replaceChildren(
      items.length
        ? h("div", { class: "stack" }, ...items.map((item) => noticeCard(item)))
        : empty("Nothing matches that search.")
    );
  }

  paintChips();
  draw();

  return h(
    "article",
    null,
    pageHead("Notices", "Notices and announcements", notices.intro),
    h(
      "div",
      { class: "wrap stack" },
      sampleNote(notices, "These are sample notices so you can see the board. They are not official announcements."),
      h(
        "label",
        { class: "search" },
        h("span", { class: "sr" }, "Search notices"),
        icon("search"),
        h("input", {
          type: "search",
          placeholder: "Search notices",
          oninput: (event) => {
            state.query = event.target.value;
            draw();
          }
        })
      ),
      chips,
      list
    )
  );
}

function renderNotice(data, params) {
  const item = findById(data.notices.items, params.id);
  if (!item) return missing("Notice", "That notice is not on the board.", "notices", "Back to notices");
  return h(
    "article",
    null,
    crumbs([
      { href: "./", label: "Home" },
      { href: "notices", label: "Notices" },
      { label: item.title }
    ]),
    h(
      "div",
      { class: "wrap narrow prose" },
      h(
        "p",
        { class: "meta-row" },
        h("time", { datetime: item.date }, formatDate(item.date)),
        h("span", { class: "tag" }, item.category)
      ),
      h("h1", null, item.title),
      data.notices.sample ? h("p", { class: "sample-note" }, "Sample notice. Not an official announcement.") : null,
      ...item.body.map((paragraph) => h("p", null, paragraph)),
      item.attachment
        ? h(
            "p",
            null,
            h(
              "a",
              { class: "button", href: item.attachment.href, target: "_blank", rel: "noopener" },
              icon("download"),
              item.attachment.label || "Download"
            )
          )
        : null,
      h("p", null, h("a", { class: "text-link", href: "notices" }, "All notices"))
    )
  );
}

function renderEvents(data) {
  const { events } = data;
  const coming = upcoming(events.items);
  const earlier = past(events.items);
  return h(
    "article",
    null,
    pageHead("Events", "Meetings and gatherings", events.intro),
    h(
      "div",
      { class: "wrap stack" },
      sampleNote(events, "These events are samples. Please confirm the date with the committee before you come."),
      h("h2", null, "Upcoming"),
      coming.length
        ? h("div", { class: "stack" }, ...coming.map((item) => eventCard(item)))
        : empty("No upcoming event is listed."),
      h("h2", null, "Earlier"),
      earlier.length
        ? h("div", { class: "stack" }, ...earlier.map((item) => eventCard(item)))
        : empty("No earlier event is listed.")
    )
  );
}

function renderEvent(data, params) {
  const item = findById(data.events.items, params.id);
  if (!item) return missing("Event", "That event is not listed.", "events", "Back to events");
  return h(
    "article",
    null,
    crumbs([
      { href: "./", label: "Home" },
      { href: "events", label: "Events" },
      { label: item.title }
    ]),
    h(
      "div",
      { class: "wrap narrow prose" },
      h("p", { class: "kicker" }, formatWhen(item)),
      h("h1", null, item.title),
      data.events.sample ? h("p", { class: "sample-note" }, "Sample event. Confirm the date before you attend.") : null,
      item.venue ? h("p", null, h("strong", null, "Where: "), item.venue) : null,
      ...(item.body || []).map((paragraph) => h("p", null, paragraph)),
      h(
        "div",
        { class: "hero-actions" },
        h(
          "button",
          { class: "button", type: "button", onclick: () => downloadIcs(item) },
          icon("calendar"),
          "Add to calendar"
        ),
        h("a", { class: "button button-ghost", href: "events" }, "All events")
      )
    )
  );
}

function renderHouses(data) {
  const { houses } = data;
  const items = [...(houses.items || [])].sort(compareHouseNumbers);
  const state = { query: "", status: "all" };
  const list = h("div", { class: "house-list" });
  const count = h("p", { class: "fine" });

  function draw() {
    const query = state.query.trim().toLowerCase();
    const shown = items.filter((item) => {
      const statusOk = state.status === "all" || item.status === state.status;
      const haystack = `${item.number} ${item.name} ${item.house}`.toLowerCase();
      return statusOk && (!query || haystack.includes(query));
    });
    count.textContent = shown.length === 1 ? "1 record" : `${shown.length} records`;
    list.replaceChildren(
      shown.length
        ? h("div", { class: "house-table-wrap" }, houseTable(shown))
        : empty("No house matches that search.")
    );
  }

  const chips = h("div", { class: "chips", role: "toolbar", "aria-label": "Filter houses" });
  const filters = [
    ["all", "All"],
    ["occupied", "Occupied"],
    ["vacant", "Vacant"],
    ["institution", "Church and temple"],
    ["unrecorded", "Name not recorded"]
  ];
  function paintChips() {
    chips.replaceChildren(
      ...filters.map(([id, label]) =>
        h(
          "button",
          {
            type: "button",
            class: state.status === id ? "chip is-on" : "chip",
            "aria-pressed": state.status === id ? "true" : "false",
            onclick: () => {
              state.status = id;
              paintChips();
              draw();
            }
          },
          label
        )
      )
    );
  }
  paintChips();
  draw();

  const occupied = items.filter((item) => item.status === "occupied").length;
  const vacant = items.filter((item) => item.status === "vacant").length;

  return h(
    "article",
    null,
    pageHead("Register", houses.title || "House directory", houses.intro),
    h(
      "div",
      { class: "wrap stack" },
      h(
        "p",
        { class: "meta-row" },
        houses.registration ? h("span", { class: "tag" }, `Reg. No. ${houses.registration}`) : null,
        h("span", null, `${items.length} entries`),
        h("span", null, `${occupied} named households`),
        h("span", null, `${vacant} vacant`)
      ),
      houses.missing?.length
        ? h("p", { class: "fine" }, `These residence numbers are not in the register: ${houses.missing.join(", ")}.`)
        : null,
      h(
        "label",
        { class: "search" },
        h("span", { class: "sr" }, "Search houses"),
        icon("search"),
        h("input", {
          type: "search",
          placeholder: "Search by number, house name, or resident",
          oninput: (event) => {
            state.query = event.target.value;
            draw();
          }
        })
      ),
      chips,
      count,
      list
    )
  );
}

function houseTable(items) {
  return h(
    "table",
    { class: "house-table" },
    h(
      "thead",
      null,
      h(
        "tr",
        null,
        h("th", { scope: "col" }, "No."),
        h("th", { scope: "col" }, "House name"),
        h("th", { scope: "col" }, "Name in the register"),
        h("th", { scope: "col" }, "Status")
      )
    ),
    h(
      "tbody",
      null,
      ...items.map((item) =>
        h(
          "tr",
          null,
          h("th", { scope: "row" }, item.number),
          h("td", null, item.house || "—"),
          h("td", null, item.name || "—"),
          h("td", null, h("span", { class: `tag tag-${item.status}` }, statusLabel(item.status)))
        )
      )
    )
  );
}

function statusLabel(status) {
  if (status === "vacant") return "Vacant";
  if (status === "institution") return "Institution";
  if (status === "unrecorded") return "Not recorded";
  return "Occupied";
}

function compareHouseNumbers(a, b) {
  return houseRank(a.number) - houseRank(b.number) || String(a.number).localeCompare(String(b.number));
}

function houseRank(number) {
  const match = String(number).match(/^(\d+)/);
  const base = match ? Number(match[1]) : 9999;
  const suffix = String(number).slice(String(base).length);
  const suffixRank = suffix.trim() ? suffix.trim().charCodeAt(0) / 1000 : 0;
  return base + suffixRank;
}

function renderGallery(data) {
  const { gallery } = data;
  const albums = ["All", ...new Set(gallery.items.map((item) => item.album).filter(Boolean))];
  const state = { album: "All" };
  const grid = h("div", { class: "gallery-grid" });

  function draw() {
    const items = gallery.items.filter((item) => state.album === "All" || item.album === state.album);
    grid.replaceChildren(
      ...items.map((item, index) =>
        h(
          "figure",
          { class: index < 2 && state.album === "All" ? "tile tile-wide" : "tile" },
          h(
            "button",
            {
              type: "button",
              class: "tile-button",
              onclick: () => openLightbox(item)
            },
            h("img", { src: item.src, alt: item.alt || item.title })
          ),
          h("figcaption", null, h("strong", null, item.title), h("span", null, item.caption || item.album))
        )
      )
    );
    if (!items.length) grid.append(empty("No photographs in this album yet."));
  }

  const chips = h(
    "div",
    { class: "chips", role: "toolbar", "aria-label": "Albums" },
    ...albums.map((album) =>
      h(
        "button",
        {
          type: "button",
          class: state.album === album ? "chip is-on" : "chip",
          "aria-pressed": state.album === album ? "true" : "false",
          onclick: (event) => {
            state.album = album;
            event.currentTarget.parentElement.querySelectorAll(".chip").forEach((chip) => {
              const on = chip.textContent === album;
              chip.classList.toggle("is-on", on);
              chip.setAttribute("aria-pressed", on ? "true" : "false");
            });
            draw();
          }
        },
        album
      )
    )
  );

  draw();

  return h(
    "article",
    null,
    pageHead("Gallery", "Photographs", gallery.intro),
    h(
      "div",
      { class: "wrap stack" },
      sampleNote(gallery, "These are drawings, standing in until photographs of the neighbourhood are added. They are not pictures of Dr. CRP Nagar."),
      chips,
      grid
    )
  );
}

function openLightbox(item) {
  const dialog = h(
    "dialog",
    { class: "lightbox", onclick: (event) => {
      if (event.target === dialog) dialog.close();
    } },
    h("img", { src: item.src, alt: item.alt || item.title }),
    h("figcaption", null, h("strong", null, item.title), item.caption ? h("span", null, item.caption) : null),
    h("button", { type: "button", class: "button button-small", onclick: () => dialog.close() }, "Close")
  );
  document.body.append(dialog);
  dialog.showModal();
  dialog.addEventListener("close", () => dialog.remove());
}

function renderContacts(data) {
  const { contacts } = data;
  return h(
    "article",
    null,
    pageHead("Directory", "Important contacts", contacts.intro),
    h(
      "div",
      { class: "wrap stack" },
      h("p", null, h("a", { class: "text-link", href: "emergency" }, "For danger, fire, or a medical emergency, use the emergency numbers", icon("arrow"))),
      ...contacts.groups.map((group) =>
        h(
          "section",
          null,
          h("h2", null, group.title),
          group.note ? h("p", { class: "fine" }, group.note) : null,
          h(
            "div",
            { class: "contact-list" },
            ...group.items.map((item) => contactRow(item))
          )
        )
      )
    )
  );
}

function renderDocuments(data) {
  const { documents } = data;
  const categories = ["All", ...new Set(documents.items.map((item) => item.category).filter(Boolean))];
  const state = { category: "All" };
  const list = h("div", { class: "stack" });

  function draw() {
    const items = documents.items.filter((item) => state.category === "All" || item.category === state.category);
    list.replaceChildren(
      ...items.map((item) =>
        h(
          "article",
          { class: "doc-card" },
          h(
            "div",
            null,
            h("p", { class: "meta-row" }, h("span", { class: "tag" }, item.category), item.date ? h("time", { datetime: item.date }, formatDate(item.date)) : null),
            h("h2", null, item.title),
            h("p", null, item.summary)
          ),
          h(
            "a",
            { class: "button button-small", href: item.href, target: "_blank", rel: "noopener" },
            icon("download"),
            "Open"
          )
        )
      )
    );
  }

  const chips = h(
    "div",
    { class: "chips" },
    ...categories.map((category) =>
      h(
        "button",
        {
          type: "button",
          class: state.category === category ? "chip is-on" : "chip",
          "aria-pressed": state.category === category ? "true" : "false",
          onclick: (event) => {
            state.category = category;
            event.currentTarget.parentElement.querySelectorAll(".chip").forEach((chip) => {
              const on = chip.textContent === category;
              chip.classList.toggle("is-on", on);
              chip.setAttribute("aria-pressed", on ? "true" : "false");
            });
            draw();
          }
        },
        category
      )
    )
  );

  draw();

  return h(
    "article",
    null,
    pageHead("Documents", "Documents and forms", documents.intro),
    h(
      "div",
      { class: "wrap stack" },
      sampleNote(documents, "Files marked as drafts are outlines. They are not adopted bylaws or real minutes until the association replaces them."),
      chips,
      list
    )
  );
}

function renderEmergency(data) {
  const { emergency, site } = data;
  return h(
    "article",
    { class: "emergency-page" },
    pageHead("Emergency", "Emergency contacts", emergency.intro),
    h(
      "div",
      { class: "wrap stack" },
      h(
        "a",
        { class: "sos", href: telHref(emergency.primary.phone) },
        h("span", null, "Call"),
        h("strong", null, emergency.primary.phone),
        h("span", null, emergency.primary.label)
      ),
      ...emergency.groups.map((group) =>
        h(
          "section",
          null,
          h("h2", null, group.title),
          h(
            "div",
            { class: "sos-grid" },
            ...group.items.map((item) =>
              h(
                "a",
                { class: "sos-card", href: telHref(item.phone) },
                h("strong", null, item.phone),
                h("span", null, item.label),
                item.note ? h("small", null, item.note) : null
              )
            )
          )
        )
      ),
      h(
        "section",
        { class: "association-sos" },
        h("h2", null, "Association"),
        site.contact?.phone
          ? h("a", { class: "sos-card", href: telHref(site.contact.phone) }, h("strong", null, site.contact.phone), h("span", null, "Association phone"))
          : h("p", null, "The association phone number has not been published yet. Use 112 for an emergency."),
        h("p", { class: "fine" }, emergency.source)
      )
    )
  );
}

function renderContact(data) {
  const { site } = data;
  const whatsappReady = Boolean(waHref(site.whatsapp?.number, site.whatsapp?.prefill));
  const status = h("p", { class: "form-status", role: "status" });
  const form = h(
    "form",
    {
      class: "contact-form",
      onsubmit: (event) => {
        event.preventDefault();
        sendMessage(form, site, status);
      }
    },
    field("Name", "name", "text", true),
    field("House number", "house", "text", true),
    field("Phone", "phone", "tel", false),
    h(
      "label",
      null,
      "Topic",
      h(
        "select",
        { name: "topic" },
        ...["General", "Maintenance", "Waste", "Street light", "Water", "Membership", "Complaint", "Other"].map((topic) =>
          h("option", { value: topic }, topic)
        )
      )
    ),
    h(
      "label",
      null,
      "Message",
      h("textarea", { name: "message", rows: "6", required: true })
    ),
    h("button", { class: "button", type: "submit" }, whatsappReady || site.contact?.email ? "Send message" : "Prepare message"),
    status
  );

  return h(
    "article",
    null,
    pageHead("Contact", "Contact us", site.contact?.intro),
    h(
      "div",
      { class: "wrap contact-grid" },
      h(
        "div",
        { class: "stack" },
        !whatsappReady
          ? h("p", { class: "sample-note", id: "whatsapp" }, "The association WhatsApp number will be linked here once it is added. You can still write a message below and copy it.")
          : h(
              "p",
              null,
              h(
                "a",
                {
                  class: "button",
                  href: waHref(site.whatsapp.number, site.whatsapp.prefill),
                  target: "_blank",
                  rel: "noopener noreferrer"
                },
                icon("whatsapp"),
                "WhatsApp the association"
              )
            ),
        site.contact?.phone ? h("p", null, h("a", { href: telHref(site.contact.phone) }, site.contact.phone)) : null,
        site.contact?.email ? h("p", null, h("a", { href: `mailto:${site.contact.email}` }, site.contact.email)) : null,
        site.contact?.hours ? h("p", { class: "fine" }, site.contact.hours) : null,
        h("address", null, ...addressLines(site.address).map((line) => h("span", null, line))),
        form,
        h(
          "p",
          { class: "fine" },
          "A tracked complaints desk is planned. Until then, a complaint sent from this page goes out by WhatsApp or email and is not stored on the website."
        )
      ),
      h(
        "div",
        { class: "stack" },
        mapFrame(site, true),
        h(
          "a",
          { class: "text-link", href: mapsLink(site.map.query), target: "_blank", rel: "noopener noreferrer" },
          "Get directions",
          icon("external")
        )
      )
    )
  );
}

function renderResidents(data) {
  const portal = data.site.portal;
  return h(
    "article",
    null,
    pageHead("Residents", portal.title, portal.text),
    h(
      "div",
      { class: "wrap" },
      h(
        "div",
        { class: "portal-lock" },
        icon("lock"),
        h("p", null, portal.status)
      ),
      h(
        "div",
        { class: "info-grid" },
        ...portal.modules.map((item) =>
          h(
            "article",
            { class: "info-card" },
            h("p", { class: "tag" }, "Planned"),
            h("h2", null, item.title),
            h("p", null, item.text)
          )
        )
      ),
      h("p", { class: "lede portal-note" }, portal.publicNote)
    )
  );
}

function sendMessage(form, site, status) {
  const body = new FormData(form);
  const name = String(body.get("name") || "").trim();
  const house = String(body.get("house") || "").trim();
  const phone = String(body.get("phone") || "").trim();
  const topic = String(body.get("topic") || "General");
  const message = String(body.get("message") || "").trim();
  if (!name || !house || !message) {
    status.textContent = "Please add your name, house number, and a message.";
    return;
  }
  const text = [
    site.whatsapp?.prefill || "Hello, I am writing from Dr. CRP Nagar.",
    "",
    `Name: ${name}`,
    `House: ${house}`,
    phone ? `Phone: ${phone}` : null,
    `Topic: ${topic}`,
    "",
    message
  ].filter(Boolean).join("\n");

  const whatsapp = waHref(site.whatsapp?.number, text);
  if (whatsapp) {
    window.open(whatsapp, "_blank", "noopener");
    status.textContent = "WhatsApp should open with your message. Nothing is stored on this website.";
    return;
  }
  if (site.contact?.email) {
    const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent(`${topic} — ${house}`)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailto;
    status.textContent = "Your email app should open with this message. Nothing is stored on this website.";
    return;
  }
  status.replaceChildren(
    "No WhatsApp number or email is published yet. Copy the message and send it when a contact is available.",
    h("textarea", { readonly: true, rows: "8" }, text)
  );
}

function contactRow(item) {
  const phone = telHref(item.phone);
  return h(
    "article",
    { class: "contact-row" },
    h(
      "div",
      null,
      h("h3", null, item.name),
      item.detail ? h("p", null, item.detail) : null,
      item.note ? h("p", { class: "fine" }, item.note) : null
    ),
    phone
      ? h("a", { class: "button button-small", href: phone }, item.phone)
      : h("span", { class: "fine" }, "Number to be added")
  );
}

function noticeCard(item) {
  return h(
    "a",
    { class: "notice-card", href: `notices/${item.id}` },
    h(
      "span",
      { class: "meta-row" },
      h("time", { datetime: item.date }, formatDate(item.date)),
      h("span", { class: "tag" }, item.category),
      item.pinned ? h("span", { class: "tag tag-pin" }, "Pinned") : null
    ),
    h("strong", null, item.title),
    h("span", { class: "muted" }, item.summary)
  );
}

function eventCard(item) {
  return h(
    "a",
    { class: "event-card", href: `events/${item.id}` },
    h("time", { datetime: item.date }, formatWhen(item)),
    h("strong", null, item.title),
    item.venue ? h("span", null, item.venue) : null,
    h("span", { class: "muted" }, item.summary)
  );
}

function tile(href, name, title, text) {
  return h(
    "a",
    { class: "tile-link", href },
    icon(name),
    h("strong", null, title),
    h("span", null, text)
  );
}

function sectionHead(kicker, title, link) {
  return h(
    "div",
    { class: "section-head" },
    h("div", null, h("p", { class: "kicker" }, kicker), h("h2", null, title)),
    link ? h("a", { class: "text-link", href: link.href }, link.label, icon("arrow")) : null
  );
}

function pageHead(kicker, title, lede) {
  return h(
    "header",
    { class: "page-head" },
    h(
      "div",
      { class: "wrap narrow" },
      h("p", { class: "kicker" }, kicker),
      h("h1", null, title),
      lede ? h("p", { class: "lede" }, lede) : null
    )
  );
}

function crumbs(items) {
  return h(
    "nav",
    { class: "crumbs wrap narrow", "aria-label": "Breadcrumb" },
    ...items.flatMap((item, index) => {
      const node = item.href
        ? h("a", { href: item.href }, item.label)
        : h("span", { "aria-current": "page" }, item.label);
      return index ? [h("span", { "aria-hidden": "true" }, "/"), node] : [node];
    })
  );
}

function sampleNote(collection, text) {
  if (!collection?.sample) return null;
  return h("p", { class: "sample-note" }, text);
}

function empty(text) {
  return h("p", { class: "empty" }, text);
}

function missing(title, text, href, label) {
  return h(
    "article",
    { class: "wrap narrow page-head" },
    h("h1", null, title),
    h("p", null, text),
    h("a", { class: "button", href }, label)
  );
}

function notFound() {
  return h(
    "article",
    { class: "wrap narrow page-head" },
    h("p", { class: "kicker" }, "404"),
    h("h1", null, "That page is not on this site"),
    h("p", null, "The link may be old. The notices, contacts, and emergency numbers are still on the home page."),
    h("a", { class: "button", href: "./" }, "Back home")
  );
}

function mapFrame(site, tall) {
  return h("iframe", {
    class: tall ? "map map-tall" : "map",
    title: `Map of ${site.map.query}`,
    src: mapsEmbed(site.map.query),
    loading: "lazy",
    referrerpolicy: "no-referrer-when-downgrade"
  });
}

function field(label, name, type, required) {
  return h(
    "label",
    null,
    label,
    h("input", { name, type, required: required || null, autocomplete: name === "name" ? "name" : name === "phone" ? "tel" : "off" })
  );
}
