<?php
// backend/api/getStation1.php

// 1. CORS Headers
// Allows access from any origin (localhost, network IP, etc.)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS"); 

// Handle Pre-flight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

// 2. Database Connection
// Ensure db.php exists in the parent folder
if (!file_exists('../db.php')) {
    http_response_code(500);
    echo json_encode(['error' => 'Database configuration file (db.php) not found.']);
    exit;
}
require_once '../db.php'; 

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: Fetch Units ---
if ($method === 'GET') {
    $station = $_GET['station'] ?? null;
    $status = $_GET['status'] ?? null;

    $sql = "SELECT * FROM units"; 
    $params = [];
    $conditions = [];

    // Filter Logic
    if ($station) {
        $conditions[] = "station = :station";
        $params['station'] = $station;
    }
    if ($status) {
        $conditions[] = "status = :status";
        $params['status'] = $status;
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    $sql .= " ORDER BY created_at DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $units = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($units);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

// --- POST: Save New Unit ---
if ($method === 'POST') {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    // Support both camelCase (React) and snake_case keys
    $serial = $data['deviceSerialNo'] ?? $data['device_serial_no'] ?? null;
    $model = $data['model'] ?? null;

    if (!$model || !$serial) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields (model or device serial no)']);
        exit;
    }

    try {
        $sql = "INSERT INTO units (model, revision, base_unit_kitting_no, assembly_no, device_serial_no, accessory_kitting_no, status, remarks, station)
                VALUES (:model, :revision, :base, :assy, :serial, :acc, :status, :remarks, :station)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'model' => $model,
            'revision' => $data['revision'] ?? null,
            // Check both naming conventions to be safe
            'base' => $data['baseUnitKittingNo'] ?? $data['base_unit_kitting_no'] ?? null,
            'assy' => $data['assemblyNo'] ?? $data['assembly_no'] ?? null,
            'serial' => $serial,
            'acc' => $data['accessoryKittingNo'] ?? $data['accessory_kitting_no'] ?? null,
            'status' => $data['status'] ?? 'In Progress',
            'remarks' => $data['remarks'] ?? null,
            'station' => $data['station'] ?? 'Station1'
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Unit saved successfully', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        // Handle Duplicate Entry
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
             http_response_code(409); // Conflict
             echo json_encode(['error' => 'Duplicate Serial Number detected.']);
        } else {
             http_response_code(500);
             echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    exit;
}


// --- PUT: Update Unit ---
if ($method === 'PUT') {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing unit ID for update.']);
        exit;
    }

    try {
        // Dynamic Update: Only update fields that are sent
        $fields = [];
        $params = ['id' => $data['id']];

        if (isset($data['status'])) {
            $fields[] = "status = :status";
            $params['status'] = $data['status'];
        }
        if (isset($data['remarks'])) {
            $fields[] = "remarks = :remarks";
            $params['remarks'] = $data['remarks'];
        }
        if (isset($data['model'])) {
            $fields[] = "model = :model";
            $params['model'] = $data['model'];
        }

        if (empty($fields)) {
            echo json_encode(['status' => 'success', 'message' => 'No changes requested.']);
            exit;
        }

        $sql = "UPDATE units SET " . implode(", ", $fields) . " WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Unit updated successfully']);
        } else {
            // 200 OK but no rows changed (maybe data was same)
            echo json_encode(['status' => 'success', 'message' => 'Unit found but no data changed.']);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error during update: ' . $e->getMessage()]);
    }
    exit;
}
?>