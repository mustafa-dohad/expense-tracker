<?php
require 'db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $_SESSION['user_id'];

$stmt = $pdo->prepare("INSERT INTO transactions (
    user_id, account_id, category_id, payee_id, transfer_account_id,
    amount, transaction_type, payment_method, description, notes,
    transaction_date, transaction_time, location, reference_number, status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

try {
    $stmt->execute([
        $user_id,
        $data['account_id'],
        $data['category_id'],
        $data['payee_id'],
        $data['transfer_account_id'] ?? null,
        $data['amount'],
        $data['transaction_type'],
        $data['payment_method'],
        $data['description'],
        $data['notes'],
        $data['transaction_date'],
        $data['transaction_time'] ?? "12:00:00",
        $data['location'],
        $data['reference_number'],
        $data['status'] ?? 'completed'
    ]);
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
