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
    drawer.inert = true;

    const setOpen = (open) => {
      drawer.classList.toggle("is-open", open);
      mask.classList.toggle("is-open", open);
      mask.hidden = !open;
      drawer.setAttribute("aria-hidden", String(!open));
      drawer.inert = !open;
      document.body.classList.toggle("is-locked", open);
      if (open) setFocusTrap(drawer);
      else releaseFocusTrap(drawer);
    };

    openButtons.forEach((button) => button.addEventListener("click", () => setOpen(true)));
    closeButtons.forEach((button) => button.addEventListener("click", () => setOpen(false)));
    drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) {
        event.preventDefault();
        setOpen(false);
      }
    });

    window.SKApp = window.SKApp || {};
    window.SKApp.closeDrawer = () => setOpen(false);
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
    /* 用 popover 进浏览器顶层：弹窗遮罩、原生 <dialog> 都在顶层，只有顶层盖得住 */
    toast.setAttribute("popover", "manual");
    toast.showPopover?.();
    toast.classList.add("is-visible");
    state.toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      /* 等淡出走完再退出顶层，否则看不到过渡；期间来了新提示就别退 */
      window.setTimeout(() => {
        if (!toast.classList.contains("is-visible")) toast.hidePopover?.();
      }, 200);
    }, 2400);
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

  const focusTrapState = new WeakMap();
  let activeFocusTrap = null;

  function getFocusableElements(container) {
    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    return Array.from(container.querySelectorAll(selector)).filter((element) => {
      if (element.hidden || element.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
    });
  }

  function releaseFocusTrap(container) {
    const state = focusTrapState.get(container);
    if (!state) return;
    document.removeEventListener("keydown", state.onKeydown, true);
    focusTrapState.delete(container);
    if (activeFocusTrap === container) activeFocusTrap = null;
    if (state.previous && document.contains(state.previous)) {
      state.previous.focus({ preventScroll: true });
    }
  }

  function setFocusTrap(container, options = {}) {
    if (!container) return;
    if (activeFocusTrap && activeFocusTrap !== container) releaseFocusTrap(activeFocusTrap);
    releaseFocusTrap(container);
    const previous = document.activeElement;
    const onKeydown = (event) => {
      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(container);
      if (!focusable.length) {
        event.preventDefault();
        container.tabIndex = -1;
        container.focus({ preventScroll: true });
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!container.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeydown, true);
    focusTrapState.set(container, { onKeydown, previous });
    activeFocusTrap = container;
    const initial = options.initial || getFocusableElements(container)[0] || container;
    window.requestAnimationFrame(() => initial.focus({ preventScroll: true }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initMobileDrawer();
    initReveal();
    initSectionNav();
    initPlaceholderLinks();
    initYear();
  });

  window.SKApp = Object.assign(window.SKApp || {}, {
    showToast,
    setFocusTrap,
    releaseFocusTrap,
  });
})();
