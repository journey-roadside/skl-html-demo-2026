(function () {
  "use strict";

  let knowledgePickerMask;
  let knowledgePickerModal;
  let sourceModalMask;
  let sourceModal;
  let confirmDialogMask;
  let confirmDialog;
  let confirmAction;
  const selectedKnowledgeBases = new Set();
  const knowledgeBases = [
    { id: "governance", name: "基层治理研究资料", meta: "126 份资料 · 机构知识库" },
    { id: "hubei-results", name: "湖北社科成果精选", meta: "358 份成果 · 公共知识库" },
    { id: "public-culture", name: "公共文化政策专题", meta: "84 份政策与研究资料" },
    { id: "regional", name: "区域发展研究库", meta: "172 份报告与数据" },
    { id: "journals", name: "学术期刊全文库", meta: "1,240 篇期刊论文" },
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

  function createKnowledgePicker() {
    if (knowledgePickerModal) return;
    knowledgePickerMask = document.createElement("div");
    knowledgePickerMask.className = "knowledge-picker-mask";
    knowledgePickerMask.dataset.knowledgePickerMask = "";
    knowledgePickerMask.hidden = true;

    knowledgePickerModal = document.createElement("section");
    knowledgePickerModal.className = "knowledge-picker-modal";
    knowledgePickerModal.dataset.knowledgePicker = "";
    knowledgePickerModal.setAttribute("role", "dialog");
    knowledgePickerModal.setAttribute("aria-modal", "true");
    knowledgePickerModal.setAttribute("aria-labelledby", "knowledgePickerTitle");
    knowledgePickerModal.hidden = true;
    knowledgePickerModal.innerHTML = `
      <div class="knowledge-picker-head">
        <div>
          <h2 id="knowledgePickerTitle">选择知识库</h2>
          <p>可从多个知识库中选择研究资料</p>
        </div>
        <button class="knowledge-picker-close" type="button" data-knowledge-close aria-label="关闭">
          <span data-icon="x"></span>
        </button>
      </div>
      <div class="knowledge-picker-toolbar">
        <label class="knowledge-picker-search">
          <span data-icon="search"></span>
          <input type="search" placeholder="搜索知识库" data-knowledge-search>
        </label>
      </div>
      <div class="knowledge-picker-list" data-knowledge-list></div>
      <div class="knowledge-picker-actions">
        <div class="knowledge-picker-summary">
          <span class="knowledge-picker-count" data-knowledge-count>已选择 0 个知识库</span>
          <button class="knowledge-picker-clear" type="button" data-knowledge-clear disabled>清空选中</button>
        </div>
        <div>
          <button class="btn btn-outline" type="button" data-knowledge-close>取消</button>
          <button class="btn btn-primary" type="button" data-knowledge-confirm>确认选择</button>
        </div>
      </div>
    `;
    document.body.append(knowledgePickerMask, knowledgePickerModal);
    window.SKIcons.hydrate(knowledgePickerModal);

    knowledgePickerModal.querySelectorAll("[data-knowledge-close]").forEach((button) => {
      button.addEventListener("click", closeKnowledgePicker);
    });
    knowledgePickerMask.addEventListener("click", closeKnowledgePicker);
    knowledgePickerModal
      .querySelector("[data-knowledge-search]")
      .addEventListener("input", renderKnowledgeList);
    knowledgePickerModal
      .querySelector("[data-knowledge-confirm]")
      .addEventListener("click", confirmKnowledgeSelection);
    knowledgePickerModal
      .querySelector("[data-knowledge-clear]")
      .addEventListener("click", () => {
        selectedKnowledgeBases.clear();
        renderKnowledgeList();
      });
  }

  function renderKnowledgeList() {
    const keyword = knowledgePickerModal
      .querySelector("[data-knowledge-search]")
      .value.trim()
      .toLowerCase();
    const list = knowledgePickerModal.querySelector("[data-knowledge-list]");
    const results = knowledgeBases.filter((item) => item.name.toLowerCase().includes(keyword));

    list.replaceChildren();
    if (!results.length) {
      const empty = document.createElement("p");
      empty.className = "knowledge-picker-empty";
      empty.textContent = "未找到匹配的知识库";
      list.append(empty);
    } else {
      results.forEach((item) => {
        const button = document.createElement("button");
        const selected = selectedKnowledgeBases.has(item.id);
        button.className = "knowledge-picker-item";
        button.type = "button";
        button.classList.toggle("is-selected", selected);
        button.innerHTML = `
          <span class="knowledge-picker-check">${selected ? "✓" : ""}</span>
          <span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.meta)}</p></span>
        `;
        button.addEventListener("click", () => {
          if (selectedKnowledgeBases.has(item.id)) {
            selectedKnowledgeBases.delete(item.id);
          } else {
            selectedKnowledgeBases.add(item.id);
          }
          renderKnowledgeList();
        });
        list.append(button);
      });
    }

    const countNode = knowledgePickerModal.querySelector("[data-knowledge-count]");
    countNode.textContent = `已选择 ${selectedKnowledgeBases.size} 个知识库`;
    const clearButton = knowledgePickerModal.querySelector("[data-knowledge-clear]");
    clearButton.disabled = selectedKnowledgeBases.size === 0;
  }

  function openKnowledgePicker() {
    createKnowledgePicker();
    renderKnowledgeList();
    knowledgePickerMask.hidden = false;
    knowledgePickerModal.hidden = false;
    requestAnimationFrame(() => {
      knowledgePickerMask.classList.add("is-open");
      knowledgePickerModal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    window.setTimeout(
      () => knowledgePickerModal.querySelector("[data-knowledge-search]").focus(),
      60,
    );
  }

  function closeKnowledgePicker() {
    if (!knowledgePickerModal) return;
    knowledgePickerMask.classList.remove("is-open");
    knowledgePickerModal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      knowledgePickerMask.hidden = true;
      knowledgePickerModal.hidden = true;
    }, 220);
  }

  function confirmKnowledgeSelection() {
    document.querySelectorAll("[data-knowledge-label]").forEach((label) => {
      label.textContent = selectedKnowledgeBases.size
        ? `知识库 · ${selectedKnowledgeBases.size}`
        : "知识库";
    });
    document.querySelectorAll('[data-source-option="知识库"]').forEach((button) => {
      button.classList.toggle("is-on", selectedKnowledgeBases.size > 0);
    });
    closeKnowledgePicker();
    if (selectedKnowledgeBases.size) {
      window.SKApp.showToast(`已选择 ${selectedKnowledgeBases.size} 个知识库`);
    }
  }

  function initSourceAddMenu() {
    const menu = document.querySelector("[data-source-add-menu]");
    const trigger = menu?.querySelector("[data-source-menu-trigger]");
    const list = menu?.querySelector("[data-source-menu-list]");
    if (!menu || !trigger || !list) return;

    const setOpen = (open) => {
      list.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
    };

    trigger.addEventListener("click", () => {
      setOpen(list.hidden);
    });

    list.addEventListener("click", (event) => {
      const item = event.target.closest("[data-source-menu-item]");
      if (!item) return;
      if (item.dataset.sourceMenuItem === "文献" && !requireAuth()) {
        setOpen(false);
        return;
      }
      setOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target)) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !list.hidden) setOpen(false);
    });
  }

  function initKnowledgePicker() {
    document.querySelectorAll('[data-source-option="知识库"]').forEach((button) => {
      button.addEventListener("click", () => {
        if (requireAuth()) openKnowledgePicker();
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (knowledgePickerModal && !knowledgePickerModal.hidden) {
        event.preventDefault();
        closeKnowledgePicker();
        return;
      }
    if (sourceModal && !sourceModal.hidden) {
        event.preventDefault();
        closeSourceModal();
        return;
      }
      if (confirmDialog && !confirmDialog.hidden) {
        event.preventDefault();
        closeConfirmDialog();
      }
    });
  }

  function updateSourceCount() {
    const count = document.querySelectorAll("[data-studio-source]").length;
    document.querySelectorAll("[data-studio-source-count]").forEach((node) => {
      node.textContent = `${count} 个来源`;
    });
  }

  function getSourceStatus(meta) {
    const value = meta || "";
    if (value.includes("解析失败")) return "failed";
    if (value.includes("解析中")) return "parsing";
    if (value.includes("等待解析")) return "pending";
    return "ready";
  }

  function addSource(name, meta) {
    const list = document.querySelector("[data-studio-source-list]");
    if (!list) return;
    list.querySelector(".studio-source-empty")?.remove();

    const card = document.createElement("article");
    card.className = "studio-source-card";
    card.classList.add(`is-${getSourceStatus(meta)}`);
    card.dataset.studioSource = "";
    card.innerHTML = `
      <span class="studio-source-icon"><span data-icon="file-text"></span></span>
      <div class="studio-source-main">
        <h3>${escapeHtml(name)}</h3>
        <p>${escapeHtml(meta || "已添加 · 等待解析")}</p>
      </div>
      <button class="studio-source-delete" type="button" data-studio-source-delete aria-label="删除来源">
        <span data-icon="trash-2"></span>
      </button>
    `;
    window.SKIcons.hydrate(card);
    list.prepend(card);
    updateSourceCount();
  }

  function renderSourceEmptyState() {
    const list = document.querySelector("[data-studio-source-list]");
    if (!list) return;
    const empty = document.createElement("div");
    empty.className = "studio-source-empty";
    empty.innerHTML = `
      <strong>已添加的来源会显示在此处</strong>
      <p>支持 PDF、Word、网页、文本和其他研究资料。</p>
    `;
    list.replaceChildren(empty);
  }

  function createConfirmDialog() {
    if (confirmDialog) return;
    confirmDialogMask = document.createElement("div");
    confirmDialogMask.className = "history-dialog-mask";
    confirmDialogMask.dataset.confirmDialogMask = "";
    confirmDialogMask.hidden = true;

    confirmDialog = document.createElement("section");
    confirmDialog.className = "history-dialog";
    confirmDialog.dataset.confirmDialog = "";
    confirmDialog.setAttribute("role", "alertdialog");
    confirmDialog.setAttribute("aria-modal", "true");
    confirmDialog.setAttribute("aria-labelledby", "confirmDialogTitle");
    confirmDialog.hidden = true;
    confirmDialog.innerHTML = `
      <div class="history-dialog-head">
        <div>
          <h2 id="confirmDialogTitle" data-confirm-title></h2>
          <p data-confirm-description></p>
        </div>
        <button class="history-dialog-close" type="button" data-confirm-dialog-close aria-label="关闭">
          <span data-icon="x"></span>
        </button>
      </div>
      <div class="history-dialog-actions">
        <button class="btn btn-outline" type="button" data-confirm-dialog-close>取消</button>
        <button class="btn btn-primary danger" type="button" data-confirm-dialog-confirm></button>
      </div>
    `;
    document.body.append(confirmDialogMask, confirmDialog);
    window.SKIcons.hydrate(confirmDialog);

    confirmDialog.querySelectorAll("[data-confirm-dialog-close]").forEach((button) => {
      button.addEventListener("click", closeConfirmDialog);
    });
    confirmDialogMask.addEventListener("click", closeConfirmDialog);
    confirmDialog
      .querySelector("[data-confirm-dialog-confirm]")
      .addEventListener("click", runConfirmDialog);
  }

  function openConfirmDialog({ title, description, confirmText = "确认", onConfirm }) {
    createConfirmDialog();
    confirmAction = onConfirm;
    confirmDialog.querySelector("[data-confirm-title]").textContent = title;
    confirmDialog.querySelector("[data-confirm-description]").textContent = description;
    confirmDialog.querySelector("[data-confirm-dialog-confirm]").textContent = confirmText;
    confirmDialogMask.hidden = false;
    confirmDialog.hidden = false;
    requestAnimationFrame(() => {
      confirmDialogMask.classList.add("is-open");
      confirmDialog.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    window.setTimeout(() => confirmDialog.querySelector("[data-confirm-dialog-confirm]").focus(), 60);
  }

  function closeConfirmDialog() {
    if (!confirmDialog || confirmDialog.hidden) return;
    confirmDialogMask.classList.remove("is-open");
    confirmDialog.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      confirmDialogMask.hidden = true;
      confirmDialog.hidden = true;
      confirmAction = null;
    }, 220);
  }

  function runConfirmDialog() {
    const action = confirmAction;
    closeConfirmDialog();
    action?.();
  }

  function openSourceDeleteDialog(card) {
    const name = card.querySelector("h3")?.textContent.trim() || "该来源";
    openConfirmDialog({
      title: "删除来源",
      description: `确认删除“${name}”吗？删除后将无法恢复。`,
      confirmText: "删除",
      onConfirm: () => {
        card.remove();
        updateSourceCount();
        if (!document.querySelector("[data-studio-source]")) {
          renderSourceEmptyState();
        }
      },
    });
  }

  function clearStudio() {
    renderSourceEmptyState();
    document.querySelector("[data-studio-thread]")?.replaceChildren();
    document.querySelector("[data-studio-welcome]")?.removeAttribute("hidden");
    document.querySelector("[data-output-preview]")?.remove();
    document.querySelector(".output-empty")?.removeAttribute("hidden");
    document.querySelectorAll("[data-output-type]").forEach((button) => {
      button.classList.remove("is-selected");
    });
    const title = document.querySelector("[data-studio-title]");
    const titleInput = document.querySelector("[data-chat-title-input]");
    if (title) title.textContent = "未命名知识库";
    if (titleInput) titleInput.value = "未命名知识库";
    updateSourceCount();
  }

  function enterStudio(sourceName, showFeedback = true) {
    document.querySelector("[data-source-intake-view]").hidden = true;
    document.querySelector("[data-studio-view]").hidden = false;
    if (sourceName) addSource(sourceName, "已添加 · 等待解析");
    [
      ["湖北省公共文化服务数字化建设政策汇编", "已解析"],
      ["区域公共文化服务效能评估资料汇编", "已解析"],
      ["公共文化服务数字化研究综述", "已解析"],
      ["基层公共文化设施运行数据（2023—2025）", "已解析"],
    ].forEach(([name, meta]) => addSource(name, meta));
    if (showFeedback) {
      window.SKApp.showToast("来源已添加，已进入深度研究空间");
    }
  }

  function enterStudioFromKnowledgeBase(name, count) {
    document.querySelector("[data-source-intake-view]").hidden = true;
    document.querySelector("[data-studio-view]").hidden = false;
    addSource(name, `知识库 · ${count} 份资料 · 已连接`);
  }

  function initKnowledgeBaseEntry() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name")?.trim();
    if (!name) return;
    const count = Math.max(0, Number.parseInt(params.get("count") || "0", 10) || 0);
    const backButton = document.querySelector("[data-studio-back]");
    if (backButton) {
      backButton.setAttribute("aria-label", "返回知识社区首页");
      backButton.title = "返回知识社区首页";
    }
    enterStudioFromKnowledgeBase(name, count);
  }

  function backToIntake() {
    document.querySelector("[data-studio-view]").hidden = true;
    document.querySelector("[data-source-intake-view]").hidden = false;
    clearStudio();
    const searchInput = document.querySelector("[data-source-search-input]");
    if (searchInput) searchInput.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openSourceModal() {
    sourceModalMask = sourceModalMask || document.querySelector("[data-source-modal-mask]");
    sourceModal = sourceModal || document.querySelector("[data-source-modal]");
    if (!sourceModalMask || !sourceModal) return;

    sourceModalMask.hidden = false;
    sourceModal.hidden = false;
    requestAnimationFrame(() => {
      sourceModalMask.classList.add("is-open");
      sourceModal.classList.add("is-open");
    });
    window.setTimeout(() => sourceModal.querySelector("[data-source-modal-input]")?.focus(), 60);
  }

  function closeSourceModal() {
    if (!sourceModal || sourceModal.hidden) return;
    sourceModalMask?.classList.remove("is-open");
    sourceModal.classList.remove("is-open");
    window.setTimeout(() => {
      if (sourceModalMask) sourceModalMask.hidden = true;
      sourceModal.hidden = true;
    }, 220);
  }

  function addSourceModalFiles(files) {
    const items = Array.from(files || []);
    if (!items.length) return;
    items.forEach((file) => {
      addSource(file.name, `${Math.max(1, Math.round(file.size / 1024))} KB · 等待解析`);
    });
    closeSourceModal();
  }

  function initSourceModal() {
    sourceModalMask = document.querySelector("[data-source-modal-mask]");
    sourceModal = document.querySelector("[data-source-modal]");
    const form = sourceModal?.querySelector("[data-source-modal-form]");
    const input = sourceModal?.querySelector("[data-source-modal-input]");
    const fileInput = sourceModal?.querySelector("[data-source-modal-file]");
    const uploadZone = sourceModal?.querySelector("[data-source-modal-upload-zone]");

    document.querySelectorAll("[data-source-modal-open]").forEach((button) => {
      button.addEventListener("click", openSourceModal);
    });
    document.querySelectorAll("[data-source-modal-close]").forEach((button) => {
      button.addEventListener("click", closeSourceModal);
    });
    sourceModalMask?.addEventListener("click", closeSourceModal);

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim() || "网络搜索来源";
      addSource(value, "已添加 · 等待解析");
      input.value = "";
      closeSourceModal();
    });

    sourceModal
      ?.querySelectorAll("[data-source-modal-upload-trigger]")
      .forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          fileInput?.click();
        });
      });

    sourceModal?.querySelectorAll("[data-source-modal-demo]").forEach((button) => {
      button.addEventListener("click", () => {
        addSource(button.dataset.sourceModalDemo, "已添加 · 等待解析");
        closeSourceModal();
      });
    });

    uploadZone?.addEventListener("click", () => fileInput?.click());
    uploadZone?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") fileInput?.click();
    });
    uploadZone?.addEventListener("dragover", (event) => {
      event.preventDefault();
      uploadZone.classList.add("is-dragging");
    });
    uploadZone?.addEventListener("dragleave", () => uploadZone.classList.remove("is-dragging"));
    uploadZone?.addEventListener("drop", (event) => {
      event.preventDefault();
      uploadZone.classList.remove("is-dragging");
      addSourceModalFiles(event.dataTransfer?.files);
    });

    fileInput?.addEventListener("change", () => {
      addSourceModalFiles(fileInput.files);
      fileInput.value = "";
    });
  }

  function initIntake() {
    const form = document.querySelector("[data-source-search-form]");
    const searchInput = document.querySelector("[data-source-search-input]");
    const fileInput = document.querySelector("[data-intake-file]");
    const uploadZone = document.querySelector("[data-upload-zone]");

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!requireAuth()) return;
      const value = searchInput.value.trim() || "网络搜索来源";
      enterStudio(value, false);
    });

    document.querySelectorAll("[data-upload-trigger]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!requireAuth()) return;
        fileInput?.click();
      });
    });

    document.querySelectorAll("[data-source-demo]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!requireAuth()) return;
        enterStudio(button.dataset.sourceDemo);
      });
    });

    uploadZone?.addEventListener("click", () => {
      if (!requireAuth()) return;
      fileInput?.click();
    });
    uploadZone?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (!requireAuth()) return;
      fileInput?.click();
    });
    uploadZone?.addEventListener("dragover", (event) => {
      event.preventDefault();
      uploadZone.classList.add("is-dragging");
    });
    uploadZone?.addEventListener("dragleave", () => uploadZone.classList.remove("is-dragging"));
    uploadZone?.addEventListener("drop", (event) => {
      event.preventDefault();
      uploadZone.classList.remove("is-dragging");
      if (!requireAuth()) return;
      const firstFile = event.dataTransfer?.files?.[0];
      if (firstFile) enterStudio(firstFile.name);
    });

    fileInput?.addEventListener("change", () => {
      const firstFile = fileInput.files?.[0];
      if (firstFile) enterStudio(firstFile.name);
      fileInput.value = "";
    });
  }

  function initStudioSources() {
    const fileInput = document.querySelector("[data-source-file]");
    const sourceList = document.querySelector("[data-studio-source-list]");
    document.querySelectorAll("[data-source-add]").forEach((button) => {
      button.addEventListener("click", () => fileInput?.click());
    });
    fileInput?.addEventListener("change", () => {
      Array.from(fileInput.files || []).forEach((file) => {
        addSource(file.name, `${Math.max(1, Math.round(file.size / 1024))} KB · 等待解析`);
      });
      fileInput.value = "";
    });
    sourceList?.addEventListener("click", (event) => {
      const deleteButton = event.target.closest("[data-studio-source-delete]");
      if (!deleteButton) return;
      const card = deleteButton.closest("[data-studio-source]");
      if (card) openSourceDeleteDialog(card);
    });
  }

  function createStudioMessage(role, content) {
    const thread = document.querySelector("[data-studio-thread]");
    if (!thread) return;
    document.querySelector("[data-studio-welcome]")?.setAttribute("hidden", "");

    const message = document.createElement("article");
    message.className = `studio-message studio-message-${role}`;
    message.innerHTML = `
      <div class="studio-message-author">${role === "user" ? "未知研究员" : "深度研究助手"}</div>
      <div class="studio-message-body">${escapeHtml(content)}</div>
    `;
    thread.append(message);
    const body = document.querySelector(".studio-chat-body");
    body?.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
  }

  function initStudioComposer() {
    const textarea = document.querySelector("[data-studio-input]");
    const send = document.querySelector("[data-studio-send]");
    if (!textarea || !send) return;

    const submit = () => {
      const value = textarea.value.trim();
      if (!value) {
        window.SKApp.showToast("请输入研究问题");
        return;
      }
      createStudioMessage("user", value);
      textarea.value = "";
      textarea.style.height = "auto";
      window.setTimeout(() => {
        createStudioMessage("ai", "已记录你的研究问题。可继续补充来源或选择右侧产出类型，我会基于当前资料范围推进研究。");
      }, 420);
    };

    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    });
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    });
    send.addEventListener("click", submit);
    document.querySelectorAll("[data-studio-prompt]").forEach((button) => {
      button.addEventListener("click", () => {
        textarea.value = button.dataset.studioPrompt;
        textarea.focus();
      });
    });
  }

  function clearOutputPreview() {
    document.querySelector("[data-output-preview]")?.remove();
    document.querySelector(".output-empty")?.removeAttribute("hidden");
    document.querySelectorAll("[data-output-type]").forEach((button) => {
      button.classList.remove("is-selected");
    });
  }

  function showOutputPreview(type, label) {
    clearOutputPreview();
    document.querySelector(".output-empty")?.setAttribute("hidden", "");
    const body = document.querySelector(".studio-output-body");
    if (!body) return;
    const descriptions = {
      report: "基于当前来源生成结构化研究报告，包含摘要、核心发现、分析和待核验事项。",
      mindmap: "将研究主题、政策脉络和关键概念整理为可视化思维导图。",
      presentation: "生成适合汇报的演示文档大纲和分页内容。",
      ethics: "对研究内容执行真实性、价值导向和 AI 伦理风险审查。",
    };
    const preview = document.createElement("article");
    preview.className = "output-preview";
    preview.dataset.outputPreview = "";
    preview.innerHTML = `
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(descriptions[type] || "研究产出将在后台生成。")}</p>
      <div class="output-preview-actions">
        <button class="btn btn-primary btn-sm" type="button" data-output-generate>开始生成</button>
        <button class="btn btn-outline btn-sm" type="button" data-output-cancel>取消</button>
      </div>
    `;
    body.append(preview);
  }

  function initOutputs() {
    document.querySelectorAll("[data-output-type]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-output-type]").forEach((item) => {
          item.classList.toggle("is-selected", item === button);
        });
        showOutputPreview(button.dataset.outputType, button.dataset.outputLabel);
      });
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-output-cancel]")) {
        clearOutputPreview();
        return;
      }
      if (event.target.closest("[data-output-generate]")) {
        window.SKApp.showToast("研究产出已加入生成队列");
      }
    });
  }

  function initTopbarActions() {
    document.querySelectorAll("[data-back-to-intake]").forEach((button) => {
      button.addEventListener("click", backToIntake);
    });
    document.querySelectorAll("[data-studio-back]").forEach((button) => {
      button.addEventListener("click", () => {
        if (new URLSearchParams(window.location.search).has("knowledgeBase")) {
          window.location.href = "./knowledge-base.html";
          return;
        }
        backToIntake();
      });
    });
    document.querySelectorAll("[data-research-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.researchAction === "删除当前研究") {
          const name = document.querySelector("[data-studio-title]")?.textContent.trim() || "当前研究空间";
          openConfirmDialog({
            title: "删除研究空间",
            description: `确认删除“${name}”吗？删除后来源与对话内容将无法恢复。`,
            confirmText: "删除",
            onConfirm: () => {
              backToIntake();
              window.SKApp.showToast("当前研究已删除");
            },
          });
          return;
        }
        window.SKApp.showToast(button.dataset.researchAction);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSourceAddMenu();
    initKnowledgePicker();
    initSourceModal();
    initIntake();
    initStudioSources();
    initStudioComposer();
    initOutputs();
    initTopbarActions();
    initKnowledgeBaseEntry();
    updateSourceCount();
  });
})();
