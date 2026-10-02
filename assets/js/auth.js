(function () {
  "use strict";

  const STORAGE_KEY = "sheke-demo-user";
  let modal;
  let mask;
  let logoutConfirmMask;
  let logoutConfirmModal;
  let agreementConfirmMask;
  let agreementConfirmModal;
  /* 演示环境统一密码：手机号任意填，密码只认这一个 */
  const DEMO_PASSWORD = "123";
  /* 密码规则（演示）：3–20 位字母 / 数字 / 半角符号；空格（含首尾）、中文、其他非 ASCII 字符都不合规 */
  const PASSWORD_PATTERN = /^[\x21-\x7E]{3,20}$/;
  let pendingTarget = null;
  let countdownTimer = 0;
  let logoutRedirect = "";

  function readUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  }

  function writeUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function createModal() {
    mask = document.createElement("div");
    mask.className = "auth-mask";
    mask.dataset.authMask = "";
    mask.hidden = true;

    modal = document.createElement("section");
    modal.className = "auth-modal";
    modal.dataset.authModal = "";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "authTitle");
    modal.hidden = true;
    modal.innerHTML = `
      <div class="auth-head">
        <div>
          <h2 class="auth-title" id="authTitle">登录</h2>
          <p class="auth-subtitle">使用手机号登录后进入工作台</p>
        </div>
        <button class="auth-close" type="button" data-auth-close aria-label="关闭">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
      <div class="auth-tabs" role="tablist" aria-label="登录注册切换">
        <button class="auth-tab is-active" type="button" role="tab" aria-selected="true" data-auth-mode="login">登录</button>
        <button class="auth-tab" type="button" role="tab" aria-selected="false" data-auth-mode="register">注册</button>
      </div>
      <form class="auth-form" data-auth-form novalidate>
        <label class="field">
          <span class="field-label">手机号</span>
          <input type="tel" inputmode="numeric" maxlength="11" autocomplete="tel" placeholder="请输入 11 位手机号" data-auth-phone>
        </label>
        <label class="field" data-auth-code-field hidden>
          <span class="field-label">验证码</span>
          <span class="field-input-wrap">
            <input type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="请输入验证码">
            <button class="code-button" type="button" data-auth-code>获取验证码</button>
          </span>
        </label>
        <label class="field">
          <span class="field-label">密码</span>
          <span class="field-password">
            <input type="password" autocomplete="current-password" placeholder="请输入密码" data-auth-password>
            <button class="password-toggle" type="button" data-password-toggle aria-label="显示密码" aria-pressed="false">
              <svg class="password-toggle__eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg class="password-toggle__eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                <path d="m2 2 20 20"></path>
              </svg>
            </button>
          </span>
        </label>
        <label class="auth-checkbox">
          <input type="checkbox" data-auth-agreement>
          <span>我已阅读并同意<button class="auth-legal-link" type="button" data-auth-legal-toast="用户协议链接后续接入">用户协议</button>和<button class="auth-legal-link" type="button" data-auth-legal-toast="隐私政策链接后续接入">隐私政策</button></span>
        </label>
        <button class="btn btn-primary auth-submit" type="submit">登录</button>
        <p class="auth-hint">演示环境：任意 11 位手机号，密码 123 即可登录</p>
      </form>
    `;

    document.body.append(mask, modal);

    modal.querySelectorAll("[data-auth-legal-toast]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.SKApp.showToast(button.dataset.authLegalToast);
      });
    });

    /* 手机号只收数字：输入或粘贴时把非数字字符直接删掉（含全角/字母/符号） */
    modal.querySelector("[data-auth-phone]").addEventListener("input", (event) => {
      const input = event.target;
      const cleaned = input.value.replace(/\D/g, "");
      if (cleaned !== input.value) input.value = cleaned;
    });
  }

  /* 密码明文 / 隐藏切换：图标、无障碍语义与 input.type 一处改 */
  function setPasswordVisible(show) {
    const input = modal.querySelector("[data-auth-password]");
    const toggle = modal.querySelector("[data-password-toggle]");
    input.type = show ? "text" : "password";
    toggle.classList.toggle("is-on", show);
    toggle.setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
    toggle.setAttribute("aria-pressed", String(show));
  }

  function setMode(mode) {
    modal.dataset.mode = mode;
    modal.querySelectorAll("[data-auth-mode]").forEach((button) => {
      const active = button.dataset.authMode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });

    const isRegister = mode === "register";
    modal.querySelector("[data-auth-code-field]").hidden = !isRegister;
    const passwordField = modal.querySelector("[data-auth-password]");
    passwordField.autocomplete = isRegister ? "new-password" : "current-password";
    passwordField.placeholder = isRegister ? "输入3-20位字母、数字、符号组成密码" : "请输入密码";
    setPasswordVisible(false);
    modal.querySelector(".auth-title").textContent = isRegister ? "注册账号" : "登录";
    modal.querySelector(".auth-subtitle").textContent = isRegister
      ? "完成手机号验证后即可创建账号"
      : "使用手机号登录后进入工作台";
    modal.querySelector(".auth-submit").textContent = isRegister ? "创建账号并登录" : "登录";
  }

  /* mode 为 "register" 时直接落在注册页签（默认登录）；调用方不传则行为不变 */
  function openModal(target, mode) {
    if (window.SKApp && typeof window.SKApp.closeDrawer === "function") {
      window.SKApp.closeDrawer();
    }
    pendingTarget =
      target && typeof target === "object"
        ? target
        : target
          ? { label: String(target) }
          : null;
    mask.hidden = false;
    modal.hidden = false;
    requestAnimationFrame(() => {
      mask.classList.add("is-open");
      modal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    /* 不主动聚焦手机号输入框：焦点落在弹窗首个可聚焦元素（右上角关闭钮），
       Tab 顺序照常，键盘用户不会被直接丢进表单。
       官网首页没有焦点陷阱（SKApp.setFocusTrap 只在 main.js 里），手动搬到同一个位置 */
    if (window.SKApp?.setFocusTrap) {
      window.SKApp.setFocusTrap(modal);
    } else {
      modal.querySelector(".auth-close")?.focus({ preventScroll: true });
    }
    setMode(mode === "register" ? "register" : "login");
  }

  function closeModal() {
    window.SKApp?.releaseFocusTrap?.(modal);
    mask.classList.remove("is-open");
    modal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.clearInterval(countdownTimer);
    window.setTimeout(() => {
      mask.hidden = true;
      modal.hidden = true;
    }, 220);
  }

  function renderUser() {
    const user = readUser();
    document.querySelectorAll("[data-guest-actions]").forEach((node) => {
      node.hidden = Boolean(user);
    });
    document.querySelectorAll("[data-user-chip]").forEach((node) => {
      node.hidden = !user;
    });
    document.querySelectorAll("[data-user-phone]").forEach((node) => {
      node.textContent = user ? user.phone : "";
    });
    /* [data-sidebar-user-label] 由壳层统一刷（workbench.js 的 syncAuthState），这里不再写第二遍 */
    document.dispatchEvent(new CustomEvent("sk:auth-changed", { detail: user }));
  }

  /* 11 位纯数字脱敏成 139****2222；其他输入原样保留 */
  function formatPhone(raw) {
    const value = String(raw || "").trim();
    return /^\d{11}$/.test(value) ? `${value.slice(0, 3)}****${value.slice(-4)}` : value;
  }

  function signIn(phone, profile) {
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (cleanPhone.length !== 11) return false;

    writeUser({
      ...profile,
      phone: formatPhone(cleanPhone),
    });
    renderUser();
    return true;
  }

  function signOut() {
    writeUser(null);
    renderUser();
  }

  function completeLogin(target) {
    const phoneInput = modal.querySelector("[data-auth-phone]");
    const phone = phoneInput.value.replace(/\D/g, "");
    const passwordInput = modal.querySelector("[data-auth-password]");
    const password = passwordInput.value;
    const codeInput = modal.querySelector("[data-auth-code-field] input");
    const agreement = modal.querySelector("[data-auth-agreement]");

    if (phone.length !== 11) {
      window.SKApp.showToast("请输入 11 位手机号");
      phoneInput.focus();
      return;
    }

    if (!PASSWORD_PATTERN.test(password)) {
      window.SKApp.showToast("密码不合规");
      passwordInput.focus();
      return;
    }

    /* 演示环境密码统一为 123（弹窗底部有说明），对不上就是账号密码错误 */
    if (password !== DEMO_PASSWORD) {
      window.SKApp.showToast("账号或密码错误");
      passwordInput.focus();
      return;
    }

    /* 验证码只在注册模式出现；演示环境任意 6 位数字都算对 */
    if (modal.dataset.mode === "register" && !/^\d{6}$/.test(codeInput.value.replace(/\D/g, ""))) {
      window.SKApp.showToast("验证码输入错误");
      codeInput.focus();
      return;
    }

    if (!agreement.checked) {
      openAgreementConfirm();
      return;
    }

    signIn(phone);
    closeModal();

    if (target && target.url && !target.placeholder) {
      notifySuccess("登录成功");
      window.setTimeout(() => {
        window.location.href = target.url;
      }, 120);
    } else if (target && target.label && target.label !== "账号中心") {
      window.SKApp.showToast(`${target.label}将在下一阶段生成`);
    } else if (target && target.label === "账号中心") {
      notifySuccess("登录成功");
    } else {
      notifySuccess("登录成功");
    }
  }

  /* 事后成功类提示：页面可以通过 SKApp.silentSuccess 关掉（官网首页就不要这类） */
  function notifySuccess(message) {
    if (window.SKApp && window.SKApp.silentSuccess) return;
    window.SKApp.showToast(message);
  }

  function startCountdown(button) {
    let seconds = 60;
    button.disabled = true;
    button.textContent = `${seconds}s 后重试`;
    window.clearInterval(countdownTimer);
    countdownTimer = window.setInterval(() => {
      seconds -= 1;
      button.textContent = `${seconds}s 后重试`;
      if (seconds <= 0) {
        window.clearInterval(countdownTimer);
        button.disabled = false;
        button.textContent = "获取验证码";
      }
    }, 1000);
  }

  function createLogoutConfirm() {
    if (logoutConfirmModal) return;
    logoutConfirmMask = document.createElement("div");
    logoutConfirmMask.className = "auth-mask";
    logoutConfirmMask.dataset.logoutConfirmMask = "";
    logoutConfirmMask.hidden = true;

    logoutConfirmModal = document.createElement("section");
    logoutConfirmModal.className = "auth-modal logout-confirm-modal";
    logoutConfirmModal.dataset.logoutConfirmModal = "";
    logoutConfirmModal.setAttribute("role", "alertdialog");
    logoutConfirmModal.setAttribute("aria-modal", "true");
    logoutConfirmModal.setAttribute("aria-labelledby", "logoutConfirmTitle");
    logoutConfirmModal.hidden = true;
    logoutConfirmModal.innerHTML = `
      <div class="auth-head">
        <div>
          <h2 class="auth-title" id="logoutConfirmTitle">退出登录</h2>
          <p class="auth-subtitle">确认退出当前账号？</p>
        </div>
        <button class="auth-close" type="button" data-logout-confirm-close aria-label="关闭">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
      <div class="auth-confirm-actions">
        <button class="btn btn-outline" type="button" data-logout-confirm-close>取消</button>
        <button class="btn btn-primary danger" type="button" data-logout-confirm-submit>确定</button>
      </div>
    `;
    document.body.append(logoutConfirmMask, logoutConfirmModal);
  }

  /* 未勾选协议时的确认弹窗：点「同意」即替用户勾上，不再用 toast 拦提交。
     文案随登录 / 注册场景切换 */
  function createAgreementConfirm() {
    if (agreementConfirmModal) return;
    agreementConfirmMask = document.createElement("div");
    /* 它叠在登录弹窗已有的遮罩之上，不再压第二层暗；这层只负责挡住穿透点击 */
    agreementConfirmMask.className = "auth-mask auth-mask--clear";
    agreementConfirmMask.dataset.agreementConfirmMask = "";
    agreementConfirmMask.hidden = true;

    agreementConfirmModal = document.createElement("section");
    agreementConfirmModal.className = "auth-modal";
    agreementConfirmModal.dataset.agreementConfirmModal = "";
    agreementConfirmModal.setAttribute("role", "alertdialog");
    agreementConfirmModal.setAttribute("aria-modal", "true");
    agreementConfirmModal.setAttribute("aria-labelledby", "agreementConfirmTitle");
    agreementConfirmModal.hidden = true;
    agreementConfirmModal.innerHTML = `
      <div class="auth-head">
        <div>
          <h2 class="auth-title" id="agreementConfirmTitle">同意协议</h2>
          <p class="auth-subtitle" data-agreement-confirm-desc></p>
        </div>
        <button class="auth-close" type="button" data-agreement-confirm-close aria-label="关闭">
          <svg class="workbench-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
      <div class="auth-confirm-actions">
        <button class="btn btn-outline" type="button" data-agreement-confirm-close>取消</button>
        <button class="btn btn-primary" type="button" data-agreement-confirm-submit>同意</button>
      </div>
    `;
    document.body.append(agreementConfirmMask, agreementConfirmModal);
  }

  function openAgreementConfirm() {
    createAgreementConfirm();
    const isRegister = modal?.dataset.mode === "register";
    agreementConfirmModal.querySelector("[data-agreement-confirm-desc]").textContent =
      `${isRegister ? "注册" : "登录"}即代表你已阅读并同意《用户协议》和《隐私政策》`;
    agreementConfirmMask.hidden = false;
    agreementConfirmModal.hidden = false;
    requestAnimationFrame(() => {
      agreementConfirmMask.classList.add("is-open");
      agreementConfirmModal.classList.add("is-open");
    });
    window.SKApp?.setFocusTrap?.(agreementConfirmModal, { initial: agreementConfirmModal.querySelector("[data-agreement-confirm-submit]") });
  }

  function closeAgreementConfirm() {
    if (!agreementConfirmModal || agreementConfirmModal.hidden) return;
    window.SKApp?.releaseFocusTrap?.(agreementConfirmModal);
    agreementConfirmMask.classList.remove("is-open");
    agreementConfirmModal.classList.remove("is-open");
    window.setTimeout(() => {
      agreementConfirmMask.hidden = true;
      agreementConfirmModal.hidden = true;
    }, 220);
  }

  function openLogoutConfirm() {
    createLogoutConfirm();
    logoutConfirmMask.hidden = false;
    logoutConfirmModal.hidden = false;
    requestAnimationFrame(() => {
      logoutConfirmMask.classList.add("is-open");
      logoutConfirmModal.classList.add("is-open");
    });
    document.body.classList.add("is-locked");
    window.SKApp?.setFocusTrap?.(logoutConfirmModal, { initial: logoutConfirmModal.querySelector("[data-logout-confirm-submit]") });
  }

  function closeLogoutConfirm() {
    if (!logoutConfirmModal || logoutConfirmModal.hidden) return;
    window.SKApp?.releaseFocusTrap?.(logoutConfirmModal);
    logoutConfirmMask.classList.remove("is-open");
    logoutConfirmModal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => {
      logoutConfirmMask.hidden = true;
      logoutConfirmModal.hidden = true;
    }, 220);
  }

  document.addEventListener("DOMContentLoaded", () => {
    createModal();
    createLogoutConfirm();
    /* 先挂上 window.SKAuth 再 renderUser()：renderUser 会派发 sk:auth-changed，
       壳层（workbench.js）在那个事件里读 SKAuth 判断登录态，晚挂就会一律读成未登录 */
    window.SKAuth = {
      getUser: readUser,
      signIn,
      signOut,
      refresh: renderUser,
      /* 只改已有用户的部分字段（如用户名），不动手机号；未登录返回 false */
      setProfile: function (patch) {
        const user = readUser();
        if (!user) return false;
        writeUser(Object.assign({}, user, patch || {}));
        renderUser();
        return true;
      },
      /* 换绑手机号：入参是明文号码，与登录同一套脱敏规则；未登录或空值返回 false */
      changePhone: function (rawPhone) {
        const value = String(rawPhone || "").trim();
        const user = readUser();
        if (!user || !value) return false;
        writeUser(Object.assign({}, user, {
          phone: formatPhone(value),
        }));
        renderUser();
        return true;
      },
      /* 密码规则（3-20 位字母 / 数字 / 半角符号）：登录、注册与账户中心重置密码共用 */
      isValidPassword: (value) => PASSWORD_PATTERN.test(value || ""),
      /* 复用登录框里那套 60s 倒计时，供账号中心的短信验证调用 */
      sendSmsCode: startCountdown,
      open: openModal,
      close: closeModal,
    };
    renderUser();

    document.addEventListener("click", (event) => {
      const authOpen = event.target.closest("[data-auth-open]");
      if (authOpen) {
        /* 已登录时不拦：把点击还给元素自己（链接照常跳转、按钮走原行为） */
        if (readUser()) return;
        event.preventDefault();
        /* data-auth-mode="register" 的入口（如侧栏注册引导）直接落在注册页签 */
        openModal(authOpen.dataset.destination || null, authOpen.dataset.authMode || null);
        return;
      }

      const protectedLink = event.target.closest("[data-requires-auth]");
      if (protectedLink) {
        event.preventDefault();
        if (readUser()) {
          if (protectedLink.hasAttribute("data-placeholder")) {
            window.SKApp.showToast(`${protectedLink.dataset.destinationLabel || "目标页面"}将在下一阶段生成`);
          } else {
            window.location.href = protectedLink.href;
          }
        } else {
          openModal({
            label: protectedLink.dataset.destinationLabel || "目标页面",
            url: protectedLink.href,
            placeholder: protectedLink.hasAttribute("data-placeholder"),
          });
        }
        return;
      }

      /* 只认关闭按钮：点遮罩不关（全站统一） */
      if (event.target.closest("[data-auth-close]")) {
        closeModal();
        return;
      }

      const passwordToggle = event.target.closest("[data-password-toggle]");
      if (passwordToggle) {
        const input = modal.querySelector("[data-auth-password]");
        setPasswordVisible(input.type === "password");
        input.focus();
        return;
      }

      const modeButton = event.target.closest("[data-auth-mode]");
      if (modeButton) {
        setMode(modeButton.dataset.authMode);
        return;
      }

      const codeButton = event.target.closest("[data-auth-code]");
      if (codeButton) {
        const phone = modal.querySelector("[data-auth-phone]").value.replace(/\D/g, "");
        if (phone.length !== 11) {
          window.SKApp.showToast("请先输入 11 位手机号");
          return;
        }
        startCountdown(codeButton);
        window.SKApp.showToast("验证码已发送，演示环境可输入任意 6 位数字");
        return;
      }

      const logout = event.target.closest("[data-auth-logout]");
      if (logout) {
        const userMenu = logout.closest("[data-user-menu]");
        if (userMenu) userMenu.hidden = true;
        /* 带 data-logout-redirect 的入口（账户中心）确认退出后跳走 */
        logoutRedirect = logout.dataset.logoutRedirect || "";
        openLogoutConfirm();
        return;
      }

      if (event.target.closest("[data-logout-confirm-close]")) {
        closeLogoutConfirm();
        return;
      }

      if (event.target.closest("[data-logout-confirm-submit]")) {
        signOut();
        closeLogoutConfirm();
        if (logoutRedirect) {
          /* 账户中心：先亮出「已退出登录」，再回官网首页 */
          window.SKApp.showToast("当前用户已退出登录");
          window.setTimeout(() => {
            window.location.href = logoutRedirect;
          }, 1400);
          return;
        }
        notifySuccess("已退出登录");
        return;
      }

      if (event.target.closest("[data-agreement-confirm-close]")) {
        closeAgreementConfirm();
        return;
      }

      /* 同意：替用户勾上协议，关掉确认框，提交仍由用户自己点 */
      if (event.target.closest("[data-agreement-confirm-submit]")) {
        modal?.querySelector("[data-auth-agreement]")?.click();
        closeAgreementConfirm();
      }
    });

    /* Esc 关闭自绘弹窗（原生 <dialog> 由浏览器自己处理）：先退确认框，再退登录框 */
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (logoutConfirmModal && !logoutConfirmModal.hidden) {
        event.preventDefault();
        closeLogoutConfirm();
        return;
      }
      if (agreementConfirmModal && !agreementConfirmModal.hidden) {
        event.preventDefault();
        closeAgreementConfirm();
        return;
      }
      if (modal && !modal.hidden) {
        event.preventDefault();
        closeModal();
      }
    });

    modal.querySelector("[data-auth-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      completeLogin(pendingTarget);
    });
  });
})();
