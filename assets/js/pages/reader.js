/* 文件查看页：只负责把 URL 上的文件信息铺到顶栏与正文标题。
   地址契约（三处列表调用方共用）：reader.html?source=<来源>&file=<文件名>
   —— source 只作来源标记，页面不区分渲染；file 可省，省掉用默认文件。
   file 的扩展名推格式标签，形如 .pdf / .docx；没有扩展名时显示「文件」。 */
(function () {
  "use strict";

  const DEFAULT_FILE = "基层公共文化服务数字化研究.pdf";

  const params = new URLSearchParams(window.location.search);
  const fileName = (params.get("file") || "").trim() || DEFAULT_FILE;
  /* 只在扩展名形如 .pdf / .docx 时才当格式用，避免把「研究报告」这类无扩展名标题整体当标签 */
  const ext = /\.([A-Za-z0-9]{1,5})$/.exec(fileName);
  const fileType = (params.get("type") || "").trim() || (ext ? ext[1].toUpperCase() : "文件");

  const nameNode = document.querySelector("[data-file-name]");
  const typeNode = document.querySelector("[data-file-type]");
  const titleNode = document.querySelector("[data-file-title]");
  const timeNode = document.querySelector("[data-file-time]");

  if (nameNode) nameNode.textContent = fileName;
  if (typeNode) typeNode.textContent = fileType;
  if (titleNode) titleNode.textContent = fileName.replace(/\.[^.]+$/, "");
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
