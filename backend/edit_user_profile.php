<?php
// ===============================
// Edit User Profile Endpoint
// ===============================
// Updates: first_name, last_name, phone, currency_code, timezone, profile_picture
// Requires user to be authenticated (session)
// Returns JSON { success: bool, message: string }

session_start();
require_once 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$fields = ['first_name', 'last_name', 'phone', 'currency_code', 'timezone'];
$updates = [];
$params = [];
foreach ($fields as $field) {
    if (isset($_POST[$field])) {
        $updates[] = "$field = ?";
        $params[] = trim($_POST[$field]);
    }
}

// Handle profile picture upload
$profile_picture_path = null;
if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['profile_picture']['name'], PATHINFO_EXTENSION);
    $filename = 'profile_' . $user_id . '_' . time() . '.' . $ext;
    $target = '../public/uploads/' . $filename;
    if (!is_dir('../public/uploads')) {
        mkdir('../public/uploads', 0755, true);
    }
    if (move_uploaded_file($_FILES['profile_picture']['tmp_name'], $target)) {
        $profile_picture_path = 'uploads/' . $filename;
        $updates[] = 'profile_picture = ?';
        $params[] = $profile_picture_path;
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload profile picture']);
        exit;
    }
}

if (empty($updates)) {
    echo json_encode(['success' => false, 'message' => 'No fields to update']);
    exit;
}

$params[] = $user_id;
$sql = 'UPDATE users SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = ?';
$stmt = $pdo->prepare($sql);
if ($stmt->execute($params)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
} 