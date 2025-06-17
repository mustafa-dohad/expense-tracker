<?php
require 'db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$transaction_id = $data['transaction_id'];
$user_id = $_SESSION['user_id'];

$stmt = $pdo->prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?");
try {
    $stmt->execute([$transaction_id, $user_id]);
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
