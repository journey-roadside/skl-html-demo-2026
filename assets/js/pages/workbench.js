(function () {
  "use strict";

  /* 统一工作台壳：侧栏与用户区单源注入，页面只保留 <div class="workbench-shell"> 与内容区 */
  const SHELL_SIDEBAR = `    <header class="workbench-header">
      <input class="visually-hidden workbench-sidebar__state" type="checkbox" id="workbench-sidebar-state">
      <div class="workbench-header__top">
        <label class="workbench-brand__mark" for="workbench-sidebar-state" aria-label="展开侧边栏" data-rail-tip="展开侧边栏（Ctrl+Alt+B）">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M9 3v18"></path>
            <path d="m14 9 3 3-3 3"></path>
          </svg>
        </label>
        <div class="workbench-brand__home">
          <span class="workbench-brand__name">湖北社科数据信息联盟</span>
          <span class="workbench-brand__en">SOCIAL SCIENCE UNION</span>
        </div>
        <label class="workbench-sidebar__toggle" for="workbench-sidebar-state" aria-label="收起侧边栏" data-rail-tip="收起侧边栏（Ctrl+Alt+B）">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M9 3v18"></path>
          </svg>
        </label>
      </div>

      <nav class="workbench-nav" aria-label="产品导航">
        <a class="workbench-nav__link" href="./knowledge-alliance.html" data-rail-tip="知识联盟" aria-label="知识联盟">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 7v14"></path>
            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 .4-.8A7 7 0 0 1 12 4a7 7 0 0 1 9.6-.8 1 1 0 0 1 .4.8v13a1 1 0 0 1-1 1"></path>
            <path d="M3 18a7 7 0 0 1 9-1 7 7 0 0 1 9 1"></path>
          </svg>
          <span>知识联盟</span>
        </a>
        <a class="workbench-nav__link" href="./research-assistant.html" data-rail-tip="社科助手" aria-label="社科助手">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9z"></path>
            <path d="M5 3v4"></path>
            <path d="M3 5h4"></path>
            <path d="M19 17v4"></path>
            <path d="M17 19h4"></path>
          </svg>
          <span>社科助手</span>
        </a>
        <a class="workbench-nav__link" href="./my-knowledge.html" data-rail-tip="我的知识" aria-label="我的知识">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"></path>
            <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"></path>
          </svg>
          <span>我的知识</span>
        </a>
      </nav>



      <section class="workbench-section workbench-agent-section" aria-labelledby="workbenchAgentTitle">
        <details class="workbench-section__details" open>
          <summary class="workbench-section__summary">
            <span id="workbenchAgentTitle">智能体</span>
            <svg class="workbench-section__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            <span class="workbench-section__summary-spacer" aria-hidden="true"></span>
            <span class="workbench-section__actions">
              <a class="workbench-section__action" href="./agent-square.html" data-summary-action aria-label="查看全部智能体">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m19 5 3-3"></path>
                  <path d="m2 22 3-3"></path>
                  <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"></path>
                  <path d="M7.5 13.5 10 11"></path>
                  <path d="M10.5 16.5 13 14"></path>
                  <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"></path>
                </svg>
              </a>
            </span>
          </summary>
          <div class="workbench-agent-list">
          <div class="workbench-agent-row">
            <a class="workbench-agent" href="./agent-square.html#agent-research" data-agent-menu-trigger data-rail-tip="智能体" aria-label="智能体">
              <svg class="workbench-icon workbench-agent__icon--expanded" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
              <svg class="workbench-icon workbench-agent__icon--collapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m19 5 3-3"></path>
                <path d="m2 22 3-3"></path>
                <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"></path>
                <path d="M7.5 13.5 10 11"></path>
                <path d="M10.5 16.5 13 14"></path>
                <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"></path>
              </svg>
              <span class="workbench-agent__name">荆楚智研</span>
            </a>
          </div>
          <div class="workbench-agent-row">
            <a class="workbench-agent" href="./agent-square.html#agent-review">
              <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
              <span class="workbench-agent__name">荆楚智审</span>
            </a>
          </div>
          </div>
        </details>
        <div class="workbench-agent-menu" id="workbench-agent-menu" role="menu" hidden>
          <a class="workbench-agent-menu__item" role="menuitem" href="./agent-square.html#agent-research">
            <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
            <span class="workbench-agent__name">荆楚智研</span>
          </a>
          <a class="workbench-agent-menu__item" role="menuitem" href="./agent-square.html#agent-review">
            <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
            <span class="workbench-agent__name">荆楚智审</span>
          </a>
          <div class="workbench-agent-menu__separator" role="separator"></div>
          <a class="workbench-agent-menu__item" href="./agent-square.html" role="menuitem">
            <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m19 5 3-3"></path>
              <path d="m2 22 3-3"></path>
              <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"></path>
              <path d="M7.5 13.5 10 11"></path>
              <path d="M10.5 16.5 13 14"></path>
              <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"></path>
            </svg>
            <span class="workbench-agent__name">智能体广场</span>
          </a>
        </div>
      </section>

      <div class="workbench-rail-actions" aria-label="折叠侧栏快捷入口">
        <a class="workbench-rail-action" href="./projects.html" aria-label="项目列表" data-rail-tip="项目">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M8 6h13"></path>
            <path d="M8 12h13"></path>
            <path d="M8 18h13"></path>
            <path d="M3 6h.01"></path>
            <path d="M3 12h.01"></path>
            <path d="M3 18h.01"></path>
          </svg>
        </a>
        <a class="workbench-rail-action" href="research-assistant.html" aria-label="新建社科助手对话" data-rail-tip="新建对话（Ctrl+Alt+K）">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            <path d="M8 12h8"></path>
            <path d="M12 8v8"></path>
          </svg>
        </a>
        <button class="workbench-rail-action" type="button" aria-label="搜索会话" data-rail-tip="会话搜索（Ctrl+Alt+J）" data-dialog-search-open>
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </button>
      </div>

      <div class="workbench-scroll">

        <section class="workbench-section workbench-section--scroll" aria-labelledby="workbenchProjectTitle">
          <details class="workbench-section__details" open>
            <summary class="workbench-section__summary">
              <span id="workbenchProjectTitle">项目</span>
              <svg class="workbench-section__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
              <span class="workbench-section__summary-spacer" aria-hidden="true"></span>
              <span class="workbench-section__actions">
                <a class="workbench-section__action" href="./projects.html" data-summary-action aria-label="项目视图">
                  <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M8 6h13"></path>
                    <path d="M8 12h13"></path>
                    <path d="M8 18h13"></path>
                    <path d="M3 6h.01"></path>
                    <path d="M3 12h.01"></path>
                    <path d="M3 18h.01"></path>
                  </svg>
                </a>
                <button class="workbench-section__action" type="button" data-summary-action aria-label="新建项目">
                  <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
              </span>
            </summary>
            <div class="workbench-projects">
            <div class="workbench-project">
              <input class="visually-hidden workbench-project__state" type="checkbox" id="workbench-project-toggle-1" aria-label="切换项目：基层公共文化服务数字化研究" data-project-state>
              <div class="workbench-project__row">
                <label class="workbench-project__toggle" for="workbench-project-toggle-1" data-project-toggle>
                  <svg class="workbench-project__folder workbench-project__folder--closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <svg class="workbench-project__folder workbench-project__folder--open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </label>
                <a class="workbench-project__title" href="./projects.html?project=%E5%9F%BA%E5%B1%82%E5%85%AC%E5%85%B1%E6%96%87%E5%8C%96%E6%9C%8D%E5%8A%A1%E6%95%B0%E5%AD%97%E5%8C%96%E7%A0%94%E7%A9%B6#project-detail">基层公共文化服务数字化研究</a>
              </div>
              <ul class="workbench-project__children" id="workbench-project-toggle-1-panel" data-project-panel>
<li class="workbench-project__child-row">
  <button class="workbench-project__child" type="button">政策脉络梳理</button>
  <button class="workbench-row-action" type="button" aria-label="更多操作：政策脉络梳理">
    <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1"></circle>
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
    </svg>
  </button>
</li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">典型案例对比</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：典型案例对比">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">县域供给能力评估</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：县域供给能力评估">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
              </ul>
              <button class="workbench-row-action" type="button" aria-label="更多操作：基层公共文化服务数字化研究">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>

            <div class="workbench-project">
              <input class="visually-hidden workbench-project__state" type="checkbox" id="workbench-project-toggle-2" aria-label="切换项目：区域社科成果知识图谱" data-project-state>
              <div class="workbench-project__row">
                <label class="workbench-project__toggle" for="workbench-project-toggle-2" data-project-toggle>
                  <svg class="workbench-project__folder workbench-project__folder--closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <svg class="workbench-project__folder workbench-project__folder--open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </label>
                <a class="workbench-project__title" href="./projects.html?project=%E5%8C%BA%E5%9F%9F%E7%A4%BE%E7%A7%91%E6%88%90%E6%9E%9C%E7%9F%A5%E8%AF%86%E5%9B%BE%E8%B0%B1#project-detail">区域社科成果知识图谱</a>
              </div>
              <ul class="workbench-project__children" id="workbench-project-toggle-2-panel" data-project-panel>
<li class="workbench-project__child-row">
  <button class="workbench-project__child" type="button">数据来源梳理</button>
  <button class="workbench-row-action" type="button" aria-label="更多操作：数据来源梳理">
    <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1"></circle>
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
    </svg>
  </button>
</li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">知识图谱框架</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：知识图谱框架">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">机构成果关联分析</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：机构成果关联分析">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
              </ul>
              <button class="workbench-row-action" type="button" aria-label="更多操作：区域社科成果知识图谱">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>

            <div class="workbench-project">
              <input class="visually-hidden workbench-project__state" type="checkbox" id="workbench-project-toggle-3" aria-label="切换项目：数字政府公共服务协同机制" data-project-state>
              <div class="workbench-project__row">
                <label class="workbench-project__toggle" for="workbench-project-toggle-3" data-project-toggle>
                  <svg class="workbench-project__folder workbench-project__folder--closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <svg class="workbench-project__folder workbench-project__folder--open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </label>
                <a class="workbench-project__title" href="./projects.html?project=%E6%95%B0%E5%AD%97%E6%94%BF%E5%BA%9C%E5%85%AC%E5%85%B1%E6%9C%8D%E5%8A%A1%E5%8D%8F%E5%90%8C%E6%9C%BA%E5%88%B6#project-detail">数字政府公共服务协同机制</a>
              </div>
              <ul class="workbench-project__children" id="workbench-project-toggle-3-panel" data-project-panel>
<li class="workbench-project__child-row">
  <button class="workbench-project__child" type="button">跨部门协同模式</button>
  <button class="workbench-row-action" type="button" aria-label="更多操作：跨部门协同模式">
    <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1"></circle>
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
    </svg>
  </button>
</li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">用户需求分层</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：用户需求分层">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">绩效指标设计</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：绩效指标设计">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
              </ul>
              <button class="workbench-row-action" type="button" aria-label="更多操作：数字政府公共服务协同机制">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>

            <div class="workbench-project">
              <input class="visually-hidden workbench-project__state" type="checkbox" id="workbench-project-toggle-4" aria-label="切换项目：荆楚文化数字化传播研究" data-project-state>
              <div class="workbench-project__row">
                <label class="workbench-project__toggle" for="workbench-project-toggle-4" data-project-toggle>
                  <svg class="workbench-project__folder workbench-project__folder--closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <svg class="workbench-project__folder workbench-project__folder--open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </label>
                <a class="workbench-project__title" href="./projects.html?project=%E8%8D%86%E6%A5%9A%E6%96%87%E5%8C%96%E6%95%B0%E5%AD%97%E5%8C%96%E4%BC%A0%E6%92%AD%E7%A0%94%E7%A9%B6#project-detail">荆楚文化数字化传播研究</a>
              </div>
              <ul class="workbench-project__children" id="workbench-project-toggle-4-panel" data-project-panel>
<li class="workbench-project__child-row">
  <button class="workbench-project__child" type="button">文化资源目录</button>
  <button class="workbench-row-action" type="button" aria-label="更多操作：文化资源目录">
    <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1"></circle>
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
    </svg>
  </button>
</li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">传播渠道对比</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：传播渠道对比">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">受众画像分析</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：受众画像分析">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
              </ul>
              <button class="workbench-row-action" type="button" aria-label="更多操作：荆楚文化数字化传播研究">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>

            <div class="workbench-project">
              <input class="visually-hidden workbench-project__state" type="checkbox" id="workbench-project-toggle-5" aria-label="切换项目：长江经济带绿色发展评价" data-project-state>
              <div class="workbench-project__row">
                <label class="workbench-project__toggle" for="workbench-project-toggle-5" data-project-toggle>
                  <svg class="workbench-project__folder workbench-project__folder--closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <svg class="workbench-project__folder workbench-project__folder--open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </label>
                <a class="workbench-project__title" href="./projects.html?project=%E9%95%BF%E6%B1%9F%E7%BB%8F%E6%B5%8E%E5%B8%A6%E7%BB%BF%E8%89%B2%E5%8F%91%E5%B1%95%E8%AF%84%E4%BB%B7#project-detail">长江经济带绿色发展评价</a>
              </div>
              <ul class="workbench-project__children" id="workbench-project-toggle-5-panel" data-project-panel>
<li class="workbench-project__child-row">
  <button class="workbench-project__child" type="button">指标体系构建</button>
  <button class="workbench-row-action" type="button" aria-label="更多操作：指标体系构建">
    <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1"></circle>
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
    </svg>
  </button>
</li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">区域差异分析</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：区域差异分析">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">政策成效评估</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：政策成效评估">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
              </ul>
              <button class="workbench-row-action" type="button" aria-label="更多操作：长江经济带绿色发展评价">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>

            <div class="workbench-project">
              <input class="visually-hidden workbench-project__state" type="checkbox" id="workbench-project-toggle-6" aria-label="切换项目：社科成果转化路径研究" data-project-state>
              <div class="workbench-project__row">
                <label class="workbench-project__toggle" for="workbench-project-toggle-6" data-project-toggle>
                  <svg class="workbench-project__folder workbench-project__folder--closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <svg class="workbench-project__folder workbench-project__folder--open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                  <svg class="workbench-project__chevron workbench-project__chevron--right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </label>
                <a class="workbench-project__title" href="./projects.html?project=%E7%A4%BE%E7%A7%91%E6%88%90%E6%9E%9C%E8%BD%AC%E5%8C%96%E8%B7%AF%E5%BE%84%E7%A0%94%E7%A9%B6#project-detail">社科成果转化路径研究</a>
              </div>
              <ul class="workbench-project__children" id="workbench-project-toggle-6-panel" data-project-panel>
<li class="workbench-project__child-row">
  <button class="workbench-project__child" type="button">转化机制梳理</button>
  <button class="workbench-row-action" type="button" aria-label="更多操作：转化机制梳理">
    <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="5" cy="12" r="1"></circle>
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
    </svg>
  </button>
</li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">典型模式比较</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：典型模式比较">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
                  <li class="workbench-project__child-row">
                    <button class="workbench-project__child" type="button">评价标准设计</button>
                    <button class="workbench-row-action" type="button" aria-label="更多操作：评价标准设计">
                      <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </li>
              </ul>
              <button class="workbench-row-action" type="button" aria-label="更多操作：社科成果转化路径研究">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
          </details>
        </section>

        <section class="workbench-section workbench-section--scroll" aria-labelledby="workbenchDialogTitle">
          <details class="workbench-section__details" open>
            <summary class="workbench-section__summary">
              <span id="workbenchDialogTitle">对话</span>
              <svg class="workbench-section__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
              <span class="workbench-section__summary-spacer" aria-hidden="true"></span>
              <span class="workbench-section__actions">
                <button class="workbench-section__action" type="button" data-summary-action data-dialog-search-open aria-label="搜索对话">
                  <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </button>
                <button class="workbench-section__action" type="button" data-summary-action data-dialog-manage-toggle aria-label="管理对话">
                  <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m3 17 2 2 4-4"></path>
                    <path d="m3 7 2 2 4-4"></path>
                    <path d="M13 6h8"></path>
                    <path d="M13 12h8"></path>
                    <path d="M13 18h8"></path>
                  </svg>
                </button>
                <button class="workbench-section__action workbench-dialog-manage-only" type="button" data-summary-action data-dialog-manage-exit aria-label="取消管理">
                  <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
                <a class="workbench-section__action" href="./research-assistant.html" aria-label="新建对话">
                  <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </a>
              </span>
            </summary>
            <div class="workbench-dialogs">
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">湖北省社科研究热点分析</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：湖北省社科研究热点分析">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">理论宣讲材料提纲</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：理论宣讲材料提纲">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">基层治理典型案例检索</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：基层治理典型案例检索">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">社科基金申报选题建议</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：社科基金申报选题建议">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">网络舆情风险评估</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：网络舆情风险评估">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">科技成果转化政策问答</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：科技成果转化政策问答">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">社会调查问卷设计</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：社会调查问卷设计">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">研究综述框架生成</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：研究综述框架生成">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">湖北省数字政府建设评估</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：湖北省数字政府建设评估">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">荆楚文化资源知识图谱</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：荆楚文化资源知识图谱">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">长江流域生态治理案例</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：长江流域生态治理案例">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">基层社会治理创新路径</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：基层社会治理创新路径">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">社科普及活动传播效果</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：社科普及活动传播效果">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">县域文旅融合发展策略</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：县域文旅融合发展策略">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">老龄社会公共服务供给</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：老龄社会公共服务供给">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">网络空间意识形态风险</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：网络空间意识形态风险">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">城市社区韧性治理研究</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：城市社区韧性治理研究">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">高校智库成果转化机制</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：高校智库成果转化机制">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">乡村振兴政策实施评估</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：乡村振兴政策实施评估">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">公共数据开放利用研究</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：公共数据开放利用研究">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">青年群体文化认同调查</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：青年群体文化认同调查">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">社科成果评价体系优化</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：社科成果评价体系优化">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            <div class="workbench-dialog-row">
              <button class="workbench-dialog__title" type="button">湖北非遗数字化保护</button>
              <button class="workbench-row-action" type="button" aria-label="更多操作：湖北非遗数字化保护">
                <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1"></circle>
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
            </div>
          </details>
        </section>
      </div>

      <div class="workbench-dialog-manage-actions" data-dialog-manage-actions hidden>
        <button type="button" data-dialog-manage-archive disabled>
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="20" height="5" x="2" y="3" rx="1"></rect>
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
            <path d="M10 12h4"></path>
          </svg>
          <span>归档</span>
        </button>
        <button type="button" data-dialog-manage-delete disabled>
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>删除</span>
          <strong data-dialog-manage-count></strong>
        </button>
      </div>

      <div class="workbench-row-menu" id="workbench-row-menu" role="menu" aria-label="列表操作" hidden></div>
    </header>`;
  const SHELL_USER = `    <footer class="workbench-user">
      <div class="workbench-user__row">
        <button class="workbench-user__profile" type="button" data-user-menu-trigger aria-haspopup="menu" aria-expanded="false" aria-controls="workbench-user-menu">
          <span class="workbench-user__avatar" aria-hidden="true">研</span>
          <span class="workbench-user__name">社科研究员</span>
        </button>
        <button class="workbench-user__messages" type="button" data-message-center-open aria-haspopup="dialog" aria-expanded="false" aria-controls="workbench-message-center" aria-label="消息，3 条未读">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
          </svg>
          <span class="workbench-user__badge" data-message-dot aria-hidden="true"></span>
        </button>
      </div>

      <div class="workbench-user-menu" id="workbench-user-menu" data-user-menu role="menu" aria-label="用户菜单" hidden>
        <div class="workbench-user-menu__profile">
          <span class="workbench-user__avatar" aria-hidden="true">研</span>
          <span class="workbench-user-menu__profile-copy">
            <strong>社科研究员</strong>
            <small>湖北省社会科学界联合会</small>
          </span>
        </div>
        <div class="workbench-user-menu__divider" aria-hidden="true"></div>
        <div class="workbench-user-menu__group">
          <button type="button" role="menuitem">
            <svg class="workbench-user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="8" cy="8" r="4"></circle>
              <circle cx="16" cy="16" r="4"></circle>
              <path d="M11 11l2 2"></path>
            </svg>
            <span>积分余额</span>
            <strong>268</strong>
          </button>
          <button type="button" role="menuitem">
            <svg class="workbench-user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4"></circle>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
            </svg>
            <span>账号中心</span>
            <svg class="workbench-user-menu__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </button>
          <button type="button" role="menuitem" data-settings-open>
            <svg class="workbench-user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 21v-7"></path>
              <path d="M4 10V3"></path>
              <path d="M12 21v-9"></path>
              <path d="M12 8V3"></path>
              <path d="M20 21v-5"></path>
              <path d="M20 12V3"></path>
              <path d="M1 14h6"></path>
              <path d="M9 8h6"></path>
              <path d="M17 16h6"></path>
            </svg>
            <span>设置</span>
          </button>
        </div>
        <div class="workbench-user-menu__divider" aria-hidden="true"></div>
        <div class="workbench-user-menu__group">
          <a role="menuitem" href="../index.html">
            <svg class="workbench-user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <span>关于我们</span>
          </a>
          <button type="button" role="menuitem">
            <svg class="workbench-user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M9.1 9a3 3 0 1 1 5.5 1.6c-.8 1.1-2.1 1.5-2.6 2.8"></path>
              <path d="M12 17h.01"></path>
            </svg>
            <span>帮助中心</span>
          </button>
          <button type="button" role="menuitem" data-feedback-open>
            <svg class="workbench-user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <path d="M7 8h10"></path>
              <path d="M7 12h6"></path>
            </svg>
            <span>问题反馈</span>
          </button>
        </div>
      </div>

      <section class="workbench-message-center" id="workbench-message-center" data-message-center role="dialog" aria-label="消息通知" hidden>
        <div class="workbench-message-center__head">
          <div>
            <strong>消息通知</strong>
            <span data-message-count>3 条未读</span>
          </div>
          <button type="button" data-message-read-all>全部已读</button>
        </div>
        <div class="workbench-message-center__list">
          <button class="workbench-message-center__item is-unread" type="button">
            <span class="workbench-message-center__item-head"><strong>深度研究已完成</strong><time>10 分钟前</time></span>
            <span class="workbench-message-center__item-copy">“基层公共文化服务数字化研究”已生成研究摘要与来源清单。</span>
          </button>
          <button class="workbench-message-center__item is-unread" type="button">
            <span class="workbench-message-center__item-head"><strong>积分已到账</strong><time>今天 09:20</time></span>
            <span class="workbench-message-center__item-copy">内容贡献通过审核，已获得 30 积分。</span>
          </button>
          <button class="workbench-message-center__item is-unread" type="button">
            <span class="workbench-message-center__item-head"><strong>账号安全提示</strong><time>昨天 18:03</time></span>
            <span class="workbench-message-center__item-copy">你的账号在新设备上完成登录，如非本人操作请及时处理。</span>
          </button>
        </div>
      </section>

      <dialog class="workbench-search" data-dialog-search aria-labelledby="workbenchSearchTitle">
        <div class="workbench-search__head">
          <div class="workbench-search__headings">
            <h2 class="workbench-search__title" id="workbenchSearchTitle">搜索对话</h2>
            <p class="workbench-search__desc">输入关键词查找当前工作台中的会话</p>
          </div>
          <button class="workbench-search__close" type="button" data-dialog-search-close aria-label="关闭搜索">
            <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        <label class="workbench-search__field">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input class="workbench-search__input" type="search" data-dialog-search-input placeholder="输入会话标题搜索" aria-label="输入会话标题搜索" autocomplete="off">
        </label>
        <div class="workbench-search__list" data-dialog-search-list></div>
      </dialog>

      <dialog class="workbench-confirm" data-dialog-confirm aria-labelledby="workbenchConfirmTitle">
        <h2 class="workbench-confirm__title" id="workbenchConfirmTitle" data-dialog-confirm-title>删除</h2>
        <p class="workbench-confirm__desc" data-dialog-confirm-desc></p>
        <div class="workbench-confirm__actions">
          <button class="workbench-confirm__button" type="button" data-dialog-confirm-cancel>取消</button>
          <button class="workbench-confirm__button workbench-confirm__button--danger" type="button" data-dialog-confirm-ok>删除</button>
        </div>
      </dialog>

      <dialog class="workbench-confirm" data-dialog-prompt aria-labelledby="workbenchPromptTitle">
        <h2 class="workbench-confirm__title" id="workbenchPromptTitle" data-dialog-prompt-title>重命名</h2>
        <label class="workbench-confirm__label" for="workbenchPromptInput">名称</label>
        <input class="workbench-prompt__input" id="workbenchPromptInput" type="text" data-dialog-prompt-input>
        <div class="workbench-confirm__actions">
          <button class="workbench-confirm__button" type="button" data-dialog-prompt-cancel>取消</button>
          <button class="workbench-confirm__button workbench-confirm__button--primary" type="button" data-dialog-prompt-ok>确定</button>
        </div>
      </dialog>
    </footer>`;

  const shell = document.querySelector(".workbench-shell");
  if (!shell) return;

  /* 壳层随页面状态：导航高亮、项目新建入口 */
  const applyShellState = function () {
    const page = (window.location.pathname.split("/").pop() || "").toLowerCase();

    /* 导航项与 rail 上"跳到某页"的入口按当前页高亮；
       收起态的「新建对话」是动作入口（点了开新会话），不给选中态 */
    document
      .querySelectorAll('.workbench-nav__link, .workbench-rail-action[href]:not([href="research-assistant.html"])')
      .forEach(function (link) {
        const isActive = (link.getAttribute("href") || "").replace("./", "") === page;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });

    const create = document.querySelector('.workbench-section__action[aria-label="新建项目"]');
    if (create) {
      if (page === "projects.html") {
        create.setAttribute("data-project-create-trigger", "");
      } else {
        /* 新建项目弹窗只在项目列表页（projects.js 仅该页加载）：跳转过去并由该页打开弹窗 */
        create.addEventListener("click", function () {
          window.location.href = "./projects.html?create=1";
        });
      }
    }

    if (page === "projects.html") {
      const summary = document.querySelector('.workbench-section__action[href="./projects.html"]');
      if (summary) summary.setAttribute("aria-current", "page");
    }
  };

  if (!shell.querySelector(".workbench-header")) {
    shell.insertAdjacentHTML("afterbegin", SHELL_SIDEBAR);
    shell.insertAdjacentHTML("beforeend", SHELL_USER);
  }
  applyShellState();

  const scrollRegion = document.querySelector(".workbench-scroll");
  if (!scrollRegion) return;

  const sidebar = document.querySelector(".workbench-header");
  const sidebarState = document.querySelector(".workbench-sidebar__state");
  const agentTrigger = document.querySelector("[data-agent-menu-trigger]");
  const agentMenu = document.querySelector("#workbench-agent-menu");

  /* 侧边栏收起状态持久化：跨页面跳转后保持收起或展开 */
  const SIDEBAR_STATE_KEY = "sheke-sidebar-collapsed";

  const readSidebarCollapsed = function () {
    try {
      return localStorage.getItem(SIDEBAR_STATE_KEY) === "true";
    } catch (error) {
      return false;
    }
  };

  const saveSidebarCollapsed = function (collapsed) {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, collapsed ? "true" : "false");
    } catch (error) {
      /* 隐私模式下存储不可用时忽略，仅本次会话生效 */
    }
  };

  /* 提示气泡用真实元素承载（不用 <span>：收起态 .workbench-nav__link > span 的
     overflow: hidden 会把指向箭头裁掉；伪元素又不可靠） */
  document.querySelectorAll("[data-rail-tip]").forEach(function (el) {
    const tip = document.createElement("div");
    tip.className = "workbench-tip";
    tip.setAttribute("aria-hidden", "true");
    tip.textContent = el.getAttribute("data-rail-tip");
    el.appendChild(tip);
  });

  /* 收起侧栏的图标提示（样式在 workbench-shell.css）：点击后立即收起，指针离开再恢复 */
  document.addEventListener("click", function (event) {
    const tip = event.target.closest("[data-rail-tip]");
    if (!tip || tip.classList.contains("is-tip-off")) return;
    tip.classList.add("is-tip-off");
    tip.addEventListener("mouseleave", function () {
      tip.classList.remove("is-tip-off");
    }, { once: true });
  });

  if (sidebarState) {
    sidebarState.checked = readSidebarCollapsed();
    sidebarState.addEventListener("change", function () {
      saveSidebarCollapsed(sidebarState.checked);
      syncActiveAgent(); /* 收起/展开会改变可见的智能体入口，需重算选中态 */
    });
  }

  const syncActiveAgent = function () {
    const isAgentSquarePage = window.location.pathname.endsWith("/agent-square.html");
    const links = Array.prototype.slice.call(
      document.querySelectorAll('.workbench-agent[href*="agent-square.html#"]')
    );
    if (!links.length) return;

    const hash = window.location.hash;
    const matched = links.find(function (link) {
      return new URL(link.href, window.location.href).hash === hash;
    });

    links.forEach(function (link, index) {
      /* 匹配项高亮；收起侧栏只显示第一行，匹配项不可见时由可见的第一行承担选中态
         （例如收起态下从二级菜单点「荆楚智审」进入 #agent-review） */
      const isActive =
        isAgentSquarePage && (link === matched || (index === 0 && (!matched || !matched.offsetWidth)));
      link.classList.toggle("is-active", isActive);
    });
  };

  const syncActiveProject = function () {
    const isProjectsPage = window.location.pathname.endsWith("/projects.html");
    const activeProject = isProjectsPage && window.location.hash === "#project-detail"
      ? new URLSearchParams(window.location.search).get("project")
      : null;

    document.querySelectorAll(".workbench-project__title").forEach(function (link) {
      const linkProject = new URL(link.href, window.location.href).searchParams.get("project");
      link.classList.toggle("is-active", Boolean(activeProject) && linkProject === activeProject);
    });
  };

  const updateScrollState = function () {
    shell.classList.toggle("is-list-scrolled", scrollRegion.scrollTop > 0);
  };

  const positionAgentMenu = function () {
    if (!agentTrigger || !agentMenu || agentMenu.hidden) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    const triggerRect = agentTrigger.getBoundingClientRect();
    const menuRect = agentMenu.getBoundingClientRect();
    const left = sidebarRect.right + 8;
    const maxTop = window.innerHeight - menuRect.height - 8;
    const top = Math.max(8, Math.min(triggerRect.top, maxTop));

    agentMenu.style.left = left + "px";
    agentMenu.style.top = top + "px";
  };

  const setAgentMenuOpen = function (open, restoreFocus) {
    if (!agentTrigger || !agentMenu || !sidebarState) return;

    const canOpen = Boolean(open && sidebarState.checked);
    agentMenu.hidden = !canOpen;
    agentMenu.classList.toggle("is-open", canOpen);

    if (sidebarState.checked) {
      agentTrigger.setAttribute("aria-expanded", String(canOpen));
    }

    if (canOpen) {
      positionAgentMenu();
      const firstItem = agentMenu.querySelector(".workbench-agent-menu__item");
      if (firstItem) firstItem.focus({ preventScroll: true });
    } else if (restoreFocus) {
      agentTrigger.focus({ preventScroll: true });
    }
  };

  const syncAgentMenuAccessibility = function () {
    if (!agentTrigger || !agentMenu || !sidebarState) return;

    if (sidebarState.checked) {
      agentTrigger.setAttribute("aria-haspopup", "menu");
      agentTrigger.setAttribute("aria-controls", agentMenu.id);
      agentTrigger.setAttribute("aria-expanded", String(!agentMenu.hidden));
    } else {
      agentTrigger.removeAttribute("aria-haspopup");
      agentTrigger.removeAttribute("aria-controls");
      agentTrigger.removeAttribute("aria-expanded");
    }
  };

  document.addEventListener("click", function (event) {
    const action = event.target.closest("[data-summary-action]");
    if (!action) return;
    event.stopPropagation();
    if (action.tagName !== "A") event.preventDefault();
  });

  if (sidebarState && agentTrigger && agentMenu) {
    agentTrigger.addEventListener("click", function (event) {
      if (!sidebarState.checked) return;
      event.preventDefault();
      const willOpen = agentMenu.hidden;
      setAgentMenuOpen(willOpen, !willOpen);
    });

    agentMenu.addEventListener("click", function (event) {
      if (event.target.closest(".workbench-agent-menu__item")) {
        setAgentMenuOpen(false, true);
      }
    });

    document.addEventListener("click", function (event) {
      if (agentMenu.hidden) return;
      if (agentMenu.contains(event.target) || agentTrigger.contains(event.target)) return;
      setAgentMenuOpen(false, false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !agentMenu.hidden) {
        setAgentMenuOpen(false, true);
      }
    });

    sidebarState.addEventListener("change", function () {
      setAgentMenuOpen(false, false);
      syncAgentMenuAccessibility();
    });

    syncAgentMenuAccessibility();
  }

  const userTrigger = document.querySelector("[data-user-menu-trigger]");
  const userMenu = document.querySelector("[data-user-menu]");
  const messageTrigger = document.querySelector("[data-message-center-open]");
  const messagePanel = document.querySelector("[data-message-center]");
  const messageDot = document.querySelector("[data-message-dot]");
  const messageCount = document.querySelector("[data-message-count]");

  if (messageTrigger) {
    messageTrigger.hidden = false;
  }

  const updateMessageState = function () {
    if (!messagePanel || !messageTrigger) return;

    const unreadCount = messagePanel.querySelectorAll(".workbench-message-center__item.is-unread").length;
    if (messageCount) {
      messageCount.textContent = unreadCount ? unreadCount + " 条未读" : "暂无未读消息";
    }
    if (messageDot) {
      messageDot.classList.toggle("is-hidden", unreadCount === 0);
    }
    messageTrigger.setAttribute("aria-label", unreadCount ? "消息，" + unreadCount + " 条未读" : "消息，暂无未读消息");
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (messageTrigger) {
      messageTrigger.hidden = false;
    }
    updateMessageState();
  }, { once: true });

  const setUserMenuOpen = function (open, restoreFocus) {
    if (!userTrigger || !userMenu) return;

    userMenu.hidden = !open;
    userTrigger.setAttribute("aria-expanded", String(open));
    if (open && messagePanel) {
      messagePanel.hidden = true;
      messageTrigger?.setAttribute("aria-expanded", "false");
    }
    if (restoreFocus) userTrigger.focus({ preventScroll: true });
  };

  const setMessageCenterOpen = function (open, restoreFocus) {
    if (!messageTrigger || !messagePanel) return;

    messagePanel.hidden = !open;
    messageTrigger.setAttribute("aria-expanded", String(open));
    if (open && userMenu) {
      userMenu.hidden = true;
      userTrigger?.setAttribute("aria-expanded", "false");
    }
    if (restoreFocus) messageTrigger.focus({ preventScroll: true });
  };

  if (userTrigger && userMenu) {
    /* 用户菜单开合由壳层单源接管：此前仅 main.js 绑定，projects / agent-square 点头像无反应 */
    userTrigger.addEventListener("click", function (event) {
      event.stopPropagation();
      setUserMenuOpen(userMenu.hidden, false);
    });
  }

  if (userMenu) {
    userMenu.addEventListener("click", function (event) {
      if (event.target.closest("button")) setUserMenuOpen(false, false);
    });
  }

  if (messageTrigger && messagePanel) {
    messageTrigger.addEventListener("click", function (event) {
      event.stopPropagation();
      setMessageCenterOpen(messagePanel.hidden, false);
    });

    messagePanel.addEventListener("click", function (event) {
      const readAll = event.target.closest("[data-message-read-all]");
      if (readAll) {
        messagePanel.querySelectorAll(".workbench-message-center__item.is-unread").forEach(function (item) {
          item.classList.remove("is-unread");
        });
        updateMessageState();
        window.SKApp?.showToast?.("消息已全部标记为已读");
        return;
      }

      const item = event.target.closest(".workbench-message-center__item");
      if (item) {
        item.classList.remove("is-unread");
        updateMessageState();
      }
    });

    updateMessageState();
  }

  /* 通用弹窗：确认（删除 / 归档 / 移出）与重命名 */
  const dialogList = document.querySelector(".workbench-dialogs");
  const dialogManageCount = document.querySelector("[data-dialog-manage-count]");
  const dialogManageActions = document.querySelector("[data-dialog-manage-actions]");
  const dialogManageToggle = document.querySelector("[data-dialog-manage-toggle]");
  const dialogManageDelete = document.querySelector("[data-dialog-manage-delete]");
  const dialogManageArchive = document.querySelector("[data-dialog-manage-archive]");
  const dialogConfirm = document.querySelector("[data-dialog-confirm]");
  const dialogConfirmTitle = document.querySelector("[data-dialog-confirm-title]");
  const dialogConfirmDesc = document.querySelector("[data-dialog-confirm-desc]");
  const dialogConfirmOk = document.querySelector("[data-dialog-confirm-ok]");
  const dialogPrompt = document.querySelector("[data-dialog-prompt]");
  const dialogPromptTitle = document.querySelector("[data-dialog-prompt-title]");
  const dialogPromptInput = document.querySelector("[data-dialog-prompt-input]");
  const rowMenu = document.querySelector("#workbench-row-menu");
  let confirmCallback = null;
  let promptCallback = null;
  let menuTarget = null;

  /* variant：danger（默认，破坏性操作）| primary（非破坏性操作）
     与项目详情的约定一致：删除用危险色，移出 / 归档用主色 */
  const askConfirm = function (options) {
    if (!dialogConfirm || typeof dialogConfirm.showModal !== "function") return;
    if (dialogConfirmTitle) dialogConfirmTitle.textContent = options.title || "确认";
    if (dialogConfirmDesc) dialogConfirmDesc.textContent = options.desc || "";
    if (dialogConfirmOk) {
      dialogConfirmOk.textContent = options.okText || "确认";
      const isPrimary = options.variant === "primary";
      dialogConfirmOk.classList.toggle("workbench-confirm__button--primary", isPrimary);
      dialogConfirmOk.classList.toggle("workbench-confirm__button--danger", !isPrimary);
    }
    confirmCallback = options.onOk || null;
    dialogConfirm.showModal();
  };

  const askPrompt = function (options) {
    if (!dialogPrompt || typeof dialogPrompt.showModal !== "function") return;
    if (dialogPromptTitle) dialogPromptTitle.textContent = options.title || "重命名";
    if (dialogPromptInput) dialogPromptInput.value = options.value || "";
    promptCallback = options.onOk || null;
    dialogPrompt.showModal();
    /* 只聚焦到末尾，不做全选：全选会套用全局 ::selection（淡桃底 + 橙字），
       视觉上像变成了提示文字 */
    if (dialogPromptInput) {
      dialogPromptInput.focus();
      const end = dialogPromptInput.value.length;
      dialogPromptInput.setSelectionRange(end, end);
    }
  };

  document.querySelector("[data-dialog-confirm-ok]")?.addEventListener("click", function () {
    dialogConfirm?.close();
    const run = confirmCallback;
    confirmCallback = null;
    if (run) run();
  });

  document.querySelector("[data-dialog-confirm-cancel]")?.addEventListener("click", function () {
    confirmCallback = null;
    dialogConfirm?.close();
  });

  document.querySelector("[data-dialog-prompt-ok]")?.addEventListener("click", function () {
    const value = dialogPromptInput ? dialogPromptInput.value.trim() : "";
    dialogPrompt?.close();
    const run = promptCallback;
    promptCallback = null;
    if (run && value) run(value);
  });

  document.querySelector("[data-dialog-prompt-cancel]")?.addEventListener("click", function () {
    promptCallback = null;
    dialogPrompt?.close();
  });

  /* 列表行三点菜单：项目（一级）/ 项目内会话（二级）/ 会话列表三类共用 */
  /* 破坏性操作（删除）一律排在最后，避免误触 */
  const ROW_MENU_ITEMS = {
    project: [["rename", "重命名"], ["delete", "删除"]],
    child: [["rename", "重命名"], ["remove", "移出项目"], ["delete", "删除"]],
    dialog: [["rename", "重命名"], ["archive", "归档"], ["delete", "删除"]]
  };

  const rowKind = function (button) {
    if (button.closest(".workbench-project__child-row")) return "child";
    if (button.closest(".workbench-project")) return "project";
    if (button.closest(".workbench-dialog-row")) return "dialog";
    return null;
  };

  const ROW_SELECTORS = {
    project: [".workbench-project", ".workbench-project__title"],
    child: [".workbench-project__child-row", ".workbench-project__child"],
    dialog: [".workbench-dialog-row", ".workbench-dialog__title"]
  };

  const rowRefs = function (kind, button) {
    const selectors = ROW_SELECTORS[kind];
    const row = button.closest(selectors[0]);
    return row ? { row: row, title: row.querySelector(selectors[1]) } : null;
  };

  const closeRowMenu = function () {
    if (!rowMenu) return;
    rowMenu.hidden = true;
    rowMenu.classList.remove("is-open");
    rowMenu.textContent = "";
    menuTarget = null;
  };

  const openRowMenu = function (button) {
    if (!rowMenu) return;
    const kind = rowKind(button);
    if (!kind) return;
    rowMenu.innerHTML = ROW_MENU_ITEMS[kind]
      .map(function (item) {
        return (
          '<button class="workbench-row-menu__item" type="button" role="menuitem" data-row-action="' +
          item[0] + '">' + item[1] + "</button>"
        );
      })
      .join("");
    rowMenu.hidden = false;
    rowMenu.classList.add("is-open");
    const rect = button.getBoundingClientRect();
    const menuRect = rowMenu.getBoundingClientRect();
    rowMenu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - menuRect.width - 8)) + "px";
    rowMenu.style.top = Math.min(rect.bottom + 4, window.innerHeight - menuRect.height - 8) + "px";
    menuTarget = button;
  };

  /* 移出项目：二级会话转为独立会话，落到「对话」列表 */
  const moveRowToDialogs = function (row, name) {
    if (!dialogList) return;
    const item = document.createElement("div");
    item.className = "workbench-dialog-row";
    const title = document.createElement("button");
    title.type = "button";
    title.className = "workbench-dialog__title";
    title.textContent = name;
    const action = document.createElement("button");
    action.type = "button";
    action.className = "workbench-row-action";
    action.setAttribute("aria-label", "更多操作：" + name);
    action.innerHTML =
      '<svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg>';
    item.appendChild(title);
    item.appendChild(action);
    dialogList.appendChild(item);
    row.remove();
    window.SKApp?.showToast?.("已移出项目");
  };

  const runRowAction = function (action, button) {
    if (!button) return;
    const kind = rowKind(button);
    const refs = kind ? rowRefs(kind, button) : null;
    if (!refs || !refs.title) return;
    const name = refs.title.textContent.trim();

    if (action === "rename") {
      askPrompt({
        title: "重命名",
        value: name,
        onOk: function (value) {
          refs.title.textContent = value;
          window.SKApp?.showToast?.("已重命名为“" + value + "”");
        }
      });
      return;
    }

    if (action === "delete") {
      askConfirm({
        title: "删除",
        okText: "删除",
        desc: "确认删除“" + name + "”？删除后无法恢复。",
        onOk: function () {
          refs.row.remove();
          window.SKApp?.showToast?.("已删除“" + name + "”");
        }
      });
      return;
    }

    if (action === "remove") {
      askConfirm({
        title: "移出项目",
        okText: "移出",
        variant: "primary",
        desc: "确认将“" + name + "”移出当前项目？",
        onOk: function () {
          moveRowToDialogs(refs.row, name);
        }
      });
      return;
    }

    if (action === "archive") {
      askConfirm({
        title: "归档",
        okText: "归档",
        variant: "primary",
        desc: "确认归档“" + name + "”？",
        onOk: function () {
          refs.row.remove();
          window.SKApp?.showToast?.("已归档“" + name + "”");
        }
      });
    }
  };

  document.addEventListener("click", function (event) {
    const actionButton = event.target.closest(".workbench-row-action");
    if (actionButton && actionButton.closest(".workbench-shell")) {
      event.preventDefault();
      openRowMenu(actionButton);
      return;
    }
    const menuItem = event.target.closest(".workbench-row-menu__item");
    if (menuItem && menuItem.closest("#workbench-row-menu")) {
      const action = menuItem.getAttribute("data-row-action");
      const button = menuTarget; /* 先留一份：closeRowMenu 会清空 menuTarget */
      closeRowMenu();
      runRowAction(action, button);
    }
  });

  const selectedDialogs = function () {
    return Array.prototype.slice.call(document.querySelectorAll(".workbench-dialog-row.is-selected"));
  };

  const syncDialogManage = function () {
    const count = selectedDialogs().length;
    /* 计数显示在「删除」文字旁边；未选中时不显示数字 */
    if (dialogManageCount) dialogManageCount.textContent = count ? String(count) : "";
    if (dialogManageDelete) dialogManageDelete.disabled = count === 0;
    if (dialogManageArchive) dialogManageArchive.disabled = count === 0;
  };

  const setDialogManageMode = function (open) {
    if (!dialogList) return;
    dialogList.classList.toggle("is-managing", open);
    selectedDialogs().forEach(function (row) {
      row.classList.remove("is-selected");
    });
    if (dialogManageActions) dialogManageActions.hidden = !open;
    if (dialogManageToggle) dialogManageToggle.setAttribute("aria-pressed", String(open));
    syncDialogManage();
  };

  const runBatchDialogAction = function (action) {
    const rows = selectedDialogs();
    if (!rows.length) return;
    const isArchive = action === "archive";
    askConfirm({
      title: isArchive ? "归档对话" : "删除对话",
      okText: isArchive ? "归档" : "删除",
      variant: isArchive ? "primary" : "danger",
      desc: (isArchive ? "确认归档选中的 " : "确认删除选中的 ") + rows.length + " 个对话？" + (isArchive ? "" : "删除后无法恢复。"),
      onOk: function () {
        rows.forEach(function (row) {
          row.remove();
        });
        window.SKApp?.showToast?.(
          (isArchive ? "已归档 " : "已删除 ") + rows.length + " 个对话"
        );
        setDialogManageMode(false);
      }
    });
  };

  if (dialogList) {
    dialogList.addEventListener("click", function (event) {
      if (!dialogList.classList.contains("is-managing")) return;
      const row = event.target.closest(".workbench-dialog-row");
      if (!row) return;
      event.preventDefault();
      row.classList.toggle("is-selected");
      syncDialogManage();
    });
  }

  if (dialogManageToggle && dialogList) {
    dialogManageToggle.addEventListener("click", function () {
      setDialogManageMode(!dialogList.classList.contains("is-managing"));
    });
  }

  /* 顶部操作栏的 × 与底部「取消」都用于退出管理模式 */
  document.querySelectorAll("[data-dialog-manage-exit]").forEach(function (button) {
    button.addEventListener("click", function () {
      setDialogManageMode(false);
    });
  });

  dialogManageDelete?.addEventListener("click", function () {
    runBatchDialogAction("delete");
  });

  /* 底部操作条的归档：批量归档选中对话（与「删除」同行，位于其左侧） */
  dialogManageArchive?.addEventListener("click", function () {
    runBatchDialogAction("archive");
  });

  /* 会话搜索：弹窗内按标题实时过滤当前对话列表 */
  const dialogSearch = document.querySelector("[data-dialog-search]");
  const dialogSearchInput = document.querySelector("[data-dialog-search-input]");
  const dialogSearchList = document.querySelector("[data-dialog-search-list]");

  const renderDialogSearch = function (keyword) {
    if (!dialogSearchList || !dialogList) return;
    const word = (keyword || "").trim().toLowerCase();
    /* 带上当前会话的选中态，搜索结果里保留同一标记 */
    const entries = Array.prototype.map.call(
      dialogList.querySelectorAll(".workbench-dialog__title"),
      function (title) {
        return { name: title.textContent.trim(), active: title.classList.contains("is-active") };
      }
    );
    const matched = word
      ? entries.filter(function (entry) {
          return entry.name.toLowerCase().indexOf(word) !== -1;
        })
      : entries;

    dialogSearchList.textContent = "";
    if (!matched.length) {
      const empty = document.createElement("p");
      empty.className = "workbench-search__empty";
      empty.textContent = "没有匹配的对话";
      dialogSearchList.appendChild(empty);
      return;
    }
    matched.forEach(function (entry) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "workbench-search__item";
      if (entry.active) item.classList.add("is-active");
      item.textContent = entry.name;
      dialogSearchList.appendChild(item);
    });
  };

  /* 入口有两处：会话区块的搜索按钮、收起侧栏 rail 上的搜索按钮 */
  document.querySelectorAll("[data-dialog-search-open]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!dialogSearch) return;
      renderDialogSearch("");
      if (dialogSearchInput) dialogSearchInput.value = "";
      if (typeof dialogSearch.showModal === "function") dialogSearch.showModal();
      dialogSearchInput?.focus();
    });
  });

  dialogSearchInput?.addEventListener("input", function () {
    renderDialogSearch(dialogSearchInput.value);
  });

  dialogSearchList?.addEventListener("click", function (event) {
    if (event.target.closest(".workbench-search__item")) dialogSearch?.close();
  });

  document.querySelector("[data-dialog-search-close]")?.addEventListener("click", function () {
    dialogSearch?.close();
  });

  document.addEventListener("click", function (event) {
    if (userMenu && !userMenu.hidden && !userMenu.contains(event.target) && !userTrigger?.contains(event.target)) {
      setUserMenuOpen(false, false);
    }
    if (messagePanel && !messagePanel.hidden && !messagePanel.contains(event.target) && !messageTrigger?.contains(event.target)) {
      setMessageCenterOpen(false, false);
    }
    if (rowMenu && !rowMenu.hidden && !rowMenu.contains(event.target) && !event.target.closest(".workbench-row-action")) {
      closeRowMenu();
    }
  });

  /* 全站快捷键：Ctrl+Alt+B 收起/展开侧栏、Ctrl+Alt+K 新建会话、Ctrl+Alt+J 会话搜索 */
  document.addEventListener("keydown", function (event) {
    if (!(event.ctrlKey || event.metaKey) || !event.altKey || event.repeat || event.defaultPrevented) return;
    const key = event.key.toLowerCase();

    if (key === "b" && sidebarState) {
      event.preventDefault();
      sidebarState.checked = !sidebarState.checked;
      sidebarState.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    if (key === "k") {
      event.preventDefault();
      const newConversation = document.querySelector("[data-new-conversation]");
      if (newConversation) {
        newConversation.click();
        return;
      }
      /* 其它页面没有会话区，跳到工作台（落地即新会话） */
      window.location.href = "./research-assistant.html";
      return;
    }

    if (key === "j") {
      event.preventDefault();
      if (dialogSearch && dialogSearch.open) {
        dialogSearch.close();
        return;
      }
      document.querySelector("[data-dialog-search-open]")?.click();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (userMenu && !userMenu.hidden) setUserMenuOpen(false, true);
    if (messagePanel && !messagePanel.hidden) setMessageCenterOpen(false, true);
    if (rowMenu && !rowMenu.hidden) closeRowMenu();
  });

    document.querySelectorAll(".workbench-dialog__title").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll(".workbench-dialog__title.is-active").forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
    });
  });

    window.addEventListener("hashchange", function () {
    syncActiveAgent();
    syncActiveProject();
  });
  window.addEventListener("popstate", syncActiveProject);
  document.addEventListener("workbench:project-detail-change", syncActiveProject);
  syncActiveAgent();
  syncActiveProject();

    scrollRegion.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", function () {
    updateScrollState();
    positionAgentMenu();
  });
  updateScrollState();
})();
