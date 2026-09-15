(function () {
  "use strict";

  const STORAGE_KEY = "sheke-demo-user";
  let modal;
  let mask;
  let logoutConfirmMask;
  let logoutConfirmModal;
  let pendingTarget = null;
  let countdownTimer = 0;

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
          <h2 class="auth-title" id="authTitle">登录社科智研</h2>
          <p class="auth-subtitle">使用手机号登录后进入研究工作台</p>
        </div>
        <button class="auth-close" type="button" data-auth-close aria-label="关闭">
          <span data-icon="x"></span>
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
          <input type="password" autocomplete="current-password" placeholder="请输入密码" data-auth-password>
        </label>
        <label class="auth-checkbox">
          <input type="checkbox" data-auth-agreement>
          <span>我已阅读并同意用户协议和隐私政策</span>
        </label>
        <button class="btn btn-primary auth-submit" type="submit">登录</button>
        <p class="auth-hint">演示环境：输入任意 11 位手机号即可登录</p>
      </form>
    `;

    document.body.append(mask, modal);
    window.SKIcons.hydrate(modal);
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
    modal.querySelector("[data-auth-password]").autocomplete = isRegister ? "new-password" : "current-password";
    modal.querySelector(".auth-title").textContent = isRegister ? "注册社科智研账号" : "登录社科智研";
    modal.querySelector(".auth-subtitle").textContent = isRegister
      ? "完成手机号验证后即可创建账号"
      : "使用手机号登录后进入研究工作台";
    modal.querySelector(".auth-submit").textContent = isRegister ? "创建账号并登录" : "登录";
  }

  function openModal(target) {
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
    setMode("login");
    window.setTimeout(() => modal.querySelector("[data-auth-phone]").focus(), 50);
  }

  function closeModal() {
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
    document.querySelectorAll("[data-sidebar-user-label]").forEach((node) => {
      node.textContent = user ? "未知研究员" : "";
    });
    document.dispatchEvent(new CustomEvent("sk:auth-changed", { detail: user }));
  }

  function signIn(phone, profile) {
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (cleanPhone.length !== 11) return false;

    writeUser({
      ...profile,
      phone: `${cleanPhone.slice(0, 3)}****${cleanPhone.slice(-4)}`,
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
    const agreement = modal.querySelector("[data-auth-agreement]");

    if (phone.length !== 11) {
      window.SKApp.showToast("请输入 11 位手机号");
      phoneInput.focus();
      return;
    }

    if (!agreement.checked) {
      window.SKApp.showToast("请先阅读并同意相关协议");
      return;
    }

    signIn(phone);
    closeModal();

    if (target && target.url && !target.placeholder) {
      window.SKApp.showToast("登录成功");
      window.setTimeout(() => {
        window.location.href = target.url;
      }, 120);
    } else if (target && target.label && target.label !== "账号中心") {
      window.SKApp.showToast(`${target.label}将在下一阶段生成`);
    } else if (target && target.label === "账号中心") {
      window.SKApp.showToast("登录成功");
    } else {
      window.SKApp.showToast("登录成功");
    }
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
          <span data-icon="x"></span>
        </button>
      </div>
      <div class="logout-confirm-actions">
        <button class="btn btn-outline" type="button" data-logout-confirm-close>取消</button>
        <button class="btn btn-primary danger" type="button" data-logout-confirm-submit>退出登录</button>
      </div>
    `;
    document.body.append(logoutConfirmMask, logoutConfirmModal);
    window.SKIcons.hydrate(logoutConfirmModal);
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
    window.setTimeout(() => logoutConfirmModal.querySelector("[data-logout-confirm-submit]").focus(), 60);
  }

  function closeLogoutConfirm() {
    if (!logoutConfirmModal || logoutConfirmModal.hidden) return;
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
    renderUser();

    document.addEventListener("click", (event) => {
      const authOpen = event.target.closest("[data-auth-open]");
      if (authOpen) {
        event.preventDefault();
        openModal(authOpen.dataset.destination || null);
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

      if (event.target.closest("[data-auth-close]") || event.target === mask) {
        closeModal();
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
        openLogoutConfirm();
        return;
      }

      if (event.target.closest("[data-logout-confirm-close]") || event.target === logoutConfirmMask) {
        closeLogoutConfirm();
        return;
      }

      if (event.target.closest("[data-logout-confirm-submit]")) {
        signOut();
        closeLogoutConfirm();
        window.SKApp.showToast("已退出登录");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && logoutConfirmModal && !logoutConfirmModal.hidden) {
        event.preventDefault();
        closeLogoutConfirm();
      }
    });

    modal.querySelector("[data-auth-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      completeLogin(pendingTarget);
    });

    window.SKAuth = {
      getUser: readUser,
      signIn,
      signOut,
      refresh: renderUser,
      open: openModal,
      close: closeModal,
    };
  });
})();
