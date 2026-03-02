// script.js - Consolidated: language toggle, menu, slider, lightbox, helpers
(function(){
  // -------- set default language ----------
  if (!document.documentElement.getAttribute("data-lang")) {
    document.documentElement.setAttribute("data-lang", "th");
  }

  // -------- footer year ----------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -------- language toggle ----------
  function initLanguageToggle(){
    const langButtons = document.querySelectorAll(".lang__btn");
    if (!langButtons || !langButtons.length) return;
    langButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang || "th";
        document.documentElement.setAttribute("data-lang", lang);
        langButtons.forEach(b => b.classList.toggle("is-active", b === btn));
        // if hero text exists, update it
        if (typeof updateHeroText === "function") updateHeroText();
      });
    });
  }

  // -------- mobile menu ----------
  function initMobileMenu(){
    const burger = document.getElementById("burger");
    const mobileNav = document.getElementById("mobileNav");
    if (!burger || !mobileNav) return;
    burger.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      mobileNav.setAttribute("aria-hidden", String(!open));
    });
    mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
    }));
  }

  // -------- LIGHTBOX (gallery) ----------
  function initLightbox(){
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImg");
    const lbCap = document.getElementById("lightboxCap");
    if (!lb || !lbImg) return;

    let images = [], index = 0;

    function openLightbox(list, startIndex=0, caption=""){
      images = list || [];
      index = Math.max(0, Math.min(startIndex, images.length-1));
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden","false");
      document.body.style.overflow = "hidden";
      if (lbCap) lbCap.textContent = caption || "";
      render();
    }
    function closeLightbox(){
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden","true");
      document.body.style.overflow = "";
      images = []; index = 0;
      if (lbImg) lbImg.src = "";
    }
    function render(){
      if (!images.length) return;
      lbImg.src = images[index];
      const prevBtn = lb.querySelector(".lightbox__nav--prev");
      const nextBtn = lb.querySelector(".lightbox__nav--next");
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === images.length-1;
    }
    function next(){ if (index < images.length-1){ index++; render(); } }
    function prev(){ if (index > 0){ index--; render(); } }

    // click on grid items to open (handles data-img / data-imgs)
    document.addEventListener("click", (e) => {
      const item = e.target.closest(".grid__item");
      if (!item) return;
      const raw = item.getAttribute("data-imgs");
      const single = item.getAttribute("data-img");
      let list = [];
      if (raw) list = raw.split("|").map(s => s.trim()).filter(Boolean);
      else if (single) list = [single.trim()];
      if (!list.length) return;
      const caption = item.querySelector('[data-th]')?.getAttribute("data-th") || item.querySelector('[data-en]')?.getAttribute("data-en") || "";
      openLightbox(list, 0, caption);
    });

    // close handlers
    lb.addEventListener("click", (e) => {
      if (e.target.matches("[data-close]") || e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });

    const prevBtn = lb.querySelector(".lightbox__nav--prev");
    const nextBtn = lb.querySelector(".lightbox__nav--next");
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);
  }

  // ===== HERO IMAGE SLIDER (for .heroImage_media) =====
  function initHeroSlider(){
    const slides = Array.from(document.querySelectorAll(".heroImage_media"));
    if (!slides.length) return;

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const dotsWrap = document.getElementById("dots");
    const titleEl = document.getElementById("heroTitle");
    const descEl = document.getElementById("heroDesc");

    let current = 0;
    let timer = null;
    const intervalMs = 4500;

    function updateHeroText(){
      const slide = slides[current];
      if (!slide) return;
      // If slide has data-th-title / data-en-title attributes use them
      const lang = document.documentElement.getAttribute("data-lang") || "th";
      const title = slide.getAttribute(lang === "en" ? "data-en-title" : "data-th-title") || slide.querySelector(".heroText h2")?.textContent || "";
      const desc = slide.getAttribute(lang === "en" ? "data-en-desc" : "data-th-desc") || slide.querySelector(".heroText p")?.textContent || "";
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
    }

    function showSlide(index){
      slides.forEach((s,i) => {
        s.classList.toggle("is-active", i === index);
      });
      updateDots();
      updateHeroText();
    }

    function renderDots(){
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "dot" + (i === current ? " is-active" : "");
        b.setAttribute("aria-label", `Go to slide ${i+1}`);
        b.addEventListener("click", () => { goTo(i, true); });
        dotsWrap.appendChild(b);
      });
    }

    function updateDots(){
      if (!dotsWrap) return;
      const dots = Array.from(dotsWrap.children || []);
      dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
    }

    function setActive(i){
      current = (i + slides.length) % slides.length;
      showSlide(current);
    }
    function goTo(i, user=false){
      setActive(i);
      if (user) restart();
    }
    function goNext(){ goTo(current + 1, true); }
    function goPrev(){ goTo(current - 1, true); }

    // autoplay
    function start(){
      stop();
      timer = setInterval(() => { goTo(current + 1); }, intervalMs);
    }
    function stop(){ if (timer) clearInterval(timer); timer = null; }
    function restart(){ start(); }

    // bind buttons safely
    if (prevBtn) prevBtn.addEventListener("click", goPrev);
    if (nextBtn) nextBtn.addEventListener("click", goNext);

    // pause on hover
    const hero = document.querySelector(".heroImage");
    if (hero){
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      // swipe support
      let x0 = null;
      hero.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, {passive:true});
      hero.addEventListener("touchend", (e) => {
        if (x0 === null) return;
        const x1 = e.changedTouches[0].clientX;
        const dx = x1 - x0;
        if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1), true);
        x0 = null;
      }, {passive:true});
    }

    // init
    renderDots();
    showSlide(0);
    start();
  }

  // -------- init all ----------
  document.addEventListener("DOMContentLoaded", () => {
    initLanguageToggle();
    initMobileMenu();
    initLightbox();
    initHeroSlider();
  });
})();
 
