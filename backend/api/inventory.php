<?php
// backend/api/inventory.php

// 1. Setup CORS Headers para sa React Frontend
$allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. Include database connection
include '../db.php'; 

if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "PDO connection missing."]);
    exit();
}

try {
    // 3. Query para kunin ang lahat ng PCBA pairing records
    // Naka-order by created_at DESC para ang pinakabagong pairing ang nasa itaas
    $sql = "SELECT * FROM unit_pcba_details ORDER BY created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $inventory = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Success Response
    http_response_code(200);
    echo json_encode($inventory);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to fetch inventory: " . $e->getMessage()]);
}
?>