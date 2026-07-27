/* ---------- Прелоадер (экран загрузки) ---------- */
(function () {
  const pl = document.getElementById("preloader");
  if (!pl) return;
  const HOLD = 2500; // сколько держать экран загрузки (мс) — меняй тут
  const hide = () => {
    pl.classList.add("is-done");
    document.body.classList.remove("is-loading");
    // старт hero-видео с нулевого кадра ровно в момент ухода занавеса
    const hv = document.querySelector(".hero__video");
    if (hv) {
      // как только видео РЕАЛЬНО заигралo — гарантированно показываем его
      // (даже если ниже мы его временно спрятали из-за медленной загрузки)
      hv.addEventListener("playing", () => { hv.style.display = ""; });
      try { hv.currentTime = 0; } catch (e) {}
      const tryPlay = () => { const p = hv.play(); if (p) p.catch(() => {}); };
      tryPlay();
      setTimeout(tryPlay, 500);   // повтор: currentTime=0 может «оборвать» первый play()
      // прячем видео (и его кнопку play) ТОЛЬКО если через 2.5с оно так и НЕ играет —
      // это настоящий блок автоплея (энергосбережение); тогда виден фон-кадр клавиатуры.
      // НЕ ориентируемся на ошибку промиса play() — она бывает ложной (AbortError).
      setTimeout(() => { if (hv.paused) hv.style.display = "none"; }, 2500);
    }
    setTimeout(() => pl.remove(), 1000);
  };
  setTimeout(hide, HOLD);
})();

/* ---------- Бегущая строка: собираем ровно под ширину экрана ----------
   Раньше строка была фикс. 7120px — мобильный GPU не тянет такой слой
   (лимит текстуры ~4096px) и анимация «замерзала». Теперь под каждый
   экран — минимальная нужная ширина: две идентичные группы, сдвиг -50%. */
(function () {
  const track = document.getElementById("marqueeTrack");
  if (!track) return;
  const PHRASES = ["Product Ads", "3D Animation", "Motion Design", "CGI", "Lighting", "Look Dev"];
  const SPEED = 70; // px/сек
  const setHTML = () => PHRASES.map(p => `<span>${p}</span><i></i>`).join("");
  function build() {
    // измеряем ширину одного набора фраз
    track.innerHTML = `<div class="marquee__group">${setHTML()}</div>`;
    const oneSet = track.firstElementChild.getBoundingClientRect().width || 1000;
    const sets = Math.max(1, Math.ceil((window.innerWidth * 1.2) / oneSet));
    let inner = ""; for (let i = 0; i < sets; i++) inner += setHTML();
    const group = `<div class="marquee__group">${inner}</div>`;
    track.innerHTML = group + group;   // две одинаковые группы → бесшовный луп при -50%
    const groupW = track.firstElementChild.getBoundingClientRect().width;
    track.style.animationDuration = Math.max(14, Math.round(groupW / SPEED)) + "s";
  }
  build();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); // пересчёт после загрузки шрифта
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(build, 250); }, { passive: true });
})();

/* ========================================================================
   ДАННЫЕ ПРОЕКТОВ  — редактируй здесь:
     title — название,  cat — категория (product | environment | animation),
     file  — имя файла в assets/videos/,
     t     — секунда, с которой берётся кадр-превью (меняй число, чтобы
             выбрать нужный начальный кадр; например t: 2.5).
   ===================================================================== */
// t = секунда кадра-превью. Длины роликов (для справки): keyboard 44s, redbull 24s,
// estee 20s, iphone 5s, tea-time 10s, lancaster 16s, castle 6s, moai 10s,
// island-house 33s, hotel 6.7s, spider 18s. Если t больше длины — берётся середина.
const PROJECTS = [
  { title: "Mechanical Keyboard",           cat: "product",     file: "keyboard.mp4",     t: 11 },
  { title: "Energy Drink - Can Launch",     cat: "product",     file: "redbull-can.mp4",  t: 1.5 },
  { title: "Luxury Cosmetics", cat: "product",     file: "estee-lauder.mp4", t: 1 },
  { title: "Smartphone - Sunset Reveal",    cat: "product",     file: "iphone.mp4",       t: 2.5, label: "Mockup" },
  { title: "Tea Time - Social Reels",     cat: "product",     file: "tea-time.mp4",     t: 5, label: "Aesthetic" },
  { title: "Skincare - Beauty & Personal Care",              cat: "product",     file: "lancaster.mp4",    t: 1 },
  { title: "Fantasy Stylized Castle",                cat: "environment", file: "castle.mp4",       t: 1 },
  { title: "Moai Statue",                   cat: "environment", file: "moai.mp4",         t: 1, label: "Sculpting" },
  { title: "Island Treehouse",              cat: "environment", file: "island-house.mp4", t: 1 },
  { title: "LowPoly Hotel - Archviz",      cat: "environment", file: "hotel.mp4",        t: 1 },
  { title: "Spider - Creature Animation",   cat: "animation",   file: "spider.mp4",       t: 0, label: "Rig" },
];

