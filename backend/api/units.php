<?php
// backend/api/units.php

// 1. ENABLE ERROR REPORTING PARA MAKITA ANG EXACT ERROR SA NETWORK TAB
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../db.php'; 

// --- HELPER: GET NULL IF EMPTY ---
function getNullIfEmpty($val) { 
    return (isset($val) && trim($val) !== '') ? trim($val) : null; 
}

// --- HELPER: HISTORY LOGGING ---
function logUnitAction($pdo, $unitId, $model, $assemblyNo, $station, $status, $actionType, $remarks = null, $actionBy = 'System') {
    try {
        $stmt = $pdo->prepare("INSERT INTO unit_history 
            (unit_id, model, assembly_no, action_type, station_name, status_after, remarks, action_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $unitId, 
            $model, 
            $assemblyNo, 
            $actionType, 
            $station, 
            $status, 
            getNullIfEmpty($remarks), 
            $actionBy
        ]);
    } catch (PDOException $e) {
        error_log("History Log Failed: " . $e->getMessage());
    }
}

// ==========================================================
// ALL CHECKLIST HANDLERS
// ==========================================================

function handleStation1Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station1_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        if ($stmt->fetch()) {
            $sql = "UPDATE station1_checklists SET assembly_no = ?, header_seated_90_deg = ?, leads_properly_soldered = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['header_seated_90_deg'], $checklistData['leads_properly_soldered'], $unitId]);
        } else {
            $sql = "INSERT INTO station1_checklists (unit_id, assembly_no, header_seated_90_deg, leads_properly_soldered) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['header_seated_90_deg'], $checklistData['leads_properly_soldered']]);
        }
    } catch (PDOException $e) { error_log("S1 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation2Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station2_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        if ($stmt->fetch()) {
            $sql = "UPDATE station2_checklists SET assembly_no = ?, integrated_board_level_test1 = ?, integrated_board_level_test2 = ?, integrated_board_level_test3 = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['integrated_board_level_test1'], $checklistData['integrated_board_level_test2'], $checklistData['integrated_board_level_test3'], $unitId]);
        } else {
            $sql = "INSERT INTO station2_checklists (unit_id, assembly_no, integrated_board_level_test1, integrated_board_level_test2, integrated_board_level_test3) VALUES (?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['integrated_board_level_test1'], $checklistData['integrated_board_level_test2'], $checklistData['integrated_board_level_test3']]);
        }
    } catch (PDOException $e) { error_log("S2 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation7Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $sql = "INSERT INTO station7_checklists (unit_id, assembly_no, performed_passed, result_recorded) VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE assembly_no=VALUES(assembly_no), performed_passed=VALUES(performed_passed), result_recorded=VALUES(result_recorded)";
        $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['performed_passed'] ?? 'GO', $checklistData['result_recorded'] ?? 'GO']);
    } catch (PDOException $e) { error_log("S7 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation8Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $sql = "INSERT INTO station8_checklists (unit_id, assembly_no, burnin_completed, no_failure_observed) VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE assembly_no=VALUES(assembly_no), burnin_completed=VALUES(burnin_completed), no_failure_observed=VALUES(no_failure_observed)";
        $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['burnin_completed'] ?? 'GO', $checklistData['no_failure_observed'] ?? 'GO']);
    } catch (PDOException $e) { error_log("S8 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation10Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $sql = "INSERT INTO station10_checklists (unit_id, assembly_no, post_performed_passed, post_result_recorded) VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE assembly_no=VALUES(assembly_no), post_performed_passed=VALUES(post_performed_passed), post_result_recorded=VALUES(post_result_recorded)";
        $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['post_performed_passed'] ?? 'GO', $checklistData['post_result_recorded'] ?? 'GO']);
    } catch (PDOException $e) { error_log("S10 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation11Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $sql = "INSERT INTO station11_checklists (unit_id, assembly_no, functions_working, connectivity_passed) VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE assembly_no=VALUES(assembly_no), functions_working=VALUES(functions_working), connectivity_passed=VALUES(connectivity_passed)";
        $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['functions_working'] ?? 'GO', $checklistData['connectivity_passed'] ?? 'GO']);
    } catch (PDOException $e) { error_log("S11 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation12Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $sql = "INSERT INTO station12_checklists (unit_id, assembly_no, stickers_attached, stickers_readable) VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE assembly_no=VALUES(assembly_no), stickers_attached=VALUES(stickers_attached), stickers_readable=VALUES(stickers_readable)";
        $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['stickers_attached'] ?? 'GO', $checklistData['stickers_readable'] ?? 'GO']);
    } catch (PDOException $e) { error_log("S12 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation6Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station6_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();
        $params = [
            $assemblyNo, 
            $checklistData['lora_module'] ?? 'Detected', 
            $checklistData['energy_meter'] ?? 'Detected', 
            $checklistData['power_good_test'] ?? 'Detected', 
            (float)($checklistData['voltage'] ?? 0), 
            (float)($checklistData['line1'] ?? 0), 
            (float)($checklistData['line2'] ?? 0), 
            (float)($checklistData['line3'] ?? 0), 
            $checklistData['temp_reading'] ?? 'PASS', 
            $checklistData['freq_reading'] ?? 'GO', 
            $checklistData['led_status_4g'] ?? 'GO', 
            $checklistData['led_status_fast_blink'] ?? 'GO', 
            $checklistData['go_no_go'] ?? 'GO', 
            (int)($checklistData['test_duration'] ?? 120), 
            $unitId
        ];
        if ($exists) {
            $sql = "UPDATE station6_checklists SET assembly_no = ?, lora_module = ?, energy_meter = ?, power_good_test = ?, voltage = ?, line1 = ?, line2 = ?, line3 = ?, temp_reading = ?, freq_reading = ?, led_status_4g = ?, led_status_fast_blink = ?, go_no_go = ?, test_duration = ? WHERE unit_id = ?";
        } else {
            $sql = "INSERT INTO station6_checklists (assembly_no, lora_module, energy_meter, power_good_test, voltage, line1, line2, line3, temp_reading, freq_reading, led_status_4g, led_status_fast_blink, go_no_go, test_duration, unit_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        }
        $pdo->prepare($sql)->execute($params);
    } catch (PDOException $e) { error_log("S6 Failed: " . $e->getMessage()); throw $e; }
}

// --- CORS ---
$allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) { header("Access-Control-Allow-Origin: $origin"); }
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS"); 
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_GET['method']) && strtoupper($_GET['method']) === 'PUT') { $method = 'PUT'; }

