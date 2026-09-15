(function () {
  "use strict";

  const SIDEBAR_COLLAPSED_KEY = "sheke-sidebar-collapsed";
  let settingsModal;
  let settingsMask;

  function createSettingsModal() {
    settingsMask = document.createElement("div");
    settingsMask.className = "settings-mask";
    settingsMask.dataset.settingsMask = "";
    settingsMask.hidden = true;

    settingsModal = document.createElement("section");
    settingsModal.className = "settings-modal";
    settingsModal.dataset.settingsModal = "";
    settingsModal.setAttribute("role", "dialog");
    settingsModal.setAttribute("aria-modal", "true");
    settingsModal.setAttribute("aria-labelledby", "settingsTitle");
    settingsModal.hidden = true;
    settingsModal.innerHTML = `
      <div class="settings-head">
        <div>
          <h2 id="settingsTitle">设置</h2>
          <p>设置会应用于社科智研工作台</p>
        </div>
        <button class="settings-close" type="button" data-settings-close aria-label="关闭设置">
          <span data-icon="x"></span>
        </button>
      </div>
      <div class="settings-grid">
        <nav class="settings-nav" aria-label="设置分类">
          <button class="is-active" type="button">通用</button>
          <button type="button">回答偏好</button>
          <button type="button">隐私与数据</button>
        </nav>
        <div class="settings-body">
          <section class="settings-section">
            <h3>通用设置</h3>
            <div class="settings-row">
              <div><strong>显示引用来源</strong><p>在回答中展示资料编号和来源摘要。</p></div>
              <label class="settings-switch"><input type="checkbox" checked><span></span></label>
            </div>
            <div class="settings-row">
              <div><strong>保留对话记录</strong><p>允许在历史记录中查找当前会话。</p></div>
              <label class="settings-switch"><input type="checkbox" checked><span></span></label>
            </div>
            <div class="settings-row">
              <div><strong>语音自动播放</strong><p>AI 回答完成后自动播放语音。</p></div>
              <label class="settings-switch"><input type="checkbox"><span></span></label>
            </div>
          </section>
        </div>
      </div>
      <div class="settings-actions">
        <button class="btn btn-outline" type="button" data-settings-close>取消</button>
        <button class="btn btn-primary" type="button" data-settings-save>保存设置</button>
      </div>
    `;

    document.body.append(settingsMask, settingsModal);
    window.SKIcons.hydrate(settingsModal);
  }

  function openSettings() {
    settingsMask.hidden = false;
    settingsModal.hidden = false;
    requestAnimationFrame(() => {
      settingsMask.classList.add("is-open");
      settingsModal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
  }

  function closeSettings() {
    settingsMask.classList.remove("is-open");
    settingsModal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      settingsMask.hidden = true;
      settingsModal.hidden = true;
    }, 220);
  }

  function initSidebar() {
    const sidebar = document.querySelector("[data-app-sidebar]");
    const mask = document.querySelector("[data-app-sidebar-mask]");
    if (!sidebar || !mask) return;

    const setOpen = (open) => {
      sidebar.classList.toggle("is-open", open);
      mask.classList.toggle("is-open", open);
      mask.hidden = !open;
    };

    document.querySelectorAll("[data-app-sidebar-open]").forEach((button) => {
      button.addEventListener("click", () => setOpen(true));
    });
    document.querySelectorAll("[data-app-sidebar-close]").forEach((button) => {
      button.addEventListener("click", () => setOpen(false));
    });
    sidebar.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  }

  function initSidebarCollapse() {
    const sidebar = document.querySelector("[data-app-sidebar]");
    const container = sidebar?.closest(".app-shell, .source-intake-view");
    const head = sidebar?.querySelector(".app-sidebar-head");
    if (!sidebar || !container || !head) return;

    const actions = document.createElement("div");
    actions.className = "app-sidebar-head-actions";
    const toggle = document.createElement("button");
    toggle.className = "app-sidebar-collapse";
    toggle.type = "button";
    toggle.dataset.sidebarCollapse = "";
    toggle.innerHTML = '<span data-icon="panel-right"></span>';
    actions.append(toggle);
    head.append(actions);
    window.SKIcons.hydrate(toggle);

    const setCollapsed = (collapsed) => {
      container.classList.toggle("is-sidebar-collapsed", collapsed);
      toggle.setAttribute("aria-expanded", String(!collapsed));
      toggle.setAttribute("aria-label", collapsed ? "展开侧边栏" : "收起侧边栏");
      toggle.title = collapsed ? "展开侧边栏" : "收起侧边栏";
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
      } catch {}
    };

    let initiallyCollapsed = false;
    try {
      initiallyCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    } catch {}
    setCollapsed(initiallyCollapsed);
    toggle.addEventListener("click", () => {
      setCollapsed(!container.classList.contains("is-sidebar-collapsed"));
    });
  }

  function initMessageCenter() {
    const userRoot = document.querySelector(".app-sidebar-user");
    if (!userRoot || userRoot.querySelector("[data-message-center-open]")) return;

    const trigger = document.createElement("button");
    trigger.className = "app-sidebar-message-trigger";
    trigger.type = "button";
    trigger.dataset.messageCenterOpen = "";
    trigger.setAttribute("aria-label", "消息通知");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = `
      <span data-icon="bell"></span>
      <span class="app-sidebar-message-dot"></span>
    `;

    const panel = document.createElement("section");
    panel.className = "app-sidebar-message-center";
    panel.dataset.messageCenter = "";
    panel.setAttribute("aria-label", "消息通知");
    panel.hidden = true;
    panel.innerHTML = `
      <div class="message-center-head">
        <div>
          <strong>消息通知</strong>
          <span data-message-count>3 条未读</span>
        </div>
        <button type="button" data-message-read-all>全部已读</button>
      </div>
      <div class="message-center-list">
        <button class="message-center-item is-unread" type="button">
          <span class="message-center-item-head"><strong>深度研究已完成</strong><time>10 分钟前</time></span>
          <span class="message-center-item-copy">“基层公共文化服务数字化研究”已生成研究摘要与来源清单。</span>
        </button>
        <button class="message-center-item is-unread" type="button">
          <span class="message-center-item-head"><strong>积分已到账</strong><time>今天 09:20</time></span>
          <span class="message-center-item-copy">内容贡献通过审核，已获得 30 积分。</span>
        </button>
        <button class="message-center-item is-unread" type="button">
          <span class="message-center-item-head"><strong>账号安全提示</strong><time>昨天 18:03</time></span>
          <span class="message-center-item-copy">你的账号在新设备上完成登录，如非本人操作请及时处理。</span>
        </button>
      </div>
    `;

    const chip = userRoot.querySelector(".user-chip-trigger");
    const row = document.createElement("div");
    row.className = "app-sidebar-user-row";
    userRoot.insertBefore(row, chip);
    row.append(chip, trigger);
    userRoot.append(panel);
    window.SKIcons.hydrate(trigger);

    const setOpen = (open) => {
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      trigger.classList.toggle("is-active", open);
      if (open && menu) menu.hidden = true;
    };

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(panel.hidden);
    });
    userRoot.querySelector("[data-user-menu-trigger]")?.addEventListener("click", () => setOpen(false));

    panel.querySelector("[data-message-read-all]").addEventListener("click", () => {
      panel.querySelectorAll(".message-center-item.is-unread").forEach((item) => {
        item.classList.remove("is-unread");
      });
      trigger.querySelector(".app-sidebar-message-dot")?.classList.add("is-hidden");
      panel.querySelector("[data-message-count]").textContent = "暂无未读消息";
      window.SKApp.showToast("消息已全部标记为已读");
    });

    panel.querySelectorAll(".message-center-item").forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.remove("is-unread");
        const unreadCount = panel.querySelectorAll(".message-center-item.is-unread").length;
        panel.querySelector("[data-message-count]").textContent = unreadCount
          ? `${unreadCount} 条未读`
          : "暂无未读消息";
        if (!unreadCount) trigger.querySelector(".app-sidebar-message-dot")?.classList.add("is-hidden");
      });
    });

    document.addEventListener("click", (event) => {
      if (!userRoot.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function initSettings() {
    createSettingsModal();

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-settings-open]")) {
        openSettings();
        return;
      }

      if (event.target.closest("[data-settings-close]") || event.target === settingsMask) {
        closeSettings();
        return;
      }

      if (event.target.closest("[data-settings-save]")) {
        closeSettings();
        window.SKApp.showToast("设置已保存");
      }
    });
  }

  function initUserMenuActions() {
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-user-menu-toast]");
      if (!action) return;
      const menu = action.closest("[data-user-menu]");
      if (menu) menu.hidden = true;
      window.SKApp.showToast(action.dataset.userMenuToast);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initSidebarCollapse();
    initMessageCenter();
    initSettings();
    initUserMenuActions();
  });
})();
