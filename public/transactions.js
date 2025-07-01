// ==========================
// THEME TOGGLE
// ==========================
const themeButton = document.getElementById("theme-button");
const themeButtonMobile = document.getElementById("theme-button-mobile");

function applyThemeIcon(isDark) {
  const icon = isDark ? "☀️" : "🌙";
  if (themeButton) themeButton.textContent = icon;
  if (themeButtonMobile) themeButtonMobile.textContent = icon;
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark");
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
  applyThemeIcon(isDark);

  [themeButton, themeButtonMobile].forEach((btn) => {
    if (btn) {
      btn.classList.add("theme-animated");
      setTimeout(() => btn.classList.remove("theme-animated"), 400);
    }
  });
}

(function () {
  const theme = localStorage.getItem("theme");
  const isDark = theme === "dark";
  if (isDark) {
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
  }
  applyThemeIcon(isDark);
})();

themeButton?.addEventListener("click", toggleDarkMode);
themeButtonMobile?.addEventListener("click", toggleDarkMode);

// ==========================
// NAVIGATION
// ==========================
document.querySelectorAll(".nav-icon").forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;

    switch (action) {
      case "home":
        window.location.href = "dashboard.html";
        break;
      case "profile":
        alert("Profile not implemented yet");
        break;
      case "transactions":
        window.location.href = "transactions.html";
        break;
      case "logout":
        alert("Logging out...");
        break;
      case "add":
        openAddModal();
        break;
    }
  });
});

window.addEventListener("click", (e) => {
  if (e.target.id === "add-overlay") {
    document.getElementById("add-overlay").classList.add("hidden");
  }
  if (e.target.id === "edit-overlay") {
    document.getElementById("edit-overlay").classList.add("hidden");
  }
});

// ==========================
// TRANSACTIONS
// ==========================
async function loadTransactions(filters = {}) {
  const res = await fetch("/backend/get_transactions.php");
  const data = await res.json();

  const grouped = groupByMonth(data, filters);
  const container = document.getElementById("transactions-container");
  container.innerHTML = "";

  for (const [month, txns] of Object.entries(grouped)) {
    const group = document.createElement("div");
    group.className = "transactions-group";
    group.innerHTML = `<h4>${month}</h4>`;

    txns.forEach((tx) => {
      const div = document.createElement("div");
      div.className = "transaction-entry";
      div.innerHTML = `
        <div>
          <strong>${tx.category_name}</strong> — Rs. ${parseFloat(
        tx.amount
      ).toFixed(2)}
          <div class="transaction-meta">${tx.transaction_date} | ${
        tx.payee_name || "N/A"
      }</div>
        </div>
        <div class="transaction-actions">
          <button onclick="editTransaction(${tx.id})">✏️</button>
          <button onclick="deleteTransaction(${tx.id})">🗑️</button>
        </div>`;
      group.appendChild(div);
    });

    container.appendChild(group);
  }
}

function groupByMonth(data, filters) {
  const map = {};
  const filtered = data.filter((tx) => {
    return (
      (!filters.category || tx.category_id == filters.category) &&
      (!filters.label || tx.label_id == filters.label) &&
      (!filters.payee || tx.payee_name == filters.payee)
    );
  });

  filtered.forEach((tx) => {
    const date = new Date(tx.transaction_date);
    const month = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!map[month]) map[month] = [];
    map[month].push(tx);
  });

  return map;
}

// ==========================
// FILTERS
// ==========================
async function loadFilters() {
  const [catRes, labelRes, payeeRes] = await Promise.all([
    fetch("../backend/get_categories.php"),
    fetch("../backend/get_labels.php"),
    fetch("../backend/get_payees.php"),
  ]);

  const categories = await catRes.json();
  const labels = await labelRes.json();
  const payees = await payeeRes.json();

  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    document.getElementById("filter-category").appendChild(opt);
  });

  labels.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.textContent = l.name;
    document.getElementById("filter-label").appendChild(opt);
  });

  payees.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = p.name;
    document.getElementById("filter-payee").appendChild(opt);
  });
}

["filter-category", "filter-label", "filter-payee"].forEach((id) => {
  document.getElementById(id).addEventListener("change", () => {
    const filters = {
      category: document.getElementById("filter-category").value,
      label: document.getElementById("filter-label").value,
      payee: document.getElementById("filter-payee").value,
    };
    loadTransactions(filters);
  });
});

// ==========================
// ADD FORM
// ==========================
async function populateAddFormFields() {
  const [accRes, catRes, labelRes] = await Promise.all([
    fetch("../backend/get_accounts.php"),
    fetch("../backend/get_categories.php"),
    fetch("../backend/get_labels.php"),
  ]);

  const accounts = await accRes.json();
  const categories = await catRes.json();
  const labels = await labelRes.json();

  const accountSelect = document.querySelector(
    "#transaction-form select[name='account_id']"
  );
  const categorySelect = document.querySelector(
    "#transaction-form select[name='category_id']"
  );
  const labelSelect = document.querySelector(
    "#transaction-form select[name='label_id']"
  );

  accountSelect.innerHTML = `<option value="">Select Account</option>`;
  accounts.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    accountSelect.appendChild(opt);
  });

  categorySelect.innerHTML = `<option value="">Select Category</option>`;
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    categorySelect.appendChild(opt);
  });

  labelSelect.innerHTML = `<option value="">Select Label</option>`;
  labels.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.textContent = l.name;
    labelSelect.appendChild(opt);
  });
}