$data = json_decode(file_get_contents("php://input"), true);

// ==========================================================
// 1. GET REQUESTS
// ==========================================================
if ($method === 'GET') {
    try {
        $baseSql = "SELECT u.*, 
                    s1.header_seated_90_deg, s1.leads_properly_soldered,
                    s2.integrated_board_level_test1, s2.integrated_board_level_test2, s2.integrated_board_level_test3,
                    s7.performed_passed, s7.result_recorded,
                    s8.burnin_completed, s8.no_failure_observed,
                    s10.post_performed_passed, s10.post_result_recorded,
                    s11.functions_working, s11.connectivity_passed,
                    s12.stickers_attached, s12.stickers_readable,
                    s6.lora_module, s6.energy_meter, s6.power_good_test, s6.voltage, 
                    s6.line1, s6.line2, s6.line3, s6.temp_reading, s6.freq_reading, 
                    s6.led_status_4g, s6.led_status_fast_blink, s6.go_no_go as checklist_verdict,
                    s6.test_duration
                    FROM units u
                    LEFT JOIN station1_checklists s1 ON u.id = s1.unit_id
                    LEFT JOIN station2_checklists s2 ON u.id = s2.unit_id
                    LEFT JOIN station7_checklists s7 ON u.id = s7.unit_id
                    LEFT JOIN station8_checklists s8 ON u.id = s8.unit_id
                    LEFT JOIN station10_checklists s10 ON u.id = s10.unit_id
                    LEFT JOIN station11_checklists s11 ON u.id = s11.unit_id
                    LEFT JOIN station12_checklists s12 ON u.id = s12.unit_id
                    LEFT JOIN station6_checklists s6 ON u.id = s6.unit_id";

        if (isset($_GET['search_assembly'])) {
            $stmt = $pdo->prepare("$baseSql WHERE u.assembly_no = :assy ORDER BY u.created_at DESC LIMIT 1");
            $stmt->execute(['assy' => $_GET['search_assembly']]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC)); exit; 
        }
        if (isset($_GET['search_serial'])) {
            $stmt = $pdo->prepare("$baseSql WHERE u.device_serial_no = :serial ORDER BY u.created_at DESC LIMIT 1");
            $stmt->execute(['serial' => $_GET['search_serial']]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC)); exit; 
        }
        $station = $_GET['station'] ?? null; $status = $_GET['status'] ?? null;
        $conditions = []; $params = [];
        if ($station) { $conditions[] = "u.station = :station"; $params['station'] = $station; }
        if ($status) { $conditions[] = "u.status = :status"; $params['status'] = $status; }
        $sql = $baseSql;
        if (count($conditions) > 0) $sql .= " WHERE " . implode(" AND ", $conditions);
        $sql .= " ORDER BY u.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (Exception $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ==========================================================
