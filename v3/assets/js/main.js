(function () {
  "use strict";

  const state = {
    toastTimer: 0,
  };

  function initHeader() {
    const header = document.querySelector("[data-header]");
    if (!header) return;

    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initMobileDrawer() {
    const drawer = document.querySelector("[data-drawer]");
    const mask = document.querySelector("[data-drawer-mask]");
    const openButtons = document.querySelectorAll("[data-drawer-open]");
    const closeButtons = document.querySelectorAll("[data-drawer-close]");

    if (!drawer || !mask) return;

    const setOpen = (open) => {
      drawer.classList.toggle("is-open", open);
      mask.classList.toggle("is-open", open);
      mask.hidden = !open;
      drawer.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("is-locked", open);
    };

    openButtons.forEach((button) => button.addEventListener("click", () => setOpen(true)));
    closeButtons.forEach((button) => button.addEventListener("click", () => setOpen(false)));
    drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));

    window.SKApp = window.SKApp || {};
    window.SKApp.closeDrawer = () => setOpen(false);
  }

  function initUserMenu() {
    const trigger = document.querySelector("[data-user-menu-trigger]");
    const menu = document.querySelector("[data-user-menu]");
    if (!trigger || !menu) return;

    const setOpen = (open) => {
      menu.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
    };

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(menu.hidden);
    });

    document.addEventListener("click", (event) => {
      if (menu.hidden || menu.contains(event.target)) return;
      setOpen(false);
    });
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    items.forEach((item) => observer.observe(item));
  }

  function initSectionNav() {
    const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link[href^='#']"));
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${visible.target.id}`;
          link.classList.toggle("is-active", active);
        });
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0.05, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
  }

  function showToast(message) {
    let toast = document.querySelector("[data-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.dataset.toast = "";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }

    window.clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function initPlaceholderLinks() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-placeholder]");
      if (!link) return;
      if (link.hasAttribute("data-requires-auth")) return;
      event.preventDefault();
      showToast(`${link.dataset.placeholder}将在下一阶段生成`);
    });
  }

  function initYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initMobileDrawer();
    initUserMenu();
    initReveal();
    initSectionNav();
    initPlaceholderLinks();
    initYear();
  });

  window.SKApp = Object.assign(window.SKApp || {}, {
    showToast,
  });
})();
