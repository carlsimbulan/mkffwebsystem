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

function handleStation3Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station3_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station3_checklists SET assembly_no = ?, requirements = ?, remarks = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '', $unitId]);
        } else {
            $sql = "INSERT INTO station3_checklists (unit_id, assembly_no, requirements, remarks) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '']);
        }
    } catch (PDOException $e) { error_log("S3 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation4Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station4_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station4_checklists SET assembly_no = ?, requirements = ?, remarks = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '', $unitId]);
        } else {
            $sql = "INSERT INTO station4_checklists (unit_id, assembly_no, requirements, remarks) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '']);
        }
    } catch (PDOException $e) { error_log("S4 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation5Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station5_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station5_checklists SET assembly_no = ?, requirements = ?, remarks = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '', $unitId]);
        } else {
            $sql = "INSERT INTO station5_checklists (unit_id, assembly_no, requirements, remarks) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '']);
        }
    } catch (PDOException $e) { error_log("S5 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation9Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station9_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station9_checklists SET assembly_no = ?, requirements = ?, remarks = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '', $unitId]);
        } else {
            $sql = "INSERT INTO station9_checklists (unit_id, assembly_no, requirements, remarks) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '']);
        }
    } catch (PDOException $e) { error_log("S9 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation13Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station13_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station13_checklists SET assembly_no = ?, requirements = ?, remarks = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '', $unitId]);
        } else {
            $sql = "INSERT INTO station13_checklists (unit_id, assembly_no, requirements, remarks) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '']);
        }
    } catch (PDOException $e) { error_log("S13 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation14Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station14_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station14_checklists SET assembly_no = ?, requirements = ?, remarks = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '', $unitId]);
        } else {
            $sql = "INSERT INTO station14_checklists (unit_id, assembly_no, requirements, remarks) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '']);
        }
    } catch (PDOException $e) { error_log("S14 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation1Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station1_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station1_checklists SET assembly_no = ?, header_seated_90_deg = ?, leads_properly_soldered = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([
                $assemblyNo, 
                $checklistData['header_seated_90_deg'] ?? 'GO', 
                $checklistData['leads_properly_soldered'] ?? 'GO',
                $unitId
            ]);
        } else {
            $sql = "INSERT INTO station1_checklists (unit_id, assembly_no, header_seated_90_deg, leads_properly_soldered) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $unitId, 
                $assemblyNo, 
                $checklistData['header_seated_90_deg'] ?? 'GO', 
                $checklistData['leads_properly_soldered'] ?? 'GO'
            ]);
        }
    } catch (PDOException $e) { error_log("S1 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation2Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station2_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station2_checklists SET 
                    assembly_no = ?, lora_module = ?, lora_mesh_test = ?, energy_meter = ?, power_good_test = ?, 
                    voltage = ?, line1 = ?, line2 = ?, line3 = ?, temp_reading = ?, freq_reading = ?, 
                    led_status_4g = ?, led_status_fast_blink = ?, go_no_go = ?, sw1_off_to_led_off_duration = ?
                    WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([
                $assemblyNo, 
                $checklistData['lora_module'] ?? 'Detected', 
                $checklistData['lora_mesh_test'] ?? 'Detected',
                $checklistData['energy_meter'] ?? 'Detected', 
                $checklistData['power_good_test'] ?? 'Detected', 
                (float)($checklistData['voltage'] ?? 115), 
                (float)($checklistData['line1'] ?? 115), 
                (float)($checklistData['line2'] ?? 115), 
                (float)($checklistData['line3'] ?? 115), 
                $checklistData['temp_reading'] ?? 'PASS', 
                $checklistData['freq_reading'] ?? 'GO', 
                $checklistData['led_status_4g'] ?? 'GO', 
                $checklistData['led_status_fast_blink'] ?? 'GO', 
                $checklistData['go_no_go'] ?? 'GO', 
                (int)($checklistData['sw1_off_to_led_off_duration'] ?? 0),
                $unitId
            ]);
        } else {
            $sql = "INSERT INTO station2_checklists 
                    (unit_id, assembly_no, lora_module, lora_mesh_test, energy_meter, power_good_test, 
                     voltage, line1, line2, line3, temp_reading, freq_reading, 
                     led_status_4g, led_status_fast_blink, go_no_go, sw1_off_to_led_off_duration) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $unitId,
                $assemblyNo, 
                $checklistData['lora_module'] ?? 'Detected', 
                $checklistData['lora_mesh_test'] ?? 'Detected',
                $checklistData['energy_meter'] ?? 'Detected', 
                $checklistData['power_good_test'] ?? 'Detected', 
                (float)($checklistData['voltage'] ?? 115), 
                (float)($checklistData['line1'] ?? 115), 
                (float)($checklistData['line2'] ?? 115), 
                (float)($checklistData['line3'] ?? 115), 
                $checklistData['temp_reading'] ?? 'PASS', 
                $checklistData['freq_reading'] ?? 'GO', 
                $checklistData['led_status_4g'] ?? 'GO', 
                $checklistData['led_status_fast_blink'] ?? 'GO', 
                $checklistData['go_no_go'] ?? 'GO', 
                (int)($checklistData['sw1_off_to_led_off_duration'] ?? 0)
            ]);
        }
    } catch (PDOException $e) { error_log("S2 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation7Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station7_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station7_checklists SET assembly_no = ?, requirements = ?, remarks = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '', $unitId]);
        } else {
            $sql = "INSERT INTO station7_checklists (unit_id, assembly_no, requirements, remarks) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '']);
        }
    } catch (PDOException $e) { error_log("S7 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation8Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station8_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station8_checklists SET assembly_no = ?, power_unit_disable_lora = ?, frequency_band = ?, test_input_fields = ?, rsso_testing = ?, data_outage = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([
                $assemblyNo, 
                $checklistData['power_unit_disable_lora'] ?? 'Passed', 
                $checklistData['frequency_band'] ?? 'Complete', 
                getNullIfEmpty($checklistData['start_testing'] ?? $checklistData['test_input_fields'] ?? ''), 
                $checklistData['rsso_testing'] ?? 'Passed', 
                $checklistData['data_outage'] ?? 'Passed',
                $unitId
            ]);
        } else {
            $sql = "INSERT INTO station8_checklists (unit_id, assembly_no, power_unit_disable_lora, frequency_band, test_input_fields, rsso_testing, data_outage) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $unitId, 
                $assemblyNo, 
                $checklistData['power_unit_disable_lora'] ?? 'Passed', 
                $checklistData['frequency_band'] ?? 'Complete', 
                getNullIfEmpty($checklistData['start_testing'] ?? $checklistData['test_input_fields'] ?? ''), 
                $checklistData['rsso_testing'] ?? 'Passed', 
                $checklistData['data_outage'] ?? 'Passed'
            ]);
        }
    } catch (PDOException $e) { error_log("S8 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation10Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station10_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station10_checklists SET assembly_no = ?, requirements = ?, remarks = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([$assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '', $unitId]);
        } else {
            $sql = "INSERT INTO station10_checklists (unit_id, assembly_no, requirements, remarks) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$unitId, $assemblyNo, $checklistData['requirements'] ?? 'Passed', $checklistData['remarks'] ?? '']);
        }
    } catch (PDOException $e) { error_log("S10 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation11Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station11_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station11_checklists SET assembly_no = ?, led_status = ?, low_range = ?, medium_range = ?, high_range = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([
                $assemblyNo, 
                $checklistData['led_status'] ?? 'Not Passed', 
                $checklistData['low_range'] ?? 'Not Passed',
                $checklistData['medium_range'] ?? 'Not Passed',
                $checklistData['high_range'] ?? 'Not Passed',
                $unitId
            ]);
        } else {
            $sql = "INSERT INTO station11_checklists (unit_id, assembly_no, led_status, low_range, medium_range, high_range) VALUES (?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $unitId, 
                $assemblyNo, 
                $checklistData['led_status'] ?? 'Not Passed', 
                $checklistData['low_range'] ?? 'Not Passed',
                $checklistData['medium_range'] ?? 'Not Passed',
                $checklistData['high_range'] ?? 'Not Passed'
            ]);
        }
    } catch (PDOException $e) { error_log("S11 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation12Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station12_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $sql = "UPDATE station12_checklists SET assembly_no = ?, stickers_attached = ?, stickers_readable = ? WHERE unit_id = ?";
            $pdo->prepare($sql)->execute([
                $assemblyNo, 
                $checklistData['stickers_attached'] ?? 'GO', 
                $checklistData['stickers_readable'] ?? 'GO',
                $unitId
            ]);
        } else {
            $sql = "INSERT INTO station12_checklists (unit_id, assembly_no, stickers_attached, stickers_readable) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $unitId, 
                $assemblyNo, 
                $checklistData['stickers_attached'] ?? 'GO', 
                $checklistData['stickers_readable'] ?? 'GO'
            ]);
        }
    } catch (PDOException $e) { error_log("S12 Failed: " . $e->getMessage()); throw $e; }
}

