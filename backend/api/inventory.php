<?php
// backend/api/inventory.php

// 1. Setup CORS Headers
$allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Idinagdag ang POST at OPTIONS
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle Preflight Request (Para sa CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Include database connection
include '../db.php'; 

if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "PDO connection missing."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // --- FETCH LOGIC ---
    try {
        // Fix duplicates by getting unique records per unit_id
        $sql = "SELECT DISTINCT 
                    ud.id,
                    ud.unit_id,
                    ud.assembly_no,
                    ud.mnbd_board_no,
                    ud.cmbd_board_no,
                    ud.lrbd_board_no,
                    ud.pqbd_board_no,
                    ud.bkbd_board_no,
                    ud.created_at,
                    u.status as unit_status
                FROM unit_pcba_details ud
                LEFT JOIN units u ON ud.unit_id = u.id
                ORDER BY ud.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $inventory = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($inventory);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }

} elseif ($method === 'POST') {
    // --- UPDATE LOGIC ---
    // Kunin ang JSON data mula sa React
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['id']) || !isset($input['column']) || !isset($input['newValue'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required fields (id, column, or newValue)"]);
        exit();
    }

    $id = $input['id'];
    $column = $input['column'];
    $newValue = $input['newValue'];

    // Security: I-validate kung ang column name ay authorized para iwas SQL Injection
    $allowedColumns = ['mnbd_board_no', 'cmbd_board_no', 'lrbd_board_no', 'pqbd_board_no', 'bkbd_board_no'];
    
    if (!in_array($column, $allowedColumns)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid column name"]);
        exit();
    }

    try {
        // I-update ang database gamit ang prepared statement
        $sql = "UPDATE unit_pcba_details SET $column = :newValue WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':newValue', $newValue);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Record updated successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update record"]);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
}
?>