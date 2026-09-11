(function () {
  "use strict";

  const documents = [
    {
      id: "culture-digital",
      title: "基层公共文化服务数字化建设研究",
      meta: "湖北省社会科学院 · 2025 · 18,640 字",
      progress: 35,
    },
    {
      id: "regional-governance",
      title: "区域治理现代化评价框架研究",
      meta: "中部发展研究基地 · 2024 · 12,320 字",
      progress: 62,
    },
    {
      id: "evidence-layers",
      title: "公共政策分析中的证据分层方法",
      meta: "《社会科学研究》 · 2025 · 9,860 字",
      progress: 18,
    },
    {
      id: "knowledge-graph",
      title: "社科成果知识图谱建设路径",
      meta: "湖北社科数据中心 · 2025 · 7,240 字",
      progress: 80,
    },
    {
      id: "rural-service",
      title: "农村公共服务供给机制研究",
      meta: "乡村振兴研究院 · 2024 · 15,480 字",
      progress: 8,
    },
  ];
  const literatureTitlePool = [
    "公共文化服务数字化研究",
    "区域治理现代化评价",
    "公共政策证据分层",
    "社科成果知识图谱",
    "农村公共服务供给",
    "城市更新与社区治理",
    "基层治理案例研究",
    "数字政府建设观察",
    "社会调查方法手册",
    "文化传承研究成果",
    "养老服务政策研究",
    "社区协商机制研究",
    "乡村振兴实践报告",
    "公共服务绩效评估",
    "社会组织参与研究",
    "数据治理与隐私保护",
  ];
  const myLibraryItems = [
    ...Array.from({ length: 12 }, (_, index) => ({
      id: `mine-${index + 1}`,
      title: literatureTitlePool[index],
      meta: `${36 + index * 7} 份资料 · 私有`,
      categories: ["mine"],
    })),
    ...Array.from({ length: 16 }, (_, index) => ({
      id: `favorite-${index + 1}`,
      title: literatureTitlePool[(index + 3) % literatureTitlePool.length],
      meta: `${48 + index * 5} 页 · 已收藏`,
      categories: ["favorite"],
    })),
    ...Array.from({ length: 18 }, (_, index) => ({
      id: `shared-${index + 1}`,
      title: literatureTitlePool[(index + 7) % literatureTitlePool.length],
      meta: `${62 + index * 6} 页 · 已共享`,
      categories: ["shared"],
    })),
  ];
  const MY_PAGE_SIZE = 20;

  const state = {
    activeDocumentId: documents[0].id,
    activePage: 1,
    pageZoom: 100,
    documentSearch: "",
    activeParagraph: null,
    selectedText: "",
    noteExcerpt: "",
    layer: "main",
    detailOrigin: "main",
    myFilter: "all",
    mySearch: "",
    myPage: 1,
  };
  const PAGE_COUNT = 8;

  const documentList = document.querySelector("[data-reader-document-list]");
  const paper = document.querySelector("[data-reader-paper]");
  const aiResult = document.querySelector("[data-reader-ai-result]");
  const fileInput = document.querySelector("[data-reader-file]");
  const selectionToolbar = document.querySelector("[data-reader-selection-toolbar]");
  const mainView = document.querySelector("[data-reader-main-view]");
  const myView = document.querySelector("[data-reader-my-view]");
  const detailView = document.querySelector("[data-reader-detail-view]");
  const topbar = document.querySelector("[data-reader-topbar]");
  const myEntry = document.querySelector("[data-reader-my-open]");
  const myGrid = document.querySelector("[data-reader-my-grid]");
  const myPagination = document.querySelector("[data-reader-my-pagination]");

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showReaderLayer(layer, origin = "main") {
    state.layer = layer;
    if (origin) state.detailOrigin = origin;
    if (mainView) mainView.hidden = layer !== "main";
    if (myView) myView.hidden = layer !== "my";
    if (detailView) detailView.hidden = layer !== "detail";
    if (topbar) topbar.hidden = layer !== "detail";
    hideSelectionToolbar();
    if (layer === "my") renderMyLibrary();
  }

  function openReaderDetail(origin, title, meta) {
    if (title) {
      document.querySelector("[data-reader-document-title]").textContent = title;
    }
    if (meta) {
      document.querySelector("[data-reader-document-meta]").textContent = meta;
    }
    showReaderLayer("detail", origin);
  }

  function syncMyEntryAuth(user) {
    const signedIn = Boolean(user || window.SKAuth?.getUser());
    const myViewVisible = myView && !myView.hidden;
    if (!signedIn && myViewVisible) showReaderLayer("main");
    if (myEntry) myEntry.hidden = !signedIn;
  }

  function renderMyLibrary() {
    if (!myGrid) return;
    const keyword = state.mySearch.trim().toLowerCase();
    const matches = myLibraryItems.filter((item) => {
      const categoryMatch =
        state.myFilter === "all" || item.categories.includes(state.myFilter);
      const keywordMatch = !keyword || item.title.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
    const maxPage = Math.max(1, Math.ceil(matches.length / MY_PAGE_SIZE));
    state.myPage = Math.min(Math.max(1, state.myPage), maxPage);
    const start = (state.myPage - 1) * MY_PAGE_SIZE;
    const visible = matches.slice(start, start + MY_PAGE_SIZE);

    myGrid.innerHTML = visible
      .map(
        (item) => `
          <button class="reader-my-card" type="button" data-reader-my-card="${item.id}" data-reader-card-title="${escapeHtml(item.title)}" data-reader-card-meta="${escapeHtml(item.meta)}">
            <span class="reader-my-card-icon"><span data-icon="file-text"></span></span>
            <span>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.meta)}</p>
            </span>
          </button>
        `,
      )
      .join("");
    window.SKIcons.hydrate(myGrid);

    if (myPagination) {
      const showPagination = matches.length > MY_PAGE_SIZE;
      myPagination.hidden = !showPagination;
      myPagination.innerHTML = showPagination
        ? Array.from({ length: maxPage }, (_, index) => {
            const page = index + 1;
            const active = page === state.myPage;
            return `<button class="${active ? "is-active" : ""}" type="button" data-reader-my-page="${page}" aria-current="${active ? "page" : "false"}">${page}</button>`;
          }).join("")
        : "";
    }
  }

  function getActiveDocument() {
    return documents.find((document) => document.id === state.activeDocumentId) || documents[0];
  }

  function renderDocumentList() {
    const pageLabels = ["摘要", "研究背景", "问题提出", "政策演进", "阶段特征", "区域差异", "结论建议", "延伸阅读"];
    documentList.innerHTML = Array.from({ length: PAGE_COUNT }, (_, index) => {
      const page = index + 1;
      return `
        <button class="reader-document-item${page === state.activePage ? " is-active" : ""}" type="button" data-reader-page="${page}">
          <span class="reader-page-preview">
            <span class="reader-page-preview-title">${escapeHtml(getActiveDocument().title)}</span>
            <span class="reader-page-preview-label">${escapeHtml(pageLabels[index])}</span>
            <span class="reader-page-preview-lines" aria-hidden="true">
              <i></i><i></i><i></i><i></i>
            </span>
            <span class="reader-page-number">${page}</span>
          </span>
          <span class="reader-page-caption">第 ${page} 页</span>
        </button>
      `;
    })
      .join("");
    updatePageIndicators();
  }

  function updatePageIndicators() {
    document.querySelectorAll("[data-reader-current-page]").forEach((node) => {
      node.textContent = String(state.activePage);
    });
    document.querySelectorAll("[data-reader-page-current]").forEach((node) => {
      node.textContent = String(state.activePage);
    });
    document.querySelectorAll("[data-reader-total-pages], [data-reader-page-total]").forEach((node) => {
      node.textContent = String(PAGE_COUNT);
    });
  }

  function goToPage(page) {
    state.activePage = Math.min(Math.max(1, page), PAGE_COUNT);
    renderDocumentList();
    const blocks = Array.from(paper.children);
    const targetIndex = Math.min(
      blocks.length - 1,
      Math.floor(((state.activePage - 1) * blocks.length) / PAGE_COUNT),
    );
    blocks[targetIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateZoom(delta) {
    state.pageZoom = Math.min(140, Math.max(80, state.pageZoom + delta));
    paper.style.fontSize = `${16 * (state.pageZoom / 100)}px`;
    document.querySelectorAll("[data-reader-zoom-value]").forEach((node) => {
      node.textContent = `${state.pageZoom}%`;
    });
  }

  function hideSelectionToolbar() {
    if (selectionToolbar) selectionToolbar.hidden = true;
  }

  function positionSelectionToolbar() {
    if (!selectionToolbar) return;
    const selection = window.getSelection();
    if (
      !selection ||
      selection.isCollapsed ||
      !selection.rangeCount ||
      !paper.contains(selection.anchorNode)
    ) {
      hideSelectionToolbar();
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      hideSelectionToolbar();
      return;
    }
    state.selectedText = text;
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    selectionToolbar.hidden = false;
    requestAnimationFrame(() => {
      const toolbarRect = selectionToolbar.getBoundingClientRect();
      let left = rect.left + rect.width / 2 - toolbarRect.width / 2;
      left = Math.max(12, Math.min(window.innerWidth - toolbarRect.width - 12, left));
      let top = rect.bottom + 10;
      if (top + toolbarRect.height > window.innerHeight - 12) {
        top = Math.max(12, rect.top - toolbarRect.height - 10);
      }
      selectionToolbar.style.left = `${left}px`;
      selectionToolbar.style.top = `${top}px`;
    });
  }

  function handleSelectionAction(action) {
    const text = state.selectedText || getReadingText();
    if (!text) {
      window.SKApp.showToast("请先选择正文内容");
      return;
    }
    if (action === "copy" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      window.SKApp.showToast("已复制选中内容");
      hideSelectionToolbar();
      return;
    }
    window.SKApp.showToast(`已触发${action}`);
    hideSelectionToolbar();
  }

  function updateDocument() {
    const activeDocument = getActiveDocument();
    document.querySelector("[data-reader-document-title]").textContent = activeDocument.title;
    document.querySelector("[data-reader-document-meta]").textContent = activeDocument.meta;
    document.querySelector("[data-reader-progress]").textContent = `${activeDocument.progress}%`;
    state.activePage = 1;
    renderDocumentList();
  }

  function setActiveParagraph(element) {
    document.querySelectorAll("[data-reader-paragraph]").forEach((paragraph) => {
      paragraph.classList.toggle("is-active", paragraph === element);
    });
    state.activeParagraph = element;
    state.selectedText = "";
    const text = element?.textContent.trim() || "";
    const selectionState = document.querySelector("[data-reader-selection-state]");
    if (selectionState) {
      selectionState.textContent = text
        ? `已选择 ${text.length} 字，可使用工具栏处理`
        : "点击段落开始精读";
    }
  }

  function getReadingText() {
    return (
      state.selectedText ||
      state.activeParagraph?.textContent.trim() ||
      document.querySelector("[data-reader-paragraph]")?.textContent.trim() ||
      ""
    );
  }

  function renderToolResult(tool) {
    const text = getReadingText();
    if (!text) {
      window.SKApp.showToast("请先选择需要处理的段落或文字");
      return;
    }
    const excerpt = text.length > 72 ? `${text.slice(0, 72)}…` : text;
    const results = {
      summary: {
        label: "段落总结",
        copy: `本段主要讨论：${excerpt}`,
      },
      translate: {
        label: "英文翻译",
        copy: `This passage focuses on: ${excerpt}`,
      },
      explain: {
        label: "概念解释",
        copy: `这段文字强调公共文化服务数字化需要同时考虑技术条件、组织能力和制度保障。核心概念包括服务效能、数据治理与跨部门协同。`,
      },
    };
    const result = results[tool];
    aiResult.innerHTML = `
      <span>${result.label}</span>
      <p>${escapeHtml(result.copy)}</p>
    `;
  }

  function updateNoteCount() {
    document.querySelector("[data-reader-note-count]").textContent =
      document.querySelectorAll(".reader-note").length;
  }

  function openNoteEditor() {
    const editor = document.querySelector("[data-reader-note-editor]");
    const input = document.querySelector("[data-reader-note-input]");
    const text = getReadingText();
    state.noteExcerpt = text.length > 46 ? `${text.slice(0, 46)}…` : text;
    input.value = "";
    editor.hidden = false;
    window.setTimeout(() => input.focus(), 40);
  }

  function saveNote() {
    const editor = document.querySelector("[data-reader-note-editor]");
    const input = document.querySelector("[data-reader-note-input]");
    const content = input.value.trim();
    if (!content) {
      window.SKApp.showToast("请输入笔记内容");
      input.focus();
      return;
    }
    const note = document.createElement("article");
    note.className = "reader-note";
    note.innerHTML = `
      <p>${escapeHtml(content)}</p>
      <span>${state.noteExcerpt ? `选中内容：${escapeHtml(state.noteExcerpt)} · ` : ""}刚刚</span>
    `;
    document.querySelector("[data-reader-note-list]").prepend(note);
    editor.hidden = true;
    state.noteExcerpt = "";
    updateNoteCount();
    window.SKApp.showToast("笔记已保存");
  }

  function importDocument(file) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
    documents.unshift({
      id: `document-${Date.now()}`,
      title: file.name.replace(/\.[^.]+$/, ""),
      meta: `${extension} · ${Math.max(1, Math.round(file.size / 1024))} KB · 刚刚导入`,
      progress: 0,
    });
    state.activeDocumentId = documents[0].id;
    state.documentSearch = "";
    const searchInput = document.querySelector("[data-reader-search]");
    if (searchInput) searchInput.value = "";
    updateDocument();
    window.SKApp.showToast("文献已导入");
  }

  function initDocumentList() {
    documentList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-reader-page]");
      if (!button) return;
      state.activePage = Number(button.dataset.readerPage) || 1;
      state.activeParagraph = null;
      state.selectedText = "";
      document.querySelectorAll("[data-reader-paragraph]").forEach((paragraph) => {
        paragraph.classList.remove("is-active");
      });
      goToPage(state.activePage);
    });
  }

  function initReading() {
    paper.addEventListener("click", (event) => {
      const paragraph = event.target.closest("[data-reader-paragraph]");
      if (paragraph) setActiveParagraph(paragraph);
    });

    document.addEventListener("selectionchange", () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !paper.contains(selection.anchorNode)) {
        hideSelectionToolbar();
        return;
      }
      const text = selection.toString().trim();
      if (!text) return;
      state.selectedText = text;
      positionSelectionToolbar();
    });

    document.querySelectorAll("[data-reader-tool]").forEach((button) => {
      button.addEventListener("click", () => renderToolResult(button.dataset.readerTool));
    });

    document.querySelectorAll("[data-reader-selection-action]").forEach((button) => {
      button.addEventListener("click", () => handleSelectionAction(button.dataset.readerSelectionAction));
    });
    document.querySelectorAll("[data-reader-selection-format]").forEach((button) => {
      button.addEventListener("click", () => handleSelectionAction(button.dataset.readerSelectionFormat));
    });
    selectionToolbar?.addEventListener("mousedown", (event) => event.preventDefault());
    document.addEventListener("mousedown", (event) => {
      if (selectionToolbar?.contains(event.target) || paper.contains(event.target)) return;
      hideSelectionToolbar();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hideSelectionToolbar();
    });
    paper.addEventListener("scroll", hideSelectionToolbar, { passive: true });

    document.querySelector("[data-reader-bookmark]").addEventListener("click", (event) => {
      event.currentTarget.classList.toggle("is-active");
      window.SKApp.showToast("文献收藏状态已更新");
    });

    document.querySelector("[data-reader-download]").addEventListener("click", () => {
      window.SKApp.showToast("文献下载已开始");
    });
  }

  function initPageControls() {
    document.querySelector("[data-reader-page-prev]")?.addEventListener("click", () => {
      goToPage(state.activePage - 1);
    });
    document.querySelector("[data-reader-page-next]")?.addEventListener("click", () => {
      goToPage(state.activePage + 1);
    });
    document.querySelector("[data-reader-fit-width]")?.addEventListener("click", () => {
      goToPage(state.activePage);
      window.SKApp.showToast("已适合宽度");
    });
    document.querySelector("[data-reader-zoom-out]")?.addEventListener("click", () => updateZoom(-10));
    document.querySelector("[data-reader-zoom-in]")?.addEventListener("click", () => updateZoom(10));
  }

  function initLibraryViews() {
    document.querySelector("[data-reader-back]")?.addEventListener("click", () => {
      showReaderLayer(state.detailOrigin === "my" ? "my" : "main");
    });
    document.querySelector("[data-reader-my-open]")?.addEventListener("click", () => {
      if (!window.SKAuth?.getUser()) {
        window.SKAuth?.open();
        return;
      }
      state.myPage = 1;
      showReaderLayer("my");
    });
    document.querySelector("[data-reader-my-back]")?.addEventListener("click", () => {
      showReaderLayer("main");
    });

    const addMenu = document.querySelector("[data-reader-add-menu]");
    const addTrigger = addMenu?.querySelector("[data-reader-add-trigger]");
    const addList = addMenu?.querySelector("[data-reader-add-menu-list]");
    const setAddMenuOpen = (open) => {
      if (!addList || !addTrigger) return;
      addList.hidden = !open;
      addTrigger.setAttribute("aria-expanded", String(open));
    };
    addTrigger?.addEventListener("click", () => setAddMenuOpen(addList.hidden));
    addList?.addEventListener("click", (event) => {
      const item = event.target.closest("[data-reader-add-item]");
      if (!item) return;
      setAddMenuOpen(false);
      if (item.dataset.readerAddItem === "knowledge") {
        window.SKApp.showToast("知识库添加功能将在后续接入");
      }
    });
    document.addEventListener("click", (event) => {
      if (addMenu && !addMenu.contains(event.target)) setAddMenuOpen(false);
    });

    const librarySearch = document.querySelector("[data-reader-library-search]");
    librarySearch?.addEventListener("input", () => {
      const keyword = librarySearch.value.trim().toLowerCase();
      document.querySelectorAll("[data-reader-example]").forEach((card) => {
        card.hidden = Boolean(keyword) && !card.dataset.readerExampleName.toLowerCase().includes(keyword);
      });
    });

    document.querySelector("[data-reader-example-grid]")?.addEventListener("click", (event) => {
      const card = event.target.closest("[data-reader-example]");
      if (!card) return;
      openReaderDetail("main", card.dataset.readerExampleName, "文献精读案例 · 示例资料");
    });

    document.querySelector("[data-reader-my-filter-group]")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-reader-my-filter]");
      if (!button) return;
      state.myFilter = button.dataset.readerMyFilter;
      state.myPage = 1;
      button.parentElement.querySelectorAll("[data-reader-my-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderMyLibrary();
    });
    document.querySelector("[data-reader-my-search]")?.addEventListener("input", (event) => {
      state.mySearch = event.target.value;
      state.myPage = 1;
      renderMyLibrary();
    });
    myPagination?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-reader-my-page]");
      if (!button) return;
      state.myPage = Number(button.dataset.readerMyPage) || 1;
      renderMyLibrary();
      myGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    myGrid?.addEventListener("click", (event) => {
      const card = event.target.closest("[data-reader-my-card]");
      if (!card) return;
      openReaderDetail(
        "my",
        card.dataset.readerCardTitle,
        card.dataset.readerCardMeta,
      );
    });

    syncMyEntryAuth();
    document.addEventListener("sk:auth-changed", (event) => {
      syncMyEntryAuth(event.detail);
    });
  }

  function initNotes() {
    document.querySelector("[data-reader-note-add]").addEventListener("click", openNoteEditor);
    document.querySelector("[data-reader-note-cancel]").addEventListener("click", () => {
      document.querySelector("[data-reader-note-editor]").hidden = true;
      state.noteExcerpt = "";
    });
    document.querySelector("[data-reader-note-save]").addEventListener("click", saveNote);
  }

  function initUpload() {
    document.querySelectorAll("[data-reader-upload]").forEach((button) => {
      button.addEventListener("click", () => fileInput.click());
    });
    fileInput.addEventListener("change", () => {
      importDocument(fileInput.files?.[0]);
      fileInput.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderDocumentList();
    updateDocument();
    initDocumentList();
    initReading();
    initPageControls();
    initLibraryViews();
    initNotes();
    initUpload();
    updateNoteCount();
  });
})();
