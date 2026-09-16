(function () {
  "use strict";

  const STAGES = [
    { key: "parse", sources: 1, evidence: 0, verify: 0, logs: ["正在解析 2 个研究来源...", "完成文档结构与段落索引"] },
    { key: "retrieve", sources: 2, evidence: 0, verify: 0, logs: ["正在检索政策、案例和研究结论...", "命中 5 个高相关引用段落"] },
    { key: "evidence", sources: 2, evidence: 4, verify: 1, logs: ["正在提取区域差异证据...", "提取 4 条可用证据，标记 1 项待核验"] },
    { key: "synthesis", sources: 2, evidence: 5, verify: 1, logs: ["正在归纳区域差异维度...", "形成财政投入、技术能力、人才储备、运营机制四类线索"] },
    { key: "verify", sources: 2, evidence: 5, verify: 2, logs: ["正在交叉验证研究判断...", "2 项量化关系缺少统一口径，保留待人工核验"] },
    { key: "generate", sources: 2, evidence: 5, verify: 2, logs: ["正在生成研究报告...", "研究成果已生成"] },
  ];

  const state = {
    outputTarget: "report",
    paused: false,
    runToken: 0,
    currentTopic: "基层公共文化服务数字化的区域差异研究",
    sources: [
      { title: "基层公共文化服务数字化研究报告.pdf", source: "我的知识", size: "3.2 MB" },
      { title: "区域公共文化服务效能评估资料汇编.pdf", source: "共享社区", size: "2.7 MB" },
    ],
  };

  const delay = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

  function formatTime() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  function showHome() {
    state.runToken += 1;
    document.querySelector("[data-deep-research-home-view]").hidden = false;
    document.querySelector("[data-deep-research-studio]").hidden = true;
  }

  function renderSources() {
    const list = document.querySelector("[data-deep-research-source-list]");
    list.replaceChildren();
    state.sources.forEach((source) => {
      const item = document.createElement("article");
      item.className = "deep-research-source-item";
      item.dataset.researchSource = "";
      item.dataset.sourceTitle = source.title;
      item.innerHTML = `
        <span class="deep-research-source-icon" data-icon="file-text"></span>
        <span><strong>${source.title}</strong><small>${source.source} · 已解析 · ${source.size}</small></span>
        <button type="button" data-research-source-remove aria-label="移除来源"><span data-icon="x"></span></button>
      `;
      window.SKIcons.hydrate(item);
      list.append(item);
    });
    document.querySelectorAll("[data-research-source-count]").forEach((node) => {
      node.textContent = `${state.sources.length} 个来源`;
    });
    document.querySelector("[data-research-start]").disabled = !state.sources.length;
  }

  function updateResearchHeader() {
    const title = document.querySelector("[data-research-topic]").value.trim();
    state.currentTopic = title || "未命名深度研究";
    document.querySelector("[data-deep-research-title]").textContent = state.currentTopic;
  }

  function addSource(type) {
    const data = {
      knowledge: { title: "政策文本与研究报告汇编.pdf", source: "我的知识", size: "2.1 MB" },
      community: { title: "共享社区区域治理案例.docx", source: "共享社区", size: "1.8 MB" },
      upload: { title: "本地上传研究资料.pdf", source: "本地上传", size: "1.2 MB" },
      text: { title: "文本粘贴资料", source: "文本粘贴", size: "约 3,600 字" },
    };
    state.sources.push(data[type]);
    renderSources();
    window.SKApp.showToast("来源已添加");
  }

  function initSourceIntake() {
    document.querySelectorAll("[data-research-add-source]").forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.dataset.researchAddSource;
        if (type === "upload") {
          document.querySelector("[data-research-file-input]").click();
          return;
        }
        addSource(type);
      });
    });
    document.querySelector("[data-research-file-input]")?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      state.sources.push({
        title: file.name,
        source: "本地上传",
        size: `${Math.max(file.size / 1024 / 1024, 0.1).toFixed(1)} MB`,
      });
      event.target.value = "";
      renderSources();
      window.SKApp.showToast("本地文件已添加");
    });
    document.querySelector("[data-research-source-list]")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-research-source-remove]");
      if (!button) return;
      const title = button.closest("[data-research-source]")?.dataset.sourceTitle;
      state.sources = state.sources.filter((source) => source.title !== title);
      renderSources();
    });
    document.querySelector("[data-research-source-clear]")?.addEventListener("click", () => {
      state.sources = [];
      renderSources();
    });
  }

  function initOutputTargets() {
    document.querySelectorAll("[data-research-output-target]").forEach((button) => {
      button.addEventListener("click", () => {
        state.outputTarget = button.dataset.researchOutputTarget;
        document.querySelectorAll("[data-research-output-target]").forEach((item) => {
          item.classList.toggle("is-active", item === button);
        });
      });
    });
  }

  function setStage(stageKey, status) {
    const item = document.querySelector(`[data-research-stage="${stageKey}"]`);
    if (!item) return;
    item.classList.toggle("is-active", status === "active");
    item.classList.toggle("is-complete", status === "complete");
    const labels = { waiting: "等待中", active: "进行中", complete: "已完成" };
    item.querySelector("[data-research-stage-status]").textContent = labels[status] || labels.waiting;
  }

  function resetStages() {
    document.querySelectorAll("[data-research-stage]").forEach((item) => setStage(item.dataset.researchStage, "waiting"));
    document.querySelector("[data-research-log-list]").replaceChildren();
    document.querySelector("[data-research-stage-count]").textContent = "0 / 6";
    document.querySelector("[data-research-progress-copy]").textContent = "准备开始";
    document.querySelector("[data-research-metric-sources]").textContent = `0 / ${Math.max(state.sources.length, 1)}`;
    document.querySelector("[data-research-metric-evidence]").textContent = "0";
    document.querySelector("[data-research-metric-verify]").textContent = "0";
  }

  function appendLog(message) {
    const list = document.querySelector("[data-research-log-list]");
    const item = document.createElement("li");
    item.innerHTML = `<time>${formatTime()}</time><span>${message}</span>`;
    list.append(item);
    list.scrollTop = list.scrollHeight;
  }

  async function runResearch() {
    const token = ++state.runToken;
    state.paused = false;
    setStageStateButton(false);
    resetStages();
    document.querySelector("[data-deep-research-status]").textContent = "研究进行中";

    for (let index = 0; index < STAGES.length; index += 1) {
      const stage = STAGES[index];
      setStage(stage.key, "active");
      document.querySelector("[data-research-stage-count]").textContent = `${index + 1} / ${STAGES.length}`;
      document.querySelector("[data-research-progress-copy]").textContent = `${index + 1} / ${STAGES.length} 进行中`;
      document.querySelector("[data-research-metric-sources]").textContent = `${stage.sources} / ${Math.max(state.sources.length, 1)}`;
      document.querySelector("[data-research-metric-evidence]").textContent = String(stage.evidence);
      document.querySelector("[data-research-metric-verify]").textContent = String(stage.verify);
      for (const message of stage.logs) {
        await delay(240);
        if (token !== state.runToken) return;
        while (state.paused && token === state.runToken) await delay(180);
        appendLog(message);
      }
      await delay(220);
      if (token !== state.runToken) return;
      setStage(stage.key, "complete");
    }

    document.querySelector("[data-deep-research-status]").textContent = "研究已完成";
    document.querySelector("[data-research-progress-copy]").textContent = "6 / 6 已完成";
    document.querySelectorAll("[data-research-output-content] span").forEach((node) => {
      node.textContent = node.closest("[data-research-output-content]").dataset.researchOutputContent === "report"
        ? "研究报告 · 已生成"
        : node.textContent.replace("· 生成中", "· 已生成");
    });
    window.SKApp.showToast("深度研究已完成");
  }

  function setStageStateButton(paused) {
    const button = document.querySelector("[data-research-pause]");
    button.innerHTML = paused
      ? '<span data-icon="play"></span>继续'
      : '<span data-icon="pause"></span>暂停';
    window.SKIcons.hydrate(button);
  }

  function startStudio(mode = "reviewing") {
    updateResearchHeader();
    document.querySelector("[data-deep-research-home-view]").hidden = true;
    document.querySelector("[data-deep-research-studio]").hidden = false;
    document.querySelector("[data-deep-research-source-count]").textContent = `${state.sources.length} 个来源`;
    if (mode === "completed") {
      state.runToken += 1;
      resetStages();
      document.querySelectorAll("[data-research-stage]").forEach((item) => setStage(item.dataset.researchStage, "complete"));
      document.querySelector("[data-research-stage-count]").textContent = "6 / 6";
      document.querySelector("[data-research-progress-copy]").textContent = "6 / 6 已完成";
      document.querySelector("[data-deep-research-status]").textContent = "研究已完成";
      document.querySelector("[data-research-metric-sources]").textContent = `${state.sources.length} / ${state.sources.length}`;
      document.querySelector("[data-research-metric-evidence]").textContent = "5";
      document.querySelector("[data-research-metric-verify]").textContent = "2";
      return;
    }
    runResearch();
  }

  function initResearchActions() {
    document.querySelector("[data-research-start]")?.addEventListener("click", () => {
      if (!document.querySelector("[data-research-topic]").value.trim()) {
        window.SKApp.showToast("请输入研究主题");
        return;
      }
      if (!state.sources.length) {
        window.SKApp.showToast("请至少添加一个研究来源");
        return;
      }
      startStudio("reviewing");
    });
    document.querySelector("[data-deep-research-back]")?.addEventListener("click", showHome);
    document.querySelector("[data-deep-research-home]")?.addEventListener("click", showHome);
    document.querySelector("[data-research-pause]")?.addEventListener("click", () => {
      state.paused = !state.paused;
      setStageStateButton(state.paused);
      document.querySelector("[data-deep-research-status]").textContent = state.paused ? "研究已暂停" : "研究进行中";
    });
    document.querySelector("[data-deep-research-task-toggle]")?.addEventListener("click", () => {
      document.querySelector(".deep-research-mobile-menu")?.click();
    });
    document.querySelectorAll("[data-research-task]").forEach((button) => {
      button.addEventListener("click", () => startStudio(button.dataset.taskMode));
    });
  }

  function initChat() {
    const form = document.querySelector("[data-research-chat-form]");
    const input = document.querySelector("[data-research-chat-input]");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      const thread = document.querySelector(".research-chat");
      const userMessage = document.createElement("div");
      userMessage.className = "research-message is-user";
      userMessage.innerHTML = `<span>我</span><div><p>${question}</p></div>`;
      form.before(userMessage);
      input.value = "";
      const answer = document.querySelector("[data-research-chat-answer]");
      answer.hidden = false;
      document.querySelector("[data-research-chat-answer-text]").textContent = `已基于当前来源分析“${question}”。现有资料支持区域性判断，但涉及量化比较的部分仍需补充统一统计口径，标记为待人工核验。`;
    });
  }

  function initOutputPanel() {
    document.querySelectorAll("[data-research-output-view]").forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.researchOutputView;
        document.querySelectorAll("[data-research-output-view]").forEach((item) => item.classList.toggle("is-active", item === button));
        document.querySelectorAll("[data-research-output-content]").forEach((panel) => {
          panel.hidden = panel.dataset.researchOutputContent !== view;
        });
      });
    });
    document.querySelector("[data-research-generate]")?.addEventListener("click", () => {
      window.SKApp.showToast("正在生成研究产出");
      window.setTimeout(() => window.SKApp.showToast("研究产出已生成"), 700);
    });
    document.querySelector("[data-research-download]")?.addEventListener("click", () => window.SKApp.showToast("研究产出下载中"));
    document.querySelectorAll("[data-research-save]").forEach((button) => {
      button.addEventListener("click", () => window.SKApp.showToast("已保存到我的知识"));
    });
    document.querySelector("[data-research-audit]")?.addEventListener("click", () => {
      window.open("./social-review.html", "_blank", "noopener,noreferrer");
    });
    document.querySelector("[data-research-reader]")?.addEventListener("click", () => {
      window.open("./reader.html?source=research&file=基层公共文化服务数字化研究报告.pdf", "_blank", "noopener,noreferrer");
    });
    document.querySelector("[data-research-panel-add]")?.addEventListener("click", () => {
      addSource("knowledge");
      window.SKApp.showToast("已添加新的研究来源");
    });
  }

  function initCitations() {
    document.querySelectorAll("[data-research-citation-source]").forEach((button) => {
      button.addEventListener("click", () => {
        const number = button.dataset.researchCitationSource;
        document.querySelectorAll("[data-research-citation-source]").forEach((item) => {
          item.classList.toggle("is-active", item.dataset.researchCitationSource === number);
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const taskTitle = new URLSearchParams(window.location.search).get("task");
    if (taskTitle) {
      document.querySelector("[data-research-topic]").value = taskTitle;
      state.currentTopic = taskTitle;
    }
    document.querySelectorAll("[data-history-item]").forEach((item) => {
      item.addEventListener("click", () => {
        const title = item.querySelector(".history-item-text")?.textContent.trim() || "";
        window.location.href = `./research-assistant.html?conversation=${encodeURIComponent(title)}`;
      });
    });
    renderSources();
    initSourceIntake();
    initOutputTargets();
    initResearchActions();
    initChat();
    initOutputPanel();
    initCitations();
  });
})();