const CAT_LABELS = { product: "Product", environment: "Environment", animation: "Animation" };
const PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

/* ---------- Рендер сетки ---------- */
const grid = document.getElementById("grid");
grid.innerHTML = PROJECTS.map((p, i) => `
  <article class="tile" data-reveal="scale" style="--rd:${(i % 3) * 45}ms" data-cat="${p.cat}" data-label="${p.label || ''}" data-index="${i}" data-t="${p.t ?? 0.1}">
    <video muted loop playsinline preload="none">
      <source src="assets/videos/${p.file}#t=${p.t ?? 0.1}" type="video/mp4" />
    </video>
    <div class="tile__grad"></div>
    <div class="tile__info">
      <div>
        <span>${p.label || CAT_LABELS[p.cat] || p.cat}</span>
        <h3>${p.title}</h3>
      </div>
      <div class="tile__play">${PLAY_SVG}</div>
    </div>
  </article>`).join("");

/* ---------- Ленивая загрузка видео + hover-play + исходные пропорции ---------- */
// метаданные/кадр-превью подгружаем только когда плитка близко к экрану,
// чтобы не тянуть все 11 роликов сразу (критично для мобильных)
const mediaIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const v = en.target.querySelector("video");
    if (v && v.preload === "none") { v.preload = "metadata"; v.load(); }
    mediaIO.unobserve(en.target);
  });
}, { rootMargin: "600px 0px" });

document.querySelectorAll(".tile").forEach(tile => {
  const v = tile.querySelector("video");
  let poster = parseFloat(tile.dataset.t) || 0.1;   // секунда кадра-превью
  const applyMeta = () => {
    // реальное соотношение сторон, чтобы ничего не обрезалось
    if (v.videoWidth && v.videoHeight) tile.style.aspectRatio = `${v.videoWidth} / ${v.videoHeight}`;
    // если заданная секунда за пределами длины ролика — берём середину
    if (v.duration && !(poster >= 0 && poster < v.duration)) poster = v.duration / 2;
    try { v.currentTime = poster; } catch (e) {}
  };
  if (v.readyState >= 1) applyMeta(); else v.addEventListener("loadedmetadata", applyMeta, { once: true });
  mediaIO.observe(tile);
  // hover-play (десктоп): на первом наведении при необходимости дозагрузит
  tile.addEventListener("mouseenter", () => { v.play().catch(() => {}); });
  tile.addEventListener("mouseleave", () => { v.pause(); try { v.currentTime = poster; } catch (e) {} });
});

/* ---------- Фильтры ---------- */
const filters = document.getElementById("filters");
filters.addEventListener("click", e => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  filters.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
  btn.classList.add("is-active");
  const f = btn.dataset.filter;
  document.querySelectorAll(".tile").forEach(t => {
    const match = f === "all" || t.dataset.cat === f || t.dataset.label === f;
    t.classList.toggle("is-hidden", !match);
  });
});

/* ---------- Лайтбокс ---------- */
const lb      = document.getElementById("lightbox");
const lbVideo = document.getElementById("lbVideo");
const lbImg   = document.getElementById("lbImg");
const lbMeta  = document.querySelector(".lightbox__meta");
const lbTitle = document.getElementById("lbTitle");
const lbCat   = document.getElementById("lbCat");

