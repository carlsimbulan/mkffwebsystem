<?php
// daily_reports.php - Handles POST (Submission) and GET (Fetching Reports List)

// 1. Setup CORS Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
// Allow both POST (for submission) and GET (for fetching the list)
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include '../db.php'; 

// Check if $pdo variable is defined and connected (provided by db.php)
if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "FATAL ERROR: PDO connection object (\$pdo) is missing. Check db.php."));
    exit();
}

$response = ["status" => "error", "message" => ""];

// -----------------------------------------------------------
// A. HANDLE GET REQUEST (FETCHING REPORTS LIST) - UPDATED!
// -----------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 🌟 UPDATED QUERY: Gumamit ng LEFT JOIN para i-fetch ang full_name mula sa 'users' table.
        // Tiyaking tama ang paggamit ng table/column names: daily_reports (dr), users (u), submitted_by, at username.
        $sql = "SELECT
                    dr.*,  -- Lahat ng columns mula sa daily_reports
                    u.full_name AS submitted_by_name  -- Kukunin ang Full Name at papangalanang 'submitted_by_name'
                FROM
                    daily_reports dr
                LEFT JOIN
                    users u ON dr.submitted_by = u.username -- I-join base sa submitted_by (report) at username (user)
                ORDER BY dr.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Success: Return the reports list (kasama na ang submitted_by_name)
        http_response_code(200);
        echo json_encode($reports);
        exit();

    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => "Failed to fetch reports: " . $e->getMessage()));
        exit();
    }
}
// -----------------------------------------------------------
// B. HANDLE POST REQUEST (REPORT SUBMISSION WITH FILE UPLOAD)
// -----------------------------------------------------------
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $upload_dir = __DIR__ . '/uploads/';
    $max_file_size = 2097152; // 2MB

    // Ensure upload directory exists and is writable
    if (!is_dir($upload_dir)) {
        if (!mkdir($upload_dir, 0777, true)) {
            http_response_code(500);
            echo json_encode(array("status" => "error", "message" => "Failed to create upload directory. Check server permissions."));
            exit();
        }
    }

    // --- 1. Process Form Data ---
    $station = $_POST['station'] ?? 'N/A';
    $username = $_POST['username'] ?? 'N/A';
    $report_date = $_POST['date'] ?? date("Y-m-d");
    $shift = $_POST['shift'] ?? 'Day Shift';
    $total_units_processed = intval($_POST['total_units_processed'] ?? 0);
    $total_ng = intval($_POST['total_ng'] ?? 0);
    $downtime_minutes = intval($_POST['downtime_minutes'] ?? 0);
    $summary = $_POST['summary'] ?? '';
    $file_path_db = NULL; 

    // --- 2. Handle File Upload ---
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['file'];
        
        // File size validation (Server side check)
        if ($file['size'] > $max_file_size) {
            $response["message"] = "File size exceeds the 2MB limit.";
            http_response_code(400); 
            echo json_encode($response);
            exit();
        }

        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed_ext = array("jpg", "jpeg", "png", "pdf");
        
        if (!in_array($file_ext, $allowed_ext)) {
            $response["message"] = "Only JPG, PNG, and PDF files are allowed.";
            http_response_code(400); 
            echo json_encode($response);
            exit();
        }

        // Create a unique file name
        $new_file_name = $station . "_" . $report_date . "_" . time() . "." . $file_ext;
        $target_file = $upload_dir . $new_file_name;

        if (move_uploaded_file($file['tmp_name'], $target_file)) {
            $file_path_db = $new_file_name; 
        } else {
            $response["message"] = "Failed to move uploaded file. Check folder permissions (must be 0777).";
            http_response_code(500); 
            echo json_encode($response);
            exit();
        }
    }

    // --- 3. Insert Data into Database ---

    $sql = "INSERT INTO daily_reports (station, report_date, shift, total_units_processed, total_ng, downtime_minutes, summary, attachment_filename, submitted_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    try {
        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            $station, 
            $report_date, 
            $shift, 
            $total_units_processed, 
            $total_ng, 
            $downtime_minutes, 
            $summary, 
            $file_path_db,
            $username
        ]);

        $response["status"] = "success";
        $response["message"] = "Report submitted successfully.";
        $response["filename"] = $file_path_db;
        http_response_code(201);
        
    } catch (\PDOException $e) {
        $response["message"] = "Database execution failed (PDO Error): " . $e->getMessage();
        http_response_code(500);
    }
    
    echo json_encode($response);
    exit();
} 
// -----------------------------------------------------------
// C. FALLBACK FOR UNSPECIFIED METHOD
// -----------------------------------------------------------
else {
    http_response_code(405);
    echo json_encode(array("status" => "error", "message" => "Method not supported."));
    exit();
}
?>