function handleStation6Checklist($pdo, $unitId, $assemblyNo, $checklistData) {
    if (!$checklistData) return;
    try {
        $stmt = $pdo->prepare("SELECT id FROM station6_checklists WHERE unit_id = ?");
        $stmt->execute([$unitId]);
        $exists = $stmt->fetch();

        // Simplified params - only include fields that exist in database
        $params = [
            $assemblyNo, 
            $checklistData['lora_module'] ?? 'Detected',
            $checklistData['lora_mesh_test'] ?? 'Detected',
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
            (int)($checklistData['sw1_off_to_led_off_duration'] ?? 0),
            $unitId
        ];

        if ($exists) {
            // UPDATE SQL - only existing columns
            $sql = "UPDATE station6_checklists SET 
                    assembly_no = ?, lora_module = ?, lora_mesh_test = ?, energy_meter = ?, 
                    power_good_test = ?, voltage = ?, line1 = ?, line2 = ?, line3 = ?, 
                    temp_reading = ?, freq_reading = ?, led_status_4g = ?, 
                    led_status_fast_blink = ?, go_no_go = ?, sw1_off_to_led_off_duration = ?
                    WHERE unit_id = ?";
        } else {
            // INSERT SQL - only existing columns
            $sql = "INSERT INTO station6_checklists 
                    (assembly_no, lora_module, lora_mesh_test, energy_meter, power_good_test, 
                     voltage, line1, line2, line3, temp_reading, freq_reading, 
                     led_status_4g, led_status_fast_blink, go_no_go, sw1_off_to_led_off_duration, unit_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        }
        $pdo->prepare($sql)->execute($params);
    } catch (PDOException $e) { 
        error_log("S6 Failed: " . $e->getMessage()); 
        throw $e; 
    }
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
// Handle method override for PUT requests sent as POST
if ($method === 'POST' && isset($_GET['method']) && strtoupper($_GET['method']) === 'PUT') { 
    $method = 'PUT'; 
}

$data = json_decode(file_get_contents("php://input"), true);

// ==========================================================
// SPECIAL ENDPOINT: GENERATE UNIQUE BOARD NUMBERS
// ==========================================================
if ($method === 'GET' && isset($_GET['generate_board_numbers'])) {
    try {
        $quantity = isset($_GET['quantity']) ? (int)$_GET['quantity'] : 5;
        $quantity = max(1, min($quantity, 100)); // Limit between 1-100
        
        $boardTypes = ['mnbd_board_no', 'cmbd_board_no', 'lrbd_board_no', 'pqbd_board_no', 'bkbd_board_no'];
        $generatedNumbers = [];
        
        // Get all existing board numbers from database
        $existingNumbers = [];
        foreach ($boardTypes as $boardType) {
            $stmt = $pdo->prepare("SELECT DISTINCT $boardType FROM unit_pcba_details WHERE $boardType IS NOT NULL");
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $existingNumbers = array_merge($existingNumbers, $results);
        }
        $existingNumbers = array_unique($existingNumbers);
        
        // Generate unique numbers
        for ($i = 0; $i < $quantity; $i++) {
            $boardSet = [];
            foreach ($boardTypes as $boardType) {
                $attempts = 0;
                do {
                    $number = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
                    $attempts++;
                } while (in_array($number, $existingNumbers) && $attempts < 1000);
                
                $boardSet[substr($boardType, 0, -9) . '_no'] = $number; // Convert back to frontend format
                $existingNumbers[] = $number; // Add to existing to avoid duplicates in this batch
            }
            $generatedNumbers[] = $boardSet;
        }
        
        echo json_encode([
            'status' => 'success',
            'board_numbers' => $generatedNumbers
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}

// ==========================================================
// 1. GET REQUESTS
// ==========================================================
if ($method === 'GET') {
    try {
$baseSql = "SELECT 
    u.id, u.model, u.revision, u.base_unit_kitting_no, u.assembly_no, 
    u.device_serial_no, u.accessory_kitting_no, u.status, u.remarks, 
    u.station, u.created_at, u.updated_at,
    -- PCB Board Numbers
    pcb.mnbd_board_no, pcb.cmbd_board_no, pcb.lrbd_board_no, pcb.pqbd_board_no, pcb.bkbd_board_no,
    -- Station 1 Columns
    s1.header_seated_90_deg AS s1_header_seated_90_deg,
    s1.leads_properly_soldered AS s1_leads_properly_soldered,
    -- Station 2 Columns
    s2.lora_module AS s2_lora_module, 
    s2.lora_mesh_test AS s2_lora_mesh_test,
    s2.energy_meter AS s2_energy_meter, 
    s2.power_good_test AS s2_power_good_test, 
    s2.voltage AS s2_voltage, 
    s2.line1 AS s2_line1, 
    s2.line2 AS s2_line2, 
    s2.line3 AS s2_line3, 
    s2.temp_reading AS s2_temp_reading, 
    s2.freq_reading AS s2_freq_reading, 
    s2.led_status_4g AS s2_led_status_4g, 
    s2.led_status_fast_blink AS s2_led_status_fast_blink, 
    s2.go_no_go AS s2_go_no_go,
    s2.sw1_off_to_led_off_duration AS s2_sw1_off_to_led_off_duration,
    -- Station 3 Columns
    s3.requirements AS s3_requirements,
    s3.remarks AS s3_remarks,
    -- Station 4 Columns
    s4.requirements AS s4_requirements,
    s4.remarks AS s4_remarks,
    -- Station 5 Columns
    s5.requirements AS s5_requirements,
    s5.remarks AS s5_remarks,
    -- Station 6 Columns
    s6.lora_module AS s6_lora_module, 
    s6.lora_mesh_test AS s6_lora_mesh_test,
    s6.energy_meter AS s6_energy_meter, 
    s6.power_good_test AS s6_power_good_test, 
    s6.voltage AS s6_voltage, 
    s6.line1 AS s6_line1, 
    s6.line2 AS s6_line2, 
    s6.line3 AS s6_line3, 
    s6.temp_reading AS s6_temp_reading, 
    s6.freq_reading AS s6_freq_reading, 
    s6.led_status_4g AS s6_led_status_4g, 
    s6.led_status_fast_blink AS s6_led_status_fast_blink, 
    s6.go_no_go AS s6_go_no_go,
    s6.sw1_off_to_led_off_duration AS s6_sw1_off_to_led_off_duration,
    -- Station 7 Columns
    s7.requirements AS s7_requirements,
    s7.remarks AS s7_remarks,
    -- Station 8 Columns
    s8.power_unit_disable_lora AS s8_power_unit_disable_lora,
    s8.frequency_band AS s8_frequency_band,
    s8.test_input_fields AS s8_start_testing,
    s8.rsso_testing AS s8_rsso_testing,
    s8.data_outage AS s8_data_outage,
    -- Station 9 Columns
    s9.requirements AS s9_requirements,
    s9.remarks AS s9_remarks,
    -- Station 10 Columns
    s10.requirements AS s10_requirements,
    s10.remarks AS s10_remarks,
    -- Station 11 Columns
    s11.led_status AS s11_led_status,
    s11.low_range AS s11_low_range,
    s11.medium_range AS s11_medium_range,
    s11.high_range AS s11_high_range,
    -- Station 12 Columns
    s12.stickers_attached AS s12_stickers_attached, 
    s12.stickers_readable AS s12_stickers_readable,
    -- Station 13 Columns
    s13.requirements AS s13_requirements,
    s13.remarks AS s13_remarks,
    -- Station 14 Columns
    s14.requirements AS s14_requirements,
    s14.remarks AS s14_remarks
    FROM units u
    LEFT JOIN unit_pcba_details pcb ON u.id = pcb.unit_id
    LEFT JOIN station1_checklists s1 ON u.id = s1.unit_id
    LEFT JOIN station2_checklists s2 ON u.id = s2.unit_id
    LEFT JOIN station3_checklists s3 ON u.id = s3.unit_id
    LEFT JOIN station4_checklists s4 ON u.id = s4.unit_id
    LEFT JOIN station5_checklists s5 ON u.id = s5.unit_id
    LEFT JOIN station6_checklists s6 ON u.id = s6.unit_id
    LEFT JOIN station7_checklists s7 ON u.id = s7.unit_id
    LEFT JOIN station8_checklists s8 ON u.id = s8.unit_id
    LEFT JOIN station9_checklists s9 ON u.id = s9.unit_id
    LEFT JOIN station10_checklists s10 ON u.id = s10.unit_id
    LEFT JOIN station11_checklists s11 ON u.id = s11.unit_id
    LEFT JOIN station12_checklists s12 ON u.id = s12.unit_id
    LEFT JOIN station13_checklists s13 ON u.id = s13.unit_id
    LEFT JOIN station14_checklists s14 ON u.id = s14.unit_id
    ";

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
        $sql .= " GROUP BY u.id ORDER BY u.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (Exception $e) { http_response_code(500); echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

// ==========================================================
// SPECIAL ENDPOINT: VERIFY RELEASE PIN
// ==========================================================
if ($method === 'POST' && isset($data['action']) && $data['action'] === 'verify_release_pin') {
    try {
        $inputPin = $data['pin'] ?? '';
        
        if (empty($inputPin)) {
            echo json_encode([
                'status' => 'error',
                'verified' => false,
                'message' => 'PIN is required'
            ]);
            exit;
        }
        
        // Get PIN from database
        $stmt = $pdo->prepare("SELECT pin FROM release_pin WHERE id = 1");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            echo json_encode([
                'status' => 'error',
                'verified' => false,
                'message' => 'PIN not configured in system'
            ]);
            exit;
        }
        
        // Compare PINs
        if ($inputPin === $result['pin']) {
            echo json_encode([
                'status' => 'success',
                'verified' => true,
                'message' => 'PIN verified successfully'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'verified' => false,
                'message' => 'Invalid PIN'
            ]);
        }
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'verified' => false,
            'message' => 'System error: ' . $e->getMessage()
        ]);
        exit;
    }
}

// ==========================================================
// SPECIAL ENDPOINT: UPDATE RELEASE PIN
// ==========================================================
if ($method === 'POST' && isset($data['action']) && $data['action'] === 'update_release_pin') {
    try {
        $currentPin = $data['current_pin'] ?? '';
        $newPin = $data['new_pin'] ?? '';
        
        if (empty($currentPin) || empty($newPin)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Current PIN and new PIN are required'
            ]);
            exit;
        }
        
        // Verify current PIN first
        $stmt = $pdo->prepare("SELECT pin FROM release_pin WHERE id = 1");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            echo json_encode([
                'status' => 'error',
                'message' => 'PIN not configured in system'
            ]);
            exit;
        }
        
        if ($currentPin !== $result['pin']) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Current PIN is incorrect'
            ]);
            exit;
        }
        
        // Update to new PIN
        $updateStmt = $pdo->prepare("UPDATE release_pin SET pin = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = 1");
        $updateStmt->execute([$newPin, $data['username'] ?? 'Admin']);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'PIN updated successfully'
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'System error: ' . $e->getMessage()
        ]);
        exit;
    }
}

