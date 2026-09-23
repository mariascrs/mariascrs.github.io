# mariascrs.com

Personal website of Maria Corte-Real Santos, built with Jekyll and hosted on
GitHub Pages. Pushing to the default branch rebuilds the site automatically.

## Where things live

| To change…                         | Edit                                   |
| ---------------------------------- | -------------------------------------- |
| About-me text, heading, tagline    | `index.md`                             |
| Upcoming events on the homepage    | `_data/events.yml`                     |
| Publications                       | `_data/publications.yml`               |
| Preprints                          | `_data/preprints.yml`                  |
| Co-author homepage links           | `_data/people.yml`                     |
| Talks and outreach talks           | `_data/talks.yml`                      |
| Projects / Service pages           | `projects.md`, `service.md`            |
| Icons under the photo, nav, email  | `_config.yml`                          |
| Blog posts                         | `_posts/`                              |
| PDFs (slides, thesis)              | `files/`                               |
| Photo                              | `images/profile.jpg`, `images/profile-680.jpg` |
| Colours and fonts                  | `assets/css/main.css` (top of file)    |

## Common tasks

**Add a paper.** Copy an entry in `_data/publications.yml` to the top and edit
it. List co-authors by name; anyone in `_data/people.yml` gets linked
automatically. The three entries at the top of the file are the ones shown
under "Recent papers" on the homepage. Use `$...$` for maths in titles.

**Add a talk.** Add an entry at the top of `_data/talks.yml` with
`category: academic`, `industry` or `outreach`.

**Add an upcoming event.** Add it to `_data/events.yml` with an `end` date.
Past events drop off automatically the next time the site rebuilds.

**Write a blog post.** Create `_posts/YYYY-MM-DD-short-name.md`:

```markdown
---
title: My new post about $\ell$-isogenies
with: Co-author One and Co-author Two   # optional, shown in the sidebar
paper: https://eprint.iacr.org/...       # optional, shown in the sidebar
---

Text with inline maths $E/\mathbb{F}_{p^2}$ and display maths:

$$
\varphi : E \to E'
$$

## A section heading
```

Maths is rendered with MathJax. Section headings (`#` or `##`) automatically
appear in the post's table of contents. The URL will be
`/YYYY/MM/DD/short-name.html`.

**Add your Google Scholar / Bluesky icons.** Fill in `scholar` (full profile
URL) and `bluesky` (your handle) under `social:` in `_config.yml`.

## Previewing locally (optional)

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.
