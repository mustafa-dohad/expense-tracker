<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["highest_category_name" => "N/A", "highest_category_amount" => 0, "top_expenses" => []]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT c.name AS category_name, SUM(t.amount) AS total_amount
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = :user_id 
      AND t.transaction_type = 'expense'
      AND YEAR(t.transaction_date) = YEAR(CURDATE())
      AND MONTH(t.transaction_date) = MONTH(CURDATE())
    GROUP BY c.name
    ORDER BY total_amount DESC
    LIMIT 5
");
$stmt->execute(["user_id" => $_SESSION["user_id"]]);
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get highest category
$highestCategory = $result[0] ?? ["category_name" => "N/A", "total_amount" => 0.00];
echo json_encode([
    "highest_category_name" => $highestCategory["category_name"],
    "highest_category_amount" => $highestCategory["total_amount"],
    "top_expenses" => $result
]);
