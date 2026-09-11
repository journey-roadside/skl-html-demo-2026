# 社科智联 / 社科智研 · HTML 演示站

湖北省社科联 × 荆楚网「社科研究与理论宣讲数智化平台」的高保真静态演示原型。
纯 HTML + CSS + 原生 JS，无框架、无构建、无第三方依赖，双击即可运行。

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
| `index.html` | 社科智联门户首页 | Hero 首屏（canvas 动效 + 数字滚动）、最新动态、四大核心能力、社科伦理AI审查、生态共建、关于与二维码、页脚 |
| `pages/social-research-home.html` | 社科智研产品门户 | 产品能力 / 工作流程 / 应用场景 / 安全可信，入口指向工作台 |
| `pages/research-assistant.html` | 社科研究助手工作台 | 问答对话、消息操作（复制 / 重新生成 / 来源 / 反馈 / 播报）、引用来源面板、历史提问面板、文件与语音输入 |
| `pages/knowledge-base.html` | 知识社区 | 分类筛选、搜索、知识卡片、分页、新建知识弹窗 |
| `pages/deep-research.html` | 深度研究 | 两阶段流程：来源采集页 → 研究空间（对话 + 产出工作区），含来源弹窗 |
| `pages/social-review.html` | 社科智审 | 审查任务队列、多维度审查 Tab（真实性 / 价值导向 / AI 伦理）、新建审查与结果弹窗 |
| `pages/literature-reader.html` | 文献精读 | 文献库 / 我的文献、长文阅读、划词工具栏（总结 / 翻译 / 解释）、笔记、收藏下载 |
| `pages/account-center.html` | 账号中心 | 账号资料、安全设置、积分、消息 |

站点导航路径：`index.html` → `pages/social-research-home.html` → 五个工作台页面 → `pages/account-center.html`。

## 目录结构

```
html-demo/
├─ index.html                  # 门户首页
├─ pages/                      # 其余 7 个页面
└─ assets/
   ├─ css/
   │  ├─ tokens.css            # 设计令牌（配色 / 字体 / 圆角 / 阴影 / 动效，含 .dark 深色变量）
   │  ├─ base.css              # 基础重置与排版
   │  ├─ components.css        # 通用组件（按钮 / 表单 / 弹窗 / toast 等）
   │  ├─ portal.css            # 门户类页面外壳
   │  ├─ app-shell.css         # 工作台外壳（侧边栏 / 顶栏 / 面板）
   │  ├─ social-union-home.css # 门户首页专用
   │  └─ <page>.css            # 各页面专用样式
   ├─ js/
   │  ├─ icons.js              # SVG 图标注入（HTML 中写 data-icon="xxx"）
   │  ├─ main.js               # 公共交互：顶栏滚动、移动端抽屉、toast
   │  ├─ auth.js               # 登录 / 注册 / 退出弹窗与登录态
   │  ├─ app-shell.js          # 工作台侧边栏折叠、历史对话面板、快捷键
   │  └─ <page>.js             # 各页面专用逻辑
   ├─ img/                     # brand-mark.svg、grid-pattern.svg
   └─ images/social-union/     # 二维码、默认头像
```

样式与脚本按「tokens → base → components → 外壳 → 页面」的顺序引入，页面级文件只放该页独有规则。

## 交互与状态

- 页面切换、Tab、筛选、弹窗、分页、划词工具栏、复制 / 反馈等交互均已实现，数据为页面内静态假数据。
- 登录态：`localStorage["sheke-demo-user"]`（`assets/js/auth.js`）。
- 侧边栏折叠态：`localStorage["sheke-sidebar-collapsed"]`（`assets/js/app-shell.js`）。
- 快捷键：`Ctrl+J` 新建对话，`Ctrl+K` 搜索历史对话。
- 未实现的入口统一用 `data-toast="…后续接入"` 点击提示，页面内共约 30 处，代表待接入的真实功能点。

## 开发约定

- 新增一个工作台页面：复制任一 `pages/*.html` 骨架，保留 5 项侧边栏导航（研究助手 / 知识社区 / 深度研究 / 社科智审 / 文献精读）与当前页 `is-active` 标记，引入 4 个公共 CSS（tokens / base / components / app-shell）与 4 个公共 JS（icons / main / auth / app-shell），再追加本页 `xxx.css` / `xxx.js`。
- 颜色、圆角、阴影、动效一律用 `tokens.css` 变量，不写魔法值。
- 图标只用 `data-icon` 占位，由 `icons.js` 注入，不直接内联 SVG（门户首页的品牌图形除外）。
- 中文文案、`aria-*` 与语义标签保持现有风格。

## 已知限制

- 纯前端演示：无后端接口、无真实鉴权、无持久化数据；刷新后仅登录态与侧边栏状态保留。
- 视频播放、动态列表、入驻申请等入口为占位提示，尚未接入。
- 仓库 `main` 分支，远端 `https://github.com/journey-roadside/skl-html-demo-2026.git`。
