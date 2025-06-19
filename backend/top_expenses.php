<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

try {
    $userId = $_SESSION["user_id"];
    $stmt = $pdo->prepare("
        SELECT l.name AS label, SUM(t.amount) AS amount
        FROM transactions t
        JOIN transaction_labels tl ON t.id = tl.transaction_id
        JOIN labels l ON tl.label_id = l.id
        WHERE t.user_id = :user_id
            AND t.transaction_type = 'expense'
        GROUP BY l.name
        ORDER BY amount DESC
        LIMIT 5
    ");
    $stmt->execute(["user_id" => $userId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
