/* 文件查看页：只负责把 URL 上的文件信息铺到顶栏与正文标题。
   地址契约（三处列表调用方共用）：reader.html?source=<来源>&file=<文件名>&time=<YYYY-MM-DD>
   —— source 只作来源标记，页面不区分渲染；file 与 time 可省，缺省用默认文件与当天。
   顶栏与标签页显示完整文件名（带扩展名，扩展名即格式标识）；
   正文标题是「文档标题」，去掉扩展名。 */
(function () {
  "use strict";

  const DEFAULT_FILE = "基层公共文化服务数字化研究.pdf";

  const params = new URLSearchParams(window.location.search);
  const fileName = (params.get("file") || "").trim() || DEFAULT_FILE;
  /* 只认「以字母开头、总长 2-5 位」的扩展名：仅限长度挡不住小数，
     「研究报告 v1.2」会被切成「研究报告 v1」 */
  const baseName = fileName.replace(/\.[A-Za-z][A-Za-z0-9]{1,4}$/, "");

  const nameNode = document.querySelector("[data-file-name]");
  const titleNode = document.querySelector("[data-file-title]");
  const timeNode = document.querySelector("[data-file-time]");

  if (nameNode) nameNode.textContent = fileName;
  if (titleNode) titleNode.textContent = baseName;
  if (timeNode) {
    /* 更新时间统一 YYYY-MM-DD；调用方可用 ?time= 传真实时间，缺省取当天 */
    const pad = function (n) {
      return String(n).padStart(2, "0");
    };
    const now = new Date();
    const today = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
    timeNode.textContent = (params.get("time") || "").trim() || today;
  }
  document.title = fileName + " · 湖北社科数据信息联盟";
})();
