<?php
// backend/api/user_management.php

require_once '../cors.php'; // Handle CORS headers
require_once '../db.php'; // Database connection

// --- CONFIGURATION ---
// Define the directory where avatars will be saved (relative to this PHP script)
$AVATAR_UPLOAD_DIR = __DIR__ . '/uploads/avatars/'; 
// ---------------------

/**
 * Handles file upload, renaming, and returns the new filename.
 * @param array $file The $_FILES['avatar'] array.
 * @param int $userId The ID of the user (used for unique naming).
 * @return string The unique filename saved to disk.
 * @throws Exception if upload or directory check fails.
 */
function handleFileUpload($file, $userId) {
    global $AVATAR_UPLOAD_DIR;

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("File upload failed with error code: " . $file['error']);
    }

    if (!is_dir($AVATAR_UPLOAD_DIR) || !is_writable($AVATAR_UPLOAD_DIR)) {
         throw new Exception("Upload directory is missing or not writable: " . $AVATAR_UPLOAD_DIR);
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    // Create a secure, unique filename using the user ID and timestamp
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
    $filePath = $AVATAR_UPLOAD_DIR . $oldAvatarUrl;
    if ($oldAvatarUrl && file_exists($filePath)) {
        unlink($filePath);
    }
}


// Function to fetch all users (Updated to select avatar_url)
function getUsers($pdo) {
    try {
        // NOTE: avatar_url is now included in the select statement
        $stmt = $pdo->prepare("SELECT id, username, password, role, full_name, station, avatar_url, created_at FROM users ORDER BY id ASC");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($users);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}

// Function to add a new user (Updated for avatar_url and file handling)
function addUser($pdo, $data, $file = null) {
    if (empty($data['username']) || empty($data['password']) || empty($data['role']) || empty($data['full_name'])) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields."]);
        return;
    }

    try {
        // 1. Insert user data without the final avatar URL (since we don't have the ID yet)
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role, full_name, station, created_at) 
                               VALUES (?, ?, ?, ?, ?, NOW())");
        
        $stmt->execute([
            $data['username'],
            $data['password'],
            $data['role'],
            $data['full_name'],
            $data['station'] ?? null 
        ]);
        
        $newId = $pdo->lastInsertId();
        $final_avatar_url = null;

        // 2. If a file was uploaded, process it and update the record
        if ($file && $newId) {
            $final_avatar_url = handleFileUpload($file, $newId);
            
            // Update the user record with the actual saved filename
            $updateStmt = $pdo->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
            $updateStmt->execute([$final_avatar_url, $newId]);
        }

        http_response_code(201); // Created
        echo json_encode(["message" => "User added successfully.", "id" => $newId, "avatar_url" => $final_avatar_url]);
    } catch (Exception $e) {
        http_response_code(500);
        if ($e instanceof PDOException && $e->getCode() === '23000') {
             http_response_code(409); // Conflict
             echo json_encode(["message" => "User with that username already exists."]);
        } else {
            echo json_encode(["message" => "Error adding user: " . $e->getMessage()]);
        }
    }
}

// Function to update an existing user (Updated for avatar_url and file handling)
function updateUser($pdo, $data, $file = null) {
    if (empty($data['id']) || empty($data['username']) || empty($data['password']) || empty($data['role']) || empty($data['full_name'])) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields."]);
        return;
    }
    
    $userId = (int)$data['id'];
    $final_avatar_url = $data['avatar_url'] ?? null; // Assumes existing or null avatar_url is passed via React

    try {
        // 1. Fetch current avatar URL to manage old file
        $oldUserStmt = $pdo->prepare("SELECT avatar_url FROM users WHERE id = ?");
        $oldUserStmt->execute([$userId]);
        $oldAvatarUrl = $oldUserStmt->fetchColumn();

        // 2. If a new file was uploaded, handle it, delete old one
        if ($file) {
            deleteOldAvatar($oldAvatarUrl); // Clean up old file
            $final_avatar_url = handleFileUpload($file, $userId); // Save new file
        }
        
        // 3. Update database record
        $stmt = $pdo->prepare("UPDATE users SET username = ?, password = ?, role = ?, full_name = ?, station = ?, avatar_url = ? WHERE id = ?");
        $stmt->execute([
            $data['username'],
            $data['password'],
            $data['role'],
            $data['full_name'],
            $data['station'] ?? null,
            $final_avatar_url, // Use the new, retained, or null filename
            $userId
        ]);

        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["message" => "User updated successfully.", "avatar_url" => $final_avatar_url]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "User not found or no changes made."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        if (isset($e) && $e->getCode() === '23000') {
             http_response_code(409); // Conflict
             echo json_encode(["message" => "User with that username already exists."]);
        } else {
            echo json_encode(["message" => "Error updating user: " . $e->getMessage()]);
        }
    }
}

// Function to delete a user (Updated to clean up avatar file)
function deleteUser($pdo, $data) {
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Missing user ID."]);
        return;
    }
    
    $userId = (int)$data['id'];

    // Safety check: Prevent deleting the primary admin (ID 1)
    if ($userId === 1) {
        http_response_code(403);
        echo json_encode(["message" => "Cannot delete the primary system administrator (ID 1)."]);
        return;
    }

    try {
        // 1. Retrieve avatar URL before deleting the record
        $oldUserStmt = $pdo->prepare("SELECT avatar_url FROM users WHERE id = ?");
        $oldUserStmt->execute([$userId]);
        $oldAvatarUrl = $oldUserStmt->fetchColumn();
        
        // 2. Delete the database record
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        if ($stmt->rowCount() > 0) {
            deleteOldAvatar($oldAvatarUrl); // 3. Clean up the file
            http_response_code(200);
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


// --- Main Request Handler ---
$method = $_SERVER['REQUEST_METHOD'];
$file = null;

// 1. Check for method override (e.g., POST?method=PUT)
if ($method === 'POST' && isset($_GET['method'])) {
    $method = strtoupper($_GET['method']);
}

// 2. Determine input source (JSON vs. Multipart)
if ($method === 'POST' || $method === 'PUT') {
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        // Case A: File is uploaded (using $_FILES and $_POST)
        $data = $_POST;
        $file = $_FILES['avatar'];
    } else {
        // Case B: No file uploaded, read JSON body (regular updates)
        $input = file_get_contents('php://input');
        $data = $input ? json_decode($input, true) : [];
    }
} else {
    // Case C: GET/DELETE requests (read JSON input if available, though typically empty)
    $input = file_get_contents('php://input');
    $data = $input ? json_decode($input, true) : [];
}


// 3. Route the request
switch ($method) {
    case 'GET':
        getUsers($pdo);
        break;
    case 'POST':
        addUser($pdo, $data, $file);
        break;
    case 'PUT':
        updateUser($pdo, $data, $file);
        break;
    case 'DELETE':
        deleteUser($pdo, $data);
        break;
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "Method not supported."]);
        break;
}
?>