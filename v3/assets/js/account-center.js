(function () {
  "use strict";

  let authPromptRequested = false;
  let authPromptSuppressed = false;

  function renderAccountState() {
    const user = window.SKAuth ? window.SKAuth.getUser() : null;
    const member = document.querySelector("[data-account-member]");

    if (member) member.hidden = !user;

    document.querySelectorAll("[data-account-name]").forEach((node) => {
      node.textContent = "未知研究员";
    });

    document.querySelectorAll("[data-account-phone]").forEach((node) => {
      node.textContent = user ? user.phone : "138****5678";
    });

    if (!user && window.SKAuth && !authPromptRequested && !authPromptSuppressed) {
      authPromptRequested = true;
      window.setTimeout(() => window.SKAuth.open("账号中心"), 80);
    }
  }

  function initAccountNavigation() {
    const buttons = Array.from(document.querySelectorAll("[data-account-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-account-panel]"));
    if (!buttons.length || !panels.length) return;

    const activate = (tab) => {
      buttons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.accountTab === tab);
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.accountPanel !== tab;
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => activate(button.dataset.accountTab));
    });

    const requestedTab = window.location.hash.replace("#", "");
    const initialTab = buttons.some((button) => button.dataset.accountTab === requestedTab)
      ? requestedTab
      : "overview";
    activate(initialTab);
  }

  function initAccountActions() {
    document.addEventListener("click", (event) => {
      const logout = event.target.closest("[data-account-logout]");
      if (logout) {
        authPromptSuppressed = true;
        window.SKAuth.signOut();
        window.location.href = "../index.html";
        return;
      }

      const toastAction = event.target.closest("[data-toast-message]");
      if (toastAction) {
        window.SKApp.showToast(toastAction.dataset.toastMessage);
        return;
      }

      const confirmAction = event.target.closest("[data-confirm-action]");
      if (confirmAction && window.confirm(confirmAction.dataset.confirmAction)) {
        window.SKApp.showToast(confirmAction.dataset.confirmMessage || "操作已完成");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAccountNavigation();
    initAccountActions();
    renderAccountState();
    document.addEventListener("sk:auth-changed", () => {
      if (!authPromptSuppressed) {
        authPromptRequested = false;
        renderAccountState();
      }
    });
  });
})();
