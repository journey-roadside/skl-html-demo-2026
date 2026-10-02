(function () {
  "use strict";

  const state = {
    sending: false,
    recording: false,
    isNewConversation: false,
    managingHistory: false,
    selectedAgent: null,
    /* 当前加入的项目名（只能有一个，再选就替换）；只活在本次页面会话里 */
    project: null,
    selectedHistoryItems: new Set(),
    /* 未登录时点发送：先弹登录窗，登录成功后接着把这条消息发出去 */
    pendingSubmit: false,
    /* 「自动播报」总开关（右上角按钮）：开启后每段回复完成自动播报，默认关闭。
       关闭时用户在每条回复底部手动点播报 */
    autoSpeak: false,
  };
  const NEW_CHAT_PLACEHOLDER = "输入你的问题 / 使用智能体 @ 添加资料 # 加入到项目";
  /* 已选中智能体，不再需要「/ 使用智能体」那半句 */
  const RESEARCH_PLACEHOLDER = "输入你的研究问题 @ 添加资料 # 加入到项目";
  const REVIEW_PLACEHOLDER = "输入需要审查的社科成果或材料内容 @ 添加资料 # 加入到项目";
  const CONTINUE_CHAT_PLACEHOLDER = "继续追问 @ 添加资料";

  const DEFAULT_WELCOME = {
    title: "从一个清晰的社科问题开始",
    description: "可以提问、上传资料，或先开启深度思考与联网搜索。",
    placeholder: NEW_CHAT_PLACEHOLDER,
    prompts: [
      { label: "梳理政策脉络", prompt: "梳理基层公共文化服务数字化建设的政策脉络" },
      { label: "比较研究框架", prompt: "比较区域治理研究的三种主要分析框架" },
      { label: "提取核心观点", prompt: "从上传资料中提取核心观点和争议问题" },
    ],
  };

  const AGENT_CONFIGS = {
    research: {
      controlLabel: "荆楚智研",
      mark: "研",
      title: "让专题研究一步步形成结论",
      description: "围绕一个专题，依次完成确立主题、背景扫描、问题分析与结论建议，形成有据可查、可追溯的研究结论。",
      placeholder: RESEARCH_PLACEHOLDER,
      responseTitle: "研究提示",
      responseText: "已结合当前对话和资料范围完成初步梳理。该结果会保留来源边界，并标记需要进一步核验的政策条款与数据口径。",
      /* 四步流程图，横排逐步入场；有 flow 的智能体不再渲染 prompts。
         说明文字压在一行（卡片内容宽 131px、字号 12px，上限 10 个字），
         所以不带标点——渲染时逗号顿号会被换成折行 */
      flow: [
        { label: "第一步：确立主题", desc: "确定目标与研究边界" },
        { label: "第二步：背景扫描", desc: "采集资料明确研究背景" },
        { label: "第三步：问题分析", desc: "搭建框架确定分析维度" },
        { label: "第四步：建议与结论", desc: "对策建议与结论产出" },
      ],
    },
    review: {
      controlLabel: "荆楚智审",
      mark: "审",
      title: "让社科成果经得起审查",
      description: "围绕价值导向、事实依据、版权规范与 AI 伦理，辅助完成材料审查与风险研判。",
      placeholder: REVIEW_PLACEHOLDER,
      responseTitle: "审查提示",
      responseText: "已按价值导向、真实性、版权与 AI 伦理维度完成初步审查。结果将标注需要人工复核的风险点和材料依据。",
      /* 输入框下方的三条审查说明（与 v4 审查页的 review-guidance 同款），
         出场最后一步三张一起淡入。
         说明压在一行（文字区约 166px、字号 12px，上限 13 个字） */
      guide: [
        { icon: "scan-search", title: "真实性核验", desc: "核验出处、引用与时间信息" },
        { icon: "scale", title: "价值导向分析", desc: "识别结论边界、尺度与偏差" },
        { icon: "bot", title: "AI 伦理审查", desc: "关注数据版权、痕迹与责任" },
      ],
    },
  };

  let titleTypingTimer = null;

  function getLandingConfig() {
    return state.selectedAgent ? AGENT_CONFIGS[state.selectedAgent] : DEFAULT_WELCOME;
  }

  function syncAgentControls() {
    const modeSwitches = document.querySelector(".mode-switches");
    const agentSelection = document.querySelector("[data-agent-selection]");
    const agentLabel = document.querySelector("[data-agent-selected-label]");
    const agentClear = document.querySelector("[data-agent-clear]");
    const config = state.selectedAgent ? AGENT_CONFIGS[state.selectedAgent] : null;

    if (modeSwitches) modeSwitches.hidden = Boolean(config);
    if (agentSelection) agentSelection.hidden = !config;
    /* 荆楚智审用不着语音转文字，选中时把麦克风收起来（切回欢迎页/智研自动恢复） */
    document.querySelectorAll("[data-voice-trigger]").forEach((button) => {
      button.hidden = state.selectedAgent === "review";
    });
    if (!config) return;

    if (agentLabel) agentLabel.textContent = config.controlLabel;
    if (agentClear) agentClear.setAttribute("aria-label", `取消${config.controlLabel}`);
  }

  /* onDone：标题打完（或直接落字）后回调，用来放行后面几段入场动效 */
  function animateNewChatTitle(element, text, animate, onDone) {
    window.clearTimeout(titleTypingTimer);
    titleTypingTimer = null;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animate || reduceMotion) {
      element.textContent = text;
      onDone?.();
      return;
    }

    element.textContent = "";
    let index = 0;
    const revealNext = () => {
      index += 1;
      element.textContent = text.slice(0, index);
      if (index < text.length) {
        titleTypingTimer = window.setTimeout(revealNext, 90);
      } else {
        onDone?.();
      }
    };
    revealNext();
  }

  function selectAgent(agentKey, animate = true) {
    if (!AGENT_CONFIGS[agentKey]) return;
    state.selectedAgent = agentKey;
    syncAgentControls();
    if (document.querySelector(".new-chat")) createNewConversation({ animate });
  }

  function clearSelectedAgent(animate = true) {
    if (!state.selectedAgent) return;
    state.selectedAgent = null;
    syncAgentControls();
    if (document.querySelector(".new-chat")) createNewConversation({ animate });
  }
  let historySearchMask;
  let historySearchModal;
  /* 「我的知识」选择弹窗：选中的文档按 名称→条目 存，确认时直接拿 size 做附件元信息 */
  let docPickerMask;
  let docPickerModal;
  let docPickerRender = null;
  const docPickerPicked = new Map();
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

  function formatQuestionTime(date = new Date()) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  /* 历史提问搜索：按输入内容实时过滤当前会话的提问列表 */
  function applyQuestionSearchFilter() {
    const input = document.querySelector("[data-question-history-search]");
    const keyword = (input?.value || "").trim().toLowerCase();
    document.querySelectorAll(".question-history-item").forEach((item) => {
      const text = item.querySelector(".question-history-text")?.textContent?.toLowerCase() || "";
      item.hidden = Boolean(keyword) && !text.includes(keyword);
    });
  }

  function renderQuestionHistory() {
    const list = document.querySelector(".question-history-list");
    if (!list) return;

    const questions = Array.from(document.querySelectorAll(".message-user:not([hidden])"))
      .map((message) => ({
        message,
        text: message.querySelector(".message-body p")?.textContent.trim() || "",
        time: message.dataset.questionTime || formatQuestionTime(),
      }))
      .filter((item) => item.text);

    list.replaceChildren();
    if (!questions.length) {
      const empty = document.createElement("p");
      empty.className = "question-history-empty";
      empty.textContent = "当前会话暂无历史提问";
      list.append(empty);
      return;
    }

    questions.forEach(({ message, text, time }, index) => {
      const button = document.createElement("button");
      button.className = `question-history-item${index === questions.length - 1 ? " is-active" : ""}`;
      button.type = "button";
      button.dataset.questionHistoryItem = "";
      button.innerHTML = `
        <span class="question-history-text">${escapeHtml(text)}</span>
        <time>${escapeHtml(time)}</time>
      `;
      button.addEventListener("click", () => {
        list.querySelectorAll("[data-question-history-item]").forEach((item) => {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        message.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "center",
        });
        setQuestionHistoryOpen(false);
      });
      list.append(button);
    });
    /* 重建后沿用当前的搜索关键词 */
    applyQuestionSearchFilter();
  }

  function getElements() {
    return {
      workspace: document.querySelector("[data-assistant-workspace]"),
      historyPanel: document.querySelector("[data-history-panel]"),
      sourcePanel: document.querySelector("[data-source-panel]"),
      sessionFilesPanel: document.querySelector("[data-session-files-panel]"),
      searchResultsPanel: document.querySelector("[data-search-results-panel]"),
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
    const { sourcePanel, sessionFilesPanel, searchResultsPanel, questionHistoryPanel } = getElements();
    if (!sourcePanel) return;
    if (open && questionHistoryPanel) questionHistoryPanel.classList.remove("is-open");
    if (open && sessionFilesPanel) sessionFilesPanel.classList.remove("is-open");
    if (open && searchResultsPanel) searchResultsPanel.classList.remove("is-open");
    sourcePanel.classList.toggle("is-open", open);
  }

  function setQuestionHistoryOpen(open) {
    const { sourcePanel, sessionFilesPanel, searchResultsPanel, questionHistoryPanel } = getElements();
    if (!questionHistoryPanel) return;
    if (open && sourcePanel) sourcePanel.classList.remove("is-open");
    if (open && sessionFilesPanel) sessionFilesPanel.classList.remove("is-open");
    if (open && searchResultsPanel) searchResultsPanel.classList.remove("is-open");
    questionHistoryPanel.classList.toggle("is-open", open);
  }

  function setSessionFilesOpen(open) {
    const { sourcePanel, sessionFilesPanel, searchResultsPanel, questionHistoryPanel } = getElements();
    if (!sessionFilesPanel) return;
    if (open && sourcePanel) sourcePanel.classList.remove("is-open");
    if (open && searchResultsPanel) searchResultsPanel.classList.remove("is-open");
    if (open && questionHistoryPanel) questionHistoryPanel.classList.remove("is-open");
    sessionFilesPanel.classList.toggle("is-open", open);
  }

  function setSearchResultsOpen(open, resultId) {
    const { sourcePanel, sessionFilesPanel, searchResultsPanel, questionHistoryPanel } = getElements();
    if (!searchResultsPanel) return;
    if (open && sourcePanel) sourcePanel.classList.remove("is-open");
    if (open && sessionFilesPanel) sessionFilesPanel.classList.remove("is-open");
    if (open && questionHistoryPanel) questionHistoryPanel.classList.remove("is-open");
    searchResultsPanel.classList.toggle("is-open", open);
    searchResultsPanel.querySelectorAll("[data-search-result-id]").forEach((card) => {
      card.classList.toggle(
        "is-active",
        Boolean(open && resultId && card.dataset.searchResultId === resultId),
      );
    });
  }

  function setHistoryOpen(open) {
    const { historyPanel } = getElements();
    if (historyPanel) historyPanel.classList.toggle("is-open", open);
  }

  /* 输入区里已添加的附件名（本地文件 / 我的知识） */
  function composerAttachments() {
    const { attachmentRow } = getElements();
    if (!attachmentRow) return [];
    return [...attachmentRow.querySelectorAll(".attachment-chip")].map((chip) => chip.dataset.name || "");
  }

  /* 发送按钮的可用状态：有文字或有附件都算有内容可发。
     输入、插推荐问句、加减附件、发送后清空都会走到这里 */
  function syncSendButton() {
    const { textarea, sendButton } = getElements();
    if (!sendButton || !textarea) return;
    sendButton.disabled = !textarea.value.trim() && composerAttachments().length === 0;
  }

  function autoGrowTextarea() {
    const { textarea } = getElements();
    if (!textarea) return;
    const maxHeight = 180;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    syncSendButton();
  }

  function addAttachment(name) {
    const { attachmentRow } = getElements();
    if (!attachmentRow) return;

    const chip = document.createElement("span");
    chip.className = "attachment-chip";
    chip.dataset.name = name;
    chip.innerHTML = `
      <span data-icon="file-text"></span>
      <span>${escapeHtml(name)}</span>
      <button type="button" aria-label="移除附件">×</button>
    `;
    chip.querySelector("button").addEventListener("click", () => {
      chip.remove();
      syncSendButton();
    });
    window.SKIcons.hydrate(chip);
    attachmentRow.append(chip);
    syncSendButton();
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
    if (role === "user") article.dataset.questionTime = formatQuestionTime();
    article.innerHTML = `
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
              <button class="message-action" type="button" data-message-feedback-open title="问题反馈" aria-label="问题反馈">
                <span data-icon="message-square"></span>
              </button>
              <button class="message-action" type="button" data-speech-toggle title="语音播报" aria-label="语音播报" aria-pressed="false">
                <span data-icon="volume-2"></span>
              </button>
              ${
                options.hasSources
                  ? `<button class="message-action" type="button" data-source-trigger title="查看来源" aria-label="查看来源">
                <span data-icon="link"></span>
              </button>`
                  : ""
              }
            </div>`
          : ""
      }
    `;
    window.SKIcons.hydrate(article);
    thread.append(article);
    if (role === "user") renderQuestionHistory();

    const scroll = document.querySelector(".chat-scroll");
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
    return article;
  }

  function createSkeletonMessage() {
    const { thread } = getElements();
    if (!thread) return null;
    const article = document.createElement("article");
    article.className = "message message-ai skeleton-message";
    article.setAttribute("aria-busy", "true");
    article.setAttribute("aria-label", "正在生成回答");
    article.innerHTML = `
      <div class="message-body">
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
      </div>
    `;
    thread.append(article);
    const scroll = document.querySelector(".chat-scroll");
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
    return article;
  }

  function removeSkeletonMessage() {
    if (state.skeletonMessage) {
      state.skeletonMessage.remove();
      state.skeletonMessage = null;
    }
  }

  function sendMessage() {
    const { textarea, sendButton, stopButton, attachmentRow } = getElements();
    if (!textarea || state.sending) return;

    const content = textarea.value.trim();
    const attachments = composerAttachments();
    if (!content && !attachments.length) {
      window.SKApp.showToast("请输入研究问题");
      textarea.focus();
      return;
    }
    /* 只加了附件没打字：把附件名带进消息，替用户起个头 */
    const messageContent = content || `请分析我添加的资料：${attachments.join("、")}`;

    /* 未登录：先登录/注册，成功后自动续发（内容留在输入框里） */
    if (!window.SKAuth?.getUser()) {
      state.pendingSubmit = true;
      window.SKAuth?.open?.();
      return;
    }

    const useReferenceConversation =
      state.isNewConversation && !state.selectedAgent && demoConversationMessages.length > 0;

    if (state.isNewConversation) {
      state.isNewConversation = false;
      const disclaimer = document.querySelector("[data-composer-disclaimer]");
      if (disclaimer) disclaimer.hidden = false;
      const chatHead = document.querySelector("[data-chat-head]");
      const title = document.querySelector("[data-chat-title]");
      const titleInput = document.querySelector("[data-chat-title-input]");
      const generatedTitle = messageContent.length > 24 ? `${messageContent.slice(0, 24)}…` : messageContent;
      if (chatHead) chatHead.hidden = false;
      chatHead?.classList.remove("is-new-conversation");
      const titleEdit = document.querySelector("[data-chat-title-edit]");
      if (titleEdit) titleEdit.hidden = false;
      if (title) title.textContent = generatedTitle;
      if (titleInput) titleInput.value = generatedTitle;
      const activeHistoryTitle = document.querySelector(
        ".history-item.is-active .history-item-text",
      );
      if (activeHistoryTitle) activeHistoryTitle.textContent = generatedTitle;
    }

    if (useReferenceConversation) {
      const firstQuestion = demoConversationMessages.find((message) =>
        message.classList.contains("message-user"),
      );
      const firstQuestionText = firstQuestion?.querySelector(".message-body p");
      if (firstQuestionText) firstQuestionText.textContent = messageContent;
      if (firstQuestion) firstQuestion.dataset.questionTime = formatQuestionTime();
      showDemoConversation();
      const scroll = document.querySelector(".chat-scroll");
      if (scroll) scroll.scrollTop = 0;
    } else {
      createMessage("user", messageContent);
      const config = state.selectedAgent ? AGENT_CONFIGS[state.selectedAgent] : null;
      const aiMessage = createMessage(
        "ai",
        config?.responseText || "已结合当前对话和资料范围完成初步梳理。该结果会保留来源边界，并标记需要进一步核验的政策条款与数据口径。",
        { title: config?.responseTitle || "研究提示" },
      );
      /* 自动播报开着：这段回复生成完就播，不用手动点 */
      if (state.autoSpeak && aiMessage) {
        const speechButton = aiMessage.querySelector("[data-speech-toggle]");
        if (speechButton) toggleSpeechPlayback(speechButton);
      }
    }

    /* 附件随消息一起发出，输入区清干净 */
    textarea.value = "";
    if (attachmentRow) attachmentRow.replaceChildren();
    autoGrowTextarea();
    state.sending = false;
    if (sendButton) sendButton.hidden = false;
    if (stopButton) stopButton.hidden = true;
  }

  function stopGeneration() {
    if (!state.sending) return;
    state.sending = false;
    removeSkeletonMessage();
    const { sendButton, stopButton } = getElements();
    if (sendButton) sendButton.hidden = false;
    if (stopButton) stopButton.hidden = true;
    window.SKApp.showToast("已停止生成");
  }

  /* 通用设置里的「推荐管理」开关：关闭后首页不显示「更多社科研究工具」（标题 + 两张卡片）。
     选择记在本地，刷新或下次打开沿用 */
  const RECOMMEND_KEY = "sheke-settings-recommend";

  function readRecommendSetting() {
    try {
      return localStorage.getItem(RECOMMEND_KEY) !== "off";
    } catch (error) {
      /* 隐私模式下读不到，按默认开启 */
      return true;
    }
  }

  function saveRecommendSetting(enabled) {
    try {
      localStorage.setItem(RECOMMEND_KEY, enabled ? "on" : "off");
    } catch (error) {
      /* 写不了就只在本页生效 */
    }
  }

  /* 通用设置里的「自动联网搜索」开关：开着时输入框里的联网搜索默认选中。
     选择同样记在本地 */
  const AUTO_WEB_KEY = "sheke-settings-auto-web";

  function readAutoWebSetting() {
    try {
      return localStorage.getItem(AUTO_WEB_KEY) === "on";
    } catch (error) {
      /* 隐私模式下读不到，按默认关闭 */
      return false;
    }
  }

  function saveAutoWebSetting(enabled) {
    try {
      localStorage.setItem(AUTO_WEB_KEY, enabled ? "on" : "off");
    } catch (error) {
      /* 写不了就只在本页生效 */
    }
  }

  /* 通用设置里的「展示思考过程」开关：关闭后会话里的思考过程块收起来。默认开启 */
  const THINKING_KEY = "sheke-settings-thinking";

  function readThinkingSetting() {
    try {
      return localStorage.getItem(THINKING_KEY) !== "off";
    } catch (error) {
      /* 隐私模式下读不到，按默认开启 */
      return true;
    }
  }

  function saveThinkingSetting(enabled) {
    try {
      localStorage.setItem(THINKING_KEY, enabled ? "on" : "off");
    } catch (error) {
      /* 写不了就只在本页生效 */
    }
  }

  function syncThinkingVisibility() {
    const input = document.querySelector("[data-settings-thinking]");
    const enabled = input ? input.checked : readThinkingSetting();
    document.querySelectorAll(".message-thinking").forEach(function (node) {
      node.hidden = !enabled;
    });
  }

  function recommendationsEnabled() {
    const input = document.querySelector("[data-settings-recommend]");
    return input ? input.checked : readRecommendSetting();
  }

  function syncRecommendationsVisibility() {
    const enabled = recommendationsEnabled();
    document.querySelectorAll(".new-chat-recommendations").forEach(function (node) {
      node.hidden = !enabled;
    });
  }

  function createNewConversation(options = {}) {
    const studioThread = document.querySelector("[data-studio-thread]");
    if (studioThread) {
      studioThread.replaceChildren();
      const studioWelcome = document.querySelector("[data-studio-welcome]");
      if (studioWelcome) studioWelcome.hidden = false;
      syncAgentControls();
      return;
    }

    const { thread, textarea, composerWrap } = getElements();
    if (!thread) return;
    const config = getLandingConfig();
    const animate = Boolean(options.animate);
    /* 页面初次打开不聚焦输入框，避免 composer-shell 一进页面就高亮 */
    const focusComposer = options.focus !== false;

    if (state.managingHistory) setHistoryManageMode(false);
    stopSpeechPlayback();
    setSessionFilesOpen(false);
    thread.querySelectorAll(".message").forEach((message) => {
      message.hidden = true;
    });
    document.querySelectorAll("[data-history-item]").forEach((item) => {
      item.classList.remove("is-active");
    });
    state.isNewConversation = true;
    const chatHead = document.querySelector("[data-chat-head]");
    const disclaimer = document.querySelector("[data-composer-disclaimer]");
    if (disclaimer) disclaimer.hidden = true;
    const chatTitle = document.querySelector("[data-chat-title]");
    const chatTitleInput = document.querySelector("[data-chat-title-input]");
    const chatTitleEdit = document.querySelector("[data-chat-title-edit]");
    if (chatHead) {
      chatHead.hidden = false;
      chatHead.classList.add("is-new-conversation");
    }
    if (chatTitle) chatTitle.textContent = "新建会话";
    if (chatTitleInput) chatTitleInput.value = "新建会话";
    if (chatTitleEdit) chatTitleEdit.hidden = true;

    /* 切到智能体：先量下输入框此刻的位置，重建后把它钉回原处，前几步里纹丝不动。
       只在「真的有一个首页被替换掉」时才有旧位置——详情页点使用落地（?agent=xxx）
       时 thread 里还没有 .new-chat，不能按切换处理，否则输入框会被钉到静态页面
       那个在角落里的 composer 位置上再飞回来 */
    const previousChat = thread.querySelector(".new-chat");
    const holdFrom =
      animate && state.selectedAgent && previousChat
        ? (composerWrap?.getBoundingClientRect().top ?? null)
        : null;

    thread.querySelector(".new-chat")?.remove();
    const newChat = document.createElement("div");
    newChat.className = "new-chat";
    if (animate) newChat.dataset.agentTransition = "true";
    /* is-agent =「当前正处在智能体态」；data-agent-transition =「这次是切过来的、要放入场动效」。
       两者分开，取消智能体时才不会把推荐区也一起收掉 */
    newChat.classList.toggle("is-agent", Boolean(state.selectedAgent));
    const promptMarkup = (config.prompts || [])
      .map(
        (item) =>
          `<button type="button" data-prompt="${escapeHtml(item.prompt)}">${escapeHtml(item.label)}</button>`,
      )
      .join("");
    /* 带 flow 的智能体（荆楚智研）用四步流程图替掉快捷提示词；
       两者都没有（荆楚智审）就什么都不渲染，不留空壳占位 */
    const bodyMarkup = config.flow
      ? `<ol class="new-chat-flow">${config.flow
          .map(
            (step) =>
              /* 说明文字按逗号、顿号折行，连接符本身不显示 */
              `<li class="new-chat-flow__step"><strong>${escapeHtml(step.label)}</strong><small>${escapeHtml(step.desc).replace(/[，、]/g, "<br>")}</small></li>`,
          )
          .join("")}</ol>`
      : promptMarkup
        ? `<div class="new-chat-prompts">${promptMarkup}</div>`
        : "";
    newChat.innerHTML = `
      <h2 data-new-chat-title></h2>
      <p>${escapeHtml(config.description)}</p>
      ${bodyMarkup}
    `;
    if (composerWrap) newChat.append(composerWrap);
    /* 智审：输入框下方的三条审查说明 */
    if (config.guide) {
      const guide = document.createElement("div");
      guide.className = "new-chat-guide";
      guide.innerHTML = config.guide
        .map(
          (item) =>
            `<article><span data-icon="${escapeHtml(item.icon)}"></span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.desc)}</p></div></article>`,
        )
        .join("");
      newChat.append(guide);
      window.SKIcons.hydrate(guide);
    }
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
    syncRecommendationsVisibility();
    window.SKIcons.hydrate(recommendations);
    /* 标题打完才放行后面几段（描述 / 推荐区让位 / 流程图 / 欢迎页的输入框），
       靠 .is-revealed 驱动——它加上来的那一刻就是这一串动画的计时基准 */
    animateNewChatTitle(
      newChat.querySelector("[data-new-chat-title]"),
      config.title,
      animate,
      () => newChat.classList.add("is-revealed"),
    );
    syncAgentControls();
    renderQuestionHistory();
    bindPromptButtons(newChat);
    recommendations.querySelectorAll("[data-recommendation-toast]").forEach((button) => {
      button.addEventListener("click", () => {
        window.SKApp.showToast(button.dataset.recommendationToast);
      });
    });
    if (focusComposer && textarea) textarea.focus();
    if (textarea) textarea.placeholder = config.placeholder;

    /* 切换前的位置只用来起个头：重建后输入框的布局位置对不上了（流程图占了位、
       推荐区又不占位），直接落在新位置会"啪"地跳过去。先拉回切换前的位置，
       下一帧放行——420ms 滑到新位置，和标题打字的开头重叠着完成。
       这样整条出场序列和详情页点使用进来的一致：标题 → 说明文字 → 流程图，
       不再有"打完字输入框才动"的单独一步。
       放在最末尾是必须的——图标注入、"智能体"开关的显隐都会改上面几块的高度，
       早量会量在错的量上 */
    if (holdFrom != null && composerWrap) {
      const shift = Math.round(holdFrom - composerWrap.getBoundingClientRect().top);
      if (shift) {
        /* 先掐掉过渡，免得起手这一下自己先滑一段；下一帧放开走 420ms */
        composerWrap.style.transition = "none";
        composerWrap.style.transform = `translateY(${shift}px)`;
        requestAnimationFrame(() => {
          composerWrap.style.transition = "transform 420ms var(--ease-out)";
          composerWrap.style.transform = "";
        });
      }
    }
  }
  function showDemoConversation() {
    const { thread, composerWrap, textarea } = getElements();
    if (!thread) return;
    stopSpeechPlayback();
    document.querySelector("[data-chat-head]")?.classList.remove("is-new-conversation");
    const disclaimer = document.querySelector("[data-composer-disclaimer]");
    if (disclaimer) disclaimer.hidden = false;
    const chatTitleEdit = document.querySelector("[data-chat-title-edit]");
    if (chatTitleEdit) chatTitleEdit.hidden = false;
    placeComposerAtBottom(composerWrap);
    if (textarea) textarea.placeholder = CONTINUE_CHAT_PLACEHOLDER;
    thread.querySelector(".new-chat")?.remove();
    thread.querySelectorAll(".message").forEach((message) => {
      message.hidden = !demoConversationMessages.includes(message);
    });
    renderQuestionHistory();
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

    const clearAgentButton = document.querySelector("[data-agent-clear]");
    clearAgentButton?.addEventListener("click", (event) => {
      event.preventDefault();
      /* 和 ESC 一样：直接摆好欢迎页，不放出场动效 */
      clearSelectedAgent(false);
      getElements().textarea?.focus();
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
      if (item.dataset.composerAddItem === "我的知识") openDocPicker();
    });

    /* 「智能体」「项目」两项都不展开内联子列表，点了直接开与 / 、# 同一套的快捷菜单。
       必须掐断冒泡——不然这次点击继续传到 document 上，
       会把刚打开的快捷菜单当成「点了外部」又关掉 */
    const bindQuickMenuEntry = (selector, quickTrigger) => {
      list.querySelector(selector)?.addEventListener("click", (event) => {
        event.stopPropagation();
        setOpen(false);
        openQuickMenu(quickTrigger, QUICK_MENUS[quickTrigger]());
      });
    };
    bindQuickMenuEntry("[data-composer-agent-trigger]", "/");
    bindQuickMenuEntry("[data-composer-project-trigger]", "#");

    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target)) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!list.hidden) {
        /* 留个「已处理」的痕迹：ESC 分发链靠 defaultPrevented 判断还要不要往下走 */
        event.preventDefault();
        setOpen(false);
      }
    });

    syncAgentControls();
  }

  /* 输入框首字符打 /、@ 或 # 时调起快捷菜单：/ 选智能体，@ 加资料，# 加项目。
     上下键选择、回车确认，执行的动作与「+」菜单里的同项一致。
     键处理挂在 document 的捕获阶段——textarea 自己那个「回车发送」的监听是按注册顺序跑的，
     挂同一个元素上压不住它 */
  let quickMenuEl = null;
  let quickMenuItems = [];
  let quickMenuActive = 0;

  const QUICK_MENU_TITLES = { "/": "智能体", "@": "添加资料", "#": "项目" };

  const QUICK_MENUS = {
    "/": () => [
      { icon: "bot", label: "荆楚智研", desc: "聚焦选题梳理、政策分析与文献比较", run: () => selectAgent("research", true) },
      { icon: "bot", label: "荆楚智审", desc: "围绕价值导向、事实依据与版权规范", run: () => selectAgent("review", true) },
    ],
    "@": () => {
      const items = [
        { icon: "upload", label: "上传文件或图片", run: () => getElements().fileInput?.click() },
      ];
      /* 「选择我的知识」与「+」菜单里的同名项一样，登录后才给；chevron 表示它开的是弹窗而非直接执行 */
      if (window.SKAuth?.getUser()) {
        items.push({ icon: "book-open", label: "选择我的知识", chevron: true, run: openDocPicker });
      }
      return items;
    },
    "#": () => {
      /* 未登录：只给「新建项目」这一项，点它（或回车）弹登录 / 注册框；
         已有项目列表要登录后才有（侧栏那份列表本身就是 data-auth-only） */
      if (!window.SKAuth?.getUser()) {
        return [{ icon: "folder-plus", label: "新建项目", run: () => window.SKAuth?.open?.() }];
      }
      return [
        { icon: "folder-plus", label: "新建项目", run: openProjectDialog },
        ...existingProjectNames().map((name) => ({
          icon: "folder",
          label: name,
          run: () => setProject(name),
        })),
      ];
    },
  };

  function closeQuickMenu() {
    if (quickMenuEl && !quickMenuEl.hidden) quickMenuEl.hidden = true;
    quickMenuItems = [];
  }

  function syncQuickMenuActive() {
    quickMenuEl.querySelectorAll(".composer-quick-item").forEach((button, index) => {
      const active = index === quickMenuActive;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      /* 上下键把高亮移出可视区时把菜单跟着滚一下。nearest = 已经在可见范围里就不动，
         所以鼠标悬停触发的这次同步不会乱滚 */
      if (active) button.scrollIntoView({ block: "nearest", behavior: "instant" });
    });
  }

  function runQuickMenuItem(index) {
    const item = quickMenuItems[index];
    if (!item) return;
    closeQuickMenu();
    const { textarea } = getElements();
    if (textarea) {
      textarea.value = "";
      autoGrowTextarea();
    }
    item.run();
  }

  function openQuickMenu(trigger, items) {
    const shell = document.querySelector(".composer-shell");
    if (!shell) return;
    if (!quickMenuEl) {
      quickMenuEl = document.createElement("div");
      quickMenuEl.className = "composer-quick-menu";
      quickMenuEl.setAttribute("role", "listbox");
      quickMenuEl.hidden = true;
      shell.append(quickMenuEl);
    }

    quickMenuItems = items;
    quickMenuActive = 0;
    quickMenuEl.replaceChildren();

    const title = document.createElement("span");
    title.className = "composer-quick-menu__title";
    title.textContent = QUICK_MENU_TITLES[trigger] || "";
    quickMenuEl.append(title);

    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "composer-quick-item";
      button.setAttribute("role", "option");
      button.innerHTML = `<span data-icon="${item.icon}"></span>`;

      const text = document.createElement("span");
      text.className = "composer-quick-item__text";
      const label = document.createElement("strong");
      label.textContent = item.label;
      text.append(label);
      /* 描述可有可无：@ 菜单只给名称，/ 菜单才带说明 */
      if (item.desc) {
        const desc = document.createElement("small");
        desc.textContent = item.desc;
        text.append(desc);
      }
      button.append(text);

      /* 右侧箭头：复用「+」菜单那套箭头样式，表示这一项会再开一层（弹窗） */
      if (item.chevron) {
        const chevron = document.createElement("span");
        chevron.className = "composer-add-menu-chevron";
        chevron.dataset.icon = "chevron-right";
        button.append(chevron);
      }

      button.addEventListener("click", () => runQuickMenuItem(index));
      button.addEventListener("mouseenter", () => {
        quickMenuActive = index;
        syncQuickMenuActive();
      });
      quickMenuEl.append(button);
    });

    window.SKIcons.hydrate(quickMenuEl);
    quickMenuEl.hidden = false;
    syncQuickMenuActive();

    /* 下方装不下就翻到输入框上方。新建会话的欢迎页 composer 贴着视口底，
       不翻的话整块菜单掉出屏幕 */
    quickMenuEl.classList.toggle(
      "is-up",
      quickMenuEl.getBoundingClientRect().bottom > window.innerHeight,
    );
  }

  function syncQuickMenuFromInput() {
    const { textarea } = getElements();
    if (!textarea) return;
    const build = QUICK_MENUS[textarea.value];
    /* 认的是 QUICK_MENUS 里注册过的那几个触发符，不再另写一份字符白名单 */
    if (!build) {
      closeQuickMenu();
      return;
    }
    const items = build();
    if (items.length) openQuickMenu(textarea.value, items);
    else closeQuickMenu();
  }

  function initComposerQuickMenu() {
    const { textarea } = getElements();
    if (!textarea) return;

    textarea.addEventListener("input", syncQuickMenuFromInput);

    document.addEventListener(
      "keydown",
      (event) => {
        if (!quickMenuEl || quickMenuEl.hidden) return;
        if (event.target !== textarea) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          const step = event.key === "ArrowDown" ? 1 : -1;
          quickMenuActive = (quickMenuActive + step + quickMenuItems.length) % quickMenuItems.length;
          syncQuickMenuActive();
        } else if (event.key === "Enter") {
          runQuickMenuItem(quickMenuActive);
        } else if (event.key === "Escape") {
          closeQuickMenu();
        } else {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );

    document.addEventListener("click", (event) => {
      if (!quickMenuEl || quickMenuEl.hidden) return;
      if (event.target === textarea || event.target.closest(".composer-quick-menu")) return;
      closeQuickMenu();
    });
  }

  /* 当前加入的项目：输入框下沿一条信息行，带移除钮。只能挂一个，再选就替换。
     项目名只活在本次页面会话里——侧栏那份项目列表是硬编码的，本页新建的项目
     也不写回去，与 projects 页新建项目只进内存的行为一致 */
  const localProjects = [];

  function existingProjectNames() {
    /* 只认 <a>：未登录占位行那个「新建项目」是 span，且它 hidden 了也照样能被选到 */
    const sidebarNames = Array.from(document.querySelectorAll("a.workbench-project__title"))
      .map((node) => node.textContent.trim())
      .filter(Boolean);
    return sidebarNames.concat(localProjects);
  }

  function setProject(name) {
    state.project = name || null;
    const row = document.querySelector("[data-composer-project]");
    if (!row) return;
    if (state.project) {
      row.querySelector(".composer-project__name").textContent = state.project;
    }
    row.classList.toggle("is-on", Boolean(state.project));
    /* 新建会话页是居中布局：输入框那块高 +Δ 会把整块往上顶 Δ/2，
       用等量的 margin-top 抵回来，这样只有下方的「更多社科研究工具」往下让位 */
    document.querySelector(".new-chat")?.classList.toggle("has-project", Boolean(state.project));
  }

  let projectDialogMask = null;
  let projectDialogModal = null;

  function createProjectDialog() {
    if (projectDialogModal) return;

    projectDialogMask = document.createElement("div");
    projectDialogMask.className = "project-dialog-mask";
    projectDialogMask.hidden = true;

    projectDialogModal = document.createElement("section");
    projectDialogModal.className = "project-dialog-modal";
    projectDialogModal.setAttribute("role", "dialog");
    projectDialogModal.setAttribute("aria-modal", "true");
    projectDialogModal.setAttribute("aria-labelledby", "projectDialogTitle");
    projectDialogModal.hidden = true;
    projectDialogModal.innerHTML = `
      <div class="project-dialog-head">
        <div>
          <h2 id="projectDialogTitle">创建项目</h2>
          <p>输入项目名称，后续可在项目中持续归档相关对话。</p>
        </div>
        <button class="project-dialog-close" type="button" data-project-dialog-close aria-label="关闭">
          <span data-icon="x"></span>
        </button>
      </div>
      <form class="project-dialog-form" data-project-dialog-form>
        <label class="project-dialog-label" for="projectDialogInput">项目名称</label>
        <input class="project-dialog-input" id="projectDialogInput" type="text" maxlength="30" placeholder="请输入项目名称，不超过30个字" autocomplete="off" data-project-dialog-input>
      </form>
      <div class="project-dialog-actions">
        <button class="btn btn-outline" type="button" data-project-dialog-close>取消</button>
        <button class="btn btn-primary" type="button" data-project-dialog-submit>创建</button>
      </div>
    `;
    document.body.append(projectDialogMask, projectDialogModal);
    window.SKIcons.hydrate(projectDialogModal);

    const input = projectDialogModal.querySelector("[data-project-dialog-input]");
    const submit = () => {
      const name = input.value.trim();
      if (!name) {
        window.SKApp.showToast("请输入项目名称");
        input.focus();
        return;
      }
      if (existingProjectNames().includes(name)) {
        window.SKApp.showToast("项目名称已存在");
        input.focus();
        return;
      }
      localProjects.push(name);
      closeProjectDialog();
      setProject(name);
      window.SKApp.showToast(`已创建并加入项目：${name}`);
    };

    projectDialogModal.querySelector("[data-project-dialog-submit]").addEventListener("click", submit);
    projectDialogModal.querySelector("[data-project-dialog-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      submit();
    });
    projectDialogModal.querySelectorAll("[data-project-dialog-close]").forEach((button) => {
      button.addEventListener("click", closeProjectDialog);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeProjectDialog();
    });
  }

  function openProjectDialog() {
    createProjectDialog();
    const input = projectDialogModal.querySelector("[data-project-dialog-input]");
    input.value = "";
    projectDialogMask.hidden = false;
    projectDialogModal.hidden = false;
    requestAnimationFrame(() => {
      projectDialogMask.classList.add("is-open");
      projectDialogModal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    window.setTimeout(() => input.focus(), 60);
  }

  function closeProjectDialog() {
    if (!projectDialogModal || projectDialogModal.hidden) return;
    projectDialogMask.classList.remove("is-open");
    projectDialogModal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      projectDialogMask.hidden = true;
      projectDialogModal.hidden = true;
    }, 220);
  }

  /* 会话回复底部的「问题反馈」：针对单条回答的反馈（内容对齐 v4 审查页里的弹窗），
     与壳层的全局反馈（用户反馈）分开，互不影响 */
  let messageFeedbackMask;
  let messageFeedbackModal;

  function createMessageFeedbackModal() {
    if (messageFeedbackModal) return;

    messageFeedbackMask = document.createElement("div");
    messageFeedbackMask.className = "message-feedback-mask";
    messageFeedbackMask.hidden = true;

    messageFeedbackModal = document.createElement("section");
    messageFeedbackModal.className = "message-feedback-modal";
    messageFeedbackModal.setAttribute("role", "dialog");
    messageFeedbackModal.setAttribute("aria-modal", "true");
    messageFeedbackModal.setAttribute("aria-labelledby", "messageFeedbackTitle");
    messageFeedbackModal.hidden = true;
    messageFeedbackModal.innerHTML = `
      <div class="message-feedback-head">
        <div>
          <h2 id="messageFeedbackTitle">提交问题反馈</h2>
          <p>请说明这条回答存在的问题，反馈将进入人工核查。</p>
        </div>
        <button class="message-feedback-close" type="button" data-message-feedback-close aria-label="关闭反馈">
          <span data-icon="x"></span>
        </button>
      </div>
      <form class="message-feedback-form" data-message-feedback-form>
        <div class="message-feedback-type-grid">
          <label class="message-feedback-type"><input type="radio" name="message-feedback-type" value="内容不准确" checked>内容不准确</label>
          <label class="message-feedback-type"><input type="radio" name="message-feedback-type" value="来源不足">来源不足</label>
          <label class="message-feedback-type"><input type="radio" name="message-feedback-type" value="理解偏差">理解偏差</label>
          <label class="message-feedback-type"><input type="radio" name="message-feedback-type" value="其他问题">其他问题</label>
        </div>
        <label class="message-feedback-field">
          <span class="message-feedback-field-label">补充说明</span>
          <textarea class="message-feedback-textarea" placeholder="请描述具体问题、希望调整的内容或建议补充的资料。" data-message-feedback-detail></textarea>
        </label>
        <div class="message-feedback-actions">
          <button class="btn btn-outline" type="button" data-message-feedback-close>取消</button>
          <button class="btn btn-primary" type="submit">提交反馈</button>
        </div>
      </form>
    `;
    document.body.append(messageFeedbackMask, messageFeedbackModal);
    window.SKIcons.hydrate(messageFeedbackModal);

    messageFeedbackModal.querySelector("[data-message-feedback-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const detail = messageFeedbackModal.querySelector("[data-message-feedback-detail]");
      if (detail.value.trim().length < 4) {
        window.SKApp.showToast("请补充具体问题说明");
        detail.focus();
        return;
      }
      detail.value = "";
      closeMessageFeedback();
      window.SKApp.showToast("反馈已提交，感谢你的补充");
    });
    messageFeedbackModal.querySelectorAll("[data-message-feedback-close]").forEach((button) => {
      button.addEventListener("click", closeMessageFeedback);
    });
  }

  function openMessageFeedback() {
    createMessageFeedbackModal();
    messageFeedbackMask.hidden = false;
    messageFeedbackModal.hidden = false;
    requestAnimationFrame(() => {
      messageFeedbackMask.classList.add("is-open");
      messageFeedbackModal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    window.setTimeout(() => {
      messageFeedbackModal.querySelector("[data-message-feedback-detail]")?.focus();
    }, 60);
  }

  function closeMessageFeedback() {
    if (!messageFeedbackModal || messageFeedbackModal.hidden) return;
    messageFeedbackMask.classList.remove("is-open");
    messageFeedbackModal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      messageFeedbackMask.hidden = true;
      messageFeedbackModal.hidden = true;
    }, 220);
  }

  function initComposerProject() {
    document
      .querySelector("[data-composer-project-remove]")
      ?.addEventListener("click", () => setProject(null));
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

    /* 登录 / 注册成功后接上刚才那次提交；登出也会派发该事件，用 getUser() 兜住。
       中途把输入清空、后来又登录的，不再补发 */
    document.addEventListener("sk:auth-changed", () => {
      if (!state.pendingSubmit || !window.SKAuth?.getUser()) return;
      state.pendingSubmit = false;
      if (!textarea.value.trim()) return;
      sendMessage();
    });

    document.querySelectorAll("[data-file-trigger]").forEach((button) => {
      button.addEventListener("click", () => fileInput && fileInput.click());
    });

    if (fileInput) {
      fileInput.addEventListener("change", () => {
        Array.from(fileInput.files || []).forEach((file) => {
          addAttachment(file.name);
        });
        fileInput.value = "";
      });
    }

    document.querySelectorAll("[data-mode-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const on = button.classList.toggle("is-on");
        window.SKApp.showToast(`${on ? "已开启" : "已关闭"}${button.textContent.trim()}`);
      });
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
    /* 消息区往下滚了就把顶部栏的下边框带出来（滚回顶部再收掉） */
    const chatScroll = document.querySelector(".chat-scroll");
    const chatHead = document.querySelector("[data-chat-head]");
    if (chatScroll && chatHead) {
      const syncHeadEdge = () => chatHead.classList.toggle("is-scrolled", chatScroll.scrollTop > 0);
      chatScroll.addEventListener("scroll", syncHeadEdge, { passive: true });
      syncHeadEdge();
    }

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

    /* 来源 / 会话文件卡片：新窗口进阅读器，当前面板随之收起 */
    document.querySelectorAll("[data-reader-open]").forEach((card) => {
      card.addEventListener("click", () => {
        window.open("./reader.html", "_blank", "noopener");
        setSourceOpen(false);
        setSessionFilesOpen(false);
      });
    });

    document.querySelectorAll("[data-question-history-open]").forEach((button) => {
      button.addEventListener("click", () => setQuestionHistoryOpen(true));
    });
    document.querySelectorAll("[data-question-history-close]").forEach((button) => {
      button.addEventListener("click", () => setQuestionHistoryOpen(false));
    });
    document
      .querySelector("[data-question-history-search]")
      ?.addEventListener("input", applyQuestionSearchFilter);

    document.querySelectorAll("[data-session-files-open]").forEach((button) => {
      button.addEventListener("click", () => {
        const { sessionFilesPanel } = getElements();
        setSessionFilesOpen(!sessionFilesPanel?.classList.contains("is-open"));
      });
    });
    document.querySelectorAll("[data-session-files-close]").forEach((button) => {
      button.addEventListener("click", () => setSessionFilesOpen(false));
    });

    document.querySelectorAll("[data-thinking-search-open]").forEach((button) => {
      button.addEventListener("click", () => {
        setSearchResultsOpen(true, button.dataset.thinkingSearchOpen);
      });
    });
    document.querySelectorAll("[data-search-results-close]").forEach((button) => {
      button.addEventListener("click", () => setSearchResultsOpen(false));
    });
    document.addEventListener("click", (event) => {
      const { searchResultsPanel } = getElements();
      if (!searchResultsPanel?.classList.contains("is-open")) return;
      if (searchResultsPanel.contains(event.target)) return;
      if (event.target.closest("[data-thinking-search-open]")) return;
      setSearchResultsOpen(false);
    });

    document.addEventListener("click", (event) => {
      const { sourcePanel, sessionFilesPanel, questionHistoryPanel } = getElements();
      const clickedInsideSource = sourcePanel && sourcePanel.contains(event.target);
      const clickedInsideFiles = sessionFilesPanel && sessionFilesPanel.contains(event.target);
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

      if (
        sessionFilesPanel &&
        sessionFilesPanel.classList.contains("is-open") &&
        !clickedInsideFiles &&
        !event.target.closest("[data-session-files-open]")
      ) {
        setSessionFilesOpen(false);
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
          <input type="text" maxlength="60" aria-label="对话标题" data-history-dialog-input>
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
      input.setAttribute("aria-label", options.inputLabel);
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
      /* 真实点击才聚焦输入框：v4.js 初始化时会以程序化 click 触发本按钮。
         带 animate 是给「新建会话」这个入口也配上分段的入场动效 */
      button.addEventListener("click", (event) =>
        createNewConversation({ focus: event.isTrusted, animate: true }),
      );
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
          <h2 id="historySearchTitle">搜索历史记录</h2>
          <p>查找当前工作台中的对话和深度研究</p>
        </div>
        <button class="history-search-close" type="button" data-history-search-close aria-label="关闭搜索">
          <span data-icon="x"></span>
        </button>
      </div>
      <label class="history-search-field">
        <span data-icon="search"></span>
        <input type="search" placeholder="搜索对话或深度研究" autocomplete="off" data-history-search-input>
      </label>
      <div class="history-search-results" data-history-search-results></div>
    `;
    document.body.append(historySearchMask, historySearchModal);
    window.SKIcons.hydrate(historySearchModal);

    const renderResults = (keyword) => {
      const normalized = keyword.trim().toLowerCase();
      const records = [
        ...Array.from(document.querySelectorAll("[data-history-item] .history-item-text"), (node) => ({
          title: node.textContent.trim(),
          type: "history",
        })),
        ...Array.from(document.querySelectorAll("[data-research-item] .research-item-copy strong"), (node) => ({
          title: node.textContent.trim(),
          type: "research",
        })),
      ];
      const results = records.filter((record) => record.title.toLowerCase().includes(normalized));
      const container = historySearchModal.querySelector("[data-history-search-results]");

      container.replaceChildren();
      if (!results.length) {
        const empty = document.createElement("p");
        empty.className = "history-search-empty";
        empty.textContent = "未找到匹配的历史对话";
        container.append(empty);
        return;
      }

      results.forEach(({ title, type }) => {
        const button = document.createElement("button");
        button.className = "history-search-result";
        button.type = "button";
        if (type === "research") {
          const tag = document.createElement("span");
          tag.className = "history-search-tag";
          tag.textContent = "深度研究";
          const titleNode = document.createElement("span");
          titleNode.className = "history-search-title";
          titleNode.textContent = title;
          button.append(tag, titleNode);
        } else {
          button.textContent = title;
        }
        button.addEventListener("click", () => {
          if (type === "research") {
            document.querySelectorAll("[data-research-item]").forEach((item) => {
              item.classList.toggle(
                "is-active",
                item.querySelector(".research-item-copy strong")?.textContent.trim() === title,
              );
            });
            closeHistorySearch();
            window.SKApp.showToast(`已打开深度研究：${title}`);
            return;
          }
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
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeHistorySearch();
    });

    document.addEventListener("click", (event) => {
      /* 只认关闭按钮：点遮罩不关（全站统一） */
      if (event.target.closest("[data-history-search-close]")) {
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

  /* 「我的知识」选择弹窗：从 SKMyFiles（我的知识页同一份数据）挑文档加进输入框附件区。
     骨架与上面的历史搜索弹窗对齐（CSS 也共用同一份声明），差别是列表可多选 + 底部确认条 */
  function createDocPicker() {
    if (docPickerModal) return;

    docPickerMask = document.createElement("div");
    docPickerMask.className = "doc-picker-mask";
    docPickerMask.hidden = true;

    docPickerModal = document.createElement("section");
    docPickerModal.className = "doc-picker-modal";
    docPickerModal.setAttribute("role", "dialog");
    docPickerModal.setAttribute("aria-modal", "true");
    docPickerModal.setAttribute("aria-labelledby", "docPickerTitle");
    docPickerModal.hidden = true;
    docPickerModal.innerHTML = `
      <div class="doc-picker-head">
        <div>
          <h2 id="docPickerTitle">我的知识</h2>
          <p>选择要添加的文档</p>
        </div>
        <button class="doc-picker-close" type="button" data-doc-picker-close aria-label="关闭">
          <span data-icon="x"></span>
        </button>
      </div>
      <label class="doc-picker-field">
        <span data-icon="search"></span>
        <input type="search" placeholder="搜索文档标题" autocomplete="off" data-doc-picker-input>
      </label>
      <div class="doc-picker-results" role="listbox" aria-multiselectable="true" data-doc-picker-results></div>
      <div class="doc-picker-actions">
        <button class="btn btn-outline" type="button" data-doc-picker-cancel>取消</button>
        <button class="btn btn-primary" type="button" data-doc-picker-confirm disabled>添加</button>
      </div>
    `;
    document.body.append(docPickerMask, docPickerModal);
    window.SKIcons.hydrate(docPickerModal);

    const results = docPickerModal.querySelector("[data-doc-picker-results]");
    const searchInput = docPickerModal.querySelector("[data-doc-picker-input]");
    const confirmButton = docPickerModal.querySelector("[data-doc-picker-confirm]");

    const syncConfirm = () => {
      const count = docPickerPicked.size;
      confirmButton.disabled = count === 0;
      confirmButton.textContent = count ? `添加 ${count} 个文档` : "添加";
    };

    const render = () => {
      const keyword = searchInput.value.trim().toLowerCase();
      const files = (window.SKMyFiles?.all() || []).filter(
        (file) => !keyword || file.name.toLowerCase().includes(keyword),
      );

      results.replaceChildren();
      if (!files.length) {
        const empty = document.createElement("p");
        empty.className = "doc-picker-empty";
        empty.textContent = "没有匹配的文档";
        results.append(empty);
      }
      files.forEach((file) => {
        const item = document.createElement("button");
        const picked = docPickerPicked.has(file.name);
        item.type = "button";
        item.className = "doc-picker-item" + (picked ? " is-selected" : "");
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(picked));

        const name = document.createElement("span");
        name.textContent = file.name;
        item.append(name);

        /* 只切这一个条目的状态、不重渲染整表：重渲染会把滚动位置弹回顶部 */
        item.addEventListener("click", () => {
          const next = !docPickerPicked.has(file.name);
          if (next) docPickerPicked.set(file.name, file);
          else docPickerPicked.delete(file.name);
          item.classList.toggle("is-selected", next);
          item.setAttribute("aria-selected", String(next));
          syncConfirm();
        });
        results.append(item);
      });
      syncConfirm();
    };
    docPickerRender = render;

    searchInput.addEventListener("input", render);
    searchInput.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeDocPicker();
    });

    docPickerModal.querySelector("[data-doc-picker-close]").addEventListener("click", closeDocPicker);
    docPickerModal.querySelector("[data-doc-picker-cancel]").addEventListener("click", closeDocPicker);

    confirmButton.addEventListener("click", () => {
      const picked = Array.from(docPickerPicked.values());
      picked.forEach((file) => addAttachment(file.name));
      closeDocPicker();
      if (picked.length) window.SKApp.showToast(`已添加 ${picked.length} 个文档`);
    });
  }

  function openDocPicker() {
    createDocPicker();
    /* 每次打开都从干净状态开始：清掉上次的选中文档与关键词 */
    docPickerPicked.clear();
    docPickerModal.querySelector("[data-doc-picker-input]").value = "";
    docPickerRender();

    docPickerMask.hidden = false;
    docPickerModal.hidden = false;
    requestAnimationFrame(() => {
      docPickerMask.classList.add("is-open");
      docPickerModal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    window.setTimeout(() => docPickerModal.querySelector("[data-doc-picker-input]").focus(), 60);
  }

  function closeDocPicker() {
    if (!docPickerModal) return;
    docPickerMask.classList.remove("is-open");
    docPickerModal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      docPickerMask.hidden = true;
      docPickerModal.hidden = true;
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
      if (event.key === "Escape") {
        event.preventDefault();
        finishEditing(false);
      }
    });
    input.addEventListener("blur", () => finishEditing(true));
  }

  /* 问题反馈弹窗已收归壳层（assets/js/pages/workbench.js），全站共用一份实现 */

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

  /* 右上角：自动播报总开关 + 「更多」菜单（历史提问 / 会话文件等入口都收在里面）。
     菜单在点非菜单区域、点菜单项、按 ESC 时都收起 */
  function initChatHeadActions() {
    const autoSpeakButton = document.querySelector("[data-auto-speak]");
    autoSpeakButton?.addEventListener("click", () => {
      state.autoSpeak = !state.autoSpeak;
      autoSpeakButton.classList.toggle("is-on", state.autoSpeak);
      autoSpeakButton.setAttribute("aria-pressed", String(state.autoSpeak));
      /* 关闭态用带斜杠的图标，开启态是正常喇叭；不靠背景色表示状态 */
      const iconSlot = autoSpeakButton.querySelector("[data-icon]");
      if (iconSlot) {
        iconSlot.replaceChildren(window.SKIcons.create(state.autoSpeak ? "volume-2" : "volume-off"));
      }
      autoSpeakButton.title = state.autoSpeak ? "关闭自动播报" : "开启自动播报";
      window.SKApp.showToast(
        state.autoSpeak ? "已开启自动播报，每段回复生成后自动朗读" : "已关闭自动播报",
      );
    });

    const trigger = document.querySelector("[data-chat-more-trigger]");
    const menu = document.querySelector("[data-chat-more-menu]");
    if (!trigger || !menu) return;

    const setOpen = (open) => {
      menu.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
    };

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(menu.hidden);
    });

    menu.addEventListener("click", (event) => {
      const item = event.target.closest("button");
      if (!item) return;
      /* 归档 / 移动 / 删除复用壳层（workbench.js）那套弹窗——
         与侧栏对话行三点菜单里的表现完全一致 */
      const action = item.dataset.chatMoreAction;
      if (action) {
        const title = document.querySelector("[data-chat-title]")?.textContent.trim() || "当前对话";
        const dialogs = window.SKWorkbenchDialogs;
        if (action === "archive") {
          dialogs?.archiveDialog(title, () => window.SKApp.showToast(`已归档“${title}”`));
        } else if (action === "move") {
          dialogs?.moveDialog(title, (project) => window.SKApp.showToast(`已移动至「${project.name}」`));
        } else if (action === "delete") {
          /* 删除确认后回到新对话欢迎页 */
          dialogs?.deleteDialog(title, () => createNewConversation({ focus: false, animate: true }));
        }
      }
      setOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (menu.hidden) return;
      if (event.target.closest("[data-chat-more]")) return;
      setOpen(false);
    });

    /* 先于 ESC 分发链注册：这里处理过（preventDefault）链就不再往下走 */
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || menu.hidden) return;
      event.preventDefault();
      setOpen(false);
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

      if (event.key !== "Escape") return;

      /* 上面的浮层各自绑了 ESC，谁处理了谁留 defaultPrevented 的痕。
         光看 hidden 状态判断是不可靠的——它们自己的监听先跑，到这儿状态早就翻回去了 */
      if (event.defaultPrevented) return;

      /* 焦点不在浮层里时它们收不到 ESC，这里兜底关掉，同样不再往下 */
      if (projectDialogModal && !projectDialogModal.hidden) {
        closeProjectDialog();
        return;
      }
      if (docPickerModal && !docPickerModal.hidden) {
        closeDocPicker();
        return;
      }
      if (quickMenuEl && !quickMenuEl.hidden) {
        closeQuickMenu();
        return;
      }
      if (messageFeedbackModal && !messageFeedbackModal.hidden) {
        closeMessageFeedback();
        return;
      }

      /* 浮层都关着才轮到取消智能体：回到新建对话初始态。
         这一步不放入场动效——退回来时直接把欢迎页摆好即可 */
      if (state.selectedAgent) {
        event.preventDefault();
        clearSelectedAgent(false);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const agentParam = params.get("agent");
    const promptParam = params.get("prompt");
    if (agentParam && AGENT_CONFIGS[agentParam]) state.selectedAgent = agentParam;
    initComposerAddMenu();
    initComposer();
    initComposerQuickMenu();
    initComposerProject();
    /* 从别的页面按 Ctrl+Alt+D 跳过来：落地即开始录音 */
    if (params.get("voice")) document.querySelector("[data-voice-trigger]")?.click();
    initPanels();
    initHistoryAndActions();
    initMessageSpeech();
    /* 先于 initKeyboardShortcuts：更多菜单的 ESC 要在分发链之前接手 */
    initChatHeadActions();
    /* 会话回复底部的问题反馈（与壳层的全局反馈分开）：入口可能在静态消息和动态生成的消息里，
       统一用事件委托处理 */
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-message-feedback-open]")) openMessageFeedback();
    });
    /* 思考过程的步骤行：点一下在下方展开该步的补充说明 */
    document.addEventListener("click", (event) => {
      const head = event.target.closest(".message-thinking__step-head");
      if (!head) return;
      const step = head.closest(".message-thinking__step");
      if (!step) return;
      const open = !step.classList.contains("is-open");
      step.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
    });
    /* 网页来源执行区只露 5 条，「查看全部」开右侧的「浏览页面」面板看完整记录 */
    document.addEventListener("click", (event) => {
      if (!event.target.closest("[data-sources-more]")) return;
      setSearchResultsOpen(true);
    });
    initKeyboardShortcuts();
    const { thread } = getElements();
    if (thread) {
      demoConversationMessages = Array.from(
        thread.children,
      ).filter((element) => element.classList.contains("message"));
    }
    /* 「推荐管理」：先按上次记下的选择回填开关，再建首页（推荐区据此显隐） */
    const recommendInput = document.querySelector("[data-settings-recommend]");
    if (recommendInput) recommendInput.checked = readRecommendSetting();
    /* 首屏也走一遍分段入场（标题打字 → 描述 → 提示词 / 推荐区），与切换智能体时一致 */
    createNewConversation({ focus: false, animate: true });
    /* 开关一动：写回本地，并让已经在屏幕上的首页推荐区跟着显隐 */
    recommendInput?.addEventListener("change", function () {
      saveRecommendSetting(this.checked);
      syncRecommendationsVisibility();
    });
    /* 「自动联网搜索」：开关开着时输入框里的联网搜索自动选上，关了同步取消 */
    const autoWebInput = document.querySelector("[data-settings-auto-web]");
    const webToggle = document.querySelector("[data-mode-web]");
    if (autoWebInput) {
      autoWebInput.checked = readAutoWebSetting();
      webToggle?.classList.toggle("is-on", autoWebInput.checked);
      autoWebInput.addEventListener("change", function () {
        saveAutoWebSetting(this.checked);
        webToggle?.classList.toggle("is-on", this.checked);
      });
    }
    /* 「展示思考过程」：回填开关，会话里的思考过程块据此显隐 */
    const thinkingInput = document.querySelector("[data-settings-thinking]");
    if (thinkingInput) thinkingInput.checked = readThinkingSetting();
    syncThinkingVisibility();
    thinkingInput?.addEventListener("change", function () {
      saveThinkingSetting(this.checked);
      syncThinkingVisibility();
    });
    if (promptParam) {
      const { textarea } = getElements();
      if (textarea) {
        textarea.value = promptParam;
        autoGrowTextarea();
        textarea.focus();
      }
    }
  });
})();
