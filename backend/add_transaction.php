<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

// User must be logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
    exit;
}

// Gather inputs
$account_id = $_POST['account_id'] ?? null;
$category_id = $_POST['category_id'] ?? null;
$payee_name = $_POST['payee_name'] ?? null;
$amount = $_POST['amount'] ?? null;
$type = $_POST['transaction_type'] ?? null;
$method = $_POST['payment_method'] ?? 'cash';
$label_id = $_POST['label_id'] ?? null;
$new_label = $_POST['new_label'] ?? null;
$date = $_POST['transaction_date'] ?? null;
$time = $_POST['transaction_time'] ?? '12:00:00';
$description = $_POST['description'] ?? null;
$transfer_account_id = $_POST['transfer_account_id'] ?? null;

// Validate required fields
if (!$account_id || !$amount || !$type || !$date) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

// Find or create payee
$payee_id = null;
if (!empty($payee_name)) {
    $payee_check = $pdo->prepare("SELECT id FROM payees WHERE user_id = :user_id AND name = :name");
    $payee_check->execute([':user_id' => $user_id, ':name' => $payee_name]);
    $payee_row = $payee_check->fetch();

    if ($payee_row) {
        $payee_id = $payee_row['id'];
    } else {
        $payee_insert = $pdo->prepare("INSERT INTO payees (user_id, name) VALUES (:user_id, :name)");
        $payee_insert->execute([':user_id' => $user_id, ':name' => $payee_name]);
        $payee_id = $pdo->lastInsertId();
    }
}

try {
    $pdo->beginTransaction();

    // Insert transaction
    $stmt = $pdo->prepare("
        INSERT INTO transactions 
        (user_id, account_id, category_id, payee_id, transfer_account_id, amount, transaction_type, payment_method, transaction_date, transaction_time, description) 
        VALUES 
        (:user_id, :account_id, :category_id, :payee_id, :transfer_account_id, :amount, :transaction_type, :payment_method, :transaction_date, :transaction_time, :description)
    ");
    $stmt->execute([
        ':user_id' => $user_id,
        ':account_id' => $account_id,
        ':category_id' => $category_id ?: null,
        ':payee_id' => $payee_id ?: null,
        ':transfer_account_id' => $transfer_account_id ?: null,
        ':amount' => $amount,
        ':transaction_type' => $type,
        ':payment_method' => $method,
        ':transaction_date' => $date,
        ':transaction_time' => $time,
        ':description' => $description
    ]);

    $transaction_id = $pdo->lastInsertId();

    // Create new label if needed
    if (!empty($new_label)) {
        $label_stmt = $pdo->prepare("INSERT INTO labels (user_id, name) VALUES (:user_id, :name)");
        $label_stmt->execute([':user_id' => $user_id, ':name' => $new_label]);
        $new_label_id = $pdo->lastInsertId();
        $label_id = $new_label_id;
    }

    // Link label
    if (!empty($label_id)) {
        $label_link_stmt = $pdo->prepare("INSERT INTO transaction_labels (transaction_id, label_id) VALUES (:transaction_id, :label_id)");
        $label_link_stmt->execute([
            ':transaction_id' => $transaction_id,
            ':label_id' => $label_id
        ]);
    }

    // Update account balances
    if ($type === 'expense') {
        $pdo->prepare("UPDATE accounts SET current_balance = current_balance - :amount WHERE id = :account_id AND user_id = :user_id")
            ->execute([':amount' => $amount, ':account_id' => $account_id, ':user_id' => $user_id]);
    } elseif ($type === 'income') {
        $pdo->prepare("UPDATE accounts SET current_balance = current_balance + :amount WHERE id = :account_id AND user_id = :user_id")
            ->execute([':amount' => $amount, ':account_id' => $account_id, ':user_id' => $user_id]);
    } elseif ($type === 'transfer' && $transfer_account_id) {
        $pdo->prepare("UPDATE accounts SET current_balance = current_balance - :amount WHERE id = :source_id AND user_id = :user_id")
            ->execute([':amount' => $amount, ':source_id' => $account_id, ':user_id' => $user_id]);
        $pdo->prepare("UPDATE accounts SET current_balance = current_balance + :amount WHERE id = :target_id AND user_id = :user_id")
            ->execute([':amount' => $amount, ':target_id' => $transfer_account_id, ':user_id' => $user_id]);
    }

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Transaction added successfully."]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
