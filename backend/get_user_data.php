<?php
require 'db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get accounts
$stmt = $pdo->prepare("SELECT * FROM accounts WHERE user_id = ?");
$stmt->execute([$user_id]);
$accounts = $stmt->fetchAll();

// Get transaction view data
$stmt = $pdo->prepare("SELECT * FROM transaction_details WHERE user_id = ? ORDER BY transaction_date DESC");
$stmt->execute([$user_id]);
$transactions = $stmt->fetchAll();

echo json_encode([
    "status" => "success",
    "accounts" => $accounts,
    "transactions" => $transactions
]);
?>
