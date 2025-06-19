<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = $_POST["username"] ?? null;
    $password = $_POST["password"] ?? null;

    if (!$username || !$password) {
        echo "error: Missing username or password";
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE username = :username");
        $stmt->execute(["username" => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo "error: User not found";
            exit;
        }

        if (password_verify($password, $user["password_hash"])) {
            $_SESSION["user_id"] = $user["id"];
            echo "success";
        } else {
            echo "error: Invalid credentials";
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo "error: " . $e->getMessage();
    }
}
