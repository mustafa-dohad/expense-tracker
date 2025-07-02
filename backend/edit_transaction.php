<?php
require 'db.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "unauthorized"]);
    exit;
}

if (!isset($_POST['transaction_id'])) {
    echo json_encode(["status" => "missing_id"]);
    exit;
}

$transaction_id = $_POST['transaction_id'];
$user_id = $_SESSION['user_id'];

// Debug: log POST data and parameter array
file_put_contents(__DIR__ . '/my_debug.log', "POST: " . json_encode($_POST) . PHP_EOL, FILE_APPEND);

try {
    $pdo->beginTransaction();

    // ============ HANDLE PAYEE =============
    $payee_id = null;
    if (isset($_POST['payee_name']) && $_POST['payee_name'] !== '') {
        // Try to find existing payee
        $stmt = $pdo->prepare("SELECT id FROM payees WHERE name = ? AND user_id = ?");
        $stmt->execute([$_POST['payee_name'], $user_id]);
        $existing = $stmt->fetchColumn();

        if ($existing) {
            $payee_id = $existing;
        } else {
            $stmt = $pdo->prepare("INSERT INTO payees (name, user_id) VALUES (?, ?)");
            $stmt->execute([$_POST['payee_name'], $user_id]);
            $payee_id = $pdo->lastInsertId();
        }
    }

    // ============ UPDATE TRANSACTION ============
    $params = [
        $_POST['account_id'],
        $_POST['category_id'],
        $payee_id,
        $_POST['amount'],
        $_POST['transaction_type'],
        $_POST['payment_method'],
        $_POST['description'] ?? '',
        $_POST['transaction_date'],
        $_POST['transaction_time'],
        $transaction_id,
        $user_id
    ];
    file_put_contents(__DIR__ . '/my_debug.log', "PARAMS: " . json_encode($params) . PHP_EOL, FILE_APPEND);

    $stmt = $pdo->prepare("UPDATE transactions SET
        account_id = ?, category_id = ?, payee_id = ?,
        amount = ?, transaction_type = ?, payment_method = ?, description = ?,
        transaction_date = ?, transaction_time = ?
        WHERE id = ? AND user_id = ?");

    file_put_contents(__DIR__ . '/my_debug.log', 'SQL: ' . $stmt->queryString . PHP_EOL, FILE_APPEND);
    file_put_contents(__DIR__ . '/my_debug.log', 'PARAM COUNT: ' . count($params) . PHP_EOL, FILE_APPEND);
    foreach ($params as $i => $v) {
        file_put_contents(__DIR__ . '/my_debug.log', "Param $i: " . var_export($v, true) . PHP_EOL, FILE_APPEND);
    }

    file_put_contents(__DIR__ . '/my_debug.log', 'PARAMS ARRAY: ' . var_export($params, true) . PHP_EOL, FILE_APPEND);

    $stmt->execute($params);

    // ============ UPDATE LABEL ============
    $label_id = $_POST['label_id'] ?? null;
    file_put_contents(__DIR__ . '/my_debug.log', "DELETE LABEL PARAM: " . var_export($transaction_id, true) . PHP_EOL, FILE_APPEND);
    $pdo->prepare("DELETE FROM transaction_labels WHERE transaction_id = ?")
        ->execute([$transaction_id]);

    if (!empty($label_id) && is_scalar($label_id)) {
        file_put_contents(__DIR__ . '/my_debug.log', "INSERT LABEL PARAMS: " . var_export([$transaction_id, $label_id], true) . PHP_EOL, FILE_APPEND);
        $pdo->prepare("INSERT INTO transaction_labels (transaction_id, label_id) VALUES (?, ?)")
            ->execute([$transaction_id, $label_id]);
    }

    $pdo->commit();
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
