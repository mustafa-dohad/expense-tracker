// Elements
const addButton = document.getElementById("add-transaction");
const addButtonDesktop = document.getElementById("add-transaction-desktop");
const themeButton = document.getElementById("theme-button");
const addOverlay = document.getElementById("add-overlay");
const cancelButton = document.getElementById("cancel-transaction");
const transactionForm = document.querySelector(".add-form");

// MODAL TOGGLE
addButton?.addEventListener("click", () =>
  addOverlay.classList.remove("hidden")
);
addButtonDesktop?.addEventListener("click", () =>
  addOverlay.classList.remove("hidden")
);
cancelButton?.addEventListener("click", (e) => {
  e.preventDefault();
  addOverlay.classList.add("hidden");
});

// DARK MODE TOGGLE
themeButton?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// NAV BUTTONS
document.querySelectorAll(".nav-icon").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const action = e.currentTarget.dataset.action;
    if (action === "logout") {
      window.location.href = "../backend/logout.php";
    } else if (action === "transactions") {
      window.location.href = "transactions.html";
    } else {
      alert(`${action} clicked!`);
    }
  });
});

// FORM SUBMISSION
transactionForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(transactionForm);
  try {
    const res = await fetch("../backend/add_transactions.php", {
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
  } catch (err) {
    alert("Error submitting transaction");
    console.error(err);
  }
});

// NEW LABEL
const addLabelButton = document.getElementById("add-label-button");
const newLabelInput = document.getElementById("new-label-input");
addLabelButton?.addEventListener("click", async () => {
  const labelName = newLabelInput.value.trim();
  if (!labelName) return;

  const res = await fetch("../backend/add_label.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: labelName }),
  });
  const result = await res.json();
  alert(result.message);
  if (result.status === "success") {
    newLabelInput.value = "";
    loadLabels();
  }
});

// LOADERS
async function loadAccounts() {
  const res = await fetch("../backend/get_accounts.php");
  const data = await res.json();
  const container = document.getElementById("account-list");
  const select = transactionForm.querySelector("select[name='account_id']");
  container.innerHTML = "";
  select.innerHTML = "<option value=''>Select Account</option>";
  data.forEach((acc) => {
    const div = document.createElement("div");
    div.className = "account-card";
    div.innerHTML = `<span>${acc.name}</span><strong>₨ ${acc.balance}</strong>`;
    container.appendChild(div);
    const option = document.createElement("option");
    option.value = acc.id;
    option.textContent = acc.name;
    select.appendChild(option);
  });
}

async function loadTransactions() {
  const res = await fetch("../backend/get_transactions.php");
  const data = await res.json();
  const list = document.getElementById("transactions-list");
  list.innerHTML = "";
  data.slice(0, 10).forEach((tx) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${tx.label}</span><span>₨ ${tx.amount} • ${tx.account}</span>`;
    list.appendChild(li);
  });
}

async function loadCurrencyRates() {
  const res = await fetch("../backend/exchange_rates.php");
  const data = await res.json();
  const list = document.getElementById("currency-list");
  list.innerHTML = "";
  for (const [currency, rate] of Object.entries(data)) {
    const li = document.createElement("li");
    li.innerHTML = `${currency} → PKR: <strong>₨ ${rate}</strong>`;
    list.appendChild(li);
  }
}

async function loadTopExpenses() {
  const res = await fetch("../backend/top_expenses.php");
  if (!res.ok) {
    console.error("Error loading top expenses:", res.statusText);
    return;
  }
  const data = await res.json();
  const list = document.getElementById("top-expenses-list");
  list.innerHTML = "";
  data.forEach((exp) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${exp.label}</span><span>₨ ${exp.amount}</span>`;
    list.appendChild(li);
  });
}

async function loadExpenseChart() {
  const res = await fetch("../backend/expense_stats.php");
  const data = await res.json();
  new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: data.labels,
      datasets: [
        {
          data: data.values,
          backgroundColor: [
            "#27374D",
            "#526D82",
            "#9DB2BF",
            "#DDE6ED",
            "#874F41",
          ],
        },
      ],
    },
  });
}

async function loadMonthlyChart() {
  const res = await fetch("../backend/monthly_stats.php");
  const data = await res.json();
  new Chart(document.getElementById("monthlyChart"), {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Monthly Expenses",
          data: data.values,
          backgroundColor: "#526D82",
        },
      ],
    },
    options: { scales: { y: { beginAtZero: true } } },
  });
}

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

// RELOAD ALL
async function reloadAllData() {
  await loadAccounts();
  await loadTransactions();
  await loadCurrencyRates();
  await loadTopExpenses();
  await loadExpenseChart();
  await loadMonthlyChart();
  await loadLabels();
}

// INIT
reloadAllData();
