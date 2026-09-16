(function () {
  "use strict";

  const state = {
    filter: "all",
    fileType: "all",
    search: "",
    sort: "recent",
    page: 1,
    activeModal: null,
    activeCard: null,
    confirmAction: null,
    shareTags: new Set(),
    customTags: new Set(),
    selectedFiles: [],
    metrics: {
      files: 842,
      ownFiles: 826,
      pending: 3,
      favorites: 68,
      shared: 24,
      updated: 12,
    },
  };
  const PAGE_SIZE = 12;
  const COMMUNITY_FAVORITES_KEY = "sheke-v4-community-favorites";
  let customCardSequence = 0;

  const simulatedFiles = [
    ["基层治理数字化案例研究.pdf", "PDF", "2.8 MB", false, "private", "normal", "昨天 18:20 更新"],
    ["公共文化服务标准化建设报告.docx", "DOCX", "1.6 MB", false, "community", "normal", "昨天 16:45 更新"],
    ["城乡公共文化空间调查摘要.md", "MD", "680 KB", true, "private", "normal", "昨天 14:12 更新"],
    ["基层治理案例访谈纪要.docx", "DOCX", "920 KB", false, "private", "normal", "昨天 11:30 更新"],
    ["数字政府政策文件汇编.pdf", "PDF", "4.2 MB", false, "community", "normal", "09-14 17:26 更新"],
    ["公共服务满意度数据报告.docx", "DOCX", "2.1 MB", false, "private", "normal", "09-14 13:08 更新"],
    ["文化空间更新项目资料.pdf", "PDF", "3.4 MB", true, "private", "normal", "09-13 16:40 更新"],
    ["基层应急治理调研记录.docx", "DOCX", "1.3 MB", false, "private", "partial", "09-13 10:22 更新"],
    ["社科成果传播路径分析.md", "MD", "740 KB", false, "community", "normal", "09-12 18:05 更新"],
    ["区域发展政策评估报告.pdf", "PDF", "5.1 MB", false, "private", "normal", "09-12 15:18 更新"],
    ["公共文化服务案例清单.md", "MD", "510 KB", false, "private", "normal", "09-11 17:42 更新"],
    ["社区治理协商记录.docx", "DOCX", "860 KB", false, "community", "normal", "09-11 09:35 更新"],
    ["数字治理平台建设方案.pdf", "PDF", "3.6 MB", true, "private", "normal", "09-10 16:20 更新"],
    ["基层文化设施现状调研.md", "MD", "1.4 MB", false, "private", "normal", "09-10 11:08 更新"],
    ["政策文本分析方法综述.pdf", "PDF", "2.9 MB", false, "community", "normal", "09-09 15:44 更新"],
    ["社会调查数据质量说明.docx", "DOCX", "1.2 MB", false, "private", "normal", "09-09 09:26 更新"],
    ["公共文化服务创新案例.txt", "TXT", "960 KB", false, "private", "normal", "09-08 17:15 更新"],
    ["基层治理研究成果汇编.pdf", "PDF", "6.4 MB", false, "private", "parsing", "09-08 10:02 更新"],
  ];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function requireAuth() {
    if (window.SKAuth?.getUser()) return true;
    window.SKAuth?.open();
    return false;
  }

  function getCards() {
    return Array.from(document.querySelectorAll("[data-knowledge-card]"));
  }

  function getCardName(card) {
    return card?.dataset.name || "";
  }

  function splitFileName(name) {
    const dotIndex = name.lastIndexOf(".");
    if (dotIndex <= 0) return { base: name, extension: "" };
    return {
      base: name.slice(0, dotIndex),
      extension: name.slice(dotIndex),
    };
  }

  function formatActionTime(date = new Date()) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getCardTimeText(card) {
    if (card.dataset.favorite === "true") {
      return `${card.dataset.favoriteTime || card.dataset.updated || "刚刚"} 收藏`;
    }
    if (card.dataset.shared === "community") {
      return `${card.dataset.sharedTime || card.dataset.updated || "刚刚"} 共享至社区`;
    }
    return card.dataset.updated || "刚刚更新";
  }

  function refreshCardTime(card) {
    const time = card.querySelector(".knowledge-card-updated");
    if (time) time.textContent = getCardTimeText(card);
  }

  function getSharedLabel(value) {
    return value === "community" ? "已共享至社区" : "仅自己可见";
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("zh-CN");
  }

  function updateMetrics() {
    const mappings = {
      "[data-stat-files]": state.metrics.files,
      "[data-stat-own-files]": state.metrics.ownFiles,
      "[data-stat-favorites]": state.metrics.favorites,
      "[data-stat-shared]": state.metrics.shared,
    };
    Object.entries(mappings).forEach(([selector, value]) => {
      const node = document.querySelector(selector);
      if (node) node.textContent = formatNumber(value);
    });
  }

  function updateEmptyState(emptyReason = "empty") {
    const cards = getCards().filter((card) => !card.hidden);
    const grid = document.querySelector("[data-knowledge-grid]");
    const empty = document.querySelector("[data-knowledge-empty]");
    const title = empty?.querySelector("h2");
    const description = empty?.querySelector("p");
    if (!grid || !empty) return;

    const isEmpty = cards.length === 0;
    grid.hidden = isEmpty;
    empty.hidden = !isEmpty;
    if (!isEmpty) return;

    if (emptyReason === "search") {
      if (title) title.textContent = "没有找到匹配的文件";
      if (description) description.textContent = "调整关键词或分类后再试。";
    } else {
      if (title) title.textContent = "还没有研究资料";
      if (description) description.textContent = "上传第一个文件后，可以用于检索、问答、研究和审查。";
    }
  }

  function sortCards(cards) {
    if (state.sort === "name") {
      return cards.sort((a, b) => getCardName(a).localeCompare(getCardName(b), "zh-CN"));
    }
    if (state.sort === "created") {
      return cards.reverse();
    }
    return cards;
  }

  function renderPagination(totalPages) {
    const pagination = document.querySelector("[data-knowledge-pagination]");
    if (!pagination) return;
    pagination.replaceChildren();
    pagination.hidden = totalPages <= 1;
    if (totalPages <= 1) return;

    for (let page = 1; page <= totalPages; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(page);
      button.dataset.knowledgePage = String(page);
      button.classList.toggle("is-active", page === state.page);
      button.setAttribute("aria-current", page === state.page ? "page" : "false");
      button.addEventListener("click", () => {
        state.page = page;
        applyFilters();
        document.querySelector(".knowledge-list-section")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
      pagination.append(button);
    }
  }

  function applyFilters() {
    const keyword = state.search.trim().toLowerCase();
    const grid = document.querySelector("[data-knowledge-grid]");
    const cards = getCards();
    const matching = [];

    cards.forEach((card) => {
      const isFavorite = card.dataset.favorite === "true";
      const isCommunity = card.dataset.shared === "community";
      const matchesCategory =
        state.filter === "all" ||
        state.filter === "mine" ||
        (state.filter === "favorite" && isFavorite) ||
        (state.filter === "community" && isCommunity);
      const matchesType = state.fileType === "all" || card.dataset.type === state.fileType;
      const text = [
        card.dataset.name,
        card.dataset.type,
        card.dataset.updated,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !keyword || text.includes(keyword);
      const matches = matchesCategory && matchesType && matchesSearch;
      card.hidden = !matches;
      if (matches) matching.push(card);
    });

    const sorted = sortCards(matching);
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    sorted.forEach((card) => grid?.append(card));
    const pageStart = (state.page - 1) * PAGE_SIZE;
    sorted.forEach((card, index) => {
      card.hidden = index < pageStart || index >= pageStart + PAGE_SIZE;
    });
    renderPagination(totalPages);
    updateEmptyState(keyword ? "search" : "empty");
  }

  function setFilter(filter) {
    state.filter = filter;
    state.page = 1;
    document.querySelectorAll("[data-knowledge-filter]").forEach((button) => {
      const active = button.dataset.knowledgeFilter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    applyFilters();
  }

  function closeCardMenu(except) {
    document.querySelectorAll(".knowledge-card-menu").forEach((menu) => {
      if (menu === except) return;
      menu.classList.remove("is-open");
      const card = menu.closest("[data-knowledge-card]");
      card?.classList.remove("has-open-menu");
      card?.querySelector("[data-knowledge-card-menu]")?.classList.remove("is-open");
    });
  }

  function getCardMenuMarkup(card) {
    const isFavorite = card.dataset.favorite === "true";
    const isCommunity = card.dataset.shared === "community";
    const reviewPending = card.dataset.shareReview === "pending";
    const canRename = !isFavorite && !isCommunity;
    const shareAction = isCommunity
      ? '<button type="button" data-knowledge-card-action="share">取消社区共享</button>'
      : reviewPending
        ? '<button type="button" data-knowledge-card-action="withdraw-review">撤回审核</button>'
        : '<button type="button" data-knowledge-card-action="share">共享到社区</button>';
    return `
      ${canRename ? '<button type="button" data-knowledge-card-action="edit">重命名</button>' : ""}
      ${isFavorite ? '<button type="button" data-knowledge-card-action="favorite">取消收藏</button>' : ""}
      ${isFavorite ? "" : shareAction}
      <button type="button" data-knowledge-card-action="delete">删除</button>
    `;
  }

  function openCardMenu(button, card) {
    let menu = card.querySelector(".knowledge-card-menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.className = "knowledge-card-menu";
      card.append(menu);
    }
    menu.innerHTML = getCardMenuMarkup(card);
    const willOpen = !menu.classList.contains("is-open");
    closeCardMenu(menu);
    menu.classList.toggle("is-open", willOpen);
    card.classList.toggle("has-open-menu", willOpen);
    button.classList.toggle("is-open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
  }

  function openModal(modal) {
    const mask = document.querySelector("[data-knowledge-modal-mask]");
    if (!mask || !modal) return;
    state.activeModal = modal;
    mask.hidden = false;
    modal.hidden = false;
    requestAnimationFrame(() => {
      mask.classList.add("is-open");
      modal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
  }

  function closeModal() {
    const mask = document.querySelector("[data-knowledge-modal-mask]");
    const modal = state.activeModal;
    if (!mask || !modal) return;
    mask.classList.remove("is-open");
    modal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      mask.hidden = true;
      modal.hidden = true;
      state.activeModal = null;
    }, 220);
  }

  function createFileCard({
    name,
    type = "文件",
    size = "0 KB",
    favorite = false,
    shared = "private",
    status = "parsing",
    updated = "刚刚更新",
  }) {
    const card = document.createElement("article");
    card.className = "knowledge-card";
    card.dataset.knowledgeCard = "";
    card.dataset.id = `custom-${Date.now()}-${++customCardSequence}`;
    card.dataset.name = name;
    card.dataset.type = type;
    card.dataset.size = size;
    card.dataset.favorite = String(favorite);
    if (favorite) card.dataset.favoriteTime = updated;
    card.dataset.shared = shared;
    if (shared === "community") card.dataset.sharedTime = updated;
    card.dataset.status = status;
    card.dataset.updated = updated;
    card.innerHTML = `
      <button class="knowledge-card-main" type="button" data-knowledge-open>
        <span class="knowledge-card-copy">
          <span class="knowledge-card-title"><strong>${escapeHtml(name)}</strong>${shared === "community" ? '<small class="knowledge-shared-tag">社区共享</small>' : ""}</span>
          <span class="knowledge-card-description">${escapeHtml(type)}</span>
          <span class="knowledge-card-meta">${escapeHtml(size)} · ${getSharedLabel(shared)}</span>
          <span class="knowledge-card-updated">${escapeHtml(getCardTimeText(card))}</span>
        </span>
      </button>
      <button class="knowledge-card-more" type="button" data-knowledge-card-menu aria-label="更多操作"><span data-icon="ellipsis"></span></button>
    `;
    window.SKIcons.hydrate(card);
    document.querySelector("[data-knowledge-grid]")?.prepend(card);
    return card;
  }

  function buildAdditionalFiles(count) {
    const scopes = ["基层治理", "公共文化", "区域发展", "数字政府", "社会调查", "乡村振兴"];
    const topics = ["政策分析", "调研报告", "案例汇编", "研究综述", "访谈记录", "数据说明", "实践资料", "成果摘要"];
    const extensions = ["PDF", "DOCX", "MD", "TXT"];
    const files = [];

    for (let index = 0; index < count; index += 1) {
      const scope = scopes[index % scopes.length];
      const topic = topics[Math.floor(index / scopes.length) % topics.length];
      const type = extensions[index % extensions.length];
      const ext = type.toLowerCase();
      const day = 7 - Math.floor(index / 8);
      const hour = String(9 + (index % 9)).padStart(2, "0");
      const minute = String((index * 7) % 60).padStart(2, "0");
      files.push([
        `${scope}${topic}${String(index + 1).padStart(2, "0")}.${ext}`,
        type,
        `${(0.4 + (index % 12) * 0.37).toFixed(1)} MB`,
        index % 9 === 0,
        index % 9 !== 0 && index % 4 === 0 ? "community" : "private",
        index % 11 === 0 ? "parsing" : index % 13 === 0 ? "partial" : "normal",
        `09-${Math.max(1, day)} ${hour}:${minute} 更新`,
      ]);
    }

    return files;
  }

  function seedFiles() {
    [...simulatedFiles, ...buildAdditionalFiles(47)].reverse().forEach(
      ([name, type, size, favorite, shared, status, updated]) => {
        createFileCard({ name, type, size, favorite, shared, status, updated });
      },
    );
  }

  function getCommunityFavorites() {
    try {
      return JSON.parse(localStorage.getItem(COMMUNITY_FAVORITES_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveCommunityFavorites(favorites) {
    try {
      localStorage.setItem(COMMUNITY_FAVORITES_KEY, JSON.stringify(favorites));
    } catch {}
  }

  function seedCommunityFavorites() {
    getCommunityFavorites().forEach((file) => {
      const cardId = `community-${file.id}`;
      if (getCards().some((card) => card.dataset.id === cardId)) return;
      const card = createFileCard({
        name: file.name,
        type: file.type,
        size: file.size,
        favorite: true,
        shared: "private",
        status: "normal",
        updated: file.favoritedAt || "刚刚收藏",
      });
      card.dataset.id = cardId;
      card.dataset.communityId = file.id;
      refreshCardTime(card);
    });
  }

  function openEditModal(card) {
    if (card.dataset.favorite === "true" || card.dataset.shared === "community") {
      window.SKApp.showToast("已收藏或已共享文件不能重命名");
      return;
    }
    state.activeCard = card;
    document.querySelector("[data-knowledge-edit-name]").value = splitFileName(getCardName(card)).base;
    openModal(document.querySelector("[data-knowledge-edit-modal]"));
  }

  function openDeleteModal(card) {
    state.activeCard = card;
    const description = document.querySelector("[data-knowledge-delete-description]");
    if (description) description.textContent = `确认删除“${getCardName(card)}”吗？删除后无法恢复。`;
    openModal(document.querySelector("[data-knowledge-delete-modal]"));
  }

  function openConfirmModal({ title, description, message, onConfirm }) {
    const modal = document.querySelector("[data-knowledge-confirm-modal]");
    const titleNode = modal?.querySelector("[data-knowledge-confirm-title]");
    const descriptionNode = modal?.querySelector("[data-knowledge-confirm-description]");
    const messageNode = modal?.querySelector("[data-knowledge-confirm-message]");
    if (!modal) return;
    if (titleNode) titleNode.textContent = title;
    if (descriptionNode) descriptionNode.textContent = description || "";
    if (messageNode) messageNode.textContent = message || "";
    state.confirmAction = onConfirm;
    openModal(modal);
  }

  function openShareReviewModal(card) {
    state.activeCard = card;
    state.shareTags = new Set();
    state.customTags = new Set();
    const modal = document.querySelector("[data-knowledge-share-review-modal]");
    const fileName = modal?.querySelector("[data-knowledge-share-file-name]");
    const customInput = modal?.querySelector("[data-knowledge-custom-tag-input]");
    const tagOptions = modal?.querySelector("[data-knowledge-tag-options]");
    const customTagList = modal?.querySelector("[data-knowledge-custom-tag-list]");
    const tagTrigger = modal?.querySelector("[data-knowledge-tag-trigger]");
    const tagLabel = modal?.querySelector("[data-knowledge-tag-label]");
    tagOptions?.querySelectorAll("[data-custom-tag]").forEach((label) => label.remove());
    if (customTagList) {
      customTagList.replaceChildren();
      customTagList.hidden = true;
    }
    modal?.querySelectorAll("[data-knowledge-share-tag]").forEach((input) => {
      input.checked = false;
    });
    if (tagOptions) tagOptions.hidden = true;
    if (tagTrigger) tagTrigger.setAttribute("aria-expanded", "false");
    tagTrigger?.classList.remove("is-open");
    if (tagLabel) tagLabel.textContent = "请选择分类标签";
    if (fileName) fileName.textContent = getCardName(card);
    if (customInput) customInput.value = "";
    openModal(modal);
  }

  function openUploadModal() {
    if (!requireAuth()) return;
    renderSelectedFiles();
    openModal(document.querySelector("[data-knowledge-upload-modal]"));
  }

  function renderSelectedFiles() {
    const list = document.querySelector("[data-knowledge-upload-list]");
    if (!list) return;
    if (!state.selectedFiles.length) {
      list.innerHTML = "<p>暂未选择文件</p>";
      return;
    }
    list.innerHTML = state.selectedFiles
      .map(
        (file, index) => `
          <span class="knowledge-upload-file">
            <span>${escapeHtml(file.name)} · ${Math.max(1, Math.round(file.size / 1024))} KB</span>
            <button type="button" data-upload-remove="${index}" aria-label="移除文件">×</button>
          </span>
        `,
      )
      .join("");
  }

  function editCard(card) {
    const nameInput = document.querySelector("[data-knowledge-edit-name]");
    const baseName = nameInput.value.trim();
    if (!baseName) {
      nameInput.focus();
      return;
    }
    const { extension } = splitFileName(getCardName(card));
    const name = extension && !baseName.toLowerCase().endsWith(extension.toLowerCase())
      ? `${baseName}${extension}`
      : baseName;
    card.dataset.name = name;
    card.querySelector(".knowledge-card-title strong").textContent = name;
    closeModal();
    applyFilters();
    window.SKApp.showToast("文件名称已更新");
  }

  function deleteCard(card) {
    state.metrics.files = Math.max(0, state.metrics.files - 1);
    state.metrics.ownFiles = Math.max(0, state.metrics.ownFiles - 1);
    if (card.dataset.favorite === "true") state.metrics.favorites = Math.max(0, state.metrics.favorites - 1);
    if (card.dataset.shared === "community") state.metrics.shared = Math.max(0, state.metrics.shared - 1);
    if (card.dataset.status !== "normal") state.metrics.pending = Math.max(0, state.metrics.pending - 1);
    card.remove();
    updateMetrics();
    closeModal();
    applyFilters();
    window.SKApp.showToast("文件已删除");
  }

  function toggleFavorite(card) {
    if (card.dataset.favorite !== "true") return;
    card.dataset.favorite = "false";
    if (card.dataset.communityId) {
      saveCommunityFavorites(
        getCommunityFavorites().filter((file) => file.id !== card.dataset.communityId),
      );
    }
    state.metrics.favorites = Math.max(0, state.metrics.favorites - 1);
    const label = card.querySelector(".knowledge-card-meta");
    if (label) {
      label.textContent = `${card.dataset.size || "0 KB"} · ${getSharedLabel(card.dataset.shared)}`;
    }
    refreshCardTime(card);
    closeCardMenu();
    applyFilters();
    updateMetrics();
    window.SKApp.showToast("已取消收藏");
  }

  function toggleShare(card) {
    if (card.dataset.favorite === "true") {
      window.SKApp.showToast("已收藏文件不能用于社区分享");
      return;
    }
    card.dataset.shared = card.dataset.shared === "community" ? "private" : "community";
    if (card.dataset.shared === "community") {
      card.dataset.sharedTime = formatActionTime();
    } else {
      delete card.dataset.sharedTime;
    }
    state.metrics.shared = Math.max(
      0,
      state.metrics.shared + (card.dataset.shared === "community" ? 1 : -1),
    );
    const label = card.querySelector(".knowledge-card-meta");
    if (label) label.textContent = `${card.dataset.size || "0 KB"} · ${getSharedLabel(card.dataset.shared)}`;
    const title = card.querySelector(".knowledge-card-title");
    let tag = title?.querySelector(".knowledge-shared-tag");
    if (card.dataset.shared === "community") {
      if (!tag && title) {
        tag = document.createElement("small");
        tag.className = "knowledge-shared-tag";
        tag.textContent = "社区共享";
        title.append(tag);
      }
    } else {
      tag?.remove();
    }
    refreshCardTime(card);
    closeCardMenu();
    applyFilters();
    updateMetrics();
    window.SKApp.showToast(card.dataset.shared === "community" ? "已共享至社区" : "已取消社区共享");
  }

  function withdrawShareReview(card) {
    delete card.dataset.shareReview;
    delete card.dataset.reviewTags;
    card.querySelector(".knowledge-review-tag")?.remove();
    const meta = card.querySelector(".knowledge-card-meta");
    if (meta) {
      meta.textContent = `${card.dataset.size || "0 KB"} · ${getSharedLabel(card.dataset.shared)}`;
    }
    refreshCardTime(card);
    closeCardMenu();
    applyFilters();
    window.SKApp.showToast("已撤回共享审核");
  }

  function initCardActions() {
    const grid = document.querySelector("[data-knowledge-grid]");
    if (!grid) return;

    grid.addEventListener("click", (event) => {
      const menuButton = event.target.closest("[data-knowledge-card-menu]");
      const card = event.target.closest("[data-knowledge-card]");
      if (!card) return;

      if (menuButton) {
        event.stopPropagation();
        openCardMenu(menuButton, card);
        return;
      }

      const action = event.target.closest("[data-knowledge-card-action]");
      if (action) {
        closeCardMenu();
        if (action.dataset.knowledgeCardAction === "edit") openEditModal(card);
        if (action.dataset.knowledgeCardAction === "favorite" && card.dataset.favorite === "true") {
          openConfirmModal({
            title: "取消收藏",
            description: "确认将文件从收藏中移除？",
            message: `“${getCardName(card)}”取消收藏后，仍会保留在“我的文件”中。`,
            onConfirm: () => toggleFavorite(card),
          });
        }
        if (action.dataset.knowledgeCardAction === "share") {
          if (card.dataset.shared === "community") {
            openConfirmModal({
              title: "取消社区共享",
              description: "取消后，社区用户将无法继续查看该文件。",
              message: `“${getCardName(card)}”将取消社区共享。`,
              onConfirm: () => toggleShare(card),
            });
          } else {
            openShareReviewModal(card);
          }
        }
        if (action.dataset.knowledgeCardAction === "withdraw-review") {
          openConfirmModal({
            title: "撤回共享审核",
            description: "撤回后，本次共享标签和审核进度将被清除。",
            message: `确认撤回“${getCardName(card)}”的共享审核吗？`,
            onConfirm: () => withdrawShareReview(card),
          });
        }
        if (action.dataset.knowledgeCardAction === "delete") openDeleteModal(card);
        return;
      }

      if (event.target.closest("[data-knowledge-open]")) {
        window.open(
          `./reader.html?source=knowledge&file=${encodeURIComponent(getCardName(card))}`,
          "_blank",
          "noopener,noreferrer",
        );
      }
    });

    document.addEventListener("click", (event) => {
      if (
        event.target.closest(".knowledge-card-menu") ||
        event.target.closest("[data-knowledge-card-menu]")
      ) {
        return;
      }
      closeCardMenu();
    });
  }

  function initModals() {
    const mask = document.querySelector("[data-knowledge-modal-mask]");
    document.querySelectorAll("[data-knowledge-modal-close]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });
    mask?.addEventListener("click", closeModal);

    document.querySelectorAll("[data-knowledge-upload-open]").forEach((button) => {
      button.addEventListener("click", openUploadModal);
    });

    document.querySelector("[data-knowledge-edit-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (state.activeCard) editCard(state.activeCard);
    });

    document.querySelector("[data-knowledge-delete-confirm]")?.addEventListener("click", () => {
      if (state.activeCard) deleteCard(state.activeCard);
    });

    document.querySelector("[data-knowledge-confirm-submit]")?.addEventListener("click", () => {
      const action = state.confirmAction;
      state.confirmAction = null;
      closeModal();
      action?.();
    });

    document.querySelector("[data-knowledge-upload-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!state.selectedFiles.length) {
        window.SKApp.showToast("请先选择文件");
        return;
      }
      state.selectedFiles.forEach((file) => {
        const extension = file.name.includes(".") ? file.name.split(".").pop().toUpperCase() : "文件";
        createFileCard({
          name: file.name,
          type: extension,
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        });
      });
      state.metrics.files += state.selectedFiles.length;
      state.metrics.ownFiles += state.selectedFiles.length;
      state.metrics.pending += state.selectedFiles.length;
      state.selectedFiles = [];
      renderSelectedFiles();
      updateMetrics();
      setFilter("mine");
      closeModal();
      applyFilters();
      window.SKApp.showToast("文件已上传，开始解析");
    });
  }

  function initUpload() {
    const dropzone = document.querySelector("[data-knowledge-dropzone]");
    const input = document.querySelector("[data-knowledge-file-input]");
    const list = document.querySelector("[data-knowledge-upload-list]");
    if (!dropzone || !input) return;

    dropzone.addEventListener("click", () => input.click());
    dropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropzone.classList.add("is-dragging");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragging"));
    dropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragging");
      state.selectedFiles = [...state.selectedFiles, ...Array.from(event.dataTransfer.files || [])];
      renderSelectedFiles();
    });
    input.addEventListener("change", () => {
      state.selectedFiles = [...state.selectedFiles, ...Array.from(input.files || [])];
      input.value = "";
      renderSelectedFiles();
    });
    list?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-upload-remove]");
      if (!button) return;
      state.selectedFiles.splice(Number(button.dataset.uploadRemove), 1);
      renderSelectedFiles();
    });
  }

  function initShareReview() {
    const modal = document.querySelector("[data-knowledge-share-review-modal]");
    if (!modal) return;

    const tagTrigger = modal.querySelector("[data-knowledge-tag-trigger]");
    const tagOptions = modal.querySelector("[data-knowledge-tag-options]");
    const tagLabel = modal.querySelector("[data-knowledge-tag-label]");
    const setOptionsOpen = (open) => {
      tagOptions.hidden = !open;
      tagTrigger.setAttribute("aria-expanded", String(open));
      tagTrigger.classList.toggle("is-open", open);
    };
    const syncTags = () => {
      modal.querySelectorAll("[data-knowledge-share-tag]").forEach((input) => {
        input.checked = state.shareTags.has(input.value);
      });
      const presetTags = Array.from(state.shareTags).filter((tag) => !state.customTags.has(tag));
      tagLabel.textContent = presetTags.length
        ? presetTags.join("、")
        : state.customTags.size
          ? `已添加 ${state.customTags.size} 个自定义标签`
          : "请选择分类标签";
    };

    tagTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      setOptionsOpen(tagOptions.hidden);
    });

    modal.addEventListener("change", (event) => {
      const input = event.target.closest("[data-knowledge-share-tag]");
      if (!input) return;
      const tag = input.value;
      if (input.checked) {
        state.shareTags.add(tag);
      } else {
        state.shareTags.delete(tag);
      }
      syncTags();
    });

    const customInput = modal.querySelector("[data-knowledge-custom-tag-input]");
    const customTagList = modal.querySelector("[data-knowledge-custom-tag-list]");
    modal.querySelector("[data-knowledge-add-tag]")?.addEventListener("click", () => {
      const tag = customInput.value.trim();
      if (!tag) {
        customInput.focus();
        return;
      }
      if (state.shareTags.has(tag)) {
        window.SKApp.showToast("该分类标签已存在");
        return;
      }
      state.shareTags.add(tag);
      state.customTags.add(tag);
      const item = document.createElement("span");
      item.className = "knowledge-custom-tag-item";
      item.innerHTML = `<span>${escapeHtml(tag)}</span><button type="button" aria-label="删除标签">×</button>`;
      item.querySelector("button").addEventListener("click", () => {
        state.shareTags.delete(tag);
        state.customTags.delete(tag);
        item.remove();
        if (customTagList) customTagList.hidden = customTagList.children.length === 0;
        syncTags();
      });
      customTagList.append(item);
      customTagList.hidden = false;
      customInput.value = "";
      syncTags();
    });

    document.addEventListener("click", (event) => {
      if (!modal.querySelector("[data-knowledge-tag-select]")?.contains(event.target)) {
        setOptionsOpen(false);
      }
    });

    modal.querySelector("[data-knowledge-share-submit]")?.addEventListener("click", () => {
      if (!state.activeCard) return;
      if (!state.shareTags.size) {
        window.SKApp.showToast("请至少选择一个分类标签");
        return;
      }
      state.activeCard.dataset.shareReview = "pending";
      state.activeCard.dataset.reviewTags = Array.from(state.shareTags).join(",");
      const meta = state.activeCard.querySelector(".knowledge-card-meta");
      if (meta) {
        meta.textContent = `${state.activeCard.dataset.size || "0 KB"} · 等待官方审核`;
      }
      const title = state.activeCard.querySelector(".knowledge-card-title");
      let tag = title?.querySelector(".knowledge-review-tag");
      if (!tag && title) {
        tag = document.createElement("small");
        tag.className = "knowledge-review-tag";
        tag.textContent = "待审核";
        title.append(tag);
      }
      closeModal();
      applyFilters();
      window.SKApp.showToast("已提交共享审核，请等待官方审核");
    });
  }

  function initPageControls() {
    document.querySelectorAll("[data-history-item]").forEach((item) => {
      item.addEventListener("click", () => {
        const title = item.querySelector(".history-item-text")?.textContent.trim() || "";
        window.location.href = `./research-assistant.html?conversation=${encodeURIComponent(title)}`;
      });
    });
    document.querySelector("[data-research-expand]")?.addEventListener("click", () => {
      window.SKApp.showToast("研究项目页面后续接入");
    });

    document.querySelectorAll("[data-knowledge-filter]").forEach((button) => {
      button.addEventListener("click", () => setFilter(button.dataset.knowledgeFilter));
    });

    document.querySelector("[data-knowledge-search]")?.addEventListener("input", (event) => {
      state.search = event.target.value;
      state.page = 1;
      applyFilters();
    });

    const typeRoot = document.querySelector("[data-knowledge-type-filter]");
    const typeTrigger = typeRoot?.querySelector("[data-knowledge-type-trigger]");
    const typeList = typeRoot?.querySelector("[data-knowledge-type-list]");
    const typeLabel = typeRoot?.querySelector("[data-knowledge-type-label]");
    const setTypeOpen = (open) => {
      if (!typeList || !typeTrigger) return;
      typeList.hidden = !open;
      typeTrigger.setAttribute("aria-expanded", String(open));
    };
    typeTrigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      setTypeOpen(typeList.hidden);
    });
    typeList?.querySelectorAll("[data-knowledge-type-value]").forEach((option) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        state.fileType = option.dataset.knowledgeTypeValue;
        state.page = 1;
        if (typeLabel) typeLabel.textContent = option.textContent;
        typeList.querySelectorAll("[data-knowledge-type-value]").forEach((item) => {
          const selected = item === option;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-selected", String(selected));
        });
        setTypeOpen(false);
        applyFilters();
      });
    });

    const sortRoot = document.querySelector("[data-knowledge-sort-menu]");
    const sortTrigger = sortRoot?.querySelector("[data-knowledge-sort-trigger]");
    const sortList = sortRoot?.querySelector("[data-knowledge-sort-list]");
    const sortLabel = sortRoot?.querySelector("[data-knowledge-sort-label]");
    const setSortOpen = (open) => {
      if (!sortList || !sortTrigger) return;
      sortList.hidden = !open;
      sortTrigger.setAttribute("aria-expanded", String(open));
    };
    sortTrigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      setSortOpen(sortList.hidden);
    });
    sortList?.querySelectorAll("[data-knowledge-sort-value]").forEach((option) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        state.sort = option.dataset.knowledgeSortValue;
        state.page = 1;
        if (sortLabel) sortLabel.textContent = option.textContent;
        sortList.querySelectorAll("[data-knowledge-sort-value]").forEach((item) => {
          const selected = item === option;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-selected", String(selected));
        });
        setSortOpen(false);
        applyFilters();
      });
    });
    document.addEventListener("click", (event) => {
      if (!sortRoot?.contains(event.target)) setSortOpen(false);
      if (!typeRoot?.contains(event.target)) setTypeOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setSortOpen(false);
        setTypeOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.activeModal) {
        event.preventDefault();
        closeModal();
      }
    });

    document.querySelector("[data-knowledge-retry]")?.addEventListener("click", () => {
      document.querySelector("[data-knowledge-error]").hidden = true;
      applyFilters();
      window.SKApp.showToast("已重新加载");
    });
  }

  function initDemoState() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("state") !== "error") return;
    const grid = document.querySelector("[data-knowledge-grid]");
    const empty = document.querySelector("[data-knowledge-empty]");
    const error = document.querySelector("[data-knowledge-error]");
    if (grid) grid.hidden = true;
    if (empty) empty.hidden = true;
    if (error) error.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", () => {
    seedFiles();
    seedCommunityFavorites();
    getCards().forEach(refreshCardTime);
    updateMetrics();
    initCardActions();
    initModals();
    initUpload();
    initShareReview();
    initPageControls();
    applyFilters();
    initDemoState();
  });
})();


