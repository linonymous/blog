# Mindfork Blog

> I write, so that I may learn.

This is migration of existing linonymous.in blog to github pages, all entirely using ClaudeCode.

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

# Quick TIL
hugo new til/learned-something.md

# Personal musing
hugo new musings/thoughts.md
```

Edit the file, set `draft: false` when ready, then commit and push.

## Project Structure

```
.
├── .github/workflows/    # GitHub Actions for auto-deploy
├── content/
│   ├── tech/            # Technical articles
│   ├── deep-dives/      # Long-form paper reviews
│   ├── til/             # Today I Learned snippets
│   ├── musings/         # Personal reflections
│   └── about/           # About page
├── themes/mindfork/     # Custom theme
├── static/CNAME         # Custom domain config
└── hugo.toml            # Site configuration
```

## Categories

| Category | Description |
|----------|-------------|
| **Tech** | System design, backend engineering, databases, and code |
| **Deep Dives** | Long-form paper reviews and architecture explorations |
| **TIL** | Today I Learned — quick daily snippets |
| **Musings** | Personal reflections, career thoughts |

## Deployment

The site auto-deploys to GitHub Pages on push to `main` via GitHub Actions.

### Custom Domain Setup

1. The `CNAME` file in `/static/` contains `linonymous.in`
2. Configure DNS at your registrar:

```
Type    Name    Value
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     linonymous.github.io
```

3. Enable HTTPS in GitHub Pages settings

## Theme Features

- **Dark/Light Mode**: System preference detection + manual toggle
- **Responsive Design**: Mobile-first approach
- **Reading Progress Bar**: Visual progress indicator for articles
- **Syntax Highlighting**: Dracula theme with copy button
- **Category Colors**: Distinct visual identity for each category
- **SEO Optimized**: Open Graph and Twitter Card meta tags

## License

Content: All rights reserved
Theme: MIT License

---

Built with Hugo | Hosted on GitHub Pages
