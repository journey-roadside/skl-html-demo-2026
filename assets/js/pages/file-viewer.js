/* 文件查看页：只负责把 URL 上的文件信息铺到顶栏与正文标题。
   打开地址形如 file-viewer.html?name=xxx.pdf&type=PDF，两个参数都可省 ——
   省掉 name 用默认文件，省掉 type 从扩展名推。 */
(function () {
  "use strict";

  const DEFAULT_NAME = "基层公共文化服务数字化研究.pdf";

  const params = new URLSearchParams(window.location.search);
  const fileName = (params.get("name") || "").trim() || DEFAULT_NAME;
  /* 只在扩展名形如 .pdf / .docx 时才当格式用，避免把 "研究报告" 这类无扩展名标题整体当标签 */
  const ext = /\.([A-Za-z0-9]{1,5})$/.exec(fileName);
  const fileType = (params.get("type") || "").trim() || (ext ? ext[1].toUpperCase() : "文件");

  const nameNode = document.querySelector("[data-file-name]");
  const typeNode = document.querySelector("[data-file-type]");
  const titleNode = document.querySelector("[data-file-title]");

  if (nameNode) nameNode.textContent = fileName;
  if (typeNode) typeNode.textContent = fileType;
  if (titleNode) titleNode.textContent = fileName.replace(/\.[^.]+$/, "");
  document.title = fileName + " · 湖北社科数据信息联盟";
})();
