# Dr. CRP Nagar Residents' Association

Public website for the residents' association at Dr. CRP Nagar (Chempakaraman Pillai Nagar), Pangappara, Thiruvananthapuram.

The site is static. It can be hosted from a GitHub repository through Cloudflare Pages, with no build step. Pages, notices, and forms are already separated from the data, so a membership register, complaints desk, and admin tools can be added later without rebuilding the public pages.

## Preview locally

With XAMPP, open [http://localhost/drcrpnagar/](http://localhost/drcrpnagar/).

Pretty addresses such as `/drcrpnagar/notices` need Apache `mod_rewrite`, which XAMPP includes. The rule is in `.htaccess`.

## Publish on Cloudflare Pages

1. Push this folder to a GitHub repository.
2. In Cloudflare, create a Pages project and connect that repository.
3. Framework preset: None.
4. Build command: leave empty.
5. Build output directory: `/`
6. Deploy, then add a custom domain if you have one.

`_redirects` sends every address to `index.html` so pages such as `/notices` and `/emergency` work. Real files — CSS, data, documents, and images — are still served as themselves.

## What to edit

| File | What it changes |
| --- | --- |
| `data/site.json` | Name, address, phone, email, WhatsApp number, map, preview bar |
| `data/about.json` | About page |
| `data/committee.json` | Office bearers. Fill `name`, `phone`, and `house` |
| `data/notices.json` | Notices. Set `"sample": false` when they are real |
| `data/events.json` | Events. Set `"sample": false` when the dates are real |
| `data/gallery.json` | Photographs. Point `src` at a file in `assets/gallery/` |
| `data/contacts.json` | Important contacts |
| `data/documents.json` | Downloadable forms and minutes |
| `data/emergency.json` | Emergency numbers |

Set `"publish": true` in `data/site.json` when the content is official. Until then the site asks search engines not to index it, and a preview bar stays at the top.

WhatsApp uses `whatsapp.number` in international form without a plus, for example `9198XXXXXXX`. The green button stays on the site either way. Until a number is added, it opens the contact page.

The map query is in `site.map.query`. Change it to a gate, a plus code, or a landmark when you have one.

Notices and minutes can be printed to PDF from the files in `documents/`. To add a paper, put the file in `documents/` and add an entry in `data/documents.json`.

## Later: membership, admin, and complaints

Public content is loaded only in `js/api.js`.

- Today it reads `/data/*.json`.
- Later, set `window.DRCRP_API` in `index.html` to an API that returns those same shapes.

Keep private records off these public files. The residents' page is a placeholder for four later areas: membership, complaints, dues, and admin. It does not collect passwords. The complaint form is a printable form, and the contact form hands the message to WhatsApp or email. Neither stores a complaint on the website.

A later admin tool can publish the same JSON, or replace the files with API responses. The page addresses and the data fields can stay as they are.
