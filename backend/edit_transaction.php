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

$stmt = $pdo->prepare("UPDATE transactions SET
    account_id = ?, category_id = ?, payee_id = ?, transfer_account_id = ?,
    amount = ?, transaction_type = ?, payment_method = ?, description = ?,
    notes = ?, transaction_date = ?, transaction_time = ?, location = ?,
    reference_number = ?, status = ?
WHERE id = ? AND user_id = ?");

try {
    $stmt->execute([
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
        $data['transaction_time'],
        $data['location'],
        $data['reference_number'],
        $data['status'],
        $transaction_id,
        $user_id
    ]);
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
