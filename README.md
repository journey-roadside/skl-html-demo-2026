# 社科智联 / 社科智研 · HTML 演示站

湖北省社科联「社科研究与理论宣讲数智化平台」的高保真静态演示原型，V5 起定位升级为「湖北社科数据信息联盟」官网。
纯 HTML + CSS + 原生 JS，无框架、无构建、无第三方依赖，可直接双击运行。

## 版本信息

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| V1 | 2026-09-11 | 首版：门户首页、社科智研产品门户、工作台页面和账号中心 |
| V2 | 2026-09-11 | 对比度、设计令牌、圆角、按钮状态和设计系统整改 |
| V3 | 2026-09-11 | 补全骨架态、研究助手交互和设计体系校准；原项目已归档到 `v3/` |
| V4 | 2026-09-16 | 重构工作台、我的知识、共享社区、社科智审和精读工具；恢复社科智联官网首页并接入产品门户 |
| V4.1 | 2026-09-16 | 20260916-调整项目结构并重构门户首页：社科智联官网作为根 `index.html`，产品门户和工作台迁入 `pages/`，补齐资源并统一页面入口与相对路径 |
| V5 | 2026-09-23 | 大重构：定位升级为「湖北社科数据信息联盟」官网首页；重写门户首页（双智能体入口 / 研究能力 / 联盟共建）；新增智能体广场、知识联盟、项目列表；引入统一工作台壳（workbench-shell / workbench.js），页面导航收归前端壳；设计令牌 tokens.css 扩展重写 |
| V5.1 | 2026-09-27 | 项目详情增强：对话项三点菜单（移出项目 / 删除）、项目资料支持本地上传与删除、资料项改双行布局并隐藏扩展名、列表一屏 5 项滚动、格式筛选新增「全部」默认项 |
| V5.2 | 2026-09-27 | 壳层单源重构：侧栏与用户区合并为 `workbench.js` 内的模板并在运行时注入，5 个页面各删除 926 行重复结构（净减约 1.29 万行）；删除 12 个零引用资源文件 |
| V5.3 | 2026-10-01 | 账户中心成页：新增 `pages/account-center.html`（个人总览 / 账户信息 / 积分中心 / 任务中心 / 消息中心），从工作台用户菜单与设置页进入，菜单访问状态记在本地；新增消息中心数据模块 `assets/js/messages.js` 与「我的文件」数据模块 `assets/js/my-files.js`；积分中心含总览、积分趋势、积分明细、积分规则弹窗、订阅账单（订阅弹窗带二维码）与常见问题；任务中心含签到、当前任务与本月活跃地图；工作台侧栏用户区上方新增任务窗口；登录弹窗独立为 `assets/css/auth-modal.css` 并校正未登录流程；另统一知识联盟 / 智能体广场 / 项目详情 / 我的知识 / 文件查看页的卡片圆角、悬停提示与表单弹窗样式 |

| V5.4 | 2026-10-01 | 官网资讯与社科助手对话过程：新增 `pages/news.html` 资讯列表页（27 条分 3 页）与 `pages/news-article.html` 详情页（`?id=` 定位、上一篇 / 下一篇），正文数据集中在 `assets/js/news-data.js` 由两页共用；社科助手对话过程页整体重构——每条回复补思考过程（默认收起，一级「已完成 +（耗时）」+ 二级执行步骤时间线，点步骤行展开补充说明）、引用资料与生成文件统一成浅底文件卡（图标不带底板、右侧为箭头、点击新窗口进 `reader.html`）、回复底部按钮行上方新增「查看资料引用（数量）/ 查看所有产物（数量）」、右上角新增「自动播报」与「更多」菜单（历史提问 / 文件 / 归档对话 / 移动至项目 / 删除，后三者复用壳层二次确认弹窗）、历史提问支持搜索、页面滚动时顶栏出下边框；设置页补「推荐」「展示思考过程」开关，设置视图用 `?settings=1` 记住刷新、侧栏不再显示选中；「自动联网搜索」开启后项目详情页输入框同步选中；侧栏收起时移出焦点顺序，修掉 Tab 键把页面顶偏的问题 |

当前根目录以 V5.4 为主版本：

