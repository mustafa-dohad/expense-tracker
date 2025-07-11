let expenseChartInstance = null;
let monthlyChartInstance = null;

// ===================================================
// 🖱️ ELEMENT SELECTION
// ===================================================
// Selects all major DOM elements used in dashboard logic
const addOverlay = document.getElementById("add-overlay");
const transactionForm = document.getElementById("transaction-form");
const cancelButton = document.getElementById("cancel-transaction");
const addButton = document.getElementById("add-transaction");
const addButtonDesktop = document.getElementById("add-transaction-desktop");
const accountList = document.getElementById("account-list");
const transactionList = document.getElementById("transactions-list");
const topExpensesList = document.getElementById("top-expenses-list");
const currencyList = document.getElementById("currency-list");
const highestCategoryDisplay = document.getElementById("highest-category");

// ===================================================
// 🪟 MODAL CONTROLS
// ===================================================
// Handles opening/closing of the add transaction modal
addButton?.addEventListener("click", () => addOverlay.classList.remove("hidden"));
addButtonDesktop?.addEventListener("click", () => addOverlay.classList.remove("hidden"));
const mobileAddButton = document.querySelector('.bottom-nav .fab');
mobileAddButton?.addEventListener("click", () => addOverlay.classList.remove("hidden"));
cancelButton?.addEventListener("click", () => addOverlay.classList.add("hidden"));
window.addEventListener("click", (e) => {
  if (e.target === addOverlay) {
    addOverlay.classList.add("hidden");
  }
});

// ===================================================
// ➕ FORM SUBMISSION (ADD TRANSACTION)
// ===================================================
// Handles add transaction form submission
transactionForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedLabel = transactionForm.querySelector('select[name="label_id"]').value;
  const newLabel = transactionForm.querySelector('input[name="new_label"]').value.trim();
  if (!selectedLabel && !newLabel) {
    alert("Please select an existing label or add a new one.");
    return;
  }
  const formData = new FormData(transactionForm);
  const res = await fetch("../backend/add_transaction.php", {
    method: "POST",
    body: formData,
  });
  const result = await res.json();
  alert(result.message);
  if (result.status === "success") {
    addOverlay.classList.add("hidden");
    transactionForm.reset();
    reloadAllData();
  }
});

// ===================================================
// 🏦 LOAD ACCOUNTS
// ===================================================
// Fetches and displays account info
async function loadAccounts() {
  const res = await fetch(`../backend/get_accounts.php?t=${Date.now()}`, { cache: "no-cache" });
  const data = await res.json();
  accountList.innerHTML = "";
  const accountSelect = transactionForm.querySelector('select[name="account_id"]');
  accountSelect.innerHTML = "<option value=''>Select Account</option>";
  data.forEach((acc) => {
    const div = document.createElement("div");
    div.className = "account-card";
    const balance = parseFloat(acc.balance);
    div.innerHTML = `<span>${acc.name}</span><strong style="color:${balance < 0 ? 'red' : 'inherit'}">₨ ${balance.toFixed(2)}</strong>`;
    accountList.appendChild(div);
    const option = document.createElement("option");
    option.value = acc.id;
    option.textContent = acc.name;
    accountSelect.appendChild(option);
  });
}

// ===================================================
// 📄 LOAD TRANSACTIONS (ONLY 5)
// ===================================================
// Fetches and displays the 5 most recent transactions
async function loadTransactions() {
  try {
    const res = await fetch("../backend/get_transactions.php");
    const data = await res.json();
    transactionList.innerHTML = "";
    const displayTransactions = data.slice(0, 5);
    displayTransactions.forEach((tx) => {
      const isDark = document.body.classList.contains("dark");
      const color = tx.transaction_type === "expense"
        ? (isDark ? "#ff8787" : "#ff6b6b")
        : tx.transaction_type === "income"
          ? (isDark ? "#64ffda" : "#1dd1a1")
          : "#54a0ff";
      const textColor = isDark ? "#f9fafb" : "#555";
      const labelsText = Array.isArray(tx.labels) && tx.labels.length > 0
        ? tx.labels.join(", ") : (tx.labels || "N/A");
      const li = document.createElement("li");
      li.innerHTML = `
        <div style="color:${color}; font-weight:600;">
           ${tx.category_name || "No Category"} — Rs. ${parseFloat(tx.amount).toFixed(2)}
        </div>
        <div style="font-size:0.9rem; color:${textColor};">
           ${tx.transaction_date} ${tx.transaction_time}<br/>
           Labels: ${labelsText}<br/>
           Payee: ${tx.payee_name || "N/A"}
        </div>
        <hr style="border:none; border-bottom:1px solid ${isDark ? "#555" : "#ccc"}; margin:8px 0;" />
      `;
      transactionList.appendChild(li);
    });
    if (data.length > 5) {
      const showMoreLi = document.createElement("li");
      showMoreLi.innerHTML = `
        <a href="transactions.html" 
           style="display:block;text-align:center;color:#007BFF;text-decoration:none;margin:12px 0;">
            Show More
        </a>`;
      transactionList.appendChild(showMoreLi);
    }
  } catch (error) {
    console.error("Error loading transactions:", error);
  }
}

