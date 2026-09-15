(function () {
  "use strict";

  const state = {
    selectedText: "",
    selectedRange: null,
    zoom: 100,
    page: 3,
    totalPages: 8,
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function initFileContext() {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");

    if (fileName) {
      document.querySelector("[data-reader-file-title]").textContent = fileName.replace(/\.[^.]+$/, "");
      document.title = `${fileName.replace(/\.[^.]+$/, "")} · 精读工具`;
    }
  }

  function updateProgress() {
    const scroll = document.querySelector("[data-reader-document-scroll]");
    const maxScroll = Math.max(scroll.scrollHeight - scroll.clientHeight, 1);
    const ratio = Math.max(0, Math.min(1, scroll.scrollTop / maxScroll));
    const percent = Math.max(1, Math.min(100, Math.round(ratio * 100)));
    const page = Math.max(1, Math.min(state.totalPages, Math.ceil((percent / 100) * state.totalPages)));
    state.page = page;

    document.querySelector("[data-reader-outline-progress]").textContent = `${percent}%`;
    document.querySelector("[data-reader-outline-progress-bar]").style.width = `${percent}%`;
    document.querySelectorAll("[data-reader-page-current]").forEach((node) => {
      node.textContent = String(page);
    });
    document.querySelectorAll("[data-reader-current-page]").forEach((node) => {
      node.textContent = String(page);
    });

    const sections = Array.from(document.querySelectorAll(".reader-document h3, .reader-abstract"));
    let activeId = sections[0]?.id || "";
    sections.forEach((section) => {
      if (section.offsetTop - scroll.scrollTop <= 160) activeId = section.id;
    });
    document.querySelectorAll("[data-reader-section-target]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.readerSectionTarget === activeId);
    });
  }

  function initOutline() {
    const scroll = document.querySelector("[data-reader-document-scroll]");
    document.querySelectorAll("[data-reader-section-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.readerSectionTarget);
        if (!target) return;
        scroll.scrollTo({ top: Math.max(0, target.offsetTop - 24), behavior: "smooth" });
        document.querySelector("[data-reader-outline]").classList.remove("is-open");
      });
    });
    scroll.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  function initPageControls() {
    const scroll = document.querySelector("[data-reader-document-scroll]");
    const movePage = (direction) => {
      scroll.scrollBy({ top: scroll.clientHeight * 0.78 * direction, behavior: "smooth" });
    };
    document.querySelector("[data-reader-page-prev]")?.addEventListener("click", () => movePage(-1));
    document.querySelector("[data-reader-page-next]")?.addEventListener("click", () => movePage(1));
    document.querySelector("[data-reader-fit-width]")?.addEventListener("click", () => {
      document.querySelector(".reader-document").style.width = "100%";
      window.SKApp.showToast("已切换为适合宽度");
    });
    const setZoom = (nextZoom) => {
      state.zoom = Math.max(80, Math.min(140, nextZoom));
      document.querySelector("[data-reader-zoom-value]").textContent = `${state.zoom}%`;
      document.querySelector(".reader-document").style.fontSize = `${16 * (state.zoom / 100)}px`;
    };
    document.querySelector("[data-reader-zoom-out]")?.addEventListener("click", () => setZoom(state.zoom - 10));
    document.querySelector("[data-reader-zoom-in]")?.addEventListener("click", () => setZoom(state.zoom + 10));
    document.querySelector("[data-reader-outline-toggle]")?.addEventListener("click", () => {
      document.querySelector("[data-reader-outline]").classList.toggle("is-open");
    });
    document.querySelector("[data-reader-outline-close]")?.addEventListener("click", () => {
      document.querySelector("[data-reader-outline]").classList.remove("is-open");
    });
  }

  function hideSelectionToolbar() {
    document.querySelector("[data-reader-selection-toolbar]").hidden = true;
  }

  function showSelectionToolbar(range) {
    const toolbar = document.querySelector("[data-reader-selection-toolbar]");
    const rect = range.getBoundingClientRect();
    toolbar.hidden = false;
    toolbar.style.left = `${Math.min(window.innerWidth - 20, Math.max(20, rect.left + rect.width / 2))}px`;
    toolbar.style.top = `${Math.max(12, rect.top - 46)}px`;
  }

  function getDocumentSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    const documentRoot = document.querySelector("[data-reader-document]");
    if (!documentRoot.contains(range.commonAncestorContainer)) return null;
    return { selection, range, text: selection.toString().trim() };
  }

  function initSelectionTools() {
    const documentRoot = document.querySelector("[data-reader-document]");
    documentRoot.addEventListener("mouseup", () => {
      window.setTimeout(() => {
        const selected = getDocumentSelection();
        if (!selected?.text) {
          hideSelectionToolbar();
          return;
        }
        state.selectedText = selected.text;
        state.selectedRange = selected.range.cloneRange();
        showSelectionToolbar(selected.range);
      }, 0);
    });
    document.addEventListener("mousedown", (event) => {
      if (!event.target.closest("[data-reader-selection-toolbar]")) hideSelectionToolbar();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hideSelectionToolbar();
    });
  }

  function setActiveToolTab(tabName) {
    document.querySelectorAll("[data-reader-tab]").forEach((button) => {
      const active = button.dataset.readerTab === tabName;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-reader-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.readerPanel !== tabName;
    });
  }

  function initToolTabs() {
    document.querySelectorAll("[data-reader-tab]").forEach((button) => {
      button.addEventListener("click", () => setActiveToolTab(button.dataset.readerTab));
    });
  }

  function createAiResult(type, excerpt) {
    const answers = {
      总结: "这段内容强调数字化建设不能停留在平台和设备投入，还需要数据标准、组织协同与基层服务能力共同支撑。",
      翻译: "This passage argues that digital infrastructure alone cannot improve public cultural services without sound data governance, cross-department coordination, and local operational capacity.",
      解释: "该段讨论的是数字化建设与公共服务效能之间的关系，并提示技术投入可能带来新的信息壁垒，因此需要制度与组织条件共同匹配。",
    };
    const article = document.createElement("article");
    article.className = "reader-ai-card";
    article.innerHTML = `
      <span>${escapeHtml(type)}</span>
      <blockquote>${escapeHtml(excerpt)}</blockquote>
      <p>${escapeHtml(answers[type] || answers.总结)}</p>
      <footer>
        <button type="button" data-reader-result-note>保存为笔记</button>
        <button type="button" data-reader-result-regenerate>重新生成</button>
      </footer>
    `;
    return article;
  }

  function runSelectionAction(action) {
    const excerpt = state.selectedText || "当前选中段落";
    hideSelectionToolbar();
    if (action === "记笔记") {
      setActiveToolTab("notes");
      openNoteEditor(excerpt);
      return;
    }
    if (action === "提问") {
      setActiveToolTab("history");
      const input = document.querySelector("[data-reader-question-input]");
      input.value = `关于“${excerpt.slice(0, 48)}”，请结合当前文件进一步说明。`;
      input.focus();
      return;
    }
    if (action !== "总结" && action !== "翻译" && action !== "解释") return;

    setActiveToolTab("assistant");
    const results = document.querySelector("[data-reader-ai-results]");
    const loading = document.createElement("article");
    loading.className = "reader-ai-card is-loading";
    loading.innerHTML = `<span>${escapeHtml(action)}</span><p>正在生成精读结果...</p>`;
    results.prepend(loading);
    window.setTimeout(() => {
      loading.replaceWith(createAiResult(action, excerpt));
      bindResultActions();
    }, 520);
  }

  function applySelectionFormat(format) {
    if (format === "copy") {
      navigator.clipboard?.writeText(state.selectedText || "");
      window.SKApp.showToast("已复制选中文本");
      hideSelectionToolbar();
      return;
    }

    const selection = window.getSelection();
    if (!state.selectedRange) return;
    selection.removeAllRanges();
    selection.addRange(state.selectedRange);
    if (format === "highlight") {
      const mark = document.createElement("mark");
      try {
        state.selectedRange.surroundContents(mark);
      } catch {
        window.SKApp.showToast("请选择同一段落内的文字");
      }
    } else if (format === "underline") {
      document.execCommand("underline");
    }
    window.SKApp.showToast(format === "highlight" ? "已添加高亮" : "已添加下划线");
    hideSelectionToolbar();
  }

  function initSelectionActions() {
    document.querySelectorAll("[data-reader-selection-action]").forEach((button) => {
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => runSelectionAction(button.dataset.readerSelectionAction));
    });
    document.querySelectorAll("[data-reader-selection-format]").forEach((button) => {
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => applySelectionFormat(button.dataset.readerSelectionFormat));
    });
  }

  function bindResultActions() {
    document.querySelectorAll("[data-reader-result-note]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const card = button.closest(".reader-ai-card");
        setActiveToolTab("notes");
        openNoteEditor(card.querySelector("blockquote")?.textContent.trim() || "", "已保存精读结果");
      });
    });
    document.querySelectorAll("[data-reader-result-regenerate]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", () => window.SKApp.showToast("已重新生成精读结果"));
    });
  }

  function initQuestionForm() {
    const form = document.querySelector("[data-reader-question-form]");
    const input = document.querySelector("[data-reader-question-input]");
    const list = document.querySelector("[data-reader-history-list]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      const item = document.createElement("button");
      item.type = "button";
      item.dataset.readerHistoryItem = "";
      item.textContent = question;
      list.prepend(item);
      list.querySelectorAll("[data-reader-history-item]").forEach((button) => button.classList.remove("is-active"));
      item.classList.add("is-active");
      input.value = "";
      setActiveToolTab("assistant");
      const results = document.querySelector("[data-reader-ai-results]");
      const answer = document.createElement("article");
      answer.className = "reader-ai-card";
      answer.innerHTML = `<span>基于当前文件</span><blockquote>${escapeHtml(question)}</blockquote><p>公共文化服务数字化的核心判断是：技术应用必须与数据治理、跨部门协同和基层运营能力结合，才能真正改善服务供给。</p><footer><button type="button" data-reader-result-note>保存为笔记</button></footer>`;
      results.prepend(answer);
      bindResultActions();
    });
    list.querySelectorAll("[data-reader-history-item]").forEach((button) => {
      button.addEventListener("click", () => {
        list.querySelectorAll("[data-reader-history-item]").forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        setActiveToolTab("assistant");
      });
    });
  }

  function updateNoteCount() {
    const count = document.querySelectorAll("[data-reader-note-list] .reader-note").length;
    document.querySelector("[data-reader-note-count]").textContent = String(count);
  }

  function openNoteEditor(excerpt = "", toastMessage = "") {
    const editor = document.querySelector("[data-reader-note-editor]");
    const input = document.querySelector("[data-reader-note-input]");
    editor.hidden = false;
    input.dataset.excerpt = excerpt;
    input.value = "";
    input.placeholder = excerpt ? `摘录：${excerpt.slice(0, 60)}` : "记录判断、疑问或延伸想法";
    input.focus();
    if (toastMessage) window.SKApp.showToast(toastMessage);
  }

  function initNotes() {
    const editor = document.querySelector("[data-reader-note-editor]");
    const input = document.querySelector("[data-reader-note-input]");
    document.querySelector("[data-reader-note-open]")?.addEventListener("click", () => openNoteEditor());
    document.querySelector("[data-reader-note-cancel]")?.addEventListener("click", () => {
      editor.hidden = true;
      input.value = "";
    });
    document.querySelector("[data-reader-note-save]")?.addEventListener("click", () => {
      const content = input.value.trim();
      if (!content) {
        window.SKApp.showToast("请输入笔记内容");
        return;
      }
      const note = document.createElement("article");
      note.className = "reader-note";
      note.innerHTML = `
        <blockquote>${escapeHtml(input.dataset.excerpt || "当前文件阅读笔记")}</blockquote>
        <p>${escapeHtml(content)}</p>
        <footer><span>刚刚 · 当前文件</span><button type="button" data-reader-note-delete aria-label="删除笔记"><span data-icon="trash-2"></span></button></footer>
      `;
      document.querySelector("[data-reader-note-list]").prepend(note);
      window.SKIcons.hydrate(note);
      editor.hidden = true;
      input.value = "";
      updateNoteCount();
      bindNoteDelete(note);
      window.SKApp.showToast("笔记已保存");
    });
    document.querySelectorAll("[data-reader-note-list] .reader-note").forEach(bindNoteDelete);
  }

  function bindNoteDelete(note) {
    note.querySelector("[data-reader-note-delete]")?.addEventListener("click", () => {
      note.remove();
      updateNoteCount();
      window.SKApp.showToast("笔记已删除");
    });
  }

  function initReaderActions() {
    const favorite = document.querySelector("[data-reader-favorite]");
    favorite.addEventListener("click", () => {
      const active = favorite.classList.toggle("is-active");
      favorite.setAttribute("aria-pressed", String(active));
      favorite.title = active ? "取消收藏" : "收藏到我的知识";
      window.SKApp.showToast(active ? "已收藏到我的知识" : "已取消收藏");
    });
    document.querySelector("[data-reader-download]")?.addEventListener("click", () => {
      window.SKApp.showToast("文件下载中");
      window.setTimeout(() => window.SKApp.showToast("文件已下载"), 700);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFileContext();
    initOutline();
    initPageControls();
    initSelectionTools();
    initToolTabs();
    initSelectionActions();
    bindResultActions();
    initQuestionForm();
    initNotes();
    initReaderActions();
    window.setTimeout(() => window.SKApp.showToast("已恢复到上次阅读位置"), 320);
  });
})();
