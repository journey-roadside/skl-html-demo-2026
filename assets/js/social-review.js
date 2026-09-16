(function () {
  "use strict";

  const ANALYSIS_STAGES = [
    { key: "parse", logs: ["正在解析文件结构...", "已提取正文 18,642 字"] },
    { key: "source", logs: ["正在比对事实与来源...", "已识别 12 处引用来源", "发现 2 处需要人工核验的结论"] },
    { key: "value", logs: ["正在检查结论边界与表达尺度...", "发现 3 处建议调整的表述"] },
    { key: "ethics", logs: ["正在检查数据授权与生成痕迹...", "发现 4 项需关注的伦理风险"] },
    { key: "risks", logs: ["正在整理风险等级...", "风险分布：高风险 2 项、中风险 1 项、低风险 1 项"] },
    { key: "report", logs: ["正在生成风险报告...", "分析报告已生成"] },
  ];

  const state = {
    selectedFile: null,
    currentTask: null,
    runToken: 0,
    taskFilter: "all",
  };

  const delay = (duration, token) =>
    new Promise((resolve) => {
      window.setTimeout(() => resolve(token === state.runToken), duration);
    });

  function formatCurrentTime() {
    return formatFullTime(new Date()).slice(11);
  }

  function formatFullTime(date = new Date()) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function getFileType(name) {
    const extension = name.split(".").pop()?.toUpperCase() || "";
    return extension === "DOC" ? "DOCX" : extension;
  }

  function getFileIcon(type) {
    if (type === "DOCX" || type === "DOC") return "file-word";
    if (type === "XLSX" || type === "XLS") return "file-spreadsheet";
    if (type === "PPTX" || type === "PPT") return "file-presentation";
    return "file-text";
  }

  function setSelectedFile(file) {
    state.selectedFile = file;
    const selection = document.querySelector("[data-review-selection]");
    const selectedName = document.querySelector("[data-review-selected-name]");
    const submit = document.querySelector("[data-review-submit]");
    document.querySelectorAll("[data-review-file]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.name === file?.name);
    });
    if (file) {
      selection.hidden = false;
      selectedName.textContent = file.name;
      submit.disabled = false;
    } else {
      selection.hidden = true;
      selectedName.textContent = "";
      submit.disabled = true;
    }
  }

  function resetUploadedFile() {
    const input = document.querySelector("[data-review-local-file]");
    const uploaded = document.querySelector("[data-review-uploaded-file]");
    if (input) input.value = "";
    if (uploaded) uploaded.hidden = true;
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    resetUploadedFile();
  }

  function initKnowledgeFiles() {
    const input = document.querySelector("[data-review-search]");
    const options = Array.from(document.querySelectorAll("[data-review-file]"));
    const empty = document.querySelector("[data-review-file-empty]");
    const suggestions = document.querySelector("[data-review-suggestions]");

    options.forEach((button) => {
      button.addEventListener("click", () => {
        setSelectedFile({
          name: button.dataset.name,
          type: button.dataset.type,
          size: button.dataset.size,
          source: "我的知识",
        });
        suggestions.hidden = true;
        resetUploadedFile();
      });
    });

    const applySearch = () => {
      const keyword = input.value.trim().toLowerCase();
      suggestions.hidden = !keyword;
      let visibleCount = 0;
      options.forEach((button) => {
        const visible = !keyword || button.dataset.name.toLowerCase().includes(keyword);
        button.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      empty.hidden = visibleCount > 0;
    };

    input?.addEventListener("input", applySearch);
    input?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      applySearch();
    });
  }

  function initUpload() {
    const input = document.querySelector("[data-review-local-file]");
    const zone = document.querySelector("[data-review-upload-zone]");
    const uploaded = document.querySelector("[data-review-uploaded-file]");
    const uploadedName = document.querySelector("[data-review-uploaded-name]");
    const uploadedMeta = document.querySelector("[data-review-uploaded-meta]");
    const uploadedIcon = uploaded.querySelector(".review-file-icon");

    const applyUpload = (file) => {
      if (!file) return;
      const type = getFileType(file.name);
      const size = file.size
        ? `${Math.max(file.size / 1024 / 1024, 0.1).toFixed(1)} MB`
        : "";
      uploadedName.textContent = file.name;
      uploadedMeta.textContent = `${type || "文件"}${size ? ` · ${size}` : ""} · 解析完成`;
      uploadedIcon.innerHTML = `<span data-icon="${getFileIcon(type)}"></span>`;
      window.SKIcons?.hydrate(uploadedIcon);
      uploaded.hidden = false;
      document.querySelector("[data-review-suggestions]").hidden = true;
      setSelectedFile({
        name: file.name,
        type: type || "FILE",
        size,
        source: "本地上传",
      });
    };

    input?.addEventListener("change", () => applyUpload(input.files?.[0]));
    document.querySelector("[data-review-upload-trigger]")?.addEventListener("click", () => input?.click());
    zone?.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("is-dragging");
    });
    zone?.addEventListener("dragleave", () => zone.classList.remove("is-dragging"));
    zone?.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("is-dragging");
      const file = event.dataTransfer?.files?.[0];
      if (file) applyUpload(file);
    });

    document.querySelector("[data-review-upload-remove]")?.addEventListener("click", clearSelectedFile);
    document.querySelector("[data-review-selection-clear]")?.addEventListener("click", clearSelectedFile);
  }

  function setStageState(stageKey, status) {
    const item = document.querySelector(`[data-review-stage="${stageKey}"]`);
    if (!item) return;
    item.classList.toggle("is-active", status === "active");
    item.classList.toggle("is-complete", status === "complete");
    item.classList.toggle("is-failed", status === "failed");
    const statusNode = item.querySelector("[data-review-stage-status]");
    const labels = {
      active: "进行中",
      complete: "已完成",
      failed: "失败",
      waiting: "等待中",
    };
    statusNode.textContent = labels[status] || labels.waiting;
  }

  function resetStages() {
    document.querySelectorAll("[data-review-stage]").forEach((item) => {
      setStageState(item.dataset.reviewStage, "waiting");
    });
    document.querySelector("[data-review-log-list]").replaceChildren();
  }

  function appendLog(message) {
    const list = document.querySelector("[data-review-log-list]");
    const item = document.createElement("li");
    item.innerHTML = `<time>${formatCurrentTime()}</time><span>${message}</span>`;
    list.append(item);
    list.scrollTop = list.scrollHeight;
  }

  function setTaskHeader(file) {
    const title = document.querySelector("[data-review-task-title]");
    title.textContent = file.name.replace(/\.[^.]+$/, "");
    title.title = file.name;
  }

  function showHome() {
    state.runToken += 1;
    document.querySelector("[data-review-home-view]").hidden = false;
    document.querySelector("[data-review-analysis-view]").hidden = true;
    document.querySelector("[data-review-scroll]").scrollTo({ top: 0, behavior: "smooth" });
  }

  function showAnalysis(file, mode = "reviewing") {
    state.runToken += 1;
    state.currentTask = file;
    document.querySelector("[data-review-home-view]").hidden = true;
    document.querySelector("[data-review-analysis-view]").hidden = false;
    document.querySelector(".review-progress-card").hidden = false;
    document.querySelector("[data-review-analysis-actions]").hidden = true;
    setTaskHeader(file);
    document.querySelector("[data-review-report]").hidden = true;
    document.querySelector("[data-review-failed]").hidden = true;
    resetStages();
    document.querySelector("[data-review-scroll]").scrollTo({ top: 0, behavior: "smooth" });

    if (mode === "completed") {
      completeAnalysis(false);
      return;
    }
    if (mode === "failed") {
      setStageState("parse", "failed");
      document.querySelector("[data-review-progress-copy]").textContent = "分析未完成";
      document.querySelector("[data-review-failed]").hidden = false;
      appendLog("文件解析失败：无法读取文档中的部分图表数据");
      return;
    }
    runAnalysis(file);
  }

  async function runAnalysis(file) {
    const token = ++state.runToken;
    document.querySelector("[data-review-report]").hidden = true;
    document.querySelector("[data-review-failed]").hidden = true;
    resetStages();

    for (let index = 0; index < ANALYSIS_STAGES.length; index += 1) {
      const stage = ANALYSIS_STAGES[index];
      setStageState(stage.key, "active");
      document.querySelector("[data-review-progress-copy]").textContent = `${index + 1} / ${ANALYSIS_STAGES.length} 进行中`;
      for (const message of stage.logs) {
        const active = await delay(180, token);
        if (!active) return;
        appendLog(message);
      }
      const active = await delay(300, token);
      if (!active) return;
      setStageState(stage.key, "complete");
    }
    completeAnalysis(true);
  }

  function completeAnalysis(withLog = true) {
    document.querySelectorAll("[data-review-stage]").forEach((item) => {
      setStageState(item.dataset.reviewStage, "complete");
    });
    if (withLog) appendLog("分析完成，风险报告已生成");
    document.querySelector("[data-review-progress-copy]").textContent = "6 / 6 已完成";
    document.querySelector(".review-progress-card").hidden = true;
    document.querySelector("[data-review-analysis-actions]").hidden = false;
    document.querySelector("[data-review-report]").hidden = false;
  }

  function initSubmission() {
    document.querySelector("[data-review-submit]")?.addEventListener("click", () => {
      if (!state.selectedFile) return;
      showAnalysis(state.selectedFile, "reviewing");
    });
    document.querySelector("[data-review-back]")?.addEventListener("click", showHome);
    document.querySelector("[data-review-return]")?.addEventListener("click", showHome);
    document.querySelectorAll("[data-review-retry]").forEach((button) => {
      button.addEventListener("click", () => {
        if (state.currentTask) showAnalysis(state.currentTask, "reviewing");
      });
    });
  }

  function initRiskFilters() {
    const buttons = document.querySelectorAll("[data-review-risk-filter]");
    const items = document.querySelectorAll("[data-risk-category]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.reviewRiskFilter;
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        items.forEach((item) => {
          item.hidden = filter !== "all" && item.dataset.riskCategory !== filter;
        });
      });
    });
  }

  function initDownloads() {
    const trigger = document.querySelector("[data-review-download-trigger]");
    const menu = document.querySelector("[data-review-download-menu]");
    const setOpen = (open) => {
      menu.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
    };

    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(menu.hidden);
    });

    document.querySelectorAll("[data-review-download]").forEach((button) => {
      button.addEventListener("click", () => {
        const format = button.dataset.reviewDownload;
        setOpen(false);
        window.SKApp.showToast(`${format} 报告下载中`);
        window.setTimeout(() => window.SKApp.showToast(`${format} 报告已下载`), 900);
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".review-download-wrap")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) setOpen(false);
    });
  }

  function setTaskDrawerOpen(open) {
    const drawer = document.querySelector("[data-review-task-drawer]");
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
  }

  function filterTasks() {
    const keyword = document.querySelector("[data-review-task-search]").value.trim().toLowerCase();
    const tasks = Array.from(document.querySelectorAll("[data-review-history-task]"));
    let visibleCount = 0;
    tasks.forEach((task) => {
      const matchesFilter = state.taskFilter === "all" || task.dataset.taskState === state.taskFilter;
      const matchesSearch = !keyword || task.textContent.toLowerCase().includes(keyword);
      const visible = matchesFilter && matchesSearch;
      task.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    document.querySelector("[data-review-task-empty]").hidden = visibleCount > 0;
  }

  function initTaskDrawer() {
    const drawer = document.querySelector("[data-review-task-drawer]");
    const search = document.querySelector("[data-review-task-search]");
    document.querySelector("[data-review-task-open]")?.addEventListener("click", () => {
      setTaskDrawerOpen(true);
      window.setTimeout(() => search?.focus(), 40);
    });
    document.querySelector("[data-review-task-close]")?.addEventListener("click", () => setTaskDrawerOpen(false));
    document.addEventListener("click", (event) => {
      if (!drawer.classList.contains("is-open")) return;
      if (drawer.contains(event.target) || event.target.closest("[data-review-task-open]")) return;
      setTaskDrawerOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) setTaskDrawerOpen(false);
    });
    search?.addEventListener("input", filterTasks);
    document.querySelectorAll("[data-review-task-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.taskFilter = button.dataset.reviewTaskFilter;
        document.querySelectorAll("[data-review-task-filter]").forEach((item) => {
          item.classList.toggle("is-active", item === button);
        });
        filterTasks();
      });
    });
    document.querySelectorAll("[data-review-history-task]").forEach((button) => {
      button.addEventListener("click", () => {
        setTaskDrawerOpen(false);
        const mode = button.dataset.taskState === "reviewing" ? "reviewing" : button.dataset.taskState;
        showAnalysis(
          {
            name: button.dataset.taskName,
            type: "FILE",
            source: button.querySelector("small")?.textContent.split("·")[0].trim() || "我的知识",
          },
          mode,
        );
      });
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
    initKnowledgeFiles();
    initUpload();
    initSubmission();
    initRiskFilters();
    initDownloads();
    initTaskDrawer();
  });
})();