- `index.html` 为「湖北社科数据信息联盟」官网首页。
- `pages/knowledge-alliance.html` 为知识联盟（工作台首页）。
- `pages/agent-square.html` 为智能体广场（荆楚智研 / 荆楚智审）。
- `pages/research-assistant.html` 为社科智研会话助手。
- `pages/projects.html` 为项目列表，`pages/my-knowledge.html` 为我的知识。
- V3 原始项目保留在 `v3/`，V4 项目保留在 `v4/`，用于对照和回溯。

## 快速预览

```bash
# 方式一：直接打开
index.html

# 方式二：本地起服务（推荐，避免个别浏览器 file:// 限制）
python -m http.server 8080
# 打开 http://localhost:8080/index.html
```

## 页面清单

| 文件 | 页面 | 说明 |
| --- | --- | --- |
| `index.html` | 湖北社科数据信息联盟官网 | 品牌首屏、最新动态、双智能体入口（荆楚智研 / 荆楚智审）、研究能力、联盟共建、关于与二维码 |
| `pages/news.html` | 官方资讯 | 官网资讯文章列表：27 条分 3 页，底部分页仅页码（无上一页 / 下一页）；顶部导航镜像官网首页，「官方资讯」为选中态；入口为官网首页「最新动态」板块的「查看更多」，点标题新窗口打开文章详情 |
| `pages/news-article.html` | 资讯详情 | 单篇文章：标题、发布时间与发布作者、正文（段落 / 小标题 / 配图与图注）、底部上一篇 / 下一篇导航（带标题；最新一篇的左侧、最后一篇的右侧改放「返回资讯首页」）；宽度与资讯列表页一致（860px）；正文超一屏时右下角出现回到顶部圆钮（短文章不出现）；地址契约 `?id=<1-27>`，无匹配回列表页；正文数据在 `assets/js/news-data.js`，长度刻意不一以演示长短文章与图文 / 纯文字两类排版 |
| `pages/knowledge-alliance.html` | 知识联盟（工作台底座） | 共享文件浏览、文件信息、相关文件与共享审核入口 |
| `pages/agent-square.html` | 智能体广场 | 荆楚智研、荆楚智审双智能体：概述、适用场景、核心能力、使用边界与快速开始（#agent-research / #agent-review 锚点） |
| `pages/projects.html` | 项目列表 | 课题示例、项目详情、对话、创建 / 重命名项目；对话项三点菜单（移出项目 / 归档 / 删除，已归档项为取消归档）、搜索框右侧「状态」筛选（全部 / 未归档 / 已归档，默认全部；已归档项带橙色全圆角标签、排在未归档之后）、项目资料本地上传与删除、格式筛选含「全部」 |
| `pages/research-assistant.html` | 社科智研工作台 | 欢迎页（推荐工具 + 智能体入口）、会话过程与通用设置：每条回复带思考过程（一级摘要 + 二级执行步骤，默认收起）、引用资料与生成文件卡点击新窗口进 `reader.html`、右上角「自动播报」与「更多」菜单（历史提问 / 文件 / 归档对话 / 移动至项目 / 删除）、右侧来源 / 文件 / 浏览页面 / 历史提问面板 |
| `pages/my-knowledge.html` | 我的知识 | 文件上传、重命名、删除与共享审核 |
| `pages/reader.html` | 文件查看 | 知识文件在新页面打开后的查看页：顶部工具条（文件名称、格式类型标签、重命名 / 加入知识库 / 下载图标按钮）+ 下方内容栏；地址契约 `?source=<来源>&file=<文件名>`，`file` 可省 |
| `pages/account-center.html` | 账户中心 | 个人总览、账户信息（个人信息 / 账户安全 / 其他信息）、积分中心、任务中心、消息中心五个菜单；仅登录后可进，未登录回官网首页；`?tab=<overview\|profile\|points\|tasks\|messages>` 可直接深链到指定菜单 |

主访问路径为：

`index.html` → `pages/knowledge-alliance.html` → `pages/research-assistant.html`

智能体广场、项目列表由官网首页与工作台导航进入；页面间通过统一工作台壳（workbench-shell / workbench.js）切换，不互相直接链接。

5 个 `pages/` 页面只保留 `<div class="workbench-shell">` 和自身内容区，侧栏与用户区由 `assets/js/pages/workbench.js` 在运行时注入。

## 目录结构

