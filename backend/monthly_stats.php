<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

try {
    $userId = $_SESSION["user_id"];
    $stmt = $pdo->prepare("
        SELECT MONTH(transaction_date) AS month, SUM(amount) AS total
        FROM transactions
        WHERE user_id = :user_id
            AND transaction_type = 'expense'
            AND YEAR(transaction_date) = YEAR(CURDATE())
        GROUP BY MONTH(transaction_date)
        ORDER BY month ASC
    ");
    $stmt->execute(["user_id" => $userId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $months = array_fill(1, 12, 0);
    foreach ($results as $row) {
        $monthNum = (int)$row["month"];
        $months[$monthNum] = (float)$row["total"];
    }

    $labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    $values = array_values($months);

    echo json_encode(["labels" => $labels, "values" => $values]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
