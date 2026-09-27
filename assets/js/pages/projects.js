(function () {
  "use strict";

  const tabs = Array.from(document.querySelectorAll("[data-project-tab]"));
  const grid = document.querySelector("[data-project-grid]");
  const emptyState = document.querySelector("[data-project-empty]");
  const searchInput = document.querySelector("[data-project-search]");
  const createButton = document.querySelector("[data-create-project]");
  const sidebarCreateButton = document.querySelector("[data-project-create-trigger]");
  const dialog = document.querySelector("[data-project-dialog]");
  const form = document.querySelector("[data-project-form]");
  const titleInput = document.querySelector("[data-project-title-input]");
  const cardTemplate = document.querySelector("[data-project-card-template]");
  const scrollRegion = document.querySelector(".projects-scroll");
  const listViews = Array.from(document.querySelectorAll("[data-project-list-view]"));
  const detailView = document.querySelector("[data-project-detail-view]");
  const detailTitle = document.querySelector("[data-project-detail-title]");
  const detailUpdated = document.querySelector("[data-project-detail-updated]");
  const detailCreated = document.querySelector("[data-project-detail-created]");
  const detailChatCount = document.querySelector("[data-project-detail-chat-count]");
  const backButton = document.querySelector("[data-project-back]");
  const composer = document.querySelector("[data-project-composer]");
  const composerInput = document.querySelector("[data-project-composer-input]");
  const sendButton = document.querySelector("[data-project-send]");
  const conversationList = document.querySelector("[data-project-conversation-list]");
  const conversationSearch = document.querySelector("[data-project-conversation-search]");
  const conversationEmpty = document.querySelector("[data-project-conversation-empty]");
  const conversationEmptyText = conversationEmpty ? conversationEmpty.querySelector("p") : null;
  const resourceFilterTrigger = document.querySelector("[data-project-resource-filter-trigger]");
  const resourceFilterMenu = document.querySelector("[data-project-resource-filter-menu]");
  const resourceFilterOptions = Array.from(document.querySelectorAll("[data-resource-filter-value]"));
  const resourceFilterAll = document.querySelector("[data-resource-filter-all]");
  const resourceList = document.querySelector("[data-project-resource-list]");
  const resourceAddButton = document.querySelector("[data-project-resource-add]");
  const resourceUploadDialog = document.querySelector("[data-resource-upload-dialog]");
  const resourceUploadForm = document.querySelector("[data-resource-upload-form]");
  const resourceUploadInput = document.querySelector("[data-resource-upload-input]");
  const resourceUploadList = document.querySelector("[data-resource-upload-list]");
  const resourceUploadCancel = document.querySelector("[data-resource-upload-cancel]");
  const resourceUploadConfirm = document.querySelector("[data-resource-upload-confirm]");
  const actionDialog = document.querySelector("[data-project-action-dialog]");
  const actionForm = document.querySelector("[data-project-action-form]");
  const actionTitle = document.querySelector("[data-project-action-title]");
  const actionMessage = document.querySelector("[data-project-action-message]");
  const actionField = document.querySelector("[data-project-action-field]");
  const actionInput = document.querySelector("[data-project-action-input]");
  const actionCancel = document.querySelector("[data-project-action-cancel]");
  const actionConfirm = document.querySelector("[data-project-action-confirm]");

  if (!tabs.length || !grid || !emptyState || !searchInput) return;

  let activeStatus = "active";
  let currentProject = null;
  let pendingCard = null;
  let pendingConversation = null;
  let pendingResource = null;
  let pendingAction = "";
  let menuId = 0;
  const selectedResourceTypes = new Set();

  const conversationTemplates = [
    { name: "明曜AI系统先进性评估", date: "09-18" },
    { name: "中国量子计算发展近况", date: "09-18" },
    { name: "研究框架与核心问题梳理", date: "09-16" },
    { name: "相关资料与案例对比", date: "09-14" },
    { name: "阶段性结论整理", date: "09-12" },
    { name: "数据与来源核查", date: "09-10" },
    { name: "后续研究计划讨论", date: "09-08" }
  ];

  const getCards = function () {
    return Array.from(grid.querySelectorAll("[data-project-card]"));
  };

  const scrollToTop = function () {
    if (scrollRegion) scrollRegion.scrollTo({ top: 0, behavior: "auto" });
  };

  const showProjectList = function () {
    if (!detailView) return;
    listViews.forEach(function (view) {
      view.hidden = false;
    });
    detailView.hidden = true;
    document.title = "项目列表 · 湖北社科数据信息联盟";
    const params = new URLSearchParams(location.search);
    params.delete("project");
    const query = params.toString();
    history.replaceState(null, "", location.pathname + (query ? "?" + query : ""));
    document.dispatchEvent(new CustomEvent("workbench:project-detail-change"));
    scrollToTop();

    if (currentProject) {
      const link = currentProject.querySelector("[data-project-link]");
      if (link) link.focus({ preventScroll: true });
    }
  };

  const openProjectDetail = function (card) {
    if (!detailView || !detailTitle) return;

    currentProject = card;
    listViews.forEach(function (view) {
      view.hidden = true;
    });
    detailView.hidden = false;
    detailTitle.textContent = card.dataset.title;
    detailUpdated.textContent = card.querySelector("[data-card-updated]").textContent;
    detailCreated.textContent = card.querySelector("[data-card-created]").textContent;
    detailChatCount.textContent = card.dataset.chatCount;
    renderProjectConversations(card);
    document.title = card.dataset.title + " · 项目详情 · 湖北社科数据信息联盟";
    const params = new URLSearchParams(location.search);
    params.set("project", card.dataset.title);
    history.replaceState(null, "", location.pathname + "?" + params.toString() + "#project-detail");
    document.dispatchEvent(new CustomEvent("workbench:project-detail-change"));
    scrollToTop();
  };

  const prepareCardLink = function (card) {
    if (card.querySelector("[data-project-link]")) return;

    const link = document.createElement("a");
    link.className = "projects-card__link";
    link.href = "#project-detail";
    link.setAttribute("data-project-link", "");
    link.setAttribute("aria-label", "打开" + card.dataset.title + "项目详情");
    link.addEventListener("click", function () {
      openProjectDetail(card);
    });
    card.prepend(link);
  };

  const closeProjectMenu = function (card) {
    if (!card) return;

    const panel = card.querySelector("[data-project-menu-panel]");
    const button = card.querySelector(".projects-card__menu");
    if (panel) panel.hidden = true;
    if (button) button.setAttribute("aria-expanded", "false");
  };

  const closeAllProjectMenus = function (exceptCard) {

  getCards().forEach(function (card) {
      if (card !== exceptCard) closeProjectMenu(card);
    });
  };

  const openActionDialog = function (card, action) {
    if (!actionDialog || !actionForm || !actionInput) return;

    pendingCard = card;
    pendingConversation = null;
    pendingResource = null;
    pendingAction = action;

    if (action === "rename") {
      actionTitle.textContent = "重命名项目";
      actionMessage.textContent = "修改项目名称后，项目中的对话和资源不会受到影响。";
      actionField.hidden = false;
      actionInput.hidden = false;
      actionInput.required = true;
      actionInput.value = card.dataset.title;
      actionConfirm.textContent = "保存";
      actionConfirm.classList.add("projects-dialog__button--primary");
      actionConfirm.classList.remove("projects-dialog__button--danger");
      actionDialog.showModal();
      /* 只聚焦到末尾，不做全选：全选会套用全局 ::selection（淡桃底 + 橙字），
         视觉上像变成了提示文字 */
      actionInput.focus();
      const end = actionInput.value.length;
      actionInput.setSelectionRange(end, end);
      return;
    }

    if (action === "archive" || action === "unarchive") {
      const isArchive = action === "archive";
      actionTitle.textContent = isArchive ? "归档项目" : "取消归档";
      actionMessage.textContent = isArchive
        ? "确定要归档“" + card.dataset.title + "”吗？归档后可在“已归档”中查看。"
        : "确定要将“" + card.dataset.title + "”移回未归档吗？";
      actionField.hidden = true;
      actionInput.hidden = true;
      actionInput.required = false;
      actionInput.value = "";
      actionConfirm.textContent = isArchive ? "归档" : "取消归档";
      actionConfirm.classList.add("projects-dialog__button--primary");
      actionConfirm.classList.remove("projects-dialog__button--danger");
      actionDialog.showModal();
      actionConfirm.focus();
      return;
    }

    actionTitle.textContent = "删除项目";
    actionMessage.textContent = "确定要删除“" + card.dataset.title + "”吗？删除后无法恢复。";
    actionField.hidden = true;
    actionInput.hidden = true;
    actionInput.required = false;
    actionInput.value = "";
    actionConfirm.textContent = "删除";
    actionConfirm.classList.remove("projects-dialog__button--primary");
    actionConfirm.classList.add("projects-dialog__button--danger");
    actionDialog.showModal();
    actionConfirm.focus();
  };

  const createMenuItem = function (label, action, danger) {
    const button = document.createElement("button");
    button.className = "projects-card__menu-item" + (danger ? " projects-card__menu-item--danger" : "");
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.dataset.projectAction = action;
    button.textContent = label;
    return button;
  };

  const openProjectMenu = function (card) {
    const panel = card.querySelector("[data-project-menu-panel]");
    const button = card.querySelector(".projects-card__menu");
    if (!panel || !button) return;

    const willOpen = panel.hidden;
    closeAllProjectMenus(card);
    if (!willOpen) {
      closeProjectMenu(card);
      return;
    }

    const actions = card.dataset.status === "archived"
      ? [
          ["取消归档", "unarchive", false],
          ["删除", "delete", true]
        ]
      : [
          ["重命名", "rename", false],
          ["归档", "archive", false],
          ["删除", "delete", true]
        ];

    panel.replaceChildren();
    actions.forEach(function (item) {
      panel.appendChild(createMenuItem(item[0], item[1], item[2]));
    });
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
  };

  const prepareCardMenu = function (card) {
    if (card.querySelector("[data-project-menu-panel]")) return;

    const button = card.querySelector(".projects-card__menu");
    if (!button) return;

    menuId += 1;
    const panel = document.createElement("div");
    panel.className = "projects-card__menu-panel";
    panel.id = "project-menu-" + menuId;
    panel.setAttribute("role", "menu");
    panel.setAttribute("data-project-menu-panel", "");
    panel.hidden = true;

    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-controls", panel.id);
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      openProjectMenu(card);
    });

    panel.addEventListener("click", function (event) {
      const actionButton = event.target.closest("[data-project-action]");
      if (!actionButton) return;

      event.stopPropagation();
      const action = actionButton.dataset.projectAction;
      closeProjectMenu(card);

      openActionDialog(card, action);
    });

    card.appendChild(panel);
  };

  const renderProjects = function () {
    const keyword = searchInput.value.trim().toLocaleLowerCase("zh-CN");
    let visibleCount = 0;

    getCards().forEach(function (card) {
      const matchesStatus = card.dataset.status === activeStatus;
      const matchesKeyword = !keyword || card.dataset.title.toLocaleLowerCase("zh-CN").includes(keyword);
      card.hidden = !(matchesStatus && matchesKeyword);
      if (card.hidden) closeProjectMenu(card);
      if (!card.hidden) visibleCount += 1;
    });

    grid.hidden = visibleCount === 0;
    emptyState.hidden = visibleCount !== 0;
  };

  const renderConversations = function () {
    if (!conversationList || !conversationEmpty) return;

    const keyword = conversationSearch.value.trim().toLocaleLowerCase("zh-CN");
    const items = Array.from(conversationList.querySelectorAll(".project-detail__conversation-item"));
    let visibleCount = 0;

    items.forEach(function (item) {
      const nameNode = item.querySelector(".project-detail__conversation-name");
      const name = (nameNode ? nameNode.textContent : "").toLocaleLowerCase("zh-CN");
      item.hidden = Boolean(keyword) && !name.includes(keyword);
      if (!item.hidden) visibleCount += 1;
    });

    conversationList.hidden = visibleCount === 0;
    conversationEmpty.hidden = visibleCount !== 0;
    if (conversationEmptyText) {
      conversationEmptyText.textContent = keyword ? "没有找到符合条件的对话" : "暂无对话";
    }
  };

  const setResourceFilterMenuOpen = function (open) {
    if (!resourceFilterTrigger || !resourceFilterMenu) return;
    resourceFilterMenu.hidden = !open;
    resourceFilterTrigger.setAttribute("aria-expanded", String(open));
  };

  const closeConversationMenu = function (item) {
    if (!item) return;
    const panel = item.querySelector("[data-conversation-menu]");
    const more = item.querySelector(".project-detail__conversation-more");
    if (panel) panel.hidden = true;
    if (more) more.setAttribute("aria-expanded", "false");
  };

  const closeAllConversationMenus = function (exceptItem) {
    if (!conversationList) return;
    Array.from(conversationList.querySelectorAll(".project-detail__conversation-item")).forEach(function (item) {
      if (item !== exceptItem) closeConversationMenu(item);
    });
  };

  // ponytail: 静态原型没有会话池，“移出项目”与“删除”都只把对话从本项目移除，仅确认文案不同
  const openConversationActionDialog = function (item, action) {
    if (!actionDialog || !actionForm || !item) return;

    const nameNode = item.querySelector(".project-detail__conversation-name");
    const name = nameNode ? nameNode.textContent : "该对话";
    const isDelete = action === "delete";

    pendingCard = null;
    pendingConversation = item;
    pendingResource = null;
    pendingAction = isDelete ? "conversation-delete" : "conversation-remove";

    actionTitle.textContent = isDelete ? "删除对话" : "移出项目";
    actionMessage.textContent = isDelete
      ? "确定要删除“" + name + "”吗？删除后无法恢复。"
      : "确定要将“" + name + "”移出该项目吗？";
    actionField.hidden = true;
    actionInput.hidden = true;
    actionInput.required = false;
    actionInput.value = "";
    actionConfirm.textContent = isDelete ? "删除" : "移出";
    actionConfirm.classList.toggle("projects-dialog__button--primary", !isDelete);
    actionConfirm.classList.toggle("projects-dialog__button--danger", isDelete);
    actionDialog.showModal();
    actionConfirm.focus();
  };

  // 只解除本项目的引用，公共资料本身不销毁
  const openResourceDeleteDialog = function (item) {
    if (!actionDialog || !actionForm || !item) return;

    const nameNode = item.querySelector(".project-detail__resource-copy strong");
    const name = nameNode ? nameNode.textContent : "该资料";

    pendingCard = null;
    pendingConversation = null;
    pendingResource = item;
    pendingAction = "resource-delete";

    actionTitle.textContent = "删除项目资料";
    actionMessage.textContent = "确定要在本项目删除“" + name + "”吗？公共资料本身不会被移除。";
    actionField.hidden = true;
    actionInput.hidden = true;
    actionInput.required = false;
    actionInput.value = "";
    actionConfirm.textContent = "删除";
    actionConfirm.classList.remove("projects-dialog__button--primary");
    actionConfirm.classList.add("projects-dialog__button--danger");
    actionDialog.showModal();
    actionConfirm.focus();
  };

  const removeConversation = function (item) {
    if (!item || !item.parentNode) return;
    item.remove();

    if (currentProject) {
      const nextCount = Math.max(0, (Number(currentProject.dataset.chatCount) || 0) - 1);
      currentProject.dataset.chatCount = String(nextCount);
      if (detailChatCount) detailChatCount.textContent = String(nextCount);
      const cardCount = currentProject.querySelector("[data-card-chat-count]");
      if (cardCount) cardCount.textContent = String(nextCount);
    }

    renderConversations();
  };

  const renderResources = function () {
    // 实时查询而非缓存快照，否则上传新增的资料不会被格式筛选捕获
    Array.from(document.querySelectorAll("[data-resource-type]")).forEach(function (item) {
      item.hidden = selectedResourceTypes.size > 0 && !selectedResourceTypes.has(item.dataset.resourceType);
    });
    resourceFilterOptions.forEach(function (option) {
      option.setAttribute("aria-checked", String(selectedResourceTypes.has(option.dataset.resourceFilterValue)));
    });
    // 「全部」即未勾选任何格式，取消最后一个格式勾选会自动回到「全部」
    if (resourceFilterAll) {
      resourceFilterAll.setAttribute("aria-checked", String(selectedResourceTypes.size === 0));
    }
  };

  const createConversationItem = function (name, dateText) {
    const item = document.createElement("li");
    item.className = "project-detail__conversation-item";

    const button = document.createElement("button");
    button.className = "project-detail__conversation-open";
    button.type = "button";

    const icon = document.createElement("span");
    icon.className = "project-detail__conversation-icon";
    icon.setAttribute("aria-hidden", "true");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "workbench-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z");
    svg.appendChild(path);
    icon.appendChild(svg);

    const label = document.createElement("span");
    label.className = "project-detail__conversation-name";
    label.textContent = name;

    const date = document.createElement("span");
    date.className = "project-detail__conversation-date";
    date.textContent = dateText || "刚刚";

    button.append(icon, label, date);

    const more = document.createElement("button");
    more.className = "project-detail__conversation-more";
    more.type = "button";
    more.setAttribute("aria-label", name + "对话操作");
    more.setAttribute("aria-haspopup", "menu");
    more.setAttribute("aria-expanded", "false");
    const dots = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    dots.setAttribute("class", "workbench-icon");
    dots.setAttribute("viewBox", "0 0 24 24");
    dots.setAttribute("fill", "none");
    dots.setAttribute("stroke", "currentColor");
    dots.setAttribute("stroke-width", "1.8");
    dots.setAttribute("stroke-linecap", "round");
    dots.setAttribute("stroke-linejoin", "round");
    dots.setAttribute("aria-hidden", "true");
    [5, 12, 19].forEach(function (cx) {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", String(cx));
      dot.setAttribute("cy", "12");
      dot.setAttribute("r", "1");
      dots.appendChild(dot);
    });
    more.appendChild(dots);

    const panel = document.createElement("div");
    panel.className = "projects-card__menu-panel project-detail__conversation-menu";
    panel.setAttribute("role", "menu");
    panel.setAttribute("aria-label", name + "对话操作");
    panel.setAttribute("data-conversation-menu", "");
    panel.hidden = true;
    [
      ["移出项目", "remove", false],
      ["删除", "delete", true]
    ].forEach(function (action) {
      const actionButton = document.createElement("button");
      actionButton.className = "projects-card__menu-item" + (action[2] ? " projects-card__menu-item--danger" : "");
      actionButton.type = "button";
      actionButton.setAttribute("role", "menuitem");
      actionButton.dataset.conversationAction = action[1];
      actionButton.textContent = action[0];
      panel.appendChild(actionButton);
    });

    item.append(button, more, panel);
    return item;
  };

  const renderProjectConversations = function (card) {
    if (!conversationList || !conversationEmpty) return;

    const count = Math.max(0, Number(card.dataset.chatCount) || 0);
    conversationList.replaceChildren();
    conversationTemplates.slice(0, count).forEach(function (item) {
      conversationList.appendChild(createConversationItem(item.name, item.date));
    });
    conversationSearch.value = "";
    selectedResourceTypes.clear();
    setResourceFilterMenuOpen(false);
    renderResources();
    if (conversationEmptyText) {
      conversationEmptyText.textContent = count === 0 ? "暂无对话" : "没有找到符合条件的对话";
    }
    renderConversations();
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activeStatus = tab.dataset.projectTab;
      tabs.forEach(function (item) {
        item.setAttribute("aria-selected", String(item === tab));
      });
      closeAllProjectMenus();
      renderProjects();
    });
  });

  searchInput.addEventListener("input", renderProjects);

  if (backButton) {
    backButton.addEventListener("click", showProjectList);
  }

  if (conversationSearch) {
    conversationSearch.addEventListener("input", renderConversations);
  }

  // 事件委托：静态种子项与后续动态生成的对话项共用同一套开合逻辑
  if (conversationList) {
    conversationList.addEventListener("click", function (event) {
      const more = event.target.closest(".project-detail__conversation-more");
      if (more) {
        event.stopPropagation();
        const item = more.closest(".project-detail__conversation-item");
        const panel = item ? item.querySelector("[data-conversation-menu]") : null;
        if (!panel) return;

        const willOpen = panel.hidden;
        closeAllConversationMenus(item);
        panel.hidden = !willOpen;
        more.setAttribute("aria-expanded", String(willOpen));
        return;
      }

      const actionButton = event.target.closest("[data-conversation-action]");
      if (actionButton) {
        event.stopPropagation();
        const item = actionButton.closest(".project-detail__conversation-item");
        closeConversationMenu(item);
        openConversationActionDialog(item, actionButton.dataset.conversationAction);
      }
    });
  }

  if (resourceFilterTrigger && resourceFilterMenu) {
    resourceFilterTrigger.addEventListener("click", function (event) {
      event.stopPropagation();
      setResourceFilterMenuOpen(resourceFilterMenu.hidden);
    });

    if (resourceFilterAll) {
      resourceFilterAll.addEventListener("click", function () {
        selectedResourceTypes.clear();
        renderResources();
      });
    }

    resourceFilterOptions.forEach(function (option) {
      option.addEventListener("click", function () {
        const type = option.dataset.resourceFilterValue;
        if (selectedResourceTypes.has(type)) selectedResourceTypes.delete(type);
        else selectedResourceTypes.add(type);
        renderResources();
      });
    });
  }

  if (composer && composerInput && sendButton && conversationList) {
    composerInput.addEventListener("input", function () {
      sendButton.disabled = !composerInput.value.trim();
    });

    composer.addEventListener("submit", function (event) {
      event.preventDefault();
      const content = composerInput.value.trim();
      if (!content) return;

      conversationList.appendChild(createConversationItem(content));
      if (currentProject) {
        const nextCount = (Number(currentProject.dataset.chatCount) || 0) + 1;
        currentProject.dataset.chatCount = String(nextCount);
        detailChatCount.textContent = String(nextCount);
        const cardCount = currentProject.querySelector("[data-card-chat-count]");
        if (cardCount) cardCount.textContent = String(nextCount);
      }
      composerInput.value = "";
      sendButton.disabled = true;
      conversationSearch.value = "";
      renderConversations();
      composerInput.focus();
    });
  }

  // 唯一的点号解析处：分隔点须在首位之后，否则 .gitignore 会被拆成空名
  const splitResourceFileName = function (fileName) {
    const separator = fileName.lastIndexOf(".");
    return separator > 0
      ? { base: fileName.slice(0, separator), extension: fileName.slice(separator + 1).toUpperCase() }
      : { base: fileName, extension: "" };
  };

  // 名称去掉扩展名，格式已由元信息行单独展示
  const getResourceName = function (fileName) {
    return splitResourceFileName(fileName).base;
  };

  // 展示标签统一用扩展名（.md → MD），只把长写法的 .markdown 也归到 MD
  const RESOURCE_DISPLAY_LABELS = { MARKDOWN: "MD" };

  // 筛选分类必须对齐筛选菜单取值：Word 统一归入 DOCX，否则勾选筛选时刚上传的 .doc 会消失
  const RESOURCE_FILTER_TYPES = {
    PDF: "PDF",
    DOC: "DOCX",
    DOCX: "DOCX",
    TXT: "TXT",
    MD: "Markdown",
    MARKDOWN: "Markdown"
  };

  const getResourceType = function (fileName) {
    const extension = splitResourceFileName(fileName).extension;
    return RESOURCE_FILTER_TYPES[extension] || extension || "其他";
  };

  const getResourceLabel = function (fileName) {
    const extension = splitResourceFileName(fileName).extension;
    return RESOURCE_DISPLAY_LABELS[extension] || extension || "文件";
  };

  const formatFileSize = function (bytes) {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    if (bytes >= 1024) return Math.round(bytes / 1024) + " KB";
    return bytes + " B";
  };

  const createResourceItem = function (file) {
    const item = document.createElement("li");
    item.className = "project-detail__resource-item";
    item.dataset.resourceType = getResourceType(file.name);

    /* 与静态种子的资料项同构：点击名称区新窗口打开该文件的查看页 */
    const copy = document.createElement("a");
    copy.className = "project-detail__resource-copy";
    copy.href = "./reader.html?source=project&file=" + encodeURIComponent(file.name);
    copy.target = "_blank";
    copy.rel = "noopener";
    const name = document.createElement("strong");
    name.textContent = getResourceName(file.name);
    const meta = document.createElement("small");
    meta.textContent = getResourceLabel(file.name) + " · " + formatFileSize(file.size);
    copy.append(name, meta);

    const date = document.createElement("span");
    date.className = "project-detail__resource-date";
    date.textContent = "刚刚";

    const remove = document.createElement("button");
    remove.className = "project-detail__resource-remove";
    remove.type = "button";
    remove.dataset.resourceRemove = "";
    remove.setAttribute("aria-label", "从项目中删除" + file.name);
    const removeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    removeIcon.setAttribute("class", "workbench-icon");
    removeIcon.setAttribute("viewBox", "0 0 24 24");
    removeIcon.setAttribute("fill", "none");
    removeIcon.setAttribute("stroke", "currentColor");
    removeIcon.setAttribute("stroke-width", "1.8");
    removeIcon.setAttribute("stroke-linecap", "round");
    removeIcon.setAttribute("stroke-linejoin", "round");
    removeIcon.setAttribute("aria-hidden", "true");
    ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"].forEach(function (d) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      removeIcon.appendChild(path);
    });
    remove.appendChild(removeIcon);

    item.append(copy, date, remove);
    return item;
  };

  let pendingUploadFiles = [];

  const renderPendingUploadFiles = function () {
    if (!resourceUploadList || !resourceUploadConfirm) return;

    resourceUploadList.replaceChildren();
    resourceUploadList.hidden = pendingUploadFiles.length === 0;
    resourceUploadConfirm.disabled = pendingUploadFiles.length === 0;

    pendingUploadFiles.forEach(function (file, index) {
      const row = document.createElement("li");
      row.className = "projects-dialog__file";

      const name = document.createElement("span");
      name.className = "projects-dialog__file-name";
      name.textContent = file.name;

      const size = document.createElement("span");
      size.className = "projects-dialog__file-size";
      size.textContent = formatFileSize(file.size);

      const remove = document.createElement("button");
      remove.className = "projects-dialog__file-remove";
      remove.type = "button";
      remove.dataset.resourceUploadRemove = String(index);
      remove.setAttribute("aria-label", "移除" + file.name);
      remove.textContent = "×";

      row.append(name, size, remove);
      resourceUploadList.appendChild(row);
    });
  };

  if (resourceAddButton && resourceUploadDialog && resourceUploadForm) {
    resourceAddButton.addEventListener("click", function () {
      pendingUploadFiles = [];
      if (resourceUploadInput) resourceUploadInput.value = "";
      renderPendingUploadFiles();
      resourceUploadDialog.showModal();
    });

    if (resourceUploadCancel) {
      resourceUploadCancel.addEventListener("click", function () {
        resourceUploadDialog.close();
      });
    }

    if (resourceUploadInput) {
      resourceUploadInput.addEventListener("change", function () {
        Array.from(resourceUploadInput.files).forEach(function (file) {
          const duplicate = pendingUploadFiles.some(function (item) {
            return item.name === file.name && item.size === file.size;
          });
          if (!duplicate) pendingUploadFiles.push(file);
        });
        // 清空 value，否则再次选择同一文件时 change 不会触发
        resourceUploadInput.value = "";
        renderPendingUploadFiles();
      });
    }

    if (resourceUploadList) {
      resourceUploadList.addEventListener("click", function (event) {
        const removeButton = event.target.closest("[data-resource-upload-remove]");
        if (!removeButton) return;

        pendingUploadFiles.splice(Number(removeButton.dataset.resourceUploadRemove), 1);
        renderPendingUploadFiles();
      });
    }

    resourceUploadForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!pendingUploadFiles.length) return;

      if (resourceList) {
        // 倒序 prepend，保持先选中的文件排在上方
        pendingUploadFiles.slice().reverse().forEach(function (file) {
          resourceList.prepend(createResourceItem(file));
        });
      }

      pendingUploadFiles = [];
      if (resourceUploadInput) resourceUploadInput.value = "";
      renderPendingUploadFiles();
      renderResources();
      resourceUploadDialog.close();
    });
  }

  // 事件委托：静态种子资料与上传新增的资料共用同一套删除逻辑
  if (resourceList) {
    resourceList.addEventListener("click", function (event) {
      const removeButton = event.target.closest("[data-resource-remove]");
      if (!removeButton) return;
      openResourceDeleteDialog(removeButton.closest(".project-detail__resource-item"));
    });
  }

  const cancelButton = document.querySelector("[data-project-cancel]");

  if (cancelButton && dialog) {
    cancelButton.addEventListener("click", function () {
      dialog.close();
    });
  }

  if (createButton && dialog && form && titleInput && cardTemplate) {
    const openCreateDialog = function () {
      form.reset();
      dialog.showModal();
      titleInput.focus();
    };

    createButton.addEventListener("click", openCreateDialog);
    if (sidebarCreateButton) sidebarCreateButton.addEventListener("click", openCreateDialog);

    /* 其它页面的「新建项目」入口带 ?create=1 跳过来，落地即弹出新建弹窗 */
    if (location.search.indexOf("create=1") !== -1) openCreateDialog();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const title = titleInput.value.trim();
      if (!title) return;

      const card = cardTemplate.content.firstElementChild.cloneNode(true);
      const now = new Date();
      const createdText = new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(now);

      card.dataset.title = title;
      card.dataset.status = "active";
      card.dataset.updated = now.toISOString();
      card.dataset.created = now.toISOString();
      card.dataset.chatCount = "0";
      card.querySelector("[data-card-title]").textContent = title;
      card.querySelector("[data-card-description]").textContent = "尚未添加项目说明。";
      card.querySelector("[data-card-updated]").textContent = "刚刚更新";
      card.querySelector("[data-card-created]").textContent = "创建于 " + createdText;
      card.querySelector("[data-card-chat-count]").textContent = "0";
      prepareCardLink(card);
      prepareCardMenu(card);
      grid.appendChild(card);

      activeStatus = "active";
      tabs.forEach(function (tab) {
        tab.setAttribute("aria-selected", String(tab.dataset.projectTab === activeStatus));
      });
      searchInput.value = "";
      dialog.close();
      renderProjects();
    });
  }

  if (actionForm && actionDialog && actionCancel) {
    actionCancel.addEventListener("click", function () {
      actionDialog.close();
    });

    actionForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (pendingConversation) {
        const item = pendingConversation;
        pendingConversation = null;
        pendingAction = "";
        actionDialog.close();
        removeConversation(item);
        return;
      }

      if (pendingResource) {
        const item = pendingResource;
        pendingResource = null;
        pendingAction = "";
        actionDialog.close();
        if (item) item.remove();
        return;
      }

      if (!pendingCard || !pendingAction) return;

      if (pendingAction === "rename") {
        const nextTitle = actionInput.value.trim();
        if (!nextTitle) return;

        pendingCard.dataset.title = nextTitle;
        const titleNode = pendingCard.querySelector(".projects-card__title");
        if (titleNode) titleNode.textContent = nextTitle;
        const link = pendingCard.querySelector("[data-project-link]");
        const menu = pendingCard.querySelector(".projects-card__menu");
        if (link) link.setAttribute("aria-label", "打开" + nextTitle + "项目详情");
        if (menu) menu.setAttribute("aria-label", nextTitle + "项目操作");
      } else if (pendingAction === "archive") {
        pendingCard.dataset.status = "archived";
      } else if (pendingAction === "unarchive") {
        pendingCard.dataset.status = "active";
      } else if (pendingAction === "delete") {
        pendingCard.remove();
      }

      pendingCard = null;
      pendingAction = "";
      actionDialog.close();
      renderProjects();
    });
  }

  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-project-resource-filter-menu]") && !event.target.closest("[data-project-resource-filter-trigger]")) {
      setResourceFilterMenuOpen(false);
    }
    closeAllConversationMenus();
    if (event.target.closest("[data-project-menu-panel]") || event.target.closest(".projects-card__menu")) return;
    closeAllProjectMenus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAllProjectMenus();
      closeAllConversationMenus();
      setResourceFilterMenuOpen(false);
    }
  });

  document.querySelectorAll("[data-project-mode-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      const nextPressed = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(nextPressed));
      button.classList.toggle("is-on", nextPressed);
    });
  });
  getCards().forEach(function (card) {
    prepareCardLink(card);
    prepareCardMenu(card);
  });
  renderProjects();
  renderConversations();
  renderResources();

  if (location.hash === "#project-detail") {
    const requestedProject = new URLSearchParams(location.search).get("project");
    const requestedCard = requestedProject
      ? getCards().find(function (card) {
          return card.dataset.title === requestedProject;
        })
      : null;
    const targetCard = requestedCard || getCards().find(function (card) {
      return !card.hidden;
    });
    if (targetCard) openProjectDetail(targetCard);
  }

  window.addEventListener("hashchange", function () {
    if (location.hash !== "#project-detail" && detailView && !detailView.hidden) {
      showProjectList();
    }
  });
})();