# PROJECT_CONTEXT

## 文档用途

这是本仓库的全局首读地图，供后续 AI 会话和项目成员快速恢复上下文。它只记录跨需求复用的稳定事实、模块边界、入口路由和长期有效的踩坑规则。

本文件不是 PRD、研究记录、ADR、运行手册或任务交接。具体需求、版本方案和待办应放到对应专题文档，并从本文件链接过去。

## 维护规则

- 产品定位、仓库边界、架构入口、领域术语、常用验证命令或重复踩坑发生变化时更新本文件。
- 单个需求的页面方案、接口设计、验收标准不要写进本文件。
- 事实、当前判断、待研究点分开记录，避免把推断写成已验证事实。
- 引用路径前先确认存在；无法确认时明确标注“未验证”。
- 保持短小。优先给路由和文件入口，不复制源码或长段说明。

## 当前产品定位

### 已验证事实

- 本仓库是湖北省社科联「社科研究与理论宣讲数智化平台」的高保真静态演示站。当前根目录主版本为 V5.5，产品定位已升级为「湖北社科数据信息联盟」官网。
- 公开项目背景是「湖北社会科学AI模型及其应用服务项目（二期）」中的「湖北社科数据信息联盟与智能体应用拓展工程」；公开报道明确提到建设联盟智能化系统平台，以及辅助社科研究智能体「荆楚智研」和 AI 伦理审查智能体「荆楚智审」。[公开报道](http://m.hbskw.com/p/88573.html)
- 当前站点是纯 HTML、CSS、原生 JavaScript 的多页静态演示，无框架、无构建、无第三方依赖，也不需要 `package.json`。
- 仓库只有本地演示数据和浏览器状态，没有后端接口、真实鉴权、真实数据库或文件持久化。交互结果主要用于演示页面流程。
- 根 `index.html` 是联盟官网首页；`pages/knowledge-alliance.html` 是知识联盟工作台入口；主要工作台页面通过统一壳层进入。
- V3 与 V4 是历史版本目录，用于对照和回溯，不是当前站点运行时的一部分。

### 当前判断

- 后续开发应以仓库根目录的 V5.5 文件为当前实现，以 `v3/`、`v4/` 仅作历史参考和回溯。
- 「社科智联」「社科智研」「湖北社科数据信息联盟」等名称同时存在于不同版本和页面语境中。改文案前先确认指的是官网品牌、产品线还是历史归档，不要全局替换。
- 当前 UI 中的研究助手、项目、知识、审核、积分和消息流程是演示闭环；真正的业务边界应由后续正式需求或后端契约确定。

### 待研究点

- 「社科智联」「社科智研」与「湖北社科数据信息联盟」的最终品牌层级和对外统一写法尚未在本仓库中形成正式规范。
- V3、V4 归档目录是否长期保留、是否需要单独迁移或压缩，尚未形成决策记录。
- 后续真实后端、鉴权、文件存储、智能体调用和数据共享能力尚未在当前仓库定义接口边界。

## 核心用户与常用流程

### 核心用户

以下是依据当前页面和文案得到的当前判断，不是已经过产品访谈验证的用户研究报告：

- 社科研究人员：使用荆楚智研检索、问答、整理资料和推进研究项目。
- 知识贡献者或联盟成员单位：上传、整理、共享和审核知识成果。
- 审核或管理人员：使用荆楚智审处理真实性、价值导向和 AI 伦理相关审查流程。
- 普通公众或访客：查看联盟官网、官方资讯、智能体介绍和联盟共建信息。

### 常用流程

- 官网访问：`index.html` 查看联盟动态和双智能体，进入资讯、知识联盟或智能体介绍。
- 进入工作台：`index.html` -> `pages/knowledge-alliance.html` -> `pages/research-assistant.html`。
- 知识与文件：在知识联盟或我的知识中浏览、上传、共享文件，再通过阅读页打开文件详情。
- 项目管理：在项目列表中创建、重命名、归档或删除项目，并进入项目详情继续对话。
- 审核流程：从知识联盟或智能体入口进入荆楚智审相关内容，查看或发起审查演示。
- 账户与消息：登录后进入账户中心，查看个人信息、积分、任务和消息；消息状态与工作台铃铛共享。

## 仓库与模块地图

### 工作区边界

- 这是一个单 Git 仓库；`v3/`、`v4/` 是同一仓库内的归档目录，不是独立 checkout。
- 当前分支为 `main`，远端为 `https://github.com/journey-roadside/skl-html-demo-2026.git`。
- 当前工作树无构建产物，也不存在 `package.json`、工作区清单或后端服务目录。

### 顶层路径

| 路径 | 角色 | 说明 |
| --- | --- | --- |
| `index.html` | 当前官网首页 | 中央入口；展示联盟品牌、资讯、双智能体和联盟共建。 |
| `pages/` | 当前站点页面 | 包含资讯、知识联盟、智能体广场、研究助手、项目、我的知识、阅读页和账户中心。 |
| `assets/css/` | 当前样式 | `tokens.css` 是设计令牌来源；按 tokens -> base -> components -> 外壳 -> 页面样式的顺序组织。 |
| `assets/js/` | 当前脚本 | 公共模块、页面逻辑和 `assets/js/pages/` 下的壳层页面逻辑。 |
| `assets/img/`、`assets/images/` | 当前静态资源 | 纹理、二维码、头像等演示资源。 |
| `v3/` | 历史归档 | 旧版门户和工作台实现；其中的 README、路径和交互约定不代表当前版本。 |
| `v4/` | 历史归档 | 旧版独立页面和资源；部分页面在当前 V5 中已整合或不再提供。 |
| `.github/workflows/deploy.yml` | 部署配置 | push `main` 后部署静态文件到 CloudBase `/skl-2026`。 |
| `PROJECT_CONTEXT.md` | 全局首读地图 | 仓库边界、模块地图、数据流与易踩坑；新会话先读再由它指向 README 与具体页面。 |
| `README.md` | 中文项目总览 | 版本表、页面清单、目录结构和快速预览的权威入口。 |

## 架构与数据流

### 主架构

- 站点是多页静态应用。页面之间通过相对链接、hash 锚点和少量 URL 查询参数跳转。
- 每个业务页按需加载 `tokens.css`、基础样式、通用组件和页面专用样式；图标通过 `data-icon` 占位，由 `assets/js/icons.js` 注入。
- 5 个壳层页面：`knowledge-alliance.html`、`agent-square.html`、`research-assistant.html`、`projects.html`、`my-knowledge.html`。它们只保留内容区，侧栏和用户区由 `assets/js/pages/workbench.js` 运行时注入。
- 公共能力由少量全局对象衔接：`window.SKApp`、`window.SKAuth`、`window.SKIcons`、`window.SKMessages`、`window.SKMyFiles`、`window.SKNews`、`window.SKWorkbenchDialogs`。

### 关键数据流

- 官网：`index.html` + `assets/js/portal-home.js` -> 官方资讯、知识联盟、智能体和账户入口。
- 资讯：`pages/news.html` 与 `pages/news-article.html` 共同读取 `assets/js/news-data.js`；详情页使用 `?id=<1-27>`。
- 登录态：`assets/js/auth.js` 读写 `localStorage["sheke-demo-user"]`，并通过 `sk:auth-changed` 驱动跨页状态更新。
- 文件数据：`assets/js/my-files.js` 以 `localStorage["sheke-my-files"]` 保存上传增量，知识联盟和我的知识共用同一份演示文件。
- 消息数据：`assets/js/messages.js` 使用 `localStorage["sheke-message-read"]` 同步账户中心和壳层铃铛的已读状态。
- 阅读页：文件卡通过 `?source=<来源>&file=<文件名>` 进入 `pages/reader.html`；重命名状态记录在 `localStorage["sheke-reader-file-names"]`。
- 工作台偏好：助手设置使用 `sheke-settings-recommend`、`sheke-settings-auto-web`、`sheke-settings-thinking`；侧栏折叠使用 `sheke-sidebar-collapsed`。
- 账户中心：使用 `?tab=<overview|profile|points|tasks|messages>` 深链，最近页签记录在 `localStorage["sheke-account-tab"]`。
- 项目页：支持 `?project=<id>`、`?create=1` 等 URL 状态入口，具体解析以 `assets/js/pages/projects.js` 为准。

### 本地运行与验证入口

- 直接打开 `index.html` 可以预览；部分浏览器对 `file://` 有额外限制时使用本地服务。
- 推荐命令：`python -m http.server 8080`，然后访问 `http://localhost:8080/index.html`。
- 当前没有自动化测试、构建命令或 CI 验证步骤；仓库 CI 只负责部署。页面修改至少需要浏览器手动冒烟验证。
- 部署由 `.github/workflows/deploy.yml` 执行，只收集 `index.html`、`pages/`、`assets/` 和 `README.md`，部署到 CloudBase 静态托管的 `/skl-2026`。

## 领域语言

| 术语 | 含义 | 来源或备注 |
| --- | --- | --- |
| 湖北社科数据信息联盟 | 当前官网首页所代表的联盟与平台品牌。 | `index.html`、`README.md` |
| 社科智联 | 历史版本中使用的平台品牌名，仍可能出现在旧页面和文档语境中。 | `README.md`、`v3/README.md` |
| 知识联盟 | 当前工作台首页，承载共享文件浏览、文件信息和审核入口。 | `pages/knowledge-alliance.html` |
| 荆楚智研 | 面向社科研究的辅助智能体。 | `index.html`、`assets/js/pages/workbench.js` |
| 荆楚智审 | 面向成果审核、真实性、价值导向和 AI 伦理分析的智能体。 | `index.html`、`pages/agent-square.html` |
| 我的知识 | 登录用户的文件管理和共享审核工作区。 | `pages/my-knowledge.html` |
| 阅读页 / 文件查看 | 在新窗口或独立页面中查看知识文件的页面。 | `pages/reader.html` |
| 工作台壳 | 侧栏、顶栏、用户区和公共弹窗的运行时注入层。 | `assets/js/pages/workbench.js`、`assets/css/pages/workbench-shell.css` |
| 演示闭环 | 无真实后端，依靠静态数据和 `localStorage` 表现出的可操作流程。 | `README.md`、各数据模块 |

## 后续 AI 入口

| 任务类型 | 第一批文件 | 说明 |
| --- | --- | --- |
| 项目总览 | `PROJECT_CONTEXT.md` -> `README.md` -> `git status --short --branch` | 先确认当前版本和仓库状态，再进入具体页面。 |
| 官网与资讯 | `index.html`、`assets/css/portal-home.css`、`assets/js/portal-home.js`、`pages/news*.html`、`assets/js/news-data.js` | 官网首页和资讯列表/详情使用独立入口。 |
| 工作台壳 | `assets/js/pages/workbench.js`、`assets/css/pages/workbench-shell.css`、任一壳层页面 | 壳层是共享结构；不要先复制到单个页面再修。 |
| 研究助手 | `pages/research-assistant.html`、`assets/js/research-assistant.js`、`assets/js/v4.js`、`assets/css/research-assistant.css` | 会话、设置、项目弹窗和文件选择交互较多，改动后要实测跨页状态。 |
| 项目列表 | `pages/projects.html`、`assets/js/pages/projects.js`、`assets/css/projects.css` | 注意 URL 参数和工作台壳共同决定页面状态。 |
| 知识与文件 | `assets/js/my-files.js`、`assets/js/my-knowledge.js`、`pages/my-knowledge.html`、`pages/reader.html`、`assets/js/shared-community.js` | 一份文件数据被多个页面共用，先改数据模块再看页面。 |
| 登录与账户 | `assets/js/auth.js`、`assets/js/messages.js`、`pages/account-center.html`、`assets/js/pages/account-center.js` | 登录态是演示状态，但跨页事件和重定向逻辑真实存在。 |
| 部署 | `.github/workflows/deploy.yml` | 新增顶层目录不会自动进入部署白名单。 |
| 验证 | `README.md`、浏览器、`python -m http.server 8080` | 当前无自动化测试；以页面实际交互和资源加载为准。 |

## 专题文档索引

| 类型 | 位置 | 备注 |
| --- | --- | --- |
| 版本说明 | `README.md` | 当前根 README 是版本表和页面清单入口。 |
| PRD | 尚未建立 | 当前仓库没有 `prd/` 目录；需要时先建立专题目录，不要写进本文件。 |
| 研究 | 尚未建立 | 当前仓库没有 `research/` 目录。 |
| 决策记录 | 尚未建立 | 当前仓库没有 `decisions/` 目录。 |
| 运行手册 | 尚未建立 | 本地预览和部署说明暂在 `README.md` 与 workflow 中。 |
| 交接 | 尚未建立 | 当前仓库没有 `handoff/` 目录。 |

## 易踩坑

- 症状：把 `v3/` 或 `v4/` 当成当前实现，照着旧 README 找 `app-shell.js`、`DESIGN.md` 或旧页面。原因：历史归档保留了旧架构和旧命名。预防规则：根目录和当前 `pages/` 才是 V5.5 实现，归档目录只用于对照；引用的文件若不在根目录，先标记为历史文件。

  - 证据：`v3/README.md` 描述的目录结构包含旧的 `app-shell.js` 和 `social-union-home.css`，当前根目录使用 `assets/js/pages/workbench.js`。

- 症状：侧栏、用户区或公共弹窗被重复写进某个工作台页面，后面多处同步修改。原因：壳层是运行时注入，单页 HTML 里看不到完整结构。预防规则：先改 `assets/js/pages/workbench.js` 和 `assets/css/pages/workbench-shell.css`，单页只保留内容区。

- 症状：在 `agent-square.html` 或 `projects.html` 调用 `SKApp.showToast`，页面没有 `main.js` 时出现空引用。原因：这两个页面不加载完整公共脚本。预防规则：依赖壳层兜底能力时先检查 `workbench.js` 中的 fallback，保持 toast 和焦点陷阱接口一致。

- 症状：新增页面、资源或目录后线上不生效。原因：CloudBase workflow 只收集白名单路径。预防规则：新增顶层发布目录时同步修改 `.github/workflows/deploy.yml`，并确认部署路径仍为 `/skl-2026`。

- 症状：把演示状态当作真实业务数据，或把 localStorage 键当成后端契约。原因：项目定位是前端高保真原型。预防规则：先查 `auth.js`、`my-files.js`、`messages.js` 等数据模块，并在需求文档中单独定义未来接口。

- 症状：修改文件卡或资讯卡片后，另一个页面状态丢失。原因：多个页面共享同一份数据模块或 localStorage 键。预防规则：涉及文件、消息、项目、阅读和设置时，沿共享数据源追到所有消费者，再做回归。

- 症状：新增工作台页面时直接复制当前页面完整 HTML。原因：当前页面可能只保存内容区，壳层由脚本注入。预防规则：复制最接近目标页的页面结构，保留 `workbench-shell` 容器和统一脚本加载顺序，再补专用 CSS/JS。

## 验证记录

- 最近核对：2026-10-09
- 已核对：`README.md`、`index.html`、`.github/workflows/deploy.yml`、`assets/css/tokens.css`、`assets/js/auth.js`、`assets/js/messages.js`、`assets/js/my-files.js`、`assets/js/pages/workbench.js`、`assets/js/pages/account-center.js`、`assets/js/research-assistant.js` 及当前 `pages/` 文件清单。
- 已核对命令：`git status --short --branch`、`git log --oneline --decorate -10`、`git remote -v`、`rg --files`、`rg -l "workbench-shell" pages -g "*.html"`、`Get-ChildItem`。
- 已知缺口：尚无自动化测试和本次会话的浏览器截图验证；公开品牌资料来自外部报道，仓库内没有正式品牌规范文件。
