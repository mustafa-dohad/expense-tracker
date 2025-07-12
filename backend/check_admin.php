<?php
// ===============================
// Check and Set Admin User
// ===============================
// This script checks if the admin user exists and has admin privileges
// Run this once to ensure admin user is properly set up

require_once 'db.php';

echo "Checking admin user...\n";

try {
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id, username, is_admin FROM users WHERE username = 'admin'");
    $stmt->execute();
    $admin_user = $stmt->fetch();

    if (!$admin_user) {
        echo "❌ Admin user 'admin' not found!\n";
        echo "Please create the admin user first by signing up with username 'admin'.\n";
        exit;
    }

    echo "✅ Admin user found: ID {$admin_user['id']}, Username: {$admin_user['username']}\n";
    echo "Current admin status: " . ($admin_user['is_admin'] ? 'ADMIN' : 'NOT ADMIN') . "\n";

    if (!$admin_user['is_admin']) {
        echo "Setting admin privileges...\n";
        
        $update_stmt = $pdo->prepare("UPDATE users SET is_admin = TRUE WHERE username = 'admin'");
        $update_stmt->execute();
        
        echo "✅ Admin privileges set successfully!\n";
    } else {
        echo "✅ Admin user already has admin privileges.\n";
    }

    // Verify the update
    $stmt = $pdo->prepare("SELECT id, username, is_admin FROM users WHERE username = 'admin'");
    $stmt->execute();
    $admin_user = $stmt->fetch();
    
    echo "Final status: " . ($admin_user['is_admin'] ? 'ADMIN' : 'NOT ADMIN') . "\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
} 