```text
html-demo/
├─ index.html                  # 湖北社科数据信息联盟官网首页
├─ pages/
│  ├─ news.html                # 官方资讯（官网资讯文章列表，导航镜像官网首页）
│  ├─ news-article.html        # 资讯详情（单篇文章，?id= 定位）
│  ├─ knowledge-alliance.html  # 知识联盟（工作台底座）
│  ├─ agent-square.html        # 智能体广场（荆楚智研 / 荆楚智审）
│  ├─ research-assistant.html  # 社科智研工作台
│  ├─ projects.html            # 项目列表
│  ├─ my-knowledge.html        # 我的知识
│  ├─ reader.html              # 文件查看（知识文件新窗口打开后的查看页）
│  └─ account-center.html      # 账户中心（个人总览 / 账户信息 / 积分中心 / 任务中心 / 消息中心）
├─ assets/
│  ├─ css/
│  │  ├─ tokens.css            # 设计令牌（仅浅色，全站无深色模式）
│  │  ├─ base.css              # 基础重置与排版
│  │  ├─ components.css        # 通用按钮、表单、弹窗和 Toast
│  │  ├─ auth-modal.css        # 登录 / 退出确认弹窗（从 components.css 拆出，官网首页也加载）
│  │  ├─ portal-home.css       # 官网首页样式
│  │  ├─ app-shell.css         # 工作台侧栏、顶栏和用户区
│  │  ├─ agent-square.css      # 智能体广场样式
│  │  ├─ shared-community.css  # 共享社区样式
│  │  ├─ projects.css          # 项目列表样式
│  │  ├─ research-assistant.css # 工作台与历史会话共享样式
│  │  ├─ my-knowledge.css      # 我的知识样式
│  │  ├─ reader.css            # 文件查看页样式
│  │  ├─ account-center.css    # 账户中心样式
│  │  ├─ news.css              # 官方资讯列表页样式（导航与基础复用 portal-home.css）
│  │  ├─ news-article.css      # 资讯详情页正文排版
│  │  ├─ v4.css                # 旧工作台样式（保留兼容）
│  │  ├─ <page>.css            # 各页面专用样式
│  │  └─ pages/
│  │     └─ workbench-shell.css # 统一工作台外壳样式
│  ├─ js/
│  │  ├─ icons.js              # SVG 图标注入
│  │  ├─ main.js               # 基础交互和 Toast
│  │  ├─ auth.js               # 登录、注册和退出
│  │  ├─ messages.js           # 消息中心数据模块（账户中心与工作台铃铛共用已读状态）
│  │  ├─ my-files.js           # 「我的文件」数据模块（我的知识与知识联盟共享弹窗共用）
│  │  ├─ news-data.js          # 官方资讯数据模块（27 篇含正文，列表页与详情页共用）
│  │  ├─ portal-home.js        # 官网首页交互
│  │  ├─ shared-community.js   # 共享社区逻辑
│  │  ├─ research-assistant.js # 工作台会话交互
│  │  ├─ my-knowledge.js       # 我的知识逻辑
│  │  ├─ reader.js             # 文件查看页：把 URL 参数铺到顶栏与正文标题
│  │  ├─ v4.js                 # 旧工作台逻辑（保留兼容）
│  │  ├─ <page>.js            # 各页面专用逻辑
│  │  └─ pages/
│  │     ├─ projects.js        # 项目列表逻辑
│  │     ├─ news.js            # 官方资讯列表：渲染与分页
│  │     ├─ news-article.js    # 资讯详情：按 ?id= 渲染文章正文
│  │     ├─ account-center.js  # 账户中心逻辑（菜单记忆、积分中心、任务中心、消息中心）
│  │     └─ workbench.js       # 统一工作台外壳：侧栏与用户区单源模板 + 注入逻辑
│  ├─ img/
│  │  ├─ grid-pattern.svg
│  │  └─ subscribe-qr.svg      # 订阅弹窗二维码（离线生成，扫码内容为咨询联系方式）
│  └─ images/social-union/     # 官网二维码和默认头像
├─ v3/                         # V3 原始项目归档
│  ├─ index.html
│  ├─ pages/
│  ├─ assets/
│  └─ README.md
├─ v4/                         # V4 项目归档
│  ├─ index.html
│  ├─ pages/
│  └─ assets/
├─ cloudbaserc.json            # CloudBase 静态托管配置（env / 部署路径）
└─ .github/                    # GitHub Actions：push main 自动部署到 CloudBase
```

页面样式按「tokens → base → components → 应用外壳 → 页面样式」顺序引入。页面级文件只保存该页独有规则。

