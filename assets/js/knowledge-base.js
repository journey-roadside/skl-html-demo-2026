(function () {
  "use strict";

  const state = {
    filter: "community-shared",
    mainFilter: "community-shared",
    personalFilter: "personal-all",
    view: "main",
    page: 1,
    search: "",
    personalSearch: "",
    editCardId: null,
    deleteCardId: null,
  };
  const PAGE_SIZE = 20;

  const simulatedLibraries = [
    ["education-policy", "教育政策研究资料", 148, "mine", "is-governance", "database", "10 分钟前更新"],
    ["social-innovation", "社会治理创新案例", 112, "shared", "is-culture", "share", "今天 13:20 更新"],
    ["jingchu-culture", "荆楚文化研究专题", 93, "shared", "is-journals", "share", "今天 09:45 更新"],
    ["public-performance", "公共服务绩效评估", 205, "mine", "is-regional", "database", "昨天 18:10 更新"],
    ["talent-development", "人才发展与区域创新", 76, "shared", "is-results", "share", "昨天 16:32 更新"],
    ["green-development", "生态治理与绿色发展", 168, "shared", "is-regional", "share", "近7天更新"],
    ["grassroots-party", "基层党建研究资料", 132, "mine", "is-governance", "database", "近7天更新"],
    ["public-opinion", "舆情治理与传播研究", 64, "shared", "is-culture", "share", "今天 11:08 更新"],
    ["social-security", "社会保障政策库", 219, "mine", "is-journals", "database", "昨天 14:55 更新"],
    ["county-governance", "县域治理案例集", 157, "shared", "is-results", "share", "昨天 10:26 更新"],
    ["social-science-fund", "社科基金项目成果", 386, "shared", "is-journals", "share", "今天 08:44 更新"],
    ["digital-culture-standard", "文化数字化标准库", 58, "mine", "is-culture", "file-text", "近7天更新"],
    ["aging-policy", "老龄化与社会政策", 145, "shared", "is-governance", "share", "近7天更新"],
    ["urban-renewal", "城市更新与社区治理", 124, "mine", "is-regional", "database", "昨天 12:18 更新"],
    ["policy-evaluation", "政策评估方法资料", 87, "mine", "is-journals", "file-text", "近7天更新"],
    ["intangible-heritage", "湖北非遗保护研究", 109, "shared", "is-results", "share", "今天 10:02 更新"],
    ["ai-ethics", "科技伦理与 AI 治理", 72, "shared", "is-culture", "share", "今天 15:40 更新"],
    ["rural-public-service", "农村公共服务专题", 198, "mine", "is-governance", "database", "昨天 19:06 更新"],
    ["regional-collaboration", "区域协同发展案例", 134, "shared", "is-journals", "share", "近7天更新"],
    ["social-survey-data", "社会调查数据汇编", 276, "shared", "is-regional", "share", "今天 09:12 更新"],
  ];

  const communitySharedTitles = [
    "基层治理观察",
    "公共文化服务实践",
    "数字政府案例",
    "社会组织参与",
    "社区协商议事",
    "城乡融合发展",
    "县域治理经验",
    "基层法治建设",
    "社区养老服务",
    "儿童友好社区",
    "志愿服务案例",
    "韧性社区建设",
    "基层应急管理",
    "老旧小区改造",
    "乡村文化建设",
    "社区数据治理",
    "基层人才观察",
    "民生服务创新",
    "社会工作案例",
    "社区空间更新",
  ];

  const officialFeaturedTitles = [
    "年度优秀调研报告",
    "基层治理精品案例",
    "公共服务创新成果",
    "数字化转型示范",
    "社科成果精选",
    "社会治理研究前沿",
    "优秀政策分析",
    "区域发展专题",
    "文化传承案例",
    "青年学者观点",
    "智库报告精选",
    "社会调查优秀成果",
    "治理创新案例",
    "城市研究精选",
    "乡村振兴成果",
    "研究综述精品",
    "公共政策案例",
    "数据研究报告",
    "学术论文精选",
    "研究成果汇编",
  ];

  const extraCommunitySharedTitles = [];
  ["城市", "县域", "乡村", "街道", "社区", "乡镇"].forEach((scope) => {
    ["公共服务", "数字治理", "社会组织", "养老服务", "文化建设", "协商议事"].forEach(
      (theme) => {
        extraCommunitySharedTitles.push(`${scope}${theme}共享资料`);
      },
    );
  });

  const extraOfficialFeaturedTitles = [];
  ["基层治理", "公共文化", "区域发展", "数字政府"].forEach((scope) => {
    ["优秀调研报告", "精品案例", "研究成果", "专题报告", "政策分析", "学术观点"].forEach(
      (type) => {
        extraOfficialFeaturedTitles.push(`${scope}${type}`);
      },
    );
  });

  const favoriteTitles = [
    "政策评估工具箱",
    "城市治理经典案例",
    "公共文化服务创新",
    "基层调研方法合集",
    "区域协调发展专题",
    "数字政府建设观察",
    "社会调查数据精选",
    "乡村振兴实践案例",
    "养老服务研究专题",
    "社区治理经验汇编",
    "学术写作规范指南",
    "社科基金申报参考",
    "统计分析方法手册",
    "公共政策比较研究",
    "基层党建案例集",
    "文化传承研究成果",
  ];

  const modalMask = document.querySelector("[data-kb-modal-mask]");
  const createModal = document.querySelector("[data-kb-create-modal]");
  const editModal = document.querySelector("[data-kb-card-edit-modal]");
  const deleteModal = document.querySelector("[data-kb-card-delete-modal]");
  const galleryGrid = document.querySelector("[data-kb-gallery-grid]");
  const galleryEmpty = document.querySelector("[data-kb-gallery-empty]");
  const pagination = document.querySelector("[data-kb-pagination]");
  let activeModal = null;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getCards() {
    return Array.from(document.querySelectorAll("[data-kb-card]"));
  }

  function applyFilters() {
    const keyword = state.search.trim().toLowerCase();
    const personalKeyword = state.personalSearch.trim().toLowerCase();
    const matches = [];

    getCards().forEach((card) => {
      const categories = (card.dataset.kbCategories || "").split(/\s+/);
      const matchesCategory =
        state.filter === "personal-all"
          ? ["mine", "shared", "favorite"].some((category) => categories.includes(category))
          : categories.includes(state.filter);
      const cardText = [
        card.dataset.kbName || "",
        card.querySelector(".kb-card-meta")?.textContent || "",
        card.querySelector(".kb-card-update")?.textContent || "",
      ]
        .join(" ")
        .toLowerCase();
      const matchesKeyword = state.view === "personal"
        ? !personalKeyword || cardText.includes(personalKeyword)
        : !keyword || (card.dataset.kbName || "").toLowerCase().includes(keyword);
      if (matchesCategory && matchesKeyword) matches.push(card);
    });

    const maxPage = state.view === "personal"
      ? Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
      : 1;
    state.page = Math.min(Math.max(1, state.page), maxPage);

    const start = state.view === "personal" ? (state.page - 1) * PAGE_SIZE : 0;
    const end = state.view === "personal" ? start + PAGE_SIZE : matches.length;
    getCards().forEach((card) => {
      card.hidden = true;
    });
    matches.slice(start, end).forEach((card) => {
      card.hidden = false;
    });

    galleryGrid.hidden = matches.length === 0;
    galleryEmpty.hidden = matches.length > 0;
    renderPagination(matches.length, maxPage);
  }

  function renderPagination(total, maxPage) {
    if (!pagination) return;
    const showPagination = state.view === "personal" && total > PAGE_SIZE;
    pagination.hidden = !showPagination;
    if (!showPagination) {
      pagination.replaceChildren();
      return;
    }

    pagination.innerHTML = Array.from({ length: maxPage }, (_, index) => {
      const page = index + 1;
      const active = page === state.page;
      return `<button class="${active ? "is-active" : ""}" type="button" data-kb-page="${page}" aria-current="${active ? "page" : "false"}">${page}</button>`;
    }).join("");
  }

  function setGalleryView(view, filter) {
    const personal = view === "personal";
    const galleryInner = document.querySelector(".kb-gallery-inner");
    const mainFilters = document.querySelector("[data-kb-main-filters]");
    const personalView = document.querySelector("[data-kb-personal-view]");
    const personalEntry = document.querySelector("[data-kb-personal-open]");
    const communityHeading = document.querySelector(".kb-gallery-heading");
    const communitySearch = document.querySelector(".kb-hero-search");
    const floatingSearch = document.querySelector("[data-kb-floating-search]");
    const activeFilter = filter || (personal ? state.personalFilter : state.mainFilter);

    state.filter = activeFilter;
    state.view = view;
    state.page = 1;
    if (personal) {
      state.personalFilter = activeFilter;
    } else {
      state.mainFilter = activeFilter;
    }

    if (mainFilters) mainFilters.hidden = personal;
    if (personalView) personalView.hidden = !personal;
    if (personalEntry) personalEntry.hidden = personal;
    if (communityHeading) communityHeading.hidden = personal;
    if (communitySearch) communitySearch.hidden = personal;
    galleryInner?.classList.toggle("is-personal", personal);
    if (personal && floatingSearch) {
      floatingSearch.classList.remove("is-visible");
      floatingSearch.setAttribute("aria-hidden", "true");
    }

    const activeGroup = personal ? personalView : mainFilters;
    activeGroup?.querySelectorAll("[data-kb-gallery-filter]").forEach((button) => {
      const active = button.dataset.kbGalleryFilter === activeFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });

    applyFilters();
    document.querySelector(".kb-gallery")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function syncPersonalEntryAuth(user) {
    const signedIn = Boolean(user || window.SKAuth?.getUser());
    const personalEntry = document.querySelector("[data-kb-personal-open]");
    const personalView = document.querySelector("[data-kb-personal-view]");

    if (!signedIn && personalView && !personalView.hidden) {
      setGalleryView("main", state.mainFilter);
    }
    if (personalEntry) personalEntry.hidden = !signedIn;
  }

  function openKnowledgeBase(card) {
    const params = new URLSearchParams({
      knowledgeBase: card.dataset.kbId,
      name: card.dataset.kbName,
      count: card.dataset.kbCount || "0",
    });
    window.location.href = `./deep-research.html?${params.toString()}`;
  }

  function openModal(modal = createModal) {
    activeModal = modal;
    modalMask.hidden = false;
    modal.hidden = false;
    requestAnimationFrame(() => {
      modalMask.classList.add("is-open");
      modal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    window.setTimeout(() => modal.querySelector("input, button")?.focus(), 60);
  }

  function closeModal() {
    if (!activeModal) return;
    const modal = activeModal;
    modalMask.classList.remove("is-open");
    modal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      modalMask.hidden = true;
      modal.hidden = true;
      activeModal = null;
    }, 220);
  }

  function getCardMenuMarkup(categories) {
    if (categories.includes("favorite")) {
      return '<button type="button" data-kb-card-action="unfavorite">取消收藏</button>';
    }
    const isShared = categories.includes("shared");
    return `
      <button type="button" data-kb-card-action="edit">编辑</button>
      ${
        isShared
          ? '<button type="button" data-kb-card-action="unshare">取消分享</button>'
          : '<button type="button" data-kb-card-action="share">分享</button>'
      }
      <button type="button" data-kb-card-action="delete">删除</button>
    `;
  }

  function renderCardMenu(card) {
    const menu = card.querySelector("[data-kb-card-menu]");
    if (!menu) return;
    const categories = (card.dataset.kbCategories || "").split(/\s+/);
    menu.innerHTML = getCardMenuMarkup(categories);
  }

  function upgradeCard(card) {
    if (!card || card.tagName === "ARTICLE") return card;
    const article = document.createElement("article");
    article.className = card.className;
    Object.keys(card.dataset).forEach((key) => {
      article.dataset[key] = card.dataset[key];
    });

    const main = document.createElement("button");
    main.className = "kb-gallery-card-main";
    main.type = "button";
    main.dataset.kbCardMain = "";
    while (card.firstChild) main.append(card.firstChild);

    const categories = (article.dataset.kbCategories || "").split(/\s+/);
    const isCommunityContent =
      categories.includes("community-shared") || categories.includes("official-featured");
    const supportsActions =
      categories.includes("mine") ||
      categories.includes("shared") ||
      categories.includes("favorite");
    if (!supportsActions || isCommunityContent) {
      article.classList.add("has-no-card-menu");
      article.append(main);
      card.replaceWith(article);
      window.SKIcons.hydrate(article);
      return article;
    }

    const menu = document.createElement("div");
    menu.className = "kb-card-menu";
    menu.dataset.kbCardMenu = "";
    menu.innerHTML = getCardMenuMarkup(categories);

    const menuButton = document.createElement("button");
    menuButton.className = "kb-card-menu-button";
    menuButton.type = "button";
    menuButton.dataset.kbCardMenuButton = "";
    menuButton.setAttribute("aria-label", "更多操作");
    menuButton.innerHTML = '<span data-icon="ellipsis"></span>';

    article.append(main, menuButton, menu);
    card.replaceWith(article);
    window.SKIcons.hydrate(article);
    return article;
  }

  function upgradeCards() {
    getCards().forEach((card) => upgradeCard(card));
  }

  function createGalleryCard(name, description, privacy) {
    const id = `custom-${Date.now()}`;
    const privacyLabel = privacy === "私有" ? "私有" : "共享";
    const card = document.createElement("button");
    card.className = "kb-gallery-card";
    card.type = "button";
    card.dataset.kbCard = "";
    card.dataset.kbId = id;
    card.dataset.kbName = name;
    card.dataset.kbCount = "0";
    card.dataset.kbCategories = "mine recent";
    card.innerHTML = `
      <span class="kb-card-cover is-culture">
        <span class="kb-card-cover-icon"><span data-icon="database"></span></span>
        <strong>${escapeHtml(name)}</strong>
      </span>
      <span class="kb-card-info">
        <span class="kb-card-title-line">
          <strong>${escapeHtml(name)}</strong>
          <small>${privacyLabel}</small>
        </span>
        <span class="kb-card-meta">0 份资料 · 尚未添加</span>
        <span class="kb-card-update">${escapeHtml(description)}</span>
      </span>
    `;
    window.SKIcons.hydrate(card);
    const upgraded = upgradeCard(card);
    galleryGrid.prepend(upgraded);
    return upgraded;
  }

  function seedSimulatedCards() {
    simulatedLibraries.forEach(([id, name, count, category, coverClass, icon, updated]) => {
      const privacy = category === "mine" ? "私有" : "共享";
      const card = document.createElement("button");
      card.className = "kb-gallery-card";
      card.type = "button";
      card.dataset.kbCard = "";
      card.dataset.kbId = id;
      card.dataset.kbName = name;
      card.dataset.kbCount = String(count);
      card.dataset.kbCategories = category;
      card.innerHTML = `
        <span class="kb-card-cover ${coverClass}">
          <span class="kb-card-cover-icon"><span data-icon="${icon}"></span></span>
          <strong>${escapeHtml(name)}</strong>
        </span>
        <span class="kb-card-info">
          <span class="kb-card-title-line">
            <strong>${escapeHtml(name)}</strong>
            <small>${privacy}</small>
          </span>
          <span class="kb-card-meta">${count.toLocaleString("zh-CN")} 份资料 · 已建立索引</span>
          <span class="kb-card-update">${escapeHtml(updated)}</span>
        </span>
      `;
      window.SKIcons.hydrate(card);
      galleryGrid.append(card);
    });

    [
      [[...communitySharedTitles, ...extraCommunitySharedTitles], "community-shared", "社区共享"],
      [[...officialFeaturedTitles, ...extraOfficialFeaturedTitles], "official-featured", "官方精选"],
    ].forEach(([titles, category, label], groupIndex) => {
      titles.forEach((title, index) => {
        const count = 52 + ((index * 17 + groupIndex * 11) % 186);
        const favoriteCount = 86 + ((index * 29 + groupIndex * 47) % 900);
        const coverClass = groupIndex === 0
          ? (index % 2 === 0 ? "is-regional" : "is-culture")
          : (index % 2 === 0 ? "is-results" : "is-journals");
        const categoryIcon = groupIndex === 0 ? "users-round" : "star";
        const card = document.createElement("button");
        card.className = "kb-gallery-card";
        card.type = "button";
        card.dataset.kbCard = "";
        card.dataset.kbId = `${category}-${index + 1}`;
        card.dataset.kbName = `${label} · ${title}`;
        card.dataset.kbCount = String(count);
        card.dataset.kbCategories = `shared ${category}`;
        card.innerHTML = `
          <span class="kb-card-cover ${coverClass}">
            <span class="kb-card-cover-icon"><span data-icon="${categoryIcon}"></span></span>
            <strong>${escapeHtml(title)}</strong>
          </span>
          <span class="kb-card-info">
            <span class="kb-card-title-line">
              <strong>${escapeHtml(title)}</strong>
            </span>
            <span class="kb-card-meta">${count} 份资料 · ${label}</span>
            <span class="kb-card-update">${index % 3 === 0 ? "今天更新" : "近7天更新"} · 收藏 ${favoriteCount} 次</span>
          </span>
        `;
        window.SKIcons.hydrate(card);
        galleryGrid.append(card);
      });
    });

    favoriteTitles.forEach((title, index) => {
      const count = 36 + ((index * 23) % 140);
      const coverClass = ["is-culture", "is-regional", "is-results", "is-journals"][index % 4];
      const card = document.createElement("button");
      card.className = "kb-gallery-card";
      card.type = "button";
      card.dataset.kbCard = "";
      card.dataset.kbId = `favorite-${index + 1}`;
      card.dataset.kbName = title;
      card.dataset.kbCount = String(count);
      card.dataset.kbCategories = "favorite recent";
      card.innerHTML = `
        <span class="kb-card-cover ${coverClass}">
          <span class="kb-card-cover-icon"><span data-icon="star"></span></span>
          <strong>${escapeHtml(title)}</strong>
        </span>
        <span class="kb-card-info">
          <span class="kb-card-title-line">
            <strong>${escapeHtml(title)}</strong>
            <small>收藏</small>
          </span>
          <span class="kb-card-meta">${count} 份资料 · 已收藏</span>
          <span class="kb-card-update">${index % 3 === 0 ? "今天更新" : "近7天更新"}</span>
        </span>
      `;
      window.SKIcons.hydrate(card);
      galleryGrid.append(card);
    });
  }

  function closeCardMenus(except) {
    document.querySelectorAll("[data-kb-card-menu]").forEach((menu) => {
      if (menu === except) return;
      menu.classList.remove("is-open");
      menu.closest("[data-kb-card]")?.querySelector("[data-kb-card-menu-button]")?.classList.remove("is-open");
    });
  }

  function openCardEditModal(card) {
    state.editCardId = card.dataset.kbId;
    const input = document.querySelector("[data-kb-card-edit-name]");
    input.value = card.dataset.kbName || "";
    openModal(editModal);
    window.setTimeout(() => {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 70);
  }

  function openCardDeleteModal(card) {
    state.deleteCardId = card.dataset.kbId;
    document.querySelector("[data-kb-card-delete-description]").textContent =
      `确认删除“${card.dataset.kbName}”吗？`;
    openModal(deleteModal);
  }

  function unshareCard(card) {
    const categories = (card.dataset.kbCategories || "")
      .split(/\s+/)
      .filter((category) => category && category !== "shared");
    if (!categories.includes("mine")) categories.push("mine");
    card.dataset.kbCategories = categories.join(" ");
    const privacy = card.querySelector(".kb-card-title-line > small");
    if (privacy) privacy.textContent = "私有";
    renderCardMenu(card);
    closeCardMenus();
    applyFilters();
    window.SKApp.showToast("已取消分享");
  }

  function shareCard(card) {
    const categories = (card.dataset.kbCategories || "")
      .split(/\s+/)
      .filter((category) => category && category !== "shared");
    if (!categories.includes("mine")) categories.push("mine");
    categories.push("shared");
    card.dataset.kbCategories = categories.join(" ");
    const privacy = card.querySelector(".kb-card-title-line > small");
    if (privacy) privacy.textContent = "共享";
    renderCardMenu(card);
    closeCardMenus();
    applyFilters();
    window.SKApp.showToast("已分享");
  }

  function unfavoriteCard(card) {
    const categories = (card.dataset.kbCategories || "")
      .split(/\s+/)
      .filter((category) => category && category !== "favorite");
    card.dataset.kbCategories = categories.join(" ");
    closeCardMenus();
    applyFilters();
    window.SKApp.showToast("已取消收藏");
  }

  function initGallery() {
    galleryGrid.addEventListener("click", (event) => {
      const menuButton = event.target.closest("[data-kb-card-menu-button]");
      if (menuButton) {
        const card = menuButton.closest("[data-kb-card]");
        const menu = card?.querySelector("[data-kb-card-menu]");
        if (menu) {
          const willOpen = !menu.classList.contains("is-open");
          closeCardMenus(menu);
          menu.classList.toggle("is-open", willOpen);
          menuButton.classList.toggle("is-open", willOpen);
          menuButton.setAttribute("aria-expanded", String(willOpen));
        }
        return;
      }

      const actionButton = event.target.closest("[data-kb-card-action]");
      if (actionButton) {
        const card = actionButton.closest("[data-kb-card]");
        const action = actionButton.dataset.kbCardAction;
        if (!card) return;
        closeCardMenus();
        if (action === "edit") openCardEditModal(card);
        if (action === "delete") openCardDeleteModal(card);
        if (action === "share") shareCard(card);
        if (action === "unshare") unshareCard(card);
        if (action === "unfavorite") unfavoriteCard(card);
        return;
      }

      const card = event.target.closest("[data-kb-card]");
      if (card && event.target.closest("[data-kb-card-main]")) openKnowledgeBase(card);
    });

    document.querySelectorAll("[data-kb-gallery-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.kbGalleryFilter;
        const group = button.closest("[data-kb-filter-group]");
        if (group?.dataset.kbFilterGroup === "personal") {
          state.personalFilter = state.filter;
        } else {
          state.mainFilter = state.filter;
        }
        state.page = 1;
        group?.querySelectorAll("[data-kb-gallery-filter]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
        applyFilters();
      });
    });

    document.querySelector("[data-kb-personal-open]")?.addEventListener("click", () => {
      if (!window.SKAuth?.getUser()) {
        window.SKAuth?.open();
        return;
      }
      setGalleryView("personal", state.personalFilter);
    });
    document.querySelector("[data-kb-personal-back]")?.addEventListener("click", () => {
      setGalleryView("main", state.mainFilter);
    });
    document.querySelector("[data-kb-personal-search]")?.addEventListener("input", (event) => {
      state.personalSearch = event.target.value;
      state.page = 1;
      applyFilters();
    });
    pagination?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-kb-page]");
      if (!button) return;
      state.page = Number(button.dataset.kbPage) || 1;
      applyFilters();
      galleryGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const searchInputs = document.querySelectorAll("[data-kb-search-input]");
    searchInputs.forEach((input) => {
      input.addEventListener("input", (event) => {
        state.search = event.target.value;
        searchInputs.forEach((item) => {
          if (item !== event.target) item.value = event.target.value;
        });
        state.page = 1;
        applyFilters();
      });
    });

    document.querySelectorAll("[data-kb-search-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        applyFilters();
      });
    });

    initFloatingSearch();

    document.addEventListener("click", (event) => {
      if (
        event.target.closest("[data-kb-card-menu]") ||
        event.target.closest("[data-kb-card-menu-button]")
      ) {
        return;
      }
      closeCardMenus();
    });
  }

  function initFloatingSearch() {
    const originalSearch = document.querySelector(".kb-hero-search");
    const floatingSearch = document.querySelector("[data-kb-floating-search]");
    const scrollRoot = document.querySelector(".kb-gallery");
    if (!originalSearch || !floatingSearch || !scrollRoot) return;

    if (!("IntersectionObserver" in window)) {
      scrollRoot.addEventListener("scroll", () => {
        const personalView = document.querySelector("[data-kb-personal-view]");
        if (personalView && !personalView.hidden) {
          floatingSearch.classList.remove("is-visible");
          floatingSearch.setAttribute("aria-hidden", "true");
          return;
        }
        const visible = originalSearch.getBoundingClientRect().bottom > 0;
        floatingSearch.classList.toggle("is-visible", !visible);
        floatingSearch.setAttribute("aria-hidden", String(visible));
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const personalView = document.querySelector("[data-kb-personal-view]");
        if (personalView && !personalView.hidden) {
          floatingSearch.classList.remove("is-visible");
          floatingSearch.setAttribute("aria-hidden", "true");
          return;
        }
        const visible = entry.isIntersecting;
        floatingSearch.classList.toggle("is-visible", !visible);
        floatingSearch.setAttribute("aria-hidden", String(visible));
      },
      { root: scrollRoot, threshold: 0 },
    );
    observer.observe(originalSearch);
  }

  function initModal() {
    document.querySelectorAll("[data-kb-create-open]").forEach((button) => {
      button.addEventListener("click", () => openModal(createModal));
    });
    document.querySelectorAll("[data-kb-modal-close]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });
    modalMask.addEventListener("click", closeModal);

    document.querySelector("[data-kb-create-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const nameInput = document.querySelector("[data-kb-create-name]");
      const descriptionInput = document.querySelector("[data-kb-create-description]");
      const privacyInput = document.querySelector("[data-kb-create-privacy]");
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        return;
      }

      createGalleryCard(
        name,
        descriptionInput.value.trim() || "尚未填写用途说明",
        privacyInput.value,
      );
      event.target.reset();
      closeModal();
      setGalleryView("personal", "personal-all");
      window.SKApp.showToast("知识库已创建");
    });

    document.querySelector("[data-kb-card-edit-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const card = getCards().find((item) => item.dataset.kbId === state.editCardId);
      const input = document.querySelector("[data-kb-card-edit-name]");
      const nextName = input.value.trim();
      if (!card || !nextName) {
        input.focus();
        return;
      }
      card.dataset.kbName = nextName;
      const coverTitle = card.querySelector(".kb-card-cover > strong");
      const cardTitle = card.querySelector(".kb-card-title-line > strong");
      if (coverTitle) coverTitle.textContent = nextName;
      if (cardTitle) cardTitle.textContent = nextName;
      state.editCardId = null;
      closeModal();
      applyFilters();
      window.SKApp.showToast("知识库名称已更新");
    });

    document.querySelector("[data-kb-card-delete-confirm]").addEventListener("click", () => {
      const card = getCards().find((item) => item.dataset.kbId === state.deleteCardId);
      card?.remove();
      state.deleteCardId = null;
      closeModal();
      applyFilters();
      window.SKApp.showToast("知识库已删除");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeModal) {
        event.preventDefault();
        closeModal();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    seedSimulatedCards();
    upgradeCards();
    initGallery();
    initModal();
    syncPersonalEntryAuth();
    document.addEventListener("sk:auth-changed", (event) => {
      syncPersonalEntryAuth(event.detail);
    });
    applyFilters();
  });
})();
