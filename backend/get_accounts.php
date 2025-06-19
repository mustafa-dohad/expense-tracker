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
    $stmt = $pdo->prepare("SELECT name, current_balance AS balance FROM accounts WHERE user_id = :user_id AND is_active = 1 ORDER BY name ASC");
    $stmt->execute(["user_id" => $user_id]);
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($accounts);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
