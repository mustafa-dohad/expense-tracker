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
    $sql = "SELECT t.amount, t.transaction_type, t.transaction_date,
                   IFNULL(l.name, '—') AS label,
                   a.name AS account_name
            FROM transactions t
            LEFT JOIN transaction_labels tl ON t.id = tl.transaction_id
            LEFT JOIN labels l ON tl.label_id = l.id
            JOIN accounts a ON t.account_id = a.id
            WHERE t.user_id = :user_id
            ORDER BY t.transaction_date DESC, t.transaction_time DESC
            LIMIT 10";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(["user_id" => $user_id]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format for output
    $output = [];
    foreach ($transactions as $row) {
        $output[] = [
            "amount" => (float)$row["amount"],
            "type" => $row["transaction_type"],
            "date" => $row["transaction_date"],
            "label" => $row["label"],
            "account" => $row["account_name"]
        ];
    }

    echo json_encode($output);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
