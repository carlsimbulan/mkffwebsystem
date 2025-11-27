<?php
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

   include '../db.php'; // DB connection

   $data = json_decode(file_get_contents('php://input'), true);
   if (!$data || !isset($data['id']) || !isset($data['status'])) {
       http_response_code(400);
       echo json_encode(['error' => 'Invalid input']);
       exit;
   }

   $stmt = $pdo->prepare("UPDATE units SET status = :status WHERE id = :id");
   $stmt->execute(['status' => $data['status'], 'id' => $data['id']]);

   echo json_encode(['success' => true]);
   ?>
   