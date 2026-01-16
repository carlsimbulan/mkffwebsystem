<?php
// backend/api/user_management.php

require_once '../cors.php'; // Handle CORS headers
require_once '../db.php';   // Database connection ($pdo)

// --- CONFIGURATION ---
// Define the directory where avatars will be saved
$AVATAR_UPLOAD_DIR = __DIR__ . '/uploads/avatars/'; 
// ---------------------

/**
 * Handles file upload, renaming, and returns the new filename.
 */
function handleFileUpload($file, $userId) {
    global $AVATAR_UPLOAD_DIR;

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("File upload failed with error code: " . $file['error']);
    }

    if (!is_dir($AVATAR_UPLOAD_DIR) || !is_writable($AVATAR_UPLOAD_DIR)) {
         throw new Exception("Upload directory is missing or not writable.");
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $unique_filename = "avatar_" . $userId . "_" . time() . "." . $extension;
    $target_path = $AVATAR_UPLOAD_DIR . $unique_filename;

    if (!move_uploaded_file($file['tmp_name'], $target_path)) {
        throw new Exception("Failed to move uploaded file to target directory.");
    }
    return $unique_filename;
}

/**
 * Deletes an old avatar file from the disk.
 */
function deleteOldAvatar($oldAvatarUrl) {
    global $AVATAR_UPLOAD_DIR;
    if ($oldAvatarUrl) {
        $filePath = $AVATAR_UPLOAD_DIR . $oldAvatarUrl;
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
}

/**
 * Handles profile updates from the Operator Modal (Verification logic).
 */
function handleProfileUpdate($pdo, $data, $file) {
    // 1. Check if required fields are present
    if (empty($data['username']) || empty($data['old_password'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Username and Old Password are required."]);
        return;
    }

    try {
        // 2. Fetch the current user data
        $stmt = $pdo->prepare("SELECT id, password, avatar_url FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "User not found."]);
            return;
        }

        // 3. Direct String Comparison (Because your DB stores plain text)
        // We compare the 'old_password' sent from React to the 'password' in the DB
        if ($data['old_password'] !== $user['password']) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Incorrect current password. Verification failed."]);
            return;
        }

        $userId = $user['id'];
        $final_avatar_url = $user['avatar_url'];
        $new_email = !empty($data['email']) ? $data['email'] : $data['username'];
        
        // Use new password if provided, otherwise keep the old one
        $new_password = !empty($data['password']) ? $data['password'] : $user['password'];

        // 4. Handle Avatar Upload
        if ($file) {
            deleteOldAvatar($user['avatar_url']);
            $final_avatar_url = handleFileUpload($file, $userId);
        }

        // 5. Update Record
        $updateStmt = $pdo->prepare("UPDATE users SET username = ?, password = ?, avatar_url = ? WHERE id = ?");
        $updateStmt->execute([$new_email, $new_password, $final_avatar_url, $userId]);

        echo json_encode([
            "status" => "success", 
            "message" => "Profile updated successfully!", 
            "avatar_url" => $final_avatar_url
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Update error: " . $e->getMessage()]);
    }
}

// --- STANDARD CRUD FUNCTIONS ---

function getUsers($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT id, username, password, role, full_name, station, avatar_url, created_at FROM users ORDER BY id ASC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}

function addUser($pdo, $data, $file = null) {
    if (empty($data['username']) || empty($data['password']) || empty($data['role']) || empty($data['full_name'])) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields."]);
        return;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role, full_name, station, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$data['username'], $data['password'], $data['role'], $data['full_name'], $data['station'] ?? null]);
        
        $newId = $pdo->lastInsertId();
        $final_avatar_url = null;

        if ($file && $newId) {
            $final_avatar_url = handleFileUpload($file, $newId);
            $updateStmt = $pdo->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
            $updateStmt->execute([$final_avatar_url, $newId]);
        }

        http_response_code(201);
        echo json_encode(["message" => "User added successfully.", "id" => $newId, "avatar_url" => $final_avatar_url]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error adding user: " . $e->getMessage()]);
    }
}

function updateUser($pdo, $data, $file = null) {
    if (empty($data['id']) || empty($data['username']) || empty($data['password']) || empty($data['role']) || empty($data['full_name'])) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields."]);
        return;
    }
    
    $userId = (int)$data['id'];
    $final_avatar_url = $data['avatar_url'] ?? null;

    try {
        $oldUserStmt = $pdo->prepare("SELECT avatar_url FROM users WHERE id = ?");
        $oldUserStmt->execute([$userId]);
        $oldAvatarUrl = $oldUserStmt->fetchColumn();

        if ($file) {
            deleteOldAvatar($oldAvatarUrl);
            $final_avatar_url = handleFileUpload($file, $userId);
        }
        
        $stmt = $pdo->prepare("UPDATE users SET username = ?, password = ?, role = ?, full_name = ?, station = ?, avatar_url = ? WHERE id = ?");
        $stmt->execute([$data['username'], $data['password'], $data['role'], $data['full_name'], $data['station'] ?? null, $final_avatar_url, $userId]);

        http_response_code(200);
        echo json_encode(["message" => "User updated successfully.", "avatar_url" => $final_avatar_url]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error updating user: " . $e->getMessage()]);
    }
}

function deleteUser($pdo, $data) {
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Missing user ID."]);
        return;
    }
    $userId = (int)$data['id'];
    if ($userId === 1) {
        http_response_code(403);
        echo json_encode(["message" => "Cannot delete primary admin."]);
        return;
    }
    try {
        $oldUserStmt = $pdo->prepare("SELECT avatar_url FROM users WHERE id = ?");
        $oldUserStmt->execute([$userId]);
        $oldAvatarUrl = $oldUserStmt->fetchColumn();
        
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        if ($stmt->rowCount() > 0) {
            deleteOldAvatar($oldAvatarUrl);
            echo json_encode(["message" => "User deleted successfully."]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "User not found."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}

// --- MAIN REQUEST HANDLER ---

$method = $_SERVER['REQUEST_METHOD'];
$file = null;
$data = [];

// Override method if POST?method=PUT is used
if ($method === 'POST' && isset($_GET['method'])) {
    $method = strtoupper($_GET['method']);
}

// Capture Multipart Data or JSON
if ($method === 'POST' || $method === 'PUT') {
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $data = $_POST;
        $file = $_FILES['avatar'];
    } else {
        $input = file_get_contents('php://input');
        $data = $input ? json_decode($input, true) : [];
        // Support regular POST fields if JSON is empty
        if (empty($data)) { $data = $_POST; }
    }
} else {
    $input = file_get_contents('php://input');
    $data = $input ? json_decode($input, true) : [];
}

// ROUTING
switch ($method) {
    case 'GET':
        getUsers($pdo);
        break;
    case 'POST':
        // Check if this is a Profile Update from the Operator Modal
        if (isset($data['action']) && $data['action'] === 'update_profile') {
            handleProfileUpdate($pdo, $data, $file);
        } else {
            addUser($pdo, $data, $file);
        }
        break;
    case 'PUT':
        updateUser($pdo, $data, $file);
        break;
    case 'DELETE':
        deleteUser($pdo, $data);
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not supported."]);
        break;
}
?>