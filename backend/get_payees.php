<?php
require 'db.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("SELECT id, name FROM payees WHERE user_id = :user_id ORDER BY name ASC");
    $stmt->execute(['user_id' => $user_id]);
    $payees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($payees);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
