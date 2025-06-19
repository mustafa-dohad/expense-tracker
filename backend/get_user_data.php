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
    // Get accounts
    $stmt = $pdo->prepare("SELECT * FROM accounts WHERE user_id = :user_id");
    $stmt->execute(["user_id" => $user_id]);
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get transactions
    $stmt = $pdo->prepare("SELECT * FROM transaction_details WHERE user_id = :user_id ORDER BY transaction_date DESC");
    $stmt->execute(["user_id" => $user_id]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "accounts" => $accounts,
        "transactions" => $transactions
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
