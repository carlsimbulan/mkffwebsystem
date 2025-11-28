<?php
// backend/api/units.php - Unit Management and History Logging

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
// --- PUT: Update Unit (Status Logging ONLY - Unit Remains at Station) (UNCHANGED) ---
// ---------------------------------------------------------------------
if ($method === 'PUT') {
    
    // 1. Basic Validation
    // NOTE: This PUT block is usually for SCANNERS/OPERATORS. The approval logic uses this.
    if (empty($data) || !isset($data['id']) || !isset($data['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing critical fields (id, status) in update data.']);
        exit;
    }
    
    // Fetch the existing unit data first if station is missing in payload
    $unitId = $data['id'];
    $fetchStmt = $pdo->prepare("SELECT station FROM units WHERE id = ?");
    $fetchStmt->execute([$unitId]);
    $existingUnit = $fetchStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existingUnit) {
        http_response_code(404);
        echo json_encode(['error' => 'Unit not found for update.']);
        exit;
    }
    
    // Use existing station if not provided, or ensure it's not empty
    $currentStation = $data['station'] ?? $existingUnit['station'] ?? 'N/A'; 


    $newStatus = $data['status'];
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
        
        // 1. Log the history entry
        logUnitAction(
            $pdo, 
            $unitId, 
            $currentStation, // Log the station where the action happened
            $finalStatus, 
            $actionType, 
            $newRemarks, 
            $data['full_name'] ?? $data['username'] ?? 'Admin' // Use data from the user session
        );
        
        // 2. Update the unit record (simplified to only update status, remarks, and station)
        $updateSql = "UPDATE units SET 
                      status = :final_status, 
                      remarks = :new_remarks, 
                      station = :current_station_param 
                      WHERE id = :id";
        
        $updateStmt = $pdo->prepare($updateSql);
        
        $updateStmt->execute([
            'id' => $unitId,
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
        error_log("PUT Error: " . $e->getMessage()); // Log error for server debugging
        http_response_code(500);
        echo json_encode(['error' => 'Database error during update: ' . $e->getMessage()]);
    }
    exit;
}

// ---------------------------------------------------------------------
// --- POST: Save New Unit (FIXED: Handles BATCH_INSERT) ---
// ---------------------------------------------------------------------
if ($method === 'POST') {
    
    // ✅ NEW CHECK: Check if this is a BATCH INSERT request
    if (isset($data['method']) && strtoupper($data['method']) === 'BATCH_INSERT') {
        
        if (!isset($data['units']) || !is_array($data['units']) || empty($data['units'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Batch insert requires a non-empty "units" array.']);
            exit;
        }

        $successfulInserts = 0;
        
        try {
            $pdo->beginTransaction();

            $sql = "INSERT INTO units (model, revision, base_unit_kitting_no, assembly_no, device_serial_no, accessory_kitting_no, status, remarks, station)
                    VALUES (:model, :revision, :base, :assy, :serial, :acc, :status, :remarks, :station)";
            $stmt = $pdo->prepare($sql);
            
            // Loop through the units array and insert each one
            foreach ($data['units'] as $unit) {
                // Default values from React payload
                $initialStatus = $unit['status'] ?? 'For Scanning';
                $initialRemarks = $unit['remarks'] ?? 'Initial unit creation by IT Assistant.';
                $initialStation = $unit['station'] ?? 'N/A'; // N/A until first scan
                $actionBy = $unit['created_by'] ?? $unit['username'] ?? 'System'; // Use the user data from client

                $stmt->execute([
                    'model' => $unit['model'] ?? null,
                    'revision' => $unit['revision'] ?? null,
                    'base' => $unit['base_unit_kitting_no'] ?? null,
                    'assy' => $unit['assembly_no'] ?? null,
                    'serial' => $unit['device_serial_no'] ?? null,
                    'acc' => $unit['accessory_kitting_no'] ?? null,
                    'status' => $initialStatus,
                    'remarks' => $initialRemarks,
                    'station' => $initialStation
                ]);
                
                $newUnitId = $pdo->lastInsertId();
                
                // Log the creation of the unit
                logUnitAction($pdo, $newUnitId, $initialStation, $initialStatus, 'UNIT_CREATED', $initialRemarks, $actionBy);
                $successfulInserts++;
            }
            
            $pdo->commit();
            
            http_response_code(201); // Created
            echo json_encode(['status' => 'success', 'message' => "Successfully inserted {$successfulInserts} units.", 'count' => $successfulInserts]);

        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log("BATCH INSERT Error: " . $e->getMessage()); // Log error for server debugging
            http_response_code(400); // Changed to 400 or 500
            echo json_encode([
                'error' => 'Database error during batch insert.', 
                'details' => $e->getMessage(),
                'units_inserted_before_failure' => $successfulInserts
            ]);
        }
        exit;
    } 
    
    // --- Fallback to Single Unit Insert (If 'method' is not BATCH_INSERT) ---
    else {
        if (!isset($data['model']) || !isset($data['device_serial_no'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields for POST (Single Insert).']);
            exit;
        }

        $initialStation = $data['station'] ?? 'N/A';
        $initialStatus = $data['status'] ?? 'For Scanning';
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
            
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Unit saved and logged successfully', 'id' => $newUnitId]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log("SINGLE INSERT Error: " . $e->getMessage()); // Log error for server debugging
            http_response_code(400); 
            echo json_encode(['error' => 'Database error during single insert: ' . $e->getMessage()]);
        }
    }
    exit;
}

// Fallback for unsupported methods
http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);

?>