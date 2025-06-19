<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

$stmt = $pdo->prepare("SELECT id, name FROM labels WHERE user_id = ?");
$stmt->execute([$_SESSION['user_id']]);
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($result);
