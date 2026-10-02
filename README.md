# Jing Wang - Academic Homepage

This repository contains Jing Wang's academic homepage: <https://yuzhounh.github.io/>.

The homepage includes three tabs:

- **Home**: Basic information, research interests, education and work experience, and students
- **Publications**: A comprehensive list of research publications and patents
- **Vibes**: Open-source projects and tools

## Local Preview

The site is static and has no build step. Clone the repository and serve it over HTTP so relative assets behave like GitHub Pages:

```bash
git clone https://github.com/yuzhounh/yuzhounh.github.io.git
cd yuzhounh.github.io
python -m http.server 8000
```

Then open <http://localhost:8000/>. `index.html` is the entry page, `assets/` contains styles and media, `scripts/` contains page behavior, and `PDF/` contains linked documents.

## Hosting package

The page needs no compilation. To prepare the same isolated package for Cloudflare Pages, Netlify, Firebase Hosting, or Vercel, run Node.js 22 or later:

```bash
node scripts/build-site.mjs
```

This recreates `dist_pages/` from tracked `index.html`, `assets/`, and `PDF/` files, records source/file hashes, and excludes local configuration and maintenance scripts. Firebase already uses this directory and site `yuzhounh` in the existing `soft-trace` project. GitHub Pages continues serving the repository root.

## License

Source code and the theme are licensed under MIT. Personal writing, biography, photographs, and other content have separate terms; see [LICENSE](LICENSE) for the exact split.
