# Bible Standard India: redesign prototype

A clickable prototype of the new Bible Standard India website, for review. It is not the live site, and forms do not send anything.

Start at `index.html` (the home page). The **Prototype · site map** button at the bottom left of every page opens `sitemap.html`, which lists every section and the pages inside it.

## Publish on GitHub Pages

1. Create a repository on GitHub, for example `bsi-review`.
2. Upload everything in this folder to the root of the repository, including the hidden `.nojekyll` file and the `assets` folder.
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
4. After a minute the site is at `https://<your-user-name>.github.io/bsi-review/`.

All links are relative, so the site works in any repository name or sub-folder. Everything it needs, including the fonts and pictures, is in `assets/`; it loads nothing from other sites.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Site map | `sitemap.html` |
| Manna (27 October), choose a day | `manna.html`, `manna-calendar.html` |
| Magazine: all issues, 2025, issue No. 96, printed pages | `magazine.html`, `magazine-2025.html`, `magazine-96.html`, `magazine-96-pages.html` |
| Study: plans, topic, Chart of the Ages, reading | `study.html`, `study-topic-soul.html`, `study-chart.html`, `study-reading.html` |
| Library: booklets and tracts, booklet, tract | `library.html`, `booklet-what-is-the-soul.html`, `tract-what-is-truth.html` |
| Q & A: questions, topic, one answer | `questions.html`, `questions-soul.html`, `answer-what-is-the-soul.html` |
| My notes | `my-notes.html` |
| Events, one event | `events.html`, `event-nazareth-2026.html` |
| Gallery | `gallery.html` |
| About, what we believe, contact | `about.html`, `beliefs.html`, `contact.html` |
| Phone designs | `phone-home.html`, `phone-magazine-pages.html` |

## Notes for reviewers

- The site is in Tamil, with short English labels as on the current site.
- Notes, questions and forms are for show only; nothing is saved or sent.
- The Tamil text on About and What we believe is a draft for the team to check. The Nazareth Convention programme times are sample entries.
- Search engines are asked not to list these pages (`noindex`).
