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
    
    if ($station) {
        // Fetch ALL history for units that have passed through this station
        // This includes all actions (not just actions at this station)
        $sql = "SELECT DISTINCT uh.*, u.full_name as user_full_name 
                FROM unit_history uh 
                LEFT JOIN users u ON uh.action_by = u.username
                WHERE uh.unit_id IN (
                    SELECT DISTINCT unit_id 
                    FROM unit_history 
                    WHERE station_name = :station
                )
                ORDER BY uh.timestamp DESC";
        
        $params = ['station' => $station];
    } else {
        // No station filter - return all history
        $sql = "SELECT uh.*, u.full_name as user_full_name 
                FROM unit_history uh 
                LEFT JOIN users u ON uh.action_by = u.username
                ORDER BY uh.timestamp DESC";
        
        $params = [];
    }

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