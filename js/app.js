// Navigo Nepal - Premium International-Grade Application Logic
// Orchestrates theme variables, scroll animations, metric counters, map interactions, carousels, and confetti.

document.addEventListener("DOMContentLoaded", () => {
  const CMS = (() => {
    try {
      const localData = localStorage.getItem("navigo-cms-data");
      return localData ? JSON.parse(localData) : window.NAVIGO_CMS;
    } catch (e) {
      console.warn("Failed to load local CMS override: ", e);
      return window.NAVIGO_CMS;
    }
  })();
  if (!CMS) {
    console.error("Navigo CMS data layer not detected.");
    return;
  }

  // Page load animation
  requestAnimationFrame(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  });

  // ==================== HERO SLIDESHOW ====================
  const heroSlideshow = document.getElementById("heroSlideshow");
  if (heroSlideshow) {
    const slides = heroSlideshow.querySelectorAll(".hero-bg-image");
    let currentSlide = 0;

    function nextSlide() {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }

    setInterval(nextSlide, 3000);
  }

  // ==================== 1. LAYOUT & THEME TOGGLE ====================
  // (Handled globally by js/theme.js to ensure consistency across subpages)

  // Hamburger Menu
  const hamburger = document.getElementById("hamburger") || document.getElementById("mobileMenuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const mobileNavClose = document.getElementById("mobileNavClose");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");

  function openMobileNav() {
    if (hamburger) hamburger.classList.add("open");
    if (mobileNav) mobileNav.classList.add("open");
    if (mobileNavOverlay) mobileNavOverlay.classList.add("open");
    document.body.classList.add("nav-open");
  }

  function closeMobileNav() {
    if (hamburger) hamburger.classList.remove("open");
    if (mobileNav) mobileNav.classList.remove("open");
    if (mobileNavOverlay) mobileNavOverlay.classList.remove("open");
    document.body.classList.remove("nav-open");
  }

  if (hamburger) hamburger.addEventListener("click", () => {
    if (mobileNav && mobileNav.classList.contains("open")) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  if (mobileNavClose) mobileNavClose.addEventListener("click", closeMobileNav);
  if (mobileNavOverlay) mobileNavOverlay.addEventListener("click", closeMobileNav);

  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      closeMobileNav();
    });
  });

  // Scroll Progress Bar
  const scrollProgress = document.getElementById("scrollProgress");
  window.addEventListener("scroll", () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const percentage = (window.scrollY / totalHeight) * 100;
      if (scrollProgress) scrollProgress.style.width = `${percentage}%`;
    }
  });

  // Navbar scroll effect
  const navbar = document.getElementById("mainNav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      if (navbar) navbar.classList.add("scrolled");
    } else {
      if (navbar) navbar.classList.remove("scrolled");
    }
  });

  // Active Link Observer
  const sections = document.querySelectorAll("header.section, section.section, footer.section");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  const observerOptions = {
    root: null,
    rootMargin: "-25% 0px -55% 0px",
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        updateActiveLink(id);
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  function updateActiveLink(id) {
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${id}`) {
        link.classList.add("active");
      }
    });
    mobileNavLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${id}`) {
        link.classList.add("active");
      }
    });
  }


  // ==================== 2. SCROLL REVEAL ANIMATIONS ====================

  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ==================== 3. CMS CONTENT RENDERING ====================

  // Render Hero
  if (document.getElementById("heroTitle")) document.getElementById("heroTitle").innerHTML = CMS.hero.title;
  if (document.getElementById("heroSubtitle")) document.getElementById("heroSubtitle").textContent = CMS.hero.subtitle;
  if (document.getElementById("heroCtaPrimary")) document.getElementById("heroCtaPrimary").textContent = CMS.hero.ctaPrimary;
  if (document.getElementById("heroCtaSecondary")) document.getElementById("heroCtaSecondary").textContent = CMS.hero.ctaSecondary;

  // Render Founding Stats Dynamically
  const statMembersVal = CMS.impactMetrics.find(m => m.id === "volunteers");
  const statSchoolsVal = CMS.impactMetrics.find(m => m.id === "schools");
  const statDistrictsVal = CMS.impactMetrics.find(m => m.id === "districts");

  if (document.getElementById("statMembers") && statMembersVal) {
    document.getElementById("statMembers").textContent = statMembersVal.value + statMembersVal.suffix;
  }
  if (document.getElementById("statSchools") && statSchoolsVal) {
    document.getElementById("statSchools").textContent = statSchoolsVal.value + statSchoolsVal.suffix;
  }
  if (document.getElementById("statDistricts") && statDistrictsVal) {
    document.getElementById("statDistricts").textContent = statDistrictsVal.value + statDistrictsVal.suffix;
  }

  // Render Founding Story
  const foundingStoryText = document.getElementById("foundingStoryText");
  if (foundingStoryText && CMS.story.foundingStory) {
    foundingStoryText.innerHTML = CMS.story.foundingStory;
  }

  // Background Slideshow for Founding Story (cycles every 5 seconds)
  const fsSlides = document.querySelectorAll(".fs-slide");
  if (fsSlides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      fsSlides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % fsSlides.length;
      fsSlides[currentSlide].classList.add("active");
    }, 5000);
  }

  // Background Slideshow for Navigo Coordinators section (cycles every 3 seconds)
  const nvSlides = document.querySelectorAll(".nv-coord-slide");
  if (nvSlides.length > 0) {
    let nvCurrent = 0;
    setInterval(() => {
      nvSlides[nvCurrent].classList.remove("active");
      nvCurrent = (nvCurrent + 1) % nvSlides.length;
      nvSlides[nvCurrent].classList.add("active");
    }, 3000);
  }

  // Background Slideshow for How Are We Unique? section (cycles every 4 seconds)
  const uqSlides = document.querySelectorAll(".uq-slide");
  if (uqSlides.length > 0) {
    let uqCurrent = 0;
    setInterval(() => {
      uqSlides[uqCurrent].classList.remove("active");
      uqCurrent = (uqCurrent + 1) % uqSlides.length;
      uqSlides[uqCurrent].classList.add("active");
    }, 4000);
  }


  // Render Leadership Quote
  if (CMS.story.leadershipMessage) {
    const quoteText = document.getElementById("leadershipQuoteText");
    const quoteAuthor = document.getElementById("leadershipQuoteAuthor");
    const quoteRole = document.getElementById("leadershipQuoteRole");
    const quoteAvatar = document.getElementById("leadershipQuoteAvatar");

    if (quoteText) quoteText.textContent = CMS.story.leadershipMessage.quote;
    if (quoteAuthor) quoteAuthor.textContent = CMS.story.leadershipMessage.author;
    if (quoteRole) quoteRole.textContent = CMS.story.leadershipMessage.role;
    if (quoteAvatar) {
      if (CMS.story.leadershipMessage.avatar) {
        quoteAvatar.src = CMS.story.leadershipMessage.avatar;
      } else {
        quoteAvatar.alt = CMS.story.leadershipMessage.author;
      }
    }
  }

  // Render Mission & Vision
  if (document.getElementById("storyMission")) document.getElementById("storyMission").textContent = CMS.story.mission;
  if (document.getElementById("storyVision")) document.getElementById("storyVision").textContent = CMS.story.vision;

  // Render Core Values List (Flat layout)
  const coreValuesList = document.getElementById("coreValuesList");
  if (coreValuesList && CMS.story.values) {
    coreValuesList.innerHTML = CMS.story.values.map(val => `
      <div class="vision-value-item reveal">
        <h4 class="vision-value-item-title">${val.title}</h4>
        <p class="vision-value-item-desc">${val.desc}</p>
      </div>
    `).join("");
  }

  // Render Programs - Helper Function to allow dynamic filtering
  function getProgramIcon(id) {
    if (id === 'stem') return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 15h3"/><path d="M1 9h3"/><path d="M1 15h3"/></svg>`;
    if (id === 'olympiad') return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`;
    if (id === 'leadership') return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
    if (id === 'career') return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>`;
    if (id === 'clubs') return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    if (id === 'mentorship') return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    if (id === 'entrepreneurship') return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01 M18 12h.01"/></svg>`;
  }

  const programsGrid = document.getElementById("programsGrid");

  function renderProgramsList(list, highlightedId = '') {
    // Disabled: Curricular programs list is replaced by the static "How Are We Unique?" section.
  }



  // Render Student Spotlights Grid (Sharp Edges)
  const spotlightsGrid = document.getElementById("spotlightsGrid");
  if (spotlightsGrid) spotlightsGrid.innerHTML = CMS.successStories.map((story, idx) => `
    <div class="spotlight-card reveal stagger-${idx + 1}">
      <div class="spotlight-img-wrapper">
        <img src="${story.image}" alt="${story.name}" class="spotlight-img" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;background:rgba(37,99,235,0.08);display:flex;align-items:center;justify-content:center;color:var(--accent-color);font-family:Bebas Neue;font-size:2.5rem;font-weight:400;\\'>${story.name[0]}</div>'">
      </div>
      <div class="spotlight-content">
        <span class="spotlight-highlight">${story.highlight}</span>
        <p class="spotlight-quote">"${story.quote}"</p>
      </div>
      <div class="spotlight-meta-panel">
        <div class="spotlight-author">${story.name}</div>
        <div class="spotlight-meta-text">${story.role} &bull; ${story.location}</div>
      </div>
    </div>
  `).join("");

  // Render Blog Grid with images
  const blogGrid = document.getElementById("blogGrid");
  if (blogGrid) blogGrid.innerHTML = CMS.blog.map(post => `
    <a href="blog.html?post=${post.id || ''}" class="blog-post-card reveal" style="text-decoration: none; color: inherit; display: grid;">
      <div class="blog-post-img">
        <img src="${post.image}" alt="${post.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;background:linear-gradient(135deg,rgba(37,99,235,0.08),rgba(16,185,129,0.05));display:flex;align-items:center;justify-content:center;\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'30\\' height=\\'30\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1\\' style=\\'color:var(--accent-color);opacity:0.5\\'><path d=\\'M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-8-4-8 4z\\'/></svg></div>'">
      </div>
      <div class="blog-post-content">
        <div class="blog-post-meta">By ${post.author} &bull; ${post.date}</div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <span class="blog-read-more">Read More &rarr;</span>
      </div>
    </a>
  `).join("");

  // Render Resources
  const resourcesList = document.getElementById("resourcesList");
  if (resourcesList) resourcesList.innerHTML = CMS.resources.map(res => `
    <div class="resource-item">
      <div class="resource-header">
        <span class="resource-tag">${res.category}</span>
        <span class="resource-download-btn" data-title="${res.title}">
          ${res.format} &bull; ${res.fileSize}
        </span>
      </div>
      <h3>${res.title}</h3>
      <p>${res.desc}</p>
    </div>
  `).join("");

  // Render Volunteer Opportunities
  const volunteerGrid = document.getElementById("volunteerGrid");
  if (volunteerGrid) volunteerGrid.innerHTML = CMS.volunteerPositions.map((pos, idx) => `
    <div class="position-card reveal stagger-${(idx % 3) + 1}">
      <div class="position-meta">
        <span class="meta-tag">${pos.type}</span>
        <span class="meta-tag meta-tag-highlight">${pos.commitment}</span>
      </div>
      <h3>${pos.title}</h3>
      <p>${pos.desc}</p>
      <button class="btn btn-secondary apply-position-btn" data-id="${pos.id}" data-title="${pos.title}" style="margin-top: auto;">
        Apply Now
      </button>
    </div>
  `).join("");

  // Render Donations
  const donationGrid = document.getElementById("donationGrid");
  if (donationGrid) donationGrid.innerHTML = CMS.donations.map((tier, idx) => `
    <div class="donation-card ${idx === 1 ? 'featured' : ''} reveal stagger-${idx + 1}">
      <div class="donation-tier-header">
        <span class="gradient-accent" style="font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">${idx === 1 ? 'INSTITUTIONAL PARTNERSHIP' : 'INDIVIDUAL SPONSORSHIP'}</span>
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-top: 0.5rem;">${tier.title}</h3>
        <div class="donation-amount-wrapper">
          <span class="donation-currency">₨</span>
          <span class="donation-val">${tier.amount}</span>
          <span class="donation-period">/ ${tier.period}</span>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.7; margin-top: 0.5rem;">${tier.desc}</p>
      </div>
      
      <ul class="donation-features">
        ${tier.features.map(feat => `
          <li>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ${feat}
          </li>
        `).join("")}
      </ul>

      <button class="btn ${idx === 1 ? 'btn-primary' : 'btn-secondary'} sponsor-checkout-btn" data-amount="${tier.amount}" data-title="${tier.title}" data-period="${tier.period}" data-id="tier-${idx}">
        Secure Sponsorship
      </button>
    </div>
  `).join("");

  // Re-observe newly created reveal elements
  document.querySelectorAll('.reveal:not(.revealed), .reveal-left:not(.revealed), .reveal-right:not(.revealed), .reveal-scale:not(.revealed)').forEach(el => {
    revealObserver.observe(el);
  });


  // ==================== 4. SCROLL METRIC COUNTERS ====================

  const metricCards = document.querySelectorAll(".metric-card");

  const metricObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        if (!card.classList.contains("animated")) {
          card.classList.add("animated");
          animateCounter(card);
        }
      }
    });
  }, { threshold: 0.1 });

  metricCards.forEach(card => metricObserver.observe(card));

  function animateCounter(card) {
    const numEl = card.querySelector(".metric-number");
    const targetValue = parseInt(card.getAttribute("data-target"));
    const suffix = card.getAttribute("data-suffix");

    let current = 0;
    const duration = 2000;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      current = Math.floor(easeProgress * targetValue);

      numEl.textContent = formatMetricNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        numEl.textContent = formatMetricNumber(targetValue) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function formatMetricNumber(num) {
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  }





  // ==================== 5. NEPAL SVG MAP INTERACTIONS ====================

  const provincePaths = document.querySelectorAll(".province-path");
  const mapStatsPanel = document.getElementById("mapStatsPanel");

  provincePaths.forEach(path => {
    path.addEventListener("click", () => {
      provincePaths.forEach(p => p.classList.remove("active"));
      path.classList.add("active");

      const provinceId = path.getAttribute("id").replace("path-", "");
      const provData = CMS.provinces.find(p => p.id === provinceId);

      if (provData) {
        updateMapPanel(provData);
      }
    });

    path.addEventListener("mouseover", () => {
      if (!path.classList.contains("active")) {
        path.style.fill = "#fca5a5"; // light red hover
      }
    });

    path.addEventListener("mouseout", () => {
      if (!path.classList.contains("active")) {
        path.style.fill = "";
      }
    });
  });

  function updateMapPanel(data) {
    const maxStudents = 10000;
    const maxSchools = 50;
    const studentPercent = Math.min((data.students / maxStudents) * 100, 100);
    const schoolPercent = Math.min((data.schools / maxSchools) * 100, 100);

    mapStatsPanel.innerHTML = `
      <div>
        <span class="gradient-accent" style="font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em;">PROVINCIAL FOOTPRINT</span>
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-top: 0.25rem; color: var(--text-main);">${data.name}</h3>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 1.25rem; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 1.25rem 0;">
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.5rem;">
            <span>Schools Connected</span>
            <span style="color: var(--accent-color); font-weight: 700;">${data.schools} Hubs</span>
          </div>
          <div style="width: 100%; height: 4px; background: var(--border-color); overflow: hidden;">
            <div style="width: ${schoolPercent}%; height: 100%; background: var(--gradient-primary); transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 500; margin-bottom: 0.5rem;">
            <span>Students Reached</span>
            <span style="color: var(--accent-color); font-weight: 700;">${data.students.toLocaleString()} Students</span>
          </div>
          <div style="width: 100%; height: 4px; background: var(--border-color); overflow: hidden;">
            <div style="width: ${studentPercent}%; height: 100%; background: linear-gradient(90deg, #2563EB, #10B981); transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);"></div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; font-weight: 500;">
          <span>Active Navigo Clubs</span>
          <span style="background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(16,185,129,0.1)); padding: 0.25rem 0.75rem; color: var(--accent-color); font-weight: 700; font-size: 0.78rem;">${data.clubs} Clubs</span>
        </div>
      </div>

      <div>
        <h4 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; color: var(--text-main); font-weight: 600;">Primary Focus:</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;">${data.leadProgram}</p>
        
        <h4 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 1rem; margin-bottom: 0.25rem; color: var(--text-main); font-weight: 600;">Recent Milestone:</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; font-style: italic;">"${data.milestone}"</p>
      </div>
    `;
  }

  const defaultPath = document.getElementById("path-bagmati");
  if (defaultPath) {
    defaultPath.classList.add("active");
    const bagmatiData = CMS.provinces.find(p => p.id === "bagmati");
    if (bagmatiData) updateMapPanel(bagmatiData);
  }


  // ==================== 6. SUCCESS STORIES CAROUSEL ====================

  const carousel = document.getElementById("carouselContainer");
  if (carousel) {
    const slides = document.querySelectorAll(".carousel-slide");
    const navDotsWrapper = document.getElementById("carouselNav");
    let activeIndex = 0;
    const slideCount = slides.length;
    let autoplayInterval;

    if (navDotsWrapper) {
      navDotsWrapper.innerHTML = CMS.successStories.map((_, idx) => `
        <button class="carousel-dot ${idx === 0 ? 'active' : ''}" aria-label="View Story ${idx + 1}"></button>
      `).join("");

      const dots = navDotsWrapper.querySelectorAll(".carousel-dot");

      dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
          goToSlide(idx);
          resetAutoplay();
        });
      });

      function goToSlide(index) {
        if (index < 0) index = slideCount - 1;
        if (index >= slideCount) index = 0;

        activeIndex = index;
        carousel.style.transform = `translateX(-${activeIndex * 100}%)`;

        dots.forEach((dot, idx) => {
          if (idx === activeIndex) dot.classList.add("active");
          else dot.classList.remove("active");
        });
      }

      function startAutoplay() {
        autoplayInterval = setInterval(() => {
          goToSlide(activeIndex + 1);
        }, 7000);
      }

      function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
      }

      startAutoplay();
    }
  }


  // ==================== 7. MODAL SYSTEM ====================

  // A. Program details
  const programModal = document.getElementById("programModal");
  const closeProgramModal = document.getElementById("closeProgramModal");

  if (programsGrid) {
    programsGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".program-learn-more");
      if (!btn) return;

      const progId = btn.getAttribute("data-id");
      const prog = CMS.programs.find(p => p.id === progId);

      if (prog) {
        document.getElementById("modalProgramTag").textContent = prog.title.toUpperCase();
        document.getElementById("modalProgramTitle").textContent = prog.title;
        document.getElementById("modalProgramBody").innerHTML = `
          <p style="margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 600; color: var(--text-main);">${prog.shortDesc}</p>
          <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 2rem;">${prog.fullDesc}</p>
          
          <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(37,99,235,0.05), rgba(16,185,129,0.03)); border: 1px solid var(--border-color); display: flex; align-items: center; gap: 1.25rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-color); flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Want this program in your local school? Reach out via our <a href="#contact" onclick="document.getElementById('programModal').classList.remove('active');" style="color: var(--accent-color); font-weight: 600;">Contact Form</a> to establish a new School Club hub.</p>
          </div>
        `;
        programModal.classList.add("active");
      }
    });
  }

  closeProgramModal.addEventListener("click", () => programModal.classList.remove("active"));

  // B. Volunteer enrollment
  const volunteerModal = document.getElementById("volunteerModal");
  const closeVolunteerModal = document.getElementById("closeVolunteerModal");
  const volPositionInput = document.getElementById("volunteerPositionId");
  const volTitleEl = document.getElementById("modalVolunteerTitle");

  document.querySelectorAll(".apply-position-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const posId = btn.getAttribute("data-id");
      const posTitle = btn.getAttribute("data-title");

      volPositionInput.value = posId;
      volTitleEl.textContent = `Apply as ${posTitle}`;
      volunteerModal.classList.add("active");
    });
  });

  closeVolunteerModal.addEventListener("click", () => volunteerModal.classList.remove("active"));

  // C. Donation Secure Gateways
  const donationModal = document.getElementById("donationModal");
  const closeDonationModal = document.getElementById("closeDonationModal");

  document.querySelectorAll(".sponsor-checkout-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const title = btn.getAttribute("data-title");
      const amount = btn.getAttribute("data-amount");
      const period = btn.getAttribute("data-period");

      document.getElementById("donationTierId").value = id;
      document.getElementById("modalDonationTitle").textContent = title;
      document.getElementById("checkoutTierLabel").textContent = title;
      document.getElementById("checkoutTierAmount").textContent = `₨ ${amount}`;
      document.getElementById("checkoutTierPeriod").textContent = `/ ${period}`;

      donationModal.classList.add("active");
    });
  });

  closeDonationModal.addEventListener("click", () => donationModal.classList.remove("active"));

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      e.target.classList.remove("active");
    }
  });


  // ==================== 8. FORM SUBMISSIONS & PREMIUM CONFETTI ====================

  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  let confettiActive = false;
  let particles = [];
  // Premium navy/blue/emerald confetti palette
  const premiumColors = ["#2563EB", "#4F9CF9", "#10B981", "#34D399", "#DCEEFF", "#0A2342", "#FFFFFF"];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height - 20;
      this.size = Math.random() * 8 + 4;
      this.color = premiumColors[Math.floor(Math.random() * premiumColors.length)];
      this.speedY = Math.random() * 2.5 + 1.5;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 2 - 1;
      this.opacity = Math.random() * 0.5 + 0.5;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      // Mix of circles and rectangles
      if (Math.random() > 0.5) {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function launchConfettiShower() {
    particles = [];
    for (let i = 0; i < 200; i++) {
      particles.push(new ConfettiParticle());
    }

    confettiActive = true;
    let frameCount = 0;

    function loop() {
      if (!confettiActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      frameCount++;
      if (frameCount < 300) {
        requestAnimationFrame(loop);
      } else {
        confettiActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(loop);
  }

  // Inject spinner styles dynamically for Formspree loading states
  const spinnerStyle = document.createElement("style");
  spinnerStyle.textContent = `
    .form-spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: form-spin 0.8s linear infinite;
      margin-right: 0.5rem;
      vertical-align: middle;
    }
    @keyframes form-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinnerStyle);

  // Common Formspree Submit Handler
  function handleFormspreeSubmit(form, submitBtn, successCallback) {
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="form-spinner"></span> Submitting...';
    }

    const formData = new FormData(form);
    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        if (successCallback) successCallback();
        window.location.href = "thank-you.html";
      } else {
        response.json().then(data => {
          if (data && data.errors) {
            alert("Error: " + data.errors.map(err => err.message).join(", "));
          } else {
            alert("Oops! There was a problem submitting your form. Please try again.");
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        });
      }
    })
    .catch(error => {
      alert("Oops! There was a network error. Please check your internet connection and try again.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }

  // A. Contact Form
  const contactForm = document.getElementById("contactForm");
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !message) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please provide a valid email address.");
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    handleFormspreeSubmit(contactForm, submitBtn);
  });

  // B. Volunteer Form
  const volunteerForm = document.getElementById("volunteerForm");
  volunteerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("volName").value.trim();
    const email = document.getElementById("volEmail").value.trim();
    const phone = document.getElementById("volPhone").value.trim();
    const district = document.getElementById("volDistrict").value.trim();
    const bio = document.getElementById("volBio").value.trim();

    if (!name || !email || !phone || !district || !bio) {
      alert("Please fill in all registration fields.");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please provide a valid email.");
      return;
    }

    const submitBtn = volunteerForm.querySelector('button[type="submit"]');
    handleFormspreeSubmit(volunteerForm, submitBtn, () => {
      volunteerModal.classList.remove("active");
    });
  });

  // C. Donation Form
  const donationForm = document.getElementById("donationForm");
  const paymentMethodSelect = document.getElementById("paymentMethod");
  const qrPaymentDetailsBox = document.getElementById("qrPaymentDetails");

  if (paymentMethodSelect && qrPaymentDetailsBox) {
    paymentMethodSelect.addEventListener("change", () => {
      if (paymentMethodSelect.value === "bank_qr") {
        qrPaymentDetailsBox.style.display = "block";
      } else {
        qrPaymentDetailsBox.style.display = "none";
      }
    });
  }

  donationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("donorName").value.trim();
    const email = document.getElementById("donorEmail").value.trim();
    const phone = document.getElementById("donorPhone").value.trim();
    const payment = document.getElementById("paymentMethod").value;
    const tier = document.getElementById("checkoutTierLabel").textContent;
    const amount = document.getElementById("checkoutTierAmount").textContent;

    if (!name || !email || !phone) {
      alert("Please complete billing information details.");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please provide a valid email.");
      return;
    }

    // Set hidden fields
    document.getElementById("donorTier").value = tier;
    document.getElementById("donorAmount").value = amount;

    const submitBtn = donationForm.querySelector('button[type="submit"]');
    handleFormspreeSubmit(donationForm, submitBtn, () => {
      donationModal.classList.remove("active");
    });
  });

  // D. Newsletter Form
  const newsletterForm = document.getElementById("newsletterForm");
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletterEmail").value.trim();

    if (!email || !validateEmail(email)) {
      alert("Please provide a valid email address.");
      return;
    }

    launchConfettiShower();
    alert("Subscribed! Thank you for joining the Navigo Nepal community.");
    newsletterForm.reset();
  });

  // E. Resource downloads
  document.querySelectorAll(".resource-download-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = btn.getAttribute("data-title");
      launchConfettiShower();
      alert(`Preparing Download:\n"${title}"\n\nThank you for utilizing our open academic library!`);
    });
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }


  // ==================== 8b. HERO SEARCH & SUGGESTIONS CONSOLE ====================
  const programSearchInput = document.getElementById("programSearchInput");
  const searchSuggestions = document.getElementById("searchSuggestions");
  const provinceSearchSelect = document.getElementById("provinceSearchSelect");
  const searchSubmitBtn = document.getElementById("searchSubmitBtn");

  // Searchable content database
  const searchableContent = [
    // Programs
    { title: "Discord Workshops", desc: "Interactive online workshops, stream counseling, and coding stages on Discord", url: "discord-workshop.html", category: "Programs", keywords: "discord workshop online stream guidance coding how to join stage events community nepal" },
    { title: "What's Next? Campaign", desc: "Career guidance for SEE graduates after 10th grade", url: "programs.html#whats-next", category: "Programs", keywords: "career counseling see 10th grade college stream selection" },
    { title: "Leadership & Personality Development", desc: "Workshops for student leadership and personality growth", url: "programs.html#leadership", category: "Programs", keywords: "leadership scout personality workshop training" },
    { title: "School Clubs & ECAs", desc: "Establishing and managing student clubs in schools", url: "programs.html#clubs", category: "Programs", keywords: "club eca extracurricular activities school" },
    { title: "Environmental Stewardship", desc: "World Environment Day and environmental conservation programs", url: "programs.html#environmental", category: "Programs", keywords: "environment green unicef usaid climate conservation" },
    { title: "Connect Tech to Veda", desc: "Technology and computer literacy programs for students", url: "programs.html#tech-veda", category: "Programs", keywords: "tech veda computer technology digital literacy" },
    // Pages
    { title: "Our Story", desc: "The complete story of Navigo Nepal's journey", url: "our-story.html", category: "About", keywords: "about story mission vision founding" },
    { title: "Our Team", desc: "Meet the team behind Navigo Nepal", url: "team.html", category: "About", keywords: "team members founders cofounders" },
    { title: "Coordinators", desc: "District coordinators and ambassadors across Nepal", url: "team.html", category: "About", keywords: "coordinator ambassador district naviger" },
    { title: "Past Events", desc: "Timeline of past projects and collaborations", url: "past-events.html", category: "About", keywords: "past events timeline projects history" },
    // Get Involved
    { title: "Join Navigo", desc: "Join us as a volunteer, intern, or partner", url: "join.html", category: "Get Involved", keywords: "join volunteer intern partner contact" },
    { title: "Volunteer With Us", desc: "Deliver programs and inspire students across Nepal", url: "volunteer.html", category: "Get Involved", keywords: "volunteer apply help teach" },
    { title: "Intern at Navigo", desc: "Gain hands-on experience in program delivery", url: "intern.html", category: "Get Involved", keywords: "intern internship experience" },
    { title: "Propose a Project", desc: "Submit your project idea to Navigo Nepal", url: "propose-project.html", category: "Get Involved", keywords: "propose project idea submit" },
    { title: "Donate", desc: "Support our mission through donations and sponsorships", url: "donate.html", category: "Get Involved", keywords: "donate donation sponsor sponsorship support fund" },
    // Provinces
    { title: "Kathmandu", desc: "Programs in Kathmandu Metropolitan City", url: "programs.html", category: "Location", keywords: "kathmandu valley bagmati", province: "bagmati" },
    { title: "Nuwakot", desc: "What's Next? program in Nuwakot district", url: "programs.html#whats-next", category: "Location", keywords: "nuwakot", province: "bagmati" },
    { title: "Dhading", desc: "Leadership training in Dhading district", url: "programs.html#leadership", category: "Location", keywords: "dhading", province: "bagmati" },
    { title: "Pokhara", desc: "Programs in Pokhara, Gandaki Province", url: "programs.html", category: "Location", keywords: "pokhara gandaki", province: "gandaki" },
    { title: "Butwal", desc: "Programs in Butwal, Lumbini Province", url: "programs.html", category: "Location", keywords: "butwal lumbini", province: "lumbini" },
    { title: "Banke", desc: "What's Next? program in Banke district", url: "programs.html#whats-next", category: "Location", keywords: "banke", province: "lumbini" },
  ];

  if (programSearchInput && searchSuggestions) {
    // Autocomplete Input Handler
    programSearchInput.addEventListener("input", () => {
      const query = programSearchInput.value.trim().toLowerCase();
      if (!query) {
        searchSuggestions.style.display = "none";
        searchSuggestions.innerHTML = "";
        return;
      }

      // Filter content by title, description, and keywords
      const matches = searchableContent.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.keywords.toLowerCase().includes(query)
      ).slice(0, 6); // Limit to 6 suggestions

      if (matches.length > 0) {
        searchSuggestions.innerHTML = matches.map(match => `
          <div class="suggestion-item" data-url="${match.url}" data-keywords="${match.keywords}">
            <span class="suggestion-category">${match.category}</span>
            <span class="suggestion-title">${match.title}</span>
            <span class="suggestion-desc">${match.desc}</span>
          </div>
        `).join("");
        searchSuggestions.style.display = "block";
      } else {
        searchSuggestions.style.display = "none";
        searchSuggestions.innerHTML = "";
      }
    });

    // Suggestions Click Handler
    searchSuggestions.addEventListener("click", (e) => {
      const item = e.target.closest(".suggestion-item");
      if (!item) return;

      const url = item.getAttribute("data-url");
      if (url) {
        window.location.href = url;
      }

      searchSuggestions.style.display = "none";
      searchSuggestions.innerHTML = "";
    });

    // Close suggestions dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!programSearchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.style.display = "none";
      }
    });

    // Handle Enter key on input
    programSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        executeHeroSearch();
      }
    });
  }

  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener("click", executeHeroSearch);
  }

  function executeHeroSearch() {
    const query = programSearchInput ? programSearchInput.value.trim().toLowerCase() : "";
    const provinceId = provinceSearchSelect ? provinceSearchSelect.value : "";

    if (!query && !provinceId) {
      // If nothing selected/typed, scroll to the programs section
      const progSection = document.getElementById("programs");
      if (progSection) {
        progSection.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // 1. Process keyword search - find best matching page
    if (query) {
      // Check for page-level matches first
      const pageKeywords = {
        "volunteer": "volunteer.html",
        "intern": "intern.html",
        "donate": "donate.html",
        "donation": "donate.html",
        "sponsor": "donate.html",
        "team": "team.html",
        "coordinator": "team.html",
        "partner": "join.html#partner",
        "join": "join.html",
        "propose": "propose-project.html",
        "project": "propose-project.html",
        "story": "our-story.html",
        "about": "our-story.html",
        "mission": "our-story.html",
        "vision": "our-story.html",
        "events": "past-events.html",
        "past": "past-events.html",
        "programs": "programs.html",
      };

      // Check for exact page match
      for (const [key, url] of Object.entries(pageKeywords)) {
        if (query.includes(key)) {
          window.location.href = url;
          return;
        }
      }

      // Check for program section matches
      const programKeywords = {
        "whats next": "programs.html#whats-next",
        "what's next": "programs.html#whats-next",
        "career": "programs.html#whats-next",
        "counseling": "programs.html#whats-next",
        "leadership": "programs.html#leadership",
        "personality": "programs.html#leadership",
        "scout": "programs.html#leadership",
        "club": "programs.html#clubs",
        "eca": "programs.html#clubs",
        "environment": "programs.html#environmental",
        "green": "programs.html#environmental",
        "unicef": "programs.html#environmental",
        "usaid": "programs.html#environmental",
        "climate": "programs.html#environmental",
        "tech": "programs.html#tech-veda",
        "veda": "programs.html#tech-veda",
        "computer": "programs.html#tech-veda",
        "digital": "programs.html#tech-veda",
      };

      for (const [key, url] of Object.entries(programKeywords)) {
        if (query.includes(key)) {
          window.location.href = url;
          return;
        }
      }

      // Check for location matches
      const locationKeywords = {
        "kathmandu": "programs.html",
        "nuwakot": "programs.html#whats-next",
        "dhading": "programs.html#leadership",
        "pokhara": "programs.html",
        "butwal": "programs.html",
        "banke": "programs.html#whats-next",
        "rasuwa": "programs.html",
        "bhaktapur": "programs.html",
        "lalitpur": "programs.html",
      };

      for (const [key, url] of Object.entries(locationKeywords)) {
        if (query.includes(key)) {
          window.location.href = url;
          return;
        }
      }

      // If no specific match found, search through all content
      const match = searchableContent.find(item =>
        item.title.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.keywords.toLowerCase().includes(query)
      );

      if (match) {
        window.location.href = match.url;
        return;
      }

      // Fallback: scroll to programs section
      const progSection = document.getElementById("programs");
      if (progSection) {
        progSection.scrollIntoView({ behavior: "smooth" });
      }
    }

    // 2. Process Province Select
    if (provinceId) {
      const path = document.getElementById(`path-${provinceId}`);
      if (path) {
        path.click();
      }
    }
  }


  // ==================== 8c. NAVIGATION DROPDOWN INTERACTION ====================
  // Mobile accordion sub-menu toggles (supports both class patterns)
  const mobileDropdowns = document.querySelectorAll(".mobile-has-dropdown, .mobile-nav-has-dropdown");
  mobileDropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector(".mobile-dropdown-toggle, .mobile-nav-dropdown-toggle");
    if (toggle) {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Close other dropdowns first (accordion behavior)
        mobileDropdowns.forEach(other => {
          if (other !== dropdown) {
            other.classList.remove("open");
          }
        });

        dropdown.classList.toggle("open");
      });
    }
  });

  // Close mobile navigation sidebar when clicking sub-menu items
  document.querySelectorAll(".mobile-subnav-link").forEach(link => {
    link.addEventListener("click", () => {
      closeMobileNav();
    });
  });

  // Link subprogram links in both desktop and mobile dropdowns to the search console
  document.querySelectorAll(".subprogram-link").forEach(link => {
    link.addEventListener("click", (e) => {
      const kw = link.getAttribute("data-search-kw");
      if (kw) {
        if (programSearchInput) {
          programSearchInput.value = kw;
        }
        executeHeroSearch();
      }
    });
  });


  // ==================== 9. PARALLAX HERO BACKGROUND ====================

  const heroBg = document.querySelector('.hero-bg-image');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.1)`;
      }
    }, { passive: true });
  }


  // ==================== 10. UNIQUENESS CONSTELLATION CANVAS ====================
  const initConstellation = () => {
    const canvas = document.getElementById("uq-constellation");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || canvas.clientWidth || window.innerWidth;
      canvas.height = rect.height || canvas.clientHeight || 600;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Dynamic particle count based on screen area
    const particleCount = Math.min(70, Math.floor((canvas.width * canvas.height) / 18000));
    const connectionDistance = 120;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4; // slow movement speed
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 1; // 1px to 2.5px
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around canvas edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(79, 156, 249, 0.5)"; // matching accent light blue
        ctx.fill();
      }
    }

    // Initialize particle array
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Connect close particles with fading lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(79, 156, 249, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Use IntersectionObserver to optimize CPU when section is out of viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate();
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      });
    }, { threshold: 0.05 });

    const uniquenessSection = document.getElementById("programs");
    if (uniquenessSection) {
      observer.observe(uniquenessSection);
    } else {
      animate(); // fallback if section is missing or doesn't support observer
    }
  };

  // initConstellation();
});
