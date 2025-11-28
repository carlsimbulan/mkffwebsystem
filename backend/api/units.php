<?php
// backend/api/units.php - Unit Management and History Logging (FIXED: Status Update Only)

require_once '../db.php'; // Ensure db.php connects the $pdo object

// --- HISTORY LOGGING FUNCTION (UNCHANGED) ---
/**
 * Logs a movement or status update action for a unit in the unit_history table.
 */
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

// --- CORS Headers (UNCHANGED) ---
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

// Read raw input data if not GET (used for POST and PUT)
$data = null;
if ($method !== 'GET') {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    
    // Check for basic JSON decoding failure for debugging
    if (json_last_error() !== JSON_ERROR_NONE && $data === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload.']);
        exit;
    }
}


// --- GET: Fetch Units (UNCHANGED) ---
if ($method === 'GET') {
    // ... (Your existing GET logic) ...
    $station = $_GET['station'] ?? null;
    $status = $_GET['status'] ?? null;

    $sql = "SELECT * FROM units";
    $params = [];
    $conditions = [];

    if ($station) {
        $conditions[] = "station = :station";
        $params['station'] = $station;
    }
    if ($status) {
        $conditions[] = "status = :status";
        $params['status'] = $status;
    }
    
    if (count($conditions) > 0) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $units = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($units);
    exit;
}

// ---------------------------------------------------------------------
// --- PUT: Update Unit (Status Logging ONLY - Unit Remains at Station) ---
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
    $currentStation = $data['station']; // Station where the unit currently resides
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
    
    // CRITICAL FIX: The unit stays at the current station.
    $nextStation = $currentStation; 
    

    // --- TRANSACTION ---
    try {
        $pdo->beginTransaction();
        
        // 1. Fetch existing unit data to ensure we don't wipe non-updated fields (robustness)
        $fetchStmt = $pdo->prepare("SELECT * FROM units WHERE id = ?");
        $fetchStmt->execute([$unitId]);
        $existingUnit = $fetchStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existingUnit) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['error' => 'Unit not found for update.']);
            exit;
        }

        // 2. Log the history entry (The clone/backtracking record is created here)
        logUnitAction(
            $pdo, 
            $unitId, 
            $currentStation, // Log the station where the action happened
            $finalStatus, 
            $actionType, 
            $newRemarks, 
            $data['full_name'] ?? $data['username'] ?? 'Admin'
        );
        
        // 3. Update the unit record: ONLY STATUS, REMARKS, AND IDENTIFICATION FIELDS ARE CHANGED.
        // The station remains $currentStation.
        $updateSql = "UPDATE units SET 
                      model = :model, 
                      revision = :revision, 
                      base_unit_kitting_no = :base, 
                      assembly_no = :assy, 
                      device_serial_no = :serial, 
                      accessory_kitting_no = :acc,
                      status = :final_status, 
                      remarks = :new_remarks, 
                      station = :current_station_param 
                      WHERE id = :id";
        
        $updateStmt = $pdo->prepare($updateSql);
        
        $updateStmt->execute([
            'id' => $unitId,
            // Use new data if sent by client, otherwise use existing data (robustness)
            'model' => $data['model'] ?? $existingUnit['model'],
            'revision' => $data['revision'] ?? $existingUnit['revision'],
            'base' => $data['base_unit_kitting_no'] ?? $existingUnit['base_unit_kitting_no'],
            'assy' => $data['assembly_no'] ?? $existingUnit['assembly_no'],
            'serial' => $data['device_serial_no'] ?? $existingUnit['device_serial_no'],
            'acc' => $data['accessory_kitting_no'] ?? $existingUnit['accessory_kitting_no'],
            
            // Critical update fields
            'final_status' => $finalStatus,
            'new_remarks' => $newRemarks,
            'current_station_param' => $currentStation // Unit remains here
        ]);

        $pdo->commit();
        // --- Transaction End ---

        $msg = ($finalStatus === 'Completed') 
               ? "Unit status updated to 'Completed'. It remains visible in the current station's list." 
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

// --- POST: Save New Unit (Initial Insert) (UNCHANGED) ---
if ($method === 'POST') {
    
    if (!isset($data['model']) || !isset($data['device_serial_no'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields for POST (Insert).']);
        exit;
    }

    $initialStation = $data['station'] ?? 'Station1';
    $initialStatus = $data['status'] ?? 'In Progress';
    $initialRemarks = $data['remarks'] ?? 'New unit created.';

    try {
        $pdo->beginTransaction();

        $sql = "INSERT INTO units (model, revision, base_unit_kitting_no, assembly_no, device_serial_no, accessory_kitting_no, status, remarks, station)
                 VALUES (:model, :revision, :base, :assy, :serial, :acc, :status, :remarks, :station)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'model' => $data['model'] ?? null,
            'revision' => $data['revision'] ?? null,
            'base' => $data['base_unit_kitting_no'] ?? null,
            'assy' => $data['assembly_no'] ?? null,
            'serial' => $data['device_serial_no'] ?? null,
            'acc' => $data['accessory_kitting_no'] ?? null,
            'status' => $initialStatus,
            'remarks' => $initialRemarks,
            'station' => $initialStation
        ]);
        
        $newUnitId = $pdo->lastInsertId();
        
        // Log the creation of the unit
        logUnitAction($pdo, $newUnitId, $initialStation, $initialStatus, 'UNIT_CREATED', $initialRemarks, $data['full_name'] ?? $data['username'] ?? 'System');
        
        $pdo->commit();
        
        echo json_encode(['status' => 'success', 'message' => 'Unit saved and logged successfully', 'id' => $newUnitId]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Database error during insert: ' . $e->getMessage()]);
    }
    exit;
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);

?>