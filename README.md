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

当前根目录以 V5.1 为主版本：

- `index.html` 为「湖北社科数据信息联盟」官网首页。
- `pages/knowledge-alliance.html` 为知识联盟（工作台底座）。
- `pages/agent-square.html` 为智能体广场（荆楚智研 / 荆楚智审）。
- `pages/research-assistant.html` 为社科智研工作台。
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
| `pages/knowledge-alliance.html` | 知识联盟（工作台底座） | 共享文件浏览、文件信息、相关文件与共享审核入口 |
| `pages/agent-square.html` | 智能体广场 | 荆楚智研、荆楚智审双智能体：概述、适用场景、核心能力、使用边界与快速开始（#agent-research / #agent-review 锚点） |
| `pages/projects.html` | 项目列表 | 课题示例、项目详情、对话、创建 / 重命名项目；对话项三点菜单（移出项目 / 删除）、项目资料本地上传与删除、格式筛选含「全部」 |
| `pages/research-assistant.html` | 社科智研工作台 | 用户信息、通用设置、帮助与反馈及政策脉络等研究模块 |
| `pages/my-knowledge.html` | 我的知识 | 文件上传、重命名、删除与共享审核 |

主访问路径为：

`index.html` → `pages/knowledge-alliance.html` → `pages/research-assistant.html`

智能体广场、项目列表由官网首页与工作台导航进入；页面间通过统一工作台壳（workbench-shell / workbench.js）切换，不互相直接链接。

## 目录结构

```text
html-demo/
├─ index.html                  # 湖北社科数据信息联盟官网首页
├─ pages/
│  ├─ knowledge-alliance.html  # 知识联盟（工作台底座）
│  ├─ agent-square.html        # 智能体广场（荆楚智研 / 荆楚智审）
│  ├─ research-assistant.html  # 社科智研工作台
│  ├─ projects.html            # 项目列表
│  └─ my-knowledge.html        # 我的知识
├─ assets/
│  ├─ css/
│  │  ├─ tokens.css            # 设计令牌与深浅模式变量（V5 扩展重写）
│  │  ├─ base.css              # 基础重置与排版
│  │  ├─ components.css        # 通用按钮、表单、弹窗和 Toast
│  │  ├─ portal-home.css       # 官网首页样式
│  │  ├─ app-shell.css         # 工作台侧栏、顶栏和用户区
│  │  ├─ agent-square.css      # 智能体广场样式
│  │  ├─ knowledge-alliance.css # 知识联盟样式
│  │  ├─ projects.css          # 项目列表样式
│  │  ├─ research-assistant.css # 工作台与历史会话共享样式
│  │  ├─ my-knowledge.css      # 我的知识样式
│  │  ├─ v4.css                # 旧工作台样式（保留兼容）
│  │  ├─ <page>.css            # 各页面专用样式
│  │  └─ pages/
│  │     └─ workbench-shell.css # 统一工作台外壳样式
│  ├─ js/
│  │  ├─ icons.js              # SVG 图标注入
│  │  ├─ main.js               # 基础交互和 Toast
│  │  ├─ auth.js               # 登录、注册和退出
│  │  ├─ portal-home.js        # 官网首页交互
│  │  ├─ app-shell.js          # 侧栏、设置和快捷键
│  │  ├─ knowledge-alliance.js # 知识联盟逻辑
│  │  ├─ projects.js           # 项目列表逻辑
│  │  ├─ research-assistant.js # 工作台会话交互
│  │  ├─ my-knowledge.js       # 我的知识逻辑
│  │  ├─ v4.js                 # 旧工作台逻辑（保留兼容）
│  │  ├─ <page>.js            # 各页面专用逻辑
│  │  └─ pages/
│  │     └─ workbench.js       # 统一工作台外壳逻辑（页面导航收归此处）
│  ├─ img/
│  │  └─ grid-pattern.svg
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
├─ cloudbaserc.json
└─ .github/
```

页面样式按「tokens → base → components → 应用外壳 → 页面样式」顺序引入。页面级文件只保存该页独有规则。

## 交互与状态

- 页面切换、筛选、排序、分页、弹窗、Toast 和划词工具均为前端静态交互，数据使用页面内模拟数据。
- 登录态：`localStorage["sheke-demo-user"]`，由 `assets/js/auth.js` 管理。
- 侧边栏折叠态：`localStorage["sheke-sidebar-collapsed"]`，由 `assets/js/app-shell.js` 管理。
- 主题设置：`localStorage["sheke-v4-theme"]`，支持浅色、深色和跟随系统，由 `assets/js/v4.js` 管理。
- 共享收藏：`localStorage["sheke-v4-community-favorites"]`，由共享社区和我的知识共享。
- 项目资料上传：仅记录文件名、大小和类型并保留在当前会话内存中，刷新后不保留；文件不落盘、不上传服务端。
- 快捷键：`Ctrl+K` 新建会话，`Ctrl+B` 收起或展开侧栏。
- 工作台与页面间通过统一外壳（workbench-shell / workbench.js）切换，不显示独立标签页。
- 未接入的真实功能统一使用 Toast 提示，避免误跳转。

## 开发约定

- 根 `index.html` 为「湖北社科数据信息联盟」官网首页，产品门户、工作台与智能体统一放在 `pages/`。
- `pages/` 页面引用资源使用 `../assets/`，返回官网首页使用 `../index.html`。
- 社科智研工作台入口为 `pages/research-assistant.html`，业务页面中的"新建会话"和"设置"均指向该文件。
- 颜色、圆角、阴影、动效和风险状态优先使用 `tokens.css` 变量，不直接写重复魔法值。
- 图标通过 `data-icon="name"` 声明，由 `icons.js` 注入，不在页面内联 SVG。
- 页面级样式和脚本使用 `assets/css/<page>.css`、`assets/js/<page>.js`，公共逻辑不要复制到页面脚本。
- 中文文案、`aria-*`、键盘操作和 `prefers-reduced-motion` 按现有页面规范维护。

## 已知限制

- 纯前端演示：无后端接口、无真实鉴权和无持久化业务数据；刷新后仅保留浏览器本地状态。
- 文件上传、下载、共享审核、分析报告和精读内容均为模拟流程。
- V5 起 `social-research-home`、`account-center`、`reader`、`shared-community`、`social-review`、`deep-research` 等 V4 独立页面已整合进官网首页、工作台或智能体广场，原文件不再随 V5 站点提供（可在 `v4/` 归档查阅）。
- V3 保留在 `v3/`、V4 保留在 `v4/`，其页面结构和资源引用保持归档状态。

仓库分支为 `main`，远端为：

`https://github.com/journey-roadside/skl-html-demo-2026.git`
