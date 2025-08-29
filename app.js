(function () {
  const products = [
    {
      id: 1,
      name: "Blue Runner Sneakers",
      category: "Shoes",
    
      images: [
        "images/img1.png",
        "image/2.jpg",
        "image/3.jpg"
      ],
      description: "Lightweight running sneakers with breathable mesh upper and cushioned sole."
    },
    {
      id: 2,
      name: "Sunshine Hoodie",
      category: "Apparel",
      
      images: [
        "images/img2.png",
      ],
      description: "Cozy fleece hoodie in a bold yellow tone with a relaxed fit."
    },
    {
      id: 3,
      name: "Ocean Wave Watch",
      category: "Accessories",
      price: 129.99,
      images: [
        "images/img3.jpg",
      ],
      description: "Minimal blue dial watch with stainless steel strap and water resistance."
    },
    {
      id: 4,
      name: "City Backpack",
      category: "Bags",
      price: 72.5,
      images: [
       "images/img4.jpg",
      ],
      description: "Everyday backpack with padded laptop sleeve and multiple pockets."
    },
    {
      id: 5,
      name: "Studio Headphones",
      category: "Electronics",
      price: 149.99,
      images: [
        "images/img5.jpg",
      ],
      description: "Over-ear headphones with deep bass and noise isolation."
    },
    {
      id: 6,
      name: "Azure Tee",
      category: "Apparel",
      price: 24.99,
      images: [
       "images/img6.jpg",
      ],
      description: "Soft cotton t-shirt in azure blue, perfect for everyday wear."
    },
    {
      id: 7,
      name: "Trail Water Bottle",
      category: "Outdoors",
      price: 18.5,
      images: [
        "images/img7.jpg",
      ],
      description: "Insulated stainless steel bottle keeps drinks cold or hot for hours."
    },
    {
      id: 8,
      name: "Golden Baseball Cap",
      category: "Accessories",
      price: 21.0,
      images: [
        "images/img8.jpg",
      ],
      description: "Classic cap in golden yellow with adjustable strap."
    },
    {
      id: 9,
      name: "Desk Lamp",
      category: "Home",
      price: 34.99,
      images: [
        "images/img9.jpg",
      ],
      description: "Sleek LED desk lamp with dimmable brightness and adjustable neck."
    },
    {
      id: 10,
      name: "Wave Mouse",
      category: "Electronics",
      price: 29.99,
      images: [
        "images/img10.jpg",
      ],
      description: "Ergonomic wireless mouse with silent clicks and blue accent."
    }
  ];

  const els = {
    grid: document.getElementById("productsGrid"),
    search: document.getElementById("searchInput"),
    category: document.getElementById("categorySelect"),
    count: document.getElementById("resultsCount"),
    modal: document.getElementById("productModal"),
    modalImg: document.getElementById("modalImage"),
    modalTitle: document.getElementById("modalTitle"),
    modalCategory: document.getElementById("modalCategory"),
    modalPrice: document.getElementById("modalPrice"),
    modalDesc: document.getElementById("modalDescription"),
    modalAction: document.getElementById("modalAction"),
    year: document.getElementById("year"),
    categoryModal: document.getElementById("categoryModal"),
    categoryModalTitle: document.getElementById("categoryModalTitle"),
    categoryModalDesc: document.getElementById("categoryModalDesc"),
    categoryProductsGrid: document.getElementById("categoryProductsGrid"),
    hero: {
      track: document.getElementById("heroTrack"),
      dots: document.getElementById("heroDots"),
      prev: document.getElementById("heroPrev"),
      next: document.getElementById("heroNext"),
    },
    offers: {
      track: document.getElementById("offersTrack"),
      prev: document.getElementById("offersPrev"),
      next: document.getElementById("offersNext"),
    },
    featured: {
      track: document.getElementById("featuredTrack"),
      prev: document.getElementById("featuredPrev"),
      next: document.getElementById("featuredNext"),
    }
  };

  let current = [...products];
  let activeCategory = "all";

  function formatPrice(value) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
  }

  function populateCategories() {
    const categories = Array.from(new Set(products.map(p => p.category))).sort();
    const frag = document.createDocumentFragment();
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      frag.appendChild(opt);
    });
    els.category.appendChild(frag);
  }

  function applyFilters() {
    const q = els.search.value.trim().toLowerCase();
    const list = products.filter(p => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q);
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
    current = list;
    render(current);
  }

  function render(productsToRender) {
    els.grid.innerHTML = "";
    const frag = document.createDocumentFragment();
    productsToRender.forEach(p => {
      const card = document.createElement("article");
      card.className = "card";
      card.setAttribute("role", "listitem");
      card.setAttribute("data-id", String(p.id));
      card.setAttribute("title", p.name);
      const placeholder = 'assets/images/placeholder.svg';
      const externalThumb = (Array.isArray(p.images) && p.images.length ? p.images[p.images.length - 1] : placeholder) || placeholder;
      const firstImage = (Array.isArray(p.images) && p.images.length ? p.images[0] : externalThumb) || placeholder;
      card.innerHTML = `
        <div class="card-media">
          <img src="${firstImage}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${externalThumb}';" />
        </div>
        <div class="card-body">
          <h3 class="card-title">${p.name}</h3>
        </div>
      `;
      frag.appendChild(card);
    });
    els.grid.appendChild(frag);
    els.count.textContent = `${productsToRender.length} item${productsToRender.length === 1 ? "" : "s"}`;
  }

  let currentSlideIndex = 0;
  function withLocalFallbacks(product) {
    const local = (product.images || []).map((_, idx) => `assets/images/p${product.id}-${idx + 1}.jpg`);
    // Interleave local-first then external as fallback by listening for error events where used
    // Here we simply return pair arrays [primarySrc, fallbackSrc]
    return (product.images || []).map((external, idx) => ({ primary: local[idx], fallback: external }));
  }

  // Allow users to pick a folder of images and map them to products
  const folderInput = document.getElementById("imagesFolder");
  if (folderInput) {
    folderInput.addEventListener("change", () => {
      const files = Array.from(folderInput.files || []);
      // Build a quick map of lowercase names to object URLs
      const nameToUrl = new Map();
      files.forEach(f => {
        const url = URL.createObjectURL(f);
        nameToUrl.set(f.name.toLowerCase(), url);
      });
      // For each product, attempt to attach local images matching patterns p{id}-1.*, p{id}-2.* etc
      products.forEach(p => {
        const newLocals = [];
        for (let i = 1; i <= 6; i++) {
          const keyJpg = `p${p.id}-${i}.jpg`;
          const keyPng = `p${p.id}-${i}.png`;
          const keyWebp = `p${p.id}-${i}.webp`;
          const found = nameToUrl.get(keyJpg) || nameToUrl.get(keyPng) || nameToUrl.get(keyWebp);
          if (found) newLocals.push(found);
        }
        if (newLocals.length) {
          // Prepend locals to the start, keep externals as fallback order
          p.images = [...newLocals, ...(p.images || [])];
        }
      });
      applyFilters();
    });
  }

  function buildSlider(imagesOrPairs) {
    const track = document.getElementById("sliderTrack");
    const dots = document.getElementById("sliderDots");
    track.innerHTML = "";
    dots.innerHTML = "";
    const frag = document.createDocumentFragment();
    imagesOrPairs.forEach((srcOrPair) => {
      const src = typeof srcOrPair === "string" ? srcOrPair : srcOrPair.primary;
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      if (typeof srcOrPair !== "string") {
        img.addEventListener("error", () => {
          if (img.dataset.fallbackApplied === "true") return;
          img.dataset.fallbackApplied = "true";
          img.src = srcOrPair.fallback;
        }, { once: true });
      }
      frag.appendChild(img);
    });
    track.appendChild(frag);
    const dotsFrag = document.createDocumentFragment();
    const count = Array.isArray(imagesOrPairs) ? imagesOrPairs.length : 0;
    for (let i = 0; i < count; i++) {
      const b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.addEventListener("click", () => goToSlide(i, count));
      dotsFrag.appendChild(b);
    }
    dots.appendChild(dotsFrag);
    currentSlideIndex = 0;
    updateSlider(0, count);
  }

  function updateSlider(index, total) {
    const track = document.getElementById("sliderTrack");
    const dots = Array.from(document.getElementById("sliderDots").children);
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.setAttribute("aria-selected", i === index ? "true" : "false"));
  }

  function goToSlide(index, total) {
    currentSlideIndex = (index + total) % total;
    updateSlider(currentSlideIndex, total);
  }

  function openModal(product) {
    els.modalTitle.textContent = product.name;
    els.modalCategory.textContent = product.category;
    els.modalPrice.textContent = formatPrice(product.price);
    els.modalDesc.textContent = product.description;
    const hasLocal = (product.images || []).some(src => typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('assets/')));
    const images = product.images && product.images.length ? (hasLocal ? product.images : withLocalFallbacks(product)) : [];
    buildSlider(images);
    els.modal.setAttribute("data-open", "true");
    els.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    els.modal.removeAttribute("data-open");
    els.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove('modal-open');
  }

  function openCategoryModal(title, description, categoryFilter) {
    els.categoryModalTitle.textContent = title;
    els.categoryModalDesc.textContent = description;

    // Filter products by category
    const filteredProducts = products.filter(p => {
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'offers') return p.price < 50; // Show products under $50 for offers
      if (categoryFilter === 'featured') return p.id <= 6; // Show first 6 products for featured
      return p.category === categoryFilter;
    });

    // Render products in the category modal
    els.categoryProductsGrid.innerHTML = "";
    const frag = document.createDocumentFragment();
    filteredProducts.forEach(p => {
      const card = document.createElement("article");
      card.className = "category-product-card";
      card.setAttribute("data-id", String(p.id));
      card.setAttribute("title", p.name);
      const placeholder = 'assets/images/placeholder.svg';
      const firstImage = (Array.isArray(p.images) && p.images.length ? p.images[0] : placeholder) || placeholder;
      card.innerHTML = `
        <div class="category-product-card__image">
          <img src="${firstImage}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${placeholder}';" />
        </div>
        <div class="category-product-card__content">
          <h4>${p.name}</h4>
          <div class="price">${formatPrice(p.price)}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        const product = products.find(prod => prod.id === p.id);
        if (product) {
          closeCategoryModal();
          openModal(product);
        }
      });
      frag.appendChild(card);
    });
    els.categoryProductsGrid.appendChild(frag);

    els.categoryModal.setAttribute("data-open", "true");
    els.categoryModal.setAttribute("aria-hidden", "false");
    document.body.classList.add('modal-open');
  }

  function closeCategoryModal() {
    els.categoryModal.removeAttribute("data-open");
    els.categoryModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove('modal-open');
  }

  function onSearch() { applyFilters(); }
  function onCategory(e) { activeCategory = e.target.value; applyFilters(); }

  // Events (guarded)
  if (els.search) els.search.addEventListener("input", onSearch);
  if (els.category) els.category.addEventListener("change", onCategory);
  if (els.grid) els.grid.addEventListener("click", (e) => {
    let node = e.target;
    if (!node) return;
    if (node.closest) {
      const card = node.closest(".card");
      if (card && card.hasAttribute("data-id")) {
        const id = Number(card.getAttribute("data-id"));
        const product = products.find(p => p.id === id);
        if (product) openModal(product);
      }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
    const product = products.find(p => p.name === els.modalTitle.textContent);
    const total = product && product.images ? product.images.length : 0;
    if (!total) return;
    if (e.key === "ArrowRight") goToSlide(currentSlideIndex + 1, total);
    if (e.key === "ArrowLeft") goToSlide(currentSlideIndex - 1, total);
  });
  els.modal.addEventListener("click", (e) => {
    const target = e.target;
    if (target && (target.hasAttribute("data-close") || target.classList.contains("modal-backdrop"))) {
      closeModal();
    }
  });

  els.categoryModal.addEventListener("click", (e) => {
    const target = e.target;
    if (target && (target.hasAttribute("data-close") || target.classList.contains("modal-backdrop"))) {
      closeCategoryModal();
    }
  });

  // Slider buttons
  const sliderNextBtn = document.getElementById("sliderNext");
  const sliderPrevBtn = document.getElementById("sliderPrev");
  if (sliderNextBtn) sliderNextBtn.addEventListener("click", () => {
    const product = products.find(p => p.name === els.modalTitle.textContent);
    if (!product || !product.images) return;
    goToSlide(currentSlideIndex + 1, product.images.length);
  });
  if (sliderPrevBtn) sliderPrevBtn.addEventListener("click", () => {
    const product = products.find(p => p.name === els.modalTitle.textContent);
    if (!product || !product.images) return;
    goToSlide(currentSlideIndex - 1, product.images.length);
  });

  // Hero slider
  let heroIndex = 0;
  function updateHero(index) {
    const slides = els.hero.track.children.length;
    heroIndex = (index + slides) % slides;
    els.hero.track.style.transform = `translateX(${-heroIndex * 100}%)`;
    Array.from(els.hero.dots.children).forEach((d, i) => d.setAttribute("aria-selected", i === heroIndex ? "true" : "false"));
  }
  function buildHeroDots() {
    const count = els.hero.track.children.length;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.addEventListener("click", () => updateHero(i));
      frag.appendChild(b);
    }
    els.hero.dots.innerHTML = "";
    els.hero.dots.appendChild(frag);
  }
  function startHeroAutoplay() {
    setInterval(() => updateHero(heroIndex + 1), 5000);
  }
  if (els.hero.track) {
    buildHeroDots();
    els.hero.prev.addEventListener("click", () => updateHero(heroIndex - 1));
    els.hero.next.addEventListener("click", () => updateHero(heroIndex + 1));
    startHeroAutoplay();

    // Add click handlers to hero slides
    const heroSlides = els.hero.track.children;
    heroSlides[0].addEventListener("click", () => openCategoryModal("Summer Collection", "Bright yellow picks with blue-blooded prices. Up to 40% off.", "offers"));
    heroSlides[1].addEventListener("click", () => openCategoryModal("Fresh Arrivals", "New sneakers, tees, and accessories—curated in our signature colors.", "featured"));
    heroSlides[2].addEventListener("click", () => openCategoryModal("Member Perks", "Free shipping and early access launches for subscribers.", "all"));
  }

  // Offers slider
  let offersIndex = 0;
  function updateOffers(index) {
    const cards = els.offers.track.children.length;
    offersIndex = (index + cards) % cards;
    const translateX = -offersIndex * (300 + 16); // card width + gap
    els.offers.track.style.transform = `translateX(${translateX}px)`;
  }
  if (els.offers.track) {
    els.offers.prev.addEventListener("click", () => updateOffers(offersIndex - 1));
    els.offers.next.addEventListener("click", () => updateOffers(offersIndex + 1));

    // Add click handlers to offer cards
    const offerCards = els.offers.track.children;
    offerCards[0].addEventListener("click", () => openCategoryModal("Summer Collection", "Bright yellow picks with blue-blooded prices", "offers"));
    offerCards[1].addEventListener("click", () => openCategoryModal("Fresh Arrivals", "Latest sneakers and accessories", "featured"));
    offerCards[2].addEventListener("click", () => openCategoryModal("Member Exclusive", "Free shipping on all orders", "all"));
  }

  // Featured products slider
  let featuredIndex = 0;
  function updateFeatured(index) {
    const cards = els.featured.track.children.length;
    featuredIndex = (index + cards) % cards;
    const translateX = -featuredIndex * (250 + 16); // card width + gap
    els.featured.track.style.transform = `translateX(${translateX}px)`;
  }
  function renderFeaturedProducts() {
    if (!els.featured.track) return;
    const featuredProducts = products.slice(0, 6); // Show first 6 products
    els.featured.track.innerHTML = "";
    const frag = document.createDocumentFragment();
    featuredProducts.forEach(p => {
      const card = document.createElement("article");
      card.className = "featured-card";
      card.setAttribute("data-id", String(p.id));
      card.setAttribute("title", p.name);
      const placeholder = 'assets/images/placeholder.svg';
      const firstImage = (Array.isArray(p.images) && p.images.length ? p.images[0] : placeholder) || placeholder;
      card.innerHTML = `
        <div class="featured-card__image">
          <img src="${firstImage}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${placeholder}';" />
        </div>
        <div class="featured-card__content">
          <h3>${p.name}</h3>
          <div class="price">${formatPrice(p.price)}</div>
        </div>
      `;
      card.addEventListener("click", () => {
        const product = products.find(prod => prod.id === p.id);
        if (product) openModal(product);
      });
      frag.appendChild(card);
    });
    els.featured.track.appendChild(frag);
  }
  if (els.featured.track) {
    renderFeaturedProducts();
    els.featured.prev.addEventListener("click", () => updateFeatured(featuredIndex - 1));
    els.featured.next.addEventListener("click", () => updateFeatured(featuredIndex + 1));

    // Add click handler to featured section title
    const featuredHeading = document.getElementById("featuredHeading");
    if (featuredHeading) {
      featuredHeading.style.cursor = "pointer";
      featuredHeading.addEventListener("click", () => openCategoryModal("Featured Products", "Our handpicked selection of premium products", "featured"));
    }
  }

  // Init guarded
  function init() {
    if (els.year) els.year.textContent = new Date().getFullYear();
    if (els.category) populateCategories();
    if (els.grid) render(current);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


