<?php
// backend/api/target_times.php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    switch ($method) {
        case 'GET':
            handleGetTargetTimes($pdo);
            break;
        case 'POST':
            handleSaveTargetTimes($pdo, $input);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleGetTargetTimes($pdo) {
    try {
        // Check if target_times table exists, if not create it
        $stmt = $pdo->query("SHOW TABLES LIKE 'target_times'");
        if ($stmt->rowCount() === 0) {
            createTargetTimesTable($pdo);
            insertDefaultTargetTimes($pdo);
        }

        $stmt = $pdo->query("SELECT station_id, target_minutes FROM target_times ORDER BY station_id");
        $targetTimes = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $targetTimes[$row['station_id']] = (int)$row['target_minutes'];
        }

        // If no data found, return defaults
        if (empty($targetTimes)) {
            $targetTimes = getDefaultTargetTimes();
        }

        echo json_encode($targetTimes);
    } catch (PDOException $e) {
        throw new Exception("Failed to fetch target times: " . $e->getMessage());
    }
}

function handleSaveTargetTimes($pdo, $input) {
    try {
        if (!$input || !is_array($input)) {
            throw new Exception("Invalid input data");
        }

        $pdo->beginTransaction();

        // Clear existing target times
        $pdo->exec("DELETE FROM target_times");

        // Insert new target times
        $stmt = $pdo->prepare("INSERT INTO target_times (station_id, target_minutes) VALUES (?, ?)");
        
        foreach ($input as $stationId => $minutes) {
            $stmt->execute([$stationId, (int)$minutes]);
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Target times updated successfully']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        throw new Exception("Failed to save target times: " . $e->getMessage());
    }
}

function createTargetTimesTable($pdo) {
    $sql = "CREATE TABLE target_times (
        id INT AUTO_INCREMENT PRIMARY KEY,
        station_id VARCHAR(20) NOT NULL UNIQUE,
        target_minutes INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
}

function insertDefaultTargetTimes($pdo) {
    $defaults = getDefaultTargetTimes();
    $stmt = $pdo->prepare("INSERT INTO target_times (station_id, target_minutes) VALUES (?, ?)");
    
    foreach ($defaults as $stationId => $minutes) {
        $stmt->execute([$stationId, $minutes]);
    }
}

function getDefaultTargetTimes() {
    return [
        'Station1' => 6, 'Station 1' => 6,
        'Station2' => 8, 'Station 2' => 8,
        'Station3' => 3, 'Station 3' => 3,
        'Station4' => 12, 'Station 4' => 12,
        'Station5' => 15, 'Station 5' => 15,
        'Station6' => 15, 'Station 6' => 15,
        'Station7' => 3, 'Station 7' => 3,
        'Station8' => 15, 'Station 8' => 15,
        'Station9' => 480, 'Station 9' => 480,
        'Station10' => 8, 'Station 10' => 8,
        'Station11' => 22, 'Station 11' => 22,
        'Station12' => 5, 'Station 12' => 5,
        'Station13' => 10, 'Station 13' => 10,
        'Station14' => 8, 'Station 14' => 8,
        'Station15' => 5, 'Station 15' => 5
    ];
}
?>