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
    // Check if this is a search request for board serial
    if (isset($_GET['search']) && isset($_GET['code'])) {
        try {
            $searchCode = $_GET['code'];
            
            // Search for the 6-digit code in any board column
            $sql = "SELECT DISTINCT 
                        ud.id,
                        ud.unit_id,
                        ud.assembly_no,
                        ud.mnbd_board_no,
                        ud.cmbd_board_no,
                        ud.lrbd_board_no,
                        ud.pqbd_board_no,
                        ud.bkbd_board_no,
                        u.status as unit_status
                    FROM unit_pcba_details ud
                    LEFT JOIN units u ON ud.unit_id = u.id
                    WHERE ud.mnbd_board_no = :searchCode 
                       OR ud.cmbd_board_no = :searchCode
                       OR ud.lrbd_board_no = :searchCode
                       OR ud.pqbd_board_no = :searchCode
                       OR ud.bkbd_board_no = :searchCode
                    ORDER BY ud.created_at DESC
                    LIMIT 1";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':searchCode', $searchCode);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                echo json_encode([
                    "status" => "success", 
                    "data" => $result
                ]);
            } else {
                echo json_encode([
                    "status" => "not_found", 
                    "message" => "No board found with this 6-digit code"
                ]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
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
    }

} elseif ($method === 'POST') {
    // --- UPDATE LOGIC ---
    // Kunin ang JSON data mula sa React
    $input = json_decode(file_get_contents("php://input"), true);

    // Check if this is a board number generation request
    if (isset($input['action']) && $input['action'] === 'generate_board_number') {
        $boardType = $input['boardType'] ?? '';
        
        try {
            // Get the column name based on board type
            $columnMap = [
                'MNBD' => 'mnbd_board_no',
                'CMBD' => 'cmbd_board_no', 
                'LRBD' => 'lrbd_board_no',
                'PQBD' => 'pqbd_board_no',
                'BKBD' => 'bkbd_board_no'
            ];
            
            $column = $columnMap[$boardType] ?? '';
            if (!$column) {
                echo json_encode(["status" => "error", "message" => "Invalid board type"]);
                exit();
            }
            
            // Generate unique 6-digit number
            do {
                $generatedNumber = str_pad(mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);
                
                // Check if number already exists
                $checkSql = "SELECT COUNT(*) as count FROM unit_pcba_details WHERE $column = :number";
                $checkStmt = $pdo->prepare($checkSql);
                $checkStmt->bindParam(':number', $generatedNumber);
                $checkStmt->execute();
                $exists = $checkStmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
                
            } while ($exists);
            
            echo json_encode([
                "status" => "success", 
                "generatedNumber" => $generatedNumber
            ]);
            
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit();
    }
    
    // Check if this is a request to get station user
    if (isset($input['action']) && $input['action'] === 'get_station_user') {
        if (!isset($input['station'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing station parameter"]);
            exit();
        }
        
        $station = $input['station'];
        
        try {
            // Query to get the user assigned to this station
            // This assumes you have a users table with station assignments
            // You may need to adjust this based on your actual database structure
            $sql = "SELECT username FROM users WHERE station = :station LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':station', $station);
            $stmt->execute();
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                echo json_encode([
                    "status" => "success", 
                    "username" => $user['username']
                ]);
            } else {
                // Fallback: if no user found, return station-based name
                echo json_encode([
                    "status" => "success", 
                    "username" => "Station {$station}"
                ]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit();
    }
    
    // Check if this is a request to get pending board edit requests
    if (isset($input['action']) && $input['action'] === 'get_pending_requests') {
        try {
            // Check if unitId is provided to filter requests for a specific unit
            $unitIdFilter = isset($input['unitId']) ? $input['unitId'] : null;
            
            $sql = "SELECT ber.*, u.model, u.revision, u.base_unit_kitting_no, u.device_serial_no, u.accessory_kitting_no, u.status as unit_status
                    FROM board_edit_requests ber
                    LEFT JOIN units u ON ber.unit_id = u.id
                    WHERE ber.status = 'pending'";
            
            // Add unit ID filter if provided
            if ($unitIdFilter) {
                $sql .= " AND ber.unit_id = :unitId";
            }
            
            $sql .= " ORDER BY ber.requested_at DESC";
            
            $stmt = $pdo->prepare($sql);
            
            // Bind unitId parameter if filtering
            if ($unitIdFilter) {
                $stmt->bindParam(':unitId', $unitIdFilter);
            }
            
            $stmt->execute();
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "status" => "success", 
                "requests" => $requests
            ]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit();
    }
    
    // Check if this is a request to approve a board edit request
    if (isset($input['action']) && $input['action'] === 'approve_request') {
        if (!isset($input['requestId']) || !isset($input['unitId']) || !isset($input['column']) || !isset($input['newValue'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            exit();
        }
        
        $requestId = $input['requestId'];
        $unitId = $input['unitId'];
        $column = $input['column'];
        $newValue = $input['newValue'];
        
        // Security: Validate column name
        $allowedColumns = ['mnbd_board_no', 'cmbd_board_no', 'lrbd_board_no', 'pqbd_board_no', 'bkbd_board_no'];
        if (!in_array($column, $allowedColumns)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid column name"]);
            exit();
        }
        
        try {
            $pdo->beginTransaction();
            
            // Update the board number in unit_pcba_details
            $updateSql = "UPDATE unit_pcba_details SET $column = :newValue WHERE unit_id = :unitId";
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->bindParam(':newValue', $newValue);
            $updateStmt->bindParam(':unitId', $unitId);
            $updateStmt->execute();
            
            // Update the request status to approved
            $approveSql = "UPDATE board_edit_requests SET status = 'approved', approved_by = 'Admin', approved_at = CURRENT_TIMESTAMP WHERE id = :requestId";
            $approveStmt = $pdo->prepare($approveSql);
            $approveStmt->bindParam(':requestId', $requestId);
            $approveStmt->execute();
            
            $pdo->commit();
            
            echo json_encode([
                "status" => "success", 
                "message" => "Board edit request approved successfully"
            ]);
        } catch (\PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit();
    }
    
    // Check if this is a request to reject a board edit request
    if (isset($input['action']) && $input['action'] === 'reject_request') {
        if (!isset($input['requestId'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing request ID"]);
            exit();
        }
        
        $requestId = $input['requestId'];
        
        try {
            $sql = "UPDATE board_edit_requests SET status = 'rejected', approved_by = 'Admin', approved_at = CURRENT_TIMESTAMP WHERE id = :requestId";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':requestId', $requestId);
            $stmt->execute();
            
            echo json_encode([
                "status" => "success", 
                "message" => "Board edit request rejected successfully"
            ]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit();
    }
    
    // Check if this is a request to delete a unit
    if (isset($input['action']) && $input['action'] === 'delete_unit') {
        if (!isset($input['unitId'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing unit ID"]);
            exit();
        }
        
        $unitId = $input['unitId'];
        
        try {
            $pdo->beginTransaction();
            
            // First delete from unit_pcba_details
            $deletePcbaSql = "DELETE FROM unit_pcba_details WHERE unit_id = :unitId";
            $deletePcbaStmt = $pdo->prepare($deletePcbaSql);
            $deletePcbaStmt->bindParam(':unitId', $unitId);
            $deletePcbaStmt->execute();
            
            // Then delete from units table
            $deleteUnitSql = "DELETE FROM units WHERE id = :unitId";
            $deleteUnitStmt = $pdo->prepare($deleteUnitSql);
            $deleteUnitStmt->bindParam(':unitId', $unitId);
            $deleteUnitStmt->execute();
            
            $pdo->commit();
            
            echo json_encode([
                "status" => "success", 
                "message" => "Unit deleted successfully"
            ]);
        } catch (\PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit();
    }
    
    // Check if this is a request to delete all units with boards
    if (isset($input['action']) && $input['action'] === 'delete_all_with_boards') {
        try {
            $pdo->beginTransaction();
            
            // First, get all unit IDs that have boards
            $getUnitsSql = "SELECT DISTINCT unit_id FROM unit_pcba_details WHERE 
                           (mnbd_board_no IS NOT NULL AND mnbd_board_no != '' AND mnbd_board_no != '000000') OR
                           (cmbd_board_no IS NOT NULL AND cmbd_board_no != '' AND cmbd_board_no != '000000') OR
                           (lrbd_board_no IS NOT NULL AND lrbd_board_no != '' AND lrbd_board_no != '000000') OR
                           (pqbd_board_no IS NOT NULL AND pqbd_board_no != '' AND pqbd_board_no != '000000') OR
                           (bkbd_board_no IS NOT NULL AND bkbd_board_no != '' AND bkbd_board_no != '000000')";
            
            $getUnitsStmt = $pdo->prepare($getUnitsSql);
            $getUnitsStmt->execute();
            $unitIds = $getUnitsStmt->fetchAll(PDO::FETCH_COLUMN);
            
            $deletedCount = 0;
            
            if (!empty($unitIds)) {
                // Create placeholders for the IN clause
                $placeholders = str_repeat('?,', count($unitIds) - 1) . '?';
                
                // Delete from unit_pcba_details
                $deletePcbaSql = "DELETE FROM unit_pcba_details WHERE unit_id IN ($placeholders)";
                $deletePcbaStmt = $pdo->prepare($deletePcbaSql);
                $deletePcbaStmt->execute($unitIds);
                
                // Delete from units table
                $deleteUnitSql = "DELETE FROM units WHERE id IN ($placeholders)";
                $deleteUnitStmt = $pdo->prepare($deleteUnitSql);
                $deleteUnitStmt->execute($unitIds);
                
                $deletedCount = count($unitIds);
            }
            
            $pdo->commit();
            
            echo json_encode([
                "status" => "success", 
                "message" => "Units with boards deleted successfully",
                "deletedCount" => $deletedCount
            ]);
        } catch (\PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit();
    }
    
    // Check if this is a board edit request for pending approval
    if (isset($input['action']) && $input['action'] === 'edit_board') {
        // Handle pending approval workflow
        if (!isset($input['id']) || !isset($input['column']) || !isset($input['newValue'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required fields (id, column, or newValue)"]);
            exit();
        }

        $unitId = $input['id'];
        $column = $input['column'];
        $newValue = $input['newValue'];
        $remarks = $input['remarks'] ?? ''; // Get remarks from request, default to empty string

        // Security: I-validate kung ang column name ay authorized
        $allowedColumns = ['mnbd_board_no', 'cmbd_board_no', 'lrbd_board_no', 'pqbd_board_no', 'bkbd_board_no'];
        
        if (!in_array($column, $allowedColumns)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid column name"]);
            exit();
        }

        try {
            // Get current unit info
            $sql = "SELECT assembly_no, $column as current_value FROM unit_pcba_details WHERE unit_id = :unitId";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':unitId', $unitId);
            $stmt->execute();
            $unitInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$unitInfo) {
                echo json_encode(["status" => "error", "message" => "Unit not found"]);
                exit();
            }

            // Get board type from column name
            $boardType = strtoupper(str_replace('_board_no', '', $column));

            // Insert into pending approvals table
            $sql = "INSERT INTO board_edit_requests 
                    (unit_id, assembly_no, board_type, column_name, old_value, new_value, requested_by, status, remarks) 
                    VALUES 
                    (:unitId, :assemblyNo, :boardType, :columnName, :oldValue, :newValue, :requestedBy, 'pending', :remarks)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':unitId', $unitId);
            $stmt->bindParam(':assemblyNo', $unitInfo['assembly_no']);
            $stmt->bindParam(':boardType', $boardType);
            $stmt->bindParam(':columnName', $column);
            $stmt->bindParam(':oldValue', $unitInfo['current_value']);
            $stmt->bindParam(':newValue', $newValue);
            $requestedBy = $input['requestedBy'] ?? 'Operator'; // Get from frontend request, default to 'Operator'
            $stmt->bindParam(':requestedBy', $requestedBy);
            $stmt->bindParam(':remarks', $remarks);

            if ($stmt->execute()) {
                echo json_encode([
                    "status" => "success", 
                    "message" => "Board edit request submitted for approval"
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to submit edit request"]);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
        // Original direct update logic (for admin approval)
        if (!isset($input['id']) || !isset($input['column']) || !isset($input['newValue'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required fields (id, column, or newValue)"]);
            exit();
        }

        $id = $input['id'];
        $column = $input['column'];
        $newValue = $input['newValue'];

        // Security: I-validate kung ang column name ay authorized
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
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
}
?>