<?php
ini_set("display_errors", 1);
error_reporting(E_ALL);

include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $first = $_POST["first"] ?? '';
    $last = $_POST["last"] ?? '';
    $username = $_POST["username"] ?? '';
    $email = $_POST["email"] ?? '';
    $password = $_POST["password"] ?? '';

    if (!$username || !$email || !$password) {
        echo "Missing required fields.";
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO users (username, email, password_hash, first_name, last_name) 
            VALUES (:username, :email, :password_hash, :first_name, :last_name)
        ");
        $stmt->execute([
            "username" => $username,
            "email" => $email,
            "password_hash" => $hashedPassword,
            "first_name" => $first,
            "last_name" => $last
        ]);

        echo "success";
    } catch (Exception $e) {
        if ($e->getCode() == 23000) {
            echo "Username or email already exists.";
        } else {
            echo "Signup failed: " . $e->getMessage();
        }
    }
} else {
    echo "No POST received.";
}
