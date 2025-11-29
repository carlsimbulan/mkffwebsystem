<?php
// backend/api/units.php

require_once '../db.php'; 

// --- HISTORY LOGGING ---
function logUnitAction($pdo, $unitId, $station, $status, $actionType, $remarks = null, $actionBy = 'System') {
    try {
        // Ensure unit_history table exists
        $stmt = $pdo->prepare("INSERT INTO unit_history 
            (unit_id, station_name, status_after, action_type, remarks, action_by) 
            VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$unitId, $station, $status, $actionType, $remarks, $actionBy]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

// --- CORS ---
$allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS"); 
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

// Handle Method Override
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_GET['method']) && strtoupper($_GET['method']) === 'PUT') {
    $method = 'PUT';
}

$data = null;
if ($method !== 'GET') {
    $data = json_decode(file_get_contents("php://input"), true);
}

// --- GET REQUESTS ---
if ($method === 'GET') {

    // [NEW] SEARCH BY SERIAL NUMBER (For Validation Interlocking)
    if (isset($_GET['search_serial'])) {
        $serial = $_GET['search_serial'];
        // Get the latest record for this serial number
        $stmt = $pdo->prepare("SELECT * FROM units WHERE device_serial_no = :serial ORDER BY created_at DESC LIMIT 1");
        $stmt->execute(['serial' => $serial]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        exit; // Stop here, do not run the rest of the GET logic
    }

    // [EXISTING] FILTER BY STATION & STATUS
    $station = $_GET['station'] ?? null;
    $status = $_GET['status'] ?? null;
    $sql = "SELECT * FROM units";
    $params = [];
    $conditions = [];

    if ($station) { $conditions[] = "station = :station"; $params['station'] = $station; }
    if ($status) { $conditions[] = "status = :status"; $params['status'] = $status; }
    
    if (count($conditions) > 0) $sql .= " WHERE " . implode(" AND ", $conditions);
    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// --- PUT REQUESTS (UPDATE UNIT) ---
if ($method === 'PUT') {
    if (!isset($data['id']) || !isset($data['status'])) {
        http_response_code(400); echo json_encode(['error' => 'Missing id or status']); exit;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Log History
        logUnitAction($pdo, $data['id'], $data['station'] ?? 'N/A', $data['status'], 'STATUS_UPDATED', $data['remarks'] ?? '', $data['username'] ?? 'System');
        
        // Update Unit
        $stmt = $pdo->prepare("UPDATE units SET status = :status, remarks = :remarks, station = :station WHERE id = :id");
        $stmt->execute([
            'id' => $data['id'],
            'status' => $data['status'],
            'remarks' => $data['remarks'] ?? '',
            'station' => $data['station'] ?? 'N/A'
        ]);

        $pdo->commit();
        echo json_encode(["status" => "success", "message" => "Unit updated."]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// --- POST REQUESTS (INSERT) ---
if ($method === 'PUT') {
    if (!isset($data['id']) || !isset($data['status'])) {
        http_response_code(400); echo json_encode(['error' => 'Missing id or status']); exit;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Log History
        logUnitAction($pdo, $data['id'], $data['station'] ?? 'N/A', $data['status'], 'STATUS_UPDATED', $data['remarks'] ?? '', $data['username'] ?? 'System');
        
        // [UPDATED] SQL: Updates Status, Remarks, Station, AND resets created_at to current time
        // This resets the "timer" for the new station
        $stmt = $pdo->prepare("UPDATE units 
                               SET status = :status, 
                                   remarks = :remarks, 
                                   station = :station,
                                   created_at = CURRENT_TIMESTAMP 
                               WHERE id = :id");
                               
        $stmt->execute([
            'id' => $data['id'],
            'status' => $data['status'],
            'remarks' => $data['remarks'] ?? '',
            'station' => $data['station'] ?? 'N/A'
        ]);

        $pdo->commit();
        echo json_encode(["status" => "success", "message" => "Unit updated successfully."]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
?>  