<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

echo "DB HOST: " . $_ENV['DB_HOST'] . PHP_EOL;
echo "DB NAME: " . $_ENV['DB_NAME'] . PHP_EOL;
echo "DB USER: " . $_ENV['DB_USER'] . PHP_EOL;
echo "DB PASS: " . $_ENV['DB_PASS'] . PHP_EOL;
?>
