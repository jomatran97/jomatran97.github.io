# Personal Portfolio — Specification

| | |
|---|---|
| **Status** | Draft v1 |
| **Last updated** | 2026-10-30 |
| **Hosting** | GitHub Pages — `https://<username>.github.io` |
| **Stack** | Astro + Tailwind CSS, all content in Markdown/MDX |

---

## 1. Overview

A personal portfolio site with three main parts:

1. **CV**: summary, work experience, selected projects, technical skills, certifications and spoken languages, with a PDF version built automatically. The content is migrated from the existing LaTeX CV (see Appendix A).
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
| Site structure | Multi-page: Home, CV, STAR, Blog (+ tag pages, search, 404) |
| Theme | Light + dark, follows `prefers-color-scheme`, with a manual override toggle |
| Palette | Mint `#A8E6CF`, sky blue `#A0C4FF`, butter `#FDFFB6`, cool white `#F8FAFC`, text `#1D1D1F` |
| Apple-style elements | Frosted glass nav, large bold headlines, scroll animations, bento grid cards |
| Fonts | Inter for the UI, Newsreader (serif) for blog post bodies |
| CV sections | Summary, experience timeline, selected projects, technical skills (with spoken languages), certifications. No education section |
| CV PDF | Built automatically in CI with Playwright from the web CV content, **US Letter**. The Markdown content replaces `cv.tex` as the single source of truth |
| CV contact details | Email, phone, LinkedIn and GitHub, shown on the web CV and in the PDF |
| STAR organisation | Grouped by role/company, linked from the CV timeline |
| STAR display | Expandable vertical stepper (S → T → A → R) |
| Blog | Tags + tag pages, RSS, reading time, sticky TOC, Shiki syntax highlighting |
| Comments | None |
| Contact | Social links + `mailto:` + `tel:` |
| Search | Pagefind (static full-text search) |
| Analytics | Cloudflare Web Analytics (cookie-free) |
| i18n | English (default, `/`) + Vietnamese (`/vi/`) |
| Authoring | Every entry is a Markdown/MDX file with typed frontmatter (Astro content collections) |
| STAR privacy | All stories public |
| URL | User site at `<username>.github.io` (repo must be named `<username>.github.io`) |

---

## 3. Information architecture

### 3.1 Sitemap

```
/                         Home
/cv/                      CV (experience, skills, projects, Download PDF)
/cv/print/                Print-only CV layout used to make the PDF (noindex)
/cv.pdf                   Generated PDF (English)
/star/                    STAR stories grouped by role/company
/star/<slug>/             Single STAR story (deep-linkable, shareable)
/blog/                    Blog index (newest first)
/blog/<slug>/             Blog post
/blog/tags/               All tags with post counts
/blog/tags/<tag>/         Posts for one tag
/rss.xml                  RSS feed (English)
/404.html                 Not found

/vi/...                   Vietnamese mirror of every route above
/vi/cv.pdf                Generated PDF (Vietnamese)
/vi/rss.xml               RSS feed (Vietnamese)
```

### 3.2 Global navigation

- **Nav bar (sticky, frosted glass):** logo/name (links home) · CV · STAR · Blog · Search (⌘K) · theme toggle · language switch (EN / VI).
- **Mobile (< 768px):** the links collapse into a full-screen sheet behind a menu button. Search, theme and language stay visible.
- **Footer:** social icons (Email, LinkedIn, GitHub, plus optional X/Bluesky), RSS link, copyright, "Built with Astro" note.

---

## 4. Page specifications

### 4.1 Home (`/`)

| Section | Content |
|---|---|
| Hero | Large headline (name + one-line positioning statement), short subline, two pill buttons: **View CV** (primary) and **Read the blog** (secondary). Soft mint→sky gradient glow behind the text. |
| Highlights bento | 4–6 bento cards: years of experience, current role, a headline metric, top skills, certifications, a featured project, latest post. Card sizes vary (1×1, 2×1, 1×2). |
| Featured STAR stories | 3 cards (from stories with `featured: true`): title, competency chips, result metric. Links to `/star/<slug>/`. |
| Latest posts | 3 newest published posts: title, date, reading time, tags. |
| Contact | Headline ("Let's talk"), `mailto:` pill button, social icons. |

### 4.2 CV (`/cv/`)

The section order matches the existing `cv.tex`: Header → Summary → Experience → Selected Projects → Technical Skills → Certifications.

