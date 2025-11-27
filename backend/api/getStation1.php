<?php
// Tiyakin na WALANG kahit anong output, space, o blank line bago ang <?php tag.

// --- CORS Headers (Simplified Wildcard for Local Dev) ---
// Note: Hindi pwedeng gamitin ang Access-Control-Allow-Credentials kasabay ng wildcard (*), 
// kaya aalisin natin ang conditional logic para maging universal ang access.

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS"); 
// Inalis ang header("Access-Control-Allow-Credentials: true"); dahil sa wildcard.

// Handle pre-flight check (Ito ay kailangan para sa PUT/POST requests)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

// Tiyakin na ang path sa db.php ay tama
include '../db.php'; 

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: Kunin ang mga Units (Logs) ---
if ($method === 'GET') {
    $station = $_GET['station'] ?? null;
    $status = $_GET['status'] ?? null;

    $sql = "SELECT * FROM units"; 
    $params = [];

    // Filter Logic
    if ($station && $status) {
        $sql .= " WHERE station = :station AND status = :status";
        $params = ['station' => $station, 'status' => $status];
    } elseif ($station) {
        $sql .= " WHERE station = :station";
        $params = ['station' => $station];
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

// --- POST: Mag-save ng Bagong Unit ---
if ($method === 'POST') {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!isset($data['model']) || !isset($data['device_serial_no'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    try {
        $sql = "INSERT INTO units (model, revision, base_unit_kitting_no, assembly_no, device_serial_no, accessory_kitting_no, status, remarks, station)
                VALUES (:model, :revision, :base, :assy, :serial, :acc, :status, :remarks, :station)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'model' => $data['model'] ?? null,
            'revision' => $data['revision'] ?? null,
            'base' => $data['baseUnitKittingNo'] ?? null,
            'assy' => $data['assemblyNo'] ?? null,
            'serial' => $data['deviceSerialNo'],
            'acc' => $data['accessoryKittingNo'] ?? null,
            'status' => $data['status'] ?? 'In Progress',
            'remarks' => $data['remarks'] ?? null,
            'station' => $data['station'] ?? 'Station1'
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Unit saved successfully', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}


// --- PUT: I-update ang Unit (Admin Edit) ---
if ($method === 'PUT') {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing unit ID for update.']);
        exit;
    }

    try {
        $sql = "UPDATE units SET 
            status = :status, 
            remarks = :remarks, 
            model = :model 
            WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $data['id'],
            'status' => $data['status'] ?? null, 
            'remarks' => $data['remarks'] ?? null,
            'model' => $data['model'] ?? null
        ]);

        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Unit ID ' . $data['id'] . ' updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Unit ID ' . $data['id'] . ' not found or no changes made.']);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error during update: ' . $e->getMessage()]);
    }
    exit;
}
?>