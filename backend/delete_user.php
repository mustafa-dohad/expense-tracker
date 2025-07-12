<?php
// ===============================
// Delete User Endpoint
// ===============================
// Authenticated user only (session)
// Admin accounts cannot be deleted by anyone
// Users can only delete their own accounts
// Returns JSON { success: bool, message: string }

session_start();
require_once 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Check if user exists and is admin
$stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

// Prevent admin accounts from being deleted
if ($user['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Admin accounts cannot be deleted']);
    exit;
}

// Prevent user ID 3 from being deleted
if ($user_id == 3) {
    echo json_encode(['success' => false, 'message' => 'This account cannot be deleted.']);
    exit;
}

// Delete user (only non-admin users can be deleted)
$stmt = $pdo->prepare('DELETE FROM users WHERE id = ? AND is_admin = FALSE');
if ($stmt->execute([$user_id])) {
    session_destroy();
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
} 