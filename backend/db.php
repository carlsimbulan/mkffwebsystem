<?php
// 1. Define the path to your .env file
// Using dirname(__DIR__) ensures it looks in the 'backend' root folder
$envPath = __DIR__ . '/.env'; 

if (file_exists($envPath)) {
    // Load variables from .env
    $env = parse_ini_file($envPath);
    
    $host    = $env['DB_HOST'] ?? '127.0.0.1';
    $db      = $env['DB_NAME'] ?? 'mkff';
    $user    = $env['DB_USER'] ?? 'root';
    $pass    = $env['DB_PASS'] ?? '';
    $charset = $env['DB_CHARSET'] ?? 'utf8mb4';
} else {
    // 2. FALLBACK: If .env is missing, use these defaults to prevent 500 error
    $host    = '127.0.0.1';
    $db      = 'mkff'; 
    $user    = 'root';
    $pass    = '';
    $charset = 'utf8mb4';
}

// 3. Set up the Data Source Name (DSN)
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Enables detailed error messages
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Returns data as associative arrays
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Uses real prepared statements for security
];

try {
    // 4. Attempt the connection
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // 5. Handle connection failure gracefully
    http_response_code(500);
    header('Content-Type: application/json');
    
    // log the error for the developer
    error_log("Database connection failed: " . $e->getMessage()); 
    
    echo json_encode([
        'error' => 'Database connection failed',
        'message' => 'Check if XAMPP MySQL is running and database "' . $db . '" exists.'
    ]);
    exit();
}
?>