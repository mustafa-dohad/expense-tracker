<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

$user_id = $_SESSION["user_id"];

try {
    // Get user details
    $stmt = $pdo->prepare("SELECT first_name, last_name, email, phone, currency_code, timezone, profile_picture, is_admin FROM users WHERE id = :user_id");
    $stmt->execute(["user_id" => $user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get accounts
    $stmt = $pdo->prepare("SELECT * FROM accounts WHERE user_id = :user_id");
    $stmt->execute(["user_id" => $user_id]);
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get transactions
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = :user_id ORDER BY transaction_date DESC");
    $stmt->execute(["user_id" => $user_id]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "user" => $user,
        "accounts" => $accounts,
        "transactions" => $transactions
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
