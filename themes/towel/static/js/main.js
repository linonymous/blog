// ================================
// The Towel Theme - JavaScript
// Don't Panic!
// ================================

(function() {
  'use strict';

  // ================================
  // Theme Toggle (Dark/Light Mode)
  // ================================

  const THEME_KEY = 'towel-theme';
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Get stored theme or default to dark (space theme)
  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
      return stored;
    }
    // Default to dark mode for the space theme
    return 'dark';
  }

  // Apply theme
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  // Initialize theme
  setTheme(getPreferredTheme());

  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ================================
  // Mobile Menu Toggle
  // ================================

  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('open');

      // Update aria-expanded
      const isOpen = nav.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });
  }

  // ================================
  // Dropdown Menu Toggle
  // ================================

  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.parentElement;
      const isOpen = parent.classList.contains('dropdown-open');

      // Close all other dropdowns
      document.querySelectorAll('.has-dropdown').forEach(function(dropdown) {
        dropdown.classList.remove('dropdown-open');
        dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
      });

      // Toggle current dropdown
      if (!isOpen) {
        parent.classList.add('dropdown-open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown').forEach(function(dropdown) {
        dropdown.classList.remove('dropdown-open');
        dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
    }
  });

  // ================================
  // Reading Progress Bar
  // ================================

  const progressBar = document.getElementById('reading-progress');
  const article = document.querySelector('.article-content');

  if (progressBar && article) {
    function updateProgress() {
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      // Calculate how far through the article we've scrolled
      const start = articleTop - windowHeight;
      const end = articleTop + articleHeight;
      const current = scrollTop - start;
      const total = end - start;

      let progress = (current / total) * 100;
      progress = Math.max(0, Math.min(100, progress));

      progressBar.style.width = progress + '%';
    }

    // Throttle scroll event for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Initial call
    updateProgress();
  }

  // ================================
  // Smooth Scroll for Anchor Links
  // ================================

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL without jumping
        history.pushState(null, null, href);
      }
    });
  });

  // ================================
  // Copy Code Button
  // ================================

  document.querySelectorAll('pre code').forEach(function(codeBlock) {
    const pre = codeBlock.parentElement;

    // Create copy button
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    // Style the button
    button.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 12px;
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: #a8a29e;
      cursor: pointer;
      opacity: 0;
      transition: opacity 150ms ease;
    `;

    // Make pre relative for button positioning
    pre.style.position = 'relative';
    pre.appendChild(button);

    // Show button on hover
    pre.addEventListener('mouseenter', function() {
      button.style.opacity = '1';
    });

    pre.addEventListener('mouseleave', function() {
      button.style.opacity = '0';
    });

    // Copy functionality
    button.addEventListener('click', async function() {
      try {
        await navigator.clipboard.writeText(codeBlock.textContent);
        button.textContent = 'Copied!';
        button.style.color = '#2dd4bf';

        setTimeout(function() {
          button.textContent = 'Copy';
          button.style.color = '#a8a29e';
        }, 2000);
      } catch (err) {
        button.textContent = 'Error';
        setTimeout(function() {
          button.textContent = 'Copy';
        }, 2000);
      }
    });
  });

  // ================================
  // External Links - Open in New Tab
  // ================================

  document.querySelectorAll('.article-content a').forEach(function(link) {
    if (link.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

})();
