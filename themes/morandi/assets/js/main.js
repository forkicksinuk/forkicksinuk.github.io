(function () {
  "use strict";

  var storageKey = "theme-preference";
  var docEl = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var supportsMatchMedia =
    typeof window !== "undefined" && typeof window.matchMedia === "function";
  var prefersDarkQuery = supportsMatchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  var applyTheme = function (theme) {
    if (theme === "dark") {
      docEl.setAttribute("data-theme", "dark");
    } else {
      docEl.removeAttribute("data-theme");
    }
  };

  var getStoredTheme = function () {
    try {
      return localStorage.getItem(storageKey);
    } catch (err) {
      return null;
    }
  };

  var persistTheme = function (theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (err) {
      // Ignore write errors (e.g. private browsing)
    }
  };

  var syncToggleState = function (theme) {
    if (!toggle) {
      return;
    }
    var isDark = theme === "dark";
    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
  };

  var resolveTheme = function () {
    var stored = getStoredTheme();
    if (stored) {
      return stored;
    }
    if (prefersDarkQuery && prefersDarkQuery.matches) {
      return "dark";
    }
    return "light";
  };

  var currentTheme = resolveTheme();
  applyTheme(currentTheme);
  syncToggleState(currentTheme);

  if (toggle) {
    toggle.addEventListener("click", function () {
      var isDark = docEl.getAttribute("data-theme") === "dark";
      var nextTheme = isDark ? "light" : "dark";
      applyTheme(nextTheme);
      syncToggleState(nextTheme);
      persistTheme(nextTheme);
    });
  }

  var handlePreferenceChange = function (event) {
    if (!prefersDarkQuery) {
      return;
    }
    var stored = getStoredTheme();
    if (stored) {
      return;
    }
    var nextTheme = event.matches ? "dark" : "light";
    applyTheme(nextTheme);
    syncToggleState(nextTheme);
  };

  if (prefersDarkQuery) {
    if (typeof prefersDarkQuery.addEventListener === "function") {
      prefersDarkQuery.addEventListener("change", handlePreferenceChange);
    } else if (typeof prefersDarkQuery.addListener === "function") {
      prefersDarkQuery.addListener(handlePreferenceChange);
    }
  }
})();
