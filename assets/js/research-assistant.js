(function () {
  "use strict";

  const state = {
    sending: false,
    recording: false,
    isNewConversation: false,
    managingHistory: false,
    selectedHistoryItems: new Set(),
  };
  const NEW_CHAT_PLACEHOLDER = "输入你的社科研究问题，或上传资料开始研究";
  const CONTINUE_CHAT_PLACEHOLDER = "继续追问，或上传资料作为研究依据";
  let feedbackMask;
  let feedbackModal;
  let historySearchMask;
  let historySearchModal;
  let historyItemMenu;
  let historyItemMenuTarget;
  let historyDialogMask;
  let historyDialog;
  let historyDialogConfirm;
  let demoConversationMessages = [];
  let activeSpeechButton = null;
  let activeUtterance = null;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getElements() {
    return {
      workspace: document.querySelector("[data-assistant-workspace]"),
      historyPanel: document.querySelector("[data-history-panel]"),
      sourcePanel: document.querySelector("[data-source-panel]"),
      questionHistoryPanel: document.querySelector("[data-question-history-panel]"),
      textarea: document.querySelector("[data-composer-input]"),
      sendButton: document.querySelector("[data-composer-send]"),
      stopButton: document.querySelector("[data-composer-stop]"),
      thread: document.querySelector("[data-message-thread]"),
      fileInput: document.querySelector("[data-file-input]"),
      attachmentRow: document.querySelector("[data-attachment-row]"),
      composerWrap: document.querySelector(".composer-wrap"),
    };
  }

  function setSourceOpen(open) {
    const { sourcePanel, questionHistoryPanel } = getElements();
    if (!sourcePanel) return;
    if (open && questionHistoryPanel) questionHistoryPanel.classList.remove("is-open");
    sourcePanel.classList.toggle("is-open", open);
  }

  function setQuestionHistoryOpen(open) {
    const { sourcePanel, questionHistoryPanel } = getElements();
    if (!questionHistoryPanel) return;
    if (open && sourcePanel) sourcePanel.classList.remove("is-open");
    questionHistoryPanel.classList.toggle("is-open", open);
  }

  function setHistoryOpen(open) {
    const { historyPanel } = getElements();
    if (historyPanel) historyPanel.classList.toggle("is-open", open);
  }

  function autoGrowTextarea() {
    const { textarea } = getElements();
    if (!textarea) return;
    const maxHeight = 180;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }

  function addAttachment(name, meta) {
    const { attachmentRow } = getElements();
    if (!attachmentRow) return;

    const chip = document.createElement("span");
    chip.className = "attachment-chip";
    chip.innerHTML = `
      <span data-icon="file-text"></span>
      <span>${name}</span>
      <small>${meta}</small>
      <button type="button" aria-label="移除附件">×</button>
    `;
    chip.querySelector("button").addEventListener("click", () => chip.remove());
    window.SKIcons.hydrate(chip);
    attachmentRow.append(chip);
  }

  function createMessage(role, content, options = {}) {
    const { thread, composerWrap } = getElements();
    if (!thread) return;
    if (thread.querySelector(".new-chat") && composerWrap) {
      placeComposerAtBottom(composerWrap);
      const { textarea } = getElements();
      if (textarea) textarea.placeholder = CONTINUE_CHAT_PLACEHOLDER;
    }
    thread.querySelector(".new-chat")?.remove();

    const article = document.createElement("article");
    article.className = `message message-${role}`;
    article.innerHTML = `
      <div class="message-author">
        <span class="message-author-mark">${role === "user" ? "研" : "智"}</span>
        <span>${role === "user" ? "陌生的研究员" : "社科研究助手"}</span>
      </div>
      <div class="message-body">
        ${
          role === "user"
            ? `<p>${escapeHtml(content)}</p>`
            : `<h2>${escapeHtml(options.title || "分析结果")}</h2><p>${escapeHtml(content)}</p>`
        }
      </div>
      ${
        role === "ai"
          ? `<div class="message-actions">
              <button class="message-action" type="button" data-message-action="回答已复制" title="复制" aria-label="复制">
                <span data-icon="copy"></span>
              </button>
              <button class="message-action" type="button" data-message-action="已重新生成回答" title="重新生成" aria-label="重新生成">
                <span data-icon="rotate-cw"></span>
              </button>
              <button class="message-action" type="button" data-source-trigger title="查看来源" aria-label="查看来源">
                <span data-icon="link"></span>
              </button>
              <button class="message-action" type="button" data-feedback-open title="问题反馈" aria-label="问题反馈">
                <span data-icon="message-square"></span>
              </button>
              <button class="message-action" type="button" data-speech-toggle title="语音播报" aria-label="语音播报" aria-pressed="false">
                <span data-icon="volume-2"></span>
              </button>
            </div>`
          : ""
      }
    `;
    window.SKIcons.hydrate(article);
    thread.append(article);

    const scroll = document.querySelector(".chat-scroll");
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }

  function sendMessage() {
    const { textarea, sendButton, stopButton } = getElements();
    if (!textarea || state.sending) return;

    const content = textarea.value.trim();
    if (!content) {
      window.SKApp.showToast("请输入研究问题");
      textarea.focus();
      return;
    }

    if (state.isNewConversation) {
      state.isNewConversation = false;
      const chatHead = document.querySelector("[data-chat-head]");
      const title = document.querySelector("[data-chat-title]");
      const titleInput = document.querySelector("[data-chat-title-input]");
      const generatedTitle = content.length > 24 ? `${content.slice(0, 24)}…` : content;
      if (chatHead) chatHead.hidden = false;
      if (title) title.textContent = generatedTitle;
      if (titleInput) titleInput.value = generatedTitle;
      const activeHistoryTitle = document.querySelector(
        ".history-item.is-active .history-item-text",
      );
      if (activeHistoryTitle) activeHistoryTitle.textContent = generatedTitle;
    }

    createMessage("user", content);
    textarea.value = "";
    autoGrowTextarea();
    state.sending = true;
    if (sendButton) sendButton.hidden = true;
    if (stopButton) stopButton.hidden = false;

    window.setTimeout(() => {
      createMessage(
        "ai",
        "已结合当前对话和资料范围完成初步梳理。该结果会保留来源边界，并标记需要进一步核验的政策条款与数据口径。",
        { title: "研究提示" },
      );
      state.sending = false;
      if (sendButton) sendButton.hidden = false;
      if (stopButton) stopButton.hidden = true;
    }, 700);
  }

  function stopGeneration() {
    if (!state.sending) return;
    state.sending = false;
    const { sendButton, stopButton } = getElements();
    if (sendButton) sendButton.hidden = false;
    if (stopButton) stopButton.hidden = true;
    window.SKApp.showToast("已停止生成");
  }

  function createNewConversation() {
    const studioThread = document.querySelector("[data-studio-thread]");
    if (studioThread) {
      studioThread.replaceChildren();
      const studioWelcome = document.querySelector("[data-studio-welcome]");
      if (studioWelcome) studioWelcome.hidden = false;
      return;
    }

    const { thread, textarea, composerWrap } = getElements();
    if (!thread) return;
    if (state.managingHistory) setHistoryManageMode(false);
    stopSpeechPlayback();
    thread.querySelectorAll(".message").forEach((message) => {
      message.hidden = true;
    });
    document.querySelectorAll("[data-history-item]").forEach((item) => {
      item.classList.remove("is-active");
    });
    state.isNewConversation = true;
    const chatHead = document.querySelector("[data-chat-head]");
    if (chatHead) chatHead.hidden = true;

    thread.querySelector(".new-chat")?.remove();
    const newChat = document.createElement("div");
    newChat.className = "new-chat";
    newChat.innerHTML = `
      <h2>从一个清晰的社科问题开始</h2>
      <p>可以提问、上传资料，或先开启深度思考与联网搜索。</p>
      <div class="new-chat-prompts">
        <button type="button" data-prompt="梳理基层公共文化服务数字化建设的政策脉络">梳理政策脉络</button>
        <button type="button" data-prompt="比较区域治理研究的三种主要分析框架">比较研究框架</button>
        <button type="button" data-prompt="从上传资料中提取核心观点和争议问题">提取核心观点</button>
      </div>
    `;
    if (composerWrap) newChat.append(composerWrap);
    const recommendations = document.createElement("div");
    recommendations.className = "new-chat-recommendations";
    recommendations.innerHTML = `
      <span>更多社科研究工具</span>
      <div class="new-chat-recommendation-list">
        <button type="button" data-recommendation-toast="心理咨询服务链接将在后续接入">
          <span class="new-chat-recommendation-icon"><span data-icon="message-square"></span></span>
          <span class="new-chat-recommendation-copy">
            <strong>心理咨询</strong>
            <small>缓解情绪压力，梳理心理困扰</small>
          </span>
          <span class="new-chat-recommendation-arrow"><span data-icon="chevron-right"></span></span>
        </button>
        <button type="button" data-recommendation-toast="法律服务链接将在后续接入">
          <span class="new-chat-recommendation-icon"><span data-icon="shield-check"></span></span>
          <span class="new-chat-recommendation-copy">
            <strong>法律咨询</strong>
            <small>解答常见法律问题，获取专业指引</small>
          </span>
          <span class="new-chat-recommendation-arrow"><span data-icon="chevron-right"></span></span>
        </button>
      </div>
    `;
    newChat.append(recommendations);
    thread.append(newChat);
    window.SKIcons.hydrate(recommendations);
    bindPromptButtons(newChat);
    recommendations.querySelectorAll("[data-recommendation-toast]").forEach((button) => {
      button.addEventListener("click", () => {
        window.SKApp.showToast(button.dataset.recommendationToast);
      });
    });
    if (textarea) textarea.focus();
    if (textarea) textarea.placeholder = NEW_CHAT_PLACEHOLDER;
  }

  function showDemoConversation() {
    const { thread, composerWrap, textarea } = getElements();
    if (!thread) return;
    stopSpeechPlayback();
    placeComposerAtBottom(composerWrap);
    if (textarea) textarea.placeholder = CONTINUE_CHAT_PLACEHOLDER;
    thread.querySelector(".new-chat")?.remove();
    thread.querySelectorAll(".message").forEach((message) => {
      message.hidden = !demoConversationMessages.includes(message);
    });
    state.isNewConversation = false;
  }

  function placeComposerAtBottom(composerWrap) {
    const chatScroll = document.querySelector(".chat-scroll");
    if (composerWrap && chatScroll) {
      chatScroll.insertAdjacentElement("afterend", composerWrap);
    }
  }

  function bindPromptButtons(root) {
    root.querySelectorAll("[data-prompt]").forEach((button) => {
      button.addEventListener("click", () => {
        const { textarea } = getElements();
        if (!textarea) return;
        textarea.value = button.dataset.prompt;
        textarea.focus();
        autoGrowTextarea();
      });
    });
  }

  function initComposerAddMenu() {
    const menu = document.querySelector("[data-composer-add-menu]");
    const trigger = menu?.querySelector("[data-composer-add-trigger]");
    const list = menu?.querySelector("[data-composer-add-menu-list]");
    if (!menu || !trigger || !list) return;

    const setOpen = (open) => {
      list.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
    };

    trigger.addEventListener("click", () => {
      setOpen(list.hidden);
    });

    list.addEventListener("click", (event) => {
      const item = event.target.closest("[data-composer-add-item]");
      if (!item) return;
      if (item.dataset.composerAddItem === "文献" && !window.SKAuth?.getUser()) {
        setOpen(false);
        window.SKAuth?.open();
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

  function initComposer() {
    const { textarea, sendButton, stopButton, fileInput } = getElements();
    if (!textarea) return;

    textarea.addEventListener("input", autoGrowTextarea);
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });

    if (sendButton) sendButton.addEventListener("click", sendMessage);
    if (stopButton) stopButton.addEventListener("click", stopGeneration);

    document.querySelectorAll("[data-file-trigger]").forEach((button) => {
      button.addEventListener("click", () => fileInput && fileInput.click());
    });

    if (fileInput) {
      fileInput.addEventListener("change", () => {
        Array.from(fileInput.files || []).forEach((file) => {
          addAttachment(file.name, `${Math.max(1, Math.round(file.size / 1024))} KB`);
        });
        fileInput.value = "";
      });
    }

    document.querySelectorAll("[data-mode-toggle]").forEach((button) => {
      button.addEventListener("click", () => button.classList.toggle("is-on"));
    });

    document.querySelectorAll("[data-voice-trigger]").forEach((button) => {
      button.addEventListener("click", () => {
        state.recording = !state.recording;
        button.classList.toggle("is-recording", state.recording);
        button.setAttribute("aria-pressed", String(state.recording));
        button.setAttribute("aria-label", state.recording ? "停止录音" : "语音输入");
        button.title = state.recording ? "停止录音" : "语音输入";
        window.SKApp.showToast(state.recording ? "正在录音，再次点击结束" : "已结束录音");
      });
    });
  }

  function initPanels() {
    document.querySelectorAll("[data-history-open]").forEach((button) => {
      button.addEventListener("click", () => setHistoryOpen(true));
    });
    document.querySelectorAll("[data-history-close]").forEach((button) => {
      button.addEventListener("click", () => setHistoryOpen(false));
    });

    document.querySelectorAll("[data-source-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const { sourcePanel } = getElements();
        setSourceOpen(!sourcePanel.classList.contains("is-open"));
      });
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-source-trigger]")) setSourceOpen(true);
    });
    document.querySelectorAll("[data-source-close]").forEach((button) => {
      button.addEventListener("click", () => setSourceOpen(false));
    });

    document.querySelectorAll("[data-question-history-open]").forEach((button) => {
      button.addEventListener("click", () => setQuestionHistoryOpen(true));
    });
    document.querySelectorAll("[data-question-history-close]").forEach((button) => {
      button.addEventListener("click", () => setQuestionHistoryOpen(false));
    });

    document.addEventListener("click", (event) => {
      const { sourcePanel, questionHistoryPanel } = getElements();
      const clickedInsideSource = sourcePanel && sourcePanel.contains(event.target);
      const clickedInsideHistory = questionHistoryPanel && questionHistoryPanel.contains(event.target);

      if (
        sourcePanel &&
        sourcePanel.classList.contains("is-open") &&
        !clickedInsideSource &&
        !event.target.closest("[data-source-trigger]")
      ) {
        setSourceOpen(false);
      }

      if (
        questionHistoryPanel &&
        questionHistoryPanel.classList.contains("is-open") &&
        !clickedInsideHistory &&
        !event.target.closest("[data-question-history-open]")
      ) {
        setQuestionHistoryOpen(false);
      }
    });
  }

  function updateHistorySelectionState() {
    const selected = document.querySelectorAll(".history-item.is-selected");
    const count = selected.length;
    const countNode = document.querySelector("[data-history-selection-count]");
    const pinButton = document.querySelector("[data-history-pin]");
    const deleteButton = document.querySelector("[data-history-delete]");

    if (countNode) countNode.textContent = `已选择 ${count} 个对话`;
    if (pinButton) pinButton.disabled = count === 0;
    if (deleteButton) deleteButton.disabled = count === 0;
  }

  function setHistoryManageMode(open) {
    const historyRoot = document.querySelector(".app-sidebar-history");
    const manageHead = document.querySelector("[data-history-manage-head]");
    const manageActions = document.querySelector("[data-history-manage-actions]");
    if (!historyRoot || !manageHead || !manageActions) return;

    state.managingHistory = open;
    if (open) closeHistoryItemMenu();
    historyRoot.classList.toggle("is-managing", open);
    manageHead.hidden = !open;
    manageActions.hidden = !open;

    if (!open) {
      document.querySelectorAll(".history-item.is-selected").forEach((item) => {
        item.classList.remove("is-selected");
        item.setAttribute("aria-pressed", "false");
      });
      state.selectedHistoryItems.clear();
    }

    updateHistorySelectionState();
  }

  function toggleHistoryItemSelection(item) {
    const selected = item.classList.toggle("is-selected");
    item.setAttribute("aria-pressed", String(selected));
    if (selected) {
      state.selectedHistoryItems.add(item);
    } else {
      state.selectedHistoryItems.delete(item);
    }
    updateHistorySelectionState();
  }

  function cleanupHistoryGroups() {
    document.querySelectorAll(".history-group").forEach((group) => {
      const items = group.querySelectorAll(".history-item");
      group.hidden = items.length === 0;
    });
  }

  function getHistoryRow(item) {
    return item.closest(".history-row") || item;
  }

  function closeHistoryItemMenu() {
    if (!historyItemMenu) return;
    historyItemMenu.hidden = true;
    if (historyItemMenuTarget) {
      historyItemMenuTarget.setAttribute("aria-expanded", "false");
      historyItemMenuTarget = null;
    }
  }

  function positionHistoryItemMenu(button) {
    const rect = button.getBoundingClientRect();
    const menuWidth = 168;
    const menuHeight = 132;
    const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8);
    const top = Math.min(rect.bottom + 6, window.innerHeight - menuHeight - 8);
    historyItemMenu.style.left = `${Math.max(8, left)}px`;
    historyItemMenu.style.top = `${Math.max(8, top)}px`;
  }

  function createHistoryItemMenu() {
    if (historyItemMenu) return;
    historyItemMenu = document.createElement("div");
    historyItemMenu.className = "history-item-menu";
    historyItemMenu.dataset.historyItemMenu = "";
    historyItemMenu.hidden = true;
    historyItemMenu.innerHTML = `
      <button type="button" data-history-action="rename"><span data-icon="pencil"></span>重命名</button>
      <button type="button" data-history-action="pin"><span data-icon="pin"></span><span class="history-menu-label">置顶</span></button>
      <button type="button" data-history-action="delete"><span data-icon="trash-2"></span>删除</button>
    `;
    document.body.append(historyItemMenu);
    window.SKIcons.hydrate(historyItemMenu);

    historyItemMenu.addEventListener("click", (event) => {
      const action = event.target.closest("[data-history-action]")?.dataset.historyAction;
      const item = historyItemMenu._historyItem;
      closeHistoryItemMenu();
      if (!action || !item) return;

      if (action === "rename") renameHistoryItem(item);
      if (action === "pin") toggleHistoryItemPinned(item);
      if (action === "delete") confirmDeleteHistoryItem(item);
    });
  }

  function openHistoryItemMenu(button) {
    createHistoryItemMenu();
    closeHistoryItemMenu();
    const row = button.closest(".history-row");
    const item = row?.querySelector(".history-item");
    if (!item) return;

    historyItemMenuTarget = button;
    button.setAttribute("aria-expanded", "true");
    const pinnedGroup = document.querySelector("[data-history-pinned-group]");
    const pinLabel = historyItemMenu.querySelector(".history-menu-label");
    if (pinLabel) {
      pinLabel.textContent = pinnedGroup?.contains(item) ? "取消置顶" : "置顶";
    }
    historyItemMenu.dataset.historyItemId = "";
    historyItemMenu._historyItem = item;
    positionHistoryItemMenu(button);
    historyItemMenu.hidden = false;
  }

  function toggleHistoryItemPinned(item) {
    const pinnedGroup = document.querySelector("[data-history-pinned-group]");
    if (!pinnedGroup) return;
    if (pinnedGroup.contains(item)) {
      const originGroup = item._historyOriginGroup;
      const row = getHistoryRow(item);
      if (originGroup && originGroup.isConnected) {
        originGroup.hidden = false;
        originGroup.append(row);
      } else {
        const todayGroup = document.querySelector(".history-group:not([data-history-pinned-group])");
        if (todayGroup) {
          todayGroup.hidden = false;
          todayGroup.append(row);
        } else {
          document.querySelector(".history-list")?.append(row);
        }
      }
      cleanupHistoryGroups();
      window.SKApp.showToast("已取消置顶");
      return;
    }

    item._historyOriginGroup = item.closest(".history-group");
    pinnedGroup.hidden = false;
    pinnedGroup.append(getHistoryRow(item));
    cleanupHistoryGroups();
    window.SKApp.showToast("对话已置顶");
  }

  function closeHistoryDialog() {
    if (!historyDialog) return;
    historyDialogMask.classList.remove("is-open");
    historyDialog.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    historyDialogConfirm = null;
    window.setTimeout(() => {
      historyDialogMask.hidden = true;
      historyDialog.hidden = true;
    }, 220);
  }

  function createHistoryDialog() {
    if (historyDialog) return;
    historyDialogMask = document.createElement("div");
    historyDialogMask.className = "history-dialog-mask";
    historyDialogMask.dataset.historyDialogMask = "";
    historyDialogMask.hidden = true;

    historyDialog = document.createElement("section");
    historyDialog.className = "history-dialog";
    historyDialog.dataset.historyDialog = "";
    historyDialog.setAttribute("role", "dialog");
    historyDialog.setAttribute("aria-modal", "true");
    historyDialog.hidden = true;
    historyDialog.innerHTML = `
      <div class="history-dialog-head">
        <div>
          <h2 data-history-dialog-title></h2>
          <p data-history-dialog-description></p>
        </div>
        <button class="history-dialog-close" type="button" data-history-dialog-close aria-label="关闭">
          <span data-icon="x"></span>
        </button>
      </div>
      <div class="history-dialog-body">
        <label class="field" data-history-dialog-field hidden>
          <span class="field-label">对话标题</span>
          <input type="text" maxlength="60" data-history-dialog-input>
        </label>
      </div>
      <div class="history-dialog-actions">
        <button class="btn btn-outline" type="button" data-history-dialog-close>取消</button>
        <button class="btn btn-primary" type="button" data-history-dialog-confirm></button>
      </div>
    `;
    document.body.append(historyDialogMask, historyDialog);
    window.SKIcons.hydrate(historyDialog);

    historyDialog.querySelectorAll("[data-history-dialog-close]").forEach((button) => {
      button.addEventListener("click", closeHistoryDialog);
    });
    historyDialogMask.addEventListener("click", closeHistoryDialog);
  }

  function openHistoryDialog(options) {
    createHistoryDialog();
    const title = historyDialog.querySelector("[data-history-dialog-title]");
    const description = historyDialog.querySelector("[data-history-dialog-description]");
    const field = historyDialog.querySelector("[data-history-dialog-field]");
    const input = historyDialog.querySelector("[data-history-dialog-input]");
    const confirmButton = historyDialog.querySelector("[data-history-dialog-confirm]");

    title.textContent = options.title;
    description.textContent = options.description || "";
    confirmButton.textContent = options.confirmText || "确认";
    confirmButton.classList.toggle("danger", Boolean(options.danger));
    field.hidden = !options.inputLabel;
    if (options.inputLabel) {
      field.querySelector(".field-label").textContent = options.inputLabel;
      input.value = options.value || "";
    }

    historyDialogConfirm = () => {
      const result = options.onConfirm(options.inputLabel ? input.value.trim() : undefined);
      if (result !== false) closeHistoryDialog();
    };
    confirmButton.onclick = historyDialogConfirm;
    input.onkeydown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        historyDialogConfirm();
      }
    };

    historyDialogMask.hidden = false;
    historyDialog.hidden = false;
    requestAnimationFrame(() => {
      historyDialogMask.classList.add("is-open");
      historyDialog.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    if (options.inputLabel) {
      window.setTimeout(() => {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }, 50);
    }
  }

  function renameHistoryItem(item) {
    const titleNode = item.querySelector(".history-item-text");
    openHistoryDialog({
      title: "修改对话标题",
      description: "输入新的对话名称",
      inputLabel: "对话标题",
      value: titleNode?.textContent.trim() || "",
      confirmText: "保存",
      onConfirm: (value) => {
        if (!value) {
          window.SKApp.showToast("对话标题不能为空");
          return false;
        }
        if (titleNode) titleNode.textContent = value;
        if (item.classList.contains("is-active")) {
          const chatTitle = document.querySelector("[data-chat-title]");
          const chatTitleInput = document.querySelector("[data-chat-title-input]");
          if (chatTitle) chatTitle.textContent = value;
          if (chatTitleInput) chatTitleInput.value = value;
        }
        window.SKApp.showToast("对话名称已更新");
        return true;
      },
    });
  }

  function confirmDeleteHistoryItem(item) {
    const title = item.querySelector(".history-item-text")?.textContent.trim() || "该对话";
    openHistoryDialog({
      title: "删除对话",
      description: `确认删除“${title}”？删除后无法恢复。`,
      confirmText: "删除",
      danger: true,
      onConfirm: () => {
        const activeDeleted = item.classList.contains("is-active");
        getHistoryRow(item).remove();
        cleanupHistoryGroups();
        if (activeDeleted) createNewConversation();
        window.SKApp.showToast("对话已删除");
        return true;
      },
    });
  }

  function pinSelectedHistoryItems() {
    const selected = Array.from(document.querySelectorAll(".history-item.is-selected"));
    if (!selected.length) return;

    const pinnedGroup = document.querySelector("[data-history-pinned-group]");
    if (!pinnedGroup) return;
    pinnedGroup.hidden = false;
    selected.forEach((item) => {
      item._historyOriginGroup = item.closest(".history-group");
      pinnedGroup.append(item.closest(".history-row") || item);
    });
    cleanupHistoryGroups();
    window.SKApp.showToast(`已置顶 ${selected.length} 个对话`);
    setHistoryManageMode(false);
  }

  function deleteSelectedHistoryItems() {
    const selected = Array.from(document.querySelectorAll(".history-item.is-selected"));
    if (!selected.length) return;

    const activeDeleted = selected.some((item) => item.classList.contains("is-active"));
    selected.forEach((item) => (item.closest(".history-row") || item).remove());
    cleanupHistoryGroups();
    window.SKApp.showToast(`已删除 ${selected.length} 个对话`);
    setHistoryManageMode(false);

    if (activeDeleted) createNewConversation();
  }

  function initHistoryAndActions() {
    createHistorySearchModal();
    createHistoryItemMenu();
    document.querySelectorAll("[data-history-search-toggle]").forEach((button) => {
      button.addEventListener("click", openHistorySearch);
    });

    document.querySelectorAll("[data-history-item]").forEach((item) => {
      item.addEventListener("click", () => {
        if (state.managingHistory) {
          toggleHistoryItemSelection(item);
          return;
        }
        document.querySelectorAll("[data-history-item]").forEach((entry) => entry.classList.remove("is-active"));
        item.classList.add("is-active");
        showDemoConversation();
        const chatHead = document.querySelector("[data-chat-head]");
        const title =
          document.querySelector("[data-chat-title]") ||
          document.querySelector("[data-studio-title]");
        const titleInput = document.querySelector("[data-chat-title-input]");
        const nextTitle = item.querySelector(".history-item-text")?.textContent.trim();
        if (chatHead) chatHead.hidden = false;
        if (title && nextTitle) title.textContent = nextTitle;
        if (titleInput && nextTitle) titleInput.value = nextTitle;
        setHistoryOpen(false);
      });
    });

    document.querySelectorAll("[data-history-manage]").forEach((button) => {
      button.addEventListener("click", () => setHistoryManageMode(true));
    });
    document.querySelectorAll("[data-history-manage-close]").forEach((button) => {
      button.addEventListener("click", () => setHistoryManageMode(false));
    });
    document.querySelectorAll("[data-history-pin]").forEach((button) => {
      button.addEventListener("click", pinSelectedHistoryItems);
    });
    document.querySelectorAll("[data-history-delete]").forEach((button) => {
      button.addEventListener("click", deleteSelectedHistoryItems);
    });

    document.querySelectorAll("[data-history-more]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (state.managingHistory) return;
        if (historyItemMenuTarget === button && !historyItemMenu.hidden) {
          closeHistoryItemMenu();
        } else {
          openHistoryItemMenu(button);
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (
        historyItemMenu &&
        !historyItemMenu.hidden &&
        !historyItemMenu.contains(event.target) &&
        !event.target.closest("[data-history-more]")
      ) {
        closeHistoryItemMenu();
      }
    });
    document.querySelector(".history-list")?.addEventListener("scroll", closeHistoryItemMenu);
    window.addEventListener("resize", closeHistoryItemMenu);

    document.querySelectorAll("[data-new-conversation]").forEach((button) => {
      button.addEventListener("click", createNewConversation);
    });

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-message-action]");
      if (button) window.SKApp.showToast(button.dataset.messageAction);
    });

    document.querySelectorAll("[data-question-history-item]").forEach((item) => {
      item.addEventListener("click", () => {
        document.querySelectorAll("[data-question-history-item]").forEach((entry) => {
          entry.classList.remove("is-active");
        });
        item.classList.add("is-active");
        setQuestionHistoryOpen(false);
      });
    });

    initTitleEditing();
    bindPromptButtons(document);
  }

  function createHistorySearchModal() {
    if (historySearchModal) return;

    historySearchMask = document.createElement("div");
    historySearchMask.className = "history-search-mask";
    historySearchMask.dataset.historySearchMask = "";
    historySearchMask.hidden = true;

    historySearchModal = document.createElement("section");
    historySearchModal.className = "history-search-modal";
    historySearchModal.dataset.historySearchModal = "";
    historySearchModal.setAttribute("role", "dialog");
    historySearchModal.setAttribute("aria-modal", "true");
    historySearchModal.setAttribute("aria-labelledby", "historySearchTitle");
    historySearchModal.hidden = true;
    historySearchModal.innerHTML = `
      <div class="history-search-head">
        <div>
          <h2 id="historySearchTitle">搜索历史对话</h2>
          <p>输入关键词查找当前工作台中的会话</p>
        </div>
        <button class="history-search-close" type="button" data-history-search-close aria-label="关闭搜索">
          <span data-icon="x"></span>
        </button>
      </div>
      <label class="history-search-field">
        <span data-icon="search"></span>
        <input type="search" placeholder="搜索历史对话" autocomplete="off" data-history-search-input>
      </label>
      <div class="history-search-results" data-history-search-results></div>
    `;
    document.body.append(historySearchMask, historySearchModal);
    window.SKIcons.hydrate(historySearchModal);

    const renderResults = (keyword) => {
      const normalized = keyword.trim().toLowerCase();
      const historyTitles = Array.from(
        document.querySelectorAll("[data-history-item] .history-item-text"),
        (node) => node.textContent.trim(),
      );
      const results = historyTitles.filter((title) => title.toLowerCase().includes(normalized));
      const container = historySearchModal.querySelector("[data-history-search-results]");

      container.replaceChildren();
      if (!results.length) {
        const empty = document.createElement("p");
        empty.className = "history-search-empty";
        empty.textContent = "未找到匹配的历史对话";
        container.append(empty);
        return;
      }

      results.forEach((title) => {
        const button = document.createElement("button");
        button.className = "history-search-result";
        button.type = "button";
        button.textContent = title;
        button.addEventListener("click", () => {
          showDemoConversation();
          const chatHead = document.querySelector("[data-chat-head]");
          const titleNode =
            document.querySelector("[data-chat-title]") ||
            document.querySelector("[data-studio-title]");
          const titleInput = document.querySelector("[data-chat-title-input]");
          if (chatHead) chatHead.hidden = false;
          if (titleNode) titleNode.textContent = title;
          if (titleInput) titleInput.value = title;
          document.querySelectorAll("[data-history-item]").forEach((item) => {
            item.classList.toggle(
              "is-active",
              item.querySelector(".history-item-text")?.textContent.trim() === title,
            );
          });
          closeHistorySearch();
        });
        container.append(button);
      });
    };

    renderResults("");
    const input = historySearchModal.querySelector("[data-history-search-input]");
    input.addEventListener("input", () => renderResults(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeHistorySearch();
    });

    document.addEventListener("click", (event) => {
      if (
        event.target.closest("[data-history-search-close]") ||
        event.target === historySearchMask
      ) {
        closeHistorySearch();
      }
    });
  }

  function openHistorySearch() {
    historySearchMask.hidden = false;
    historySearchModal.hidden = false;
    requestAnimationFrame(() => {
      historySearchMask.classList.add("is-open");
      historySearchModal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    window.setTimeout(() => historySearchModal.querySelector("[data-history-search-input]").focus(), 60);
  }

  function closeHistorySearch() {
    historySearchMask.classList.remove("is-open");
    historySearchModal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      historySearchMask.hidden = true;
      historySearchModal.hidden = true;
    }, 220);
  }

  function initTitleEditing() {
    const title = document.querySelector("[data-chat-title]");
    const editButton = document.querySelector("[data-chat-title-edit]");
    const input = document.querySelector("[data-chat-title-input]");
    if (!title || !editButton || !input) return;
    let editing = false;

    const startEditing = () => {
      editing = true;
      input.value = title.textContent.trim();
      title.hidden = true;
      editButton.hidden = true;
      input.hidden = false;
      window.setTimeout(() => {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }, 50);
    };

    const finishEditing = (save) => {
      if (!editing) return;
      editing = false;
      if (save) {
        const nextTitle = input.value.trim();
        if (nextTitle) {
          title.textContent = nextTitle;
          const activeHistoryTitle = document.querySelector(
            ".history-item.is-active .history-item-text",
          );
          if (activeHistoryTitle) activeHistoryTitle.textContent = nextTitle;
        }
      }
      input.hidden = true;
      title.hidden = false;
      editButton.hidden = false;
    };

    editButton.addEventListener("click", startEditing);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finishEditing(true);
      }
      if (event.key === "Escape") finishEditing(false);
    });
    input.addEventListener("blur", () => finishEditing(true));
  }

  function createFeedbackModal() {
    feedbackMask = document.createElement("div");
    feedbackMask.className = "feedback-mask";
    feedbackMask.dataset.feedbackMask = "";
    feedbackMask.hidden = true;

    feedbackModal = document.createElement("section");
    feedbackModal.className = "feedback-modal";
    feedbackModal.dataset.feedbackModal = "";
    feedbackModal.setAttribute("role", "dialog");
    feedbackModal.setAttribute("aria-modal", "true");
    feedbackModal.setAttribute("aria-labelledby", "feedbackTitle");
    feedbackModal.hidden = true;
    feedbackModal.innerHTML = `
      <div class="feedback-head">
        <div>
          <h2 id="feedbackTitle">提交问题反馈</h2>
          <p>请说明这条回答存在的问题，反馈将进入人工核查。</p>
        </div>
        <button class="feedback-close" type="button" data-feedback-close aria-label="关闭反馈">
          <span data-icon="x"></span>
        </button>
      </div>
      <form class="feedback-form" data-feedback-form>
        <div class="feedback-type-grid">
          <label class="feedback-type"><input type="radio" name="feedback-type" value="内容不准确" checked>内容不准确</label>
          <label class="feedback-type"><input type="radio" name="feedback-type" value="来源不足">来源不足</label>
          <label class="feedback-type"><input type="radio" name="feedback-type" value="理解偏差">理解偏差</label>
          <label class="feedback-type"><input type="radio" name="feedback-type" value="其他问题">其他问题</label>
        </div>
        <label class="field">
          <span class="field-label">补充说明</span>
          <textarea class="feedback-textarea" placeholder="请描述具体问题、希望调整的内容或建议补充的资料。" data-feedback-detail></textarea>
        </label>
        <div class="feedback-actions">
          <button class="btn btn-outline" type="button" data-feedback-close>取消</button>
          <button class="btn btn-primary" type="submit">提交反馈</button>
        </div>
      </form>
    `;

    document.body.append(feedbackMask, feedbackModal);
    window.SKIcons.hydrate(feedbackModal);

    feedbackModal.querySelector("[data-feedback-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const detail = feedbackModal.querySelector("[data-feedback-detail]");
      if (detail.value.trim().length < 4) {
        window.SKApp.showToast("请补充具体问题说明");
        detail.focus();
        return;
      }
      detail.value = "";
      closeFeedback();
      window.SKApp.showToast("反馈已提交，感谢你的补充");
    });
  }

  function openFeedback() {
    feedbackMask.hidden = false;
    feedbackModal.hidden = false;
    requestAnimationFrame(() => {
      feedbackMask.classList.add("is-open");
      feedbackModal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
  }

  function closeFeedback() {
    feedbackMask.classList.remove("is-open");
    feedbackModal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      feedbackMask.hidden = true;
      feedbackModal.hidden = true;
    }, 220);
  }

  function initFeedback() {
    createFeedbackModal();
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-feedback-open]")) {
        openFeedback();
        return;
      }
      if (event.target.closest("[data-feedback-close]") || event.target === feedbackMask) {
        closeFeedback();
      }
    });
  }

  function updateSpeechButton(button) {
    if (activeSpeechButton && activeSpeechButton !== button) {
      activeSpeechButton.classList.remove("is-speaking");
      activeSpeechButton.setAttribute("aria-pressed", "false");
      activeSpeechButton.setAttribute("aria-label", "语音播报");
    }
    activeSpeechButton = button;
    if (button) {
      button.classList.add("is-speaking");
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", "停止语音播报");
    }
  }

  function stopSpeechPlayback() {
    activeUtterance = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (activeSpeechButton) {
      activeSpeechButton.classList.remove("is-speaking");
      activeSpeechButton.setAttribute("aria-pressed", "false");
      activeSpeechButton.setAttribute("aria-label", "语音播报");
    }
    activeSpeechButton = null;
  }

  function toggleSpeechPlayback(button) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      window.SKApp.showToast("当前浏览器不支持语音播报");
      return;
    }
    if (activeSpeechButton === button) {
      stopSpeechPlayback();
      return;
    }

    const message = button.closest(".message-ai");
    const content = message?.querySelector(".message-body")?.innerText.trim();
    if (!content) return;

    stopSpeechPlayback();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = "zh-CN";
    utterance.rate = 1;
    utterance.onend = () => {
      if (activeUtterance === utterance) stopSpeechPlayback();
    };
    utterance.onerror = () => {
      if (activeUtterance === utterance) stopSpeechPlayback();
    };
    activeUtterance = utterance;
    updateSpeechButton(button);
    window.speechSynthesis.speak(utterance);
  }

  function initMessageSpeech() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-speech-toggle]");
      if (button) toggleSpeechPlayback(button);
    });
  }

  function initKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        historyDialog &&
        !historyDialog.hidden
      ) {
        event.preventDefault();
        closeHistoryDialog();
        return;
      }

      if (
        event.key === "Escape" &&
        historyItemMenu &&
        !historyItemMenu.hidden
      ) {
        event.preventDefault();
        closeHistoryItemMenu();
        return;
      }

      if (
        event.key === "Escape" &&
        historySearchModal &&
        !historySearchModal.hidden
      ) {
        event.preventDefault();
        closeHistorySearch();
        return;
      }

      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier || event.repeat || event.defaultPrevented) return;

      const key = event.key.toLowerCase();
      if (key === "j") {
        event.preventDefault();
        createNewConversation();
        return;
      }

      if (key === "k") {
        event.preventDefault();
        if (historySearchModal && !historySearchModal.hidden) {
          historySearchModal.querySelector("[data-history-search-input]").focus();
        } else {
          openHistorySearch();
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initComposerAddMenu();
    initComposer();
    initPanels();
    initHistoryAndActions();
    initFeedback();
    initMessageSpeech();
    initKeyboardShortcuts();
    const { thread } = getElements();
    if (thread) {
      demoConversationMessages = Array.from(
        thread.children,
      ).filter((element) => element.classList.contains("message"));
    }
    createNewConversation();
  });
})();
