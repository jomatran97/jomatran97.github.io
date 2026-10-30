# Personal Portfolio — Specification

| | |
|---|---|
| **Status** | Draft v1.1 (Home layout update, §4.1) |
| **Last updated** | 2026-10-31 |
| **Hosting** | GitHub Pages — `https://jomatran97.github.io` |
| **Stack** | Astro + Tailwind CSS, all content in Markdown/MDX |

---

## 1. Overview

A personal portfolio site with three main parts:

1. **Experiences**: summary and work experience (the web page of the CV), with a CV PDF version built automatically. The PDF also includes selected projects, technical skills, spoken languages and certifications. On the website, projects have their own **Projects** page in the main navigation, while skills, languages and certifications appear on the **Home** page, with technical skills shown as described cards by category and certifications as badge cards. The content is migrated from the existing LaTeX CV (see Appendix A).
2. **STAR stories**: behavioural interview answers in the Situation → Task → Action → Result format, grouped by the role/company where each one happened.
3. **Blog**: long-form posts with tags, RSS, a table of contents and code highlighting.

The look follows **Apple's design language** (lots of whitespace, large bold headlines, a frosted glass nav, bento grid cards, gentle scroll motion) with a **mint and sky blue pastel palette**. Light and dark themes follow the system setting.

### 1.1 Goals

- Recruiters and hiring managers can skim the CV and key results in under 30 seconds, and download a PDF CV.
- The owner can use the STAR section as a personal interview prep bank, browsed by role.
- Adding a role, project, story or post means adding one Markdown file. No code changes needed.
- Fast, accessible and readable in English and Vietnamese.

### 1.2 Non-goals (v1)

- Blog comments.
- A contact form or any backend. GitHub Pages is static only.
- A CMS UI.
- Auto-generated Open Graph images (v1 uses one static default image).
- Hidden or private STAR stories. **Every STAR story is public**, and the author anonymises names and confidential details before committing.

### 1.3 Audience

| Audience | Needs |
|---|---|
| Recruiters / hiring managers | Fast scan of experience, measurable results, PDF download, contact links |
| The owner (interview prep) | STAR stories by role, quick expand/collapse, search by keyword |
| Peers / readers | Blog posts, RSS, good reading experience |

---

## 2. Decisions summary

| Area | Decision |
|---|---|
| Framework | Astro (latest stable), static output |
| Styling | Tailwind CSS with CSS custom-property design tokens |
| Site structure | Multi-page: Home, Experiences, STAR, Blog (+ tag pages, search, 404) |
| Theme | Light + dark, follows `prefers-color-scheme`, with a manual override toggle |
| Palette | Mint `#A8E6CF`, sky blue `#A0C4FF`, butter `#FDFFB6`, cool white `#F8FAFC`, text `#1D1D1F` |
| Apple-style elements | Frosted glass nav, large bold headlines, scroll animations, bento grid cards |
| Fonts | Inter for the UI, Newsreader (serif) for blog post bodies |
| Home layout | **Profile rail + content canvas** (v1.1, §4.1). At ≥ 1280px a sticky profile rail (identity, actions, stats, languages, contact, section index) sits beside a 3-column canvas: **technical skills** (build-time balanced columns), **Work & writing** (featured project · latest posts · certifications in one row), featured STAR stories, compact contact band. Home container up to 1520px with full-bleed section bands |
| Experiences page sections | Summary and experience timeline. **Projects, skills and certifications are not on the Experiences page**: projects live on `/projects/`, skills and certifications on Home. No education section |
| Projects page | `/projects/` in the main nav (after Experiences). Lists **all** projects (personal, work, open source) with kind filter chips. Cards expand in place, **no detail pages** |
| Experiences route | The web CV page is named **Experiences** and lives at `/experiences/` (VI: *Kinh nghiệm*, `/vi/experiences/`). The old `/cv/` and `/vi/cv/` stay as redirects (Astro `redirects`, meta refresh on static hosting), out of the sitemap, search index and Lighthouse URLs. The PDF stays a CV: `/cv.pdf`, `/vi/cv.pdf`, `Ryan-Parker-CV.pdf` |
| CV PDF | Built automatically in CI with Playwright, **US Letter**. Contains the Experiences page content **plus** selected projects, the technical skills table (with spoken languages) and certifications, as in `cv.tex`. The Markdown content replaces `cv.tex` as the single source of truth |
| CV contact details | Email, phone, LinkedIn and GitHub, shown on the Experiences page and in the PDF |
| STAR organisation | Grouped by role/company, linked from the Experiences timeline |
| STAR display | Expandable vertical stepper (S → T → A → R) |
| Blog | Tags + tag pages, RSS, reading time, sticky TOC, Shiki syntax highlighting, **series** (series box, prev/next part, series index page), callouts, code block titles, inline SVG diagrams |
| First post | **Neovim setup guide, Part 1: from zero to a working editor**, EN + VI at launch (Appendix B) |
| Comments | None |
| Contact | Social links + `mailto:` + `tel:` |
| Search | Pagefind (static full-text search) |
| Analytics | Cloudflare Web Analytics (cookie-free) |
| i18n | English (default, `/`) + Vietnamese (`/vi/`) |
| Authoring | Every entry is a Markdown/MDX file with typed frontmatter (Astro content collections) |
| STAR privacy | All stories public |
| URL | User site at `jomatran97.github.io` (repo `jomatran97/jomatran97.github.io`) |
| CI/CD | GitHub Actions: PR-only protected `main`, all test layers required, CodeQL, Dependabot, SHA-pinned actions, deploy on every merge (§11) |

---

## 3. Information architecture

### 3.1 Sitemap

```
/                         Home (profile rail; canvas: skills, work & writing, STAR, contact)
/experiences/             Experiences (summary, experience, Download PDF; /cv/ redirects here)
/projects/                Projects (all kinds, filter chips, cards expand in place)
/experiences/print/       Print-only CV layout used to make the PDF (noindex)
/cv.pdf                   Generated PDF (English)
/star/                    STAR stories grouped by role/company
/star/<slug>/             Single STAR story (deep-linkable, shareable)
/blog/                    Blog index (newest first)
/blog/<slug>/             Blog post
/blog/tags/               All tags with post counts
/blog/tags/<tag>/         Posts for one tag
/blog/series/             All series
/blog/series/<slug>/      One series: every part, published or coming soon
/rss.xml                  RSS feed (English)
/404.html                 Not found

/vi/...                   Vietnamese mirror of every route above
/vi/cv.pdf                Generated PDF (Vietnamese)
/vi/rss.xml               RSS feed (Vietnamese)
```

### 3.2 Global navigation

- **Nav bar (sticky, frosted glass):** logo/name (links home) · Experiences · Projects · STAR · Blog · Search (⌘K) · theme toggle · language switch (EN / VI).
- **Mobile (< 768px):** the links collapse into a full-screen sheet behind a menu button. Search, theme and language stay visible.
- **Footer:** social icons (Email, LinkedIn, GitHub, plus optional X/Bluesky), RSS link, copyright, "Built with Astro" note.

---

## 4. Page specifications

### 4.1 Home (`/`)

> **v1.1 change (M8):** the v1 Home was a single centred 1120px column. At 1440px and wider it left 160–400px empty on each side. Sparse sections (2 certifications, 1 post, a 2×2 skill card that was mostly empty) also left tall gaps. Home now uses a **profile rail + content canvas** layout that fills wide screens. All other pages keep the 1120px column (§5.4).

#### 4.1.0 Layout

Home has three layouts, chosen by viewport width:

| Width | Layout |
|---|---|
| **≥ 1280px** (`xl`) | **Split layout.** A sticky **profile rail** on the left (fixed 360px) and a scrolling **content canvas** on the right (fluid, 3-column grid). The container is `min(100% − 2 × gutter, 1520px)`, so at 1920px each side margin is at most 200px. |
| **1024–1279px** (`lg`) | The rail turns into a **two-column profile header**: identity on the left, stats and contact on the right. It is not sticky. The canvas follows below at full container width with a 3-column grid. |
| **< 1024px** | Everything stacks in one column: profile header, then canvas sections. The canvas grid is 2 columns at ≥ 640px and 1 column below that. |

- **Nav and footer on Home:** the nav bar and the footer use the same `min(100% − 2 × gutter, 1520px)` container as the rail and canvas (a `wide` prop through `BaseLayout`), so the brand sits on the rail's left edge and the footer's right edge on the canvas's right edge. Every other page keeps the 1120px nav and footer.
- **Full-bleed bands:** the hero glow and the section bands span the full viewport width, even though the content stays inside the container. At wide widths the sides read as part of the design, not as empty page. The bands alternate `--bg` and `--surface-2`, and the glow uses the mint→sky radial (§5.2).
- **Vertical rhythm:** Home uses tighter section spacing than other pages: **64px (mobile) → 96px (desktop)**, replacing 96 → 160px. Inside the canvas, sections are 64px apart at every width.
- **No dead space rules:**
  - At 1440px and 1920px, no vertical gap between two content blocks is taller than 160px.
  - No card is stretched taller than its content by more than one grid row gap (24px). Cards size to their content (`align-self: start`), and grids never stretch cards to match a neighbour.
  - A section with fewer items than columns does not leave empty columns. It either shares a row with another section (§4.1.4) or its cards widen to fill the row.

#### 4.1.1 Profile rail (≥ 1280px) / profile header (< 1280px)

Replaces the v1 **Hero** and **Highlights bento**.

| Block | Content |
|---|---|
| Identity | Name (Display size, §5.3), headline + tagline, the one-line positioning statement, location with a `map-pin` icon. |
| Actions | Pill buttons: **View experiences** (primary), **Download PDF** (secondary, `download="Ryan-Parker-CV.pdf"`). Directly under them, aligned with the pills and with a tight top margin, a quiet text link **Read the blog →** (44px tap target, no indent). |
| Stats | A compact 3-item stat list: **years of experience** (`profile.yearsOfExperience`), **current role** (newest experience with empty `end`, with company and "Since <date>"), **headline metric** (`profile.headlineMetric`). Numbers in H2 size, labels in caption size. The number comes before its label in every layout; the current-role tile reads label, role, then company. |
| Languages | One line per `profile.spokenLanguages` entry: *English — Professional working proficiency*. Replaces the v1 Languages bento card. |
| Contact | Email, phone, LinkedIn, GitHub icon buttons (44px targets), the same links as §8.3. |
| Section index | **"On this page"**: Skills · Work & writing · STAR stories · Contact. Links to the canvas section anchors. The current section is the last one whose top has passed a reading line. The line starts at 30% of the viewport height and slides down as the page is scrolled (`30% + 40% × scrollY / maxScroll`), so a section near the end still gets a turn on tall viewports where the page barely scrolls (at 1920×1080 the page scrolls only about 1475px). At the very bottom of the page the last section is current. A clicked item stays current until the user scrolls (wheel, touch or keys), because short pages cannot scroll the target up to the reading line. "Skills" is current in the server-rendered HTML, so there is no empty state on load. Shown **only at ≥ 1280px**. |

