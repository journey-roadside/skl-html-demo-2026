(function () {
  "use strict";

  const header = document.querySelector("[data-portal-header]");
  const drawer = document.querySelector("[data-portal-menu]");
  const drawerMask = document.querySelector("[data-portal-menu-mask]");
  const menuOpen = document.querySelector("[data-portal-menu-open]");
  const toast = document.querySelector("[data-portal-toast]");
  let toastTimer = 0;

  function setDrawerOpen(open) {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    drawerMask.hidden = !open;
    menuOpen.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function initHeader() {
    const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  function initDrawer() {
    menuOpen.addEventListener("click", () => setDrawerOpen(true));
    document.querySelector("[data-portal-menu-close]")?.addEventListener("click", () => setDrawerOpen(false));
    drawerMask?.addEventListener("click", () => setDrawerOpen(false));
    drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setDrawerOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    });
  }

  function animateCounter(node) {
    if (node.dataset.counted === "true") return;
    node.dataset.counted = "true";
    const target = Number(node.dataset.count);
    if (!Number.isFinite(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const duration = 700;
    const start = performance.now();
    const suffix = target >= 1000 ? "+" : "+";

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      node.textContent = target >= 1000 ? `${value.toLocaleString("zh-CN")}${suffix}` : `${value}${target === 48 ? "" : suffix}`;
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  function initMetrics() {
    const metrics = document.querySelectorAll("[data-count]");
    if (!("IntersectionObserver" in window)) {
      metrics.forEach(animateCounter);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });
    metrics.forEach((metric) => observer.observe(metric));
  }

  function initActiveNav() {
    const sections = ["home", "news", "outcomes", "alliance"].map((id) => document.getElementById(id)).filter(Boolean);
    const links = Array.from(document.querySelectorAll(".portal-nav a[href^='#']"));
    const sync = () => {
      let activeId = sections[0]?.id;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 150) activeId = section.id;
      });
      links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`));
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }

  function initPlaceholders() {
    document.querySelectorAll("[data-portal-placeholder]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showToast(link.dataset.portalPlaceholder);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initDrawer();
    initMetrics();
    initActiveNav();
    initPlaceholders();
    window.SKIcons?.hydrate();
  });
})();