// 2. PUT / POST REQUEST HANDLER (Main Logic)
// ==========================================================

try {
    if (!$data) throw new Exception("Walang data na natanggap.");

    $stat = $data['status'] ?? 'In Progress';
    
    /**
     * FIX FOR NO GOOD (NG) ERROR:
     * If the status is NG, we check for remarks.
     * If mnbd_no is NOT set, it means this is an ADMIN OVERRIDE.
     * In an override, we automatically provide a default remark if empty to prevent the 400 error.
     */
    $remarksText = trim($data['remarks'] ?? '');
    if ($stat === 'No Good (NG)' && empty($remarksText)) {
        if (!isset($data['mnbd_no'])) {
            // Admin Override context: Use default text
            $remarksText = "Status manually overridden to NG by Administrator.";
        } else {
            // Production Flow context: Still require manual remarks
            throw new Exception("Error: Remarks are required when status is No Good (NG).");
        }
    }

    $pdo->beginTransaction();

    $assy = $data['assemblyNo'] ?? $data['assembly_no'] ?? '';
    $stn = $data['station'] ?? 'Station 1';
    $user_name = $data['username'] ?? 'System';
    $cleanStn = str_replace(' ', '', $stn);

    // I-check kung nage-exist na ang unit
    $check = $pdo->prepare("SELECT id, model FROM units WHERE assembly_no = ?");
    $check->execute([$assy]);
    $existingUnit = $check->fetch(PDO::FETCH_ASSOC);

    if ($existingUnit) {
        $unitId = $existingUnit['id'];
        $modelForLog = $existingUnit['model'];
        
        // SQL query para isama ang mga generated numbers
        $updateSql = "UPDATE units SET 
                        status = :status, 
                        remarks = :remarks, 
                        station = :station, 
                        device_serial_no = :serial,
                        accessory_kitting_no = :ack,
                        base_unit_kitting_no = :buk,
                        updated_at = CURRENT_TIMESTAMP 
                      WHERE id = :id";
        
        $params = [
            'status'  => $stat, 
            'remarks' => getNullIfEmpty($remarksText), 
            'station' => $stn, 
            // Kinukuha ang generated values mula sa React formData
            'serial'  => getNullIfEmpty($data['deviceSerialNo'] ?? $data['device_serial_no'] ?? ''),
            'ack'     => getNullIfEmpty($data['accessoryKittingNo'] ?? $data['accessory_kitting_no'] ?? ''),
            'buk'     => getNullIfEmpty($data['baseUnitKittingNo'] ?? $data['base_unit_kitting_no'] ?? ''),
            'id'      => $unitId
        ];

        $pdo->prepare($updateSql)->execute($params);
        $action = 'STATION_UPDATE';

    } else if ($method === 'POST') {
        $stmt = $pdo->prepare("INSERT INTO units 
            (model, revision, base_unit_kitting_no, assembly_no, device_serial_no, accessory_kitting_no, status, remarks, station) 
            VALUES (:model, :rev, :buk, :assy, :serial, :ack, :status, :remarks, :station)");
        
        $stmt->execute([
            'model'   => $data['model'] ?? '', 
            'rev'     => getNullIfEmpty($data['revision'] ?? ''), 
            'buk'     => getNullIfEmpty($data['baseUnitKittingNo'] ?? $data['base_unit_kitting_no'] ?? ''), 
            'assy'    => $assy, 
            'serial'  => getNullIfEmpty($data['deviceSerialNo'] ?? $data['device_serial_no'] ?? ''), 
            'ack'     => getNullIfEmpty($data['accessoryKittingNo'] ?? $data['accessory_kitting_no'] ?? ''), 
            'status'  => $stat, 
            'remarks' => getNullIfEmpty($remarksText), 
            'station' => $stn
        ]);
        
        $unitId = $pdo->lastInsertId();
        $modelForLog = $data['model'] ?? '';
        $action = 'UNIT_CREATED';
    }

    // Routing for checklists
    if (isset($data['checklist_data'])) {
        if ($cleanStn === 'Station1') handleStation1Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station2') handleStation2Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station6') handleStation6Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station7') handleStation7Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station8') handleStation8Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station10') handleStation10Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station11') handleStation11Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station12') handleStation12Checklist($pdo, $unitId, $assy, $data['checklist_data']);
    }

    // 🔑 PCBA INVENTORY HANDLER
    if ($cleanStn === 'Station1' && isset($data['mnbd_no'])) {
        $boardMapping = [
            'mnbd_no' => 'mnbd_board_no',
            'cmbd_no' => 'cmbd_board_no',
            'lrbd_no' => 'lrbd_board_no',
            'pqbd_no' => 'pqbd_board_no',
            'bkbd_no' => 'bkbd_board_no'
        ];

        if ($stat === 'In Progress') {
            foreach ($boardMapping as $reactKey => $dbColumn) {
                $val = getNullIfEmpty($data[$reactKey] ?? '');
                
                if (!$val || strlen($val) < 6) {
                    throw new Exception("Error: All 5 PCBA serials (6 digits each) are required for In Progress units.");
                }

                // Check for duplicates
                $stmt = $pdo->prepare("SELECT assembly_no FROM unit_pcba_details WHERE $dbColumn = ? AND unit_id != ?");
                $stmt->execute([$val, $unitId]);
                $used = $stmt->fetch();
                if ($used) {
                    throw new Exception("Error: Board serial '$val' is already registered to unit " . $used['assembly_no']);
                }
            }

            // Save board details
            $sqlPCBA = "INSERT INTO unit_pcba_details (unit_id, assembly_no, mnbd_board_no, cmbd_board_no, lrbd_board_no, pqbd_board_no, bkbd_board_no) 
                        VALUES (?, ?, ?, ?, ?, ?, ?) 
                        ON DUPLICATE KEY UPDATE 
                            mnbd_board_no=VALUES(mnbd_board_no), 
                            cmbd_board_no=VALUES(cmbd_board_no), 
                            lrbd_board_no=VALUES(lrbd_board_no), 
                            pqbd_board_no=VALUES(pqbd_board_no), 
                            bkbd_board_no=VALUES(bkbd_board_no)";
                            
            $pdo->prepare($sqlPCBA)->execute([
                $unitId, $assy, 
                getNullIfEmpty($data['mnbd_no'] ?? ''), 
                getNullIfEmpty($data['cmbd_no'] ?? ''), 
                getNullIfEmpty($data['lrbd_no'] ?? ''), 
                getNullIfEmpty($data['pqbd_no'] ?? ''), 
                getNullIfEmpty($data['bkbd_no'] ?? '')
            ]);
        } else if ($stat === 'No Good (NG)') {
            $pdo->prepare("DELETE FROM unit_pcba_details WHERE unit_id = ?")->execute([$unitId]);
        }
    }

    // Final History Log
    logUnitAction($pdo, $unitId, $modelForLog ?? ($data['model'] ?? ''), $assy, $stn, $stat, $action, $remarksText, $user_name);

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Operation successful"]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log("Main Operation Failed: " . $e->getMessage());

    http_response_code(400); 
    echo json_encode(['error' => $e->getMessage()]);
}
?>