/* 「我的文件」的唯一数据源 = 基础演示文件 + 用户上传（localStorage 持久化）。
   我的知识页（渲染列表、上传后写回）与知识联盟的共享弹窗（「从我的文件中添加」）共用这一份，
   避免两边各写一份名单。
   条目字段：name / type / size / favorite / shared / status / updated */
(function () {
  "use strict";

  const STORAGE_KEY = "sheke-my-files";

  const BASE_FILES = [
    { name: "基层治理数字化案例研究.pdf", type: "PDF", size: "2.8 MB", favorite: false, shared: "private", status: "normal", updated: "昨天 18:20 更新" },
    { name: "公共文化服务标准化建设报告.docx", type: "DOCX", size: "1.6 MB", favorite: false, shared: "community", status: "normal", updated: "昨天 16:45 更新" },
    { name: "城乡公共文化空间调查摘要.md", type: "MD", size: "680 KB", favorite: true, shared: "private", status: "normal", updated: "昨天 14:12 更新" },
    { name: "基层治理案例访谈纪要.docx", type: "DOCX", size: "920 KB", favorite: false, shared: "private", status: "normal", updated: "昨天 11:30 更新" },
    { name: "数字政府政策文件汇编.pdf", type: "PDF", size: "4.2 MB", favorite: false, shared: "community", status: "normal", updated: "09-14 17:26 更新" },
    { name: "公共服务满意度数据报告.docx", type: "DOCX", size: "2.1 MB", favorite: false, shared: "private", status: "normal", updated: "09-14 13:08 更新" },
    { name: "文化空间更新项目资料.pdf", type: "PDF", size: "3.4 MB", favorite: true, shared: "private", status: "normal", updated: "09-13 16:40 更新" },
    { name: "基层应急治理调研记录.docx", type: "DOCX", size: "1.3 MB", favorite: false, shared: "private", status: "partial", updated: "09-13 10:22 更新" },
    { name: "社科成果传播路径分析.md", type: "MD", size: "740 KB", favorite: false, shared: "community", status: "normal", updated: "09-12 18:05 更新" },
    { name: "区域发展政策评估报告.pdf", type: "PDF", size: "5.1 MB", favorite: false, shared: "private", status: "normal", updated: "09-12 15:18 更新" },
    { name: "公共文化服务案例清单.md", type: "MD", size: "510 KB", favorite: false, shared: "private", status: "normal", updated: "09-11 17:42 更新" },
    { name: "社区治理协商记录.docx", type: "DOCX", size: "860 KB", favorite: false, shared: "community", status: "normal", updated: "09-11 09:35 更新" },
    { name: "数字治理平台建设方案.pdf", type: "PDF", size: "3.6 MB", favorite: true, shared: "private", status: "normal", updated: "09-10 16:20 更新" },
    { name: "基层文化设施现状调研.md", type: "MD", size: "1.4 MB", favorite: false, shared: "private", status: "normal", updated: "09-10 11:08 更新" },
    { name: "政策文本分析方法综述.pdf", type: "PDF", size: "2.9 MB", favorite: false, shared: "community", status: "normal", updated: "09-09 15:44 更新" },
    { name: "社会调查数据质量说明.docx", type: "DOCX", size: "1.2 MB", favorite: false, shared: "private", status: "normal", updated: "09-09 09:26 更新" },
    { name: "公共文化服务创新案例.txt", type: "TXT", size: "960 KB", favorite: false, shared: "private", status: "normal", updated: "09-08 17:15 更新" },
    { name: "基层治理研究成果汇编.pdf", type: "PDF", size: "6.4 MB", favorite: false, shared: "private", status: "parsing", updated: "09-08 10:02 更新" },
  ];

  function readUploads() {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function saveUploads(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  /* 上传的文件排在前面（最近的在最上）；同名只留一条 */
  function addFiles(files) {
    const uploads = readUploads();
    (files || []).forEach(function (file) {
      if (!file || !file.name) return;
      if (uploads.some(function (item) { return item.name === file.name; })) return;
      uploads.unshift({
        name: file.name,
        type: file.type || "文件",
        size: file.size || "0 KB",
        favorite: Boolean(file.favorite),
        shared: file.shared || "private",
        status: file.status || "normal",
        updated: file.updated || "刚刚更新",
      });
    });
    saveUploads(uploads);
  }

  function allFiles() {
    return readUploads().concat(BASE_FILES);
  }

  window.SKMyFiles = {
    base: BASE_FILES,
    uploads: readUploads,
    all: allFiles,
    add: addFiles,
  };
})();