## 交互与状态

- 页面切换、筛选、排序、分页、弹窗、Toast 和划词工具均为前端静态交互，数据使用页面内模拟数据。
- 登录态：`localStorage["sheke-demo-user"]`，由 `assets/js/auth.js` 管理。
- 侧边栏折叠态：`localStorage["sheke-sidebar-collapsed"]`，由 `assets/js/pages/workbench.js` 管理。
- 账户中心菜单：`localStorage["sheke-account-tab"]`，刷新后仍停在上次那一项；从工作台深链带的 `?tab=` 只在当次生效、不写入记忆，页内换过菜单后地址栏参数会被摘掉。
- 消息中心：`localStorage["sheke-message-read"]`，由 `assets/js/messages.js` 统一管理，账户中心消息中心与工作台铃铛共用同一份已读状态；退出登录会清掉这份记录，重新登录后又回到初始的「前三条未读」（便于演示）。
- 「我的文件」名单：`localStorage["sheke-my-files"]`，由 `assets/js/my-files.js` 管理，我的知识与知识联盟共享弹窗共用。
- 工作台签到窗口：侧栏用户区上方，登录后才出现；点关闭或签到后收起，本次会话内不再出现（`sessionStorage["sheke-checkin-hidden"]`），重新登录重置显隐与签到键；未登录、隐私模式存不了标记时只按登录态显隐。未登录时同一位置显示注册引导票券（`data-guest-only` + `data-auth-open`，点击开登录框），与签到窗口按登录态互斥。
- 壳层注入：`workbench.js` 先注入侧栏与用户区，再按 `location.pathname` 推导激活导航和 `data-project-create-trigger`，页面无需声明自身状态。
- 收起侧栏的快捷入口：项目列表（→ `projects.html`）与对话（→ `research-assistant.html`）在 5 个页面均为可跳转链接，行为一致。
- 用户菜单：开合、点击外部关闭与 `Esc` 关闭统一由 `assets/js/pages/workbench.js` 绑定，5 个页面行为一致（`main.js` 不再重复绑定）。
- 对话列表管理：点「对话」区块的管理按钮进入管理模式，可单选/多选后删除或归档（底部操作条「归档 | 删除」同行，删除旁边显示已选数量）；顶部同行提供「取消」退出管理模式。逻辑同样在 `workbench.js`，5 个页面通用。
- 对话归档视图：「对话」区块搜索按钮右侧的归档图标在「未归档（默认）/ 已归档」两个视图间切换，归档只给行打 `data-status="archived"` 标记（不再删行，刷新还原），已归档会话的三点菜单显示「取消归档」；归档视图下批量归档按钮禁用，列表为空时显示空态文案。
- 列表行三点菜单：项目（一级）含重命名 / 删除，项目内会话（二级）含重命名 / 删除 / 移出项目，会话列表含重命名 / 删除 / 归档（已归档会话为取消归档）；重命名、删除、归档、移出均弹二次确认，重命名弹窗预填当前名称。
- 对话搜索：点「对话」区块的搜索按钮弹出搜索框，按会话标题实时过滤当前列表；结果默认露出 5 条，超出可滚动查看。
- 共享收藏：`localStorage["sheke-v4-community-favorites"]`，由共享社区和我的知识共享。
- 项目资料上传：仅记录文件名、大小和类型并保留在当前会话内存中，刷新后不保留；文件不落盘、不上传服务端。
- 设置视图：社科智研页的通用设置不属于任何菜单项，打开时侧栏所有选中临时摘掉，地址栏带 `?settings=1`（刷新仍停在设置，直接带该参数落地也不会高亮侧栏）。开关写入 `localStorage["sheke-settings-recommend"]`（推荐工具推荐位）、`localStorage["sheke-settings-auto-web"]`（自动联网搜索）、`localStorage["sheke-settings-thinking"]`（展示思考过程，关闭后会话里的思考过程整块隐藏）；后两项登录后才出现。
- 自动联网搜索联动：社科助手设置里开启后，社科助手与项目详情页的联网搜索按钮默认选中（两页读同一份 localStorage）。
- 社科助手会话过程：思考过程默认收起，展开后是一级「已完成 +（耗时）」+ 二级执行步骤时间线，点某一步展开该步的补充说明（内容超 100px 出细滚动条）；引用资料与生成文件为同款浅底卡片，点击新窗口打开 `reader.html`；按钮行上方「查看资料引用（n）」「查看所有产物（n）」分别打开右侧的引用来源面板与文件面板。
- 社科助手右上角：自动播报默认关闭（图标带斜杠），开启后新回复生成即自动朗读；「更多」菜单含历史提问 / 文件 / 归档对话 / 移动至项目 / 删除，后三项复用侧栏那套二次确认弹窗（`window.SKWorkbenchDialogs`），删除后回到新会话欢迎页。
- 会话滚动：消息区向下滚动时顶栏出现下边框，回到顶部即消失。
- 全站快捷键（5 个页面通用，由 `workbench.js` 绑定）：`Ctrl+Alt+B` 收起 / 展开侧栏、`Ctrl+Alt+K` 新建会话、`Ctrl+Alt+J` 会话搜索、`Ctrl+Alt+D` 语音输入（社科智研页输入框的语音按钮；在其它页面按下会跳到社科智研页并落地开始录音）；社科智研页另有 `Ctrl+J` 搜索历史记录。
- 工作台与页面间通过统一外壳（workbench-shell / workbench.js）切换，不显示独立标签页。
- 未接入的真实功能统一使用 Toast 提示，避免误跳转。

