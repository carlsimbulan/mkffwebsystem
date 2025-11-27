    <?php
    // --- CORS Headers ---
    $allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    // Crucial: Allow PUT method header for preflight and actual requests
    header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS"); 
    header("Access-Control-Allow-Credentials: true");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    header("Content-Type: application/json");
    include '../db.php'; // Ensure the path to db.php is correct

    // 1. Determine the HTTP method, checking for the PUT override (from frontend workaround)
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
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON payload.']);
            exit;
        }
    }


    // --- GET: Kunin ang mga Units (Logs) ---
    if ($method === 'GET') {
        // Pwede mag-filter by station kung may parameter na ?station=Station1
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
    // --- PUT: Mag-update ng Existing Unit (FIX for 400 Bad Request) ---
    // ---------------------------------------------------------------------
    if ($method === 'PUT') {
        
        if (empty($data) || !isset($data['id'])) {
            http_response_code(400); // Bad Request
            echo json_encode(['error' => 'Missing unit ID or no data provided for update.']);
            exit;
        }
        
        // Check if the mandatory fields for editing are present
        if (!isset($data['status']) || !isset($data['remarks']) || !isset($data['model'])) {
            http_response_code(400); // Bad Request
            echo json_encode(['error' => 'Missing status, remarks, or model in update data.']);
            exit;
        }

        try {
            // Use placeholders for security (PDO prepared statements)
            $sql = "UPDATE units SET 
                    model = :model, 
                    status = :status, 
                    remarks = :remarks 
                    WHERE id = :id";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id' => $data['id'],
                'model' => $data['model'],
                'status' => $data['status'],
                'remarks' => $data['remarks']
            ]);

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Unit updated successfully.', 'id' => $data['id']]);
            } else {
                // Check if ID exists but no changes were made
                http_response_code(404);
                echo json_encode(['error' => 'Unit not found or no changes were made.']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            // Do not expose sensitive error messages in production
            echo json_encode(['error' => 'Database error during update: ' . $e->getMessage()]);
        }
        exit;
    }

    // --- POST: Mag-save ng Bagong Unit (Unmodified, used if no ?method=PUT is found) ---
    if ($method === 'POST') {
        // Note: $data is already decoded from the input stream at the top of the script
        
        if (!isset($data['model']) || !isset($data['device_serial_no'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields for POST (Insert).']);
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
                'serial' => $data['deviceSerialNo'] ?? null,
                'acc' => $data['accessoryKittingNo'] ?? null,
                'status' => $data['status'] ?? 'In Progress',
                'remarks' => $data['remarks'] ?? null,
                'station' => $data['station'] ?? 'Station1' // Default to Station1 if empty
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Unit saved successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error during insert: ' . $e->getMessage()]);
        }
        exit;
    }

    // Fallback for unsupported methods
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);

    ?>