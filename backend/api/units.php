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
        $stmt = $pdo->prepare("INSERT INTO unit_history 
            (unit_id, model, assembly_no, station_name, status_after, action_type, remarks, action_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$unitId, $model, $assemblyNo, $station, $status, $actionType, $remarks, $actionBy]);
    } catch (PDOException $e) {
        error_log("History Log Failed: " . $e->getMessage());
    }
}

// --- HELPER: STATION 6 CHECKLIST HANDLER (FULL UPDATE) ---
function handleStation6Checklist($pdo, $unitId, $checklistData) {
    if (!$checklistData) return;

    try {
        // I-check kung may existing record na para sa unit na ito
        $stmt = $pdo->prepare("SELECT id FROM station6_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        // Kumpletong parameters base sa Excel at Database columns mo
        $params = [
            $checklistData['lora_module'] ?? 'Detected',
            $checklistData['energy_meter'] ?? 'Detected',
            $checklistData['power_good_test'] ?? 'Detected',
            $checklistData['voltage'] ?? 0,
            $checklistData['line1'] ?? 0,
            $checklistData['line2'] ?? 0,
            $checklistData['line3'] ?? 0,
            $checklistData['temp_reading'] ?? 'PASS',
            $checklistData['freq_reading'] ?? 'GO',
            $checklistData['led_status_4g'] ?? 'GO',
            $checklistData['led_status_fast_blink'] ?? 'GO',
            $checklistData['go_no_go'] ?? 'GO',
            $checklistData['test_duration'] ?? 120,
            $unitId
        ];

        if ($exists) {
            $sql = "UPDATE station6_checklists SET 
                    lora_module = ?, energy_meter = ?, power_good_test = ?, 
                    voltage = ?, line1 = ?, line2 = ?, line3 = ?, 
                    temp_reading = ?, freq_reading = ?, led_status_4g = ?, 
                    led_status_fast_blink = ?, go_no_go = ?, test_duration = ? 
                    WHERE unit_id = ?";
        } else {
            $sql = "INSERT INTO station6_checklists 
                    (lora_module, energy_meter, power_good_test, voltage, line1, line2, line3, 
                     temp_reading, freq_reading, led_status_4g, led_status_fast_blink, 
                     go_no_go, test_duration, unit_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        }
        $pdo->prepare($sql)->execute($params);
    } catch (PDOException $e) {
        error_log("Station 6 Checklist Failed: " . $e->getMessage());
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
// 1. GET REQUESTS (UPDATED WITH JOIN FOR TRACKER MODAL)
// ==========================================================
if ($method === 'GET') {
    try {
        // Core Query with LEFT JOIN to get Station 6 technical data
        $baseSql = "SELECT u.*, 
                    s6.lora_module, s6.energy_meter, s6.power_good_test, s6.voltage, 
                    s6.line1, s6.line2, s6.line3, s6.temp_reading, s6.freq_reading, 
                    s6.led_status_4g, s6.led_status_fast_blink, s6.go_no_go as checklist_verdict,
                    s6.test_duration
                    FROM units u
                    LEFT JOIN station6_checklists s6 ON u.id = s6.unit_id";

        if (isset($_GET['search_assembly'])) {
            $stmt = $pdo->prepare("$baseSql WHERE u.assembly_no = :assy ORDER BY u.created_at DESC LIMIT 1");
            $stmt->execute(['assy' => $_GET['search_assembly']]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit; 
        }

        if (isset($_GET['search_serial'])) {
            $stmt = $pdo->prepare("$baseSql WHERE u.device_serial_no = :serial ORDER BY u.created_at DESC LIMIT 1");
            $stmt->execute(['serial' => $_GET['search_serial']]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit; 
        }

        $station = $_GET['station'] ?? null;
        $status = $_GET['status'] ?? null;
        $conditions = [];
        $params = [];

        if ($station) { $conditions[] = "u.station = :station"; $params['station'] = $station; }
        if ($status) { $conditions[] = "u.status = :status"; $params['status'] = $status; }
        
        $sql = $baseSql;
        if (count($conditions) > 0) $sql .= " WHERE " . implode(" AND ", $conditions);
        $sql .= " ORDER BY u.created_at DESC";

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
        
        $stmt = $pdo->prepare("UPDATE units SET status = :status, remarks = :remarks, station = :station WHERE id = :id");
                               
        $stmt->execute([
            'id' => $data['id'],
            'status' => $data['status'],
            'remarks' => $data['remarks'] ?? '',
            'station' => $data['station'] ?? 'N/A'
        ]);

        if (isset($data['checklist_data']) && (str_replace(' ', '', $data['station']) === 'Station6')) {
            handleStation6Checklist($pdo, $data['id'], $data['checklist_data']);
        }

        $mod = $data['model'] ?? '';
        $assy = $data['assemblyNo'] ?? $data['assembly_no'] ?? '';
        
        logUnitAction($pdo, $data['id'], $mod, $assy, $data['station'] ?? 'N/A', $data['status'], 'ADMIN_MANUAL_EDIT', $data['remarks'] ?? '', $data['username'] ?? 'Admin');

        $pdo->commit();
        echo json_encode(["status" => "success", "message" => "Unit and Checklist updated successfully."]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
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

        $existingUnit = null;
        if ($assy) {
            $check = $pdo->prepare("SELECT id FROM units WHERE assembly_no = ?");
            $check->execute([$assy]);
            $existingUnit = $check->fetch(PDO::FETCH_ASSOC);
        }

        if ($existingUnit) {
            $unitId = $existingUnit['id'];
            $updateFields = "status = :status, remarks = :remarks, station = :station, updated_at = CURRENT_TIMESTAMP";
            $params = ['status' => $stat, 'remarks' => $rem, 'station' => $stn, 'id' => $unitId];

            if ($serial) {
                $updateFields .= ", device_serial_no = :serial";
                $params['serial'] = $serial;
            }

            $stmt = $pdo->prepare("UPDATE units SET $updateFields WHERE id = :id");
            $stmt->execute($params);

            if (isset($data['checklist_data']) && (str_replace(' ', '', $stn) === 'Station6')) {
                handleStation6Checklist($pdo, $unitId, $data['checklist_data']);
            }

            logUnitAction($pdo, $unitId, $mod, $assy, $stn, $stat, 'STATION_HANDOVER', "Processed at $stn", $user);
            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Unit processed successfully."]);

        } else {
            $stmt = $pdo->prepare("INSERT INTO units 
                (model, revision, base_unit_kitting_no, assembly_no, device_serial_no, accessory_kitting_no, status, remarks, station) 
                VALUES (:model, :rev, :buk, :assy, :serial, :ack, :status, :remarks, :station)");
            
            $stmt->execute([
                'model' => $mod, 'rev' => $rev, 'buk' => $buk, 'assy' => $assy,
                'serial' => $serial, 'ack' => $ack, 'status' => $stat, 'remarks' => $rem, 'station' => $stn
            ]);
            
            $newId = $pdo->lastInsertId();

            if (isset($data['checklist_data']) && (str_replace(' ', '', $stn) === 'Station6')) {
                handleStation6Checklist($pdo, $newId, $data['checklist_data']);
            }

            logUnitAction($pdo, $newId, $mod, $assy, $stn, $stat, 'UNIT_CREATED', 'New Entry', $user);
            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Unit created successfully.", "id" => $newId]);
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
?>