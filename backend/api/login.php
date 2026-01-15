<?php
// 1. Enable Error Reporting for debugging (Remove this in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// --- CORS ---
$allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

// 2. Check if db.php exists before including to prevent fatal errors
if (!file_exists('../db.php')) {
    http_response_code(500);
    echo json_encode(['error' => 'Database configuration file missing.']);
    exit;
}
include '../db.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Please fill in both username and password.']);
    exit;
}

try {
    // 3. Database query using PDO
    $stmt = $pdo->prepare("SELECT id, username, password, role, station FROM users WHERE username = :u");
    $stmt->execute(['u' => $data['username']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 4. Verify user and password
    if (!$user || $data['password'] !== $user['password']) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
        exit;
    }

    // SUCCESS
    echo json_encode([
        'status' => 'ok',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'station' => $user['station'] 
        ]
    ]);

} catch (PDOException $e) {
    // 5. Catch database errors specifically
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>