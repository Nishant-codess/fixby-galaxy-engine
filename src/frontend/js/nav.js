/* src/frontend/js/nav.js - Navbar & Page Transitions */

class NavEngine {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.init();
  }

  init() {
    if (this.navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          this.navbar.classList.add('scrolled');
        } else {
          this.navbar.classList.remove('scrolled');
        }
      }, { passive: true });
    }

    // View Transitions for links
    document.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') || href.startsWith('http')) return;

        if (document.startViewTransition) {
          e.preventDefault();
          document.startViewTransition(() => {
            window.location.href = href;
          });
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NavEngine();
});
