(function () {
  "use strict";

  const PAGE_SIZE = 9;
  const FILE_ICONS = {
    PDF: "file-pdf",
    DOCX: "file-word",
    MD: "file-text",
    TXT: "file-txt",
  };
  const FAVORITES_KEY = "sheke-v4-community-favorites";
  /* 共享弹窗「从我的文件中添加」的候选来自 assets/js/my-files.js（我的知识页同一份数据：
     基础演示文件 + 用户上传）。每次渲染现读，页面内新增的文件也能立刻看到 */
  function myFiles() {
    return window.SKMyFiles ? window.SKMyFiles.all() : [];
  }
  const state = {
    channel: "community",
    topic: "all",
    type: "all",
    search: "",
    sort: "latest",
    visible: PAGE_SIZE,
    activeCard: null,
  };

  const sharedFiles = [
    ["公共文化服务效能评估指标体系.pdf", "PDF", "3.1 MB", "upload", "江城大学", "政策研究", "community", false, 218, "09-14 13:40 共享", "整理公共文化服务效能评估的指标维度与测量口径。"],
    ["基层治理案例比较研究.docx", "DOCX", "2.4 MB", "conversation", "汉江社会科学研究院", "基层治理", "community", false, 196, "09-14 10:15 共享", "比较多个基层治理案例的组织机制与协同路径。"],
    ["区域协调发展政策评估.md", "MD", "1.2 MB", "conversation", "荆楚数字智库", "区域发展", "featured", true, 476, "09-13 16:48 共享", "从政策目标、执行过程和区域差异评估协调发展政策。"],
    ["文化传播与数字空间研究.pdf", "PDF", "3.7 MB", "upload", "江城大学", "文化传播", "community", false, 142, "09-13 11:22 共享", "分析数字空间中的文化传播机制与公共文化服务关系。"],
    ["基层社会治理创新汇编.docx", "DOCX", "2.8 MB", "upload", "汉江社会科学研究院", "社会治理", "featured", true, 389, "09-12 17:06 共享", "汇编基层社会治理创新实践与典型工作机制。"],
    ["社科成果转化路径分析.txt", "TXT", "860 KB", "conversation", "荆楚数字智库", "成果案例", "community", false, 88, "09-12 09:36 共享", "梳理社科成果转化为政策建议和实践方案的主要路径。"],
    ["公共政策执行偏差研究.pdf", "PDF", "4.1 MB", "upload", "江城大学", "政策研究", "community", false, 154, "09-11 15:30 共享", "分析政策执行偏差的表现、成因和治理办法。"],
    ["县域公共服务案例记录.docx", "DOCX", "1.9 MB", "conversation", "汉江社会科学研究院", "基层治理", "community", false, 121, "09-11 10:08 共享", "记录县域公共服务供给与群众需求匹配的实践案例。"],
    ["数字治理平台建设观察.pdf", "PDF", "2.6 MB", "upload", "荆楚数字智库", "区域发展", "featured", true, 332, "09-10 16:40 共享", "观察数字治理平台建设中的协同机制和数据标准。"],
    ["公共文化服务访谈摘要.md", "MD", "720 KB", "conversation", "江城大学", "文化传播", "community", false, 76, "09-10 09:55 共享", "整理公共文化服务从业者和公众访谈的主要观点。"],
    ["社区协商议事实践资料.pdf", "PDF", "2.2 MB", "upload", "汉江社会科学研究院", "社会治理", "community", false, 167, "09-09 14:20 共享", "总结社区协商议事的流程、参与主体和典型问题。"],
    ["社科评价机制研究.docx", "DOCX", "1.6 MB", "conversation", "荆楚数字智库", "成果案例", "community", false, 109, "09-09 08:42 共享", "分析社会科学成果评价机制和多元评价方法。"],
    ["城乡公共文化服务比较.pdf", "PDF", "3.4 MB", "upload", "江城大学", "政策研究", "featured", true, 421, "09-08 17:18 共享", "比较城乡公共文化服务资源配置和数字化供给差异。"],
    ["基层治理数据质量说明.txt", "TXT", "540 KB", "upload", "汉江社会科学研究院", "基层治理", "community", false, 64, "09-08 11:04 共享", "说明基层治理数据的来源、清洗规则和质量边界。"],
    ["区域文化品牌建设.md", "MD", "980 KB", "conversation", "荆楚数字智库", "文化传播", "community", false, 83, "09-07 15:26 共享", "分析区域文化品牌建设与传播策略。"],
    ["社会调查样本设计方法.docx", "DOCX", "1.4 MB", "upload", "江城大学", "社会治理", "featured", true, 298, "09-07 09:12 共享", "介绍社会调查中的抽样设计、质量控制与误差评估。"],
    ["成果数据库建设方案.pdf", "PDF", "2.9 MB", "conversation", "荆楚数字智库", "成果案例", "community", false, 137, "09-06 16:35 共享", "提出社科成果数据库的结构、字段和共享机制。"],
    ["基本公共服务政策综述.docx", "DOCX", "2.0 MB", "upload", "汉江社会科学研究院", "政策研究", "community", false, 118, "09-06 10:46 共享", "综述基本公共服务政策演进和主要研究议题。"],
  ];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getCards() {
    return Array.from(document.querySelectorAll("[data-community-card]"));
  }

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveFavorites(favorites) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {}
  }

  function formatFavoriteTime(date = new Date()) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function isFavorite(card) {
    return getFavorites().some((item) => item.id === card.dataset.id);
  }

  function syncFavoriteButton(card) {
    const button = card.querySelector("[data-community-favorite]");
    if (!button) return;
    const active = isFavorite(card);
    button.classList.toggle("is-favorite", active);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? "取消收藏" : "收藏到我的知识");
  }

  function cardPayload(card) {
    return {
      id: card.dataset.id,
      name: card.dataset.name,
      type: card.dataset.type,
      size: card.dataset.size,
      topic: card.dataset.topic,
      description: card.dataset.description,
      time: card.dataset.time,
      favoritedAt: formatFavoriteTime(),
    };
  }

  function toggleFavorite(card) {
    if (!window.SKAuth?.getUser()) {
      window.SKAuth?.open();
      return;
    }
    const favorites = getFavorites();
    const index = favorites.findIndex((item) => item.id === card.dataset.id);
    if (index >= 0) {
      favorites.splice(index, 1);
      window.SKApp.showToast("已取消收藏");
    } else {
      favorites.push(cardPayload(card));
      window.SKApp.showToast("已收藏到我的知识");
    }
    saveFavorites(favorites);
    syncFavoriteButton(card);
    syncDetailFavorite();
  }

  /* 卡片标题不显示文件类型：只留主体名（data-name 仍保留完整文件名，链接/查看页用它） */
  const baseNameOf = (value) => String(value || "").replace(/\.[A-Za-z][A-Za-z0-9]{1,4}$/, "");

  /* 标签显示全称（data-type 仍存短名，格式筛选按它比对） */
  const TYPE_LABELS = { MD: "Markdown" };
  const typeLabel = (type) => TYPE_LABELS[type] || type;

  function createCard(file, index) {
    const [name, type, size, _source, org, topic, channel, featured, downloads, time, description] = file;
    const card = document.createElement("article");
    card.className = "community-card";
    card.dataset.communityCard = "";
    card.dataset.id = `shared-${index + 1}`;
    card.dataset.name = name;
    /* 分享机构：查看页顶栏的「文件所属用户」用它 */
    card.dataset.org = org;
    card.dataset.type = type;
    card.dataset.size = size;
    card.dataset.topic = topic;
    card.dataset.channel = channel;
    card.dataset.featured = String(featured);
    card.dataset.downloads = String(downloads);
    card.dataset.time = time;
    card.dataset.description = description;
    card.innerHTML = `
      <button class="community-card-main" type="button" data-community-open>
        <span class="community-card-copy">
          <span class="community-card-title"><strong>${escapeHtml(baseNameOf(name))}</strong>${featured ? '<small class="community-featured-tag">官方精选</small>' : ""}</span>
          <span class="community-card-description">${escapeHtml(description)}</span>
          <span class="community-card-tags"><small class="community-file-type">${escapeHtml(typeLabel(type))}</small><small>${escapeHtml(topic)}</small></span>
          <span class="community-card-meta">${escapeHtml(time)}</span>
          <span class="community-card-footer">下载 ${downloads} 次</span>
        </span>
      </button>
    `;
    window.SKIcons.hydrate(card);
    document.querySelector("[data-community-grid]")?.append(card);
    syncFavoriteButton(card);
  }

  function seedFiles() {
    sharedFiles.forEach(createCard);
  }

  function sortCards(cards) {
    if (state.sort === "downloads") {
      return cards.sort((a, b) => Number(b.dataset.downloads) - Number(a.dataset.downloads));
    }
    if (state.sort === "updated") {
      return cards.reverse();
    }
    return cards;
  }

  function applyFilters(resetVisible = false) {
    if (resetVisible) state.visible = PAGE_SIZE;
    const keyword = state.search.trim().toLowerCase();
    const matching = [];
    getCards().forEach((card) => {
      const matchesChannel = card.dataset.channel === state.channel;
      const matchesTopic = state.topic === "all" || card.dataset.topic === state.topic;
      const matchesType = state.type === "all" || card.dataset.type === state.type;
      const text = [card.dataset.name, card.dataset.description, card.dataset.topic]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !keyword || text.includes(keyword);
      const matches = matchesChannel && matchesTopic && matchesType && matchesSearch;
      card.hidden = !matches;
      if (matches) matching.push(card);
    });

    const sorted = sortCards(matching);
    sorted.forEach((card) => document.querySelector("[data-community-grid]")?.append(card));
    sorted.forEach((card, index) => {
      card.hidden = index >= state.visible;
    });

    const empty = document.querySelector("[data-community-empty]");
    const grid = document.querySelector("[data-community-grid]");
    const loadMore = document.querySelector("[data-community-load-more]");
    if (grid) grid.hidden = matching.length === 0;
    if (empty) empty.hidden = matching.length > 0;
    if (loadMore) loadMore.hidden = matching.length <= state.visible;
  }

  function setTab(attribute, value, root) {
    root.querySelectorAll(`[${attribute}]`).forEach((button) => {
      const active = button.getAttribute(attribute) === value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  /* 查看页地址：文件名 / 分享机构 / 时间都跟着卡片数据走。
     两个入口（卡片点击、详情预览区）共用，避免地址拼法漂移。
     time 取卡片上的「今天 09:20 共享」原文，由查看页折算成 YYYY-MM-DD */
  function readerUrl(card) {
    return (
      "./reader.html?source=community&file=" +
      encodeURIComponent(card.dataset.name) +
      "&owner=" +
      encodeURIComponent(card.dataset.org || "") +
      "&time=" +
      encodeURIComponent(card.dataset.time || "")
    );
  }

  function openDetail(card) {
    state.activeCard = card;
    const detail = document.querySelector("[data-community-detail]");
    const listHeader = document.querySelector("[data-community-list-header]");
    if (!detail) return;
    if (listHeader) listHeader.hidden = true;
    document.querySelector(".community-classification")?.setAttribute("hidden", "");
    document.querySelector(".community-topic-row").hidden = true;
    document.querySelector(".community-toolbar").hidden = true;
    document.querySelector("[data-community-grid]").hidden = true;
    document.querySelector("[data-community-load-more]").hidden = true;
    document.querySelector("[data-community-empty]").hidden = true;

    document.querySelector("[data-community-detail-title]").textContent = card.dataset.name;
    document.querySelector("[data-community-detail-meta]").textContent =
      `${card.dataset.type} · ${card.dataset.size}`;
    document.querySelector("[data-community-preview-name]").textContent = card.dataset.name;
    document.querySelector("[data-community-preview-size]").textContent = card.dataset.size;

    /* 预览区指向该文件的查看页（新窗口）；切换卡片时链接要跟着换 */
    const previewLink = document.querySelector("[data-community-preview-link]");
    if (previewLink) {
      previewLink.href = readerUrl(card);
    }
    document.querySelector("[data-community-detail-topic]").textContent = card.dataset.topic;
    document.querySelector("[data-community-detail-time]").textContent = card.dataset.time;
    document.querySelector("[data-community-detail-downloads]").textContent = `${card.dataset.downloads} 次`;
    document.querySelector("[data-community-detail-description]").textContent = card.dataset.description;

    const related = getCards()
      .filter((item) => item !== card && item.dataset.channel === card.dataset.channel && item.dataset.topic === card.dataset.topic)
      .slice(0, 3);
    const relatedRoot = document.querySelector("[data-community-related]");
    relatedRoot.replaceChildren();
    related.forEach((item) => {
      const button = document.createElement("button");
      button.className = "community-related-card";
      button.type = "button";
      button.innerHTML = `<span data-icon="file-text"></span><span><strong>${escapeHtml(item.dataset.name)}</strong><small>${escapeHtml(item.dataset.time)}</small></span>`;
      button.addEventListener("click", () => openDetail(item));
      window.SKIcons.hydrate(button);
      relatedRoot.append(button);
    });
    if (!related.length) {
      const empty = document.createElement("p");
      empty.className = "community-related-empty";
      empty.textContent = "暂无相关文件";
      relatedRoot.append(empty);
    }
    detail.hidden = false;
    syncDetailFavorite();
    document.querySelector("[data-community-scroll]")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeDetail() {
    state.activeCard = null;
    document.querySelector("[data-community-detail]").hidden = true;
    document.querySelector("[data-community-list-header]").hidden = false;
    document.querySelector(".community-classification")?.removeAttribute("hidden");
    document.querySelector(".community-topic-row").hidden = false;
    document.querySelector(".community-toolbar").hidden = false;
    document.querySelector("[data-community-grid]").hidden = false;
    applyFilters();
  }

  function syncDetailFavorite() {
    const card = state.activeCard;
    const button = document.querySelector("[data-community-detail-favorite]");
    if (!card || !button) return;
    const active = isFavorite(card);
    button.classList.toggle("is-favorite", active);
    button.innerHTML = `<span data-icon="star"></span>${active ? "已收藏" : "收藏到我的知识"}`;
    window.SKIcons.hydrate(button);
  }

  function openModal() {
    const mask = document.querySelector("[data-community-modal-mask]");
    const modal = document.querySelector("[data-community-share-modal]");
    mask.hidden = false;
    modal.hidden = false;
    requestAnimationFrame(() => {
      mask.classList.add("is-open");
      modal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    window.SKApp?.setFocusTrap(modal);
  }

  function closeModal() {
    const mask = document.querySelector("[data-community-modal-mask]");
    const modal = document.querySelector("[data-community-share-modal]");
    const discard = document.querySelector("[data-community-share-discard]");
    window.SKApp?.releaseFocusTrap(modal);
    mask.classList.remove("is-open");
    modal.classList.remove("is-open");
    /* 放弃确认是叠在共享弹窗上的一层，一起收掉 */
    if (discard) {
      discard.classList.remove("is-open");
      discard.hidden = true;
    }
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      mask.hidden = true;
      modal.hidden = true;
    }, 220);
  }

  function initDropdown(root, valueKey, onChange) {
    const trigger = root.querySelector(`[data-community-${valueKey}-trigger]`);
    const list = root.querySelector(`[data-community-${valueKey}-list]`);
    const label = root.querySelector(`[data-community-${valueKey}-label]`);
    if (!trigger || !list || !label) return;
    const setOpen = (open) => {
      list.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      /* 字段式弹层默认向下；屏幕下方放不下就翻到触发器上方，别探出视口下沿 */
      if (open && list.classList.contains("community-select-list--field")) {
        const fitsBelow =
          trigger.getBoundingClientRect().bottom + 6 + list.offsetHeight <= window.innerHeight - 8;
        list.classList.toggle("community-select-list--up", !fitsBelow);
      }
    };
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(list.hidden);
    });
    list.querySelectorAll(`[data-community-${valueKey}-value]`).forEach((option) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        label.textContent = option.textContent;
        list.querySelectorAll(`[data-community-${valueKey}-value]`).forEach((item) => {
          const active = item === option;
          item.classList.toggle("is-selected", active);
          item.setAttribute("aria-selected", String(active));
        });
        setOpen(false);
        onChange(option.dataset[`community${valueKey[0].toUpperCase()}${valueKey.slice(1)}Value`]);
      });
    });
    document.addEventListener("click", (event) => {
      if (!root.contains(event.target)) setOpen(false);
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-community-channel]").forEach((button) => {
      button.addEventListener("click", () => {
        state.channel = button.dataset.communityChannel;
        setTab("data-community-channel", state.channel, document.querySelector(".community-tabs"));
        applyFilters(true);
      });
    });
    document.querySelectorAll("[data-community-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        state.topic = button.dataset.communityTopic;
        setTab("data-community-topic", state.topic, document.querySelector(".community-topic-row"));
        applyFilters(true);
      });
    });
    initDropdown(document.querySelector("[data-community-type-filter]"), "type", (value) => {
      state.type = value;
      applyFilters(true);
    });
    /* 搜索只在回车 / 点放大镜时执行：不做实时筛选 */
    const searchInputs = document.querySelectorAll("[data-community-search]");
    searchInputs.forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        state.search = event.currentTarget.value;
        searchInputs.forEach((item) => {
          item.value = state.search;
        });
        applyFilters(true);
      });
    });
    document.querySelectorAll("[data-community-search-submit]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = button
          .closest(".community-search, .community-floating-search")
          ?.querySelector("[data-community-search]");
        state.search = input?.value || "";
        searchInputs.forEach((item) => {
          item.value = state.search;
        });
        applyFilters(true);
      });
    });
    initDropdown(document.querySelector("[data-community-sort-menu]"), "sort", (value) => {
      state.sort = value;
      applyFilters(true);
    });
    document.querySelector("[data-community-load-more]")?.addEventListener("click", () => {
      state.visible += PAGE_SIZE;
      applyFilters();
    });
    const scrollRoot = document.querySelector("[data-community-scroll]");
    scrollRoot?.addEventListener(
      "scroll",
      () => {
        const loadMore = document.querySelector("[data-community-load-more]");
        if (!loadMore || loadMore.hidden) return;
        const distanceToBottom =
          scrollRoot.scrollHeight - scrollRoot.scrollTop - scrollRoot.clientHeight;
        if (distanceToBottom > 240) return;
        state.visible += PAGE_SIZE;
        applyFilters();
      },
      { passive: true },
    );
    document.querySelector("[data-community-reset]")?.addEventListener("click", () => {
      state.channel = "community";
      state.topic = "all";
      state.type = "all";
      state.search = "";
      state.visible = PAGE_SIZE;
      searchInputs.forEach((input) => {
        input.value = "";
      });
      setTab("data-community-channel", "community", document.querySelector(".community-tabs"));
      setTab("data-community-topic", "all", document.querySelector(".community-topic-row"));
      applyFilters(true);
    });
  }

  function initFloatingSearch() {
    const originalSearch = document.querySelector(".community-search");
    const floatingSearch = document.querySelector("[data-community-floating-search]");
    const scrollRoot = document.querySelector("[data-community-scroll]");
    if (!originalSearch || !floatingSearch || !scrollRoot) return;

    const setVisible = (visible) => {
      floatingSearch.classList.toggle("is-visible", visible);
      floatingSearch.setAttribute("aria-hidden", String(!visible));
    };

    if (!("IntersectionObserver" in window)) {
      scrollRoot.addEventListener(
        "scroll",
        () => setVisible(originalSearch.getBoundingClientRect().bottom <= 0),
        { passive: true },
      );
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { root: scrollRoot, threshold: 0 },
    );
    observer.observe(originalSearch);
  }

  function initCards() {
    const grid = document.querySelector("[data-community-grid]");
    getCards().forEach((card) => {
      const meta = card.querySelector(".community-card-meta");
      if (!meta || card.querySelector(".community-card-divider")) return;
      const divider = document.createElement("span");
      divider.className = "community-card-divider";
      divider.setAttribute("aria-hidden", "true");
      meta.before(divider);
    });

    grid.addEventListener("click", (event) => {
      const card = event.target.closest("[data-community-card]");
      if (!card) return;
      if (event.target.closest("[data-community-favorite]")) {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(card);
        return;
      }
      if (event.target.closest("[data-community-open]")) {
        /* 原为「文件阅读页后续接入」占位提示，现已接入查看页（与我的知识同款新窗口打开） */
        window.open(readerUrl(card), "_blank", "noopener,noreferrer");
      }
    });

    document.querySelector("[data-community-detail-back]")?.addEventListener("click", closeDetail);
    document.querySelector("[data-community-detail-favorite]")?.addEventListener("click", () => {
      if (state.activeCard) toggleFavorite(state.activeCard);
    });
    document.querySelector("[data-community-download]")?.addEventListener("click", () => {
      window.SKApp.showToast("文件已开始下载");
    });
    document.querySelectorAll("[data-community-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.communityAction;
        if (action === "基于文件提问") {
          window.location.href = `./knowledge-alliance.html?file=${encodeURIComponent(state.activeCard?.dataset.id || "")}`;
          return;
        }
        window.SKApp.showToast(`${action}页面后续接入`);
      });
    });
  }

  function initShareModal() {
    const modal = document.querySelector("[data-community-share-modal]");
    const discardModal = document.querySelector("[data-community-share-discard]");
    const form = modal.querySelector("[data-community-share-form]");
    const localFile = modal.querySelector("[data-community-share-file]");
    const dropzone = modal.querySelector("[data-community-share-dropzone]");
    const pickedRow = modal.querySelector("[data-community-picked]");
    const pickedName = modal.querySelector("[data-community-picked-name]");
    const sourcePanels = Array.from(modal.querySelectorAll("[data-share-source-panel]"));
    const steps = Array.from(modal.querySelectorAll("[data-share-step]"));
    const nameInput = modal.querySelector("[data-community-share-name]");
    const descInput = modal.querySelector("[data-community-share-description]");
    const searchInput = modal.querySelector("[data-community-share-search]");
    const listNode = modal.querySelector("[data-community-share-list]");
    const emptyNode = modal.querySelector("[data-community-share-empty]");

    const EXTENSION_RE = /\.[A-Za-z][A-Za-z0-9]{1,4}$/;
    const baseNameOf = (name) => String(name || "").replace(EXTENSION_RE, "");

    let source = "local";
    /* 第一步选中的文件：本地上传存 { name }，「我的文件」存整条记录 */
    let pickedLocal = null;
    let pickedMine = null;
    let step = 1;

    const setStep = (next) => {
      step = next;
      steps.forEach((node) => {
        node.hidden = Number(node.dataset.shareStep) !== next;
      });
      modal.scrollTop = 0;
    };

    /* 下拉：复用页面的 community-select 组件（弹层样式与工具栏一致） */
    const topicValue = () =>
      modal.querySelector("[data-community-topic-value].is-selected")?.dataset.communityTopicValue || "";

    const setSource = (next) => {
      source = next;
      sourcePanels.forEach((panel) => {
        panel.hidden = panel.dataset.shareSourcePanel !== next;
      });
    };

    /* 换来源即清空上一次的选择（本地上传 ↔ 我的文件互不保留） */
    const clearPicks = () => {
      pickedLocal = null;
      pickedMine = null;
      localFile.value = "";
      if (pickedRow) pickedRow.hidden = true;
      if (pickedName) pickedName.textContent = "";
      renderMineFiles();
    };

    const syncPickedRow = () => {
      if (!pickedRow) return;
      pickedRow.hidden = !pickedLocal;
      if (pickedLocal) pickedName.textContent = pickedLocal.name;
    };

    /* 实时按标题筛选；选中项高亮 */
    const renderMineFiles = () => {
      if (!listNode) return;
      const keyword = (searchInput?.value || "").trim().toLowerCase();
      const hits = myFiles().filter((file) => !keyword || file.name.toLowerCase().includes(keyword));

      listNode.replaceChildren();
      hits.forEach((file) => {
        const item = document.createElement("button");
        const selected = Boolean(pickedMine && pickedMine.name === file.name);
        item.type = "button";
        item.className = "community-mine-item" + (selected ? " is-selected" : "");
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(selected));

        const title = document.createElement("span");
        title.textContent = file.name;
        const meta = document.createElement("small");
        meta.textContent = `${file.size} · ${file.updated}`;
        item.append(title, meta);

        item.addEventListener("click", () => {
          pickedMine = file;
          renderMineFiles();
        });
        listNode.append(item);
      });
      if (emptyNode) emptyNode.hidden = hits.length > 0;
    };

    /* 第一步选中的文件名（带扩展名），第二步只显示不带类型的主体名 */
    const pickedFullName = () => {
      if (source === "local") return pickedLocal?.name || "";
      return pickedMine?.name || "";
    };

    const resetShareFlow = () => {
      form.reset();
      clearPicks();
      if (searchInput) searchInput.value = "";
      /* 下拉复位：点默认项，标签、选中态、onChange 一起走一遍 */
      modal.querySelector('[data-community-source-value="local"]')?.click();
      modal.querySelector('[data-community-topic-value=""]')?.click();
      setSource("local");
      if (descInput) descInput.value = "";
      setStep(1);
    };

    document.querySelectorAll("[data-community-share-open]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!window.SKAuth?.getUser()) {
          window.SKAuth?.open();
          return;
        }
        resetShareFlow();
        openModal();
      });
    });
    document.querySelectorAll("[data-community-modal-close]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    /* 本地上传：点击选择 或 拖入 */
    localFile.addEventListener("change", () => {
      const file = localFile.files?.[0];
      if (!file) return;
      pickedLocal = { name: file.name };
      syncPickedRow();
    });
    ["dragover", "dragenter"].forEach((type) => {
      dropzone?.addEventListener(type, (event) => {
        event.preventDefault();
        dropzone.classList.add("is-dragover");
      });
    });
    ["dragleave", "dragend"].forEach((type) => {
      dropzone?.addEventListener(type, () => dropzone.classList.remove("is-dragover"));
    });
    dropzone?.addEventListener("drop", (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragover");
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;
      pickedLocal = { name: file.name };
      syncPickedRow();
    });
    modal.querySelector("[data-community-share-remove]")?.addEventListener("click", () => {
      pickedLocal = null;
      localFile.value = "";
      syncPickedRow();
    });

    /* 文件来源 / 主题分类走页面同款下拉组件；换来源即清空上一次的选择 */
    initDropdown(modal.querySelector("[data-community-source-menu]"), "source", (value) => {
      setSource(value);
      clearPicks();
    });
    initDropdown(modal.querySelector("[data-community-topic-menu]"), "topic", () => {});

    searchInput?.addEventListener("input", renderMineFiles);

    /* 第一步 → 第二步 */
    modal.querySelector("[data-share-next]")?.addEventListener("click", () => {
      if (source === "local" && !pickedLocal) {
        window.SKApp.showToast("请先选择文件");
        return;
      }
      if (source === "mine" && !pickedMine) {
        window.SKApp.showToast("请先从我的文件中选择一个文件");
        return;
      }
      if (nameInput) nameInput.value = baseNameOf(pickedFullName());
      setStep(2);
      nameInput?.focus();
    });

    /* 第二步 → 第一步：先确认放弃编辑 */
    const setDiscardOpen = (open) => {
      if (!discardModal) return;
      discardModal.hidden = !open;
      requestAnimationFrame(() => discardModal.classList.toggle("is-open", open));
    };
    modal.querySelector("[data-share-back]")?.addEventListener("click", () => setDiscardOpen(true));
    discardModal?.querySelector("[data-discard-cancel]")?.addEventListener("click", () => setDiscardOpen(false));
    discardModal?.querySelector("[data-discard-confirm]")?.addEventListener("click", () => {
      setDiscardOpen(false);
      /* 确认放弃：清掉第二步填的内容，退回第一步（第一步的选择保留） */
      if (nameInput) nameInput.value = "";
      if (descInput) descInput.value = "";
      modal.querySelector('[data-community-topic-value=""]')?.click();
      setStep(1);
    });

    /* 第二步提交：三项都必填 */
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (step !== 2) return;
      const name = nameInput.value.trim();
      if (!name) {
        window.SKApp.showToast("请输入文件名");
        nameInput.focus();
        return;
      }
      const description = descInput.value.trim();
      if (!description) {
        window.SKApp.showToast("请输入简短说明");
        descInput.focus();
        return;
      }
      const topic = topicValue();
      if (!topic) {
        window.SKApp.showToast("请选择主题分类");
        modal.querySelector("[data-community-topic-trigger]")?.focus();
        return;
      }
      /* 校验都过了：关窗 + toast 反馈（不再建独立成功页） */
      closeModal();
      window.SKApp.showToast("提交成功，审核通过后才会在知识联盟公开，请等待消息通知！");
      resetShareFlow();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (discardModal && !discardModal.hidden) {
        event.preventDefault();
        setDiscardOpen(false);
        return;
      }
      if (!modal.hidden) closeModal();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-history-item]").forEach((item) => {
      item.addEventListener("click", () => {
        const title = item.querySelector(".history-item-text")?.textContent.trim() || "";
        window.location.href = `./knowledge-alliance.html?conversation=${encodeURIComponent(title)}`;
      });
    });
    document.querySelector("[data-research-expand]")?.addEventListener("click", () => {
      window.SKApp.showToast("研究项目页面后续接入");
    });
    seedFiles();
    initCards();
    initFilters();
    initFloatingSearch();
    initShareModal();
    applyFilters(true);
  });
})();


