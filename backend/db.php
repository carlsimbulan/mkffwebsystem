<?php
$envPath = __DIR__ . '/.env';

if (file_exists($envPath)) {

    $env = parse_ini_file($envPath);
    
    $host    = $env['DB_HOST'] ?? '127.0.0.1';
    $db      = $env['DB_NAME'] ?? 'mkff';
    $user    = $env['DB_USER'] ?? 'root';
    $pass    = $env['DB_PASS'] ?? '';
    $charset = $env['DB_CHARSET'] ?? 'utf8mb4';
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server Configuration Error',
        'message' => 'Environment configuration file is missing at ' . $envPath
    ]);
    exit();
}

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage()); 
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}
?>