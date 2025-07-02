# 💸 Expense Tracker


## 🌍 Hosted Online

**Try it instantly:**
👉 [https://mustafa-dohad.infinityfreeapp.com/public/index.html](https://mustafa-dohad.infinityfreeapp.com/public/index.html)

---

**A modern, full-featured personal finance and expense tracking web app.**  
Track your spending, manage accounts, analyze trends, and take control of your financial life—all in a beautiful, responsive interface.

---

## ✨ Features

- **User Authentication:** Secure signup, login, and session management with PHP and MySQL.
- **Dashboard Overview:** See all your accounts and balances at a glance. Quick stats on top expenses, recent transactions, and more.
- **Add, Edit, and Delete Transactions:** Support for expenses, income, and transfers. Assign categories, labels, payees, and notes. Edit or delete any transaction with ease.
- **Powerful Filtering:** Filter transactions by month, category, label, or payee. Instantly reset filters to see all data.
- **Analytics & Charts:** Pie chart of expenses by category. Bar chart of monthly expenses. Top expenses and highest spending category.
- **Multi-Account Support:** Track multiple accounts (bank, cash, etc.). See balances and manage accounts.
- **Labels & Payees:** Organize transactions with custom labels. Track spending by payee.
- **Currency Exchange Rates:** View live exchange rates for major currencies.
- **Dark/Light Theme Toggle:** Beautiful, persistent dark and light modes. Theme preference saved across sessions.
- **Mobile-First, Responsive UI:** Works seamlessly on desktop, tablet, and mobile. Floating action buttons and mobile nav.
- **Security:** All sensitive backend endpoints require authentication. Direct access to dashboard, transactions, and user profile is restricted unless logged in.

---


## 🗂️ Project Structure

```
expense-tracker/
│
├── backend/         # PHP backend (API endpoints, auth, DB)
│   ├── login.php, logout.php, signup.php
│   ├── get_transactions.php, add_transaction.php, edit_transaction.php, delete_transaction.php
│   ├── get_accounts.php, get_categories.php, get_labels.php, get_payees.php
│   ├── expense_stats.php, monthly_stats.php, top_expenses.php, exchange_rates.php
│   └── ... (see full list in repo)
│
├── public/          # Frontend (HTML, JS, CSS)
│   ├── index.html, dashboard.html, transactions.html, user.html
│   ├── app.js, dashboard.js, transactions.js
│   ├── style.css, dashboard.css, transactions.css
│   └── ... (modular, well-commented code)
│
├── sql/             # Database schema
│   └── Expense Tracker Schema.sql
│
├── README.md
└── composer.json, .gitignore, etc.
```

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (modular, ES6+)
- **Backend:** PHP 7+, MySQL (PDO), RESTful endpoints
- **Database:** MySQL (see `sql/Expense Tracker Schema.sql`)
- **Other:** Chart.js for analytics, Dotenv for config, Responsive design

---

## 🏗️ Database Schema

- Users, Sessions, Accounts, Account Types
- Categories, Labels, Payees
- Transactions (with support for transfers, recurring, notes, etc.)
- Transaction Labels (many-to-many)
- Budgets, Recurring Transactions

> See [`sql/Expense Tracker Schema.sql`](sql/Expense%20Tracker%20Schema.sql) for full details.

---

## ⚡ Quick Start

### 1. Clone the Repo

```bash
git clone https://github.com/mustafa-dohad/expense-tracker.git
cd expense-tracker
```

### 2. Install Backend Dependencies

```bash
composer install
```

### 3. Set Up Environment

- Copy `.env.example` to `.env` and fill in your DB credentials.

### 4. Set Up Database

- Import the schema:
  ```bash
  mysql -u youruser -p yourdb < sql/Expense\ Tracker\ Schema.sql
  ```

### 5. Run Locally

- Serve the `public/` directory with your favorite PHP server:
  ```bash
  php -S localhost:8000 -t public
  ```
- Or use XAMPP/LAMP and point your web root to `public/`.

### 6. Open in Browser

- Go to [http://localhost:8000/index.html](http://localhost:8000/index.html)

---

## 📋 API Endpoints (Backend)

- `login.php`, `logout.php`, `signup.php`
- `get_transactions.php`, `add_transaction.php`, `edit_transaction.php`, `delete_transaction.php`
- `get_accounts.php`, `get_categories.php`, `get_labels.php`, `get_payees.php`
- `expense_stats.php`, `monthly_stats.php`, `top_expenses.php`, `exchange_rates.php`
- All endpoints require authentication (session-based).

---

## 🧑‍💻 Developer Experience

- **Modular, well-commented code** for easy maintenance and extension.
- **Modern CSS** with clear section headers and comments.
- **Frontend and backend are cleanly separated.**
- **Security best practices**: session checks, restricted endpoints, password hashing.

---

## 🤝 Contributing

Pull requests and suggestions are welcome!  
Please open an issue or submit a PR.

---



## 👨‍💻 Author

**Mustafa Dohad**  
[GitHub](https://github.com/mustafa-dohad)  
mustafamurtazadohad@gmail.com

---

> _"Track smarter. Spend wiser. Live better."_