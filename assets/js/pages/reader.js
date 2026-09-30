/* 文件查看页：只负责把 URL 上的文件信息铺到顶栏与正文标题。
   地址契约（三处列表调用方共用）：
     reader.html?source=<来源>&file=<文件名>&owner=<分享者>&time=<YYYY-MM-DD>
   —— source 只作来源标记，页面不区分渲染；file / owner / time 都可省：
   file 缺省用默认文件，owner 缺省按「当前用户自己的文件」显示，time 缺省取当天。
   顶栏与标签页显示完整文件名（带扩展名，扩展名即格式标识）；
   正文标题是「文档标题」，去掉扩展名。 */
(function () {
  "use strict";

  const DEFAULT_FILE = "基层公共文化服务数字化研究.pdf";
  const DEFAULT_OWNER = "社科研究员";

  /* 更新时间在列表里是相对文案（今天 09:18 / 昨天 16:40 / 09-14 / 刚刚），
     顶栏统一显示 YYYY-MM-DD，所以折算放在本页——调用方只管把列表上那句原文传过来。
     已经是 YYYY-MM-DD 的原样返回；认不出的也原样显示，不静默改成今天 */
  function normalizeTime(value) {
    const pad = function (n) {
      return String(n).padStart(2, "0");
    };
    const format = function (date) {
      return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    };
    const now = new Date();
    const raw = String(value || "").trim();

    const full = /\d{4}-\d{2}-\d{2}/.exec(raw);
    if (full) return full[0];
    if (!raw) return format(now);
    if (raw.indexOf("昨天") !== -1) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return format(yesterday);
    }
    if (raw.indexOf("今天") !== -1 || raw.indexOf("刚刚") !== -1) return format(now);
    const monthDay = /(\d{1,2})-(\d{1,2})/.exec(raw);
    if (monthDay) return now.getFullYear() + "-" + pad(Number(monthDay[1])) + "-" + pad(Number(monthDay[2]));
    return raw;
  }

  const params = new URLSearchParams(window.location.search);
  const originalFileName = (params.get("file") || "").trim() || DEFAULT_FILE;
  const ownerName = (params.get("owner") || "").trim() || DEFAULT_OWNER;
  /* 只认「以字母开头、总长 2-5 位」的扩展名：仅限长度挡不住小数，
     「研究报告 v1.2」会被切成「研究报告 v1」 */
  const EXTENSION_RE = /\.[A-Za-z][A-Za-z0-9]{1,4}$/;
  const baseNameOf = function (name) {
    return name.replace(EXTENSION_RE, "");
  };
  const extensionOf = function (name) {
    const matched = EXTENSION_RE.exec(name);
    return matched ? matched[0] : "";
  };

  /* 重命名记录：以「原始文件名」为键，刷新或从列表再进来都保持新名字 */
  const RENAME_KEY = "sheke-reader-file-names";
  const readRenames = function () {
    try {
      return JSON.parse(localStorage.getItem(RENAME_KEY) || "{}");
    } catch {
      return {};
    }
  };
  const writeRenames = function (map) {
    try {
      localStorage.setItem(RENAME_KEY, JSON.stringify(map));
    } catch {}
  };

  let fileName = readRenames()[originalFileName] || originalFileName;

  const nameNode = document.querySelector("[data-file-name]");
  const titleNode = document.querySelector("[data-file-title]");
  const ownerNode = document.querySelector("[data-file-owner]");
  const timeNode = document.querySelector("[data-file-time]");

  /* 同一个名字出现在顶栏、正文标题与标签页标题三处，统一由这里刷 */
  const applyFileName = function (name) {
    if (nameNode) nameNode.textContent = name;
    if (titleNode) titleNode.textContent = baseNameOf(name);
    document.title = name + " · 湖北社科数据信息联盟";
  };

  applyFileName(fileName);
  if (ownerNode) ownerNode.textContent = ownerName;
  if (timeNode) timeNode.textContent = normalizeTime(params.get("time"));

  /* 时间的口径随来源变：从「我的知识」打开是更新自己的文件，其余（社区共享等）是别人共享的时间 */
  const timeLabelNode = document.querySelector("[data-file-time-label]");
  if (timeLabelNode) {
    timeLabelNode.textContent = (params.get("source") || "").trim() === "knowledge" ? "更新时间" : "共享时间";
  }

  /* 回到顶部：滚到第二页（第二张纸顶到滚动区顶部）才出现。
     用 rect 差值判断而非 offsetTop —— 后者相对 offsetParent，布局一改就失效 */
  const content = document.querySelector(".reader-content");
  const toTop = document.querySelector("[data-reader-to-top]");
  const pages = content ? content.querySelectorAll(".reader-sheet") : [];

  if (content && toTop && pages.length > 1) {
    const isPastFirstPage = function () {
      const contentTop = content.getBoundingClientRect().top;
      return pages[1].getBoundingClientRect().top <= contentTop + 1;
    };
    const syncToTop = function () {
      toTop.classList.toggle("is-visible", isPastFirstPage());
    };

    content.addEventListener("scroll", syncToTop, { passive: true });
    toTop.addEventListener("click", function () {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      content.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    syncToTop();
  }

  /* ---------- 底部浮动工具栏：翻页 / 缩放 / 阅读背景 / 全屏 / 关闭 ---------- */
  const toolbar = document.querySelector("[data-reader-toolbar]");

  if (content && toolbar && pages.length) {
    const reduceMotion = function () {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    };
    const pick = function (selector) {
      return toolbar.querySelector(selector);
    };

    const currentNode = pick("[data-reader-page-current]");
    const totalNode = pick("[data-reader-page-total]");
    const prevButton = pick("[data-reader-page-prev]");
    const nextButton = pick("[data-reader-page-next]");
    const restore = pick("[data-reader-restore]");

    if (totalNode) totalNode.textContent = String(pages.length);

    /* 当前页 = 纸顶越过滚动区顶部的最靠后一张（与「回到顶部」同用 rect 差值） */
    const currentPage = function () {
      const contentTop = content.getBoundingClientRect().top;
      let index = 0;
      pages.forEach(function (sheet, i) {
        if (sheet.getBoundingClientRect().top <= contentTop + 4) index = i;
      });
      return index;
    };

    const syncPage = function () {
      const index = currentPage();
      if (currentNode) currentNode.textContent = String(index + 1);
      if (prevButton) prevButton.disabled = index === 0;
      if (nextButton) nextButton.disabled = index === pages.length - 1;
      /* 收起态的进度：同一份进度数据，只是换了种展示 */
      if (restore) restore.textContent = index + 1 + " / " + pages.length;
    };

    const goToPage = function (index) {
      const sheet = pages[Math.max(0, Math.min(pages.length - 1, index))];
      if (!sheet) return;
      const delta = sheet.getBoundingClientRect().top - content.getBoundingClientRect().top;
      content.scrollTo({
        top: content.scrollTop + delta,
        behavior: reduceMotion() ? "auto" : "smooth",
      });
    };

    prevButton?.addEventListener("click", function () {
      goToPage(currentPage() - 1);
    });
    nextButton?.addEventListener("click", function () {
      goToPage(currentPage() + 1);
    });
    content.addEventListener("scroll", syncPage, { passive: true });
    syncPage();

    /* 缩放：六档，改的是 .reader-sheet 的 zoom（见 reader.css），文字跟着重排 */
    const zoomLevels = [50, 75, 100, 125, 150, 200];
    let zoomIndex = zoomLevels.indexOf(100);
    const zoomLabel = pick("[data-reader-zoom-label]");
    const zoomOut = pick("[data-reader-zoom-out]");
    const zoomIn = pick("[data-reader-zoom-in]");

    const applyZoom = function () {
      const level = zoomLevels[zoomIndex];
      content.style.setProperty("--reader-zoom", String(level / 100));
      if (zoomLabel) zoomLabel.textContent = level + "%";
      if (zoomOut) zoomOut.disabled = zoomIndex === 0;
      if (zoomIn) zoomIn.disabled = zoomIndex === zoomLevels.length - 1;
      syncPage();
    };

    const stepZoom = function (step) {
      const next = zoomIndex + step;
      if (next < 0 || next > zoomLevels.length - 1) return;
      /* 以当前页为锚：缩放后滚回同一张纸，视线不丢 */
      const anchor = currentPage();
      zoomIndex = next;
      applyZoom();
      goToPage(anchor);
    };

    zoomOut?.addEventListener("click", function () {
      stepZoom(-1);
    });
    zoomIn?.addEventListener("click", function () {
      stepZoom(1);
    });
    applyZoom();

    /* 阅读背景：深底（默认）↔ 浅底 */
    const contrast = pick("[data-reader-contrast]");
    contrast?.addEventListener("click", function () {
      const light = content.classList.toggle("is-light-bg");
      contrast.setAttribute("aria-pressed", String(light));
    });

    /* 全屏 */
    const fullscreen = pick("[data-reader-fullscreen]");
    fullscreen?.addEventListener("click", function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen?.();
      }
    });
    document.addEventListener("fullscreenchange", function () {
      fullscreen?.setAttribute("aria-pressed", String(Boolean(document.fullscreenElement)));
    });

    /* 收起 / 展开：收起后工具栏缩到左侧，只剩阅读进度。
       隐藏会连带移出 Tab 顺序，所以焦点要跟着在「收起」与「展开」之间搬 */
    const minimize = pick("[data-reader-minimize]");

    const setMinimized = function (minimized) {
      toolbar.classList.toggle("is-minimized", minimized);
      if (minimized) restore?.focus();
      else minimize?.focus();
    };

    minimize?.addEventListener("click", function () {
      setMinimized(true);
    });
    restore?.addEventListener("click", function () {
      setMinimized(false);
    });
  }

  /* ---------- 未登录：只放行第一页 ---------- */
  const isGuest = function () {
    return !(window.SKAuth && window.SKAuth.getUser());
  };

  let gate = null;

  if (content && pages.length > 1) {
    gate = document.createElement("section");
    gate.className = "reader-gate";
    gate.hidden = true;
    gate.innerHTML =
      '<p class="reader-gate__text">还有 <strong data-reader-gate-count>0</strong> 页未读，请登录后查看全文</p>' +
      '<button class="btn btn-primary" type="button" data-auth-open>登录 / 注册</button>';
    pages[0].after(gate);
    const countNode = gate.querySelector("[data-reader-gate-count]");
    /* 本页演示文档是静态多页；真实接入后这里换成真实总页数 */
    if (countNode) countNode.textContent = String(pages.length - 1);
  }

  /* 登录态随时可能变（弹窗里登录成功会派发 sk:auth-changed），整页跟着解锁/锁上。
     本页不加载 workbench.js，所以 data-auth-only 由这里自己同步 */
  const syncGate = function () {
    const guest = isGuest();
    document.body.classList.toggle("is-guest", guest);
    if (gate) gate.hidden = !guest;
    document.querySelectorAll("[data-auth-only]").forEach(function (node) {
      node.hidden = guest;
    });
  };
  syncGate();
  document.addEventListener("sk:auth-changed", syncGate);

  /* ---------- 下载：未登录先登录；登录后导出正文 ----------
     演示环境没有真实文件流，把当前文档的正文拼成 txt 下载（文件名沿用当前名字） */
  const exportDocument = function () {
    const blocks = [];
    pages.forEach(function (sheet, index) {
      if (index > 0) blocks.push("");
      sheet.querySelectorAll("h2, h3, p").forEach(function (node) {
        const text = node.textContent.trim();
        if (text) blocks.push(text);
      });
    });

    /* 开头补 BOM：Windows 记事本/Excel 打开中文 txt 不会乱码 */
    const blob = new Blob(["\ufeff" + blocks.join("\n\n") + "\n"], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = baseNameOf(fileName) + ".txt";
    document.body.append(link);
    link.click();
    link.remove();
    /* 立刻 revoke 会让部分浏览器中断下载，延后一点再释放 */
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
    window.SKApp?.showToast?.("已开始下载");
  };

  document.querySelector("[data-reader-download]")?.addEventListener("click", function () {
    if (isGuest()) {
      window.SKAuth?.open?.();
      return;
    }
    exportDocument();
  });

  /* ---------- 收藏：与知识联盟、我的知识共用同一份收藏数据 ---------- */
  const FAVORITES_KEY = "sheke-v4-community-favorites";

  const readFavorites = function () {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const writeFavorites = function (list) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    } catch {}
  };
  /* 同一份文件在知识联盟那边收藏过（那边 id 是 shared-N），所以按文件名认，不认 id */
  const favoriteIndexOf = function (list, name) {
    return list.findIndex(function (item) {
      return item.name === name;
    });
  };
  const favoriteTime = function () {
    const pad = function (value) {
      return String(value).padStart(2, "0");
    };
    const now = new Date();
    return pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes());
  };

  const favoriteButton = document.querySelector("[data-reader-favorite]");

  const syncFavorite = function () {
    if (!favoriteButton) return;
    const active = favoriteIndexOf(readFavorites(), fileName) >= 0;
    favoriteButton.classList.toggle("is-favorite", active);
    favoriteButton.setAttribute("aria-pressed", String(active));
    favoriteButton.setAttribute("aria-label", active ? "取消收藏" : "收藏");
  };

  favoriteButton?.addEventListener("click", function () {
    const favorites = readFavorites();
    const index = favoriteIndexOf(favorites, fileName);
    if (index >= 0) {
      favorites.splice(index, 1);
      window.SKApp?.showToast?.("已取消收藏");
    } else {
      favorites.push({
        id: "reader-" + fileName,
        name: fileName,
        type: extensionOf(fileName).replace(".", "").toUpperCase() || "文件",
        size: "",
        org: ownerName,
        topic: "",
        description: "",
        time: normalizeTime(params.get("time")),
        favoritedAt: favoriteTime(),
      });
      window.SKApp?.showToast?.("已收藏到我的知识");
    }
    writeFavorites(favorites);
    syncFavorite();
  });
  syncFavorite();

  /* ---------- 重命名：只改名字，扩展名保留（与「我的知识」的重命名同口径） ---------- */
  const renameDialog = document.querySelector("[data-reader-rename-dialog]");
  const renameForm = document.querySelector("[data-reader-rename-form]");
  const renameInput = document.querySelector("[data-reader-rename-input]");

  document.querySelector("[data-reader-rename]")?.addEventListener("click", function () {
    if (!renameDialog || !renameInput) return;
    renameInput.value = baseNameOf(fileName);
    renameDialog.showModal();
    renameInput.focus();
    /* 光标落在末尾，不要全选：全选时第一次敲字会把原名整个覆盖掉 */
    renameInput.setSelectionRange(renameInput.value.length, renameInput.value.length);
  });

  document.querySelector("[data-reader-rename-cancel]")?.addEventListener("click", function () {
    renameDialog?.close();
  });

  renameForm?.addEventListener("submit", function (event) {
    event.preventDefault();
    const next = renameInput.value.trim();
    if (!next) {
      window.SKApp?.showToast?.("请输入文件名称");
      renameInput.focus();
      return;
    }
    const extension = extensionOf(fileName);
    const fullName =
      extension && !next.toLowerCase().endsWith(extension.toLowerCase()) ? next + extension : next;
    const renames = readRenames();
    renames[originalFileName] = fullName;
    writeRenames(renames);
    fileName = fullName;
    applyFileName(fileName);
    renameDialog.close();
    /* 收藏是按文件名认的，名字变了要重新对一次 */
    syncFavorite();
    window.SKApp?.showToast?.("文件名称已更新");
  });
})();