// ===================================================
// 💱 LOAD CURRENCY RATES
// ===================================================
// Fetches and displays currency exchange rates
async function loadCurrencyRates() {
  const res = await fetch("../backend/exchange_rates.php");
  const data = await res.json();
  currencyList.innerHTML = "";
  for (const [currency, rate] of Object.entries(data)) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${currency}</span> → <strong>₨ ${rate}</strong>`;
    currencyList.appendChild(li);
  }
}

// ===================================================
// 📊 LOAD EXPENSE CHART
// ===================================================
// Renders the expense pie chart using Chart.js
async function loadExpenseChart() {
  const res = await fetch("../backend/expense_stats.php");
  const data = await res.json();
  const isDark = document.body.classList.contains("dark");
  if (expenseChartInstance) expenseChartInstance.destroy();
  expenseChartInstance = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: isDark
          ? ["#26c3a1", "#ffba08", "#ff4d6d", "#3a86ff", "#8338ec", "#ff9100", "#06d6a0", "#ffdd00", "#f72585", "#4cc9f0"]
          : ["#124e66", "#0fa4af", "#e64833", "#90aead", "#874F41", "#f4a261", "#2a9d8f", "#f94144", "#577590", "#ffba08"]
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: isDark ? "#d1d5db" : "#000"
          }
        }
      }
    }
  });
}

// ===================================================
// 📈 LOAD MONTHLY CHART
// ===================================================
// Renders the monthly bar chart using Chart.js
async function loadMonthlyChart() {
  const res = await fetch("../backend/monthly_stats.php");
  const data = await res.json();
  const isDark = document.body.classList.contains("dark");
  if (monthlyChartInstance) monthlyChartInstance.destroy();
  monthlyChartInstance = new Chart(document.getElementById("monthlyChart"), {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [{
        label: "Monthly Expenses",
        data: data.values,
        backgroundColor: isDark ? "#26c3a1" : "#0fa4af"
      }]
    },
    options: {
      scales: {
        x: { ticks: { color: isDark ? "#d1d5db" : "#000" } },
        y: {
          beginAtZero: true,
          ticks: { color: isDark ? "#d1d5db" : "#000" }
        }
      },
      plugins: {
        legend: {
          labels: { color: isDark ? "#d1d5db" : "#000" }
        }
      }
    }
  });
}

// ===================================================
// 🏆 LOAD TOP EXPENSES
// ===================================================
// Fetches and displays top expense categories
async function loadTopExpenses() {
  try {
    const res = await fetch("../backend/top_expenses.php");
    const data = await res.json();
    topExpensesList.innerHTML = "";
    highestCategoryDisplay.innerHTML = `
      Highest Category: ${data.highest_category_name || "N/A"} — Rs. ${parseFloat(data.highest_category_amount || 0).toFixed(2)}
    `;
    if (Array.isArray(data.top_expenses) && data.top_expenses.length > 0) {
      data.top_expenses.forEach((exp) => {
        const li = document.createElement("li");
        li.innerHTML = `${exp.category_name || "Other"} — Rs. ${parseFloat(exp.total_amount).toFixed(2)}`;
        topExpensesList.appendChild(li);
      });
    } else {
      topExpensesList.innerHTML = "<li>No data available</li>";
    }
  } catch (error) {
    console.error("Error loading top expenses:", error);
    topExpensesList.innerHTML = "<li>Error loading data</li>";
  }
}

// ===================================================
// 🗂️ LOAD CATEGORIES
// ===================================================
// Fetches and populates category dropdown
async function loadCategories() {
  const res = await fetch("../backend/get_categories.php");
  const data = await res.json();
  const select = transactionForm.querySelector("select[name='category_id']");
  select.innerHTML = "<option value=''>Select Category</option>";
  data.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

// ===================================================
// 🏷️ LOAD LABELS
// ===================================================
// Fetches and populates label dropdown
async function loadLabels() {
  const res = await fetch("../backend/get_labels.php");
  const data = await res.json();
  const select = transactionForm.querySelector("select[name='label_id']");
  select.innerHTML = "<option value=''>Select Label</option>";
  data.forEach((label) => {
    const option = document.createElement("option");
    option.value = label.id;
    option.textContent = label.name;
    select.appendChild(option);
  });
}

// ===================================================
// 🚀 INITIAL LOAD
// ===================================================
// Loads all dashboard data on page load
function reloadAllData() {
  loadAccounts();
  loadTransactions();
  loadCurrencyRates();
  loadExpenseChart();
  loadMonthlyChart();
  loadTopExpenses();
  loadCategories();
  loadLabels();
}
reloadAllData();

// ===================================================
// 🧭 NAVIGATION BUTTON ACTIONS
// ===================================================
// Handles navigation for sidebar and bottom nav
const navButtons = {
  "🏠": "dashboard.html",
  "👤": "user.html",
  "📋": "transactions.html",
  "🚪": "logout"
};
document.querySelectorAll('.side-nav .nav-icon, .bottom-nav .nav-icon').forEach(button => {
  const icon = button.textContent.trim();
  if (navButtons[icon]) {
    button.addEventListener('click', () => {
      if (navButtons[icon] === "logout") {
        fetch("backend/logout.php")
          .then(() => {
            window.location.href = "index.html";
          });
      } else {
        window.location.href = navButtons[icon];
      }
    });
  }
});

// ===================================================
// 🐞 DEBUGGING SUBMISSION
// ===================================================
// Logs form data to console for debugging
transactionForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(transactionForm);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
});

document.addEventListener('themeChanged', () => {
  loadTransactions();
  loadExpenseChart();
  loadMonthlyChart();
});