1. **Header:** name (display size), headline (*Senior Data Engineer — Data Pipelines, ETL/ELT & Cloud Data Platforms*), location, and a contact row with email (`mailto:`), phone (`tel:`), LinkedIn and GitHub. Each contact item has an icon and is a 44px tap target. A **Download PDF** pill button links to `/cv.pdf` (or `/vi/cv.pdf`) with `download="Ryan-Parker-CV.pdf"`.
2. **Summary:** the profile summary paragraph, set slightly larger than body text (~19px) and at most ~68ch wide. Key technologies are in **bold**, the same as in `cv.tex`.
3. **Experience timeline:** vertical timeline, newest first.
   - Each entry shows the company and optional client (shown as "Datum / Security Bank"), role, location, date range ("Present" when `end` is empty), achievement bullets (Markdown body) and tech chips.
   - **Achievement bullets** keep the `cv.tex` pattern: a bold label, then the detail, e.g. `- **Team Leadership & Code Review:** Lead and mentor a team of **7 engineers**, …`. Bold terms in the detail (technologies, metrics) stay bold. The label is styled in `--text` at weight 600 and the detail in `--text-2`.
   - **Dates** can be month precision (`2026-08` → "Aug 2026") or year only (`2024` → "2024"), because `cv.tex` uses both.
   - **The same company can appear more than once** (FPT Software 2020–2021 and 2026–Present). These stay as separate entries in date order and are never merged.
   - If the role has STAR stories, show a **"N STAR stories →"** link to `/star/#<role-slug>`.
   - Entries fade and slide up as they scroll into view.
4. **Selected projects:** card grid. Each card has a title, subtitle (e.g. *Multi-model Orchestration & Developer Tooling*), a type badge (Personal / Work / Open source), date range, a one-line summary, tech chips, and optional **Repo** / **Live** links (shown only when set). The labelled bullets (Markdown body) sit behind a **Details** disclosure on the web and are always expanded in the PDF. Featured projects come first and take a larger card.
5. **Technical skills:** bento grid with one card per skill group, in this order: Data Engineering, Cloud Platform, DevOps & IaC, Backend Engineering, AI Engineering, Methodologies. Each card shows its items as chips. Groups with sub-items, like `AWS (EMR, S3, Athena, Redshift, Lake Formation)`, show a parent chip followed by smaller child chips. There are no skill levels or progress bars.
   - **Spoken languages** get their own small card at the end of the grid (e.g. *English — Professional working proficiency*).
6. **Certifications:** a row of compact cards, each with an optional badge image, the certification name, issuer and year, plus an optional **Verify** link (credential URL). Newest first.

**Acceptance criteria**
- Adding a file to `src/content/experience/` adds a timeline entry with no code changes. The same applies to projects, skill groups and certifications.
- Roles are sorted by `start` descending, and the current role (empty `end`) always comes first. Year-only dates sort as January of that year.
- Year-only dates render without a month, and month dates render as `MMM YYYY` (EN) or `MM/YYYY` (VI).
- Two roles at the same company render as two separate timeline entries.
- Phone renders as a `tel:+84963378831` link and email as a `mailto:` link, on the web and in the PDF.
- The Download PDF button points to a file that exists in the deployed build.
- Every bullet, skill and certification in `cv.tex` appears on `/cv/`. A one-off migration checklist (Appendix A) is ticked off in M2.

### 4.3 CV PDF (built automatically)

- The web CV content (§4.2) is the **single source of truth**. `cv.tex` is used once to migrate the content and is not kept in sync afterwards.
- `/cv/print/` is a print-friendly version of the same content, laid out like `cv.tex`:
  - **Header:** name and headline on the left, with email, phone, LinkedIn and GitHub on the right.
  - **Sections:** Summary → Experience → Selected Projects → Technical Skills → Certifications. Headings are small caps with a thin rule under each.
  - **Experience entries:** company and location on one line, role and dates on the next, then the labelled bullets.
  - **Technical skills:** a two-column table (group name | items) instead of bento cards.
  - **Styling:** one column, Inter, light theme forced. The only pastel is a mint rule under section headings. No nav, footer, animations or chips. Links are shown as readable text.
- In CI, after `astro build`, `scripts/build-cv-pdf.ts`:
  1. Serves `dist/` locally.
  2. Opens `/cv/print/` and `/vi/cv/print/` in Playwright (Chromium).
  3. Waits for fonts to load (`document.fonts.ready`).
  4. Saves `page.pdf({ format: 'Letter', printBackground: true, margin: { top: '0.5in', bottom: '0.5in', left: '0.6in', right: '0.6in' } })` to `dist/cv.pdf` and `dist/vi/cv.pdf`.
- PDF metadata: title = "Ryan Parker — Senior Data Engineer CV", author = "Ryan Parker", subject = the headline.
- `/cv/print/` has `<meta name="robots" content="noindex">` and is left out of the sitemap and the search index.

