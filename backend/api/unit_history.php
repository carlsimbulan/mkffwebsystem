<?php
// backend/api/unit_history.php

require_once '../db.php'; // Ensure db.php connects the $pdo object

// --- CORS Headers ---
$allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// Crucial: Allow PUT method header for preflight and actual requests (though only GET is used here)
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS"); 
header("Access-Control-Allow-Credentials: true");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");



// ------------------------------------

// --- GET: Fetch History Logs ---
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // We assume the frontend sends the station name via a query parameter
    $station = $_GET['station'] ?? null;
    
    $sql = "SELECT * FROM unit_history";
    $params = [];
    $conditions = [];

    if ($station) {
        // Fetch only history logs related to units that were processed at this station
        $conditions[] = "station_name = :station";
        $params['station'] = $station;
    }
    
    if (count($conditions) > 0) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }
    
    // Order by timestamp descending (newest first)
    $sql .= " ORDER BY timestamp DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $historyLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($historyLogs);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error retrieving history: " . $e->getMessage()]);
    }
    exit;
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);

?>