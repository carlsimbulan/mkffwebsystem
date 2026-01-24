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

// --- HELPER: STATION 1 CHECKLIST HANDLER ---
function handleStation1Checklist($pdo, $unitId, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station1_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station1_checklists SET header_seated_90_deg = ?, leads_properly_soldered = ? WHERE unit_id = ?";
            $params = [$checklistData['header_seated_90_deg'], $checklistData['leads_properly_soldered'], $unitId];
        } else {
            $sql = "INSERT INTO station1_checklists (unit_id, header_seated_90_deg, leads_properly_soldered) VALUES (?, ?, ?)";
            $params = [$unitId, $checklistData['header_seated_90_deg'], $checklistData['leads_properly_soldered']];
        }
        $pdo->prepare($sql)->execute($params);
    } catch (PDOException $e) {
        error_log("Station 1 Checklist Failed: " . $e->getMessage());
    }
}

// --- HELPER: STATION 2 CHECKLIST HANDLER (NEW) ---
function handleStation2Checklist($pdo, $unitId, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station2_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station2_checklists SET 
                    integrated_board_level_test1 = ?, 
                    integrated_board_level_test2 = ?, 
                    integrated_board_level_test3 = ? 
                    WHERE unit_id = ?";
            $params = [
                $checklistData['integrated_board_level_test1'], 
                $checklistData['integrated_board_level_test2'], 
                $checklistData['integrated_board_level_test3'], 
                $unitId
            ];
        } else {
            $sql = "INSERT INTO station2_checklists 
                    (unit_id, integrated_board_level_test1, integrated_board_level_test2, integrated_board_level_test3) 
                    VALUES (?, ?, ?, ?)";
            $params = [
                $unitId, 
                $checklistData['integrated_board_level_test1'], 
                $checklistData['integrated_board_level_test2'], 
                $checklistData['integrated_board_level_test3']
            ];
        }
        $pdo->prepare($sql)->execute($params);
    } catch (PDOException $e) {
        error_log("Station 2 Checklist Failed: " . $e->getMessage());
    }
}

// --- HELPER: STATION 6 CHECKLIST HANDLER ---
function handleStation6Checklist($pdo, $unitId, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station6_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

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
// 1. GET REQUESTS
// ==========================================================
if ($method === 'GET') {
    try {
        $baseSql = "SELECT u.*, 
                    s1.header_seated_90_deg, s1.leads_properly_soldered,
                    s2.integrated_board_level_test1, s2.integrated_board_level_test2, s2.integrated_board_level_test3,
                    s6.lora_module, s6.energy_meter, s6.power_good_test, s6.voltage, 
                    s6.line1, s6.line2, s6.line3, s6.temp_reading, s6.freq_reading, 
                    s6.led_status_4g, s6.led_status_fast_blink, s6.go_no_go as checklist_verdict,
                    s6.test_duration
                    FROM units u
                    LEFT JOIN station1_checklists s1 ON u.id = s1.unit_id
                    LEFT JOIN station2_checklists s2 ON u.id = s2.unit_id
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
        http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
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

        if (isset($data['checklist_data'])) {
            $cleanStation = str_replace(' ', '', $data['station']);
            if ($cleanStation === 'Station1') {
                handleStation1Checklist($pdo, $data['id'], $data['checklist_data']);
            } elseif ($cleanStation === 'Station2') {
                handleStation2Checklist($pdo, $data['id'], $data['checklist_data']);
            } elseif ($cleanStation === 'Station6') {
                handleStation6Checklist($pdo, $data['id'], $data['checklist_data']);
            }
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
    $assy = $data['assemblyNo'] ?? $data['assembly_no'] ?? ''; 
    $stn = $data['station'] ?? 'Station 1';
    $stat = $data['status'] ?? 'In Progress';
    $user = $data['username'] ?? 'System';

    try {
        $pdo->beginTransaction();

        $check = $pdo->prepare("SELECT id FROM units WHERE assembly_no = ?");
        $check->execute([$assy]);
        $existingUnit = $check->fetch(PDO::FETCH_ASSOC);

        if ($existingUnit) {
            $unitId = $existingUnit['id'];
            $updateSql = "UPDATE units SET status = :status, remarks = :remarks, station = :station, updated_at = CURRENT_TIMESTAMP";
            if (getNullIfEmpty($data['deviceSerialNo'] ?? '')) $updateSql .= ", device_serial_no = :serial";
            
            $params = ['status' => $stat, 'remarks' => $data['remarks'] ?? '', 'station' => $stn, 'id' => $unitId];
            if (getNullIfEmpty($data['deviceSerialNo'] ?? '')) $params['serial'] = $data['deviceSerialNo'];

            $pdo->prepare("$updateSql WHERE id = :id")->execute($params);

            if (isset($data['checklist_data'])) {
                $cleanStation = str_replace(' ', '', $stn);
                if ($cleanStation === 'Station1') handleStation1Checklist($pdo, $unitId, $data['checklist_data']);
                if ($cleanStation === 'Station2') handleStation2Checklist($pdo, $unitId, $data['checklist_data']);
                if ($cleanStation === 'Station6') handleStation6Checklist($pdo, $unitId, $data['checklist_data']);
            }

            logUnitAction($pdo, $unitId, $data['model'] ?? '', $assy, $stn, $stat, 'STATION_HANDOVER', "Processed at $stn", $user);
        } else {
            $stmt = $pdo->prepare("INSERT INTO units 
                (model, revision, base_unit_kitting_no, assembly_no, device_serial_no, accessory_kitting_no, status, remarks, station) 
                VALUES (:model, :rev, :buk, :assy, :serial, :ack, :status, :remarks, :station)");
            
            $stmt->execute([
                'model' => $data['model'] ?? '', 'rev' => getNullIfEmpty($data['revision'] ?? ''), 
                'buk' => getNullIfEmpty($data['baseUnitKittingNo'] ?? ''), 'assy' => $assy,
                'serial' => getNullIfEmpty($data['deviceSerialNo'] ?? ''), 'ack' => getNullIfEmpty($data['accessoryKittingNo'] ?? ''), 
                'status' => $stat, 'remarks' => $data['remarks'] ?? '', 'station' => $stn
            ]);
            
            $newId = $pdo->lastInsertId();

            if (isset($data['checklist_data'])) {
                $cleanStation = str_replace(' ', '', $stn);
                if ($cleanStation === 'Station1') handleStation1Checklist($pdo, $newId, $data['checklist_data']);
                if ($cleanStation === 'Station2') handleStation2Checklist($pdo, $newId, $data['checklist_data']);
                if ($cleanStation === 'Station6') handleStation6Checklist($pdo, $newId, $data['checklist_data']);
            }

            logUnitAction($pdo, $newId, $data['model'] ?? '', $assy, $stn, $stat, 'UNIT_CREATED', 'New Entry', $user);
        }

        $pdo->commit();
        echo json_encode(["status" => "success", "message" => "Unit processed successfully."]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
?>