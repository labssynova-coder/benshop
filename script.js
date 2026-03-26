/* ==========================================
   IKHERBANE — Script Principal
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // Page Loader
  // ==========================================
  const loader = document.getElementById('pageLoader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 400);
    });
    // Fallback: hide loader after 3 seconds even if load fails
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 3000);
  }

  // ==========================================
  // Navbar Scroll Effect
  // ==========================================
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // ==========================================
  // Mobile Menu Toggle
  // ==========================================
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
      if (navOverlay) navOverlay.classList.toggle('visible');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        navOverlay.classList.remove('visible');
        document.body.style.overflow = '';
      });
    }

    // Close menu on link click
    navMenu.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        if (navOverlay) navOverlay.classList.remove('visible');
        document.body.style.overflow = '';
      });
    });
  }

  // ==========================================
  // Scroll Animations (Intersection Observer)
  // ==========================================
  const animElements = document.querySelectorAll('.animate-on-scroll');

  if (animElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation delay based on element's position among siblings
          const siblings = entry.target.parentElement?.querySelectorAll('.animate-on-scroll');
          let delay = 0;
          if (siblings) {
            const idx = Array.from(siblings).indexOf(entry.target);
            delay = idx * 100;
          }
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: just show everything
    animElements.forEach(el => el.classList.add('visible'));
  }

  // ==========================================
  // Catalog Page — Filter Tabs
  // ==========================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card[data-category]');

  if (filterTabs.length > 0) {
    // Check URL params for initial filter
    const urlParams = new URLSearchParams(window.location.search);
    const initialCat = urlParams.get('cat');

    if (initialCat) {
      filterTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === initialCat) {
          tab.classList.add('active');
        }
      });
      filterProducts(initialCat);
    }

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        filterProducts(filter);
      });
    });
  }

  function filterProducts(category) {
    productCards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = '';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 400);
      }
    });
  }

  // ==========================================
  // Smooth Scroll for Anchor Links
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ==========================================
  // Contact Form (Visual Only)
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.contact__submit');
      const originalText = btn.textContent;
      btn.textContent = 'Message envoyé ✓';
      btn.style.backgroundColor = '#28a745';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        contactForm.reset();
      }, 2500);
    });
  }
});