function openAddModal() {
  populateAddFormFields()
    .then(() => {
      document.getElementById("transaction-form").reset();
      document.getElementById("add-overlay").classList.remove("hidden");
    })
    .catch((err) => {
      console.error("Failed to load form fields:", err);
      alert("Failed to load form fields. Try again.");
    });
}

document
  .getElementById("add-transaction-desktop")
  ?.addEventListener("click", openAddModal);

document
  .getElementById("transaction-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch("../backend/add_transaction.php", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    alert(result.message);
    if (result.status === "success") {
      document.getElementById("add-overlay").classList.add("hidden");
      loadTransactions();
      e.target.reset();
    }
  });

document.getElementById("cancel-transaction")?.addEventListener("click", () => {
  document.getElementById("add-overlay").classList.add("hidden");
});

// ==========================
// EDIT FORM
// ==========================
async function editTransaction(id) {
  // Load dropdowns (account, category, label etc.)
  await populateEditFormFields();

  // Fetch single transaction
  const res = await fetch(`../backend/get_single_transaction.php?id=${id}`);
  const tx = await res.json();

  // Select the form
  const form = document.getElementById("edit-form");
  form.dataset.txId = id;

  // Fill matching fields (amount, type, date, etc.)
  Object.entries(tx).forEach(([key, value]) => {
    const input = form.elements.namedItem(key);
    if (input) {
      input.value = value;
    }
  });

  // Special handling for payee name (input field)
  if (form.elements["payee_name"] && tx["payee_name"]) {
    form.elements["payee_name"].value = tx["payee_name"];
  }

  // Set label dropdown (use first label_id if array exists)
  if (Array.isArray(tx.label_ids) && tx.label_ids.length > 0 && form.elements["label_id"]) {
    form.elements["label_id"].value = tx.label_ids[0];
  }

  // Show modal
  document.getElementById("edit-overlay").classList.remove("hidden");
}


async function populateEditFormFields() {
  try {
    const [accRes, catRes, labelRes] = await Promise.all([
      fetch("../backend/get_accounts.php"),
      fetch("../backend/get_categories.php"),
      fetch("../backend/get_labels.php"),
    ]);

    const accounts = await accRes.json();
    const categories = await catRes.json();
    const labels = await labelRes.json();

    const accountSelect = document.querySelector(
      "#edit-form select[name='account_id']"
    );
    const categorySelect = document.querySelector(
      "#edit-form select[name='category_id']"
    );
    const labelSelect = document.querySelector(
      "#edit-form select[name='label_id']"
    );

    accountSelect.innerHTML = `<option value="">Select Account</option>`;
    accounts.forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.name;
      accountSelect.appendChild(opt);
    });

    categorySelect.innerHTML = `<option value="">Select Category</option>`;
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    });

    labelSelect.innerHTML = `<option value="">Select Label</option>`;
    labels.forEach((l) => {
      const opt = document.createElement("option");
      opt.value = l.id;
      opt.textContent = l.name;
      labelSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to populate edit form fields:", err);
    alert("Could not load form options.");
  }
}

document.getElementById("edit-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const formData = new FormData(form);

  // Convert payee_name to payee_id
  const payeeName = form.elements["payee_name"].value.trim();
  const payeeSelect = document.getElementById("filter-payee");
  let payeeId = null;

  for (let opt of payeeSelect.options) {
    if (opt.textContent.trim() === payeeName) {
      payeeId = opt.value;
      break;
    }
  }

  if (!payeeId) {
    alert("Payee not found. Make sure it exists in the dropdown.");
    return;
  }

  formData.append("payee_id", payeeId); // Add payee_id manually
  formData.delete("payee_name"); // Optional: remove payee_name

  // Get the label_id
  const labelId = form.elements["label_id"]?.value;
  formData.append("label_id", labelId);

  // Also include transaction_id from dataset
  formData.append("transaction_id", form.dataset.txId);

  const res = await fetch("../backend/edit_transaction.php", {
    method: "POST",
    body: formData,
  });
  

  const result = await res.json();
  console.log("Edit result:", result);
  alert(result.message || "Transaction updated.");

  if (result.status === "success") {
    document.getElementById("edit-overlay").classList.add("hidden");
    loadTransactions();
    form.reset();
  }
  
});
document.getElementById("cancel-edit")?.addEventListener("click", () => {
  document.getElementById("edit-overlay").classList.add("hidden");
});



// ==========================
// DELETE
// ==========================
async function deleteTransaction(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    await fetch(`../backend/delete_transaction.php?id=${id}`);
    loadTransactions();
  }
}

// ==========================
// INIT
// ==========================
loadFilters();
loadTransactions();