**Acceptance criteria**
- The PDF has selectable text (not an image) and working `mailto:`, `tel:`, LinkedIn and GitHub links.
- The build fails if PDF generation fails.
- The PDF is US Letter and fits in **at most 2 pages** with the real content from Appendix A.

### 4.4 STAR stories (`/star/`)

**Layout: grouped by role/company**

- Page intro: a short explanation of the STAR method and a legend for the four step colours.
- One group per role, ordered like the CV (newest first). Each group header shows company, role, date range and a link back to that CV entry. Each group has an `id` equal to the role slug so the CV can link to it.
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
- **Code blocks:** Shiki highlighting with light/dark themes that match the site theme, a language label and a **Copy** button.
- Footer: previous/next post, tag links, back to blog.

**Tags**
- `/blog/tags/`: all tags with counts. `/blog/tags/<tag>/`: posts for that tag.
- Tag slugs are lowercase and kebab-case.

**RSS**
- `@astrojs/rss` at `/rss.xml` (EN) and `/vi/rss.xml` (VI), containing published posts only, with full title, description, date and link.

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

- **Grid:** 8px spacing scale. Content max width 1120px, reading max width 68ch. Side gutters 16px (mobile) → 24px (tablet) → 32px (desktop).
- **Breakpoints:** `sm 640` · `md 768` · `lg 1024` · `xl 1280`.
- **Radius:** cards 24px, bento cards 28px, chips 999px, buttons 980px (pill), inputs 12px.
- **Shadow:** `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)` in light mode. In dark mode, use a border instead of a shadow.
- **Section spacing:** 96px (mobile) → 160px (desktop) vertical padding between major sections.

### 5.5 Signature components

| Component | Spec |
|---|---|
| **Frosted glass nav** | `position: sticky; top: 0`, height 52px, `background: var(--nav-glass)`, `backdrop-filter: saturate(180%) blur(20px)`, hairline bottom border that appears once the page scrolls past 8px. Solid `--bg` fallback when `backdrop-filter` is not supported. |
| **Bento grid** | CSS grid, 4 columns desktop / 2 tablet / 1 mobile, `grid-auto-flow: dense`. Card spans: `1x1`, `2x1`, `1x2`, `2x2`. Each card can have a pastel tint background. On hover (pointer devices only), the card scales to `1.01` and its shadow grows. |
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
socials:
  linkedin: "https://www.linkedin.com/in/jomatran"
  github: "https://github.com/<username>"
  x: ""                         # optional
  bluesky: ""                   # optional
spokenLanguages:
  - language: "English"
    proficiency: "Professional working proficiency"
```
Body: the CV **Summary** paragraph (Markdown, bold allowed). It is used on the CV page, in the PDF, and in shortened form on the home hero.

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
items:
  - name: "AWS"
    children: ["EMR", "S3", "Athena", "Redshift", "Lake Formation"]   # optional
  - name: "Azure"
    children: ["Databricks"]
```

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
featured: true
role: ""                        # optional reference to experience
```
Body: labelled bullets (`- **Orchestrated Specialist Flows:** …`), shown behind **Details** on the web and in full in the PDF.

### 6.5 `certifications`

`src/content/certifications/en/aws-solutions-architect-associate.md`

```yaml
name: "AWS Certified Solutions Architect – Associate"
issuer: "Amazon Web Services"
year: "2022"
credentialUrl: ""               # optional, renders a Verify link
badge: ""                       # optional image
```
No body.

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
```

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
- Indexes: blog posts, STAR stories (`/star/<slug>/`), the CV page. Excludes: `/cv/print/`, tag index pages, 404.
- Separate indexes per language (Pagefind detects `<html lang>`).
- Results show the page type (Blog / STAR / CV), title and a highlighted excerpt.
- The Pagefind UI script loads only when the search modal is first opened.

### 8.2 Analytics (Cloudflare Web Analytics)

- JS beacon with the site token from the env var `PUBLIC_CF_BEACON_TOKEN` (stored as a GitHub Actions secret).
- Injected **only in production builds** and only when the token is set.
- Cookie-free, so no consent banner is required. A one-line note in the footer: "Privacy-friendly analytics, no cookies."

### 8.3 Contact

- `mailto:` link + social icons in the hero CTA (home), the CV header and the footer.
- Phone (`tel:`) in the CV header, the PDF and the footer.
- No form and no third-party scripts.

### 8.4 SEO and metadata

