<?php
// FILE: backend/api/announcements.php - IMPROVED FINAL PDO VERSION

// --- CORS ---
$allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

// Include database connection (defines $pdo)
include '../db.php';

// Check if PDO is initialized
if (!isset($pdo)) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed: \$pdo variable not found."]);
    exit();
}

/**
 * Checks if a given user ID belongs to an administrator.
 * @param PDO $pdo The PDO database connection object.
 * @param int $userId The ID of the user to check.
 * @return bool True if the user is an 'administrator', false otherwise.
 */
function isAdmin(PDO $pdo, int $userId): bool {
    try {
        $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user_row = $stmt->fetch();

        return $user_row && strtolower($user_row['role']) === 'administrator';
    } catch (PDOException $e) {
        // Log the error but return false to prevent unauthorized action
        error_log("Database error during admin check: " . $e->getMessage());
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ============================================================
    //  GET ANNOUNCEMENTS
    // ============================================================
    case 'GET':
        try {
            $sql = "
                SELECT 
                    a.id, 
                    a.content, 
                    a.created_at, 
                    u.full_name AS poster_name, 
                    u.avatar_url AS poster_avatar,
                    u.role AS poster_role
                FROM announcements a
                JOIN users u ON a.user_id = u.id
                ORDER BY a.created_at DESC
                LIMIT 50;
            ";
            
            $stmt = $pdo->query($sql);
            $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($announcements);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error while fetching announcements.", "error" => $e->getMessage()]);
        }
        break;


    // ============================================================
    //  POST ANNOUNCEMENT (ADMIN ONLY)
    // ============================================================
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(["message" => "Missing required fields for POST: user_id and content."]);
            exit;
        }

        $userId = $data['user_id'];
        $content = $data['content'];

        // Check if user is admin using the new function
        if (!isAdmin($pdo, $userId)) {
            http_response_code(403);
            echo json_encode(["message" => "Only Administrators can post announcements."]);
            exit;
        }

        try {
            // Insert announcement using a prepared statement
            $stmt_insert = $pdo->prepare("INSERT INTO announcements (user_id, content) VALUES (?, ?)");

            if ($stmt_insert->execute([$userId, $content])) {
                echo json_encode([
                    "message" => "Announcement posted successfully.",
                    "id" => $pdo->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Error posting announcement: Database execution failed."]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error during post.", "error" => $e->getMessage()]);
        }
        break;


    // ============================================================
    //  DELETE ANNOUNCEMENT (ADMIN ONLY)
    // ============================================================
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id']) || !isset($data['user_id'])) {
            http_response_code(400);
            // Updated error message for clarity
            echo json_encode(["message" => "Missing required fields for DELETE: id (announcement ID) and user_id (deleter's ID)."]); 
            exit;
        }

        $announcementId = $data['id'];
        $userId = $data['user_id'];

        // Check if user is admin using the new function
        if (!isAdmin($pdo, $userId)) {
            http_response_code(403);
            echo json_encode(["message" => "Only Administrators can delete announcements."]);
            exit;
        }

        try {
            // Delete announcement using a prepared statement
            $stmt_delete = $pdo->prepare("DELETE FROM announcements WHERE id = ?");

            if ($stmt_delete->execute([$announcementId])) {
                // Check if any row was actually deleted
                if ($stmt_delete->rowCount() > 0) {
                    echo json_encode(["message" => "Announcement ID $announcementId deleted successfully."]);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "Failed to delete announcement: Announcement ID $announcementId not found."]);
                }
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Error deleting announcement: Database execution failed."]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error during delete.", "error" => $e->getMessage()]);
        }
        break;


    // ============================================================
    //  METHOD NOT ALLOWED
    // ============================================================
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>