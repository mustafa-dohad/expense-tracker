<?php
// ===============================
// Change Password Endpoint
// ===============================
// Requires: current_password, new_password, confirm_password
// Authenticated user only (session)
// Returns JSON { success: bool, message: string }

session_start();
require_once 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$current = $_POST['current_password'] ?? '';
$new = $_POST['new_password'] ?? '';
$confirm = $_POST['confirm_password'] ?? '';

if (!$current || !$new || !$confirm) {
    echo json_encode(['success' => false, 'message' => 'All fields required']);
    exit;
}
if ($new !== $confirm) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
    exit;
}
if (strlen($new) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password too short']);
    exit;
}

// Fetch current hash
$stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$user = $stmt->fetch();
if (!$user || !password_verify($current, $user['password_hash'])) {
    echo json_encode(['success' => false, 'message' => 'Current password incorrect']);
    exit;
}

$new_hash = password_hash($new, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?');
if ($stmt->execute([$new_hash, $user_id])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
} 