- Per-page `<title>`, meta description, canonical URL, Open Graph + Twitter card tags using one static default image (`public/og-default.png`, 1200×630, pastel brand card).
- `@astrojs/sitemap`, `robots.txt`, JSON-LD `Person` on home/CV and `BlogPosting` on posts.
- `public/.nojekyll` so GitHub Pages serves `_astro/` assets.

---

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Lighthouse (mobile) ≥ 95 for Performance, Accessibility, Best Practices, SEO on Home, CV, STAR, a blog post. LCP < 2.0s, CLS < 0.05, INP < 200ms. |
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
├── .github/workflows/
│   ├── deploy.yml            # build → pagefind → PDF → deploy to Pages
│   └── ci.yml                # PR checks: lint, types, tests, a11y, Lighthouse
├── public/
│   ├── .nojekyll
│   ├── favicon.svg
│   ├── og-default.png
│   └── robots.txt
├── scripts/
│   └── build-cv-pdf.ts
├── src/
│   ├── components/
│   │   ├── nav/              # GlassNav, MobileSheet, ThemeToggle, LangSwitch
│   │   ├── ui/               # PillButton, Chip, Card, BentoGrid, BentoCard
│   │   ├── cv/               # CvHeader, Summary, Timeline, TimelineItem, SkillGroup, ProjectCard, CertificationCard
│   │   ├── star/             # StarGroup, StarCard, StarStepper, CompetencyFilter
│   │   ├── blog/             # PostCard, Toc, CopyCodeButton, ReadingTime
│   │   └── search/           # SearchModal
│   ├── content/
│   │   ├── profile/{en,vi}/
│   │   ├── experience/{en,vi}/
│   │   ├── skills/{en,vi}/
│   │   ├── projects/{en,vi}/
│   │   ├── certifications/{en,vi}/
│   │   ├── star/{en,vi}/
│   │   ├── blog/{en,vi}/
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
| `lint` / `format` | ESLint + Prettier (with `prettier-plugin-astro`, `prettier-plugin-tailwindcss`) |
| `test` | Vitest unit tests |
| `test:e2e` | Playwright e2e + accessibility against the built site |
| `lhci` | Lighthouse CI with budgets |

Tooling: Node 22 LTS, pnpm, TypeScript strict.

---

## 11. Build and deployment

### 11.1 GitHub setup

- Repo name: **`<username>.github.io`** (needed for a root user site).
- Settings → Pages → Source: **GitHub Actions**.
- `astro.config.mjs`: `site: 'https://<username>.github.io'`, no `base`.
- Secret: `PUBLIC_CF_BEACON_TOKEN`.

### 11.2 `deploy.yml` (on push to `main`, plus manual dispatch)

1. Checkout → set up pnpm + Node 22 (with cache).
2. `pnpm install --frozen-lockfile`.
3. `pnpm check`.
4. Install Playwright Chromium (`playwright install --with-deps chromium`).
5. `pnpm build` (Astro → Pagefind → CV PDFs).
6. Verify `dist/cv.pdf` and `dist/vi/cv.pdf` exist.
7. `actions/upload-pages-artifact` with `dist/` → `actions/deploy-pages`.

Permissions: `pages: write`, `id-token: write`, `contents: read`. Concurrency group `pages`, cancel in progress.

### 11.3 `ci.yml` (on pull requests)

Lint → `astro check` → Vitest → build → Playwright e2e + axe → Lighthouse CI → link check (lychee) against `dist/`.

---

## 12. Testing strategy

| Layer | Tool | Covers |
|---|---|---|
| Content validation | Astro content collections (Zod) | Required fields, dates, enums, references (`role` must match an experience slug), competency vocabulary |
| Unit | Vitest | STAR section parser (valid / missing / out-of-order headings, VI headings), `formatCvDate()` (`YYYY` vs `YYYY-MM`, EN vs VI, empty `end` → Present), role sorting (current first, year-only dates, same company twice), company/client display, reading time, "Other / Personal" grouping, i18n `t()` and route helpers, tag slugging |
| CV PDF | Playwright + `pdf-lib` | `dist/cv.pdf` and `dist/vi/cv.pdf` exist, are US Letter, ≤ 2 pages, contain the name, headline and every role title as text, and contain `mailto:` / `tel:` link annotations |
| E2E | Playwright | Nav links on desktop + mobile sheet; theme toggle cycles and survives reload with no flash; language switch keeps the page; CV PDF link returns 200 + `application/pdf`; STAR expand/collapse, Expand all, filter + `?c=` URL; blog TOC highlights the active section; copy-code button; search opens with ⌘K, returns results, Esc restores focus; RSS is valid XML; 404 page |
| Accessibility | `@axe-core/playwright` | Every route type in light **and** dark, EN **and** VI. Zero serious/critical violations |
| Visual (optional) | Playwright screenshots | Home, CV, STAR, post at 375 / 768 / 1280 widths in both themes |
| Performance | Lighthouse CI | Budgets from §9; fails the PR if a score drops below 95 |
| Links | lychee | No broken internal links. External links are reported as warnings |
| Reduced motion | Playwright with `reducedMotion: 'reduce'` | Content visible immediately, no transforms applied |

