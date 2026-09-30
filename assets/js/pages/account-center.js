(function () {
  "use strict";

  /* 登录校验：账户中心只对已登录用户开放。
     未登录（含退出后按浏览器返回、从 bfcache 恢复的情况）一律回官网首页。
     校验必须等 DOMContentLoaded——SKAuth 由 auth.js 在那一刻才挂到 window 上 */
  const requireLogin = function () {
    if (window.SKAuth?.getUser()) return;
    window.location.replace("../index.html");
  };

  document.addEventListener("DOMContentLoaded", requireLogin);
  window.addEventListener("pageshow", function (event) {
    /* persisted 为 true 说明页面是从往返缓存里恢复的，脚本不会重跑 */
    if (event.persisted) requireLogin();
  });
  document.addEventListener("sk:auth-changed", function () {
    if (!window.SKAuth?.getUser()) requireLogin();
  });

  /* 菜单切换：按钮 data-account-tab 与面板 data-account-panel 一一对应。
     选中的菜单记在本地，刷新后仍停在上次那一项；没有记录或记录已失效时停在第一项 */
  const ACCOUNT_TAB_KEY = "sheke-account-tab";
  const tabs = Array.from(document.querySelectorAll("[data-account-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-account-panel]"));

  const activateTab = function (name, options) {
    tabs.forEach(function (tab) {
      const active = tab.dataset.accountTab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.accountPanel !== name;
    });
    /* 深链打开的那一次不写记忆：否则从工作台跳到指定菜单，
       会把另一个标签页里用户自己记下的访问状态一起覆盖掉 */
    if (options && options.remember === false) return;
    try {
      localStorage.setItem(ACCOUNT_TAB_KEY, name);
    } catch (error) {
      /* 隐私模式等写不了本地存储，忽略即可，不影响切换 */
    }
  };

  /* 用户在页内换过菜单后，把地址栏的 ?tab= 深链参数摘掉：
     之后刷新 / 重开跟随记住的那一项，而不是跳回深链指定的菜单 */
  const dropTabParam = function () {
    if (!new URLSearchParams(window.location.search).has("tab")) return;
    window.history.replaceState(null, "", window.location.pathname + window.location.hash);
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateTab(tab.dataset.accountTab);
      dropTabParam();
    });
  });

  if (tabs.length) {
    let initialTab = tabs[0].dataset.accountTab;
    /* 地址栏 ?tab= 优先（设置页「积分余额」等入口直接落到指定菜单），
       其次用上次记住的，最后才是默认第一项 */
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl && tabs.some(function (tab) { return tab.dataset.accountTab === fromUrl; })) {
      initialTab = fromUrl;
    } else {
      try {
        const saved = localStorage.getItem(ACCOUNT_TAB_KEY);
        if (saved && tabs.some(function (tab) { return tab.dataset.accountTab === saved; })) {
          initialTab = saved;
        }
      } catch (error) {
        /* 读不到就用默认项 */
      }
    }
    activateTab(initialTab, { remember: !(fromUrl && initialTab === fromUrl) });
  }

  /* 用户名跟随登录态，取值与壳层（workbench.js 的 syncAuthState）保持一致。
     侧栏、个人总览标题、账户信息里的用户名都挂同一个钩子，统一刷；
     用户在「编辑用户名」里改过名字后以存下来的 name 为准 */
  const nameNodes = document.querySelectorAll("[data-account-name]");
  const syncAccountName = function () {
    const user = window.SKAuth?.getUser();
    const name = user ? user.name || "社科研究员" : "陌生研究员";
    nameNodes.forEach(function (node) {
      node.textContent = name;
    });
  };
  syncAccountName();
  document.addEventListener("sk:auth-changed", syncAccountName);

  /* 未登录时 auth.js 会把手机号写成空串，这里兜一个占位文案 */
  const phoneNode = document.querySelector("[data-user-phone]");
  const syncPhone = function () {
    if (phoneNode && !phoneNode.textContent.trim()) phoneNode.textContent = "未绑定手机号";
  };
  syncPhone();
  document.addEventListener("sk:auth-changed", syncPhone);

  /* 账户 ID 复制 */
  const copyButton = document.querySelector("[data-copy-account-id]");
  if (copyButton) {
    copyButton.addEventListener("click", function () {
      const idNode = document.querySelector("[data-account-id]");
      const id = idNode ? idNode.textContent.trim() : "";
      if (!id) return;
      navigator.clipboard?.writeText(id).then(
        function () {
          window.SKApp.showToast("账户 ID 已复制");
        },
        function () {
          window.SKApp.showToast("复制失败，请手动选择");
        }
      );
    });
  }

  /* 个人总览的活跃度日历：近 12 个月，一列一周（周一起）。
     目前是演示数据——只有当前月随机出深浅两档，其余月份一律留空 */
  const heatGrid = document.querySelector("[data-account-heatmap]");
  const heatMonths = document.querySelector("[data-account-heatmap-months]");

  const levelOf = function (date) {
    const now = new Date();
    if (date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth()) return 0;
    return Math.random() < 0.5 ? 1 : 2;
  };

  const renderHeatmap = function () {
    if (!heatGrid || !heatMonths) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // 回退到当周周一

    const weeks = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const week = [];
      for (let day = 0; day < 7; day += 1) {
        week.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    weeks.forEach(function (week) {
      week.forEach(function (date) {
        const cell = document.createElement("span");
        cell.className = "account-heatmap__cell";
        cell.dataset.level = String(date > today ? 0 : levelOf(date));
        heatGrid.append(cell);
      });
    });

    /* 月份标签落在该月 1 号所在的那一列，向右铺到下一个月为止 */
    const labels = [];
    weeks.forEach(function (week, index) {
      const monthStart = week.find(function (date) {
        return date.getDate() === 1;
      });
      /* 最后一列会跨到下个月，别给未来月份也打标签 */
      if (monthStart && monthStart <= today) labels.push({ index: index, text: monthStart.getMonth() + 1 + "月" });
    });
    labels.forEach(function (label, i) {
      const span = (i + 1 < labels.length ? labels[i + 1].index : weeks.length) - label.index;
      const node = document.createElement("span");
      node.className = "account-heatmap__month";
      node.textContent = label.text;
      node.style.gridColumn = label.index + 1 + " / span " + span;
      heatMonths.append(node);
    });
  };

  renderHeatmap();

  /* 筛选控件（积分用量的时间维度、知识贡献的类型与时间维度）：
     每个实例各自管自己的菜单，点选项打勾、点外面或 Esc 收起 */
  const openFilters = [];

  document.querySelectorAll("[data-filter]").forEach(function (filter) {
    const trigger = filter.querySelector("[data-filter-trigger]");
    const menu = filter.querySelector("[data-filter-menu]");
    const valueNode = filter.querySelector("[data-filter-value]");
    const options = Array.from(filter.querySelectorAll("[data-filter-option]"));
    if (!trigger || !menu || !valueNode) return;

    const setOpen = function (open) {
      menu.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      if (open) {
        /* 同一时间只留一个筛选菜单开着 */
        openFilters.forEach(function (other) {
          if (other.close !== setOpen) other.close(false);
        });
      }
    };

    trigger.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(menu.hidden);
    });

    options.forEach(function (option) {
      option.addEventListener("click", function (event) {
        event.stopPropagation();
        valueNode.textContent = option.dataset.filterOption;
        options.forEach(function (item) {
          const selected = item === option;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-selected", String(selected));
        });
        setOpen(false);
      });
    });

    openFilters.push({ close: setOpen });
  });

  document.addEventListener("click", function (event) {
    openFilters.forEach(function (item) {
      item.close(false, event);
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    openFilters.forEach(function (item) {
      item.close(false);
    });
  });

  /* ---------- 消息中心 ----------
     数据与已读状态在 assets/js/messages.js（window.SKMessages），与工作台铃铛共用；
     列表、筛选、展开、全部已读都在这里渲染与联动 */
  const messageList = document.querySelector("[data-message-list]");
  const messageEmpty = document.querySelector("[data-message-empty]");
  const messageUnreadCount = document.querySelector("[data-message-unread-count]");
  const messageReadAll = document.querySelector("[data-message-read-all]");
  const messageScopeFilter = document.querySelector("[data-message-scope-filter]");
  const messageTypeFilter = document.querySelector("[data-message-type-filter]");

  let messageScope = "all"; // all | unread
  let messageType = "全部";
  const expandedMessages = new Set();

  /* 每页 10 条：左下角总数、右下角页码（不设上一页 / 下一页） */
  const MESSAGE_PAGE_SIZE = 10;
  let messagePage = 1;
  const messageFooter = document.querySelector("[data-message-footer]");
  const messageTotal = document.querySelector("[data-message-total]");
  const messagePager = document.querySelector("[data-message-pager]");

  const syncMessageCount = function () {
    const count = window.SKMessages ? window.SKMessages.unreadCount() : 0;
    if (messageUnreadCount) {
      messageUnreadCount.textContent = count ? count + " 条未读" : "暂无未读消息";
    }
    if (messageReadAll) messageReadAll.disabled = count === 0;
  };

  const buildMessageRow = function (message) {
    const row = document.createElement("article");
    row.className = "account-message" + (message.read ? "" : " is-unread");
    row.dataset.messageId = message.id;

    const head = document.createElement("button");
    head.className = "account-message__head";
    head.type = "button";

    const dot = document.createElement("span");
    dot.className = "account-message__dot";
    dot.setAttribute("aria-hidden", "true");

    const icon = document.createElement("span");
    icon.className = "account-message__icon";
    icon.dataset.icon = message.icon;
    icon.setAttribute("aria-hidden", "true");

    const title = document.createElement("strong");
    title.className = "account-message__title";
    title.textContent = message.title;

    const summary = document.createElement("span");
    summary.className = "account-message__summary";
    summary.textContent = message.summary;

    /* 标题 + 摘要合成一列，摘要窄屏下省略 */
    const copy = document.createElement("span");
    copy.className = "account-message__copy";
    copy.append(title, summary);

    const tag = document.createElement("span");
    tag.className = "account-message__tag";
    tag.textContent = message.type;

    const time = document.createElement("time");
    time.className = "account-message__time";
    time.textContent = message.time;

    const chevron = document.createElement("span");
    chevron.className = "account-message__chevron";
    chevron.dataset.icon = "chevron-down";
    chevron.setAttribute("aria-hidden", "true");

    head.append(dot, icon, copy, tag, time, chevron);

    const body = document.createElement("div");
    body.className = "account-message__body";
    body.id = "accountMessageBody-" + message.id;
    body.hidden = !expandedMessages.has(message.id);

    head.setAttribute("aria-expanded", String(!body.hidden));
    head.setAttribute("aria-controls", body.id);

    const bodyText = document.createElement("p");
    bodyText.textContent = message.body;
    body.append(bodyText);

    row.append(head, body);
    if (!body.hidden) row.classList.add("is-open");
    return row;
  };

  const renderMessagePager = function (total, pageCount) {
    if (messageFooter) messageFooter.hidden = total === 0;
    if (messageTotal) messageTotal.textContent = "共 " + total + " 条消息";
    if (!messagePager) return;

    messagePager.replaceChildren();
    if (total === 0) return;

    for (let page = 1; page <= pageCount; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(page);
      button.classList.toggle("is-active", page === messagePage);
      button.setAttribute("aria-current", page === messagePage ? "page" : "false");
      button.addEventListener("click", function () {
        messagePage = page;
        renderMessages();
        messageList?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
      messagePager.append(button);
    }
  };

  const renderMessages = function () {
    if (!messageList || !window.SKMessages) return;

    const filtered = window.SKMessages.all().filter(function (message) {
      if (messageScope === "unread" && message.read) return false;
      return messageType === "全部" || message.type === messageType;
    });

    const pageCount = Math.max(1, Math.ceil(filtered.length / MESSAGE_PAGE_SIZE));
    if (messagePage > pageCount) messagePage = pageCount;
    const start = (messagePage - 1) * MESSAGE_PAGE_SIZE;
    const visible = filtered.slice(start, start + MESSAGE_PAGE_SIZE);

    messageList.replaceChildren.apply(messageList, visible.map(buildMessageRow));
    messageList.hidden = visible.length === 0;
    if (messageEmpty) {
      messageEmpty.hidden = visible.length > 0;
      messageEmpty.textContent =
        messageScope === "unread" && messageType === "全部"
          ? "暂无未读消息"
          : "没有符合条件的消息";
    }
    window.SKIcons?.hydrate(messageList);
    renderMessagePager(filtered.length, pageCount);
    syncMessageCount();
  };

  /* 两个下拉（状态 / 类型）的选中态与收起由上面通用的筛选控件负责，这里只接「选完重渲染」 */
  messageScopeFilter?.querySelectorAll("[data-filter-option]").forEach(function (option) {
    option.addEventListener("click", function () {
      messageScope = option.dataset.filterOption === "未读" ? "unread" : "all";
      messagePage = 1;
      renderMessages();
    });
  });

  messageTypeFilter?.querySelectorAll("[data-filter-option]").forEach(function (option) {
    option.addEventListener("click", function () {
      messageType = option.dataset.filterOption;
      messagePage = 1;
      renderMessages();
    });
  });

  messageReadAll?.addEventListener("click", function () {
    if (!window.SKMessages) return;
    window.SKMessages.markAllRead();
    renderMessages();
    window.SKApp.showToast("已全部标记为已读");
  });

  messageList?.addEventListener("click", function (event) {
    const head = event.target.closest(".account-message__head");
    if (!head) return;
    const row = head.closest("[data-message-id]");
    const body = row ? row.querySelector(".account-message__body") : null;
    if (!row || !body) return;

    const open = body.hidden; // 即将展开
    body.hidden = !open;
    row.classList.toggle("is-open", open);
    head.setAttribute("aria-expanded", String(open));

    if (open) {
      expandedMessages.add(row.dataset.messageId);
      /* 展开即已读；在「未读」档里不立刻抽走这一行，等下次筛选时自然消失 */
      if (row.classList.contains("is-unread")) {
        window.SKMessages.markRead(row.dataset.messageId);
        row.classList.remove("is-unread");
        syncMessageCount();
      }
    } else {
      expandedMessages.delete(row.dataset.messageId);
    }
  });

  renderMessages();

  /* 积分用量的柱状图：9/1–9/30 每天的消费额度，演示数据；
     单柱实心（不再分上下两段），高度按满刻度 70 折算 */
  const CHART_MAX = 70;
  const usageByDay = [1, 0, 2, 0, 5, 3, 3, 4, 30, 26, 22, 14, 62, 18, 14, 22, 8, 6, 12, 8, 22, 35, 12, 4, 6, 2, 28, 8, 6, 9];
  const usageBars = document.querySelector("[data-usage-bars]");

  if (usageBars) {
    usageByDay.forEach(function (total) {
      const bar = document.createElement("span");
      bar.className = "account-chart-bar";
      bar.style.height = (total / CHART_MAX) * 100 + "%";

      const part = document.createElement("i");
      part.className = "account-chart-bar__part is-bottom";
      part.style.height = "100%";
      bar.append(part);
      usageBars.append(bar);
    });
  }

  /* 知识贡献的柱状趋势：默认近 30 天，右上角在「文档 / 浏览」两套数据间切换 */
  const TREND_SERIES = {
    docs: { label: "文档", max: 40, values: [3, 5, 2, 6, 4, 8, 5, 3, 9, 7, 6, 10, 8, 5, 7, 12, 9, 6, 4, 8, 11, 7, 5, 9, 6, 3, 8, 10, 7, 5] },
    views: { label: "浏览", max: 120, values: [36, 58, 24, 74, 52, 96, 70, 40, 110, 88, 76, 118, 92, 56, 80, 120, 104, 66, 34, 78, 108, 72, 50, 94, 60, 28, 84, 102, 68, 46] },
  };
  const trendBars = document.querySelector("[data-trend-bars]");
  const trendAxis = document.querySelector("[data-trend-axis]");
  const trendTabs = Array.from(document.querySelectorAll("[data-trend-tab]"));

  const renderTrend = function (key) {
    if (!trendBars || !TREND_SERIES[key]) return;
    const series = TREND_SERIES[key];

    trendBars.replaceChildren();
    series.values.forEach(function (value) {
      const bar = document.createElement("span");
      bar.className = "account-chart-bar";
      bar.style.height = (value / series.max) * 100 + "%";

      const part = document.createElement("i");
      part.className = "account-chart-bar__part is-bottom";
      part.style.height = "100%";
      bar.append(part);
      trendBars.append(bar);
    });

    if (trendAxis) {
      const labels = trendAxis.querySelectorAll("span");
      if (labels.length === 3) {
        labels[0].textContent = String(series.max);
        labels[1].textContent = String(Math.round(series.max / 2));
        labels[2].textContent = "0";
      }
    }

    trendBars.setAttribute("aria-label", "近 30 天" + series.label + "数量柱状趋势图");
  };

  trendTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      trendTabs.forEach(function (item) {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderTrend(tab.dataset.trendTab);
    });
  });

  renderTrend("docs");

  /* ---------- 积分中心：积分趋势（模式 消耗/获取 × 时间维度，两者联动） ---------- */
  /* 消耗侧按分项拆，获取侧按来源拆；获取侧整体用绿色，与消耗的橙色区分开。
     每段数据带自己的刻度上限（获取的量级比消耗大，共用一条轴会把柱子顶出去） */
  const POINTS_TREND_MODES = {
    spend: {
      caption: "消耗合计",
      labels: ["基础会话", "项目会话", "联网搜索", "智能体", "文档下载"],
      series: {
        "近 7 天": { total: 84, max: 60, values: [30, 18, 12, 10, 14] },
        "近 30 天": { total: 312, max: 120, values: [98, 64, 42, 56, 52] },
        本月: { total: 119, max: 60, values: [46, 22, 16, 19, 16] },
      },
    },
    gain: {
      caption: "获取合计",
      labels: ["任务", "知识共享", "用户下载", "用户收藏"],
      series: {
        "近 7 天": { total: 162, max: 100, values: [80, 45, 25, 12] },
        "近 30 天": { total: 660, max: 400, values: [320, 180, 120, 40] },
        本月: { total: 256, max: 150, values: [120, 70, 50, 16] },
      },
    },
  };

  const pointsTrendChart = document.querySelector("[data-points-trend-chart]");
  const pointsTrendAxis = document.querySelector("[data-points-trend-axis]");
  const pointsTrendBars = document.querySelector("[data-points-trend-bars]");
  const pointsTrendTicks = document.querySelector("[data-points-trend-ticks]");
  const pointsTrendTotal = document.querySelector("[data-points-trend-total]");
  const pointsTrendCaption = document.querySelector("[data-points-trend-caption]");
  const pointsTrendFilter = document.querySelector("[data-points-trend-filter]");
  const pointsTrendModes = Array.from(document.querySelectorAll("[data-points-trend-mode]"));

  let pointsTrendMode = "spend";
  let pointsTrendRange = "近 30 天";

  const renderPointsTrend = function () {
    const mode = POINTS_TREND_MODES[pointsTrendMode];
    const series = mode?.series[pointsTrendRange];
    if (!pointsTrendBars || !mode || !series) return;

    pointsTrendBars.replaceChildren();
    series.values.forEach(function (value, index) {
      const bar = document.createElement("span");
      bar.className = "account-chart-bar";
      bar.style.height = (value / series.max) * 100 + "%";
      bar.title = mode.labels[index] + " " + value + " 积分";

      const part = document.createElement("i");
      part.className = "account-chart-bar__part is-bottom";
      part.style.height = "100%";
      bar.append(part);
      pointsTrendBars.append(bar);
    });

    if (pointsTrendAxis) {
      const labels = pointsTrendAxis.querySelectorAll("span");
      if (labels.length === 3) {
        labels[0].textContent = String(series.max);
        labels[1].textContent = String(Math.round(series.max / 2));
        labels[2].textContent = "0";
      }
    }

    if (pointsTrendTicks) {
      pointsTrendTicks.replaceChildren.apply(
        pointsTrendTicks,
        mode.labels.map(function (label) {
          const span = document.createElement("span");
          span.textContent = label;
          return span;
        }),
      );
      /* 获取侧只有三列，按数量铺，别留空列 */
      pointsTrendTicks.style.gridTemplateColumns = "repeat(" + mode.labels.length + ", minmax(0, 1fr))";
    }
    if (pointsTrendTotal) pointsTrendTotal.textContent = String(series.total);
    if (pointsTrendCaption) pointsTrendCaption.textContent = mode.caption;
    pointsTrendChart?.classList.toggle("is-gain", pointsTrendMode === "gain");
    pointsTrendBars.setAttribute(
      "aria-label",
      pointsTrendRange + mode.caption.replace("合计", "") + "积分：" + mode.labels.join("、") + "，合计 " + series.total,
    );
  };

  pointsTrendModes.forEach(function (tab) {
    tab.addEventListener("click", function () {
      pointsTrendMode = tab.dataset.pointsTrendMode;
      pointsTrendModes.forEach(function (item) {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderPointsTrend();
    });
  });

  /* 时间下拉的选中态与收起由通用筛选控件负责，这里只接「选完重渲染」 */
  pointsTrendFilter?.querySelectorAll("[data-filter-option]").forEach(function (option) {
    option.addEventListener("click", function () {
      pointsTrendRange = option.dataset.filterOption;
      renderPointsTrend();
    });
  });

  renderPointsTrend();

  /* ---------- 积分中心：积分明细（消耗为负、获取为正，混排；每页 10 条 + 时间维度筛选） ----------
     时间为「几天前 + 具体时刻」，日期按当天倒推算出，免得写死的日期跟「本月」筛选对不上；
     amount 带符号，balance 是这笔之后的余额，从最新一笔的 4268 往前逐笔回推，链条自洽 */
  const POINTS_RECORDS = [
    { daysAgo: 0, clock: "09:12", item: "社科助手对话 15 轮", type: "基础会话", amount: -30, balance: 4268 },
    { daysAgo: 1, clock: "16:40", item: "联网搜索 12 次", type: "联网搜索", amount: -12, balance: 4298 },
    { daysAgo: 1, clock: "10:12", item: "每日签到", type: "任务", amount: 5, balance: 4310 },
    { daysAgo: 2, clock: "16:40", item: "共享资料被下载 6 次", type: "用户下载", amount: 6, balance: 4305 },
    { daysAgo: 3, clock: "10:05", item: "项目内对话 4 轮", type: "项目会话", amount: -8, balance: 4299 },
    { daysAgo: 4, clock: "15:22", item: "下载联盟文档 4 份", type: "文档下载", amount: -16, balance: 4307 },
    { daysAgo: 4, clock: "09:20", item: "资料被成员收藏 16 次", type: "用户收藏", amount: 8, balance: 4323 },
    { daysAgo: 5, clock: "11:48", item: "荆楚智研 3 次", type: "智能体", amount: -30, balance: 4315 },
    { daysAgo: 6, clock: "16:48", item: "共享资料通过审核", type: "知识共享", amount: 50, balance: 4345 },
    { daysAgo: 7, clock: "09:31", item: "社科助手对话 20 轮", type: "基础会话", amount: -40, balance: 4295 },
    { daysAgo: 8, clock: "14:10", item: "联网搜索 8 次", type: "联网搜索", amount: -8, balance: 4335 },
    { daysAgo: 8, clock: "11:20", item: "每日签到", type: "任务", amount: 5, balance: 4343 },
    { daysAgo: 9, clock: "17:55", item: "项目内对话 15 轮", type: "项目会话", amount: -30, balance: 4338 },
    { daysAgo: 10, clock: "10:26", item: "下载联盟文档 3 份", type: "文档下载", amount: -12, balance: 4368 },
    { daysAgo: 11, clock: "16:12", item: "荆楚智审 2 次", type: "智能体", amount: -16, balance: 4380 },
    { daysAgo: 12, clock: "09:40", item: "联网搜索 5 次", type: "联网搜索", amount: -5, balance: 4396 },
    { daysAgo: 14, clock: "15:03", item: "社科助手对话 15 轮", type: "基础会话", amount: -30, balance: 4401 },
  ];
  const POINTS_RECORD_PAGE_SIZE = 10;

  const pointsRecordBody = document.querySelector("[data-points-record-body]");
  const pointsRecordTotal = document.querySelector("[data-points-record-total]");
  const pointsRecordPager = document.querySelector("[data-points-record-pager]");
  const pointsRecordFilter = document.querySelector("[data-points-record-filter]");
  let pointsRecordPage = 1;
  let pointsRecordRange = "近 30 天";

  const pad2 = function (value) {
    return String(value).padStart(2, "0");
  };

  /* 把「几天前」折成 MM-DD HH:MM；「本月」按自然月判定 */
  const recordDate = function (record) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - record.daysAgo);
    return date;
  };

  const recordTimeText = function (record) {
    const date = recordDate(record);
    return pad2(date.getMonth() + 1) + "-" + pad2(date.getDate()) + " " + record.clock;
  };

  const recordInRange = function (record) {
    if (pointsRecordRange === "本月") {
      const date = recordDate(record);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return record.daysAgo <= (pointsRecordRange === "近 7 天" ? 7 : 30);
  };

  const renderPointsRecords = function () {
    if (!pointsRecordBody) return;

    const visible = POINTS_RECORDS.filter(recordInRange);
    const pageCount = Math.max(1, Math.ceil(visible.length / POINTS_RECORD_PAGE_SIZE));
    if (pointsRecordPage > pageCount) pointsRecordPage = pageCount;
    const start = (pointsRecordPage - 1) * POINTS_RECORD_PAGE_SIZE;

    pointsRecordBody.replaceChildren.apply(
      pointsRecordBody,
      visible.slice(start, start + POINTS_RECORD_PAGE_SIZE).map(function (record) {
        const row = document.createElement("div");
        row.className = "account-table__row";
        const gain = record.amount > 0;
        [recordTimeText(record), record.item, record.type, (gain ? "+" : "") + record.amount, String(record.balance)].forEach(
          function (text, index) {
            const cell = document.createElement("span");
            cell.textContent = text;
            if (index >= 3) cell.classList.add("account-table__num");
            /* 积分列按方向着色：消耗用主色调、获取用蓝色，一眼分得开 */
            if (index === 3) cell.classList.add(gain ? "account-table__gain" : "account-table__spend");
            row.append(cell);
          },
        );
        return row;
      }),
    );

    if (pointsRecordTotal) pointsRecordTotal.textContent = "共 " + visible.length + " 条记录";
    if (!pointsRecordPager) return;

    pointsRecordPager.replaceChildren();
    for (let page = 1; page <= pageCount; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(page);
      button.classList.toggle("is-active", page === pointsRecordPage);
      button.setAttribute("aria-current", page === pointsRecordPage ? "page" : "false");
      button.addEventListener("click", function () {
        pointsRecordPage = page;
        renderPointsRecords();
      });
      pointsRecordPager.append(button);
    }
  };

  /* 时间维度：换范围回到第 1 页再渲染 */
  pointsRecordFilter?.querySelectorAll("[data-filter-option]").forEach(function (option) {
    option.addEventListener("click", function () {
      pointsRecordRange = option.dataset.filterOption;
      pointsRecordPage = 1;
      renderPointsRecords();
    });
  });

  renderPointsRecords();

  /* ---------- 积分中心：规则弹窗 / 个人总览：订阅弹窗 ---------- */
  const pointsRulesDialog = document.querySelector("[data-dialog-points-rules]");
  const subscribeDialog = document.querySelector("[data-dialog-subscribe]");

  document.querySelector("[data-points-rules-open]")?.addEventListener("click", function () {
    pointsRulesDialog?.showModal();
  });

  document.querySelectorAll("[data-subscribe-open]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      subscribeDialog?.showModal();
    });
  });

  document.querySelector("[data-bill-download]")?.addEventListener("click", function () {
    window.SKApp.showToast("发票下载入口将在后续接入");
  });

  /* ---------- 任务中心：签到 ---------- */
  const taskCheckin = document.querySelector("[data-task-checkin]");
  const taskCheckinButton = document.querySelector("[data-task-checkin-button]");
  const taskCheckinDays = document.querySelector("[data-task-checkin-days]");

  taskCheckinButton?.addEventListener("click", function () {
    if (taskCheckinButton.disabled) return;
    taskCheckinButton.disabled = true;
    taskCheckinButton.textContent = "今日已签到";
    if (taskCheckinDays) taskCheckinDays.textContent = String(Number(taskCheckinDays.textContent) + 1);
    window.SKApp.showToast("签到成功，+5 成长积分");
  });

  /* ---------- 任务中心：当前任务列表 ---------- */
  /* 任务条目与积分规则弹窗里的「获取积分」逐条对应，数值同源 */
  const TASKS = [
    { icon: "check", title: "每日签到", desc: "签到得 5 成长积分，连续 7 天当日额外 +20", reward: 5, action: { label: "去签到", type: "checkin" } },
    { icon: "upload", title: "共享 1 份资料", desc: "上传资料并通过审核，每份资料只计一次", reward: 50, action: { label: "去共享", type: "link", href: "./knowledge-alliance.html" } },
    { icon: "sparkles", title: "完成 1 次深度研究", desc: "在社科助手里发起一次深度研究", reward: 30, action: { label: "去研究", type: "link", href: "./research-assistant.html" } },
    { icon: "star", title: "资料被成员收藏", desc: "每 2 次收藏 +1 积分，本月 12/30，单份每月上限 30", reward: 1, action: { label: "进行中 12/30", type: "disabled" } },
    { icon: "download", title: "资料被成员下载", desc: "每次下载 +1 积分，本月 18/60，同一成员不重复计", reward: 1, action: { label: "进行中 18/60", type: "disabled" } },
  ];

  const taskList = document.querySelector("[data-task-list]");

  const buildTaskAction = function (task) {
    const config = task.action;
    if (config.type === "link") {
      const link = document.createElement("a");
      link.className = "btn btn-outline btn-sm";
      link.href = config.href;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = config.label;
      return link;
    }

    const button = document.createElement("button");
    button.className = "btn btn-outline btn-sm";
    button.type = "button";
    button.textContent = config.label;
    if (config.type === "disabled") {
      button.disabled = true;
      return button;
    }
    /* 目前只有签到用普通按钮（type: checkin），点它滚到上方的签到卡并把焦点交给签到键 */
    button.addEventListener("click", function () {
      taskCheckin?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
      window.setTimeout(function () {
        taskCheckinButton?.focus();
      }, 300);
    });
    return button;
  };

  if (taskList) {
    taskList.replaceChildren.apply(
      taskList,
      TASKS.map(function (task) {
        const row = document.createElement("div");
        row.className = "account-task";

        const icon = document.createElement("span");
        icon.className = "account-task__icon";
        icon.dataset.icon = task.icon;
        icon.setAttribute("aria-hidden", "true");

        const copy = document.createElement("span");
        copy.className = "account-task__copy";
        const title = document.createElement("strong");
        title.textContent = task.title;
        const desc = document.createElement("small");
        desc.textContent = task.desc;
        copy.append(title, desc);

        const reward = document.createElement("span");
        reward.className = "account-task__reward";
        reward.textContent = "+" + task.reward + " 积分";

        row.append(icon, copy, reward, buildTaskAction(task));
        return row;
      }),
    );
    window.SKIcons?.hydrate(taskList);
  }

  /* ---------- 任务中心：单月活跃地图（演示数据，固定表） ---------- */
  const MONTH_LEVELS = [2, 1, 0, 2, 1, 1, 0, 2, 2, 1, 0, 1, 2, 1, 0, 1, 2, 2, 1, 0, 1, 1, 2, 0, 1, 2, 1, 0, 1, 2, 1];

  const monthMapGrid = document.querySelector("[data-task-month-map]");
  const monthMapLabel = document.querySelector("[data-task-month-label]");

  const renderMonthMap = function () {
    if (!monthMapGrid) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const month = today.getMonth();
    const lead = (new Date(year, month, 1).getDay() + 6) % 7; // 周一为第一列
    const dayCount = new Date(year, month + 1, 0).getDate();

    monthMapGrid.replaceChildren();
    for (let i = 0; i < lead; i += 1) {
      const blank = document.createElement("span");
      blank.className = "account-month-map__blank";
      monthMapGrid.append(blank);
    }
    for (let day = 1; day <= dayCount; day += 1) {
      const cell = document.createElement("span");
      cell.className = "account-heatmap__cell";
      const isToday = day === today.getDate();
      if (isToday) cell.classList.add("is-today");
      cell.dataset.level = String(MONTH_LEVELS[(day - 1) % MONTH_LEVELS.length]);
      monthMapGrid.append(cell);
    }
    /* 末尾补齐到整周，网格不塌 */
    const tail = (lead + dayCount) % 7;
    for (let i = tail; i > 0 && i < 7; i += 1) {
      const blank = document.createElement("span");
      blank.className = "account-month-map__blank";
      monthMapGrid.append(blank);
    }

    if (monthMapLabel) monthMapLabel.textContent = year + " 年 " + (month + 1) + " 月";
  };

  renderMonthMap();

  /* 弹窗：只有「取消」按钮能关（点遮罩不关，全站统一），Esc 走原生行为 */
  document.querySelectorAll("dialog").forEach(function (dialog) {
    dialog.querySelectorAll("[data-dialog-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        dialog.close();
      });
    });
  });

  /* 编辑用户名：保存后写回登录态，页面上所有名称一起更新 */
  const usernameDialog = document.querySelector("[data-dialog-username]");
  const usernameInput = document.querySelector("[data-username-input]");

  document.querySelector("[data-username-open]")?.addEventListener("click", function () {
    if (!usernameDialog) return;
    const user = window.SKAuth?.getUser();
    if (!user) {
      window.SKApp.showToast("登录后才能修改用户名");
      return;
    }
    usernameInput.value = user.name || "社科研究员";
    usernameDialog.showModal();
    usernameInput.focus();
    usernameInput.select();
  });

  document.querySelector("[data-username-form]")?.addEventListener("submit", function (event) {
    event.preventDefault();
    const value = usernameInput.value.trim();
    if (value.length < 2) {
      window.SKApp.showToast("用户名至少 2 个字");
      usernameInput.focus();
      return;
    }
    if (!window.SKAuth?.setProfile({ name: value })) {
      window.SKApp.showToast("登录后才能修改用户名");
      return;
    }
    usernameDialog.close();
    window.SKApp.showToast("用户名已更新");
  });

  /* 重置密码：两次输入一致才通过（演示环境不落库） */
  const passwordDialog = document.querySelector("[data-dialog-password]");
  const passwordInput = document.querySelector("[data-password-input]");
  const passwordConfirm = document.querySelector("[data-password-confirm]");

  document.querySelector("[data-password-open]")?.addEventListener("click", function () {
    if (!passwordDialog) return;
    passwordInput.value = "";
    passwordConfirm.value = "";
    passwordDialog.showModal();
    passwordInput.focus();
  });

  /* 更换手机号：验证码走 auth.js 的 60s 倒计时，号码与验证码都在这里校验 */
  const phoneDialog = document.querySelector("[data-dialog-phone]");
  const phoneInput = document.querySelector("[data-phone-input]");
  const phoneCodeInput = document.querySelector("[data-phone-code-input]");
  const phoneCodeButton = document.querySelector("[data-phone-code]");

  /* 手机号不限格式，只要求非空 */
  const readPhoneValue = function () {
    return phoneInput ? phoneInput.value.trim() : "";
  };

  document.querySelector("[data-phone-open]")?.addEventListener("click", function () {
    if (!phoneDialog) return;
    if (!window.SKAuth?.getUser()) {
      window.SKApp.showToast("登录后才能更换手机号");
      return;
    }
    phoneInput.value = "";
    phoneCodeInput.value = "";
    phoneDialog.showModal();
    phoneInput.focus();
  });

  phoneCodeButton?.addEventListener("click", function () {
    if (!readPhoneValue()) {
      window.SKApp.showToast("请先输入手机号");
      phoneInput.focus();
      return;
    }
    window.SKAuth.sendSmsCode(phoneCodeButton);
    window.SKApp.showToast("验证码已发送，演示环境可输入任意 6 位数字");
  });

  document.querySelector("[data-phone-form]")?.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!readPhoneValue()) {
      window.SKApp.showToast("请输入手机号");
      phoneInput.focus();
      return;
    }
    if (phoneCodeInput.value.replace(/\D/g, "").length !== 6) {
      window.SKApp.showToast("请输入 6 位验证码");
      phoneCodeInput.focus();
      return;
    }
    if (!window.SKAuth?.changePhone(readPhoneValue())) {
      window.SKApp.showToast("更换失败，请重新登录后再试");
      return;
    }
    phoneDialog.close();
    window.SKApp.showToast("手机号已更新");
  });

  document.querySelector("[data-password-form]")?.addEventListener("submit", function (event) {
    event.preventDefault();
    if (passwordInput.value.length < 6) {
      window.SKApp.showToast("新密码至少 6 位");
      passwordInput.focus();
      return;
    }
    if (passwordInput.value !== passwordConfirm.value) {
      window.SKApp.showToast("两次输入的密码不一致");
      passwordConfirm.focus();
      return;
    }
    passwordDialog.close();
    window.SKApp.showToast("密码已重置");
  });
})();
