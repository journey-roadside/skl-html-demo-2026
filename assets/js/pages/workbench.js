(function () {
  "use strict";

  const shell = document.querySelector(".workbench-shell");
  const scrollRegion = document.querySelector(".workbench-scroll");
  if (!shell || !scrollRegion) return;

  const sidebar = document.querySelector(".workbench-header");
  const sidebarState = document.querySelector(".workbench-sidebar__state");
  const agentTrigger = document.querySelector("[data-agent-menu-trigger]");
  const agentMenu = document.querySelector("#workbench-agent-menu");

  /* 侧边栏收起状态持久化：跨页面跳转后保持收起或展开 */
  const SIDEBAR_STATE_KEY = "sheke-sidebar-collapsed";

  const readSidebarCollapsed = function () {
    try {
      return localStorage.getItem(SIDEBAR_STATE_KEY) === "true";
    } catch (error) {
      return false;
    }
  };

  const saveSidebarCollapsed = function (collapsed) {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, collapsed ? "true" : "false");
    } catch (error) {
      /* 隐私模式下存储不可用时忽略，仅本次会话生效 */
    }
  };

  if (sidebarState) {
    sidebarState.checked = readSidebarCollapsed();
    sidebarState.addEventListener("change", function () {
      saveSidebarCollapsed(sidebarState.checked);
    });
  }

  const syncActiveAgent = function () {
    const isAgentSquarePage = window.location.pathname.endsWith("/agent-square.html");
    document.querySelectorAll('.workbench-agent[href*="agent-square.html#"]').forEach(function (link) {
      const linkHash = new URL(link.href, window.location.href).hash;
      link.classList.toggle("is-active", isAgentSquarePage && linkHash === window.location.hash);
    });
  };

  const syncActiveProject = function () {
    const isProjectsPage = window.location.pathname.endsWith("/projects.html");
    const activeProject = isProjectsPage && window.location.hash === "#project-detail"
      ? new URLSearchParams(window.location.search).get("project")
      : null;

    document.querySelectorAll(".workbench-project__title").forEach(function (link) {
      const linkProject = new URL(link.href, window.location.href).searchParams.get("project");
      link.classList.toggle("is-active", Boolean(activeProject) && linkProject === activeProject);
    });
  };

  const updateScrollState = function () {
    shell.classList.toggle("is-list-scrolled", scrollRegion.scrollTop > 0);
  };

  const positionAgentMenu = function () {
    if (!agentTrigger || !agentMenu || agentMenu.hidden) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    const triggerRect = agentTrigger.getBoundingClientRect();
    const menuRect = agentMenu.getBoundingClientRect();
    const left = sidebarRect.right + 8;
    const maxTop = window.innerHeight - menuRect.height - 8;
    const top = Math.max(8, Math.min(triggerRect.top, maxTop));

    agentMenu.style.left = left + "px";
    agentMenu.style.top = top + "px";
  };

  const setAgentMenuOpen = function (open, restoreFocus) {
    if (!agentTrigger || !agentMenu || !sidebarState) return;

    const canOpen = Boolean(open && sidebarState.checked);
    agentMenu.hidden = !canOpen;
    agentMenu.classList.toggle("is-open", canOpen);

    if (sidebarState.checked) {
      agentTrigger.setAttribute("aria-expanded", String(canOpen));
    }

    if (canOpen) {
      positionAgentMenu();
      const firstItem = agentMenu.querySelector(".workbench-agent-menu__item");
      if (firstItem) firstItem.focus({ preventScroll: true });
    } else if (restoreFocus) {
      agentTrigger.focus({ preventScroll: true });
    }
  };

  const syncAgentMenuAccessibility = function () {
    if (!agentTrigger || !agentMenu || !sidebarState) return;

    if (sidebarState.checked) {
      agentTrigger.setAttribute("aria-haspopup", "menu");
      agentTrigger.setAttribute("aria-controls", agentMenu.id);
      agentTrigger.setAttribute("aria-expanded", String(!agentMenu.hidden));
    } else {
      agentTrigger.removeAttribute("aria-haspopup");
      agentTrigger.removeAttribute("aria-controls");
      agentTrigger.removeAttribute("aria-expanded");
    }
  };

  document.addEventListener("click", function (event) {
    const action = event.target.closest("[data-summary-action]");
    if (!action) return;
    event.stopPropagation();
    if (action.tagName !== "A") event.preventDefault();
  });

  if (sidebarState && agentTrigger && agentMenu) {
    agentTrigger.addEventListener("click", function (event) {
      if (!sidebarState.checked) return;
      event.preventDefault();
      const willOpen = agentMenu.hidden;
      setAgentMenuOpen(willOpen, !willOpen);
    });

    agentMenu.addEventListener("click", function (event) {
      if (event.target.closest(".workbench-agent-menu__item")) {
        setAgentMenuOpen(false, true);
      }
    });

    document.addEventListener("click", function (event) {
      if (agentMenu.hidden) return;
      if (agentMenu.contains(event.target) || agentTrigger.contains(event.target)) return;
      setAgentMenuOpen(false, false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !agentMenu.hidden) {
        setAgentMenuOpen(false, true);
      }
    });

    sidebarState.addEventListener("change", function () {
      setAgentMenuOpen(false, false);
      syncAgentMenuAccessibility();
    });

    syncAgentMenuAccessibility();
  }

  const userTrigger = document.querySelector("[data-user-menu-trigger]");
  const userMenu = document.querySelector("[data-user-menu]");
  const messageTrigger = document.querySelector("[data-message-center-open]");
  const messagePanel = document.querySelector("[data-message-center]");
  const messageDot = document.querySelector("[data-message-dot]");
  const messageCount = document.querySelector("[data-message-count]");

  if (messageTrigger) {
    messageTrigger.hidden = false;
  }

  const updateMessageState = function () {
    if (!messagePanel || !messageTrigger) return;

    const unreadCount = messagePanel.querySelectorAll(".workbench-message-center__item.is-unread").length;
    if (messageCount) {
      messageCount.textContent = unreadCount ? unreadCount + " 条未读" : "暂无未读消息";
    }
    if (messageDot) {
      messageDot.classList.toggle("is-hidden", unreadCount === 0);
    }
    messageTrigger.setAttribute("aria-label", unreadCount ? "消息，" + unreadCount + " 条未读" : "消息，暂无未读消息");
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (messageTrigger) {
      messageTrigger.hidden = false;
    }
    updateMessageState();
  }, { once: true });

  const setUserMenuOpen = function (open, restoreFocus) {
    if (!userTrigger || !userMenu) return;

    userMenu.hidden = !open;
    userTrigger.setAttribute("aria-expanded", String(open));
    if (open && messagePanel) {
      messagePanel.hidden = true;
      messageTrigger?.setAttribute("aria-expanded", "false");
    }
    if (restoreFocus) userTrigger.focus({ preventScroll: true });
  };

  const setMessageCenterOpen = function (open, restoreFocus) {
    if (!messageTrigger || !messagePanel) return;

    messagePanel.hidden = !open;
    messageTrigger.setAttribute("aria-expanded", String(open));
    if (open && userMenu) {
      userMenu.hidden = true;
      userTrigger?.setAttribute("aria-expanded", "false");
    }
    if (restoreFocus) messageTrigger.focus({ preventScroll: true });
  };

  if (userMenu) {
    userMenu.addEventListener("click", function (event) {
      if (event.target.closest("button")) setUserMenuOpen(false, false);
    });
  }

  if (messageTrigger && messagePanel) {
    messageTrigger.addEventListener("click", function (event) {
      event.stopPropagation();
      setMessageCenterOpen(messagePanel.hidden, false);
    });

    messagePanel.addEventListener("click", function (event) {
      const readAll = event.target.closest("[data-message-read-all]");
      if (readAll) {
        messagePanel.querySelectorAll(".workbench-message-center__item.is-unread").forEach(function (item) {
          item.classList.remove("is-unread");
        });
        updateMessageState();
        window.SKApp?.showToast?.("消息已全部标记为已读");
        return;
      }

      const item = event.target.closest(".workbench-message-center__item");
      if (item) {
        item.classList.remove("is-unread");
        updateMessageState();
      }
    });

    updateMessageState();
  }

  document.addEventListener("click", function (event) {
    if (userMenu && !userMenu.hidden && !userMenu.contains(event.target) && !userTrigger?.contains(event.target)) {
      setUserMenuOpen(false, false);
    }
    if (messagePanel && !messagePanel.hidden && !messagePanel.contains(event.target) && !messageTrigger?.contains(event.target)) {
      setMessageCenterOpen(false, false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (userMenu && !userMenu.hidden) setUserMenuOpen(false, true);
    if (messagePanel && !messagePanel.hidden) setMessageCenterOpen(false, true);
  });

    document.querySelectorAll(".workbench-dialog__title").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll(".workbench-dialog__title.is-active").forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
    });
  });

    window.addEventListener("hashchange", function () {
    syncActiveAgent();
    syncActiveProject();
  });
  window.addEventListener("popstate", syncActiveProject);
  document.addEventListener("workbench:project-detail-change", syncActiveProject);
  syncActiveAgent();
  syncActiveProject();

    scrollRegion.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", function () {
    updateScrollState();
    positionAgentMenu();
  });
  updateScrollState();
})();
