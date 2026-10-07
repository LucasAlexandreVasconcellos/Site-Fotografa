/* ============================================================
   CAROL BUENO FOTÓGRAFA — main.js
   JS mínimo: header, menu, parallax, reveal, filtros, lightbox,
   slider de depoimentos. Sem dependências.
   ============================================================ */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: fundo ao rolar ---------- */
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const closeMenu = () => {
    burger.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  };
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
    document.body.classList.toggle("no-scroll", !open);
  });
  nav.addEventListener("click", (e) => { if (e.target.tagName === "A") closeMenu(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* ---------- Parallax sutil no hero ---------- */
  const heroImg = document.getElementById("hero-img");
  if (heroImg && !prefersReduced) {
    let raf = null;
    window.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight);
        heroImg.style.transform = `translateY(${y * 0.18}px) scale(1.02)`;
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------- Reveal ao rolar ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Filtros do portfólio ---------- */
  const filters = document.querySelectorAll(".filter");
  const shots = document.querySelectorAll(".shot");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      const f = btn.dataset.filter;
      shots.forEach((s) => s.classList.toggle("is-hidden", f !== "todos" && s.dataset.cat !== f));
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbCap = document.getElementById("lb-cap");
  const visibleShots = () => [...shots].filter((s) => !s.classList.contains("is-hidden"));
  let idx = 0;
  let lastFocus = null;

  const openLb = (i) => {
    const list = visibleShots();
    idx = (i + list.length) % list.length;
    const img = list[idx].querySelector("img");
    const cap = list[idx].querySelector("figcaption");
    lbImg.src = img.src.replace(/w=\d+/, "w=1600");
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : "";
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("no-scroll");
    document.getElementById("lb-close").focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  };
  const step = (dir) => openLb(idx + dir);

  shots.forEach((s) => s.addEventListener("click", () => openLb(visibleShots().indexOf(s))));
  document.getElementById("lb-close").addEventListener("click", closeLb);
  document.getElementById("lb-prev").addEventListener("click", () => step(-1));
  document.getElementById("lb-next").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  /* Swipe no mobile */
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  /* ---------- Slider de depoimentos (manual) ---------- */
  const track = document.getElementById("slider-track");
  if (track) {
    const total = track.children.length;
    let cur = 0;
    const go = (i) => {
      cur = (i + total) % total;
      track.style.transform = `translateX(-${cur * 100}%)`;
    };
    document.getElementById("prev").addEventListener("click", () => go(cur - 1));
    document.getElementById("next").addEventListener("click", () => go(cur + 1));
  }

  /* ---------- Mini-formulário de orçamento → WhatsApp ---------- */
  const quoteForm = document.getElementById("quote-form");
  if (quoteForm) {
    const qError = document.getElementById("q-error");
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = quoteForm.nome.value.trim();
      const tipo = quoteForm.tipo.value;
      const data = quoteForm.data.value;
      if (!nome || !tipo) {
        qError.hidden = false;
        quoteForm.nome.focus();
        return;
      }
      qError.hidden = true;
      let msg = `Olá, Carol! Meu nome é ${nome} e gostaria de um orçamento para ensaio de ${tipo}.`;
      if (data) {
        const [y, m, d] = data.split("-");
        msg += ` Minha data preferida é ${d}/${m}/${y}.`;
      }
      msg += " Vim pelo site.";
      window.open(`https://wa.me/5561982991677?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    });
  }

  /* ---------- Ano no footer ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
