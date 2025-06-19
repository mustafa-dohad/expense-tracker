<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

try {
    $userId = $_SESSION["user_id"];
    $stmt = $pdo->prepare("
        SELECT c.name AS category, SUM(t.amount) AS total
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = :user_id
            AND t.transaction_type = 'expense'
        GROUP BY c.name
        ORDER BY total DESC
    ");
    $stmt->execute(["user_id" => $userId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $labels = array_column($results, 'category');
    $values = array_column($results, 'total');

    echo json_encode(["labels" => $labels, "values" => $values]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