// ==========================================================
// 2. PUT / POST REQUEST HANDLER (Main Logic)
// ==========================================================

try {
    if (!$data) throw new Exception("No data received.");

    // DEBUG: Log incoming request data for troubleshooting
    error_log("UNITS API DEBUG - Received data: " . json_encode($data));
    error_log("UNITS API DEBUG - Request method: " . $_SERVER['REQUEST_METHOD']);
    error_log("UNITS API DEBUG - Content type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));

    // Validate required fields
    $assy = $data['assemblyNo'] ?? $data['assembly_no'] ?? $data['assembly_number'] ?? '';
    if (empty($assy)) {
        throw new Exception("Assembly number is required.");
    }

    $pdo->beginTransaction();

    $stat = $data['status'] ?? 'In Progress';
    $stn = $data['station'] ?? 'N/A'; // Changed default from 'Station 1' to 'N/A'
    $user_name = $data['username'] ?? 'System';
    $cleanStn = str_replace(' ', '', $stn);
    
    /**
     * FIXED: Simplified validation for No Good (NG) status
     * Always require remarks for NG status to prevent ambiguity
     */
    $remarksText = trim($data['remarks'] ?? '');
    // Allow save but add default remarks if user forgot
if (($stat === 'No Good (NG)' || $stat === 'Pending Approval') && empty($remarksText)) {
    // Imbes na Exception, bigyan natin ng default text para tumuloy ang save
    $remarksText = "Set to $stat by system - No remarks provided.";
}

    // Check if this is an edit (has ID) or create operation
    $unitId = $data['id'] ?? null;
    
    if ($unitId) {
        // EDIT OPERATION: Find existing unit by ID
        $check = $pdo->prepare("SELECT id, model, assembly_no FROM units WHERE id = ?");
        $check->execute([$unitId]);
        $existingUnit = $check->fetch(PDO::FETCH_ASSOC);
        
        if (!$existingUnit) {
            throw new Exception("Unit not found for editing.");
        }
        
        $modelForLog = $existingUnit['model'];
        $assy = $existingUnit['assembly_no']; // Use existing assembly_no for consistency
        $action = 'UNIT_EDITED';
        
    } else {
        // CREATE OPERATION: Check if assembly_no already exists
        if (empty($assy)) {
            throw new Exception("Assembly number is required for new units.");
        }
        
        $check = $pdo->prepare("SELECT id, model FROM units WHERE assembly_no = ?");
        $check->execute([$assy]);
        $existingUnit = $check->fetch(PDO::FETCH_ASSOC);

        if ($existingUnit) {
            $unitId = $existingUnit['id'];
            $modelForLog = $existingUnit['model'];
            $action = 'STATION_UPDATE';
        } else {
            // Create new unit - only allow POST method for creation
            if ($method !== 'POST') {
                throw new Exception("Unit not found. Use POST method to create new units.");
            }
        }
    }

    if ($existingUnit) {
        $unitId = $existingUnit['id'];
        $modelForLog = $existingUnit['model'];
        
        // Enhanced duplicate prevention logic
        $currentUnitState = $pdo->prepare("SELECT status, station, updated_at FROM units WHERE id = ? FOR UPDATE");
        $currentUnitState->execute([$unitId]);
        $currentState = $currentUnitState->fetch(PDO::FETCH_ASSOC);
        
        if (!$currentState) {
            throw new Exception("Unit not found or locked by another process.");
        }
        
        // Validate station transition logic
        // Allow admin to move units between stations regardless of status
        // Operators must complete or mark as NG before moving
        $isAdminOverride = isset($data['admin_override']) && $data['admin_override'] === true;
        
        if ($currentState['station'] !== $stn && $currentState['status'] === 'In Progress' && !$isAdminOverride) {
            // Only allow station change if unit is being completed or has NG status
            if (!in_array($stat, ['Completed', 'No Good (NG)', 'Pending Approval'])) {
                throw new Exception("Cannot move unit from '{$currentState['station']}' to '{$stn}' while status is '{$currentState['status']}'. Unit must be completed or marked as NG first.");
            }
        }
        
        // Prevent duplicate status updates (no actual change)
        if ($currentState['status'] === $stat && $currentState['station'] === $stn) {
            // Check if there are actual data changes (checklist, PCBA details)
            $hasDataChanges = false;
            if (isset($data['checklist_data']) && !empty($data['checklist_data'])) {
                $hasDataChanges = true;
            }
            if (!empty($data['mnbd_no']) || !empty($data['cmbd_no']) || !empty($data['lrbd_no']) || 
                !empty($data['pqbd_no']) || !empty($data['bkbd_no'])) {
                $hasDataChanges = true;
            }
            
            if (!$hasDataChanges) {
                throw new Exception("No changes detected. Unit already has status '{$stat}' at station '{$stn}'.");
            }
        }
        
        // SQL query to include generated numbers
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
            // Get generated values from React formData
            'serial'  => getNullIfEmpty($data['deviceSerialNo'] ?? $data['device_serial_no'] ?? ''),
            'ack'     => getNullIfEmpty($data['accessoryKittingNo'] ?? $data['accessory_kitting_no'] ?? ''),
            'buk'     => getNullIfEmpty($data['baseUnitKittingNo'] ?? $data['base_unit_kitting_no'] ?? ''),
            'id'      => $unitId
        ];

        $updateResult = $pdo->prepare($updateSql)->execute($params);
        
        if (!$updateResult) {
            throw new Exception("Failed to update unit. Possible duplicate or constraint violation.");
        }
        
        $action = 'STATION_UPDATE';

    } else {
        // Create new unit - only allow POST method for creation
        if ($method !== 'POST') {
            throw new Exception("Unit not found. Use POST method to create new units.");
        }
        
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
    if (isset($data['checklist_data']) && !empty($data['checklist_data']) && $unitId) {
        // DEBUG: Log checklist data
        error_log("CHECKLIST DEBUG - Station: $cleanStn");
        error_log("CHECKLIST DEBUG - Data: " . json_encode($data['checklist_data']));
        
        if ($cleanStn === 'Station1') handleStation1Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station2') handleStation2Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station3') handleStation3Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station4') handleStation4Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station5') handleStation5Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station6') handleStation6Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station7') handleStation7Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station8') handleStation8Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station9') handleStation9Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station10') handleStation10Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station11') handleStation11Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station12') handleStation12Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station13') handleStation13Checklist($pdo, $unitId, $assy, $data['checklist_data']);
        elseif ($cleanStn === 'Station14') handleStation14Checklist($pdo, $unitId, $assy, $data['checklist_data']);
    }

    // PCBA INVENTORY HANDLER
    // PCBA INVENTORY HANDLER - ALL STATIONS (not just Station1)
    if (!empty($unitId)) {
    $boardMapping = [
        'mnbd_no' => 'mnbd_board_no',
        'cmbd_no' => 'cmbd_board_no',
        'lrbd_no' => 'lrbd_board_no',
        'pqbd_no' => 'pqbd_board_no',
        'bkbd_no' => 'bkbd_board_no'
    ];

    // Save PCBA details for any status (not just 'In Progress')
    if (!empty($data['mnbd_no']) || !empty($data['cmbd_no']) || !empty($data['lrbd_no']) || !empty($data['pqbd_no']) || !empty($data['bkbd_no'])) {
        foreach ($boardMapping as $reactKey => $dbColumn) {
            $val = getNullIfEmpty($data[$reactKey] ?? '');
            if (!$val) continue; // Laktawan kung walang pinasang serial

            // Duplicate Check - Modified to allow editing existing unit with same serial
            $stmt = $pdo->prepare("SELECT assembly_no, unit_id FROM unit_pcba_details WHERE $dbColumn = ?");
            $stmt->execute([$val]);
            $existingBoard = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingBoard && $existingBoard['unit_id'] != $unitId) {
                throw new Exception("Error: Board serial '$val' is already registered to another unit.");
            }
        }

        // Check if PCBA record already exists for this unit
        $checkPCBA = $pdo->prepare("SELECT id FROM unit_pcba_details WHERE unit_id = ?");
        $checkPCBA->execute([$unitId]);
        $existingPCBA = $checkPCBA->fetch(PDO::FETCH_ASSOC);
        
        if ($existingPCBA) {
            // Update existing record
            $sqlPCBA = "UPDATE unit_pcba_details SET 
                        assembly_no = ?, 
                        mnbd_board_no = ?, 
                        cmbd_board_no = ?, 
                        lrbd_board_no = ?, 
                        pqbd_board_no = ?, 
                        bkbd_board_no = ? 
                        WHERE unit_id = ?";
            $pdo->prepare($sqlPCBA)->execute([
                $assy, 
                getNullIfEmpty($data['mnbd_no'] ?? ''), 
                getNullIfEmpty($data['cmbd_no'] ?? ''), 
                getNullIfEmpty($data['lrbd_no'] ?? ''), 
                getNullIfEmpty($data['pqbd_no'] ?? ''), 
                getNullIfEmpty($data['bkbd_no'] ?? ''),
                $unitId
            ]);
        } else {
            // Insert new record
            $sqlPCBA = "INSERT INTO unit_pcba_details (unit_id, assembly_no, mnbd_board_no, cmbd_board_no, lrbd_board_no, pqbd_board_no, bkbd_board_no) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sqlPCBA)->execute([
                $unitId, 
                $assy, 
                getNullIfEmpty($data['mnbd_no'] ?? ''), 
                getNullIfEmpty($data['cmbd_no'] ?? ''), 
                getNullIfEmpty($data['lrbd_no'] ?? ''), 
                getNullIfEmpty($data['pqbd_no'] ?? ''), 
                getNullIfEmpty($data['bkbd_no'] ?? '')
            ]);
        }
    }
    // REMOVED: Auto-delete of PCBA boards on NG status
    // Board numbers should only be deleted if explicitly cleared by user
}
// ... (rest of the code remains the same)
    if ($unitId) {
        logUnitAction($pdo, $unitId, $modelForLog ?? ($data['model'] ?? ''), $assy, $stn, $stat, $action, $remarksText, $user_name);
    }

    if (!$unitId) {
        throw new Exception("Failed to create or update unit. Unit ID is missing.");
    }

    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Operation successful"]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log("Main Operation Failed: " . $e->getMessage());

    http_response_code(400); 
    echo json_encode(['error' => $e->getMessage()]);
}
?>