(function () {
  "use strict";

  const PAGE_SIZE = 9;
  const FAVORITES_KEY = "sheke-v4-community-favorites";
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

  function createCard(file, index) {
    const [name, type, size, _source, _org, topic, channel, featured, downloads, time, description] = file;
    const card = document.createElement("article");
    card.className = "community-card";
    card.dataset.communityCard = "";
    card.dataset.id = `shared-${index + 1}`;
    card.dataset.name = name;
    card.dataset.type = type;
    card.dataset.size = size;
    card.dataset.topic = topic;
    card.dataset.channel = channel;
    card.dataset.featured = String(featured);
    card.dataset.downloads = String(downloads);
    card.dataset.time = time;
    card.dataset.description = description;
    const icon = type === "DOCX" ? "file-word" : "file-text";
    card.innerHTML = `
      <button class="community-card-main" type="button" data-community-open>
        <span class="community-file-mark"><span data-icon="${icon}"></span></span>
        <span class="community-card-copy">
          <span class="community-card-title"><strong>${escapeHtml(name)}</strong>${featured ? '<small class="community-featured-tag">官方精选</small>' : ""}</span>
          <span class="community-card-description">${escapeHtml(description)}</span>
          <span class="community-card-tags"><small class="community-file-type">${escapeHtml(type)}</small><small>${escapeHtml(topic)}</small></span>
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
  }

  function closeModal() {
    const mask = document.querySelector("[data-community-modal-mask]");
    const modal = document.querySelector("[data-community-share-modal]");
    mask.classList.remove("is-open");
    modal.classList.remove("is-open");
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
    const searchInputs = document.querySelectorAll("[data-community-search]");
    searchInputs.forEach((input) => {
      input.addEventListener("input", (event) => {
        state.search = event.target.value;
        searchInputs.forEach((item) => {
          if (item !== event.target) item.value = event.target.value;
        });
        applyFilters(true);
      });
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        state.search = event.currentTarget.value;
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
        window.open(
          `./reader.html?source=community&file=${encodeURIComponent(card.dataset.name)}`,
          "_blank",
          "noopener,noreferrer",
        );
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
          window.location.href = `./research-assistant.html?file=${encodeURIComponent(state.activeCard?.dataset.id || "")}`;
          return;
        }
        window.SKApp.showToast(`${action}页面后续接入`);
      });
    });
  }

  function initShareModal() {
    const modal = document.querySelector("[data-community-share-modal]");
    const localFile = modal.querySelector("[data-community-share-file]");
    const nameInput = modal.querySelector("[data-community-share-name]");

    document.querySelectorAll("[data-community-share-open]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!window.SKAuth?.getUser()) {
          window.SKAuth?.open();
          return;
        }
        localFile.value = "";
        nameInput.value = "";
        openModal();
      });
    });
    document.querySelectorAll("[data-community-modal-close]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });
    document.querySelector("[data-community-modal-mask]")?.addEventListener("click", closeModal);
    localFile.addEventListener("change", () => {
      nameInput.value = localFile.files?.[0]?.name || "";
    });
    modal.querySelector("[data-community-share-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!localFile.files?.length) {
        window.SKApp.showToast("请先选择文件");
        return;
      }
      closeModal();
      event.target.reset();
      window.SKApp.showToast("文件已提交审核");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-history-item]").forEach((item) => {
      item.addEventListener("click", () => {
        const title = item.querySelector(".history-item-text")?.textContent.trim() || "";
        window.location.href = `./research-assistant.html?conversation=${encodeURIComponent(title)}`;
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