- **Sticky behaviour (≥ 1280px):** `position: sticky; top: calc(52px + 32px)` (nav height + spacing), `max-height: calc(100vh − 52px − 64px)`, `overflow-y: auto` with a hidden scrollbar. **Nothing in the rail is ever clipped or unreachable.** Sticky behaviour applies only at viewport heights of **551px and above** (the smallest rail, 435px, plus 116px for the nav and spacing). Below 551px the rail is `position: static` with no max-height or inner scroll, so it scrolls with the page and every block (including the contact icons and the hidden-by-priority blocks) is shown. The rail needs about 744px with everything shown, so lower-priority blocks are hidden by priority when the viewport is too short: the **Section index** first (below 864px viewport height), then **Languages** (below 675px), then the **positioning line** (below 637px), then the **location line** (below 585px); these hiding rules only apply at 551px and above. The breakpoints match the measured rail height (744 / 556 / 518 / 466 / 435px, the same in EN and VI) plus 116px for the nav and spacing. A tiny script (`rail-fit.ts`) re-checks at run time and hides the next block while the rail overflows, which covers zoom, fonts and longer translations.
- **Profile header (1024–1279px):** two columns. On the left: Identity and Actions. On the right: Stats as a 3-tile row, then Languages and Contact. The mint→sky glow sits behind the left column.
- **Stacked (< 1024px):** Identity → Actions → Stats (3 tiles in a row at ≥ 480px, otherwise a list) → Languages → Contact.
- Exactly **one H1** (the name) at every width.

#### 4.1.2 Content canvas

The canvas has four sections, in this order: **Skills → Work & writing → STAR stories → Contact**. Each section has an `id`, an H2, and an optional one-line subline in `--text-2`.

#### 4.1.3 Technical skills (`id="skills"`)

- **Header:** "Technical skills" plus the subline *"The tools I use to build and run data platforms."*
- **Balanced columns, not a fixed-span bento.** The skill cards are laid out as **3 columns (≥ 1024px), 2 columns (≥ 640px), 1 column below that**. Cards are distributed into the columns **at build time**:
  - A deterministic greedy fill. Cards are taken in `order` and each goes into the currently shortest column, using an estimated height (`120 + 22 × chip rows + 20 × description lines`, where chip rows assume about 4 chips per row and description lines about 60 characters each).
  - Each column is a vertical flex stack with a 24px gap, so there are no row-height gaps.
  - The DOM order stays in `order` for screen readers and keyboard focus. Columns are visual only (CSS grid placement with `grid-row` / `grid-column` from the build-time assignment).
  - No client JavaScript is involved.
- **The `size` field changes meaning:** `1x1` = one column; `2x1` and `2x2` = **span 2 columns** at ≥ 1024px (treated as `1x1` in the 2- and 1-column layouts). Height always comes from content. A wide card is placed first in its row band, and the balancing continues below it.
- **Each card shows** the icon (Lucide, 28px), the name (H3), the description (≤ 200 characters, `--text-2`), and the chips with child chips. This is unchanged from v1.
- `tint` is unchanged (`mint | sky | butter`).
- **No Languages card.** Spoken languages move to the profile rail (§4.1.1).
- **Footer link:** "See where I used them →" to `/experiences/`.
- **Motion:** reveal with 60ms stagger per column. Hover lift `scale 1.01` on pointer devices only.

#### 4.1.4 Work & writing (`id="work"`)

One row that combines three short lists. Together they fill the width even when each list has only one or two items.

| Column (≥ 1024px) | Content |
|---|---|
| **Featured project** (1 col) | The first `featured` project: kind badge, title, subtitle, summary, tech chips (first 6, then "+N"), and **"All projects →"** to `/projects/`. |
| **Latest writing** (1 col) | Up to 3 newest published posts as a compact list: title, date, reading time, and the series chip when the post is in a series. Then **"All posts →"**. If there are no posts, the column shows *"First post coming soon."* |
| **Certifications** (1 col, `id="certifications"`) | Newest first, as compact rows: badge (40px) or monogram, name, issuer, year chip, and **Verify ↗** when `credentialUrl` is set (`target="_blank" rel="noopener"`). The v1 badge cards (§4.1.2 in v1) are replaced by these rows. |

- 2 columns (640–1023px): Featured project spans both columns, then Latest writing | Certifications.
- 1 column: stacked in table order.
- Each column is a card (`--surface`, 24px radius, standard shadow) with the column title as an H3. The three cards align at the top and are **not** stretched to equal height.

#### 4.1.5 Featured STAR stories (`id="stories"`)

- Up to 3 stories with `featured: true`, as in v1 (title, competency chips, result metric, link to `/star/<slug>/`).
- **Layout adapts to the count:** 3 stories → 3 columns; 2 stories → 2 equal columns (`grid-template-columns: repeat(2, 1fr)`); 1 story → one wide card showing the question and the Situation summary as well. Below 1024px: 2 columns, then 1.
- **"All stories →"** to `/star/`.
- **No featured stories:** the whole section is left out and the Section index drops its "STAR stories" link, so no empty card or dead anchor is shown.

#### 4.1.6 Contact (`id="contact"`)

- At ≥ 1280px, contact links are already in the rail, so the canvas ends with a **compact contact band**: one row with "Let's talk" (H2) and a one-line subline on the left, and the `mailto:` pill on the right. The whole section (including its padding) is at most 160px tall at ≥ 1280px.
- Below 1280px it is the v1 centred block: headline, subline, `mailto:` pill and social icons.

