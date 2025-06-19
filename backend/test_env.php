<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Output environment variables
header('Content-Type: text/plain');

echo "DB HOST: " . ($_ENV["DB_HOST"] ?? 'Not set') . PHP_EOL;
echo "DB NAME: " . ($_ENV["DB_NAME"] ?? 'Not set') . PHP_EOL;
echo "DB USER: " . ($_ENV["DB_USER"] ?? 'Not set') . PHP_EOL;
echo "DB PASS: " . ($_ENV["DB_PASS"] ?? 'Not set') . PHP_EOL;
