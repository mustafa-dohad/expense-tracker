<?php
require 'db.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT t.id, t.amount, t.transaction_type, t.transaction_date, t.transaction_time,
               c.name AS category_name, p.name AS payee_name,
               GROUP_CONCAT(l.name SEPARATOR ',') AS labels
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN payees p ON t.payee_id = p.id
        LEFT JOIN transaction_labels tl ON t.id = tl.transaction_id
        LEFT JOIN labels l ON tl.label_id = l.id
        WHERE t.user_id = :user_id
        GROUP BY t.id
        ORDER BY t.transaction_date DESC, t.transaction_time DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute(["user_id" => $user_id]);
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

$transactions = [];
foreach ($results as $row) {
    $transactions[] = [
        "id" => $row["id"],
        "amount" => $row["amount"],
        "transaction_type" => $row["transaction_type"],
        "transaction_date" => $row["transaction_date"],
        "transaction_time" => $row["transaction_time"],
        "category_name" => $row["category_name"],
        "payee_name" => $row["payee_name"],
        "labels" => $row["labels"] ? explode(",", $row["labels"]) : []
    ];
}

echo json_encode($transactions);