**Acceptance criteria (Home)**
- At 1920 × 1080: the content container is at least 1520px wide, or the full viewport width minus 2 × gutter if that is smaller. The profile rail is visible and stays in view while the canvas scrolls.
- At 1440px and 1920px, no vertical gap between consecutive content blocks in `main` is taller than 160px (measured between bounding boxes).
- At every width, no skill card is more than 24px taller than its content (measured as card height minus the sum of its children's heights and padding).
- Adding a file to `src/content/skills/` adds a card and rebalances the columns with no code changes. The DOM order of skill cards matches `order`.
- Adding a certification, a post or a featured project fills the matching Work & writing column with no code changes. An empty list shows its empty-state line instead of an empty card.
- The Section index highlights the section being read (and a clicked item stays current until the user scrolls), and links to `#skills`, `#work`, `#stories` and `#contact`.
- At every common laptop size (e.g. 1280×800, 1366×768, 1536×864, 1280×700, 1440×900), in EN and VI, the rail's content fits without clipping: lower-priority blocks are hidden instead (§4.1.1).
- The nav brand lines up with the rail's left edge and the footer with the canvas's right edge at ≥ 1280px. `/#skills` and `/#certifications` still deep-link and land below the nav (`scroll-margin-top`).
- The page has one H1. Headings go H1 → H2 → H3 with no skipped levels.
- No horizontal scroll from 320px wide upward. Layout changes happen at 1024px and 1280px with no overlap or clipped content.
- With JavaScript off, every section and card is visible. Only the Section index highlighting needs JS.
- Lighthouse on `/` and `/vi/` stays ≥ 0.95 in every category, and CLS stays < 0.05. The sticky rail must not cause layout shift.

### 4.2 Experiences (`/experiences/`)

The old `/cv/` and `/vi/cv/` URLs redirect to `/experiences/` and `/vi/experiences/` (static meta-refresh pages generated by Astro `redirects`; they are excluded from the sitemap and the search index).

Section order: Header → Summary → Experience. **Projects, technical skills and certifications are not shown on this page.** Projects live on `/projects/` (§4.6), and skills and certifications on Home (§4.1.3, §4.1.4). All three are still included in the PDF (§4.3).

1. **Header:** name (display size), headline (*Senior Data Engineer — Data Pipelines, ETL/ELT & Cloud Data Platforms*), location, and a contact row with email (`mailto:`), phone (`tel:`), LinkedIn and GitHub. Each contact item has an icon and is a 44px tap target. A **Download PDF** pill button links to `/cv.pdf` (or `/vi/cv.pdf`) with `download="Ryan-Parker-CV.pdf"`.
2. **Summary:** the profile summary paragraph, set slightly larger than body text (~19px) and at most ~68ch wide. Key technologies are in **bold**, the same as in `cv.tex`. Under it are two small text links: *"Projects →"* to `/projects/` and *"Skills & certifications →"* to `/#skills`.
3. **Experience timeline:** vertical timeline, newest first.
   - Each entry shows the company and optional client (shown as "Datum / Security Bank"), role, location, date range ("Present" when `end` is empty), achievement bullets (Markdown body) and tech chips.
   - **Achievement bullets** keep the `cv.tex` pattern: a bold label, then the detail, e.g. `- **Team Leadership & Code Review:** Lead and mentor a team of **7 engineers**, …`. Bold terms in the detail (technologies, metrics) stay bold. The label is styled in `--text` at weight 600 and the detail in `--text-2`.
   - **Dates** can be month precision (`2026-08` → "Aug 2026") or year only (`2024` → "2024"), because `cv.tex` uses both.
   - **The same company can appear more than once** (FPT Software 2020–2021 and 2026–Present). These stay as separate entries in date order and are never merged.
   - If the role has STAR stories, show a **"N STAR stories →"** link to `/star/#<role-slug>`.
   - Entries fade and slide up as they scroll into view.

**Acceptance criteria**
- Adding a file to `src/content/experience/` adds a timeline entry with no code changes.
- `/experiences/` renders **no** projects, skills or certifications section.
- Roles are sorted by `start` descending, and the current role (empty `end`) always comes first. Year-only dates sort as January of that year.
- Year-only dates render without a month, and month dates render as `MMM YYYY` (EN) or `MM/YYYY` (VI).
- Two roles at the same company render as two separate timeline entries.
- Phone renders as a `tel:+84963378831` link and email as a `mailto:` link, on the web and in the PDF.
- The Download PDF button points to a file that exists in the deployed build.
- Every experience bullet in `cv.tex` appears on `/experiences/`. Every project bullet appears on `/projects/`, and every skill and certification on Home. All of them appear in the PDF. A one-off migration checklist (Appendix A) is ticked off in M2.

### 4.3 CV PDF (built automatically)

- The web Experiences content (§4.2) is the **single source of truth**. `cv.tex` is used once to migrate the content and is not kept in sync afterwards.
- `/experiences/print/` is a print-friendly version of the Experiences page content **plus** the projects, skills and certifications collections (which the Experiences page leaves out), laid out like `cv.tex`:
  - **Header:** name and headline on the left, with email, phone, LinkedIn and GitHub on the right.
  - **Sections:** Summary → Experience → Selected Projects → Technical Skills → Certifications. Headings are small caps with a thin rule under each.
  - **Experience entries:** company and location on one line, role and dates on the next, then the labelled bullets.
  - **Selected projects:** projects with `inPdf: true` (default: those marked `featured`), each laid out like an experience entry (title | dates, subtitle) followed by all its bullets.
  - **Technical skills:** a two-column table (group name | items) with no descriptions or icons. The last row is **Languages**, built from `profile.spokenLanguages`, as in `cv.tex`.
  - **Certifications:** one line each, *Name (Year)*, as in `cv.tex`.
  - **Styling:** one column, Inter, light theme forced. The only pastel is a mint rule under section headings. No nav, footer, animations or chips. Links are shown as readable text.
- In CI, after `astro build`, `scripts/build-cv-pdf.ts`:
  1. Serves `dist/` locally.
  2. Opens `/experiences/print/` and `/vi/experiences/print/` in Playwright (Chromium).
  3. Waits for fonts to load (`document.fonts.ready`).
  4. Saves `page.pdf({ format: 'Letter', printBackground: true, margin: { top: '0.5in', bottom: '0.5in', left: '0.6in', right: '0.6in' } })` to `dist/cv.pdf` and `dist/vi/cv.pdf`.
- PDF metadata: title = "Ryan Parker — Senior Data Engineer CV", author = "Ryan Parker", subject = the headline.
- `/experiences/print/` has `<meta name="robots" content="noindex">` and is left out of the sitemap and the search index.

**Acceptance criteria**
- The PDF has selectable text (not an image) and working `mailto:`, `tel:`, LinkedIn and GitHub links.
- The build fails if PDF generation fails.
- The PDF is US Letter and fits in **at most 2 pages** with the real content from Appendix A.

### 4.4 STAR stories (`/star/`)

**Layout: grouped by role/company**

- Page intro: a short explanation of the STAR method and a legend for the four step colours.
- One group per role, ordered like Experiences (newest first). Each group header shows company, role, date range and a link back to that Experiences entry (*"View in experiences"*). Each group has an `id` equal to the role slug so Experiences can link to it.
- Stories without a `role` go in a final **"Other / Personal"** group.
- Controls at the top: **Expand all / Collapse all**, plus a competency filter (chips) that hides non-matching stories but keeps the groups.

**Story card (collapsed)**
- Title, the interview question it answers (e.g. *"Tell me about a time you disagreed with a stakeholder"*), competency chips, and the headline result metric as a chip (e.g. `+40% conversion`).

**Story card (expanded): vertical stepper**

```
● Situation  ▾        (mint)
│  ...content...
● Task       ▸        (sky blue)
│
● Action     ▸        (butter)
│
● Result     ▸        (mint → sky gradient) + metric chips
```

- Each step is a native `<details>/<summary>`, so it works without JavaScript and is accessible by default.
- Situation is open when the card is expanded. The other steps start collapsed.
- The connector line and step dots use that step's colour. The Result step shows all `metrics` as chips.
- A **permalink** icon on each card links to `/star/<slug>/`, which shows the story with all steps open.

**Acceptance criteria**
- Every story file must contain exactly four H2 headings, `Situation`, `Task`, `Action`, `Result`, in that order (Vietnamese files use `Bối cảnh`, `Nhiệm vụ`, `Hành động`, `Kết quả`). Otherwise the build fails with a clear error naming the file.
- Expand/collapse works with keyboard (Enter/Space) and screen readers announce the expanded state.
- Filtering by competency updates the URL (`?c=leadership`) so filtered views can be shared.

### 4.5 Blog

**Index (`/blog/`)**
- Large title, tag chips row, list of post cards (title, description, date, reading time, tags), newest first.
- `draft: true` posts are hidden in production builds and shown in `astro dev`.

**Post (`/blog/<slug>/`)**
- Header: title (large, Inter), description, date (+ "Updated" date if set), reading time, tags.
- Body in **Newsreader serif**, ~18–20px, line-height 1.7, max width ~68ch.
- **Sticky TOC** on the right (≥ 1024px) built from H2/H3, with the current section highlighted while scrolling. On smaller screens it becomes a collapsible "On this page" block above the content.
- **Code blocks:** Shiki highlighting with light/dark themes that match the site theme, a language label and a **Copy** button. They also support:
  - a **filename title** (` ```lua title="lua/ryanparker/lazy.lua" `), shown as a header bar above the code;
  - **line highlights** (` {3-5} `), shown with a mint-tint background;
  - a `shell` / `sh` block with a `$` prompt that is **not copied** with the command.
- **Callouts:** an MDX `<Callout type="note | tip | warning">` component. It renders as a rounded block with an icon and a tint (note = sky, tip = mint, warning = butter with `--text` borders for contrast) and uses `role="note"`.
- **Keys:** `<kbd>` is styled as a small rounded keycap, e.g. <kbd>Space</kbd> <kbd>f</kbd> <kbd>f</kbd>.
- **Diagrams:** inline SVG Astro components imported into MDX (§4.5.1).
- **Footer:** previous/next post, tag links, back to blog. For a post in a series, the previous/next links point to the **previous/next part of the series** instead.

**Series**
- A post joins a series through `series` + `seriesPart` frontmatter (§6.7). The series itself is defined in the `series` collection (§6.8), which lists **every planned part**, including parts not yet written.
- **Series box:** shown under the post header. It reads e.g. *"Part 1 of 5 · Neovim setup guide"*, followed by an ordered list of all parts:
  - the current part is shown in bold;
  - published parts are links;
  - unpublished parts are greyed out with a "Coming soon" chip and are **not** links.
  - The box collapses to a single "Part 1 of 5 ▾" line on screens under 640px.
- **Prev/next part:** a footer pair, *"← Part 0: …"* / *"Part 2: … →"*. A side is hidden when that part doesn't exist or isn't published yet.
- **Series index** (`/blog/series/<slug>/`): series title, description, a progress line (e.g. "1 of 5 published"), and every part as a card with part number, title, description, reading time and status. `/blog/series/` lists all series.
- **Blog index:** a post in a series shows a small chip "Neovim setup guide · Part 1" linking to the series index.
- **RSS:** published parts appear like normal posts, with the title prefixed "Part N:" only when the title doesn't already include it.

#### 4.5.1 Inline SVG diagrams

- Each diagram is an Astro component in `src/components/blog/diagrams/` that renders inline `<svg>`, so it inherits the theme. Colours use the CSS tokens (`var(--mint-tint)`, `var(--text)` …), never hard-coded hex values, and dark mode works automatically.
- **Accessibility:** `role="img"`, `<title>` and `<desc>`, plus a visually hidden ordered list that describes the same flow in text.
- **Responsive:** a horizontal layout (≥ 768px) and a vertical layout below that, chosen with CSS (`<picture>`-style twin SVGs, only one shown). Text stays at least 14px at every width, with no horizontal scroll.
- **i18n:** labels that are file or plugin names stay as they are. Captions and descriptive labels come from a `lang` prop.
- **Print and RSS:** the RSS feed gets a short text fallback (the ordered list) in place of the SVG.

**Tags**
- `/blog/tags/`: all tags with counts. `/blog/tags/<tag>/`: posts for that tag.
- Tag slugs are lowercase and kebab-case.

**RSS**
- `@astrojs/rss` at `/rss.xml` (EN) and `/vi/rss.xml` (VI), containing published posts only, with full title, description, date and link.

### 4.6 Projects (`/projects/`)

A main-nav page that shows **all** projects (personal, work and open source). There are **no per-project detail pages**: each card expands in place.

1. **Header:** title "Projects" (H1) and a one-line subline (e.g. *"Things I've built at work and on my own."*).
2. **Kind filter:** an Apple-style segmented control with **All · Personal · Work · Open source**, each with a count (e.g. *Personal 1*).
   - Kinds with zero projects are hidden. If only one kind exists, the control is hidden altogether.
   - The selected filter is stored in the URL (`?kind=personal`), so filtered views can be shared, and Back/Forward works.
   - Without JS every project is shown and the control is hidden, so the page still works.
3. **Project grid:** 3 columns (≥ 1024px), 2 (≥ 640px), 1 below that, with `align-items: start` so an expanding card doesn't stretch its neighbours.
   - **Sort order:** featured first, then by `start` descending, with an empty `end` (ongoing) before finished projects that started in the same year.
   - **Featured projects** span 2 columns on screens ≥ 640px.
4. **Project card (collapsed):**
   - optional cover image (16:9, rounded top corners, lazy-loaded);
   - the **title** (H2), **subtitle**, and a **kind badge** (Personal = mint, Work = sky, Open source = butter);
   - the **date range** (`formatCvDate()`, "Present" when ongoing) and the one-line **summary**;
   - **tech chips**;
   - **links:** **Repo ↗** and **Live ↗** (only when set), plus, when `role` is set, *"At Datum / Security Bank"* linking to `/experiences/#<role-slug>`.
5. **Details (expanded in place):** a native `<details>` with a **"Details"** summary row. Opening it shows the labelled bullets from the Markdown body (`- **Orchestrated Specialist Flows:** …`). The height animates over 300ms, and the animation is turned off under reduced motion. Several cards can be open at once, and an **Expand all / Collapse all** control sits next to the filter.
6. **Empty state:** if a filter matches nothing (e.g. through a hand-edited URL), show *"No projects here yet."* with a button that resets to All.

**Acceptance criteria**
- **Projects** appears in the main nav after **Experiences**, on desktop and in the mobile sheet, with `aria-current="page"` on `/projects/` and `/vi/projects/`.
- Adding a file to `src/content/projects/` adds a card with no code changes. An unknown `kind` fails the content schema.
- Filtering updates the grid and the URL, and loading `/projects/?kind=work` opens with that filter selected.
- Every card's Details expands and collapses with keyboard (Enter/Space), and screen readers announce the expanded state.
- There is no `/projects/<slug>/` route. Each card has an `id` equal to its slug so `/projects/#<slug>` deep-links to it and opens its Details.
- Every project bullet from `cv.tex` appears inside its card's Details.

---

## 5. Design system

### 5.1 Principles (Apple-inspired)

- **Content first:** generous whitespace, one idea per section, nothing decorative that isn't needed.
- **Big, confident type:** display headlines with tight letter spacing.
- **Soft depth:** translucent surfaces, subtle shadows, rounded corners. No hard borders.
- **Calm motion:** short, eased transitions. Nothing loops or bounces.

### 5.2 Colour tokens

Pastels are used for **surfaces, fills, chips and accents**. Body text is never set in a pastel on a light background, because it would fail contrast. Darker "ink" shades are used for accent text on light backgrounds.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F8FAFC` | `#0B0F14` | Page background |
| `--surface` | `#FFFFFF` | `#141A21` | Cards |
| `--surface-2` | `#F1F5F9` | `#1C232C` | Subtle panels, code blocks |
| `--text` | `#1D1D1F` | `#F5F5F7` | Primary text |
| `--text-2` | `#6E6E73` | `#A1A1A6` | Secondary text |
| `--border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.10)` | Hairlines |
| `--mint` | `#A8E6CF` | `#A8E6CF` | Primary pastel fill / dark-mode accent text |
| `--sky` | `#A0C4FF` | `#A0C4FF` | Secondary pastel fill / dark-mode accent text |
| `--butter` | `#FDFFB6` | `#FDFFB6` | Highlight fill |
| `--mint-tint` | `#A8E6CF` @ 35% | `#A8E6CF` @ 12% | Mint card/chip backgrounds |
| `--sky-tint` | `#A0C4FF` @ 35% | `#A0C4FF` @ 12% | Sky card/chip backgrounds |
| `--butter-tint` | `#FDFFB6` @ 60% | `#FDFFB6` @ 10% | Butter backgrounds |
| `--mint-ink` | `#1E6B50` | `#A8E6CF` | Accent text on light/dark |
| `--sky-ink` | `#1F4FA0` | `#A0C4FF` | Links, focus rings |
| `--nav-glass` | `rgba(248,250,252,0.72)` | `rgba(11,15,20,0.72)` | Frosted nav background |

- **Links:** `--sky-ink`, underline on hover.
- **Primary button:** `--text` background with `--bg` text (Apple-style dark pill). **Secondary button:** `--sky-tint` background with `--text` text.
- **Hero gradient glow:** radial mint→sky at low opacity behind the headline.
- All text/background pairs must meet **WCAG 2.2 AA** (4.5:1 body, 3:1 large text and UI). This is checked in CI (§9).

### 5.3 Typography

| Role | Font | Size (mobile → desktop) | Weight | Tracking |
|---|---|---|---|---|
| Display (hero) | Inter | `clamp(2.5rem, 6vw, 4.5rem)` | 700 | -0.025em |
| H1 | Inter | `clamp(2rem, 4vw, 3rem)` | 700 | -0.02em |
| H2 | Inter | `clamp(1.5rem, 3vw, 2.25rem)` | 600 | -0.015em |
| H3 | Inter | 1.25rem | 600 | -0.01em |
| Body (UI) | Inter | 1.0625rem (17px, Apple default) | 400 | 0 |
| Blog body | Newsreader | 1.1875rem (19px) | 400 | 0 |
| Caption / meta | Inter | 0.875rem | 500 | 0 |
| Code | `ui-monospace, SF Mono, JetBrains Mono, monospace` | 0.9em | 400 | 0 |

- Fonts are self-hosted with `@fontsource-variable/inter` and `@fontsource-variable/newsreader`. No third-party font requests.
- `font-display: swap`. Preload Inter's Latin and Vietnamese subsets.
- The Vietnamese subset must be included for both fonts so diacritics render correctly.

### 5.4 Layout, shape and depth

- **Grid:** 8px spacing scale. Content max width 1120px (**Home: 1520px**, §4.1.0), reading max width 68ch. Side gutters 16px (mobile) → 24px (tablet) → 32px (desktop).
- **Breakpoints:** `sm 640` · `md 768` · `lg 1024` · `xl 1280`.
- **Radius:** cards 24px, bento cards 28px, chips 999px, buttons 980px (pill), inputs 12px.
- **Shadow:** `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)` in light mode. In dark mode, use a border instead of a shadow.
- **Section spacing:** 96px (mobile) → 160px (desktop) vertical padding between major sections. **Home uses 64px → 96px** (§4.1.0).
- **Full-bleed bands:** a section background may span the full viewport width while its content stays in the container. Used on Home (§4.1.0).

### 5.5 Signature components

| Component | Spec |
|---|---|
| **Frosted glass nav** | `position: sticky; top: 0`, height 52px, `background: var(--nav-glass)`, `backdrop-filter: saturate(180%) blur(20px)`, hairline bottom border that appears once the page scrolls past 8px. Solid `--bg` fallback when `backdrop-filter` is not supported. |
| **Bento grid** | CSS grid, 4 columns desktop / 2 tablet / 1 mobile, `grid-auto-flow: dense`. Card spans: `1x1`, `2x1`, `1x2`, `2x2`. Each card can have a pastel tint background. **Home skills use balanced columns instead (§4.1.3).** On hover (pointer devices only), the card scales to `1.01` and its shadow grows. |
| **Pill button** | Height 44px (touch target), padding 0 22px, radius 980px. Primary and secondary styles (§5.2). Clear focus ring: 2px `--sky-ink`, 2px offset. |
| **Chip** | Height 28px, radius 999px, tint background, `--text` label, 0.8125rem/500. |
| **Timeline** | 2px vertical line in `--border`, 12px dots filled `--mint` (current role uses a `--sky` ring). |
| **STAR stepper** | See §4.4. Step colours: S = mint, T = sky, A = butter, R = mint→sky gradient. |
| **Search modal** | Spotlight-style centred panel, frosted backdrop, opened with ⌘K / Ctrl+K / `/` or the nav icon. Esc closes it and focus returns to the trigger. |
| **Theme toggle** | Three states: System (default) → Light → Dark. Icon button with a tooltip. |

### 5.6 Motion

- **Scroll reveal:** sections and cards fade in (`opacity 0 → 1`) and rise (`translateY 16px → 0`) when 15% visible, using `IntersectionObserver`. Each element animates once. Children in a grid stagger by 60ms.
- **Easing:** `cubic-bezier(0.25, 0.1, 0.25, 1)`. **Durations:** 200ms (hover), 300ms (expand), 600ms (reveal).
- **Reduced motion:** with `prefers-reduced-motion: reduce`, all transforms and reveals are disabled and content shows immediately. No JS is required for content to be visible: elements start hidden only when the `.js` class is on `<html>`.
- No animation libraries. CSS + a small vanilla script (< 2 KB).

### 5.7 Dark mode

- Default: follows `prefers-color-scheme`.
- The toggle overrides it and stores `theme = system | light | dark` in `localStorage` (wrapped in try/catch).
- A small inline script in `<head>` sets `data-theme` before first paint, so the page never flashes the wrong theme.
- Shiki uses a dual theme (e.g. `github-light` / `github-dark`) switched by CSS variables.
- The print/PDF layout always uses the light theme.

---

## 6. Content model

All content lives in `src/content/` as Markdown/MDX, validated by **Astro content collections** with Zod schemas. The build fails on invalid frontmatter.

Translations sit side by side in per-language folders: `en/` and `vi/`. Two files with the **same filename** are translations of each other.

**Date fields in CV collections** (`start`, `end`, `year`) accept `YYYY` or `YYYY-MM` as strings, validated with a regex. A shared `formatCvDate()` helper renders them (§4.2).

### 6.1 `profile` (single entry per language)

`src/content/profile/en/index.md`

```yaml
name: "Ryan Parker"
headline: "Senior Data Engineer"
tagline: "Data Pipelines, ETL/ELT & Cloud Data Platforms"
location: "Ho Chi Minh City, Vietnam"
email: "ryanparker.p.97@gmail.com"
phone: "+84963378831"           # E.164 format, used for tel: links
phoneDisplay: "(+84) 963 378 831"
avatar: "./avatar.jpg"          # optional
yearsOfExperience: "5+"
headlineMetric: "7 engineers led"  # optional; shown in the Home profile rail stats (§4.1.1)
socials:
  linkedin: "https://www.linkedin.com/in/jomatran"
  github: "https://github.com/jomatran97"
  x: ""                         # optional
  bluesky: ""                   # optional
spokenLanguages:
  - language: "English"
    proficiency: "Professional working proficiency"
```
Body: the CV **Summary** paragraph (Markdown, bold allowed). It is used on the Experiences page, in the PDF, and in shortened form on the home hero.

### 6.2 `experience`

`src/content/experience/en/fpt-software-senior-data-engineer.md`

```yaml
company: "FPT Software"
client: ""                      # optional, e.g. "Security Bank" → shown as "Datum / Security Bank"
role: "Senior Data Engineer (Team Lead)"
location: "Ho Chi Minh City, Vietnam"
start: "2026-08"                # "YYYY" or "YYYY-MM"
end:                            # empty = Present
logo: "./logos/fpt.svg"         # optional
tech: ["Python", "PySpark", "Databricks", "Azure", "Talend", "Salesforce", "AWS", "AI agents"]
```
Body: labelled achievement bullets.

```md
- **Team Leadership & Code Review:** Lead and mentor a team of **7 engineers**, owning delivery planning, …
- **ETL/ELT Migration Strategy:** Own the technical approach for migrating legacy **Talend** ETL jobs to **Databricks** on **Azure** …
```

### 6.3 `skills`

`src/content/skills/en/cloud-platform.md`

```yaml
group: "Cloud Platform"
order: 2
description: "Build AWS data lakes and warehouses on S3, Athena, Redshift and EMR, and deliver data from Databricks on Azure."   # 1–2 sentences, max 200 chars
icon: "cloud"                   # Lucide icon name
size: "1x1"                     # 1x1 | 2x1 | 2x2 — 2x1 and 2x2 span 2 columns on Home at ≥ 1024px; height follows content (§4.1.3)
tint: "sky"                     # mint | sky | butter
items:
  - name: "AWS"
    children: ["EMR", "S3", "Athena", "Redshift", "Lake Formation"]   # optional
  - name: "Azure"
    children: ["Databricks"]
```
`description`, `icon`, `size` and `tint` are used on Home only. The PDF uses only `group` and `items`.

### 6.4 `projects`

`src/content/projects/en/agentic-coding-workflow.md`

```yaml
title: "Agentic Coding Workflow"
subtitle: "Multi-model Orchestration & Developer Tooling"
kind: "personal"                # personal | work | open-source
summary: "A single-orchestrator coding system that coordinates Claude, Gemini and Codex across 11 specialised flows."
start: "2025"
end:                            # empty = Present
tech: ["Claude", "Gemini", "Codex", "tmux", "hcom", "AI-DLC"]
repo: ""                        # optional
demo: ""                        # optional
image: ""                       # optional
featured: true                  # sorted first, 2-column card on /projects/
inPdf: true                     # optional; defaults to the value of `featured`
role: ""                        # optional reference to experience → "At <company>" link
```
Body: labelled bullets (`- **Orchestrated Specialist Flows:** …`), shown inside the card's **Details** on `/projects/` and in full in the PDF.

### 6.5 `certifications`

`src/content/certifications/en/aws-solutions-architect-associate.md`

```yaml
name: "AWS Certified Solutions Architect – Associate"
issuer: "Amazon Web Services"
year: "2022"
credentialUrl: ""               # optional, renders a Verify link
badge: ""                       # optional image (64px display); missing → issuer monogram
monogram: "AWS"                 # 2–3 letters for the fallback
```
No body. Shown on Home (§4.1.4, Work & writing) and in the PDF, **not** on `/experiences/`.

### 6.6 `star`

`src/content/star/en/talend-to-databricks-migration.md`

```yaml
title: "Planning the Talend → Databricks migration"
question: "Tell me about a time you set the technical direction for a team."
role: "fpt-software-senior-data-engineer"   # reference to experience; omit for "Other / Personal"
competencies: ["leadership", "ownership", "technical-depth"]
date: 2026-09-01
metrics:                        # illustrative values; replace with real ones
  - label: "jobs migrated"
    value: "<n>"
  - label: "delivery speed"
    value: "<+x%>"
featured: true
```

Body (required structure, enforced by a remark plugin at build time):

```md
## Situation
...

## Task
...

## Action
...

## Result
...
```

**Competency vocabulary** (a controlled list in `src/content/competencies.ts`, so filters stay consistent): `leadership`, `ownership`, `conflict`, `failure`, `collaboration`, `influence`, `delivery`, `ambiguity`, `customer-focus`, `technical-depth`, `mentoring`, `prioritisation`. Each has EN and VI labels.

### 6.7 `blog`

`src/content/blog/en/hello-world.mdx`

```yaml
title: "Hello, world"
description: "Why I built this site and what I'll write about."
pubDate: 2026-11-01
updatedDate:                    # optional
tags: ["meta", "astro"]
heroImage: "./hero.jpg"         # optional
draft: false
series: ""                      # optional, id of an entry in the `series` collection
seriesPart:                     # required when `series` is set; integer ≥ 1, unique within the series
```

The schema checks that `series` exists, that `seriesPart` is unique within the series and language, and that `seriesPart` matches a part listed in the series entry.

### 6.8 `series`

`src/content/series/en/neovim-setup-guide.md`

```yaml
title: "Neovim setup guide"
description: "Build a fast, minimal Neovim 0.12 setup for web, data engineering and SRE work, one step at a time."
parts:
  - part: 1
    title: "From zero to a working editor"
    description: "Install the tools, get the config, first launch and checks."
  - part: 2
    title: "Languages: LSP, completion, formatting and linting"
  - part: 3
    title: "Data engineering: dbt, SQL, databases and CloudFormation"
  - part: 4
    title: "Java with nvim-jdtls"
  - part: 5
    title: "Debugging, testing and the daily workflow"
```
Body: optional series intro, shown on the series index page. A part counts as **published** when a non-draft blog post has a matching `series` + `seriesPart`. Otherwise it shows as "Coming soon".

---

## 7. Internationalisation

- Astro i18n routing: `defaultLocale: 'en'`, `locales: ['en', 'vi']`, `prefixDefaultLocale: false`. English lives at `/`, Vietnamese at `/vi/`.
- **UI strings** (nav, buttons, labels, dates) live in `src/i18n/en.json` and `src/i18n/vi.json`, read through a typed `t(key)` helper. A missing key fails `astro check`.
- **Dates** use `Intl.DateTimeFormat` with `en-GB` / `vi-VN`.
- **Language switch** in the nav goes to the same page in the other language when a translation exists, otherwise to that language's section index.
- **Missing translations:** when a `vi/` content file does not exist, the `/vi/` page shows the English content with a small banner: *"Nội dung này hiện chỉ có bằng tiếng Anh."* (`<html lang>` and `hreflang` reflect the real content language.)
- SEO: `<link rel="alternate" hreflang="en|vi|x-default">` on every page, and per-language sitemaps via `@astrojs/sitemap` i18n config.

---

## 8. Platform features

### 8.1 Search (Pagefind)

- Runs after `astro build`: `pagefind --site dist`.
- Indexes: blog posts, STAR stories (`/star/<slug>/`), the Experiences page, the Projects page (each card is a sub-result through `data-pagefind-meta` and its `#<slug>` anchor). Excludes: `/experiences/print/`, tag index pages, 404.
- Separate indexes per language (Pagefind detects `<html lang>`).
- Results show the page type (Blog / STAR / Experiences), title and a highlighted excerpt.
- The Pagefind UI script loads only when the search modal is first opened.

### 8.2 Analytics (Cloudflare Web Analytics)

- JS beacon with the site token from the env var `PUBLIC_CF_BEACON_TOKEN` (a GitHub Actions repository variable; see §11.3).
- Injected **only in production builds** and only when the token is set.
- Cookie-free, so no consent banner is required. A one-line note in the footer: "Privacy-friendly analytics, no cookies."

### 8.3 Contact

- `mailto:` link + social icons in the hero CTA (home), the Experiences header and the footer.
- Phone (`tel:`) in the Experiences header, the PDF and the footer.
- No form and no third-party scripts.

### 8.4 SEO and metadata

- Per-page `<title>`, meta description, canonical URL, Open Graph + Twitter card tags using one static default image (`public/og-default.png`, 1200×630, pastel brand card).
- `@astrojs/sitemap`, `robots.txt`, JSON-LD `Person` on home/Experiences and `BlogPosting` on posts.
- `public/.nojekyll` so GitHub Pages serves `_astro/` assets.

---

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Lighthouse (mobile) ≥ 95 for Performance, Accessibility, Best Practices, SEO on Home, Experiences, STAR, a blog post. LCP < 2.0s, CLS < 0.05, INP < 200ms. |
| JS budget | ≤ 30 KB (gzip) JS on any page before search is opened. No client framework runtime (Astro islands only if truly needed). |
| Images | `astro:assets` `<Image>` with AVIF/WebP, explicit width/height, lazy-loaded below the fold. |
| Accessibility | WCAG 2.2 AA. Skip link, visible focus rings, landmarks, one H1 per page, `aria-current` in nav, 44×44px touch targets, works at 200% zoom and with keyboard only. |
| Browser support | Last 2 versions of Safari (macOS/iOS), Chrome, Edge, Firefox. Graceful fallback when `backdrop-filter` is missing. |
| Responsiveness | No horizontal scroll from 320px wide upward. |
| Resilience | All content readable with JS disabled (search and theme toggle are the only JS-only features). |
| Privacy | No cookies, no third-party fonts, analytics beacon is the only third-party request. |

---

## 10. Project structure

```
.
├── .github/                  # workflows, composite setup action, Dependabot, PR template (§11.2)
├── public/
│   ├── .nojekyll
│   ├── favicon.svg
│   ├── og-default.png
│   └── robots.txt
├── scripts/
│   ├── build-cv-pdf.ts
│   └── setup-repo.sh         # one-time GitHub settings via gh api (§11.9)
├── src/
│   ├── components/
│   │   ├── nav/              # GlassNav, MobileSheet, ThemeToggle, LangSwitch
│   │   ├── ui/               # PillButton, Chip, Card, BentoGrid, BentoCard
│   │   ├── home/             # ProfileRail, SectionIndex, SkillsColumns, SkillCard, WorkWriting, CertificationRow, FeaturedStories, ContactBand
│   │   ├── cv/               # CvHeader, Summary, Timeline, TimelineItem, PrintProjects, PrintSkillsTable, PrintCertifications
│   │   ├── projects/         # ProjectGrid, ProjectCard, KindFilter
│   │   ├── star/             # StarGroup, StarCard, StarStepper, CompetencyFilter
│   │   ├── blog/             # PostCard, Toc, CopyCodeButton, ReadingTime, Callout, SeriesBox, SeriesNav, SeriesCard
│   │   │   └── diagrams/     # NeovimStartupDiagram.astro, …
│   │   └── search/           # SearchModal
│   ├── content/
│   │   ├── profile/{en,vi}/
│   │   ├── experience/{en,vi}/
│   │   ├── skills/{en,vi}/
│   │   ├── projects/{en,vi}/
│   │   ├── certifications/{en,vi}/
│   │   ├── star/{en,vi}/
│   │   ├── blog/{en,vi}/
│   │   ├── series/{en,vi}/
│   │   └── competencies.ts
│   ├── content.config.ts     # collection schemas
│   ├── i18n/                 # en.json, vi.json, t() helper, route helpers
│   ├── layouts/              # BaseLayout, PostLayout, PrintLayout
│   ├── lib/                  # reading-time, remark-star-sections, sort/group utils
│   ├── pages/                # routes (EN at root, VI under [lang] or /vi)
│   ├── scripts/              # reveal.ts, theme.ts, toc.ts, search.ts
│   └── styles/               # tokens.css, global.css, prose.css, print.css
├── tests/
│   ├── unit/                 # Vitest
│   └── e2e/                  # Playwright + axe
├── astro.config.mjs
├── lighthouserc.json
├── lychee.toml
├── playwright.config.ts
├── .nvmrc
├── tailwind / postcss config (as needed for Tailwind version)
├── tsconfig.json             # strict
├── package.json
└── spec.md
```

### 10.1 npm scripts

| Script | Does |
|---|---|
| `dev` | `astro dev` |
| `build` | `astro build && pagefind --site dist && tsx scripts/build-cv-pdf.ts` |
| `preview` | `astro preview` |
| `check` | `astro check` (types + content schemas) |
| `lint` / `format` / `format:check` | ESLint + Prettier (with `prettier-plugin-astro`, `prettier-plugin-tailwindcss`) |
| `test` | Vitest unit tests |
| `test:pdf` | Checks `dist/cv.pdf` and `dist/vi/cv.pdf` (§12) |
| `test:e2e` | Playwright e2e + accessibility against the built site |
| `lhci` | Lighthouse CI with budgets |
| `verify` | Runs the CI gates locally: `lint && format:check && check && test && build && test:pdf && test:e2e` |

Tooling: Node 22 LTS, pnpm, TypeScript strict.

---

## 11. CI/CD (GitHub Actions)

### 11.1 Summary

| Area | Decision |
|---|---|
| Repo | `jomatran97/jomatran97.github.io` (public), default branch `main` |
| Site | `https://jomatran97.github.io`. `astro.config.mjs`: `site: 'https://jomatran97.github.io'`, no `base` |
| Change flow | **PRs only.** `main` is protected by a ruleset. No direct pushes, no force pushes, nobody can bypass (admins included) |
| Approvals | **None required.** You can merge your own PR once every required check passes |
| Required gates | Lint + types + unit · E2E + accessibility · Lighthouse budgets · Link check · CodeQL |
| PR preview | Build artifact (site, CV PDFs) + Playwright, Lighthouse and link reports, plus a job summary on the run page. No live preview URL |
| Deploy trigger | **Every merge to `main`**, plus manual `workflow_dispatch` |
| Deploy method | Pages source = **GitHub Actions**. The deploy job publishes the **same artifact that passed the gates**; the site is not rebuilt for deploy |
| Dependencies | **Dependabot**: weekly grouped PRs for npm minor/patch and for GitHub Actions; major npm updates as separate PRs |
| Security | Actions pinned to full commit SHAs · least-privilege `GITHUB_TOKEN` · CodeQL (JS/TS + Actions) · secret scanning + push protection |

### 11.2 Files

```
.github/
├── actions/setup/action.yml    # composite: pnpm, node, install (run after actions/checkout)
├── workflows/
│   ├── ci.yml                  # gates on PRs; gates + deploy on main
│   └── codeql.yml              # CodeQL on PRs, main and weekly
├── dependabot.yml
└── pull_request_template.md
lighthouserc.json               # Lighthouse CI URLs + assertions
lychee.toml                     # link checker config
playwright.config.ts            # e2e projects + webServer serving dist/
.nvmrc                          # 22
package.json                    # "packageManager": "pnpm@<exact>", "engines": { "node": ">=22" }
```

### 11.3 `ci.yml` pipeline

**Triggers:** `pull_request` (to `main`), `push` (to `main`), `workflow_dispatch`.

```
              ┌──────────┐
              │  static  │  lint · format check · astro check · vitest · actionlint · zizmor
              └────┬─────┘
              ┌────▼─────┐
              │  build   │  astro build → pagefind → CV PDFs → PDF checks → upload "site" artifact
              └────┬─────┘
      ┌────────────┼──────────────┬───────────────┐
┌─────▼─────┐ ┌────▼───────┐ ┌────▼─────┐         │
│ e2e       │ │ lighthouse │ │  links   │         │
│ chromium  │ │            │ │          │         │
│ webkit    │ │            │ │          │         │
└─────┬─────┘ └────┬───────┘ └────┬─────┘         │
      └────────────┴──────┬───────┘               │
                    ┌─────▼─────┐                 │
                    │  ci-ok    │  single required check (aggregates all of the above)
                    └─────┬─────┘
                          │  only on push to main / workflow_dispatch on main
                    ┌─────▼─────┐
                    │  deploy   │  upload-pages-artifact → deploy-pages (env: github-pages)
                    └─────┬─────┘
                    ┌─────▼─────┐
                    │  smoke    │  HTTP checks against https://jomatran97.github.io
                    └───────────┘
```

| Job | Needs | Does | Timeout |
|---|---|---|---|
| `static` | — | `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm format:check` → `pnpm check` (types + content schemas) → `pnpm test` (Vitest) → `actionlint` → `zizmor` (Actions security lint) | 10 min |
| `build` | `static` | Restore the Playwright Chromium cache → `pnpm build` (Astro → Pagefind → CV PDFs) → `pnpm test:pdf` (§12 CV PDF checks) → upload `dist/` as artifact **`site`** (retention 7 days on PRs, 30 on `main`). On `main` only: also `actions/upload-pages-artifact` with `dist/` | 15 min |
| `e2e` | `build` | Matrix `browser: [chromium, webkit]`. Downloads `site`, serves it with Playwright's `webServer` (static server on `dist/`), runs e2e + axe (light/dark × EN/VI). Uploads `playwright-report-<browser>` (HTML report + traces on failure) | 20 min |
| `lighthouse` | `build` | `pnpm lhci autorun` with `staticDistDir: ./dist`, mobile preset, 3 runs (median), URLs `/`, `/experiences/`, `/projects/`, `/star/`, one blog post, `/vi/`. Assert every category ≥ 0.95. Uploads `lighthouse-report` (filesystem target; reports are **not** sent to public temporary storage) | 15 min |
| `links` | `build` | `lycheeverse/lychee-action` on `dist/**/*.html` with `--root-dir dist`. **Internal links fail the job**. External links run in a second, non-failing pass and are listed as warnings in the summary. Uploads `link-report` | 10 min |
| `ci-ok` | all above | `if: always()`. Fails unless every needed job's result is `success`. **This is the one required status check**, so matrix or job renames never break the ruleset | 2 min |
| `deploy` | `ci-ok` | `if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'`. Environment `github-pages` (URL output = page URL). `actions/deploy-pages` | 10 min |
| `smoke` | `deploy` | Retries for up to 2 min until the new build is live, then checks: `/`, `/experiences/`, `/projects/`, `/vi/`, `/star/`, `/blog/`, `/rss.xml`, `/sitemap-index.xml` → 200; `/cv/` and `/vi/cv/` (redirect pages, 200 with meta refresh) and `/vi/experiences/` → 200; `/cv.pdf` and `/vi/cv.pdf` → 200 + `application/pdf`; `/pagefind/pagefind.js` → 200; `/does-not-exist` → 404 | 5 min |

**Shared setup:** every job that needs the repo starts with `actions/checkout` (`persist-credentials: false`), because a local action can only be resolved after checkout. It then calls the composite action `.github/actions/setup/action.yml`: `pnpm/action-setup` (version from `packageManager`) → `actions/setup-node` (`node-version-file: .nvmrc`, `cache: pnpm`) → `pnpm install --frozen-lockfile`.

**Caching**
- pnpm store: through `setup-node`'s `cache: pnpm`, keyed on `pnpm-lock.yaml`.
- Playwright browsers: `actions/cache` on `~/.cache/ms-playwright`, keyed on the installed `@playwright/test` version. On a cache hit, only `playwright install-deps` runs.
- Astro image cache: `actions/cache` on `node_modules/.astro`, keyed on `hashFiles('src/**/*.{png,jpg,jpeg,webp,avif,svg}')`.

**Job summary** (`$GITHUB_STEP_SUMMARY`), written by each job so the run page works as the PR preview:
- `build`: page count, `dist/` size, both PDFs' page counts and sizes.
- `e2e`: pass/fail counts per browser and any axe violations (rule, page, theme, locale).
- `lighthouse`: a score table per URL and category.
- `links`: broken internal links (failures) and broken external links (warnings).
- A footer listing the downloadable artifacts.

**Concurrency**
- Workflow level: `group: ci-${{ github.event.pull_request.number || github.ref }}`, `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`. A new push to a PR cancels the old run, and `main` runs are never cancelled.
- `deploy` job: `group: pages`, `cancel-in-progress: false` (GitHub's recommendation, so a deploy never stops halfway).

**Environment variables**
- `PUBLIC_CF_BEACON_TOKEN` is a **repository variable** (`vars.`), not a secret, because it ends up in the public HTML anyway. The `build` job sets it **only for `main`** (`${{ github.ref == 'refs/heads/main' && vars.PUBLIC_CF_BEACON_TOKEN || '' }}`), so PR builds and test runs never send analytics.
- No secrets are needed in v1.

**Performance target:** a PR run finishes in **≤ 10 min** with a warm cache.

### 11.4 `codeql.yml`

- **Triggers:** `pull_request` to `main`, `push` to `main`, and a weekly schedule (Monday 05:00 UTC).
- **Languages (matrix):** `javascript-typescript` (`build-mode: none`) and `actions` (checks workflows for injection and unsafe patterns).
- **Queries:** `security-extended`.
- **Permissions:** `contents: read`, `security-events: write`, `actions: read`.
- Uses **advanced setup** (this file), so CodeQL "default setup" must stay **off** in repo settings.
- The `Analyze (javascript-typescript)` and `Analyze (actions)` checks are required in the ruleset (§11.6).

### 11.5 Security hardening

| Control | Spec |
|---|---|
| **Pin actions to SHA** | Every `uses:` points to a full 40-character commit SHA followed by a version comment, e.g. `actions/checkout@<sha> # v4.2.2`. Dependabot (`github-actions` ecosystem) updates both. Repo setting: allow only GitHub-owned actions, verified-creator actions, and an explicit allow-list (`pnpm/action-setup`, `lycheeverse/lychee-action`). Turn on **"Require actions to be pinned to a full-length commit SHA"** in that same policy. |
| **Least-privilege tokens** | Repo setting *Workflow permissions* = **read repository contents**. Each workflow starts with `permissions: { contents: read }`. Only `deploy` adds `pages: write` and `id-token: write`, and only the CodeQL job adds `security-events: write`. No job needs `pull-requests: write`, because summaries replace PR comments. |
| **No unsafe triggers** | No `pull_request_target` and no `workflow_run`. Untrusted values (`github.event.pull_request.title`, branch names, …) are never put directly into `run:`. They are passed through `env:` instead, and `zizmor` + CodeQL `actions` enforce this. |
| **Checkout** | `persist-credentials: false` everywhere, so the token isn't left in `.git/config` for later steps. |
| **CodeQL** | §11.4. Alerts are reviewed in *Security → Code scanning*. A new **high or critical** alert on a PR fails the check. |
| **Secret scanning + push protection** | On (free for public repos). Pushes containing detected tokens are blocked. Also turn on **Dependabot alerts** and **Dependabot security updates**. |
| **Environment** | `github-pages` environment with deployment branch rule **`main` only**, so no other branch can deploy, even through `workflow_dispatch`. |
| **Fork PRs** | Use the default setting *"Require approval for first-time contributors"*. Fork runs get a read-only token and no variables are needed. |

### 11.6 Branch protection (ruleset on `main`)

Set up with **Settings → Rules → Rulesets** (not legacy branch protection):

| Rule | Setting |
|---|---|
| Target | Default branch (`main`) |
| Bypass list | **Empty** (admins can't bypass) |
| Restrict deletions | On |
| Block force pushes | On |
| Require a pull request before merging | On · required approvals **0** · dismiss stale approvals off · require conversation resolution **on** |
| Require status checks to pass | On · **require branches to be up to date before merging** · required checks: `ci-ok`, `Analyze (javascript-typescript)`, `Analyze (actions)` |
| Require linear history | On |

**Merge settings:** allow **squash merge only**, using the PR title as the commit message. Turn on *Automatically delete head branches*. Turn on *Allow auto-merge*, so you can queue a PR to merge once checks pass.

Because branches must be up to date, the squash commit on `main` is exactly the tested tree. The `main` run still repeats all gates before deploying, as a final safety net.

### 11.7 Dependabot (`.github/dependabot.yml`)

| Ecosystem | Schedule | Grouping | Notes |
|---|---|---|---|
| `npm` (pnpm lockfile) | Weekly, Monday 06:00 `Asia/Ho_Chi_Minh` | Group **`npm-minor-patch`** (`update-types: [minor, patch]`). **Majors open one PR each** | `open-pull-requests-limit: 5`, labels `dependencies`, `npm`, commit prefix `chore(deps)` |
| `github-actions` | Weekly, Monday 06:00 `Asia/Ho_Chi_Minh` | Group **`actions`** (all update types) | Updates the SHA and the version comment together; labels `dependencies`, `ci`, prefix `chore(ci)` |

- Dependabot PRs go through the same gates. They are **not auto-merged** in v1; you merge them by hand once green.
- Security updates (from Dependabot alerts) open right away, outside the weekly schedule.

### 11.8 Deploy, verify, roll back

- **Deploy:** merging a PR → `ci.yml` on `main` → gates → `deploy` → `smoke`. The *Deployments* panel shows the `github-pages` environment with the live URL.
- **Manual deploy:** *Actions → CI → Run workflow* on `main`. It runs all the gates first.
- **Failure alerts:** a failed `main` run (gates, deploy or smoke) emails you through GitHub's default Actions notifications. A failed gate means **nothing is deployed** and the previous version stays live.
- **Roll back:**
  1. **Fast:** open the last good `main` run and **re-run its `deploy` job**. This republishes that run's Pages artifact (kept for 30 days).
  2. **Permanent:** open a PR that reverts the bad commit (`git revert`), then merge it.

### 11.9 One-time repo setup checklist

Done once by hand, or with `scripts/setup-repo.sh` (a `gh api` script added in M1):

- [ ] Pages → Source: **GitHub Actions**
- [ ] Environment `github-pages` → deployment branches: `main` only
- [ ] Actions → General → Workflow permissions: **read** · allowed actions policy + SHA pinning required (§11.5)
- [ ] Variable `PUBLIC_CF_BEACON_TOKEN`
- [ ] Code security: secret scanning, push protection, Dependabot alerts + security updates on. CodeQL default setup **off**
- [ ] Ruleset on `main` (§11.6)
- [ ] Merge settings: squash only, auto-delete branches, allow auto-merge
- [ ] README: CI status badge + link to the site

### 11.10 Acceptance criteria

- A PR that breaks lint, types, a content schema, a unit test, an e2e or axe test, a Lighthouse budget, an internal link, or CodeQL **cannot be merged**.
- A direct `git push origin main` is rejected, including for the repo admin.
- Merging a green PR makes the change live at `https://jomatran97.github.io` without manual steps, and `smoke` passes.
- The PR run page has downloadable `site` (with `cv.pdf` and `vi/cv.pdf`), Playwright, Lighthouse and link reports, plus a readable summary.
- Every third-party `uses:` is pinned to a 40-character SHA; `actionlint` and `zizmor` pass.
- PR builds contain no Cloudflare beacon.
- Re-running an old `deploy` job restores that version of the site.

---

## 12. Testing strategy

| Layer | Tool | Covers |
|---|---|---|
| Content validation | Astro content collections (Zod) | Required fields, dates, enums, references (`role` must match an experience slug; `series` must exist and `seriesPart` must be unique and listed), competency vocabulary |
| Unit | Vitest | STAR section parser (valid / missing / out-of-order headings, VI headings), `formatCvDate()` (`YYYY` vs `YYYY-MM`, EN vs VI, empty `end` → Present), role sorting (current first, year-only dates, same company twice), company/client display, reading time, "Other / Personal" grouping, i18n `t()` and route helpers, tag slugging |
| CV PDF | Playwright + `pdf-lib` | `dist/cv.pdf` and `dist/vi/cv.pdf` exist, are US Letter, ≤ 2 pages, contain the name, headline, every role title, every `inPdf` project title, every skill group name, "Languages" and every certification name as text, and contain `mailto:` / `tel:` link annotations |
| E2E | Playwright | Nav links on desktop + mobile sheet; theme toggle cycles and survives reload with no flash; language switch keeps the page; CV PDF link returns 200 + `application/pdf`; STAR expand/collapse, Expand all, filter + `?c=` URL; blog TOC highlights the active section; copy-code button; search opens with ⌘K, returns results, Esc restores focus; RSS is valid XML; 404 page; series box lists all parts with unpublished ones not linked; prev/next part links skip unpublished parts; `/blog/series/neovim-setup-guide/` shows "1 of 5 published"; diagrams have `role="img"` + title and switch layout at 768px; `$` prompts are not copied by the Copy button; Home (§4.1): one skill card per category (icon, description, chips) in `order` in the DOM, balanced into 3/2/1 columns; spoken languages in the profile rail; one certification row per entry (monogram fallback, Verify link only when set); Work & writing empty states; sticky rail at ≥ 1280px and profile header below; section index highlights the section in view; no vertical gap > 160px at 1440/1920; no skill card > 24px taller than its content; container ≥ 1520px (or viewport − gutters) at 1920; `/#skills` and `/#certifications` scroll to their sections below the nav; `/experiences/` has no projects, skills or certifications section; nav shows Projects after Experiences; `/projects/` filter chips + `?kind=` URL, Expand all, Details keyboard toggle, `/projects/#<slug>` opens that card, role link goes to the Experiences entry |
| Accessibility | `@axe-core/playwright` | Every route type in light **and** dark, EN **and** VI. Zero serious/critical violations |
| Visual (optional) | Playwright screenshots | Home, Experiences, Projects, STAR, post at 375 / 768 / 1280 widths in both themes |
| Performance | Lighthouse CI | Budgets from §9; fails the PR if a score drops below 95 |
| Links | lychee | No broken internal links. External links are reported as warnings |
| Reduced motion | Playwright with `reducedMotion: 'reduce'` | Content visible immediately, no transforms applied |
| CI config | `actionlint`, `zizmor` | Workflow syntax, SHA pinning, token permissions, injection-prone expressions |
| Post-deploy | `smoke` job (§11.3) | Live site routes, PDFs and search assets respond correctly |

All layers except "Visual (optional)" are **required gates** in CI (§11). E2E runs on **Chromium and WebKit**, because Safari is a primary target.

---

## 13. Milestones

| # | Milestone | Deliverables |
|---|---|---|
| M1 | Foundation | Astro + Tailwind + TS strict, design tokens, fonts, BaseLayout, glass nav, footer, theme toggle (no flash), i18n scaffolding. **CI/CD from day one:** `ci.yml`, `codeql.yml`, Dependabot, ruleset and repo settings (§11.9), first deploy to `jomatran97.github.io`. Gates that have no tests yet (e2e, Lighthouse URLs) start with a placeholder home-page test and grow with each milestone |
| M2 | Experiences and CV PDF | Content schemas, migrate `cv.tex` content (Appendix A checklist), header + summary, timeline, **Projects page** (nav item, kind filter, in-place Details), print layout (with selected projects, skills table, languages and certifications), US Letter PDF generation in CI |
| M3 | STAR | Schema + remark section validator, grouped page, stepper, filters, permalinks, Experiences ↔ STAR links |
| M4 | Blog | Index, post layout (Newsreader, TOC, Shiki, copy, code titles, line highlights), callouts, `<kbd>`, inline SVG diagram support, **series** (collection, box, prev/next part, index pages), tags, RSS, reading time. **First post** (Appendix B) in EN + VI, with its startup diagram |
| M5 | Home + polish | Hero, highlights bento, **technical skills bento** (descriptions, icons, languages card), **certifications badge cards**, featured stories/posts, scroll reveal, reduced motion, SEO/JSON-LD, OG default image |
| M6 | Search, analytics, VI | Pagefind modal, Cloudflare beacon, Vietnamese UI strings + sample translations, hreflang |
| M7 | Quality gate | Full e2e, axe, Lighthouse budgets, link check green; sample content replaced with real content |
| M8 | Home v1.1 layout | Profile rail / header (§4.1.1) with section index scroll-spy, build-time balanced skills columns (§4.1.3), Work & writing row (§4.1.4), count-adaptive STAR row (§4.1.5), compact contact band (§4.1.6), wide Home container + full-bleed bands (§5.4), `profile.headlineMetric` in the schema (§6.1). Remove `HighlightsBento`, `LanguagesCard`, `SkillsBento` and the v1 certification cards. Update e2e/axe/Lighthouse per §12; all gates stay green |

---

## 14. Defaults to confirm

These smaller choices have a default in this spec. Change any you disagree with:

1. **Untranslated Vietnamese pages:** show the English content with a banner (alternative: hide untranslated items from `/vi/` lists). This includes `/vi/experiences/` and `/vi/cv.pdf` until the CV content is translated.
2. **Stories with no role:** shown in an "Other / Personal" group at the end.
3. **Competency list:** the 12 values in §6.6.
4. **Social links:** Email, phone, LinkedIn and GitHub required; X and Bluesky optional.
5. **Blog drafts:** a `draft: true` flag hides posts in production.
6. **Package manager:** pnpm.
7. **Datum roles:** stored as `company: "Datum"` + `client: "Security Bank"` / `"TymeX"`, displayed as "Datum / Security Bank", the same as in `cv.tex`.
8. **Years of experience:** shown as "5+" as written in `cv.tex`. The roles start in 2019, which would support a higher number. Confirm which to show.
9. **PDF length:** at most 2 Letter pages. The current `cv.tex` is tuned for 1 page; the web layout with Inter will likely run longer.
10. **PDF download filename:** `Ryan-Parker-CV.pdf`.
11. **E2E browsers:** Chromium + WebKit (Firefox left out to keep PR runs under 10 min).
12. **Merge style:** squash only, linear history, conversation resolution required.
13. **Dependabot PRs:** merged by hand, no auto-merge.
14. **Dependabot schedule:** Monday 06:00 Ho Chi Minh time. CodeQL weekly scan: Monday 05:00 UTC.
15. **Cloudflare beacon token:** stored as a repository *variable*, not a secret, because it is public in the HTML.
16. **Artifact retention:** 7 days for PR runs, 30 days for `main` runs (sets the rollback window).
17. **Home section order (v1.1):** profile rail (Identity → Actions → Stats → Languages → Contact → Section index), then canvas: Skills → Work & writing (Featured project · Latest writing · Certifications) → STAR stories → Contact band.
18. **Skill descriptions:** first drafts written from `cv.tex` (Appendix A.4). Review and rewrite them in your own voice.
19. **Skill icons:** Lucide (open-source, outline style, close to SF Symbols). SF Symbols can't be used on the web under Apple's licence.
20. **Certification badges:** monogram fallback until you add the official badge images (e.g. from Credly) to `src/content/certifications/en/badges/`.
21. **Experiences page links:** "Projects →" and "Skills & certifications →" under the summary.
22. **Projects in the PDF:** only projects marked `featured` (override per project with `inPdf`), so the PDF stays within 2 pages.
23. **Project kind colours:** Personal = mint, Work = sky, Open source = butter.
24. **Neovim series plan:** 5 parts. 1 Zero to a working editor · 2 Languages (LSP, completion, format, lint) · 3 Data engineering (dbt, SQL, DB UI, CloudFormation) · 4 Java with nvim-jdtls · 5 Debugging, testing and daily workflow.
25. **First post slug and tags:** `neovim-setup-1-zero-to-editor`; tags `neovim`, `dotfiles`, `macos`, `developer-tools`.
26. **"Tested with" note:** although snippets aren't linked, the post states once, at the top, the Neovim version, macOS, and the dotfiles commit the steps were tested against.
27. **First post date:** publish when M4 ships; `pubDate` is set on merge.
28. **Home wide layout:** split layout from 1280px, rail width 360px, Home container max 1520px (other pages stay at 1120px).
29. **Spoken languages on Home:** a line in the profile rail, not a card.
30. **Skill card sizing:** `2x1` and `2x2` both mean "span 2 columns at ≥ 1024px"; height always follows content.
31. **Certifications on Home:** compact rows inside Work & writing instead of badge cards.

## 15. Placeholders to fill

- Optional X / Bluesky profile URLs.
- Vietnamese translations of the CV content, skill descriptions and certification names.
- Certification badge images and credential (Verify) URLs.
- Real STAR stories (the §6.6 example is illustrative) and blog content after the first post.
- Final titles for Parts 2–5 of the Neovim series (§6.8 lists working titles).

---

## Appendix A. CV migration from `cv.tex`

Source: `/Users/ryanparker/Documents/personal/experiences/cv.tex`. Each bullet moves over **word for word** as `- **<label>:** <detail>`, keeping the `\textbf{}` terms as `**bold**`. Tick each row in M2.

### A.1 Profile → `profile/en/index.md`

| Field | Value |
|---|---|
| name | Ryan Parker (replaces "Hai Tran" from `cv.tex`) |
| headline / tagline | Senior Data Engineer / Data Pipelines, ETL/ELT & Cloud Data Platforms |
| location | Ho Chi Minh City, Vietnam |
| email | ryanparker.p.97@gmail.com |
| phone | (+84) 963 378 831 → `+84963378831` |
| LinkedIn | https://www.linkedin.com/in/jomatran |
| GitHub | https://github.com/jomatran97 (new, not in `cv.tex`) |
| spoken languages | English — Professional working proficiency |
| body | The Summary paragraph |

### A.2 Experience → `experience/en/*.md`

| File slug | Company / client | Role | Start → End | Bullets | Tech chips |
|---|---|---|---|---|---|
| `fpt-software-senior-data-engineer` | FPT Software | Senior Data Engineer (Team Lead) | `2026-08` → Present | 5: Team Leadership & Code Review · ETL/ELT Migration Strategy · Cross-Cloud Data Delivery · Solution Design & Documentation · Delivery Automation | Python, PySpark, Databricks, Azure, Talend, Salesforce, AWS, AI agents |
| `datum-security-bank-data-engineer` | Datum / Security Bank | Data Engineer (Data & Platform) | `2024` → `2026-03` | 5: Data Pipeline Delivery · Data Quality & Reliability · Ingestion, Processing & Production Support · CI/CD & Infrastructure as Code · Data Governance | dbt, Airflow, Athena, Redshift, S3, Python, AWS EMR, PySpark, GitLab CI/CD, IaC, Lake Formation |
| `datum-tymex-platform-engineer` | Datum / TymeX | Platform Engineer (Datadog Observability Platform) | `2021` → `2024` | 4: Datadog Platform Ownership · CI/CD for Serverless Deployment · Platform Automation · Infrastructure as Code | Datadog, SLO/SLI, AWS CodePipeline, Serverless, CloudFormation, Python |
| `fpt-software-software-engineer` | FPT Software | Software Engineer (Data & Backend Focused) | `2020` → `2021` | 1: Data Validation | SQL, KNIME |
| `hitachi-vantara-backend-engineer` | Hitachi Vantara Vietnam | Backend Software Engineer | `2019` → `2020` | 2: Backend Engineering · Containerization | Java, Spring Boot, REST APIs, Microservices, Docker |

All roles: location "Ho Chi Minh City, Vietnam".

### A.3 Projects → `projects/en/*.md`

Shown on `/projects/` and in the PDF, not on `/experiences/`.

| File slug | Title | Subtitle | Kind | Start → End | Bullets |
|---|---|---|---|---|---|
| `agentic-coding-workflow` | Agentic Coding Workflow | Multi-model Orchestration & Developer Tooling | personal | `2025` → Present | 4: Orchestrated Specialist Flows · Autonomous Delivery Controls · Routing, Memory & Recovery · Safety & Verification |

### A.4 Skills → `skills/en/*.md`

| Order | File slug | Group | Items |
|---|---|---|---|
| 1 | `data-engineering` | Data Engineering | Python, SQL, PySpark, Apache Spark, Apache Airflow, dbt, Databricks, Talend, ETL/ELT, Data Lake & Warehouse, Data Migration, Data Quality, Data Modeling, Data Governance |
| 2 | `cloud-platform` | Cloud Platform | AWS (EMR, S3, Athena, Redshift, Lake Formation), Azure (Databricks) |
| 3 | `devops-iac` | DevOps & IaC | Git, GitLab CI/CD, Infrastructure as Code (CloudFormation, CDK, Terraform), Docker, Kubernetes, Datadog, Monitoring, Incident Response, SLO/SLI |
| 4 | `backend-engineering` | Backend Engineering | Java (Spring Boot), REST APIs, Microservices, PostgreSQL, API Integration |
| 5 | `ai-engineering` | AI Engineering | AI-DLC (AI-Driven Development Life Cycle), Prompt Engineering, Agentic Coding, Multi-Agent Orchestration, AI Code Review, Documentation Automation |
| 6 | `methodologies` | Methodologies | Agile/Scrum, SDLC, Cross-Functional Collaboration |

Items written with parentheses become `name` + `children`. The `Languages` row moves to `profile.spokenLanguages`, which feeds the Languages line in the Home profile rail and the PDF's last skills row.

**Draft descriptions** (new, not in `cv.tex`; written from your experience bullets for you to review):

| Group | Icon | Size / tint | Draft description |
|---|---|---|---|
| Data Engineering | `database` | 2x2 / mint | Design, build and operate ETL/ELT pipelines and data models for banking markets in the Philippines and South Africa, from ingestion to data quality. |
| Cloud Platform | `cloud` | 1x1 / sky | Build AWS data lakes and warehouses on S3, Athena, Redshift and EMR, and deliver data from Databricks on Azure. |
| DevOps & IaC | `git-branch` | 2x1 / butter | Automate testing, deployment and environments with GitLab CI/CD and IaC, and keep services observable with Datadog SLOs and alerts. |
| Backend Engineering | `server` | 1x1 / sky | Build RESTful APIs and Spring Boot microservices, with database design and Docker containers. |
| AI Engineering | `sparkles` | 2x1 / mint | Bring AI agents and reusable skills into delivery for code conversion, testing and documentation, and orchestrate multi-agent coding workflows. |
| Methodologies | `users` | 1x1 / butter | Lead and work in Agile teams with engineers, analysts and business stakeholders across the full SDLC. |

### A.5 Certifications → `certifications/en/*.md`

| File slug | Name | Issuer | Year | Monogram |
|---|---|---|---|---|
| `aws-solutions-architect-associate` | AWS Certified Solutions Architect – Associate | Amazon Web Services | 2022 | AWS |
| `datadog-fundamentals` | Datadog Certified: Datadog Fundamentals | Datadog | 2023 | DD |

Shown on Home and in the PDF, not on `/experiences/`.

### A.6 Not migrated

- **Education** (commented out in `cv.tex`): left out by choice.

---

## Appendix B. First blog post: Neovim setup guide, Part 1

### B.1 Summary

| Field | Value |
|---|---|
| Series | `neovim-setup-guide`, Part **1** of 5 (§6.8) |
| Title (EN) | Neovim setup guide, Part 1: from zero to a working editor |
| Title (VI) | Hướng dẫn thiết lập Neovim, Phần 1: từ con số 0 đến trình soạn thảo chạy được |
| Description (EN) | Install the tools, get my Neovim 0.12 config running on macOS, and check that everything works, in about 15 minutes. |
| Files | `src/content/blog/en/neovim-setup-1-zero-to-editor.mdx` and `src/content/blog/vi/neovim-setup-1-zero-to-editor.mdx` (same slug) |
| Tags | `neovim`, `dotfiles`, `macos`, `developer-tools` |
| Type | Step-by-step **setup guide**. The reader follows along and ends with a working editor |
| Audience | Developers on macOS who are new to Neovim or coming from a big distro (LazyVim, NvChad) and want a small config they understand |
| Target | **Neovim 0.12+ only**. Stated in the first paragraph and checked in step 1 |
| Length | ~2,000–2,500 words, ~10–12 min read |
| Source | `jomatran97/dotfiles`, folder `nvim/` (public). **Linked once** near the top. Snippets are copied in and **not** linked per block |
| Media | **Code snippets** (Shiki, with filename titles) + **one architecture diagram** (inline SVG, §4.5.1). No screenshots or recordings |
| Languages | **EN + VI at launch.** VI translates the prose, headings, captions, callouts and diagram captions. Code, commands, file names and keymaps stay the same. Code comments stay in English |

### B.2 Outline (H2 = TOC entries)

1. **Intro** (no heading)
   - Why a small config: one Lua file per topic, lazy-loaded, built for a mix of web, data engineering and SRE work (Java, Python, dbt/SQL, Terraform, Bash, CloudFormation/YAML, JSON, Docker, frontend).
   - What this series builds, with a link to the series index.
   - `<Callout type="note">` **Tested with:** Neovim 0.12, macOS, dotfiles commit `2101fb4`. **Source:** github.com/jomatran97/dotfiles (folder `nvim/`).
2. **What you'll have at the end**
   - A bullet list: plugin manager with 49 lazy-loaded plugins, file explorer (oil), fuzzy finder (telescope), language servers auto-installed by Mason, format on save, linting, Treesitter highlighting, git signs, which-key hints, the catppuccin mocha theme.
   - States that languages get properly set up in Part 2; Part 1 makes sure everything installs and starts.
3. **Before you start**
   - macOS + Homebrew.
   - **Neovim 0.12+**: `nvim --version`, with `brew install neovim` (or `brew upgrade neovim`) if needed. `<Callout type="warning">` explains that 0.11 and older fail on the 0.12-only `pumborder` option and the built-in undotree (`packadd nvim.undotree`).
   - A **Nerd Font** set in your terminal (e.g. FiraCode Nerd Font: `brew install --cask font-fira-code-nerd-font`), otherwise icons show as boxes.
   - Xcode Command Line Tools (`xcode-select --install`), for the `make` that builds `telescope-fzf-native`.
   - Python **3.10+** if you want `sqlfluff` installed by Mason (older versions skip it).
4. **Step 1: install the host tools**
   - The `brew install …` and `pipx install dbt-core sqlfluff` commands from the dotfiles README, with one line per tool explaining why it's needed (ripgrep/fd → telescope, tree-sitter → parser builds, node → JS-based language servers and prettier, openjdk → Part 4, …).
   - Optional: `brew install lazygit` for <kbd>Space</kbd> <kbd>g</kbd> <kbd>g</kbd>.
5. **Step 2: get the config.** Three ways, as tabs or sub-headings:
   - **A. The whole dotfiles repo:** `git clone` + `./install.sh`. A warning callout says it also links zsh, tmux, alacritty, yabai, skhd and starship, and backs up anything in the way to `<path>.bak.<timestamp>`.
   - **B. Neovim only:** back up `~/.config/nvim`, `~/.local/share/nvim`, `~/.local/state/nvim` and `~/.cache/nvim`, then `ln -s ~/dotfiles/nvim ~/.config/nvim`.
   - **C. Try it without touching your setup:** clone to `~/.config/nvim-ryan` and run `NVIM_APPNAME=nvim-ryan nvim`. Recommended for a first try.
   - A tip notes that the Lua modules live under `lua/ryanparker/`. You can rename the folder and the `require("ryanparker…")` calls to your own name later.
6. **How it starts**
   - **The architecture diagram** (B.3), then a short walkthrough:
     - `init.lua` turns on `vim.loader` and loads `core` then `lazy` (4-line snippet);
     - `core/init.lua` sets <kbd>Space</kbd> as leader and turns off netrw for oil;
     - `lazy.lua` bootstraps lazy.nvim (snippet, highlighting the clone and `defaults = { lazy = true }`) and imports every file in `plugins/`.
   - A table of the 12 plugin topic files and what each one holds (ui, navigation, editing, git, lsp, completion, formatting, linting, treesitter, data, dev, extras).
7. **Step 3: first launch**
   - Run `nvim`. lazy.nvim clones itself and installs the plugins (explain the `:Lazy` window; `:Lazy sync` if anything failed).
   - Treesitter installs parsers. If the `tree-sitter` CLI is missing you'll see a warning, quoted exactly from the config.
   - Mason installs tools in the background (mason-tool-installer on `VeryLazy`) and language servers (mason-lspconfig `ensure_installed`). Watch with `:Mason`. A snippet shows the tools list.
   - Quit and reopen once everything has finished.
8. **Step 4: check that everything works**
   - `:checkhealth`: which sections matter (`lazy`, `mason`, `vim.lsp`, `nvim-treesitter`) and which warnings are safe to ignore.
   - Open a Python file: lualine shows the attached LSP clients (`basedpyright, ruff`), <kbd>K</kbd> shows hover, and saving formats the file with ruff.
   - `:ConformInfo` and `:LspInfo`-style checks (`:checkhealth vim.lsp`).
9. **The first keymaps to learn**
   - <kbd>Space</kbd> opens which-key (shows every group).
   - A table of about 14 keymaps: `<leader>ff` files, `<leader>fg` grep, `<leader>fb` buffers, `<leader>e` explorer (float), `-` parent dir, `<leader>w` save, `<leader>cf` format, `gd` definition, `K` hover, `grn` rename, `]d`/`[d` diagnostics, `]h`/`[h` git hunks, `<M-h/j/k/l>` splits/tmux panes, `<leader>uu` undo tree.
10. **Troubleshooting**
    - Icons show as boxes → Nerd Font not set in the terminal.
    - The `tree-sitter` CLI warning → `brew install tree-sitter`, then `:TSUpdate`.
    - telescope is slow or the fzf extension is missing → install Xcode CLT, then `:Lazy build telescope-fzf-native.nvim`.
    - `sqlfluff` is missing → Python is older than 3.10.
    - Start over → remove `~/.local/share/nvim` (or `…/nvim-ryan`) and launch again.
11. **What's next**
    - A teaser for Part 2 (languages), followed by the series box and the prev/next part links.

### B.3 Architecture diagram: `NeovimStartupDiagram.astro`

```
init.lua ──▶ vim.loader.enable()
   │
   ├─▶ core/            options · keymaps · autocmds        (mint)
   │
   └─▶ lazy.lua ──▶ lazy.nvim (bootstrap, lazy = true)      (sky)
                      │  import "ryanparker.plugins"
                      ▼
        plugins/*.lua (12 topic files)                      (butter)
        ui · navigation · editing · git · lsp · completion
        formatting · linting · treesitter · data · dev · extras
                      │
        ┌─────────────┼──────────────┬──────────────┐
        ▼             ▼              ▼              ▼
   Mason → LSP    blink.cmp     conform (save)  nvim-lint      (surface)
   vim.lsp.enable  completion   formatting      linting
   (jdtls via ftplugin/java.lua → Part 4)
```

- Horizontal layout ≥ 768px, vertical stack below that (§4.5.1).
- `<title>`: "How the Neovim config starts". `<desc>` and the hidden list repeat the flow above in words.
- Caption (EN): *"Startup flow: core settings load first, then lazy.nvim loads plugins only when they're needed."* VI caption to be translated.

### B.4 Accuracy rules (because snippets aren't linked)

- Every snippet is copied **as-is** from the dotfiles at the "Tested with" commit. A snippet may be shortened only with an explicit `-- …` line.
- Every command is run on a fresh setup (path C, `NVIM_APPNAME`) before publishing. Any output quoted in the post is real.
- **Mismatches to fix in the dotfiles README before publishing**, so the linked repo matches the post:
  - The README's language table says `pyright`, but `lsp.lua` installs **`basedpyright`**.
  - The README's plugin layout table leaves out **`dev.lua`** (trouble, grug-far, dap, neotest) and **`extras.lua`** (quicker, treesitter-context, todo-comments, snacks, refactoring, yaml.nvim, overseer).
  - The README's brew list doesn't mention a Nerd Font, `lazygit`, or the Xcode CLT / `make` requirement.
- When the config changes later, the post gets an `updatedDate` and a refreshed "Tested with" note. It doesn't change silently.

### B.5 Acceptance criteria

- The EN and VI posts build and share the slug. The language switch moves between them, and neither shows the "English only" banner.
- The series box reads "Part 1 of 5" with parts 2–5 marked "Coming soon". `/blog/series/neovim-setup-guide/` shows "1 of 5 published".
- The TOC lists the H2 sections from B.2 in both languages.
- Every code block has a language and a filename title (where it comes from a file). Copying a shell block leaves out the `$` prompt.
- The diagram passes axe, is readable in light and dark mode, and switches layout at 768px.
- Reading time shows ~10–12 min.
- The B.4 README fixes are merged into `jomatran97/dotfiles` before the post goes live.
