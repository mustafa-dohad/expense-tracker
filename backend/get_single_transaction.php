<?php
require 'db.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

if (!isset($_GET['id'])) {
    echo json_encode(["status" => "missing_id"]);
    exit;
}

$transaction_id = $_GET['id'];
$user_id = $_SESSION['user_id'];

// Fetch main transaction
$sql = "SELECT t.*, p.name AS payee_name
        FROM transactions t
        LEFT JOIN payees p ON t.payee_id = p.id
        WHERE t.id = :id AND t.user_id = :user_id";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    "id" => $transaction_id,
    "user_id" => $user_id
]);

$transaction = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$transaction) {
    echo json_encode(["status" => "not_found"]);
    exit;
}

// Optional: fetch label_id (if you're storing one-to-many)
$labelStmt = $pdo->prepare("SELECT label_id FROM transaction_labels WHERE transaction_id = ?");
$labelStmt->execute([$transaction_id]);
$labelIds = $labelStmt->fetchAll(PDO::FETCH_COLUMN);

$transaction['label_ids'] = $labelIds;
echo json_encode($transaction);