function showLb() {
  lb.classList.add("is-open");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

// видео-работа
function openLightbox(i) {
  const p = PROJECTS[i];
  lbImg.style.display = "none";
  lbVideo.style.display = "";
  lbMeta.style.display = "";
  lbVideo.src = `assets/videos/${p.file}`;
  lbTitle.textContent = p.title;
  lbCat.textContent = p.label || CAT_LABELS[p.cat] || p.cat;
  showLb();
  lbVideo.play().catch(() => {});
}

// фото на весь экран
function openImage(src, alt) {
  lbVideo.pause();
  lbVideo.removeAttribute("src");
  lbVideo.load();
  lbVideo.style.display = "none";
  lbMeta.style.display = "none";
  lbImg.style.display = "block";
  lbImg.src = src;
  lbImg.alt = alt || "";
  showLb();
}

function closeLightbox() {
  lb.classList.remove("is-open");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lbVideo.pause();
  lbVideo.removeAttribute("src");
  lbVideo.load();
  lbImg.removeAttribute("src");
}
grid.addEventListener("click", e => {
  const tile = e.target.closest(".tile");
  if (tile) openLightbox(+tile.dataset.index);
});
document.querySelectorAll(".zoomable").forEach(img => {
  img.addEventListener("click", () => openImage(img.currentSrc || img.src, img.alt));
});
document.getElementById("lbClose").addEventListener("click", closeLightbox);
lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

/* ---------- Reveal при скролле ---------- */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

document.querySelectorAll("[data-reveal]").forEach(el => {
  // каскад: задержка по позиции среди «раскрывающихся» соседей (плиткам делей уже задан inline)
  if (!el.classList.contains("tile") && el.parentElement) {
    const sibs = [...el.parentElement.querySelectorAll(":scope > [data-reveal]")];
    const idx = Math.max(0, sibs.indexOf(el));
    el.style.setProperty("--rd", `${Math.min(idx, 8) * 42}ms`);
  }
  io.observe(el);
});

/* ---------- Кинематографичный скролл: прогресс, параллакс, герой ---------- */
if (!reduceMotion) {
  const bar        = document.getElementById("scrollProgress");
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  const heroVideo  = document.querySelector(".hero__video");
  const heroInner  = document.querySelector(".hero__inner");
  const docEl      = document.documentElement;

  let ticking = false;
  function onScrollFrame() {
    const y = window.scrollY, vh = window.innerHeight;

    // прогресс-бар
    if (bar) {
      const max = docEl.scrollHeight - docEl.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
    }

    // герой: зум видео + уплывающий контент (только десктоп — на мобилках это лишние перерисовки)
    if (y < vh * 1.1 && window.innerWidth > 900) {
      const p = Math.min(1, y / vh);
      if (heroVideo) heroVideo.style.transform = `scale(${(1 + p * 0.14).toFixed(3)})`;
      if (heroInner) {
        heroInner.style.transform = `translate3d(0, ${(y * 0.28).toFixed(1)}px, 0)`;
        heroInner.style.opacity   = Math.max(0, 1 - p * 1.15).toFixed(3);
      }
    }

    // параллакс медиа: нормализуем прохождение элемента через вьюпорт в [0..1]
    // и двигаем в небольшом диапазоне ±maxShift (чтобы не выбить картинку из overflow)
    for (const el of parallaxEls) {
      const speed = parseFloat(el.dataset.parallax) || 0;
      const r = el.getBoundingClientRect();
      let progress = (vh - r.top) / (vh + r.height);   // 0 — только входит снизу, 1 — ушёл вверх
      progress = Math.max(0, Math.min(1, progress));
      const maxShift = speed * 420;                      // 0.05 → ±21px, 0.06 → ±25px
      el.style.setProperty("--py", `${((0.5 - progress) * 2 * maxShift).toFixed(1)}px`);
    }

    ticking = false;
  }
  function requestScrollFrame() {
    if (!ticking) { requestAnimationFrame(onScrollFrame); ticking = true; }
  }
  window.addEventListener("scroll", requestScrollFrame, { passive: true });
  window.addEventListener("resize", requestScrollFrame, { passive: true });
  onScrollFrame();
}

/* ---------- Счётчики в статистике ---------- */
const countIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, target = +el.dataset.count;
    let n = 0; const step = Math.max(1, Math.ceil(target / 40));
    const tick = () => { n = Math.min(target, n + step); el.textContent = n; if (n < target) requestAnimationFrame(tick); };
    tick(); countIO.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll("[data-count]").forEach(el => countIO.observe(el));

/* ---------- Nav: фон при скролле + бургер ---------- */
const nav = document.getElementById("nav");
const links = document.querySelector(".nav__links");
const burger = document.getElementById("burger");
window.addEventListener("scroll", () => nav.classList.toggle("is-scrolled", window.scrollY > 40), { passive: true });
burger.addEventListener("click", () => { links.classList.toggle("is-open"); nav.classList.toggle("is-open"); });
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { links.classList.remove("is-open"); nav.classList.remove("is-open"); }));

/* ---------- Год в футере ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
