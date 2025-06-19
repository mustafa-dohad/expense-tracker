<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$label_name = $data['name'] ?? '';

if (!$label_name) {
    echo json_encode(["status" => "error", "message" => "Invalid label name."]);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO labels (user_id, name) VALUES (?, ?)");
$stmt->execute([$_SESSION['user_id'], $label_name]);

echo json_encode(["status" => "success", "message" => "Label added."]);
