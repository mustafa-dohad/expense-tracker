// ===================================================
// 🌙 / ☀️ THEME TOGGLE WITH PERSISTENCE
// ===================================================
const themeButton = document.getElementById("theme-button");

// Apply saved theme on load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light");
  themeButton.textContent = "☀️";
} else {
  document.body.classList.remove("light"); // dark by default
  themeButton.textContent = "🌙";
}

themeButton?.addEventListener("click", () => {
  themeButton.classList.add("spinning");

  setTimeout(() => {
    const isLight = document.body.classList.toggle("light");
    themeButton.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
    themeButton.classList.remove("spinning");
  }, 150);
});


// ===================================================
// 🔁 TAB SWITCH LOGIC
// ===================================================
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

loginTab.onclick = () => {
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  document.getElementById("message").textContent = "";
};

signupTab.onclick = () => {
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  document.getElementById("message").textContent = "";
};


// ===================================================
// 🔐 LOGIN FORM AJAX SUBMISSION
// ===================================================
const loginBtn = document.getElementById("login-btn");
const loginSpinner = document.getElementById("login-spinner");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginBtn.disabled = true;
  loginSpinner.classList.remove("hidden");

  const formData = new FormData(loginForm);

  try {
    const response = await fetch("../backend/login.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    console.log("Login response:", result);

    if (result.trim() === "success") {
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("message").textContent = result;
    }
  } catch (err) {
    console.error("Login error:", err);
    document.getElementById("message").textContent = "Something went wrong.";
  }

  loginSpinner.classList.add("hidden");
  loginBtn.disabled = false;
});


// ===================================================
// 🆕 SIGNUP FORM AJAX SUBMISSION
// ===================================================
const signupBtn = document.getElementById("signup-btn");
const signupSpinner = document.getElementById("signup-spinner");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Signup form submitted");

  signupBtn.disabled = true;
  signupSpinner.classList.remove("hidden");

  const formData = new FormData(signupForm);
  console.log("FormData:", [...formData.entries()]);

  try {
    const response = await fetch("../backend/signup.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    console.log("Signup response:", result);

    if (result.trim() === "success") {
      document.getElementById("message").textContent = "Sign up successful. Please log in.";
      loginTab.click();
    } else {
      document.getElementById("message").textContent = result;
    }
  } catch (err) {
    console.error("Signup error:", err);
    document.getElementById("message").textContent = "Something went wrong.";
  }

  signupSpinner.classList.add("hidden");
  signupBtn.disabled = false;
});
