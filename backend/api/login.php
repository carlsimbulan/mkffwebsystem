<?php
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
include '../db.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !isset($data['username']) || !isset($data['password']) || !isset($data['role'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Please fill in all fields.']);
    exit;
}

// UPDATE: Idagdag ang 'station' sa SELECT query
$stmt = $pdo->prepare("SELECT id, username, password, role, station FROM users WHERE username = :u");
$stmt->execute(['u' => $data['username']]);
$user = $stmt->fetch();

if (!$user || $data['password'] !== $user['password']) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid username or password']);
    exit;
}

// STRICT ROLE CHECK
if ($data['role'] !== $user['role']) {
    http_response_code(403);
    echo json_encode(['error' => 'Role Mismatch: This user is assigned as ' . $user['role']]);
    exit;
}

// SUCCESS: Ibalik din ang 'station' info
echo json_encode([
    'status' => 'ok',
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'station' => $user['station'] // Ito ang mahalaga
    ]
]);
?>