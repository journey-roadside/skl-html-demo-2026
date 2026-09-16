# 社科智联 / 社科智研 · HTML 演示站

湖北省社科联 × 荆楚网「社科研究与理论宣讲数智化平台」的高保真静态演示原型。
纯 HTML + CSS + 原生 JS，无框架、无构建、无第三方依赖，可直接双击运行。

## 版本信息

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| V1 | 2026-09-11 | 首版：门户首页、社科智研产品门户、工作台页面和账号中心 |
| V2 | 2026-09-11 | 对比度、设计令牌、圆角、按钮状态和设计系统整改 |
| V3 | 2026-09-11 | 补全骨架态、研究助手交互和设计体系校准；原项目已归档到 `v3/` |
| V4 | 2026-09-16 | 重构工作台、我的知识、共享社区、社科智审和精读工具；恢复社科智联官网首页并接入产品门户 |
| V4.1 | 2026-09-16 | 20260916-调整项目结构：社科智联官网作为根 `index.html`，产品门户和工作台迁入 `pages/`，补齐官网资源并统一页面入口与相对路径 |

当前根目录以 V4.1 为主版本：

- `index.html` 为社科智联官网首页。
- `pages/social-research-home.html` 为社科智研产品门户。
- `pages/research-assistant.html` 为 V4 社科智研工作台。
- V3 原始项目保留在 `v3/`，用于对照和回溯。

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
| `index.html` | 社科智联官网首页 | 品牌首屏、最新动态、核心能力、社科智研产品入口、生态共建和二维码信息 |
| `pages/social-research-home.html` | 社科智研产品门户 | 产品能力、工作流程、应用场景、安全可信和工作台入口 |
| `pages/research-assistant.html` | 社科智研工作台 | 新建会话、历史会话、深度研究列表、我的知识、共享社区、社科智审、设置和账号状态 |
| `pages/my-knowledge.html` | 我的知识 | 单文件管理、上传、收藏、共享审核、分类标签、分页和文件操作 |
| `pages/shared-community.html` | 共享社区 | 社区共享与官方精选筛选、搜索、排序、收藏、共享审核和文件阅读入口 |
| `pages/social-review.html` | 社科智审 | 文件提交、动态分析过程、分析日志、结果报告、风险项和历史任务 |
| `pages/reader.html` | 精读工具 | 独立阅读窗口，支持目录、划词总结/翻译/解释、提问、笔记、高亮、下划线和收藏下载 |
| `pages/account-center.html` | 账号中心 | 账号资料、安全设置、积分和消息 |
| `pages/deep-research.html` | 深度研究 | 来源汇集、研究过程、研究对话和成果预览；当前保留，入口已断开，待重新设计 |

主访问路径为：

`index.html` → `pages/social-research-home.html` → `pages/research-assistant.html`

精读工具从我的知识和共享社区的文件卡片新标签页打开。

## 目录结构

```text
html-demo/
├─ index.html                  # 社科智联官网首页
├─ pages/
│  ├─ social-research-home.html
│  ├─ research-assistant.html
│  ├─ my-knowledge.html
│  ├─ shared-community.html
│  ├─ social-review.html
│  ├─ reader.html
│  ├─ deep-research.html
│  └─ account-center.html
├─ assets/
│  ├─ css/
│  │  ├─ tokens.css            # 设计令牌与深浅模式变量
│  │  ├─ base.css              # 基础重置与排版
│  │  ├─ components.css        # 通用按钮、表单、弹窗和 Toast
│  │  ├─ portal.css            # 产品门户页面样式
│  │  ├─ social-union-home.css # 社科智联官网首页样式
│  │  ├─ app-shell.css         # 工作台侧栏、顶栏和用户区
│  │  ├─ research-assistant.css # 工作台与历史会话共享样式
│  │  ├─ v4.css                # V4 工作台专用样式
│  │  └─ <page>.css            # 各页面专用样式
│  ├─ js/
│  │  ├─ icons.js              # SVG 图标注入
│  │  ├─ main.js               # 基础交互和 Toast
│  │  ├─ auth.js               # 登录、注册和退出
│  │  ├─ social-union-home.js  # 官网首页交互
│  │  ├─ app-shell.js          # 侧栏、设置和快捷键
│  │  ├─ research-assistant.js # 工作台会话交互
│  │  ├─ v4.js                 # V4 工作台逻辑
│  │  └─ <page>.js             # 各页面专用逻辑
│  ├─ img/
│  │  └─ grid-pattern.svg
│  └─ images/social-union/     # 官网二维码和默认头像
├─ v3/                         # V3 原始项目归档
│  ├─ index.html
│  ├─ pages/
│  ├─ assets/
│  └─ README.md
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
- 快捷键：`Ctrl+K` 新建会话，`Ctrl+B` 收起或展开侧栏。
- 精读工具使用独立标签页打开，不显示工作台侧边栏。
- 未接入的真实功能统一使用 Toast 提示，避免误跳转。

## 开发约定

- 根 `index.html` 为社科智联官网首页，产品门户和工作台统一放在 `pages/`。
- `pages/` 页面引用资源使用 `../assets/`，返回官网首页使用 `../index.html`。
- V4 工作台入口为 `pages/research-assistant.html`，业务页面中的“新建会话”和“设置”均指向该文件。
- 颜色、圆角、阴影、动效和风险状态优先使用 `tokens.css` 变量，不直接写重复魔法值。
- 图标通过 `data-icon="name"` 声明，由 `icons.js` 注入，不在页面内联 SVG。
- 页面级样式和脚本使用 `assets/css/<page>.css`、`assets/js/<page>.js`，公共逻辑不要复制到页面脚本。
- 中文文案、`aria-*`、键盘操作和 `prefers-reduced-motion` 按现有页面规范维护。

## 已知限制

- 纯前端演示：无后端接口、无真实鉴权和无持久化业务数据；刷新后仅保留浏览器本地状态。
- 文件上传、下载、共享审核、分析报告和精读内容均为模拟流程。
- `pages/deep-research.html` 已保留，但当前不与其他页面入口连接，后续重新设计。
- V3 保留在 `v3/`，其页面结构和资源引用保持归档状态。

仓库分支为 `main`，远端为：

`https://github.com/journey-roadside/skl-html-demo-2026.git`
