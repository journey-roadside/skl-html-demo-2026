(function () {
  "use strict";

  const state = {
    activeTaskId: "review-1",
    tab: "all",
    queueSearch: "",
    editTaskId: null,
    deleteTaskId: null,
  };

  const tasks = [
    {
      id: "review-1",
      title: "基层公共文化服务数字化研究报告",
      status: "complete",
      risk: "medium",
      updated: "今天 14:32",
      words: "18,640 字",
      scores: { truth: 82, value: 68, ethics: 45 },
      conclusion: "建议修改后发布",
      conclusionCopy: "内容整体可信，但存在 2 项中度风险，建议补充证据来源并调整绝对化表达。",
      counts: { high: 1, medium: 3, low: 2 },
    },
    {
      id: "review-2",
      title: "区域治理框架比较研究",
      status: "complete",
      risk: "low",
      updated: "今天 11:06",
      words: "12,320 字",
      scores: { truth: 94, value: 91, ethics: 88 },
      conclusion: "可通过审查",
      conclusionCopy: "内容来源清晰，核心判断与价值导向一致，未发现需要阻断发布的风险。",
      counts: { high: 0, medium: 1, low: 5 },
    },
    {
      id: "review-3",
      title: "AI 生成社科综述待核验",
      status: "complete",
      risk: "high",
      updated: "昨天 17:20",
      words: "9,860 字",
      scores: { truth: 38, value: 52, ethics: 34 },
      conclusion: "建议暂缓发布",
      conclusionCopy: "存在事实引用错位和模型使用说明缺失，建议逐条核验原始资料后重新提交。",
      counts: { high: 3, medium: 2, low: 1 },
    },
    {
      id: "review-4",
      title: "公共政策分析中的证据分层",
      status: "processing",
      risk: "medium",
      updated: "正在审查",
      words: "15,480 字",
      scores: { truth: 80, value: 72, ethics: 58 },
      conclusion: "审查进行中",
      conclusionCopy: "正在核验引文来源与数据口径，完成后将生成完整风险报告。",
      counts: { high: 0, medium: 2, low: 2 },
    },
    {
      id: "review-5",
      title: "社科成果知识图谱建设思路",
      status: "complete",
      risk: "low",
      updated: "近7天",
      words: "7,240 字",
      scores: { truth: 92, value: 89, ethics: 90 },
      conclusion: "可通过审查",
      conclusionCopy: "整体规范性较好，建议后续补充知识图谱数据来源与更新机制。",
      counts: { high: 0, medium: 1, low: 4 },
    },
  ];

  const riskMeta = {
    low: { label: "低风险", className: "is-low" },
    medium: { label: "中风险", className: "is-medium" },
    high: { label: "高风险", className: "is-high" },
  };

  const findingSets = {
    low: [
      ["pass", "truth", "主要政策引用与发布时间一致", "抽查的政策文件、责任部门和发布时间均一致。"],
      ["pass", "value", "核心观点符合主流价值导向", "研究判断保持了客观、审慎和建设性的表达。"],
      ["warn", "ethics", "建议补充数据更新机制", "知识图谱和统计数据的后续更新方式可以进一步说明。"],
      ["pass", "truth", "数据口径基本清晰", "关键指标均注明来源或统计周期。"],
      ["pass", "value", "区域比较表述较克制", "未出现明显绝对化或地域标签化表达。"],
    ],
    medium: [
      ["warn", "truth", "2 组数据缺少原始出处", "涉及设施覆盖率的两组数据未标注统计口径，建议补充官方来源。"],
      ["warn", "value", "区域差异表述需要收敛", "建议将“显著落后”调整为基于指标差异的客观描述。"],
      ["fail", "ethics", "缺少用户数据处理说明", "如引用调研用户数据，需补充匿名化处理和授权范围。"],
      ["pass", "truth", "主要政策时间线一致", "政策阶段划分与原文发布时间基本对应。"],
      ["warn", "ethics", "AI 辅助使用情况未披露", "建议说明 AI 在资料整理和内容生成中的使用范围。"],
      ["pass", "value", "研究结论总体正向", "建议措施与公共文化服务建设目标保持一致。"],
    ],
    high: [
      ["fail", "truth", "发现 3 处事实引用错位", "部分机构和政策时间与原始资料不一致，需要逐条核验。"],
      ["fail", "truth", "关键结论缺少可靠来源", "核心判断使用未标注来源的生成性内容，无法完成证据回溯。"],
      ["fail", "ethics", "未披露生成模型与提示词边界", "需要说明模型参与范围、人工核验步骤和使用限制。"],
      ["warn", "value", "部分价值判断缺少依据", "建议区分事实描述、研究推断和政策建议。"],
      ["warn", "ethics", "引用资料授权范围不清晰", "需确认引用内容是否具备公开使用和再加工授权。"],
      ["pass", "value", "总体研究主题符合合规要求", "选题方向不涉及禁止性或敏感内容。"],
    ],
  };

  const queue = document.querySelector("[data-review-queue]");
  const findingList = document.querySelector("[data-review-findings]");
  const modalMask = document.querySelector("[data-review-modal-mask]");
  const createModal = document.querySelector("[data-review-create-modal]");
  const editModal = document.querySelector("[data-review-edit-modal]");
  const deleteModal = document.querySelector("[data-review-delete-modal]");
  let activeModal = null;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getActiveTask() {
    return tasks.find((task) => task.id === state.activeTaskId) || tasks[0] || null;
  }

  function getQueueState(task) {
    if (task.status === "processing") {
      return { text: "审查中", className: "is-processing" };
    }
    const meta = riskMeta[task.risk];
    return { text: meta.label, className: meta.className };
  }

  function renderQueue() {
    const keyword = state.queueSearch.trim().toLowerCase();
    const visibleTasks = tasks.filter((task) => task.title.toLowerCase().includes(keyword));
    queue.innerHTML = visibleTasks
      .map((task) => {
        const stateMeta = getQueueState(task);
        return `
          <article class="review-queue-item${task.id === state.activeTaskId ? " is-active" : ""}">
            <button class="review-queue-main" type="button" data-review-task="${task.id}">
              <strong>${escapeHtml(task.title)}</strong>
              <p>${escapeHtml(task.updated)}</p>
              <span class="review-queue-state ${stateMeta.className}">${stateMeta.text}</span>
            </button>
            <div class="review-queue-actions">
              <button class="review-queue-action" type="button" data-review-edit="${task.id}" aria-label="编辑任务名称">
                <span data-icon="pencil"></span>
              </button>
              <button class="review-queue-action" type="button" data-review-delete="${task.id}" aria-label="删除任务">
                <span data-icon="trash-2"></span>
              </button>
            </div>
          </article>
        `;
      })
      .join("");
    window.SKIcons.hydrate(queue);
    document.querySelector("[data-review-queue-count]").textContent = tasks.length;
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function renderFindings() {
    const task = getActiveTask();
    if (!task) {
      setText("[data-review-finding-count]", 0);
      findingList.innerHTML = '<div class="review-finding-empty">暂无审查任务</div>';
      return;
    }
    const findings = (findingSets[task.risk] || findingSets.medium).filter(
      ([, category]) => state.tab === "all" || state.tab === category,
    );
    setText("[data-review-finding-count]", findings.length);
    findingList.innerHTML = findings
      .map(([level, category, title, description]) => {
        const levelLabel = level === "pass" ? "通过" : level === "warn" ? "关注" : "风险";
        const icon = level === "pass" ? "check" : "x";
        return `
          <article class="review-finding" data-review-finding-category="${category}">
            <span class="review-finding-icon is-${level}"><span data-icon="${icon}"></span></span>
            <div class="review-finding-copy">
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(description)}</p>
            </div>
            <span class="review-finding-level is-${level}">${levelLabel}</span>
          </article>
        `;
      })
      .join("");
    window.SKIcons.hydrate(findingList);
  }

  function renderTask() {
    const task = getActiveTask();
    if (!task) {
      setText("[data-review-document-title]", "暂无审查任务");
      setText("[data-review-document-meta]", "请新建审查任务");
      const emptyRiskBadge = document.querySelector("[data-review-risk-badge]");
      emptyRiskBadge.hidden = true;
      ["truth", "value", "ethics"].forEach((dimension) => {
        setText(`[data-review-score="${dimension}"]`, "--");
        setText(`[data-review-summary="${dimension}"]`, "暂无结果");
      });
      setText("[data-review-conclusion]", "暂无审查结果");
      setText("[data-review-conclusion-copy]", "新建审查任务后，将在此处生成报告摘要。");
      setText("[data-review-risk-count='high']", 0);
      setText("[data-review-risk-count='medium']", 0);
      setText("[data-review-risk-count='low']", 0);
      renderQueue();
      renderFindings();
      return;
    }
    const risk = riskMeta[task.risk];
    const riskBadge = document.querySelector("[data-review-risk-badge]");
    riskBadge.hidden = false;
    setText("[data-review-document-title]", task.title);
    setText(
      "[data-review-document-meta]",
      `${task.words} · ${task.status === "processing" ? "正在审查" : `${task.updated} 完成审查`}`,
    );
    riskBadge.textContent = task.status === "processing" ? "审查中" : risk.label;
    riskBadge.className = `review-risk-badge ${task.status === "processing" ? "is-medium" : risk.className}`;

    ["truth", "value", "ethics"].forEach((dimension) => {
      setText(`[data-review-score="${dimension}"]`, String(task.scores[dimension]));
      const track = document.querySelector(`[data-review-score="${dimension}"]`)?.closest(".review-score-card")?.querySelector(".review-score-track span");
      if (track) track.style.width = `${task.scores[dimension]}%`;
    });

    setText("[data-review-summary='truth']", task.risk === "high" ? "发现事实引用错位，需要补充可靠来源。" : "整体可信，个别数据需要补充原始出处。");
    setText("[data-review-summary='value']", task.risk === "high" ? "部分价值判断缺少依据，需要区分事实与推断。" : "方向基本正确，区域差异表述需避免绝对化。");
    setText("[data-review-summary='ethics']", task.risk === "high" ? "模型使用与数据授权信息不完整。" : "建议补充用户信息和模型使用说明。");
    setText("[data-review-conclusion]", task.conclusion);
    setText("[data-review-conclusion-copy]", task.conclusionCopy);
    setText("[data-review-risk-count='high']", task.counts.high);
    setText("[data-review-risk-count='medium']", task.counts.medium);
    setText("[data-review-risk-count='low']", task.counts.low);
    renderQueue();
    renderFindings();
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

  function openEditModal(task) {
    state.editTaskId = task.id;
    const input = document.querySelector("[data-review-edit-name]");
    input.value = task.title;
    openModal(editModal);
    window.setTimeout(() => {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 70);
  }

  function openDeleteModal(task) {
    state.deleteTaskId = task.id;
    setText("[data-review-delete-description]", `确认删除“${task.title}”吗？`);
    openModal(deleteModal);
  }

  function runReview(task) {
    if (!task) return;
    task.status = "processing";
    task.updated = "正在审查";
    renderTask();
    window.setTimeout(() => {
      task.status = "complete";
      task.updated = "刚刚";
      renderTask();
      window.SKApp.showToast("审查完成，报告已生成");
    }, 1400);
  }

  function initQueue() {
    queue.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-review-edit]");
      if (editButton) {
        const task = tasks.find((item) => item.id === editButton.dataset.reviewEdit);
        if (task) openEditModal(task);
        return;
      }
      const deleteButton = event.target.closest("[data-review-delete]");
      if (deleteButton) {
        const task = tasks.find((item) => item.id === deleteButton.dataset.reviewDelete);
        if (task) openDeleteModal(task);
        return;
      }
      const button = event.target.closest("[data-review-task]");
      if (!button) return;
      state.activeTaskId = button.dataset.reviewTask;
      state.tab = "all";
      document.querySelectorAll("[data-review-tab]").forEach((tab) => {
        const active = tab.dataset.reviewTab === "all";
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      renderTask();
    });

    document.querySelector("[data-review-queue-search]").addEventListener("input", (event) => {
      state.queueSearch = event.target.value;
      renderQueue();
    });
  }

  function initTabs() {
    document.querySelectorAll("[data-review-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.tab = button.dataset.reviewTab;
        document.querySelectorAll("[data-review-tab]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
        renderFindings();
      });
    });
  }

  function initActions() {
    document.querySelectorAll("[data-review-create-open]").forEach((button) => {
      button.addEventListener("click", () => openModal(createModal));
    });
    document.querySelectorAll("[data-review-modal-close]").forEach((button) => {
      button.addEventListener("click", closeModal);
    });
    modalMask.addEventListener("click", closeModal);
    document.querySelector("[data-review-refresh]").addEventListener("click", () => {
      runReview(getActiveTask());
    });
    document.querySelector("[data-review-more]").addEventListener("click", () => {
      window.SKApp.showToast("更多审查操作将在后续接入");
    });
    document.querySelector("[data-review-share]").addEventListener("click", () => {
      window.SKApp.showToast("审查报告分享链接已复制");
    });
    document.querySelector("[data-review-export]").addEventListener("click", () => {
      window.SKApp.showToast("审查报告已导出");
    });
    document.querySelector("[data-review-upload]").addEventListener("click", () => {
      window.SKApp.showToast("文件导入功能将在后续接入");
    });

    document.querySelector("[data-review-create-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const nameInput = document.querySelector("[data-review-create-name]");
      const contentInput = document.querySelector("[data-review-create-content]");
      const title = nameInput.value.trim();
      const content = contentInput.value.trim();
      if (!title || !content) return;

      const task = {
        id: `review-${Date.now()}`,
        title,
        status: "processing",
        risk: "medium",
        updated: "正在审查",
        words: `${content.length.toLocaleString("zh-CN")} 字`,
        scores: { truth: 80, value: 72, ethics: 58 },
        conclusion: "审查进行中",
        conclusionCopy: "正在核验引文来源与数据口径，完成后将生成完整风险报告。",
        counts: { high: 0, medium: 2, low: 2 },
      };
      tasks.unshift(task);
      state.activeTaskId = task.id;
      event.target.reset();
      closeModal();
      renderTask();
      runReview(task);
    });

    document.querySelector("[data-review-edit-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const task = tasks.find((item) => item.id === state.editTaskId);
      const input = document.querySelector("[data-review-edit-name]");
      const nextTitle = input.value.trim();
      if (!task || !nextTitle) {
        input.focus();
        return;
      }
      task.title = nextTitle;
      state.editTaskId = null;
      closeModal();
      renderTask();
      window.SKApp.showToast("任务名称已更新");
    });

    document.querySelector("[data-review-delete-confirm]").addEventListener("click", () => {
      const index = tasks.findIndex((item) => item.id === state.deleteTaskId);
      if (index < 0) return closeModal();
      const wasActive = tasks[index].id === state.activeTaskId;
      tasks.splice(index, 1);
      if (wasActive) {
        state.activeTaskId = tasks[Math.min(index, tasks.length - 1)]?.id || null;
      }
      state.deleteTaskId = null;
      closeModal();
      renderTask();
      window.SKApp.showToast("审查任务已删除");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeModal) {
        event.preventDefault();
        closeModal();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initQueue();
    initTabs();
    initActions();
    renderTask();
  });
})();
