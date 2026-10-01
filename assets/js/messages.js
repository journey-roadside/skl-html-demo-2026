/* 站内消息：跨页共用的一份数据 + 已读状态。
   账户中心的「消息中心」面板与工作台左侧铃铛都从这里取，已读 id 记 localStorage，
   在任一处读完（或「全部已读」），另一处的未读数 / 红点跟着变。 */
(function () {
  "use strict";

  const STORAGE_KEY = "sheke-message-read";

  /* 按时间倒序；type 决定分类筛选，icon 取 icons.js 的键名。
     前三条默认未读（对齐工作台铃铛原来的「3 条未读」）。 */
  const MESSAGES = [
    {
      id: "research-done",
      type: "系统通知",
      icon: "bell",
      title: "深度研究已完成",
      time: "10 分钟前",
      summary: "“基层公共文化服务数字化研究”已生成研究摘要与来源清单。",
      body: "本次深度研究共检索 12 个来源、核验 46 份政策文件，摘要与来源清单已归档到「我的知识」。可继续追问细节，或把结论导出后发起新的研究。",
    },
    {
      id: "points-arrived",
      type: "积分变动",
      icon: "coins",
      title: "积分已到账",
      time: "今天 09:20",
      summary: "内容贡献通过审核，已获得 30 积分。",
      body: "「基层公共文化服务数字化研究」通过共享审核，按内容贡献规则发放 30 成长积分，当前成长积分 268。积分可用于兑换数据服务与深度研究额度。",
    },
    {
      id: "security-login",
      type: "系统通知",
      icon: "bell",
      title: "账号安全提示",
      time: "昨天 18:03",
      summary: "你的账号在新设备上完成登录，如非本人操作请及时处理。",
      body: "登录设备：Windows · 武汉；登录方式：手机号 + 密码。若并非本人操作，请立即重置密码并检查账号绑定信息。",
    },
    {
      id: "project-invite",
      type: "共享动态",
      icon: "share",
      title: "项目协作邀请",
      time: "昨天 15:41",
      summary: "“荆楚文化数字化传播研究”邀请你加入协作，可查看全部资料。",
      body: "邀请人：荆楚数字智库。加入后可查看项目内的全部对话、上传资料与知识图谱，并按角色权限参与编辑。",
    },
    {
      id: "kb-sync",
      type: "系统通知",
      icon: "bell",
      title: "知识库同步完成",
      time: "昨天 11:07",
      summary: "本次同步 128 条资料，其中 6 条因格式不兼容已跳过。",
      body: "同步来源：本地文件夹与已授权的文献库。跳过的文件为 XLS、PPT 格式，可在「我的知识」中转换为 PDF 或 DOCX 后重新上传。",
    },
    {
      id: "agent-upgrade",
      type: "系统通知",
      icon: "bell",
      title: "智能体能力升级",
      time: "2 天前",
      summary: "「荆楚智审」新增政策合规比对，可在智能体广场查看说明。",
      body: "升级后可对照国家与省级政策文件逐条比对研究结论，并标注依据条款。旧会话不受影响，新会话默认启用该能力。",
    },
    {
      id: "storage-alert",
      type: "系统通知",
      icon: "bell",
      title: "存储空间提醒",
      time: "3 天前",
      summary: "个人空间已使用 4.2 GB / 5 GB，建议清理不再引用的资料。",
      body: "占用最多的是「政策文件」分类（2.6 GB）。删除的资料会进入回收站保留 30 天，期间可随时恢复。",
    },
    {
      id: "share-approved",
      type: "审核结果",
      icon: "list-checks",
      title: "社区共享审核通过",
      time: "4 天前",
      summary: "“县域供给能力评估”已发布到知识联盟，其他成员可检索。",
      body: "审核用时 6 小时。成员可下载与收藏该资料，目前累计被下载 12 次；如需撤回共享，可在「我的知识」中操作。",
    },
    {
      id: "share-rejected",
      type: "审核结果",
      icon: "list-checks",
      title: "共享文件审核未通过",
      time: "5 天前",
      summary: "“区域文化品牌建设.md”未通过审核，原因：缺少来源标注。",
      body: "请补充数据来源与引用说明后重新提交。审核不通过不影响本地资料，也不会占用共享额度。",
    },
    {
      id: "sub-points",
      type: "积分变动",
      icon: "coins",
      title: "订阅积分到账",
      time: "09-25 10:18",
      summary: "订阅积分额度已刷新，本期 0/4000。",
      body: "订阅积分按月刷新，未使用部分不结转。联网检索与深度研究优先扣减订阅积分，超出部分从成长积分扣除。",
    },
    {
      id: "account-restored",
      type: "系统通知",
      icon: "bell",
      title: "账号异常登录已解除",
      time: "6 天前",
      summary: "检测到的异常登录已确认非本人操作，账号已恢复安全状态。",
      body: "我们已强制退出异常设备上的会话，并为账号开启登录提醒。建议同时检查绑定的手机号与工作单位信息。",
    },
    {
      id: "monthly-report",
      type: "系统通知",
      icon: "bell",
      title: "月度研究简报已生成",
      time: "7 天前",
      summary: "9 月共完成 12 次研究、上传 26 份资料，简报已存入「我的知识」。",
      body: "简报汇总了本月的研究主题分布、引用来源与待跟进问题，可在「我的知识」中按「成果摘要」查阅。",
    },
    {
      id: "favorite-updated",
      type: "共享动态",
      icon: "share",
      title: "收藏资料已更新",
      time: "8 天前",
      summary: "你收藏的“县域供给能力评估”发布了 v2 版本。",
      body: "新版本补充了 2026 年上半年的县域数据与两组对照案例，作者同时修订了结论部分的表述。旧版本仍可查看。",
    },
    {
      id: "points-redeemed",
      type: "积分变动",
      icon: "coins",
      title: "积分兑换成功",
      time: "9 天前",
      summary: "已使用 120 成长积分兑换「研究报告导出」额度。",
      body: "兑换的额度即时生效，可在研究报告页面导出 Word 与 PDF。当前成长积分余额 148。",
    },
    {
      id: "share-favorited",
      type: "共享动态",
      icon: "share",
      title: "共享资料被收藏",
      time: "10 天前",
      summary: "“基层公共文化服务数字化研究”被 6 位成员收藏。",
      body: "收藏较多的章节是「研究方法」与「主要发现」。持续被收藏的资料会在知识联盟的推荐位获得更高权重。",
    },
    {
      id: "storage-expanded",
      type: "系统通知",
      icon: "bell",
      title: "存储空间扩容完成",
      time: "12 天前",
      summary: "个人空间已扩容至 10 GB，本期生效。",
      body: "扩容由机构认证权益提供，有效期与工作单位认证一致。认证到期后空间会回到 5 GB，超出部分需自行清理。",
    },
  ];

  const readStoredIds = function () {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      /* 隐私模式读不到，按没有记录处理 */
      return null;
    }
  };

  const parseIds = function (raw) {
    try {
      const saved = JSON.parse(raw || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  };

  const writeReadIds = function (ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      /* 写不了就只在本页生效 */
    }
  };

  /* 初始未读 = 前三条，其余按已读种下（对齐工作台铃铛原来的「3 条未读」） */
  const seedReadIds = function () {
    return MESSAGES.slice(3).map(function (message) {
      return message.id;
    });
  };

  /* 首次打开还没有记录，就种下初始状态并立刻写回——否则只读了第一条，
     其余几条会因为记录里没有它们而重新变成未读 */
  const storedIds = readStoredIds();
  const readIds = new Set(storedIds === null ? seedReadIds() : parseIds(storedIds));
  if (storedIds === null) writeReadIds(Array.from(readIds));

  /* 演示需要：退出登录即清掉已读记录并复位成初始状态，
     这样重新登录进来，铃铛和消息中心又是「前三条未读」 */
  document.addEventListener("sk:auth-changed", function (event) {
    if (event.detail) return; /* 登录、换绑触发的刷新不动已读记录 */
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      /* 存储写不了也无妨，下面内存里照样复位 */
    }
    readIds.clear();
    seedReadIds().forEach(function (id) {
      readIds.add(id);
    });
  });

  const all = function () {
    return MESSAGES.map(function (message) {
      return Object.assign({}, message, { read: readIds.has(message.id) });
    });
  };

  const unreadCount = function () {
    return MESSAGES.filter(function (message) {
      return !readIds.has(message.id);
    }).length;
  };

  const markRead = function (id) {
    if (!id || readIds.has(id)) return;
    readIds.add(id);
    writeReadIds(Array.from(readIds));
  };

  const markAllRead = function () {
    MESSAGES.forEach(function (message) {
      readIds.add(message.id);
    });
    writeReadIds(Array.from(readIds));
  };

  window.SKMessages = {
    all: all,
    unreadCount: unreadCount,
    markRead: markRead,
    markAllRead: markAllRead,
  };
})();
