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

// INALIS: !isset($data['role']) - Hindi na natin kailangan ito mula sa frontend
if (!$data || !isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Please fill in both username and password.']);
    exit;
}

// Kunin ang user data base sa username
$stmt = $pdo->prepare("SELECT id, username, password, role, station FROM users WHERE username = :u");
$stmt->execute(['u' => $data['username']]);
$user = $stmt->fetch();

// I-verify kung existing ang user at kung tama ang password
if (!$user || $data['password'] !== $user['password']) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid username or password']);
    exit;
}

// INALIS: STRICT ROLE CHECK 
// Hindi na natin kailangang i-compare ang $data['role'] vs $user['role'] 
// dahil si PHP na mismo ang magsasabi sa React kung ano ang role ng user.

// SUCCESS: Ibalik ang lahat ng info kasama ang role at station
echo json_encode([
    'status' => 'ok',
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],    // Automatic na itong ipapadala sa React
        'station' => $user['station'] 
    ]
]);
?>