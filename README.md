# Portfolio

Personal portfolio site for **Rajeev Ponna** — OpenShift Platform / Production Operations Engineer.

**Live:** https://ponnarajeev.github.io/myportfolio/

## About

A static, no-build portfolio built with plain HTML, CSS and JavaScript. It presents a professional
summary, technical skills, production platform projects, achievements, and a contact form.

## Structure

| File | Purpose |
|---|---|
| `index.html` | Page markup — hero, skills, projects, achievements, contact |
| `styles.css` | Design tokens, light/dark theming, responsive layout |
| `script.js` | Theme toggle, mobile nav, project filtering, counters, scroll reveal, form validation |
| `404.html` | Custom not-found page |

No build step, no dependencies, no framework. Open `index.html` directly or serve the folder.

## Features

- **Dark / light theme** — persisted in `localStorage`, defaults to the OS preference
- **Project filtering** — filter cards by technology (OpenShift, IBM Middleware, Security, Automation, Storage)
- **Scroll reveal** — sections animate in via `IntersectionObserver`
- **Animated counters** — hero statistics count up when scrolled into view
- **Contact form** — client-side validation plus AJAX submission to Formspree
- **Accessibility** — skip link, semantic landmarks, focus-visible rings, ARIA live regions
- **Responsive** — mobile navigation and fluid grids down to small screens
- **Reduced motion** — animations disabled when the OS requests it

## Contact form

The form posts to [Formspree](https://formspree.io) (`https://formspree.io/f/myewovev`), which emails
each submission and stores it in the Formspree dashboard.

Notes for anyone forking this:

- Replace the form ID with your own — submissions go to the account that owns it.
- Formspree rejects submissions from `file://` pages, so the form only works once deployed over `https://`.
- The free tier allows 50 submissions per month and keeps a 30-day dashboard archive. Submissions are
  emailed too, so keep those emails if you want longer history.
- Enable **Restrict to domain** in the Formspree form settings so only this site can submit to the endpoint.
- No personal contact details (email or phone) are published in the markup; the form and the LinkedIn
  profile are the contact routes.

## Local preview

```bash
# Any static server works, for example:
python -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Hosted on GitHub Pages from the `main` branch root. Any push to `main` redeploys automatically.

```bash
git add .
git commit -m "Describe the change"
git push
```

## Prerequisites

None. No package manager, no build tooling, no environment variables.
