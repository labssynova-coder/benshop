/* ==========================================
   BENSHOP — Script Principal
   ========================================== */

function esc(str) {
  if (str == null) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// ==========================================
// CONFIGURATION — WHATSAPP NUMBERS (loaded from API)
// ==========================================
let WHATSAPP_ORDERS = '';
let WHATSAPP_WHOLESALE = '';
fetch('/api/config').then(r => r.json()).then(cfg => {
  WHATSAPP_ORDERS = cfg.whatsappOrders;
  WHATSAPP_WHOLESALE = cfg.whatsappWholesale;
  // Update floating WhatsApp button if it exists
  const waBtn = document.querySelector('.floating-whatsapp-btn');
  if (waBtn && WHATSAPP_ORDERS) {
    waBtn.href = `https://wa.me/${WHATSAPP_ORDERS}?text=${encodeURIComponent(t('wa_chat_msg'))}`;
  }
}).catch(() => {
  // WhatsApp buttons will not work without config
});

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // LANGUAGE SWITCHER
  // ==========================================
  const langToggle = document.getElementById('langToggle');
  const langDropdown = document.getElementById('langDropdown');

  if (langToggle && langDropdown) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });

    langDropdown.querySelectorAll('button[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        applyTranslations(lang);
        langDropdown.classList.remove('active');
      });
    });

    document.addEventListener('click', () => {
      langDropdown.classList.remove('active');
    });

    // Apply saved language on load
    applyTranslations(currentLang);
  }

  // Set page title based on current page and language
  (function setPageTitle() {
    const page = location.pathname.split('/').pop().replace('.html', '') || 'index';
    const titleMap = {
      '': 'page_title_home', 'index': 'page_title_home',
      'catalog': 'page_title_catalog', 'product': 'page_title_product',
      'contact': 'page_title_contact', 'cookies': 'page_title_cookies',
      'privacy': 'page_title_privacy', 'terms': 'page_title_terms',
    };
    const key = titleMap[page];
    if (key) document.title = t(key);
  })();

  // ==========================================
  // LAZY LOADING SUPPORT
  // ==========================================
  // Add loaded class when images finish loading for smooth transition
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded'));
    }
  });

  // JavaScript fallback for browsers without native loading="lazy" support
  if (!('loading' in HTMLImageElement.prototype)) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.classList.add('loaded');
          lazyObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    lazyImages.forEach(img => {
      img.classList.add('lazy-image');
      lazyObserver.observe(img);
    });
  }

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
  const filterTabs = document.querySelectorAll('.filter-tab:not([data-family])');
  const familyTabsContainer = document.getElementById('familyTabs');

  let currentCategory = 'all';
  let currentFamily = 'all';

  // Dynamically load family tabs from API
  async function loadFamilyTabs() {
    if (!familyTabsContainer) return;
    try {
      const families = await Api.getFamilies();
      if (!Array.isArray(families) || families.length === 0) return;
      // Keep the "Toutes" button, remove the rest
      const allTab = familyTabsContainer.querySelector('[data-family="all"]');
      familyTabsContainer.innerHTML = '';
      if (allTab) familyTabsContainer.appendChild(allTab);
      families.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'filter-tab';
        btn.dataset.family = f.id;
        const translationKey = 'family_' + f.id;
        btn.textContent = t(translationKey) !== translationKey ? t(translationKey) : f.label;
        btn.setAttribute('data-i18n', translationKey);
        familyTabsContainer.appendChild(btn);
      });
      bindFamilyTabClicks();
    } catch (e) {
      // Fallback: keep existing static tabs
    }
  }

  function bindFamilyTabClicks() {
    if (!familyTabsContainer) return;
    familyTabsContainer.querySelectorAll('.filter-tab[data-family]').forEach(tab => {
      tab.addEventListener('click', () => {
        familyTabsContainer.querySelectorAll('.filter-tab[data-family]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFamily = tab.dataset.family;
        filterProducts();
      });
    });
  }

  loadFamilyTabs();
  // Also bind click handlers on initial static family tabs
  bindFamilyTabClicks();

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
      currentCategory = initialCat;
      if (familyTabsContainer) {
        familyTabsContainer.style.display = initialCat === 'all' ? 'none' : 'flex';
      }
      // Reset family tab to "all"
      currentFamily = 'all';
      const allFamilyTab = familyTabsContainer?.querySelector('[data-family="all"]');
      if (allFamilyTab) allFamilyTab.classList.add('active');
      filterProducts();
    }

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.filter;
        currentFamily = 'all';

        if (familyTabsContainer) {
          familyTabsContainer.style.display = currentCategory === 'all' ? 'none' : 'flex';
        }
        const allFamilyTab = familyTabsContainer?.querySelector('[data-family="all"]');
        if (allFamilyTab) allFamilyTab.classList.add('active');

        filterProducts();
      });
    });
  }

  function normalizeFilterValue(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterProducts() {
    const allCards = document.querySelectorAll('.product-card[data-category]');
    allCards.forEach(card => {
      if (card._filterHideTimer) {
        clearTimeout(card._filterHideTimer);
        card._filterHideTimer = null;
      }
      if (card._filterShowTimer) {
        clearTimeout(card._filterShowTimer);
        card._filterShowTimer = null;
      }

      const cardCategory = normalizeFilterValue(card.dataset.category);
      const cardFamily = normalizeFilterValue(card.dataset.family);
      const selectedCategory = normalizeFilterValue(currentCategory);
      const selectedFamily = normalizeFilterValue(currentFamily);
      const matchCategory = selectedCategory === 'all' || cardCategory === selectedCategory;
      const matchFamily = selectedFamily === 'all' || cardFamily === selectedFamily;
      if (matchCategory && matchFamily) {
        card.style.display = '';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          card._filterShowTimer = setTimeout(() => {
            card.style.removeProperty('opacity');
            card.style.removeProperty('transform');
            card.style.removeProperty('transition');
            card._filterShowTimer = null;
          }, 420);
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card._filterHideTimer = setTimeout(() => {
          card.style.display = 'none';
          card.style.removeProperty('opacity');
          card.style.removeProperty('transform');
          card._filterHideTimer = null;
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
  // Contact Form (API)
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.contact__submit');
      const originalText = btn.textContent;

      // Loading state
      btn.textContent = t('contact_sending');
      btn.disabled = true;

      const fromName = document.getElementById('cfName').value.trim();
      const fromEmail = document.getElementById('cfEmail').value.trim();
      const message = document.getElementById('cfMessage').value.trim();

      try {
        const result = await Api.sendContactMessage(fromName, fromEmail, message);

        if (result.error) {
          btn.textContent = t('contact_error');
          btn.style.backgroundColor = '#dc3545';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
            btn.disabled = false;
          }, 3000);
          return;
        }

        btn.textContent = t('contact_success');
        btn.style.backgroundColor = '#28a745';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
          btn.disabled = false;
          contactForm.reset();
        }, 2500);
      } catch (err) {
        console.error('Contact form error:', err);
        btn.textContent = t('contact_error');
        btn.style.backgroundColor = '#dc3545';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  const toastContainer = document.getElementById('toastContainer');
  window.showToast = function(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${esc(message)}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  };

  function showOrderSuccess(orderId) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:var(--radius-lg);padding:32px;max-width:420px;width:100%;text-align:center;box-shadow:var(--shadow-xl);">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(22,163,74,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <i class="fas fa-check-circle" style="font-size:2rem;color:#16A34A;"></i>
        </div>
        <h3 style="font-family:var(--font-display);font-size:1.25rem;font-weight:700;margin-bottom:8px;">${t('order_success_title')}</h3>
        <p style="color:var(--color-text-secondary);font-size:0.875rem;margin-bottom:16px;">${t('order_success_msg')}</p>
        <div style="background:var(--color-bg);border:1.5px dashed var(--color-border);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:20px;">
          <div style="font-size:0.75rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">${t('order_ref_label')}</div>
          <div id="orderRefText" style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--color-accent);letter-spacing:0.1em;">${esc(orderId)}</div>
        </div>
        <button id="copyRefBtn" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:var(--color-accent);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:0.875rem;font-weight:600;cursor:pointer;margin-bottom:12px;transition:background 0.2s;">
          <i class="fas fa-copy"></i> ${t('order_copy_btn')}
        </button>
        <button id="closeOrderSuccess" style="display:block;width:100%;padding:10px;background:none;border:1.5px solid var(--color-border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:0.875rem;font-weight:600;color:var(--color-text-secondary);cursor:pointer;transition:border-color 0.2s;">
          ${t('order_close')}
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    const copyBtn = overlay.querySelector('#copyRefBtn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(orderId).then(() => {
        copyBtn.innerHTML = `<i class="fas fa-check"></i> ${t('order_copied')}`;
        copyBtn.style.background = '#16A34A';
      }).catch(() => {
        const ref = overlay.querySelector('#orderRefText');
        const range = document.createRange();
        range.selectNode(ref);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      });
    });

    const closeBtn = overlay.querySelector('#closeOrderSuccess');
    const close = () => overlay.remove();
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }

  // ==========================================
  // DYNAMIC PRODUCT UI INJECTION
  // ==========================================
  function initProductUI() {
    if (typeof products === 'undefined' || products.length === 0) return;

    const matchedIds = new Set();
    document.querySelectorAll('.product-card').forEach(card => {
      const nameEl = card.querySelector('.product-card__name');
      if (!nameEl) return;
      const productName = nameEl.textContent.trim();
      const product = products.find(p => p.name === productName);

      if (product) {
        matchedIds.add(product.id);
        card.dataset.id = product.id;
        if (product.category) {
          card.dataset.category = normalizeFilterValue(product.category);
          const categoryEl = card.querySelector('.product-card__category');
          if (categoryEl) {
            const categoryKey = 'cat_' + normalizeFilterValue(product.category);
            categoryEl.dataset.i18n = categoryKey;
            categoryEl.textContent = t(categoryKey) !== categoryKey ? t(categoryKey) : product.category;
          }
        }
        if (product.family) card.dataset.family = product.family;

        // Make the whole card clickable → product detail
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          window.location.href = `product.html?id=${product.id}`;
        });

        // Add-to-cart on existing button (homepage cards have one already)
        const addBtn = card.querySelector('.product-card__add-cart-btn');
        if (addBtn) {
          addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product.id);
          });
        }
      }
    });

    // Only on catalog page: add dynamic cards for new products not in HTML
    const isCatalog = !!document.getElementById('catalogGrid');
    const grid = isCatalog ? document.getElementById('catalogGrid') : null;
    if (grid) {
      products.forEach(product => {
        if (matchedIds.has(product.id)) return;
        const badgeHtml = product.badge ? `<span class="product-card__badge" data-i18n="badge_${product.badge.toLowerCase()}">${product.badge}</span>` : '';
        const oldPriceHtml = product.oldPrice ? ` <span class="product-card__price-old">${product.oldPrice} <span data-i18n="currency">${t('currency')}</span></span>` : '';
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        card.dataset.category = product.category || '';
        if (product.family) card.dataset.family = product.family;
        card.innerHTML = `
          <div class="product-card__image-wrapper">
            <img src="/${product.image || 'assets/images/placeholder.svg'}" alt="${esc(product.name)}" class="product-card__image" loading="lazy">
            ${badgeHtml}
            <span class="product-card__quick-view" data-i18n="quick_view">${t('quick_view')}</span>
          </div>
          <div class="product-card__info">
            <span class="product-card__category" data-i18n="cat_${product.category || 'autres'}">${t('cat_' + (product.category || 'autres'))}</span>
            <h3 class="product-card__name">${esc(product.name)}</h3>
            <div class="product-card__footer">
              <div class="product-card__price">${product.price} <span data-i18n="currency">${t('currency')}</span>${oldPriceHtml}</div>
            </div>
          </div>`;
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          window.location.href = `product.html?id=${product.id}`;
        });
        // Add image error handler (not inline — uses addEventListener for scope)
        const dynImg = card.querySelector('.product-card__image');
        if (dynImg) {
          dynImg.addEventListener('error', handleImageError);
          dynImg.addEventListener('load', () => dynImg.classList.add('loaded'));
        }
        grid.appendChild(card);
      });
    }

    // Re-apply translations for dynamically added elements
    if (typeof applyTranslations === 'function') {
      applyTranslations(currentLang);
    }

    // ==========================================
    // PRODUCT DETAIL PAGE LOGIC
    // ==========================================
    const productDetailContainer = document.getElementById('productDetailContainer');
    if (productDetailContainer) {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');
      const product = products.find(p => p.id === productId);

      if (product) {
        const layout = document.getElementById('productLayout');
        if (layout) layout.style.display = 'grid';
        
        const pdImage = document.getElementById('pdImage');
        if (pdImage) {
          pdImage.onerror = function() {
            if (!this.dataset.fallbackApplied) {
              this.dataset.fallbackApplied = 'true';
              this.src = getImageFallback();
            }
          };
          pdImage.src = '/' + product.image;
          pdImage.alt = product.name;
          pdImage.loading = 'lazy';
          pdImage.classList.add('loaded');
        }
        
        const pdName = document.getElementById('pdName');
        if (pdName) pdName.textContent = product.name;

        const pdBadge = document.getElementById('pdBadge');
        if (pdBadge) {
          if (product.badge) {
            const badgeKey = 'badge_' + product.badge.toLowerCase();
            pdBadge.textContent = t(badgeKey) !== badgeKey ? t(badgeKey) : product.badge;
            pdBadge.dataset.i18n = badgeKey;
            pdBadge.style.display = 'inline-block';
          } else {
            pdBadge.style.display = 'none';
          }
        }

        const pdPrice = document.getElementById('pdPrice');
        if (pdPrice) {
          if (product.oldPrice) {
            pdPrice.innerHTML = product.price + ' ' + t('currency') + ' <span style="text-decoration:line-through;color:var(--color-text-muted);font-size:0.85em;margin-left:8px;">' + product.oldPrice + ' ' + t('currency') + '</span>';
          } else {
            pdPrice.textContent = product.price + ' ' + t('currency');
          }
        }

        // Stock indicator on product detail page
        const pdStockEl = document.getElementById('pdStock');
        const pdAddBtn = document.querySelector('.product-page__add-btn');
        if (pdStockEl) {
          const stock = product.stock;
          if (stock !== null && stock !== undefined) {
            if (stock <= 0) {
              pdStockEl.className = 'product-page__stock product-page__stock--out';
              pdStockEl.textContent = t('stock_out');
              pdStockEl.style.display = 'inline-block';
              if (pdAddBtn) { pdAddBtn.disabled = true; pdAddBtn.textContent = t('stock_out'); }
            } else if (stock <= 10) {
              pdStockEl.className = 'product-page__stock product-page__stock--low';
              pdStockEl.textContent = t('stock_low');
              pdStockEl.style.display = 'inline-block';
            } else {
              pdStockEl.className = 'product-page__stock product-page__stock--in';
              pdStockEl.textContent = t('stock_in');
              pdStockEl.style.display = 'inline-block';
            }
          } else {
            pdStockEl.style.display = 'none';
          }
        }

        // Image thumbnails gallery
        const productImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
        const thumbContainer = document.getElementById('pdThumbnails');
        if (thumbContainer && productImages.length > 1) {
          thumbContainer.innerHTML = '';
          productImages.forEach((img, idx) => {
            const thumb = document.createElement('img');
            thumb.src = '/' + img;
            thumb.alt = product.name + ' ' + (idx + 1);
            thumb.className = 'product-page__thumb' + (idx === 0 ? ' active' : '');
            thumb.loading = 'lazy';
            thumb.addEventListener('click', () => {
              if (pdImage) pdImage.src = '/' + img;
              thumbContainer.querySelectorAll('.product-page__thumb').forEach(t => t.classList.remove('active'));
              thumb.classList.add('active');
            });
            thumbContainer.appendChild(thumb);
          });
        } else if (thumbContainer) {
          thumbContainer.innerHTML = '';
        }

        const pdDesc = document.getElementById('pdDesc');
        if (pdDesc) pdDesc.textContent = product.desc || t('default_product_desc');

        const pdCatLink = document.getElementById('pdCatLink');
        if (pdCatLink) {
          const catKey = 'cat_' + product.category;
          pdCatLink.textContent = t(catKey) !== catKey ? t(catKey) : product.category;
          pdCatLink.href = `catalog.html?cat=${product.category}`;
        }

        const pdCrumbName = document.getElementById('pdCrumbName');
        if (pdCrumbName) pdCrumbName.textContent = product.name;

        document.title = `${product.name} — BENSHOP ${t('hero_accent')}`;

        // JSON-LD structured data for SEO
        const jsonLdEl = document.getElementById('product-jsonld');
        if (jsonLdEl) {
          const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.desc || product.name,
            image: productImages.length > 0 ? productImages.map(img => `https://benshop.dz/${img}`) : undefined,
            brand: { '@type': 'Brand', name: 'BENSHOP' },
            offers: {
              '@type': 'Offer',
              url: `https://benshop.dz/product.html?id=${product.id}`,
              priceCurrency: 'DZD',
              price: product.price,
              availability: (product.stock === null || product.stock === undefined || product.stock > 0)
                ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              seller: { '@type': 'Organization', name: 'BENSHOP' }
            }
          };
          if (product.oldPrice) {
            jsonLd.offers.priceValidUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
          }
          jsonLdEl.textContent = JSON.stringify(jsonLd);
        }

        let detailQty = 1;
        const pdQtyMinus = document.getElementById('pdQtyMinus');
        const pdQtyPlus = document.getElementById('pdQtyPlus');
        const pdQtyVal = document.getElementById('pdQtyVal');

        if (pdQtyMinus && pdQtyVal) {
          pdQtyMinus.addEventListener('click', () => {
            if (detailQty > 1) {
              detailQty--;
              pdQtyVal.textContent = detailQty;
            }
          });
        }

        if (pdQtyPlus && pdQtyVal) {
          pdQtyPlus.addEventListener('click', () => {
            detailQty++;
            pdQtyVal.textContent = detailQty;
          });
        }

        if (pdAddBtn) {
          pdAddBtn.addEventListener('click', () => {
            const existingItem = window.cart.find(item => item.id === product.id);
            if (existingItem) {
              existingItem.qty += detailQty;
            } else {
              window.cart.push({ ...product, qty: detailQty });
            }
            window.saveCart();
            window.updateCartBadge();
            window.showToast(`${detailQty}x ${product.name} ${t('cart_added')}`);
            window.openCart();

            // Track add-to-cart event
            if (typeof trackAddToCart === 'function') {
              trackAddToCart({ ...product, qty: detailQty });
            }
          });
        }

      } else {
        const productError = document.getElementById('productError');
        if (productError) productError.style.display = 'block';
      }
    }
  }

  // Initialize products when loaded (async from API)
  function initProductsAndFilter() {
    initProductUI();
    // Re-apply filters after dynamic cards are added
    if (typeof filterProducts === 'function') {
      filterProducts();
    }
  }

  if (typeof products !== 'undefined' && products.length > 0) {
    initProductsAndFilter();
  } else {
    window.addEventListener('productsLoaded', initProductsAndFilter);
  }

  // ==========================================
  // CART SYSTEM
  // ==========================================
  // CART SYSTEM
  // ==========================================

  // Define saveCart early
  window.saveCart = function() {
    localStorage.setItem('benshop_cart', JSON.stringify(window.cart));
  };

  window.cart = JSON.parse(localStorage.getItem('benshop_cart')) || [];
  // Clean old cart items of removed fields
  window.cart.forEach(item => {
    delete item.cartKey;
    delete item.selectedSize;
    delete item.selectedColor;
    delete item.selectedImage;
  });
  window.saveCart();
  
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBadge = document.querySelector('.navbar__cart-badge');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartFooter = document.getElementById('cartFooter');
  
  // Checkout Elements
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutForm = document.getElementById('checkoutForm');
  const confirmOrderBtn = document.getElementById('confirmOrderBtn');

  // Populate wilaya dropdown from API
  const wilayaSelect = document.getElementById('orderWilaya');
  const communeSelect = document.getElementById('orderCommune');
  const communeWrapper = document.getElementById('communeWrapper');
  const deliverySelect = document.getElementById('orderDelivery');
  let wilayasData = [];

  // Calculate delivery fee based on selected wilaya and delivery type
  function getDeliveryFee() {
    if (!wilayaSelect || !deliverySelect) return 0;
    const wilayaVal = wilayaSelect.value;
    const deliveryType = deliverySelect.value;
    if (!wilayaVal || !deliveryType) return 0;
    const wilayaCode = wilayaVal.split(' - ')[0];
    const wilaya = wilayasData.find(w => w.code === wilayaCode);
    if (!wilaya) return 0;
    return deliveryType === 'domicile' ? (wilaya.delivery_home || 0) : (wilaya.delivery_office || 0);
  }

  if (wilayaSelect) {
    Api.getWilayas().then(wilayas => {
      if (Array.isArray(wilayas)) {
        wilayasData = wilayas;
        wilayas.forEach(w => {
          const opt = document.createElement('option');
          opt.value = w.code + ' - ' + w.name;
          opt.textContent = w.code + ' - ' + w.name;
          wilayaSelect.appendChild(opt);
        });
      }
    }).catch(() => {
      wilayaSelect.innerHTML = `<option value="">${t('checkout_wilaya_na')}</option>`;
    });
  }

  // Helper: update commune dropdown visibility and content
  function updateCommuneDropdown() {
    if (!communeWrapper || !communeSelect || !deliverySelect) return;
    const isDomicile = deliverySelect.value === 'domicile';
    const wilayaVal = wilayaSelect ? wilayaSelect.value : '';
    const wilayaCode = wilayaVal.split(' - ')[0];

    if (isDomicile && wilayaCode) {
      // Fetch communes for this wilaya
      communeWrapper.style.display = 'block';
      communeSelect.innerHTML = `<option value="">${t('checkout_commune_ph')}</option>`;
      communeSelect.disabled = true;
      fetch(`/api/wilayas/${wilayaCode}/communes`)
        .then(r => r.json())
        .then(communes => {
          if (Array.isArray(communes)) {
            communes.forEach(c => {
              const opt = document.createElement('option');
              opt.value = c;
              opt.textContent = c;
              communeSelect.appendChild(opt);
            });
          }
          communeSelect.disabled = false;
        })
        .catch(() => {
          communeSelect.innerHTML = `<option value="">${t('checkout_commune_ph')}</option>`;
          communeSelect.disabled = false;
        });
    } else {
      communeWrapper.style.display = 'none';
      communeSelect.value = '';
    }
  }

  // Listen for wilaya change
  if (wilayaSelect) {
    wilayaSelect.addEventListener('change', () => { updateCommuneDropdown(); renderCart(); });
  }
  // Listen for delivery type change
  if (deliverySelect) {
    deliverySelect.addEventListener('change', () => { updateCommuneDropdown(); renderCart(); });
  }

  window.openCart = function() {
    renderCart();
    if (cartDrawer) {
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCart = function() {
    if (cartDrawer) {
      cartDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // addToCart — add directly to cart
  window.addToCart = function(productId) {
    const product = (typeof products !== 'undefined') ? products.find(p => p.id === productId) : null;
    if (!product) {
      window.location.href = 'product.html?id=' + encodeURIComponent(productId);
      return;
    }
    const existingItem = window.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      window.cart.push({ ...product, qty: 1 });
    }
    window.saveCart();
    window.updateCartBadge();
    window.showToast(`${product.name} ${t('cart_added')}`);
    window.openCart();
  };

  window.updateQty = function(id, change) {
    const item = window.cart.find(i => i.id === id);
    if (item) {
      item.qty += change;
      if (item.qty <= 0) {
        window.cart = window.cart.filter(i => i.id !== id);
      }
      window.saveCart();
      renderCart();
      window.updateCartBadge();
    }
  };

  window.removeFromCart = function(id) {
    window.cart = window.cart.filter(i => i.id !== id);
    window.saveCart();
    renderCart();
    window.updateCartBadge();
    showToast(t('cart_remove'), 'error');
  };

  window.updateCartBadge = function() {
    if (!cartBadge) return;
    const totalQty = window.cart.reduce((sum, item) => sum + item.qty, 0);
    cartBadge.textContent = totalQty;
    cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
  };

  function renderCart() {
    if (!cartItemsContainer || !cartFooter) return;
    
    if (window.cart.length === 0) {
      cartItemsContainer.innerHTML = `<div class="cart__empty">${t('cart_empty')}</div>`;
      cartFooter.style.display = 'none';
      return;
    }
    
    cartFooter.style.display = 'block';
    // Preserve checkout form state during re-renders (e.g. when wilaya changes)
    const formVisible = checkoutForm && checkoutForm.style.display !== 'none';
    if (formVisible) {
      if (checkoutBtn) checkoutBtn.style.display = 'none';
    } else {
      if (checkoutForm) checkoutForm.style.display = 'none';
      if (checkoutBtn) checkoutBtn.style.display = 'block';
      if (confirmOrderBtn) confirmOrderBtn.style.display = 'none';
    }
    
    let html = '';
    let total = 0;

    window.cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      const imgSrc = item.image || '';

      html += `
        <div class="cart-item">
          <img src="/${imgSrc}" alt="${esc(item.name)}" class="cart-item__image" loading="lazy" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src=getImageFallback();}">
          <div class="cart-item__details">
            <h4 class="cart-item__name">${esc(item.name)}</h4>
            <div class="cart-item__price">${item.price} ${t('currency')}</div>
            <div class="cart-item__controls">
              <div class="cart-item__qty">
                <button class="cart-item__qty-btn" onclick="updateQty('${esc(item.id)}', -1)">-</button>
                <span class="cart-item__qty-val">${item.qty}</span>
                <button class="cart-item__qty-btn" onclick="updateQty('${esc(item.id)}', 1)">+</button>
              </div>
              <button class="cart-item__remove" onclick="removeFromCart('${esc(item.id)}')"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
        </div>
      `;
    });
    
    cartItemsContainer.innerHTML = html;

    // Calculate and display delivery fee
    const deliveryFee = getDeliveryFee();
    const deliveryValEl = document.getElementById('cartDeliveryVal');
    if (deliveryValEl) {
      if (deliveryFee > 0) {
        const deliveryType = deliverySelect ? deliverySelect.value : '';
        if (deliveryType === 'domicile') {
          deliveryValEl.textContent = t('cart_delivery_home').replace('{fee}', deliveryFee);
        } else if (deliveryType === 'bureau') {
          deliveryValEl.textContent = t('cart_delivery_office').replace('{fee}', deliveryFee);
        } else {
          deliveryValEl.textContent = `${deliveryFee} ${t('currency')}`;
        }
        deliveryValEl.removeAttribute('data-i18n');
      } else {
        deliveryValEl.textContent = t('cart_delivery_calc');
        deliveryValEl.setAttribute('data-i18n', 'cart_delivery_calc');
      }
    }

    const grandTotal = total + deliveryFee;
    if (cartSubtotalEl) cartSubtotalEl.textContent = `${total} ${t('currency')}`;
    if (cartTotalEl) cartTotalEl.textContent = `${grandTotal} ${t('currency')}`;
  }
  
  // Initialize Cart Badge
  updateCartBadge();

  // Checkout Flow
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      checkoutBtn.style.display = 'none';
      checkoutForm.style.display = 'block';
      confirmOrderBtn.style.display = 'block';
      const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
      if (whatsappOrderBtn) whatsappOrderBtn.style.display = 'block';

      // Track checkout start event
      if (typeof trackCheckoutStart === 'function') {
        const total = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        trackCheckoutStart(window.cart, total);
      }
    });
  }

  if (confirmOrderBtn && checkoutForm) {
    confirmOrderBtn.addEventListener('click', async () => {
      const name = document.getElementById('orderName').value.trim();
      const phone = document.getElementById('orderPhone').value.trim();
      const email = document.getElementById('orderEmail') ? document.getElementById('orderEmail').value.trim() : '';
      const wilaya = document.getElementById('orderWilaya').value.trim();
      const delivery = document.getElementById('orderDelivery') ? document.getElementById('orderDelivery').value : '';
      const commune = document.getElementById('orderCommune') ? document.getElementById('orderCommune').value.trim() : '';
      const address = document.getElementById('orderAddress') ? document.getElementById('orderAddress').value.trim() : '';
      const comment = document.getElementById('orderComment') ? document.getElementById('orderComment').value.trim() : '';

      if (!name || !phone || !wilaya || !delivery) {
        showToast(t('checkout_validation'), 'error');
        return;
      }

      if (!address) {
        showToast(t('checkout_address_required'), 'error');
        return;
      }

      const deliveryLabel = delivery === 'domicile' ? t('checkout_delivery_home_label') : t('checkout_delivery_office_label');
      const deliveryFee = getDeliveryFee();

      const items = window.cart.map(item => ({
        productId: item.id,
        productName: item.name,
        productPrice: item.price,
        quantity: item.qty,
      }));

      const subtotal = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      try {
        // Disable button while processing
        confirmOrderBtn.disabled = true;
        confirmOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + t('cart_sending');

        const result = await Api.placeOrder({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || undefined,
          customerWilaya: wilaya,
          customerCommune: commune || undefined,
          customerAddress: address,
          items: items,
          deliveryType: delivery,
          notes: comment || undefined
        });

        if (result.error) {
          showToast(result.error, 'error');
          confirmOrderBtn.disabled = false;
          confirmOrderBtn.innerHTML = t('cart_confirm');
          return;
        }

        // Track purchase event
        if (typeof trackPurchase === 'function') {
          trackPurchase(window.cart, result.total || subtotal, result.id);
        }

        // Clear cart
        window.cart = [];
        window.saveCart();
        renderCart();
        window.updateCartBadge();
        window.closeCart();

        // Show success with order reference
        showOrderSuccess(result.id);

      } catch (err) {
        console.error('Order error:', err);
        showToast(t('order_error'), 'error');
        confirmOrderBtn.disabled = false;
        confirmOrderBtn.innerHTML = t('cart_confirm');
      }
    });
  }

  // WhatsApp order button
  const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
  if (whatsappOrderBtn) {
    whatsappOrderBtn.addEventListener('click', () => {
      const name = document.getElementById('orderName').value.trim();
      const phone = document.getElementById('orderPhone').value.trim();
      const wilaya = document.getElementById('orderWilaya').value.trim();
      const delivery = document.getElementById('orderDelivery') ? document.getElementById('orderDelivery').value : '';
      const commune = document.getElementById('orderCommune') ? document.getElementById('orderCommune').value.trim() : '';
      const address = document.getElementById('orderAddress') ? document.getElementById('orderAddress').value.trim() : '';
      const comment = document.getElementById('orderComment') ? document.getElementById('orderComment').value.trim() : '';

      if (!name || !phone || !wilaya || !delivery) {
        showToast(t('checkout_validation'), 'error');
        return;
      }

      if (!address) {
        showToast(t('checkout_address_required'), 'error');
        return;
      }

      const deliveryLabel = delivery === 'domicile' ? t('checkout_delivery_home_label') : t('checkout_delivery_office_label');
      const deliveryFee = getDeliveryFee();
      const items = window.cart.map(item => {
        return `- ${item.name} x${item.qty} (${item.price} ${t('currency')})`;
      }).join('\n');
      const subtotal = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const grandTotal = subtotal + deliveryFee;

      let text = `${t('wa_order_msg')}\n\n${items}\n\n${t('wa_order_total')}: ${grandTotal} ${t('currency')}`;
      if (deliveryFee > 0) text += ` (${t('cart_delivery')}: ${deliveryFee} ${t('currency')})`;
      text += `\n\n${t('wa_order_name')}: ${name}\n${t('wa_order_phone')}: ${phone}\n${t('wa_order_wilaya')}: ${wilaya}`;
      if (commune) text += `\n${t('checkout_commune')}: ${commune}`;
      text += `\n${t('checkout_address')}: ${address}`;
      text += `\n${t('wa_order_delivery')}: ${deliveryLabel}`;
      if (comment) text += `\n${t('wa_order_comment')}: ${comment}`;
      const url = `https://wa.me/${WHATSAPP_ORDERS}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
  }

  // ==========================================
  // SEARCH OVERLAY SYSTEM
  // ==========================================
  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  window.openSearch = function() {
    if (searchModal) {
      searchModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { if (searchInput) searchInput.focus(); }, 100);
    }
  };

  window.closeSearch = function() {
    if (searchModal) {
      searchModal.classList.remove('active');
      document.body.style.overflow = '';
      if (searchInput) {
        searchInput.value = '';
        renderSearchResults('');
      }
    }
  };

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
      closeCart();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value.trim().toLowerCase());
    });
  }

  function renderSearchResults(query) {
    if (!searchResults) return;
    if (!query) {
      searchResults.innerHTML = `<div class="search-empty">${t('search_empty')}</div>`;
      return;
    }

    if (typeof products === 'undefined') return;

    const results = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      (p.desc && p.desc.toLowerCase().includes(query))
    );

    if (results.length === 0) {
      searchResults.innerHTML = `<div class="search-empty">${t('search_no_results')} "${esc(query)}"</div>`;
      return;
    }

    let html = '';
    results.slice(0, 5).forEach(product => {
      html += `
        <div class="search-result-item" onclick="window.location.href='product.html?id=${esc(product.id)}'; closeSearch();">
          <img src="/${product.image || ''}" alt="${esc(product.name)}" class="search-result-image" loading="lazy" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src=getImageFallback();}">
          <div class="search-result-info">
            <div class="search-result-name">${esc(product.name)}</div>
            <div class="search-result-price">${product.price} ${t('currency')}</div>
          </div>
          <button style="background:var(--color-accent);color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      `;
    });
    
    if (results.length > 5) {
      html += `<div style="text-align:center;font-size:12px;color:var(--color-gray-500);padding-top:10px;">${t('search_more').replace('{count}', results.length - 5)}</div>`;
    }

    searchResults.innerHTML = html;
  }

  // ==========================================
  // MOBILE APP-LIKE UI (Phase 11)
  // ==========================================
  const mobileNavHTML = `
    <nav class="mobile-nav" id="mobileNav">
      <a href="index.html" class="mobile-nav__btn ${window.location.pathname.includes('index.html') || window.location.pathname === '/' ? 'active' : ''}">
        <i class="fas fa-home"></i>
        <span data-i18n="mobile_home">${t('mobile_home')}</span>
      </a>
      <button class="mobile-nav__btn" id="mobileSearchBtn">
        <i class="fas fa-search"></i>
        <span data-i18n="mobile_search">${t('mobile_search')}</span>
      </button>
      <button class="mobile-nav__btn" id="mobileCartBtn">
        <i class="fas fa-shopping-bag"></i>
        <span data-i18n="mobile_cart">${t('mobile_cart')}</span>
        <span class="mobile-nav__badge" id="mobileCartBadge" style="display:none;">0</span>
      </button>
      <button class="mobile-nav__btn" id="mobileAccountBtn">
        <i class="fas fa-phone"></i>
        <span data-i18n="mobile_contact">${t('mobile_contact')}</span>
      </button>
    </nav>
  `;
  document.body.insertAdjacentHTML('beforeend', mobileNavHTML);

  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const mobileCartBtn = document.getElementById('mobileCartBtn');
  const mobileAccountBtn = document.getElementById('mobileAccountBtn');

  if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', window.openSearch);
  if (mobileCartBtn) mobileCartBtn.addEventListener('click', window.openCart);
  if (mobileAccountBtn) {
    mobileAccountBtn.addEventListener('click', () => {
      window.location.href = 'contact.html';
    });
  }

  // Hook into updateCartBadge to update mobile badge
  const originalUpdateBadge = window.updateCartBadge;
  window.updateCartBadge = function() {
    originalUpdateBadge();
    const mbBadge = document.getElementById('mobileCartBadge');
    if (mbBadge) {
      const totalQty = window.cart.reduce((sum, item) => sum + item.qty, 0);
      mbBadge.textContent = totalQty;
      mbBadge.style.display = totalQty > 0 ? 'flex' : 'none';
    }
  };
  window.updateCartBadge(); // init

  // Add Haptic feedback to addToCart
  const originalAddToCart = window.addToCart;
  window.addToCart = function(productId) {
    if (navigator.vibrate) navigator.vibrate(50);
    originalAddToCart(productId);
  };

  // Touch Swipe Gestures for Cart
  const cartDrawerEl = document.getElementById('cartDrawer');
  let touchStartX = 0;
  let touchEndX = 0;

  if (cartDrawerEl) {
    cartDrawerEl.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    cartDrawerEl.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, {passive: true});
  }

  function handleSwipe() {
    // Swipe right to close cart (cart comes from right)
    if (touchEndX - touchStartX > 50) {
      window.closeCart();
    }
  }

  // Swipe Gestures for Nav Menu (comes from left, swipe left to close)
  const navMenuEl = document.getElementById('navMenu');
  let navTouchStartX = 0;
  let navTouchEndX = 0;

  if (navMenuEl) {
    navMenuEl.addEventListener('touchstart', e => {
      navTouchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    navMenuEl.addEventListener('touchend', e => {
      navTouchEndX = e.changedTouches[0].screenX;
      handleNavSwipe();
    }, {passive: true});
  }

  function handleNavSwipe() {
    if (navTouchStartX - navTouchEndX > 50) {
      const navToggle = document.getElementById('navToggle');
      const navOverlay = document.getElementById('navOverlay');
      if (navToggle) navToggle.classList.remove('active');
      navMenuEl.classList.remove('open');
      if (navOverlay) navOverlay.classList.remove('visible');
      document.body.style.overflow = '';
    }
  }

  // ==========================================
  // GLOBAL IMAGE ERROR HANDLER
  // ==========================================
  // Fallback placeholder: gray SVG with image icon
  function getImageFallback() {
    const label = (typeof t === 'function' && t('image_unavailable')) || 'Image unavailable';
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#e0e0e0" width="400" height="300"/><text fill="#999" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`);
  }
  // Expose globally for inline event handlers in template literals
  window.getImageFallback = getImageFallback;

  function handleImageError(e) {
    const img = e.target;
    // Prevent infinite loop if fallback also fails
    if (img.dataset.fallbackApplied) {
      return;
    }
    img.dataset.fallbackApplied = 'true';
    img.src = getImageFallback();
  }

  // Apply error handler to all images on the page
  function initImageErrorHandlers() {
    document.querySelectorAll('img').forEach(img => {
      // Only attach if not already handled
      if (!img.dataset.errorHandlerInit) {
        img.dataset.errorHandlerInit = 'true';
        img.addEventListener('error', handleImageError);
      }
    });
  }

  // Run immediately for static images
  initImageErrorHandlers();

  // Re-run after dynamic content renders ( MutationObserver for future dynamic images )
  const imageObserver = new MutationObserver(() => {
    initImageErrorHandlers();
  });
  imageObserver.observe(document.body, { childList: true, subtree: true });

  // ==========================================
  // SCROLL TO TOP BUTTON
  // ==========================================
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.className = 'scroll-to-top';
  scrollTopBtn.setAttribute('aria-label', t('scroll_to_top'));
  scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  document.body.appendChild(scrollTopBtn);

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  // ==========================================
  // FLOATING WHATSAPP BUTTON (MOBILE)
  // ==========================================
  const floatingWaBtn = document.createElement('a');
  floatingWaBtn.href = `https://wa.me/${WHATSAPP_ORDERS}?text=${encodeURIComponent(t('wa_chat_msg'))}`;
  floatingWaBtn.target = '_blank';
  floatingWaBtn.rel = 'noopener noreferrer';
  floatingWaBtn.className = 'floating-whatsapp-btn';
  floatingWaBtn.setAttribute('aria-label', t('wa_chat_aria'));
  floatingWaBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
  floatingWaBtn.style.cssText = 'position:fixed;bottom:90px;right:20px;width:56px;height:56px;background:#25D366;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,0.2);text-decoration:none;transition:transform 0.2s;';
  document.body.appendChild(floatingWaBtn);
  floatingWaBtn.addEventListener('mouseenter', () => floatingWaBtn.style.transform = 'scale(1.1)');
  floatingWaBtn.addEventListener('mouseleave', () => floatingWaBtn.style.transform = 'scale(1)');

  // ==========================================
  // PRODUCT PAGE — WHATSAPP CLICK-TO-CHAT
  // ==========================================
  const productDetailContainer = document.getElementById('productDetailContainer');

  // ==========================================
  // COOKIE CONSENT BANNER
  // ==========================================
  if (!localStorage.getItem('benshop_cookie_consent')) {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <p class="cookie-banner__text">${t('cookie_banner_text')}</p>
      <div class="cookie-banner__actions">
        <button class="cookie-banner__btn cookie-banner__btn--accept" id="cookieAccept">${t('cookie_accept')}</button>
        <button class="cookie-banner__btn cookie-banner__btn--decline" id="cookieDecline">${t('cookie_decline')}</button>
      </div>
    `;
    document.body.appendChild(banner);

    // Trigger slide-up animation after a frame so the display:none -> flex transition works
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        banner.classList.add('visible');
      });
    });

    document.getElementById('cookieAccept').addEventListener('click', () => {
      localStorage.setItem('benshop_cookie_consent', 'accepted');
      banner.classList.remove('visible');
      // Wait for transition to finish before removing
      banner.addEventListener('transitionend', () => banner.remove());
    });

    document.getElementById('cookieDecline').addEventListener('click', () => {
      localStorage.setItem('benshop_cookie_consent', 'declined');
      banner.classList.remove('visible');
      banner.addEventListener('transitionend', () => banner.remove());
    });
  }
});
