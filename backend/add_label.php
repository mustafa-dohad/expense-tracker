<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

// Handle POST
$label_name = $_POST['name'] ?? '';
$user_id = $_SESSION['user_id'];

if (!$label_name) {
    echo json_encode(["status" => "error", "message" => "Label name is required."]);
    exit;
}

// Check if label already exists for this user
$stmt = $pdo->prepare("SELECT id FROM labels WHERE user_id = ? AND name = ?");
$stmt->execute([$user_id, $label_name]);
if ($stmt->fetch()) {
    echo json_encode(["status" => "error", "message" => "Label already exists."]);
    exit;
}

// Insert new label
$stmt = $pdo->prepare("INSERT INTO labels (user_id, name) VALUES (?, ?)");
$stmt->execute([$user_id, $label_name]);

echo json_encode(["status" => "success", "message" => "Label added."]);
