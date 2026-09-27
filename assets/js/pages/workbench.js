(function () {
  "use strict";

  /* 统一工作台壳：侧栏与用户区单源注入，页面只保留 <div class="workbench-shell"> 与内容区 */
  const SHELL_SIDEBAR = `    <header class="workbench-header">
      <input class="visually-hidden workbench-sidebar__state" type="checkbox" id="workbench-sidebar-state">
      <div class="workbench-header__top">
        <label class="workbench-brand__mark" for="workbench-sidebar-state" aria-label="展开侧边栏">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M9 3v18"></path>
            <path d="m14 9 3 3-3 3"></path>
          </svg>
        </label>
        <a class="workbench-brand__home" href="../index.html" aria-label="返回湖北社科数据信息联盟首页">
          <span class="workbench-brand__name">湖北社科数据信息联盟</span>
          <span class="workbench-brand__en">SOCIAL SCIENCE UNION</span>
        </a>
        <label class="workbench-sidebar__toggle" for="workbench-sidebar-state" aria-label="收起侧边栏">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
            <path d="M9 3v18"></path>
          </svg>
        </label>
      </div>

      <nav class="workbench-nav" aria-label="产品导航">
        <a class="workbench-nav__link" href="./knowledge-alliance.html">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 7v14"></path>
            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 .4-.8A7 7 0 0 1 12 4a7 7 0 0 1 9.6-.8 1 1 0 0 1 .4.8v13a1 1 0 0 1-1 1"></path>
            <path d="M3 18a7 7 0 0 1 9-1 7 7 0 0 1 9 1"></path>
          </svg>
          <span>知识联盟</span>
        </a>
        <a class="workbench-nav__link" href="./research-assistant.html">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9z"></path>
            <path d="M5 3v4"></path>
            <path d="M3 5h4"></path>
            <path d="M19 17v4"></path>
            <path d="M17 19h4"></path>
          </svg>
          <span>社科助手</span>
        </a>
        <a class="workbench-nav__link" href="./my-knowledge.html">
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
            <a class="workbench-agent" href="./agent-square.html#agent-research" data-agent-menu-trigger>
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
            <a class="workbench-agent__tag" href="./research-assistant.html?agent=research">加入对话</a>
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
            <a class="workbench-agent__tag" href="./research-assistant.html?agent=review">加入对话</a>
          </div>
          </div>
        </details>
        <div class="workbench-agent-menu" id="workbench-agent-menu" role="menu" hidden>
          <button class="workbench-agent-menu__item" type="button" role="menuitem">
            <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
            <span class="workbench-agent__name">荆楚智研</span>
            <span class="workbench-agent__tag">加入对话</span>
          </button>
          <button class="workbench-agent-menu__item" type="button" role="menuitem">
            <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
            <span class="workbench-agent__name">荆楚智审</span>
            <span class="workbench-agent__tag">加入对话</span>
          </button>
        </div>
      </section>

      <div class="workbench-rail-actions" aria-label="折叠侧栏快捷入口">
        <button class="workbench-rail-action" type="button" aria-label="项目">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m19 5 3-3"></path>
            <path d="m2 22 3-3"></path>
            <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"></path>
            <path d="M7.5 13.5 10 11"></path>
            <path d="M10.5 16.5 13 14"></path>
            <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"></path>
          </svg>
        </button>
        <a class="workbench-rail-action" href="research-assistant.html" aria-label="新建社科助手对话">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            <path d="M8 12h8"></path>
            <path d="M12 8v8"></path>
          </svg>
        </a>
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
                <button class="workbench-section__action" type="button" data-summary-action aria-label="搜索对话">
                  <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </button>
                <button class="workbench-section__action" type="button" data-summary-action aria-label="管理对话">
                  <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m3 17 2 2 4-4"></path>
                    <path d="m3 7 2 2 4-4"></path>
                    <path d="M13 6h8"></path>
                    <path d="M13 12h8"></path>
                    <path d="M13 18h8"></path>
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
          <button type="button" role="menuitem">
            <svg class="workbench-user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <span>关于我们</span>
          </button>
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
    </footer>`;

  const shell = document.querySelector(".workbench-shell");
  if (!shell) return;

  /* 壳层随页面状态：导航高亮、对话入口形态、项目新建入口 */
  const applyShellState = function () {
    const page = (window.location.pathname.split("/").pop() || "").toLowerCase();

    document.querySelectorAll(".workbench-nav__link").forEach(function (link) {
      const isActive = (link.getAttribute("href") || "").replace("./", "") === page;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    /* 智能体广场与项目列表把对话入口渲染为无跳转按钮，其余页面保持链接 */
    if (page === "agent-square.html" || page === "projects.html") {
      const rail = document.querySelector('.workbench-rail-action[href="research-assistant.html"]');
      if (rail) {
        const button = document.createElement("button");
        button.className = rail.className;
        button.type = "button";
        button.setAttribute("aria-label", "对话");
        button.innerHTML = rail.innerHTML;
        rail.replaceWith(button);
      }
    }

    if (page === "projects.html") {
      const summary = document.querySelector('.workbench-section__action[href="./projects.html"]');
      if (summary) summary.setAttribute("aria-current", "page");
      const create = document.querySelector('.workbench-section__action[aria-label="新建项目"]');
      if (create) create.setAttribute("data-project-create-trigger", "");
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

  if (sidebarState) {
    sidebarState.checked = readSidebarCollapsed();
    sidebarState.addEventListener("change", function () {
      saveSidebarCollapsed(sidebarState.checked);
    });
  }

  const syncActiveAgent = function () {
    const isAgentSquarePage = window.location.pathname.endsWith("/agent-square.html");
    document.querySelectorAll('.workbench-agent[href*="agent-square.html#"]').forEach(function (link) {
      const linkHash = new URL(link.href, window.location.href).hash;
      link.classList.toggle("is-active", isAgentSquarePage && linkHash === window.location.hash);
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

  document.addEventListener("click", function (event) {
    if (userMenu && !userMenu.hidden && !userMenu.contains(event.target) && !userTrigger?.contains(event.target)) {
      setUserMenuOpen(false, false);
    }
    if (messagePanel && !messagePanel.hidden && !messagePanel.contains(event.target) && !messageTrigger?.contains(event.target)) {
      setMessageCenterOpen(false, false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (userMenu && !userMenu.hidden) setUserMenuOpen(false, true);
    if (messagePanel && !messagePanel.hidden) setMessageCenterOpen(false, true);
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
