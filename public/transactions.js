// ===================================================
// 📄 TRANSACTION LOADING & PAGINATION
// ===================================================
// Loads and displays transactions, grouped by month, with pagination
let monthPages = [];
let currentMonthPage = 0;

/**
 * Loads transactions from backend and displays them grouped by month.
 * @param {Object} filters - Filtering options (category, label, payee, month)
 */
async function loadTransactions(filters = {}) {
  const res = await fetch("/backend/get_transactions.php");
  const data = await res.json();
  const grouped = groupByMonth(data, filters);
  monthPages = Object.entries(grouped);
  if (monthPages.length === 0) {
    document.getElementById("transactions-container").innerHTML = "<div style='padding:32px;text-align:center;color:#888;'>No transactions found.</div>";
    document.getElementById("pagination-controls").innerHTML = "";
    return;
  }
  if (currentMonthPage >= monthPages.length) currentMonthPage = monthPages.length - 1;
  if (currentMonthPage < 0) currentMonthPage = 0;
  const [month, txns] = monthPages[currentMonthPage];
  const container = document.getElementById("transactions-container");
  container.innerHTML = "";
  const group = document.createElement("div");
  group.className = "transactions-group";
  group.innerHTML = `<h4>${month}</h4>`;
  txns.forEach((tx) => {
    const div = document.createElement("div");
    div.className = "transaction-entry";
    let badgeClass = "badge-expense", badgeText = "Expense";
    if (tx.transaction_type === "income") {
      badgeClass = "badge-income"; badgeText = "Income";
    } else if (tx.transaction_type === "transfer") {
      badgeClass = "badge-transfer"; badgeText = "Transfer";
    }
    div.innerHTML = `
      <div class="transaction-header-row">
        <span class="transaction-category">${tx.category_name || "No Category"}</span>
        <span class="transaction-amount">Rs. ${parseFloat(tx.amount).toFixed(2)}</span>
        <span class="transaction-badge badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="transaction-meta-row">
        <div class="meta-group">
          <span>${tx.transaction_date} ${tx.transaction_time}</span>
          <span>Payee: ${tx.payee_name || "N/A"}</span>
          <span>Label: ${(Array.isArray(tx.labels) && tx.labels.length > 0) ? tx.labels.join(", ") : (tx.labels || "N/A")}</span>
        </div>
        <div class="transaction-actions">
          <button onclick="editTransaction(${tx.id})" title="Edit">✏️</button>
          <button onclick="deleteTransaction(${tx.id})" title="Delete">🗑️</button>
        </div>
      </div>`;
    group.appendChild(div);
  });
  container.appendChild(group);
  // Pagination controls
  const pagination = document.getElementById("pagination-controls");
  if (pagination) {
    pagination.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;gap:18px;margin-top:18px;">
        <button id="prev-month" ${currentMonthPage === 0 ? "disabled" : ""} style="padding:7px 18px;border-radius:16px;border:1px solid #ccc;background:#f9fafb;cursor:pointer;font-size:1rem;">Previous</button>
        <span style="font-weight:600;">${month}</span>
        <button id="next-month" ${currentMonthPage === monthPages.length-1 ? "disabled" : ""} style="padding:7px 18px;border-radius:16px;border:1px solid #ccc;background:#f9fafb;cursor:pointer;font-size:1rem;">Next</button>
      </div>
    `;
    document.getElementById("prev-month").onclick = () => { currentMonthPage--; loadTransactions(filters); };
    document.getElementById("next-month").onclick = () => { currentMonthPage++; loadTransactions(filters); };
  }
}

/**
 * Groups transactions by month and applies filters.
 * @param {Array} data - Array of transaction objects
 * @param {Object} filters - Filtering options
 * @returns {Object} - Map of month to transactions
 */
function groupByMonth(data, filters) {
  const map = {};
  const filtered = data.filter((tx) => {
    let date = new Date(tx.transaction_date);
    let monthStr = date.toLocaleString("default", { month: "long", year: "numeric" });
    return (
      (!filters.category || tx.category_name == filters.category) &&
      (!filters.label || (Array.isArray(tx.labels) && tx.labels.includes(filters.label))) &&
      (!filters.payee || tx.payee_name == filters.payee) &&
      (!filters.month || monthStr == filters.month)
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

// ===================================================
// 🔎 FILTERS
// ===================================================
// Loads and populates filter dropdowns for category, label, payee, and month
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
    opt.value = c.name;
    opt.textContent = c.name;
    document.getElementById("filter-category").appendChild(opt);
  });
  labels.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l.name;
    opt.textContent = l.name;
    document.getElementById("filter-label").appendChild(opt);
  });
  payees.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = p.name;
    document.getElementById("filter-payee").appendChild(opt);
  });
  // Populate month filter
  const res = await fetch("/backend/get_transactions.php");
  const data = await res.json();
  const months = new Set();
  data.forEach((tx) => {
    const date = new Date(tx.transaction_date);
    const month = date.toLocaleString("default", { month: "long", year: "numeric" });
    months.add(month);
  });
  const monthSelect = document.getElementById("filter-month");
  monthSelect.innerHTML = '<option value="">All Months</option>';
  Array.from(months).sort((a, b) => {
    // Sort by date descending
    const [ma, ya] = a.split(" ");
    const [mb, yb] = b.split(" ");
    const da = new Date(ma + " 1, " + ya);
    const db = new Date(mb + " 1, " + yb);
    return db - da;
  }).forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });
}

["filter-category", "filter-label", "filter-payee", "filter-month"].forEach((id) => {
  document.getElementById(id).addEventListener("change", () => {
    const filters = {
      category: document.getElementById("filter-category").value,
      label: document.getElementById("filter-label").value,
      payee: document.getElementById("filter-payee").value,
      month: document.getElementById("filter-month").value,
    };
    loadTransactions(filters);
  });
});

// ===================================================
// ➕ ADD FORM
// ===================================================
// Handles add transaction modal and form submission
async function populateAddFormFields() {
  const [accRes, catRes, labelRes] = await Promise.all([
    fetch("../backend/get_accounts.php"),
    fetch("../backend/get_categories.php"),
    fetch("../backend/get_labels.php"),
  ]);
  const accText = await accRes.text();
  const catText = await catRes.text();
  const labelText = await labelRes.text();
  const accounts = JSON.parse(accText);
  const categories = JSON.parse(catText);
  const labels = JSON.parse(labelText);
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

// ===================================================
// ✏️ EDIT FORM
// ===================================================
// Handles edit transaction modal and form submission
async function editTransaction(id) {
  await populateEditFormFields();
  const res = await fetch(`../backend/get_single_transaction.php?id=${id}`);
  const tx = await res.json();
  const form = document.getElementById("edit-form");
  form.dataset.txId = id;
  Object.entries(tx).forEach(([key, value]) => {
    const input = form.elements.namedItem(key);
    if (input) {
      input.value = value;
    }
  });
  if (form.elements["payee_name"] && tx["payee_name"]) {
    form.elements["payee_name"].value = tx["payee_name"];
  }
  if (form.elements["label_id"]) {
    const labelId = Array.isArray(tx.label_ids) && tx.label_ids.length > 0 ? tx.label_ids[0] : (tx.label_id || "");
    const labelSelect = form.elements["label_id"];
    if ([...labelSelect.options].some(opt => opt.value == labelId)) {
      labelSelect.value = labelId;
    } else {
      labelSelect.value = "";
    }
  }
  document.getElementById("edit-overlay").classList.remove("hidden");
}

async function populateEditFormFields() {
  try {
    const [accRes, catRes, labelRes] = await Promise.all([
      fetch("../backend/get_accounts.php"),
      fetch("../backend/get_categories.php"),
      fetch("../backend/get_labels.php"),
    ]);
    const accText = await accRes.text();
    const catText = await catRes.text();
    const labelText = await labelRes.text();
    const accounts = JSON.parse(accText);
    const categories = JSON.parse(catText);
    const labels = JSON.parse(labelText);
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
  const labelId = form.elements["label_id"]?.value;
  formData.append("label_id", labelId);
  formData.append("transaction_id", form.dataset.txId);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  const res = await fetch("../backend/edit_transaction.php", {
    method: "POST",
    body: formData,
  });
  const result = await res.json();
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

// ===================================================
// 🗑️ DELETE TRANSACTION
// ===================================================
// Handles transaction deletion
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

// Add Reset button logic for filters
const resetBtn = document.getElementById("reset-filters");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    document.getElementById("filter-category").value = "";
    document.getElementById("filter-label").value = "";
    document.getElementById("filter-payee").value = "";
    document.getElementById("filter-month").value = "";
    loadTransactions({});
  });
}

// Add a div for pagination controls if not present
if (!document.getElementById("pagination-controls")) {
  const pagDiv = document.createElement("div");
  pagDiv.id = "pagination-controls";
  document.querySelector("#transactions-container").insertAdjacentElement("afterend", pagDiv);
}
