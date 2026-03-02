// ===== Thai Pulp Packaging - Video Slider Website =====
(function(){
  // set default language
  if (!document.documentElement.getAttribute("data-lang"en" {
    document.documentElement.setAttribute("data-lang", "th");
  }

  // footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // language toggle
  const langButtons = document.querySelectorAll(".lang__btn");
  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang || "th";
      document.documentElement.setAttribute("data-lang", lang);
      langButtons.forEach(b => b.classList.toggle("is-active", b === btn));
      // update hero text for current slide
      updateHeroText();
    });
  });

  // mobile menu
  const burger = document.getElementById("burger");
  const mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav){
    burger.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      mobileNav.setAttribute("aria-hidden", String(!open));
    });
    // close menu on click
    mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
    }));
  }

  // lightbox for gallery + cards
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src){
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden","false");
  }
  function closeLightbox(){
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden","true");
    if (lightboxImg) lightboxImg.src = "";
  }
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  document.querySelectorAll("[data-img]").forEach(el => {
    el.addEventListener("click", () => openLightbox(el.getAttribute("data-img")));
  });

  // ===== HERO VIDEO SLIDER =====
  const videos = Array.from(document.querySelectorAll(".heroVideo__media"));
  const dotsWrap = document.getElementById("dots");
 const prevBtn = document.getElementById("prevBtn");
if (prevBtn) {
  prevBtn.addEventListener("click", goPrev);
}
  const nextBtn = document.getElementById("nextBtn");
if (nextBtn) {
  nextBtn.addEventListener("click", goNext);
}
  const titleEl = document.getElementById("heroTitle");
  const descEl  = document.getElementById("heroDesc");

  let current = 0;
  function showSlide(index) {
  const content = document.querySelector(".heroVideo__content");

  // เฟดข้อความออกก่อน
  if (content) content.classList.add("is-switching");

  // เปลี่ยนวิดีโอ
  videos.forEach((v, i) => {
    v.classList.toggle("is-active", i === index);
  });

  // รอให้เฟดออกเสร็จ แล้วค่อยอัปเดตข้อความ + dots แล้วเฟดกลับ
  setTimeout(() => {
    updateHeroText();
    updateDots();
    if (content) content.classList.remove("is-switching");
  }, 220);
}

function goNext() {
  current = (current + 1) % videos.length;
  showSlide(current);
}

function goPrev() {
  current = (current - 1 + videos.length) % videos.length;
  showSlide(current);
}
  let timer = null;
  const intervalMs = 4500;

  function getLang(){
    return document.documentElement.getAttribute("data-lang") || "th";
  }

  function updateHeroText() {
  const v = videos[current];
  if (!v || !titleEl || !descEl) return;

  const lang = getLang();
  const title = v.getAttribute(lang === "en" ? "data-en-title" : "data-th-title");
  const desc  = v.getAttribute(lang === "en" ? "data-en-desc"  : "data-th-desc");

  if (title) titleEl.textContent = title;
  if (desc)  descEl.textContent  = desc;
}

  function renderDots(){
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    videos.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "dot" + (i === current ? " is-active" : "");
      b.type = "button";
      b.setAttribute("aria-label", `Go to slide ${i+1}`);
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
    });
  }

  function setActiveVideo(i){
    videos.forEach((v, idx) => v.classList.toggle("is-active", idx === i));
    // ensure active video plays
    const active = videos[i];
    if (active){
      active.currentTime = 0;
      const p = active.play();
      if (p && typeof p.catch === "function") p.catch(()=>{ /* autoplay blocked */ });
    }
  }

  function goTo(i, user=false){
    if (!videos.length) return;
    current = (i + videos.length) % videos.length;
    setActiveVideo(current);
    updateHeroText();
    renderDots();
    if (user) restart();
  }
  function next(){ goTo(current + 1, true); }
  function prev(){ goTo(current - 1, true); }

  function start(){
    stop();
    timer = setInterval(() => goTo(current + 1), intervalMs);
  }
  function stop(){
    if (timer) clearInterval(timer);
    timer = null;
  }
  function restart(){ start(); }

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  // pause on hover desktop
  const hero = document.querySelector(".heroVideo");
  if (hero){
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    // swipe on mobile
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
  if (videos.length){
    // mute & play all (only active will be visible)
    videos.forEach(v => { v.muted = true; v.playsInline = true; });
    goTo(0);
    start();
  }
})();
// ===== GALLERY MULTI-IMAGES LIGHTBOX =====
(function () {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCap = document.getElementById("lightboxCap");

  if (!lb || !lbImg) return;

  const prevBtn = lb.querySelector(".lightbox__nav--prev");
  const nextBtn = lb.querySelector(".lightbox__nav--next");

  let images = [];
  let index = 0;

  function openLightbox(list, startIndex, captionText) {
    images = list;
    index = Math.max(0, Math.min(startIndex, images.length - 1));

    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    lbCap.textContent = captionText || "";
    render();
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    images = [];
    index = 0;
  }

  function render() {
    if (!images.length) return;
    lbImg.src = images[index];

    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) nextBtn.disabled = (index === images.length - 1);
  }

  function next() {
    if (index < images.length - 1) {
      index++;
      render();
    }
  }

  function prev() {
    if (index > 0) {
      index--;
      render();
    }
  }

  // Click on grid item
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".grid__item");
    if (!btn) return;

    // รองรับทั้ง data-imgs (หลายรูป) และ data-img (รูปเดียว)
    const raw = btn.getAttribute("data-imgs");
    const single = btn.getAttribute("data-img");

    let list = [];
    if (raw && raw.trim()) {
      // แยกด้วย | ตามที่คุณทำไว้
      list = raw.split("|").map(s => s.trim()).filter(Boolean);
    } else if (single && single.trim()) {
      list = [single.trim()];
    }

    if (!list.length) return;

    // caption เอาจาก label ไทย/อังกฤษในปุ่ม (ถ้ามี)
    const th = btn.querySelector('[data-th]')?.getAttribute("data-th") || "";
    const en = btn.querySelector('[data-en]')?.getAttribute("data-en") || "";
    const caption = th || en || "";

    openLightbox(list, 0, caption);
  });

  // Close handlers
  lb.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) closeLightbox();
  });

  // Nav
  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
 
