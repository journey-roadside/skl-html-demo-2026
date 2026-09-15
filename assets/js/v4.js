(function () {
  "use strict";

  const THEME_STORAGE_KEY = "sheke-v4-theme";

  function getThemeSetting() {
    let stored = "跟随系统";
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY) || "跟随系统";
    } catch {}
    return ["跟随系统", "深色", "浅色"].includes(stored) ? stored : "跟随系统";
  }

  function applyTheme(theme, persist = false) {
    const resolvedTheme =
      theme === "跟随系统"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "深色"
          : "浅色"
        : theme;
    document.documentElement.classList.toggle("dark", resolvedTheme === "深色");
    document.documentElement.style.colorScheme = resolvedTheme === "深色" ? "dark" : "light";
    if (persist) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {}
    }
  }

  applyTheme(getThemeSetting());

  function showDemoUser() {
    const userChip = document.querySelector("[data-user-chip]");
    const guestActions = document.querySelector("[data-guest-actions]");
    if (userChip) userChip.hidden = false;
    if (guestActions) guestActions.hidden = true;
  }

  function getResearchRows() {
    return Array.from(document.querySelectorAll(".research-list .research-row"));
  }

  const RESEARCH_PAGE_SIZE = 10;
  let researchOverviewPage = 1;
  let previousOverviewTitle = "";
  let researchItemMenu = null;
  let researchModalMode = "";
  let researchModalRow = null;

  function getResearchTitle(row) {
    return row?.querySelector(".research-item-copy strong")?.textContent.trim() || "";
  }

  function seedResearchProjects() {
    const list = document.querySelector(".research-list");
    if (!list) return;
    const titles = [
      "社区公共文化服务供需匹配机制",
      "基层公共文化设施运营绩效研究",
      "社科数据治理与开放共享",
      "公共文化数字化平台协同",
      "县域社会治理创新案例",
      "社会心态与网络舆情研究",
      "基层协商民主实践路径",
      "文化遗产数字化保护",
      "公共政策执行偏差研究",
      "城乡基本公共服务均等化",
      "社会组织参与社区治理",
      "数字包容与老年群体服务",
      "科普传播效果评估",
      "地方文化品牌建设路径",
      "社会科学成果评价机制",
      "数据要素治理制度研究",
      "基层应急治理能力建设",
      "青年群体社会参与研究",
      "人工智能与社会治理",
      "公共文化服务标准化",
      "区域协调发展政策评估",
      "社会调查数据质量控制",
      "智库成果转化机制",
    ];

    titles.forEach((title) => {
      const row = document.createElement("div");
      row.className = "research-row";

      const item = document.createElement("button");
      item.className = "research-item";
      item.type = "button";
      item.dataset.researchItem = "";

      const copy = document.createElement("span");
      copy.className = "research-item-copy";
      const titleNode = document.createElement("strong");
      titleNode.textContent = title;
      copy.append(titleNode);
      item.append(copy);

      const more = document.createElement("button");
      more.className = "history-more";
      more.type = "button";
      more.dataset.researchMore = "";
      more.setAttribute("aria-label", "更多操作");
      more.innerHTML = '<span data-icon="ellipsis"></span>';

      row.append(item, more);
      list.append(row);
      window.SKIcons.hydrate(row);
    });
  }

  function updateResearchExpandState() {
    const expandButton = document.querySelector("[data-research-expand]");
    if (expandButton) expandButton.hidden = getResearchRows().length <= 5;
  }

  function closeResearchItemMenu() {
    researchItemMenu?.remove();
    researchItemMenu = null;
  }

  function openResearchItemMenu(trigger, row) {
    closeResearchItemMenu();
    const menu = document.createElement("div");
    menu.className = "research-item-menu";
    menu.innerHTML = `
      <button type="button" data-research-menu-action="edit">
        <span data-icon="pencil"></span>
        <span>编辑标题</span>
      </button>
      <button type="button" data-research-menu-action="delete">
        <span data-icon="trash-2"></span>
        <span>删除</span>
      </button>
    `;
    document.body.append(menu);
    window.SKIcons.hydrate(menu);

    const rect = trigger.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - menu.offsetWidth - 12);
    const top = Math.min(rect.bottom + 6, window.innerHeight - menu.offsetHeight - 12);
    menu.style.left = `${Math.max(12, left)}px`;
    menu.style.top = `${Math.max(12, top)}px`;

    menu.querySelector('[data-research-menu-action="edit"]').addEventListener("click", () => {
      closeResearchItemMenu();
      openResearchModal("edit", row);
    });
    menu.querySelector('[data-research-menu-action="delete"]').addEventListener("click", () => {
      closeResearchItemMenu();
      openResearchModal("delete", row);
    });
    researchItemMenu = menu;
  }

  function renderResearchOverview() {
    const overviewList = document.querySelector("[data-research-overview-list]");
    const overviewCount = document.querySelector("[data-research-overview-count]");
    const loadMore = document.querySelector("[data-research-load-more]");
    if (!overviewList) return;

    const rows = getResearchRows();
    const items = rows.map((row) => row.querySelector("[data-research-item]")).filter(Boolean);
    const visibleItems = items.slice(0, researchOverviewPage * RESEARCH_PAGE_SIZE);
    overviewList.replaceChildren();

    visibleItems.forEach((item, index) => {
      const title = item.querySelector("strong")?.textContent.trim() || `研究 ${index + 1}`;
      const row = item.closest(".research-row");
      const card = document.createElement("article");
      card.className = `research-overview-item${item.classList.contains("is-active") ? " is-active" : ""}`;
      card.innerHTML = `
        <button class="research-overview-open" type="button">
          <strong>${title}</strong>
        </button>
        <div class="research-overview-actions">
          <button type="button" data-research-overview-action="edit" title="编辑标题" aria-label="编辑标题">
            <span data-icon="pencil"></span>
          </button>
          <button type="button" data-research-overview-action="delete" title="删除" aria-label="删除">
            <span data-icon="trash-2"></span>
          </button>
          <span class="research-overview-divider" aria-hidden="true"></span>
          <button class="research-overview-go" type="button" title="打开项目" aria-label="打开项目">
            <span data-icon="chevron-right"></span>
          </button>
        </div>
      `;
      card.querySelector(".research-overview-open").addEventListener("click", () => {
        item.click();
      });
      card.querySelector(".research-overview-go").addEventListener("click", () => {
        item.click();
      });
      card.querySelector('[data-research-overview-action="edit"]').addEventListener("click", () => {
        openResearchModal("edit", row);
      });
      card.querySelector('[data-research-overview-action="delete"]').addEventListener("click", () => {
        openResearchModal("delete", row);
      });
      window.SKIcons.hydrate(card);
      overviewList.append(card);
    });

    if (overviewCount) overviewCount.textContent = `共 ${items.length} 个项目`;
    if (loadMore) loadMore.hidden = visibleItems.length >= items.length;
  }

  function setResearchOverview(open, resetPage = false) {
    const overview = document.querySelector("[data-research-overview]");
    const chatArea = document.querySelector(".chat-area");
    const chatScroll = document.querySelector(".chat-scroll");
    const composerWrap = document.querySelector(".composer-wrap");
    const chatHead = document.querySelector("[data-chat-head]");
    const chatTitle = document.querySelector("[data-chat-title]");
    const chatTitleEdit = document.querySelector("[data-chat-title-edit]");
    if (!overview || !chatArea || !chatScroll) return;

    if (open) {
      const settingsView = document.querySelector("[data-settings-view]");
      if (settingsView && !settingsView.hidden) setSettingsView(false);
      if (resetPage) researchOverviewPage = 1;
      previousOverviewTitle = chatTitle?.textContent.trim() || "";
      renderResearchOverview();
      if (chatTitleEdit) chatTitleEdit.hidden = true;
      chatArea.classList.add("is-research-overview");
      chatScroll.hidden = true;
      if (composerWrap) composerWrap.hidden = true;
      document.querySelector("[data-source-panel]")?.classList.remove("is-open");
      document.querySelector("[data-question-history-panel]")?.classList.remove("is-open");
      overview.hidden = false;
      return;
    }

    overview.hidden = true;
    chatArea.classList.remove("is-research-overview");
    chatScroll.hidden = false;
    if (composerWrap) composerWrap.hidden = false;
    if (chatTitle && previousOverviewTitle) chatTitle.textContent = previousOverviewTitle;
    if (chatTitleEdit && chatHead) {
      chatTitleEdit.hidden = chatHead.classList.contains("is-new-conversation");
    }
  }

  function setSettingsView(open) {
    const settingsView = document.querySelector("[data-settings-view]");
    const chatArea = document.querySelector(".chat-area");
    const chatScroll = document.querySelector(".chat-scroll");
    const composerWrap = document.querySelector(".composer-wrap");
    const chatHead = document.querySelector("[data-chat-head]");
    const chatTitleEdit = document.querySelector("[data-chat-title-edit]");
    if (!settingsView || !chatArea || !chatScroll) return;

    if (open) {
      const overview = document.querySelector("[data-research-overview]");
      if (overview && !overview.hidden) setResearchOverview(false);
      chatArea.classList.add("is-settings-view");
      chatScroll.hidden = true;
      if (composerWrap) composerWrap.hidden = true;
      if (chatTitleEdit) chatTitleEdit.hidden = true;
      document.querySelector("[data-source-panel]")?.classList.remove("is-open");
      document.querySelector("[data-session-files-panel]")?.classList.remove("is-open");
      document.querySelector("[data-question-history-panel]")?.classList.remove("is-open");
      settingsView.hidden = false;
      return;
    }

    settingsView.hidden = true;
    chatArea.classList.remove("is-settings-view");
    chatScroll.hidden = false;
    if (composerWrap) composerWrap.hidden = false;
    if (chatTitleEdit && chatHead) {
      chatTitleEdit.hidden = chatHead.classList.contains("is-new-conversation");
    }
  }

  function closeResearchModal() {
    const mask = document.querySelector("[data-research-modal-mask]");
    const modal = document.querySelector("[data-research-modal]");
    if (!mask || !modal) return;
    mask.classList.remove("is-open");
    modal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      mask.hidden = true;
      modal.hidden = true;
    }, 220);
  }

  function openResearchModal(mode, row) {
    const mask = document.querySelector("[data-research-modal-mask]");
    const modal = document.querySelector("[data-research-modal]");
    const title = document.querySelector("[data-research-modal-title]");
    const description = document.querySelector("[data-research-modal-description]");
    const field = document.querySelector("[data-research-modal-field]");
    const input = document.querySelector("[data-research-modal-input]");
    const message = document.querySelector("[data-research-modal-message]");
    const confirm = document.querySelector("[data-research-modal-confirm]");
    if (!mask || !modal || !row) return;

    researchModalMode = mode;
    researchModalRow = row;
    const projectTitle = getResearchTitle(row);
    const isEdit = mode === "edit";

    title.textContent = isEdit ? "编辑项目标题" : "删除研究项目";
    description.textContent = isEdit
      ? "输入新的项目标题，保存后同步更新列表。"
      : "删除后无法恢复，请确认是否继续。";
    field.hidden = !isEdit;
    message.hidden = isEdit;
    message.textContent = `确认删除“${projectTitle}”？`;
    confirm.textContent = isEdit ? "保存" : "删除";
    confirm.classList.toggle("is-danger", !isEdit);
    input.value = projectTitle;

    mask.hidden = false;
    modal.hidden = false;
    requestAnimationFrame(() => {
      mask.classList.add("is-open");
      modal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    if (isEdit) {
      window.setTimeout(() => {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }, 50);
    }
  }

  function confirmResearchModal() {
    if (!researchModalRow) return;

    if (researchModalMode === "edit") {
      const input = document.querySelector("[data-research-modal-input]");
      const nextTitle = input?.value.trim() || "";
      if (!nextTitle) {
        window.SKApp.showToast("项目标题不能为空");
        input?.focus();
        return;
      }
      const titleNode = researchModalRow.querySelector(".research-item-copy strong");
      if (titleNode) titleNode.textContent = nextTitle;
    } else if (researchModalMode === "delete") {
      const wasActive = researchModalRow.querySelector("[data-research-item]")?.classList.contains("is-active");
      researchModalRow.remove();
      if (wasActive) {
        document.querySelector("[data-research-item]")?.classList.add("is-active");
      }
      updateResearchExpandState();
    }

    const overview = document.querySelector("[data-research-overview]");
    if (overview && !overview.hidden) setResearchOverview(true);
    closeResearchModal();
  }

  function initResearchModal() {
    const mask = document.querySelector("[data-research-modal-mask]");
    const modal = document.querySelector("[data-research-modal]");
    const input = document.querySelector("[data-research-modal-input]");
    if (!mask || !modal) return;

    document.querySelector("[data-research-modal-confirm]")?.addEventListener("click", confirmResearchModal);
    document.querySelectorAll("[data-research-modal-close]").forEach((button) => {
      button.addEventListener("click", closeResearchModal);
    });
    mask.addEventListener("click", closeResearchModal);
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        confirmResearchModal();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        event.preventDefault();
        closeResearchModal();
      }
    });
  }

  function initNavigation() {
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-nav-toast]");
      if (!action) return;
      window.SKApp.showToast(action.dataset.navToast);
    });

    document.querySelectorAll("[data-auth-nav-url]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!window.SKAuth?.getUser()) {
          window.SKAuth?.open();
          return;
        }
        window.location.href = button.dataset.authNavUrl;
      });
    });

    document.querySelectorAll("[data-research-item]").forEach((item) => {
      item.addEventListener("click", () => {
        const title = item.querySelector("strong")?.textContent.trim() || "该研究项目";
        window.SKApp.showToast(`“${title}”深度研究页面后续接入`);
      });
    });

    document.querySelectorAll("[data-research-more]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openResearchItemMenu(button, button.closest(".research-row"));
      });
    });

    document.querySelectorAll("[data-history-item]").forEach((item) => {
      item.addEventListener("click", () => {
        setSettingsView(false);
        setResearchOverview(false);
        document.querySelectorAll("[data-research-item]").forEach((entry) => {
          entry.classList.remove("is-active");
        });
      });
    });

    document.querySelectorAll("[data-new-conversation]").forEach((button) => {
      button.addEventListener("click", () => {
        setSettingsView(false);
        setResearchOverview(false);
        document.querySelectorAll("[data-research-item]").forEach((entry) => {
          entry.classList.remove("is-active");
        });
      });
    });

    const expandButton = document.querySelector("[data-research-expand]");
    updateResearchExpandState();
    expandButton?.addEventListener("click", () => setResearchOverview(true, true));
    document.querySelector("[data-research-load-more]")?.addEventListener("click", () => {
      researchOverviewPage += 1;
      renderResearchOverview();
    });
    document.querySelector("[data-research-overview-close]")?.addEventListener("click", () => {
      setResearchOverview(false);
    });

    document.addEventListener("click", (event) => {
      if (researchItemMenu && !researchItemMenu.contains(event.target)) {
        closeResearchItemMenu();
      }
    });
    document.querySelector("[data-sidebar-scroll-region]")?.addEventListener("scroll", closeResearchItemMenu);
    window.addEventListener("resize", closeResearchItemMenu);
  }

  function initComposerExtras() {
    document.querySelectorAll('[data-composer-add-item="我的知识"]').forEach((button) => {
      button.addEventListener("click", () => {
        window.SKApp.showToast("已打开我的知识资料选择");
      });
    });
  }

  function initUserMenuActions() {
    const syncUserMenuAuthState = () => {
      const loggedIn = Boolean(window.SKAuth?.getUser());
      const userRoot = document.querySelector(".app-sidebar-user");
      const userChip = document.querySelector("[data-user-chip]");
      const messageTrigger = document.querySelector("[data-message-center-open]");
      const messagePanel = document.querySelector("[data-message-center]");
      if (userChip) userChip.hidden = false;
      if (userRoot) userRoot.classList.toggle("is-logged-out", !loggedIn);
      if (messageTrigger) messageTrigger.hidden = !loggedIn;
      if (!loggedIn && messagePanel) messagePanel.hidden = true;
      document.querySelectorAll("[data-sidebar-user-label]").forEach((node) => {
        node.textContent = loggedIn ? "未知研究员" : "未登录";
      });
      document.querySelectorAll("[data-auth-only]").forEach((node) => {
        node.hidden = !loggedIn;
      });
      document.querySelectorAll("[data-guest-only]").forEach((node) => {
        node.hidden = loggedIn;
      });
      document.querySelectorAll("[data-settings-auth-only]").forEach((node) => {
        node.hidden = !loggedIn;
      });
      document.querySelectorAll("[data-settings-guest-only]").forEach((node) => {
        node.hidden = loggedIn;
      });
    };

    syncUserMenuAuthState();
    document.addEventListener("sk:auth-changed", syncUserMenuAuthState);

    document.querySelectorAll("[data-feedback-open]").forEach((button) => {
      button.addEventListener("click", () => {
        const menu = document.querySelector("[data-user-menu]");
        const trigger = document.querySelector("[data-user-menu-trigger]");
        if (menu) menu.hidden = true;
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    });

    document.querySelectorAll("[data-settings-open]").forEach((button) => {
      button.addEventListener("click", () => {
        const menu = document.querySelector("[data-user-menu]");
        const trigger = document.querySelector("[data-user-menu-trigger]");
        if (menu) menu.hidden = true;
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        setSettingsView(true);
      });
    });

    document.querySelectorAll("[data-auth-login]").forEach((button) => {
      button.addEventListener("click", () => {
        const menu = document.querySelector("[data-user-menu]");
        const trigger = document.querySelector("[data-user-menu-trigger]");
        if (menu) menu.hidden = true;
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        window.SKAuth?.open();
      });
    });

    document.querySelectorAll("[data-settings-view-close]").forEach((button) => {
      button.addEventListener("click", () => setSettingsView(false));
    });
  }

  function initCollapsedToolbar() {
    const expandButton = document.querySelector("[data-collapsed-sidebar-expand]");
    const sidebarToggle = document.querySelector("[data-sidebar-collapse]");
    expandButton?.addEventListener("click", () => sidebarToggle?.click());
  }

  function initSettingsSelects() {
    document.querySelectorAll("[data-settings-select]").forEach((select) => {
      const trigger = select.querySelector("[data-settings-select-trigger]");
      const menu = select.querySelector("[data-settings-select-menu]");
      const label = select.querySelector("[data-settings-select-label]");
      if (!trigger || !menu || !label) return;

      const setOpen = (open) => {
        menu.hidden = !open;
        trigger.setAttribute("aria-expanded", String(open));
      };

      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        setOpen(menu.hidden);
      });

      menu.querySelectorAll("[data-settings-select-value]").forEach((option) => {
        option.addEventListener("click", (event) => {
          event.stopPropagation();
          label.textContent = option.dataset.settingsSelectValue;
          menu.querySelectorAll("[data-settings-select-value]").forEach((item) => {
            const selected = item === option;
            item.classList.toggle("is-selected", selected);
            item.setAttribute("aria-selected", String(selected));
          });
          setOpen(false);
          if (select.dataset.settingsSelectName === "主题") {
            applyTheme(option.dataset.settingsSelectValue, true);
          }
          window.SKApp.showToast(`${select.dataset.settingsSelectName || "设置项"}已切换为${option.dataset.settingsSelectValue}`);
        });
      });

      document.addEventListener("click", (event) => {
        if (!select.contains(event.target)) setOpen(false);
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !menu.hidden) setOpen(false);
      });
    });
  }

  function initThemeSetting() {
    const theme = getThemeSetting();
    const select = document.querySelector('[data-settings-select-name="主题"]');
    const label = select?.querySelector("[data-settings-select-label]");
    if (label) label.textContent = theme;
    select?.querySelectorAll("[data-settings-select-value]").forEach((option) => {
      const selected = option.dataset.settingsSelectValue === theme;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-selected", String(selected));
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      if (getThemeSetting() === "跟随系统") applyTheme("跟随系统");
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncSystemTheme);
    }
  }

  function initSidebarScrollIndicator() {
    const region = document.querySelector("[data-sidebar-scroll-region]");
    if (!region) return;
    let timer = 0;

    const updateGutter = () => {
      const gutter = Math.max(0, region.offsetWidth - region.clientWidth);
      region.style.setProperty("--sidebar-scrollbar-gutter", `${gutter}px`);
    };

    updateGutter();
    window.addEventListener("resize", updateGutter, { passive: true });

    region.addEventListener(
      "scroll",
      () => {
        region.classList.add("is-scrolling");
        window.clearTimeout(timer);
        timer = window.setTimeout(() => region.classList.remove("is-scrolling"), 650);
      },
      { passive: true },
    );
  }

  function initDefaultState() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("settings") === "1") {
      setSettingsView(true);
      return;
    }

    const conversationTitle = params.get("conversation");
    if (conversationTitle) {
      const historyItems = Array.from(document.querySelectorAll("[data-history-item]"));
      const target =
        historyItems.find(
          (item) => item.querySelector(".history-item-text")?.textContent.trim() === conversationTitle,
        ) || historyItems[0];
      target?.click();
      return;
    }

    const newConversation = document.querySelector("[data-new-conversation]");
    newConversation?.click();
  }

  document.addEventListener("DOMContentLoaded", () => {
    showDemoUser();
    seedResearchProjects();
    initNavigation();
    initComposerExtras();
    initUserMenuActions();
    initCollapsedToolbar();
    initSettingsSelects();
    initThemeSetting();
    initSidebarScrollIndicator();
    initResearchModal();
    initDefaultState();
  });
})();
