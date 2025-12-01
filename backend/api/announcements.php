<?php
// FILE: backend/api/announcements.php

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

// Include database connection
include '../db.php'; // Assuming your DB connection file is here

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // --- Fetch all announcements with user details ---
        $sql = "
            SELECT 
                a.id, 
                a.content, 
                a.created_at, 
                u.full_name AS poster_name, 
                u.avatar_url AS poster_avatar,
                u.role AS poster_role
            FROM 
                announcements a
            JOIN 
                users u ON a.user_id = u.id
            ORDER BY 
                a.created_at DESC
            LIMIT 50;
        ";
        
        // Using @ to suppress MySQLi warnings if the connection fails (for debugging flow)
        $result = @$conn->query($sql);
        $announcements = [];

        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $announcements[] = $row;
            }
        }
        
        echo json_encode($announcements);
        break;

    case 'POST':
        // --- Add a new announcement (Requires Admin) ---
        $data = json_decode(file_get_contents("php://input"), true);
        
        // **** CRITICAL DEBUGGING ECHO ****
        // This will show you exactly what data the PHP script received.
        // Dapat may laman ang 'user_id' at 'content'.
        // if (isset($data['user_id'])) {
        //    echo json_encode(["debug_received" => $data, "user_id_check" => $data['user_id']]);
        //    exit;
        // }
        // REMEMBER TO REMOVE THE COMMENTS (//) ABOVE TO ACTIVATE THE DEBUG ECHO

        if (!isset($data['user_id']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(["message" => "Missing required fields: user_id and content."]);
            exit;
        }

        $userId = $conn->real_escape_string($data['user_id']);
        $content = $conn->real_escape_string($data['content']);

        // 1. Check if the user is an Administrator (Security Check)
        $check_sql = "SELECT role FROM users WHERE id = '$userId'";
        $user_res = @$conn->query($check_sql); // Using @ for suppressed error
        $user_row = $user_res ? $user_res->fetch_assoc() : null;

        if (!$user_row || $user_row['role'] !== 'Administrator') {
            http_response_code(403); // Forbidden
            echo json_encode(["message" => "Only Administrators can post announcements. User Role received: " . ($user_row['role'] ?? 'N/A')]);
            exit;
        }

        // 2. Insert the announcement
        $insert_sql = "INSERT INTO announcements (user_id, content) VALUES ('$userId', '$content')";

        if (@$conn->query($insert_sql) === TRUE) {
            // Success response (HTTP 200)
            echo json_encode(["message" => "Announcement posted successfully.", "id" => $conn->insert_id]);
        } else {
            // SQL error response (HTTP 500)
            http_response_code(500);
            echo json_encode(["message" => "Error posting announcement: " . $conn->error . " | SQL: " . $insert_sql]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}

$conn->close();
?>