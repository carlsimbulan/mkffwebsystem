<?php
// backend/api/user_management.php

require_once '../cors.php'; // Handle CORS headers
require_once '../db.php'; // Database connection

// Function to fetch all users
function getUsers($pdo) {
    try {
        // Exclude the password column for general listing, or keep it if the 'Admin' role specifically needs it as requested
        // Note: Storing passwords plainly is a bad practice. For this example, we proceed as requested.
        $stmt = $pdo->prepare("SELECT id, username, password, role, full_name, station, created_at FROM users ORDER BY id ASC");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($users);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}

// Function to add a new user
function addUser($pdo, $data) {
    // Basic validation
    if (empty($data['username']) || empty($data['password']) || empty($data['role']) || empty($data['full_name'])) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields."]);
        return;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role, full_name, station, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        // NOTE: In a real application, you must HASH the password here (e.g., using password_hash()).
        $stmt->execute([
            $data['username'],
            $data['password'], // Storing plaintext as per the request's context, but strongly discouraged.
            $data['role'],
            $data['full_name'],
            $data['station'] ?? null // Station can be null
        ]);
        http_response_code(201); // Created
        echo json_encode(["message" => "User added successfully."]);
    } catch (PDOException $e) {
        http_response_code(500);
        // Check for unique constraint violation (common for username)
        if ($e->getCode() === '23000') {
             http_response_code(409); // Conflict
             echo json_encode(["message" => "User with that username already exists."]);
        } else {
            echo json_encode(["message" => "Database error: " . $e->getMessage()]);
        }
    }
}

// Function to update an existing user
function updateUser($pdo, $data) {
    if (empty($data['id']) || empty($data['username']) || empty($data['password']) || empty($data['role']) || empty($data['full_name'])) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields."]);
        return;
    }

    try {
        // The UPDATE query to modify user details
        $stmt = $pdo->prepare("UPDATE users SET username = ?, password = ?, role = ?, full_name = ?, station = ? WHERE id = ?");
        $stmt->execute([
            $data['username'],
            $data['password'], // Storing plaintext as per the request's context, but strongly discouraged.
            $data['role'],
            $data['full_name'],
            $data['station'] ?? null,
            $data['id']
        ]);

        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["message" => "User updated successfully."]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "User not found or no changes made."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        if ($e->getCode() === '23000') {
             http_response_code(409); // Conflict
             echo json_encode(["message" => "User with that username already exists."]);
        } else {
            echo json_encode(["message" => "Database error: " . $e->getMessage()]);
        }
    }
}

// Function to delete a user
function deleteUser($pdo, $data) {
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Missing user ID."]);
        return;
    }
    
    // Safety check: Prevent deleting the primary admin (ID 1 as seen in the image)
    if ((int)$data['id'] === 1) {
        http_response_code(403);
        echo json_encode(["message" => "Cannot delete the primary system administrator (ID 1)."]);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$data['id']]);

        if ($stmt->rowCount() > 0) {
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
// Check for a 'method' override in case of POST requests (for PUT/DELETE)
if ($method === 'POST' && isset($_GET['method'])) {
    $method = strtoupper($_GET['method']);
}

$input = file_get_contents('php://input');
$data = $input ? json_decode($input, true) : [];

switch ($method) {
    case 'GET':
        getUsers($pdo);
        break;
    case 'POST':
        addUser($pdo, $data);
        break;
    case 'PUT':
        updateUser($pdo, $data);
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