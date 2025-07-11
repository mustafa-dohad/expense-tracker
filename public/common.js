// ===============================
// Common Navigation & Dark Mode JS
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  const themeButton = document.getElementById("theme-button");
  const themeButtonMobile = document.getElementById("theme-button-mobile");

  function applyThemeIcon(isDark) {
    const icon = isDark ? "☀️" : "🌙";
    if (themeButton) themeButton.textContent = icon;
    if (themeButtonMobile) themeButtonMobile.textContent = icon;
  }

  function toggleDarkMode() {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    applyThemeIcon(isDark);
    [themeButton, themeButtonMobile].forEach(btn => {
      if (btn) {
        btn.classList.add("theme-animated");
        setTimeout(() => btn.classList.remove("theme-animated"), 400);
      }
    });
    document.dispatchEvent(new Event('themeChanged'));
  }

  const initialTheme = localStorage.getItem("theme") === "dark";
  if (initialTheme) {
    document.body.classList.add("dark");
  }
  applyThemeIcon(initialTheme);

  themeButton?.addEventListener("click", toggleDarkMode);
  themeButtonMobile?.addEventListener("click", toggleDarkMode);

  // Navigation logic (move this inside DOMContentLoaded as well)
  document.querySelectorAll('.side-nav .nav-icon, .bottom-nav .nav-icon').forEach(button => {
    const action = button.dataset.action;
    if (!action) return;
    button.addEventListener('click', () => {
      switch (action) {
        case "home":
          window.location.href = "dashboard.html";
          break;
        case "profile":
          window.location.href = "user.html";
          break;
        case "transactions":
          window.location.href = "transactions.html";
          break;
        case "add":
          if (typeof openAddModal === "function") openAddModal();
          break;
        case "logout":
          fetch("../backend/logout.php")
            .then(() => {
              window.location.href = "index.html";
            });
          break;
      }
    });
  });
}); 