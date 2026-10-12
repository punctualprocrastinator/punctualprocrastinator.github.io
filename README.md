# Personal academic site

A static personal site: four hand-edited HTML pages, one stylesheet, one small
script. No build step, no dependencies, no generator. Edit a file, push, done.

```
index.html      the whole site: intro, Selected Work, AI Safety,
                Tabular Foundation Models, AI4Science
cv.html         full CV (linked, not in the section nav)
404.html        shown by GitHub Pages for bad URLs
main.css        the whole design
fonts/          Libron webfonts (SIL OFL 1.1, license in fonts/OFL.txt)
app.js          light/dark toggle + email obfuscation
portrait.jpg    the photo beside the bio
favicon.svg     site icon
robots.txt      points crawlers at the sitemap
sitemap.xml     four URLs; update if you add pages
.nojekyll       tells Pages to serve files as-is
```

## Put it online

GitHub Pages serves a **user site** from a repo named exactly
`punctualprocrastinator.github.io`, at `https://punctualprocrastinator.github.io`.

1. Create that repo on GitHub — public, empty, no README.
2. From this folder:

   ```sh
   git init -b main
   git add .
   git commit -m "Initial site"
   git remote add origin https://github.com/punctualprocrastinator/punctualprocrastinator.github.io.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment**. Set Source to
   *Deploy from a branch*, branch `main`, folder `/ (root)`. Save.
4. Wait a minute or two, then open `https://punctualprocrastinator.github.io`.

Every later `git push` republishes within a minute.

### A custom domain, later

Buy the domain, add a file called `CNAME` containing just the domain
(`example.com`, no scheme, no slash), push it, then set the same domain under
Settings → Pages. At your registrar point an `ALIAS`/`ANAME` record, or four
`A` records, at `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
`185.199.111.153`. Tick *Enforce HTTPS* once the certificate is issued.

## Preview locally

Any static server works. With Python:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` as a `file://` URL
mostly works too, but the root-relative links in `404.html` will not.

## Filling it in

Everything you need to change is marked `<!-- EDIT: ... -->` in the HTML, and
every placeholder is in `[square brackets]` or says "Your Name". To find what
is left:

```sh
grep -rn "EDIT:\|Your Name\|punctualprocrastinator\|\[Field\]" *.html
```

Checklist for the first pass:

- [ ] Your name in the `<h1>` and `<title>` of all five pages, plus the
      `subtitle` line under it
- [ ] `punctualprocrastinator` → your GitHub username, in every page's `og:url` and
      `canonical`, and in `robots.txt` and `sitemap.xml`
- [ ] Email: `data-user` and `data-domain` on the `#email-link` in `index.html`
- [ ] Profile links in the sidebar (delete the rows you do not use)
- [ ] Replace `portrait.svg` with a real photo — a 4:5 crop, around 800×1000,
      saved as `portrait.jpg`, then update the `src` in `index.html`
- [ ] Bio, selected work, and the "More about me" paragraph
- [ ] `research.html`: real papers, newest first
- [ ] `cv.html`: real entries, and drop a `cv.pdf` in if you keep one
- [ ] The `Last updated` line in each footer

The header and footer are duplicated across pages on purpose — it keeps the
site dependency-free. When you change a nav link, change it in all five files.

### Social preview image

The `og:image` tags point at `og.png`, which does not exist yet. Make a
1200×630 PNG (your name on the paper background is plenty), save it as
`og.png`, and links to the site will unfurl with it. Until then the tags are
harmless.

## The design

Warm paper, slate ink, a petrol-blue link colour and terracotta rules.
Body text is Source Serif 4; section labels are letter-spaced IBM Plex Mono
with a hairline running off to the right. Both load from Google Fonts with
local serif and monospace fallbacks, so the page is readable before they
arrive.

Colours live as custom properties at the top of `main.css` — the dark palette
is defined twice (once for `prefers-color-scheme`, once for the toggle's
`[data-theme="dark"]`), so change both if you reach for a different scheme.
The reading measure is `--measure`, 34rem by default.

`@media print` hides the nav, photo and toggle, so `cv.html` prints to a clean
PDF straight from the browser.
