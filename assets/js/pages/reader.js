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
  const fileName = (params.get("file") || "").trim() || DEFAULT_FILE;
  const ownerName = (params.get("owner") || "").trim() || DEFAULT_OWNER;
  /* 只认「以字母开头、总长 2-5 位」的扩展名：仅限长度挡不住小数，
     「研究报告 v1.2」会被切成「研究报告 v1」 */
  const baseName = fileName.replace(/\.[A-Za-z][A-Za-z0-9]{1,4}$/, "");

  const nameNode = document.querySelector("[data-file-name]");
  const titleNode = document.querySelector("[data-file-title]");
  const ownerNode = document.querySelector("[data-file-owner]");
  const timeNode = document.querySelector("[data-file-time]");

  if (nameNode) nameNode.textContent = fileName;
  if (titleNode) titleNode.textContent = baseName;
  if (ownerNode) ownerNode.textContent = ownerName;
  if (timeNode) timeNode.textContent = normalizeTime(params.get("time"));
  document.title = fileName + " · 湖北社科数据信息联盟";
})();
