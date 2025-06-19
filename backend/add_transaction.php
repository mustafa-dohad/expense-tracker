<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

// Check login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Validate POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
    exit;
}

// Collect inputs
$account_id = $_POST['account_id'] ?? null;
$category_id = $_POST['category_id'] ?? null;
$payee_id = $_POST['payee_id'] ?? null;
$amount = $_POST['amount'] ?? null;
$type = $_POST['transaction_type'] ?? null;
$method = $_POST['payment_method'] ?? 'cash';
$label_id = $_POST['label_id'] ?? null;
$date = $_POST['transaction_date'] ?? null;
$time = $_POST['transaction_time'] ?? '12:00:00';
$description = $_POST['description'] ?? null;

if (!$account_id || !$amount || !$type || !$date) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

try {
    // Insert transaction
    $stmt = $pdo->prepare("
        INSERT INTO transactions 
        (user_id, account_id, category_id, payee_id, amount, transaction_type, payment_method, transaction_date, transaction_time, description)
        VALUES 
        (:user_id, :account_id, :category_id, :payee_id, :amount, :transaction_type, :payment_method, :transaction_date, :transaction_time, :description)
    ");

    $stmt->execute([
        'user_id' => $user_id,
        'account_id' => $account_id,
        'category_id' => $category_id,
        'payee_id' => $payee_id,
        'amount' => $amount,
        'transaction_type' => $type,
        'payment_method' => $method,
        'transaction_date' => $date,
        'transaction_time' => $time,
        'description' => $description
    ]);

    $transaction_id = $pdo->lastInsertId();

    // Link label if provided
    if ($label_id) {
        $label_stmt = $pdo->prepare("INSERT INTO transaction_labels (transaction_id, label_id) VALUES (:transaction_id, :label_id)");
        $label_stmt->execute([
            'transaction_id' => $transaction_id,
            'label_id' => $label_id
        ]);
    }

    echo json_encode(["status" => "success", "message" => "Transaction added."]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "DB Error: " . $e->getMessage()]);
}
