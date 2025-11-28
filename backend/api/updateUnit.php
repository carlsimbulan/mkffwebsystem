<?php
// backend/api/updateUnit.php - Handles Unit UPDATEs for Status Changes and History Logging

require_once '../db.php'; // Ensure db.php connects the $pdo object

// --- HISTORY LOGGING FUNCTION (UNCHANGED) ---
function logUnitAction($pdo, $unitId, $station, $status, $actionType, $remarks = null, $actionBy = 'System') {
    try {
        $stmt = $pdo->prepare("INSERT INTO unit_history 
            (unit_id, station_name, status_after, action_type, remarks, action_by) 
            VALUES (?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $unitId, 
            $station, 
            $status, 
            $actionType, 
            $remarks, 
            $actionBy
        ]);
        return true;
    } catch (PDOException $e) {
        error_log("Failed to log unit history: " . $e->getMessage());
        return false;
    }
}
// ------------------------------------

// --- CORS Headers ---
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

// 1. Determine the HTTP method, checking for the PUT override
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_GET['method']) && strtoupper($_GET['method']) === 'PUT') {
    $method = 'PUT';
}

// Read raw input data 
$data = null;
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE && $data === null && $method === 'PUT') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload.']);
    exit;
}


// ---------------------------------------------------------------------
// --- PUT: Update Unit (Status Logging Only - Unit Remains at Station) ---
// ---------------------------------------------------------------------
if ($method === 'PUT') {
    
    // 1. Basic Validation 
    if (empty($data) || !isset($data['id']) || !isset($data['status']) || !isset($data['station'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing critical fields (id, status, or station) in update data.']);
        exit;
    }

    $unitId = $data['id'];
    $newStatus = $data['status'];
    $currentStation = $data['station']; // Station where the unit currently resides (and will remain)
    $newRemarks = $data['remarks'] ?? '';

    $finalStatus = $newStatus; 
    $actionType = 'STATUS_UPDATED';

    // --- LOGIC FOR HISTORY/ACTION TYPE ONLY ---
    if ($newStatus === 'Completed') {
        $actionType = 'COMPLETED_AT_STATION'; 
    } elseif ($newStatus === 'No Good (NG)') {
        $actionType = 'FAILURE_REPORTED';
    } elseif ($newStatus === 'Pending Approval') {
        $actionType = 'APPROVAL_REQUESTED';
    }


    // --- TRANSACTION ---
    try {
        $pdo->beginTransaction();

        // A. Log the history entry (The clone/backtracking record is created here)
        logUnitAction(
            $pdo, 
            $unitId, 
            $currentStation, 
            $finalStatus, // Log the status achieved
            $actionType, 
            $newRemarks, 
            $data['full_name'] ?? $data['username'] ?? 'Admin'
        );
        
        // B. Update the unit record: ONLY STATUS, REMARKS, AND IDENTIFICATION FIELDS ARE CHANGED. 
        // THE 'station' FIELD IS KEPT AT $currentStation (THE OLD VALUE).
        $updateSql = "UPDATE units SET 
                      model = :model, 
                      revision = :revision, 
                      base_unit_kitting_no = :base, 
                      assembly_no = :assy, 
                      device_serial_no = :serial, 
                      accessory_kitting_no = :acc,
                      status = :final_status, 
                      remarks = :new_remarks, 
                      station = :current_station 
                      WHERE id = :id";
        
        $updateStmt = $pdo->prepare($updateSql);
        
        $updateStmt->execute([
            'id' => $unitId,
            // Cloned fields (fallback to whatever the client sent, which should be current data)
            'model' => $data['model'] ?? null,
            'revision' => $data['revision'] ?? null,
            'base' => $data['base_unit_kitting_no'] ?? null,
            'assy' => $data['assembly_no'] ?? null,
            'serial' => $data['device_serial_no'] ?? null,
            'acc' => $data['accessory_kitting_no'] ?? null,
            
            // Critical update fields
            'final_status' => $finalStatus,
            'new_remarks' => $newRemarks,
            'current_station' => $currentStation // Unit stays here until claimed
        ]);

        $pdo->commit();
        // --- Transaction End ---

        $msg = ($finalStatus === 'Completed') 
               ? "Unit status updated to 'Completed'. Ready for handover." 
               : "Unit status updated to '{$finalStatus}'.";

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => $msg]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Database error during update: ' . $e->getMessage()]);
    }
    exit;
}

// Fallback for methods that are not GET or PUT in this file
http_response_code(405);
echo json_encode(['error' => 'Method not allowed in updateUnit.php.']);
?>