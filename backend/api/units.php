<?php
// backend/api/units.php

// 1. ENABLE ERROR REPORTING FOR DEBUGGING
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

require_once '../db.php'; 

// --- HELPER: HISTORY LOGGING ---
function logUnitAction($pdo, $unitId, $model, $assemblyNo, $station, $status, $actionType, $remarks = null, $actionBy = 'System') {
    try {
        // We use IGNORE or silent catch to prevent history errors from crashing the main app
        $stmt = $pdo->prepare("INSERT INTO unit_history 
            (unit_id, model, assembly_no, station_name, status_after, action_type, remarks, action_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$unitId, $model, $assemblyNo, $station, $status, $actionType, $remarks, $actionBy]);
    } catch (PDOException $e) {
        // Log error to file but don't stop execution
        error_log("History Log Failed: " . $e->getMessage());
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
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$method = $_SERVER['REQUEST_METHOD'];
// Handle Method Override
if ($method === 'POST' && isset($_GET['method']) && strtoupper($_GET['method']) === 'PUT') {
    $method = 'PUT';
}

$data = null;
if ($method !== 'GET') {
    $data = json_decode(file_get_contents("php://input"), true);
}

function getNullIfEmpty($val) {
    return (isset($val) && trim($val) !== '') ? trim($val) : null;
}

// ==========================================================
// 1. GET REQUESTS
// ==========================================================
if ($method === 'GET') {
    try {
        // Search by Assembly Number
        if (isset($_GET['search_assembly'])) {
            $assy = $_GET['search_assembly'];
            $stmt = $pdo->prepare("SELECT * FROM units WHERE assembly_no = :assy ORDER BY created_at DESC LIMIT 1");
            $stmt->execute(['assy' => $assy]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit; 
        }

        // Search by Serial
        if (isset($_GET['search_serial'])) {
            $serial = $_GET['search_serial'];
            $stmt = $pdo->prepare("SELECT * FROM units WHERE device_serial_no = :serial ORDER BY created_at DESC LIMIT 1");
            $stmt->execute(['serial' => $serial]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit; 
        }

        $station = $_GET['station'] ?? null;
        $status = $_GET['status'] ?? null;
        $sql = "SELECT * FROM units";
        $conditions = [];
        $params = [];

        if ($station) { $conditions[] = "station = :station"; $params['station'] = $station; }
        if ($status) { $conditions[] = "status = :status"; $params['status'] = $status; }
        
        if (count($conditions) > 0) $sql .= " WHERE " . implode(" AND ", $conditions);
        $sql .= " ORDER BY created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// ==========================================================
// 2. PUT REQUESTS (Edit Modal)
// ==========================================================
if ($method === 'PUT') {
    if (!isset($data['id'])) {
        http_response_code(400); echo json_encode(['error' => 'Missing id']); exit;
    }

    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("UPDATE units SET status = :status, remarks = :remarks WHERE id = :id");
        $stmt->execute([
            'id' => $data['id'],
            'status' => $data['status'],
            'remarks' => $data['remarks'] ?? ''
        ]);

        $mod = $data['model'] ?? '';
        $assy = $data['assemblyNo'] ?? $data['assembly_no'] ?? '';
        
        logUnitAction($pdo, $data['id'], $mod, $assy, $data['station'] ?? 'N/A', $data['status'], 'STATUS_UPDATED', $data['remarks'] ?? '', $data['username'] ?? 'System');

        $pdo->commit();
        echo json_encode(["status" => "success", "message" => "Unit updated successfully."]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// ==========================================================
// 3. POST REQUESTS (Create OR Handover)
// ==========================================================
if ($method === 'POST') {
    $action = $data['action'] ?? 'create';
    
    $mod = $data['model'] ?? '';
    $rev = getNullIfEmpty($data['revision'] ?? '');
    $buk = getNullIfEmpty($data['baseUnitKittingNo'] ?? '');
    $assy = $data['assemblyNo'] ?? $data['assembly_no'] ?? ''; 
    $serial = getNullIfEmpty($data['deviceSerialNo'] ?? '');
    $ack = getNullIfEmpty($data['accessoryKittingNo'] ?? '');
    $stat = $data['status'] ?? 'In Progress';
    $rem = $data['remarks'] ?? '';
    $stn = $data['station'] ?? 'Station 1';
    $user = $data['username'] ?? 'System';

    try {
        $pdo->beginTransaction();

        // [SMART LOGIC] Check if Assembly Number already exists
        // If it exists, we force an UPDATE, even if 'create' was requested.
        $existingUnit = null;
        if ($assy) {
            $check = $pdo->prepare("SELECT id FROM units WHERE assembly_no = ?");
            $check->execute([$assy]);
            $existingUnit = $check->fetch(PDO::FETCH_ASSOC);
        }

        if ($existingUnit) {
            // --- UPDATE PATH (Handover or Fix Duplicate) ---
            $unitId = $existingUnit['id'];
            
            $updateFields = "status = :status, remarks = :remarks, station = :station, created_at = CURRENT_TIMESTAMP";
            $params = ['status' => $stat, 'remarks' => $rem, 'station' => $stn, 'id' => $unitId];

            // Update Serial only if provided
            if ($serial) {
                $updateFields .= ", device_serial_no = :serial";
                $params['serial'] = $serial;
            }

            $stmt = $pdo->prepare("UPDATE units SET $updateFields WHERE id = :id");
            $stmt->execute($params);

            logUnitAction($pdo, $unitId, $mod, $assy, $stn, $stat, 'STATION_HANDOVER', "Processed at $stn", $user);
            
            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Unit processed successfully (Updated)."]);

        } else {
            // --- INSERT PATH (Truly New Unit) ---
            if ($action === 'create' || !$existingUnit) {
                $stmt = $pdo->prepare("INSERT INTO units 
                    (model, revision, base_unit_kitting_no, assembly_no, device_serial_no, accessory_kitting_no, status, remarks, station) 
                    VALUES 
                    (:model, :rev, :buk, :assy, :serial, :ack, :status, :remarks, :station)");
                
                $stmt->execute([
                    'model' => $mod, 'rev' => $rev, 'buk' => $buk, 'assy' => $assy,
                    'serial' => $serial, 'ack' => $ack, 'status' => $stat, 'remarks' => $rem, 'station' => $stn
                ]);
                
                $newId = $pdo->lastInsertId();
                logUnitAction($pdo, $newId, $mod, $assy, $stn, $stat, 'UNIT_CREATED', 'New Entry', $user);
                
                $pdo->commit();
                echo json_encode(["status" => "success", "message" => "Unit created successfully.", "id" => $newId]);
            }
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        // Send exact error to frontend for debugging
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
?>