---

## 13. Milestones

| # | Milestone | Deliverables |
|---|---|---|
| M1 | Foundation | Astro + Tailwind + TS strict, design tokens, fonts, BaseLayout, glass nav, footer, theme toggle (no flash), i18n scaffolding, deploy pipeline to `<username>.github.io` |
| M2 | CV | Content schemas, migrate `cv.tex` content (Appendix A checklist), header + summary, timeline, projects, skills bento + spoken languages, certifications, print layout, US Letter PDF generation in CI |
| M3 | STAR | Schema + remark section validator, grouped page, stepper, filters, permalinks, CV ↔ STAR links |
| M4 | Blog | Index, post layout (Newsreader, TOC, Shiki, copy), tags, RSS, reading time |
| M5 | Home + polish | Hero, highlights bento, featured stories/posts, scroll reveal, reduced motion, SEO/JSON-LD, OG default image |
| M6 | Search, analytics, VI | Pagefind modal, Cloudflare beacon, Vietnamese UI strings + sample translations, hreflang |
| M7 | Quality gate | Full e2e, axe, Lighthouse budgets, link check green; sample content replaced with real content |

---

## 14. Defaults to confirm

These smaller choices have a default in this spec. Change any you disagree with:

1. **Untranslated Vietnamese pages:** show the English content with a banner (alternative: hide untranslated items from `/vi/` lists). This includes `/vi/cv/` and `/vi/cv.pdf` until the CV is translated.
2. **Stories with no role:** shown in an "Other / Personal" group at the end.
3. **Competency list:** the 12 values in §6.6.
4. **Social links:** Email, phone, LinkedIn and GitHub required; X and Bluesky optional.
5. **Blog drafts:** a `draft: true` flag hides posts in production.
6. **Package manager:** pnpm.
7. **Datum roles:** stored as `company: "Datum"` + `client: "Security Bank"` / `"TymeX"`, displayed as "Datum / Security Bank", the same as in `cv.tex`.
8. **Years of experience:** shown as "5+" as written in `cv.tex`. The roles start in 2019, which would support a higher number. Confirm which to show.
9. **PDF length:** at most 2 Letter pages. The current `cv.tex` is tuned for 1 page; the web layout with Inter will likely run longer.
10. **PDF download filename:** `Ryan-Parker-CV.pdf`.

## 15. Placeholders to fill

- `<username>`: GitHub username of the account behind `ryanparker.p.97@gmail.com` (not `jomatran97`). It sets the site URL, the repo name `<username>.github.io`, and the GitHub link on the CV and PDF.
- Optional X / Bluesky profile URLs.
- Vietnamese translations of the CV content.
- Real STAR stories (the §6.6 example is illustrative) and blog content.

---

## Appendix A. CV migration from `cv.tex`

Source: `/Users/ryanparker/Documents/personal/cv/cv.tex`. Each bullet moves over **word for word** as `- **<label>:** <detail>`, keeping the `\textbf{}` terms as `**bold**`. Tick each row in M2.

### A.1 Profile → `profile/en/index.md`

| Field | Value |
|---|---|
| name | Ryan Parker (replaces "Hai Tran" from `cv.tex`) |
| headline / tagline | Senior Data Engineer / Data Pipelines, ETL/ELT & Cloud Data Platforms |
| location | Ho Chi Minh City, Vietnam |
| email | ryanparker.p.97@gmail.com |
| phone | (+84) 963 378 831 → `+84963378831` |
| LinkedIn | https://www.linkedin.com/in/jomatran |
| GitHub | https://github.com/<username> (new, not in `cv.tex`) |
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

Items written with parentheses become `name` + `children`. The `Languages` row moves to `profile.spokenLanguages`.

### A.5 Certifications → `certifications/en/*.md`

| File slug | Name | Issuer | Year |
|---|---|---|---|
| `aws-solutions-architect-associate` | AWS Certified Solutions Architect – Associate | Amazon Web Services | 2022 |
| `datadog-fundamentals` | Datadog Certified: Datadog Fundamentals | Datadog | 2023 |

### A.6 Not migrated

- **Education** (commented out in `cv.tex`): left out by choice.