## 开发约定

- **前端样式一律以 `../原型设计/design-system` 的设计标准为准**（`DESIGN.md` 规范正文 + `globals.css` 令牌实现）；`assets/css/tokens.css` 是其落地实现，取值冲突时以 `design-system` 为准并同步修正 `tokens.css`。详见 `AGENTS.md`。
- 根 `index.html` 为「湖北社科数据信息联盟」官网首页，产品门户、工作台与智能体统一放在 `pages/`。
- `pages/` 页面引用资源使用 `../assets/`，返回官网首页使用 `../index.html`。
- 社科智研工作台入口为 `pages/research-assistant.html`，业务页面中的"新建会话"和"设置"均指向该文件。
- 颜色、圆角、阴影、动效和风险状态优先使用 `tokens.css` 变量，不直接写重复魔法值。
- 弹窗统一由 `tokens.css` 的 `--modal-*` 令牌驱动：表面色 `--modal-surface`、遮罩 `--modal-backdrop`、层级 `--modal-z-mask` / `--modal-z-box`、头/体/尾内边距 `--modal-pad-head` / `--modal-pad-body` / `--modal-pad-actions`（单层内容区用 `--modal-pad`）、标题字号 `--modal-title-size`、头部间距 `--modal-head-gap`；圆角与阴影复用 `--radius-modal` / `--shadow-modal`。新增弹窗不要写死 `#fff`，也不要自造遮罩色或层级，否则深色模式会失效。
- 图标通过 `data-icon="name"` 声明，由 `icons.js` 注入，不在页面内联 SVG。
- 页面级样式和脚本使用 `assets/css/<page>.css`、`assets/js/<page>.js`，公共逻辑不要复制到页面脚本。
- 侧栏与用户区结构只在 `assets/js/pages/workbench.js` 的 `SHELL_SIDEBAR` / `SHELL_USER` 模板中维护，页面里不要复制这段结构；页面间的壳层差异由 `applyShellState()` 按路径推导，不要写回页面。
- 壳层模板用 JS 模板字符串内联，不使用 `fetch` 或 iframe 加载片段，以保证 `file://` 直接双击打开仍可用。
- 中文文案、`aria-*`、键盘操作和 `prefers-reduced-motion` 按现有页面规范维护。

## 已知限制

- 纯前端演示：无后端接口、无真实鉴权和无持久化业务数据；刷新后仅保留浏览器本地状态。
- 仅浅色主题：不提供深色模式与主题切换，`tokens.css` 只有 `:root` 一层令牌，`DESIGN.md` 中作为「推导扩展」的深色主题未实现。
- 文件上传、下载、共享审核、分析报告和精读内容均为模拟流程。
- V5 起 `social-research-home`、`account-center`、`reader`、`shared-community`、`social-review`、`deep-research` 等 V4 独立页面已整合进官网首页、工作台或智能体广场，原文件不再随 V5 站点提供（可在 `v4/` 归档查阅）。
- V3 保留在 `v3/`、V4 保留在 `v4/`，其页面结构和资源引用保持归档状态。

仓库分支为 `main`，远端为：

`https://github.com/journey-roadside/skl-html-demo-2026.git`
