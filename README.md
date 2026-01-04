# The Towel

(Migration of old blogspot based blog to github pages) A personal blog about distributed systems, databases, and backend engineering. Hosted on GitHub Pages.

## Quick Start

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) v0.121.1 or later
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/linonymous/blog.git
cd blog

# Start the development server
hugo server -D

# Open http://localhost:1313
```

### Creating New Posts

```bash
# Tech article
hugo new tech/my-new-post.md

# Deep dive
hugo new deep-dives/paper-review.md
```

Edit the file, set `draft: false` when ready, then commit and push.

## Project Structure

```
.
├── .github/workflows/    # GitHub Actions for auto-deploy
├── content/
│   ├── tech/            # Technical articles
│   ├── deep-dives/      # Long-form paper reviews
│   ├── books/           # Reading list by year
│   └── about/           # About pages
├── themes/towel/        # Custom theme
├── static/CNAME         # Custom domain config
└── hugo.toml            # Site configuration
```

## Sections

| Section | Description |
|---------|-------------|
| **Tech** | System design, backend engineering, databases, and code |
| **Deep Dives** | Long-form paper reviews and architecture explorations |
| **Books** | Reading list organized by year |

## Deployment

The site auto-deploys to GitHub Pages on push to `main` via GitHub Actions.

3. Enable HTTPS in GitHub Pages settings

## Theme Features

- **Dark/Light Mode**: System preference detection + manual toggle
- **Responsive Design**: Mobile-first approach
- **Reading Progress Bar**: Visual progress indicator for articles
- **Syntax Highlighting**: Dracula theme with copy button
- **Space Theme**: Animated stars and comets background
- **SEO Optimized**: Open Graph and Twitter Card meta tags

## License

Content: All rights reserved
Theme: MIT License

---

Built with Hugo | Hosted on GitHub Pages
