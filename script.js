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
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  };

  // ==========================================
  // DYNAMIC PRODUCT UI INJECTION
  // ==========================================
  if (typeof products !== 'undefined') {
    document.querySelectorAll('.product-card').forEach(card => {
      const nameEl = card.querySelector('.product-card__name');
      if (!nameEl) return;
      const productName = nameEl.textContent.trim();
      const product = products.find(p => p.name === productName);
      
      if (product) {
        card.dataset.id = product.id;
        
        // Make the whole card clickable
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          window.location.href = `product.html?id=${product.id}`;
        });
        
        // Inject Add to Cart Button
        const imgWrapper = card.querySelector('.product-card__image-wrapper');
        const addBtn = document.createElement('button');
        addBtn.className = 'product-card__add-cart-btn';
        addBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Ajouter au panier';
        addBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          addToCart(product.id);
        };
        imgWrapper.appendChild(addBtn);
      }
    });

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
          pdImage.src = product.image;
          pdImage.alt = product.name;
        }
        
        const pdName = document.getElementById('pdName');
        if (pdName) pdName.textContent = product.name;
        
        const pdPrice = document.getElementById('pdPrice');
        if (pdPrice) pdPrice.textContent = product.price + ' DA';
        
        const pdDesc = document.getElementById('pdDesc');
        if (pdDesc) pdDesc.textContent = product.desc || "Découvrez la qualité Ikherbane avec nos chaussettes fabriquées en Algérie. Confortables, durables et élégantes, elles sont conçues pour un usage quotidien tout en préservant le bien-être de vos pieds.";
        
        const pdCatLink = document.getElementById('pdCatLink');
        if (pdCatLink) {
          const catLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);
          pdCatLink.textContent = catLabel;
          pdCatLink.href = `catalog.html?cat=${product.category}`;
        }
        
        const pdCrumbName = document.getElementById('pdCrumbName');
        if (pdCrumbName) pdCrumbName.textContent = product.name;

        document.title = `${product.name} — Ikherbane Chaussettes`;

        let detailQty = 1;
        const pdQtyMinus = document.getElementById('pdQtyMinus');
        const pdQtyPlus = document.getElementById('pdQtyPlus');
        const pdQtyVal = document.getElementById('pdQtyVal');
        const pdAddBtn = document.getElementById('pdAddBtn');

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
            window.showToast(`${detailQty}x ${product.name} ajouté au panier`);
            window.openCart();
          });
        }

      } else {
        const productError = document.getElementById('productError');
        if (productError) productError.style.display = 'block';
      }
    }
  }

  // ==========================================
  // CART SYSTEM
  // ==========================================
  window.cart = JSON.parse(localStorage.getItem('ikherbane_cart')) || [];
  
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

  window.addToCart = function(productId) {
    if (typeof products === 'undefined') return;
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = window.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      window.cart.push({ ...product, qty: 1 });
    }
    
    window.saveCart();
    window.updateCartBadge();
    showToast(`${product.name} ajouté au panier`);
    window.openCart();
  };

  window.updateQty = function(productId, change) {
    const item = window.cart.find(i => i.id === productId);
    if (item) {
      item.qty += change;
      if (item.qty <= 0) {
        window.cart = window.cart.filter(i => i.id !== productId);
      }
      window.saveCart();
      renderCart();
      window.updateCartBadge();
    }
  };

  window.removeFromCart = function(productId) {
    window.cart = window.cart.filter(i => i.id !== productId);
    window.saveCart();
    renderCart();
    window.updateCartBadge();
    showToast('Produit retiré du panier', 'error');
  };

  window.saveCart = function() {
    localStorage.setItem('ikherbane_cart', JSON.stringify(window.cart));
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
      cartItemsContainer.innerHTML = '<div class="cart__empty">Votre panier est vide.</div>';
      cartFooter.style.display = 'none';
      return;
    }
    
    cartFooter.style.display = 'block';
    if (checkoutForm) checkoutForm.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'block';
    if (confirmOrderBtn) confirmOrderBtn.style.display = 'none';
    
    let html = '';
    let total = 0;
    
    window.cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      html += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item__image">
          <div class="cart-item__details">
            <h4 class="cart-item__name">${item.name}</h4>
            <div class="cart-item__price">${item.price} DA</div>
            <div class="cart-item__controls">
              <div class="cart-item__qty">
                <button class="cart-item__qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                <span class="cart-item__qty-val">${item.qty}</span>
                <button class="cart-item__qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
              </div>
              <button class="cart-item__remove" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
        </div>
      `;
    });
    
    cartItemsContainer.innerHTML = html;
    if (cartSubtotalEl) cartSubtotalEl.textContent = `${total} DA`;
    if (cartTotalEl) cartTotalEl.textContent = `${total} DA`; 
  }
  
  // Initialize Cart Badge
  updateCartBadge();

  // Checkout Flow
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      checkoutBtn.style.display = 'none';
      checkoutForm.style.display = 'block';
      confirmOrderBtn.style.display = 'block';
    });
  }

  if (confirmOrderBtn && checkoutForm) {
    confirmOrderBtn.addEventListener('click', () => {
      const name = document.getElementById('orderName').value;
      const phone = document.getElementById('orderPhone').value;
      const wilaya = document.getElementById('orderWilaya').value;
      const address = document.getElementById('orderAddress').value;

      if (!name || !phone || !wilaya || !address) {
        showToast('Veuillez remplir tous les champs de livraison.', 'error');
        return;
      }

      let orderText = `*NOUVELLE COMMANDE IKHERBANE*%0A`;
      orderText += `----------------------%0A`;
      orderText += `*Client:* ${name}%0A`;
      orderText += `*Téléphone:* ${phone}%0A`;
      orderText += `*Wilaya:* ${wilaya}%0A`;
      orderText += `*Adresse:* ${address}%0A`;
      orderText += `----------------------%0A`;
      
      let total = 0;
      window.cart.forEach(item => {
        orderText += `- ${item.qty}x ${item.name} (${item.price * item.qty} DA)%0A`;
        total += (item.price * item.qty);
      });
      orderText += `----------------------%0A`;
      orderText += `*TOTAL COMMANDE: ${total} DA*%0A`;

      // Admin phone number
      const adminPhone = "213696409537"; 
      window.open(`https://wa.me/${adminPhone}?text=${orderText}`, '_blank');
      
      // Clear cart
      window.cart = [];
      window.saveCart();
      renderCart();
      window.updateCartBadge();
      window.closeCart();
      showToast('Redirection vers WhatsApp...', 'success');
    });
  }

  // ==========================================
  // AUTH SYSTEM
  // ==========================================
  let currentUser = JSON.parse(localStorage.getItem('ikherbane_user'));
  let authMode = 'login'; 

  const authOverlay = document.getElementById('authModal');
  const accountBtn = document.getElementById('accountBtn');
  const closeAuthBtn = document.getElementById('closeAuthBtn');
  const accountDropdown = document.getElementById('accountDropdown');
  
  const authForm = document.getElementById('authForm');
  const authTitle = document.getElementById('authTitle');
  const nameGroup = document.getElementById('nameGroup');
  const authSwitchBtn = document.getElementById('authSwitchBtn');
  const authSwitchText = document.getElementById('authSwitchText');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const accLogout = document.getElementById('accLogout');

  function updateAuthUI() {
    if (!accountBtn) return;
    if (currentUser) {
      accountBtn.innerHTML = '<i class="fas fa-user-check" style="color: var(--color-accent)"></i>';
      if (document.getElementById('accDropName')) document.getElementById('accDropName').textContent = currentUser.name;
      if (document.getElementById('accDropEmail')) document.getElementById('accDropEmail').textContent = currentUser.email;
    } else {
      accountBtn.innerHTML = '<i class="fas fa-user"></i>';
      if (accountDropdown) accountDropdown.style.display = 'none';
    }
  }

  if (accountBtn) {
    accountBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentUser) {
        if (accountDropdown) accountDropdown.style.display = accountDropdown.style.display === 'block' ? 'none' : 'block';
      } else {
        if (authOverlay) authOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (accountDropdown && accountBtn && !accountDropdown.contains(e.target) && !accountBtn.contains(e.target)) {
      accountDropdown.style.display = 'none';
    }
  });

  if (closeAuthBtn && authOverlay) {
    closeAuthBtn.addEventListener('click', () => {
      authOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (authSwitchBtn) {
    authSwitchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (authMode === 'login') {
        authMode = 'register';
        if (authTitle) authTitle.textContent = 'Inscription';
        if (nameGroup) nameGroup.style.display = 'flex';
        const navEl = document.getElementById('authName');
        if (navEl) navEl.setAttribute('required', 'true');
        if (authSubmitBtn) authSubmitBtn.textContent = "S'inscrire";
        if (authSwitchText) authSwitchText.textContent = "Déjà un compte ?";
        if (authSwitchBtn) authSwitchBtn.textContent = "Se connecter";
      } else {
        authMode = 'login';
        if (authTitle) authTitle.textContent = 'Connexion';
        if (nameGroup) nameGroup.style.display = 'none';
        const navEl = document.getElementById('authName');
        if (navEl) navEl.removeAttribute('required');
        if (authSubmitBtn) authSubmitBtn.textContent = "Se connecter";
        if (authSwitchText) authSwitchText.textContent = "Pas encore de compte ?";
        if (authSwitchBtn) authSwitchBtn.textContent = "S'inscrire";
      }
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmail').value;
      
      if (authMode === 'register') {
        const name = document.getElementById('authName').value;
        currentUser = { name, email };
        showToast('Inscription réussie ! Bienvenue ' + name);
      } else {
        currentUser = { name: "Client Ikherbane", email };
        showToast('Connexion réussie !');
      }
      
      localStorage.setItem('ikherbane_user', JSON.stringify(currentUser));
      updateAuthUI();
      if (authOverlay) authOverlay.classList.remove('active');
      document.body.style.overflow = '';
      authForm.reset();
    });
  }

  if (accLogout) {
    accLogout.addEventListener('click', (e) => {
      e.preventDefault();
      currentUser = null;
      localStorage.removeItem('ikherbane_user');
      updateAuthUI();
      if (accountDropdown) accountDropdown.style.display = 'none';
      showToast('Vous êtes déconnecté', 'success');
    });
  }

  updateAuthUI();

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
      if (authOverlay) {
        authOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
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
      searchResults.innerHTML = '<div class="search-empty">Commencez à taper pour rechercher.</div>';
      return;
    }

    if (typeof products === 'undefined') return;

    const results = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      (p.desc && p.desc.toLowerCase().includes(query))
    );

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">Aucun résultat trouvé pour "' + query + '".</div>';
      return;
    }

    let html = '';
    results.slice(0, 5).forEach(product => { 
      html += `
        <div class="search-result-item" onclick="addToCart('${product.id}'); closeSearch();">
          <img src="${product.image}" alt="${product.name}" class="search-result-image">
          <div class="search-result-info">
            <div class="search-result-name">${product.name}</div>
            <div class="search-result-price">${product.price} DA</div>
          </div>
          <button style="background:var(--color-accent);color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      `;
    });
    
    if (results.length > 5) {
      html += `<div style="text-align:center;font-size:12px;color:var(--color-gray-500);padding-top:10px;">Et ${results.length - 5} autres produits...</div>`;
    }

    searchResults.innerHTML = html;
  }
});
