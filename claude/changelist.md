# Changelog

This document tracks all commits made to the blog repository, organized chronologically.

---

## Commit History

### 1. Initial commit
**Commit:** `9e176e9`
**Author:** Swapnil Walke
**Date:** 2026-01-04

Initial repository setup.

---

### 2. Migrate Mindfork blog from Blogspot to Hugo
**Commit:** `e6bbb4c`
**Author:** Claude
**Date:** 2026-01-04

Complete migration of the Mindfork blog from Blogspot to Hugo static site generator.

**Changes:**
- Set up Hugo project with custom Mindfork theme
- Create responsive layouts with dark/light mode support
- Add category sections: Tech, Deep Dives, TIL, Musings
- Configure GitHub Actions workflow for auto-deploy
- Migrate 4 blog posts from Blogspot:
  - System Design #1: Designing Live Commenting
  - Goroutines & Green Threads
  - Partitioning (Key, Hash, Request Routing)
  - Amazon Dynamo Case Study
- Add custom domain config (linonymous.in)

---

### 3. Fix GitHub Actions deprecated artifact versions
**Commit:** `6f59cad`
**Author:** Claude
**Date:** 2026-01-04

Update GitHub Actions workflow to use latest action versions.

**Changes:**
- `upload-pages-artifact`: v2 → v3
- `deploy-pages`: v3 → v4
- `configure-pages`: v4 → v5

---

### 4. Fix relative URLs for GitHub Pages subdirectory deployment
**Commit:** `2669991`
**Author:** Claude
**Date:** 2026-01-04

Fix URL handling for GitHub Pages deployment.

**Changes:**
- Use Hugo's `relURL` function for all internal links to work correctly when deployed to `/blog/` subdirectory on GitHub Pages

---

### 5. Update README.md
**Commit:** `ac01e9d`
**Author:** Swapnil Walke
**Date:** 2026-01-04

Updated README documentation.

---

### 6. Rebrand blog from Mindfork to The Towel with space theme
**Commit:** `0a66a32`
**Author:** Claude
**Date:** 2026-01-04

Complete rebranding of the blog with a Hitchhiker's Guide to the Galaxy inspired theme.

**Changes:**
- Rename blog from "Mindfork" to "The Towel" (Hitchhiker's Guide reference)
- Add galaxy/space exploration theme with animated stars and comet
- Set dark mode as the default for the cosmic aesthetic
- Add dropdown menu for About section with Blog and Me sub-pages
- Create About > Blog page with Hitchhiker's Guide towel description
- Create About > Me placeholder page
- Update all branding (logo, favicon, footer) with rocket emoji
- Rename theme folder from mindfork to towel
- Update accent colors to cosmic purples and blues

---

### 7. Fix comet and About dropdown
**Commit:** `93d88d3`
**Author:** Claude
**Date:** 2026-01-04

Improvements to the space theme and navigation.

**Changes:**
- Make comet animation bigger (250px tail, 12px head vs previous 150px/8px)
- Add multiple comets (3 total) with staggered, slower animations (15-20s vs 8s)
- Different trajectories and timing for visual variety
- Fix About dropdown menu by using Hugo's proper `identifier`/`parent` menu structure
- Dropdown now correctly shows "Me" and "Blog" sub-sections

---

### 8. Update README and restructure sections
**Commit:** *(current session)*
**Author:** Claude
**Date:** 2026-01-04

Restructure blog sections and update documentation.

**Changes:**
- Update README.md with "The Towel" branding
- Remove TIL and Musings sections from navigation, homepage, and footer
- Add new Books section as a single page with yearly reading list
- Create Books page layout with year-based organization
- Update CSS to replace TIL/Musings colors with Books (emerald green)
- Remove unused TIL and Musings content folders

---

## Pull Requests

| PR | Branch | Description |
|----|--------|-------------|
| #1 | `claude/migrate-blogspot-hugo-J9vcN` | Initial Blogspot to Hugo migration |
| #2 | `claude/migrate-blogspot-hugo-J9vcN` | GitHub Actions version fixes |
| #3 | `claude/migrate-blogspot-hugo-J9vcN` | Relative URL fixes |
| #4 | `claude/rebrand-space-theme-pLFtx` | Rebrand to The Towel with space theme |
